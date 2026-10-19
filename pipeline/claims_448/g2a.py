#!/usr/bin/env python3
"""Numpy twin of the 448 Townsend pass, group G2a (Lectures 5-6): every claim key of the new Townsend beats and practice questions,
plus the engine cases for the new function (spin.ts `portProbs`, the two-arm spin interferometer).

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - S_x, S_y come from the raising and lowering matrices (Townsend Eqs. 3.78, 3.81, 3.86, 3.87), not from the Pauli table;
  - a rotation is exp(-i angle n.S) by an eigh-built exponential, never the closed form cos(t/2) - i sin(t/2) n.sigma;
  - eigenvectors come from np.linalg.eigh and are read through phase-free quantities (a ratio, a Bloch azimuth);
  - the tilted basis is built by turning |+z> and |-z> with that exponential, and (B^dag A B)_ij by an einsum over the old basis;
  - angle questions are solved by a scan over a grid of tenths of a degree.
The digest's own equation groups are asserted first (Townsend Eqs. 2.29-2.43, 2.58-2.102, 3.78-3.103), so a misread equation fails here.

Usage (from the repo root): python3 pipeline/claims_448/g2a.py -> app/src/physics/__fixtures__/claims-448/g2a.json (run it twice: byte-identical)
Checked by app/src/content/claims.test.ts (engine value per key at 1e-12) and app/src/physics/townsendG2a.test.ts (engine cases).
"""
import json
from math import acos, atan2, cos, degrees, factorial, pi, radians, sin, sqrt
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
out = {}


def put(k, v):
    v = float(v)
    out[k] = 0.0 if abs(v) < 1e-12 else v


I2 = np.eye(2, dtype=complex)
sz = np.array([[1, 0], [0, -1]], complex)
Sp = np.array([[0, 1], [0, 0]], complex)  # S_+ / hbar (Townsend Eq. 3.78)
Sm = np.array([[0, 0], [1, 0]], complex)  # S_- / hbar (Eq. 3.81)
Sx = (Sp + Sm) / 2  # Eq. 3.86
Sy = (Sp - Sm) / 2j  # Eq. 3.87
Sz = sz / 2
sx, sy = 2 * Sx, 2 * Sy
pz, mz = np.array([1, 0], complex), np.array([0, 1], complex)
px, mx = np.array([1, 1], complex) / sqrt(2), np.array([1, -1], complex) / sqrt(2)
py, my = np.array([1, 1j], complex) / sqrt(2), np.array([1, -1j], complex) / sqrt(2)


def ket(theta_deg, phi_deg):
    t, p = radians(theta_deg), radians(phi_deg)
    return np.array([cos(t / 2), np.exp(1j * p) * sin(t / 2)])


def ev(A, v):
    return np.vdot(v, A @ v).real


def bloch(v):
    return np.array([ev(sx, v), ev(sy, v), ev(sz, v)])


def prob(a, b):
    return abs(np.vdot(a, b)) ** 2


def Rn(n, angle):  # exp(-i angle n.S), hbar = 1, by an eigh exponential
    n = np.array(n, float)
    n = n / np.linalg.norm(n)
    H = n[0] * Sx + n[1] * Sy + n[2] * Sz
    w, V = np.linalg.eigh(H)
    return V @ np.diag(np.exp(-1j * angle * w)) @ V.conj().T


def worst(xs, target):
    return max(xs, key=lambda x: abs(x - target)) if any(abs(x - target) > 0 for x in xs) else target


# ---------------------------------------------------------------- A. the digest's equations (asserts)
assert np.allclose(Sx, sx / 2) and np.allclose(sy, np.array([[0, -1j], [1j, 0]]))  # Eqs. 3.88-3.89
assert np.allclose(Sz, np.diag([0.5, -0.5]))  # Eq. 3.77
# Eq. 2.66 and 2.70: A_ij = <i|A|j>; J_z is diagonal in its own basis
assert np.isclose(np.vdot(pz, Sy @ mz), -0.5j) and np.allclose(Sz @ pz, 0.5 * pz)
# Eqs. 2.80-2.82: adjoint matrix, product, (AB)^dag = B^dag A^dag
rng = np.random.default_rng(448)
A_ = rng.normal(size=(2, 2)) + 1j * rng.normal(size=(2, 2))
B_ = rng.normal(size=(2, 2)) + 1j * rng.normal(size=(2, 2))
assert np.allclose((A_ @ B_).conj().T, B_.conj().T @ A_.conj().T)
# Eqs. 2.99-2.102 with the book's |-x> = -(1, -1)/sqrt2 (Eq. 2.90): J_z -> (hbar/2)[[0,-1],[-1,0]]; with Eq. 2.15's |-x>: [[0,1],[1,0]]
Sbook = np.column_stack([px, -mx])
assert np.allclose(Sbook.conj().T @ Sz @ Sbook, 0.5 * np.array([[0, -1], [-1, 0]]))
assert np.allclose(np.column_stack([px, mx]).conj().T @ Sz @ np.column_stack([px, mx]), 0.5 * np.array([[0, 1], [1, 0]]))
# Eq. 2.108 and Ex. 2.7: <S_z> for |+x> is 0; for (1/2, i sqrt3/2) it is -1/4
assert np.isclose(ev(Sz, px), 0) and np.isclose(ev(Sz, np.array([0.5, 1j * sqrt(3) / 2])), -0.25)
# Eqs. 3.91-3.101: S_n for n = (cos phi, sin phi, 0): eigenvalues +-1/2 (mu = +-1), |+n> = (|+z> + e^{i phi}|-z>)/sqrt2
for ph in (0.3, 1.7, 4.0):
    Sn = np.cos(ph) * Sx + np.sin(ph) * Sy
    assert np.allclose(np.linalg.eigvalsh(Sn), [-0.5, 0.5])
    pn = np.array([1, np.exp(1j * ph)]) / sqrt(2)
    assert np.allclose(Sn @ pn, 0.5 * pn)
# Eqs. 2.29-2.31: R(d phi k) = 1 - i J_z d phi is unitary to first order only for a Hermitian generator
d_ = 1e-6
R1 = I2 - 1j * Sz * d_
assert np.allclose(R1.conj().T @ R1, I2, atol=1e-11)
# Eqs. 2.34-2.43: R(phi k)|+-z> = e^{-+ i phi/2}|+-z>; R(2 pi k)|+z> = -|+z>; Problem 3.5: R(theta j) = cos(t/2) - 2i S_y sin(t/2)
assert np.allclose(Rn([0, 0, 1], 0.9) @ pz, np.exp(-0.45j) * pz) and np.allclose(Rn([0, 0, 1], 2 * pi) @ pz, -pz)
for t_ in (0.4, 1.3, 2.9):
    assert np.allclose(Rn([0, 1, 0], t_), cos(t_ / 2) * I2 - 2j * Sy * sin(t_ / 2))
assert np.allclose(Rn([0, 1, 0], pi / 2) @ pz, px)  # Eq. 2.86

# ---------------------------------------------------------------- B. claim values: L5
# l5-averages:b6b (Eqs. 2.58-2.66): the entry <+z|S_y|-z> (units hbar)
put('l5TAy12im', np.vdot(pz, Sy @ mz).imag)
# l5-inverse:b4b (Eqs. 3.91-3.101, Fig. 3.7): sigma_n for a direction in the x-y plane
for ph in (60, 210):
    Sn = 2 * (cos(radians(ph)) * Sx + sin(radians(ph)) * Sy)
    w, V = np.linalg.eigh(Sn)
    v = V[:, 1]
    put(f'l5TSnEigMax{ph}', w[1])
    put(f'l5TSnAz{ph}', degrees(atan2(ev(sy, v), ev(sx, v))) % 360)
Sn60 = 2 * (cos(radians(60)) * Sx + sin(radians(60)) * Sy)
put('l5TSnRe60', Sn60[1, 0].real)
put('l5TSnIm60', Sn60[1, 0].imag)
put('l5TSnDet', worst([float(np.prod(np.linalg.eigvalsh(2 * (cos(2 * pi * k / 12) * Sx + sin(2 * pi * k / 12) * Sy)))) for k in range(13)], -1.0))  # det = product of eigenvalues
# l5-operators:b7b (Eqs. 2.81, 2.82, 2.98, footnote 10): the tilted basis is the z basis turned by Ry(theta) (second ket with a minus so it is the course's |-x> at 90)
def tilt_basis(th):
    R = Rn([0, 1, 0], radians(th))
    return np.column_stack([R @ pz, -(R @ mz)])


for th in (30, 90):
    M = tilt_basis(th).conj().T @ sz @ tilt_basis(th)
    put(f'l5TTiltDiag{th}', M[0, 0].real)
    put(f'l5TTiltOff{th}', M[0, 1].real)
TILTS = [0, 15, 30, 45, 60, 75, 90]
gaps = []
for th in TILTS:
    B = tilt_basis(th)
    ds = np.einsum('ki,kl,lj->ij', B.conj(), sz, B)  # the identity inserted twice, written as a double sum
    gaps.append(np.abs(ds - B.conj().T @ sz @ B).max())
put('l5TDoubleSum', worst(gaps, 0.0))
put('l5THermAll', worst([float(np.allclose(tilt_basis(th).conj().T @ Sx @ tilt_basis(th), (tilt_basis(th).conj().T @ Sx @ tilt_basis(th)).conj().T)) for th in TILTS], 1.0))
SxSy = Sx @ Sy
put('l5TSxSy11im', SxSy[0, 0].imag)
put('l5TAdjDefect', np.abs(SxSy.conj().T - Sy @ Sx).max())
# practice
put('l5PMeanSz', ev(Sz, np.array([sqrt(2 / 5), 1j * sqrt(3 / 5)])))
v = np.array([3, 2j]) / sqrt(13)
put('l5PChanceY', prob(py, v))
put('l5PChanceYWrong', abs(np.dot(np.array([1, 1j]) / sqrt(2), v)) ** 2)  # no conjugate on the bra
By = np.column_stack([py, my])
cy = np.array([0.6, 0.8])
put('l5PYBasis', (cy.conj() @ (By.conj().T @ Sz @ By) @ cy).real)
put('l5PYBasisCheck', ev(Sz, By @ cy))
v = np.array([sqrt(2 / 7), sqrt(5 / 7)])
put('l5PMeanSx', ev(Sx, v))
put('l5PSurdPlus', prob(px, v))
put('l5PSurdMinus', prob(mx, v))

# ---------------------------------------------------------------- B. claim values: L6
# l6-bloch:b7b (Problem 3.2): S_n at (theta, phi) = (70, 200); the + eigenvector's entry ratio
t_, p_ = radians(70), radians(200)
n = np.array([sin(t_) * cos(p_), sin(t_) * sin(p_), cos(t_)])
w, V = np.linalg.eigh(n[0] * sx + n[1] * sy + n[2] * sz)
rat = V[1, 1] / V[0, 1]
put('l6TNRatioAbs', abs(rat))
put('l6TNRatioArg', degrees(np.angle(rat)) % 360)
put('l6TNEig', w[1])
# l6-active:b6b (Eqs. 2.83-2.96, Fig. 2.9): state (50, 30)
psi = ket(50, 30)
act = prob(pz, Rn([0, 1, 0], radians(-90)) @ psi)
pas = prob(px, psi)
put('l6TActiveP', act)
put('l6TPassiveP', pas)
put('l6TPassiveDiff', abs(act - pas))
put('l6TActive40', prob(pz, Rn([0, 1, 0], radians(-40)) @ psi))
n40 = np.array([sin(radians(40)), 0, cos(radians(40))])
put('l6TPassive40', 0.5 * (1 + n40 @ bloch(psi)))
c_ = np.array([0.6, 0.8j])
put('l6TLinear', np.abs(Rn([0, 1, 0], pi / 2) @ c_ - (c_[0] * px + c_[1] * np.array([-1, 1]) / sqrt(2))).max())
# l6-generator:b6b (Eqs. 2.29-2.31)
dphi = 0.1
for key, G in (('l6TUnit1Diag', Sz), ('l6TBadDiag', 1j * Sz)):
    R = I2 - 1j * G * dphi
    RR = R.conj().T @ R
    if key == 'l6TUnit1Diag':
        put(key, RR[0, 0].real)
    else:
        put('l6TBadDiag0', RR[0, 0].real)
        put('l6TBadDiag1', RR[1, 1].real)
# l6-generator:b6c (Eqs. 2.34-2.41)
Rz100 = Rn([0, 0, 1], radians(100))
put('l6TEigPhasePlus', degrees(np.angle(Rz100[0, 0])))
put('l6TEigPhaseMinus', degrees(np.angle(Rz100[1, 1])))
put('l6TRelPhase', degrees(np.angle(Rz100[1, 1] / Rz100[0, 0])))
x = -1j * radians(100) / 2
for nt in (4, 6):
    put(f'l6TSeriesErr{nt}', abs(np.exp(x) - sum(x**k / factorial(k) for k in range(nt))))
n60 = np.array([sin(radians(60)), 0, cos(radians(60))])
put('l6TOwnAxisMove', np.abs(bloch(Rn(n60, radians(120)) @ ket(60, 0)) - bloch(ket(60, 0))).max())
put('l6TPerpMoveDeg', degrees(acos(bloch(Rn([0, 1, 0], radians(60)) @ pz)[2])))
# l6-generator:b6d (Problem 3.5, Eqs. 3.10-3.11)
Ry100 = Rn([0, 1, 0], radians(100))
put('l6TRyCos', Ry100[0, 0].real)
put('l6TRySin', Ry100[1, 0].real)
th = radians(100)
put('l6TRyDefect', np.abs(Ry100 - (cos(th / 2) * I2 - 2j * Sy * sin(th / 2))).max())
r = bloch(Ry100 @ pz)
put('l6TRyPolar', degrees(acos(r[2])))
put('l6TRyAzim', degrees(atan2(r[1], r[0])))
nn = np.array([sin(th), 0, cos(th)])
wn, Vn = np.linalg.eigh(-(nn[0] * sx + nn[1] * sy + nn[2] * sz))
vm = Vn[:, 1] * (abs(Vn[0, 1]) / Vn[0, 1])  # phase fixed: first entry real and positive
put('l6TRyGap', np.linalg.norm(Ry100 @ mz + vm))
# practice
best, best_gap = 0.0, 1e9
for k in range(3600):
    ph = k / 10
    s_ = ket(90, ph)
    g_ = abs(ev(Sy, s_) + 1 / (2 * sqrt(2))) + (0 if ev(Sx, s_) > 0 else 10)
    if g_ < best_gap:
        best, best_gap = ph, g_
put('l6PAzim', best)
put('l6PChanceY', prob(py, ket(70, 200)))


def ports(psi_, ph_deg):
    R = Rn([0, 0, 1], radians(ph_deg))
    return np.linalg.norm((I2 + R) @ psi_ / 2) ** 2, np.linalg.norm((I2 - R) @ psi_ / 2) ** 2


put('l6PPort', ports(px, 150)[0])
put('l6PRyX', 0.5 * (1 + bloch(Ry100 @ pz)[0]))
quarter = next(k / 10 for k in range(7200) if ports(px, k / 10)[0] <= 0.25 + 1e-9)
put('l6PPortAngle', quarter)
put('l6PPeriod', next(p for p in (360, 720) if all(abs(ports(px, ph + p)[0] - ports(px, ph)[0]) < 1e-9 for ph in (0, 40, 100, 150))))

# ---------------------------------------------------------------- C. engine cases: portProbs (the two-arm interferometer)
KETS = {'+x': px, '+y': py, '+z': pz, '-x': mx}
port_cases = []
for name, phi_deg in [('+x', 0), ('+x', 90), ('+x', 150), ('+x', 240), ('+x', 360), ('+x', 720), ('+y', 60), ('+z', 123), ('-x', 30)]:
    pl, mi = ports(KETS[name], phi_deg)
    port_cases.append({'ket': name, 'phiDeg': phi_deg, 'plus': float(pl), 'minus': float(mi)})
gen = ket(50, 30)
for phi_deg in (10, 100, 200, 300):
    pl, mi = ports(gen, phi_deg)
    port_cases.append({'ket': 'bloch(50,30)', 'phiDeg': phi_deg, 'plus': float(pl), 'minus': float(mi)})

dest = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-448' / 'g2a.json'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(
    json.dumps(
        {
            'about': 'Physics 448 Townsend pass, group G2a (L5-L6): claim values and engine cases, numpy (ladder-built spin matrices, eigh exponentials, grid scans). '
            'Regenerate: python3 pipeline/claims_448/g2a.py',
            'values': {k: out[k] for k in sorted(out)},
            'cases': {'portProbs': port_cases},
        },
        indent=1,
    )
    + '\n'
)
print(f'wrote {dest.relative_to(ROOT)} ({len(out)} values)')
