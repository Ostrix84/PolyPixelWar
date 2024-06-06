from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Pixel(models.Model):
    x = models.PositiveIntegerField()
    y = models.PositiveIntegerField()
    color = models.CharField(max_length=7)  # Stocker les couleurs sous forme de codes hexadécimaux
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('x', 'y')
