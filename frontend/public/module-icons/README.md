# Modül İkonları

Bu klasöre modül logolarınızı ekleyebilirsiniz.

## Dosya İsimleri

Her modül için iki tip logo eklenebilir:

### Küçük İkonlar (customIcon)
- `alis.png` - Alış modülü için küçük ikon
- `satis.png` - Satış modülü için küçük ikon
- `stok.png` - Stok modülü için küçük ikon
- `servis.png` - Teknik Servis modülü için küçük ikon
- `finans.png` - Gelir-Gider modülü için küçük ikon
- `raporlar.png` - Raporlar modülü için küçük ikon

### Büyük Resimler (customImage)
- `alis-image.png` - Alış modülü için büyük resim
- `satis-image.png` - Satış modülü için büyük resim
- `stok-image.png` - Stok modülü için büyük resim
- `servis-image.png` - Teknik Servis modülü için büyük resim
- `finans-image.png` - Gelir-Gider modülü için büyük resim
- `raporlar-image.png` - Raporlar modülü için büyük resim

## Kullanım

- Eğer `customImage` varsa, öncelikle bu gösterilir (80x80px)
- Eğer `customImage` yoksa ama `customIcon` varsa, bu gösterilir (64x64px)
- Eğer ikisi de yoksa, varsayılan Lucide React ikonu gösterilir (64px)

## Not

Dosyalar bulunamazsa veya yüklenemezse, otomatik olarak varsayılan ikon gösterilecektir.

