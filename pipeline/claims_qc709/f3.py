#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/F3.values.ts (Physics 709 Foundations, chapter F3
"Matrices and linear maps").

Independent route (never F3.values.ts's own helper functions, and never physics/linalg.ts's reducers): every gate,
ket and operation here is built or computed by direct numpy construction - explicit 2x2 complex arrays for X, Y, Z,
H, S, the `@` operator for matrix products, `.conj().T` for the adjoint (cross-checked at least once against the
defining relation <phi|A psi> = <A-dagger phi|psi>), and the change-of-basis matrix U built directly from the
overlap formula U_ij = <new_i|old_j> (a row per new basis bra), rather than calling any single "changeU" helper.

Units: hbar = 1 (unused here; F3 has no spin averages). Matrices are row-major, M[i][j] = <i|M|j>, matching the
engine's own convention (physics/linalg.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/f3.py -> app/src/physics/__fixtures__/claims-qc709/f3.json
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


# A second, independent check of the adjoint's DEFINING relation (not just conjugate-transpose), for S: <phi|A psi>
# should equal <A-dagger phi|psi> for every phi, psi in the computational basis.
for phi in (PLUS_Z, MINUS_Z):
    for psi in (PLUS_Z, MINUS_Z):
        lhs = inner(phi, S @ psi)
        rhs = inner(dagger(S) @ phi, psi)
        assert abs(lhs - rhs) < 1e-12, "adjoint defining relation failed for S"

# Change-of-basis matrix U (z -> x): U_ij = <new_i|old_j>, built row by row from the overlap formula directly,
# independent of any single "changeU" routine. The old basis is the standard one, so U's columns are just the new
# basis bras written out.
U = np.array([[inner(PLUS_X, PLUS_Z), inner(PLUS_X, MINUS_Z)], [inner(MINUS_X, PLUS_Z), inner(MINUS_X, MINUS_Z)]], complex)
assert np.allclose(U, H), "U (z->x) must equal H"

HX = H @ X
HXH = H @ X @ H
HZH = H @ Z @ H
XZ = X @ Z
ZX = Z @ X
UZUd = U @ Z @ dagger(U)
UXUd = U @ X @ dagger(U)

values = {
    # f3-linear-maps
    "f3Xplusz": (X @ PLUS_Z)[1].real,
    "f3Xminusz": (X @ MINUS_Z)[0].real,
    "f3Zminusz": (Z @ MINUS_Z)[1].real,
    "f3ProjZ": (outer(PLUS_Z, PLUS_Z) @ np.array([0.6, 0.8], complex))[1].real,
    "f3Identity": (I2 @ PLUS_X)[0].real,
    "f3SquareNonlinear": float(2**2 - 2 * 1),
    # f3-matrix-of-map
    "f3MatX": inner(MINUS_Z, X @ PLUS_Z).real,
    "f3ActionHc": (H @ np.array([0.6, 0.8], complex))[0].real,
    "f3MatH": H[1][1].real,
    "f3XouterSum": (outer(PLUS_Z, MINUS_Z) + outer(MINUS_Z, PLUS_Z))[0][1].real,
    "f3XelemZmz": inner(PLUS_Z, X @ MINUS_Z).real,
    # f3-products
    "f3HX": HX[0][0].real,
    "f3HXH": HXH[1][1].real,
    "f3HZH": HZH[0][1].real,
    "f3XZ": XZ[0][1].real,
    "f3ZX": ZX[0][1].real,
    "f3XZeqNegZX": yes(np.allclose(XZ, -ZX)),
    "f3Xsq": (X @ X)[0][0].real,
    "f3Hsq": (H @ H)[0][0].real,
    # f3-adjoint
    "f3Sdag": dagger(S)[1][1].imag,
    "f3SdagEntry": inner(MINUS_Z, dagger(S) @ MINUS_Z).imag,
    "f3ProdDag": yes(np.allclose(dagger(X @ Z), ZX)),
    "f3OuterDag": yes(np.allclose(dagger(outer(PLUS_Z, MINUS_Z)), outer(MINUS_Z, PLUS_Z))),
    "f3Hdag": yes(np.allclose(dagger(H), H)),
    "f3Xdag": yes(np.allclose(dagger(X), X)),
    "f3SdagS": (dagger(S) @ S)[0][0].real,
    "f3SHermGap": yes(np.allclose(dagger(S), S)),
    "f3YHerm": yes(np.allclose(dagger(Y), Y)),
    # f3-change-of-basis
    "f3Ux": U[0][0].real,
    "f3PluszInX": (U @ PLUS_Z)[0].real,
    "f3InnerPlusXZ": inner(PLUS_X, PLUS_Z).real,
    "f3ZinX": UZUd[0][1].real,
    "f3Uunitary": (dagger(U) @ U)[0][0].real,
    "f3XinX": UXUd[0][0].real,
}

values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "f3.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim twins for Physics 709 chapter F3, numpy built directly from hand-written gates/kets, "
            "independent of the engine's own reducers. Regenerate: python3 pipeline/claims_qc709/f3.py",
            "values": values,
        },
        indent=1,
    )
    + "\n"
)
