from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


# --- TEMEL YAPILAR ---

class Category(models.Model):
    name_tr = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name_en


class Campaign(models.Model):
    name = models.CharField(max_length=100)
    discount_percentage = models.PositiveIntegerField(help_text="Yüzde olarak indirim oranı (örn: 20)")
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def is_valid(self):
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date

    def __str__(self):
        return f"{self.name} (%{self.discount_percentage})"


class Coupon(models.Model):
    DISCOUNT_TYPES = (
        ('percentage', 'Yüzde (%)'),
        ('amount', 'Sabit Tutar'),
    )
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(default=100)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def is_valid(self):
        now = timezone.now()
        return (self.is_active and
                self.valid_from <= now <= self.valid_to and
                self.used_count < self.usage_limit)

    def __str__(self):
        return f"{self.code} - {self.discount_value} ({self.discount_type})"


# --- ÜRÜN YAPILARI ---

class Product(models.Model):
    slug = models.SlugField(unique=True)
    name_tr = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200)
    description_tr = models.TextField()
    description_en = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Baz fiyat
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
    campaign = models.ForeignKey(Campaign, on_delete=models.SET_NULL, null=True, blank=True, related_name='sizes')

    class Meta:
        unique_together = ('product', 'size_value')
        ordering = ['size_value']

    def __str__(self):
        return f"{self.product.name_en} - No: {self.size_value}"

    @property
    def current_price(self):
        # Önce bedene özel fiyat var mı bak, yoksa ürünün genel fiyatını al
        base_price = self.price_override if self.price_override else self.product.price

        # Aktif kampanya varsa indirimi uygula
        if self.campaign and self.campaign.is_valid():
            discount = (base_price * self.campaign.discount_percentage) / 100
            return base_price - discount
        return base_price

    @property
    def discount_remaining_time(self):
        if self.campaign and self.campaign.is_valid():
            remaining = self.campaign.end_date - timezone.now()
            return max(int(remaining.total_seconds()), 0)
        return 0


# --- SEPET YAPILARI ---

class CartItem(models.Model):
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
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Cart {self.id} - User: {self.user}"

    @property
    def total_price_before_coupon(self):
        return sum(item.total_item_price for item in self.items.all())

    @property
    def total_price(self):
        total = self.total_price_before_coupon
        if self.coupon and self.coupon.is_valid():
            if self.coupon.discount_type == 'percentage':
                total -= (total * self.coupon.discount_value) / 100
            else:
                total -= self.coupon.discount_value
        return max(total, 0)

    def add_item(self, product, size, color=None, quantity=1):
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


# --- ETKİLEŞİM MODELLERİ ---

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