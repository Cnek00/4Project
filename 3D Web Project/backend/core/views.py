"""
Google Allauth girişinden sonra JWT üretip frontend'e yönlendirir.
Böylece SPA (React) tarafında token'lar localStorage'a yazılabilir.
"""
from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth.decorators import login_required
from rest_framework_simplejwt.tokens import RefreshToken


@login_required
def google_jwt_redirect(request):
    """
    Google OAuth callback sonrası allauth bu URL'e yönlendirir.
    Giriş yapmış kullanıcı için JWT üretir ve frontend /auth/callback
    sayfasına hash ile token'ları gönderir.
    """
    user = request.user
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    refresh_str = str(refresh)

    frontend_url = getattr(
        settings,
        'FRONTEND_AUTH_CALLBACK_URL',
        'http://localhost:5173/auth/callback',
    ).rstrip('/')
    # Token'ları URL fragment (hash) ile gönderiyoruz; sunucu loglarına düşmez
    redirect_url = f"{frontend_url}#access={access}&refresh={refresh_str}"
    return redirect(redirect_url)
