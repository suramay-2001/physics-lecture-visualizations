#!/usr/bin/env python3
"""Numpy twins for every computed claim key of the paper lecture P1, Tour de gross (app/src/content/papers/P1.paper.ts).

A paper spec's computed claims cite a recipe's named output (app/src/papers/recipes.tdg.ts, engine app/src/physics/qec/tdg.ts and its neighbours); the claim ledger
(app/src/content/claims.test.ts) checks each engine value against the twin written here, at 1e-12.

Independent route from the engine (nothing from TypeScript runs here; pipeline/tdg_numpy.py rebuilds every object from the paper's printed inputs):
  - the logical action of a shift is found by symplectic pairing with the dual basis, the native sets by explicit enumeration of images, the LPU graph sizes from dense overlaps;
  - Eq. 82 is a 50-digit Decimal sum with exact integer binomials; the machine, yield, cultivation and surface-code arithmetic are plain Python and numpy;
  - the Bell-check demonstration runs on a dense state vector and the T injection on a dense 2 x 2 teleportation;
  - the Fig. 9 means are read from the offline fixture of pipeline/tdg_fig9.py (a 4^11-state search checked separately in tdgFig9.test.ts).
Units: none (counts, chances, ratios). Mantissas (keys ending in M or a printed decimal of scientific notation) are the value divided by its power of ten.

Usage (from the repo root): python3 pipeline/claims_papers/p1.py -> app/src/physics/__fixtures__/claims-papers/p1.json
Checked by app/src/content/claims.test.ts. The output is deterministic (no clock, fixed inputs): two runs write byte-identical files.
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / 'pipeline'))
import tdg_numpy as T  # noqa: E402

v = {}
sci = T.sci

# ---------------------------------------------------------------- criteria
gp = T.parts('gross', '1e-3')
v['p1N3'] = float(11 * 3)
v['p1C'] = float(gp['c'])
v['p1PerLogical'] = (gp['c'] + gp['u']) / 12
v['p1Surf13x12'] = float(12 * (2 * 13 * 13 - 1))
v['p1Ratio13'] = 12 * (2 * 13 * 13 - 1) / (gp['c'] + gp['u'])
v['p1Yield5000'] = float(round(T.yield_(5000)['oneIn']))
v['p1Q17x12'] = float(12 * 2 * 17 * 17)
v['p1YieldMod17'] = float(round(T.yield_(6936)['oneIn']))

# ---------------------------------------------------------------- modules
v['p1A'] = float(gp['a'])
v['p1APrime'] = float(gp['aPrime'])
v['p1DataPer'] = float(12 - 1)
v['p1DataShare'] = (12 - 1) / 12
v['p1Data33'] = float(3 * (12 - 1))
basic = [(1, 0), (0, 1), (3, -1), (1, 3), (3, -2), (2, 3)]
bits15 = list(range(1, 16))  # bit 0 = X1, 1 = Z1, 2 = X7, 3 = Z7
left = [m for m in bits15 if m & 0b0110 == 0]
right = [m for m in bits15 if m & 0b1001 == 0]
v['p1NShift'] = float(2 * len(basic))
v['p1NIn'] = float(len(bits15))
v['p1NInter'] = float((len(left) + len(right)) ** 2)
v['p1NT'] = float(len(['X1', 'Y1', 'Z1', 'X7', 'Y7', 'Z7']))
v['p1TauI'] = float(8)
v['p1TauU'] = float(4 + 2 + 8)
v['p1TauM'] = float(12 * 10)
v['p1TauM2g'] = float(12 * 18)
v['p1PerSide'] = float(len(left) + len(right))
v['p1Pairs225'] = float(len(bits15) * len(bits15))

# ---------------------------------------------------------------- gross
bg = T.basis_facts('gross')
bt = T.basis_facts('two-gross')
code = T.code_data('gross')['code']
ovl = code.HZ.astype(int) @ T.code_data('gross')['X'][0].astype(int)
G = bg['G']
v['p1GrossN'] = float(bg['n'])
v['p1GrossK'] = float(bg['k'])
v['p1Wt'] = float(bg['checkWeight'])
v['p1X1Wt'] = float(bg['weights'][0])
v['p1X1MeetsMin'] = float(bg['meetsMin'])
v['p1X1MeetsMax'] = float(bg['meetsMax'])
v['p1X1Share'] = float((ovl == 2).sum()) / bg['cells']
v['p1BasisWtMin'] = float(min(bg['weights']))
v['p1BasisWtMax'] = float(max(bg['weights']))
v['p1OverlapY'] = float(min(bg['overlaps'][:2]))
v['p1OverlapOthers'] = float(max(bg['overlaps'][2:]))
v['p1PairDiag'] = float(np.trace(G))
v['p1PairOff'] = float(G.sum() - np.trace(G))
v['p1RankAbove'] = float(bg['rankAbove'])
v['p1TwoN'] = float(bt['n'])
v['p1TwoK'] = float(bt['k'])
v['p1TwoWt'] = float(bt['weights'][0])

# ---------------------------------------------------------------- idle and shift
v['p1GrossChecks'] = float(2 * bg['cells'])
v['p1Cycle10'] = float(8 * 10 + 1)


def run(nq, gates):
    psi = np.zeros(2 ** nq, dtype=complex)
    psi[0] = 1
    H = np.array([[1, 1], [1, -1]]) / math.sqrt(2)
    for g in gates:
        if g[0] == 'H':
            t = g[1]
            psi = psi.reshape([2] * nq)
            psi = np.moveaxis(np.tensordot(H, np.moveaxis(psi, t, 0), axes=1), 0, t).reshape(-1)
        else:
            c, t = g[1], g[2]
            new = psi.copy()
            for i in range(2 ** nq):
                bits = [(i >> (nq - 1 - k)) & 1 for k in range(nq)]
                if bits[c]:
                    if g[0] == 'CNOT':
                        new[i ^ (1 << (nq - 1 - t))] = psi[i]
                    else:
                        new[i] = -psi[i] if bits[t] else psi[i]
            psi = new
    return np.abs(psi) ** 2


pr = run(4, [('H', 2), ('CNOT', 2, 3), ('H', 0), ('H', 1), ('CZ', 2, 0), ('CZ', 3, 1), ('H', 2), ('H', 3)])
v['p1BellP'] = float(pr[0])  # string 0000
v['p1BellMiss'] = float(pr[1])  # string 0001: ancilla parity differs from the data parity
v['p1BasicShifts'] = float(2 * len(basic))
bx = T.blocks('gross', 1, 0, 'x')
ss = T.shift_summary('gross')
v['p1ImgX1a'] = float(bx['col0'][0])
v['p1ImgX1b'] = float(bx['col0'][1])
v['p1AxGap'] = float(bx['gapUpper'])
v['p1Order'] = float(ss['order'])
v['p1Classes'] = float(ss['classes'])
v['p1MaxFactors'] = float(ss['maxFactors'])
v['p1AxLowerT'] = float(bx['gapLowerT'])
v['p1AxLowerDiff'] = float(bx['gapLowerPrinted'])
M6 = T.acts('gross')[(6, 0)]
v['p1X6Id'] = float(1 if (M6 == np.eye(12, dtype=np.uint8)).all() else 0)
v['p1Shifts72'] = float(len(T.acts('gross')))
v['p1Nontrivial'] = float(ss['classes'] - 1)

# ---------------------------------------------------------------- LPU
lg = T.lpu('gross')
lt = T.lpu('two-gross')
v['p1GlV'], v['p1GlE'], v['p1GlRank'] = float(lg['lV']), float(lg['lE']), float(lg['lRank'])
v['p1GrV'], v['p1GrE'] = float(lg['rV']), float(lg['rE'])
v['p1LpuV'], v['p1LpuVq'], v['p1LpuE'], v['p1LpuRank'], v['p1LpuKept'], v['p1U'] = (float(lg[k]) for k in ('V', 'Vq', 'E', 'rank', 'kept', 'u'))
v['p1ModeL'], v['p1ModeR'], v['p1ModeF'] = float(len(left)), float(len(right)), float(len(bits15) - len(left) - len(right))
v['p1ShareHalf'] = len(left) / len(bits15)
v['p1Gl2gV'] = float(lt['lV'])
v['p1Gl2gE'] = float(lt['lEbase'])
v['p1Lpu2gV'], v['p1Lpu2gVq'], v['p1Lpu2gE'], v['p1Lpu2gKept'], v['p1Lpu2gRank'], v['p1U2g'] = (float(lt[k]) for k in ('V', 'Vq', 'E', 'kept', 'rank', 'u'))

# ---------------------------------------------------------------- between
v['p1A2g'] = float(T.parts('two-gross', '1e-3')['a'])
v['p1JoinCycles'] = float(lg['bridge'] - 1)
v['p1HalfD6'] = float(math.ceil((12 - 1) / 2))
v['p1HalfD9'] = float(math.ceil((18 - 1) / 2))
v['p1ApG3'] = float(T.parts('gross', '1e-3')['aPrime'])
v['p1ApG4'] = float(T.parts('gross', '1e-4')['aPrime'])
v['p1ApT4'] = float(T.parts('two-gross', '1e-4')['aPrime'])
# T injection by teleportation on dense vectors: CNOT(data -> magic), read the magic qubit; outcome 1 is fixed by S
th = 0.7
psi = np.array([math.cos(th / 2), math.sin(th / 2)], dtype=complex)
w = np.exp(1j * math.pi / 4)
magic = np.array([1, w]) / math.sqrt(2)
joint = np.kron(psi, magic).reshape(2, 2)
after = np.zeros((2, 2), dtype=complex)
after[0, :] = joint[0, :]
after[1, :] = joint[1, ::-1]  # CNOT with control = data
b0 = after[:, 0] / np.linalg.norm(after[:, 0])
target = np.array([psi[0], psi[1] * w])
v['p1InjFid'] = float(abs(np.vdot(target, b0)) ** 2)
esc3, cult3, exact3 = T.cultivation(3)
v['p1Esc3'] = esc3
v['p1Coef1'] = 1.54
v['p1Coef2'] = 3.23
v['p1Cult3'] = cult3
v['p1Cult3Exact'] = exact3
v['p1FactRatio'] = 2e-8 / 2e-9
v['p1Dist4g'] = 6 * 18.1
v['p1Dist4tg'] = 6 * 67.8
pc3 = T.piid('g-XxX', 1e-3)
v['p1PC3'] = sci(pc3)[0]
v['p1PT3'] = sci(3e-6 + pc3)[0]

# ---------------------------------------------------------------- benchmark
v['p1QFaults'] = float(4 ** 2 - 1)
v['p1W0G'] = float(math.ceil(10 / 2))
v['p1W0T'] = float(math.ceil(18 / 2))
v['p1Slope'] = (math.log10(T.piid('g-idle', 1e-5)) - math.log10(T.piid('g-idle', 1e-6))) / (math.log10(1e-5) - math.log10(1e-6))
v['p1NlGIdle3'] = -math.log10(T.piid('g-idle', 1e-3))
v['p1NlGAut3'] = -math.log10(T.piid('g-aut', 1e-3))
v['p1NlGY3'] = -math.log10(T.piid('g-Y', 1e-3))
v['p1NlGC3'] = -math.log10(pc3)
v['p1NlTIdle3'] = -math.log10(T.piid('2g-idle', 1e-3))
v['p1NlTAut3'] = -math.log10(T.piid('2g-aut', 1e-3))
v['p1P2gIdle3'] = sci(T.piid('2g-idle', 1e-3))[0]
v['p1Surf17'] = sci(0.1 * (1e-3 / 1e-2) ** (17 / 2))[0]
v['p1PerFail4'] = sci(1 / T.piid('g-XxX', 1e-4))[0]

# ---------------------------------------------------------------- compile
textbook = ['H', 'CNOT', 'Tdg', 'CNOT', 'T', 'CNOT', 'Tdg', 'CNOT', 'T', 'T', 'H', 'CNOT', 'T', 'Tdg', 'CNOT']  # the 15 gates of the textbook Toffoli (p1PbcRots = its T count)
v['p1PbcRots'] = float(sum(1 for g in textbook if g in ('T', 'Tdg')))
v['p1M33'] = float(math.ceil(33 / 11))
v['p1ZZ33'] = float(math.ceil(33 / 11) - 1)
nat = T.native('gross')
v['p1Native'], v['p1NatRot'], v['p1NatRotAll'], v['p1PivotI'] = (float(nat[k]) for k in ('native', 'rot', 'rotAll', 'pivotI'))
v['p1Beta0'] = float(1 + 6 * 0)
v['p1Beta4'] = float(1 + 6 * 4)
fig9 = json.loads((ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'tdg-fig9.json').read_text())


def fig9_mean(code_name, reading):
    return fig9['codes'][code_name][reading]['minOverQ']['mean']


v['p1Off245G'] = fig9_mean('gross', 'rotations245')
v['p1Off245T'] = fig9_mean('two-gross', 'rotations245')
v['p1Off510G'] = fig9_mean('gross', 'rotations510')
v['p1Off510T'] = fig9_mean('two-gross', 'rotations510')
v['p1RsT'] = 3 * math.log2(1 / 5e-9)
NR = T.tfim_rotations()
v['p1TPerRot'] = 1.5542e7 / NR
v['p1M100'] = float(math.ceil(100 / 11))
v['p1ZZ100'] = float(math.ceil(100 / 11) - 1)

# ---------------------------------------------------------------- bill
for i, (c, f, b) in enumerate(T.FIG10A_BIC, start=1):
    v[f'p1Fig10aN{i}'] = float(11 * T.max_modules(c, b, f))
v['p1Q8138'] = float(T.q_of('two-gross', 10, '1e-3'))
v['p1Q4801'] = float(T.q_of('gross', 10, '1e-4'))
v['p1Q4817a29'] = float(T.q_of('gross', 10, '1e-4', 29))
v['p1QGap'] = v['p1Q4817a29'] - v['p1Q4801']
surf = [T.surface_row(*r) for r in T.FIG10A_SURF]
for i, (c, f, b) in enumerate(T.FIG10A_BIC, start=1):
    v[f'p1NRatio{i}'] = 11 * T.max_modules(c, b, f) / surf[i - 1][0]
v['p1RowD5N'] = float(surf[0][0])
v['p1RowD5Nt'] = surf[0][1]
n50 = (5000 - 0) // (4 * 5 * 5)
v['p1RowD5N50'] = float(n50)
v['p1RowD5NtN50'] = (1 / 3) / (2 * n50 * 0.03 * (1e-3 / 0.01) ** (5 / 2) * 5)
v['p1NR'] = float(NR)
v['p1CapFail'] = 1 / 3
v['p1TPerRot2'] = 1.5542e7 / NR
v['p1Fail4'] = T.tfim('gross', 1e-4)
v['p1Fail3'] = sci(T.tfim('gross', 1e-3))[0]
v['p1CrossG'] = sci(T.crossing('gross')[1])[0]
v['p1CrossT'] = sci(T.crossing('two-gross')[1])[0]
for d in (7, 9, 17, 19):
    v[f'p1ThM{d}'] = sci(T.eq96(d, 1.5542e7))[0]
    v[f'p1ThT{d}'] = sci(T.eq96(d, 1.9e7))[0]
v['p1FamN1'] = float(T.family(1, 0)[0])
v['p1FamK'] = float(T.family(1, 0)[1])
v['p1FamRatio3'] = T.family(2, 0)[3]
v['p1FamRatio5'] = T.family(3, 0)[3]
v['p1Limit'] = 12 * (12 * 12) / 72

v = {k: float(x) for k, x in v.items()}
out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-papers' / 'p1.json'
out.write_text(json.dumps({'source': 'pipeline/claims_papers/p1.py', 'values': v}, indent=2, sort_keys=True) + '\n')
print(f'wrote {out.relative_to(ROOT)}: {len(v)} keys')
