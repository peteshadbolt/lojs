from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import sys
import linear_optics as lo
import numpy as np
from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from bibble.serializers import UserSerializer, GroupSerializer


class SizeError(Exception):
    pass


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class ComplexEncoder(json.JSONEncoder):
    """ Extends the json library to write complex numbers """
    def default(self, obj):
        if isinstance(obj, complex):
            return {"real": obj.real, "imag": obj.imag}
        return json.JSONEncoder.default(self, obj)


def index(request):
    """ Just return the main page """
    return render(request, "index.html", {})


def serialize_to_dict(data):
    """ Serialize data to JSON """
    return {str(key): value for key, value in data.items()}

def serialize_to_table(data):
    """ Serialize data to a table """
    probability = lambda (key, value): np.abs(value) ** 2
    table = sorted(data.items(), key=probability, reverse=True)
    return [(key, value) for key, value in table]


@csrf_exempt
def simulate(request):
    """ Simulates the given circuit """
    request = json.loads(request["body"])
    circuit = request.get("circuit", [])
    rules = request.get("rules", "")
    format = request.get("format", "table")

    # Build a python object describing the circuit, state, patterns of interest
    circuit = lo.compile(circuit, rules)
    nterms = len(circuit["patterns"])

    # Check for further 400 errors
    if nterms > 10000:
        return HttpResponse("Too many terms", status=400)
    elif nterms == 0:
        return HttpResponse("No matching terms", status=400)

    # Do the actual simulation
    if request.get("mode", "probability")=="probability":
        data = lo.get_probabilities(circuit["input_state"], circuit["unitary"], circuit["patterns"])
    else:
        data = lo.get_amplitudes(circuit["input_state"], circuit["unitary"], circuit["patterns"])

    if len(data) == 0:
        return HttpResponse("No nonzero terms", status=400)

    # Serialize
    if format == "table":
        data = serialize_to_table(data)
    elif format == "dict":
        data = serialize_to_dict(data)

    response = ComplexEncoder().encode(data)
    return HttpResponse(response, content_type="application/json")
