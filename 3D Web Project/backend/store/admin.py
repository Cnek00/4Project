from django.contrib import admin
from django.shortcuts import render
from django.http import HttpResponseRedirect
from .models import Category, Product, ProductColor, ProductSize, Review, Cart, CartItem


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

# --- MODEL KAYITLARI ---
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'price', 'category', 'is_visible')
    inlines = [ProductSizeInline, ProductColorInline]
    prepopulated_fields = {"slug": ("name_en",)}

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

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'updated_at', 'is_completed')
    inlines = [CartItemInline]