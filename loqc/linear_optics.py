import numpy as np
import itertools as it
from collections import defaultdict

def permanent(a):
    ''' Calculated the permanent using Ryser's formula. '''
    n,n2=a.shape
    z=np.arange(n)
    irange=xrange(2**n)
    get_index=lambda i: (i & (1 << z)) != 0 
    get_term=lambda index: ((-1)**np.sum(index))*np.prod(np.sum(a[index,:], 0))
    indeces=map(get_index, irange) # Is this linear? If so we can do it with numpy directly
    terms=map(get_term, indeces) 
    return np.sum(terms)*((-1)**n)


def couplerUnitary(params):
    """ Unitary for a directional coupler """
    ratio=params["ratio"]
    return np.array([[np.sqrt(ratio), 1j*np.sqrt(1-ratio)], \
                      [1j*np.sqrt(1-ratio), np.sqrt(ratio)]], dtype=complex)


def phaseShifterUnitary(params):
    """ Unitary for a phase shifter """
    return np.array([[np.exp(1j*params["phase"])]], dtype=complex)


class Component():
    """ A generic linear-optical component """
    def __init__(self, params):
        self.type=params["type"]
        self.x=params["pos"]["x"]; self.y=params["pos"]["y"]
        lookup={"coupler": couplerUnitary, "phaseshifter": phaseShifterUnitary}
        self.unitary=lookup[self.type](params)
        self.size=len(self.unitary)

        
class Circuit():
    """ A linear-optical circuit """
    def __init__(self, json):
        self.components=map(Component, json["components"])
        self.components.sort(key=lambda c:c.x)
        top = min([c.y for c in self.components])
        bottom = max([c.y + c.size for c in self.components])
        self.d = bottom-top
        for c in self.components:
            c.y+=-top
        self.getUnitary();

    def getUnitary(self):
        """ Get the linear-optical unitary, column-by-column"""
        self.unitary = np.eye(self.d, dtype=complex)
        for key, column in it.groupby(self.components, key=lambda c:c.x):
            cu = np.eye(self.d, dtype=complex)
            for component in column:
                p1=component.y; p2=component.y+component.size
                cu[p1:p2, p1:p2] = component.unitary
            self.unitary=np.dot(self.unitary, cu);


def simulate(circuit, input_state, patterns=[], mode="probability"):
    """ Simulates a given circuit, for a given input state, looking at certain terms in the output state """
    output_state=defaultdict(int)
    for cols, amplitude in input_state.items():
        n1=1 #get_normalization_constant(cols)
        for rows in patterns:
            n2=1 #get_normalization_constant(rows)
            perm=permanent(circuit.unitary[list(rows)][:,list(cols)])
            output_state[rows]+=amplitude*perm/np.sqrt(n1*n2)
    return output_state

if __name__=='__main__':
    ''' Test out the simulator '''
    state = {(1,2,3): 1/np.sqrt(2), (3,4,5): 1/np.sqrt(2)}
    circuitJSON={"components":[{"type":"coupler","pos":{"x":-1,"y":-1},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-1,"y":1},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-1,"y":3},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-2,"y":2},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":0,"y":2},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-2,"y":0},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-4,"y":0},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"phaseshifter","pos":{"x":-3,"y":1},"phase":0,"dimensions":{"x":1,"y":0}}]}
    circuit=Circuit(circuitJSON)
    output_state = simulate(circuit, state, state.keys())
    print output_state
