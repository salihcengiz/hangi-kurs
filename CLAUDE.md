# HangiKurs — Claude Code Çalışma Kuralları

Bu proje bir ekip tarafından, birbirinden bağımsız sohbetlerde geliştiriliyor. Bu dosya, her yeni sohbetin aynı bağlamla başlamasını sağlar.

---

## Sohbete başlarken

Kod yazmadan önce şu sırayla oku:

1. **[PRD.md](PRD.md)** — ürün ne, neden öyle, hangi kurallar çiğnenemez
2. **[CONTEXT.md](CONTEXT.md)** — kod şu an ne durumda, hangi kararlar alınmış, tuzaklar neler
3. **[ROADMAP.md](ROADMAP.md)** — ne bitti, sırada ne var

Bunları okumadan mimari bir karar verme. Cevabı büyük ihtimalle bu üç dosyada zaten var.

## İş bitince — bu adımı atlama

Bir değişiklik yaptıysan, **aynı turda** şunları güncelle:

| Ne yaptıysan | Nereyi güncelle |
|---|---|
| Görev bitirdin | [ROADMAP.md](ROADMAP.md) — kutucuğu işaretle |
| Dosya/endpoint/bağımlılık ekledin | [CONTEXT.md](CONTEXT.md) — ilgili envanteri güncelle |
| Mimari karar verdin | [CONTEXT.md](CONTEXT.md) — karar günlüğüne **tarihiyle** ekle |
| Tuzak keşfettin | [CONTEXT.md](CONTEXT.md) — "bilinen tuzaklar" |
| Onay almadan varsayım yaptın | [ASSUMPTIONS.md](ASSUMPTIONS.md) |
| Kurulum adımı değişti | [README.md](README.md) |
| Ürün kararı değişti | [PRD.md](PRD.md) |

Bu dosyaları güncellemezsen ekipteki diğer kişiler eski bilgiyle çalışır. Kodun kendisi kadar önemli.

---

## Çiğnenemez kurallar

Bunlar stil tercihi değil — ürünün varlık sebebi. Ayrıntılı gerekçeler [PRD.md §6](PRD.md).

1. **Kaynaksız sayı gösterilmez.** Bir fiyat veya başarı verisi ekranda görünüyorsa, `source` etiketi de görünür. `PriceRecord.source` ve `PerformanceRecord.source` şemada varsayılansızdır — kaynağını söylemeden veri yazmak mümkün değildir, öyle kalsın.
2. **`PENDING` yorum API'den dönmez.** Puan ortalamasına da katılmaz. Repository seviyesindeki `where: { status: 'APPROVED' }` filtresini kaldırma.
3. **Mutlak iddia yok.** "En iyi dershane", "kesin başarı" gibi ifadeler kurma. Dil hep "verilere göre", "kurum beyanına göre", "kullanıcı beyanına göre".
4. **Seed verisi kurgusaldır.** Gerçek kurum ismi ekleme. Örnek-veri banner'ı kaldırılmaz.
5. **Puan yoksa `null`, sıfır değil.** "Henüz puan yok" ile "sıfır puan almış" ekranda aynı görünemez.

## Dil kuralı

| Ne | Dil |
|---|---|
| Değişken, fonksiyon, dosya adları | İngilizce |
| Kod yorumları | İngilizce |
| Commit mesajları | İngilizce |
| Kullanıcıya görünen **her** metin | Türkçe |
| API hata mesajları (`error.message`) | Türkçe — doğrudan kullanıcıya gösterilir |
| Bu dokümanlar | Türkçe |

Enum değerleri İngilizcedir (`DERSHANE`, `OFFICIAL`); ekranda görünen karşılıkları `shared/types.ts` içindeki `*_LABELS` haritalarındadır. Yeni bir enum değeri eklersen etiketini de ekle.

## Mimari kuralları

### Backend katmanları
```
route → controller → service → repository → Prisma
```
- **Prisma'yı import eden tek yer `repositories/`.** Controller veya service'te `import { prisma }` görürsen yanlıştır.
- Controller iş mantığı barındırmaz: input doğrular, bir servis fonksiyonu çağırır, sonucu yollar.
- Service HTTP bilmez — `req`/`res` almaz, düz argüman alır, DTO döner veya `AppError` fırlatır.
- Prisma satırını doğrudan döndürme; `mappers/` üzerinden DTO'ya çevir.

### `shared/types.ts`
Backend ↔ frontend API sözleşmesi. Bir DTO değiştirirsen iki taraf da derlenmeyene kadar uyuşmaz — kasıt bu.

⚠️ **Backend bu dosyadan yalnızca `import type` yapabilir.** Tip import'ları derlemede silinir, bu yüzden derlenmiş backend'in `shared/` klasörüne çalışma anı bağımlılığı yoktur. Backend'de `INSTITUTION_TYPE_LABELS` gibi bir **değer** import edersen çalışma anında modül bulunamaz. Frontend'de ikisi de serbest.

### Hata yönetimi
`lib/errors.ts` içindeki `AppError` alt sınıflarını fırlat (`NotFoundError`, `ValidationError`, `UnauthorizedError`). Express 5 async handler'lardaki reddedilen promise'leri otomatik olarak hata middleware'ine yolluyor — sırf hata bildirmek için `try/catch` yazma.

`AppError` olmayan her şey hata middleware'inde bug muamelesi görür: tam log'lanır, kullanıcıya jenerik mesaj döner. Stack trace veya SQL asla API'den sızmaz.

## Kod stili

- **TypeScript strict** + `noUncheckedIndexedAccess`. `any` kullanma; gerçekten bilinmiyorsa `unknown` + daraltma.
- Yorumları *neden* için yaz, *ne* için değil. Kodun kendisi ne yaptığını zaten söylüyor.
- Mevcut dosyaların yorum yoğunluğuna ve adlandırma tarzına uy.
- Frontend'de para ve tarih biçimlendirmesi `Intl` ile: `₺24.500`, `dd.MM.yyyy`. Elle string birleştirme yok.

## Çalışma tarzı

- **Faz faz ilerle.** Her fazın sonunda dur, ne yaptığını özetle, onay bekle. Yarım bırakılmış, derlenmeyen ara durum bırakma.
- Her fazın sonunda `npm run dev` ile açılan çalışan bir uygulama olmalı.
- **Kütüphane API'si uydurma.** Emin değilsen dokümana bak veya sor. Bu projede Prisma 7 ve Express 5 gibi yeni major sürümler var; v6/v4 alışkanlıkları çalışmıyor.
- Bir şeyi doğruladığını söylüyorsan gerçekten çalıştırmış ol. Testler geçmiyorsa çıktısıyla birlikte söyle.
- Varsayım yapmak zorunda kaldıysan [ASSUMPTIONS.md](ASSUMPTIONS.md)'ye yaz ve kullanıcıya söyle.

## Sık düşülen tuzaklar

Tam liste [CONTEXT.md](CONTEXT.md)'de. En sık karşılaşılanlar:

- **Prisma 7 ≠ Prisma 6.** `datasource` bloğunda `url` yok; `new PrismaClient()` driver adapter olmadan hata verir; client `src/generated/prisma`'ya üretilir.
- **Taze klonda Prisma client yok** (gitignore'da). Derleme hatası alırsan önce `npm run db:generate`.
- **`overrides` değiştirdiysen** `node_modules` + `package-lock.json` silinip yeniden kurulmalı, yoksa npm eski ağacı korur.
- **Backend derleme çıktısı `dist/backend/src/index.js`** — `shared/` workspace dışında olduğu için `rootDir` kök dizin. Kasıtlı.
