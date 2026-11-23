#!/usr/bin/env python3
"""Numpy/scipy twins for every computed claim key of the Papers background chapter B5 "From pixels to bits" (app/src/content/papers/B5.paper.ts),
and for the challenge answers and engine checks of app/src/physics/readout/classify.ts (app/src/physics/__fixtures__/readout-b5.json).

The claim ledger (app/src/content/claims.test.ts) checks each engine value against the twin written here, at 1e-12. Routes differ from the engine's:
  - Gaussian pixel shares: scipy.special.erf (the engine uses a positive series for the normal mass); the 3x3 ROI share also by trapezoid quadrature (cross-check, 1e-6);
  - errors of a weighted sum: scipy.stats.poisson.pmf over a full meshgrid of the three symmetry classes (the engine merges a pruned enumeration in a map), the flat sum by the
    Poisson-sum route poisson.sf / cdf, the Bayes error by the sum of the minimum of the two joint laws;
  - the learned filter and the cascades: numpy.linalg.solve / pinv (the engine solves by Gauss-Jordan on the range); a seeded regression (seed 11) checks the population filter;
  - network sizes: counted layer by layer from the printed layer lists;
  - posterior: scipy.special.expit.
Units: none. Usage (repo root): python3 pipeline/claims_papers/b5.py. Deterministic: two runs write byte-identical files.
"""
import json
import math
from pathlib import Path

import numpy as np
from scipy.special import erf, expit
from scipy.stats import poisson, norm

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / 'app' / 'src' / 'physics' / '__fixtures__'

SIG, NPH, BG = 0.9, 20.0, 0.4
values = {}
extra = {}  # engine checks and challenge answers (not claim keys)


def pix(x, sig):
    """Fraction of a Gaussian line profile (centre 0) in the pixel [x-.5, x+.5]."""
    return 0.5 * (erf((x + .5) / (sig * math.sqrt(2))) - erf((x - .5) / (sig * math.sqrt(2))))


def stat_error(w, bright, dark, tau=1.0, mult=(1, 4, 4)):
    """Best error of 'bright iff S >= c' over the full joint law of the three class counts (equal priors)."""
    caps = [int(m * l + 11 * math.sqrt(m * l) + 25) for m, l in zip(mult, bright)]
    def law(lam):
        return [poisson.pmf(np.arange(c + 1), m * l) for c, m, l in zip(caps, mult, lam)]
    P1, P0 = law(bright), law(dark)
    N = np.meshgrid(*[np.arange(c + 1) for c in caps], indexing='ij')
    S = sum(wi * Ni for wi, Ni in zip(w, N)).ravel()
    p1 = (P1[0][:, None, None] * P1[1][None, :, None] * P1[2][None, None, :]).ravel()
    p0 = (P0[0][:, None, None] * P0[1][None, :, None] * P0[2][None, None, :]).ravel()
    o = np.argsort(S, kind='stable')
    S, p1, p0 = S[o], p1[o], p0[o]
    c1, c0 = np.cumsum(p1), np.cumsum(p0)
    last = np.r_[S[1:] != S[:-1], True]
    errs, prev1, prev0 = [], 0.0, 0.0
    for idx in np.nonzero(last)[0]:
        errs.append(0.5 * ((1 - prev0) + prev1))
        prev1, prev0 = c1[idx], c0[idx]
    errs.append(0.5 * ((1 - prev0) + prev1))
    return min(errs)


def bayes(bright, dark, mult=(1, 4, 4)):
    caps = [int(m * l + 11 * math.sqrt(m * l) + 25) for m, l in zip(mult, bright)]
    def law(lam):
        P = [poisson.pmf(np.arange(c + 1), m * l) for c, m, l in zip(caps, mult, lam)]
        return P[0][:, None, None] * P[1][None, :, None] * P[2][None, None, :]
    return 0.5 * np.minimum(law(bright), law(dark)).sum()


# ---------------------------------------------------------------- b5-roi
fc, fe, fk = pix(0, SIG) ** 2, pix(0, SIG) * pix(1, SIG), pix(1, SIG) ** 2
values['b5PsfCenter'], values['b5PsfEdge'], values['b5PsfCorner'] = fc, fe, fk
roi3 = fc + 4 * fe + 4 * fk
g5 = np.array([pix(i, SIG) for i in range(-2, 3)])
values['b5PsfRoi3'] = roi3
values['b5PsfRoi5'] = float(np.outer(g5, g5).sum())
xs = np.linspace(-1.5, 1.5, 3001)
gg = np.exp(-xs ** 2 / (2 * SIG ** 2)) / (SIG * math.sqrt(2 * math.pi))
assert abs(float(np.trapezoid(gg, xs)) ** 2 - roi3) < 1e-6  # quadrature cross-check
values['b5SigC'], values['b5SigE'], values['b5SigK'] = NPH * fc, NPH * fe, NPH * fk


def window_frac(D, sig=SIG, half=1):
    return float(norm.cdf((D + half + .5) / sig) - norm.cdf((D - half - .5) / sig))


values['b5CrossFrac2'] = window_frac(2)
values['b5CrossFrac4'] = window_frac(4)
values['b5RoiSigma'] = SIG
values['b5RoiBackground'] = BG
# clue answers (fresh inputs)
box3 = lambda s: float(np.outer(*(2 * [np.array([pix(i, s) for i in (-1, 0, 1)])])).sum())
values['b5OutsideSig06'] = 1 - box3(0.6)
values['b5OutsideSig12'] = 1 - box3(1.2)
gS = lambda s: np.array([pix(i, s) for i in range(-2, 3)])
extra['ch.roi.centre06'] = pix(0, 0.6) ** 2
extra['ch.roi.box5s12'] = float(np.outer(gS(1.2), gS(1.2)).sum())
extra['ch.roi.dim'] = int((np.outer(gS(.9), gS(.9)) < 0.01).sum())

# ---------------------------------------------------------------- b5-matched-filter
s = np.array([NPH * fc, NPH * fe, NPH * fk])
bright, dark = BG + s, np.full(3, BG)
wl = np.log1p(s / BG)
values['b5WLlrC'], values['b5WLlrE'], values['b5WLlrK'] = (float(x) for x in wl)
values['b5LlrThreshold'] = float((np.array([1, 4, 4]) * s).sum())
values['b5LlrOnePixel'] = -1.2 + 3 * math.log(1 + 1.2 / 0.4)
values['b5ErrCenter'] = stat_error([1, 0, 0], bright, dark)
values['b5ErrSquare3'] = stat_error([1, 1, 1], bright, dark)
values['b5ErrGauss'] = stat_error(list(s), bright, dark)
values['b5ErrLlr'] = stat_error(list(wl), bright, dark)
values['b5ErrBayes'] = float(bayes(bright, dark))
assert abs(values['b5ErrLlr'] - values['b5ErrBayes']) < 1e-12
mu1, mu0 = 9 * BG + NPH * roi3, 9 * BG
values['b5SquarePoisson'] = min(0.5 * (poisson.sf(c - 1, mu0) + poisson.cdf(c - 1, mu1)) for c in range(0, 90))
assert abs(values['b5SquarePoisson'] - values['b5ErrSquare3']) < 1e-12
lam_b = np.array([BG + x for x in (s[2], s[1], s[2], s[1], s[0], s[1], s[2], s[1], s[2])])
d2 = float(np.sum((lam_b - BG) ** 2 / BG))
values['b5Dprime2'] = d2
ne = float(norm.sf(math.sqrt(d2) / 2))
values['b5NormalErrE'] = float(-math.floor(math.log10(ne)))  # the exponent as a positive magnitude: ne = M x 10^-E
values['b5NormalErrM'] = ne * 10 ** values['b5NormalErrE']
values['b5DprimeRatio4'] = math.sqrt(float(np.sum((4 * (lam_b - BG)) ** 2 / (4 * BG))) / d2)
for tau, name in ((0.5, 'Half'), (2.0, '2')):
    values[f'b5ErrLlrTau{name}'] = stat_error(list(wl), tau * bright, tau * dark)
values['b5ErrSquareTau2'] = stat_error([1, 1, 1], 2 * bright, 2 * dark)
values['b5MfSigma'] = SIG
values['b5MfBackground'] = BG
values['b5ClueW'] = math.log(1 + 3 / 1)
values['b5ClueD2'] = 16 / 1 + 1 / 1
values['b5ClueRatio9'] = math.sqrt(9)
extra['ch.mf.w'] = math.log(4)
extra['ch.mf.d2'] = 17.0
extra['ch.mf.ratio'] = 3.0

# ---------------------------------------------------------------- b5-cnn
px = np.arange(7)


def prof(c):
    return NPH * 0.5 * (erf((px - c + .5) / (SIG * math.sqrt(2))) - erf((px - c - .5) / (SIG * math.sqrt(2))))


sA, sB = prof(2), prof(4)
p = 0.5


def pop_filter(profiles, target):
    S = np.array(profiles)
    mu = BG + p * S.sum(0)
    C = np.diag(mu) + p * (1 - p) * S.T @ S
    return np.linalg.solve(C, p * (1 - p) * S[target])


w_iso, w_xt = pop_filter([sA], 0), pop_filter([sA, sB], 0)
ri, rx = w_iso / w_iso.max(), w_xt / w_xt.max()
for i in range(4):
    values[f'b5XtW{i}'] = float(rx[i])
for i in (4, 5, 6):
    assert rx[i] < 0
    values[f'b5XtN{i}'] = float(abs(rx[i]))
values['b5XtIso4'], values['b5XtIso5'] = float(ri[4]), float(ri[5])
mu1p = BG + p * sA
assert np.allclose(w_iso / np.linalg.norm(w_iso), (sA / mu1p) / np.linalg.norm(sA / mu1p), atol=1e-12)
q = float(sA @ (sA / mu1p))
values['b5Q'] = q
values['b5LsShrink'] = p * (1 - p) * q / (1 + p * (1 - p) * q)
rng = np.random.default_rng(11)
M = 600_000
a = rng.random((M, 2)) < p
n = rng.poisson(BG + a[:, 0:1] * sA + a[:, 1:2] * sB).astype(float)
w_s = np.linalg.lstsq(n - n.mean(0), a[:, 0] - a[:, 0].mean(), rcond=None)[0]
assert np.allclose(w_s / np.abs(w_s).max(), w_xt / np.abs(w_xt).max(), atol=0.03)  # sampled regression ~ population


def conv(k, ci, co, bias=True):
    return k * k * ci * co + (co if bias else 0)


cnn = conv(3, 1, 32) + conv(3, 32, 64) + conv(3, 64, 128) + (4 * 4 * 128 * 128 + 128) + (128 * 2 + 2)
assert cnn == 355202
values['b5CnnSiteParams'] = float(cnn)


def rf(layers):
    r = 1
    for k, st in reversed(layers):
        r = (r - 1) * st + k
    return r


values['b5RfCnn'] = float(rf([(3, 1)] * 3))
values['b5CnSigma'] = SIG
values['b5CnBackground'] = BG
extra['ch.cnn.conv'] = conv(3, 16, 32)
extra['ch.cnn.rf'] = rf([(3, 1)] * 4)
extra['ch.cnn.wratio'] = (4 / (1 + .5 * 4)) / (1 / (1 + .5 * 1))

# ---------------------------------------------------------------- b5-wiener
Sig = np.diag(BG + 0.5 * sA)


def lda_d2(H, delta):
    Hd = H @ delta
    Sg = H @ Sig @ H.T
    return float(Hd @ np.linalg.pinv(Sg, rcond=1e-12, hermitian=True) @ Hd)


I7 = np.eye(7)
K = np.zeros((7, 7))
for i in range(7):
    for j, kk in zip((i - 1, i, i + 1), (.25, .5, .25)):
        if 0 <= j < 7:
            K[i, j] += kk
Cs = p * (1 - p) * np.outer(sA, sA)
W = Cs @ np.linalg.inv(Cs + Sig)
raw, wien, blurc = lda_d2(I7, sA), lda_d2(W, sA), lda_d2(K[2:3], sA)
values['b5D2Raw'], values['b5D2Wiener'], values['b5D2BlurCentre'] = raw, wien, blurc
values['b5D2Crop3'], values['b5D2Centre'] = lda_d2(I7[1:4], sA), lda_d2(I7[2:3], sA)
values['b5BlurFrac'] = blurc / raw
assert abs(raw - q) < 1e-9 and abs(wien - raw) < 1e-9 * raw
assert np.allclose(W, np.outer(sA, W[np.argmax(sA)] / sA.max()), atol=1e-12)  # rank one
values['b5WiSigma'] = SIG
values['b5WiBackground'] = BG
values['b5ClueShrink3'] = 0.25 * 3 / (1 + 0.25 * 3)
extra['ch.wi.centre'] = float(K[3, 3])
extra['ch.wi.shrink'] = 0.25 * 3 / (1 + 0.25 * 3)

# ---------------------------------------------------------------- b5-pix2pix
values['b5Rf70'] = float(rf([(4, 2), (4, 2), (4, 2), (4, 1), (4, 1)]))
values['b5RfGdfD'] = float(rf([(3, 2)] * 4))
gen2 = conv(3, 1, 64, 0) + conv(3, 64, 128, 0) + conv(3, 128, 256, 0) + 6 * conv(3, 256, 256, 0) + conv(4, 256, 128, 0) + conv(4, 256, 64, 0) + conv(3, 128, 1, 0)
values['b5GenParams2'] = float(gen2)
values['b5GenParams1'] = float(gen2 - 3 * conv(3, 256, 256, 0))
values['b5L1Scaled'] = 200 * 0.0362
values['b5GanEq'] = -math.log(0.5)
values['b5GanFake02'] = -math.log(0.2)
values['b5SmoothFloor'] = -(0.9 * math.log(0.9) + 0.1 * math.log(0.1))
values['b5PostEqual'] = float(expit(-1.0))
values['b5PostPrior90'] = float(expit(-1.0 + math.log(9)))
values['b5FlipPrior'] = float(expit(1.0))
values['b5ShiftLogit'] = math.log(9)
values['b5CluePost'] = float(expit(-2 + math.log(4)))
values['b5ClueGan'] = -math.log(0.25)
values['b5ClueL1'] = 200 * 0.02
extra['ch.p2.gan'] = -math.log(0.25)
extra['ch.p2.l1'] = 200 * 0.02
extra['ch.p2.post'] = float(expit(-2 + math.log(4)))

# ---------------------------------------------------------------- engine checks (not claim keys)
extra['eng.psfShare.0.0.9'] = pix(0, 0.9)
s12 = np.array([12 * pix(0, 1.2) ** 2, 12 * pix(0, 1.2) * pix(1, 1.2), 12 * pix(1, 1.2) ** 2])
extra['eng.errLlr.sigma1.2.photons12.b0.2'] = stat_error(list(np.log1p(s12 / 0.2)), 0.2 + s12, np.full(3, 0.2))
extra['eng.errSquare.sigma1.2.photons12.b0.2'] = stat_error([1, 1, 1], 0.2 + s12, np.full(3, 0.2))
for i in range(7):
    extra[f'eng.xtW.{i}'] = float(rx[i])
    extra[f'eng.iso.{i}'] = float(ri[i])

keyfile = OUT / 'claims-papers' / 'b5.json'
keyfile.parent.mkdir(parents=True, exist_ok=True)
keyfile.write_text(json.dumps({'source': 'pipeline/claims_papers/b5.py', 'values': values}, indent=2, sort_keys=True) + '\n')
(OUT / 'readout-b5.json').write_text(json.dumps({'source': 'pipeline/claims_papers/b5.py', 'values': extra}, indent=2, sort_keys=True) + '\n')
print(f'wrote {keyfile.relative_to(ROOT)}: {len(values)} values; readout-b5.json: {len(extra)} checks')
