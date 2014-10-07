"""
pete.shadbolt@gmail.com
This file provides a universal linear-optics simulator based on Ryser's formula for the permanent.
It depends on numpy.
If you need to go faster, there are accelerated libraries here: https://github.com/peteshadbolt/loqc-simulator
"""
import numpy as np
import itertools as it
from collections import defaultdict
from operator import mul

ftable=(1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800)
def factorial(n): return ftable[n]

def normalization(modes):
    """ Get the normalization constant """
    table=defaultdict(int)
    for mode in modes:
        table[mode]+=1
    return reduce(mul, (factorial(t) for t in table.values()))

def permanent(a):
    """ Calculated the permanent using Ryser"s formula. """
    n,n2=a.shape
    z=np.arange(n)
    irange=xrange(2**n)
    get_index=lambda i: (i & (1 << z)) != 0 
    get_term=lambda index: ((-1)**np.sum(index))*np.prod(np.sum(a[index,:], 0))
    indeces=map(get_index, irange) # Is this linear? If so we can do it with numpy directly
    terms=map(get_term, indeces) 
    return np.sum(terms)*((-1)**n)

class Component():
    """ A generic linear-optical component """
    def __init__(self, params):
        self.x=params["pos"]["x"]; self.y=params["pos"]["y"]

class Coupler(Component):
    """ A directional coupler """
    def __init__(self, params):
        Component.__init__(self, params)
        r=1j*np.sqrt(params["ratio"]); t=np.sqrt(1-params["ratio"])
        self.unitary=np.array([[t, r], [r, t]], dtype=complex)
        self.size=len(self.unitary)

class Crossing(Coupler):
    """ A crossing """
    def __init__(self, params):
        params["ratio"]=1
        Coupler.__init__(self, params)

class PhaseShifter(Component):
    """ A phase shifter """
    def __init__(self, params):
        Component.__init__(self, params)
        self.unitary=np.array([[np.exp(1j*params["phase"])]], dtype=complex)
        self.size=len(self.unitary)
        
class Circuit():
    """ A linear-optical circuit """
    def __init__(self, json):
        lookup={"coupler":Coupler, "phaseshifter":PhaseShifter, "crossing":Crossing}
        convert = lambda c: lookup[c["type"]](c)
        self.components = map(convert, json)
        self.components.sort(key=lambda c: c.x)
        self.d = max([c.y + c.size for c in self.components])
        self.computeUnitary();

    def computeUnitary(self):
        """ Get the linear-optical unitary, column-by-column"""
        self.unitary = np.eye(self.d, dtype=complex)
        for key, column in it.groupby(self.components, key=lambda c:c.x):
            cu = np.eye(self.d, dtype=complex)
            for component in column:
                p1=component.y; p2=component.y+component.size
                cu[p1:p2, p1:p2] = component.unitary
            self.unitary=np.dot(cu, self.unitary);


def simulate(circuit, input_state, patterns=[], mode="probability"): #TODO: patterns should probably be a set?
    """ Simulates a given circuit, for a given input state, looking at certain terms in the output state """
    output_state=defaultdict(complex)
    for cols, amplitude in input_state.items():
        cols=list(cols)
        n1=normalization(cols)
        for rows in patterns:
            n2=normalization(rows)
            perm=permanent(circuit.unitary[list(rows)][:,cols])
            output_state[rows]+=amplitude*perm/np.sqrt(n1*n2)

    if mode == "probability":
        for key, value in output_state.items():
            output_state[key]=np.abs(value)**2
        return output_state
    else:
        return output_state

if __name__=="__main__":
    """ Test out the simulator """
    state = {(0,): 1}
    circuitJSON={"components":[{"type":"coupler","pos":{"x":-1,"y":-1},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-1,"y":1},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-1,"y":3},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-2,"y":2},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":0,"y":2},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-2,"y":0},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-4,"y":0},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"phaseshifter","pos":{"x":-3,"y":1},"phase":0,"dimensions":{"x":1,"y":0}}]}
    circuit=Circuit(circuitJSON)
    patterns=map(tuple, [np.random.randint(0,6,10) for i in xrange(10)])
    output_state = simulate(circuit, state, patterns)
    print output_state

