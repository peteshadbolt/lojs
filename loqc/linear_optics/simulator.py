import numpy as np
import itertools as it


def couplerUnitary(params):
    """ Unitary for a directional coupler """
    ratio=params["ratio"]
    return np.matrix([[np.sqrt(ratio), 1j*np.sqrt(1-ratio)], \
                      [1j*np.sqrt(1-ratio), np.sqrt(ratio)]], dtype=complex)


def phaseShifterUnitary(params):
    """ Unitary for a phase shifter """
    return np.matrix([[np.exp(1j*params["phase"])]], dtype=complex)


def getUnitary(component):
    """ Get the unitary operator for a component """
    lookup={"coupler": couplerUnitary, "phaseshifter": phaseShifterUnitary}
    return lookup[component["type"]](component)


def simulate(circuit, input_state, patterns=[], output="probability"):
    """ Simulates a given circuit, for a given input state, looking at certain terms in the output state """
    # Sort the components in the x-direction
    x = lambda c: c["pos"]["x"]
    components=sorted(circuit["components"], key=x)

    # Compute the number of optical modes
    y1 = lambda c: c["pos"]["y"]; y2 = lambda c: c["pos"]["y"] + c["dimensions"]["y"]
    d = max(map(y2, components)) - min(map(y1, components))

    # Generate the linear-optical unitary
    U = np.matrix(np.zeros((d,d), dtype=complex))
    for c in components:
        cu=getUnitary(c)


if __name__=='__main__':
    ''' Test out the simulator '''
    state = {(1,2,3): 1/np.sqrt(2), (4,5,6): 1/np.sqrt(2)}
    circuit={"components":[{"type":"coupler","pos":{"x":-1,"y":-1},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-1,"y":1},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-1,"y":3},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-2,"y":2},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":0,"y":2},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-2,"y":0},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"coupler","pos":{"x":-4,"y":0},"ratio":0.5,"dimensions":{"x":1,"y":1}},{"type":"phaseshifter","pos":{"x":-3,"y":1},"phase":0,"dimensions":{"x":1,"y":0}}]}
    simulate(circuit, state)
