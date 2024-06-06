from django.urls import path
from . import views
from .views import signup


urlpatterns = [
    path('', views.home, name='home'),
    path('place_pixel/', views.place_pixel, name='place_pixel'),
    path('get_pixels/', views.get_pixels, name='get_pixels'),
    path('accounts/signup/', signup, name='signup'),  # Ajoutez cette ligne pour l'URL d'inscription

]
