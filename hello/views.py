from django.shortcuts import render
from django.http import HttpResponse
import numpy as np

from .models import Greeting

# Create your views here.
def index(request):
    x=np.zeros(100)
    return HttpResponse('Hello from Python %d!' % len(x))


def db(request):

    greeting = Greeting()
    greeting.save()

    greetings = Greeting.objects.all()

    return render(request, 'db.html', {'greetings': greetings})

