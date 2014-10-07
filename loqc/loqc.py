import webapp2
import jinja2
import json, time, logging, os, re
import linear_optics as lo
from fractions import Fraction

# Set up the templating engine
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=["jinja2.ext.autoescape"])

def pretty(x):
    return x

class MainPage(webapp2.RequestHandler):
    def get(self):
        """ Build the page and send it over """
        logging.info("Building the main page")
        template = JINJA_ENVIRONMENT.get_template("index.html")
        template_values={"gae_message": "templated by gae"}
        self.response.out.write(template.render(template_values))

class Simulate(webapp2.RequestHandler):
    def sanitize(self, circuit):
        """ Looks at the JSON and shifts everything to position zero """
        # Shift everything up and group
        top=min([c["pos"]["y"] for c in circuit])
        for c in circuit:
            c["pos"]["y"]+=-top

        sourceTypes={"sps", "bellpair"}
        detectorTypes={"bucket",}
        sources = filter(lambda x: x["type"] in sourceTypes, circuit)
        detectors = filter(lambda x: x["type"] in detectorTypes, circuit)
        waveguides = filter(lambda x: not x["type"] in sourceTypes|detectorTypes, circuit)
        return waveguides, sources, detectors
        
    def post(self):
        """ This is handles requests from the user and initiates a simulation """
        request = json.loads(self.request.body)
        circuit = request["circuit"]

        # Sanitize the request without contaminating the simulator
        waveguides, sources, detectors = self.sanitize(circuit)

        # Build a python object describing the circuit, state, patterns of interest
        circuit = lo.Circuit(waveguides)

        # Do the simulation
        decsv = lambda x: tuple(map(int, x.split(",")))
        state = {decsv(key):value for key, value in request["state"].items()}
        patterns = map(tuple, request["patterns"])
        data = lo.simulate(circuit, state, patterns)

        tidy = lambda key: ",".join(map(str, key))
        data = {tidy(key): pretty(value) for key, value in data.items()}

        output={"probabilities":data}
        output["maximum"]=max(data.values())

        # Send this data back to the user
        response=json.dumps(output, sort_keys=1)
        logging.info(response)
        self.response.out.write(response)

application = webapp2.WSGIApplication([
    ("/", MainPage),
    ("/simulate", Simulate),
], debug=True)

