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

    def __str__(self):
        return f"{self.product.name_en} - {self.name}"

class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')
    size_value = models.FloatField(verbose_name="Numara / Beden")
    stock = models.PositiveIntegerField(default=0)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ('product', 'size_value')
        ordering = ['size_value']

    def __str__(self):
        return f"{self.product.name_en} - No: {self.size_value}"

    @property
    def current_price(self):
        return self.price_override if self.price_override else self.product.price

# --- SEPET MODELLERİ (SIRALAMA DÜZELTİLDİ) ---

class CartItem(models.Model):
    # 'Cart' tırnak içinde çünkü Cart modeli henüz aşağıda tanımlanmadı
    cart = models.ForeignKey('Cart', on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    size = models.ForeignKey(ProductSize, on_delete=models.CASCADE)
    color = models.ForeignKey(ProductColor, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product.name_en} ({self.size.size_value}) x {self.quantity}"

    @property
    def total_item_price(self):
        return self.size.current_price * self.quantity

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Cart {self.id} - User: {self.user}"

    @property
    def total_price(self):
        return sum(item.total_item_price for item in self.items.all())

    def add_item(self, product, size, color=None, quantity=1):
        """
        CartItem modeli yukarıda tanımlandığı için artık NameError vermez.
        """
        item, created = CartItem.objects.get_or_create(
            cart=self,
            product=product,
            size=size,
            color=color,
            defaults={'quantity': quantity}
        )

        if not created:
            item.quantity += int(quantity)
            item.save()
        return item

# --- DİĞER MODELLER ---

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    class Meta:
        unique_together = ('user', 'product')

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)