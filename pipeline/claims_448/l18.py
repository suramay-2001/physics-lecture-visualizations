#!/usr/bin/env python3
"""Numpy twin of Physics 448 Lecture 18 (quantum reflection and tunnelling): every claim key of app/src/content/L18.values.ts, plus the engine cases for physics/wave18.ts.

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - the step below its top and the barrier are solved as the MATCHING CONDITIONS, linear systems (np.linalg.solve: 2 x 2 for the step, 4 x 4 for the barrier, Townsend Eqs. 6.143), never the
    closed forms (r = (k - i kappa)/(k + i kappa), the cosh/sinh propagation of Appendix A); the currents are Im(conj(u) u') of each wave and each pair of waves, never v|A|^2 written down;
  - T(E) of the barrier is the 4 x 4 solve's |F|^2, the thick form and the E = V0 case are the closed forms they are, the root of T(a) = 0.68 is scipy brentq on the solve;
  - the momentum average of a packet is scipy.integrate.quad of the Gaussian momentum density times the reflection or transmission of the SOLVE, split at the threshold of the step;
  - the exact current of the free Gaussian is Im(conj(psi) dpsi/dx) of the closed-form psi built in numpy complex arithmetic with the derivative taken analytically; its total is scipy quad over
    all times, its peak a bounded scalar minimiser;
  - the packet at a step or barrier is the SAME split step as the engine (the claims must agree to 1e-12) written with np.fft, with the chances read from scipy's natural CubicSpline integral of |psi|^2;
    the independent physical check is a Crank-Nicolson march (fourth-order stencil, banded solve) on a NON-periodic grid, in the engine cases (agreement 2e-3);
  - the triangular-barrier exponent is scipy quad of sqrt(2m(V - E))/hbar, the closed form (4/3) sqrt(2m) W^{3/2}/(hbar F) is asserted equal; the minimum of T over the width is np.min on a fine grid
    refined with a bounded scalar minimiser.
The equations of the notes (18.5 matching below the step, Appendix A, Appendix B) are asserted first, so a misread formula fails here.

Usage (from the repo root): python3 pipeline/claims_448/l18.py -> app/src/physics/__fixtures__/claims-448/l18.json (every claim key) and app/src/physics/__fixtures__/wave18-cases.json (engine cases).
Run it twice: byte-identical. Checked by app/src/content/claims.test.ts (engine value per key at 1e-12) and app/src/physics/wave18.test.ts (engine cases).
"""
import json
from math import pi
from pathlib import Path

import numpy as np
from scipy.integrate import quad
from scipy.interpolate import CubicSpline
from scipy.linalg import solve_banded
from scipy.optimize import brentq, minimize_scalar

ROOT = Path(__file__).resolve().parent.parent.parent
out = {}
cases = {}


def put(k, v):
    v = float(v)
    out[k] = 0.0 if abs(v) < 1e-12 else v


# ---- SI constants (CODATA 2018, the engine's) and the electron's hbar^2/2m in eV angstrom^2 ----
h_pl = 6.62607015e-34
e_ch = 1.602176634e-19
m_e = 9.1093837015e-31
hbar_si = h_pl / (2 * pi)
HB2M = hbar_si**2 / (2 * m_e) / e_ch * 1e20  # 3.80998...


# ------------------------------------------------------------------ the step below its top: matching conditions as a 2 x 2 system (hbar = m = 1 unless hb2m is given)
def evanescent_solve(E, V0, hb2m=0.5):
    k = np.sqrt(E / hb2m + 0j)
    kap = np.sqrt((V0 - E) / hb2m + 0j)
    # A = 1: B - C = -1 and ik(1 - B) = -kappa C  ->  -ik B + kappa C = -ik
    M = np.array([[1, -1], [-1j * k, kap]], complex)
    B, C = np.linalg.solve(M, np.array([-1, -1j * k], complex))
    return k.real, kap.real, B, C


for E_, V_ in [(2.0, 4.0), (0.5, 1.0), (1.0, 3.0)]:
    k_, kap_, B_, C_ = evanescent_solve(E_, V_)
    assert abs(abs(B_) - 1) < 1e-13 and abs((1 + B_) - C_) < 1e-13  # the notes: |r| = 1 and A + B = C
    assert abs(B_ - (k_ - 1j * kap_) / (k_ + 1j * kap_)) < 1e-13  # the notes' r (checked, not used)


# ------------------------------------------------------------------ the barrier: the four matching conditions as a 4 x 4 system, A = 1; unknowns B, C, D, F
def barrier_solve(E, V0, a, hb2m=0.5):
    k = np.sqrt(E / hb2m + 0j)
    q = np.sqrt((V0 - E) / hb2m + 0j)
    M = np.array(
        [
            [1, -1, -1, 0],  # B - C - D = -1
            [-1j * k, -q, q, 0],  # -ik B - q C + q D = -ik
            [0, np.exp(q * a), np.exp(-q * a), -1],  # C e^{qa} + D e^{-qa} = F
            [0, q * np.exp(q * a), -q * np.exp(-q * a), -1j * k],  # q (C e^{qa} - D e^{-qa}) = ik F
        ],
        complex,
    )
    B, C, D, F = np.linalg.solve(M, np.array([-1, -1j * k, 0, 0], complex))
    return k.real, q.real, B, C, D, F


def barrier_T(E, V0, a, hb2m=0.5):
    return abs(barrier_solve(E, V0, a, hb2m)[5]) ** 2


def step_R(E, V0):
    """R of the step above its top (E > V0), the 2 x 2 matching system with k2 real: R = |B|^2."""
    if E <= V0:
        return 1.0
    k1, k2 = np.sqrt(2 * E), np.sqrt(2 * (E - V0))
    B, C = np.linalg.solve(np.array([[1, -1], [-1j * k1, -1j * k2]], complex), np.array([-1, -1j * k1], complex))
    return float(abs(B) ** 2)


def step_T_from_currents(E, V0):
    k1, k2 = np.sqrt(2 * E), np.sqrt(2 * (E - V0))
    B, C = np.linalg.solve(np.array([[1, -1], [-1j * k1, -1j * k2]], complex), np.array([-1, -1j * k1], complex))
    # currents Im(conj(u) u') of the single waves
    j_in = float(np.imag(np.conj(1.0) * (1j * k1) * 1.0))
    j_tr = float(np.imag(np.conj(C) * (1j * k2) * C))
    return j_tr / j_in


# equations of the notes: Appendix A (cosh/sinh propagation) against the 4 x 4 solve, and the thick form's range
for E_, V_, a_ in [(2.0, 4.0, 0.5), (1.0, 5.0, 1.3), (3.0, 4.0, 0.2)]:
    k_, q_, B_, C_, D_, F_ = barrier_solve(E_, V_, a_)
    AF = np.cosh(q_ * a_) + 0.5j * (q_ / k_ - k_ / q_) * np.sinh(q_ * a_)
    assert abs(1 / AF - F_) < 1e-13  # the notes' App. A: A/F = cosh + (i/2)(kappa/k - k/kappa) sinh
    assert abs(abs(B_) ** 2 + abs(F_) ** 2 - 1) < 1e-13  # R + T = 1


# ------------------------------------------------------------------ unit 1: the E = 4V0/3 step (p0 = 4, V0 = 6: k1 = 4, k2 = 2) and the packets
V0S, P0S, SGS, X0S, TS = 6.0, 4.0, 2.0, -8.0, 5.5
ES = P0S**2 / 2
assert abs(ES - 4 * V0S / 3) < 1e-14
k1s, k2s = np.sqrt(2 * ES), np.sqrt(2 * (ES - V0S))
Bs, Cs = np.linalg.solve(np.array([[1, -1], [-1j * k1s, -1j * k2s]], complex), np.array([-1, -1j * k1s], complex))
put('l18AmpIdentity', abs((1 + Bs) - Cs))  # A + B = C divided by A: 1 + r - tau = 0
put('l18StepRAmp43', Bs.real)
put('l18StepTau43', Cs.real)
put('l18StepR43', abs(Bs) ** 2)
put('l18StepT43', step_T_from_currents(ES, V0S))
put('l18FracIdentity', abs(Bs) ** 2 + step_T_from_currents(ES, V0S) - 1)
put('l18StepRatio43', k2s / k1s)
put('l18StepDens43', abs(Cs) ** 2)

def cur(coef, k):
    """j = Im(conj(u) u') of the single wave u = coef e^{ikx} (the modulus is constant, so x = 0)."""
    return float(np.imag(np.conj(coef) * (1j * k) * coef))


# the speed factor each share carries: R = |j_ref|/j_in = factor_R |r|^2 and T = j_tr/j_in = factor_T |tau|^2 (the speed ratios v1/v1 and v2/v1)
put('l18CurrentFactorR', abs(cur(Bs, -k1s)) / cur(1.0, k1s) / abs(Bs) ** 2)
put('l18CurrentFactorT', cur(Cs, k2s) / cur(1.0, k1s) / abs(Cs) ** 2)


# the split step, written like the engine's (the claims agree at 1e-12): V half kick, [fft, kinetic, ifft, V kick]..., last without the full kick, V half kick
NG, LBOX = 4096, 64.0
dxg = LBOX / NG
xg = -LBOX / 2 + dxg * np.arange(NG)
kg = 2 * pi * np.fft.fftfreq(NG, d=dxg)


def pk(x0, s, p0=0.0):
    return (2 * pi * s * s) ** -0.25 * np.exp(-((xg - x0) ** 2) / (4 * s * s)) * np.exp(1j * p0 * xg)


def split_step(psi, V, t, dt=0.005):
    steps = max(1, int(np.ceil(t / dt - 1e-9)))
    hh = t / steps
    kin = np.exp(-1j * kg**2 * hh / 2)
    vfull = np.exp(-1j * V * hh)
    vhalf = np.exp(-1j * V * hh / 2)
    psi = psi * vhalf
    for s in range(steps):
        psi = np.fft.ifft(np.fft.fft(psi) * kin)
        if s < steps - 1:
            psi = psi * vfull
    return psi * vhalf


def v_step(V0):
    return np.where(np.abs(xg) < 1e-9, V0 / 2, np.where(xg > 0, V0, 0.0))


def v_barrier(V0, a):
    return np.where((xg > 1e-9) & (xg < a - 1e-9), V0, np.where((np.abs(xg) < 1e-9) | (np.abs(xg - a) < 1e-9), V0 / 2, 0.0))


def spline_chances(psi, edge_lo, edge_hi):
    cs = CubicSpline(xg, np.abs(psi) ** 2, bc_type='natural')
    return float(cs.integrate(xg[0], edge_lo)), float(cs.integrate(edge_hi, xg[-1]))


DT_RUN, DT_PEN = 0.01, 0.01  # the lecture's value table runs the split step with this largest step (the stage uses 0.005; the chances agree to 3e-5 and 3e-4)
psi_s = split_step(pk(X0S, SGS, P0S), v_step(V0S), TS, DT_RUN)
refl_s, trans_s = spline_chances(psi_s, 0.0, 0.0)
put('l18StepAreaL', refl_s)
put('l18StepAreaR', trans_s)
put('l18StepNorm', np.sum(np.abs(psi_s) ** 2) * dxg)
put('l18ChR', step_R(4.5, 4.0))  # the challenge: k1 = 3 k2, so r = 1/2


def weighted(p0, sig, fun, kink=None):
    """sum |phi(p)|^2 fun(p) dp for the Gaussian packet: the momentum density N(p0, 1/(2 sigma)), p > 0, quad split at the kink."""
    sd = 1 / (2 * sig)
    dens = lambda p: np.exp(-((p - p0) ** 2) / (2 * sd * sd)) / (np.sqrt(2 * pi) * sd)
    lo, hi = max(1e-9, p0 - 14 * sd), p0 + 14 * sd
    pts = [lo] + ([kink] if kink is not None and lo < kink < hi else []) + [hi]
    return sum(quad(lambda p: dens(p) * fun(p), a, b, epsabs=1e-14, epsrel=1e-13, limit=500)[0] for a, b in zip(pts[:-1], pts[1:]))


Rp = lambda p: step_R(p * p / 2, V0S)
KINK = np.sqrt(2 * V0S)
put('l18StepWeightedR', weighted(P0S, SGS, Rp, KINK))
for sg in (3.0, 6.0, 12.0):
    put(f'l18WeightedR{sg:g}', weighted(P0S, sg, Rp, KINK))
# the packet's momentum density has unit weight, mean p0, spread 1/(2 sigma): checked with the same quad
assert abs(weighted(P0S, 2.0, lambda p: 1.0, KINK) - 1) < 1e-12
assert abs(weighted(P0S, 2.0, lambda p: p, KINK) - P0S) < 1e-12
assert abs(weighted(P0S, 2.0, lambda p: p * p, KINK) - (P0S**2 + 1 / 16)) < 1e-12

# ------------------------------------------------------------------ unit 2: the current of a moving Gaussian, detector at x_d (x0 = -6, sigma = 3, p0 = 2, x_d = 4)
X0D, SGD, P0D, XD = -6.0, 3.0, 2.0, 4.0


def psi_free(x, t, x0=X0D, s=SGD, p0=P0D):
    tau = t / (2 * s * s)
    X = x - x0 - p0 * t
    return (2 * pi * s * s) ** -0.25 / np.sqrt(1 + 1j * tau) * np.exp(-(X**2) / (4 * s * s * (1 + 1j * tau))) * np.exp(1j * (p0 * x - p0**2 * t / 2))


def j_free(x, t, x0=X0D, s=SGD, p0=P0D):
    """Im(conj(psi) dpsi/dx) with dpsi/dx = psi (-X / (2 s^2 (1 + i tau)) + i p0), differentiated analytically."""
    tau = t / (2 * s * s)
    X = x - x0 - p0 * t
    psi = psi_free(x, t, x0, s, p0)
    dpsi = psi * (-X / (2 * s * s * (1 + 1j * tau)) + 1j * p0)
    return float(np.imag(np.conj(psi) * dpsi))


# the closed-form psi against np.fft evolution of the t = 0 packet (a check of the formula, not used)
chk = np.fft.ifft(np.fft.fft(pk(X0D, SGD, P0D)) * np.exp(-1j * kg**2 * 3.0 / 2))
assert np.max(np.abs(chk - psi_free(xg, 3.0))) < 1e-6  # the periodic box wraps a tail of size 1e-8
put('l18DetPeakRigid', P0D / (np.sqrt(2 * pi) * SGD))  # v0 rho at the centre
tot = quad(lambda t: j_free(XD, t), -300, 300, epsabs=1e-14, epsrel=1e-13, limit=2000, points=list(np.arange(-250, 300, 50)))[0]
put('l18DetTotal', tot)
res = minimize_scalar(lambda t: -j_free(XD, t), bounds=(3.0, 7.0), method='bounded', options={'xatol': 1e-12})
put('l18DetPeakExact', -res.fun)
put('l18DetPeakRatio', -res.fun / (P0D / (np.sqrt(2 * pi) * SGD)))
psi_j = np.sqrt(0.2) * np.exp(2j * xg)
put('l18ChJ', float(np.imag(np.conj(psi_j[100]) * 2j * psi_j[100])))  # rho = 0.2, k = 2: j = Im(conj(psi) psi')
put('l18DeT', step_T_from_currents(8.0, 7.5))  # the challenge l18-de-T: k1 = 4, k2 = 1 (E = 8, V0 = 7.5), so tau = 8/5 and T = (1/4)(64/25)

# ------------------------------------------------------------------ unit 3: below the step, E = 2, V0 = 4 (k = kappa = 2)
k3, kap3, B3, C3 = evanescent_solve(2.0, 4.0)
put('l18K', k3)
put('l18Kappa', kap3)
put('l18AbsR', abs(B3))
put('l18RBelow', abs(B3) ** 2)
put('l18PhaseDegMag', abs(np.degrees(np.angle(B3))))
put('l18EdgeDensity', abs(C3) ** 2)  # density at the edge: |C|^2 with A = 1
put('l18DecayLenDensity', 1 / (2 * kap3))
put('l18DecayLenAmp', 1 / kap3)
put('l18X1pct', np.log(100) / (2 * kap3))
# the current of the one real exponential u = C e^{-kappa x}, at x = 0 and x = 1: Im(conj(u) u')
for xq in (0.0, 1.0):
    u = C3 * np.exp(-kap3 * xq)
    assert abs(np.imag(np.conj(u) * (-kap3 * u))) < 1e-13
put('l18EvanescentCurrent', float(np.imag(np.conj(C3) * (-kap3 * C3))))
# moved (Townsend Eqs. 6.139-6.140): E = V0/2 = 0.5 against V0 = 1
kb_, kapb_, Bb_, Cb_ = evanescent_solve(0.5, 1.0)
put('l18TStepRbelow', abs(Bb_) ** 2)
put('l18TStepTbelow', float(np.imag(np.conj(Cb_) * (-kapb_) * Cb_)) / kb_)  # T = j_tr / j_in: the real exponential carries no current


def penetration(x0, sg, p0, V0, end):
    V = v_step(V0)
    psi = pk(x0, sg, p0)
    ts, rs = [], []
    t = 0.0
    while t < end - 1e-9:
        psi = split_step(psi, V, 0.5, DT_PEN)
        t += 0.5
        ts.append(t)
        rs.append(spline_chances(psi, 0.0, 0.0)[1])
    return np.array(ts), np.array(rs)


tl, rl = penetration(-8.0, 2.0, 2.0, 4.0, 5.0)
put('l18MaxPenetration', rl.max())
put('l18PenetrationTime', tl[np.argmax(rl)])

# ------------------------------------------------------------------ unit 4: the barrier, E = 2, V0 = 4, a = 0.5 (kappa a = 1, T = 1/cosh^2 1)
V0B, P0B, SGB, X0B, AB, TB = 4.0, 2.0, 2.0, -8.0, 0.5, 9.0
Tw = lambda p: barrier_T(p * p / 2, V0B, AB)
put('l18BarrierWeightedT', weighted(P0B, SGB, Tw))
kB, qB, BB, CB, DB, FB = barrier_solve(2.0, V0B, AB)
put('l18BarrierT1', abs(FB) ** 2)
assert abs(abs(FB) ** 2 - 1 / np.cosh(1.0) ** 2) < 1e-13
AF = np.cosh(qB * AB) + 0.5j * (qB / kB - kB / qB) * np.sinh(qB * AB)
put('l18AppendixAT', 1 / abs(AF) ** 2)  # the notes' A/F route: T = |F/A|^2
for qa, key in ((0.5, 'l18BarrierT05'), (2.0, 'l18BarrierT2'), (3.0, 'l18BarrierT3')):
    put(key, barrier_T(2.0, V0B, qa / qB))
q_, k_ = qB, kB
thick = lambda a_: (4 * k_ * q_ / (k_**2 + q_**2)) ** 2 * np.exp(-2 * q_ * a_)
put('l18BarrierThick3', thick(3.0 / qB))
put('l18ThickAtZero', thick(0.0))
put('l18ChThickPct', 100 * thick(3.0 / qB))
# the current inside the barrier: j = Im(conj(u) u') of u = C e^{kx} + D e^{-kx} at several x (constant), against T times the incident current
for xq in (0.0, 0.2, AB):
    u = CB * np.exp(qB * xq) + DB * np.exp(-qB * xq)
    du = qB * (CB * np.exp(qB * xq) - DB * np.exp(-qB * xq))
    jq = float(np.imag(np.conj(u) * du))
    if xq == 0.0:
        j0 = jq
    assert abs(jq - j0) < 1e-13
put('l18BarrierInnerCurrent', j0)
put('l18BarrierOuterCurrent', abs(FB) ** 2 * float(np.imag(np.conj(1.0) * (1j * kB) * 1.0)))
# the barrier of Townsend p. 231: E = 5 eV, V0 = 10 eV, a = 0.53 angstrom (hbar^2/2m = 3.80998 eV angstrom^2)
put('l18TBookAT', barrier_T(5.0, 10.0, 0.53, HB2M))
put('l18TBookBohrT', barrier_T(5.0, 10.0, 0.529177, HB2M))
put('l18TBookQa', np.sqrt((10.0 - 5.0) / HB2M) * 0.53)
kbk, qbk = np.sqrt(5.0 / HB2M), np.sqrt(5.0 / HB2M)
put('l18TBookThick', (4 * kbk * qbk / (kbk**2 + qbk**2)) ** 2 * np.exp(-2 * qbk * 0.53))
put('l18BookWidthFor068', brentq(lambda a_: barrier_T(5.0, 10.0, a_, HB2M) - 0.68, 0.3, 1.0, xtol=1e-14))
# Ex. 6.7 by the matching conditions with a linear interior psi = C + D x (E = V0): A + B = C; ik(A - B) = D; C + D a = F e^{ika}; D = ik F e^{ika}
kk, aa = 2.0, 1.0
M = np.array(
    [[1, -1, 0, 0], [-1j * kk, 0, -1, 0], [0, 1, aa, -np.exp(1j * kk * aa)], [0, 0, 1, -1j * kk * np.exp(1j * kk * aa)]],
    complex,
)  # unknowns B, C, D, F with A = 1
Bx, Cx, Dx, Fx = np.linalg.solve(M, np.array([-1, -1j * kk, 0, 0], complex))
put('l18TEV0T', abs(Fx) ** 2)  # E = V0 = 2, a = 1 (ka = 2)
assert abs(abs(Fx) ** 2 - 1 / (1 + kk**2 * aa**2 / 4)) < 1e-13  # the book's 1/(1 + k^2 a^2/4)
# a thick 300 pm barrier: exact over thick; and one more decay length
q300 = np.sqrt(5.0 / HB2M) * 3.0
put('l18TThickRatio', barrier_T(5.0, 10.0, 3.0, HB2M) / ((4 * kbk * qbk / (kbk**2 + qbk**2)) ** 2 * np.exp(-2 * q300)))
a_q = 1 / np.sqrt(5.0 / HB2M)
thick_si = lambda a_: (4 * kbk * qbk / (kbk**2 + qbk**2)) ** 2 * np.exp(-2 * qbk * a_)
put('l18TDecayFactor', thick_si(3.0 + a_q) / thick_si(3.0))
put('l18PrTunnelPct', 100 * barrier_T(5.0, 8.0, 3.0, HB2M))
# above a barrier: E = 2 V0 (V0 = 1) over a barrier: T oscillates with the width; the smallest value over the widths and the width of the first resonance. Every T is the 4 x 4 matching solve with an
# interior wave number k' (A = 1, unknowns B, C, D, F), never the closed form 1/(1 + sin^2(k'a)/8).
k1x, k2x = np.sqrt(2 * 2.0), np.sqrt(2 * (2.0 - 1.0))


def T_above(a_):
    Mx = np.array(
        [[1, -1, -1, 0], [-1j * k1x, -1j * k2x, 1j * k2x, 0], [0, np.exp(1j * k2x * a_), np.exp(-1j * k2x * a_), -1], [0, 1j * k2x * np.exp(1j * k2x * a_), -1j * k2x * np.exp(-1j * k2x * a_), -1j * k1x]], complex
    )
    return float(abs(np.linalg.solve(Mx, np.array([-1, -1j * k1x, 0, 0], complex))[3]) ** 2)


grid_a = np.linspace(0, np.pi / k2x, 4001)
amin = grid_a[np.argmin([T_above(a_) for a_ in grid_a])]
rmin = minimize_scalar(T_above, bounds=(amin - 1e-3, amin + 1e-3), method='bounded', options={'xatol': 1e-13})
put('l18PrAboveTmin', rmin.fun)
put('l18PrAboveResWidth', np.pi / k2x)
assert abs(T_above(np.pi / k2x) - 1) < 1e-13  # T = 1 at k'a = pi
assert abs(rmin.fun - 1 / (1 + 1 / 8)) < 1e-9  # the book's form, checked not used
assert abs(rmin.x - np.pi / (2 * k2x)) < 1e-6
# field emission (Townsend Problem 6.25): W = 4.5 eV, field 5 V/nm = 0.5 eV/angstrom, exponent 2 int sqrt((W - F x)/hb2m) dx over 0 < x < W/F
Wf, Ff = 4.5, 0.5
expo = 2 * quad(lambda z: np.sqrt((Wf - Ff * z) / HB2M), 0, Wf / Ff, epsabs=1e-13, epsrel=1e-13, limit=200)[0]
assert abs(expo - 4 / 3 * np.sqrt(1 / HB2M) * Wf**1.5 / Ff) < 1e-9
put('l18PrFieldExponent', expo)
put('l18PrFieldTMant', np.exp(-expo) / 1e-6)
# an HW7-type question: sigma = 3 and p0 = 4, the energy spread E'(p0) dp = p0 dp from the grid's momentum moments
psi_e = pk(0.0, 3.0, 4.0)
w_e = np.abs(np.fft.fft(psi_e)) ** 2
w_e = w_e / w_e.sum()
mp = float(np.sum(w_e * kg))
dp_e = float(np.sqrt(np.sum(w_e * (kg - mp) ** 2)))
put('l18PrEnergySpread', 4.0 * dp_e)

# ------------------------------------------------------------------ engine cases (the independent physical checks)
cases['evan'] = []
for E_, V_ in [(2.0, 4.0), (0.5, 1.0), (1.0, 3.0), (3.0, 3.5)]:
    k_, kap_, B_, C_ = evanescent_solve(E_, V_)
    cases['evan'].append({'E': E_, 'V0': V_, 'k': k_, 'kappa': kap_, 'r': [B_.real, B_.imag], 'edge': float(abs(C_) ** 2)})
cases['barrier'] = []
for E_, V_, a_, hb in [(2.0, 4.0, 0.5, 0.5), (1.0, 5.0, 1.3, 0.5), (3.0, 4.0, 0.2, 0.5), (5.0, 10.0, 0.53, HB2M), (5.0, 8.0, 3.0, HB2M)]:
    k_, q_, B_, C_, D_, F_ = barrier_solve(E_, V_, a_, hb)
    j_in = k_  # Im(conj(1) * ik * 1)
    inner = float(2 * q_ * np.imag(np.conj(D_) * C_))
    cases['barrier'].append(
        {'E': E_, 'V0': V_, 'a': a_, 'hb2m': hb, 'k': k_, 'q': q_, 'B': [B_.real, B_.imag], 'C': [C_.real, C_.imag], 'D': [D_.real, D_.imag], 'F': [F_.real, F_.imag], 'T': float(abs(F_) ** 2), 'inner': inner, 'jin': j_in}
    )
cases['average'] = []
for p0_, sg_, kind in [(4.0, 2.0, 'stepR'), (4.0, 12.0, 'stepR'), (2.0, 3.0, 'barrierT'), (4.0, 2.0, 'one'), (4.0, 2.0, 'p'), (4.0, 2.0, 'p2')]:
    fun = {'stepR': Rp, 'barrierT': Tw, 'one': lambda p: 1.0, 'p': lambda p: p, 'p2': lambda p: p * p}[kind]
    cases['average'].append({'p0': p0_, 'sigma': sg_, 'kind': kind, 'value': weighted(p0_, sg_, fun, KINK if kind == 'stepR' else None)})
cases['current'] = []
for sg_, p0_, x0_, x_, t_ in [(3.0, 2.0, -6.0, 4.0, 5.0), (3.0, 2.0, -6.0, 4.0, 0.0), (3.0, 2.0, -6.0, 9.0, 7.0), (2.0, 3.0, 0.0, -1.0, 4.0), (4.0, 1.5, -2.0, 6.0, 20.0)]:
    cases['current'].append({'sigma': sg_, 'p0': p0_, 'x0': x0_, 'x': x_, 't': t_, 'j': j_free(x_, t_, x0_, sg_, p0_), 'rho': float(abs(psi_free(x_, t_, x0_, sg_, p0_)) ** 2)})
cases['detector'] = {'sigma': SGD, 'p0': P0D, 'x0': X0D, 'xd': XD, 'total': out['l18DetTotal'], 'peak': out['l18DetPeakExact'], 'peakTime': float(res.x)}
cases['wkb'] = {'W': Wf, 'F': Ff, 'hb2m': HB2M, 'exponent': expo}
cases['minAbove'] = {'E': 2.0, 'V0': 1.0, 'a': float(rmin.x), 'T': float(rmin.fun), 'res': float(np.pi / k2x)}
cases['widthFor068'] = {'E': 5.0, 'V0': 10.0, 'hb2m': HB2M, 'T': 0.68, 'a': out['l18BookWidthFor068']}


# Crank-Nicolson march on a non-periodic grid (fourth-order stencil), the engine's physical check
def cn_run(Vfun, x0, sig, p0, t_end, dt=0.002, xlo=-80.0, xhi=80.0, dx=1 / 64, snaps=()):
    n = int(round((xhi - xlo) / dx)) - 1
    x = xlo + dx * (np.arange(n) + 1)
    Vx = Vfun(x)
    psi = (2 * pi * sig**2) ** -0.25 * np.exp(-((x - x0) ** 2) / (4 * sig**2)) * np.exp(1j * p0 * x)
    d0 = 30.0 / (24 * dx**2) + Vx
    o1 = -16.0 / (24 * dx**2)
    o2 = 1.0 / (24 * dx**2)
    steps = int(np.ceil(t_end / dt - 1e-9))
    dt = t_end / steps
    a = 1j * dt / 2
    ab = np.zeros((5, n), complex)
    ab[0, 2:] = a * o2
    ab[1, 1:] = a * o1
    ab[2, :] = 1 + a * d0
    ab[3, :-1] = a * o1
    ab[4, :-2] = a * o2
    marks = {int(round(s / dt)): s for s in snaps}
    got = {}
    for i in range(1, steps + 1):
        rhs = (1 - a * d0) * psi
        rhs[1:] -= a * o1 * psi[:-1]
        rhs[:-1] -= a * o1 * psi[1:]
        rhs[2:] -= a * o2 * psi[:-2]
        rhs[:-2] -= a * o2 * psi[2:]
        psi = solve_banded((2, 2), ab, rhs)
        if i in marks:
            got[marks[i]] = psi.copy()
    return x, psi, dx, got


sv = lambda V0: (lambda x: np.where(np.abs(x) < 1e-9, V0 / 2, np.where(x > 0, V0, 0.0)))
bv = lambda V0, a: (lambda x: np.where((x > 1e-9) & (x < a - 1e-9), V0, np.where((np.abs(x) < 1e-9) | (np.abs(x - a) < 1e-9), V0 / 2, 0.0)))


def above(x, psi, dx, edge):
    """The area right of an edge that sits on a grid node: the trapezoid rule (the node counts half)."""
    r = np.abs(psi) ** 2
    return float(r[x > edge + 1e-9].sum() * dx + r[np.abs(x - edge) < 1e-9].sum() * dx / 2)


def below(x, psi, dx, edge):
    r = np.abs(psi) ** 2
    return float(r[x < edge - 1e-9].sum() * dx + r[np.abs(x - edge) < 1e-9].sum() * dx / 2)


x_, p_, dx_, _ = cn_run(sv(V0S), X0S, SGS, P0S, TS)
cases['stepRun'] = {'x0': X0S, 'sigma': SGS, 'p0': P0S, 'V0': V0S, 't': TS, 'right': above(x_, p_, dx_, 0.0), 'left': below(x_, p_, dx_, 0.0)}
x_, p_, dx_, _ = cn_run(sv(V0S), X0S, SGS, P0S, 12.0)
cases['stepLate'] = {'t': 12.0, 'right': above(x_, p_, dx_, 0.0), 'left': below(x_, p_, dx_, 0.0), 'weighted': out['l18StepWeightedR']}
x_, p_, dx_, snaps = cn_run(sv(4.0), -8.0, 2.0, 2.0, 9.0, snaps=tuple(np.arange(0.5, 9.01, 0.5)))
cases['lowRun'] = {'x0': -8.0, 'sigma': 2.0, 'p0': 2.0, 'V0': 4.0, 'times': [float(t) for t in sorted(snaps)], 'right': [above(x_, snaps[t], dx_, 0.0) for t in sorted(snaps)]}
x_, p_, dx_, _ = cn_run(bv(V0B, AB), X0B, SGB, P0B, TB)
cases['barrierRun'] = {'x0': X0B, 'sigma': SGB, 'p0': P0B, 'V0': V0B, 'a': AB, 't': TB, 'beyond': above(x_, p_, dx_, AB), 'left': below(x_, p_, dx_, 0.0)}

(ROOT / 'app/src/physics/__fixtures__/claims-448').mkdir(parents=True, exist_ok=True)
with open(ROOT / 'app/src/physics/__fixtures__/claims-448/l18.json', 'w') as f:
    json.dump({'about': 'Physics 448 Lecture 18: numpy twins of every L18.values.ts key (pipeline/claims_448/l18.py)', 'values': {k: out[k] for k in sorted(out)}}, f, indent=1, sort_keys=True)
    f.write('\n')
with open(ROOT / 'app/src/physics/__fixtures__/wave18-cases.json', 'w') as f:
    json.dump({'about': 'Physics 448 Lecture 18 engine cases (pipeline/claims_448/l18.py)', 'cases': cases}, f, indent=1, sort_keys=True)
    f.write('\n')
print(len(out), 'keys')
