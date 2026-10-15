#!/usr/bin/env python3
"""Numpy twins for every computed claim key of the Papers background chapter B4 (app/src/content/papers/B4.paper.ts).

A paper spec's computed claims cite a recipe's named output (app/src/papers/recipes.qec.ts, engine in app/src/physics/qec/{magic,pbc,inject,postselect,tcount}.ts); the claim ledger
(app/src/content/claims.test.ts) checks each engine value against the twin written here, at 1e-12.

Independent route from the engine (no TypeScript runs here; every object is rebuilt from its definition by pipeline/b4_numpy.py):
  - the Clifford group is the closure of the 2 x 2 unitaries H and S modulo phase, and the orbits are the images of the Bloch vector of a state under it;
  - the 15-qubit code is checked by testing all 2^15 flip patterns against four bit masks; acceptance and output error are sums of exact Fractions, the threshold a bisection on Fractions;
  - the compiler slides Cliffords with DENSE matrices (the axis of each T gate is read back from the 4^n Pauli basis), layers come from dense commutators, and the product of the pieces is
    compared with the circuit; the textbook circuit is also compared with the Toffoli matrix;
  - teleportation, the general injection and the absorbed measurement run on dense state vectors; the executed axes use dense 2 x 2 matrices for the pending Clifford;
  - the staged time is a 2-state linear system, the mean tries a long series, the gap table a loop over all 2^n flip patterns, the T-count sets a vectorised breadth-first search.
Units: none (counts, chances, ratios and degrees where a key says so). Mantissas (keys ending in M) are the value divided by its power of ten.

Usage (from the repo root): python3 pipeline/claims_papers/b4.py -> app/src/physics/__fixtures__/claims-papers/b4.json
Checked by app/src/content/claims.test.ts. The output is deterministic (no clock, fixed seeds): two runs write byte-identical files.
"""
import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / 'pipeline'))
import b4_numpy as bn  # noqa: E402

values = {}


def sci_mantissa(x):
    e = np.floor(np.log10(x))
    return float(x / 10.0**e)


# ---- b4-beyond-clifford
mg = bn.magic_block()
values['b4CliffordCount'] = float(mg['cliffordCount'])  # b1
values['b4OrbitStab'] = float(mg['orbitStab'])
values['b4L1Magic'] = float(mg['l1Magic'])
values['b4OrbitH'] = float(mg['orbitH'])  # b2
values['b4OrbitT'] = float(mg['orbitT'])
values['b4L1TType'] = float(mg['l1TType'])
values['b4OctaEdge'] = float(mg['octaEdge'])  # b3
values['b4DepolInside'] = float(mg['l1Magic'] * (1 - 2 * 0.15))
values['b4L1Out'] = float(mg['l1Magic'] * (1 - 2 * 0.125))  # b5
ht = bn.ht_block()
values['b4HTAngleDeg'] = float(ht['angleDeg'])  # b4
values['b4HTTurns'] = float(ht['turns'])
values['b4HTClose1'] = float(ht['close'][0])
values['b4HTClose2'] = float(ht['close'][1])
values['b4HTClose3'] = float(ht['close'][2])

# ---- b4-pbc
pb = bn.pbc_block()
values['b4ConjChanged'] = float(pb['changedByZturn'])  # b1
values['b4TextbookGates'] = float(pb['textbookGates'])  # b2
values['b4ToffoliRots'] = float(pb['textbookRots'])
values['b4FinalIdentity'] = float(pb['textbookFinalIdentity'])
values['b4ToffoliDepth'] = float(pb['textbookLayers'])  # b3
values['b4ToffoliSame'] = float(pb['sameSet'])
values['b4HChanged'] = float(pb['phaseChanged'])
values['b4CnotRotations'] = float(pb['cnotRotations'])  # b4
values['b4CnotMatches'] = float(pb['cnotMatches'])
ab = bn.absorb_block()
values['b4AbsorbBad'] = float(ab['bad'])  # b5
values['b4AbsorbCases'] = float(ab['cases'])

# ---- b4-injection
tp = bn.teleport_block()
real0 = tp['real'][0]
c0 = complex(*real0['data'][0])
c1 = complex(*real0['data'][1])
values['b4InjectProb'] = float(real0['prob'])  # b1
values['b4InjectPhase'] = float(np.degrees(np.angle(c1 / c0)))
values['b4InjectFid'] = float(tp['fidelityMin'])  # b2
inj = bn.inject_general_block()
values['b4InjectProbs'] = float(inj['probMin'])  # b3
ax = bn.axes_block()
values['b4AxisSwap'] = float(sum(1 for e, p in zip(ax['ZX_10'], 'ZX') if e.lstrip('+') != p))  # b4
values['b4AxisHistories'] = float(ax['ZXZX']['distinct'])
values['b4AxisSame'] = float(ax['ZZZ']['distinct'])  # b5

# ---- b4-distill
fc = bn.fifteen_block()
ds = bn.distill_block()
values['b4BlochLen'] = float(1 - 2 * 0.01)  # b1
values['b4XChecks'] = float(fc['xChecks'])  # b2
values['b4XWeight'] = float(fc['xWeight'])
values['b4ZChecks'] = float(fc['zChecks'])
values['b4D15X'] = float(fc['dX'])
values['b4D15Z'] = float(fc['dZ'])
values['b4TransPhase'] = float(fc['phase1'][0])
values['b4Weight3'] = float(fc['a3'])  # b3
values['b4Weight4'] = float(fc['a4'])
values['b4Lead35'] = float(ds['lead35at1e3'])
values['b4Accept1e2'] = float(ds['1e2']['accept'])  # b4
values['b4Out1e2M'] = sci_mantissa(ds['1e2']['out'])
values['b4Accept1e3'] = float(ds['1e3']['accept'])
values['b4Out1e3M'] = sci_mantissa(ds['1e3']['out'])
values['b4Level2M'] = sci_mantissa(ds['level2'])
values['b4Threshold'] = float(ds['threshold'])
values['b4InputsPer'] = float(ds['inputsPer1e3'])
values['b4Lead35p4M'] = sci_mantissa(ds['lead35p4'])  # b5

# ---- b4-cultivate
po = bn.post_block()
gp = bn.gap_block()
values['b4Mean5'] = float(po['mean5'])  # b2
values['b4Mean035'] = float(po['mean035'])
values['b4S2'] = float(po['s2'])  # b3
values['b4StagedTime'] = float(po['time'])
values['b4StagedNoAbort'] = float(po['noAbort'])
values['b4Esc3'] = float(po['esc3'])  # b4
values['b4Esc5'] = float(po['esc5'])
values['b4Keep3'] = float(po['keep3'])
values['b4Keep5'] = float(po['keep5'])
values['b4Tries3'] = float(bn.attempts_series(po['keep3'], 20000))
values['b4Tries5'] = float(bn.attempts_series(po['keep5'], 40000))
values['b4AttemptRatio'] = float(po['ratio'])
values['b4GapNoCut'] = float(gp['noCut'])  # b5
values['b4GapKeep3'] = float(gp['keep3'])
values['b4GapErr3M'] = sci_mantissa(gp['err3'])
values['b4GapKeep5'] = float(gp['keep5'])
values['b4GapErr5M'] = sci_mantissa(gp['err5'])
values['b4GapKeep7'] = float(gp['keep7'])  # b6
values['b4GapErr7M'] = sci_mantissa(gp['err7'])

# ---- b4-synthesis
tc = bn.tcount_block()
for k, c in enumerate(tc['counts']):  # b1
    values[f'b4TCountSets{k}'] = float(c)
values['b4TCountSlope'] = float(tc['slope'])  # b2
values['b4TExact'] = float(1.0 if tc['exactT'][1] < 1e-6 else 0.0)  # b4
values['b4Pi8Err'] = float(tc['pi8'][3])
values['b4LawEps3'] = float(3 * np.log2(1 / 1e-3))  # b3
values['b4LawEps6'] = float(3 * np.log2(1 / 1e-6))
values['b4LawEps10'] = float(3 * np.log2(1 / 1e-10))
values['b4LawDecade'] = float(3 * np.log2(10))

out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-papers' / 'b4.json'
out.write_text(json.dumps({'source': 'pipeline/claims_papers/b4.py', 'values': values}, indent=2, sort_keys=True) + '\n')
print(f'wrote {out.relative_to(ROOT)}: {len(values)} keys')
