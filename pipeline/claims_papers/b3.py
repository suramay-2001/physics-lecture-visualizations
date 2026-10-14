#!/usr/bin/env python3
"""Numpy twins for every computed claim key of the Papers section's background chapter B3 (app/src/content/papers/B3.paper.ts).

A paper spec's computed claims cite a recipe's named output (app/src/papers/recipes.qec.ts, engine in app/src/physics/qec/); the claim ledger
(app/src/content/claims.test.ts) checks each engine value against the twin written here, at 1e-12.

Independent route from the engine (no TypeScript runs here; every object is rebuilt from its definition by pipeline/b3_numpy.py):
  - the product measurement through a helper and the separate readout run on dense 3-qubit and 2-qubit state vectors (CNOT as index arithmetic);
  - the update rule and the counts of fixed / logical / clashing Paulis use the symplectic bit-mask route, the census runs over all 4^n - 1 Paulis;
  - lattice surgery: the merged rotated patch is built from its faces, the new and widened checks are counted by GF(2) rank arithmetic against the two separate
    patches; the chances of the merge patterns, of the product and of the seam outcomes come from the FULL 21-qubit state vector (projectors on Pauli strings);
  - the CNOT from three measurements: the eight Kraus operators on dense 8-vectors, compared with the fixed CNOT up to a global sign;
  - gauging: the deformed code is built from the incidence matrix (cycle space as its null space, deformation paths found by solving the incidence system over
    GF(2)), the Cheeger constant by trying all vertex sets, both distances by running over every vector of the null space that is not a stabilizer;
  - the readout chances sum the probability of every flip pattern (no closed form).
Units: none (counts, chances and ratios are pure numbers).

Usage (from the repo root): python3 pipeline/claims_papers/b3.py -> app/src/physics/__fixtures__/claims-papers/b3.json
Checked by app/src/content/claims.test.ts. The output is deterministic (no clock, no randomness): two runs write byte-identical files.
"""
import itertools
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / 'pipeline'))
import b3_numpy as bn  # noqa: E402

values = {}

# ---- b3-logical-measure
pm = bn.product_measure_dense()
values['b3EvenProb'] = float(pm['pEven'])  # b1
values['b3BellAmp'] = float(pm['ampSame'])
values['b3SepProb'] = float(pm['pSep'])  # b2
values['b3Concurrence'] = float(pm['concurrence'])
values['b3EvenProb2'] = float(pm['pEven'])
values['b3EvenProbR'] = float(pm['pEven'])
new, kind = bn.update_rule([bn.sym('XI'), bn.sym('IX')], bn.sym('ZZ'))  # b3
values['b3KeptXX'] = float(2 - (1 if kind == 'replaced' else 0))
cen_bell = bn.census([bn.sym('XX'), bn.sym('ZZ')], 2)
values['b3BellFixed'] = float(cen_bell['fixed'])
values['b3BellRandom'] = float(cen_bell['logical'] + cen_bell['clashing'])
S422 = [bn.sym('XXXX'), bn.sym('ZZZZ')]
IZZI = bn.sym('IZZI')
rank_before = bn.gf2_rank([(s[0] << 4) | s[1] for s in S422])
rank_after = bn.gf2_rank([(s[0] << 4) | s[1] for s in S422 + [IZZI]])
values['b3LogicalK1'] = float(4 - rank_before)  # b4
values['b3LogicalK2'] = float(4 - rank_after)
values['b3ProductWeight'] = float(sum(1 for q in range(4) if ((IZZI[0] | IZZI[1]) >> q) & 1))


def clashes(a, b):
    pa, pb = bn.sym(a), bn.sym(b)
    return float(sum(1 for q in range(len(a)) if (((pa[0] >> q) & 1) & ((pb[1] >> q) & 1)) ^ (((pa[1] >> q) & 1) & ((pb[0] >> q) & 1))))


values['b3Clash12'] = clashes('IXXI', 'IZZI')  # b5
values['b3Clash1'] = clashes('XXII', 'IZZI')

# ---- b3-surgery
m3 = bn.merge_stats(3, 'XX')
m5 = bn.merge_stats(5, 'XX')
values['b3SeamQubits'] = float(m3['seam'])
values['b3MergedN'] = float(m3['n'])
values['b3NewXChecks'] = float(m3['new'])
values['b3WidenZ'] = float(m3['widened'])
dense = bn.dense_surgery_d3()
values['b3PatternProb'] = float(dense['zero']['minChance'])
values['b3MeasProb'] = float(dense['zero']['pPlus'])
values['b3PlusPlusProb'] = float(dense['plus']['pPlus'])
values['b3SplitProb'] = float(dense['split']['chance'])
values['b3FrameSign'] = float(dense['split']['flips'])
cs = bn.cnot_stats()
values['b3CnotProb'] = float(cs['chance'])
values['b3CnotNoFix'] = float(cs['noFix'])
values['b3CnotZFix'] = float(cs['zFix'])
values['b3CnotXFix'] = float(cs['xFix'])
values['b3MergeN5'] = float(m5['n'])
values['b3NewX5'] = float(m5['new'])
values['b3WidenZ5'] = float(m5['widened'])

# ---- b3-gauging
patch = bn.host_system('patch3-x')
ladder = bn.host_system('patches3-xx', rungs=3)
seam = bn.host_system('seam3')
values['b3GaugeV'] = float(patch['V'])
values['b3GaugeE'] = float(patch['E'])
values['b3ProdGauss'] = float(patch['productOk'])
values['b3CycleRank'] = float(ladder['cycles'])
values['b3GaugedN'] = float(ladder['n'])
values['b3GaugedK'] = float(ladder['kAfter'])
values['b3GaugeGrowth'] = float(ladder['growth'])
values['b3EdgeQubits1'] = float(seam['E'])
values['b3EdgeQubits2'] = float(ladder['E'])
values['b3MergedDist1'] = float(seam['dX'])
values['b3MergedDist2'] = float(seam['dZ'])
values['b3LadderDist1'] = float(ladder['dX'])
values['b3LadderDist2'] = float(ladder['dZ'])

# ---- b3-distance
rungs = {r: bn.host_system('patches3-xx', rungs=r) for r in (1, 2, 3)}
for r in (1, 2, 3):
    values[f'b3DistTable{r}'] = float(rungs[r]['dX'])
    values[f'b3Cycles{r}'] = float(rungs[r]['cycles'])
    values[f'b3Cheeger{r}'] = float(rungs[r]['h'])
values['b3CheegerR1'] = values['b3Cheeger1']
values['b3CheegerR2'] = values['b3Cheeger2']
for i, dr in enumerate((0, 1, 2), start=1):
    s = bn.host_system('patches3-xx', rungs=3, drop=dr)
    values[f'b3GaugeQubits{i}'] = float(s['kTotal'] - s['kAfter'])
p = bn.prod_flip(0.02, 4)
for key in ('b3ProdFlip', 'b3ProdFlip2'):
    values[key] = float(p)
for i, R in enumerate((1, 3, 5, 7, 9, 11), start=1):
    values[f'b3RoundsFail{i}'] = float(bn.vote_fail(R, p))
values['b3RoundsFail4b'] = values['b3RoundsFail4']
values['b3RoundsFail3b'] = values['b3RoundsFail3']
values['b3VoteRatio'] = float(4 * p * (1 - p))
values['b3VoteRatio2'] = values['b3VoteRatio']
values['b3RoundsFor1e3'] = float(bn.rounds_for(p, 1e-3))

# ---- b3-bridges
for w in (1, 2, 3):
    s = bn.host_system('patches3-xx', rungs=w)
    values[f'b3BridgeCycles{w}'] = float(s['cycles'])
    values[f'b3BridgeDist{w}'] = float(s['d'])
values['b3BridgeChecks'] = values['b3BridgeCycles3']
st = {w: bn.host_system('patch3-steane', w=w) for w in (1, 2, 3)}
values['b3AdapterN'] = float(st[3]['n'])
values['b3AdapterK'] = float(st[3]['kAfter'])
values['b3AdapterCycles'] = float(st[3]['cycles'])
values['b3AdapterDist'] = float(st[3]['d'])
for w in (1, 2, 3):
    values[f'b3AdapterSize{w}'] = float(st[w]['d'])
    values[f'b3AdapterH{w}'] = float(st[w]['h'])
good = 0
for perm in itertools.permutations(range(3)):
    s = bn.host_system('patch3-steane', w=3, order=perm)
    good += 1 if abs(s['h'] - 1.0) < 1e-12 and s['d'] == 3 else 0
values['b3AdapterOrders'] = float(good)

out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-papers' / 'b3.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'source': 'pipeline/claims_papers/b3.py', 'values': values}, indent=2, sort_keys=True) + '\n')
print(f'wrote {out.relative_to(ROOT)}: {len(values)} values')
