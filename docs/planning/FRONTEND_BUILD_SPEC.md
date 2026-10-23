# 3D Web Shop - Frontend Build Specification

## 📌 Overview

Bu dokümantasyon, **başka bir AI** tarafından frontend oluşturulması için gerekli tüm backend bilgilerini, API endpoint'lerini, database şemasını ve UI requirements'ları içermektedir.

**Stack**: React 18, React Router v6, Tailwind CSS, i18next, Axios, Lucide Icons

**Not**: Frontend'i kopyala-yapıştır yapabilir ve direkt çalıştırabilirsiniz.

---

## 🔑 API Configuration

### Base URL
```
http://localhost:8000/api  (Development)
```

### Authentication Method
- **JWT Bearer Token** stored in `localStorage`
- Keys: `access` (token), `refresh` (refresh token)
- Header: `Authorization: Bearer {access_token}`
- Auto-refresh on 401 response

### Request Headers
```
Content-Type: application/json
Accept-Language: tr  (or 'en')
Authorization: Bearer {token}
```

---

## 📍 API Endpoints

### 1. **Products**

#### GET `/api/products/`
List all visible products with optional filters
```javascript
// Query Parameters
?search=keyword
?category=1

// Response
{
  "count": 24,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "slug": "product-1",
      "name_tr": "Ürün 1",
      "name_en": "Product 1",
      "price": "99.99",
      "currency": "EUR",
      "thumbnail": "/media/products/thumbnails/...",
      "view_count": 150,
      "favorite_count": 23,
      "category": 1,
      "sizes": [
        {
          "id": 1,
          "size_value": 42,
          "stock": 10,
          "current_price": "99.99",
          "price_override": null
        }
      ],
      "colors": [
        {
          "id": 1,
          "name": "Kırmızı",
          "hex_code": "#FF0000"
        }
      ],
      "images": [
        {
          "id": 1,
          "image": "/media/products/gallery/...",
          "order": 0
        }
      ],
      "display_name": "Ürün 1 (based on Accept-Language)"
    }
  ]
}
```

#### GET `/api/products/{id}/`
Get product details with 3D model info
```javascript
// Response includes all above + 
{
  "description_tr": "Ürün açıklama",
  "description_en": "Product description",
  "model_3d": "/media/products/models/model.glb",
  "model_3d_poster": "/media/products/model_posters/poster.jpg",
  "display_description": "Description (based on Accept-Language)"
}
```

### 2. **Categories**

#### GET `/api/categories/`
List all categories
```javascript
// Response
[
  {
    "id": 1,
    "name_tr": "Ayakkabı",
    "name_en": "Shoes",
    "slug": "shoes"
  }
]
```

### 3. **Cart** (Requires Authentication)

#### GET `/api/cart/my_cart/`
Get current user's active cart
```javascript
// Response
{
  "id": 5,
  "user": 1,
  "items": [
    {
      "id": 1,
      "product": 1,
      "product_name": "Product 1",
      "product_thumbnail": "/media/products/thumbnails/...",
      "size": 1,
      "size_value": 42,
      "color": 1,
      "quantity": 2,
      "current_price": "99.99",
      "total_item_price": "199.98"
    }
  ],
  "total_price": "199.98",
  "updated_at": "2024-04-12T10:30:00Z",
  "is_completed": false
}
```

#### POST `/api/cart/add_to_cart/`
Add product to cart
```javascript
// Request
{
  "product_id": 1,
  "size_id": 1,
  "color_id": 1,  // optional
  "quantity": 2
}

// Response: Same as GET my_cart
// Error: 
{
  "error": "Yetersiz stok. Mevcut: 5"
}
```

#### PATCH `/api/cart/items/{item_id}/quantity/`
Update item quantity
```javascript
// Request
{
  "quantity": 3
}

// Response: Updated cart
```

#### DELETE `/api/cart/items/{item_id}/`
Remove item from cart
```javascript
// Response: Updated cart
```

#### POST `/api/cart/apply_coupon/`
Apply coupon code
```javascript
// Request
{
  "code": "SAVE20"
}

// Success Response: Updated cart with discount applied
// Error:
{
  "error": "Bu kupon geçersiz veya süresi dolmuş."
}
```

#### POST `/api/cart/checkout/`
Complete purchase and create order
```javascript
// Request: (empty body, uses current cart)

// Success Response (201):
{
  "id": 1,
  "status": "pending",
  "total": "199.98",
  "items": [
    {
      "id": 1,
      "product_name": "Product 1",
      "size_value": 42,
      "price": "99.99",
      "quantity": 2,
      "line_total": "199.98"
    }
  ],
  "created_at": "2024-04-12T10:35:00Z",
  "updated_at": "2024-04-12T10:35:00Z"
}

// Error:
{
  "error": "Sepetiniz boş."
}
```

#### POST `/api/cart/merge_cart/`
Merge localStorage cart with DB cart
```javascript
// Request (list of items)
[
  {
    "product_id": 1,
    "size_id": 1,
    "color_id": 1,
    "quantity": 2
  }
]

// Response: Merged cart
```

### 4. **Orders** (Requires Authentication)

#### GET `/api/orders/`
List user's orders (paginated, 12 per page)
```javascript
// Response
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "status": "delivered",  // or: pending, processing, paid, shipped, 
                              //     return_request, return_accepted, returned, 
                              //     refunded, cancelled
      "total": "299.97",
      "items": [
        {
          "id": 1,
          "product_name": "Product 1",
          "size_value": 42,
          "price": "99.99",
          "quantity": 3,
          "line_total": "299.97"
        }
      ],
      "created_at": "2024-04-10T15:20:00Z",
      "updated_at": "2024-04-12T10:35:00Z"
    }
  ]
}
```

#### GET `/api/orders/{id}/`
Get order details
```javascript
// Same structure as above single order
```

### 5. **Authentication** (via dj-rest-auth)

#### POST `/api/token/`
Login with email/password
```javascript
// Request
{
  "username": "user@example.com",
  "password": "password123"
}

// Response (200)
{
  "access": "eyJ0eXAiOiJKV1QiL...",
  "refresh": "eyJ0eXAiOiJKV1QiL..."
}

// Store both in localStorage
localStorage.setItem('access', data.access);
localStorage.setItem('refresh', data.refresh);
```

#### POST `/api/token/refresh/`
Refresh access token
```javascript
// Request
{
  "refresh": "refresh_token_value"
}

// Response
{
  "access": "new_access_token"
}
```

#### POST `/api/auth/registration/`
Register new user (via dj-rest-auth)
```javascript
// Request
{
  "email": "newuser@example.com",
  "password1": "securepass123",
  "password2": "securepass123"
}

// Response (201)
{
  "access": "token...",
  "refresh": "token..."
}
```

#### GET `/api/accounts/google/login/`
Google OAuth redirect endpoint
```
Redirect to: ${API_BASE}/api/accounts/google/login/
This triggers Google OAuth flow
```

#### POST `/api/auth/logout/`
Logout (optional, mainly localStorage cleanup)
```javascript
// Clear tokens from localStorage
localStorage.removeItem('access');
localStorage.removeItem('refresh');
```

---

## 📊 Database Schema & Models

### User (Django's Auth User)
```
- id (PK)
- username (email)
- email (unique)
- password (hashed)
- first_name
- last_name
- date_joined
- last_login
```

### Category
```
- id (PK)
- name_tr (string, 100)
- name_en (string, 100)
- slug (string, unique)
```

### Product
```
- id (PK)
- slug (string, unique)
- name_tr (string, 200)
- name_en (string, 200)
- description_tr (text)
- description_en (text)
- price (decimal, 10,2) - base price in EUR
- currency (string, default='EUR')
- category_id (FK -> Category)
- thumbnail (image)
- model_3d (file: .glb, .gltf, .usdz)
- model_3d_poster (image)
- is_visible (bool, default=True)
- is_available (bool, default=True)
- view_count (int)
- favorite_count (int)
- created_at (datetime)
```

### ProductImage
```
- id (PK)
- product_id (FK -> Product)
- image (image)
- order (int) - sorting order
```

### ProductColor
```
- id (PK)
- product_id (FK -> Product)
- name (string, 50) - e.g., "Kırmızı"
- hex_code (string, 7) - e.g., "#FF0000"
```

### ProductSize
```
- id (PK)
- product_id (FK -> Product)
- size_value (float) - e.g., 42 for shoe size
- stock (int)
- price_override (decimal, nullable) - if different from base price
- campaign_id (FK -> Campaign, nullable)
```

### Campaign (Discount campaigns)
```
- id (PK)
- name (string)
- discount_percentage (int, 0-100)
- start_date (datetime)
- end_date (datetime)
- is_active (bool)
```

### Coupon
```
- id (PK)
- code (string, unique, 20 chars max)
- discount_type (choice: 'percentage' | 'amount')
- discount_value (decimal)
- valid_from (datetime)
- valid_to (datetime)
- usage_limit (int)
- used_count (int)
- is_active (bool)
```

### Cart
```
- id (PK)
- user_id (FK -> User)
- coupon_id (FK -> Coupon, nullable)
- is_completed (bool, default=False)
- created_at (datetime)
- updated_at (datetime)
```

### CartItem
```
- id (PK)
- cart_id (FK -> Cart)
- product_id (FK -> Product)
- size_id (FK -> ProductSize)
- color_id (FK -> ProductColor, nullable)
- quantity (int, min=1)
- Constraint: unique(cart, product, size, color)
```

### Order
```
- id (PK)
- user_id (FK -> User)
- status (choice: pending | processing | paid | shipped | delivered | 
                 return_request | return_accepted | returned | refunded | cancelled)
- total (decimal, 12,2)
- coupon_id (FK -> Coupon, nullable)
- created_at (datetime)
- updated_at (datetime)
```

### OrderItem (snapshot from CartItem at checkout time)
```
- id (PK)
- order_id (FK -> Order)
- product_id (FK -> Product, nullable)
- product_name (string) - snapshot of product name
- size_value (float) - snapshot of size
- price (decimal) - snapshot of price at purchase time
- quantity (int)
```

---

## 🌐 Frontend i18n (Internationalization)

### Setup
- **Library**: i18next with react-i18next
- **Storage**: localStorage (key: 'i18next')
- **Fallback Language**: Turkish ('tr')
- **Detection Order**: localStorage → browser navigator

### Usage in Components
```jsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { i18n, t } = useTranslation();

  // Get translation
  const text = t('common.home');  // Returns "Anasayfa" or "Home"

  // Change language
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(nextLang);
  };

  // Get current language
  const currentLang = i18n.language;  // 'tr' or 'en'

  return (
    <div>
      <p>{text}</p>
      <button onClick={toggleLanguage}>
        {currentLang === 'tr' ? 'EN' : 'TR'}
      </button>
    </div>
  );
}
```

### Translation Keys Structure

All keys are under namespace `common` and organized by section:

#### **common** (Basic UI)
```
common.language
common.search
common.loading
common.error
common.success
common.cancel
common.save / common.delete / common.edit
common.back / common.next
common.home / common.shop / common.about
common.cart / common.orders / common.profile
common.login / common.logout / common.register
```

#### **home** (Home page)
```
home.title              → "Alışverişin üçüncü boyutu"
home.subtitle
home.clearFilters
home.categories / home.products
home.featured
home.newArrivals / home.bestsellers
home.noProducts
```

#### **product** (Product detail & cards)
```
product.selectSize / product.selectColor
product.price / product.quantity
product.addToCart
product.inStock / product.outOfStock
product.description / product.specifications
product.size / product.color
product.images / product.view3D
product.backToShop
product.addedToCart
product.loginToAdd
product.addError
```

#### **cart** (Shopping cart)
```
cart.empty
cart.continue (continue shopping)
cart.title
cart.subtotal / cart.discount / cart.total
cart.checkout
cart.applyCoupon / cart.coupon
cart.couponApplied / cart.couponInvalid
cart.remove
cart.quantity / cart.items
```

#### **orders** (Order history & status)
```
orders.title
orders.empty
orders.orderId / orders.date / orders.status / orders.amount
orders.view / orders.cancel / orders.return
orders.pending / orders.processing
orders.paid / orders.shipped / orders.delivered
orders.returnRequest / orders.returnAccepted
orders.returned / orders.refunded / orders.cancelled
```

#### **auth** (Authentication)
```
auth.email / auth.password / auth.confirmPassword
auth.login / auth.register
auth.noAccount / auth.haveAccount
auth.forgotPassword
auth.signUpGoogle / auth.loginGoogle
auth.error / auth.success / auth.registered
```

#### **about** (About page)
```
about.title
about.description
about.mission / about.vision
```

---

## 🛣️ Frontend Routes

```
/                    → Home (product listing)
/product/:id         → Product detail page
/cart                → Shopping cart
/orders              → Order history
/login               → Login page
/register            → Register page
/about               → About page
/auth/callback       → Google OAuth callback handler
/404 or *            → Not Found page
```

---

## 🎨 Frontend Component Structure

### Layout Components
- **Navbar** → Top navigation bar with logo, menu, language toggle
- **Footer** → Footer with links and copyright
- **Layout** → Main app wrapper with Navbar + Outlet + Footer

### Page Components
- **Home** → Product listing with category filters and search
- **ProductDetail** → Single product page with 3D model viewer
- **Cart** → Shopping cart management and checkout
- **Orders** → User's order history with status tracking
- **Login** → Email/password login + Google OAuth button
- **Register** → Email/password registration
- **About** → Company info page
- **NotFound** → 404 error page
- **AuthCallback** → OAuth callback handler (minimal UI)

### Reusable Components
- **ProductCard** → Product tile/card shown in listings
- **CartItem** → Individual cart item row
- **OrderItem** → Individual order item row
- **Modal/Dialog** (if needed) → Modals for confirmations

### Context (State Management)
- **AuthContext** → User authentication state, login/logout
- **ThemeContext** → Dark/light mode (optional)
- **CartContext** (optional) → Local cart state before DB sync

### Services
- **api.js** → Axios instance with interceptors
  - Export functions: `login()`, `register()`, `getCategories()`, etc.

---

## 📱 Styling

### Framework
- **Tailwind CSS** v3.4.5
- **Colors**: Indigo primary, gray neutral
- **Components**: Use utility classes (no component library)

### Key Classes Used
```
Spacing: gap-3, gap-4, p-4, p-6, mb-4, mt-2
Borders: rounded-xl, rounded-2xl
Colors: bg-indigo-600, text-indigo-600, bg-gray-50
Grid: grid, grid-cols-4, md:grid-cols-2
Flexbox: flex, flex-col, items-center, justify-center
Responsive: md:, lg:, sm:
Shadows: shadow, shadow-lg
```

### LEGO Design Principles
- Modular, interlocking components
- Consistent border-radius and spacing
- Cards that "stack" naturally
- Cohesive color palette
- Clear visual hierarchy

---

## 🔐 Authentication State Management

### AuthContext Structure
```jsx
{
  user: null | { id, email, first_name, last_name },
  isAuthenticated: boolean,
  isLoading: boolean,
  login: async (email, password) => {
    // POST /api/token/
    // Save tokens to localStorage
    // Update user state
  },
  register: async (email, password, passwordConfirm) => {
    // POST /api/auth/registration/
    // Save tokens to localStorage
    // Update user state
  },
  logout: () => {
    // Clear localStorage
    // Reset user state
  },
  loginWithTokens: (accessToken, refreshToken) => {
    // Direct token setting (for OAuth callback)
  }
}
```

### Protected Routes Pattern
```jsx
<Route 
  element={isAuthenticated ? <ProtectedComponent /> : <Navigate to="/login" />}
/>
```

---

## 🚀 API Service Functions (api.js)

```javascript
// Auth
export const login = (email, password) → Promise<{access, refresh}>
export const register = (email, password1, password2) → Promise<{access, refresh}>
export const logoutUser = () → Promise<void>

// Categories
export const getCategories = () → Promise<Category[]>

// Products
export const getProducts = (page=1, search='', categoryId=null) → Promise<ProductResponse>
export const getProductDetail = (id) → Promise<Product>

// Cart
export const getCart = () → Promise<Cart>
export const addToCart = (productId, sizeId, colorId, quantity) → Promise<Cart>
export const updateCartItemQuantity = (itemId, quantity) → Promise<Cart>
export const removeCartItem = (itemId) → Promise<Cart>
export const applyCoupon = (code) → Promise<Cart>
export const mergeCart = (items) → Promise<Cart>
export const checkout = () → Promise<Order>

// Orders
export const getOrders = (page=1) → Promise<OrderResponse>
export const getOrderDetail = (id) → Promise<Order>

// Images/Media (helper)
export const mediaUrl = (path) → string
```

---

## ⚙️ Environment Variables

### Frontend (.env in /frontend)
```
VITE_API_URL=http://127.0.0.1:8000
```

### Backend (.env in /backend)
```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=your_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
ACCOUNT_EMAIL_VERIFICATION=none
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 📦 Dependencies

### Frontend (package.json)
```json
{
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.13.4",
    "i18next": "^26.0.4",
    "i18next-browser-languagedetector": "^8.2.1",
    "i18next-http-backend": "^3.0.4",
    "lucide-react": "^0.563.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-i18next": "^17.0.2",
    "react-router-dom": "^7.13.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.1",
    "tailwindcss": "^3.4.5",
    "vite": "^7.2.4"
  }
}
```

### Backend (requirements.txt)
```
Django>=6.0,<7.0
djangorestframework>=3.14
django-allauth>=0.58
dj-rest-auth>=5.0
django-cors-headers>=4.0
djangorestframework-simplejwt>=5.2
python-decouple>=3.8
python-dotenv>=1.0
psycopg2-binary>=2.9
Pillow>=10.0
requests
cryptography
```

---

## 🎯 Frontend Implementation Checklist

### Core Setup
- [ ] React Router v6 with all routes configured
- [ ] i18next initialized with Turkish/English translations
- [ ] AuthContext with login/register/logout
- [ ] Axios instance with JWT interceptors
- [ ] Tailwind CSS configured
- [ ] Layout with Navbar + Footer

### Pages (8 total)
- [ ] **Home** - Product listing with category filter & search
- [ ] **ProductDetail** - Product info, 3D model, add to cart
- [ ] **Cart** - Show items, apply coupon, checkout button
- [ ] **Orders** - Order history with status colors
- [ ] **Login** - Email form + Google OAuth button
- [ ] **Register** - Registration form
- [ ] **About** - Company info
- [ ] **NotFound** - 404 page
- [ ] **AuthCallback** - OAuth redirect handler

### Features
- [ ] Full Turkish/English support (i18next)
- [ ] JWT authentication with token refresh
- [ ] Shopping cart (add/remove/update quantities)
- [ ] Coupon application
- [ ] Order checkout flow
- [ ] Product search & filtering by category
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Google OAuth login
- [ ] Language toggle (TR/EN)
- [ ] Order status display with color coding

### Status Colors (for Orders page)
- Green: `delivered`, `returned`
- Red: `cancelled`, `return_request`
- Blue: `refunded`, `paid`
- Amber/Yellow: `processing`, `pending`, `shipped`, `return_accepted`

---

## 🔗 Integration Points

### Image/Media Serving
Products have image URLs returned by API. Display them directly:
```jsx
<img src={product.thumbnail} alt={product.name_en} />
```

### 3D Model Display
Products with `model_3d` field have `.glb`, `.gltf`, or `.usdz` files.
Use a library like **Babylon.js**, **Three.js**, or **Spline** to render:
```jsx
// Example with Three.js
import { Canvas } from '@react-three/fiber';
<Canvas>
  <Model url={product.model_3d} />
</Canvas>
```

### Pagination
- Products list: 12 items per page (default from backend)
- Orders list: 12 items per page
- Use React Router or query params to handle page navigation

### Date Formatting
```javascript
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

---

## 🧪 Testing with Backend

### Start Backend
```bash
cd backend
source .venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Test User (if sample data loaded)
- Email: `test@example.com`
- Password: (check fixtures or Django admin)

### Django Admin
```
http://localhost:8000/admin
Username: admin
Password: (create with: python manage.py createsuperuser)
```

---

## 📝 Order Status Lifecycle

```
1. User creates order → status = "pending"
2. Admin processes → status = "processing"
3. Payment received → status = "paid"
4. Shipping → status = "shipped"
5. Delivered → status = "delivered" ✓ (SUCCESS)

OR

5. User requests return → status = "return_request"
6. Admin approves → status = "return_accepted"
7. Item returned → status = "returned"
8. Refund issued → status = "refunded"

OR

At any point → status = "cancelled"
```

---

## 🚨 Common Error Responses

```javascript
// 400 Bad Request
{ "error": "Yetersiz stok. Mevcut: 5" }
{ "error": "Geçersiz veri formatı." }

// 401 Unauthorized
{ "error": "Sepeti kaydetmek için giriş yapmalısınız." }
{ "detail": "Invalid token" }

// 404 Not Found
{ "error": "Ürün bulunamadı." }
{ "error": "Kupon kodu bulunamadı." }
```

---

## 💡 Tips for Implementation

1. **Store Layout in a Wrapper Component**
   - Navbar and Footer should wrap all pages using `<Outlet />`

2. **Handle Loading States**
   - Show spinners while fetching products or processing requests

3. **Cart Persistence**
   - Consider localStorage for temporary cart before user logs in
   - Merge with DB cart on login (`POST /api/cart/merge_cart/`)

4. **Image Optimization**
   - Use thumbnail for listings, larger image for detail view
   - Use `model_3d_poster` as fallback for 3D model preview

5. **Error Handling**
   - Always catch API errors and display user-friendly messages
   - Refresh token automatically on 401 (done in interceptor)

6. **Language Switching**
   - Store in localStorage automatically via i18next
   - No need to manually reload page (React re-renders)

7. **Mobile Responsive**
   - Use Tailwind responsive classes: `md:grid-cols-2`, `sm:text-sm`
   - Test on mobile devices

8. **Navigation Guards**
   - Protect `/cart` and `/orders` routes with auth check
   - Redirect unauthenticated users to `/login`

---

## 📞 Support

Bu spesifikasyon eksiksizdir ve şunları içerir:
- ✅ Tüm API endpoint'leri ve response formatları
- ✅ Database schema'sı
- ✅ i18n çeviriler ve kullanımı
- ✅ Routing yapısı
- ✅ Component yapısı
- ✅ Authentication flow
- ✅ Styling rehberi
- ✅ Tüm bağımlılıklar

**Frontend'i kopyala-yapıştır yapabilirsiniz.**

---

**Son Güncelleme**: 12 Nisan 2026
**Proje**: 3D Web Shop
**Backend Stack**: Django 6.0, DRF, PostgreSQL
**Frontend Stack**: React 18, React Router v6, Tailwind CSS, i18next
