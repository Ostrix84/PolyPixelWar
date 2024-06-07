# views.py

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Pixel
from django.utils import timezone
import json
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView
from datetime import timedelta

def home(request):
    return render(request, 'canvas/home.html')

@login_required(login_url='/accounts/login/')
def place_pixel(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        x = data['x']
        y = data['y']
        color = data['color']
        
        last_pixel = Pixel.objects.filter(user_id=request.user.id).order_by('-timestamp').first()
        if last_pixel and (timezone.now() - last_pixel.timestamp).total_seconds() < 5:
            return JsonResponse({'error': 'Vous devez attendre avant de placer un autre pixel.'}, status=403)

        Pixel.objects.update_or_create(x=x, y=y, defaults={'color': color, 'user': request.user, 'timestamp': timezone.now()})
        return JsonResponse({'status': 'success'})
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

def get_pixels(request):
    pixels = Pixel.objects.all().values('x', 'y', 'color')
    return JsonResponse(list(pixels), safe=False)

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/accounts/login')
        else:
            return render(request, 'registration/signup.html', {'form': form})
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})


def can_place_pixel(request):
    last_pixel = Pixel.objects.filter(user=request.user).order_by('-timestamp').first()
    if not last_pixel:
        return JsonResponse({'can_place_pixel': True})

    time_since_last_pixel = timezone.now() - last_pixel.timestamp
    if time_since_last_pixel >= timedelta(seconds=5):
        return JsonResponse({'can_place_pixel': True})
    else:
        next_allowed_placement = last_pixel.timestamp + timedelta(seconds=5)
        return JsonResponse({'can_place_pixel': False, 'next_allowed_placement': next_allowed_placement})