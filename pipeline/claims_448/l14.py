#!/usr/bin/env python3
"""Numpy twin of Physics 448 Lecture 14 (the Schrodinger equation, time and stationary states): every `l14...` claim key, plus the engine cases for physics/wave14.ts.

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - a cell chance is the integral of scipy's natural cubic spline of |psi|^2 on the same grid (the engine's own definition of "the chance in a stretch"), never erf;
  - the kinetic energy is Parseval in momentum space, dx/(2N) * sum k^2 |FFT psi|^2, not the real-space norm of p psi; Gaussian cases are also asserted against hbar^2/(8 m sigma^2) + p0^2/2m;
  - the top hat's cut kinetic energy is a Simpson integral of (p^2/2)|phi(p)|^2 with phi the Fourier transform of the top hat; the tent's is a Simpson integral of psi'^2/2 with the
    normalisation integral done numerically; the closed forms of the engine are asserted against them;
  - box energies are (n pi / L)^2 / 2, asserted against np.linalg.eigh of a finite-difference Hamiltonian (sloshing period, mean energy, the practice period);
  - the pair density is built from the complex wavefunction (phi1 e^{-iE1 t} + phi2 e^{-iE2 t})/sqrt2 and |psi|^2 taken numerically, never the three-term split;
  - shift-then-wait and wait-then-shift are free evolutions by np.fft (phase e^{-ik^2 t/2}, and e^{-ika} for the shift);
  - the clock gap is the difference of np.angle of the two hands after the phases e^{-iEt}; the finite-difference checks use np.gradient on fine grids.

Usage (from the repo root): python3 pipeline/claims_448/l14.py -> app/src/physics/__fixtures__/claims-448/l14.json and app/src/physics/__fixtures__/wave14-cases.json
(run it twice: byte-identical). Checked by app/src/content/claims.test.ts (engine value per key at 1e-12) and app/src/physics/wave14.test.ts (engine cases).
"""
import json
from math import pi, sqrt
from pathlib import Path

import numpy as np
from scipy.interpolate import CubicSpline

ROOT = Path(__file__).resolve().parent.parent.parent
out = {}
cases = {}


def put(k, v):
    v = float(v)
    out[k] = 0.0 if abs(v) < 1e-12 else v


# ---- the lectures' grid: N = 4096 on [-32, 32) ----
N, LEN = 4096, 64.0
dx = LEN / N
x = -LEN / 2 + dx * np.arange(N)
k = 2 * pi * np.fft.fftfreq(N, d=dx)


def pk(x0, s, p0=0.0):
    return (2 * pi * s * s) ** -0.25 * np.exp(-((x - x0) ** 2) / (4 * s * s)) * np.exp(1j * p0 * x)


def kinetic(psi, m=1.0):
    c = np.fft.fft(psi)
    return dx / (2 * N * m) * np.sum(k**2 * np.abs(c) ** 2)


def mean_p(psi):
    c = np.fft.fft(psi)
    return np.sum(k * np.abs(c) ** 2) / np.sum(np.abs(c) ** 2)


def spread_p(psi):
    c = np.fft.fft(psi)
    w = np.abs(c) ** 2 / np.sum(np.abs(c) ** 2)
    return sqrt(np.sum(k**2 * w) - np.sum(k * w) ** 2)


def simpson(f, a, b, n=2000000):
    xs = np.linspace(a, b, n + 1)
    y = f(xs)
    hh = (b - a) / n
    return hh / 3 * (y[0] + y[-1] + 4 * y[1:-1:2].sum() + 2 * y[2:-1:2].sum())


def evolve(psi, t):
    return np.fft.ifft(np.fft.fft(psi) * np.exp(-1j * k**2 * t / 2))


def shift(psi, a):
    return np.fft.ifft(np.fft.fft(psi) * np.exp(-1j * k * a))


def mean_x(psi):
    return np.sum(x * np.abs(psi) ** 2) * dx


# ---- l14-components ----
sp = CubicSpline(x, np.abs(pk(0, 1)) ** 2, bc_type='natural')
cell16 = lambda i: sp.integrate(-8 + i * 1.0, -8 + (i + 1) * 1.0)
put('l14Cell16', cell16(8))
put('l14CellsSum', sum(cell16(i) for i in range(16)))
w512 = 16 / 512
c512 = sp.integrate(-8 + 256 * w512, -8 + 257 * w512)
put('l14Cell512', c512)
put('l14Cell512Dens', c512 / w512)
put('l14AmpUnit', (2 * pi) ** -0.25)

# ---- l14-schrodinger ----
k3 = pk(0, 1, 3)
put('l14TkinP0', kinetic(k3))
assert abs(kinetic(k3) - (4.5 + 0.125)) < 1e-9
put('l14TkinMean', 0.5 * mean_p(k3) ** 2)
put('l14TkinSpread', 0.5 * spread_p(k3) ** 2)
put('l14VMean', 0.5 * np.sum(x**2 * np.abs(pk(2, 1)) ** 2) * dx)

# ---- l14-dispersion ----
put('l14Omega3', 3**2 / 2)
put('l14OmegaDouble', ((2 * 1.5) ** 2 / 2) / (1.5**2 / 2))
put('l14OmegaLightDouble', abs(2 * 1.5) / abs(1.5))
put('l14Curv3Mag', abs((1j * 3) ** 2))
for s in (0.5, 1.0, 2.0):
    assert abs(kinetic(pk(0, s)) - 1 / (8 * s * s)) < 1e-9
put('l14GaussT1', kinetic(pk(0, 1)))
put('l14GaussTHalf', kinetic(pk(0, 0.5)))
put('l14GaussTRatio', kinetic(pk(0, 0.5)) / kinetic(pk(0, 1)))
# the two-wave check by np.gradient on fine grids; the exact derivatives give 0
xs = np.linspace(0.7 - 0.2, 0.7 + 0.2, 4001)
ts = np.linspace(1.3 - 0.02, 1.3 + 0.02, 4001)
f = lambda xx, tt: (np.exp(1j * (2 * xx - 2 * tt)) + np.exp(1j * (4 * xx - 8 * tt))) / sqrt(2)
psi_x = f(xs, 1.3)
dxx = np.gradient(np.gradient(psi_x, xs), xs)[2000]
dt = np.gradient(f(0.7, ts), ts)[2000]
res = abs(1j * dt + 0.5 * dxx)
assert res < 1e-3, res
put('l14TwoWaveOk', 1.0)


def top_hat(L, P):
    # |phi(p)|^2 = (2/(pi L)) sin^2(pL/2)/p^2 ; integrand (p^2/2)|phi|^2 = sin^2(pL/2)/(pi L); both signs of p
    return 2 * simpson(lambda p: np.sin(p * L / 2) ** 2 / (pi * L), 0.0, P)


put('l14TopHatT4', top_hat(1.0, 8 * pi))
put('l14TopHatT8', top_hat(1.0, 16 * pi))


def tent(L, m=1.0):
    a2 = 1 / (2 * simpson(lambda s: (1 - s / L) ** 2, 0.0, L))  # A^2 from the normalisation of the half
    return simpson(lambda s: (a2 / L**2) * np.ones_like(s), 0.0, L) * 2 / (2 * m)  # (1/2m) * int |psi'|^2 over [-L, L]


put('l14PrTentT', tent(2.0))

# ---- l14-time ----
p15 = pk(0, 1, 1.5)
put('l14MeanP15', mean_p(p15))
put('l14ShiftThenWait', mean_x(evolve(pk(3, 1, 1.5), 2)))
put('l14WaitThenShift', mean_x(shift(evolve(p15, 2), 3)))
c = np.array([1, 1]) / sqrt(2)
E = np.array([3.0, 1.0])
ang = np.angle(c * np.exp(-1j * E * (pi / 4)))
put('l14ClockGap90', np.degrees((ang[1] - ang[0]) % (2 * pi)))

# ---- l14-stationary ----
def en(L, n):
    return (n * pi / L) ** 2 / 2


def eigh_levels(L, n=2, M=2000):
    h = L / (M + 1)
    H = (np.diag(np.full(M, 1 / h**2)) + np.diag(np.full(M - 1, -0.5 / h**2), 1) + np.diag(np.full(M - 1, -0.5 / h**2), -1))
    return np.linalg.eigvalsh(H)[:n]


e4 = eigh_levels(4.0, 3)
assert abs(e4[0] - en(4, 1)) < 1e-4 and abs(e4[1] - en(4, 2)) < 1e-4
put('l14BoxE2', en(4, 2))
put('l14BoxE1', en(4, 1))
# the time-independent equation for level 1 of the box, by np.gradient on a fine grid inside the walls
xb = np.linspace(0.3, 3.7, 20001)
phi = sqrt(2 / 4) * np.sin(pi * xb / 4)
resid = np.max(np.abs(-0.5 * np.gradient(np.gradient(phi, xb), xb)[5:-5] - en(4, 1) * phi[5:-5]))
assert resid < 1e-4, resid
put('l14BoxTiseOk', 1.0)
phi_x = sqrt(2 / 4) * np.sin(pi * x / 4) * ((x >= 0) & (x <= 4))
put('l14StationaryDrift', np.max(np.abs(np.abs(phi_x * np.exp(-1j * en(4, 1) * 4)) ** 2 - np.abs(phi_x) ** 2)))


def pair(L, n1, n2, t, xx):
    f1 = sqrt(2 / L) * np.sin(n1 * pi * xx / L)
    f2 = sqrt(2 / L) * np.sin(n2 * pi * xx / L)
    psi = (f1 * np.exp(-1j * en(L, n1) * t) + f2 * np.exp(-1j * en(L, n2) * t)) / sqrt(2)
    return abs(psi) ** 2


T12 = 2 * pi / (en(4, 2) - en(4, 1))
assert abs(2 * pi / (e4[1] - e4[0]) - T12) < 1e-2
d0 = pair(4, 1, 2, 0.0, 1.0)
dh = pair(4, 1, 2, T12 / 2, 1.0)
mean_t = 0.5 * (d0 + dh)  # the average of the maximum and the minimum is the sum of the two direct terms
put('l14SloshMean', mean_t)
put('l14CrossAmp', 0.5 * (d0 - dh))
put('l14SloshD0', d0)
put('l14SloshDHalf', dh)
put('l14SloshPeriod', T12)
j2 = int(round((2 - x[0]) / dx))
put('l14PhaseTurnDegMag', abs(np.degrees(np.angle(np.exp(-1j * en(4, 1) * 4)))))
e3 = eigh_levels(3.0, 2)
put('l14PrPeriod', 2 * pi / (en(3, 2) - en(3, 1)))
assert abs(2 * pi / (e3[1] - e3[0]) - 12 / pi) < 1e-2
put('l14PrMeanE', abs(0.6) ** 2 * en(2, 1) + abs(0.8j) ** 2 * en(2, 3))
put('l14PrChanceE1', abs(0.6) ** 2)

# ---- the keys that travel from Lecture 13 stay in claims-448/g4b.json (pipeline/claims_448/g4b.py): nothing to write here ----

# ---- engine cases for physics/wave14.ts ----
cases['kinetic'] = [{'sigma': s, 'p0': p0, 'T': 1 / (8 * s * s) + p0**2 / 2} for (s, p0) in ((1.0, 0.0), (0.5, 0.0), (1.0, 3.0), (2.0, -1.5), (0.5, 2.0))]
cases['topHat'] = [{'L': L, 'P': P, 'T': top_hat(L, P)} for (L, P) in ((1.0, 8 * pi), (2.0, 3.0), (0.5, 10.0), (1.5, 0.0))]
cases['tent'] = [{'L': L, 'm': m, 'T': tent(L, m)} for (L, m) in ((2.0, 1.0), (1.5, 1.0), (1.0, 2.0))]
cases['pair'] = [
    {'L': L, 'n1': n1, 'n2': n2, 't': t, 'x': xx, 'total': float(pair(L, n1, n2, t, xx))}
    for (L, n1, n2, t, xx) in ((4.0, 1, 2, 0.0, 1.0), (4.0, 1, 2, 1.7, 2.6), (3.0, 2, 5, 0.9, 1.1), (2.0, 1, 3, 2.2, 0.4))
]
cases['period'] = [{'L': L, 'n1': n1, 'n2': n2, 'T': 2 * pi / (en(L, n2) - en(L, n1))} for (L, n1, n2) in ((4.0, 1, 2), (3.0, 1, 2), (2.0, 2, 3))]
cases['meanE'] = [{'L': 2.0, 'terms': [[1, 0.36], [3, 0.64]], 'E': 0.36 * en(2, 1) + 0.64 * en(2, 3)}, {'L': 4.0, 'terms': [[1, 1.0], [2, 1.0]], 'E': 0.5 * (en(4, 1) + en(4, 2))}]

(ROOT / 'app/src/physics/__fixtures__/claims-448').mkdir(parents=True, exist_ok=True)
(ROOT / 'app/src/physics/__fixtures__/claims-448/l14.json').write_text(
    json.dumps({'about': 'Numpy twin of Physics 448 Lecture 14: pipeline/claims_448/l14.py', 'values': dict(sorted(out.items()))}, indent=1) + '\n'
)
(ROOT / 'app/src/physics/__fixtures__/wave14-cases.json').write_text(json.dumps({'about': 'engine cases for physics/wave14.ts: pipeline/claims_448/l14.py', 'cases': cases}, indent=1) + '\n')
print(len(out), 'keys')
