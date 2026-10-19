#!/usr/bin/env python3
"""claims_448/g4a.py : numpy twins of every claim key of the Townsend pass for Lectures 11 and 12 (G4a), by routes independent of the engine.
numpy only; no repo imports. Conventions: |0> = |+z>, hbar = 1, energies in a unit eps (L11) or frequencies in units of omega_0 (L12).
Run:  python3 pipeline/claims_448/g4a.py  (from the repo root) -> asserts the digest transcriptions, writes
      app/src/physics/__fixtures__/claims-448/g4a.json ({"about", "values"}) and app/src/physics/__fixtures__/dynamics-g4a.json (engine twin tables);
      twice, byte-identical.
"""
import json
from pathlib import Path

import numpy as np

print = lambda *a, **k: None  # quiet: the output is the JSON files

DEG = np.pi / 180
I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
k = np.kron
pz, mz = np.array([1, 0], dtype=complex), np.array([0, 1], dtype=complex)
px, mx = (pz + mz) / np.sqrt(2), (pz - mz) / np.sqrt(2)
py, my = (pz + 1j * mz) / np.sqrt(2), (pz - 1j * mz) / np.sqrt(2)
OUT = {}
ENG = {}


def put(key, val):
    OUT[key] = float(np.real(val))
    print(f"{key:22s} = {OUT[key]:.10g}")


def U(H, t):
    """e^{-iHt} by the eigendecomposition of the Hermitian H (the engine uses the closed 2x2 exponential)."""
    w, v = np.linalg.eigh(H)
    return (v * np.exp(-1j * w * t)) @ v.conj().T


def bisect(f, lo, hi, n=200):
    """root of f on [lo, hi] (f(lo), f(hi) of opposite sign)"""
    flo = f(lo)
    for _ in range(n):
        mid = 0.5 * (lo + hi)
        fm = f(mid)
        if (fm > 0) == (flo > 0):
            lo, flo = mid, fm
        else:
            hi = mid
    return 0.5 * (lo + hi)


# ---------------------------------------------------------------- digest checks (Townsend equations)
# (4.48) / (4.51) / (4.52-4.53): ammonia pair H = [[E0, -A], [-A, E0]], E = E0 -/+ A, |I>,|II> = (|1> +/- |2>)/sqrt2
E0, A = 2.0, 1.0
Hamm = np.array([[E0, -A], [-A, E0]], dtype=complex)
w, v = np.linalg.eigh(Hamm)
assert np.allclose(w, [E0 - A, E0 + A]), "4.51"
sI, sII = (pz + mz) / np.sqrt(2), (pz - mz) / np.sqrt(2)
assert np.allclose(Hamm @ sI, (E0 - A) * sI) and np.allclose(Hamm @ sII, (E0 + A) * sII), "4.52-4.53"
# (4.54) |1> = (|I> + |II>)/sqrt2 and (4.56) |psi(T/2)> = overall phase * |2> with T = pi hbar/A
assert np.allclose((sI + sII) / np.sqrt(2), pz), "4.54"
T = np.pi / A
psiT2 = U(Hamm, T / 2) @ pz
assert np.isclose(abs(np.vdot(mz, psiT2)), 1.0), "4.56"
# (4.19) U(t) = R(phi k) for H = omega0 S_z ; (4.20-4.30) the +x start: P(+x) = cos^2(w t/2), <Sx> = cos(w t)/2, <Sy> = sin(w t)/2
w0 = 0.7
for t in (0.4, 1.3, 2.9):
    Rz = np.diag([np.exp(-1j * w0 * t / 2), np.exp(1j * w0 * t / 2)])
    assert np.allclose(U(w0 * Z / 2, t), Rz), "4.19"
    psi = U(w0 * Z / 2, t) @ px
    assert np.isclose(abs(np.vdot(px, psi)) ** 2, np.cos(w0 * t / 2) ** 2), "4.25"
    assert np.isclose(np.real(np.vdot(psi, X / 2 @ psi)), 0.5 * np.cos(w0 * t)), "4.28"
    assert np.isclose(np.real(np.vdot(psi, Y / 2 @ psi)), 0.5 * np.sin(w0 * t)), "4.30"
    assert np.isclose(abs(np.vdot(py, psi)) ** 2, (1 + np.sin(w0 * t)) / 2), "4.29a"

# ---------------------------------------------------------------- Lecture 11 claim keys
Hex = np.diag([3.0, 1.0]).astype(complex)  # the lecture's example: E+ = 3 eps, E- = eps
# D11.1: U(a + b) = U(b) U(a) ; i dU/dt = H U
put("l11TComposeGap", np.max(np.abs(U(Hex, 0.75) - U(Hex, 0.45) @ U(Hex, 0.3))))
ok = True
for t in (0.2, 0.9, 1.7):
    h = 1e-5
    dU = (U(Hex, t + h) - U(Hex, t - h)) / (2 * h)
    ok &= np.max(np.abs(dU - (-1j) * Hex @ U(Hex, t))) < 1e-8
assert ok
put("l11TOpEq", 1.0 if ok else 0.0)
# D11.2: <H> constant for a generic superposition
g = np.array([np.cos(20 * DEG), np.sin(20 * DEG) * np.exp(0.7j)], dtype=complex)
e0 = np.real(np.vdot(g, Hex @ g))
put("l11TEnergyConstGap", max(abs(np.real(np.vdot(U(Hex, t) @ g, Hex @ (U(Hex, t) @ g))) - e0) for t in (0.4, 1.1, 2.5, 4.0)))
# Townsend 4.19: H = omega0 S_z gives exactly the rotation (no overall phase); asserted above for three times
put("l11TUisRotation", 1.0)
# ammonia (E0 = 2, A = 1 matches the lecture's 3 eps and eps)
put("l11TAmmLow", w[0])
put("l11TAmmHigh", w[1])


def p_above(t):
    return abs(np.vdot(pz, U(Hamm, t) @ pz)) ** 2


def p_below(t):
    return abs(np.vdot(mz, U(Hamm, t) @ pz)) ** 2


def p_px(t):
    return abs(np.vdot(px, U(Hex, t) @ px)) ** 2


put("l11TAmmSameAsClocks", max(abs(p_above(t) - p_px(t)) for t in (0.1, 0.4, 0.8, 1.3, 2.2, 3.0)))
tq = bisect(lambda t: p_below(t) - 0.5, 0.0, np.pi / 2 - 1e-3)  # the half-way crossing (slope nonzero)
put("l11TAmmFlipDeg", 2 * tq / DEG)  # the flip takes twice the time to the half-way crossing
put("l11TAmmBelowAtFlip", p_below(np.pi / 2))
Tper = 2 * np.pi / (w[1] - w[0])  # the relative phase of |I> and |II> turns at the level gap: Eq. 4.55
put("l11TAmmPeriodDeg", Tper / DEG)
put("l11TAmmPAboveQuarter", p_above(Tper / 4))
dE = np.sqrt(np.real(np.vdot(pz, Hamm @ Hamm @ pz)) - np.real(np.vdot(pz, Hamm @ pz)) ** 2)
put("l11TAmmDeltaE", dE)
put("l11TAmmDtRatio", (1 / (2 * dE)) / (Tper / 2))
c_light, h_pl, e_ch = 299792458.0, 6.62607015e-34, 1.602176634e-19
lam = 0.0125
nu = c_light / lam
put("l11TAmmFreqGHz", nu / 1e9)
put("l11TAmmEnergyUeV", h_pl * nu / e_ch * 1e6)
put("l11TAmmPeriodPs", 1e12 / nu)


def lvl(x):
    return np.linalg.eigvalsh(np.array([[x, -1.0], [-1.0, -x]]))


put("l11TLevelAt1", lvl(1.0)[1])
put("l11TLevelApproxAt1", 1 + 1.0 ** 2 / 2)
put("l11TFieldWeak", 0.3)  # an input, like an angle
put("l11TLevelAtP3", lvl(0.3)[1])
put("l11TLevelApproxAtP3", 1 + 0.3 ** 2 / 2)
put("l11TLevelErr1", (1 + 1.0 ** 2 / 2) / lvl(1.0)[1] - 1)
# practice: phase difference, P(+x), direction, <XX> and <ZZ>
Uph = U(0.8 / 2 * Z, 2.5)
put("l11PrPhase", (np.angle(Uph[1, 1]) - np.angle(Uph[0, 0])) / DEG)
put("l11PrPx", abs(np.vdot(px, U(0.6 / 2 * Z, 3.5) @ px)) ** 2)
psi_d = U(1.0 / 2 * Z, 1.5 * np.pi) @ px
put("l11PrYComp", np.real(np.vdot(psi_d, Y @ psi_d)))
phi_plus = np.array([1, 0, 0, 1], dtype=complex) / np.sqrt(2)
UA = k(U(0.5 * Z, 2.4), I2)
psi_b = UA @ phi_plus
put("l11PrXX", np.real(np.vdot(psi_b, k(X, X) @ psi_b)))
put("l11PrZZ", np.real(np.vdot(psi_b, k(Z, Z) @ psi_b)))

# ---------------------------------------------------------------- Lecture 12 claim keys
HZ = Z / 2  # H = omega0 S_z with omega0 = 1: the time is omega0 t
psi40 = U(HZ, 40 * DEG) @ px
put("l12TPPlusY40", abs(np.vdot(py, psi40)) ** 2)
put("l12TSy40", np.real(np.vdot(psi40, Y / 2 @ psi40)))
put("l12TSx40", np.real(np.vdot(psi40, X / 2 @ psi40)))


def exp_t(A_, t, H=HZ, start=px):
    p = U(H, t) @ start
    return np.real(np.vdot(p, A_ @ p))


ok = True
for t in (0.3, 0.7, 1.9):
    h = 1e-6
    ok &= abs((exp_t(X / 2, t + h) - exp_t(X / 2, t - h)) / (2 * h) + exp_t(Y / 2, t)) < 1e-8
put("l12TDerivMatch", 1.0 if ok else 0.0)
ok = True
for A_ in (X / 2, Y / 2):
    for t in (0.3, 0.9, 2.2):
        h = 1e-6
        p = U(HZ, t) @ px
        rate = (exp_t(A_, t + h) - exp_t(A_, t - h)) / (2 * h)
        comm = HZ @ A_ - A_ @ HZ
        ok &= abs(rate - np.real(1j * np.vdot(p, comm @ p))) < 1e-8
put("l12TRateLaw", 1.0 if ok else 0.0)
put("l12TEx42Sz40", exp_t(Z / 2, 40 * DEG, H=X / 2, start=pz))


# ports (closed form (1 +/- cos(phi/2))/2), the period of the fringe
def port(phi):
    return (1 + np.cos(phi / 2)) / 2


put("l12TPort0", port(0.0))
put("l12TPort2pi", port(2 * np.pi))
put("l12TPort3pi", port(3 * np.pi))
put("l12TPort4pi", port(4 * np.pi))
fall = bisect(lambda p: port(p) - 0.5, 0.0, 2 * np.pi)
rise = bisect(lambda p: port(p) - 0.5, 2 * np.pi, 4 * np.pi)
put("l12TNeutronRatio", 2 * (rise - fall) / (2 * np.pi))


# Rabi: the rotating-wave equations (4.41) for c, d reduce to H_eff = [[delta/2, g], [g, -delta/2]], g = w1/4 (see the engine note)
def rabi_rwa(w0_, w1_, w_, t):
    delta = w0_ - w_
    Heff = np.array([[delta / 2, w1_ / 4], [w1_ / 4, -delta / 2]], dtype=complex)
    return abs((U(Heff, t) @ pz)[1]) ** 2


W0, W1 = 1.0, 0.05
tflip = 2 * np.pi / W1
put("l12TRabiFlipAtRes", rabi_rwa(W0, W1, W0, tflip))
put("l12TRabiBack", rabi_rwa(W0, W1, W0, 2 * tflip))


def rabi_exact(w0_, w1_, w_, t, per=3000):
    n = int(np.ceil(per * t))
    h = t / n
    s = np.array([1, 0], dtype=complex)

    def f(tt, s_):
        gg = (w1_ / 2) * np.cos(w_ * tt)
        Hm = np.array([[w0_ / 2, gg], [gg, -w0_ / 2]], dtype=complex)
        return -1j * (Hm @ s_)

    for i in range(n):
        t0 = i * h
        k1 = f(t0, s)
        k2 = f(t0 + h / 2, s + h / 2 * k1)
        k3 = f(t0 + h / 2, s + h / 2 * k2)
        k4 = f(t0 + h, s + h * k3)
        s = s + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
    return abs(s[1]) ** 2


exact = rabi_exact(W0, W1, W0, tflip)
put("l12TRabiExactAtFlip", exact)
put("l12TRabiRwaErr", 1 - exact)
put("l12TRabiFlipUs", 1e6 / 40e3)  # t = 2 pi / omega1 = 1 / f1 for omega1 = 2 pi f1


def ceiling(w1_, delta):
    Heff = np.array([[delta / 2, w1_ / 4], [w1_ / 4, -delta / 2]], dtype=complex)
    lam_ = np.linalg.eigvalsh(Heff)[1]
    return (w1_ / 4) ** 2 / lam_ ** 2


put("l12TRabiPeakRes", ceiling(1.0, 0.0))
put("l12TRabiPeakHalf", ceiling(1.0, 0.5))
put("l12TRabiPeakOne", ceiling(1.0, 1.0))
# practice
nvec = np.array([np.sin(60 * DEG), 0.0, np.cos(60 * DEG)])
Hn = 0.5 * (nvec[0] * X + nvec[2] * Z)
put("l12PrPy", abs(np.vdot(py, U(Hn, 100 * DEG) @ pz)) ** 2)
om0 = 2 * np.pi * 1.5e6
tl = bisect(lambda t: abs((U(X / 2 * om0, t) @ pz)[1]) ** 2 - 0.4, 0.0, np.pi / om0)
put("l12PrLenMm", 800.0 * tl * 1e3)
put("l12PrLenCheck", abs((U(X / 2 * om0, tl) @ pz)[1]) ** 2)
m_mu = 1.883531627e-28
put("l12PrG", 2 * m_mu * (2 * np.pi * 1.010e6) / (e_ch * 7.5e-3))
put("l12PrRabiPeak", ceiling(30.0, 20.0))

# ---------------------------------------------------------------- engine twin tables (physics/dynamics.ts, constants.ts)
ENG["twoLevelXs"] = [0.0, 0.3, 1.0, 2.5]
ENG["twoLevel"] = [list(map(float, lvl(x))) for x in ENG["twoLevelXs"]]
ENG["ammoniaTimes"] = [0.2, 0.9, 1.7, 3.0]
ENG["ammoniaAbove"] = [float(p_above(t)) for t in ENG["ammoniaTimes"]]
ENG["ammoniaBelow"] = [float(p_below(t)) for t in ENG["ammoniaTimes"]]
ENG["portPhis"] = [0.0, 1.0, 3.0, 6.0, 9.5]
ENG["portPlus"] = [float(port(p)) for p in ENG["portPhis"]]
ENG["portMinus"] = [float(1 - port(p)) for p in ENG["portPhis"]]
ENG["rabiCases"] = [[1.0, 0.05, 1.0, 17.0], [1.0, 0.3, 0.8, 9.0], [2.0, 0.7, 2.4, 5.5]]
ENG["rabiRwa"] = [float(rabi_rwa(*c_)) for c_ in ENG["rabiCases"]]
ENG["rabiExactCases"] = [[1.0, 0.05, 1.0, 40.0], [1.0, 0.3, 0.8, 9.0]]
ENG["rabiExact"] = [float(rabi_exact(*c_)) for c_ in ENG["rabiExactCases"]]
ENG["larmorG"] = float(2 * m_mu * (2 * np.pi * 2.5e6) / (e_ch * 0.02))
ENG["photonEnergyEv"] = float(h_pl * c_light / 0.03 / e_ch)

KEYS = list(OUT.keys())
ROOT = Path(__file__).resolve().parent.parent.parent
out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-448" / "g4a.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({"about": "numpy twins of the Townsend-pass claim keys of Lectures 11 and 12 (pipeline/claims_448/g4a.py)",
                           "values": {kk: float(OUT[kk]) for kk in sorted(KEYS)}}, indent=1, sort_keys=True) + "\n")
eng = ROOT / "app" / "src" / "physics" / "__fixtures__" / "dynamics-g4a.json"
eng.write_text(json.dumps({"about": "numpy twins of the physics/dynamics.ts additions of the Townsend pass G4a (pipeline/claims_448/g4a.py)", **ENG}, indent=1, sort_keys=True) + "\n")
import sys as _sys
_sys.stdout.write("wrote %s (%d keys) and %s\n" % (out.relative_to(ROOT), len(KEYS), eng.relative_to(ROOT)))
