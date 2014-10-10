import webapp2
import jinja2
import json, time, logging, os, re
import linear_optics as lo
from fractions import Fraction

# Set up the templating engine
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=["jinja2.ext.autoescape"])

def dtens(*terms):
    """ The tensor product, defined for states represented as sparse dicts """
    output=defaultdict(complex)
    for q in it.product(*(t.items() for t in terms)):
        keys, amps = zip(*q)
        output[tuple(sorted(sum(keys)))] = prod(amps)
    return output

class MainPage(webapp2.RequestHandler):
    def get(self):
        """ Build the page and send it over """
        logging.info("Building the main page")
        template = JINJA_ENVIRONMENT.get_template("index.html")
        template_values={"gae_message": "templated by gae"}
        self.response.out.write(template.render(template_values))

class Simulate(webapp2.RequestHandler):
    def getWaveguides(self, circuit):
        """ Seperate the different parts of the circuit """
        waveguideTypes = set(("coupler", "crossing", "phaseshifter"))
        waveguides = filter(lambda x: x["type"] in waveguideTypes, circuit)
        return waveguides

    def getState(self, circuit):
        """ Get a dictionary representing the state, starting from a list of sources """
        sourceTypes = set(("sps", "bellpair"))
        sources = filter(lambda x: x["type"] in sourceTypes, circuit)
        sources = [

    def getPatterns(self, detectors):
        """ Get a list of patterns of interest, starting from a list of detectors """
        detectorTypes = set(("bucket"))
        detectors = filter(lambda x: x["type"] in detectorTypes, circuit)

    def post(self):
        """ This handles requests from the user and initiates a simulation """
        request = json.loads(self.request.body)
        circuit=request["circuit"]

        # Build a python object describing the circuit, state, patterns of interest
        # TODO: if the request specifies state or patterns, then we just override here
        circuit = lo.Circuit(waveguides)
        state = self.getState(sources)
        patterns = self.getPatterns(detectors)

        response=json.dumps({}, sort_keys=1)
        return

        data = lo.simulate(circuit, state, patterns)
        tidy = lambda key: ",".join(map(str, key))
        data = {tidy(key): value for key, value in data.items()}

        if len(data)==0:
            output={"warning": "No output"}
        else:
            output={"probabilities":data, "maximum":max(data.values())}

        # Send this data back to the user
        response=json.dumps(output, sort_keys=1)
        self.response.out.write(response)

application = webapp2.WSGIApplication([
    ("/", MainPage),
    ("/simulate", Simulate),
], debug=True)

