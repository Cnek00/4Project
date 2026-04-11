#!/usr/bin/env python
"""
Test that Google OAuth login URL works without MultipleObjectsReturned error
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from allauth.socialaccount.adapter import get_adapter

def test_oauth():
    """Test the OAuth adapter"""
    print("=" * 60)
    print("Google OAuth Adapter Test")
    print("=" * 60)
    
    adapter = get_adapter()
    
    print(f"\n✓ Adapter türü: {type(adapter).__name__}")
    print(f"✓ Adapter modülü: {type(adapter).__module__}")
    
    # Test get_app()
    try:
        app = adapter.get_app(None, 'google')
        print(f"\n✓ Google SocialApp başarıyla yüklendi!")
        print(f"  - Name: {app.name}")
        print(f"  - Provider: {app.provider}")
        print(f"  - Client ID: {app.client_id[:50]}...")
        print(f"\n✓ OAuth akışı çalışmaya hazır!")
        return True
    except Exception as e:
        print(f"\n✗ Hata: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_oauth()
    if success:
        print("\n" + "=" * 60)
        print("Şimdi Django sunucusunu yeniden başlatın:")
        print("  $ python manage.py runserver")
        print("\nSonra Google login'i test edin:")
        print("  http://127.0.0.1:8000/accounts/google/login/")
        print("=" * 60)
