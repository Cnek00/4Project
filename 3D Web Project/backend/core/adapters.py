"""
Custom allauth adapter to fix MultipleObjectsReturned error
that occurs due to M2M relationships with Django Sites
"""
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.models import SocialApp
import uuid


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Fixes the MultipleObjectsReturned exception when accessing
    Google OAuth due to M2M site relationships.
    """

    def get_app(self, request, provider, client_id=None):
        """
        Override to use distinct() on the queryset to handle
        duplicate rows from M2M prefetch relationships
        """
        qs = SocialApp.objects.filter(provider=provider)

        if client_id:
            qs = qs.filter(client_id=client_id)

        # distinct() prevents duplicate rows from M2M joins
        qs = qs.distinct()

        try:
            return qs.get()
        except SocialApp.DoesNotExist:
            raise SocialApp.DoesNotExist(
                f"SocialApp with provider '{provider}' does not exist"
            )
        except SocialApp.MultipleObjectsReturned:
            # Fallback: return first if still multiple (shouldn't happen)
            first = qs.first()
            if first:
                return first
            raise


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom adapter to auto-generate username from email
    """
    
    def save_user(self, request, sociallogin=None, form=None):
        """
        Override to auto-generate username from email
        """
        user = super().save_user(request, sociallogin, form)
        
        # Username'i email'in @ öncesi kısmından oluştur
        if not user.username:
            email_local = user.email.split('@')[0]
            # Eğer bu username zaten varsa, uuid ekle
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                if User.objects.filter(username=email_local).exists():
                    user.username = f"{email_local}_{uuid.uuid4().hex[:8]}"
                else:
                    user.username = email_local
            except Exception:
                user.username = f"{email_local}_{uuid.uuid4().hex[:8]}"
        
        user.save()
        return user

