# Kayıt Olma Hatası Çözümü & JSON Ürün Yükleme Sistemi

## 1. Kayıt Olma Hatası Çözümü ✅

### Problem
```
IntegrityError at /accounts/signup/
duplicate key value violates unique constraint "users_user_username_key"
DETAIL: Key (username)=() already exists.
```

### Neden Oluşuyordu?
- User modeli `username` alanında `unique=True` kısıtı vardı
- Allauth settings'te `ACCOUNT_USER_MODEL_USERNAME_FIELD = None` ayarı vardı
- Bu nedenle username boş kalıyor ve ikinci kayıt sırasında duplicate constraint hatası oluşuyordu

### Yapılan Çözümler

#### 1. User Model Değiştirildi (`users/models.py`)
```python
username = models.CharField(
    max_length=150, 
    unique=True, 
    blank=True,
    null=True,
    help_text="Boş bırakılabilir, email'den generate edilir"
)

USERNAME_FIELD = 'email'
REQUIRED_FIELDS = []  # username'i kaldırdık
```

#### 2. Custom Adapter Eklendi (`core/adapters.py`)
`CustomAccountAdapter` sınıfı eklenerek username otomatik olarak email'den generate edilir:
- Email'in @ öncesi kısmını kullanır
- Çakışma durumunda UUID ekler

#### 3. Settings'te Adapter Kayıtlandı (`core/settings.py`)
```python
SOCIALACCOUNT_ADAPTER = 'core.adapters.CustomSocialAccountAdapter'
ACCOUNT_ADAPTER = 'core.adapters.CustomAccountAdapter'
```

#### 4. Database Migration Uygulandı
```bash
python manage.py migrate users
```

---

## 2. JSON Ürün Yükleme Sistemi 📦

### Özellikleri
✅ JSON dosyasından ürünleri toplu yükleme  
✅ Kategoriler, ürünler, bedenleri ve renkleri otomatik oluşturma  
✅ Sistem sıfırlandığında hızlı veri geri yükleme  
✅ Düzenlenebilir örnek veriler  

### Dosya Konumu
```
backend/fixtures/sample_products.json
```

### JSON Dosyası Yapısı

```json
{
  "categories": [
    {
      "id": 1,
      "name_tr": "Ayakkabı",
      "name_en": "Shoes",
      "slug": "shoes"
    }
  ],
  "products": [
    {
      "slug": "nike-air-max-90",
      "name_tr": "Nike Air Max 90",
      "name_en": "Nike Air Max 90",
      "description_tr": "...",
      "description_en": "...",
      "price": "899.99",
      "currency": "EUR",
      "category_slug": "shoes",
      "thumbnail": "Nike_Air_Max_90_thumb.jpg",
      "is_visible": true,
      "is_available": true,
      "low_stock_warning": 5,
      "sizes": [
        {
          "size_value": 36.0,
          "stock": 15,
          "price_override": null,
          "label": "36"
        }
      ],
      "colors": [
        {
          "name": "White",
          "hex_code": "#FFFFFF"
        }
      ]
    }
  ]
}
```

### Management Command: `load_products_from_json`

#### Kullanım

**Varsayılan JSON dosyasından ürünleri yükle:**
```bash
python manage.py load_products_from_json
```

**Özel JSON dosyasından yükle:**
```bash
python manage.py load_products_from_json --file path/to/custom_products.json
```

**Önceki verileri sil ve yenilerini yükle:**
```bash
python manage.py load_products_from_json --clear
```

**Kombinasyon (özel dosya + veri temizleme):**
```bash
python manage.py load_products_from_json --file fixtures/products_v2.json --clear
```

#### Çıktı Örneği
```
Mevcut veriler siliniyor...
Veriler silindi
  ✓ Kategori eklendi: Shoes
  ✓ Kategori eklendi: Clothing
  ✓ Kategori eklendi: Accessories

3 kategori yüklendi
  ✓ Ürün eklendi: Nike Air Max 90
    ✓ Beden eklendi: 36.0 (Stok: 15)
    ✓ Renk eklendi: White
    ✓ Renk eklendi: Black

6 ürün yüklendi

✓ İşlem tamamlandı!
```

### JSON Dosyası Nasıl Düzenlenir?

1. **Yeni Kategori Ekleme:**
```json
{
  "id": 4,
  "name_tr": "Çantalar",
  "name_en": "Bags",
  "slug": "bags"
}
```

2. **Yeni Ürün Ekleme:**
```json
{
  "slug": "leather-wallet",
  "name_tr": "Deri Cüzdan",
  "name_en": "Leather Wallet",
  "description_tr": "Premium deri cüzdan",
  "description_en": "Premium leather wallet",
  "price": "149.99",
  "currency": "EUR",
  "category_slug": "bags",
  "thumbnail": "leather_wallet.jpg",
  "is_visible": true,
  "is_available": true,
  "low_stock_warning": 3,
  "sizes": [
    {
      "size_value": 1.0,
      "stock": 10,
      "price_override": null,
      "label": "OneSize"
    }
  ],
  "colors": [
    {
      "name": "Black",
      "hex_code": "#000000"
    }
  ]
}
```

3. **Beden Özelleştirme:**
   - `size_value`: Sayısal değer (ayakkabı için 36, 37 vb; giyim için 1-6 = XS-XXL)
   - `stock`: Stok miktarı
   - `price_override`: Bu beden için özel fiyat (null ise ürün fiyatını kullanır)
   - `label`: Görüntülenecek label (isteğe bağlı)

4. **Renk Özelleştirme:**
   - `name`: Rengin adı
   - `hex_code`: Hex renk kodu (#RRGGBB formatında)

### Workflow: Sistem Sıfırlanması

Sistem sıfırlandığında aşağıdaki adımları izleyin:

```bash
# 1. Veritabanı sıfırla
python manage.py migrate store zero
python manage.py migrate store

# 2. Ürünleri JSON'dan yükle
python manage.py load_products_from_json --clear

# 3. Sistem hazır!
```

### JSON Dosyası Yedekleme

Sistem üzerinde değişiklikler yaptıktan sonra, JSON dosyasını güncellemeyi unutmayın:

```bash
# Django admin panelinden verileri export etmek için
python manage.py dumpdata store.Category store.Product store.ProductSize store.ProductColor > fixtures/backup_products.json
```

Ardından JSON'u formatlandırmak için Python kullanabilirsiniz:

```python
import json

with open('fixtures/backup_products.json', 'r') as f:
    data = json.load(f)

with open('fixtures/formatted_products.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

### Command Dosya Konumu
```
backend/store/management/commands/load_products_from_json.py
```

---

## Sorun Gidericiler

### Hata: "Kategori bulunamadı"
**Çözüm:** JSON dosyasında `category_slug`'ın `categories` bölümündeki `slug` ile eşleştiğini kontrol edin.

### Hata: "Dosya bulunamadı"
**Çözüm:** 
- Dosya yolu doğru olduğundan emin olun
- Mutlak veya backend klasörüne göre göreceli yol kullanabilirsiniz
- Varsayılan: `fixtures/sample_products.json`

### Ürünler Yüklenmedi Ama Hata Yok
**Çözüm:** JSON dosyasının geçerli olup olmadığını kontrol edin:
```bash
python -m json.tool fixtures/sample_products.json
```

### Stok Güncellenmedi
**Çözüm:** Command'ı `--clear` parametresi olmadan çalıştırırsanız, mevcut ürünler güncellenir ve stok bilgileri yenilenir. Yeni bedenleri kullanırsanız eklenir.

---

## İlgili Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `users/models.py` | Güncellenmiş User modeli |
| `core/adapters.py` | Custom Account ve Social adapters |
| `core/settings.py` | Adapter konfigürasyonu |
| `fixtures/sample_products.json` | Örnek ürün verisi |
| `store/management/commands/load_products_from_json.py` | Management command |
| `users/migrations/0002_alter_user_id_alter_user_username.py` | Database migratation |

---

## Test Etme

### Kayıt Olmanın Çalıştığını Test Etme
```bash
curl -X POST http://localhost:8000/api/auth/registration/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password1": "SecurePass123!",
    "password2": "SecurePass123!"
  }'
```

### JSON Yüklemenin Çalıştığını Test Etme
```bash
python manage.py load_products_from_json --clear
# Başarılı mesaj görmeli
```

### Admin Panelinde Kontrol
```
http://localhost:8000/admin/
- Store > Products kısmından ürünleri görebilirsiniz
- Users bölümünde yeni kayıtlı kullanıcıları görebilirsiniz
```

---

## Notlar

⚠️ **Önemli:** Veritabanı constraint'leri hakkında  
- Username alanı hala `unique=True` ve `null=True` - bu normal
- Boş username'ler (NULL) benzersiz sayılır, bu yüzden birden fazla NULL değer olabilir
- Email alanı `unique=True` - bu gerekli

✅ **Başarılı Sonuç**
- Kullanıcılar email ile kayıt olabilir
- Username otomatik olarak generate edilir
- Sistem sıfırlandığında ürünler hızlı yüklenir
