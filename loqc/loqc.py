import webapp2
import jinja2
import json, time, logging, os, re
import linear_optics as lo
from fractions import Fraction

# Set up the templating engine
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=["jinja2.ext.autoescape"])

class MainPage(webapp2.RequestHandler):
    def get(self):
        """ Build the page and send it over """
        logging.info("Building the main page")
        template = JINJA_ENVIRONMENT.get_template("index.html")
        template_values={"gae_message": "templated by gae"}
        self.response.out.write(template.render(template_values))

class Simulate(webapp2.RequestHandler):
    def post(self):
        """ This handles requests from the user and initiates a simulation """
        request = json.loads(self.request.body)
        circuit=request["circuit"]

        # Build a python object describing the circuit, state, patterns of interest
        # TODO: if the request specifies state or patterns, then we just override here
        try:
            circuit = lo.Circuit(circuit)
            data = circuit.simulate().items()
            data = filter(lambda x: x[1]>0, data)
            data.sort(key=lambda x: -x[1])
            maximum = data[0][1]
            output={"probabilities":data, "maximum":1 if maximum==0 else maximum}
        except ValueError:
            output={"warning": "No output"}
        except IndexError:
            output={"warning": "No output"}

        # Send this data back to the user
        response=json.dumps(output)
        self.response.out.write(response)

application = webapp2.WSGIApplication([
    ("/", MainPage),
    ("/simulate", Simulate),
], debug=True)

