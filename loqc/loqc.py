import webapp2
import jinja2
import json, time, logging, os, re

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
        request=json.loads(self.request.body)
        logging.info(request["components"])
        response=json.dumps({"probabilities":[.5, .5]})
        self.response.out.write(response)

application = webapp2.WSGIApplication([
    ("/", MainPage),
], debug=True)

