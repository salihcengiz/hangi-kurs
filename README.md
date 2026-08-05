# HangiKurs

Öğrenci ve velilerin dershane / kurs merkezlerini fiyat ve performans açısından yan yana karşılaştırmasını sağlayan web uygulaması.

> **Uygulamadaki tüm veriler kurgusaldır.** Gerçek dershane ismi, gerçek fiyat veya gerçek başarı istatistiği kullanılmamaktadır.

**Durum:** Faz 1b tamamlandı — backend, veritabanı ve frontend kabuğu (liste, detay, 404) çalışıyor. Ayrıntı için [ROADMAP.md](ROADMAP.md).

## Dokümanlar

| Dosya | İçerik |
|---|---|
| [PRD.md](PRD.md) | Ürün ne, neden öyle — kapsam, sayfalar, çiğnenemez kurallar |
| [CONTEXT.md](CONTEXT.md) | Kodun şu anki hâli, mimari kararlar, bilinen tuzaklar |
| [ROADMAP.md](ROADMAP.md) | Fazlar, görev listeleri, kim ne yapıyor |
| [CLAUDE.md](CLAUDE.md) | Claude Code ile çalışma kuralları |
| [ASSUMPTIONS.md](ASSUMPTIONS.md) | Onay alınmadan yapılan varsayımlar |

---

## Ön koşullar

| | |
|---|---|
| **Node.js** | 20.19 veya üzeri (geliştirme 22.14 ile yapılıyor) |
| **PostgreSQL** | 16 veya üzeri (geliştirme 17 ile yapılıyor) |
| **npm** | 10+ |

PostgreSQL kurulumu (Windows): [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) — kurulum sırasında belirlediğin `postgres` şifresini not et, birazdan gerekecek. Veritabanını elle oluşturmana gerek yok.

## Kurulum

```bash
# 1. Bağımlılıklar — kökten çalıştır, workspaces her ikisini de kurar
npm install

# 2. Ortam değişkenleri
cp backend/.env.example backend/.env
```

Şimdi `backend/.env` dosyasını aç ve `DATABASE_URL` satırındaki **sadece `SIFRE` kısmını** kendi postgres şifrenle değiştir:

```
DATABASE_URL="postgresql://postgres:BURAYA_SIFRE@localhost:5432/hangi-kurs"
                           ^^^^^^^^ bu kullanıcı adı, dokunma
```

> Sık yapılan hata: `postgres:SIFRE` ifadesinin tamamının üzerine yazmak. `postgres` kullanıcı adıdır, sadece `SIFRE` değişir. Yanlış yazılırsa `P1000 Authentication failed` hatası alınır.

```bash
# 3. Veritabanını oluştur ve şemayı uygula (veritabanı yoksa Prisma oluşturur)
npm run db:migrate

# 4. 20 kurgusal kurumla doldur
npm run db:seed

# 5. Çalıştır
npm run dev
```

| Servis | Adres |
|---|---|
| API | http://localhost:4000 |
| Frontend | http://localhost:5173 |

Kurulumu doğrulamak için: <http://localhost:4000/api/health> → `{"status":"ok","database":"up",...}`

## Komutlar

Hepsi **kök dizinden** çalışır:

| Komut | Yaptığı |
|---|---|
| `npm run dev` | API + frontend'i birlikte başlatır |
| `npm run build` | İkisini de derler |
| `npm run db:migrate` | Bekleyen migration'ları uygular (gerekirse veritabanını oluşturur) |
| `npm run db:seed` | Veritabanını sıfırlayıp kurgusal veriyle doldurur |
| `npm run db:reset` | Veritabanını komple sıfırlar, migration'ları baştan uygular, seed'ler |
| `npm run db:studio` | Prisma Studio'yu açar — veriyi tarayıcıda gezmek için |

Tek bir workspace'i çalıştırmak için: `npm run dev:backend` veya `npm run dev:frontend`.

## Proje yapısı

```
hangi-kurs/
├── shared/types.ts    backend ↔ frontend ortak API sözleşmesi
├── backend/           Express + Prisma + PostgreSQL   :4000
│   ├── prisma/        şema, migration'lar, seed
│   └── src/           routes → controllers → services → repositories
└── frontend/          React + Vite                     :5173
```

Backend'de katman ayrımı katıdır: `route → controller → service → repository → Prisma`. Prisma'yı import eden tek dosya `repositories/` içindedir.

## Kimlik doğrulama (opsiyonel)

Uygulama **Firebase olmadan da tam çalışır** — tüm veriler herkese açıktır, sadece giriş butonu devre dışı görünür.

Girişi çalıştırmak için **iki ayrı** kimlik bilgisi seti gerekir. Bunları karıştırmak en sık yapılan hatadır:

| | Dosya | Ne yapar | Gizli mi |
|---|---|---|---|
| **Web app config** | `frontend/.env` | Kullanıcıyı giriş yaptırır | Hayır — bundle'a gömülür |
| **Service account** | `backend/.env` | Token'ı doğrular | **Evet** — projeye admin erişimi |

1. [Firebase Console](https://console.firebase.google.com/)'da bir proje aç (Analytics'e gerek yok)
2. **Build → Authentication → Sign-in method** → Email/Password ve Google'ı etkinleştir
3. **Project settings → General → Your apps → Web** ile bir web app ekle; çıkan config'ten dört değeri `frontend/.env`'e yaz (`cp frontend/.env.example frontend/.env`)
4. **Project settings → Service accounts → Generate new private key** ile JSON indir; üç alanı `backend/.env`'e yaz

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`FIREBASE_PRIVATE_KEY` tek satırda, **çift tırnak içinde** ve `\n` kaçış dizileri JSON'daki hâliyle bırakılmalıdır. Çift tırnak isteğe bağlı değil: dotenv `\n`'leri yalnızca çift tırnaklı değerlerde gerçek satır sonuna çevirir.

Doğrulama: `npm run dev` sonrası <http://localhost:4000/api/health> → `"authConfigured": true`

## Sorun giderme

**`P1000: Authentication failed`** — `DATABASE_URL`'deki şifre yanlış ya da kullanıcı adı yanlışlıkla silinmiş. Format: `postgresql://KULLANICI:SIFRE@localhost:5432/hangi-kurs`.

**`P1001: Can't reach database server`** — PostgreSQL servisi çalışmıyor. Windows'ta: `Get-Service postgresql*` ile kontrol et, `Start-Service postgresql-x64-17` ile başlat.

**`Cannot find module '../generated/prisma/client.js'`** — Prisma client üretilmemiş (gitignore'da olduğu için taze klonda yoktur). `npm run db:generate` çalıştır.

**`npm ls` "invalid" diyor** — Normal. Kök `package.json`'daki `overrides` girdileri güvenlik açıklarını kapatmak için bilinçli olarak semver aralıklarını ihlal ediyor. Gerekçeler `package.json` içindeki `//overrides` bloğunda.

**Override'ları değiştirdim ama etkisi yok** — npm mevcut ağacı geçerli sayıp yeniden çözümleme yapmıyor. `rm -rf node_modules package-lock.json && npm install`.

## Lisans

[LICENSE](LICENSE) dosyasına bakınız.
