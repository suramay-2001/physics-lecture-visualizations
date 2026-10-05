#!/usr/bin/env python3
"""Claim twins for Physics 709 chapter F2 "Vectors and inner products", computed with numpy by routes other than the
engine's (app/src/physics/linalg.ts, physics/qc/cmat.ts). One number per key of `V` in app/src/content/qc709/F2.values.ts.

The engine computes inner products as a loop (conjugate-linear in the first slot), Gram-Schmidt by subtracting
projections one vector at a time, and eigenvalues by a cyclic Jacobi sweep. This script instead uses:
  - numpy's own `np.vdot` (conjugate-linear in its first argument, matching the engine's convention) for inner products;
  - `np.linalg.qr` (a DIFFERENT algorithm than the engine's Gram-Schmidt-by-hand) for the two orthonormalizations,
    fixed to a canonical phase (first nonzero entry real and positive) so it can be compared entry by entry;
  - `np.linalg.matrix_rank` for independence, instead of the engine's residual-after-projection test;
  - `np.linalg.eigh` (a different algorithm than the engine's Jacobi sweep) for the spin-1 S_x eigenvalue;
  - closed-form arithmetic (hypot, arccos) for norms, angles and the Cauchy-Schwarz/triangle checks.
Agreement with the engine is therefore evidence, not the same code checking itself.

Usage (from the repo root): python3 pipeline/claims_qc709/f2.py
  -> app/src/physics/__fixtures__/claims-qc709/f2.json (byte-identical on every run)
Checked by app/src/content/claims.test.ts (engine <-> numpy per key, to 1e-12; displayed numbers <-> claims in scope).
"""
import json
import math
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
R2 = 1 / math.sqrt(2)


def canon(v):
    """Fix the global phase so the first non-negligible entry is real and positive (the engine's own convention)."""
    v = np.array(v, dtype=complex)
    for x in v:
        if abs(x) > 1e-12:
            return v * (abs(x) / x)
    return v


KET = {
    "+z": np.array([1, 0], dtype=complex),
    "-z": np.array([0, 1], dtype=complex),
    "+x": np.array([R2, R2], dtype=complex),
    "-x": np.array([R2, -R2], dtype=complex),
    "+y": np.array([R2, 1j * R2], dtype=complex),
    "-y": np.array([R2, -1j * R2], dtype=complex),
}


def inner(a, b):
    """Engine convention: conjugate-linear in the FIRST slot, matching np.vdot(a, b) = sum(conj(a) * b)."""
    return complex(np.vdot(a, b))


def norm(v):
    return float(np.linalg.norm(v))


def angle_between(a, b):
    x = inner(a, b).real / (norm(a) * norm(b))
    return math.acos(max(-1.0, min(1.0, x)))


def is_independent(vs, rtol=1e-10):
    M = np.array(vs, dtype=complex)
    return int(np.linalg.matrix_rank(M, tol=rtol) == len(vs))


def orthonormalize_qr(vs):
    """QR with a positive-real-first-entry convention, a route independent of the engine's own Gram-Schmidt loop."""
    M = np.array(vs, dtype=complex).T  # columns = vectors
    Q, R = np.linalg.qr(M)
    cols = [canon(Q[:, i]) for i in range(Q.shape[1]) if abs(R[i, i]) > 1e-10 * max(1.0, np.abs(np.diag(R)).max())]
    return cols


def components(psi, basis):
    B = np.array(basis, dtype=complex).T
    return np.linalg.solve(B, np.array(psi, dtype=complex))


PSI = np.array([0.6, 0.8], dtype=complex)
Z_BASIS = [KET["+z"], KET["-z"]]
X_BASIS = [KET["+x"], KET["-x"]]

# the spin-1 S_x matrix (ladder-operator matrix elements for j=1), diagonalized by np.linalg.eigh (a different
# algorithm than the engine's cyclic Jacobi sweep); the standard |+-1x> inputs to the Gram-Schmidt check
SX1 = np.array([[0, R2, 0], [R2, 0, R2], [0, R2, 0]], dtype=complex)
PLUS1X = np.array([0.5, R2, 0.5], dtype=complex)
MINUS1X = np.array([0.5, -R2, 0.5], dtype=complex)
Z1_PLUS = np.array([1, 0, 0], dtype=complex)

e_gs2 = orthonormalize_qr([KET["+x"], KET["+z"]])
e_gsC = orthonormalize_qr([np.array([1, 1j], dtype=complex), np.array([1, 0], dtype=complex)])
e_gsSpin1 = orthonormalize_qr([PLUS1X, MINUS1X, Z1_PLUS])
eigvals_sx1 = np.sort(np.linalg.eigvalsh(SX1))

resid_gs2 = KET["+z"] - KET["+x"] * inner(KET["+x"], KET["+z"])
dx = components(PSI, X_BASIS)
dz = components(PSI, Z_BASIS)

values = {
    # f2-vectors
    "f2PlusXAmps": KET["+x"][0].real,
    "f2SumZX": norm(KET["+z"] + KET["+x"]),
    "f2PlusZAmps": KET["+z"][0].real,
    "f2MinusXAmps": KET["-x"][0].real,
    "f2DepThree": float(is_independent([np.array([1, 0], dtype=complex), np.array([0, 1], dtype=complex), np.array([1, 1], dtype=complex)])),
    "f2VAmp": KET["-x"][1].real,
    "f2VSuper": PSI[1].real,
    # f2-inner-product
    "f2InnerZX": inner(KET["+z"], KET["+x"]).real,
    "f2InnerXY": inner(KET["+x"], KET["+y"]).real,
    "f2InnerXYIm": inner(KET["+x"], KET["+y"]).imag,
    "f2InnerYX": inner(KET["+y"], KET["+x"]).real,
    "f2InnerYXImNeg": -inner(KET["+y"], KET["+x"]).imag,
    "f2InnerYY": inner(KET["+y"], KET["+y"]).real,
    "f2BilinearYY": complex(np.sum(KET["+y"] * KET["+y"])).real,
    "f2WeightedXZ": complex(np.vdot(KET["+x"], np.diag([2, 1]) @ KET["+z"])).real,
    "f2InnerXYabs2": abs(inner(KET["+x"], KET["+y"])) ** 2,
    # f2-norm-angle
    "f2NormZplusX": norm(KET["+z"] + KET["+x"]),
    "f2NormPlusX": norm(KET["+x"]),
    "f2OrthXmX": inner(KET["+x"], KET["-x"]).real,
    "f2OrthZmZ": inner(KET["+z"], KET["-z"]).real,
    "f2PythVal": norm(KET["+x"] + KET["-x"]) ** 2,
    "f2AngleZX": math.degrees(angle_between(KET["+z"], KET["+x"])),
    "f2AngleXmX": math.degrees(angle_between(KET["+x"], KET["-x"])),
    "f2CS": abs(inner(KET["+z"], KET["+x"])),
    "f2TriStrict": norm(KET["+z"] + KET["-z"]),
    "f2TriEqual": norm(np.array([1, 0], dtype=complex) + np.array([2, 0], dtype=complex)),
    # f2-orthonormal
    "f2IndepZmZ": float(is_independent(Z_BASIS)),
    "f2IndepXZ": float(is_independent([KET["+x"], KET["+z"]])),
    "f2CompZ": dz[0].real,
    "f2CompZ2": dz[1].real,
    "f2CompX": dx[0].real,
    "f2CompXNeg": -dx[1].real,
    "f2ParsevalX": float(np.sum(np.abs(dx) ** 2)),
    "f2Completeness": 1.0 if np.allclose(np.outer(KET["+z"], KET["+z"].conj()) + np.outer(KET["-z"], KET["-z"].conj()), np.eye(2)) else 0.0,
    # f2-gram-schmidt
    "f2IndepXZb": float(is_independent([KET["+x"], KET["+z"]])),
    "f2GsUnitShadow": inner(KET["+x"], KET["+z"]).real,
    "f2GsUnitResid": resid_gs2[0].real,
    "f2GsUnitResidNeg": -resid_gs2[1].real,
    "f2GsUnitE1": e_gs2[0][0].real,
    "f2GsUnitE2": e_gs2[1][0].real,
    "f2GsUnitE2Neg": -e_gs2[1][1].real,
    "f2GsCE1": e_gsC[0][1].imag,
    "f2GsCE2Neg": -e_gsC[1][1].imag,
    "f2GsCOrtho": 1.0 if abs(inner(e_gsC[0], e_gsC[1])) < 1e-9 else 0.0,
    "f2GsComplexSize": abs(e_gsC[0][1]),
    "f2IndepFalse": float(is_independent([np.array([1, 1], dtype=complex), np.array([2, 2], dtype=complex)])),
    "f2GsDepLen": float(len(orthonormalize_qr([np.array([1, 1], dtype=complex), np.array([2, 2], dtype=complex)]))),
    # f2-gs-spin1 (709 HW1 P5, submitted)
    "f2GsSpin1": float(eigvals_sx1[1]),
    "f2GsSpin1Check": complex(np.vdot(e_gsSpin1[2], SX1 @ e_gsSpin1[2])).real,
}

values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "f2.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim twins for Physics 709 chapter F2, numpy (np.vdot, np.linalg.qr, np.linalg.eigh, "
            "np.linalg.matrix_rank) by routes other than the engine's. Regenerate: python3 pipeline/claims_qc709/f2.py",
            "values": values,
        },
        indent=1,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
