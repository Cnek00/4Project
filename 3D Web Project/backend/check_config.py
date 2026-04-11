#!/usr/bin/env python
"""
Django Site ve SocialApp konfigürasyonunu kontrol et
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

def check_site_socialapp_config():
    """Site ve SocialApp konfigürasyonunu kontrol et"""
    
    print("=" * 60)
    print("Site Konfigürasyonu")
    print("=" * 60)
    
    sites = Site.objects.all()
    print(f"✓ Toplam Site: {sites.count()}\n")
    
    for site in sites:
        print(f"  ID: {site.id}")
        print(f"  Domain: {site.domain}")
        print(f"  Name: {site.name}")
        print()
    
    print("=" * 60)
    print("Google SocialApp Konfigürasyonu")
    print("=" * 60)
    
    google_apps = SocialApp.objects.filter(provider='google')
    
    if not google_apps.exists():
        print("✗ Google SocialApp bulunamadı!")
        return False
    
    for app in google_apps:
        print(f"✓ Name: {app.name}")
        print(f"  Provider: {app.provider}")
        print(f"  Client ID: {app.client_id[:50]}...")
        print(f"  Bağlı Sites ({app.sites.count()}):")
        
        for site in app.sites.all():
            print(f"    - ID: {site.id}, Domain: {site.domain}, Name: {site.name}")
        
        if app.sites.count() > 1:
            print("\n  ⚠ UYARI: Tek bir site seçilmesi gerekiyor!")
            print("  Django admin'den düzeltin:")
            print(f"    1. http://127.0.0.1:8000/admin/socialaccount/socialapp/{app.id}/change/")
            print("    2. 'Available sites' listesinden sadece birini seç")
            print("    3. Geri kalanını kaldır")
        elif app.sites.count() == 0:
            print("\n  ⚠ UYARI: SocialApp'a hiç site bağlı değil!")
            print("  Django admin'den düzeltin:")
            print(f"    1. http://127.0.0.1:8000/admin/socialaccount/socialapp/{app.id}/change/")
            print("    2. 'Available sites' listesinden example.com seç")
        else:
            print("\n  ✓ Konfigürasyon doğru görünüyor")
        print()
    
    return True

if __name__ == '__main__':
    try:
        check_site_socialapp_config()
    except Exception as e:
        print(f"✗ Hata: {e}")
        import traceback
        traceback.print_exc()
