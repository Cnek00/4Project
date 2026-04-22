# Backend API Reference - Complete

## 📌 Base Information

- **Backend URL**: `http://localhost:8000`
- **API Prefix**: `http://localhost:8000/api`
- **Django Admin**: `http://localhost:8000/admin`
- **Database**: PostgreSQL
- **Authentication**: JWT Bearer Token
- **CORS**: Enabled for localhost:5173

---

## 🔐 Authentication Endpoints

### POST `/token/`
Get JWT tokens (login)

**Request**:
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error** (401):
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### POST `/token/refresh/`
Refresh access token

**Request**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response** (200):
```json
{
  "access": "new_access_token_here"
}
```

---

### POST `/auth/registration/`
Register new user

**Request**:
```json
{
  "email": "newuser@example.com",
  "password1": "securepass123",
  "password2": "securepass123"
}
```

**Response** (201):
```json
{
  "access": "token...",
  "refresh": "token..."
}
```

**Error** (400):
```json
{
  "email": ["This field may not be blank."],
  "password1": ["This password is too short. It must contain at least 8 characters."]
}
```

---

## 📦 Product Endpoints

### GET `/store/products/`
List all visible products (paginated - 12 per page)

**Query Parameters**:
- `page` (int): Page number (default: 1)
- `search` (string): Search in name/description
- `category` (int): Filter by category ID

**Example**: `/store/products/?page=1&search=shoe&category=1`

**Response** (200):
```json
{
  "count": 48,
  "next": "http://localhost:8000/api/store/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "slug": "running-shoes",
      "name_tr": "Koşu Ayakkabısı",
      "name_en": "Running Shoes",
      "price": "99.99",
      "currency": "EUR",
      "thumbnail": "/media/products/thumbnails/shoe1.jpg",
      "view_count": 245,
      "favorite_count": 12,
      "category": 1,
      "display_name": "Running Shoes",
      "sizes": [
        {
          "id": 1,
          "size_value": 42,
          "stock": 15,
          "current_price": "99.99",
          "price_override": null
        },
        {
          "id": 2,
          "size_value": 43,
          "stock": 8,
          "current_price": "99.99",
          "price_override": null
        }
      ],
      "colors": [
        {
          "id": 1,
          "name": "Siyah",
          "hex_code": "#000000"
        },
        {
          "id": 2,
          "name": "Beyaz",
          "hex_code": "#FFFFFF"
        }
      ],
      "images": [
        {
          "id": 1,
          "image": "/media/products/gallery/shoe1_a.jpg",
          "order": 0
        },
        {
          "id": 2,
          "image": "/media/products/gallery/shoe1_b.jpg",
          "order": 1
        }
      ]
    }
  ]
}
```

**Headers**:
```
Accept-Language: tr  (returns name_tr, description_tr)
Accept-Language: en  (returns name_en, description_en)
```

---

### GET `/store/products/{id}/`
Get product details with 3D model

**Parameters**:
- `id` (int): Product ID

**Response** (200):
```json
{
  "id": 1,
  "slug": "running-shoes",
  "name_tr": "Koşu Ayakkabısı",
  "name_en": "Running Shoes",
  "description_tr": "Uzun açıklama...",
  "description_en": "Long description...",
  "price": "99.99",
  "currency": "EUR",
  "thumbnail": "/media/products/thumbnails/shoe1.jpg",
  "model_3d": "/media/products/models/shoe1.glb",
  "model_3d_poster": "/media/products/model_posters/shoe1_poster.jpg",
  "view_count": 246,
  "favorite_count": 12,
  "category": 1,
  "display_name": "Running Shoes",
  "display_description": "Long description in English...",
  "sizes": [...],
  "colors": [...],
  "images": [...]
}
```

**Error** (404):
```json
{
  "detail": "Not found."
}
```

---

## 🏷️ Category Endpoints

### GET `/store/categories/`
List all categories

**Response** (200):
```json
[
  {
    "id": 1,
    "name_tr": "Ayakkabılar",
    "name_en": "Shoes",
    "slug": "shoes"
  },
  {
    "id": 2,
    "name_tr": "Giyim",
    "name_en": "Clothing",
    "slug": "clothing"
  }
]
```

---

## 🛒 Cart Endpoints (Requires Authentication)

### GET `/store/cart/my_cart/`
Get current user's active cart

**Authentication**: Required (JWT Bearer Token)

**Response** (200):
```json
{
  "id": 1,
  "user": 1,
  "items": [
    {
      "id": 1,
      "product": 1,
      "product_name": "Running Shoes",
      "product_thumbnail": "/media/products/thumbnails/shoe1.jpg",
      "size": 1,
      "size_value": 42,
      "color": 1,
      "quantity": 2,
      "current_price": "99.99",
      "total_item_price": "199.98"
    },
    {
      "id": 2,
      "product": 2,
      "product_name": "T-Shirt",
      "product_thumbnail": "/media/products/thumbnails/tshirt.jpg",
      "size": 3,
      "size_value": "M",
      "color": 2,
      "quantity": 1,
      "current_price": "29.99",
      "total_item_price": "29.99"
    }
  ],
  "total_price": "229.97",
  "updated_at": "2024-04-12T10:30:00Z",
  "is_completed": false
}
```

**Error** (401):
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### POST `/store/cart/add_to_cart/`
Add product to cart (creates new cart if none exists)

**Request**:
```json
{
  "product_id": 1,
  "size_id": 1,
  "color_id": 1,
  "quantity": 2
}
```

**Response** (201): Same as GET my_cart

**Error** (400):
```json
{
  "error": "Yetersiz stok. Mevcut: 5"
}
```

---

### PATCH `/store/cart/items/{item_id}/quantity/`
Update cart item quantity

**Parameters**:
- `item_id` (int): Cart item ID

**Request**:
```json
{
  "quantity": 5
}
```

**Response** (200): Updated cart object

**Error** (400):
```json
{
  "error": "Stok yetersiz."
}
```

**Error** (404):
```json
{
  "error": "Ürün sepette bulunamadı."
}
```

---

### DELETE `/store/cart/items/{item_id}/`
Remove item from cart

**Parameters**:
- `item_id` (int): Cart item ID

**Response** (200): Updated cart object

---

### POST `/store/cart/apply_coupon/`
Apply coupon code to cart

**Request**:
```json
{
  "code": "SAVE20"
}
```

**Response** (200):
```json
{
  "id": 1,
  "user": 1,
  "items": [...],
  "total_price": "183.97",  // Discounted
  "coupon": {
    "code": "SAVE20",
    "discount_type": "percentage",
    "discount_value": "20"
  }
}
```

**Error** (400):
```json
{
  "error": "Bu kupon geçersiz veya süresi dolmuş."
}
```

**Error** (404):
```json
{
  "error": "Kupon kodu bulunamadı."
}
```

---

### POST `/store/cart/merge_cart/`
Merge localStorage cart with database cart (for guest checkout conversion)

**Request**:
```json
[
  {
    "product_id": 1,
    "size_id": 1,
    "color_id": 1,
    "quantity": 2
  },
  {
    "product_id": 2,
    "size_id": 3,
    "color_id": 2,
    "quantity": 1
  }
]
```

**Response** (200): Merged cart object

---

### POST `/store/cart/checkout/`
Complete purchase and create order

**Request**: (empty body)

**Response** (201):
```json
{
  "id": 5,
  "status": "pending",
  "total": "229.97",
  "items": [
    {
      "id": 1,
      "product_name": "Running Shoes",
      "size_value": 42,
      "price": "99.99",
      "quantity": 2,
      "line_total": "199.98"
    },
    {
      "id": 2,
      "product_name": "T-Shirt",
      "size_value": "M",
      "price": "29.99",
      "quantity": 1,
      "line_total": "29.99"
    }
  ],
  "created_at": "2024-04-12T11:00:00Z",
  "updated_at": "2024-04-12T11:00:00Z"
}
```

**Error** (400):
```json
{
  "error": "Sepetiniz boş."
}
```

---

## 📋 Order Endpoints (Requires Authentication)

### GET `/store/orders/`
List user's orders (paginated - 12 per page, newest first)

**Query Parameters**:
- `page` (int): Page number

**Response** (200):
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 5,
      "status": "delivered",
      "total": "229.97",
      "items": [
        {
          "id": 1,
          "product_name": "Running Shoes",
          "size_value": 42,
          "price": "99.99",
          "quantity": 2,
          "line_total": "199.98"
        }
      ],
      "created_at": "2024-04-12T11:00:00Z",
      "updated_at": "2024-04-12T15:30:00Z"
    },
    {
      "id": 4,
      "status": "shipped",
      "total": "59.98",
      "items": [...],
      "created_at": "2024-04-10T09:15:00Z",
      "updated_at": "2024-04-11T14:20:00Z"
    }
  ]
}
```

---

### GET `/store/orders/{id}/`
Get specific order details

**Parameters**:
- `id` (int): Order ID

**Response** (200): Single order object

**Error** (404):
```json
{
  "detail": "Not found."
}
```

---

## 💾 Database Reference

### Order Status Values
All status values are: `pending`, `processing`, `paid`, `shipped`, `delivered`, `return_request`, `return_accepted`, `returned`, `refunded`, `cancelled`

### Coupon Types
- `percentage`: Discount as percentage (0-100%)
- `amount`: Fixed amount discount

### Image URLs
All image fields return relative paths like `/media/products/thumbnails/...`

Full URL: `http://localhost:8000/media/products/thumbnails/...`

---

## 🔑 Header Examples

### Authentication Header
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Language Header
```
Accept-Language: tr    (Turkish)
Accept-Language: en    (English)
```

### Full Request Example
```
GET /api/store/products/1/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Accept-Language: tr
Content-Type: application/json
```

---

## ⚠️ Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PATCH/POST (non-creation) |
| 201 | Created | Successful POST (creation) |
| 400 | Bad Request | Invalid data or insufficient stock |
| 401 | Unauthorized | Missing/invalid JWT token |
| 404 | Not Found | Product/order doesn't exist |
| 500 | Server Error | Backend error (rare) |

---

## 🧪 Testing Workflow

### 1. Create User
```bash
curl -X POST http://localhost:8000/api/auth/registration/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password1":"testpass123","password2":"testpass123"}'
```

### 2. Get Tokens
Save the returned `access` and `refresh` tokens

### 3. List Products
```bash
curl http://localhost:8000/api/store/products/ \
  -H "Accept-Language: tr"
```

### 4. Add to Cart
```bash
curl -X POST http://localhost:8000/api/store/cart/add_to_cart/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"size_id":1,"color_id":1,"quantity":2}'
```

### 5. Checkout
```bash
curl -X POST http://localhost:8000/api/store/cart/checkout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Get Orders
```bash
curl http://localhost:8000/api/store/orders/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔗 Related Files

- Frontend: `/frontend/src/services/api.js`
- Backend Views: `/backend/store/views.py`
- Backend Models: `/backend/store/models.py`
- Backend Serializers: `/backend/store/serializers.py`
- Backend Admin: `/backend/store/admin.py`

---

**Last Updated**: 12 April 2026
