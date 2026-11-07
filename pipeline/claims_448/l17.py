#!/usr/bin/env python3
"""Numpy twin of Physics 448 Lecture 17 (classical mean motion and quantum reflection): every claim key of app/src/content/L17.values.ts, plus the engine cases
for the new functions (scatter.ts stepAmplitudes / stepFringe / planeCurrent / forceMean / continuityResidual with a potential; wave.ts evolveV and the potential samplers).

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - the step is solved as the MATCHING CONDITIONS, a 2 x 2 complex linear system (np.linalg.solve), never the closed form r = (k1 - k2)/(k1 + k2); the currents are
    Im(conj(part) * part') of each wave, never v|A|^2 written down; the fringe extremes and spacing are the roots of d|psi|^2/dx (scipy brentq, xtol 1e-15);
  - mean motion is the matrix exponential of the moment equations (scipy expm): a constant force acts on (<x>, <p>, 1), the oscillator on (<x>, <p>) and on the
    centred second moments (<x^2>, <xp + px>/2, <p^2>); the free width is measured on a split-FFT evolution (np.fft);
  - mean forces are trapezoid integrals of the analytic densities on their own fine grids; the ramped block's <T> is a forward-difference sum on a grid whose
    nodes hold the kinks (exact for piecewise-linear functions);
  - the continuity residual is the same identity with np.fft; the potential evolution (cases only) is a Crank-Nicolson march on a NON-periodic grid with a banded solve.
The five equations of the notes (Section 17.3 matching, 17.5 current, 17.6 fractions) are asserted first, so a misread formula fails here.

Usage (from the repo root): python3 pipeline/claims_448/l17.py -> app/src/physics/__fixtures__/claims-448/l17.json (every claim key) and
app/src/physics/__fixtures__/scatter-l17.json (engine cases). Run it twice: byte-identical. Checked by app/src/content/claims.test.ts (engine value per key at 1e-12)
and app/src/physics/scatterL17.test.ts (engine cases).
"""
import json
from pathlib import Path

import numpy as np
from scipy.linalg import expm, solve_banded
from scipy.optimize import brentq

ROOT = Path(__file__).resolve().parent.parent.parent
out = {}
cases = {}


def put(k, v):
    v = float(v)
    out[k] = 0.0 if abs(v) < 1e-12 else v


# ------------------------------------------------------------------ the step, by the matching conditions (hbar = m = 1)
def step_solve(E, V0):
    """Unknowns B, C for A = 1: A + B = C and ik1(A - B) = ik2 C, as a linear system."""
    k1 = np.sqrt(2 * E + 0j)
    k2 = np.sqrt(2 * (E - V0) + 0j)
    M = np.array([[1, -1], [-1j * k1, -1j * k2]], complex)  # B - C = -A ; -ik1 B - ik2 C = -ik1 A
    rhs = np.array([-1, -1j * k1], complex)
    B, C = np.linalg.solve(M, rhs)
    return k1.real, k2.real, B, C


def current(coef, k):
    """j = Im(conj(psi) psi') of the single wave coef * e^{ikx} (any x: the modulus is constant)."""
    psi = coef * np.exp(1j * k * 0.3)
    dpsi = 1j * k * psi
    return float(np.imag(np.conj(psi) * dpsi))


def step_currents(E, V0):
    k1, k2, B, C = step_solve(E, V0)
    j_in = current(1.0, k1)
    j_ref = current(B, -k1)
    j_tr = current(C, k2)
    return k1, k2, B, C, j_in, j_ref, j_tr


# the equations of the notes, asserted: 1 + r = tau, R + T = 1, constant current
for E_, V_ in [(1.2, 1.0), (2.0, 1.5), (3.0, 1.0), (8.0, 1.0), (1.0001, 1.0)]:
    k1, k2, B, C, ji, jr, jt = step_currents(E_, V_)
    assert abs((1 + B) - C) < 1e-13
    assert abs(ji + jr - jt) < 1e-13
    assert abs(abs(jr) / ji + jt / ji - 1) < 1e-13
    assert abs(abs(B) ** 2 - ((k1 - k2) / (k1 + k2)) ** 2) < 1e-13  # the notes' r (checked, not used)

# ------------------------------------------------------------------ the E = 4V0/3 step: E = 2, V0 = 1.5 (k1 = 2, k2 = 1); the same ratio as E = 4, V0 = 3
k1, k2, B, C, ji, jr, jt = step_currents(2.0, 1.5)
put('l17K1', k1)
put('l17K2', k2)
k1b, k2b, *_ = step_currents(4.0, 3.0)
put('l17StepRatio43', k2b / k1b)
put('l17StepRAmp43', B.real)
put('l17StepTau43', C.real)
put('l17StepDens43', abs(C) ** 2)
put('l17Jin', ji)
put('l17JrefMag', abs(jr))
put('l17Jtr', jt)
put('l17JBalance', ji + jr - jt)
put('l17StepR43', abs(jr) / ji)
put('l17StepT43', jt / ji)
tot = []
for E_ in [1.2, 1.5, 2.0, 3.0, 6.0]:  # R + T at five energies; the claim is the value at 4V0/3 and the check below covers the others
    _, _, _, _, a, b, c_ = step_currents(E_, 1.0)
    tot.append(abs(b) / a + c_ / a)
assert max(abs(np.array(tot) - 1)) < 1e-13
put('l17RplusT', abs(jr) / ji + jt / ji)
k1, k2, B, C, ji, jr, jt = step_currents(1.0001, 1.0)
put('l17StepTau1p0001', C.real)
put('l17StepR1p0001', abs(jr) / ji)
# the fringes on the incident side: |e^{ik1 x} + B e^{-ik1 x}|^2, extremes and spacing from the roots of the derivative
k1, k2, B, C = step_solve(2.0, 1.5)
rho = lambda x: abs(np.exp(1j * k1 * x) + B * np.exp(-1j * k1 * x)) ** 2
drho = lambda x: float(2 * np.real(np.conj(np.exp(1j * k1 * x) + B * np.exp(-1j * k1 * x)) * (1j * k1) * (np.exp(1j * k1 * x) - B * np.exp(-1j * k1 * x))))
xs = np.linspace(-6, 0, 24001)
d = np.array([drho(x) for x in xs])
roots = [brentq(drho, xs[i], xs[i + 1], xtol=1e-15, rtol=1e-15) for i in range(len(xs) - 1) if d[i] * d[i + 1] < 0]
vals = np.array([rho(x) for x in roots])
mx = vals[vals > vals.mean()]
mn = vals[vals < vals.mean()]
xmax = [x for x, v in zip(roots, vals) if v > vals.mean()]
put('l17FringeMax', mx.mean())
put('l17FringeMin', mn.mean())
put('l17FringeSpacing', np.mean(np.diff(xmax)))
assert mx.max() - mx.min() < 1e-13 and mn.max() - mn.min() < 1e-13
# the constant current across the step: j(x) = Im(conj(psi) psi') on both sides, many points
for x in [-3.7, -1.2, -0.01, 0.01, 1.9]:
    if x < 0:
        psi = np.exp(1j * k1 * x) + B * np.exp(-1j * k1 * x)
        dpsi = 1j * k1 * (np.exp(1j * k1 * x) - B * np.exp(-1j * k1 * x))
    else:
        psi = C * np.exp(1j * k2 * x)
        dpsi = 1j * k2 * psi
    assert abs(np.imag(np.conj(psi) * dpsi) - 2 * 1.0 * (1 - abs(B) ** 2)) < 1e-13  # = k1 (|A|^2 - |B|^2)

# ------------------------------------------------------------------ mean motion by the matrix exponential of the moment equations
# a constant force F0: d<x>/dt = <p>, d<p>/dt = F0 (affine, so the state is (<x>, <p>, 1))
G = np.array([[0, 1, 0], [0, 0, 1.0], [0, 0, 0]])  # F0 = 1 in the third column
x_t = expm(G * 2.0) @ np.array([0, 3, 1.0])
put('l17ConstMean2', x_t[0])
# the free width of a Gaussian (sigma = 1) at t = 2: split-step FFT of the packet on a periodic box (numpy), spread measured on the grid
N, Lbox = 4096, 64.0
xg = -Lbox / 2 + (Lbox / N) * np.arange(N)
kg = 2 * np.pi * np.fft.fftfreq(N, d=Lbox / N)
sg = 1.0
psi0 = (2 * np.pi * sg**2) ** -0.25 * np.exp(-xg**2 / (4 * sg**2))
psi_t = np.fft.ifft(np.exp(-1j * kg**2 * 2.0 / 2) * np.fft.fft(psi0))
rho_t = np.abs(psi_t) ** 2
dx_g = Lbox / N
mean_t = (xg * rho_t).sum() * dx_g
put('l17ConstDx2', np.sqrt((xg**2 * rho_t).sum() * dx_g - mean_t**2))
# the oscillator Omega = 1: means from (x, p), centred moments (<x^2>, <xp + px>/2, <p^2>) from sigma^2, 0, 1/(4 sigma^2)
Om = 1.0
A2 = np.array([[0, 1.0], [-Om**2, 0]])
A3 = np.array([[0, 2, 0], [-Om**2, 0, 1], [0, -2 * Om**2, 0]])
for nm, t in [('HalfPi', np.pi / 2), ('Pi', np.pi)]:
    xm = expm(A2 * t) @ np.array([2.0, 0.0])
    sec = expm(A3 * t) @ np.array([1.0, 0.0, 0.25])
    put(f'l17HarmMean{nm}', xm[0])
    put(f'l17HarmDx{nm}', np.sqrt(sec[0]))

# ------------------------------------------------------------------ mean forces: trapezoid integrals of analytic densities
def trap(f, a, b, n=400001):
    x = np.linspace(a, b, n)
    return np.trapezoid(f(x), x)


def gauss(x, mu, s):
    return np.exp(-((x - mu) ** 2) / (2 * s * s)) / (s * np.sqrt(2 * np.pi))


mix = lambda x, cs, s: sum(gauss(x, c_, s) for c_ in cs) / len(cs)
s_pk = 0.1
put('l17TwoPeakMeanX', trap(lambda x: x * mix(x, [-2.0, 2.0], s_pk), -9, 9))
put('l17TwoPeakMeanF', trap(lambda x: x**2 * mix(x, [-2.0, 2.0], s_pk), -9, 9))
put('l17GaussMeanF', trap(lambda x: x**2 * gauss(x, 2.0, 1.0), -14, 18))
put('l17GaussForceAtMean', trap(lambda x: x * gauss(x, 2.0, 1.0), -14, 18) ** 2)
put('l17VarCorrection', trap(lambda x: (x - 2.0) ** 2 * gauss(x, 2.0, 1.0), -14, 18))  # F''/2 x var / gamma = (1/2)(2)(sigma^2)
# the restoring force F = -x|x|: two narrow peaks at 0 and 2; the mean force over the force at the mean (-1)
rho_r = lambda x: mix(x, [0.0, 2.0], s_pk)
mean_x = trap(lambda x: x * rho_r(x), -9, 11)
mean_F = trap(lambda x: -x * np.abs(x) * rho_r(x), -9, 11)
put('l17RestoringRatio', mean_F / (-mean_x * abs(mean_x)))
# F = -sin x on a Gaussian at pi/2: the exact mean force and the Taylor value F + F'' sigma^2/2 (magnitudes)
for nm, sg_ in [('A', 0.5), ('B', 1.0)]:
    mu = np.pi / 2
    exact = trap(lambda x: np.sin(x) * gauss(x, mu, sg_), mu - 14 * sg_, mu + 14 * sg_)
    assert abs(exact - np.exp(-(sg_**2) / 2)) < 1e-12
    put(f'l17SineExact{nm}', np.exp(-(sg_**2) / 2))
    put(f'l17SineTaylor{nm}', 1 - sg_**2 / 2)
# challenge and practice answers
put('l17ChTwoPeaks', trap(lambda x: x**2 * mix(x, [-3.0, 3.0], 0.05), -9, 9))
put('l17ChVar', trap(lambda x: x**2 * gauss(x, 3.0, 0.5), -9, 15))
put('l17PrMeanFactor', trap(lambda x: x**2 * gauss(x, 2.0, 0.5), -9, 13) / 4.0)  # practice: mu = 2, sigma = 1/2
# k1 = 3 k2: E = k1^2/2 = 4.5, E - V0 = k2^2/2 = 0.5 -> V0 = 4
_, _, Bq, Cq = step_solve(4.5, 4.0)
put('l17ChR', Bq.real)
put('l17ChTau', Cq.real)
# |B| = |A|/2: the net current as a share of the incident one, 1 - |B|^2/|A|^2
put('l17ChNet', 1 - abs(0.5) ** 2)

# ------------------------------------------------------------------ the block with linear ramps: <T> = (1/2) int psi'^2 / int psi^2, forward differences on nodes that hold the kinks
def ramp_block(L, eps, dx=1 / 64):
    n = int(round((L + 2 * eps) / dx))
    x = np.arange(n + 1) * dx
    psi = np.clip(np.minimum(x / eps, (L + 2 * eps - x) / eps), 0, 1)
    dpsi = np.diff(psi) / dx
    num = 0.5 * (dpsi**2).sum() * dx
    den = ((psi[:-1] ** 2 + psi[:-1] * psi[1:] + psi[1:] ** 2) / 3).sum() * dx  # exact integral of the square of a linear piece
    return num / den


put('l17TrapT1', ramp_block(10.0, 1.0))
put('l17TrapT05', ramp_block(10.0, 0.5))
put('l17TrapRatio', ramp_block(10.0, 0.5) / ramp_block(10.0, 1.0))
put('l17PrEdgeRatio', ramp_block(8.0, 1.0) / ramp_block(8.0, 2.0))  # practice: plateau 8, ramps 2 then 1

# ------------------------------------------------------------------ the continuity residual with a potential (np.fft): a packet across a smooth step
pk = (2 * np.pi * 1.5**2) ** -0.25 * np.exp(-((xg + 6.0) ** 2) / (4 * 1.5**2)) * np.exp(1j * 3.0 * xg)
Vs = 3.375 * (1 + np.tanh(xg / 0.5)) / 2
h = np.fft.ifft((kg**2 / 2) * np.fft.fft(pk)) + Vs * pk
dpsi_dt = -1j * h
rho_t_ = 2 * np.real(np.conj(pk) * dpsi_dt)
jj = np.imag(np.conj(pk) * np.fft.ifft(1j * kg * np.fft.fft(pk)))
dj = np.real(np.fft.ifft(1j * kg * np.fft.fft(jj)))
resid = np.abs(rho_t_ + dj).max()
put('l17ContResidualStep', resid)
cases['continuity'] = {'residual': float(resid)}

# ------------------------------------------------------------------ the potential evolution: Crank-Nicolson on a non-periodic grid (cases only; tolerance 2e-3)
def cn_run(Vfun, x0, sig, p0, t_end, dt=0.002, xlo=-40.0, xhi=40.0, dx=1 / 64):
    n = int(round((xhi - xlo) / dx)) - 1
    x = xlo + dx * (np.arange(n) + 1)
    Vx = Vfun(x)
    psi = (2 * np.pi * sig**2) ** -0.25 * np.exp(-((x - x0) ** 2) / (4 * sig**2)) * np.exp(1j * p0 * x)
    # H = -(1/2) d2/dx2 + V with the FOURTH-order stencil (-psi_{j+2} + 16 psi_{j+1} - 30 psi_j + 16 psi_{j-1} - psi_{j-2})/(12 dx^2), psi = 0 outside the box
    d0 = 30.0 / (24 * dx**2) + Vx
    o1 = -16.0 / (24 * dx**2)
    o2 = 1.0 / (24 * dx**2)
    steps = int(np.ceil(t_end / dt - 1e-9))
    dt = t_end / steps  # land exactly on t_end
    a = 1j * dt / 2
    ab = np.zeros((5, n), complex)  # banded (2, 2) layout of (I + a H)
    ab[0, 2:] = a * o2
    ab[1, 1:] = a * o1
    ab[2, :] = 1 + a * d0
    ab[3, :-1] = a * o1
    ab[4, :-2] = a * o2
    for _ in range(steps):
        rhs = (1 - a * d0) * psi
        rhs[1:] -= a * o1 * psi[:-1]
        rhs[:-1] -= a * o1 * psi[1:]
        rhs[2:] -= a * o2 * psi[:-2]
        rhs[:-2] -= a * o2 * psi[2:]
        psi = solve_banded((2, 2), ab, rhs)
    return x, psi, dx


def stats(x, psi, dx):
    rho_ = np.abs(psi) ** 2
    m = (x * rho_).sum() * dx
    return {
        'norm': float(rho_.sum() * dx),
        'mean': float(m),
        'spread': float(np.sqrt(((x - m) ** 2 * rho_).sum() * dx)),
        'below0': float(rho_[x < 0].sum() * dx),
        'above0': float(rho_[x > 0].sum() * dx),
    }


def step_v(V0):
    return lambda x: np.where(np.abs(x) < 1e-9, V0 / 2, np.where(x > 0, V0, 0.0))


def barrier_v(V0, a):
    return lambda x: np.where((x > 1e-9) & (x < a - 1e-9), V0, np.where((np.abs(x) < 1e-9) | (np.abs(x - a) < 1e-9), V0 / 2, 0.0))


def probes(x, psi, pts):
    return [float(abs(psi[int(np.argmin(np.abs(x - p)))]) ** 2) for p in pts]


PT = [-12.0, -9.0, -6.0, -3.0, -1.0, 1.0, 3.0, 5.0, 7.0]
x_, ps_, dx_ = cn_run(step_v(3.375), -8.0, 1.5, 3.0, 6.0)
cases['step'] = {'x0': -8.0, 'sigma': 1.5, 'p0': 3.0, 'V0': 3.375, 't': 6.0, **stats(x_, ps_, dx_), 'probes': PT, 'density': probes(x_, ps_, PT)}
x_, ps_, dx_ = cn_run(step_v(3.375), -14.0, 3.0, 3.0, 8.0)
cases['stepWide'] = {'x0': -14.0, 'sigma': 3.0, 'p0': 3.0, 'V0': 3.375, 't': 8.0, **stats(x_, ps_, dx_)}
x_, ps_, dx_ = cn_run(barrier_v(3.0, 1.0), -8.0, 1.5, 2.0, 8.0)
cases['barrier'] = {'x0': -8.0, 'sigma': 1.5, 'p0': 2.0, 'V0': 3.0, 'a': 1.0, 't': 8.0, **stats(x_, ps_, dx_), 'above1': float((np.abs(ps_[x_ > 1.0]) ** 2).sum() * dx_)}
x_, ps_, dx_ = cn_run(lambda x: 0.5 * x**2, 2.0, 1.0, 0.0, np.pi / 2)
cases['harmonic'] = {'x0': 2.0, 'sigma': 1.0, 'p0': 0.0, 'omega': 1.0, 't': float(np.pi / 2), **stats(x_, ps_, dx_)}
x_, ps_, dx_ = cn_run(lambda x: 0.5 * x**2, 2.0, 1.0, 0.0, np.pi)
cases['harmonicPi'] = {'x0': 2.0, 'sigma': 1.0, 'p0': 0.0, 'omega': 1.0, 't': float(np.pi), **stats(x_, ps_, dx_)}
x_, ps_, dx_ = cn_run(lambda x: -1.0 * x, 0.0, 1.0, 3.0, 2.0)
cases['force'] = {'x0': 0.0, 'sigma': 1.0, 'p0': 3.0, 'F': 1.0, 't': 2.0, **stats(x_, ps_, dx_)}

# step cases of the closed forms, for the engine's stepAmplitudes (matching conditions solved here)
cases['stepAmps'] = []
for E_, V_ in [(2.0, 1.5), (1.2, 1.0), (3.0, 1.0), (1.0001, 1.0), (8.0, 1.0)]:
    k1, k2, B, C, ji, jr, jt = step_currents(E_, V_)
    cases['stepAmps'].append({'E': E_, 'V0': V_, 'k1': k1, 'k2': k2, 'r': [B.real, B.imag], 'tau': [C.real, C.imag], 'R': abs(jr) / ji, 'T': jt / ji})
# below the step (E < V0): k2 = i kappa, the matching conditions with an imaginary wave number
for E_, V_ in [(0.5, 1.0), (1.0, 3.0)]:
    k1 = np.sqrt(2 * E_)
    kap = np.sqrt(2 * (V_ - E_))
    M = np.array([[1, -1], [-1j * k1, kap]], complex)  # ik1(A - B) = (i k2) C = -kappa C
    rhs = np.array([-1, -1j * k1], complex)
    B, C = np.linalg.solve(M, rhs)
    cases['stepAmps'].append({'E': E_, 'V0': V_, 'k1': float(k1), 'k2': float(kap), 'r': [B.real, B.imag], 'tau': [C.real, C.imag], 'R': float(abs(B) ** 2), 'T': 0.0})

(ROOT / 'app/src/physics/__fixtures__/claims-448').mkdir(parents=True, exist_ok=True)
with open(ROOT / 'app/src/physics/__fixtures__/claims-448/l17.json', 'w') as f:
    json.dump({'about': 'Physics 448 Lecture 17: numpy twins of every L17.values.ts key (pipeline/claims_448/l17.py)', 'values': {k: out[k] for k in sorted(out)}}, f, indent=1, sort_keys=True)
    f.write('\n')
with open(ROOT / 'app/src/physics/__fixtures__/scatter-l17.json', 'w') as f:
    json.dump({'about': 'Physics 448 Lecture 17 engine cases (pipeline/claims_448/l17.py)', 'cases': cases}, f, indent=1, sort_keys=True)
    f.write('\n')
print(len(out), 'keys')
