from rest_framework import serializers
from .models import Product, ProductSize, ProductColor

class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        # 'size' yerine 'size_value' kullanıyoruz
        fields = ['id', 'size_value', 'stock', 'price_override', 'current_price']

class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ['id', 'name', 'hex_code']

class ProductListSerializer(serializers.ModelSerializer):
    # Ürünün içindeki tüm bedenleri ve renkleri liste olarak döndürür
    sizes = ProductSizeSerializer(many=True, read_only=True)
    colors = ProductColorSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'name_tr', 'name_en', 'price', 'currency',
            'thumbnail', 'view_count', 'favorite_count', 'sizes', 'colors', 'category'
        ]