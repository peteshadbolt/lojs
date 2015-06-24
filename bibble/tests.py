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
        print views.index(request)

    def test_mzi(self):
        """ See that we can simulate an MZI"""
        circuit = [{"type":"fockstate","x":-7,"y":0,"n":1},
                {"type":"coupler","x":-6,"y":0,"ratio":0.5},
                {"type" :"phaseshifter","x":-5,"y":1,"phase":0},
                {"type":"coupler","x":-4,"y":0,"ratio":0.5}]
        request = {"body": json.dumps({"circuit": circuit,"rules":"","output_mode" :"probability"})}
        output = views.simulate(request)
        self.assertEqual(output["probabilities"][(0, 1)], 1)


