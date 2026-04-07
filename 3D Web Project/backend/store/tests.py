from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Product, ProductSize, ProductColor, Cart, CartItem, Order, Coupon

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


def make_size(product, val='M', stock=10, override=None):
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


def make_coupon(code='TEST10', percentage=10, max_uses=100):
    expires = timezone.now() + timezone.timedelta(days=7)
    return Coupon.objects.create(
        code=code,
        discount_type='percentage',
        discount_value=Decimal(percentage),
        valid_from=timezone.now() - timezone.timedelta(days=1),
        valid_to=expires,
        usage_limit=max_uses,
        used_count=0,
        is_active=True,
    )


class CategoryListTests(TestCase):
    def test_category_list_returns_all_categories(self):
        make_category(slug='home')
        make_category(slug='office')

        response = self.client.get(reverse('category-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


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
        self.size = make_size(self.product, val='M', stock=10)

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
        self.size = make_size(self.product, val='L', stock=5)
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
        self.size = make_size(self.product, val='XL', stock=5)
        self.cart = Cart.objects.create(user=self.user, is_completed=False)
        self.item = CartItem.objects.create(cart=self.cart, product=self.product, size=self.size, quantity=1)

    def test_remove_item_from_cart(self):
        response = self.client.delete(reverse('cart-remove-item', kwargs={'item_id': self.item.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['items'], [])
