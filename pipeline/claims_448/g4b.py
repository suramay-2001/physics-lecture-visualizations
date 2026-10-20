#!/usr/bin/env python3
"""Numpy twin of the 448 Townsend pass, group G4b (Lecture 13): every claim key of the new Townsend beats and practice questions,
plus the engine cases for the new functions (wave.ts box eigenstates, scatter.ts step / barrier / current).

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - a barrier or step is solved as the MATCHING CONDITIONS, a linear system with np.linalg.solve (Townsend Eqs. 6.133, 6.143), never the closed form
    (6.135, 6.144); the E = V0 barrier uses the linear interior psi = c + d x of Example 6.7;
  - box energies come from E = (hbar pi / L)^2 / 2m (SI) and, for the nodes, from np.linalg.eigh of a finite-difference Hamiltonian;
  - box overlaps are Simpson integrals (2e5 intervals) of the analytic eigenfunctions, never the product-to-sum closed form;
  - the box momentum spread is the square root of the integral of psi'^2 (<p> = 0), the energy ratio is the ratio of those integrals;
  - the probability current and its continuity residual are done with np.fft, the mean current is the sum of Re(conj(psi) * p psi) dx;
  - the evolution-time product is built from the variance of H and of S_x in the evolved state and a central difference of <S_x>(t).
The digest's own equation groups are asserted first (Eq. 6.110, 6.135 R + T = 1, Example 6.6's 8/(3 pi)), so a misread equation fails here.

Usage (from the repo root): python3 pipeline/claims_448/g4b.py -> app/src/physics/__fixtures__/claims-448/g4b.json and app/src/physics/__fixtures__/scatter-g4b.json
(run it twice: byte-identical). Checked by app/src/content/claims.test.ts (engine value per key at 1e-12) and app/src/physics/scatterG4b.test.ts (engine cases).
"""
import json
from math import pi, sqrt
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
out = {}
cases = {}


def put(k, v):
    v = float(v)
    out[k] = 0.0 if abs(v) < 1e-12 else v


# ---- constants (CODATA 2018: h and e exact, the rest measured) ----
h = 6.62607015e-34
e = 1.602176634e-19
me = 9.1093837015e-31
u = 1.6605390666e-27
hbar = h / (2 * pi)
HBAR2_2M = hbar**2 / (2 * me) / e * 1e20  # hbar^2 / 2m_e in eV * angstrom^2 (3.80998...)


def simpson(f, a, b, n=200000):
    x = np.linspace(a, b, n + 1)
    y = f(x)
    hh = (b - a) / n
    return hh / 3 * (y[0] + y[-1] + 4 * y[1:-1:2].sum() + 2 * y[2:-1:2].sum())


def box(lo, hi, n):
    """Real box eigenfunction on [lo, hi] (zero outside), as a function of x inside."""
    return lambda x: sqrt(2 / (hi - lo)) * np.sin(n * pi * (x - lo) / (hi - lo))


def overlap(a, b):
    lo, hi = max(a[0], b[0]), min(a[1], b[1])
    if hi <= lo:
        return 0.0
    fa, fb = box(*a), box(*b)
    return simpson(lambda x: fa(x) * fb(x), lo, hi)


# ---- scattering by the matching conditions ----
def step_RT(E, V0):
    k = sqrt(2 * E)
    if E > V0:
        k0 = sqrt(2 * (E - V0))
        # unknowns B, C with A = 1:  A + B = C ;  ik(A - B) = i k0 C
        M = np.array([[1, -1], [-1j * k, -1j * k0]], complex)
        B, C = np.linalg.solve(M, np.array([-1, -1j * k], complex))
        return abs(B) ** 2, (k0 / k) * abs(C) ** 2
    q = sqrt(2 * (V0 - E))
    # psi = C e^{-qx} for x > 0:  A + B = C ;  ik(A - B) = -q C
    M = np.array([[1, -1], [-1j * k, q]], complex)
    B, C = np.linalg.solve(M, np.array([-1, -1j * k], complex))
    jt = np.imag(np.conj(C) * (-q) * C)  # current in the step: Im(psi* psi') with psi' = -q psi
    return abs(B) ** 2, jt / k


def barrier_T(E, V0, a, hb2_2m=0.5):
    """T of a square barrier from the four matching conditions (hbar^2/2m = hb2_2m; the engine's units have it 1/2)."""
    k = sqrt(E / hb2_2m)
    if abs(E - V0) < 1e-14 * V0:
        # inside psi = c + d x:  A + B = c ; ik(A - B) = d ; c + d a = C e^{ika} ; d = ik C e^{ika}
        ph = np.exp(1j * k * a)
        M = np.array([[1, -1, 0, 0], [-1j * k, 0, -1, 0], [0, 1, a, -ph], [0, 0, 1, -1j * k * ph]], complex)
        sol = np.linalg.solve(M, np.array([-1, -1j * k, 0, 0], complex))
        return abs(sol[3]) ** 2
    ph = np.exp(1j * k * a)
    if E < V0:
        q = sqrt((V0 - E) / hb2_2m)
        ea, ema = np.exp(q * a), np.exp(-q * a)
        # unknowns B, F, G, C (A = 1)
        M = np.array([[1, -1, -1, 0], [-1j * k, -q, q, 0], [0, ea, ema, -ph], [0, q * ea, -q * ema, -1j * k * ph]], complex)
    else:
        k2 = sqrt((E - V0) / hb2_2m)
        ea, ema = np.exp(1j * k2 * a), np.exp(-1j * k2 * a)
        # inside F e^{ik2 x} + G e^{-ik2 x}
        M = np.array([[1, -1, -1, 0], [-1j * k, -1j * k2, 1j * k2, 0], [0, ea, ema, -ph], [0, 1j * k2 * ea, -1j * k2 * ema, -1j * k * ph]], complex)
    sol = np.linalg.solve(M, np.array([-1, -1j * k, 0, 0], complex))
    return abs(sol[3]) ** 2


# digest checks: R + T = 1 (Eq. 6.136), Eq. 6.110 against a finite-difference Hamiltonian, Example 6.6's 8/(3 pi)
for ratio in (1.5, 2, 3, 7):
    r, t = step_RT(ratio, 1.0)
    assert abs(r + t - 1) < 1e-13
N_FD = 399
hfd = 1.0 / (N_FD + 1)
Hfd = (np.diag(np.full(N_FD, 1 / hfd**2)) + np.diag(np.full(N_FD - 1, -0.5 / hfd**2), 1) + np.diag(np.full(N_FD - 1, -0.5 / hfd**2), -1))
w, v = np.linalg.eigh(Hfd)
for n in (1, 2, 3, 4):
    assert abs(w[n - 1] - (n * pi) ** 2 / 2) / ((n * pi) ** 2 / 2) < 2e-4
assert abs(overlap((-0.5, 0.5, 1), (-1.0, 1.0, 1)) - 8 / (3 * pi)) < 1e-12 or abs(abs(overlap((-0.5, 0.5, 1), (-1.0, 1.0, 1))) - 8 / (3 * pi)) < 1e-12

# ---- box (Townsend 6.9) ----
put('l13TBoxE1Ev', (hbar * pi / 0.4e-9) ** 2 / (2 * me) / e)  # 0.4 nm electron, ground state
sign_changes = lambda vec: int(np.sum(np.diff(np.sign(vec[np.abs(vec) > 1e-14])) != 0))
put('l13TBoxNodes4', sign_changes(v[:, 3]))
OLD, NEW = (-0.5, 0.5, 1), (-1.0, 1.0, 1)  # Example 6.6: both walls move out, the width doubles about the same centre
put('l13TBoxOverlap', abs(overlap(OLD, NEW)))
put('l13TBoxP1', overlap(OLD, NEW) ** 2)
put('l13TBoxP2', overlap(OLD, (-1.0, 1.0, 2)) ** 2)
put('l13TBoxP3', overlap(OLD, (-1.0, 1.0, 3)) ** 2)
put('l13TBoxSumOdd', sum(overlap(OLD, (-1.0, 1.0, n)) ** 2 for n in range(1, 400)))
put('l13TWall2P1', overlap((0.0, 1.0, 1), (0.0, 2.0, 1)) ** 2)  # Problem 6.16 type: one wall moves, the width doubles
# the clue: squeeze the box to half its width (L = 4 -> 2): energy x4, momentum spread x2; both from the integral of psi'^2
dsq = lambda L: simpson(lambda x: (sqrt(2 / L) * (pi / L) * np.cos(pi * x / L)) ** 2, 0, L)  # <p^2> = integral psi'^2
put('l13TBoxEnergyRatio', dsq(2.0) / dsq(4.0))
put('l13TBoxDpRatio', sqrt(dsq(2.0)) / sqrt(dsq(4.0)))
# practice
put('l13PrE1Ev', (hbar * pi / 0.55e-9) ** 2 / (2 * me) / e)
put('l13PrWall3', overlap((0.0, 1.0, 1), (0.0, 3.0, 1)) ** 2)

# ---- step and barrier ----
r2, t2 = step_RT(2.0, 1.0)
r3, t3 = step_RT(3.0, 1.0)
rb, tb = step_RT(0.5, 1.0)
put('l13TStepR2', r2)
put('l13TStepT2', t2)
put('l13TStepR3', r3)
put('l13TStepT3', t3)
r15, t15 = step_RT(1.5, 1.0)
put('l13PrStepR', r15)
put('l13PrStepT', t15)
put('l13TStepRbelow', rb)
put('l13TStepTbelow', tb)
put('l13TBookAT', barrier_T(5.0, 10.0, 0.53, HBAR2_2M))  # E = 5 eV, V0 = 10 eV, a = 0.53 angstrom
put('l13TBookBohrT', barrier_T(5.0, 10.0, 0.529177, HBAR2_2M))
put('l13TBookQa', sqrt((10.0 - 5.0) / HBAR2_2M) * 0.53)
put('l13TEV0T', barrier_T(2.0, 2.0, 1.0))  # E = V0 = 2 (hbar = m = 1): k a = 2
q_th = sqrt((10.0 - 5.0) / HBAR2_2M)
k_th = sqrt(5.0 / HBAR2_2M)
thick = (4 * k_th * q_th / (k_th**2 + q_th**2)) ** 2 * np.exp(-2 * q_th * 3.0)
put('l13TThickRatio', barrier_T(5.0, 10.0, 3.0, HBAR2_2M) / thick)  # exact over thick, a = 0.30 nm
put('l13TDecayFactor', np.exp(-2.0))  # one more decay length 1/q multiplies the thick-barrier T by e^{-2}
put('l13PrTunnelPct', 100 * barrier_T(5.0, 8.0, 3.0, HBAR2_2M))

# ---- the probability current on the grid (np.fft) ----
NG, LBOX = 4096, 64.0
dxg = LBOX / NG
xg = -LBOX / 2 + dxg * np.arange(NG)
kg = 2 * pi * np.fft.fftfreq(NG, d=dxg)
psi = (2 * pi) ** -0.25 * np.exp(-(xg**2) / 4) * np.exp(1j * 1.5 * xg)
p1 = np.fft.ifft(kg * np.fft.fft(psi))
j = np.real(np.conj(psi) * p1)
put('l13TCurrentMean', np.sum(j) * dxg)
psi_t = -0.5j * np.fft.ifft(kg**2 * np.fft.fft(psi))
rho_t = 2 * np.real(np.conj(psi) * psi_t)
dj = np.real(np.fft.ifft(1j * kg * np.fft.fft(j)))
put('l13TContResidual', np.max(np.abs(rho_t + dj)))

# ---- Gaussian chirp: the free packet at t = 4 (np.fft evolution), sigma = 1 ----
psi0 = (2 * pi) ** -0.25 * np.exp(-(xg**2) / 4) + 0j
psi4 = np.fft.ifft(np.exp(-0.5j * kg**2 * 4.0) * np.fft.fft(psi0))
rho4 = np.abs(psi4) ** 2
m1 = np.sum(xg * rho4) * dxg
dx4 = sqrt(np.sum((xg - m1) ** 2 * rho4) * dxg)
pp = np.fft.ifft(kg * np.fft.fft(psi4))
mp = np.real(np.sum(np.conj(psi4) * pp) * dxg)
dp4 = sqrt(np.sum(np.abs(pp) ** 2) * dxg - mp**2)
put('l13TChirpProduct', dx4 * dp4)

# ---- double slit, helium at 2200 m/s, slits 8 micrometres apart ----
lam = h / (4.00260325413 * u * 2200.0)
put('l13THeFringeUrad', lam / 8e-6 * 1e6)
put('l13TWhichWayUrad', 2 * lam / 8e-6 * 1e6)

# ---- evolution time: a precessing spin (H = S_z, hbar = omega = 1) saturates Delta E * Delta t = 1/2 at every instant ----
Sx = np.array([[0, 1], [1, 0]], complex) / 2
Sz = np.array([[1, 0], [0, -1]], complex) / 2


def state(t):
    return np.diag(np.exp(-1j * np.array([0.5, -0.5]) * t)) @ (np.array([1, 1], complex) / sqrt(2))


def mean(A, t):
    s = state(t)
    return np.real(np.vdot(s, A @ s))


t70 = 70 * pi / 180
s = state(t70)
dE = sqrt(np.real(np.vdot(s, Sz @ Sz @ s)) - mean(Sz, t70) ** 2)
dA = sqrt(np.real(np.vdot(s, Sx @ Sx @ s)) - mean(Sx, t70) ** 2)
def central(eps):
    return (mean(Sx, t70 + eps) - mean(Sx, t70 - eps)) / (2 * eps)


rate = (4 * central(5e-4) - central(1e-3)) / 3  # one Richardson step on the central difference: error O(eps^4)
put('l13TTimeBound', dE * dA / abs(rate))
# ammonia: the state |I> of H = [[E0, -A], [-A, E0]] has Delta E = A; its overlap with itself first vanishes at the half period of the flip
A_am, E0_am = 1.0, 3.0
Ham = np.array([[E0_am, -A_am], [-A_am, E0_am]])
sI = np.array([1.0, 0.0])
dE_am = sqrt(sI @ Ham @ Ham @ sI - (sI @ Ham @ sI) ** 2)
wam, vam = np.linalg.eigh(Ham)


def amp(t):
    """<I|psi(t)> with the overall phase e^{iE0 t} removed: real, = cos(A t); its first zero is the half period of the flip."""
    return np.real(np.vdot(sI, (vam * np.exp(-1j * wam * t)) @ (vam.T @ sI)) * np.exp(1j * E0_am * t))


lo_t, hi_t = 0.0, 3.0  # amp(0) = 1 > 0 > amp(3): one sign change in between
for _ in range(80):
    mid = 0.5 * (lo_t + hi_t)
    if amp(mid) > 0:
        lo_t = mid
    else:
        hi_t = mid
t_zero = 0.5 * (lo_t + hi_t)
put('l13TAmmDtRatio', (1 / (2 * dE_am)) / t_zero)

# ---- engine cases ----
cases['stepRT'] = [{'E': E, 'V0': 1.0, 'R': step_RT(E, 1.0)[0], 'T': step_RT(E, 1.0)[1]} for E in (0.25, 0.9, 1.1, 1.5, 2.0, 3.0, 8.0)]
cases['barrierT'] = [
    {'E': E, 'V0': V0, 'a': a, 'T': barrier_T(E, V0, a)}
    for (E, V0, a) in ((0.5, 1.0, 1.0), (0.5, 1.0, 3.0), (0.2, 1.0, 0.5), (0.9, 1.0, 2.0), (1.0, 1.0, 2.0), (1.3, 1.0, 2.0), (2.0, 1.0, 1.7), (4.0, 1.0, 0.9))
]
cases['barrierThick'] = [
    {'E': E, 'V0': V0, 'a': a, 'T': (4 * sqrt(2 * E) * sqrt(2 * (V0 - E)) / (2 * E + 2 * (V0 - E))) ** 2 * np.exp(-2 * sqrt(2 * (V0 - E)) * a)}
    for (E, V0, a) in ((0.5, 1.0, 3.0), (0.2, 1.0, 4.0))
]
cases['boxOverlap'] = [
    {'a': list(a), 'b': list(b), 'value': overlap(a, b)}
    for (a, b) in (
        ((0.0, 1.0, 1), (0.0, 2.0, 1)),
        ((0.0, 1.0, 2), (0.0, 1.0, 2)),
        ((0.0, 1.0, 2), (0.0, 1.0, 3)),
        ((0.0, 1.0, 1), (0.5, 2.5, 2)),
        ((-0.5, 0.5, 1), (-1.0, 1.0, 3)),
        ((0.0, 3.0, 4), (1.0, 2.0, 1)),
        ((0.0, 1.0, 1), (2.0, 3.0, 1)),
    )
]
cases['boxEnergy'] = [{'L': L, 'n': n, 'E': (n * pi / L) ** 2 / 2} for (L, n) in ((1.0, 1), (4.0, 3), (2.5, 2))]
cases['momentum'] = {'meanCurrent': out['l13TCurrentMean'], 'residual': out['l13TContResidual']}

(ROOT / 'app/src/physics/__fixtures__/claims-448').mkdir(parents=True, exist_ok=True)
(ROOT / 'app/src/physics/__fixtures__/claims-448/g4b.json').write_text(
    json.dumps({'about': 'Numpy twin of the 448 Townsend pass G4b (Lecture 13): pipeline/claims_448/g4b.py', 'values': dict(sorted(out.items()))}, indent=1) + '\n'
)
(ROOT / 'app/src/physics/__fixtures__/scatter-g4b.json').write_text(json.dumps({'about': 'engine cases for wave.ts box functions and scatter.ts: pipeline/claims_448/g4b.py', 'cases': cases}, indent=1) + '\n')
print(len(out), 'keys')
