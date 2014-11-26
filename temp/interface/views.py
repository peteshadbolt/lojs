from django.shortcuts import render
from django.http import HttpResponse
import numpy as np
from permanent import permanent

from .models import Greeting

# Create your views here.
def index(request):
    x=np.matrix(np.eye(50))
    p=(np.abs(permanent(x))**2).real
    return render(request, "index.html", {})


def db(request):

    greeting = Greeting()
    greeting.save()

    greetings = Greeting.objects.all()

    return render(request, 'db.html', {'greetings': greetings})

