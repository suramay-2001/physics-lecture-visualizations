#!/usr/bin/env python3
"""Numpy twin of the 448 Townsend pass, group G1 (Lectures 1-4): every claim key of the new Townsend beats and practice questions,
plus the engine cases for the new functions (sg.ts `merge`, constants.ts `sgGradientForSeparation`, spin.ts `pathLedger`).

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - kets are explicit column vectors; chances are |<a|b>|^2 with np.vdot; rotations are exp(-i phi n.sigma/2) by eigh (not the closed forms);
  - benches propagate a density matrix: a Lueders projector for the kept beam, the identity for a recombining device;
  - the gradient closed form cancels the atom's mass (G = 4 k T z / (mu_B (L^2/2 + L D))), the engine goes through v^2 and a = F/m;
  - the Bohr magneton uses h and e directly (e h / 4 pi m_e), the engine uses e hbar / 2 m_e.
The digest's own equation groups and examples are asserted first (Townsend Ch. 1-2.3), so a misread equation fails here, not in the app.

Usage (from the repo root): python3 pipeline/claims_448/g1.py -> app/src/physics/__fixtures__/claims-448/g1.json (run it twice: the output is byte-identical)
Checked by app/src/content/claims.test.ts (engine value per key at 1e-12) and app/src/physics/townsendG1.test.ts (engine cases).
"""
import json
from math import acos, cos, degrees, pi, radians, sin, sqrt
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
out = {}


def put(k, v):
    v = float(v)
    out[k] = 0.0 if abs(v) < 1e-12 else v


I2 = np.eye(2, dtype=complex)
sx = np.array([[0, 1], [1, 0]], complex)
sy = np.array([[0, -1j], [1j, 0]])
sz = np.array([[1, 0], [0, -1]], complex)


def ket(*c):
    v = np.array(c, complex)
    return v / np.linalg.norm(v)


pz, mz = ket(1, 0), ket(0, 1)
px, mx = ket(1, 1), ket(1, -1)
py, my = ket(1, 1j), ket(1, -1j)


def P(v):
    return np.outer(v, v.conj())


def prob(a, b):
    return abs(np.vdot(a, b)) ** 2  # |<a|b>|^2


def Rn(n, phi):  # exp(-i phi n.sigma/2) by eigh (hbar = 1)
    n = np.array(n, float)
    n = n / np.linalg.norm(n)
    H = (n[0] * sx + n[1] * sy + n[2] * sz) / 2
    w, V = np.linalg.eigh(H)
    return V @ np.diag(np.exp(-1j * phi * w)) @ V.conj().T


def Ry(t):
    return Rn([0, 1, 0], t)


def Rz(t):
    return Rn([0, 0, 1], t)


def ketn(theta, phi):
    return np.array([cos(theta / 2), np.exp(1j * phi) * sin(theta / 2)])


def mean(op, v):
    return np.vdot(v, op @ v).real


def spread(op, v):
    return sqrt(max(0, mean(op @ op, v) - mean(op, v) ** 2))


# ---- digest checks (Townsend equations as facts) -----------------------------------------------------------
Sz = sz / 2
assert abs(mean(Sz, px)) < 1e-12 and abs(spread(Sz, px) - 0.5) < 1e-12  # (1.20)-(1.22)
psi = np.array([0.5, 1j * sqrt(3) / 2])  # Examples 1.1 / 1.2 / 1.3 / 2.1
assert abs(prob(pz, psi) - 0.25) < 1e-12 and abs(prob(mz, psi) - 0.75) < 1e-12
assert abs(mean(Sz, psi) + 0.25) < 1e-12 and abs(spread(Sz, psi) - sqrt(3) / 4) < 1e-12
assert abs(prob(py, psi) - (0.5 + sqrt(3) / 4)) < 1e-12 and abs(mean(sy / 2, psi) - sqrt(3) / 4) < 1e-12
rng = np.random.default_rng(7)  # (1.27)-(1.28) for random phases
for _ in range(50):
    dp, dm, gp, gm = rng.uniform(0, 2 * pi, 4)
    xk = np.array([np.exp(1j * dp), np.exp(1j * dm)]) / sqrt(2)
    yk = np.array([np.exp(1j * gp), np.exp(1j * gm)]) / sqrt(2)
    amp = np.vdot(yk, xk)
    d, g = dm - dp, gm - gp
    assert abs(amp - np.exp(1j * (dp - gp)) / 2 * (1 + np.exp(1j * (d - g)))) < 1e-12
    assert abs(abs(amp) ** 2 - (1 + cos(d - g)) / 2) < 1e-12
assert np.allclose(np.array([1, np.exp(1j * pi / 2)]) / sqrt(2), py) and np.allclose(np.array([1, np.exp(-1j * pi / 2)]) / sqrt(2), my)
assert np.allclose(ketn(pi / 2, 0), px) and np.allclose(ketn(pi / 2, pi / 2), py)
assert abs(np.vdot(py, py) - 1) < 1e-12  # (2.17)-(2.20)
assert abs(np.array([1, 1j]) @ py / sqrt(2)) < 1e-12  # the forgotten conjugate: (1,+i) times (1,i)/2 = 0
assert abs(np.vdot(my, py)) < 1e-12 and abs(prob(py, px) - 0.5) < 1e-12
R90 = Ry(pi / 2)  # (2.25)-(2.28)
assert np.allclose(R90 @ pz, px)
assert abs(np.vdot(pz, R90 @ R90 @ pz)) < 1e-12 and abs(np.vdot(pz, R90.conj().T @ R90 @ pz) - 1) < 1e-12
assert np.allclose(Ry(pi) @ pz, mz)
Pp, Pm = P(pz), P(mz)  # (2.44)-(2.57)
assert np.allclose(Pp + Pm, I2) and np.allclose(Pp @ Pp, Pp) and np.allclose(Pp @ Pm, 0) and np.allclose(Pm @ Pp, 0)
assert np.allclose(P(px) + P(mx), I2)
a_p = np.vdot(mz, px) * np.vdot(px, pz)
a_m = np.vdot(mz, mx) * np.vdot(mx, pz)  # (2.54)-(2.56)
assert abs(a_p + a_m) < 1e-12
diag = abs(a_p) ** 2 + abs(a_m) ** 2
cross = 2 * (a_p * a_m.conjugate()).real
assert abs(diag - 0.5) < 1e-12 and abs(cross + 0.5) < 1e-12 and abs(abs(a_p + a_m) ** 2 - (diag + cross)) < 1e-12
assert abs(prob(px, pz) * prob(pz, px) - 0.25) < 1e-12 and abs(prob(px, pz) * prob(mz, px) - 0.25) < 1e-12  # Fig. 1.3c
ts = np.linspace(0, pi, 100001)
fr = (np.cos(ts / 2) * np.sin(ts / 2)) ** 2  # Problem 1.7: maximum 1/4 at 90 degrees
assert abs(fr.max() - 0.25) < 1e-9 and abs(degrees(ts[fr.argmax()]) - 90) < 1e-3

# ---- plan keys ---------------------------------------------------------------------------------------------
# L1
h, e, me = 6.62607015e-34, 1.602176634e-19, 9.1093837015e-31  # SI exact / CODATA 2018
muB = e * h / (4 * pi * me)  # (1.3) with g = 2, q = -e, SI units, from h not hbar
put('l1TnMuB', muB / 1e-24)  # shown in units of 1e-24 J/T
put('l1TnExp3Down', prob(px, pz) * prob(mz, px))
put('l1TnExp3Both', prob(px, pz) * prob(mz, px) + prob(mx, pz) * prob(mz, mx))  # path recorded, both beams kept: the chances add
put('l1TnExp4Down', abs(np.vdot(mz, (P(px) + P(mx)) @ pz)) ** 2)
put('l1TnExp4Up', abs(np.vdot(pz, (P(px) + P(mx)) @ pz)) ** 2)
N = 100
sd = sqrt(N * 0.25)
put('l1TnSig100', sd)
put('l1TnZ55', (55 - 50) / sd)
N = 10**6
sd = sqrt(N * 0.25)
put('l1TnSig1e6', sd)
put('l1TnZ550k', (550000 - 500000) / sd)
c = np.array([cos(radians(25)), sin(radians(25))])
put('l1TnC1', abs(c[0]))
put('l1TnP1', prob(pz, c))
put('l1TnP2', prob(mz, c))
put('l1TnSum', prob(pz, c) + prob(mz, c))
put('l1PTilt', prob(pz, ketn(radians(110), 0)))
put('l1PAngle', degrees(2 * acos(sqrt(0.2))))
v = ket(2, 3)
put('l1PSpread', spread(sz / 2, v))
put('l1PMean', mean(sz / 2, v))
put('l1PChain', prob(ketn(radians(40), 0), pz) * prob(mz, ketn(radians(40), 0)))
kB, u = 1.380649e-23, 1.66053906660e-27
mAg = 107.8682 * u
T, L_, D_, sep = 1000.0, 0.20, 0.40, 0.5e-3
put('l1PGradient', 4 * kB * T * (sep / 2) / (muB * (L_ * L_ / 2 + L_ * D_)))  # the atom's mass cancels: G = 4 kT z / (mu_B (L^2/2 + L D))
# L2
yy_right = (np.array([1, -1j]) @ np.array([1, 1j])) / 2
yy_wrong = (np.array([1, 1j]) @ np.array([1, 1j])) / 2
put('l2TnYYright', yy_right.real)
put('l2TnYYwrong', abs(yy_wrong))
put('l2TnMinusXDot', abs(np.vdot(mx, px)))
put('l2TnMinusXNorm', np.linalg.norm(mx))
put('l2TnPlusXinX', abs(np.vdot(px, px)))


def Pyx(dg):
    return (1 + cos(dg)) / 2


put('l2TnPy0', Pyx(0))
put('l2TnPyQuarter', Pyx(pi / 2))
put('l2TnPyPi', Pyx(pi))
for g, key in ((0, 'l2TnPy0'), (pi / 2, 'l2TnPyQuarter'), (pi, 'l2TnPyPi')):  # cross-check by explicit vectors
    assert abs(prob(np.array([1, np.exp(1j * g)]) / sqrt(2), px) - out[key]) < 1e-12
w = np.array([1, np.exp(1j * radians(40))]) / sqrt(2)
put('l2TnPz40', prob(pz, w))
put('l2TnPx40', prob(px, w))
put('l2TnPy40', prob(py, w))
cn = np.array([1 + 1j, 2 - 1j])
put('l2PNorm', np.vdot(cn, cn).real)
A = np.array([1 + 1j, 1]) / sqrt(3)
B = np.array([2, 1j]) / sqrt(5)
put('l2PReverse', abs(np.vdot(A, B)) ** 2)
assert abs(abs(np.vdot(A, B)) - abs(np.vdot(B, A))) < 1e-12
w2 = np.array([1, np.exp(1j * radians(160))]) / sqrt(2)
put('l2PPhase', prob(py, w2))
# l2-p-recover: scan the phase of c in (|+z> + c|-z>)/sqrt2 for P(+x) = 1/4 (bisection on [0, pi], P(+x) falls from 1 to 0), then P(+y) at +/- that phase
def wc(ph):
    return np.array([1, np.exp(1j * ph)]) / sqrt(2)


lo_, hi_ = 0.0, pi
for _ in range(200):
    mid_ = (lo_ + hi_) / 2
    lo_, hi_ = (mid_, hi_) if prob(px, wc(mid_)) > 0.25 else (lo_, mid_)
ph_ = (lo_ + hi_) / 2
assert abs(prob(px, wc(ph_)) - 0.25) < 1e-12 and abs(prob(px, wc(-ph_)) - 0.25) < 1e-12 and prob(py, wc(ph_)) > 0.5 > prob(py, wc(-ph_))
put('l2PCos', (wc(ph_)[1] * sqrt(2)).real)  # cos(phase) = Re c
put('l2PGap', degrees(ph_))
put('l2PYUp', prob(py, wc(ph_)))
put('l2PYDown', prob(py, wc(-ph_)))
# L3
put('l3TnNaiveBra', abs(np.vdot(pz, R90 @ R90 @ pz)))
put('l3TnAdjBra', np.vdot(pz, R90.conj().T @ R90 @ pz).real)
put('l3TnRotIsX', prob(px, R90 @ pz))
put('l3TnIdX', np.abs(P(px) + P(mx) - I2).max())
put('l3TnPxTrace', np.trace(P(px)).real)
v = ketn(radians(80), 0)
vg = np.exp(1j * radians(50)) * v
vr = ketn(radians(80), pi / 2)
put('l3TnPxPhase0', prob(px, v))
put('l3TnPxGlobal', prob(px, vg))
put('l3TnPxRel90', prob(px, vr))
put('l3TnPathP', a_p.real)
put('l3TnPathM', a_m.real)
put('l3TnDiag', diag)
put('l3TnInterf', cross)
put('l3TnTotal', abs(a_p + a_m) ** 2)
put('l3PSurd', prob(px, np.array([1 / sqrt(6), sqrt(5 / 6)])))
put('l3PComplexY', prob(py, ket(1, 2j)))
put('l3PComplexX', prob(px, ket(1, 2j)))
v = ket(0.6, 0.8)
put('l3PCond', prob(pz, v) * prob(px, pz))
th = radians(40)
put('l3PBraNaive', np.vdot(pz, Ry(th) @ Ry(th) @ pz).real)
th = radians(30)
nn = ketn(th, 0)
nm = np.array([sin(th / 2), -cos(th / 2)])
put('l3PPathsMeasured', prob(mz, nn) * prob(nn, pz) + prob(mz, nm) * prob(nm, pz))
put('l3PPathsMerged', abs(np.vdot(mz, (P(nn) + P(nm)) @ pz)) ** 2)
# L4
c4 = np.array([cos(radians(20)), sin(radians(20))])
put('l4TnP1', c4[0] ** 2)
put('l4TnP2', c4[1] ** 2)
put('l4TnSum', sum(np.conj(c4[i]) * c4[j] * (1 if i == j else 0) for i in range(2) for j in range(2)).real)
put('l4TnPxHerm', np.abs(P(px) - P(px).conj().T).max())
wv, _ = np.linalg.eigh(P(px))
put('l4TnPxEig0', wv[0])
put('l4TnPxEig1', wv[1])
put('l4TnPxTrace', np.trace(P(px)).real)
put('l4TnP2Diff', np.abs(P(px) @ P(px) - P(px)).max())
put('l4TnPmPp', np.abs(P(mx) @ P(px)).max())
put('l4TnIdSum', np.abs(P(px) + P(mx) - I2).max())
put('l4TnPxPsi', prob(px, ket(sqrt(3) / 2, 0.5)))
put('l4PProj', np.vdot(ket(5, 12), P(px) @ ket(5, 12)).real)
a35 = radians(35)
put('l4PYprob', prob(py, ketn(2 * a35, radians(50))))
Hm = np.array([[3, 1 + 1j], [1 - 1j, 1]])
assert np.allclose(Hm, Hm.conj().T)
ev = np.linalg.eigvals(Hm)  # general solver: the imaginary parts are the check
evh = np.linalg.eigvalsh(Hm)  # ascending
assert abs(evh[0] - (2 - sqrt(3))) < 1e-12 and abs(evh[1] - (2 + sqrt(3))) < 1e-12
put('l4PEigIm', np.abs(ev.imag).max())
put('l4PEigHi', evh[1])
put('l4PEigLo', evh[0])
put('l4PEigGap', evh[1] - evh[0])
U = np.array([[1, 1j], [1j, 1]]) / sqrt(2)
assert np.allclose(U.conj().T @ U, I2)
lam = np.vdot(px, U @ px)
assert np.allclose(U @ px, lam * px)
put('l4PUnitPhase', degrees(np.angle(lam)))
put('l4PUnitModulus', abs(lam))

# ---- extra keys the builder added while writing (each is a number the page prints) -------------------------------
EXTRA = {}  # filled below by the builder's additions (kept separate so the plan's 73 keys stay recognisable)

# ---- engine cases ------------------------------------------------------------------------------------------
KETS = {'+z': pz, '-z': mz, '+x': px, '-x': mx, '+y': py, '-y': my}


def n_sigma(tilt_deg):
    t = radians(tilt_deg)
    return sin(t) * sx + cos(t) * sz


def out_ket(axis, sign):
    deg = {'x': 90.0, 'z': 0.0}[axis] if isinstance(axis, str) else float(axis)
    w_, V_ = np.linalg.eigh(n_sigma(deg))
    return V_[:, np.argmax(w_) if sign == '+' else np.argmin(w_)]


def bench(source, axes, keep, merge):
    """Density-matrix propagation: kept beam = Lueders projector, recombining device = identity; the last device reads both spots."""
    rho = I2 / 2 if source == 'oven' else P(KETS[source])
    blocked = []
    for k in range(len(axes) - 1):
        if merge[k]:
            blocked.append(0.0)
            continue
        Pk = P(out_ket(axes[k], keep[k]))
        rho_new = Pk @ rho @ Pk
        blocked.append(float(np.trace(rho).real - np.trace(rho_new).real))
        rho = rho_new
    Pp_, Pm_ = P(out_ket(axes[-1], '+')), P(out_ket(axes[-1], '-'))
    return {'plus': float(np.trace(Pp_ @ rho).real), 'minus': float(np.trace(Pm_ @ rho).real), 'blocked': blocked}


merge_cases = []
for src, axes, keep, merge in [
    ('+z', ['x', 'z'], ['+'], [True, False]),
    ('+z', ['x', 'z'], ['+'], [False, False]),
    ('+x', [60, 'z'], ['+'], [True, False]),
    ('+z', ['x', 'x', 'z'], ['+', '+'], [False, True, False]),
    ('+z', [30, 'x', 'z'], ['+', '+'], [True, False, False]),
    ('+z', ['z', 45, 'x'], ['-', '+'], [False, True, False]),
]:
    r = bench(src, axes, keep, merge)
    merge_cases.append({'source': src, 'axes': axes, 'keep': keep, 'merge': merge, **r})

ledger_cases = []
for ini, fin, basis_name, basis in [
    ('+z', '-z', 'x', [px, mx]),
    ('+z', '+z', 'x', [px, mx]),
    ('+z', '-z', 'tilt30', [ketn(radians(30), 0), np.array([sin(radians(15)), -cos(radians(15))])]),
    ('+x', '-y', 'z', [pz, mz]),
]:
    ini_v, fin_v = KETS[ini], KETS[fin]
    amps = [np.vdot(fin_v, b_) * np.vdot(b_, ini_v) for b_ in basis]
    s_ = sum(amps)
    dg = sum(abs(a_) ** 2 for a_ in amps)
    ledger_cases.append({
        'initial': ini, 'final': fin, 'basis': basis_name,
        'paths': [[float(a_.real), float(a_.imag)] for a_ in amps],
        'diagonal': float(dg), 'interference': float(abs(s_) ** 2 - dg), 'total': float(abs(s_) ** 2),
    })

grad_cases = [
    {'lengthM': L_, 'driftM': D_, 'tempK': T, 'separationM': sep, 'gradient': 4 * kB * T * (sep / 2) / (muB * (L_ * L_ / 2 + L_ * D_))},
    {'lengthM': 0.1, 'driftM': 0.3, 'tempK': 1200.0, 'separationM': 1.0e-3, 'gradient': 4 * kB * 1200.0 * 0.5e-3 / (muB * (0.1 * 0.1 / 2 + 0.1 * 0.3))},
]

assert set(out) >= {k for k in out}  # no-op guard against accidental key loss
dest = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-448' / 'g1.json'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(
    json.dumps(
        {
            'about': 'Physics 448 Townsend pass, group G1 (L1-L4): claim values and engine cases, numpy (explicit kets, eigh exponentials, density matrices). '
            'Regenerate: python3 pipeline/claims_448/g1.py',
            'values': {k: out[k] for k in sorted(out)},
            'cases': {'merge': merge_cases, 'pathLedger': ledger_cases, 'gradient': grad_cases, 'bohrMagneton': float(muB)},
        },
        indent=1,
    )
    + '\n'
)
print(f'wrote {dest.relative_to(ROOT)} ({len(out)} values)')
