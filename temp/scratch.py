# Thinking about the tensor product of dictionaries and lists
from numpy import *
import itertools as it
from collections import defaultdict

def dtens(*terms):
    """ The tensor product, defined for states represented as sparse dicts """
    output=defaultdict(complex)
    for q in it.product(*(t.items() for t in terms)):
        keys, amps = zip(*q)
        print keys
        output[tuple(sorted(sum(keys)))] = prod(amps)
    return output

source1 = {(0,):1}
source2 = {(1,2):1/sqrt(2), (3,4):1/sqrt(2)}
source3 = {(5,):1}
state = dtens(source1, source2, source2, source3)
print state
nphotons=len(state.keys()[0])
print nphotons

detector1 = 0
detector2 = 4
detector3 = 5
patterns = list(it.combinations_with_replacement([0,4,5], nphotons))
print patterns


