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

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name_en')
    size_value = serializers.ReadOnlyField(source='size.size_value')
    current_price = serializers.ReadOnlyField(source='size.current_price')
    total_item_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'size', 'size_value', 'color', 'quantity', 'current_price', 'total_item_price']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'updated_at']