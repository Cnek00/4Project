#!/usr/bin/env python
"""
Google OAuth debug script
"""
import os
import sys
import django
from django.conf import settings

# Django ayarlarını yükle
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site

def debug_oauth():
    print("=== Google OAuth Debug ===")

    # Site kontrolü
    try:
        site = Site.objects.get_current()
        print(f"Current site: {site.domain} (ID: {site.id})")
    except Exception as e:
        print(f"Site error: {e}")

    # SocialApp kontrolü
    try:
        google_apps = SocialApp.objects.filter(provider='google')
        print(f"Google SocialApps count: {google_apps.count()}")

        for app in google_apps:
            print(f"App: {app.name}")
            print(f"  Client ID: {app.client_id[:20]}...")
            print(f"  Sites: {[s.domain for s in app.sites.all()]}")
            print(f"  Provider: {app.provider}")

    except Exception as e:
        print(f"SocialApp error: {e}")

    # Environment variables
    print("\n=== Environment Variables ===")
    google_client_id = os.environ.get('GOOGLE_CLIENT_ID', 'NOT SET')
    google_client_secret = os.environ.get('GOOGLE_CLIENT_SECRET', 'NOT SET')

    print(f"GOOGLE_CLIENT_ID: {'SET' if google_client_id != 'NOT SET' else 'NOT SET'}")
    print(f"GOOGLE_CLIENT_SECRET: {'SET' if google_client_secret != 'NOT SET' else 'NOT SET'}")

    # Settings kontrolü
    print("\n=== Django Settings ===")
    print(f"DEBUG: {settings.DEBUG}")
    print(f"SECRET_KEY: {'SET' if settings.SECRET_KEY else 'NOT SET'}")

    # URLs
    print("\n=== URLs ===")
    from django.urls import reverse
    try:
        google_login_url = reverse('google_login')
        print(f"Google login URL: {google_login_url}")
    except Exception as e:
        print(f"URL reverse error: {e}")

if __name__ == '__main__':
    debug_oauth()