import webapp2
import jinja2
import json, time, logging, os, re
#import linear_optics as lo

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

    def post(self):
        """ This is the main function which handles requests from the user and initiates a simulation """
        # Build a linear_optics style object describing the circuit
        request=json.loads(self.request.body)
        circuitJSON = request["circuit"]

        #circuit=lo.circuitFromJSON(circuitJSON);
        #logging.info(circuit);

        # Send the response back to the user
        response=json.dumps({"probabilities":[.5, .5]})
        self.response.out.write(response)

application = webapp2.WSGIApplication([
    ("/", MainPage),
], debug=True)

