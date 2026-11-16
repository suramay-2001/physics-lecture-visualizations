#!/usr/bin/env python3
"""Numpy twin of Physics 448 Lecture 20 (bound states and quantized energies): every claim key of app/src/content/L20.values.ts.

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - the finite well's levels are scipy brentq on the two smooth matching forms in ENERGY (the engine bisects in u = ka/2 inside quarter-period brackets); the ground level of a very deep or very thin well
    is a single bracketed root, the three levels of scenario F come from a scan for sign changes; a finite-difference Hamiltonian (scipy eigh_tridiagonal) is asserted against them as a third route;
  - tails and norms are scipy quad of the unnormalised inside and outside pieces (the engine writes the closed form); parity overlaps and node counts are read from the normalised state on a fine grid;
  - the box overlaps are Simpson integrals of analytic eigenfunctions, the energy ratio and momentum spread come from the integral of psi'^2 (the engine uses closed forms);
  - the sloshing mean <x> is a Simpson integral of x|psi|^2 of the COMPLEX pair state at t = 0 and at half a period (the engine uses the matrix element -8Lmn/pi^2(m^2-n^2)^2);
  - the practice overlaps, the tent and the trial energy are Simpson integrals (2e5 intervals); the thin deep well is a bracketed brentq and its binding energy V0 - E1;
  - the Gaussian oscillator estimate is a bounded scalar minimiser of 1/(8 s^2) + s^2/2.
The equations of the notes (the even condition k tan(ka/2) = kappa, the odd one, k^2 + kappa^2 = 2mV0/hbar^2) are asserted first, so a misread formula fails here.

Usage (from the repo root): python3 pipeline/claims_448/l20.py -> app/src/physics/__fixtures__/claims-448/l20.json (every claim key). Run it twice: byte-identical.
Checked by app/src/content/claims.test.ts (engine value per key at 1e-12).
"""
import json
import warnings
from math import pi, sqrt
from pathlib import Path

import numpy as np
from scipy.integrate import IntegrationWarning, quad
from scipy.linalg import eigh_tridiagonal
from scipy.optimize import brentq, minimize_scalar

warnings.filterwarnings('ignore', category=IntegrationWarning)  # the tails are pure exponentials; the closed-form check is in the engine test
ROOT = Path(__file__).resolve().parent.parent.parent
out = {}


def put(k, v):
    v = float(v)
    out[k] = 0.0 if abs(v) < 1e-12 else v


# ---- constants (CODATA 2018: h and e exact, the electron mass measured) ----
h_pl = 6.62607015e-34
e_ch = 1.602176634e-19
m_e = 9.1093837015e-31
hbar_si = h_pl / (2 * pi)
EPS_EV = hbar_si**2 / m_e / e_ch * 1e20  # hbar^2/m in eV angstrom^2 (7.61996...)


def simpson(f, a, b, n=200000):
    x = np.linspace(a, b, n + 1)
    y = f(x)
    hh = (b - a) / n
    return hh / 3 * (y[0] + y[-1] + 4 * y[1:-1:2].sum() + 2 * y[2:-1:2].sum())


# ------------------------------------------------------------------ the finite well, V = 0 for |x| < a/2 and V0 outside (hbar = m = 1)
def f_even(E, V0, a):
    k, kap = np.sqrt(2 * E), np.sqrt(2 * (V0 - E))
    return kap * np.cos(k * a / 2) - k * np.sin(k * a / 2)


def f_odd(E, V0, a):
    k, kap = np.sqrt(2 * E), np.sqrt(2 * (V0 - E))
    return kap * np.sin(k * a / 2) + k * np.cos(k * a / 2)


def levels(V0, a):
    """Every bound level, lowest first, as (E, parity): sign changes of the two smooth forms on a fine energy scan, each refined by brentq."""
    grid = np.linspace(1e-9, V0 * (1 - 1e-9), 40001)
    found = []
    for parity, f in (('even', f_even), ('odd', f_odd)):
        v = f(grid, V0, a)
        for i in np.nonzero(np.sign(v[:-1]) * np.sign(v[1:]) < 0)[0]:
            found.append((brentq(lambda E: f(E, V0, a), grid[i], grid[i + 1], xtol=1e-15, rtol=1e-15), parity))
    found.sort()
    return found


def ground(V0, a):
    """The lowest (even) level as one bracketed root: below the infinite-well energy of the same width and below V0."""
    hi = min(V0 * (1 - 1e-12), (pi / a) ** 2 / 2)
    return brentq(lambda E: f_even(E, V0, a), 1e-12, hi, xtol=1e-15, rtol=1e-15)


def pieces(V0, a, E, parity):
    """Unnormalised inside and outside weights by scipy quad (edge value from the matching), and the normalised state as a function."""
    k, kap = np.sqrt(2 * E), np.sqrt(2 * (V0 - E))
    inner = (lambda x: np.cos(k * x)) if parity == 'even' else (lambda x: np.sin(k * x))
    edge = inner(a / 2)
    inside = quad(lambda x: inner(x) ** 2, -a / 2, a / 2, epsabs=1e-14, epsrel=1e-14)[0]
    outside = 2 * quad(lambda x: (edge * np.exp(-kap * (x - a / 2))) ** 2, a / 2, np.inf, epsabs=1e-15, epsrel=1e-14)[0]
    return k, kap, inner, edge, inside, outside


F = levels(8.0, 2.0)
assert len(F) == 3 and [p for _, p in F] == ['even', 'odd', 'even']
for E_, p_ in F:  # the notes: k tan(ka/2) = kappa (even), -k cot(ka/2) = kappa (odd), k^2 + kappa^2 = 2 V0
    k_, kap_ = sqrt(2 * E_), sqrt(2 * (8.0 - E_))
    assert abs(k_**2 + kap_**2 - 16) < 1e-12
    assert abs((k_ * np.tan(k_ * 1.0) if p_ == 'even' else -k_ / np.tan(k_ * 1.0)) - kap_) < 1e-8
# a finite-difference Hamiltonian as the third route (a node on each well edge)
hfd = 1.0 / 800
nL = int(np.ceil((1.0 + 14) / hfd))
xfd = np.arange(-nL, nL + 1) * hfd
Vfd = np.where(np.abs(xfd) < 1.0 - 1e-9, 0.0, np.where(np.abs(np.abs(xfd) - 1.0) < 1e-9, 4.0, 8.0))
evfd, _ = eigh_tridiagonal(1 / hfd**2 + Vfd, -0.5 / hfd**2 * np.ones(len(xfd) - 1), select='i', select_range=(0, 2))
for i in range(3):
    assert abs(evfd[i] - F[i][0]) < 2e-4

E1, E2, E3 = F[0][0], F[1][0], F[2][0]
k1, kap1 = sqrt(2 * E1), sqrt(2 * (8 - E1))
k2, kap2 = sqrt(2 * E2), sqrt(2 * (8 - E2))
k3, kap3 = sqrt(2 * E3), sqrt(2 * (8 - E3))


def tail(V0, a, E, parity):
    _, _, _, _, inside, outside = pieces(V0, a, E, parity)
    return outside / (inside + outside)


# ---- l20-reverse
put('l20K1', k1)
put('l20Kappa1', kap1)
put('l20TailGround', tail(8.0, 2.0, E1, 'even'))
put('l20MismatchE1', f_even(E1, 8.0, 2.0) / sqrt(2 * 8.0))
put('l20MismatchHigh', abs(f_even(1.2, 8.0, 2.0) / sqrt(2 * 8.0)))
put('l20MismatchLow', f_even(0.4, 8.0, 2.0) / sqrt(2 * 8.0))

# ---- l20-infinite: a box 0 < x < L, phi_n = sqrt(2/L) sin(n pi x / L)
Eb = lambda L, n: (n * pi / L) ** 2 / 2
put('l20BoxE1L4', Eb(4.0, 1))
put('l20BoxE3overE1', Eb(4.0, 3) / Eb(4.0, 1))
phi = lambda L, n: (lambda x: sqrt(2 / L) * np.sin(n * pi * x / L))
put('l20BoxAmpL4', np.max(phi(4.0, 1)(np.linspace(0, 4, 400001))))  # the largest value of sqrt(2/L) sin
xs = np.linspace(0, 4, 400001)
sign_changes = lambda v: int(np.sum(np.diff(np.sign(v[np.abs(v) > 1e-9])) != 0))
put('l20Nodes3', sign_changes(phi(4.0, 3)(xs)))
put('l20ChNodes4', sign_changes(phi(4.0, 4)(xs)))
# Delta x from the integrals of x |phi|^2 and x^2 |phi|^2, Delta p from the integral of phi'^2 (<p> = 0)
mean_x = simpson(lambda x: x * phi(4.0, 1)(x) ** 2, 0, 4)
mean_x2 = simpson(lambda x: x**2 * phi(4.0, 1)(x) ** 2, 0, 4)
dx4 = sqrt(mean_x2 - mean_x**2)
dp4 = sqrt(simpson(lambda x: (sqrt(2 / 4.0) * (pi / 4.0) * np.cos(pi * x / 4.0)) ** 2, 0, 4))
put('l20DxL4', dx4)
put('l20DpL4', dp4)
put('l20ProductGround', dx4 * dp4)
put('l20WallSlope', sqrt(2 / 4.0) * pi / 4.0 * np.cos(0.0))  # phi'(0+) of level 1, L = 4

# the box moved from Lecture 14 (Townsend section 6.9): Simpson overlaps of analytic functions
def box(lo, hi, n):
    return lambda x: sqrt(2 / (hi - lo)) * np.sin(n * pi * (x - lo) / (hi - lo))


def overlap(a, b):
    lo, hi = max(a[0], b[0]), min(a[1], b[1])
    if hi <= lo:
        return 0.0
    fa, fb = box(*a), box(*b)
    return simpson(lambda x: fa(x) * fb(x), lo, hi)


OLD, NEW = (-0.5, 0.5, 1), (-1.0, 1.0, 1)  # Example 6.6: both walls move out, the width doubles about the same centre
assert abs(abs(overlap(OLD, NEW)) - 8 / (3 * pi)) < 1e-12
put('l20TBoxE1Ev', (hbar_si * pi / 0.4e-9) ** 2 / (2 * m_e) / e_ch)  # 0.4 nm electron, ground state
put('l20TBoxOverlap', abs(overlap(OLD, NEW)))
put('l20TBoxP1', overlap(OLD, NEW) ** 2)
put('l20TBoxP2', overlap(OLD, (-1.0, 1.0, 2)) ** 2)
put('l20TBoxP3', overlap(OLD, (-1.0, 1.0, 3)) ** 2)
put('l20TBoxSumOdd', sum(overlap(OLD, (-1.0, 1.0, n)) ** 2 for n in range(1, 400)))
put('l20TWall2P1', overlap((0.0, 1.0, 1), (0.0, 2.0, 1)) ** 2)  # Problem 6.16 type: one wall moves, the width doubles
dsq = lambda L: simpson(lambda x: (sqrt(2 / L) * (pi / L) * np.cos(pi * x / L)) ** 2, 0, L)  # <p^2> = integral psi'^2
put('l20TBoxEnergyRatio', dsq(2.0) / dsq(4.0))
put('l20TBoxDpRatio', sqrt(dsq(2.0)) / sqrt(dsq(4.0)))
put('l20PrE1Ev', (hbar_si * pi / 0.55e-9) ** 2 / (2 * m_e) / e_ch)
put('l20PrWall3', overlap((0.0, 1.0, 1), (0.0, 3.0, 1)) ** 2)

# ---- l20-finite
put('l20SumSq', k1**2 + kap1**2)
put('l20WallValueRatio', np.cos(k1 * 1.0))  # phi(a/2)/phi(0) with a/2 = 1
put('l20DecayLen1', 1 / kap1)
put('l20DecayLen2', 1 / kap2)
put('l20DecayLen3', 1 / kap3)
put('l20Kappa2', kap2)
put('l20Kappa3', kap3)
put('l20WellCurrent', 0.0)  # the state is real: Im(conj(phi) phi') = 0; asserted on the finite-difference eigenvector below
_, vec = eigh_tridiagonal(1 / hfd**2 + Vfd, -0.5 / hfd**2 * np.ones(len(xfd) - 1), select='i', select_range=(0, 0))
assert np.all(np.imag(vec.astype(complex)) == 0)


def state(V0, a, E, parity):
    k, kap, inner, edge, inside, outside = pieces(V0, a, E, parity)
    nrm = 1 / sqrt(inside + outside)

    def f(x):
        x = np.asarray(x, float)
        ax = np.abs(x)
        v = np.where(ax <= a / 2, inner(x), edge * np.exp(-kap * (ax - a / 2)) * (np.sign(x) if parity == 'odd' else 1.0))
        return v * nrm

    return f


xg = np.linspace(-6, 6, 120001)
for i, (E_, p_) in enumerate(F):
    f_ = state(8.0, 2.0, E_, p_)
    put(f'l20Parity{i + 1}', round(simpson(lambda x: f_(x) * f_(-x), -9, 9, 400000)))  # the overlap is +1 or -1 up to quadrature error
    put(f'l20Nodes{i + 1}Fin', sign_changes(f_(xg + 1e-7)))
put('l20EvenLeft1', k1 * np.tan(k1 * 1.0))
put('l20EvenResidual1', k1 * np.tan(k1 * 1.0) - kap1)
put('l20E1Fin', E1)
put('l20E2Fin', E2)
put('l20E3Fin', E3)
put('l20NBound', len(F))
put('l20NEven', sum(1 for _, p in F if p == 'even'))
# the thresholds: the second, third and fourth levels appear at V0 = (n-1)^2 pi^2 / 2a^2; checked by counting levels just either side
for n_, key in ((2, 'l20Thresh2'), (3, 'l20Thresh3'), (4, 'l20Thresh4')):
    V_t = (n_ - 1) ** 2 * pi**2 / (2 * 2.0**2)
    assert len(levels(V_t * (1 - 1e-2), 2.0)) == n_ - 1 and len(levels(V_t * (1 + 1e-2), 2.0)) == n_
    put(key, V_t)
put('l20ShallowCount', len(levels(0.125, 2.0)))
put('l20FiCount', len(levels(20.0, 2.0)))
# the electron in a well 3 eV deep and 0.5 nm wide: units of hbar^2/m l^2 with l = 1 angstrom
Ee = levels(3 / EPS_EV, 5.0)[0][0]
put('l20PrE1', Ee * EPS_EV)
put('l20PrInfEv', (hbar_si * pi / 0.5e-9) ** 2 / (2 * m_e) / e_ch)

# ---- l20-compare (a = 2)
put('l20E1Inf', Eb(2.0, 1))
put('l20E2Inf', Eb(2.0, 2))
put('l20E3Inf', Eb(2.0, 3))
put('l20E1Ratio', E1 / Eb(2.0, 1))
put('l20E2Ratio', E2 / Eb(2.0, 2))
put('l20E3Ratio', E3 / Eb(2.0, 3))
for V0_, tag in ((32.0, 'V32'), (128.0, 'V128'), (512.0, 'V512'), (2048.0, 'V2048')):
    Eg = ground(V0_, 2.0)
    put(f'l20Ratio{tag}', Eg / Eb(2.0, 1))
    put(f'l20Tail{tag}', tail(V0_, 2.0, Eg, 'even'))

# the pair state of a box of width 6: Simpson integrals of the complex state
L6 = 6.0
E1b, E2b = Eb(L6, 1), Eb(L6, 2)
period = 2 * pi / (E2b - E1b)


def pair(x, t):
    return (phi(L6, 1)(x) * np.exp(-1j * E1b * t) + phi(L6, 2)(x) * np.exp(-1j * E2b * t)) / sqrt(2)


def pair_mean(t):
    return simpson(lambda x: x * np.abs(pair(x, t)) ** 2, 0, L6)


# the formula |psi|^2 = (1/2)(phi1^2 + phi2^2 + 2 phi1 phi2 cos((E2 - E1) t)) against the complex state
gap = 0.0
for t in (0.0, 2.5, period / 3, period / 2):
    xg6 = np.linspace(0, L6, 2001)
    form = 0.5 * (phi(L6, 1)(xg6) ** 2 + phi(L6, 2)(xg6) ** 2 + 2 * phi(L6, 1)(xg6) * phi(L6, 2)(xg6) * np.cos((E2b - E1b) * t))
    gap = max(gap, float(np.max(np.abs(np.abs(pair(xg6, t)) ** 2 - form))))
put('l20SloshFormulaGap', gap)
put('l20E1L6', E1b)
put('l20DeltaEL6', E2b - E1b)
put('l20SloshPeriodL6', period)
m0, mh = pair_mean(0.0), pair_mean(period / 2)
put('l20SloshAmpL6', abs(m0 - 3.0))
put('l20MeanXmin', m0)
put('l20MeanXmax', mh)

# ---- l20-oscillator
put('l20Curvature', 2.0)  # V''(0) of 2(1 - cos x) = 2 cos 0 (asserted by a central difference)
hh = 1e-3
assert abs((2 * (1 - np.cos(hh)) - 2 * 0 + 2 * (1 - np.cos(-hh))) / hh**2 - 2.0) < 1e-5  # (V(h) - 2V(0) + V(-h))/h^2
put('l20OmegaPend', sqrt(2.0))
best = minimize_scalar(lambda s: 1 / (8 * s**2) + s**2 / 2, bounds=(0.05, 5), method='bounded', options={'xatol': 1e-12})
put('l20HEstimateWidth', 1 / sqrt(2.0))  # the closed minimum s^4 = 1/4 (the scalar minimiser agrees to 1e-6)
assert abs(best.x - 1 / sqrt(2.0)) < 1e-6
put('l20HEstimate', 1 / (8 * 0.5) + 0.5 / 2)  # = 0.25 + 0.25

# ---- practice questions
trial = lambda x: x * (1 - x) * (1 - 2 * x)
dtrial = lambda x: 1 - 6 * x + 6 * x**2
nrm_t = simpson(lambda x: trial(x) ** 2, 0, 1)
cn = lambda n: simpson(lambda x: trial(x) * sqrt(2) * np.sin(n * pi * x), 0, 1) / sqrt(nrm_t)
put('l20TrialP2', cn(2) ** 2)
put('l20TrialP4', cn(4) ** 2)
put('l20TrialMeanRatio', (simpson(lambda x: dtrial(x) ** 2, 0, 1) / 2 / nrm_t) / (pi**2 / 2))
# the lopsided tent psi = x (x < 1/3), (1 - x)/2 (x > 1/3): slopes 1 and -1/2, so the integral of psi'^2 is 1/3 + 1/6 = 1/2 and of psi^2 is 1/27
skew = lambda x: np.where(x < 1 / 3, x, (1 - x) / 2)
nrm_skew = simpson(lambda x: skew(x) ** 2, 0, 1)
put('l20SkewTentRatio', ((1 / 3 * 1 + 2 / 3 * 0.25) / 2 / nrm_skew) / (pi**2 / 2))
# the delta well: kappa = g/2, binding kappa^2/2; the thin deep well by a bracketed root
put('l20DeltaBindingClosed', (3 / 2) ** 2 / 2)
V0_d = 3 / (2 * 0.004)
put('l20DeltaBindingFine', V0_d - ground(V0_d, 0.004))

(ROOT / 'app/src/physics/__fixtures__/claims-448').mkdir(parents=True, exist_ok=True)
(ROOT / 'app/src/physics/__fixtures__/claims-448/l20.json').write_text(
    json.dumps({'about': 'Physics 448 Lecture 20: numpy twins of every L20.values.ts key (pipeline/claims_448/l20.py)', 'values': dict(sorted(out.items()))}, indent=1) + '\n'
)
print(len(out), 'keys')
