#!/usr/bin/env python3
"""Numpy twin of Physics 448 Lecture 19 (quantum tunnelling through a finite barrier): every claim key of app/src/content/L19.values.ts.

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - the stationary state is the four MATCHING CONDITIONS as a 4 x 4 complex linear system (np.linalg.solve, unknowns r, A, B, tau; Townsend Eq. 6.143 in the notes' notation), never the
    closed form tau = e^{-ika}/(cosh + i eps sinh); the closed forms of the notes (the boxed T, the thick form) are asserted equal to the solve before anything is written;
  - the currents are Im(conj(u) u') of the waves on each side and inside; the fringe extremes are the max and min of |psi|^2 on a fine grid of the solved state;
  - T of a heavy particle (the proton, kappa a = 21.9) is the sinh closed form, because a 4 x 4 solve with entries e^{21.9} is conditioned too badly for a 1e-12 comparison of its log
    (asserted equal to the solve for the electron and, to 1e-6 relative, for the proton); the E -> V0 value is the same closed form at the same E;
  - the delta-barrier limit is the 4 x 4 solve at V0 = g/2a (a = 0.1, 0.01, 0.001), the delta barrier itself the closed form of the notes (a jump of psi' of g psi(0));
  - the Gamow exponent is scipy quad of sqrt(2 m c^2 (K/r - E))/hbar c and, separately, the arccos closed form (agree to 1e-8; the closed form is written out here);
  - the momentum averages of the packet are scipy quad of the Gaussian momentum density times T(p) of the solve (T above the top by the same solve with a complex wave number);
  - the width for T = 1 % is brentq on the solve.
The equations of the notes (the ansatz, the four conditions, A and B, the elimination, the boxed T and the thick form) are asserted first, so a misread formula fails here.

Usage (from the repo root): python3 pipeline/claims_448/l19.py -> app/src/physics/__fixtures__/claims-448/l19.json (every claim key). Run it twice: byte-identical.
Checked by app/src/content/claims.test.ts (engine value per key at 1e-12).
"""
import json
from math import pi
from pathlib import Path

import numpy as np
from scipy.integrate import quad
from scipy.optimize import brentq, minimize_scalar

ROOT = Path(__file__).resolve().parent.parent.parent
out = {}


def put(k, v):
    v = float(v)
    out[k] = 0.0 if abs(v) < 1e-12 else v


# ---- SI constants (CODATA 2018, the engine's) and the electron's hbar^2/2m in eV angstrom^2 ----
h_pl = 6.62607015e-34
e_ch = 1.602176634e-19
m_e = 9.1093837015e-31
m_p = 1.67262192369e-27
hbar_si = h_pl / (2 * pi)
HB2M = hbar_si**2 / (2 * m_e) / e_ch * 1e20  # 3.80998 eV A^2


# ------------------------------------------------------------------ the barrier: the four matching conditions as a 4 x 4 system, incident amplitude 1; unknowns r, A, B, tau
def solve4(E, V0, a, hb2m=0.5):
    k = np.sqrt(E / hb2m + 0j)
    q = np.sqrt((V0 - E) / hb2m + 0j)
    ea, ei, eik = np.exp(q * a), np.exp(-q * a), np.exp(1j * k * a)
    M = np.array(
        [
            [1, -1, -1, 0],  # r - A - B = -1
            [-1j * k, -q, q, 0],  # -ik r - q A + q B = -ik
            [0, ea, ei, -eik],  # A e^{qa} + B e^{-qa} = tau e^{ika}
            [0, q * ea, -q * ei, -1j * k * eik],  # q (A e^{qa} - B e^{-qa}) = ik tau e^{ika}
        ],
        complex,
    )
    r, A, B, tau = np.linalg.solve(M, np.array([-1, -1j * k, 0, 0], complex))
    return k, q, r, A, B, tau


def T_solve(E, V0, a, hb2m=0.5):
    return abs(solve4(E, V0, a, hb2m)[5]) ** 2


def T_closed(E, V0, a, hb2m=0.5):
    """Townsend (6.144): 1/(1 + ((k^2 + q^2)/2kq)^2 sinh^2 qa), E below the top."""
    k, q = np.sqrt(E / hb2m), np.sqrt((V0 - E) / hb2m)
    return 1 / (1 + ((k * k + q * q) / (2 * k * q)) ** 2 * np.sinh(q * a) ** 2)


def T_notes(E, V0, a, hb2m=0.5):
    """The notes' boxed form: [1 + V0^2 (e^{qa} - e^{-qa})^2 / 16 E (V0 - E)]^-1."""
    q = np.sqrt((V0 - E) / hb2m)
    return 1 / (1 + V0**2 * (np.exp(q * a) - np.exp(-q * a)) ** 2 / (16 * E * (V0 - E)))


def T_thick(E, V0, a, hb2m=0.5):
    """Eq. 6.146: (4kq/(k^2 + q^2))^2 e^{-2qa}."""
    k, q = np.sqrt(E / hb2m), np.sqrt((V0 - E) / hb2m)
    return (4 * k * q / (k * k + q * q)) ** 2 * np.exp(-2 * q * a)


# the equations of the notes against the solve: A and B (page 4), tau (page 5), the boxed T (page 6), the identity of page 7
for E_, V_, a_ in [(2.0, 4.0, 0.5), (1.0, 4.0, 2.0), (3.0, 3.5, 0.7)]:
    k_, q_, r_, A_, B_, t_ = solve4(E_, V_, a_)
    eika = np.exp(1j * k_ * a_)
    assert abs(A_ - t_ * eika / 2 * (1 + 1j * k_ / q_) * np.exp(-q_ * a_)) < 1e-12  # A = t e^{ika}/2 (1 + ik/kappa) e^{-kappa a}
    assert abs(B_ - t_ * eika / 2 * (1 - 1j * k_ / q_) * np.exp(q_ * a_)) < 1e-12  # B = t e^{ika}/2 (1 - ik/kappa) e^{+kappa a}
    den = 2 * (np.exp(q_ * a_) + np.exp(-q_ * a_)) + 1j * (q_ / k_ - k_ / q_) * (np.exp(q_ * a_) - np.exp(-q_ * a_))
    assert abs(t_ - 4 * np.exp(-1j * k_ * a_) / den) < 1e-12  # the notes' t (our tau)
    assert abs(T_solve(E_, V_, a_) - T_closed(E_, V_, a_)) < 1e-12
    assert abs(T_solve(E_, V_, a_) - T_notes(E_, V_, a_)) < 1e-12
    assert abs(abs(r_) ** 2 + abs(t_) ** 2 - 1) < 1e-12
    assert abs((q_ / k_ + k_ / q_) ** 2 - V_**2 / (E_ * (V_ - E_))) < 1e-12  # the identity of page 7

# ---- the scene: E = 2, V0 = 4 (k = kappa = 2); a = 1/2 (kappa a = 1) and a = 1 (kappa a = 2)
k, q, r, A, B, tau = solve4(2.0, 4.0, 0.5)
k2_, q2_, r2_, A2_, B2_, tau2_ = solve4(2.0, 4.0, 1.0)
put('l19KS', k.real)
put('l19KappaS', q.real)
put('l19RatioBA2', abs(B2_) / abs(A2_))
# the residual of the four conditions, from the solve itself
res = max(
    abs(1 + r - A - B),
    abs(1j * k * (1 - r) - q * (A - B)),
    abs(A * np.exp(q * 0.5) + B * np.exp(-q * 0.5) - tau * np.exp(1j * k * 0.5)),
    abs(q * (A * np.exp(q * 0.5) - B * np.exp(-q * 0.5)) - 1j * k * tau * np.exp(1j * k * 0.5)),
)
assert res < 1e-12
put('l19MatchResidual', res)
put('l19AbsA', abs(A))
put('l19AbsB', abs(B))
put('l19AbsT', abs(tau))
put('l19PhaseTMag', abs(np.degrees(np.angle(tau))))
# the L18 route: carry value and slope back from x = a (phi(a) = F, phi'(a) = ik F); T = |F/A|^2 with 2A = phi(0) + phi'(0)/ik
F = 1.0
u0 = F * np.cosh(q * 0.5) - 1j * k / q * F * np.sinh(q * 0.5) * 1  # phi(0) with phi(a) = F e^{ika} stripped, as the notes' App. A
du0 = F * (-q * np.sinh(q * 0.5) + 1j * k * np.cosh(q * 0.5))
Aamp = (u0 + du0 / (1j * k)) / 2
put('l19L18Route', 1 / abs(Aamp) ** 2)
put('l19R1', abs(r) ** 2)
put('l19RplusT', abs(r) ** 2 + abs(tau) ** 2)
# the density of the state: the extremes left of the barrier, on a fine grid over many wavelengths
xs = np.linspace(-40, 0, 400001)
psiL = np.exp(1j * k * xs) + r * np.exp(-1j * k * xs)
dens = np.abs(psiL) ** 2
dens_at = lambda x_: abs(np.exp(1j * k * x_) + r * np.exp(-1j * k * x_)) ** 2
imax, imin = int(dens.argmax()), int(dens.argmin())
fmax = minimize_scalar(lambda x_: -dens_at(x_), bounds=(xs[imax - 1], xs[imax + 1]), method='bounded', options={'xatol': 1e-13})
fmin = minimize_scalar(dens_at, bounds=(xs[imin - 1], xs[imin + 1]), method='bounded', options={'xatol': 1e-13})
put('l19FringeMax', -fmax.fun)
put('l19FringeMin', fmin.fun)
assert abs(-fmax.fun - (1 + abs(r)) ** 2) < 1e-9 and abs(fmin.fun - (1 - abs(r)) ** 2) < 1e-9


def cur(u, du):
    """The current Im(conj(u) du) (hbar = m = 1)."""
    return (np.conj(u) * du).imag


# left: psi = e^{ikx} + r e^{-ikx} at x = 0; inside at 0; right at a
uL, duL = 1 + r, 1j * k * (1 - r)
uI, duI = A + B, q * (A - B)
uR, duR = tau * np.exp(1j * k * 0.5), 1j * k * tau * np.exp(1j * k * 0.5)
assert abs(cur(uL, duL) - cur(uI, duI)) < 1e-12 and abs(cur(uI, duI) - cur(uR, duR)) < 1e-12
put('l19CurrentLeft', cur(uL, duL))
put('l19Identity', (q.real / k.real + k.real / q.real) ** 2)
put('l19FormDiff', abs(T_notes(2.0, 4.0, 0.5) - T_closed(2.0, 4.0, 0.5)))

# ---- unit 4: reading T (E = V0/2, so T = 1/cosh^2 kappa a)
Tka = lambda x: T_solve(2.0, 4.0, x / 2.0)
Tka_thick = lambda x: T_thick(2.0, 4.0, x / 2.0)
for x_ in (0.5, 1.0, 2.0, 3.0):
    assert abs(Tka(x_) - 1 / np.cosh(x_) ** 2) < 1e-12
put('l19ThickRatio2', Tka(2) / Tka_thick(2))
put('l19ThickRatio3', Tka(3) / Tka_thick(3))
put('l19T15', Tka(1.5))
put('l19DoubleFactor', Tka(3) / Tka(1.5))
put('l19LogSlopeMag', -(np.log(Tka(4)) - np.log(Tka(3))) / (1 / 2.0))
put('l19TwoKappa', 2 * q.real)
put('l19KappaV8', np.sqrt((8.0 - 2.0) / 0.5))
put('l19TV8', T_solve(2.0, 8.0, 0.5))
# the electron and the proton, in eV and angstrom: hbar^2/2m = HB2M (electron), HB2M/(m/m_e) (proton)
ratio_p = m_p / m_e
put('l19KappaEl', np.sqrt(1.0 / HB2M))
put('l19KappaPr', np.sqrt(1.0 / (HB2M / ratio_p)))
put('l19MassKappaRatio', np.sqrt(ratio_p))
put('l19TElectron', T_solve(1.0, 2.0, 1.0, HB2M))
Tp = T_closed(1.0, 2.0, 1.0, HB2M / ratio_p)
assert abs(T_solve(1.0, 2.0, 1.0, HB2M / ratio_p) - Tp) / Tp < 1e-6
put('l19TProtonLog10Mag', -np.log10(Tp))
# E -> V0: ka = 2 with V0 = 2 (k = 2 at E = 2), E = V0 (1 - 1e-9) and 0.999 V0: the closed form at that E (the limit 1/(1 + k^2 a^2/4) = 1/2)
put('l19LimitT', T_closed(2.0 * (1 - 1e-9), 2.0, 1.0))
put('l19LimitT999', T_closed(2.0 * 0.999, 2.0, 1.0))
assert abs(T_closed(2.0 * (1 - 1e-9), 2.0, 1.0) - 0.5) < 1e-8
# Townsend p. 231: 1 g, 1 erg, 1 cm in CGS: kappa a = sqrt(2 m (V0 - E)) a / hbar, hbar = 1.054571817e-27 erg s
put('l19MacroKappaA', np.sqrt(2 * 1.0 * 1.0) * 1.0 / (hbar_si * 1e7) / 1e27)

# ---- unit 5: energy and examples
put('l19EnergyOut', k.real**2 / 2)  # E = k^2/2 outside
put('l19EnergyIn', 4.0 - q.real**2 / 2)  # E = V0 - kappa^2/2 inside
# scanning tunnelling: kappa = sqrt(phi/HB2M); the exact ratio of the barrier solve at 6 A to 5 A, and the thick form
kap = np.sqrt(4.0 / HB2M)
put('l19StmKappa', kap)
put('l19StmFactorExact', T_solve(4.0, 8.0, 6.0, HB2M) / T_solve(4.0, 8.0, 5.0, HB2M))
put('l19StmFactorThick', T_thick(4.0, 8.0, 6.0, HB2M) / T_thick(4.0, 8.0, 5.0, HB2M))
put('l19StmDecade', np.log(10) / (2 * kap))
assert abs(out['l19StmFactorThick'] - np.exp(-2 * kap)) < 1e-12
# alpha decay (a MODEL): a point alpha, daughter Z = 90, R = 7.4 fm; K = 2 Z e^2
hc, ke2, mc2 = 197.3269804, 1.439964548, 3727.379378
Kc, Rn = 2 * 90 * ke2, 7.4


def gamow_quad(E):
    b = Kc / E
    val, _ = quad(lambda x: np.sqrt(max(0.0, 2 * mc2 * (Kc / x - E))) / hc, Rn, b, epsabs=1e-13, epsrel=1e-13, limit=500)
    return 2 * val, b


def gamow_closed(E):
    b = Kc / E
    x = Rn / b
    return 2 * np.sqrt(2 * mc2 * E) / hc * b * (np.arccos(np.sqrt(x)) - np.sqrt(x * (1 - x)))


for E_ in (4.27, 8.0):
    assert abs(gamow_quad(E_)[0] - gamow_closed(E_)) < 1e-8
G4_, b4_ = gamow_quad(4.27)
G8_, _ = gamow_quad(8.0)
put('l19TurnB4', b4_)
put('l19Gamow4', gamow_closed(4.27))
put('l19Gamow8', gamow_closed(8.0))
put('l19GamowFactor10', (gamow_closed(4.27) - gamow_closed(8.0)) / np.log(10))
# the delta barrier (Townsend Problem 6.21): the jump of psi' is g psi(0); T = 1/(1 + g^2/4k^2); the exact barrier of the same strength V0 a (V0 = g/2a) tends to it
dT = lambda g, kk: 1 / (1 + g * g / (4 * kk * kk))
put('l19DeltaTexact', dT(3.0, 2.0))
for tag, a_ in (('l19DeltaTw1', 0.1), ('l19DeltaTw2', 0.01), ('l19DeltaTw3', 0.001)):
    put(tag, T_solve(2.0, 3.0 / (2 * a_), a_))
assert abs(T_solve(2.0, 3.0 / 0.0002, 0.0001) - dT(3.0, 2.0)) < 1e-4
# the momentum density of the packet (sigma = 5/2, p0 = 2): N(p0, 1/2 sigma); the kinetic energy of the whole, and of the part the barrier transmits or turns back


def weighted(p0, sig, fun):
    sd = 1 / (2 * sig)
    dens_ = lambda p: np.exp(-((p - p0) ** 2) / (2 * sd * sd)) / (np.sqrt(2 * pi) * sd)
    lo, hi = max(1e-9, p0 - 14 * sd), p0 + 14 * sd
    return quad(lambda p: dens_(p) * fun(p), lo, hi, epsabs=1e-14, epsrel=1e-13, limit=500)[0]


put('l19IncMeanKin', weighted(2.0, 2.5, lambda p: p * p / 2))
assert abs(weighted(2.0, 2.5, lambda p: 1.0) - 1) < 1e-12
Tp_ = lambda p: T_solve(p * p / 2, 4.0, 0.5)
num = weighted(2.0, 2.5, lambda p: Tp_(p) * p * p / 2)
put('l19TransKinMean', num / weighted(2.0, 2.5, Tp_))
numR = weighted(2.0, 2.5, lambda p: (1 - Tp_(p)) * p * p / 2)
put('l19ReflKinMean', numR / weighted(2.0, 2.5, lambda p: 1 - Tp_(p)))

# ---- challenges and practice
put('l19PhaseT75Lag', -np.degrees(np.angle(solve4(2.0, 4.0, 0.75)[5])))
put('l19PrDelta', dT(2.5, 1.5))
put('l19PrWidth', brentq(lambda a_: T_solve(3.0, 7.0, a_, HB2M) - 0.01, 0.1, 10.0, xtol=1e-14, rtol=1e-14))
put('l19PrStm', T_solve(5.0, 10.1, 5.5, HB2M) / T_solve(5.0, 10.1, 5.0, HB2M))

(ROOT / 'app/src/physics/__fixtures__/claims-448').mkdir(parents=True, exist_ok=True)
with open(ROOT / 'app/src/physics/__fixtures__/claims-448/l19.json', 'w') as f:
    json.dump({'about': 'Physics 448 Lecture 19: numpy twins of every L19.values.ts key (pipeline/claims_448/l19.py)', 'values': {k_: out[k_] for k_ in sorted(out)}}, f, indent=1, sort_keys=True)
    f.write('\n')
print(len(out), 'keys')
