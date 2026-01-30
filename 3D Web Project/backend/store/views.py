from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import Product, Category, Cart, CartItem, ProductSize, Coupon, Order, OrderItem
from .serializers import (
    ProductListSerializer, CartSerializer, CategorySerializer,
    OrderSerializer,
)


# --- ÜRÜN VE KATEGORİ VİEWLARI ---

class CategoryListView(generics.ListAPIView):
    """Kategorileri listeler"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductListView(generics.ListAPIView):
    """Görünür ürünleri listeler. Arama (search) ve kategori (category) filtresi destekler."""
    serializer_class = ProductListSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name_tr', 'name_en', 'description_tr', 'description_en']

    def get_queryset(self):
        qs = Product.objects.filter(is_visible=True).select_related('category').prefetch_related(
            'sizes', 'colors', 'images'
        )
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs


class ProductDetailView(generics.RetrieveAPIView):
    """Ürün detayını getirir"""
    queryset = Product.objects.all().select_related('category').prefetch_related(
        'sizes', 'colors', 'images'
    )
    serializer_class = ProductListSerializer
    lookup_field = 'id'

# --- SEPET (CART) VIEWSET ---

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Kullanıcının aktif (tamamlanmamış) sepetini döner (N+1 önlemi için prefetch)
        if self.request.user.is_authenticated:
            return Cart.objects.filter(
                user=self.request.user, is_completed=False
            ).prefetch_related('items__product', 'items__size', 'items__color')
        return Cart.objects.none()

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        """Aktif sepeti liste değil, tekil obje olarak döner (Frontend dostu)"""
        if not request.user.is_authenticated:
            return Response({"items": []}, status=200)
        cart, _ = Cart.objects.get_or_create(user=request.user, is_completed=False)
        cart = Cart.objects.prefetch_related(
            'items__product', 'items__size', 'items__color'
        ).get(pk=cart.pk)
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def add_to_cart(self, request):
        """Ürün ekleme ve miktar artırma (Stok kontrollü)"""
        if not request.user.is_authenticated:
            return Response({"error": "Sepeti kaydetmek için giriş yapmalısınız."}, status=401)

        product_id = request.data.get('product_id')
        size_id = request.data.get('size_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id)
            size = ProductSize.objects.get(id=size_id)

            if size.stock < quantity:
                return Response({"error": f"Yetersiz stok. Mevcut: {size.stock}"}, status=400)

            cart, _ = Cart.objects.get_or_create(user=request.user, is_completed=False)
            item = cart.add_item(product=product, size=size, quantity=quantity)

            return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    @action(detail=False, methods=['post'])
    def merge_cart(self, request):
        """LocalStorage sepetini DB ile birleştirir"""
        if not request.user.is_authenticated:
            return Response({"error": "Giriş yapmalısınız."}, status=401)

        local_items = request.data
        if not isinstance(local_items, list):
            return Response(
                {"error": "Geçersiz veri formatı. Liste bekleniyor."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart, _ = Cart.objects.get_or_create(user=request.user, is_completed=False)

        for item_data in local_items:
            try:
                product = Product.objects.get(id=item_data['product_id'])
                size = ProductSize.objects.get(id=item_data['size_id'])
                quantity = int(item_data['quantity'])

                if size.stock >= quantity:
                    cart.add_item(product=product, size=size, quantity=quantity)
            except:
                continue

        return Response(CartSerializer(cart).data, status=200)

    @action(detail=True, methods=['patch'])
    def update_quantity(self, request, pk=None):
        """Sepetteki öğenin miktarını günceller"""
        try:
            item = CartItem.objects.get(id=pk, cart__user=request.user)
            new_qty = int(request.data.get('quantity'))

            if item.size.stock < new_qty:
                return Response({"error": "Stok yetersiz."}, status=400)

            item.quantity = new_qty
            item.save()
            return Response(CartSerializer(item.cart).data)
        except CartItem.DoesNotExist:
            return Response({"error": "Ürün sepette bulunamadı."}, status=404)

    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        """Öğeyi sepetten tamamen siler"""
        try:
            item = CartItem.objects.get(id=pk, cart__user=request.user)
            cart = item.cart
            item.delete()
            return Response(CartSerializer(cart).data, status=200)
        except CartItem.DoesNotExist:
            return Response({"error": "Öğe bulunamadı."}, status=404)

    @action(detail=False, methods=['post'])
    def apply_coupon(self, request):
        """Kupon kodunu doğrular ve sepete uygular"""
        code = request.data.get('code')
        try:
            coupon = Coupon.objects.get(code=code)
            if not coupon.is_valid():
                return Response({"error": "Bu kupon geçersiz veya süresi dolmuş."}, status=400)

            cart, _ = Cart.objects.get_or_create(user=request.user, is_completed=False)
            cart.coupon = coupon
            cart.save()

            return Response(CartSerializer(cart).data, status=200)
        except Coupon.DoesNotExist:
            return Response({"error": "Kupon kodu bulunamadı."}, status=404)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Sepeti siparişe dönüştürür (Order + OrderItem snapshot)."""
        if not request.user.is_authenticated:
            return Response({"error": "Giriş yapmalısınız."}, status=401)

        cart = Cart.objects.prefetch_related(
            'items__product', 'items__size', 'items__color'
        ).filter(user=request.user, is_completed=False).first()

        if not cart or not cart.items.exists():
            return Response({"error": "Sepetiniz boş."}, status=400)

        total = cart.total_price
        order = Order.objects.create(user=request.user, total=total, coupon=cart.coupon, status='pending')

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name_en,
                size_value=item.size.size_value,
                price=item.size.current_price,
                quantity=item.quantity,
            )

        if cart.coupon and cart.coupon.is_valid():
            cart.coupon.used_count += 1
            cart.coupon.save()

        cart.is_completed = True
        cart.save()

        order = Order.objects.prefetch_related('items').get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


# --- SİPARİŞ VIEWSET ---

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Kullanıcının siparişlerini listeler / detay getirir."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Order.objects.filter(user=self.request.user).prefetch_related('items').order_by('-created_at')
        return Order.objects.none()