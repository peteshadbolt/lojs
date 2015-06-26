from django.test import TestCase
from lojs import views
from django.http import HttpRequest
import json

MZI =  [ { "type" : "fockstate", "x" : 0, "y" : 0, "n" : 1}, 
         { "type" : "coupler", "x" : 1, "y" : 0, "ratio" : 0.5}, 
         { "type" : "phaseshifter", "x" : 2, "y" : 0, "phase" : 0}, 
         { "type" : "coupler", "x" : 3, "y" : 0, "ratio" : 0.5}]

TWO_COUPLERS =  [ 
         { "type" : "fockstate", "x" : 0, "y" : 0,  "n" : 1}, 
         { "type" : "coupler", "x" : 1, "y" : 0,  "ratio" : 0.5}, 
         { "type" : "coupler", "x" : 2, "y" : 1,  "ratio" : 0.5}]

class IndexTestCase(TestCase):
    def setUp(self):
        pass
 
    def test_index(self):
        """ See that we can load the index """
        request = {}
        index = views.index(request)
        assert(len(index.content)>0)


class APITestCase(TestCase):
    def setUp(self):
        pass

    def test_no_nonzero(self):
        """ What happens when have an empty circuit ? """
        postdata = {"circuit" : []}
        request = {"body": json.dumps(postdata)}
        output = views.simulate(request)
        self.assertEqual(output.status_code, 400)

    def test_mzi(self):
        """ See that we can simulate an MZI"""
        postdata = {"circuit" : MZI, "format":"dict", "mode":"amplitude"}
        request = {"body": json.dumps(postdata)}
        output = json.loads(views.simulate(request).content)
        self.assertAlmostEqual(output["(1,)"]["imag"], 1)

    def test_ordering(self):
        """ See that we can simulate an MZI"""
        postdata = {"circuit" : TWO_COUPLERS, "format":"table", "mode":"probability"}
        request = {"body": json.dumps(postdata)}
        output = json.loads(views.simulate(request).content)
        assert all(output[i][1]>=output[i+1][1] for i in range(len(output)-1))

