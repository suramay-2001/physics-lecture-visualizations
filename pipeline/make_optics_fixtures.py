#!/usr/bin/env python3
"""Numpy/scipy twins of the Optics Lab engine tables (app/src/physics/optics/cooling.ts and collisions.ts, Physics 709).

Written by routes DIFFERENT from the engine's closed forms wherever a numerical route exists: ODE integration (stopping length and time,
Zeeman profile), numeric derivatives (friction, spring, damping), bounded minimisation (force peak, barrier tops), brentq (onset
temperature, partial-wave count, threshold), quadrature (Maxwell-Boltzmann share, transverse diffusion), sympy Clebsch-Gordan, scipy Airy
zeros, a plane-wave diagonalisation (lattice gap) and mpmath at 50 digits (the cancelling dipole depth). Where only a formula exists it is
typed here independently (rad/s, SI) and agreement is the evidence. Each entry is [value, relative tolerance]: closed forms 1e-11,
numerical routes 1e-6 to 1e-9 (the engine's own searches stop near 1e-8).

Usage (repo root): python3 pipeline/make_optics_fixtures.py -> app/src/physics/__fixtures__/optics.json (read by physics/optics/*.test.ts).
Deterministic: two runs write byte-identical files.
"""
import json
from pathlib import Path

import mpmath as mp
import numpy as np
from scipy import integrate, optimize, special
from sympy import Rational
from sympy.physics.quantum.cg import CG

ROOT = Path(__file__).resolve().parent.parent

# CODATA 2018, as app/src/physics/constants.ts (h, e, c, k_B exact; m_e and u measured)
h = 6.62607015e-34
hbar = h / (2 * np.pi)
kB = 1.380649e-23
c = 299792458.0
u = 1.6605390666e-27
e = 1.602176634e-19
me = 9.1093837015e-31
muB = e * hbar / (2 * me)
g0 = 9.80665
torr = 101325 / 760
AU = 4.3597447222e-18 * 5.29177210903e-11**6


class Atom:
    def __init__(s, lam_nm, g_mhz, mass_u):
        s.lam = lam_nm * 1e-9
        s.g = 2 * np.pi * g_mhz * 1e6
        s.M = mass_u * u
        s.k = 2 * np.pi / s.lam


Na = Atom(589.158, 9.7946, 22.98976928)
Rb = Atom(780.241, 6.0666, 86.909180527)
Rb85 = Atom(780.241, 6.0666, 84.911789738)
Cs = Atom(852.347, 5.234, 132.905451961)
H = Atom(121.567, 99.7, 1.00782503)

out: dict[str, list[float]] = {}


def put(key, value, tol=1e-11):
    out[key] = [float(value), tol]


# ---- basics (typed independently, SI) ----
for nm, A in (("Na", Na), ("Rb", Rb), ("Cs", Cs), ("H", H)):
    put(f"recoilVelocity.{nm}", h / (A.lam * A.M))
    put(f"recoilRate.{nm}", h * np.pi / (A.lam**2 * A.M))
    put(f"recoilTemperature.{nm}", h**2 / (A.lam**2 * A.M * kB))
    put(f"dopplerTemperature.{nm}", h * A.g / (4 * np.pi * kB))
    put(f"maxAcceleration.{nm}", h * A.g / (2 * A.lam * A.M))
    put(f"saturationIntensity.{nm}", np.pi * h * c * A.g / (3 * A.lam**3))
    put(f"gammaOverK.{nm}", A.g * A.lam / (2 * np.pi))
put("scatterRate.Na.1.-0.5", Na.g / 2 * 1.0 / (1 + 1.0 + (2 * (-0.5 * Na.g) / Na.g) ** 2))
put("scatterRate.Rb.0.3.-4", Rb.g / 2 * 0.3 / (1 + 0.3 + (2 * (-4.0 * Rb.g) / Rb.g) ** 2))

# ---- slowing: ODE of uniform deceleration ----
def stop_ode(v0, a):
    ev = lambda t, y: y[1] - 1e-9
    ev.terminal = True
    sol = integrate.solve_ivp(lambda t, y: [y[1], -a], [0, 1.5 * v0 / a], [0, v0], events=ev, rtol=1e-12, atol=1e-13)
    return sol.y[0, -1], sol.t[-1]


amaxNa = hbar * Na.k * Na.g / (2 * Na.M)
v712 = np.sqrt(3 * kB * 712 / Na.M)
L712, t712 = stop_ode(v712, amaxNa)
put("slowRow.Na.712.vPeak", v712)
put("slowRow.Na.712.stopLength", L712, 1e-8)
put("slowRow.Na.712.stopTime", t712, 1e-8)
v0, eta = 879.0, 0.5
a_s = eta * amaxNa
z0_ode, tstop_ode = stop_ode(v0, a_s)
put("zeemanSlower.Na.879.0.5.z0", z0_ode, 1e-8)
put("zeemanSlower.Na.879.0.5.B0", hbar * Na.k * v0 / muB)
put("zeemanSlower.Na.879.0.5.tStop", tstop_ode, 1e-8)
# the profile from the ODE: find t with z(t) = 0.3 m, then v = v0 - a t, B = hbar k v / muB
t_at = optimize.brentq(lambda t: v0 * t - 0.5 * a_s * t * t - 0.3, 0, v0 / a_s)
put("zeemanProfile.Na.0.3.vR", v0 - a_s * t_at, 1e-9)
put("zeemanProfile.Na.0.3.B", hbar * Na.k * (v0 - a_s * t_at) / muB, 1e-9)
put("chirpRate.Na.0.5", Na.k * a_s / (2 * np.pi))
put("dopplerOverGamma.Na.879", Na.k * 879.0 / Na.g)
# damping: numeric derivative of the one-beam force at the detuning where it gives eta of the maximum
s_, eta_ = 2.0, 0.5
x_ = np.sqrt(s_ * (1 - eta_) / eta_ - 1)  # |2 (delta - kv)/gamma| at that point
F1 = lambda d: hbar * Na.k * Na.g / 2 * s_ / (1 + s_ + (2 * d / Na.g) ** 2)  # d = delta - kv in rad/s; dF/dv = -k dF/dd
dd = -x_ * Na.g / 2
dFdd = (F1(dd + 1.0) - F1(dd - 1.0)) / 2.0
beta_num = abs(Na.k * dFdd)
put("slowerDamping.Na.0.5.2.beta", beta_num, 1e-6)
put("slowerDamping.Na.0.5.2.time", Na.M / beta_num, 1e-6)
t_end = 879.0 / a_s
dx_q, _ = integrate.quad(lambda t: hbar * Na.k / Na.M * np.sqrt(eta * Na.g / 2 * t), 0, t_end, epsabs=0, epsrel=1e-13)
put("transverseDiffusion.Na.879.0.5", dx_q, 1e-9)
put("divergence.0.01.1000.50", 0.01 * 1000 / 50)
put("secondOrderDoppler.500", -(500.0**2) / (2 * c**2))
put("flightLimit.3.500", 1 / (3 / 500.0))

# ---- molasses ----
def Fsum(A, s, dl, v):
    d = dl * A.g
    pl = hbar * A.k * A.g / 2 * s / (1 + s + (2 * (d - A.k * v) / A.g) ** 2)
    mi = hbar * A.k * A.g / 2 * s / (1 + s + (2 * (d + A.k * v) / A.g) ** 2)
    return pl, -mi, pl - mi


vtest = 0.7 * Na.g / Na.k
pl, mi, sm = Fsum(Na, 1.0, -0.5, vtest)
put("beamForces.Na.1.-0.5.plus", pl)
put("beamForces.Na.1.-0.5.minus", mi)
put("beamForces.Na.1.-0.5.sum", sm)
dv = 1e-4 * Na.g / Na.k
for s_, dl_ in ((1.0, -0.5), (0.3, -2.0)):
    b = -(Fsum(Na, s_, dl_, dv)[2] - Fsum(Na, s_, dl_, -dv)[2]) / (2 * dv)
    put(f"molassesBeta.Na.{s_:g}.{dl_:g}", b, 1e-7)
res = optimize.minimize_scalar(lambda v: Fsum(Na, 1.0, -0.5, v)[2], bounds=(0, 3 * Na.g / Na.k), method="bounded", options={"xatol": 1e-12})
put("molassesPeak.Na.1.-0.5", res.x, 1e-6)
put("molassesPeakFormula.Na.1.-0.5", res.x, 1e-6)  # the book's closed form equals the numerical maximum (asserted in the engine test)
put("captureVelocity.Na", Na.g * Na.lam / (4 * np.pi))
put("dopplerSteadyT.Na.-1", hbar * Na.g / (4 * kB) * (2 * 1.0 + 1 / (2 * 1.0)))
put("dopplerSteadyT.Na.-0.5", hbar * Na.g / (2 * kB))
for s_, dl_ in ((0.01, -0.5), (1.0, -0.5)):
    bdv = -(Fsum(Na, s_, dl_, dv)[2] - Fsum(Na, s_, dl_, -dv)[2]) / (2 * dv)
    gsc = Na.g / 2 * s_ / (1 + s_ + (2 * dl_) ** 2)
    put(f"diffusionTemperature.Na.{s_:g}.{dl_:g}", (hbar * Na.k) ** 2 * 2 * gsc / bdv / kB, 1e-6)
bnum = -(Fsum(Na, 1.0, -0.5, dv)[2] - Fsum(Na, 1.0, -0.5, -dv)[2]) / (2 * dv)
vcN = Na.g / (2 * Na.k)
put("molassesLinearityError.Na.1.-0.5.vc", 1 - abs(Fsum(Na, 1.0, -0.5, vcN)[2]) / (bnum * vcN), 1e-6)
put("molassesLinearityError.Na.1.-0.5.half", 1 - abs(Fsum(Na, 1.0, -0.5, vcN / 2)[2]) / (bnum * vcN / 2), 1e-6)
gR_Rb = hbar * Rb.k**2 / (2 * Rb.M)
vth = np.sqrt(3 * kB * 423.15 / Rb.M)
dvr = np.sqrt(hbar * Rb.g / (2 * Rb.M))
put("collimation.Rb.gOverGR", Rb.g / gR_Rb)
put("collimation.Rb.compress1D", np.sqrt(Rb.g / gR_Rb))
put("collimation.Rb.dvRms", dvr)
put("collimation.Rb.vc", Rb.g / (2 * Rb.k))
amax_Rb = hbar * Rb.k * Rb.g / (2 * Rb.M)
put("collimation.Rb.dx", Rb.g / (2 * Rb.k * gR_Rb))  # the book's right-hand side (printed form): gamma / (2 k gamma_R)
put("collimation.Rb.psCompress", Rb.g / gR_Rb * vth / dvr)
gR_Na = hbar * Na.k**2 / (2 * Na.M)
step = np.sqrt(hbar * Na.g / Na.M) / gR_Na
put("molassesWalk.Na.0.01.step", step)
put("molassesWalk.Na.0.01.steps", (0.01 / step) ** 2)
put("molassesWalk.Na.0.01.time", (0.01 / step) ** 2 / gR_Na)
Om = Na.g * np.sqrt(2 / 2 + 1)
put("dressed.Na.2.1.omega", Om)
put("dressed.Na.2.1.shift", hbar * (Om - Na.g) / 2)
put("dressed.Na.2.1.cos2phi", -Na.g / Om)
put("dopplerSpeed1D.Rb", np.sqrt(7 * hbar * Rb.g / (20 * Rb.M)))

# ---- sub-Doppler: sympy Clebsch-Gordan ----
def cg2(Jg, mg, q):
    Jg, mg = Rational(Jg), Rational(mg)
    return float(CG(Jg, mg, 1, q, Jg + 1, mg + q).doit() ** 2)


for (Jg, mg, q) in ((Rational(1, 2), Rational(1, 2), 1), (Rational(1, 2), -Rational(1, 2), 1), (Rational(1, 2), Rational(1, 2), -1), (1, 1, 1), (1, 1, -1), (1, 0, 0), (Rational(3, 2), Rational(1, 2), 0)):
    put(f"clebschSquared.{Jg}.{mg}.{q}", cg2(Jg, mg, q))
d_ = -4.0 * Rb.g
U1 = 2 * hbar * d_ * 0.5 * 1.0 / (1 + 4 * d_**2 / Rb.g**2)
put("lightShiftGround.Rb.0.5.-4.1", U1)
put("lightShiftGround.Rb.0.5.-4.0.5", U1 / 2)
zz = np.linspace(0, 0.5, 5001)
Up = U1 * (1 / 3 + 2 / 3 * np.cos(2 * np.pi * zz) ** 2)
Um = U1 * (1 / 3 + 2 / 3 * np.sin(2 * np.pi * zz) ** 2)
put("sisyphusPotential.0.1.plus", U1 * (1 / 3 + 2 / 3 * np.cos(0.2 * np.pi) ** 2))
put("sisyphusPotential.0.1.minus", U1 * (1 / 3 + 2 / 3 * np.sin(0.2 * np.pi) ** 2))
put("sisyphusHill", Up.max() - Up.min(), 1e-9)
put("sisyphusFriction.Rb.-4", hbar * Rb.k**2 * 4.0)
fr = optimize.minimize_scalar(lambda s: -(8 * 0.5 * s / (2 + s) ** 2), bounds=(0.01, 50), method="bounded", options={"xatol": 1e-12})
put("dopplerFrictionMax.Rb", -fr.fun * hbar * Rb.k**2, 1e-8)
put("subDopplerLimit.lin", 0.125 * abs(U1) / kB)
put("subDopplerLimit.sigma", 0.097 * abs(U1) / kB)
wz = Rb85.k * 0 + (1 / 3) * muB * 1e-4 / hbar
put("zeemanOmega.Rb85.1G", wz)
put("vsrVelocity.sigma.1G", wz / Rb85.k)
put("vsrVelocity.lin.1G", wz / (2 * Rb85.k))
put("vsrForce.0.2.1.1.5", -1.0 * (0.2 - 1.0) / (1 + ((0.2 - 1.0) / 1.5) ** 2))
put("vsrForcePair.0.2.1.1.5", -(0.2 - 1.0) / (1 + ((0.2 - 1.0) / 1.5) ** 2) - (0.2 + 1.0) / (1 + ((0.2 + 1.0) / 1.5) ** 2))
put("milcWindow.Rb85.0.1G", (1 / 3) * muB * 1e-5 / hbar / Rb85.k)

# ---- magnetic traps ----
a_tr = muB * 1.0 / Na.M
put("trapAcceleration.Na.1.1", a_tr)
put("quadrupoleU.1.1.0.01.0.005", muB * 1.0 * np.hypot(0.01, 2 * 0.005))
rho = 0.01
vc_, Tp = np.sqrt(rho * a_tr), 2 * np.pi * np.sqrt(rho / a_tr)


def orb(t, y):
    r = np.hypot(y[0], y[1])
    return [y[2], y[3], -a_tr * y[0] / r, -a_tr * y[1] / r]


sol = integrate.solve_ivp(orb, [0, 2 * Tp], [rho, 0, 0, vc_], rtol=1e-12, atol=1e-14, dense_output=True)
tt = np.linspace(0, 2 * Tp, 40001)
yy = sol.sol(tt)
ang = np.unwrap(np.arctan2(yy[1], yy[0]))
put("circularOrbit.v", vc_)
put("circularOrbit.period", 2 * np.pi / np.polyfit(tt, ang, 1)[0], 1e-7)
put("adiabaticLimits.rhoMin", (hbar**2 / (Na.M**2 * a_tr)) ** (1 / 3))
put("adiabaticLimits.vMin", (hbar * a_tr / Na.M) ** (1 / 3))
put("orbitN", Na.M * vc_ * rho / hbar)
E1 = (Na.M * (a_tr * hbar) ** 2) ** (1 / 3)
put("heuristicE1", E1)
put("heuristicLevel.2", 1.5 * E1 * 2 ** (2 / 3))
ai, aip = special.ai_zeros(8)[0], special.ai_zeros(8)[1]
units = np.sort(np.concatenate([-ai, -aip]))[:8]
for i, un in enumerate(units):
    put(f"vTrapUnits.{i + 1}", un, 1e-7)
scale = (hbar**2 * (muB * 1.0) ** 2 / (2 * Na.M)) ** (1 / 3)
put("vTrapLevels.Na.1T.1", units[0] * scale, 1e-7)
put("vTrapLevels.Na.1T.3", units[2] * scale, 1e-7)
put("zeemanEnergyK.1.1e-4", muB * 1e-4 / kB)
put("trapDepthK.1.0.02", muB * 0.02 / kB)

# ---- dipole traps and the MOT ----
mp.mp.dps = 50
sG, dG = mp.mpf("2e8"), mp.mpf("-1e6") * mp.mpf(Na.g)
depth = mp.mpf(hbar) * (mp.sqrt(mp.mpf(Na.g) ** 2 * sG / 2 + dG**2) - abs(dG)) / 2
put("dipoleDepth.Na.2e8.-1e6", float(depth), 1e-10)
gsc = Na.g / 2 * 2e8 / (1 + 2e8 + (2 * -1e6) ** 2)
put("dipoleScatterRate.Na.2e8.-1e6", gsc)
put("recoilHeatingTime", float(depth) / (2 * hbar * gR_Na * gsc), 1e-10)
Ub, ER = abs(U1) * 2 / 3, hbar * hbar * Rb.k**2 / (2 * Rb.M)
put("latticeVibration", 2 * np.sqrt(Ub * ER))
# plane-wave diagonalisation of U = Ub sin^2(kz): the lowest gap agrees with the harmonic quantum within 10 per cent
ms = np.arange(-10, 11)
Hm = np.zeros((21, 21))
for i, m in enumerate(ms):
    Hm[i, i] = 4 * ER * m * m + Ub / 2
    if i + 1 < 21:
        Hm[i, i + 1] = Hm[i + 1, i] = -Ub / 4
ev = np.linalg.eigvalsh(Hm)
put("latticeVibration.bandGap", ev[1] - ev[0], 0.1)
mot = dict(s=1.0, dl=-1.0, A=0.1, mu=muB)


def Fmot(z, v):
    d = mot["dl"] * Rb.g
    sh = Rb.k * v + mot["mu"] * mot["A"] * z / hbar
    return hbar * Rb.k * Rb.g / 2 * mot["s"] * (1 / (1 + mot["s"] + (2 * (d - sh) / Rb.g) ** 2) - 1 / (1 + mot["s"] + (2 * (d + sh) / Rb.g) ** 2))


put("motForce.Rb.0.002.0.5", Fmot(0.002, 0.5))
kap = -(Fmot(1e-6, 0) - Fmot(-1e-6, 0)) / 2e-6
bet = -(Fmot(0, 1e-3) - Fmot(0, -1e-3)) / 2e-3
put("motLinear.kappa", kap, 1e-6)
put("motLinear.beta", bet, 1e-6)
put("motLinear.omega", np.sqrt(kap / Rb.M), 1e-6)
put("motLinear.size", hbar * abs(mot["dl"]) * Rb.g / (mot["mu"] * mot["A"]))
put("motLinear.zeta", bet / (2 * np.sqrt(kap * Rb.M)), 1e-6)
vcap = np.sqrt(2 * (hbar * Cs.k * Cs.g / (2 * Cs.M)) * 0.03)
put("capture.Cs.0.03.v", vcap)
put("capture.Cs.0.03.energyK", Cs.M * vcap**2 / 2 / kB)


def mb_below(vc, T, M):
    f = lambda v: 4 * np.pi * v**2 * (M / (2 * np.pi * kB * T)) ** 1.5 * np.exp(-M * v**2 / (2 * kB * T))
    return integrate.quad(f, 0, vc, epsabs=0, epsrel=1e-13)[0]


put("boltzmannBelow.Cs.5.300", mb_below(5.0, 300, Cs.M), 1e-9)
put("boltzmannBelow.Cs.10.300", mb_below(10.0, 300, Cs.M), 1e-9)
put("boltzmannBelow.Cs.200.300", mb_below(200.0, 300, Cs.M), 1e-9)
put("boltzmannBelow.Cs.59.300", mb_below(59.0, 300, Cs.M), 1e-9)  # the capture speed of the page (review B2)
put("boltzmannBelow.Cs.118.300", mb_below(118.0, 300, Cs.M), 1e-9)
put("boltzmannBelow.Cs.5.300.erf", special.erf(5.0 / (np.sqrt(2) * np.sqrt(kB * 300 / Cs.M))) - 2 / np.sqrt(np.pi) * (5.0 / (np.sqrt(2) * np.sqrt(kB * 300 / Cs.M))) * np.exp(-((5.0 / (np.sqrt(2) * np.sqrt(kB * 300 / Cs.M))) ** 2)), 1e-9)
put("vaporDensity.1e-5.300", 1e-5 * torr / (kB * 300))
put("deBroglie.1e-27", h / 1e-27)
put("thermalDeBroglie.Na.1e-6", h / np.sqrt(2 * np.pi * Na.M * kB * 1e-6))
put("erf.0.5", special.erf(0.5), 1e-13)
put("erf.2.5", special.erf(2.5), 1e-13)

# ---- collisions ----
def langevin(n, Cn, m, ell):
    L = ell * (ell + 1)
    V = lambda R: -Cn / R**n + hbar**2 * L / (2 * m * R**2)
    guess = (m * n * Cn / (hbar**2 * L)) ** (1 / (n - 2))
    r = optimize.minimize_scalar(lambda R: -V(R), bracket=(0.5 * guess, guess, 2 * guess), tol=1e-14)
    return r.x, -r.fun


mNa, C6Na = Na.M / 2, 1556 * AU
Rc, Vc = langevin(6, C6Na, mNa, 1)
put("langevinBarrier.Na.1.Rc", Rc, 1e-6)
put("langevinBarrier.Na.1.Vc", Vc, 1e-6)
put("barrierTop.Na.1", Vc, 1e-6)
put("langevinPotential.Na.1.8e-9", -C6Na / (8e-9) ** 6 + hbar**2 * 2 / (2 * mNa * (8e-9) ** 2))


def TQ(n, Cn, m, lc=1):
    f = lambda T: (n * m * Cn / hbar**2) * (3 * kB * T / ((n - 2) * Cn)) ** ((n - 2) / n) - lc * (lc + 1)
    return optimize.brentq(f, 1e-9, 10.0, xtol=1e-18, rtol=1e-14)


put("quantumOnsetT.Na", TQ(6, C6Na, mNa), 1e-8)
put("quantumOnsetT.Cs", TQ(6, 6860 * AU, Cs.M / 2), 1e-8)
# the partial waves by root finding on the numerical barrier top: V_c(l) = (3/2) k_B T


def lc_numeric(T):
    g = lambda ell: langevin(6, C6Na, mNa, ell)[1] - 1.5 * kB * T
    return optimize.brentq(g, 0.05, 40.0, xtol=1e-12)


put("partialWaves.Na.1e-3", lc_numeric(1e-3), 1e-7)
put("partialWaves.Na.1e-4", lc_numeric(1e-4), 1e-7)


def sigma(E, n=6, Cn=C6Na, m=mNa):
    f = lambda lL: langevin(n, Cn, m, np.exp(lL))[1] - E
    ell = np.exp(optimize.brentq(f, np.log(1e-8), np.log(1e4), xtol=1e-14))
    b = hbar * np.sqrt(ell * (ell + 1)) / np.sqrt(2 * m * E)
    return np.pi * b**2


put("thresholdCross.Na.1e-30", sigma(1e-30), 1e-6)
put("thresholdCross.Na.slope", (np.log(sigma(2e-30)) - np.log(sigma(1e-30))) / np.log(2), 1e-6)
nu = np.linspace(-5, 5, 400001)
pr = np.cos(np.pi * nu * 0.35) ** 2
put("ramseyChance.0.4.0.35", np.cos(np.pi * 0.4 * 0.35) ** 2)
half = nu[(pr >= 0.5) & (np.abs(nu) < 1.0)]
put("ramseyWidth.0.35", half.max() - half.min(), 1e-4)
put("fountainTime.0.15", 2 * np.sqrt(2 * 0.15 / g0))
put("bounceTime.0.003", 2 * np.sqrt(2 * 0.003 / g0))
put("kapitzaDiracAngle.Na.1000.1", 2 * hbar * Na.k / (Na.M * 1000.0))
mid = lambda T: 2 / Na.lam * np.sqrt(2 * np.log(2) * kB * T / Na.M)
put("dopplerFwhm.Na.300", mid(300))
put("wavenumberToK.17", 17 * 100 * h * c / kB)
put("hzToK.9192631770", h * 9192631770.0 / kB)
put("releaseSpeed.Cs", np.sqrt(h * 9192631770.0 / Cs.M))

payload = {
    "about": "Optics Lab engine tables, numpy/scipy/sympy/mpmath routes. Entry = [value, relative tolerance]. Regenerate: python3 pipeline/make_optics_fixtures.py",
    "values": dict(sorted(out.items())),
}
dest = ROOT / "app" / "src" / "physics" / "__fixtures__" / "optics.json"
dest.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n")
print(f"wrote {dest.relative_to(ROOT)} ({len(out)} values)")
