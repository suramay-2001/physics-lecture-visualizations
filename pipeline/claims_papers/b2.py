#!/usr/bin/env python3
"""Numpy twins for every computed claim key of the Papers section's background chapter B2 (app/src/content/papers/B2.paper.ts).

A paper spec's computed claims cite a recipe's named output (app/src/papers/recipes.qec.b2.ts, engine in app/src/physics/qec/bbfamily.ts, bp.ts, qldpc.ts); the claim
ledger (app/src/content/claims.test.ts) checks each engine value against the twin written here, at 1e-12.

Independent route from the engine (no TypeScript runs here; every object is rebuilt from its definition by pipeline/bb2_numpy.py and pipeline/surface_numpy.py):
  - BB codes from np.kron circulants; k from GF(2) ranks; the common kernel of A and B from a null space; commutation of A and B and the number of terms of AB by
    exponent arithmetic on the torus; X-check / Z-check overlaps from the matrices; local and long edges from the wrapped offsets of the monomials;
  - the distance of [[72,12,6]] by a meet-in-the-middle search over syndromes (weights up to 6, both Pauli types), the toy code and the 24-qubit torus by exhaustive search;
  - two presentations of one code: permute the columns of one pair of matrices, compare the SETS of rows with the other pair;
  - the thickness-2 layers by a union-find over the edges split by term name;
  - the depth-8 cycle by dictionaries (clashes, the parity rule) and a hand-written Aaronson-Gottesman tableau running two cycles with a seeded generator;
  - the logical action of the translations by an XOR-integer elimination in the paper's own logical basis (qec_numpy.logical_action);
  - min-sum belief propagation over dictionaries of edge messages and OSD-0 with a greedy rank test; Hamming matrices from the binary expansion of 1 ... n.
Units: none (counts, chances and ratios are pure numbers). Two values differ from the plan on purpose: the ones of M_x are counted in the paper's logical basis (34);
the tableau claims are flags (the detector count depends on the random outcomes).

Usage (from the repo root): python3 pipeline/claims_papers/b2.py -> app/src/physics/__fixtures__/claims-papers/b2.json
Checked by app/src/content/claims.test.ts. The output is deterministic (no clock; seeded generators): two runs write byte-identical files.
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import bb2_numpy as N  # noqa: E402
from surface_numpy import css_distance, css_k, degrees, in_rowspace, kitaev_torus, rank, rotated_surface  # noqa: E402

values = {}


def put(key, v):
    values[key] = float(v)


def wsym(v, mod):
    v %= mod
    return v - mod if v > mod / 2 else v


# ---------------------------------------------------------------- b2-ldpc
ham = {}
for r in (3, 4, 5, 6):
    H = N.hamming_H(r)
    cw, _ = degrees(H, H)
    ham[r] = (H.shape[1], css_k(H, H), cw)
for r, nn in ((3, 7), (4, 15), (5, 31), (6, 63)):
    put(f'b2HammingW{nn}', ham[r][2])
put('b2HammingK63', ham[6][1])
put('b2HammingRate63', ham[6][1] / ham[6][0])
put('b2ToricWeight', degrees(kitaev_torus(4)['HX'], kitaev_torus(4)['HZ'])[0])  # the toric code keeps weight 4
put('b2SurfaceRate3', 1.0 / rotated_surface(3)['HX'].shape[1])  # rate = k/n = 1/(data qubits)
put('b2SurfaceRate17', 1.0 / rotated_surface(17)['HX'].shape[1])
put('b2SurfaceData17', rotated_surface(17)['HX'].shape[1])
put('b2SurfaceData13', rotated_surface(13)['HX'].shape[1])
put('b2SurfaceDataFor12', 12 * rotated_surface(13)['HX'].shape[1])
rows = {name: N.table3_row(name) for name in N.TABLE3}
put('b2K144', rows['b144']['k'])
put('b2N144', rows['b144']['n'])
put('b2SurfaceRatio13', 12 * rotated_surface(13)['HX'].shape[1] / rows['b144']['n'])

# ---------------------------------------------------------------- b2-bpt
S9 = rotated_surface(9)
put('b2Kd2nSurface', css_k(S9['HX'], S9['HZ']) * 81 / S9['HX'].shape[1])  # k d^2 / n with d = 9
T4 = kitaev_torus(4)
d_t4 = css_distance(T4['HX'], T4['HZ'], maxw=4)
put('b2Kd2nToric', css_k(T4['HX'], T4['HZ']) * d_t4**2 / T4['n'])
HX72, HZ72 = N.bb(*N.TABLE3['b72'])
m72 = N.mitm(HX72, HZ72, 6)
m72z = N.mitm(HZ72, HX72, 6)
put('b2D72', m72['d'])
put('b2D72Z', m72z['d'])
D = {'72': m72['d'], '90': 10, '108': 10, '144': 12, '288': 18}  # all but 72 are the printed (reported) distances
for nn, name in (('72', 'b72'), ('90', 'b90'), ('108', 'b108'), ('144', 'b144'), ('288', 'b288')):
    put(f'b2Kd2n{nn}', rows[name]['k'] * D[nn] ** 2 / rows[name]['n'])
lay = N.layers(12, 6, N.TABLE3['b144'][2], N.TABLE3['b144'][3], {'A2', 'A3', 'B3'})
put('b2LayerDegree', max(L['maxDegree'] for L in lay))
put('b2LayerEdges', sum(L['edges'] for L in lay))
HXg, HZg = N.bb(*N.GROSS_TORIC)
cw_g, qd_g = degrees(HXg, HZg)
put('b2QubitDegree', qd_g)
put('b2CheckWeight', cw_g)

# ---------------------------------------------------------------- b2-polynomials
l_, m_ = 12, 6
A_t, B_t = N.GROSS_TORIC[2], N.GROSS_TORIC[3]
pv = lambda terms: N.Q.poly_vec(l_, m_, terms)
put('b2AWeight', sum(pv(A_t)))
AB = N.Q.polymul_terms(l_, m_, A_t, B_t)
BA = N.Q.polymul_terms(l_, m_, B_t, A_t)
put('b2ABweight', len(AB))
put('b2ABcommute', 1 if AB == BA else 0)
put('b2GrossRankX', rank(HXg))
ov = HXg[0].astype(int) @ HZg.T.astype(int)
put('b2OverlapChecks', int((ov == 2).sum()))
put('b2ZeroOverlapChecks', int((ov == 0).sum()))
put('b2GrossKer', rows_ker := N.nullspace(np.vstack([N.Q.bb_matrices(l_, m_, A_t, B_t)[0] % 2, N.Q.bb_matrices(l_, m_, A_t, B_t)[1] % 2]).astype(np.uint8)).shape[0])
MA3, MB3, _, _ = N.Q.bb_matrices(3, 3, [(0, 0), (1, 0)], [(0, 0), (0, 1)])
put('b2ToricKer', N.nullspace(np.vstack([MA3 % 2, MB3 % 2]).astype(np.uint8)).shape[0])
for nn in ('72', '90', '108', '288', '360', '756'):
    put(f'b2N{nn}', rows[f'b{nn}']['n'])
    put(f'b2K{nn}', rows[f'b{nn}']['k'])
put('b2K288', rows['b288']['k'])
HXt, HZt = N.bb(*N.TOY)
put('b2ToyN', HXt.shape[1])
put('b2ToyK', css_k(HXt, HZt))
d_toy = N.distance_exhaustive(HXt, HZt, 5)
put('b2ToyD', d_toy)
put('b2ToyKd2n', css_k(HXt, HZt) * d_toy**2 / HXt.shape[1])
T34 = kitaev_torus(3, 4)
d_34 = css_distance(T34['HX'], T34['HZ'], maxw=4)
put('b2ToricSameK', css_k(T34['HX'], T34['HZ']))
put('b2ToricSameD', d_34)
put('b2ToricSameKd2n', css_k(T34['HX'], T34['HZ']) * d_34**2 / T34['n'])
put('b2Rate144', rows['b144']['k'] / (2 * rows['b144']['n']))  # k / (2n)

# ---------------------------------------------------------------- b2-gross
# Kitaev's torus under the explicit relabelling L(i,j) = h(i,j), R(i,j) = v(i+1, j-1): the rows of both check matrices match as sets
HXb, HZb = N.bb(3, 3, [(0, 0), (1, 0)], [(0, 0), (0, 1)])
T3 = kitaev_torus(3)
perm = np.zeros(18, dtype=int)
for i in range(3):
    for j in range(3):
        perm[i * 3 + j] = T3['h'](i, j)
        perm[9 + i * 3 + j] = T3['v'](i + 1, j - 1)


def moved(H):
    out = np.zeros_like(H)
    for c in range(H.shape[1]):
        out[:, perm[c]] = H[:, c]
    return out


put('b2ToricIsBB', 1 if ({tuple(r) for r in moved(HXb)} == {tuple(r) for r in T3['HX']} and {tuple(r) for r in moved(HZb)} == {tuple(r) for r in T3['HZ']}) else 0)
local = long_ = 0
for dx, dy in [(a, b) for a, b in A_t] + [(a, b) for a, b in B_t]:
    wx, wy = wsym(dx, l_), wsym(dy, m_)
    if abs(wx) + abs(wy) <= 1:
        local += 1
    else:
        long_ += 1
put('b2LocalEdges', local)
put('b2LongEdges', long_)
put('b2LongTotal', long_ * 2 * l_ * m_)  # X and Z checks alike, one per cell each
put('b2EdgeTotal', int(HXg.sum() + HZg.sum()))
put('b2LongShare', (long_ * 2 * l_ * m_) / int(HXg.sum() + HZg.sum()))
A_b, B_b = N.TABLE3['b144'][2], N.TABLE3['b144'][3]
put('b2IsoGross', 1 if N.iso_holds(12, 6, A_t, B_t, A_b, B_b, (0, 1), (1, 0)) else 0)
put('b2IsoGrossNoShift', 1 if N.iso_holds(12, 6, A_t, B_t, A_b, B_b, (0, 0), (0, 0)) else 0)
A_b2, B_b2 = N.TABLE3['b288'][2], N.TABLE3['b288'][3]
put('b2IsoTwoGross', 1 if N.iso_holds(12, 12, N.TWO_GROSS_TORIC[2], N.TWO_GROSS_TORIC[3], A_b2, B_b2, (0, 7), (1, 0), 7) else 0)
put('b2IsoTwoGrossNoMap', 1 if N.iso_holds(12, 12, N.TWO_GROSS_TORIC[2], N.TWO_GROSS_TORIC[3], A_b2, B_b2, (0, 7), (1, 0), 1) else 0)
rep_ok = N.schedule_report(12, 6, A_b, B_b, 'printed')
rep_sw = N.schedule_report(12, 6, A_b, B_b, 'swap-z-reads')
put('b2T5Conflict', rep_ok['clashes'])
put('b2T5BadPairs', rep_ok['badPairs'])
put('b2T5Pairs', rep_ok['pairs'])
put('b2T5MaxOverlap', rep_ok['maxOverlap'])
put('b2T5SwapBad', rep_sw['badPairs'])
put('b2T5TableauClean', 1 if N.cycle_detectors(12, 6, A_b, B_b, 'printed', 2, 1)['nonzero'] == 0 else 0)
put('b2T5SwapTableauBad', 1 if N.cycle_detectors(12, 6, A_b, B_b, 'swap-z-reads', 2, 3)['nonzero'] > 0 else 0)
for c in (1, 10, 12):
    put(f'b2Cycles{c}', 1 + sum(8 for _ in range(c)))

# ---------------------------------------------------------------- b2-automorphisms
sh = N.shift_facts('gross')
put('b2ShiftsPreserve', sh['preserved'])
put('b2SwapPreserves', 1 if sh['swapPreserves'] else 0)
put('b2OrderMx', sh['orderX'])
put('b2OrderMy', sh['orderY'])
put('b2MxOnes', sh['onesX'])
put('b2DistinctShifts', sh['distinct'])
put('b2TrivialShifts', sh['trivial'])
put('b2GroupOrder', sh['groupOrder'])

# ---------------------------------------------------------------- b2-decoding
bp = N.bp_facts()
put('b2Llr', math.log(0.95 / 0.05))
put('b2Llr001', math.log(0.99 / 0.01))
put('b2BpRepIters', bp['rep7']['iterations'])
put('b2BpSingleIters', bp['toric3Single']['iterations'])
tor = bp['toric3']
put('b2BpToricConverged', 1 if tor['converged'] else 0)
put('b2BpToricHardWeight', tor['hardWeights'][1])  # round 2
put('b2BpStarLlr', tor['marginals'][tor['error'][0]])
e = np.zeros(18, dtype=np.uint8)
e[tor['error']] = 1
put('b2AltWeight', min(int((e ^ T3['HX'][r]).sum()) for r in range(T3['HX'].shape[0])))
put('b2FourCycles', bp['fourCycles']['toric3'])
put('b2OsdWeight', tor['osd_low']['weight'])
put('b2OsdValid', 1 if tor['osd_low']['valid'] else 0)
put('b2OsdHighStab', 1 if tor['osd_high']['diffIsStabilizer'] else 0)

out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-papers' / 'b2.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'source': 'pipeline/claims_papers/b2.py', 'values': values}, indent=2, sort_keys=True) + '\n')
print(f'wrote {out.relative_to(ROOT)}: {len(values)} values')
