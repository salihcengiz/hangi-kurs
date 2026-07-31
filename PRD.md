# HangiKurs — Ürün Gereksinim Dokümanı

> **Bu dosya ne işe yarar:** Ürünün *ne* olduğunu ve *neden* öyle olduğunu anlatır.
> Nadiren değişir — sadece bir ürün kararı değiştiğinde güncellenir.
> Kodun şu anki hâli için [CONTEXT.md](CONTEXT.md), sıradaki işler için [ROADMAP.md](ROADMAP.md).

---

## 1. Ürün

**Ad:** HangiKurs

**Tek cümle:** Öğrenci ve velilerin dershane / kurs merkezlerini fiyat ve performans açısından yan yana karşılaştırmasını sağlayan web uygulaması.

**Problem:** Bir dershane seçerken fiyatlar şeffaf değil, "başarı" iddiaları standart değil ve karşılaştırma yapmak imkânsız. Karar çoğunlukla tanıdık tavsiyesiyle ya da reklam afişiyle veriliyor.

**Değer önerisi:** Akakçe/Cimri'nin eğitim kurumları versiyonu — ama her sayının kaynağı açıkça etiketlenmiş hâlde.

## 2. Hedef kullanıcı

1. **Öğrenci** — YKS/LGS'ye hazırlanan, 16-18 yaş, ağırlıklı olarak telefondan girer. Mobile-first tasarımın sebebi bu.
2. **Veli** — fiyat ve taksit odaklı, masaüstü de kullanır, karşılaştırma tablosunu ciddiye alır.

## 3. Kapsam

### v1'de VAR
- Kurum listeleme, filtreleme, arama
- Kurum detay sayfası: fiyatlar, taksit seçenekleri, programlar, başarı verileri, konum, yorumlar
- Puan gösterimi ve nasıl hesaplandığının açık anlatımı
- Kullanıcı yorumu **okuma**
- Karşılaştırma sepeti ve yan yana karşılaştırma sayfası
- Seed data ile dolu, gezilebilir uygulama
- Firebase ile giriş/çıkış — *arkasında henüz özellik yok, bkz. §7*

### v1'de YOK
Kurum sahibi paneli · ödeme / rezervasyon / lead formu · gerçek veri scraping'i · mobil uygulama · yorum **yazma** · dark mode · SSR / prerender · kompozit fiyat-performans skoru

Bu maddeler yapılmayacak, ama mimari bunları sonradan eklemeyi engellemeyecek şekilde kurgulanıyor.

## 4. Sayfalar

| Rota | İçerik |
|---|---|
| `/` | Hero + arama kutusu (şehir/ilçe + sınav türü), öne çıkan kurumlar, "nasıl çalışır" |
| `/kurumlar` | Filtreli liste. Filtreler: şehir, ilçe, sınav türü, fiyat aralığı, sınıf mevcudu, kurum tipi, puan. Sıralama: puan, fiyat (artan/azalan), yorum sayısı |
| `/kurum/:slug` | Detay: özet kartı, programlar ve fiyat tablosu, başarı verileri + kaynak etiketleri, yorumlar, şubeler, "karşılaştırmaya ekle" |
| `/karsilastir?ids=a,b,c` | 2-4 kurum yan yana. Satır bazlı tablo, farklılıkları vurgula, en iyi değeri işaretle. URL paylaşılabilir |
| `/nasil-hesapliyoruz` | Puan hesabının ve kaynak etiketi politikasının açık anlatımı |
| `/hakkinda` | Kısa metin + veri politikası |

Karşılaştırma sepeti `localStorage`'da tutulur, sayfalar arası korunur, sağ altta sticky bar (mobilde alt bar) ile gösterilir.

## 5. Veri modeli — anlamlar

Şemanın kendisi [backend/prisma/schema.prisma](backend/prisma/schema.prisma) içinde. Burada yazılı olan, koddan okunamayan **niyet**:

| Varlık | Neden var |
|---|---|
| `Institution` | Karşılaştırmanın öznesi. `slug` URL'de görünür ve kalıcıdır — değiştirmek eski bağlantıları kırar |
| `Branch` | Bir kurumun birden fazla şubesi olabilir; şehir/ilçe filtresi şube üzerinden çalışır, kurum üzerinden değil |
| `Program` | Fiyat kuruma değil programa aittir. "Bu dershane ne kadar?" sorusunun tek cevabı yoktur |
| `PriceRecord` | **Append-only.** Fiyat değişince satır güncellenmez, yeni satır eklenir. Geçmiş fiyat ve kaynağı denetlenebilir kalır |
| `PerformanceRecord` | Başarı iddiaları. Çoğu kurum beyanıdır ve öyle etiketlenir |
| `Review` | Kullanıcı yorumu. `PENDING` başlar, moderasyon olmadan yayına çıkmaz |

## 6. Çiğnenemez kurallar

Bunlar tercih değil, ürünün varlık sebebi:

1. **Kaynaksız sayı gösterilmez.** `PriceRecord.source` ve `PerformanceRecord.source` zorunlu alandır — şemada varsayılan değeri yoktur, yani kaynağını söylemeden bu veritabanına sayı yazmak mümkün değildir. UI'da da her sayının yanında kaynak etiketi görünür.
2. **Yorumlar moderasyondan geçer.** `PENDING` durumundaki hiçbir yorum API'den dönmez. Onaylanmamış yorum puan ortalamasına da katılmaz.
3. **Mutlak iddia kurulmaz.** "En iyi dershane" gibi ifadeler yok. Dil hep "verilere göre", "kullanıcı beyanına göre", "kurum beyanına göre".
4. **Seed data tamamen kurgusaldır.** Gerçek kurum ismi, gerçek başarı istatistiği yok. Sitede bunun örnek veri olduğunu belirten bir banner bulunur ve bu veri kullanıldığı sürece kalır.

## 7. Karara bağlanmış belirsizlikler

İlk brief'te birbiriyle çelişen noktalar vardı. Verilen kararlar:

| Konu | Karar | Gerekçe |
|---|---|---|
| Framework | **Vite SPA + ayrı Express** | Brief hem Vite+Express hem Next.js API'leri (`generateStaticParams`, `next/image`) istiyordu. Vite tercih edildi; Next.js'e özgü SEO araçları kapsam dışı |
| Değer skoru | **Sadece yıldız ortalaması** | Brief hem "fiyat/performans kompozit skoru" hem "basit yıldız sistemi" diyordu. Basit olan seçildi: 1-5 arası int oy, float ortalama |
| Dev veritabanı | **Lokal PostgreSQL** (Docker yok) | Prisma'nın SQLite connector'ı enum desteklemiyor; 5 enum'u String'e çevirmek yerine dev ve prod aynı tutuldu |
| Auth | **Faz 1'de kurulur, arkasında özellik yok** | Brief hem "Firebase Auth" hem "auth v1'de yok" diyordu. Altyapı hazır, ilk özellik v2'de takılır |
| SEO | **Meta + JSON-LD + üretilen sitemap** | SPA'da SSR yok. `react-helmet-async` ile dinamik meta, JSON-LD client-side, sitemap build sırasında veritabanından üretilir |
| Tasarım | **Monokrom, beyaz zeminli** | Siyah birincil aksiyon rengi; tek accent yalnızca karşılaştırma tablosunda "en iyi değer" işaretlemesi için |

## 8. Puan hesabı

Kullanıcılar 1-5 arası **tam sayı** oy verir. Gösterilen puan, **yalnızca onaylanmış** yorumların **float ortalamasıdır**, tek ondalığa yuvarlanır.

Dört alt puan ayrıca toplanır: öğretim (`teachingScore`), tesis (`facilityScore`), rehberlik (`guidanceScore`), fiyat-değer (`valueScore`).

Hiç onaylı yorum yoksa puan `null`'dır — **0 değil**. "Henüz puan yok" ile "sıfır puan almış" ekranda aynı görünemez.

## 9. Yasal ve etik sınırlar

- Seed verisindeki tüm kurum, şube, program, fiyat ve başarı verileri uydurmadır. `example.com` alt alan adları ve `+90 XXX 000 00XX` formatındaki telefonlar bilinçli olarak sahtedir.
- Gerçek veri eklenirse her kaydın kaynağı belgelenmek zorundadır; `ESTIMATED` kaynak türü ancak tahmin olduğu açıkça yazılırsa kullanılabilir.
- Kullanıcı yorumları kişi ismi taşımaz, takma ad (`authorAlias`) kullanılır.
