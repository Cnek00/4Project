from django.contrib.auth.models import AbstractUser
from models import models


class User(AbstractUser):
    # Google'dan gelmeyen ama bize lazım olan ek bilgiler
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)  # Google profil fotosu linki için

    # Email'i login alanı yapalım (Google ile uyum için)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email