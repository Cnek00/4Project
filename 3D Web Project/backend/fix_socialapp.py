#!/usr/bin/env python
"""
Django SocialApp çift girişlerini temizlemek için script
Kullanım: python fix_socialapp.py
"""
import os
import django

# Django ayarlarını konfigüre et
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from allauth.socialaccount.models import SocialApp

def fix_google_socialapp():
    """Google SocialApp çift girişlerini temizle"""
    google_apps = SocialApp.objects.filter(provider='google')
    
    print(f"✓ Toplam Google SocialApp: {google_apps.count()}")
    
    if google_apps.count() == 0:
        print("⚠ Hiç Google SocialApp bulunamadı!")
        print("\nYeni bir Google SocialApp oluşturmanız gerekebilir:")
        print("  1. Django admin: http://127.0.0.1:8000/admin/")
        print("  2. Social applications bölümüne git")
        print("  3. 'Add Social Application' tıkla")
        print("  4. Provider: Google")
        print("  5. Name: Google")
        print('  6. Client ID: 878760251027-g7i6buk1e591dvkiv4krt77khec6e4ke.apps.googleusercontent.com')
        print("  7. Secret Key: (Google Cloud Console'dan al)")
        print("  8. Sites: example.com seç")
        return False
    
    if google_apps.count() > 1:
        print(f"⚠ {google_apps.count()} tane Google SocialApp bulundu!")
        print("\nMevccut SocialApp'lar:")
        for app in google_apps:
            print(f"  - ID: {app.id}, Name: {app.name}, Client ID: {app.client_id[:40]}...")
        
        # İlk hariç tüm kopyaları sil
        first_app = google_apps.first()
        duplicates = google_apps.exclude(id=first_app.id)
        
        print(f"\n→ İlk giriş tutulacak (ID: {first_app.id})")
        print(f"→ {duplicates.count()} tane silinecek:")
        
        for app in duplicates:
            print(f"   Siliniyor: ID {app.id} ({app.name})")
            app.delete()
        
        print("\n✓ Çift girişler başarıyla temizlendi!")
        print(f"✓ Kalan Google SocialApp: {SocialApp.objects.filter(provider='google').count()}")
        return True
    
    print("✓ Sorun yok, tek bir Google SocialApp mevcut!")
    app = google_apps.first()
    print(f"  - Name: {app.name}")
    print(f"  - Client ID: {app.client_id[:50]}...")
    print(f"  - Provider: {app.provider}")
    return True

if __name__ == '__main__':
    print("=" * 60)
    print("Google SocialApp Temizleme Aracı")
    print("=" * 60)
    try:
        success = fix_google_socialapp()
        if success:
            print("\nGüzel! /accounts/google/login/ sayfasını tekrar deneyin.")
    except Exception as e:
        print(f"\n✗ Hata oluştu: {e}")
        print("\nDjango admin aracılığıyla manuel olarak silebilirsiniz:")
        print("  1. http://127.0.0.1:8000/admin/ açın")
        print("  2. Social applications bölümüne gidin")
        print("  3. Çift Google entrilerini silin")
