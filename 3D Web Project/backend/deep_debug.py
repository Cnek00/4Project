#!/usr/bin/env python
"""
Deep dive into the allauth MultipleObjectsReturned issue
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.db import connection

def find_root_cause():
    """allauth hatasının kaynağını bul"""
    
    print("=" * 60)
    print("Allauth adapter.get_app() hatasını debug etme")
    print("=" * 60)
    
    # Allauth'un internal get_app metodunu adım adım takip edelim
    from allauth.socialaccount import adapter
    
    # request, provider_id parametreleriyle get_app() çağırılıyor
    # provider_id = 'google'
    
    # Allauth kaynak kodu incelemesi:
    # get_app(self, request, provider, client_id=None)
    # Önce SocialAccount provider'ı load et
    
    from allauth.socialaccount.models import SocialApp
    
    provider_id = 'google'
    
    # allauth'un filter kullandığı exact query
    print(f"\n1. Provider ID: {provider_id}")
    
    # get_app içince yapılan query:
    # if client_id:
    #     filter = {'provider': provider, 'client_id': client_id}
    # else:
    #     filter = {'provider': provider}
    #     app = SocialApp.objects.get(**filter)
    
    print(f"\n2. SocialApp.objects.filter(provider='{provider_id}').count():")
    apps = SocialApp.objects.filter(provider=provider_id)
    print(f"   → {apps.count()}")
    
    # Belki get() kullanıldığında problem?
    print(f"\n3. SocialApp.objects.get(provider='{provider_id}'):")
    try:
        app = SocialApp.objects.get(provider=provider_id)
        print(f"   ✓ {app.name} (ID: {app.id})")
    except Exception as e:
        print(f"   ✗ {type(e).__name__}: {e}")
    
    # Allauth'un kullandığı distinct() ile mi?
    print(f"\n4. SocialApp.objects.filter(provider='{provider_id}').distinct():")
    try:
        apps = SocialApp.objects.filter(provider=provider_id).distinct()
        print(f"   ✓ {apps.count()}")
    except Exception as e:
        print(f"   ✗ {type(e).__name__}: {e}")
    
    # Sites M2M tablosu sorgusuyla kontrol et
    print(f"\n5. Sites M2M İlişkisini kontrol et:")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT sa.id, COUNT(*) as site_link_count
            FROM socialaccount_socialapp sa
            LEFT JOIN socialaccount_socialapp_sites sass ON sa.id = sass.socialapp_id
            WHERE sa.provider = %s
            GROUP BY sa.id
            HAVING COUNT(*) > 1
        """, [provider_id])
        
        rows = cursor.fetchall()
        if rows:
            print(f"   ⚠ Çoğul site bağlantısı bulundu:")
            for row in rows:
                print(f"   - SocialApp ID {row[0]}: {row[1]} site bağlantısı")
        else:
            print(f"   ✓ Çoğul site bağlantısı yok")
    
    # Raw SQL ile select başa dön
    print(f"\n6. Raw SQL - SocialApp seçimi:")
    with connection.cursor() as cursor:
        # Filter query'yi ekstra kontrol et
        cursor.execute("""
            SELECT DISTINCT sa.id, sa.provider, sa.name
            FROM socialaccount_socialapp sa
            WHERE sa.provider = %s
        """, [provider_id])
        
        rows = cursor.fetchall()
        print(f"   ✓ Distinct Count: {len(rows)}")
        for row in rows:
            print(f"     - ID {row[0]}: {row[2]}")
    
    # Allauth providers.get() ile kontrol
    print(f"\n7. Allauth providers registry yükle:")
    try:
        from allauth.socialaccount import providers as allauth_providers
        provider = allauth_providers.registry.by_id(provider_id)
        print(f"   ✓ Provider: {provider}")
        print(f"   - Name: {provider.name}")
    except Exception as e:
        print(f"   ✗ {type(e).__name__}: {e}")

if __name__ == '__main__':
    try:
        find_root_cause()
    except Exception as e:
        print(f"\n✗ Fatal Hata: {e}")
        import traceback
        traceback.print_exc()
