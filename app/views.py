from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt       
import json
import sys
import linear_optics as lo

# Create your views here.
def index(request):
    return render(request, "index.html", {})

@csrf_exempt
def simulate(request):
    request = json.loads(request.body)
    circuit = request["circuit"]
    minprob=0.00001

    # Build a python object describing the circuit, state, patterns of interest
    # TODO: if the request specifies state or patterns, then we just override here
    try:
        circuit = lo.compile(circuit)
        data = lo.simulate(**circuit).items()
        print "Number of terms:", len(data)
        sys.stdout.flush()
        data = filter(lambda x: x[1]>minprob, data)
        data.sort(key=lambda x: -x[1])
        maximum = data[0][1]
        output={"probabilities":data, "maximum":1 if maximum==0 else maximum}
    except ValueError:
        output={"warning": "No output"}
    except IndexError:
        output={"warning": "No output"}

    response=json.dumps(output)
    return HttpResponse(response, content_type="application/json")
