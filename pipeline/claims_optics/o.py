#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/optics/O1.values.ts ... O6.values.ts (Physics 709, the Optics Lab pages O1 to O6).

Each value is the number a page prints, rounded half-up to the digits and the unit named in the page's values file. The engine
(physics/optics/cooling.ts, collisions.ts) uses closed forms; this script takes another route wherever one exists, so agreement is evidence:
ODE integration (stopping length, time, slower profile), quadrature (transverse diffusion, vapour shares), numeric derivatives (friction,
spring, damping), bounded minimisation (force peak, barrier tops, the best friction), brentq (onset temperatures, thresholds), sympy
Clebsch-Gordan, scipy Airy zeros, an eigenvalue problem (the dressed pair), a numerical fringe width, and mpmath at 50 digits (the cancelling
dipole depth). Constants are CODATA 2018 as app/src/physics/constants.ts; atoms and C6 are the stated inputs of the pages.

Usage (from the repo root): python3 pipeline/claims_optics/o.py -> app/src/physics/__fixtures__/claims-optics/o1.json ... o6.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key, to 1e-12). Deterministic: two runs write byte-identical files.
"""
import json
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

import mpmath as mp
import numpy as np
from scipy import integrate, optimize, special
from sympy import Rational
from sympy.physics.quantum.cg import CG

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-optics"

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
HFS = 9192631770.0


def rnd(x, n):
    """Round half up on the exact binary value, as JavaScript's toFixed does."""
    return float(Decimal(float(x)).quantize(Decimal(1).scaleb(-n), rounding=ROUND_HALF_UP))


class Atom:
    def __init__(s, lam_nm, g_mhz, mass_u):
        s.lam, s.g, s.M = lam_nm * 1e-9, 2 * np.pi * g_mhz * 1e6, mass_u * u
        s.k = 2 * np.pi / s.lam


Na, Rb, Rb85 = Atom(589.158, 9.7946, 22.98976928), Atom(780.241, 6.0666, 86.909180527), Atom(780.241, 6.0666, 84.911789738)
Cs, H = Atom(852.347, 5.234, 132.905451961), Atom(121.567, 99.7, 1.00782503)
amax = lambda A: hbar * A.k * A.g / (2 * A.M)


def stop_ode(v0, a):
    ev = lambda t, y: y[1] - 1e-9
    ev.terminal = True
    sol = integrate.solve_ivp(lambda t, y: [y[1], -a], [0, 1.5 * v0 / a], [0, v0], events=ev, rtol=1e-12, atol=1e-13)
    return sol.y[0, -1], sol.t[-1]


def force(A, s, dl, v):
    """Sum of the two beams, N, beam + along the atom's motion (rad/s throughout)."""
    d = dl * A.g
    f = lambda sh: hbar * A.k * A.g / 2 * s / (1 + s + (2 * (d - sh) / A.g) ** 2)
    return f(A.k * v) - hbar * A.k * A.g / 2 * s / (1 + s + (2 * (d + A.k * v) / A.g) ** 2)


def beta_num(A, s, dl):
    dv = 1e-4 * A.g / A.k
    return -(force(A, s, dl, dv) - force(A, s, dl, -dv)) / (2 * dv)


def td(A):
    return hbar * A.g / (2 * kB)


def tr(A):
    return hbar**2 * A.k**2 / (A.M * kB)


# ------------------------------------------------------------------------------------ O1
v712 = np.sqrt(3 * kB * 712 / Na.M)
L712, t712 = stop_ode(v712, amax(Na))
a_s = 0.5 * amax(Na)
z0, _ = stop_ode(v712, a_s)
t_half = optimize.brentq(lambda t: v712 * t - 0.5 * a_s * t * t - z0 / 2, 0, v712 / a_s)
x_ = np.sqrt(2 * 0.5 / 0.5 - 1)  # |2 (delta - kv)/gamma| at the working point for eta = 1/2, s = 2
F1 = lambda d: hbar * Na.k * Na.g / 2 * 2.0 / (1 + 2.0 + (2 * d / Na.g) ** 2)
beta_sl = abs(Na.k * (F1(-x_ * Na.g / 2 + 1.0) - F1(-x_ * Na.g / 2 - 1.0)) / 2.0)
dx_q = integrate.quad(lambda t: hbar * Na.k / Na.M * np.sqrt(0.5 * Na.g / 2 * t), 0, v712 / a_s, epsabs=0, epsrel=1e-13)[0]
o1 = {
    "o1TransitHz": rnd(1 / (3 / 500.0), 0),
    "o1Doppler2Beam": rnd(500.0**2 / (2 * c**2) / 1e-12, 2),
    "o1RecoilNa": rnd(h / (Na.lam * Na.M) * 100, 2),
    "o1IsatNa": rnd(np.pi * h * c / (3 * Na.lam**3 * (1 / Na.g)) / 10, 2),
    "o1AmaxNa": rnd(h * Na.g / (2 * Na.lam * Na.M) / 1e3, 0),
    "o1VPeakNa": rnd(v712, 0),
    "o1StopLenNa": rnd(L712, 3),
    "o1StopTimeNa": rnd(t712 * 1e3, 3),
    "o1HGammaOverK": rnd(H.g * H.lam / (2 * np.pi), 1),
    "o1HLambdaNm": rnd(121.567, 1),
    "o1HLambdaFromRecoil": rnd(h / (H.M * 3.25) * 1e9, 1),
    "o1DopplerOverGamma": rnd(Na.k * v712 / Na.g, 0),
    "o1SlowerB0G": rnd(hbar * Na.k * v712 / muB * 1e4, 0),
    "o1SlowerLenM": rnd(z0, 3),
    "o1HalfwayB": rnd((v712 - a_s * t_half) / v712, 3),
    "o1DampUs": rnd(Na.M / beta_sl * 1e6, 1),
    "o1TransDiffMm": rnd(dx_q * 1e3, 2),
}

# ------------------------------------------------------------------------------------ O2
vc = Na.g / (2 * Na.k)
b1 = beta_num(Na, 1.0, -0.5)
pk = optimize.minimize_scalar(lambda v: force(Na, 1.0, -0.5, v), bounds=(0, 3 * Na.g / Na.k), method="bounded", options={"xatol": 1e-12}).x
lin = lambda v: 1 - abs(force(Na, 1.0, -0.5, v)) / (b1 * v)
Tss = lambda dl: hbar * Na.g / (4 * kB) * (2 * abs(dl) + 1 / (2 * abs(dl)))
bd = beta_num(Na, 0.01, -0.5)
Rb_gR = hbar * Rb.k**2 / (2 * Rb.M)
Rb_dv = np.sqrt(hbar * Rb.g / (2 * Rb.M))
Hd = lambda d, W: np.array([[-d / 2, W / 2], [W / 2, d / 2]])  # the dressed pair in the rotating frame, d, W in rad/s
ev = np.linalg.eigvalsh(Hd(1.0 * Na.g, Na.g * np.sqrt(2.0 / 2)))
step = np.sqrt(hbar * Na.g / Na.M) / (hbar * Na.k**2 / (2 * Na.M))
steps = (0.01 / (np.sqrt(hbar * Na.g / Na.M) / (hbar * Na.k**2 / (2 * Na.M)))) ** 2
gRNa = hbar * Na.k**2 / (2 * Na.M)
o2 = {
    "o2BetaK2": rnd(b1 / (hbar * Na.k**2), 3),
    "o2VcNa": rnd(vc, 2),
    "o2PeakVel": rnd(pk / (Na.g / Na.k), 3),
    "o2LinErrVc": rnd(lin(vc), 2),
    "o2LinErrHalf": rnd(lin(vc / 2), 3),
    "o2TDNa": rnd(td(Na) * 1e6, 0),
    "o2TAtGamma": rnd(Tss(-1.0) / td(Na), 2),
    "o2DiffTemp": rnd((hbar * Na.k) ** 2 * 2 * (Na.g / 2 * 0.01 / (1 + 0.01 + 1)) / bd / kB / td(Na), 3),
    "o2RbVc": rnd(Rb.g / (2 * Rb.k), 2),
    "o2RbDvCms": rnd(Rb_dv * 100, 1),
    "o2RbCompress": rnd(np.sqrt(Rb.g / Rb_gR), 1),
    "o2RbGOverGR": rnd(Rb.g / Rb_gR, 0),
    "o2RbDxUm": rnd(Rb.g / (2 * Rb.k * Rb_gR) * 1e6, 1),
    "o2RbTimeUs": rnd(2 * (Rb.g / (2 * Rb.k)) / amax(Rb) * 1e6, 0),
    "o2DressedOmega": rnd((ev[1] - ev[0]) / Na.g, 3),
    "o2WalkStepNa": rnd(step * 1e6, 2),
    "o2WalkStepsNa": rnd(steps / 1e6, 1),
    "o2WalkTimeNa": rnd(steps / gRNa, 0),
}

# ------------------------------------------------------------------------------------ O3
cg2 = lambda Jg, mg, q: float(CG(Rational(Jg), Rational(mg), 1, q, Rational(Jg) + 1, Rational(mg) + q).doit() ** 2)
dRb = -4.0 * Rb.g
U1 = 2 * hbar * dRb * 0.5 / (1 + 4 * dRb**2 / Rb.g**2)
zz = np.linspace(0, 0.5, 5001)
Up = U1 * (1 / 3 + 2 / 3 * np.cos(2 * np.pi * zz) ** 2)
best = optimize.minimize_scalar(lambda s: -(8 * 0.5 * s / (2 + s) ** 2), bounds=(0.01, 50), method="bounded", options={"xatol": 1e-12})
fr_max = -best.fun * hbar * Rb.k**2
wz = (1 / 3) * muB * 1e-4 / hbar
o3 = {
    "o3CGUp": cg2(Rational(1, 2), Rational(1, 2), 1),
    "o3CGDown": cg2(Rational(1, 2), -Rational(1, 2), 1),
    "o3U1": rnd(abs(U1) / kB * 1e6, 1),
    "o3HillDepth": rnd((Up.max() - Up.min()) / kB * 1e6, 1),
    "o3FrictionRatio": rnd(hbar * Rb.k**2 * 4.0 / fr_max, 0),
    "o3MilcLow": rnd((1 / 3) * muB * 1e-5 / hbar / Rb85.k * 100, 2),
    "o3VDRb": rnd(np.sqrt(7 * hbar * Rb.g / (20 * Rb.M)) * 100, 2),
    "o3CGOne": cg2(1, 1, 1),
    "o3CGSix": cg2(1, 1, 1) / cg2(1, 1, -1),
    "o3ZeemanMHzG": rnd(wz / (2 * np.pi) / 1e6, 3),
    "o3VsrSigma": rnd(wz / Rb85.k * 100, 1),
    "o3VsrLin": rnd(wz / (2 * Rb85.k) * 100, 1),
    "o3CLin": 0.125,
    "o3CSigma": 0.097,
    "o3TlimLin": rnd(0.125 * abs(U1) / kB * 1e6, 2),
    "o3TlimSigma": rnd(0.097 * abs(U1) / kB * 1e6, 2),
    "o3CsTD": rnd(td(Cs) * 1e6, 1),
    "o3CsTR": rnd(tr(Cs) * 1e9, 0),
    "o3CsTDoverTR": rnd(td(Cs) / tr(Cs), 0),
    "o3NaTRMicroK": rnd(tr(Na) * 1e6, 2),
}

# ------------------------------------------------------------------------------------ O4
a_tr = muB / Na.M
rho = 0.01
v_orb, T_orb = np.sqrt(rho * a_tr), 2 * np.pi * np.sqrt(rho / a_tr)
orb = lambda t, y: [y[2], y[3], -a_tr * y[0] / np.hypot(y[0], y[1]), -a_tr * y[1] / np.hypot(y[0], y[1])]
sol = integrate.solve_ivp(orb, [0, 2 * T_orb], [rho, 0, 0, v_orb], rtol=1e-12, atol=1e-14, dense_output=True)
tt = np.linspace(0, 2 * T_orb, 40001)
yy = sol.sol(tt)
period = 2 * np.pi / np.polyfit(tt, np.unwrap(np.arctan2(yy[1], yy[0])), 1)[0]
zs = np.sort(np.concatenate([-special.ai_zeros(4)[0], -special.ai_zeros(4)[1]]))[:3]
scale = (hbar**2 * muB**2 / (2 * Na.M)) ** (1 / 3)
E1 = (Na.M * (a_tr * hbar) ** 2) ** (1 / 3)
o4 = {
    "o4GaussUK": rnd(muB * 1e-4 / kB * 1e6, 1),
    "o4DepthmK": rnd(muB * 0.02 / kB * 1e3, 1),
    "o4TrapAccel": rnd(a_tr, 0),
    "o4OrbitV": rnd(v_orb, 2),
    "o4OrbitT": rnd(period * 1e3, 1),
    "o4RhoMin": rnd((hbar**2 / (Na.M**2 * a_tr)) ** (1 / 3) * 1e6, 3),
    "o4VMin": rnd((hbar * a_tr / Na.M) ** (1 / 3) * 100, 3),
    "o4OrbitN": rnd(Na.M * v_orb * rho / hbar / 1e6, 2),
    "o4E1kHz": rnd(E1 / h / 1e3, 2),
    "o4AiryE1kHz": rnd(zs[0] * scale / h / 1e3, 2),
    "o4AiryE2kHz": rnd(zs[1] * scale / h / 1e3, 2),
    "o4AiryE3kHz": rnd(zs[2] * scale / h / 1e3, 2),
    "o4AiryRatio21": rnd(zs[1] / zs[0], 3),
    "o4HeurRatio21": rnd(2 ** (2 / 3), 3),
}

# ------------------------------------------------------------------------------------ O5
mp.mp.dps = 50
sG, dG = mp.mpf("2e8"), mp.mpf("-1e6") * mp.mpf(Na.g)
depth = float(mp.mpf(hbar) * (mp.sqrt(mp.mpf(Na.g) ** 2 * sG / 2 + dG**2) - abs(dG)) / 2)
rate = Na.g / 2 * 2e8 / (1 + 2e8 + (2 * -1e6) ** 2)
Ub, ER = abs(U1) * 2 / 3, hbar**2 * Rb.k**2 / (2 * Rb.M)
d_m = -1.0 * Rb.g


def Fmot(z, v):
    sh = Rb.k * v + muB * 0.1 * z / hbar
    return hbar * Rb.k * Rb.g / 2 * (1 / (1 + 1 + (2 * (d_m - sh) / Rb.g) ** 2) - 1 / (1 + 1 + (2 * (d_m + sh) / Rb.g) ** 2))


kap = -(Fmot(1e-6, 0) - Fmot(-1e-6, 0)) / 2e-6
bet = -(Fmot(0, 1e-3) - Fmot(0, -1e-3)) / 2e-3
vcap = np.sqrt(2 * amax(Cs) * 0.03)


def mb_below(v, T, M):
    f = lambda w: 4 * np.pi * w**2 * (M / (2 * np.pi * kB * T)) ** 1.5 * np.exp(-M * w**2 / (2 * kB * T))
    return integrate.quad(f, 0, v, epsabs=0, epsrel=1e-13)[0]


o5 = {
    "o5DipoleDepthmK": rnd(depth / kB * 1e3, 2),
    "o5DipoleRate": rnd(rate, 0),
    "o5HeatTimeS": rnd(depth / (2 * (hbar**2 * Na.k**2 / (2 * Na.M)) * rate), 2),
    "o5DeBroglieHalf": rnd(h / (2 * hbar * Na.k) / Na.lam, 1),
    "o5LatticeVibkHz": rnd(2 * np.sqrt(Ub * ER) / h / 1e3, 1),
    "o5LatticeVibER": rnd(2 * np.sqrt(Ub / ER), 1),
    "o5MotKappaOverBeta": rnd(kap / bet, 0),
    "o5MotFreqHz": rnd(np.sqrt(kap / Rb.M) / (2 * np.pi), 0),
    "o5MotSizeMm": rnd(hbar * abs(d_m) / (muB * 0.1) * 1e3, 2),
    "o5CsCaptureMs": rnd(vcap, 1),
    "o5CsCaptureEK": rnd(Cs.M * vcap**2 / 2 / kB, 1),
    "o5CsDensity": rnd(1e-5 * torr / (kB * 300) / 1e6 / 1e11, 2),
    "o5Frac1K": rnd(mb_below(np.sqrt(2 * kB * 1.0 / Cs.M), 300, Cs.M) / 1e-4, 2),
    "o5FracRatio": rnd(mb_below(10.0, 300, Cs.M) / mb_below(5.0, 300, Cs.M), 2),
}

# ------------------------------------------------------------------------------------ O6
def langevin(n, Cn, m, ell):
    L = ell * (ell + 1)
    V = lambda R: -Cn / R**n + hbar**2 * L / (2 * m * R**2)
    g = (m * n * Cn / (hbar**2 * L)) ** (1 / (n - 2))
    r = optimize.minimize_scalar(lambda R: -V(R), bracket=(0.5 * g, g, 2 * g), tol=1e-14)
    return r.x, -r.fun


mNa, C6Na = Na.M / 2, 1556 * AU
Rc, Vc = langevin(6, C6Na, mNa, 1)
TQ = lambda n, Cn, m: optimize.brentq(lambda T: (n * m * Cn / hbar**2) * (3 * kB * T / ((n - 2) * Cn)) ** ((n - 2) / n) - 2.0, 1e-9, 10.0, xtol=1e-18, rtol=1e-14)


def sigma(E):
    f = lambda lL: langevin(6, C6Na, mNa, np.exp(lL))[1] - E
    ell = np.exp(optimize.brentq(f, np.log(1e-8), np.log(1e4), xtol=1e-14))
    return np.pi * (hbar * np.sqrt(ell * (ell + 1)) / np.sqrt(2 * mNa * E)) ** 2


slope = (np.log(sigma(2e-30)) - np.log(sigma(1e-30))) / np.log(2)
Tf = 2 * np.sqrt(2 * 0.15 / g0)
vcav = g0 * Tf / 2
def fwhm(T):
    nu = np.linspace(-1.0 / T, 1.0 / T, 800001)
    p = np.cos(np.pi * nu * T) ** 2
    inside = nu[(p >= 0.5) & (np.abs(nu) < 0.5 / T)]
    return float(inside.max() - inside.min())


lam_db = lambda M, T: h / np.sqrt(2 * np.pi * M * kB * T)
dopw = lambda T: 2 / Na.lam * np.sqrt(2 * np.log(2) * kB * T / Na.M)
o6 = {
    "o6FountainT": rnd(Tf, 3),
    "o6RamseyFountain": rnd(fwhm(Tf), 2),
    "o6BeamT": rnd(3 / 500 * 1e3, 0),
    "o6RamseyBeam": rnd(fwhm(3 / 500), 1),
    "o6Doppler2Fountain": rnd(vcav**2 / (2 * c**2) / 1e-17, 2),
    "o6PrecRatio": rnd(1.5e-3 / HFS / 1e-13, 2),
    "o6PrecTenMinus12mHz": rnd(1e-12 * HFS * 1e3, 1),
    "o6RcNm": rnd(Rc * 1e9, 2),
    "o6VcNaUK": rnd(Vc / kB * 1e6, 0),
    "o6TQNa": rnd(TQ(6, C6Na, mNa) * 1e3, 3),
    "o6TQCs": rnd(TQ(6, 6860 * AU, Cs.M / 2) * 1e6, 1),
    "o6Slope": rnd(-slope, 3),
    "o6SlopeB": rnd(-slope / 2, 3),
    "o6BarrierRatio": rnd(Vc / Vc * ((6 - 2) / 2) * (hbar**2 * 2 / (6 * mNa)) ** (6 / 4) * C6Na ** (-2 / 4) / Vc, 6),
    "o6NaFineK": rnd(17 * 100 * h * c / kB, 1),
    "o6CsHfsGHz": rnd(HFS / 1e9, 2),
    "o6CsHfsmK": rnd(h * HFS / kB * 1e3, 0),
    "o6CsKick": rnd(np.sqrt(h * HFS / Cs.M), 2),
    "o6BounceMs": rnd(2 * np.sqrt(2 * 0.003 / g0) * 1e3, 1),
    "o6KDAngle": rnd(2 * hbar * Na.k / (Na.M * 1000.0) * 1e6, 1),
    "o6LamdBTD": rnd(lam_db(Na.M, td(Na)) * 1e9, 1),
    "o6LamdB1uK": rnd(lam_db(Na.M, 1e-6) * 1e9, 0),
    "o6DopplerGHz": rnd(dopw(300) / 1e9, 2),
    "o6DopplerTDMHz": rnd(dopw(td(Na)) / 1e6, 2),
    "o6NaNaturalMHz": rnd(Na.g / (2 * np.pi) / 1e6, 2),
}

OUT.mkdir(parents=True, exist_ok=True)
ABOUT = {
    1: "Claim values for the Optics Lab page O1 (slowing a sodium beam), numpy/scipy routes (ODE, quadrature, numeric derivative).",
    2: "Claim values for the Optics Lab page O2 (optical molasses), numpy/scipy routes (numeric derivative, bounded minimisation, eigenvalues).",
    3: "Claim values for the Optics Lab page O3 (below the Doppler limit), sympy Clebsch-Gordan and numpy routes.",
    4: "Claim values for the Optics Lab page O4 (magnetic traps), ODE orbit period and scipy Airy zeros.",
    5: "Claim values for the Optics Lab page O5 (traps made of light), mpmath depth, numeric MOT derivatives and quadrature.",
    6: "Claim values for the Optics Lab page O6 (applications), bounded minimisation, brentq and numeric fringe widths.",
}
for k, vals in enumerate([o1, o2, o3, o4, o5, o6], start=1):
    (OUT / f"o{k}.json").write_text(json.dumps({"about": ABOUT[k] + " Regenerate: python3 pipeline/claims_optics/o.py", "values": vals}, indent=1, ensure_ascii=False) + "\n")
    print(f"wrote o{k}.json ({len(vals)} values)")
