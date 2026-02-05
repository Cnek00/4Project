from django.contrib import admin
from django.shortcuts import render
from django.http import HttpResponseRedirect
from .models import Category, Product, ProductColor, ProductSize, ProductImage, Review, Cart, CartItem, Order, OrderItem, Coupon, Campaign


# --- AKSİYON: Toplu Fiyat Güncelleme ---
@admin.action(description='Seçili bedenlere toplu fiyat ata')
def set_bulk_price(modeladmin, request, queryset):
    # Bu aksiyon seçilen ProductSize kayıtlarının fiyatını tek seferde değiştirir
    if 'apply' in request.POST:
        price = request.POST.get('new_price')
        queryset.update(price_override=price)
        modeladmin.message_user(request, f"{queryset.count()} adet bedene {price} EUR fiyatı uygulandı.")
        return HttpResponseRedirect(request.get_full_path())
    # Admin için özel fiyat giriş sayfası (Şablon gerektirir)
    return render(request, 'admin/bulk_price_update.html', context={'items': queryset})

# --- INLINE: Ürün sayfasında alt alta ekleme ---
class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    fields = ('size_value', 'stock', 'price_override')
    extra = 1

class ProductColorInline(admin.TabularInline):
    model = ProductColor
    fields = ('name', 'hex_code')
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    fields = ('image', 'order')
    extra = 1


# --- MODEL KAYITLARI ---
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'price', 'category', 'is_visible', 'is_available')
    inlines = [ProductSizeInline, ProductColorInline, ProductImageInline]
    prepopulated_fields = {"slug": ("name_en",)}
    fields = (
        'slug', 'name_tr', 'name_en', 'description_tr', 'description_en',
        'price', 'currency', 'category', 'thumbnail', 'model_3d', 'model_3d_poster',
        'is_visible', 'is_available', 'low_stock_warning',
    )

@admin.register(ProductSize)
class ProductSizeAdmin(admin.ModelAdmin):
    # Burada 'size_value' kullandığımızdan emin olduk!
    list_display = ('product', 'size_value', 'stock', 'price_override', 'get_final_price')
    list_editable = ('stock', 'price_override')
    actions = [set_bulk_price]

    @admin.display(description='Net Fiyat')
    def get_final_price(self, obj):
        return obj.current_price

admin.site.register(Category)
admin.site.register(Review)
admin.site.register(ProductColor)
admin.site.register(Coupon)
admin.site.register(Campaign)
admin.site.register(ProductImage)

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'updated_at', 'is_completed')
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'size_value', 'price', 'quantity')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total', 'created_at')
    list_filter = ('status',)
    inlines = [OrderItemInline]
    readonly_fields = ('created_at', 'updated_at')
