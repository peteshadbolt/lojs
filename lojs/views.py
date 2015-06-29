import json
import linear_optics as lo
import numpy as np
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes

def index(request):
    """ Just return the main page """
    return render(request, "index.html", {})

@api_view(["POST"])
@authentication_classes([])
@permission_classes([])
def simulate(request):
    print "oi oi"
    return Response({"message", "hello world"})

