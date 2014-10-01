import numpy as np
import json
from matplotlib.figure import Figure
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib import rc 

def json_no_unicode(data):
    ''' 
    Decode a JSON file into strings instead of unicodes.
    Usage: json.loads(data, object_hook=json_no_unicode)
    '''
    if isinstance(data, dict):
        return {json_no_unicode(key): json_no_unicode(value) for key, value in data.iteritems()}
    elif isinstance(data, list):
        return [json_no_unicode(element) for element in data]
    elif isinstance(data, unicode):
        return data.encode('utf-8')
    else:
        return data

class beamsplitter:
    def __init__(self, x, y, index, ratio=.5):
        ''' a splitter '''
        self.x=x
        self.y=y
        self.index=index
        self.set_splitting_ratio(ratio)
        
    def set_splitting_ratio(self, splitting_ratio):
        ''' change my degree of freedom '''
        self.splitting_ratio=splitting_ratio % 1
        
    def get_unitary(self):
        ''' get my unitary '''
        return np.matrix([[np.sqrt(self.splitting_ratio), 1j*np.sqrt(1-self.splitting_ratio)],[1j*np.sqrt(1-self.splitting_ratio), np.sqrt(self.splitting_ratio)]], dtype=complex)

        
class phaseshifter:
    def __init__(self, x, y, index, phase=0):
        ''' a splitter '''
        self.x=x
        self.y=y
        self.index=index
        self.set_phi(phase)
        
    def set_phi(self, phi):
        ''' change my degree of freedom '''
        self.phi=phi % (2*np.pi)
        
    def get_unitary(self):
        ''' get my unitary '''
        return np.matrix([[np.exp(1j*self.phi)]], dtype=complex)

        
class circuit:
    '''an linear-optical circuit'''
    def __init__(self, nmodes=None):
        self.nmodes = nmodes
        self.structure=[]
        self.phaseshifters=[]
        self.beamsplitters=[]
        self.input_modes=[]
        self.unitary=None

    def add_beamsplitter(self, x, y, splitting_ratio=.5):
        '''add a beamsplitter at position (x,y)'''
        bs=beamsplitter(x,y, len(self.beamsplitters), splitting_ratio)
        self.structure.append(bs)
        self.beamsplitters.append(bs)
        
    def add_phaseshifter(self, x, y, phase=0, invert=False):
        '''add a beamsplitter at position (x,y)'''
        ps=phaseshifter(x,y, len(self.phaseshifters), phase, invert)
        self.structure.append(ps)
        self.phaseshifters.append(ps)
        
    def set_phases(self, new_phases):
        ''' set the phases '''
        for shifter, phase in zip(self.phaseshifters, new_phases):  
            shifter.set_phi(phase)
        self.get_unitary()
   
    def set_splitting_ratios(self, new_splitting_ratios):
        ''' set the phases '''
        for splitter, splitting_ratio in zip(self.beamsplitters, new_splitting_ratios): 
            splitter.set_splitting_ratio(splitting_ratio)
        self.get_unitary()

    def get_unitary(self):
        ''' build the unitary '''
        #TODO: this can be optimized by generating columns	
        self.unitary=np.matrix(np.eye(self.nmodes), dtype=complex)
        for o in reversed(self.structure):
            u=np.matrix(np.eye(self.nmodes, dtype=complex))
            u[o.y:o.y+2, o.y:o.y+2]=o.get_unitary()
            self.unitary*=u
        return self.unitary
    
    def __str__(self):
        ''' make a string representing the beamsplitter network '''
        s='%d-mode linear-optical network\n' % (self.nmodes)
        s+='%d phase shifters | ' % len(self.phaseshifters)
        s+='%d beam splitters | ' % len(self.beamsplitters)
        s+='%d degrees of freedom\n' % (len(self.phaseshifters)+len(self.beamsplitters))

        for i, component in enumerate(self.structure):
            s+='  (#%d) %s\n' % (i, str(component))
        return s
