from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)

    # İleride buraya telefon no, avatar vb. ekleyebiliriz.
    # Şimdilik AbstractUser'dan gelen (username, password, first_name, last_name) yetiyor.

    def __str__(self):
        return self.username