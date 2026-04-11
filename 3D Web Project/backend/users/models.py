from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # Google'dan gelmeyen ama bize lazım olan ek bilgiler
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)

    # Email'i login alanı yapalım
    email = models.EmailField(unique=True)
    
    # Username nullable yapalım, email'den generate edilecek
    username = models.CharField(
        max_length=150, 
        unique=True, 
        blank=True,
        null=True,
        help_text="Boş bırakılabilir, email'den generate edilir"
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email