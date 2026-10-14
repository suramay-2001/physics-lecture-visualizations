#!/usr/bin/env python3
"""Numpy twins for every computed claim key of the Papers section's background chapter B1 (app/src/content/papers/B1.paper.ts).

A paper spec's computed claims cite a recipe's named output (app/src/papers/recipes.qec.ts, engine in app/src/physics/qec/); the claim
ledger (app/src/content/claims.test.ts) checks each engine value against the twin written here, at 1e-12.

Independent route from the engine (no TypeScript runs here; every object is rebuilt from its definition by pipeline/surface_numpy.py,
the pure Python / numpy routes shared with the engine fixtures, plus the small helpers below):
  - Kitaev's toric code is built from its edge lattice (a star is X on the 4 edges at a vertex, a plaquette is Z on the 4 edges of a face);
    ranks, k, overlaps and distances come from GF(2) elimination on those matrices and an exhaustive weight-by-weight search;
  - the rotated patch is built from its checkerboard of 4-qubit checks plus the weight-2 boundary checks, the unrotated planar code as the
    hypergraph product of two open repetition codes; Steane and Shor from their check lists;
  - the check-order rule is the parity rule (the shared qubits where the X check goes first must be even in number), enumerated over all
    24 x 24 pairs of orders on the d = 3 patch; the circuit distance is a Pauli-propagation enumeration of every elementary fault of the
    3-round memory circuit (preparation, readout, 15 CNOT Paulis, idle X/Y/Z), meeting in the middle on (detector bits, logical flip);
  - the space-time counts enumerate every fault set of a repetition-code history by weight against a lookup of the lightest explanation of
    each syndrome (not a matching); the logical failure chance sums all 2^15 fault sets of the n = 3, 3-round graph, ties split evenly;
  - the curves are the closed forms (binomial tail of the vote, a * (p / p*)^e(d) with the printed constants);
  - the Pauli frame is pushed through CNOT by the symplectic rule (x_t ^= x_c, z_c ^= z_t).
Units: none (counts, chances and ratios are pure numbers).

Usage (from the repo root): python3 pipeline/claims_papers/b1.py -> app/src/physics/__fixtures__/claims-papers/b1.json
Checked by app/src/content/claims.test.ts. The output is deterministic (no clock, no randomness): two runs write byte-identical files.
"""
import itertools
import json
import math
import sys
from decimal import Decimal, getcontext
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
# independent routes shared with the engine fixtures (pure Python / numpy, no TypeScript): pipeline/surface_numpy.py
from surface_numpy import (  # noqa: E402
    build_lookup,
    circuit_distance,
    css_distance,
    css_k,
    degrees,
    in_rowspace,
    kitaev_torus,
    logical_failure_counts,
    mul2,
    planar_unrotated,
    rank,
    rep_graph,
    rep_tail,
    rotated_surface,
    schedule_ok,
)


# ---------------------------------------------------------------- GF(2) helpers














# ---------------------------------------------------------------- Kitaev's torus, built from the edge lattice


# ---------------------------------------------------------------- the rotated patch






# ---------------------------------------------------------------- check order: the parity rule and the circuit-level enumeration
CORN = ['TL', 'TR', 'BL', 'BR']




def order_to_steps(order):
    """an order list such as ['TL', 'TR', 'BL', 'BR'] -> corner -> step"""
    return {c: k + 1 for k, c in enumerate(order)}










# ---------------------------------------------------------------- one check circuit: fault places and the hook
def check_circuit_places(weight):
    """the places a fault can strike in the circuit that measures one weight-w X check (prepare, wait, w CNOTs, wait, read)"""
    places = [('prepare', 'check')]
    places += [('wait', 'data%d' % k) for k in range(weight)]
    places += [('cnot', 'data%d' % k) for k in range(weight)]
    places += [('wait', 'data%d' % k) for k in range(weight)]
    places += [('read', 'check')]
    return places


def hook_data_errors(weight, after):
    """an X fault on the check qubit after `after` CNOTs: it is copied onto every data qubit still to come (CNOT: x_target ^= x_control)"""
    x_check = 1
    data = [0] * weight
    for k in range(weight):
        if k >= after and x_check:
            data[k] ^= x_check
    return sum(data)


# ---------------------------------------------------------------- repetition code in space-time






def syndrome_of(edges, S):
    m = 0
    o = 0
    for e in S:
        m ^= edges[e][2]
        o ^= edges[e][3]
    return m, o


def find_edge(edges, kind, params):
    return next(i for i, e in enumerate(edges) if e[0] == kind and e[1] == params)


def popcount(x):
    return bin(x).count('1')




# ---------------------------------------------------------------- the three published surface-code fits
PRESETS = {'tdg-2.6': (0.1, 0.01, lambda d: d / 2), 'tdg-A10': (0.03, 0.01, lambda d: d / 2), 'bev22': (0.03, 0.01, lambda d: (d + 1) / 2)}


def surf(d, p, preset):
    a, pstar, ex = PRESETS[preset]
    return a * (p / pstar) ** ex(d)


def least_odd(fn, target):
    return next(d for d in range(3, 199, 2) if fn(d) <= target)


# ---------------------------------------------------------------- a Pauli frame through CNOT (symplectic rule)
def frame_through_cnot(frame, control, target):
    """frame: string of I X Y Z. CNOT: x_target ^= x_control and z_control ^= z_target. Returns the new string."""
    xs = [1 if c in 'XY' else 0 for c in frame]
    zs = [1 if c in 'ZY' else 0 for c in frame]
    xs[target] ^= xs[control]
    zs[control] ^= zs[target]
    return ''.join('IXZY'[xs[i] + 2 * zs[i]] for i in range(len(frame)))


def frame_weight(frame):
    return sum(1 for c in frame if c != 'I')


# ================================================================ the values
values = {}

# ---- b1-why
p = 1e-3
N = 10**9
values['b1CleanRun1000'] = float((1 - p) ** 1000)  # why:b1
values['b1CleanRun10000'] = float((1 - p) ** 10000)
# the per-step budget that keeps a run of N steps clean with chance 2/3: 1 - (2/3)^(1/N); it cancels badly in floats, so 60 digits
getcontext().prec = 60
budget = float(1 - (Decimal(2) / Decimal(3)) ** (Decimal(1) / Decimal(N)))
values['b1Budget'] = budget  # why:b2
values['b1ExpFaults'] = float(N * p)
for d in (3, 5, 7, 13):  # why:b3
    values['b1RepD%d' % d] = float(rep_tail(d, 0.01))
values['b1RepDneeded'] = float(least_odd(lambda d: rep_tail(d, 0.01), budget))
values['b1RepDneeded01'] = float(least_odd(lambda d: rep_tail(d, 0.1), budget))  # why:b5
values['b1RepHalf'] = float(rep_tail(3, 0.5))  # threshold:b3: at p = 1/2 the vote is a coin flip, for every d
H74 = np.array([[1, 0, 1, 0, 1, 0, 1], [0, 1, 1, 0, 0, 1, 1], [0, 0, 0, 1, 1, 1, 1]], dtype=np.uint8)  # Steane's check matrix (X and Z the same)
assert not mul2(H74, H74.T).any()
shorHZ = np.zeros((6, 9), dtype=np.uint8)
for r, (a, b) in enumerate([(0, 1), (1, 2), (3, 4), (4, 5), (6, 7), (7, 8)]):
    shorHZ[r, [a, b]] = 1
shorHX = np.zeros((2, 9), dtype=np.uint8)
shorHX[0, :6] = 1
shorHX[1, 3:] = 1
assert not mul2(shorHX, shorHZ.T).any()
S3 = rotated_surface(3)
values['b1ShorCheckWeight'] = float(degrees(shorHX, shorHZ)[0])  # why:b4
values['b1SteaneQubitDegree'] = float(degrees(H74, H74)[1])
values['b1PatchCheckWeight'] = float(degrees(S3['HX'], S3['HZ'])[0])
values['b1PatchQubitDegree'] = float(degrees(S3['HX'], S3['HZ'])[1])

# ---- b1-toric
values['b1TannerNodes'] = float(H74.shape[1] + 2 * H74.shape[0])  # toric:b1: 7 qubits + 3 X checks + 3 Z checks
values['b1TannerEdges'] = float(int(H74.sum()) * 2)  # ones of HX plus ones of HZ
T3 = kitaev_torus(3)
T4 = kitaev_torus(4)
T5 = kitaev_torus(5)
T6 = kitaev_torus(6)
values['b1ToricN3'] = float(T3['n'])  # toric:b2
values['b1ToricStars3'] = float(T3['HX'].shape[0])
values['b1ToricMaxOverlap'] = float(max((T3['HX'][a] & T3['HZ'][b]).sum() for a in range(9) for b in range(9)))  # toric:b3
assert not mul2(T3['HX'], T3['HZ'].T).any()
values['b1ToricRank3'] = float(rank(T3['HX']))
assert rank(T3['HX']) == rank(T3['HZ'])
values['b1ToricK3'] = float(css_k(T3['HX'], T3['HZ']))
values['b1ToricN6'] = float(T6['n'])
values['b1ToricRank6'] = float(rank(T6['HX']))
values['b1ToricK6'] = float(css_k(T6['HX'], T6['HZ']))
chain = np.zeros(T4['n'], dtype=np.uint8)  # toric:b4: Z on h(0,0) h(1,0) h(2,0)
for i in range(3):
    chain[T4['h'](i, 0)] = 1
values['b1ChainLit'] = float((T4['HX'] @ chain % 2).sum())
zloop = np.zeros(T4['n'], dtype=np.uint8)  # toric:b5: Z on every h(i, 0), a loop round the torus
for i in range(4):
    zloop[T4['h'](i, 0)] = 1
values['b1LoopLit'] = float((T4['HX'] @ zloop % 2).sum())
plaq = T4['HZ'][5].copy()  # a face is a contractible loop
values['b1PlaqStabilizer'] = float(in_rowspace(T4['HZ'], plaq))
zloop2 = np.zeros(T4['n'], dtype=np.uint8)
for i in range(4):
    zloop2[T4['h'](i, 2)] = 1
values['b1LoopClassSame'] = float(in_rowspace(T4['HZ'], zloop ^ zloop2))  # two parallel winding loops differ by plaquettes
xcut = np.zeros(T4['n'], dtype=np.uint8)  # X on h(1, j) for all j, a cut across the torus
for j in range(4):
    xcut[T4['h'](1, j)] = 1
assert not (T4['HZ'] @ xcut % 2).any()
values['b1CutOverlap'] = float((zloop & xcut).sum())
values['b1ToricD3'] = float(css_distance(T3['HX'], T3['HZ'], 3))
values['b1ToricD4'] = float(css_distance(T4['HX'], T4['HZ'], 4))
values['b1ToricPerLogical5'] = float(T5['n'] / css_k(T5['HX'], T5['HZ']))  # toric:b6
values['b1RotPerLogical5'] = float(25 / css_k(rotated_surface(5)['HX'], rotated_surface(5)['HZ']))

# ---- b1-planar
R = {d: rotated_surface(d) for d in (3, 5, 7)}
for d in (3, 5, 7):
    S = R[d]
    assert not mul2(S['HX'], S['HZ'].T).any()
    w4 = sum(1 for c in S['checks'] if len(c[1]) == 4)
    w2 = sum(1 for c in S['checks'] if len(c[1]) == 2)
    if d == 3:  # planar:b1 (the d = 3 patch drawn with its check weights)
        values['b1Rot3Data'] = float(d * d)
        values['b1Rot3W4'] = float(w4)
        values['b1Rot3W2'] = float(w2)
    if d == 7:  # planar:b5 (the clue counts the edge checks of d = 7)
        values['b1Rot7W4'] = float(w4)
        values['b1Rot7W2'] = float(w2)
    values['b1Rot%dChecks' % d] = float(len(S['checks']))  # planar:b2
    values['b1Rot%dTotal' % d] = float(d * d + len(S['checks']))
values['b1Rot3K'] = float(css_k(R[3]['HX'], R[3]['HZ']))
for d in (3, 5):  # planar:b3
    S = R[d]
    values['b1RotD%d' % d] = float(css_distance(S['HX'], S['HZ'], d))
xbar = np.zeros(25, dtype=np.uint8)
zbar = np.zeros(25, dtype=np.uint8)
for r in range(5):
    xbar[R[5]['q'](r, 0)] = 1  # X on column 0
for c in range(5):
    zbar[R[5]['q'](0, c)] = 1  # Z on row 0
assert not (R[5]['HZ'] @ xbar % 2).any() and not (R[5]['HX'] @ zbar % 2).any()
assert not in_rowspace(R[5]['HX'], xbar) and not in_rowspace(R[5]['HZ'], zbar)
values['b1RotOverlap'] = float((xbar & zbar).sum())
for d in (3, 5):
    lit = [int(R[d]['HZ'][:, qq].sum()) for qq in range(d * d)]  # Z checks lit by a single X error on qubit qq
    values['b1Rot%dLit1' % d] = float(lit.count(1))
    if d == 3:
        values['b1Rot3Lit2'] = float(lit.count(2))
    else:
        values['b1Rot5Lit2'] = float(lit.count(2))
for d in (3, 5, 7):  # planar:b4
    HXu, HZu = planar_unrotated(d)
    assert not mul2(HXu, HZu.T).any()
    if d == 3:
        values['b1Unrot3Data'] = float(HXu.shape[1])
    values['b1Unrot%dTotal' % d] = float(HXu.shape[1] + HXu.shape[0] + HZu.shape[0])
HXu, HZu = planar_unrotated(3)
values['b1UnrotD3'] = float(css_distance(HXu, HZu, 3))
values['b1TotalRatio3'] = float((HXu.shape[1] + HXu.shape[0] + HZu.shape[0]) / (R[3]['n'] + len(R[3]['checks'])))
dd = 17
values['b1TotalRatio17'] = float((dd * dd + (dd - 1) ** 2 + 2 * dd * (dd - 1)) / (2 * dd * dd - 1))

# ---- b1-cycle
good = (order_to_steps(['TL', 'TR', 'BL', 'BR']), order_to_steps(['TL', 'BL', 'TR', 'BR']))  # X: Z shape, Z: N shape
bad = (order_to_steps(['TL', 'BL', 'TR', 'BR']), order_to_steps(['TL', 'TR', 'BL', 'BR']))  # X: N shape, Z: Z shape (the hook lies along the logical)
cf_pairs = 0
valid_pairs = 0
total_pairs = 0
for px in itertools.permutations(CORN):
    for pz in itertools.permutations(CORN):
        cf, ok, _ = schedule_ok(S3, order_to_steps(list(px)), order_to_steps(list(pz)))
        total_pairs += 1
        cf_pairs += cf
        valid_pairs += cf and ok
values['b1SchedPairs'] = float(total_pairs)  # cycle:b2
values['b1SchedConflictFree'] = float(cf_pairs)
values['b1SchedValid'] = float(valid_pairs)
_, _, flagged = schedule_ok(S3, order_to_steps(['TL', 'TR', 'BL', 'BR']), order_to_steps(['BR', 'TR', 'BL', 'TL']))
values['b1SchedBadPairs'] = float(len(flagged))
values['b1HookAfter2'] = float(hook_data_errors(4, 2))  # cycle:b3
values['b1HookEffMax'] = float(max(min(hook_data_errors(4, k), 4 - hook_data_errors(4, k)) for k in range(4)))
places = check_circuit_places(4)  # cycle:b4
values['b1CheckLocations'] = float(len(places))
values['b1CheckN'] = float(15 * len(places))  # each place splits into 15 equal faults of chance p / 15
values['b1CheckExpected'] = float(15 * len(places) * (1 / 15))  # N * q in units of p
events = sum(1 if kind in ('prepare', 'read') else 15 if kind == 'cnot' else 3 for kind, _ in places)  # 15 two-qubit Paulis, 3 idle Paulis, 1 flip
values['b1CheckEvents'] = float(events)
dc_good = circuit_distance(S3, *good, rounds=3)  # cycle:b5
dc_bad = circuit_distance(S3, *bad, rounds=3)
values['b1DcircGood'] = float(dc_good[0])
values['b1DcircBad'] = float(dc_bad[0])
values['b1FaultEvents'] = float(dc_good[1])
assert dc_bad[1] == dc_good[1]
values['b1SigGood'] = float(dc_good[2])
values['b1SigBad'] = float(dc_bad[2])

# ---- b1-spacetime
det5, ed5 = rep_graph(5, 4)  # spacetime:b1, b2
m, o = syndrome_of(ed5, [find_edge(ed5, 'data', (2, 2))])
values['b1StLitData'] = float(popcount(m))
m, o = syndrome_of(ed5, [find_edge(ed5, 'meas', (1, 2))])
values['b1StLitMeas'] = float(popcount(m))
m, o = syndrome_of(ed5, [find_edge(ed5, 'data', (0, 2))])
values['b1StLitEdge'] = float(popcount(m))
tab5 = build_lookup(ed5, 3)
m, o = syndrome_of(ed5, [find_edge(ed5, 'data', (2, 2)), find_edge(ed5, 'meas', (0, 3))])
values['b1StMatchWeight'] = float(tab5[m][0])
det3, ed3 = rep_graph(3, 3)  # spacetime:b3
tab3 = build_lookup(ed3, 4)
m, o = syndrome_of(ed3, [find_edge(ed3, 'data', (0, 2)), find_edge(ed3, 'data', (1, 2))])
values['b1StFail3'] = float(tab3[m][1] != {o})
det5b, ed5b = rep_graph(5, 3)
tab5b = build_lookup(ed5b, 3)
m, o = syndrome_of(ed5b, [find_edge(ed5b, 'data', (0, 2)), find_edge(ed5b, 'data', (1, 2))])
values['b1StFail5'] = float(tab5b[m][1] != {o})
E3, out3 = logical_failure_counts(3, 3, 2)  # spacetime:b4
values['b1Rep3Edges'] = float(E3)
values['b1Rep3W1Bad'] = float(out3[1]['fail'] + out3[1]['tie'])
values['b1Rep3W2Total'] = float(out3[2]['total'])
values['b1Rep3W2Fail'] = float(out3[2]['fail'])
values['b1Rep3W2Tie'] = float(out3[2]['tie'])
# exact logical failure chance of the n = 3, 3-round graph: all 2^15 fault sets, ties split evenly
tabAll = build_lookup(ed3, len(ed3))
F = [0] * (E3 + 1)
Tt = [0] * (E3 + 1)
for Sset in range(1 << E3):
    m = 0
    o = 0
    w = 0
    for e in range(E3):
        if (Sset >> e) & 1:
            m ^= ed3[e][2]
            o ^= ed3[e][3]
            w += 1
    mw, os_ = tabAll[m]
    if len(os_) == 2:
        Tt[w] += 1
    elif next(iter(os_)) != o:
        F[w] += 1
pe = 0.01
values['b1Rep3PL'] = float(sum((F[w] + 0.5 * Tt[w]) * pe**w * (1 - pe) ** (E3 - w) for w in range(E3 + 1)))
E5, out5 = logical_failure_counts(5, 5, 3)
values['b1Rep5Edges'] = float(E5)
values['b1Rep5W2Bad'] = float(out5[1]['fail'] + out5[1]['tie'] + out5[2]['fail'] + out5[2]['tie'])  # no set of 1 or 2 faults is bad
values['b1Rep5W3Total'] = float(out5[3]['total'])
values['b1Rep5W3Fail'] = float(out5[3]['fail'])
values['b1Rep5W3Tie'] = float(out5[3]['tie'])
values['b1FrameWeightX'] = float(frame_weight(frame_through_cnot('XI', 0, 1)))  # spacetime:b5
values['b1FrameWeightZ'] = float(frame_weight(frame_through_cnot('IZ', 0, 1)))

# ---- b1-threshold
values['b1FitA10D7'] = float(surf(7, 1e-3, 'tdg-A10'))  # threshold:b1
values['b1FitA10D11'] = float(surf(11, 1e-3, 'tdg-A10'))
values['b1Lambda'] = float(surf(7, 1e-3, 'tdg-A10') / surf(9, 1e-3, 'tdg-A10'))  # the factor one step of +2 in d buys
values['b1LambdaP5e3'] = float(surf(7, 5e-3, 'tdg-A10') / surf(9, 5e-3, 'tdg-A10'))
values['b1FitA10D17'] = float(surf(17, 1e-3, 'tdg-A10'))  # threshold:b2
values['b1Fit26D17'] = float(surf(17, 1e-3, 'tdg-2.6'))
values['b1FitBev22D17'] = float(surf(17, 1e-3, 'bev22'))
values['b1FitRatio'] = float(surf(17, 1e-3, 'tdg-A10') / surf(17, 1e-3, 'bev22'))
values['b1DneedA10'] = float(least_odd(lambda d: surf(d, 1e-3, 'tdg-A10'), budget))  # threshold:b5
values['b1Dneed26'] = float(least_odd(lambda d: surf(d, 1e-3, 'tdg-2.6'), budget))
values['b1DneedBev22'] = float(least_odd(lambda d: surf(d, 1e-3, 'bev22'), budget))
values['b1QubitsD17'] = float(2 * 17**2 - 1)
values['b1QubitsD15'] = float(2 * 15**2 - 1)
for lab, pp in (('b1Steps1000P1e3', 1e-3), ('b1Steps1000P5e3', 5e-3)):  # threshold:b6
    lam = round(0.01 / pp)  # exact integer factor per step
    values[lab] = float(next(s for s in range(1, 60) if lam**s >= 1000))

out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-papers' / 'b1.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'source': 'pipeline/claims_papers/b1.py', 'values': values}, indent=2, sort_keys=True) + '\n')
print(f'wrote {out.relative_to(ROOT)}: {len(values)} values')
