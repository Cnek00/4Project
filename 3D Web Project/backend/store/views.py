from rest_framework import generics
from .models import Product
from .serializers import ProductListSerializer

# İsmin tam olarak bu olduğundan emin ol: ProductListView
class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer

    def get_queryset(self):
        # Filtreleme mantığı: Görünür, mevcut ve en az 1 bedeni stokta olanlar
        return Product.objects.filter(
            is_visible=True,
            is_available=True,
            sizes__stock__gt=0
        ).distinct()