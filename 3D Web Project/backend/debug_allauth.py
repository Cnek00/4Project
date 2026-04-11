#!/usr/bin/env python
"""
Detailed allauth provider ve SocialApp debug
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.db import connection

def debug_allauth_issue():
    """Allauth'un göreceği verileri debug et"""
    
    print("=" * 60)
    print("Site ve ID")
    print("=" * 60)
    current_site = Site.objects.get_current()
    print(f"Current Site: {current_site.id} ({current_site.domain})")
    print()
    
    print("=" * 60)
    print("SocialApp SQL Query")
    print("=" * 60)
    
    # Allauth'un kullandığı exact query'yi simüle et
    provider = 'google'
    site = current_site
    
    # Direkt SQL sorgusuyla kontrol et
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT sa.id, sa.provider, sa.name, sa.client_id, COUNT(DISTINCT sass.site_id) as site_count
            FROM socialaccount_socialapp sa
            LEFT JOIN socialaccount_socialapp_sites sass ON sa.id = sass.socialapp_id
            WHERE sa.provider = %s
            GROUP BY sa.id, sa.provider, sa.name, sa.client_id
        """, [provider])
        
        rows = cursor.fetchall()
        print(f"Toplam Google SocialApp (SQL): {len(rows)}\n")
        
        for row in rows:
            print(f"  ID: {row[0]}")
            print(f"  Provider: {row[1]}")
            print(f"  Name: {row[2]}")
            print(f"  Client ID: {row[3][:50]}...")
            print(f"  Site Count: {row[4]}")
            print()
    
    # ORM aracılığıyla
    print("=" * 60)
    print("ORM Sorgusu")
    print("=" * 60)
    
    try:
        all_google = SocialApp.objects.filter(provider='google')
        print(f"✓ SocialApp.objects.filter(provider='google'): {all_google.count()}")
        
        for app in all_google:
            print(f"  - {app.id}: {app.name} (sites: {app.sites.count()})")
    except Exception as e:
        print(f"✗ Hata: {e}")
    
    # allauth'un kullandığı get_app metodunu test et
    print("\n" + "=" * 60)
    print("Allauth get_app Methodu Test")
    print("=" * 60)
    
    try:
        from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
        adapter = DefaultSocialAccountAdapter()
        
        app = adapter.get_app(None, 'google')
        print(f"✓ adapter.get_app(None, 'google'): {app.name}")
        print(f"  Client ID: {app.client_id[:50]}...")
    except Exception as e:
        print(f"✗ Hata (get_app): {type(e).__name__}: {e}")

if __name__ == '__main__':
    try:
        debug_allauth_issue()
    except Exception as e:
        print(f"✗ Fatal Hata: {e}")
        import traceback
        traceback.print_exc()
