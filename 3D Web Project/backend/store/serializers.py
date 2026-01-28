from rest_framework import serializers
from .models import Product, ProductSize


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['size', 'stock']


class ProductListSerializer(serializers.ModelSerializer):
    # Ürüne ait bedenleri ve stokları da içine gömelim
    sizes = ProductSizeSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'name_tr', 'name_en', 'price', 'currency',
            'thumbnail', 'view_count', 'favorite_count', 'sizes'
        ]