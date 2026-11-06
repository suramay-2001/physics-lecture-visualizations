#!/usr/bin/env python3
"""Numpy twin of Physics 448 Lecture 15 (free particles, wavepackets, group velocity and dispersion): every `l15...` claim key, plus the engine cases for physics/wave15.ts.

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - a velocity of a packet is the displacement of its centre of |psi|^2 after a free evolution by np.fft (phase e^{-ik^2 t/2m}), divided by the time, never p/m;
  - a component's phase is the angle of scipy.linalg.expm(-i diag(p^2/2) t) applied to a unit vector, not the closed form;
  - a crest and a fringe are tracked with scipy brentq on the analytic derivative of Re psi (crest) or of |psi|^2 (fringe), to 1e-15;
  - widths and momentum spreads are moments on the FFT grid (np.fft bins), the width scale 2 m sigma^2 is checked against a tracked 2^(1/2) growth, the spreading-time identity is a ratio of SI numbers;
  - the two-wave envelope speed is the speed of a tracked fringe of (e^{ip1x} + e^{ip2x})/sqrt2, not (omega2 - omega1)/(k2 - k1); the carrier speed is the tracked crest of Re psi / its envelope factor;
  - SI numbers use the CODATA 2018 values written out below (the engine's constants), never scipy.constants (a newer edition would differ at the tenth digit).

Usage (from the repo root): python3 pipeline/claims_448/l15.py -> app/src/physics/__fixtures__/claims-448/l15.json and app/src/physics/__fixtures__/wave15-cases.json
(run it twice: byte-identical). Checked by app/src/content/claims.test.ts (engine value per key at 1e-12) and app/src/physics/wave15.test.ts (engine cases).
"""
import json
from math import pi, sqrt
from pathlib import Path

import numpy as np
from scipy.linalg import expm
from scipy.optimize import brentq

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

# ---- SI constants (CODATA 2018, the engine's) ----
H = 6.62607015e-34
HBAR = H / (2 * pi)
ME = 9.1093837015e-31


def pk(x0, s, p0=0.0):
    return (2 * pi * s * s) ** -0.25 * np.exp(-((x - x0) ** 2) / (4 * s * s)) * np.exp(1j * p0 * x)


def evolve(psi, t, m=1.0):
    return np.fft.ifft(np.fft.fft(psi) * np.exp(-1j * k**2 * t / (2 * m)))


def mean_x(psi):
    return np.sum(x * np.abs(psi) ** 2) * dx


def sd_x(psi):
    w = np.abs(psi) ** 2 * dx
    return sqrt(np.sum(x**2 * w) - np.sum(x * w) ** 2)


def pmom(psi):
    c = np.fft.fft(psi)
    w = np.abs(c) ** 2 / np.sum(np.abs(c) ** 2)
    mean = np.sum(k * w)
    return mean, sqrt(np.sum(k**2 * w) - mean**2), 0.5 * np.sum(k**2 * w)


def omega(q, m=1.0):
    return q * q / (2 * m)


def fringe(p1, p2, lo, hi, t):
    """The brightest fringe of psi = (e^{i th1} + e^{i th2})/sqrt2, th = p x - p^2 t/2: a zero of d|psi|^2/dx = 2 Re(conj(psi) psi')."""

    def f(xx):
        th = lambda p: p * xx - p * p * t / 2  # noqa: E731
        psi = (np.exp(1j * th(p1)) + np.exp(1j * th(p2))) / sqrt(2)
        dpsi = (1j * p1 * np.exp(1j * th(p1)) + 1j * p2 * np.exp(1j * th(p2))) / sqrt(2)
        return float(2 * np.real(np.conj(psi) * dpsi))

    return brentq(f, lo, hi, xtol=1e-15, rtol=1e-15)


def crest(p, m, t, lo, hi):
    """The crest of Re e^{i(px - p^2 t/2m)} in [lo, hi]: the zero of d(Re psi)/dx = -p sin(px - E t)."""
    E = p * p / (2 * m)
    return brentq(lambda xx: -p * np.sin(p * xx - E * t), lo, hi, xtol=1e-15, rtol=1e-15)


def phase_deg(p, t):
    """The angle, in degrees, of the component p after t: expm(-i diag(p^2/2) t) applied to the unit vector (1, 1)."""
    U = expm(-1j * np.diag([p * p / 2, 0.0]) * t)
    return float(np.degrees(np.angle((U @ np.array([1.0, 1.0]))[0])))


# ---- l15-puzzle ----
q3 = pk(0, 1, 3)
put('l15ClassicalV', (mean_x(evolve(q3, 2.0)) - mean_x(q3)) / 2.0)
put('l15FreeMean2', mean_x(evolve(q3, 2.0)))
q45 = pk(0, 1, 4.5)
put('l15PzSpeed', (mean_x(evolve(q45, 2.0, 1.5)) - mean_x(q45)) / 2.0)

# ---- l15-free-eigenstate ----
put('l15PlaneP15', 1.5)
put('l15E15', 1.5**2 / 2)
put('l15PlanePeriod', 2 * pi / (1.5**2 / 2))
put('l15CrestSpeed15', (crest(1.5, 1.0, 1.0, -0.9, 0.9) - crest(1.5, 1.0, 0.0, -0.9, 0.9)) / 1.0)
xs = np.linspace(-4, 4, 2001)
put('l15FlatDensity', np.ptp(np.abs(np.exp(1j * (1.5 * xs - 1.125 * 0.7))) ** 2))
put('l15SameEnergyCount', len(np.roots([1.0, 0.0, -2.0 * 2.0])))

# ---- l15-packet-evolution ----
p15 = pk(0, 1, 1.5)
put('l15MeanP15', pmom(p15)[0])
put('l15EchoT12', 1.2)
put('l15PhaseP1DegMag', abs(phase_deg(1.0, 1.2)))
put('l15PhaseP2DegMag', abs(phase_deg(2.0, 1.2)))
ev6 = evolve(p15, 6.0)
put('l15DpT0', pmom(p15)[1])
put('l15DpT6', pmom(ev6)[1])
put('l15MeanPT6', pmom(ev6)[0])
put('l15PeakRatioT6', np.max(np.abs(ev6) ** 2) / np.max(np.abs(p15) ** 2))
put('l15NormT6', np.sum(np.abs(ev6) ** 2) * dx)
f0 = np.abs(np.fft.fft(p15)) ** 2
f6 = np.abs(np.fft.fft(ev6)) ** 2
put('l15PhiDrift', np.max(np.abs(f6 - f0)) / np.max(f0))

# ---- l15-group-velocity ----
put('l15FringeSpacing', fringe(2, 4, np.pi - 0.5, np.pi + 0.5, 0.0) - fringe(2, 4, -0.5, 0.5, 0.0))
put('l15FringeSpeed', (fringe(2, 4, 1.0, 2.0, 0.5) - fringe(2, 4, -0.5, 0.5, 0.0)) / 0.5)
put('l15FringeSpeedFormula', (2 + 4) / 2)
put('l15EchoK1Near', 2.8)
put('l15EchoK2Near', 3.2)
put('l15FringeSpacingNear', fringe(2.8, 3.2, 14.7, 16.7, 0.0) - fringe(2.8, 3.2, -1.0, 1.0, 0.0))
put('l15EnvSpeedNear', (fringe(2.8, 3.2, 2.0, 4.0, 1.0) - fringe(2.8, 3.2, -1.0, 1.0, 0.0)) / 1.0)
put('l15Centre3', mean_x(evolve(q3, 3.0)))
# the carrier of the near pair: the zero of sin of the MEAN of the two component phases th = p x - p^2 t/2, tracked over one unit of time
def carrier_zero(p1, p2, lo, hi, t):
    th = lambda p, xx: p * xx - p * p * t / 2  # noqa: E731
    return brentq(lambda xx: np.sin((th(p1, xx) + th(p2, xx)) / 2), lo, hi, xtol=1e-15, rtol=1e-15)


put('l15CarrierSpeedNear', (carrier_zero(2.8, 3.2, 0.5, 2.0, 1.0) - carrier_zero(2.8, 3.2, -0.3, 0.3, 0.0)) / 1.0)
v_phase3 = (crest(3.0, 1.0, 0.2, -0.2, 0.7) - crest(3.0, 1.0, 0.0, -0.5, 0.5)) / 0.2
put('l15PhaseV3', v_phase3)
put('l15GroupPhaseRatio', ((mean_x(evolve(q3, 1.0)) - mean_x(q3)) / 1.0) / v_phase3)
qn = pk(0, 1, -3)
put('l15NegCentre2Mag', abs(mean_x(evolve(qn, 2.0))))
put('l15NegEnergy', pmom(qn)[2])
put('l15PrEnvSpeed45', (fringe(4, 5, 3.5, 5.5, 1.0) - fringe(4, 5, -1.0, 1.0, 0.0)) / 1.0)
put('l15PrCarrier45', ((omega(4.0) + omega(5.0)) / 2) / 4.5)
put('l15VgElectron', H / (ME * 0.5e-9) / 1e6)
put('l15VphElectron', H / (ME * 0.5e-9) / 2e6)

# ---- l15-dispersion ----
put('l15DeltaV', pmom(p15)[1] / 1.0)
put('l15Vg1', (omega(1.5) - omega(0.5)) / 1.0)
put('l15Vg3', (omega(3.5) - omega(2.5)) / 1.0)
put('l15Omega2nd', (omega(3.5) - 2 * omega(3.0) + omega(2.5)) / 0.5**2)
shifted = np.roll(p15, int(round(6.0 / dx)))
put('l15LinearWidth6', sd_x(shifted))
put('l15QuadWidth6', sd_x(ev6))

# ---- l15-gaussian ----
g08 = pk(0, 0.8)
put('l15Dx08', sd_x(g08))
put('l15Dx04', sd_x(pk(0, 0.4)))
put('l15Dp08', pmom(g08)[1])
put('l15Prod08', sd_x(g08) * pmom(g08)[1])
put('l15Dv08', pmom(g08)[1] / 1.0)
put('l15Tspread08', 2 * 1.0 * 0.8**2 / 1.0)
put('l15Tspread04', 2 * 1.0 * 0.4**2 / 1.0)
put('l15TspreadRatio', (2 * 0.8**2) / (2 * 0.4**2))
put('l15WidthAtTSpread', sd_x(evolve(g08, 1.28)) / 0.8)
sig = 1e-10 / sqrt(2)
put('l15TspreadEqTownsend', (2 * ME * sig**2 / HBAR) / (ME * (1e-10) ** 2 / HBAR))

# ---- practice ----
put('l15PrDp', pmom(g08)[1])
put('l15PrDpT5', pmom(evolve(g08, 5.0))[1])
put('l15PrBoost', mean_x(evolve(pk(-2, 1) * np.exp(1j * 1.5 * x), 6.0)))
put('l15PrSpreadFs', ME * (1e-9) ** 2 / HBAR / 1e-15)

# ---- engine cases for physics/wave15.ts ----
cases['pairEnvelope'] = [
    {'k1': k1, 'k2': k2, 'm': m, 'v': (omega(k2, m) - omega(k1, m)) / (k2 - k1)} for (k1, k2, m) in ((2, 4, 1.0), (2.8, 3.2, 1.0), (4, 5, 1.0), (1, 3, 2.0), (-1, 2, 0.5))
]
cases['pairCarrier'] = [
    {'k1': k1, 'k2': k2, 'm': m, 'v': ((omega(k1, m) + omega(k2, m)) / 2) / ((k1 + k2) / 2)} for (k1, k2, m) in ((2.8, 3.2, 1.0), (4, 5, 1.0), (1, 3, 2.0), (2, 4, 0.5))
]
cases['phaseDeg'] = [{'p': p, 't': t, 'm': m, 'deg': -float(np.degrees(p * p * t / (2 * m)))} for (p, t, m) in ((1.0, 1.2, 1.0), (2.0, 1.2, 1.0), (3.0, 0.5, 2.0), (-1.5, 2.0, 1.0))]
cases['spreadScale'] = [{'sigma': s, 'm': m, 'T': 2 * m * s * s} for (s, m) in ((0.8, 1.0), (0.4, 1.0), (1.0, 2.5))]
cases['crest'] = [
    {'p': p, 'm': m, 'dt': dt, 'v': (crest(p, m, dt, -1.0, 1.0) - crest(p, m, 0.0, -1.0, 1.0)) / dt}
    for (p, m, dt) in ((1.5, 1.0, 1.0), (1.0, 2.0, 1.0), (1.2, 1.0, 0.5), (-1.5, 1.0, 1.0))
]
cases['fringe'] = [
    {'p1': p1, 'p2': p2, 'lo': lo, 'hi': hi, 't': t, 'x': fringe(p1, p2, lo, hi, t)}
    for (p1, p2, lo, hi, t) in ((2, 4, -0.5, 0.5, 0.0), (2, 4, 1.0, 2.0, 0.5), (2.8, 3.2, 14.7, 16.7, 0.0), (4, 5, -2.0, 2.0, 0.0))
]
cases['groupSpeed'] = [{'m': ME, 'lambda': lam, 'v': H / (ME * lam)} for lam in (0.5e-9, 1e-10, 2.5e-9)]

(ROOT / 'app/src/physics/__fixtures__/claims-448').mkdir(parents=True, exist_ok=True)
(ROOT / 'app/src/physics/__fixtures__/claims-448/l15.json').write_text(
    json.dumps({'about': 'Numpy twin of Physics 448 Lecture 15: pipeline/claims_448/l15.py', 'values': dict(sorted(out.items()))}, indent=1) + '\n'
)
(ROOT / 'app/src/physics/__fixtures__/wave15-cases.json').write_text(json.dumps({'about': 'engine cases for physics/wave15.ts: pipeline/claims_448/l15.py', 'cases': cases}, indent=1) + '\n')
print(len(out), 'keys')
