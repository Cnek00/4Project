from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Category(models.Model):
    name_tr = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name_en


class Product(models.Model):
    slug = models.SlugField(unique=True)
    name_tr = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200)
    description_tr = models.TextField()
    description_en = models.TextField()

    # Sayısal ve Teknik veriler
    # Bu fiyat artık "başlangıç fiyatı" veya "varsayılan fiyat" görevinde
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=5, default="EUR")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    thumbnail = models.ImageField(upload_to='products/thumbnails/')
    model_3d = models.FileField(upload_to='products/models/', null=True, blank=True)

    is_visible = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    low_stock_warning = models.IntegerField(default=5)
    view_count = models.PositiveIntegerField(default=0)
    favorite_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name_en


class ProductColor(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='colors')
    name = models.CharField(max_length=50)
    hex_code = models.CharField(max_length=7)


# --- BURASI DEĞİŞTİ ---
class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')

    # Artık Choice yok, float numara var (Örn: 42.5)
    size_value = models.FloatField(verbose_name="Numara / Beden")

    stock = models.PositiveIntegerField(default=0)

    # Bedene göre değişebilen fiyat mantığı
    # Eğer bu alan null kalırsa, ürünün kendi price'ı geçerli olacak
    price_override = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Bedene Özel Fiyat",
        help_text="Boş bırakılırsa ana ürün fiyatı kullanılır."
    )

    class Meta:
        unique_together = ('product', 'size_value')
        ordering = ['size_value']  # Küçük numaradan büyüğe sıralı gelsin

    def __str__(self):
        return f"{self.product.name_en} - Size: {self.size_value}"

    # Fiyatı getiren yardımcı fonksiyon (Logic burada)
    @property
    def current_price(self):
        return self.price_override if self.price_override else self.product.price


# --- DİĞERLERİ AYNI KALDI ---
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')

    class Meta:
        unique_together = ('user', 'product')


class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ratings')
    score = models.PositiveSmallIntegerField()

    class Meta:
        unique_together = ('user', 'product')


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class SimilarProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='similar_from')
    similar_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='similar_to')

    class Meta:
        unique_together = ('product', 'similar_product')