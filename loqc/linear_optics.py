import numpy as np
import itertools as it


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
        bottom = max([c.y+c.size for c in self.components])
        self.d = bottom-top
        for c in self.components:
            c.y+=-top

    def getUnitary(self):
        """ Get the linear-optical unitary, column-by-column"""
        self.unitary = np.eye(self.d, dtype=complex)
        for key, column in it.groupby(self.components, key=lambda c:c.x):
            cu = np.eye(self.d, dtype=complex)
            for component in column:
                p1=component.y; p2=component.y+component.size
                cu[p1:p2, p1:p2] = component.unitary
            self.unitary=np.dot(self.unitary, cu);

        return self.unitary


def simulate(circuit, input_state, patterns=[], output="probability"):
    """ Simulates a given circuit, for a given input state, looking at certain terms in the output state """
    lou = circuit.getUnitary()
    print lou.round(2)

if __name__=='__main__':
    ''' Test out the simulator '''
    state = {(1,2,3): 1/np.sqrt(2), (4,5,6): 1/np.sqrt(2)}
    circuitJSON={"components":[{"type":"coupler","pos":{"x":-1,"y":-1},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-1,"y":1},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-1,"y":3},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-2,"y":2},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":0,"y":2},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-2,"y":0},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-4,"y":0},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"phaseshifter","pos":{"x":-3,"y":1},"phase":0,"dimensions":{"x":1,"y":0}}]}
    circuit=Circuit(circuitJSON)
    simulate(circuit, state)
