import threading
from decimal import Decimal
from unittest import skipUnless

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import connection, connections
from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Cart,
    CartItem,
    Category,
    Coupon,
    Order,
    OrderItem,
    Product,
    ProductColor,
    ProductSize,
)

User = get_user_model()


def make_user(email='test@shop.com', password='Pass1234!'):
    return User.objects.create_user(username=email, email=email, password=password)


def jwt_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


def make_category(slug=None):
    if slug is None:
        import uuid
        slug = f'genel-{uuid.uuid4().hex[:8]}'
    return Category.objects.create(name_tr='Genel', name_en='General', slug=slug)


def make_product(category=None, name='Ürün', price='100.00', visible=True, available=True):
    if category is None:
        category = make_category()

    thumbnail = SimpleUploadedFile(
        name='thumb.png',
        content=b'\x89PNG\r\n\x1a\n',
        content_type='image/png',
    )

    return Product.objects.create(
        slug=name.lower().replace(' ', '-'),
        name_tr=name,
        name_en=f'{name} EN',
        description_tr='Deneme açıklama',
        description_en='Sample description',
        price=Decimal(price),
        currency='EUR',
        category=category,
        thumbnail=thumbnail,
        is_visible=visible,
        is_available=available,
    )


def make_size(product, val=40.0, stock=10, override=None):
    return ProductSize.objects.create(
        product=product,
        size_value=val,
        stock=stock,
        price_override=Decimal(override) if override is not None else None,
    )


def make_color(product, name='Siyah', hex_code='#000000'):
    return ProductColor.objects.create(product=product, name=name, hex_code=hex_code)


def get_list_data(response):
    if isinstance(response.data, dict) and 'results' in response.data:
        return response.data['results']
    return response.data


def make_coupon(
    code='TEST10',
    percentage=10,
    max_uses=100,
    discount_type='percentage',
    discount_value=None,
    used_count=0,
    active=True,
    valid_from=None,
    valid_to=None,
):
    now = timezone.now()
    if discount_value is None:
        discount_value = percentage
    return Coupon.objects.create(
        code=code,
        discount_type=discount_type,
        discount_value=Decimal(discount_value),
        valid_from=valid_from or (now - timezone.timedelta(days=1)),
        valid_to=valid_to or (now + timezone.timedelta(days=7)),
        usage_limit=max_uses,
        used_count=used_count,
        is_active=active,
    )


class CategoryListTests(TestCase):
    def test_category_list_returns_all_categories(self):
        make_category(slug='home')
        make_category(slug='office')

        response = self.client.get(reverse('category-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(get_list_data(response)), 2)


class ProductListTests(TestCase):
    def test_product_list_only_returns_visible_products(self):
        visible_product = make_product(name='Visible', visible=True)
        make_product(name='Hidden', visible=False)

        response = self.client.get(reverse('product-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_list_data(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], visible_product.id)

    def test_product_list_filters_by_category(self):
        category_a = make_category(slug='one')
        category_b = make_category(slug='two')
        product_a = make_product(name='A', category=category_a)
        make_product(name='B', category=category_b)

        response = self.client.get(reverse('product-list'), {'category': category_a.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_list_data(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], product_a.id)

    def test_product_list_searches_by_name(self):
        make_product(name='Blue Shoes')
        make_product(name='Red Shirt')

        response = self.client.get(reverse('product-list'), {'search': 'blue'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_list_data(response)
        self.assertEqual(len(results), 1)
        self.assertIn('Blue Shoes', results[0]['name_tr'])


class ProductDetailTests(TestCase):
    def test_product_detail_returns_product_data_and_increments_view_count(self):
        product = make_product(name='Detail')
        self.assertEqual(product.view_count, 0)

        response = self.client.get(reverse('product-detail', kwargs={'id': product.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], product.id)

        product.refresh_from_db()
        self.assertEqual(product.view_count, 1)


class MyCartTests(TestCase):
    def test_my_cart_returns_empty_for_unauthenticated_user(self):
        response = self.client.get(reverse('cart-my-cart'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('items'), [])

    def test_my_cart_returns_active_cart_for_authenticated_user(self):
        user = make_user()
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.get(reverse('cart-my-cart'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('items'), [])


class AddToCartTests(TestCase):
    def setUp(self):
        self.user = make_user()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.product = make_product(name='CartProd')
        self.size = make_size(self.product, val=40.0, stock=10)

    def test_add_to_cart_requires_authentication(self):
        anonymous = APIClient()
        response = anonymous.post(reverse('cart-add-to-cart'), {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': 1,
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_to_cart_creates_cart_item(self):
        response = self.client.post(reverse('cart-add-to-cart'), {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': 2,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 2)

    def test_add_to_cart_increases_quantity_for_existing_item(self):
        self.client.post(reverse('cart-add-to-cart'), {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': 1,
        })
        response = self.client.post(reverse('cart-add-to-cart'), {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': 2,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 3)

    def test_add_to_cart_blocks_when_stock_is_insufficient(self):
        self.size.stock = 1
        self.size.save()

        response = self.client.post(reverse('cart-add-to-cart'), {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': 2,
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Yetersiz stok', response.data.get('error', ''))


class UpdateQuantityTests(TestCase):
    def setUp(self):
        self.user = make_user()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.product = make_product(name='UpdateProd')
        self.size = make_size(self.product, val=42.0, stock=5)
        self.cart = Cart.objects.create(user=self.user, is_completed=False)
        self.item = CartItem.objects.create(cart=self.cart, product=self.product, size=self.size, quantity=1)

    def test_update_quantity_changes_item_count(self):
        response = self.client.patch(reverse('cart-update-quantity', kwargs={'item_id': self.item.id}), {'quantity': 3})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['items'][0]['quantity'], 3)

    def test_update_quantity_fails_for_too_large_amount(self):
        response = self.client.patch(reverse('cart-update-quantity', kwargs={'item_id': self.item.id}), {'quantity': 10})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Stok yetersiz', response.data.get('error', ''))


class RemoveItemTests(TestCase):
    def setUp(self):
        self.user = make_user()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.product = make_product(name='RemoveProd')
        self.size = make_size(self.product, val=44.0, stock=5)
        self.cart = Cart.objects.create(user=self.user, is_completed=False)
        self.item = CartItem.objects.create(cart=self.cart, product=self.product, size=self.size, quantity=1)

    def test_remove_item_from_cart(self):
        response = self.client.delete(reverse('cart-remove-item', kwargs={'item_id': self.item.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['items'], [])


class AddToCartStockAccumulationTests(TestCase):
    def setUp(self):
        self.user = make_user(email='accumulate@shop.com')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.product = make_product(name='AccumulateProd')
        self.size = make_size(self.product, val=41.0, stock=5)

    def test_repeated_adds_cannot_exceed_stock(self):
        first = self.client.post(reverse('cart-add-to-cart'), {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': 3,
        })
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        second = self.client.post(reverse('cart-add-to-cart'), {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': 3,
        })
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Yetersiz stok', second.data.get('error', ''))

        item = CartItem.objects.get(cart__user=self.user)
        self.assertEqual(item.quantity, 3)


class CouponTests(TestCase):
    def setUp(self):
        self.user = make_user(email='coupon@shop.com')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.product = make_product(name='CouponProd', price='100.00')
        self.size = make_size(self.product, val=42.0, stock=10)
        self.cart = Cart.objects.create(user=self.user, is_completed=False)
        self.item = CartItem.objects.create(
            cart=self.cart, product=self.product, size=self.size, quantity=2
        )

    def test_percentage_coupon_discounts_total(self):
        coupon = make_coupon(percentage=10)
        self.cart.coupon = coupon
        self.cart.save()
        self.assertEqual(self.cart.total_price, Decimal('180.00'))

    def test_fixed_amount_coupon_discounts_total(self):
        coupon = make_coupon(
            discount_type='amount', discount_value='25.00'
        )
        self.cart.coupon = coupon
        self.cart.save()
        self.assertEqual(self.cart.total_price, Decimal('175.00'))

    def test_discount_never_makes_total_negative(self):
        coupon = make_coupon(
            discount_type='amount', discount_value='999.00'
        )
        self.cart.coupon = coupon
        self.cart.save()
        self.assertEqual(self.cart.total_price, 0)

    def test_expired_coupon_is_not_applied(self):
        coupon = make_coupon(
            valid_from=timezone.now() - timezone.timedelta(days=10),
            valid_to=timezone.now() - timezone.timedelta(days=1),
        )
        self.cart.coupon = coupon
        self.cart.save()
        self.assertEqual(self.cart.total_price, Decimal('200.00'))

    def test_coupon_at_usage_limit_is_not_applied(self):
        coupon = make_coupon(max_uses=1, used_count=1)
        self.cart.coupon = coupon
        self.cart.save()
        self.assertEqual(self.cart.total_price, Decimal('200.00'))

    def test_apply_coupon_endpoint_sets_coupon(self):
        coupon = make_coupon(code='SAVE10', percentage=10)

        response = self.client.post(reverse('cart-apply-coupon'), {'code': 'SAVE10'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cart.refresh_from_db()
        self.assertEqual(self.cart.coupon_id, coupon.id)
        self.assertEqual(Decimal(response.data['total_price']), Decimal('180.00'))

    def test_apply_expired_coupon_is_rejected(self):
        make_coupon(
            code='OLD10',
            valid_to=timezone.now() - timezone.timedelta(days=1),
        )

        response = self.client.post(reverse('cart-apply-coupon'), {'code': 'OLD10'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_apply_unknown_coupon_returns_404(self):
        response = self.client.post(reverse('cart-apply-coupon'), {'code': 'NOPE'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CheckoutTests(TestCase):
    def setUp(self):
        self.user = make_user(email='checkout@shop.com')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.product = make_product(name='CheckoutProd', price='100.00')
        self.size = make_size(self.product, val=43.0, stock=5)
        self.cart = Cart.objects.create(user=self.user, is_completed=False)
        self.item = CartItem.objects.create(
            cart=self.cart, product=self.product, size=self.size, quantity=2
        )

    def test_checkout_creates_order_and_decrements_stock(self):
        response = self.client.post(reverse('cart-checkout'))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(user=self.user)
        self.assertEqual(order.total, Decimal('200.00'))
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.items.first().quantity, 2)

        self.size.refresh_from_db()
        self.assertEqual(self.size.stock, 3)

        self.cart.refresh_from_db()
        self.assertTrue(self.cart.is_completed)

    def test_checkout_snapshots_product_name_and_price(self):
        self.size.price_override = Decimal('80.00')
        self.size.save()

        response = self.client.post(reverse('cart-checkout'))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order_item = OrderItem.objects.get(order__user=self.user)
        self.assertEqual(order_item.product_name, self.product.name_en)
        self.assertEqual(order_item.size_value, 43.0)
        self.assertEqual(order_item.price, Decimal('80.00'))
        self.assertEqual(order_item.line_total, Decimal('160.00'))

    def test_checkout_with_insufficient_stock_creates_no_order(self):
        self.size.stock = 1
        self.size.save()

        response = self.client.post(reverse('cart-checkout'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Yetersiz stok', response.data.get('error', ''))
        self.assertEqual(Order.objects.count(), 0)
        self.cart.refresh_from_db()
        self.assertFalse(self.cart.is_completed)

    def test_checkout_with_empty_cart_is_rejected(self):
        self.item.delete()

        response = self.client.post(reverse('cart-checkout'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_checkout_requires_authentication(self):
        response = APIClient().post(reverse('cart-checkout'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_checkout_applies_coupon_and_increments_usage(self):
        coupon = make_coupon(percentage=10)
        self.cart.coupon = coupon
        self.cart.save()

        response = self.client.post(reverse('cart-checkout'))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        coupon.refresh_from_db()
        self.assertEqual(coupon.used_count, 1)
        order = Order.objects.get(user=self.user)
        self.assertEqual(order.total, Decimal('180.00'))

    def test_checkout_rejects_coupon_that_became_invalid(self):
        coupon = make_coupon(
            percentage=10,
            valid_to=timezone.now() - timezone.timedelta(days=1),
        )
        self.cart.coupon = coupon
        self.cart.save()

        response = self.client.post(reverse('cart-checkout'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_checkout_validates_total_stock_across_multiple_colours(self):
        red = make_color(self.product, name='Red', hex_code='#ff0000')
        blue = make_color(self.product, name='Blue', hex_code='#0000ff')
        self.item.delete()
        CartItem.objects.create(cart=self.cart, product=self.product, size=self.size, color=red, quantity=2)
        CartItem.objects.create(cart=self.cart, product=self.product, size=self.size, color=blue, quantity=2)
        self.size.stock = 3
        self.size.save()

        response = self.client.post(reverse('cart-checkout'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)
        self.size.refresh_from_db()
        self.assertEqual(self.size.stock, 3)


@skipUnless(connection.vendor == 'postgresql', 'PostgreSQL row locks are required for this test')
class ConcurrentCheckoutTests(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.product = make_product(name='LockedProd', price='100.00')
        self.size = make_size(self.product, val=44.0, stock=1)
        self.users = []
        for index in range(2):
            user = make_user(email=f'race-{index}@shop.com')
            cart = Cart.objects.create(user=user, is_completed=False)
            CartItem.objects.create(
                cart=cart, product=self.product, size=self.size, quantity=1
            )
            self.users.append(user)

    def _checkout(self, user, barrier):
        from django.db import close_old_connections
        close_old_connections()
        client = APIClient()
        client.force_authenticate(user=user)
        barrier.wait(timeout=10)
        try:
            return client.post(reverse('cart-checkout')).status_code
        finally:
            connections.close_all()

    def test_only_one_concurrent_checkout_wins_the_last_item(self):
        barrier = threading.Barrier(2)
        results = []
        lock = threading.Lock()

        def worker(user):
            status_code = self._checkout(user, barrier)
            with lock:
                results.append(status_code)

        threads = [threading.Thread(target=worker, args=(user,)) for user in self.users]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=20)

        self.assertEqual(sorted(results), [201, 400])
        self.assertEqual(Order.objects.count(), 1)
        self.size.refresh_from_db()
        self.assertEqual(self.size.stock, 0)
