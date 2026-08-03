# 3D Store

**"Ürünü almadan önce gör."** (See the product before buying.)

3D Store is a modern e-commerce platform that allows users to preview products in 3D before making a purchase. It features a premium design language (Oceanic Depths - dark/light theme) and a seamless shopping experience.

## Features
- **3D Product Previews:** Integrated `<model-viewer>` for interactive 3D product models.
- **Multi-language Support:** Turkish and English support based on user preference (`Accept-Language`).
- **Authentication:** JWT and Google OAuth integration via django-allauth.
- **E-commerce Capabilities:** Cart management, coupons, campaigns, and secure checkout with database-level stock locking.
- **Premium UI:** Glassmorphism, oceanic gradients, and a highly responsive layout.

## Tech Stack
- **Frontend:** React 19, Vite, React Router DOM, Axios, Lucide React
- **Backend:** Django 6.x, Django REST Framework, SimpleJWT, dj-rest-auth
- **Database:** PostgreSQL

## Project Structure
- `/backend`: Django REST API
- `/frontend`: React + Vite SPA
- `/3D Web Project`: Documentation and architectural planning files.

## Getting Started

### Backend Setup
1. Navigate to the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
