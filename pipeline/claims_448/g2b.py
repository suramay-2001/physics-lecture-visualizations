#!/usr/bin/env python3
"""Numpy twin of the 448 Townsend pass, group G2b (Lectures 7-8): every claim key of the new Townsend beats and practice questions,
plus the engine cases for the new functions (physics/angmom.ts, polarization.ts chainTransmission / plateDelta / circularChance /
quarterWaveThickness / photonJz, spin.ts schwarzParts).

Nothing here imports the repo engine. Routes differ from the engine's on purpose:
  - spin-j matrices come from ADDING 2j spin-1/2's (Kronecker sums), keeping the top J^2 multiplet and fixing the phases so that J_+ has a
    positive real super-diagonal; the engine builds them from the coefficient sqrt(j(j+1) - m(m+1)) (Townsend Eq. 3.59);
  - a turn is exp(-i t H) built from np.linalg.eigh; the 3 x 3 vector turns are exp(phi K) of an antisymmetric generator K;
  - the Schwarz pieces are the real and imaginary parts of <alpha|beta> for the shifted kets (the engine goes through F and C);
  - a chain of polarizers multiplies the overlaps of neighbouring polarizer kets (the engine uses cos^{2N}(phi/N));
  - the wave plate is a state (1, e^{i delta})/sqrt2 overlapped with (1, i)/sqrt2; the smallest N is a scan.
The digest's own equations are asserted first (Townsend Eqs. 3.8, 3.28-3.36, 3.59-3.62, 3.104-3.115, Ex. 3.4, 3.5, Problem 3.19), so a misread fails here.

Usage (from the repo root): python3 pipeline/claims_448/g2b.py -> app/src/physics/__fixtures__/claims-448/g2b.json (run it twice: byte-identical)
Checked by app/src/content/claims.test.ts (engine value per key at 1e-12) and app/src/physics/townsendG2b.test.ts (engine cases).
"""
import json
from math import acos, cos, degrees, floor, pi, radians, sin, sqrt
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
out = {}


def put(k, v):
    v = float(v)
    out[k] = 0.0 if abs(v) < 1e-12 else v


I2 = np.eye(2, dtype=complex)
SX1 = np.array([[0, 1], [1, 0]], complex) / 2
SY1 = np.array([[0, -1j], [1j, 0]], complex) / 2
SZ1 = np.array([[1, 0], [0, -1]], complex) / 2


def expm_h(H, t):
    """exp(-i t H) for Hermitian H, by eigh."""
    w, v = np.linalg.eigh(H)
    return (v * np.exp(-1j * t * w)) @ v.conj().T


def spin_j(j):
    """(Jx, Jy, Jz, J2, Jp) of spin j in the basis m = j, ..., -j, built by adding 2j spin-1/2's (top J^2 multiplet)."""
    n = int(round(2 * j))

    def total(s):
        acc = np.zeros((2**n, 2**n), complex)
        for k in range(n):
            M = np.array([[1]], complex)
            for q in range(n):
                M = np.kron(M, s if q == k else I2)
            acc += M
        return acc

    Jx, Jy, Jz = total(SX1), total(SY1), total(SZ1)
    J2 = Jx @ Jx + Jy @ Jy + Jz @ Jz
    w, v = np.linalg.eigh(J2)
    top = v[:, np.isclose(w, j * (j + 1))]
    assert top.shape[1] == n + 1
    wz, vz = np.linalg.eigh(top.conj().T @ Jz @ top)
    B = top @ vz[:, np.argsort(-wz)]
    Jp_full = Jx + 1j * Jy
    for k in range(1, n + 1):
        M = B[:, k - 1].conj() @ Jp_full @ B[:, k]
        B[:, k] = B[:, k] * (abs(M) / M)
    r = lambda A: B.conj().T @ A @ B
    return r(Jx), r(Jy), r(Jz), r(J2), r(Jp_full)


SPIN = {j: spin_j(j) for j in (0.5, 1.0, 1.5, 2.0)}

# ---------------------------------------------------------------- A. the digest's own equations (a misread fails here)
Jx1, Jy1, Jz1, J21, Jp1 = SPIN[1.0]
s2 = sqrt(2)
assert np.allclose(Jx1, np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]]) / s2)  # Eq. 3.28
assert np.allclose(Jy1, np.array([[0, -1j, 0], [1j, 0, -1j], [0, 1j, 0]]) / s2)
assert np.allclose(Jz1, np.diag([1, 0, -1]))
assert np.allclose(J21, 2 * np.eye(3))  # Eq. 3.29
assert np.allclose(Jp1, s2 * np.array([[0, 1, 0], [0, 0, 1], [0, 0, 0]]))  # Eq. 3.32
for j, (Jx, Jy, Jz, J2, Jp) in SPIN.items():
    assert np.allclose(Jx @ Jy - Jy @ Jx, 1j * Jz)  # Eq. 3.14
    assert np.allclose(Jz @ Jp - Jp @ Jz, Jp)  # Eq. 3.39
    assert np.allclose(J2, j * (j + 1) * np.eye(len(Jz)))
Jx32, Jy32, Jz32, J232, Jp32 = SPIN[1.5]
assert np.allclose(Jp32, np.array([[0, sqrt(3), 0, 0], [0, 0, 2, 0], [0, 0, 0, sqrt(3)], [0, 0, 0, 0]]))  # Example 3.4
assert np.allclose(Jx32, 0.5 * np.array([[0, sqrt(3), 0, 0], [sqrt(3), 0, 2, 0], [0, 2, 0, sqrt(3)], [0, 0, sqrt(3), 0]]))
# Problem 3.19: R(t j) for spin 1
t = radians(37)
R = expm_h(Jy1, t)
assert np.allclose(R, np.array([[(1 + cos(t)) / 2, -sin(t) / s2, (1 - cos(t)) / 2], [sin(t) / s2, cos(t), -sin(t) / s2], [(1 - cos(t)) / 2, sin(t) / s2, (1 + cos(t)) / 2]]))
# Ex. 3.5 and Eq. 3.114: the S_y eigenvectors of spin 1 in the z basis
wy, vy = np.linalg.eigh(Jy1)
assert np.allclose(wy, [-1, 0, 1])
assert np.allclose(np.abs(vy[:, 2]) ** 2, [0.25, 0.5, 0.25])
assert np.allclose(np.abs(vy[:, 1]) ** 2, [0.5, 0, 0.5])
# Eq. 3.8: the commutator of two small vector turns, to second order
K = {
    'x': np.array([[0, 0, 0], [0, 0, -1], [0, 1, 0]], float),
    'y': np.array([[0, 0, 1], [0, 0, 0], [-1, 0, 0]], float),
    'z': np.array([[0, -1, 0], [1, 0, 0], [0, 0, 0]], float),
}


def turn3(axis, phi):
    """exp(phi K): K = i H with H = -i K Hermitian, so the turn is v diag(exp(i phi w)) v^dagger."""
    w, v = np.linalg.eigh(-1j * K[axis])
    return ((v * np.exp(1j * phi * w)) @ v.conj().T).real


e = 0.1
comm3 = turn3('x', e) @ turn3('y', e) - turn3('y', e) @ turn3('x', e)
assert np.allclose(comm3, turn3('z', e * e) - np.eye(3), atol=1e-3)  # Eq. 3.8 (second order; the rest is third order in e)
assert np.allclose(turn3('z', 0.7), np.array([[cos(0.7), -sin(0.7), 0], [sin(0.7), cos(0.7), 0], [0, 0, 1]]))  # Eq. 3.3

# ---------------------------------------------------------------- B. claim values
# -- l7-compatible:b5b  (two small turns, two orders; e = 0.1 rad)
Sx, Sy, Sz = SX1, SY1, SZ1
Rx, Ry = expm_h(Sx, e), expm_h(Sy, e)
cm = Rx @ Ry - Ry @ Rx
put('l7TCommRatio', -cm[0, 0].imag / e**2)
put('l7TCommDiag', -cm[0, 0].imag)
put('l7TComm310', comm3[1, 0])
put('l7TComm3Ref', e * e)


def bloch(v):
    return np.array([np.vdot(v, 2 * S @ v).real for S in (Sx, Sy, Sz)])


up = np.array([1, 0], complex)
xy = bloch(expm_h(Sy, pi / 2) @ expm_h(Sx, pi / 2) @ up)
yx = bloch(expm_h(Sx, pi / 2) @ expm_h(Sy, pi / 2) @ up)
put('l7TOrderGap', degrees(acos(float(np.clip(xy @ yx, -1, 1)))))

# -- l7-uncertainty:b6b  (the Schwarz pieces at theta 60, phi 45, and the equator state phi 60)


def ket(theta_deg, phi_deg):
    t, p = radians(theta_deg), radians(phi_deg)
    return np.array([cos(t / 2), np.exp(1j * p) * sin(t / 2)])


def schwarz(A, B, psi):
    a = A @ psi - np.vdot(psi, A @ psi) * psi
    b = B @ psi - np.vdot(psi, B @ psi) * psi
    z = np.vdot(a, b)
    return z.real**2, z.imag**2, (np.vdot(a, a) * np.vdot(b, b)).real


psi = ket(60, 45)
cov, comm, prod = schwarz(Sx, Sy, psi)
put('l7TSchwarzCov', cov)
put('l7TSchwarzComm', comm)
put('l7TSchwarzSum', cov + comm)
put('l7TSpreadProdSq', prod)
put('l7TSchwarzGap', abs(cov + comm - prod))
cov2, comm2, prod2 = schwarz(Sx, Sy, ket(90, 60))
put('l7TSchwarzEqCov', cov2)
put('l7TSchwarzEqComm', comm2)

# -- l7-ladder
put('l7TJ2Half', SPIN[0.5][3][0, 0].real)
put('l7TJ2One', SPIN[1.0][3][0, 0].real)
put('l7TJ2Off', max(abs(SPIN[1.0][3][a, b]) for a in range(3) for b in range(3) if a != b))
put('l7TJp05', abs(SPIN[0.5][4][0, 1]))
put('l7TLadder10', abs(SPIN[1.0][4][0, 1]))  # |1,0> -> |1,1>
put('l7TLadder32m12', abs(SPIN[1.5][4][1, 2]))  # |3/2,-1/2> -> |3/2,1/2>
put('l7TLadder32p12', abs(SPIN[1.5][4][0, 1]))  # |3/2,1/2> -> |3/2,3/2>
put('l7TSyHalf', abs(SPIN[0.5][1][0, 1]))  # |(S_y)_{+-}| / (hbar/2) * (1/2): the entry of J_y for spin 1/2
put('l7TJy1Entry', abs(SPIN[1.0][1][0, 1]))
for j, tag in ((0.5, '05'), (1.0, '1'), (1.5, '15')):
    Jz, J2 = SPIN[j][2], SPIN[j][3]
    put('l7TLevels' + tag, len(Jz))
    length = sqrt(J2[0, 0].real)
    put('l7TLen' + tag, length)
    put('l7TCone' + tag, degrees(acos(Jz[0, 0].real / length)))


def z_chances(j, axis, m):
    Jx, Jy, Jz = SPIN[j][0], SPIN[j][1], SPIN[j][2]
    A = {'x': Jx, 'y': Jy, 'z': Jz}[axis]
    w, v = np.linalg.eigh(A)
    k = int(np.argmin(abs(w - m)))
    assert abs(w[k] - m) < 1e-9
    return list(np.abs(v[:, k]) ** 2)


c = z_chances(1.0, 'y', 1)
put('l7TSgY1up', c[0])
put('l7TSgY1mid', c[1])
put('l7TSgY1down', c[2])
put('l7TSgHalfUp', z_chances(0.5, 'y', 0.5)[0])
c = z_chances(1.0, 'y', 0)
put('l7TSgY0up', c[0])
put('l7TSgY0mid', c[1])
c = z_chances(1.5, 'x', 0.5)
for key, val in zip(('l7TSg32a', 'l7TSg32b', 'l7TSg32c', 'l7TSg32d'), c):
    put(key, val)

# -- l7 practice questions
put('l7PSpreadZ', sqrt((np.vdot(ket(35, 0), (2 * Sz) @ (2 * Sz) @ ket(35, 0)).real - np.vdot(ket(35, 0), (2 * Sz) @ ket(35, 0)).real ** 2)) / 2)
psi50 = ket(50, 25)
varx = np.vdot(psi50, Sx @ Sx @ psi50).real - np.vdot(psi50, Sx @ psi50).real ** 2
put('l7PSpreadX', sqrt(varx))
put('l7PRx', 2 * np.vdot(psi50, Sx @ psi50).real)


def ports(p, phi_deg):
    Rz = np.diag([np.exp(-1j * radians(phi_deg) / 2), np.exp(1j * radians(phi_deg) / 2)])
    return (np.linalg.norm((I2 + Rz) @ p / 2) ** 2, np.linalg.norm((I2 - Rz) @ p / 2) ** 2)


put('l7PPort2pi', ports(np.array([1, 1], complex) / sqrt(2), 360)[1])
pe = ket(90, 20)
vx = np.vdot(pe, Sx @ Sx @ pe).real - np.vdot(pe, Sx @ pe).real ** 2
vy = np.vdot(pe, Sy @ Sy @ pe).real - np.vdot(pe, Sy @ pe).real ** 2
put('l7PEquatorProduct', sqrt(vx * vy))
put('l7PEquatorBound', 0.5 * abs(np.vdot(pe, Sz @ pe).real))
put('l7PEquatorRx', 2 * np.vdot(pe, Sx @ pe).real)
put('l7PEquatorRy', 2 * np.vdot(pe, Sy @ pe).real)
tt = radians(50)
Rn = expm_h(SPIN[1.0][1], tt)  # R(t j) = e^{-i t J_y}: |1,1>_n is its first column
put('l7PSpin1Stay', abs(Rn[0, 0]) ** 2)
put('l7PSpin1Reach', abs(Rn[1, 0]) ** 2)
put('l7PSpin1Chain', abs(Rn[0, 0]) ** 2 * abs(Rn[1, 0]) ** 2)
R90 = expm_h(SPIN[1.0][1], pi / 2)
put('l7PSpin1At90', abs(R90[0, 0]) ** 2)

# -- l8-turning:b4b  (one matrix, two readings; chi = 70, phi = 25; the matrix at 30 degrees)
SIGMA_Y = np.array([[0, -1j], [1j, 0]], complex)


def rpol(phi):
    return expm_h(SIGMA_Y, phi)  # cos(phi) - i sin(phi) sigma_y = [[cos, -sin], [sin, cos]]


def pol(chi_deg):
    return np.array([cos(radians(chi_deg)), sin(radians(chi_deg))], complex)


H = np.array([1, 0], complex)
chi, ph = 70, radians(25)
put('l8TAnalyzerTurned', np.vdot(rpol(ph) @ H, pol(chi)).real)  # the analyzer's H' ket, overlapped with the light
put('l8TLightTurned', np.vdot(H, rpol(-ph) @ pol(chi)).real)  # the light turned the other way, overlapped with H
put('l8TTurnP', abs(np.vdot(rpol(ph) @ H, pol(chi))) ** 2)
M30 = rpol(radians(30))
put('l8TS11', M30[0, 0].real)
put('l8TS21', M30[1, 0].real)


# -- l8-polarization:b5b  (a chain of N polarizers, total turn 90 degrees)
def chain(n, total=90.0):
    p_prev = pol(0)
    prob = 1.0
    for k in range(1, n + 1):
        p_k = pol(total * k / n)
        prob *= abs(np.vdot(p_k, p_prev)) ** 2
        p_prev = p_k
    return prob


for nn in (1, 2, 4, 10, 100, 1000):
    put('l8TChain%d' % nn, chain(nn))

# -- l8-photon-spin:b5b  (a wave plate, the spin a beam carries)
D = np.array([1, 1], complex) / sqrt(2)
CP = np.array([1, 1j], complex) / sqrt(2)


def plate_state(delta):
    return np.array([1, np.exp(1j * delta)], complex) / sqrt(2)


put('l8TPlateQuarter', abs(np.vdot(CP, plate_state(pi / 2))) ** 2)
put('l8TPlateHalf', abs(np.vdot(CP, plate_state(pi))) ** 2)
put('l8TPlate45', abs(np.vdot(CP, plate_state(pi / 4))) ** 2)
put('l8TQuarterUm', 0.633 / (4 * 0.0091))
a, b = sqrt(3) / 2, 0.5j
vb = np.array([a, b], complex)
put('l8TJz', np.vdot(vb, SIGMA_Y @ vb).real)
CM = np.array([1, -1j], complex) / sqrt(2)
put('l8TPR', abs(np.vdot(CP, vb)) ** 2)
put('l8TPL', abs(np.vdot(CM, vb)) ** 2)

# -- l8 practice questions
v1 = np.array([sqrt(3 / 5), 1j * sqrt(2 / 5)], complex)
put('l8PChanceY', abs(np.vdot(np.array([0, 1], complex), v1)) ** 2)
put('l8PTorque', np.vdot(v1, SIGMA_Y @ v1).real)
put('l8PPCplus', abs(np.vdot(CP, v1)) ** 2)
put('l8PPCminus', abs(np.vdot(CM, v1)) ** 2)
put('l8PChain8', chain(8))
nmin = next(n for n in range(1, 1000) if chain(n) >= 0.95)
put('l8PChainN', nmin)
put('l8PChain48', chain(48))
put('l8PChain49', chain(49))
waves = 0.0091 * 250 / 0.633
put('l8PPlateWaves', waves)
delta_deg = 360 * (waves - floor(waves))
put('l8PPlateDelta', delta_deg)
put('l8PPlateSin', abs(sin(radians(delta_deg))))
put('l8PPlate', abs(np.vdot(CP, plate_state(radians(delta_deg)))) ** 2)

# ---------------------------------------------------------------- C. engine cases
cases = {}
mats = []
for j in (0.5, 1.0, 1.5, 2.0):
    Jx, Jy, Jz, J2, Jp = SPIN[j]
    mats.append({'j': j, **{nm: {'re': np.round(A.real, 14).tolist(), 'im': np.round(A.imag, 14).tolist()} for nm, A in (('Jx', Jx), ('Jy', Jy), ('Jz', Jz), ('J2', J2))}})
cases['jMatrices'] = mats
zc = []
for j, axis, m in [(0.5, 'y', 0.5), (1.0, 'y', 1), (1.0, 'y', 0), (1.0, 'x', -1), (1.5, 'x', 0.5), (1.5, 'y', -1.5), (2.0, 'x', 1)]:
    zc.append({'j': j, 'axis': axis, 'm': m, 'chances': [float(x) for x in z_chances(j, axis, m)]})
# a tilted axis in the x-z plane: J.n = cos(t) Jz + sin(t) Jx
for j, tdeg, m in [(1.0, 50, 1), (1.5, 70, 0.5), (2.0, 35, -1)]:
    Jx, Jy, Jz = SPIN[j][0], SPIN[j][1], SPIN[j][2]
    A = cos(radians(tdeg)) * Jz + sin(radians(tdeg)) * Jx
    w, v = np.linalg.eigh(A)
    k = int(np.argmin(abs(w - m)))
    zc.append({'j': j, 'axis': {'thetaDeg': tdeg, 'phiDeg': 0}, 'm': m, 'chances': [float(x) for x in np.abs(v[:, k]) ** 2]})
cases['zChances'] = zc
rot = []
for j, axis, tdeg in [(1.0, 'y', 37), (1.5, 'x', 100), (2.0, 'z', 60), (0.5, 'y', 100)]:
    Jx, Jy, Jz = SPIN[j][0], SPIN[j][1], SPIN[j][2]
    U = expm_h({'x': Jx, 'y': Jy, 'z': Jz}[axis], radians(tdeg))
    rot.append({'j': j, 'axis': axis, 'tDeg': tdeg, 're': np.round(U.real, 12).tolist(), 'im': np.round(U.imag, 12).tolist()})
cases['rotJ'] = rot
cases['chain'] = [{'n': n, 'phiDeg': p, 'p': chain(n, p)} for n, p in [(1, 90), (3, 90), (8, 90), (20, 60), (49, 90), (7, 45)]]
sch = []
for th, ph_ in [(60, 45), (90, 60), (30, 200), (120, 310), (0, 0)]:
    cv, cm_, pr = schwarz(Sx, Sy, ket(th, ph_))
    sch.append({'thetaDeg': th, 'phiDeg': ph_, 'cov': float(cv), 'comm': float(cm_), 'prod': float(pr)})
cases['schwarz'] = sch
plate = []
for dn, dd, lam in [(0.0091, 250.0, 0.633), (0.0091, 17.39, 0.633), (0.01, 10.0, 0.5)]:
    delta = 2 * pi * dn * dd / lam
    plate.append({'dn': dn, 'd': dd, 'lambda': lam, 'delta': delta, 'chance': float(abs(np.vdot(CP, plate_state(delta))) ** 2), 'quarter': lam / (4 * dn)})
cases['plate'] = plate
cases['photonJz'] = [{'a': [float(x.real), float(x.imag)], 'b': [float(y.real), float(y.imag)], 'jz': float(np.vdot(np.array([x, y]), SIGMA_Y @ np.array([x, y])).real)} for x, y in [(sqrt(3) / 2 + 0j, 0.5j), (1 / sqrt(2) + 0j, 1j / sqrt(2)), (1 + 0j, 0j), (0.6 + 0j, 0.8 + 0j), (0.6 + 0j, 0.8j)]]

dest = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-448' / 'g2b.json'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(
    json.dumps(
        {
            'about': 'Physics 448 Townsend pass, group G2b (L7-L8): claim values and engine cases, numpy (spin-j matrices from adding 2j spin-1/2s, eigh exponentials, Schwarz pieces from the shifted kets, chains of overlaps). '
            'Regenerate: python3 pipeline/claims_448/g2b.py',
            'values': {k: out[k] for k in sorted(out)},
            'cases': cases,
        },
        indent=1,
    )
    + '\n'
)
print(f'wrote {dest.relative_to(ROOT)} ({len(out)} values)')
