# 🚀 Hızlı Başlangıç Kılavuzu

## ✅ Problem 1: Kayıt Olma Hatası ÇÖZÜLDÜ

### Yapılan Değişiklikler:
- ✅ `users/models.py` - username nullable hale getirildi
- ✅ `core/adapters.py` - email'den username otomatik generate
- ✅ `core/settings.py` - adapter kaydedildi
- ✅ Database migration uygulandı

### Test Etme:
```bash
# Registration API'yi test et
curl -X POST http://localhost:8000/api/auth/registration/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password1": "SecurePass123!",
    "password2": "SecurePass123!"
  }'
```

✨ **Artık duplicate username hatası almayacaksınız!**

---

## 📦 Problem 2: JSON Ürün Sistemi KURULDU

### 3 Dosya Oluşturuldu:
1. **`fixtures/sample_products.json`** - 6 örnek ürün
2. **`store/management/commands/load_products_from_json.py`** - Yükleme komutu
3. **`JSON_AND_SIGNUP_SOLUTION.md`** - Detaylı dokümantasyon

### Hemen Kullan:

#### 1️⃣ Ürünleri Yükle
```bash
cd backend
source .venv/bin/activate
python manage.py load_products_from_json --clear
```

#### 2️⃣ JSON'u Düzenle
```
backend/fixtures/sample_products.json
```

Yeni ürün eklemek:
```json
{
  "slug": "unique-name",
  "name_tr": "Türkçe Adı",
  "name_en": "English Name",
  "description_tr": "...",
  "description_en": "...",
  "price": "99.99",
  "currency": "EUR",
  "category_slug": "shoes",  // kategorinizin slug'ı
  "thumbnail": "image.jpg",
  "sizes": [{"size_value": 36, "stock": 10}],
  "colors": [{"name": "Red", "hex_code": "#FF0000"}]
}
```

#### 3️⃣ Sistem Sıfırlandığında:
```bash
python manage.py load_products_from_json --clear
```

**Tüm ürünler geri yüklenir!** ⚡

### Komutum Seçenekleri:
```bash
# Varsayılan JSON'dan yükle
python manage.py load_products_from_json

# Özel dosyadan yükle
python manage.py load_products_from_json --file path/to/file.json

# Önceki verileri sil ve yenilerini yükle
python manage.py load_products_from_json --clear
```

---

## 📋 JSON Kullanım Tipsikleri

### Ayakkabı (Beden: 36-45)
```json
"sizes": [
  {"size_value": 36.0, "stock": 15, "label": "36"}
]
```

### Giyim (Beden: XS-XXL)
```json
"sizes": [
  {"size_value": 1.0, "stock": 30, "label": "XS"},
  {"size_value": 2.0, "stock": 40, "label": "S"},
  {"size_value": 3.0, "stock": 50, "label": "M"},
  {"size_value": 4.0, "stock": 45, "label": "L"},
  {"size_value": 5.0, "stock": 35, "label": "XL"},
  {"size_value": 6.0, "stock": 25, "label": "XXL"}
]
```

### Aksesuar (OneSize)
```json
"sizes": [
  {"size_value": 1.0, "stock": 10, "label": "OneSize"}
]
```

---

## 🔧 Hızlı Görevler

| Görev | Komut |
|-------|-------|
| Ürünleri yükle | `python manage.py load_products_from_json --clear` |
| Yeni kategori ekle | JSON'da `categories` dizisine ekle |
| Yeni ürün ekle | JSON'da `products` dizisine ekle |
| Stok güncelle | JSON'da `stock` değerini değiştir ve yeniden yükle |
| Admin'de görüntüle | http://localhost:8000/admin/ |

---

## 🎯 Sonuç

✅ **Kayıt olma çalışıyor**  
✅ **JSON ürün sistemi kurulu**  
✅ **Sistem sıfırlandığında verileri 10 saniyede geri yükleyebilirsin**

### Artık yapabileceklerin:
- Ürünleri JSON dosyasında düzenleme
- Sistemı sıfırladığında bir komutla verileri geri yükleme
- Yeni proje üzerine aynı ürünleri hızlı kopyalama
- Ürün özelliklerini (stok, fiyat, renk, beden) kolayca yönetme

🚀 **Başlamaya hazır mısın?**
