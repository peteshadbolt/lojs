from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import sys
import linear_optics as lo
import numpy as np


class SizeError(Exception):
    pass


def index(request):
    """ Just return the main page """
    return render(request, "index.html", {})


def serialize_to_dict(data):
    """ Serialize data to JSON """
    skey = lambda x: str(x)
    sim = lambda x: {"real": x.real, "imag": x.imag}
    return {skey(key): sim(value) for key, value in data.items()}

def serialize_to_table(data):
    """ Serialize data to a table """
    return [(key, value.real, value.imag) for key, value in data.items()]


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
    data = lo.simulate(**circuit)
    if len(data) == 0:
        return HttpResponse("No nonzero terms", status=400)

    # Serialize
    if format == "table":
        data = serialize_to_table(data)
    elif format == "dict":
        data = serialize_to_dict(data)
    response = json.dumps(data)

    return HttpResponse(response, content_type="application/json")

