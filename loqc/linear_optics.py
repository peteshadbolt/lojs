""" pete.shadbolt@gmail.com This file provides a universal linear-optics simulator based on Ryser's formula for the permanent.  """
import numpy as np
import itertools as it
from collections import defaultdict
from operator import mul, add

ftable=(1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800)
def factorial(n): return ftable[n]

def normalization(modes):
    """ Compute the normalization constant """
    table=defaultdict(int)
    for mode in modes:
        table[mode]+=1
    return reduce(mul, (factorial(t) for t in table.values()))

def permanent(a):
    """ Calculated the permanent using Ryser"s formula. """
    n,n2=a.shape; z=np.arange(n); irange=xrange(2**n)
    get_index=lambda i: (i & (1 << z)) != 0 
    get_term=lambda index: ((-1)**np.sum(index))*np.prod(np.sum(a[index,:], 0))
    indeces=map(get_index, irange) # Is this linear? If so we can do it with numpy directly
    terms=map(get_term, indeces) 
    return np.sum(terms)*((-1)**n)

def dtens(*terms):
    """ The tensor product, defined for states represented as dicts """
    output=defaultdict(complex)
    for q in it.product(*(t.items() for t in terms)):
        keys, amps = zip(*q)
        newkey=tuple(sorted(reduce(add, keys)))
        output[newkey] = np.prod(amps)
    return output

class Component():
    def __init__(self, params):
        self.x=params["pos"]["x"]; self.y=params["pos"]["y"]
        self.unitary=self.state=self.pattern=None

class Coupler(Component):
    def __init__(self, params):
        Component.__init__(self, params)
        r=1j*np.sqrt(params["ratio"]); t=np.sqrt(1-params["ratio"])
        self.unitary=np.array([[t, r], [r, t]], dtype=complex)
        self.size=len(self.unitary)

class Crossing(Coupler):
    def __init__(self, params):
        params["ratio"]=1
        Coupler.__init__(self, params)

class PhaseShifter(Component):
    def __init__(self, params):
        Component.__init__(self, params)
        self.unitary=np.array([[np.exp(1j*params["phase"])]], dtype=complex)
        self.size=len(self.unitary)

class SPS(Component):
    def __init__(self, params):
        Component.__init__(self, params)
        self.state={(self.y,):1}
        self.size=1

class BellPair(Component):
    def __init__(self, params):
        Component.__init__(self, params)
        ir2=1/np.sqrt(2)
        self.state={(self.y, self.y+2):ir2, (self.y+1, self.y+3):ir2}
        self.size=4

class Bucket(Component):
    def __init__(self, params):
        Component.__init__(self, params)
        self.pattern=self.y
        self.size=1
        
class Circuit():
    """ A linear-optical circuit """
    def __init__(self, json):
        lookup={"coupler":Coupler, "phaseshifter":PhaseShifter, "crossing":Crossing, "bellpair":BellPair, "sps":SPS, "bucket":Bucket}
        convert = lambda c: lookup[c["type"]](c)
        self.components = map(convert, json)
        self.components.sort(key=lambda c: c.x)
        self.d = max([c.y + c.size for c in self.components])

    def computeUnitary(self):
        """ Get the linear-optical unitary, column-by-column"""
        self.unitary = np.eye(self.d, dtype=complex)
        for key, column in it.groupby(self.components, key=lambda c:c.x):
                cu = np.eye(self.d, dtype=complex)
                for component in filter(lambda c: c.unitary!=None, column):
                    p1=component.y; p2=component.y+component.size
                    cu[p1:p2, p1:p2] = component.unitary
                self.unitary=np.dot(cu, self.unitary);

    def computeState(self):
        """ Compute the input state vector """
        s=[c.state for c in self.components if c.state!=None]
        self.input_state = dtens(*s)
        self.nphotons=0 if len(self.input_state)==0 else len(self.input_state.keys()[0])

    def computePatterns(self):
        """ Compute the set of interesting detection patterns """
        p=[c.pattern for c in self.components if c.pattern!=None]
        self.patterns = list(it.combinations_with_replacement(p, self.nphotons))

    def simulate(self, mode="probability"): 
        """ Simulates a given circuit, for a given input state, looking at certain terms in the output state """
        self.computeUnitary(); self.computeState(); self.computePatterns();
        N=len(self.patterns)*len(self.input_state)
        print "Computing %d %dx%d permanents..." % (N, self.nphotons, self.nphotons)

        output_state=defaultdict(complex)
        for cols, amplitude in self.input_state.items():
            cols=list(cols)
            n1=normalization(cols)
            for rows in self.patterns:
                n2=normalization(rows)
                perm=permanent(self.unitary[list(rows)][:,cols])
                output_state[rows]+=amplitude*perm/np.sqrt(n1*n2)

        if mode == "probability":
            for key, value in output_state.items():
                output_state[key]=np.abs(value)**2
        return output_state




if __name__=="__main__":
    """ Test out the simulator """
    state = {(0,): 1}
    circuitJSON=[{"type":"bellpair","pos":{"x":-8,"y":0}},{"type":"sps","pos":{"x":-8,"y":5}},{"type":"crossing","pos":{"x":-7,"y":0}},{"type":"coupler","pos":{"x":-5,"y":1},"ratio":0.5},{"type":"crossing","pos":{"x":-3,"y":2}},{"type":"crossing","pos":{"x":-1,"y":4}},{"type":"bucket","pos":{"x":0,"y":0}},{"type":"bucket","pos":{"x":0,"y":2}},{"type":"bucket","pos":{"x":0,"y":4}}] 
    circuit=Circuit(circuitJSON)
    output_state = circuit.simulate()
    print output_state

