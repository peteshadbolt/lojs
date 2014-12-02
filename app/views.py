from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt       
import json
import sys
import linear_optics as lo

class SizeError(Exception):
    pass

# Create your views here.
def index(request):
    return render(request, "index.html", {})

@csrf_exempt
def simulate(request):
    request = json.loads(request.body)
    circuit = request["circuit"]

    # Build a python object describing the circuit, state, patterns of interest
    # TODO: if the request specifies state or patterns, then we just override here
    try:
        circuit = lo.compile(circuit)
        nterms = len(circuit["patterns"])
        if nterms > 10000: raise SizeError()
        data = lo.simulate(**circuit).items()
        print "Number of terms:", nterms
        sys.stdout.flush()
        data.sort(key=lambda x: -x[1])
        maximum = max([x[1] for x in data])
        output={"probabilities":data, "maximum":1 if maximum==0 else maximum}
    except ValueError:
        output={"warning": "No output"}
    except IndexError:
        output={"warning": "No output"}
    except SizeError:
        message="Problem is too hard for web interface (%d terms).<br>" % nterms
        message+="Try using fewer detectors."
        output={"warning": message}


    response=json.dumps(output)
    return HttpResponse(response, content_type="application/json")
