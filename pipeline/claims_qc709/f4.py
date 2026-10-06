#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/F4.values.ts (Physics 709 Foundations, chapter F4
"Eigenvalues, Hermitian and unitary operators, the spectral theorem").

Independent route (never F4.values.ts's own helper functions, and never app/src/physics/qc/cmat.ts's `eigh`/`eigen2`/
`svd`/`funcHermitian`): every gate, ket and operation here is built or computed by direct numpy construction -
`numpy.linalg.eigh` for the Hermitian eigenproblem (own canonical-phase fix-up below, matching the engine's own
convention independently), `numpy.linalg.eig`/the closed-form quadratic for a general 2x2, `numpy.linalg.svd` for
singular values, and a hand-written spectral sum / functional calculus rather than calling a single "funcHermitian"
routine.

Phase convention (BUILD-LOG "Locked decisions"; cmat.ts `canonicalPhase`): an eigenvector is rescaled so its first
non-negligible component is real and >= 0. `canonical_phase` below reimplements this from scratch so the two
routes can disagree if either one's convention drifts.

Units: hbar = 1 (unused here; F4 has no spin averages). Matrices are row-major, M[i][j] = <i|M|j>, matching the
engine's own convention (physics/linalg.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/f4.py -> app/src/physics/__fixtures__/claims-qc709/f4.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key, to 1e-12). Output is deterministic: two runs
write byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

R2 = 1 / np.sqrt(2)


def yes(b):
    return 1.0 if b else 0.0


# Gates (hand-written, independent of qc/gates.ts)
I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], complex)
Y = np.array([[0, -1j], [1j, 0]], complex)
Z = np.array([[1, 0], [0, -1]], complex)
H = np.array([[1, 1], [1, -1]], complex) * R2
S = np.array([[1, 0], [0, 1j]], complex)

# Kets (hand-written; q0's own two-level basis, not qc/state.ts)
PLUS_Z = np.array([1, 0], complex)
MINUS_Z = np.array([0, 1], complex)
PLUS_X = np.array([1, 1], complex) * R2
MINUS_X = np.array([1, -1], complex) * R2


def inner(a, b):
    """<a|b>, conjugate-linear in the first slot (linalg.ts `inner`'s own convention)."""
    return complex(np.vdot(a, b))


def outer(a, b):
    """|a><b|, i.e. a (b*)^T."""
    return np.outer(a, np.conj(b))


def dagger(A):
    return A.conj().T


def max_diff(A, B):
    return float(np.max(np.abs(A - B)))


def max_abs(A):
    return float(np.max(np.abs(A)))


def canonical_phase(v):
    """Rescale v so its first non-negligible component is real >= 0 (cmat.ts `canonicalPhase`, reimplemented)."""
    v = np.array(v, dtype=complex)
    for k in v:
        if abs(k) > 1e-12:
            return v / (k / abs(k))
    return v


def eigh_sorted(M):
    """Ascending eigenvalues (numpy.linalg.eigh already gives this for a Hermitian input) with canonical-phase
    eigenvectors as columns - independent of cmat.ts's cyclic-Jacobi `eigh`."""
    vals, vecs = np.linalg.eigh(M)
    vecs = vecs.copy()
    for i in range(vecs.shape[1]):
        vecs[:, i] = canonical_phase(vecs[:, i])
    return vals.real, vecs


def eig_general(M):
    """Eigenvalues of ANY 2x2 matrix by the closed-form quadratic (half +/- root), independent of `eigen2`'s own
    code path (which this mirrors structurally but not by calling it)."""
    tr = np.trace(M)
    det = np.linalg.det(M)
    half = tr / 2
    root = np.sqrt(half**2 - det + 0j)
    return np.array([half + root, half - root])


def null_dim(M, tol=1e-9):
    """dim ker M via the singular values (a defective eigenspace has a 1-dimensional kernel of A - lambda*I)."""
    s = np.linalg.svd(M, compute_uv=False)
    return int(np.sum(s < tol))


def from_eigen(weights, vectors):
    """Sum_k w_k |v_k><v_k| (cmat.ts `fromEigen`, reimplemented)."""
    n = len(vectors[0])
    M = np.zeros((n, n), dtype=complex)
    for w, v in zip(weights, vectors):
        M = M + w * outer(v, v)
    return M


def func_hermitian(M, f):
    """f(M) = Sum_k f(lambda_k) |v_k><v_k| (cmat.ts `funcHermitian`, reimplemented from scratch)."""
    vals, vecs = eigh_sorted(M)
    return from_eigen([f(x) for x in vals], [vecs[:, k] for k in range(len(vals))])


def sqrt_psd(M):
    return func_hermitian(M, lambda x: np.sqrt(max(x, 0.0)))


def expm_hermitian(M, t):
    return func_hermitian(M, lambda x: np.cos(x * t) - 1j * np.sin(x * t))


def decompose_herm(M):
    """M = a0*I + a.sigma (Hermitian 2x2 only)."""
    a0 = np.trace(M).real / 2
    ax = np.trace(M @ X).real / 2
    ay = np.trace(M @ Y).real / 2
    az = np.trace(M @ Z).real / 2
    return a0, np.array([ax, ay, az])


def unitary_action_angle(M, tau):
    """The Bloch-sphere turn angle of e^{-i*M*tau} for a Hermitian M = a0*I + a.sigma: 2*|a|*tau."""
    _, a = decompose_herm(M)
    return 2 * float(np.linalg.norm(a)) * tau


def bloch_theta_deg(psi):
    psi = psi / np.linalg.norm(psi)
    a, b = psi
    ab = np.conj(a) * b
    z = abs(a) ** 2 - abs(b) ** 2
    return float(np.degrees(np.arccos(np.clip(z, -1, 1))))


def bloch_phi_deg(psi):
    """The azimuth of a qubit ket: the phase of conj(a)*b, in degrees (independent of the engine's blochAngles)."""
    psi = psi / np.linalg.norm(psi)
    a, b = psi
    return float(np.degrees(np.angle(np.conj(a) * b)))


def commutator(A, B):
    return A @ B - B @ A


# A second, independent check of the adjoint's DEFINING relation, for S (as f3.py does)
for phi in (PLUS_Z, MINUS_Z):
    for psi in (PLUS_Z, MINUS_Z):
        lhs = inner(phi, S @ psi)
        rhs = inner(dagger(S) @ phi, psi)
        assert abs(lhs - rhs) < 1e-12, "adjoint defining relation failed for S"

# Running examples (plan P-F4-story.md §0 "Running examples")
XZhalf = 0.5 * (X + Z)  # eigenvalues +/- 1/sqrt2, eigenvectors |+n>, |-n> at 45/135 deg
Pplusx = outer(PLUS_X, PLUS_X)  # |+x><+x|: eigenvalues 1, 0
halfIplusX = 0.5 * (I2 + X)  # equals Pplusx
R = np.array([[0, -1], [1, 0]], complex)  # the quarter-turn: eigenvalues +/- i
N = np.array([[2, 1], [0, 2]], complex)  # the shear: defective, one eigenvalue 2
ZZ = np.kron(Z, Z)  # Z (x) Z: eigenvalues +/-1, each doubly degenerate
HermEx1 = np.array([[2, 1j], [-1j, 2]], complex)  # a Hermitian example: eigenvalues 1, 3
Diag49 = np.array([[4, 0], [0, 9]], complex)  # sqrt is diag(2, 3)
IplusXZhalf = I2 + XZhalf  # positive but not a projector: eigenvalues 1 +/- 1/sqrt2
P0 = outer(PLUS_Z, PLUS_Z)  # |0><0| = diag(1, 0)

valsXZ, vecsXZ = eigh_sorted(XZhalf)
valsX, vecsX = eigh_sorted(X)
valsZ, vecsZ = eigh_sorted(Z)
valsZZ, vecsZZ = eigh_sorted(ZZ)
valsProj, vecsProj = eigh_sorted(Pplusx)
valsHerm1, _ = eigh_sorted(HermEx1)
valsIXZ, _ = eigh_sorted(IplusXZhalf)

# Self-check: eigh_sorted actually solves the eigenproblem (A v = lambda v)
for vals, vecs, M in ((valsXZ, vecsXZ, XZhalf), (valsZZ, vecsZZ, ZZ)):
    for k in range(len(vals)):
        assert np.allclose(M @ vecs[:, k], vals[k] * vecs[:, k], atol=1e-9), "eigh_sorted self-check failed"

valsR = eig_general(R)
valsN = eig_general(N)
shearVecCount = null_dim(N - valsN[0].real * I2)

zzPlusCols = [vecsZZ[:, k] for k in range(4) if valsZZ[k] > 0]
zzMinusCols = [vecsZZ[:, k] for k in range(4) if valsZZ[k] < 0]
Pplus = sum((outer(v, v) for v in zzPlusCols), np.zeros((4, 4), dtype=complex))
Pminus = sum((outer(v, v) for v in zzMinusCols), np.zeros((4, 4), dtype=complex))

funcX2 = func_hermitian(X, lambda x: x * x)
funcZ2 = func_hermitian(Z, lambda x: x * x)
valsFuncX2, _ = eigh_sorted(funcX2)
fromEigenX = from_eigen([1, -1], [PLUS_X, MINUS_X])
fromEigenI = from_eigen([1, 1], [PLUS_X, MINUS_X])
sqrtHalfIX = sqrt_psd(halfIplusX)
valsSqrtHalfIX, _ = eigh_sorted(sqrtHalfIX)

commXZ = commutator(X, Z)
commIX = commutator(I2, X)
simulOk = yes(max_abs(commutator(Z, P0)) < 1e-9)
# Pair each Z-eigenvalue with P0's value on that same eigenvector (Z and P0 are simultaneously diagonal)
zp_plus = None
zp_minus = None
for k in range(2):
    p0val = (vecsZ[:, k].conj() @ P0 @ vecsZ[:, k]).real
    if valsZ[k] > 0:
        zp_plus = float(p0val)
    else:
        zp_minus = float(p0val)
noSimul = yes(max_abs(commutator(X, Z)) > 1e-9)

svdN_s = np.linalg.svd(N, compute_uv=False)
sqrtDiag49 = sqrt_psd(Diag49)

values = {
    # f4-eigen
    "f4XZvalLow": valsXZ[0],
    "f4XZvalHigh": valsXZ[1],
    "f4XZvecPlus0": vecsXZ[0, 1].real,
    "f4XZvecPlus1": vecsXZ[1, 1].real,
    "f4XZtr": np.trace(XZhalf).real,
    "f4XZdet": np.linalg.det(XZhalf).real,
    "f4XZpolyDet": np.poly(XZhalf)[2].real,  # the characteristic polynomial's constant term, from the eigenvalues
    "f4XZgap": valsXZ[1] - valsXZ[0],
    "f4ZZvalLow": valsZZ[0],
    "f4ZZvalHigh": valsZZ[3],
    "f4ShearEigVal": valsN[0].real,
    "f4ShearVecCount": float(shearVecCount),
    "f4RPoly0": 1.0,
    "f4RPoly1": -np.trace(R).real,
    "f4RPoly2": np.linalg.det(R).real,
    "f4RValRe": valsR[0].real,
    "f4RValIm": abs(valsR[0].imag),
    # f4-hermitian
    "f4XHerm": yes(np.allclose(dagger(X), X)),
    "f4XEqAdj": yes(np.allclose(X, dagger(X))),
    "f4XvalLow": valsX[0],
    "f4XvalHigh": valsX[1],
    "f4XZvecMinus0": vecsXZ[0, 0].real,
    "f4XZvecMinus1": vecsXZ[1, 0].real,
    "f4XZvecMinusResid": max_abs(XZhalf @ vecsXZ[:, 0] - valsXZ[0] * vecsXZ[:, 0]),
    "f4XZminusThetaDeg": bloch_theta_deg(vecsXZ[:, 0]),
    "f4XZminusPhiDeg": abs(bloch_phi_deg(vecsXZ[:, 0])),
    "f4XZplusThetaDeg": bloch_theta_deg(vecsXZ[:, 1]),
    "f4XZhalfEntry": XZhalf[0, 0].real,
    "f4HalfIXentry": halfIplusX[0, 1].real,
    "f4HalfZentry": (0.5 * Z)[0, 0].real,
    "f4PzCoef": np.trace(P0).real / 2,
    "f4XZorth": abs(inner(vecsXZ[:, 1], vecsXZ[:, 0]).real),
    "f4ZZplusRank": float(len(zzPlusCols)),
    # f4-spectral
    "f4XspectralGap": max_diff(fromEigenX, X),
    "f4XsqIsI": max_diff(funcX2, I2),
    "f4HalfIXsqrtValLow": valsSqrtHalfIX[0],
    "f4HalfIXsqrtValHigh": valsSqrtHalfIX[1],
    "f4ZZprojDiff": max_diff(Pplus - Pminus, ZZ),
    "f4ZsqIsI": max_diff(funcZ2, I2),
    "f4XsqEigVal": valsFuncX2[0],
    "f4SpectralRebuildTR": fromEigenX[0, 1].real,
    # f4-unitary
    "f4Hunitary": yes(np.allclose(dagger(H) @ H, I2)),
    "f4HdH": max_diff(dagger(H) @ H, I2),
    "f4HonZero0": (H @ PLUS_Z)[0].real,
    "f4HonZero1": (H @ PLUS_Z)[1].real,
    "f4HpreservesNorm": float(np.linalg.norm(H @ np.array([0.6, 0.8j], dtype=complex))),
    "f4SAbsEig": float(abs(np.linalg.eigvals(S)[0])),
    "f4RzQuarterRe": expm_hermitian(Z, np.pi / 4)[0, 0].real,
    "f4RzQuarterIm": expm_hermitian(Z, np.pi / 4)[0, 0].imag,
    "f4RzActionAngle": unitary_action_angle(0.5 * Z, np.pi / 2),
    "f4RzEigRe": expm_hermitian(0.5 * Z, np.pi / 2)[0, 0].real,
    "f4RzEigIm": expm_hermitian(0.5 * Z, np.pi / 2)[0, 0].imag,
    "f4RzHalfPiAngleDeg": unitary_action_angle(Z, np.pi / 2) * 180 / np.pi,
    "f4XIsUnitary": yes(np.allclose(dagger(X) @ X, I2)),
    # f4-commuting
    "f4ZPsimulOk": simulOk,
    "f4ZPvalBatPlus": zp_plus,
    "f4ZPvalBatMinus": zp_minus,
    "f4XZcomm": max_abs(commXZ),
    "f4XZnoSimul": noSimul,
    "f4Icomm": max_abs(commIX),
    "f4IbasisDiff": max_diff(fromEigenI, I2),
    # f4-positive
    "f4ProjValLow": valsProj[0],
    "f4ProjValHigh": valsProj[1],
    "f4ZvalNeg": valsZ[0],
    "f4HalfIXisProj": max_diff(halfIplusX, Pplusx),
    "f4SqrtProjDiff": max_diff(sqrt_psd(Pplusx), Pplusx),
    "f4ShearSV0": float(svdN_s[0]),
    "f4ShearSV1": float(svdN_s[1]),
    "f4PosNotProjLow": valsIXZ[0],
    "f4PosNotProjHigh": valsIXZ[1],
    "f4ProjIdemDiff": max_diff(Pplusx @ Pplusx, Pplusx),
    # challenges
    "f4ETrace": np.trace(from_eigen([3, -1], [np.array([1, 0], complex), np.array([0, 1], complex)])).real,
    "f4HermEx1Max": valsHerm1[1],
    "f4PlusMinusXOverlap": abs(inner(PLUS_X, MINUS_X).real),
    "f4SqrtDiag49Val": sqrtDiag49[1, 1].real,
    "f4ExpHalfZPiRe": expm_hermitian(0.5 * Z, np.pi)[0, 0].real,
}

values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "f4.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim twins for Physics 709 chapter F4, numpy built directly from hand-written gates/kets, "
            "independent of the engine's own eigh/eigen2/svd/funcHermitian. Regenerate: python3 pipeline/claims_qc709/f4.py",
            "values": values,
        },
        indent=1,
    )
    + "\n"
)
