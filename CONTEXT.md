# HangiKurs — Teknik Durum

> **Bu dosya ne işe yarar:** Kodun *şu anki* hâlini anlatır — ne var, nasıl kurulu, nereye dikkat etmek gerekiyor.
> **Her değişiklikten sonra güncellenir.** Bir şey ekleyip burayı güncellemezsen, diğerlerinin haberi olmaz.
> Ürünün ne olduğu için [PRD.md](PRD.md), sıradaki işler için [ROADMAP.md](ROADMAP.md).

**Son güncelleme:** 01.08.2026 — `npm run dev`'in backend'i sessizce başlatmama sorunu çözüldü (`tsx watch` → `node --watch --import tsx`)

---

## Mevcut durum: Faz 1b bitti

Backend ve frontend uçtan uca çalışıyor: veritabanı kurulu, 20 kurumla dolu, API yanıt veriyor,
frontend `/kurumlar` ve `/kurum/:slug` sayfalarında bu veriyi gösteriyor.
Firebase **client** tarafı (giriş arayüzü) henüz yok — Faz 1c.

**Firebase kimlik doğrulaması yapılandırıldı ve doğrulandı** (31.07.2026). Proje: `hangi-kurs`. Backend `authConfigured: true` dönüyor; gerçek bir ID token ile `/api/me` 200, geçersiz/eksik token ile 401. Test yöntemi: service account ile lokal olarak custom token imzalanıp web API key üzerinden ID token'a takas edildi — böylece hem private key hem web config, hem de doğrulama middleware'i aynı anda sınandı.

## Teknoloji

| Katman | Seçim | Sürüm |
|---|---|---|
| Monorepo | npm workspaces + `concurrently` | — |
| Backend | Express | 5.2.x |
| ORM | Prisma + `@prisma/adapter-pg` | 7.9.x |
| Veritabanı | PostgreSQL (lokal, Docker yok) | 17 |
| Doğrulama | Zod | 4.4.x |
| Auth | firebase-admin (opsiyonel) | 14.2.x |
| Frontend | React + Vite | 19.2 / 8.2 |
| CSS | Tailwind v4 (`@tailwindcss/vite`) + shadcn/ui (`radix-nova` preset) | 4.3.x |
| Routing | React Router | 8.3.x |
| Dil | TypeScript strict | 6.0.x |

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
└── frontend/
    ├── components.json        shadcn/ui yapılandırması (alias'lar, preset: radix-nova)
    ├── .env.example           Firebase web app config şablonu
    └── src/
        ├── main.tsx           BrowserRouter kökü
        ├── App.tsx            <Routes> tanımı
        ├── index.css          Tailwind importu + monokrom tema token'ları
        ├── layouts/
        │   └── RootLayout.tsx header, footer, örnek-veri banner'ı
        ├── pages/             HomePage, InstitutionsListPage, InstitutionDetailPage, NotFoundPage
        ├── components/        InstitutionCard, SourceLabel
        ├── components/ui/     shadcn bileşenleri (button, card, badge, table, skeleton, separator)
        ├── hooks/
        │   └── useAsyncData.ts  fetch + loading/error/data state (tek hook, iki sayfada kullanılıyor)
        └── lib/
            ├── api.ts         fetch katmanı, ApiError, /api/institutions[/:slug]
            ├── format.ts      Intl ile ₺ ve dd.MM.yyyy
            └── utils.ts       shadcn'in `cn()` yardımcısı
```

## Ortam değişkenleri

İki ayrı `.env` var ve **iki ayrı Firebase kimlik bilgisi seti** kullanıyorlar. Karıştırılmaları en sık yapılan hata:

| Dosya | İçerik | Gizli mi |
|---|---|---|
| `backend/.env` | `DATABASE_URL` + Firebase **service account** (token *doğrular*) | **Evet** — projeye admin erişimi |
| `frontend/.env` | Firebase **web app config** (kullanıcıyı *giriş yaptırır*) | Hayır — Vite bundle'a gömer |

Frontend değerlerinin herkese açık olması tasarım gereğidir; güvenlik yetkili alan adları ve kurallarla sağlanır.

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

### 01.08.2026 — Backend dev script: `tsx watch` yerine `node --watch --import tsx`
`backend/package.json`'daki `dev` script'i değişti. Sebep: `tsx watch`, `concurrently`'nin prefix'leme için kullandığı piped stdio altında dosya değişikliklerinde yeniden başlarken hiç log basmıyor ve portu açmıyordu — kök `npm run dev` backend'i sessizce hiç başlatmamış gibi görünüyordu (bkz. "Bilinen tuzaklar"). `node --watch --import tsx src/index.ts` aynı restart-on-change davranışını veriyor ama `concurrently`'nin piped modunda sorunsuz çalışıyor. Node ≥20.19 gerektiriyor (zaten `engines` alanında sabit), `--import` ESM register hook'u bu sürümde stabil.

### 31.07.2026 — Tailwind tema token'ları ASSUMPTIONS.md'deki hex değerlere sabitlendi
shadcn `init` varsayılan olarak oklch tabanlı nötr bir gri skala üretiyor (görsel olarak monokrom ama tam olarak `#FFFFFF`/`#111111` değil). `src/index.css` içindeki `:root` bloğunda `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--primary-foreground` elle üretici değerlere sabitlendi; `--secondary`/`--muted`/`--accent`/`--border` gibi shadcn'in iç hover/vurgu tonları oklch nötr skalada bırakıldı. Karşılaştırma tablosu accent'i (`#0F766E`, ASSUMPTIONS.md) burada **eklenmedi** — sadece Faz 4'te gerektiğinde eklenecek, şu an kullanılmıyor. Sidebar/chart token'ları ve `.dark` bloğu da silindi: v1'de ne sidebar ne dark mode var (PRD §3).

### 31.07.2026 — Sayfa başına tek `useAsyncData` hook'u, react-query yok
İki sayfa (`/kurumlar`, `/kurum/:slug`) da aynı loading/error/data desenini istiyor. Yeni bir bağımlılık eklemek yerine `hooks/useAsyncData.ts` içinde ~25 satırlık genel bir hook yazıldı. Sayfalama/önbellekleme ihtiyacı çıkarsa (Faz 2) o zaman react-query değerlendirilir.

---

## Bilinen tuzaklar

**`.env`'de `DATABASE_URL` formatı.** `postgresql://KULLANICI:SIFRE@host:port/db`. Şablondaki `postgres:SIFRE` ifadesinde `postgres` **kullanıcı adıdır**, sadece `SIFRE` değiştirilir. Tamamının üzerine yazılırsa `P1000 Authentication failed` alınır.

**`npm install` sonrası Prisma client.** `src/generated/` gitignore'da olduğu için taze klonda yoktur. Backend derlenmiyorsa önce `npm run db:generate`.

**Override'lar temiz kurulum ister.** npm mevcut ağacı geçerli sayarsa `overrides` değişikliğini uygulamaz. `package.json`'daki override'lara dokunursan `node_modules` ve `package-lock.json` silinip yeniden kurulmalı.

**`npm ls` "invalid" uyarısı normaldir.** Override'lanan paketler ebeveynlerinin semver aralığını ihlal eder. Zincir uçtan uca test edildi, çalışıyor.

**Migration'lar 2026 tarihli.** Sistem saati böyle. Sıralama tutarlı olduğu için sorun değil.

**PostgreSQL servisi "Manual" başlangıçta.** Windows'ta makine yeniden başlayınca kendiliğinden açılmıyor; `/api/health` `database: "down"` ve log'da `ECONNREFUSED` görürsen ilk bakılacak yer burasıdır. `Start-Service postgresql-x64-17` ile açılır, kalıcı çözüm için başlangıç tipi Automatic yapılabilir. **Not:** lokal kurulum artık PostgreSQL 17 (18 değil) — servis adı buna göre değişti.

**`FIREBASE_PRIVATE_KEY` çift tırnak istiyor.** dotenv `\n` dizilerini gerçek satır sonuna yalnızca çift tırnaklı değerlerde çeviriyor (dotenv 17.4.2 ile test edildi). Tırnaksız yapıştırılırsa PEM ayrıştırıcı anahtarı reddeder ve hata mesajı sebebi söylemez. `lib/firebase-admin.ts` içindeki `.replace(/\\n/g, '\n')` bu yüzden savunma amaçlı duruyor — dotenv işi zaten yapıyor, ama tek tırnak veya tırnaksız değerlerde kurtarıcı oluyor.

**`hangi-kurs` veritabanı yoksa/şifre uyuşmuyorsa.** Bu makinede Postgres bir noktada 17'ye yeniden kurulmuş; eski `hangi-kurs` veritabanı ve `postgres` kullanıcısının şifresi kaybolmuştu (`/api/health` → `password authentication failed`). `npm run db:migrate` veritabanını oluşturur ama **şifre uyuşmazlığını çözmez** — o durumda `pg_hba.conf`'ta ilgili `host`/`local` satırlarını geçici olarak `trust`'a çekip (`Restart-Service postgresql-x64-17` ile uygula), `psql -U postgres` ile bağlanıp `ALTER USER postgres WITH PASSWORD '...'` çalıştırıp, `pg_hba.conf`'u `scram-sha-256`'ya geri çevirip tekrar restart etmek gerekiyor. Sadece lokal geliştirme ortamında güvenli; production'a asla uygulanmaz.

**shadcn CLI'nin `add`/`init` komutu bu repoda alias'ı yanlış çözüyor.** `npx shadcn add ...` çalıştırıldığında dosyaları `frontend/src/...` yerine literal olarak `frontend/@/...` klasörüne yazıyor (muhtemelen Windows'ta npm workspace + `@` alias kombinasyonuyla ilgili bir CLI hatası). Yeni bir shadcn bileşeni eklerken komuttan sonra `frontend/@/` klasörünün oluşup oluşmadığını kontrol et; oluştuysa içeriği elle `src/components/ui/` ve `src/lib/`'e taşı, `@` klasörünü sil.

**~~`npm run dev` backend'i sessizce başlatmıyordu~~ → çözüldü (01.08.2026).** Kök neden: `tsx watch`'ın dosya değişince yeniden başlattığı child process, `concurrently`'nin prefix'leme için kullandığı **piped** stdio (`[api]`/`[web]` etiketleri) altında hiç log basmıyor ve portu hiç açmıyordu — halbuki `concurrently --raw` (piping yok, doğrudan `inherit`) veya doğrudan terminalden çalıştırmak sorunsuzdu. Yani `tsx watch`'a özgü bir child-process/stdio-inheritance uyumsuzluğu, `concurrently`'nin prefix mekanizmasıyla çakışıyordu. **Çözüm:** `backend/package.json`'daki `dev` script'i `tsx watch src/index.ts` yerine `node --watch --import tsx src/index.ts` oldu — Node'un kendi `--watch`'ı aynı işi yapıyor (dosya değişince yeniden başlatma) ama child'ı `tsx watch`'tan farklı şekilde yönetiyor ve `concurrently`'nin piped modunda sorunsuz çalışıyor. Hem prefix'ler hem de restart-on-change davranışı korunuyor (`node --watch` "Restarting 'src/index.ts'" diye logluyor).

---

## Kim ne üzerinde çalışıyor

| Kişi | Faz / alan | Durum |
|---|---|---|
| _(boş)_ | — | — |

> Bir işe başlarken buraya satır ekle, bitirince kaldır. Aynı dosyalarda çakışmamak için.
