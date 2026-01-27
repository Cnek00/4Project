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
    # Dil destekli alanlar
    name_tr = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200)
    description_tr = models.TextField()
    description_en = models.TextField()
    meta_title_tr = models.CharField(max_length=70, blank=True)
    meta_title_en = models.CharField(max_length=70, blank=True)
    meta_description_tr = models.TextField(max_length=160, blank=True)
    meta_description_en = models.TextField(max_length=160, blank=True)

    # Sayısal ve Teknik veriler
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=5, default="EUR")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    thumbnail = models.ImageField(upload_to='products/thumbnails/')
    model_3d = models.FileField(upload_to='products/models/', null=True, blank=True)  # .glb dosyaları

    # Status ve Counterlar
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
    name = models.CharField(max_length=50)  # Örn: "Mavi"
    hex_code = models.CharField(max_length=7)  # Örn: "#0000FF"


class ProductSize(models.Model):
    SIZE_CHOICES = [
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double Extra Large'),
    ]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')
    size = models.CharField(max_length=5, choices=SIZE_CHOICES)
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('product', 'size')  # Bir ürüne aynı beden iki kez eklenmesin

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')

    class Meta:
        unique_together = ('user', 'product') # Bir kullanıcı bir ürünü bir kez favorileyebilir

class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ratings')
    score = models.PositiveSmallIntegerField() # 1-5 arası

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