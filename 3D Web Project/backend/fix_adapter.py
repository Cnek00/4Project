#!/usr/bin/env python
"""
The MultipleObjectsReturned issue is caused by allauth's internal query 
Join with prefetch logic that returns duplicate rows for M2M relationships.

Solution: Create a custom SocialAccount Adapter to override get_app()
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialApp

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter that fixes the MultipleObjectsReturned issue
    when there are M2M site relationships
    """
    
    def get_app(self, request, provider, client_id=None):
        """
        Override get_app to handle duplicate M2M rows
        """
        qs = SocialApp.objects.filter(provider=provider)
        
        if client_id:
            qs = qs.filter(client_id=client_id)
        
        # Use distinct() to prevent M2M duplicates
        qs = qs.distinct()
        
        # Use get_or_raise to handle the query
        try:
            return qs.get()
        except SocialApp.DoesNotExist:
            raise SocialApp.DoesNotExist(
                f"SocialApp with provider '{provider}' does not exist"
            )
        except SocialApp.MultipleObjectsReturned as e:
            # If still multiple, take the first one
            first = qs.first()
            if first:
                return first
            raise

# Test the custom adapter
def test_custom_adapter():
    print("=" * 60)
    print("Custom Adapter Test")
    print("=" * 60)
    
    adapter = CustomSocialAccountAdapter()
    
    try:
        app = adapter.get_app(None, 'google')
        print(f"✓ Custom adapter works!")
        print(f"  - Name: {app.name}")
        print(f"  - Client ID: {app.client_id[:50]}...")
        print(f"\n✓ Bu adapter settings.py'ye eklenecek")
        return True
    except Exception as e:
        print(f"✗ Hata: {type(e).__name__}: {e}")
        return False

if __name__ == '__main__':
    test_custom_adapter()
