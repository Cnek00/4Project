Dosya 1: README-handoff.md

# 3D Store — Handoff README

Bu dosya, projeyi başka bir asistana veya geliştiriciye devretmek için hazırlanmış teknik özetidir. Backend, frontend ve veritabanı mimarisi ayrı dosyalarda ayrıntılı anlatılır.

## Hızlı Bağlam
1. Proje adı: 3D Store
1. Amaç: Kullanıcıların ürünü satın almadan önce foto + 3D model ile evinde nasıl duracağını görmesini sağlamak
1. Slogan: “Ürünü almadan önce gör.”
1. Tasarım dili: Oceanic Depths & Form (dark) + aydınlık okyanus temalı light

## Depo Yapısı
1. Backend: /Users/cenkbelit/Documents/New project/4Project/3D Web Project/backend
1. Frontend: /Users/cenkbelit/Documents/New project/4Project/3D Web Project/frontend

## Başlatma
1. Backend sanal ortam ve paketler
1. python3 -m venv .venv
1. source .venv/bin/activate
1. pip install -r requirements.txt
1. Frontend
1. npm install
1. npm run dev

## Zorunlu ENV (Backend)
1. DB_NAME
1. DB_USER
1. DB_PASSWORD
1. DB_HOST
1. DB_PORT
1. DEBUG

## Handoff Dosyaları
1. backend-architecture.md
1. frontend-architecture.md
1. database-architecture.md
1. prompt.md

## Önemli Teknik Notlar
1. JWT + Google OAuth Allauth üzerinden çalışır
1. 3D model alanları: Product.model_3d, Product.model_3d_poster
1. Sepet ve checkout işlemleri transaction + stok kilitleme ile korunur
1. Dil desteği: TR/EN, Accept-Language header üzerinden
1. Tema: light/dark, site_theme localStorage, dark class ile aktif edilir
Dosya 2: backend-architecture.md

# Backend Architecture — 3D Store

## Teknoloji
1. Django 6.x
1. Django REST Framework
1. SimpleJWT
1. django-allauth + dj-rest-auth (Google OAuth)
1. PostgreSQL
1. python-decouple
1. django-cors-headers

## Temel Yapı
1. core
1. settings.py: ENV, CORS, JWT, OAuth, database
1. urls.py: API routing
1. views.py: Google OAuth sonrası JWT redirect
1. users
1. Custom User model, email ile login
1. store
1. Ürün, sepet, sipariş, kupon, kampanya, review

## Authentication Akışı
1. Email/şifre JWT
1. POST /api/token/
1. Refresh token: POST /api/token/refresh/
1. Google OAuth
1. /accounts/google/login/ -> callback
1. /api/auth/google-jwt-redirect/ JWT üretir, frontend callback URL’ine hash ile gönderir

## API Endpoints
1. Ürünler
1. GET /api/store/products/
1. GET /api/store/products/:id/
1. Kategoriler
1. GET /api/store/categories/
1. Sepet
1. GET /api/store/cart/my_cart/
1. POST /api/store/cart/add_to_cart/
1. PATCH /api/store/cart/items/:item_id/quantity/
1. DELETE /api/store/cart/items/:item_id/
1. POST /api/store/cart/apply_coupon/
1. POST /api/store/cart/checkout/
1. Siparişler
1. GET /api/store/orders/
1. GET /api/store/orders/:id/

## Önemli Business Logic
1. Checkout transaction.atomic ile çalışır
1. Stok select_for_update ile kilitlenir
1. Kupon kullanımı used_count ile takip edilir
1. CartItem için UniqueConstraint: cart, product, size, color

## Model Özetleri
1. Product
1. TR/EN isim ve açıklama
1. thumbnail, model_3d, model_3d_poster
1. is_visible, is_available
1. ProductSize
1. bedene göre stok + fiyat override
1. ProductColor
1. renk + hex
1. Cart, CartItem
1. Order, OrderItem
1. Coupon, Campaign

## ENV ve Config
1. DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
1. ALLOWED_HOSTS ve CORS_ALLOWED_ORIGINS env ile yönetilir
1. ACCOUNT_EMAIL_VERIFICATION default optional

## Output Formatları
1. Ürün listesinde display_name alanı Accept-Language’a göre döner
1. Ürün detayda display_description alanı döner

## Media
1. MEDIA_URL ve MEDIA_ROOT yapılandırılmış
1. 3D model dosyaları media altında servis edilir
Dosya 3: frontend-architecture.md

# Frontend Architecture — 3D Store

## Teknoloji
1. React 19 + Vite
1. React Router DOM
1. Axios
1. lucide-react ikon seti

## Routing
1. /
1. /product/:id
1. /cart
1. /login
1. /orders
1. /about
1. /auth/callback

## Context
1. ThemeContext
1. site_theme localStorage
1. document.documentElement.classList ile dark class
1. AuthContext
1. JWT tokenlar localStorage
1. Sepet sayısı my_cart üzerinden refresh edilir

## Dil Desteği
1. site_lang localStorage
1. Accept-Language header otomatik eklenir
1. About sayfası TR/EN copy içerir

## 3D Viewer
1. <model-viewer> web component
1. index.html içinde script yüklenir
1. ProductDetail’de toggle ile açılır

## Componentler
1. Navbar
1. Desktop nav + mobile hamburger
1. Tema ve dil toggle
1. ProductCard
1. Ürün kartı
1. About sayfası
1. TR/EN copy, vizyon, CTA

## Sayfa Özeti
1. Home
1. Hero + slogan + arama + kategori
1. ProductDetail
1. Görsel galeri + 3D viewer + beden/renk + CTA
1. Cart
1. Ürün listesi + kupon + checkout
1. Login
1. JWT + Google login
1. Orders
1. Sipariş listesi
1. AuthCallback
1. OAuth sonrası token kaydı

## Tasarım Dili
1. Oceanic Depths & Form dark teması
1. Light tema okyanus mavi + beyaz
1. CTA ve kartlarda premium yüzey

## API Entegrasyonu
1. src/services/api.js
1. Base URL: VITE_API_URL veya localhost
1. Refresh token interceptor aktif
Dosya 4: database-architecture.md

# Database Architecture — 3D Store

## Veritabanı
1. PostgreSQL
1. Django ORM kullanımı

## Ana Tablolar
1. users_user
1. email benzersiz
1. store_product
1. çok dilli isim + açıklama
1. thumbnail + model_3d + model_3d_poster
1. store_productimage
1. galeri görselleri
1. store_productsize
1. beden, stok, fiyat override, campaign FK
1. store_productcolor
1. renk + hex
1. store_cart
1. kullanıcıya bağlı aktif sepet
1. store_cartitem
1. cart, product, size, color ve quantity
1. store_order
1. kullanıcı siparişi
1. store_orderitem
1. sipariş snapshot item
1. store_coupon
1. kupon kodu ve kullanım limitleri
1. store_campaign
1. kampanya süresi ve indirim yüzdesi

## İlişkiler
1. Product -> Category: Many to One
1. Product -> ProductImage: One to Many
1. Product -> ProductSize: One to Many
1. Product -> ProductColor: One to Many
1. Cart -> CartItem: One to Many
1. Order -> OrderItem: One to Many
1. Coupon -> Cart / Order: Optional FK

## Constraint ve İş Kuralları
1. CartItem unique constraint: cart + product + size + color
1. Checkout sırasında stok select_for_update ile kilitlenir
1. Kupon kullanım sayısı kullanılanlarda artar

## Örnek Flow
1. Kullanıcı ürün seçer
1. CartItem eklenir
1. Checkout transaction başlar
1. Stok güncellenir
1. Order ve OrderItem snapshot yazılır

## Veri Formatı
1. Para değerleri DecimalField
1. Tarihler DateTimeField
1. Çok dil alanları name_tr, name_en, description_tr, description_en
Dosya 5: prompt.md

# Prompt — 3D Store (Clone Specification)

You are an AI developer. Build the exact project described below.

## Project Goal
1. Create a 3D e‑commerce site where users preview products via photo + 3D before buying.
1. Primary slogan: “Ürünü almadan önce gör.”
1. UX focus: discovery, rich visuals, and premium feel.

## Backend Stack
1. Django 6.x
1. Django REST Framework
1. SimpleJWT
1. django-allauth + dj-rest-auth
1. PostgreSQL
1. python-decouple
1. django-cors-headers

## Backend App Structure
1. core
1. settings.py with env‑based DB + CORS
1. urls.py for API routing
1. views.py with google_jwt_redirect
1. users
1. custom User model with email login
1. store
1. Product, ProductImage, ProductSize, ProductColor
1. Cart, CartItem
1. Order, OrderItem
1. Coupon, Campaign

## Core Models
1. Product
1. name_tr, name_en, description_tr, description_en
1. price, currency
1. thumbnail, model_3d, model_3d_poster
1. is_visible, is_available
1. ProductSize
1. size_value, stock, price_override, campaign
1. ProductColor
1. name, hex_code
1. CartItem unique constraint on cart, product, size, color
1. OrderItem snapshot of product name, size, price

## API Endpoints
1. GET /api/store/products/
1. GET /api/store/products/:id/
1. GET /api/store/categories/
1. GET /api/store/cart/my_cart/
1. POST /api/store/cart/add_to_cart/
1. PATCH /api/store/cart/items/:item_id/quantity/
1. DELETE /api/store/cart/items/:item_id/
1. POST /api/store/cart/apply_coupon/
1. POST /api/store/cart/checkout/
1. GET /api/store/orders/
1. GET /api/store/orders/:id/

## Auth
1. JWT auth via /api/token/ and /api/token/refresh/
1. Google OAuth login via allauth
1. Redirect to /api/auth/google-jwt-redirect/ that sends tokens to frontend hash

## Frontend Stack
1. React 19 + Vite
1. React Router DOM
1. Axios
1. lucide-react

## Frontend Pages
1. Home
1. Hero + slogan + search + category pills + product grid
1. Product Detail
1. Gallery + 3D toggle + sizes/colors + add to cart
1. Cart
1. Items list + coupon + checkout
1. Login
1. Email + Google login
1. Orders
1. List of orders
1. About
1. TR/EN copy about mission and design
1. Auth Callback
1. Save JWT from hash

## Theme
1. Light: white base + ocean blue accents
1. Dark: Oceanic Depths & Form
1. Global toggle with localStorage and dark class
1. TR/EN toggle with localStorage and Accept-Language header

## 3D Viewer
1. Use <model-viewer> web component
1. Load script in index.html
1. Toggle between photo and 3D in Product Detail

## Design Style
1. Oceanic gradients, glass cards, rounded corners
1. Premium typography
1. Mobile landscape must show 2 product cards per row

## File Locations
1. Backend: /backend
1. Frontend: /frontend
1. Use consistent file naming like in this spec
