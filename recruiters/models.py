from django.db import models
from django.contrib.auth.models import User


class Recruiter(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='recruiter_profile',
        null=True,
        blank=True
    )

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=100)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=100)

    def __str__(self):
        return self.name