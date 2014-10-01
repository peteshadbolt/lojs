import numpy as np
import itertools as it
import perm as permanent
import combi as combinadics
import progressbar as pb

def dict_to_sorted_numpy(data):
    ''' Convert a dictionary to a sorted numpy array '''
    N=len(data.keys()[0])
    sorted_data=sorted(data.items(), key=lambda pair:pair[0])
    structure=[('labels', int, (N,)), ('counts', float)]
    return np.array(sorted_data, dtype=structure)

def ket(term): return '|%s>' % (''.join(map(str, term)))

class state:
    def __init__(self, basis):
        self.nphotons=basis.nphotons
        self.nmodes=basis.nmodes
        self.basis=basis
        self.iterator_index=0

        # A list of indeces of nonzero terms in the state vector
        self.nonzero_terms=set()
        self.vector={}#np.zeros(self.basis.hilbert_space_dimension, dtype=complex)

    def add(self, probability_amplitude, label):
        ''' add a term '''
        self[label]+=probability_amplitude

    def add_by_index(self, probability_amplitude, index):
        ''' add a term '''
        self[label]+=probability_amplitude
    
    def __len__(self):
        ''' Just returns the number of nonzero terms'''
        return len(self.nonzero_terms)

    def __getitem__(self, key):
        ''' Allow basic square-bracket indexing '''
        try:
            key=self.basis[tuple(key)]
            return self.vector[key] if key in self.vector else 0
        except TypeError:
            return self.vector[key] if key in self.vector else 0

    def __setitem__(self, key, value):
        ''' Allow basic square-bracket indexing '''
        try:
            index=self.basis[tuple(key)]
            self.nonzero_terms.add(index)
            self.vector[index]=value
        except TypeError:
            self.nonzero_terms.add(key)
            self.vector[key]=value

    def __str__(self):
        s=''
        if len(self.nonzero_terms)==0: s+='No nonzero terms in this state'
        st=sorted(self.nonzero_terms)
        for index in st:
            a=self.vector[index]
            s+='%.2f + %.2fi  ' % (a.real, a.imag)
            if self.nphotons<10: s+='  ('+ket(self.basis.modes_from_index(index))+')'
            s+='\n'
        return s


class basis:
    def __init__(self, nphotons, nmodes):
        ''' A fast basis for P photons in M modes '''
        self.nphotons=nphotons
        self.nmodes=nmodes
        self.hilbert_space_dimension=combinadics.choose(self.nphotons+self.nmodes-1, self.nphotons)
        self.iterator_index=0

    def get_state(self, starter=None):
        ''' Get a new state in this basis '''
        new_state=state(self)
        if starter!=None: new_state.add(1, starter)
        return new_state

    def modes_from_index(self, index):
        ''' Given an index, return the modes that the photons are in '''
        return combinadics.from_index(index, self.nphotons, self.nmodes)

    def modes_to_index(self, modes):
        ''' Given a list of modes, return the index of that term '''
        return combinadics.to_index(modes, self.nphotons, self.nmodes)

    def get_normalization_constant(self, modes):
        ''' Given an index, return the normalization constant '''
        return combinadics.get_normalization(modes)

    ######## BOILERPLATE ########

    def __str__(self):
        s='Basis of %d photons in %d modes, ' % (self.nphotons, self.nmodes)
        s+='Hilbert space dimension: %d\n' % self.hilbert_space_dimension
        if self.hilbert_space_dimension<200:
           s+='\n'.join([str(index)+'\t - \t '+ket(modes) for index, modes in self])
        return s

    def __len__(self):
        ''' Number of elements in the basis '''
        return self.hilbert_space_dimension

    def __getitem__(self, key):
        ''' Allow basic square-bracket indexing '''
        if isinstance(key, int):
            if key<0: key+=self.hilbert_space_dimension
            if key>=self.hilbert_space_dimension: raise IndexError, 'The index (%d) is out of range' % key
            return self.modes_from_index(key)
        elif isinstance(key, list) or isinstance(key, tuple):
            return self.modes_to_index(key)
        else:
            raise TypeError, 'Invalid basis index'

    def __iter__(self): return self
    def next(self):
        ''' Allow use as an iterator (for index, modes in basis)'''
        if self.iterator_index < self.hilbert_space_dimension:
            cur, self.iterator_index = self.iterator_index, self.iterator_index+1
            return cur, self.modes_from_index(cur)
        else:
            self.iterator_index=0
            raise StopIteration()



class simulator:
    ''' Get states and statistics from a device '''
    def __init__(self, device, new_basis=None, nphotons=None):
        self.device=device
        if new_basis==None:
            self.basis=basis(nphotons, device.nmodes)
        else:
            self.basis=new_basis
        self.nmodes=self.basis.nmodes
        self.nphotons=self.basis.nphotons
        self.visibility=1.0
        self.set_mode('quantum')

    def set_visibility(self, new_visibility):
        ''' Set the visibility of quantum interference '''
        self.visibility=new_visibility
        self.set_mode(self.quantum_classical)

    def set_mode(self, quantum_classical):
        ''' Determines whether to return quantum or classical statistics '''
        self.quantum_classical=quantum_classical
        self.set_perm()

    def set_perm(self):
        ''' Make the best choice of permanent function we can '''
        if self.quantum_classical=='quantum': self.perm=permanent.perm_ryser
        if self.quantum_classical=='classical': self.perm=permanent.perm_ryser_real
        if self.nphotons == 2: self.perm=permanent.perm_2x2
        if self.nphotons == 3: self.perm=permanent.perm_3x3
        if self.nphotons == 4: self.perm=permanent.perm_4x4

    def set_input_state(self, input_state):
        ''' Set the input state '''
        if isinstance(input_state, list): input_state=self.basis.get_state(input_state)
        self.input_state=input_state
        modes=[self.basis.modes_from_index(term) for term in input_state.nonzero_terms]
        self.device.set_input_modes(modes)

    def get_output_state(self):
        ''' Get the output state, assuming indistinguishable photons'''
        output_state=self.basis.get_state()
        pbar = pb.ProgressBar(widgets=[pb.Percentage()], maxval=self.basis.hilbert_space_dimension).start()
        for input in self.input_state.nonzero_terms:
            input_amplitude=self.input_state.vector[input]
            cols=self.basis.modes_from_index(input)
            n1=self.basis.get_normalization_constant(cols)
            for output in xrange(self.basis.hilbert_space_dimension):
                rows=self.basis.modes_from_index(output)
                n2=self.basis.get_normalization_constant(rows)
                output_state[output]+=input_amplitude*self.perm(self.device.unitary[rows][:,cols])/np.sqrt(n1*n2)
                pbar.update(output)
        pbar.finish()
        return output_state

    def get_probabilities_quantum(self, outputs=None):
        ''' Iterate over a bunch of patterns.  Outputs must be a list or generator of indeces '''
        N=len(outputs)
        amplitudes=np.zeros(N, dtype=complex)
        pbar = pb.ProgressBar(widgets=[pb.Percentage()], maxval=N).start()
        for input in self.input_state.nonzero_terms:
            input_amplitude=self.input_state.vector[input]
            cols=self.basis.modes_from_index(input)
            n1=self.basis.get_normalization_constant(cols)
            for index, output in enumerate(outputs):
                rows=self.basis.modes_from_index(output)
                n2=self.basis.get_normalization_constant(rows)
                amplitudes[index]+=input_amplitude*self.perm(self.device.unitary[rows][:,cols])/np.sqrt(n1*n2)
                pbar.update(index)
        probabilities=np.abs(amplitudes)
        probabilities=probabilities*probabilities
        pbar.finish()
        return probabilities

    def get_probabilities_classical(self, outputs=None):
        ''' Iterate over a bunch of patterns.  Outputs must be a list or generator of indeces '''
        N=len(outputs)
        probabilities=np.zeros(N, dtype=float)
        pbar = pb.ProgressBar(widgets=[pb.Percentage()], maxval=N).start()
        for input in self.input_state.nonzero_terms:
            cols=self.basis.modes_from_index(input)
            input_amplitude=self.input_state.vector[input]
            input_probability=np.abs(input_amplitude)*np.abs(input_amplitude)
            for index, output in enumerate(outputs):
                rows=self.basis.modes_from_index(output)
                n2=self.basis.get_normalization_constant(rows)
                submatrix=np.abs(self.device.unitary[rows][:,cols])
                submatrix=np.multiply(submatrix, submatrix)
                probabilities[index]+=input_probability*self.perm(submatrix)/n2
                pbar.update(index)
        pbar.finish()
        return probabilities

    def get_probabilities_limited_visibility(self, outputs=None):
        ''' Simulate limited dip visibility '''
        self.set_mode('quantum')
        q=self.get_probabilities_quantum(outputs)
        self.set_mode('classical')
        c=self.get_probabilities_classical(outputs)
        self.set_mode('quantum')
        return self.visibility*q+(1-self.visibility)*c

    def get_probabilities(self, **kwargs):
        ''' Helpful interface to getting probabilities '''
        # Get the list of output modes in a sensible format
        outputs=kwargs['patterns'] if 'patterns' in kwargs else xrange(self.basis.hilbert_space_dimension)
        try:
            outputs=map(self.basis.modes_to_index, outputs)
        except TypeError:
            pass

        # Helpful: check that the device has had its unitary calculated
        if self.device.unitary==None: self.device.get_unitary()

        # Compute all the probabilities 
        probabilities=None
        if self.quantum_classical=='quantum':
            if self.visibility==1:
                probabilities=self.get_probabilities_quantum(outputs)
            else:
                probabilities=self.get_probabilities_limited_visibility(outputs)
        elif self.quantum_classical=='classical':
            probabilities=self.get_probabilities_classical(outputs)

        # Should we label?
        label = kwargs['label'] if 'label' in kwargs else False
        if not label: return probabilities

        # Label the list of probabilities and make sure that it is sorted
        d={}
        pbar = pb.ProgressBar(widgets=[pb.Percentage()], maxval=len(outputs)).start()
        for index, output in enumerate(outputs):
            label=tuple(self.basis.modes_from_index(output))
            d[label]=probabilities[index]
            pbar.update(index)
        pbar.finish()
        return dict_to_sorted_numpy(d)

    def get_probability_quantum(self, pattern):
        ''' Get a single probability. Do not use this in big loops! '''
        self.set_mode('quantum')
        return float(self.get_probabilities(patterns=[pattern], label=False))

    def get_probability_classical(self, pattern):
        ''' Get a single probability. Do not use this in big loops! '''
        self.set_mode('classical')
        return float(self.get_probabilities(patterns=[pattern], label=False))

    def __str__(self):
        ''' Print out '''
        s='Linear optics simulator: '
        s+=str(self.device)
        s+=str(self.basis)
        return s

if __name__=='__main__':
    ''' Test out the simulator '''
    from circuits import beamsplitter_network
    device=beamsplitter_network(2)
    device.add_beamsplitter(0,0)
    sim=simulator(device, nphotons=2)
    sim.set_input_state([0,0])
    print sim.get_probabilities()
