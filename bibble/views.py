from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt       
import json
import sys
import linear_optics as lo
import numpy as np

class SizeError(Exception):
    pass

# Create your views here.
def index(request):
    return render(request, "index.html", {})

def warning(text):
    return HttpResponse(json.dumps({"warning":text}), content_type="application/json")

@csrf_exempt
def simulate(request):
    request = json.loads(request["body"])

    circuit = request["circuit"]
    if len(circuit)==0: return warning("Empty circuit")
    rules = request["rules"]

    # Build a python object describing the circuit, state, patterns of interest
    circuit = lo.compile(circuit, rules)
    nterms = len(circuit["patterns"])

    if nterms > 10000: return warning("Too many terms")
    if nterms == 0: return warning("No terms match filter")

    data = lo.simulate(circuit["input_state"], circuit["unitary"], circuit["patterns"])
    data = data.items()
    data.sort(key=lambda x: -np.abs(x[1])**2)

    if len(data) == 0: return warning("No nonzero terms")

    maximum = max([np.abs(x[1])**2 for x in data])
    data = map(lambda x: (x[0], x[1]), data)
    output={"amplitudes":data, "maximum":1 if maximum==0 else maximum}

    response=json.dumps(output)
    return HttpResponse(response, content_type="application/json")
