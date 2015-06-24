from django.test import TestCase
from bibble import views
from django.http import HttpRequest
import json


class APITestCase(TestCase):
    def setUp(self):
        pass

    def test_index(self):
        """ See that we can load the index """
        request = {}
        index = views.index(request)
        assert(len(index.content)>0)

    def test_mzi(self):
        """ See that we can simulate an MZI"""

        circuit = [ { "type" : "fockstate","x" : 0,"y" : 0,"n" : 1},
                    { "type" : "coupler","x" : 1,"y" : 0,"ratio" : 0.5},
                    { "type" : "phaseshifter","x" : 2,"y" : 0,"phase" : 0},
                    { "type" : "coupler","x" : 3,"y" : 0,"ratio" : 0.5}]

        postdata = {"circuit" : circuit,
                    "rules" : "",
                    "output_mode" : "probability"}

        request = {"body": json.dumps(postdata)}
        output = json.loads(views.simulate(request).content)
        
        #TODO: This sucks
        self.assertEqual(output["values"][0][1]["real"], 0.0)


