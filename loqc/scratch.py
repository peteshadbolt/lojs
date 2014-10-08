# Thinking about the tensor product of dictionaries and lists
from numpy import *
import itertools as it
from collections import defaultdict

def dtens(*terms):
    """ The tensor product, defined for states represented as sparse dicts """
    output=defaultdict(complex)
    for q in it.product(*(t.items() for t in terms)):
        keys, amps = zip(*q)
        output[tuple(sorted(sum(keys)))] = prod(amps)
    return output

source1 = {(0,):1}
source2 = {(1,2):1/sqrt(2), (3,4):1/sqrt(2)}
source3 = {(5,):1}

print dtens(source1, source2, source2, source3)
