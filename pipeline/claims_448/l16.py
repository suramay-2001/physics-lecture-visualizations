#!/usr/bin/env python3
"""Numpy twin of Physics 448 Lecture 16 (Gaussian packets and Ehrenfest): every `l16...` claim key, plus the engine cases for physics/wave16.ts.

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - the closed-form psi(x, t) is built in numpy complex arithmetic (np.sqrt of 1 + i tau, complex exponent) and compared with np.fft evolution (phase e^{-i k^2 t/2m}); Townsend's (6.76) is typed
    as he prints it, with a = sqrt 2 sigma, and compared with ours;
  - a rate d<A>/dt = (i/hbar)<[H, A]> is evaluated through the Hermitian identity  i<[H, A]> = -2 Im <H psi | A psi>  (one application of H, one of A), not as H(A psi) - A(H psi); each rate is also
    asserted against the analytic Gaussian moment it should equal (<p>/m, -<V'>);
  - the covariance of x and p is Re<a|b> with a = (x - <x>) psi and b = (p - <p>) psi (the symmetrised product written out), not Re<x p> - <x><p>;
  - the focus time of a chirped packet is -C_xp / (Delta p)^2 from grid moments, and a bounded scalar minimiser over the np.fft widths is asserted to agree to 1e-6; the closed-form width
    sqrt(sigma^2 + 2 t C / m + t^2 (Delta p)^2 / m^2) is asserted against the FFT evolution;
  - the doubling time is a brentq root of the closed-form width minus twice the start, not t_s sqrt 3; the spin rate is scipy.linalg.expm of -iHt on |+x> with dense 2 x 2 matrices;
  - SI numbers use the CODATA 2018 values written out below (the engine's constants), never scipy.constants.

Usage (from the repo root): python3 pipeline/claims_448/l16.py -> app/src/physics/__fixtures__/claims-448/l16.json and app/src/physics/__fixtures__/wave16-cases.json
(run it twice: byte-identical). Checked by app/src/content/claims.test.ts (engine value per key at 1e-12) and app/src/physics/wave16.test.ts (engine cases).
"""
import json
from math import pi, sqrt
from pathlib import Path

import numpy as np
from scipy.linalg import expm
from scipy.optimize import brentq, minimize_scalar

ROOT = Path(__file__).resolve().parent.parent.parent
out = {}
cases = {}


def put(key, v):
    v = float(v)
    out[key] = 0.0 if abs(v) < 1e-12 else v


# ---- the lectures' grid: N = 4096 on [-32, 32) ----
N, LEN = 4096, 64.0
dx = LEN / N
x = -LEN / 2 + dx * np.arange(N)
k = 2 * pi * np.fft.fftfreq(N, d=dx)

# ---- SI constants (CODATA 2018, the engine's) ----
H = 6.62607015e-34
HBAR = H / (2 * pi)
ME = 9.1093837015e-31
YEAR = 3.15576e7


def pk(x0, s, p0=0.0):
    return (2 * pi * s * s) ** -0.25 * np.exp(-((x - x0) ** 2) / (4 * s * s)) * np.exp(1j * p0 * x)


def chirp(x0, s, p0, beta):
    return pk(x0, s, p0) * np.exp(1j * beta * (x - x0) ** 2)


def evolve(psi, t, m=1.0):
    return np.fft.ifft(np.fft.fft(psi) * np.exp(-1j * k**2 * t / (2 * m)))


def mean_x(psi):
    return np.sum(x * np.abs(psi) ** 2) * dx


def sd_x(psi):
    w = np.abs(psi) ** 2 * dx
    return sqrt(np.sum(x**2 * w) - np.sum(x * w) ** 2)


def pmom(psi):
    """mean, sd and kinetic energy (m = 1) from the FFT weights |c_k|^2 / sum (Parseval)."""
    c = np.fft.fft(psi)
    w = np.abs(c) ** 2 / np.sum(np.abs(c) ** 2)
    mean = np.sum(k * w)
    return mean, sqrt(np.sum(k**2 * w) - mean**2), 0.5 * np.sum(k**2 * w)


def exact(x0, s, p0, t, m=1.0):
    """The notes' closed form (Sec. 16.3) in numpy complex arithmetic, phase convention of the grid packet (e^{i p0 x})."""
    tau = t / (2 * m * s * s)
    X = x - x0 - p0 * t / m
    return (2 * pi * s * s) ** -0.25 / np.sqrt(1 + 1j * tau) * np.exp(-(X**2) / (4 * s * s * (1 + 1j * tau))) * np.exp(1j * (p0 * x - p0**2 * t / (2 * m)))


def townsend76(a, t, m=1.0):
    """Townsend's (6.76) as printed (x0 = p0 = 0)."""
    return 1 / np.sqrt(np.sqrt(pi) * (a + 1j * t / (m * a))) * np.exp(-(x**2) / (2 * a**2 * (1 + 1j * t / (m * a**2))))


def rate(psi, V, which, m=1.0):
    """d<A>/dt = i<[H, A]> = -2 Im <H psi | A psi> for H = p^2/2m + V, A = x or p (hbar = 1)."""
    hpsi = np.fft.ifft(k**2 / (2 * m) * np.fft.fft(psi)) + V * psi
    a = x * psi if which == 'x' else np.fft.ifft(k * np.fft.fft(psi))
    return float(-2 * np.imag(np.sum(np.conj(hpsi) * a) * dx))


def covariance(psi):
    """C_xp = Re<a|b> with a = (x - <x>) psi, b = (p - <p>) psi."""
    xm = mean_x(psi)
    pm = pmom(psi)[0]
    a = (x - xm) * psi
    b = np.fft.ifft((k - pm) * np.fft.fft(psi))
    return float(np.real(np.sum(np.conj(a) * b) * dx))


def width_closed(s, beta, t, m=1.0):
    c = 2 * beta * s * s
    dp2 = 1 / (4 * s * s) + 4 * beta**2 * s * s
    return sqrt(s * s + 2 * t * c / m + t * t * dp2 / m**2)


# ---- l16-start ----
K1 = pk(0, 1)
K3 = pk(0, 1, 3)
put('l16Dp1', pmom(K1)[1])
put('l16Product0', sd_x(K1) * pmom(K1)[1])
put('l16Peak0', np.max(np.abs(K1) ** 2))
put('l16DpFixed', pmom(evolve(K1, 4.0))[1] - pmom(K1)[1])
put('l16CentreStays', mean_x(evolve(K1, 4.0)))
put('l16StDp', pmom(pk(0, 0.5))[1])
put('l16StCentre', mean_x(evolve(pk(1, 1), 3.0)))
G05_P2 = pk(0, 0.5, 2.0)
c05 = np.fft.fft(G05_P2)
w05 = np.abs(c05) ** 2 / np.sum(np.abs(c05) ** 2)
put('l16PrP2', np.sum(k**2 * w05))
put('l16PrKinetic', pmom(G05_P2)[2])
assert abs(out['l16PrKinetic'] - (4 + 1 / (4 * 0.25)) / 2) < 1e-9  # (p0^2 + hbar^2/4 sigma^2)/2m = 2.5

# ---- l16-evolve ----
put('l16Ts1', 2 * 1.0 * 1.0**2 / 1.0)
gaps = []
for t in (1.0, 2.0, 4.0):
    gaps.append(np.max(np.abs(exact(0, 1, 3, t) - evolve(K3, t))))
put('l16FormulaGap', max(gaps))
put('l16FormulaT0Gap', np.max(np.abs(exact(0, 1, 3, 0.0) - K3)))
put('l16Mean2', mean_x(exact(0, 1, 3, 2.0)))
put('l16TownsendGap', np.max(np.abs(townsend76(sqrt(2), 2.0) - exact(0, 1, 0, 2.0))))
put('l16EvTs', 2 * 1.0 * 1.5**2 / 1.0)
put('l16EvCentre', mean_x(evolve(pk(1, 1, 3), 2.0)))

# ---- l16-spread ----
ev2 = evolve(K1, 2.0)
ev4 = evolve(K1, 4.0)
put('l16PeakTs', np.max(np.abs(ev2) ** 2))
put('l16Norm4', np.sum(np.abs(ev4) ** 2) * dx)
put('l16FreeSd2', sd_x(ev2))
put('l16FreeSd4', sd_x(ev4))
put('l16FreeDp4', pmom(evolve(K3, 4.0))[1])
# t = 20 needs more room than the lectures' grid (the width reaches 10): evolve on a wider np.fft grid, the packet is the same Gaussian
NW, LW = 16384, 256.0
dxw = LW / NW
xw = -LW / 2 + dxw * np.arange(NW)
kw = 2 * pi * np.fft.fftfreq(NW, d=dxw)
pw = (2 * pi) ** -0.25 * np.exp(-(xw**2) / 4)
evw = np.fft.ifft(np.fft.fft(pw) * np.exp(-1j * kw**2 * 20.0 / 2))
wgt = np.abs(evw) ** 2 * dxw
sdw = sqrt(np.sum(xw**2 * wgt) - np.sum(xw * wgt) ** 2)
put('l16FarRatio', sdw / (pmom(K1)[1] * 20.0))
put('l16Dx05T2', sd_x(evolve(pk(0, 0.5), 2.0)))
put('l16DxCross', sd_x(evolve(K1, 1.0)))
put('l16ProductTs', sd_x(ev2) * pmom(ev2)[1])
put('l16Product4', sd_x(ev4) * pmom(ev4)[1])
put('l16SpDx', sd_x(evolve(pk(0, 2), 8.0)))
assert abs(sd_x(evolve(pk(0, 0.5), 1.0)) - out['l16DxCross']) < 1e-9  # the two packets are equally wide at t = 1
T_ELECTRON = ME * (1e-10) ** 2 / HBAR
T_MARBLE = 1e-3 * (1e-3) ** 2 / HBAR
put('l16SpreadElectronMant', T_ELECTRON / 1e-17)
put('l16SpreadElectronLog10', np.log10(T_ELECTRON))
put('l16SpreadMarbleMant', T_MARBLE / 1e24)
put('l16SpreadMarbleYearsMant', T_MARBLE / YEAR / 1e17)

# the chirp: sigma = 1, beta = -0.2
put('l16EchoBeta', 0.2)
CH = chirp(0, 1, 0, -0.2)
cdp = pmom(CH)[1]
ccov = covariance(CH)
put('l16ChirpDp', cdp)
put('l16ChirpCovMag', abs(ccov))
tstar = -ccov / cdp**2
put('l16ChirpFocusTime', tstar)
put('l16ChirpMinWidth', sd_x(evolve(CH, tstar)))
put('l16ChirpBackTime', 2 * tstar)
put('l16ChirpDxBack', sd_x(evolve(CH, 2 * tstar)))
assert abs(width_closed(1, -0.2, tstar) - out['l16ChirpMinWidth']) < 1e-8  # the closed form agrees with the FFT evolution
res = minimize_scalar(lambda t: sd_x(evolve(CH, t)), bounds=(0.2, 2.0), method='bounded', options={'xatol': 1e-10})
assert abs(res.x - tstar) < 1e-6  # the numerical minimum sits at the moment formula's focus time

# ---- l16-ehrenfest ----
X2 = 0.5 * x**2
P21 = pk(2, 1, 1.5)
put('l16EhrenfestDxdt', rate(P21, X2, 'x'))
assert abs(out['l16EhrenfestDxdt'] - pmom(P21)[0]) < 1e-9  # d<x>/dt = <p>/m
G2 = pk(2, 1)
# the moved key keeps its old route: i<[V, p]> written out as the composite V(p psi) - p(V psi)
cpsi = X2 * np.fft.ifft(k * np.fft.fft(G2)) - np.fft.ifft(k * np.fft.fft(X2 * G2))
put('l16EhrenfestDpDt', -np.imag(np.sum(np.conj(G2) * cpsi) * dx))
assert abs(rate(G2, X2, 'p') - out['l16EhrenfestDpDt']) < 1e-9  # the Hermitian-identity route agrees
put('l16EhrenfestForceMean', -np.sum(x * np.abs(G2) ** 2) * dx)
put('l16EhrenfestFreeGap', abs(mean_x(evolve(K3, 4.0)) - 12.0))
put('l16FreeMeanP4', pmom(evolve(K3, 4.0))[0])

# ---- practice ----
sig = 0.5e-9
ts_si = 2 * ME * sig**2 / HBAR
put('l16PrTsFs', ts_si / 1e-15)
root = brentq(lambda t: sqrt(1 + (t / ts_si) ** 2) - 2.0, 1e-18, 1e-12, xtol=1e-30, rtol=1e-15)
put('l16PrDoubleFs', root / 1e-15)
Q = pk(1, 0.5)
put('l16PrQuarticDpdt', rate(Q, 0.25 * x**4, 'p'))
put('l16PrQuarticMean3', np.sum(x**3 * np.abs(Q) ** 2) * dx)
put('l16PrQuarticCentreForce', -(mean_x(Q) ** 3))
assert abs(out['l16PrQuarticDpdt'] + 1.75) < 1e-9 and abs(out['l16PrQuarticMean3'] - (1 + 3 * 1 * 0.25)) < 1e-9
Hs = 0.5 * np.array([[1, 0], [0, -1]], dtype=complex)
Xs = np.array([[0, 1], [1, 0]], dtype=complex)
psi_s = expm(-1j * Hs * (pi / 3)) @ (np.array([1, 1], dtype=complex) / sqrt(2))
put('l16PrSpinDXdt', np.real(1j * (np.conj(psi_s) @ ((Hs @ Xs - Xs @ Hs) @ psi_s))))
put('l16PrSpinMag', abs(out['l16PrSpinDXdt']))

# ---- engine cases for physics/wave16.ts ----
idx = [1700, 1900, 2048, 2176, 2300, 2500]
cases['exact'] = []
for (x0, s, p0, t, m) in ((0, 1, 3, 2.0, 1.0), (1, 0.8, 1.5, 3.0, 1.0), (-2, 0.5, 0.0, 1.0, 2.0), (0, 1.5, -2.0, 4.0, 0.5)):
    psi = exact(x0, s, p0, t, m)
    cases['exact'].append({'x0': x0, 's': s, 'p0': p0, 't': t, 'm': m, 'idx': idx, 're': [float(psi[i].real) for i in idx], 'im': [float(psi[i].imag) for i in idx],
                           'fft': float(np.max(np.abs(psi - evolve(pk(x0, s, p0), t, m))))})
cases['chirpWidth'] = []
for (s, b, t, m) in ((1.0, -0.2, 0.9756, 1.0), (1.0, -0.2, 1.9512, 1.0), (0.8, 0.15, 2.0, 1.0), (1.2, -0.3, 1.0, 1.5), (1.0, 0.0, 3.0, 1.0)):
    cases['chirpWidth'].append({'s': s, 'b': b, 't': t, 'm': m, 'v': sd_x(evolve(chirp(0, s, 0.0, b), t, m))})
cases['chirpMoments'] = []
for (x0, s, p0, b) in ((0, 1.0, 0.0, -0.2), (1.0, 0.8, 1.5, 0.15), (-2.0, 1.2, -1.0, -0.3), (0.5, 1.0, 0.5, 0.0)):
    ch = chirp(x0, s, p0, b)
    cases['chirpMoments'].append({'x0': x0, 's': s, 'p0': p0, 'b': b, 'dp': pmom(ch)[1], 'cov': covariance(ch)})
POTS = {'zero': 0.0 * x, 'harmonic': 0.5 * x**2, 'quartic': 0.25 * x**4, 'linear': 0.3 * x}
cases['rate'] = []
for (name, x0, s, p0, which, m) in (('harmonic', 2.0, 1.0, 1.5, 'x', 1.0), ('harmonic', 2.0, 1.0, 0.0, 'p', 1.0), ('quartic', 1.0, 0.5, 0.0, 'p', 1.0), ('linear', 0.5, 1.0, 1.0, 'p', 1.0),
                                    ('zero', 0.0, 1.0, 3.0, 'x', 2.0), ('harmonic', -1.0, 0.7, 0.8, 'x', 0.5)):
    cases['rate'].append({'V': name, 'x0': x0, 's': s, 'p0': p0, 'which': which, 'm': m, 'v': rate(pk(x0, s, p0), POTS[name], which, m)})
cases['widthTime'] = []
for (s, r, m, hb) in ((1.0, 2.0, 1.0, 1.0), (0.5, 3.0, 2.0, 1.0), (0.5e-9, 2.0, ME, HBAR)):
    ts = 2 * m * s * s / hb
    v = brentq(lambda t: sqrt(1 + (t / ts) ** 2) - r, 1e-3 * ts, 1e3 * ts, xtol=1e-30, rtol=1e-15)
    cases['widthTime'].append({'s': s, 'r': r, 'm': m, 'hbar': hb, 'v': v})
cases['spinRate'] = []
for wt in (0.0, pi / 6, pi / 3, pi / 2, 2.0):
    ps = expm(-1j * Hs * wt) @ (np.array([1, 1], dtype=complex) / sqrt(2))
    cases['spinRate'].append({'wt': wt, 'v': float(np.real(1j * (np.conj(ps) @ ((Hs @ Xs - Xs @ Hs) @ ps))))})
cases['townsend'] = []
for (a, t, m) in ((sqrt(2), 2.0, 1.0), (1.3, 1.5, 2.0)):
    psi = townsend76(a, t, m)
    cases['townsend'].append({'a': a, 't': t, 'm': m, 'idx': idx, 're': [float(psi[i].real) for i in idx], 'im': [float(psi[i].imag) for i in idx]})

(ROOT / 'app/src/physics/__fixtures__/claims-448').mkdir(parents=True, exist_ok=True)
(ROOT / 'app/src/physics/__fixtures__/claims-448/l16.json').write_text(
    json.dumps({'about': 'Numpy twin of Physics 448 Lecture 16: pipeline/claims_448/l16.py', 'values': dict(sorted(out.items()))}, indent=1) + '\n'
)
(ROOT / 'app/src/physics/__fixtures__/wave16-cases.json').write_text(json.dumps({'about': 'engine cases for physics/wave16.ts: pipeline/claims_448/l16.py', 'cases': cases}, indent=1) + '\n')
print(len(out), 'keys')
