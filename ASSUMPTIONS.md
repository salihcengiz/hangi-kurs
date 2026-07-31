# Varsayımlar

> Onay alınmadan yapılan, sorulmaya değer ama işi durdurmayacak kadar küçük kabuller.
> Biri yanlışsa söyle — hepsi geri alınabilir durumda.
> Kullanıcının açıkça karara bağladığı konular burada değil, [PRD.md §7](PRD.md)'de.

---

## Veri modeli

**Fiyatlar `Decimal` değil `Int`, birim tam Türk Lirası.**
Kurs ücretleri tam lira olarak ilan ediliyor (`₺24.500`), kuruş hassasiyeti pratikte gereksiz. Karşılığında JSON serileştirmede ondalık sürprizi yok ve sıralama SQL ile JS tarafında birebir aynı davranıyor. Kuruş gerekirse alan `Decimal(10,2)`'ye çevrilir; mapper'da `Number()` dönüşümü eklenmesi gerekir.

**`placementRate` yüzde olarak saklanıyor (0–100), oran olarak değil (0–1).**
`72.5` = %72,5. Şemada yorum olarak yazılı. UI tarafında ayrıca 100 ile çarpılmamalı.

**`Program.targetGrade` serbest metin.**
"12. Sınıf", "Mezun", "5-7. Sınıf", "Tüm seviyeler" gibi değerler enum'a sığmıyordu. Filtreleme gerekirse Faz 2'de normalize edilir.

**`Branch.lat`/`lng` nullable ve seed'de yaklaşık.**
Koordinatlar ilgili ilçenin merkezine yakın uydurma değerler. Harita entegrasyonu v1'de yok, doğruluk şu an önemli değil.

**Yeni fiyat ve başarı kayıtları için `academicYear` serbest metin (`"2024-2025"`).**
Enum yapmak her yıl migration gerektirirdi. Format tutarlılığı seed ve gelecekteki yazma yollarının sorumluluğunda.

## Seed verisi

**Kurum başına 5–15 onaylı, 1–2 bekleyen yorum.**
Brief "5-15" demişti; bekleyen yorumları moderasyon kuralının gerçekten uygulandığını doğrulayabilmek için ben ekledim.

**Puanlar pozitife eğimli ama kötü yorumlar da var** (%6 bir yıldız, %30 beş yıldız).
Her kurumun 4,8 olduğu bir seed'de sıralama ve filtreleme test edilemez.

**Her programın iki akademik yıla ait fiyat kaydı var.**
Önceki yıl fiyatı, güncel fiyatın %72–80'i olarak türetiliyor. Amaç `PriceRecord`'un append-only olduğunu ekranda görünür kılmak.

**Seed deterministik — sabit tohumlu PRNG.**
Ekipte herkeste birebir aynı veri oluşur, ekran görüntüleri ve hata raporları örtüşür. Tohumu değiştirirsen tüm ID'ler ve puanlar değişir.

**20 kurum 14 farklı ile yayıldı**, kurum tipleri dört enum değerine de dağıtıldı, üç fiyat kaynağı (`OFFICIAL`, `USER_REPORTED`, `ESTIMATED`) ve üç başarı kaynağı (`INSTITUTION_CLAIM`, `OSYM_PUBLIC`, `USER_REPORTED`) türünün hepsi temsil ediliyor. Filtrelerin Faz 2'de gerçek veriyle test edilebilmesi için.

## Altyapı

**Veritabanı adı `hangi-kurs`** (`.env`'de böyle yazılmıştı, korundu). `.env.example` de buna göre güncellendi.

**Portlar: API 4000, frontend 5173.**
5173 Vite'ın varsayılanı. Dev'de Vite `/api`'yi 4000'e proxy'ler, böylece CORS devreye girmez.

**Backend ESM (`"type": "module"`), relative import'lar `.js` uzantılı.**
NodeNext modül çözümlemesinin gereği. Kaynak `.ts` olsa da import `.js` yazılır.

**TypeScript 6 kullanılıyor, 7 değil.**
TS 7 (Go tabanlı derleyici) yayında ama çok yeni. Frontend şablonu zaten 6'ya sabitlenmişti, backend de aynı major'da tutuldu.

**`concurrently` ile tek `npm run dev`.**
Faz 1 bitiş kriteri "tek komutla çalışıyor" diyordu; iki ayrı process için en sade yol.

## Tasarım

**"Beyaz olsun" isteği monokrom bir yön olarak yorumlandı.**
Beyaz zemin `#FFFFFF`, mürekkep `#111111`, birincil aksiyonlar siyah. Beyaz tek başına accent olamaz — buton ve link rengi gerekiyor.

**Tek accent `#0F766E` (teal), yalnızca vurgu için ayrıldı.**
PRD karşılaştırma tablosunda "farklılıkları vurgula, en iyi değeri işaretle" diyor; bunun için nötr olmayan bir renk teknik zorunluluk. Gövde arayüzünde kullanılmayacak. Renk beğenilmezse tek token değişikliğiyle güncellenir.

## Kapsam

**Faz 4 = Karşılaştırma sayfası.**
Orijinal brief'te faz numaraları 1, 2, 3, 5 diye gidiyordu — 4 atlanmıştı. Karşılaştırma özelliği hiçbir faza atanmamış tek büyük parçaydı, oraya yerleştirildi.

**`/hakkinda` sayfası Faz 3'e alındı.**
Brief'te açıkça bir faza bağlanmamıştı; `/nasil-hesapliyoruz` ile aynı türden statik içerik olduğu için birlikte yazılması mantıklı geldi.
