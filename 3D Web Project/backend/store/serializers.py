from rest_framework import serializers
from .models import Product, ProductSize, ProductColor, ProductImage, Cart, CartItem, Category, Order, OrderItem


# --- ÜRÜN SERIALIZERS ---

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['id', 'size_value', 'stock', 'price_override', 'current_price']

class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ['id', 'name', 'hex_code']

class ProductListSerializer(serializers.ModelSerializer):
    sizes = ProductSizeSerializer(many=True, read_only=True)
    colors = ProductColorSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'name_tr', 'name_en', 'price', 'currency',
            'thumbnail', 'view_count', 'favorite_count', 'sizes', 'colors', 'images', 'category',
            'display_name',
        ]

    def get_display_name(self, obj):
        request = self.context.get('request')
        lang = (request.headers.get('Accept-Language', '') if request else '').lower()
        return obj.name_tr if lang.startswith('tr') else obj.name_en


class ProductDetailSerializer(serializers.ModelSerializer):
    sizes = ProductSizeSerializer(many=True, read_only=True)
    colors = ProductColorSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    display_name = serializers.SerializerMethodField()
    display_description = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'name_tr', 'name_en', 'description_tr', 'description_en',
            'price', 'currency', 'thumbnail', 'model_3d', 'model_3d_poster',
            'view_count', 'favorite_count', 'sizes', 'colors', 'images', 'category',
            'display_name', 'display_description',
        ]

    def get_display_name(self, obj):
        request = self.context.get('request')
        lang = (request.headers.get('Accept-Language', '') if request else '').lower()
        return obj.name_tr if lang.startswith('tr') else obj.name_en

    def get_display_description(self, obj):
        request = self.context.get('request')
        lang = (request.headers.get('Accept-Language', '') if request else '').lower()
        return obj.description_tr if lang.startswith('tr') else obj.description_en

# --- SEPET SERIALIZERS (SIRALAMA ÖNEMLİ) ---

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name_en')
    size_value = serializers.ReadOnlyField(source='size.size_value')
    current_price = serializers.ReadOnlyField(source='size.current_price')
    total_item_price = serializers.ReadOnlyField()
    product_thumbnail = serializers.ImageField(source='product.thumbnail', read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_name', 'product_thumbnail', 'size', 'size_value',
            'color', 'quantity', 'current_price', 'total_item_price'
        ]

class CartSerializer(serializers.ModelSerializer):
    # Sepetin içindeki tüm item'ları yukarıdaki serializer ile paketliyoruz
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'updated_at', 'is_completed']
        read_only_fields = ['user', 'is_completed']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name_tr', 'name_en', 'slug']


# --- SİPARİŞ SERIALIZERS ---

class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'size_value', 'price', 'quantity', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total', 'items', 'created_at', 'updated_at']
