from django.contrib import admin
from .models import Category, Product, ProductColor, ProductSize, Review

class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1

class ProductColorInline(admin.TabularInline):
    model = ProductColor
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'price', 'category', 'is_visible', 'is_available')
    list_filter = ('category', 'is_visible', 'is_available')
    search_fields = ('name_tr', 'name_en', 'slug')
    prepopulated_fields = {"slug": ("name_en",)} # İngilizce isme göre slug otomatik oluşur
    inlines = [ProductSizeInline, ProductColorInline]

admin.site.register(Category)
admin.site.register(Review)