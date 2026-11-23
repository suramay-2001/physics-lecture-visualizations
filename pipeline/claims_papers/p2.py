#!/usr/bin/env python3
"""Numpy/scipy twins for every computed claim key of the Papers lecture P2, the GANDALF paper (app/src/content/papers/P2.paper.ts, arXiv:2510.25982v2), and for the
challenge answers and engine checks of app/src/physics/readout/gandalf.ts (app/src/physics/__fixtures__/readout-p2.json).

The claim ledger (app/src/content/claims.test.ts) checks each engine value against the twin written here, at 1e-12. Routes differ from the engine's:
  - schedules: an EVENT LOOP (one acquisition chain, one classifier that takes rounds in order) for the pipelined total, plain sums for the unpipelined one; the paper's Eq. 5 closed form is
    cross-checked against the loop when the classical work hides;
  - printed bars read back by linear algebra on the printed numbers (numpy arrays), not by the engine's helper formulas;
  - network sizes: the product of every printed filter shape, layer by layer, summed with numpy;
  - Poisson overlap error: scipy.stats.poisson over a full cutoff scan; Gaussian tails: scipy.stats.norm.sf;
  - the Pauli twirl: from the Bloch factors (lambda_x = lambda_y = exp(-t/T2), lambda_z = exp(-t/T1)) by solving the 3 x 3 linear system of a Pauli channel with numpy.linalg.solve;
  - a linear cleaner followed by a threshold: the best raw statistic is the ceiling, so the ratio of the Wiener output's separation to the raw one is exactly 1.
Inputs the prose quotes (the paper's printed numbers, labelled model inputs) are echoed as keys where a computed claim states them. Units: ms unless a name says otherwise.
Usage (repo root): python3 pipeline/claims_papers/p2.py. Deterministic: two runs write byte-identical files.
"""
import json
import math
from pathlib import Path

import numpy as np
from scipy.stats import norm, poisson

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / 'app' / 'src' / 'physics' / '__fixtures__'

values = {}
extra = {}  # engine checks and challenge answers (not claim keys)

# ---------------------------------------------------------------- unit 1: the bottleneck (Table 1, Eq. 1)
gate_na, ro_na = 400e-9, 1e-3        # seconds, Table 1 (neutral atom)
gate_sc, ro_sc = 34e-9, 500e-9       # seconds, Table 1 (Google)
values['p2GapNA'] = ro_na / gate_na
values['p2GapSC'] = ro_sc / gate_sc
values['p2ReadFracNA'] = ro_na / (gate_na + ro_na)
values['p2ReadFracSC'] = ro_sc / (gate_sc + ro_sc)
values['p2RuntimeScale'] = (1.0 * 1.0 * (1.0 * 1000.0)) / (1.0 * 1.0 * 1.0)
values['p2SnrSqrt'] = math.sqrt(10.0)  # SNR = N / sqrt(N) = sqrt(N) with N proportional to the exposure

# ---------------------------------------------------------------- unit 2: the dataset (Sec. 3.1, p. 5; Sec. 6, p. 11)
values['p2ExpLo'] = 15.0 / 10.0
values['p2ExpHi'] = 100.0 / 10.0
values['p2Atten15'] = 15.0 / 10.0
values['p2Sites'] = 3000 * 9
values['p2Split'] = 65 + 15 + 20
values['p2Sites14'] = 14 * 27000

# ---------------------------------------------------------------- unit 3: the denoiser (Table 2, Fig. 7)
enc = [(3, 3, 1, 64), (3, 3, 64, 128), (3, 3, 128, 256)]
res = (3, 3, 256, 256)
dec = [(4, 4, 256, 128), (4, 4, 256, 64), (3, 3, 128, 1)]
disc = [(3, 3, 1, 64), (3, 3, 64, 128), (3, 3, 128, 256), (3, 3, 256, 512), (1, 1, 512, 1)]
w = lambda s: int(np.prod(s))
values['p2GenParams1'] = sum(w(s) for s in enc) + 3 * w(res) + sum(w(s) for s in dec)
values['p2GenParams2'] = sum(w(s) for s in enc) + 6 * w(res) + sum(w(s) for s in dec)
values['p2DiscParams'] = sum(w(s) for s in disc)
values['p2MisRatio'] = 15.0 / 4.0
import json as _j
values['p2BlurFrac'] = _j.load(open(OUT / 'claims-papers' / 'b5.json'))['values']['b5BlurFrac']  # B5's own twin (a Gaussian-kernel convolution route): blur then the centre pixel keeps this share of the raw separation
values['p2L1Scaled'] = 200 * 0.0362
values['p2GanEq'] = -math.log(0.5)
extra['ch.enc3'] = w(enc[2])

# ---------------------------------------------------------------- unit 4: the classifiers (Fig. 9)
for key, eta in (('p2EtaMF', 60.9), ('p2EtaCNN', 62.1), ('p2EtaFNN', 66.1), ('p2Eta5', 64.0), ('p2Eta9', 53.0)):
    values[key] = 1.0 / (1.0 - eta / 100.0)
values['p2ParRatioMF'] = 355000.0 / (0.2 * 100000.0)
values['p2ParRatioFNN'] = (12.7 * 100000.0) / 355000.0
values['p2DenoiserRatio'] = 4.7e6 / 355000.0
extra['ch.eta.newErr'] = 4.0 * (1.0 - 0.621)

# ---------------------------------------------------------------- unit 5: the results (Sec. 7.1, Tables 3-5)
values['p2CrossRatio5'] = 3.6 / 2.9
values['p2CrossRatio9'] = 4.0 / 3.2
lat3 = np.array([0.201, 0.514, 9.091, 33.490])
side3 = np.array([4, 8, 32, 64])
values['p2PixelRatio'] = float(side3[3] ** 2 / side3[0] ** 2)
values['p2LatRatio'] = float(lat3[3] / lat3[0])
values['p2PerSite4'] = float(lat3[0] * 1000 / side3[0] ** 2)
values['p2PerSite64'] = float(lat3[3] * 1000 / side3[3] ** 2)
tp4 = np.array([460.0, 3330.3, 9225.0, 11721.4, 12711.4])
lat4 = np.array([2.174, 0.300, 0.108, 0.085, 0.079])
values['p2LatTP'] = float(np.max(np.abs(1000.0 / tp4 - lat4)))
values['p2BatchTime'] = 128 * 1000.0 / 12711.4
values['p2Lat34'] = 2.174 / 0.201
extra['ch.batch'] = 128 * 1000.0 / 12711.4
# toy post-selection: dark N(-2, 1), bright N(+2, 1), keep |score| >= 1
sep, cut = 2.0, 1.0
keep = norm.sf(cut - sep) + norm.sf(cut + sep)
values['p2KeepFrac'] = float(keep)
values['p2KeptErr'] = float(norm.sf(cut + sep) / keep)
values['p2PlainErr'] = float(norm.sf(sep))

# ---------------------------------------------------------------- unit 6: the pipeline (Eqs. 4, 5; Fig. 15)
def event_loop(d, g, r, c):
    """One acquisition chain; one classifier that takes rounds in order, each after its acquisition and the previous classification."""
    acq = cls = 0.0
    for _ in range(d):
        acq += g + r
        cls = max(cls, acq) + c
    return cls

d, tg, tr, tden, tc = 100, 0.01, 3.0, 0.1, 0.4
values['p2TUnp'] = d * (tg + tr + tc)
values['p2TPip'] = event_loop(d, tg, tr, tden + tc)
assert abs(values['p2TPip'] - (d * (tr + tg) + (tden + tc))) < 1e-9
values['p2Saving'] = values['p2TUnp'] - values['p2TPip']
unp = np.array([451.0, 371.0, 271.0])
pip = np.array([401.5, 321.5, 221.5])
gan = np.array([291.1, 181.1, 151.1])
values['p2Save'] = float((unp - pip)[0])
values['p2SavePct'] = float((unp - pip)[0] / unp[0])
values['p2TclImplied'] = float(np.linalg.solve(np.array([[99.0]]), np.array([unp[0] - pip[0]]))[0])
trg = unp / 100.0 - 0.5
for i in range(3):
    values[f'p2TroImplied{i + 1}'] = float(trg[i])
    values[f'p2GanTro{i + 1}'] = float((gan[i] - 0.1) / 100.0)
    values[f'p2Ratio{i + 1}'] = float(pip[i] / gan[i])
values['p2EqualTro'] = event_loop(100, 0.01, 1.5, 0.5) - event_loop(100, 0.01, 1.5, 0.1)
values['p2TextGap190'] = float(np.min(np.abs(np.concatenate([unp, pip, gan]) - 190.0)))
values['p2TdcAssumed'] = 0.1
values['p2TrFixed'] = 1.5
values['p2EqualBase'] = event_loop(100, 0.01, 1.5, 0.5)
values['p2EqualGan'] = event_loop(100, 0.01, 1.5, 0.1)
values['p2TextRatio'] = 0.19 / 0.152
extra['ch.eq5'] = values['p2TPip']
extra['ch.saving'] = values['p2Saving']
extra['ch.tc'] = values['p2TclImplied']

# ---------------------------------------------------------------- unit 7: the logical rate (toy; our inputs, never fitted to Fig. 14)
rb, rd, pg, T1, T2 = 6.0, 0.6, 0.002, 8000.0, 300.0
A, pth, dist = 0.1, 0.03, 11

def poisson_overlap(mb, md):
    ks = np.arange(0, int(mb + md + 12 * math.sqrt(mb + md + 1)) + 3)
    return float(np.min(0.5 * (poisson.cdf(ks - 1, mb) + 1 - poisson.cdf(ks - 1, md))))

def twirl_total(t):
    """A Pauli channel (pX, pY, pZ) shrinks the Bloch vector by lambda_x = 1 - 2(pY+pZ), lambda_y = 1 - 2(pX+pZ), lambda_z = 1 - 2(pX+pY): solve for the p's."""
    N = np.array([[0, 1, 1], [1, 0, 1], [1, 1, 0]], dtype=float)
    lam = np.array([math.exp(-t / T2), math.exp(-t / T2), math.exp(-t / T1)])
    p = np.linalg.solve(N, (1.0 - lam) / 2.0)
    return float(p.sum()), p

def peff(t, m=1.0):
    return pg + twirl_total(t)[0] + min(0.5, m * poisson_overlap(rb * t, rd * t))

grid = np.linspace(0.5, 10.0, 951)
pl = np.array([A * (peff(t) / pth) ** ((dist + 1) / 2) for t in grid])
imin = int(np.argmin(pl))
values['p2UMin'] = 1.0 if 0 < imin < len(grid) - 1 else 0.0
ratios = [(peff(t, 3.0) / peff(t, 1.0)) ** ((dist + 1) / 2) for t in (1.5, 4.0, 10.0)]
values['p2RatioGrows'] = 1.0 if (ratios[0] > ratios[1] > ratios[2] > 1.0) else 0.0
extra['eng.tStar'] = float(grid[imin])
extra['eng.ratio1p5'], extra['eng.ratio4'], extra['eng.ratio10'] = (float(x) for x in ratios)
extra['eng.overlap.3.0.3'] = poisson_overlap(3.0, 0.3)
extra['eng.peff.4ms'] = peff(4.0)
tw = twirl_total(4.0)[1]
extra['eng.twirl.pX.4'], extra['eng.twirl.pY.4'], extra['eng.twirl.pZ.4'] = (float(x) for x in tw)
extra['eng.twirl.total.1.2'] = twirl_total(1.0)[0]

# ---------------------------------------------------------------- unit 8: the ledger (the same arithmetic again under the trust unit's own keys)
for k, src in (('p2TrustCross5', 'p2CrossRatio5'), ('p2TrustCross9', 'p2CrossRatio9'), ('p2TrustRatio2', 'p2Ratio2'), ('p2TrustTextGap', 'p2TextGap190'),
               ('p2TrustParMF', 'p2ParRatioMF'), ('p2TrustGen2', 'p2GenParams2'), ('p2TrustSites14', 'p2Sites14')):
    values[k] = values[src]
extra['eng.eta60.9'] = 1.0 / (1.0 - 0.609)

keyfile = OUT / 'claims-papers' / 'p2.json'
keyfile.parent.mkdir(parents=True, exist_ok=True)
keyfile.write_text(json.dumps({'source': 'pipeline/claims_papers/p2.py', 'values': values}, indent=2, sort_keys=True) + '\n')
(OUT / 'readout-p2.json').write_text(json.dumps({'source': 'pipeline/claims_papers/p2.py', 'values': extra}, indent=2, sort_keys=True) + '\n')
print(f'wrote {keyfile.relative_to(ROOT)}: {len(values)} values; readout-p2.json: {len(extra)} checks')
