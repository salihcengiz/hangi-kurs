# HangiKurs — Yol Haritası

> **Bu dosya ne işe yarar:** Ne yapıldı, sırada ne var, kim neyi üstlendi.
> **Her görev bitiminde güncellenir** — kutucuğu işaretle, gerekiyorsa [CONTEXT.md](CONTEXT.md)'ye de yaz.
> Ürünün ne olduğu için [PRD.md](PRD.md).

**Şu an neredeyiz:** Faz 1b bitti ✅ · **Sıradaki: Faz 1c — Auth iskeleti (frontend client tarafı)**

---

## Faz 1 — İskelet

### 1a · Veri katmanı ✅ *(31.07.2026)*

- [x] Kök `package.json`: npm workspaces + `concurrently`, tek komutla `npm run dev`
- [x] `shared/types.ts` — DTO'lar, enum union'ları, Türkçe etiket haritaları
- [x] `backend/prisma/schema.prisma` — 6 model, 5 enum, cascade ilişkiler, indeksler
- [x] İlk migration (`20260731113931_init`)
- [x] Seed: 20 kurgusal kurum, 25 şube, 44 program, 88 fiyat kaydı, 16 başarı kaydı, 238 yorum
- [x] Express katmanlı yapı: route → controller → service → repository
- [x] `GET /api/institutions`, `GET /api/institutions/:slug`, `GET /api/health`, `GET /api/me`
- [x] Zod ile input doğrulama, tek noktadan hata yönetimi (Türkçe mesajlar)
- [x] Firebase auth iskeleti — opsiyonel, anahtar yoksa uygulama çalışmaya devam ediyor
- [x] **Doğrulandı:** 104 fiyat/başarı kaydının hepsinde `source` dolu
- [x] **Doğrulandı:** 32 `PENDING` yorumun hiçbiri API'den dönmüyor
- [x] **Doğrulandı:** puan agregasyonu tutarlı, 1-5 aralığında, liste ↔ detay örtüşüyor
- [x] npm audit: 11 açık kapatıldı, `found 0 vulnerabilities`

### 1b · Frontend kabuğu ✅ *(31.07.2026)*

- [x] Tailwind v4 kurulumu (`@tailwindcss/vite`) + monokrom tema token'ları
- [x] shadcn/ui kurulumu (`radix-nova` preset) — React 19 + Tailwind v4 ile sorunsuz
- [x] React Router (v8, `react-router` paketi) + rota iskeleti (`/`, `/kurumlar`, `/kurum/:slug`, 404)
- [x] Vite `/api` proxy'si → `localhost:4000` (CORS'suz dev)
- [x] `@shared` alias'ı Vite tarafında (`@` alias'ı da eklendi, shadcn bunu bekliyor)
- [x] Layout: header, footer, **örnek-veri banner'ı** (`RootLayout.tsx`)
- [x] `lib/api.ts` — fetch katmanı, tipli, `ApiError` ile hata gövdesini çözen
- [x] `lib/format.ts` — `Intl` ile `₺24.500` ve `dd.MM.yyyy`
- [x] `/kurumlar` — filtresiz sade liste, `InstitutionCard` bileşeni
- [x] `/kurum/:slug` — özet, programlar + fiyat tablosu, başarı verileri **kaynak etiketleriyle** (`SourceLabel`), şubeler, yorumlar
- [x] Loading / empty / error durumları — `useAsyncData` hook'u ile, boş ekran yok
- [x] **Doğrulandı:** 375px genişlikte sayfa düzeyinde yatay scroll yok (Playwright ile ölçüldü); başarı tablosu kendi konteynerinde yatay kayıyor, sayfa kaymıyor
- [x] Vite şablon artıkları temizlendi: `frontend/README.md`, `App.css`, `assets/react.svg`, `assets/vite.svg`, `assets/hero.png`, `public/icons.svg`
- [x] **Doğrulandı:** `npm run build` ve `tsc -b` hatasız; gerçek seed veriyle `/kurumlar` ve `/kurum/:slug` uçtan uca test edildi (ekran görüntüleriyle)

### 1c · Auth iskeleti ⬜

- [x] Firebase projesi (`hangi-kurs`) oluşturuldu, giriş yöntemleri açıldı *(31.07.2026)*
- [x] `backend/.env` service account ile dolduruldu, `frontend/.env` web config ile *(31.07.2026)*
- [x] **`/api/me` uçtan uca doğrulandı** — gerçek ID token ile 200, geçersiz/eksik token ile 401 *(31.07.2026)*
- [ ] Firebase client kurulumu (Google + e-posta)
- [ ] `AuthContext` + `useAuth`, header'da kullanıcı çipi
- [ ] `<ProtectedRoute>` — hazır ama henüz kullanılmıyor
- [ ] Firebase yapılandırılmamışken giriş butonu devre dışı + açıklama

> ✅ Dış bağımlılık çözüldü — kimlik bilgileri kurulu ve çalışıyor. Frontend kabuğu (1b) bitti, kalan maddeler sırada.

---

## Faz 2 — Filtreleme ve arama ⬜

- [ ] URL `searchParams`'a bağlı filtreler: şehir, ilçe, sınav türü, fiyat aralığı, sınıf mevcudu, kurum tipi, puan
- [ ] Sıralama: puan, fiyat (artan/azalan), yorum sayısı
- [ ] Sayfalama
- [ ] Filtreleme ve sayfalama **backend'de** — repository seviyesinde `where`/`orderBy`/`skip`/`take`
- [ ] Ana sayfa `/`: hero + arama kutusu, öne çıkan kurumlar, "nasıl çalışır"
- [ ] Klavyeyle gezilebilir filtre arayüzü

## Faz 3 — Puan ve metodoloji ⬜

- [ ] `calculateAverageRating` — 1-5 int oyların float ortalaması
- [ ] Vitest birim testleri: boş yorum listesi, tek yorum, yuvarlama sınırları
- [ ] Yıldız bileşenleri, alt puanlar (öğretim / tesis / rehberlik / fiyat-değer)
- [ ] `/nasil-hesapliyoruz` — puan hesabı **ve kaynak etiketi politikası**
- [ ] `/hakkinda` + veri politikası

## Faz 4 — Karşılaştırma ⬜

- [ ] `localStorage` sepeti, 2-4 kurum sınırı
- [ ] Sticky bar (mobilde alt bar), sayfalar arası korunur
- [ ] `/karsilastir?ids=a,b,c` — paylaşılabilir URL
- [ ] Satır bazlı karşılaştırma tablosu, farklılık vurgusu, "en iyi değer" işareti
- [ ] Mobilde yatay scroll + `position: sticky` ilk sütun

## Faz 5 — Cila ⬜

- [ ] Yorumlar bölümü — sadece `APPROVED`, sayfalamalı
- [ ] `react-helmet-async` — dinamik title/description/OG
- [ ] JSON-LD: `EducationalOrganization` + `AggregateRating`
- [ ] `sitemap.xml` — build sırasında Prisma'dan üretilir
- [ ] `robots.txt`
- [ ] Erişilebilirlik geçişi: semantic HTML, klavye, label'lar, kontrast
- [ ] Responsive geçişi
- [ ] Lighthouse performans 90+ ölçümü
- [ ] README finalize

---

## Çalışma kuralları

- **Her fazın sonunda dur, özetle, onay bekle.** Yarım bırakılmış, derlenmeyen ara durum bırakma.
- Her fazın sonunda `npm run dev` ile açılan çalışan bir uygulama olmalı.
- Bir işe başlarken [CONTEXT.md](CONTEXT.md)'deki "kim ne üzerinde çalışıyor" tablosuna satır ekle.
- Mimari bir karar verdiysen [CONTEXT.md](CONTEXT.md)'deki karar günlüğüne tarihiyle yaz.
- Onay almadan varsayım yaptıysan [ASSUMPTIONS.md](ASSUMPTIONS.md)'ye ekle.
