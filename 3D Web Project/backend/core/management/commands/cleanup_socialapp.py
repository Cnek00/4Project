from django.core.management.base import BaseCommand
from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    help = 'Fix duplicate Google SocialApp entries'

    def handle(self, *args, **options):
        # Google provider için tüm SocialApp'ları bul
        google_apps = SocialApp.objects.filter(provider='google')
        
        self.stdout.write(f"Toplam Google SocialApp: {google_apps.count()}")
        
        if google_apps.count() > 1:
            self.stdout.write("Çift girişler bulundu:")
            for app in google_apps:
                self.stdout.write(f"  ID: {app.id}, Name: {app.name}, Client ID: {app.client_id}")
            
            # İlk hariç tüm kopyaları sil
            first_app = google_apps.first()
            duplicates = google_apps.exclude(id=first_app.id)
            
            self.stdout.write(f"\n{duplicates.count()} tane silinecek:")
            for app in duplicates:
                self.stdout.write(f"  ID: {app.id}, Name: {app.name}")
                app.delete()
            
            self.stdout.write(self.style.SUCCESS('\nÇift girişler temizlendi!'))
            self.stdout.write(f"Kalan Google SocialApp: {SocialApp.objects.filter(provider='google').count()}")
        else:
            self.stdout.write("Çift giriş yok, sorun çözüldü!")
