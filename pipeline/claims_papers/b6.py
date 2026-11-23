#!/usr/bin/env python3
"""Numpy/scipy twins for every computed claim key of the Papers background chapter B6 "Readout in the error-correction cycle" (app/src/content/papers/B6.paper.ts),
and for the challenge answers and engine checks of app/src/physics/qec/timing.ts (app/src/physics/__fixtures__/timing-b6.json).

The claim ledger (app/src/content/claims.test.ts) checks each engine value against the twin written here, at 1e-12. Routes differ from the engine's:
  - the idle chances: the amplitude-damping and dephasing channels built from Kraus operators, composed, and Pauli-twirled through the chi diagonal (the engine uses the closed
    form of Tomita and Svore, Eqs. 9-10); the Bloch shrink factors read from the same chi diagonal;
  - readout error: scipy.stats.poisson over every whole cutoff (the engine scans the same cutoffs with its own Poisson sums);
  - the toy optimum: a grid of 0.05 ms steps (numpy argmin); a bounded scipy minimiser checks the engine's golden-section refinement to 1e-4 (an engine check, not a claim);
  - the vote and the leading term: scipy.special.comb and a brute-force enumeration of all 2^d patterns for small d; elementary symmetric polynomials by itertools.combinations;
    the Poisson-binomial tail by a dynamic programme over the count;
  - the pipeline: a one-server event simulation (one acquisition chain, one classifier) and the closed forms;
  - loss: closed forms on reported inputs.
Inputs T1, T2, the photon rates, the gate error and the distance are OUR toy values ("model, not data"); the paper prints none of them.
Usage (repo root): python3 pipeline/claims_papers/b6.py. Deterministic: two runs write byte-identical files.
"""
import itertools
import json
import math
from pathlib import Path

import numpy as np
from scipy.optimize import minimize_scalar
from scipy.special import comb
from scipy.stats import poisson

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / 'app' / 'src' / 'physics' / '__fixtures__'

values = {}
extra = {}  # engine checks and challenge answers (not claim keys)


def sci(key, x):
    """x = M * 10^-E with M in [1, 10): store key+'M' and key+'E'."""
    e = -math.floor(math.log10(x))
    values[key + 'M'] = x * 10.0 ** e
    values[key + 'E'] = float(e)


# ---------------------------------------------------------------- the idle chances: Kraus channels, Pauli twirl through the chi diagonal
def twirl_chi(t, T1, T2):
    gam = 1 - math.exp(-t / T1)
    coh = math.exp(-t / T2)
    lam = 1 - (coh / math.sqrt(1 - gam)) ** 2
    A = [np.array([[1, 0], [0, math.sqrt(1 - gam)]]), np.array([[0, math.sqrt(gam)], [0, 0]])]
    P = [np.array([[1, 0], [0, math.sqrt(1 - lam)]]), np.array([[0, 0], [0, math.sqrt(lam)]])]
    K = [b @ a for a in A for b in P]
    paulis = [np.eye(2), np.array([[0, 1], [1, 0]]), np.array([[0, -1j], [1j, 0]]), np.array([[1, 0], [0, -1]])]
    return [float(sum(abs(np.trace(Pp.conj().T @ k) / 2) ** 2 for k in K)) for Pp in paulis]


def twirl(tms, T1, T2):
    chi = twirl_chi(tms / 1000.0, T1, T2)
    return chi[1], chi[2], chi[3]


def shrink(px, py, pz):
    return 1 - 2 * (py + pz), 1 - 2 * (px + pz), 1 - 2 * (px + py)


def idle_block(prefix, T1, T2, tms):
    px, py, pz = twirl(tms, T1, T2)
    lx, ly, lz = shrink(px, py, pz)
    t = tms / 1000.0
    # the damped Bloch vector: z shrinks by exp(-t/T1), x and y by exp(-t/T2)
    assert abs(lx - math.exp(-t / T2)) < 1e-12 and abs(lz - math.exp(-t / T1)) < 1e-12
    return px, py, pz, lx, lz


# the chapter's toy: T1 = 10 s, T2 = 1 s, a wait of 4 ms
T1, T2 = 10.0, 1.0
px, py, pz, lx, lz = idle_block('', T1, T2, 4.0)
values['b6InT1'] = T1
values['b6InT2'] = T2
sci('b6PxPy', px)
sci('b6Pz', pz)
sci('b6IdleTotal4ms', px + py + pz)
small = 0.004 / (4 * T1) + 0.004 / (2 * T2)
values['b6IdleSmallT'] = small
values['b6IdleSmallRatio'] = (px + py + pz) / small
values['b6ShrinkXY'] = lx
values['b6ShrinkZ'] = lz
values['b6PzOverPx'] = pz / px
# other waits used in the prose (a long wait and a short one)
px32, py32, pz32, _, _ = idle_block('', T1, T2, 32.0)
# the clue: T1 = 2 s, T2 = 0.4 s, 20 ms; and T1 = infinity (a huge T1), T2 = 1 s, 10 ms
cpx, cpy, cpz, _, _ = idle_block('', 2.0, 0.4, 20.0)
values['b6ClueTwPz'] = cpz
values['b6ClueInT2'] = 0.4
ipx, ipy, ipz, _, _ = idle_block('', 1e12, 1.0, 10.0)
values['b6ClueTwInf'] = ipx + ipy + ipz
# challenges: p_Z in percent at 50 ms with T1 = 5, T2 = 0.5; total at T1 = infinity, T2 = 0.25, 10 ms
qx, qy, qz, _, _ = idle_block('', 5.0, 0.5, 50.0)
extra['ch.twirl.pzPct'] = 100 * qz
wx, wy, wz, _, _ = idle_block('', 1e12, 0.25, 10.0)
extra['ch.twirl.infPct'] = 100 * (wx + wy + wz)
extra['eng.twirl.chi.4ms'] = [px, py, pz]
extra['eng.twirl.chi.200ms'] = list(twirl(200.0, T1, T2))
# a point of the small-t rule at 1 ms and 100 ms, to check the engine's closed form
for t in (1.0, 100.0):
    a, b, c = twirl(t, T1, T2)
    extra[f'eng.idleTotal.{t}'] = a + b + c
    extra[f'eng.idleSmallT.{t}'] = t / 1000.0 / (4 * T1) + t / 1000.0 / (2 * T2)

# ---------------------------------------------------------------- readout error, the toy U-curve
RB, RG = 6.0, 0.3
PG, PTH, A_ = 0.002, 0.01, 0.03
values['b6InRb'] = RB
values['b6InRg'] = RG
values['b6InPg'] = PG
values['b6InPth'] = PTH
values['b6InA'] = A_


def pm(tms):
    mb, md = RB * tms, RG * tms
    return min(0.5 * (poisson.sf(c - 1, md) + poisson.cdf(c - 1, mb)) for c in range(0, 300))


def peff(tms):
    a, b, c = twirl(tms, T1, T2)
    return PG + a + b + c + pm(tms)


def pL(tms, d):
    return A_ * (peff(tms) / PTH) ** ((d + 1) / 2)


values['b6PmAt1ms'] = pm(1.0)
values['b6PmAt2ms'] = pm(2.0)
sci('b6PmAt4ms', pm(4.0))
for t in (2, 4, 10):
    values[f'b6PeffAt{t}'] = peff(float(t))
grid = np.arange(1, 400 + 1) * 0.05
pe = np.array([peff(float(x)) for x in grid])
imin = int(np.argmin(pe))
tstar = float(grid[imin])
values['b6TStar'] = tstar
values['b6PeffStar'] = float(pe[imin])
assert 0 < imin < len(grid) - 1 and pe[0] > pe[imin] and pe[-1] > pe[imin]
for d in (3, 11, 25):
    pl = np.array([pL(float(x), d) for x in grid])
    assert float(grid[int(np.argmin(pl))]) == tstar, f'argmin independent of d = {d}'
values['b6TStarD11'] = tstar
extra['ch.ucurve.argmin.d3.d11.d25'] = tstar
for d in (3, 11):
    values[f'b6Amp2tstarD{d}'] = pL(2 * tstar, d) / pL(tstar, d)
sci('b6PLStarD11', pL(tstar, 11))
sci('b6PLAt10msD11', pL(10.0, 11))
values['b6Peff1OverPth'] = peff(1.0) / PTH
# the engine's golden-section refinement, checked against a bounded scipy minimiser on the same bracket (an engine check)
r = minimize_scalar(peff, bounds=(tstar - 0.05, tstar + 0.05), method='bounded', options={'xatol': 1e-9})
extra['eng.refine.tstar'] = float(r.x)

# ---------------------------------------------------------------- why (d+1)/2: the vote, the leading term, unequal rates
def repfail(d, p):
    return float(sum(comb(d, k) * p ** k * (1 - p) ** (d - k) for k in range((d + 1) // 2, d + 1)))


def lead(d, p):
    return float(comb(d, (d + 1) // 2) * p ** ((d + 1) // 2))


for d in (3, 5, 7, 11, 13):
    sci(f'b6Rep{d}', repfail(d, 0.001))
    values[f'b6RepRatio{d}'] = repfail(d, 0.001) / lead(d, 0.001)
values['b6InP'] = 0.001
# brute-force enumeration of all 2^d patterns (small d), a check of the closed sum
for d, p in ((3, 0.1), (5, 0.1), (7, 0.05)):
    bf = sum(p ** sum(b) * (1 - p) ** (d - sum(b)) for b in itertools.product((0, 1), repeat=d) if sum(b) >= (d + 1) // 2)
    assert abs(bf - repfail(d, p)) < 1e-15
extra['eng.vote.5.0.1'] = repfail(5, 0.1)
extra['eng.vote.7.0.05'] = repfail(7, 0.05)
# mixed rates: 5 places at 0.001, 6 at 0.005, k = 6
ps = [0.001] * 5 + [0.005] * 6


def esym(rates, k):
    return sum(math.prod(c) for c in itertools.combinations(rates, k))


e6 = esym(ps, 6)
pbar = sum(ps) / len(ps)
bound = comb(11, 6) * pbar ** 6
dp = np.zeros(len(ps) + 1)
dp[0] = 1
for q in ps:
    dp = dp * (1 - q) + np.r_[0, dp[:-1]] * q
exact_mixed = float(dp[6:].sum())
sci('b6E6', e6)
sci('b6MaclaurinBound', float(bound))
values['b6MaclaurinRatio'] = e6 / float(bound)
sci('b6MixedExact', exact_mixed)
assert e6 <= bound * (1 + 1e-12)
extra['eng.esym.equal'] = esym([0.003] * 11, 6)
extra['eng.esym.mixed.k3'] = esym(ps, 3)
extra['eng.tail.mixed.k4'] = float(dp[4:].sum())
# the clue and challenge answers
extra['ch.fault.exp15'] = (15 + 1) // 2
extra['ch.fault.amp7'] = 2 ** ((7 + 1) // 2)
extra['ch.fault.vote3.0.1'] = repfail(3, 0.1)
values['b6ClueExp9'] = float((9 + 1) // 2)
values['b6ClueAmp5'] = float(2 ** ((5 + 1) // 2))
values['b6ClueVote'] = repfail(3, 0.2)

# ---------------------------------------------------------------- the cycle: parts and shares (Table 1 times are reported inputs; the arithmetic is ours)
def share(layers, tgate_us, tmove, tread, treset=0.0):
    gate = layers * tgate_us / 1000.0
    return gate, tread / (gate + tmove + tread + treset)


g, f = share(4, 0.4, 0.0, 1.0)
values['b6GateTimeMs'] = g
values['b6ReadFrac'] = f
values['b6ReadFracMove'] = share(4, 0.4, 0.2, 1.0)[1]
values['b6ReadFracSC'] = share(4, 0.034, 0.0, 0.0005)[1]
values['b6RatioAtom'] = 1.0 * 1000.0 / 0.4
values['b6RatioSC'] = 500.0 / 34.0
values['b6InLayers'] = 4.0
values['b6InMove'] = 0.2
values['b6InMoveTyp'] = 0.3
values['b6ClueInMove'] = 0.1
values['b6TypFrac'] = share(4, 2.0, 0.3, 3.0)[1]
values['b6ReadFracReload'] = share(4, 0.4, 0.2, 1.0, 1.0)[1]
values['b6InP2'] = 0.005
values['b6ClueInP'] = 0.2
values['b6InE'] = 0.01
values['b6InMoveReload'] = 0.2
values['b6ClueInE'] = 0.2
values['b6ClueFrac'] = share(6, 1.0, 0.1, 2.0)[1]
values['b6ClueRatio'] = 2.0 * 1000.0 / 1.0
values['b6ClueGate'] = 6 * 1.0 / 1000.0
extra['ch.cycle.frac'] = share(4, 0.5, 0.3, 3.0)[1]
extra['ch.cycle.ratio'] = 3.0 * 1000.0 / 2.0
extra['eng.share.at.2ms'] = share(4, 0.4, 0.2, 2.0)[1]

# ---------------------------------------------------------------- pipelining: closed forms against a one-server event simulation
def serial(d, g, r, c):
    return d * (g + r + c)


def pipe(d, g, r, c):
    return (g + r) + c + (d - 1) * max(g + r, c)


def sim(d, g, r, c):
    acq = 0.0
    free = 0.0
    for _ in range(d):
        acq += g + r
        free = max(free, acq) + c
    return free


for case in [(11, .02, 2.0, .5), (11, .02, .3, .5), (7, .02, .5, .2), (9, .01, 1.0, 1.5), (25, .0016, 1.0, 2.0)]:
    assert abs(pipe(*case) - sim(*case)) < 1e-12
values['b6Serial'] = serial(11, .02, 2.0, .5)
values['b6Pipe'] = pipe(11, .02, 2.0, .5)
values['b6Saving'] = serial(11, .02, 2.0, .5) - pipe(11, .02, 2.0, .5)
assert abs(values['b6Saving'] - 10 * 0.5) < 1e-12
values['b6BreakEvenC'] = .02 + 2.0
values['b6SerialSlow'] = serial(11, .02, .3, .5)
values['b6PipeSlowClassifier'] = pipe(11, .02, .3, .5)
values['b6BreakEvenSlow'] = .02 + .3
values['b6InD11'] = 11.0
values['b6InG'] = .02
values['b6InR'] = 2.0
values['b6InC'] = .5
values['b6InRSlow'] = .3
# Eq. 5 of the paper is the generic total with c = t_den + t_c when c <= g + r
assert abs(11 * (2.0 + .02) + .5 - pipe(11, .02, 2.0, .5)) < 1e-12
# the clue (d = 7, g = 0.02, r = 0.5, c = 0.2, and c = 1.0) and the challenges (d = 9, g = 0.01, r = 1, c = 0.4 and 1.5)
values['b6ClueSerial'] = serial(7, .02, .5, .2)
values['b6CluePipe'] = pipe(7, .02, .5, .2)
values['b6CluePipeSlow'] = pipe(7, .02, .5, 1.0)
values['b6ClueBreakEven'] = .02 + .5
values['b6ClueInR'] = .5
values['b6ClueInC'] = .2
extra['ch.pipe.serial'] = serial(9, .01, 1.0, .4)
extra['ch.pipe.pipe'] = pipe(9, .01, 1.0, .4)
extra['ch.pipe.slow'] = pipe(9, .01, 1.0, 1.5)
extra['eng.sim.25'] = sim(25, .0016, 1.0, 2.0)
extra['eng.pipe.25'] = pipe(25, .0016, 1.0, 2.0)

# ---------------------------------------------------------------- loss: closed forms on a reported input (survival per image 99.98952 %)
S = 0.9998952
loss = 1 - S
n11 = 2 * 11 ** 2 - 1
values['b6AtomsD11'] = float(n11)
sci('b6InLoss', loss)
values['b6InSurv'] = S
values['b6LossPerRound'] = n11 * 1.048e-4
values['b6LossPer11Rounds'] = n11 * 11 * 1.048e-4
values['b6NoLoss11Rounds'] = (1 - 1.048e-4) ** (n11 * 11)
values['b6RoundsToOneLoss'] = 1 / (n11 * 1.048e-4)
n5 = 2 * 5 ** 2 - 1
values['b6ClueAtoms5'] = float(n5)
values['b6ClueLoss'] = n5 * 2e-4 * 50
values['b6ClueErasure7'] = 0.5 * 0.2 ** 7 * 1e6


def erase_fail(d, e):
    tot = 0.0
    for pat in itertools.product((0, 1), repeat=d):
        if all(pat):
            tot += 0.5 * math.prod(e if b else 1 - e for b in pat)
    return tot


assert abs(erase_fail(5, 0.01) - 0.5 * 1e-10) < 1e-20
sci('b6ErasureRep5', erase_fail(5, 0.01))
values['b6MinFaultsUnknown11'] = 6.0
values['b6MinFaultsErasure11'] = 11.0
extra['ch.loss.per100'] = 100 * (2 * 7 ** 2 - 1) * 1e-4
extra['ch.loss.atoms7'] = 2 * 7 ** 2 - 1
extra['ch.erase.micro'] = erase_fail(5, 0.1) * 1e6
extra['ch.erase.min7'] = 7
extra['eng.noloss.7.1e-4.20'] = (1 - 1e-4) ** (97 * 20)

keyfile = OUT / 'claims-papers' / 'b6.json'
keyfile.parent.mkdir(parents=True, exist_ok=True)
keyfile.write_text(json.dumps({'source': 'pipeline/claims_papers/b6.py', 'values': values}, indent=2, sort_keys=True) + '\n')
(OUT / 'timing-b6.json').write_text(json.dumps({'source': 'pipeline/claims_papers/b6.py', 'values': extra}, indent=2, sort_keys=True) + '\n')
print(f'wrote {keyfile.relative_to(ROOT)}: {len(values)} values; timing-b6.json: {len(extra)} checks')
