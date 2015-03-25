#!/usr/bin/python
import itertools as it
import re
import operator
import sys

def fock(term, nmodes):
    """ Map a list of photon mode numbers to a Fock representation """
    output = [0]*nmodes
    for t in term:
        output[t]+=1
    return output

def test(f, rule):
    """ Test a single rule against a Fock-encoded term """
    modes, op, number = rule
    try:
        return op(sum(f[i] for i in modes), number)
    except IndexError:
        return False

def parse_rules(rule_string):
    """ 
    Parses a string into a list of rules about photon number.
    e.g. 0,1,2>1; 3=1
    Means that there should be 
        - more than 1 photon across modes 0,1,2 
        - and exactly one photon in mode 3.
    """
    matches = re.findall(r"(n\d+(?:\+\s*n\d+)*)([=><])(\d+)", rule_string)
    rules = []
    for modes, symbol, number in matches:
        modes = map(lambda x:int(x[1:]), modes.split("+"))
        number = int(number)
        op = {"=":operator.eq, ">":operator.gt, "<":operator.lt}[symbol]
        rules.append((modes, op, number))
    sys.stdout.flush()
    return rules

def generate_terms(rules, nmodes, nphotons):
    """ Generate all the terms which follow a certain set of rules 
    Pretty inefficient right now """
    for c in it.combinations_with_replacement(range(nmodes), nphotons):
        f = fock(c, nmodes)
        if all(test(f, rule) for rule in rules):
            yield tuple(c)

if __name__ == '__main__':
    nmodes = 7
    nphotons = 3
    rule_string = "0,1,2>1;3=1"
    rules = parse_rules(rule_string)
    for term in generate_terms(rules, nmodes, nphotons):
        print term
