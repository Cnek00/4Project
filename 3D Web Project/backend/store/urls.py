from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductListView, CategoryListView, ProductDetailView, CartViewSet

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:id>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', include(router.urls)), # Sepet API'ları buraya bağlanır
]