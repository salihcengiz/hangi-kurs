# HangiKurs — Teknik Durum

> **Bu dosya ne işe yarar:** Kodun *şu anki* hâlini anlatır — ne var, nasıl kurulu, nereye dikkat etmek gerekiyor.
> **Her değişiklikten sonra güncellenir.** Bir şey ekleyip burayı güncellemezsen, diğerlerinin haberi olmaz.
> Ürünün ne olduğu için [PRD.md](PRD.md), sıradaki işler için [ROADMAP.md](ROADMAP.md).

**Son güncelleme:** 31.07.2026 — Faz 1a tamamlandı, güvenlik açıkları kapatıldı

---

## Mevcut durum: Faz 1a bitti

Backend uçtan uca çalışıyor: veritabanı kurulu, 20 kurumla dolu, API yanıt veriyor.
**Frontend'e henüz dokunulmadı** — hâlâ Vite'ın varsayılan sayaç şablonu.

## Teknoloji

| Katman | Seçim | Sürüm |
|---|---|---|
| Monorepo | npm workspaces + `concurrently` | — |
| Backend | Express | 5.2.x |
| ORM | Prisma + `@prisma/adapter-pg` | 7.9.x |
| Veritabanı | PostgreSQL (lokal, Docker yok) | 18 |
| Doğrulama | Zod | 4.4.x |
| Auth | firebase-admin (opsiyonel) | 14.2.x |
| Frontend | React + Vite | 19.2 / 8.2 |
| Dil | TypeScript strict | 6.0.x |

Tailwind, shadcn/ui ve React Router **henüz kurulmadı** — Faz 1b'de gelecek.

## Klasör yapısı

```
hangi-kurs/
├── package.json              workspaces, overrides, tek komutla dev
├── shared/types.ts           backend ↔ frontend API sözleşmesi
├── backend/
│   ├── prisma.config.ts      Prisma 7 yapılandırması (bağlantı dizesi BURADA)
│   ├── prisma/
│   │   ├── schema.prisma     6 model, 5 enum
│   │   ├── migrations/       20260731113931_init
│   │   ├── seed-data.ts      20 kurgusal kurum (veri)
│   │   └── seed.ts           yükleme mantığı (deterministik)
│   └── src/
│       ├── index.ts          giriş noktası, graceful shutdown
│       ├── app.ts            Express kurulumu
│       ├── routes/           HTTP yüzeyi
│       ├── controllers/      req/res ↔ servis çevirisi
│       ├── services/         iş mantığı
│       ├── repositories/     Prisma'ya dokunan TEK yer
│       ├── mappers/          Prisma satırı → DTO
│       ├── middleware/       auth, error-handler
│       ├── lib/              env, prisma, firebase-admin, errors
│       ├── types/            Express Request genişletmesi
│       └── generated/prisma/ Prisma client (gitignore'da, üretilir)
└── frontend/                 HENÜZ VİTE ŞABLONU
```

## API endpoint envanteri

| Metot | Yol | Auth | Döner |
|---|---|---|---|
| GET | `/api/health` | — | Durum, DB bağlantısı, `authConfigured` |
| GET | `/api/institutions` | — | `InstitutionSummaryDto[]`, isme göre sıralı |
| GET | `/api/institutions/:slug` | — | `InstitutionDetailDto` |
| GET | `/api/me` | **zorunlu** | `CurrentUserDto` |

Filtreleme, sıralama, sayfalama **henüz yok** — Faz 2.

Hata gövdesi her zaman aynı şekilde: `{ error: { code, message, details? } }`. `message` Türkçedir ve doğrudan kullanıcıya gösterilebilir.

## Veritabanı içeriği (seed sonrası)

| | |
|---|---|
| Kurum | 20 |
| Şube | 25 |
| Program | 44 |
| Fiyat kaydı | 88 (2 akademik yıl) |
| Başarı kaydı | 16 |
| Yorum | 206 onaylı + 32 bekleyen |

Seed **deterministiktir** — sabit tohumlu PRNG kullanır, herkeste birebir aynı veri oluşur. Ekran görüntüleri ve hata raporları bu sayede örtüşür.

---

## Mimari karar günlüğü

### 31.07.2026 — Katmanlı backend, katı ayrım
`route → controller → service → repository → Prisma`.
Controller Prisma'ya dokunamaz, repository `req`/`res` görmez. Prisma'yı import eden tek dosya [institution.repository.ts](backend/src/repositories/institution.repository.ts) — bunu bozan bir PR reddedilmeli.

### 31.07.2026 — `shared/types.ts` tek API sözleşmesi
Ekip bağımsız çalışacağı için elle senkronlanan tipler kaçınılmaz olarak sürükleniyordu. DTO'lar, enum union'ları ve Türkçe etiket haritaları tek dosyada.

**Kural:** Backend bu dosyadan **yalnızca tip** import eder (`import type`). Bu import'lar derlemede tamamen silinir, yani derlenmiş backend'in `shared/` klasörüne çalışma anı bağımlılığı yoktur. Backend'de `INSTITUTION_TYPE_LABELS` gibi bir **değer** import edersen bu kırılır. Frontend'de ikisi de serbest — Vite TS'i zaten derliyor.

### 31.07.2026 — Prisma 7'nin v6'dan üç farkı
1. `datasource` bloğunda `url` **kabul edilmiyor**. Bağlantı dizesi CLI için `prisma.config.ts`'te, client için `src/lib/prisma.ts`'teki driver adapter'da.
2. `new PrismaClient()` adapter'sız **hata veriyor**. `PrismaPg` zorunlu.
3. Client `node_modules`'a değil `src/generated/prisma`'ya üretiliyor. Gitignore'da; `npm install` sonrası `npm run db:generate` gerekebilir.

### 31.07.2026 — `rootDir` kök dizin, çıktı `dist/backend/src/`
`shared/` backend workspace'inin dışında olduğu için TypeScript `rootDir: ".."` istiyor. Sonucu: derlenmiş giriş noktası `dist/backend/src/index.js` — `start` script'i buna göre ayarlı. Tuhaf görünüyor ama kasıtlı.

### 31.07.2026 — Fiyatlar `Int`, tam Türk Lirası
`Decimal` yerine `Int`. Kurs ücretleri tam lira olarak ilan ediliyor, kuruş hassasiyeti gereksiz. Karşılığında JSON serileştirmede ondalık sürprizi yok, SQL ve JS tarafında sıralama/karşılaştırma birebir aynı davranıyor.

### 31.07.2026 — Puan okuma anında hesaplanıyor
`Institution` üzerinde denormalize edilmiş ortalama alanı **yok**. Onaylı yorumlar üzerinde tek `groupBy` sorgusu. "Önbellekteki ortalama bayat" sınıfındaki hataları tamamen ortadan kaldırıyor. Liste ve detay aynı fonksiyonu çağırır — ayrışamazlar. Profilde sorun çıkarsa yeniden değerlendirilir.

### 31.07.2026 — Firebase opsiyonel çalışır
`.env`'de Firebase anahtarları yoksa uygulama normal çalışır; `/api/health` `authConfigured: false` döner, frontend giriş butonunu devre dışı gösterir. Firebase konsoluna erişimi olmayan bir ekip üyesi hiçbir şekilde bloke olmaz.

### 31.07.2026 — `User` tablosu yok
Kimlik Firebase'de duruyor. v1'de favori veya yorum yazma olmadığı için veritabanına kullanıcı yazmaya gerek yok. `Review.authorAlias` zaten hesaba bağlı değil. v2'de favori gelirse `User` modeli o zaman eklenir.

### 31.07.2026 — npm overrides ile 11 güvenlik açığı kapatıldı
Hepsi `firebase-admin`'in transitive bağımlılıklarındaydı. `npm audit fix` etkisizdi, `npm audit fix --force` firebase-admin'i 14'ten 10'a düşürecekti. Kök `package.json`'da üç override var; gerekçeleri oradaki `//overrides` bloğunda yazılı. **`minimatch` override'ı bir CVE için değil** — `brace-expansion@5` default export'unu kaldırdığı için `minimatch@9` ile birlikte kullanılamıyor. Silinirse glob brace desenleri kırılır.

---

## Bilinen tuzaklar

**`.env`'de `DATABASE_URL` formatı.** `postgresql://KULLANICI:SIFRE@host:port/db`. Şablondaki `postgres:SIFRE` ifadesinde `postgres` **kullanıcı adıdır**, sadece `SIFRE` değiştirilir. Tamamının üzerine yazılırsa `P1000 Authentication failed` alınır.

**`npm install` sonrası Prisma client.** `src/generated/` gitignore'da olduğu için taze klonda yoktur. Backend derlenmiyorsa önce `npm run db:generate`.

**Override'lar temiz kurulum ister.** npm mevcut ağacı geçerli sayarsa `overrides` değişikliğini uygulamaz. `package.json`'daki override'lara dokunursan `node_modules` ve `package-lock.json` silinip yeniden kurulmalı.

**`npm ls` "invalid" uyarısı normaldir.** Override'lanan paketler ebeveynlerinin semver aralığını ihlal eder. Zincir uçtan uca test edildi, çalışıyor.

**Migration'lar 2026 tarihli.** Sistem saati böyle. Sıralama tutarlı olduğu için sorun değil.

---

## Kim ne üzerinde çalışıyor

| Kişi | Faz / alan | Durum |
|---|---|---|
| _(boş)_ | — | — |

> Bir işe başlarken buraya satır ekle, bitirince kaldır. Aynı dosyalarda çakışmamak için.
