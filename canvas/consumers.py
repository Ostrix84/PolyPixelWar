# consumers.py

import json
from channels.generic.websocket import WebsocketConsumer
from .models import Pixel

class PixelConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        data = json.loads(text_data)
        if 'get_pixels' in data:
            pixels = Pixel.objects.all().values('x', 'y', 'color')
            self.send(text_data=json.dumps(list(pixels)))
