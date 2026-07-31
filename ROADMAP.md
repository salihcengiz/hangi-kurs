# HangiKurs — Yol Haritası

> **Bu dosya ne işe yarar:** Ne yapıldı, sırada ne var, kim neyi üstlendi.
> **Her görev bitiminde güncellenir** — kutucuğu işaretle, gerekiyorsa [CONTEXT.md](CONTEXT.md)'ye de yaz.
> Ürünün ne olduğu için [PRD.md](PRD.md).

**Şu an neredeyiz:** Faz 1a bitti ✅ · **Sıradaki: Faz 1b — Frontend kabuğu**

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

### 1b · Frontend kabuğu ⬜ **← SIRADAKİ**

- [ ] Tailwind v4 kurulumu (`@tailwindcss/vite`) + monokrom tema token'ları
- [ ] shadcn/ui kurulumu — React 19 uyumluluk bayrakları kurulum anında doğrulanacak
- [ ] React Router + rota iskeleti (`/`, `/kurumlar`, `/kurum/:slug`, 404)
- [ ] Vite `/api` proxy'si → `localhost:4000` (CORS'suz dev)
- [ ] `@shared` alias'ı Vite tarafında
- [ ] Layout: header, footer, **örnek-veri banner'ı**
- [ ] `lib/api.ts` — fetch katmanı, tipli, hata gövdesini çözen
- [ ] `lib/format.ts` — `Intl` ile `₺24.500` ve `dd.MM.yyyy`
- [ ] `/kurumlar` — filtresiz sade liste, kurum kartı bileşeni
- [ ] `/kurum/:slug` — özet, programlar + fiyat tablosu, başarı verileri **kaynak etiketleriyle**, şubeler, yorumlar
- [ ] Loading / empty / error durumları — gerçekten yazılacak, boş ekran bırakılmayacak
- [ ] 375px genişlikte yatay scroll olmadığı doğrulanacak
- [ ] Vite şablon artıkları temizlenecek: `frontend/README.md`, `App.css`, `assets/react.svg`, `assets/vite.svg`, `assets/hero.png`, `public/icons.svg`

### 1c · Auth iskeleti ⬜

- [ ] Firebase client kurulumu (Google + e-posta)
- [ ] `AuthContext` + `useAuth`, header'da kullanıcı çipi
- [ ] `<ProtectedRoute>` — hazır ama henüz kullanılmıyor
- [ ] Firebase yapılandırılmamışken giriş butonu devre dışı + açıklama
- [ ] `/api/me` uçtan uca doğrulanacak (gerçek token ile 200)

> ⚠️ **Dış bağımlılık:** Firebase projesi açılıp anahtarların paylaşılması gerekiyor. Faz 1c'nin başlaması buna bağlı — ama uygulama anahtarsız da çalıştığı için diğer fazlar bloke değil.

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
