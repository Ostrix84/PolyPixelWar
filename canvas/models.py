# models.py

from django.db import models
from django.contrib.auth.models import User

class Pixel(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    color = models.CharField(max_length=7)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pixel ({self.x}, {self.y}) - {self.color}"
