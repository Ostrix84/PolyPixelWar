from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.views import LogoutView,LoginView




urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),  # Gestion des utilisateurs
    path('accounts/login/', LoginView.as_view(template_name='registration/login.html'), name='login'),
     path('accounts/logout/', LogoutView.as_view(), name='logout'),
    path('', include('canvas.urls')),
    

  
]
