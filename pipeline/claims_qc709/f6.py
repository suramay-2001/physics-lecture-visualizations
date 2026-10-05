#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/F6.values.ts (Physics 709 Foundations, chapter F6
"Tensor products").

Independent route (never F6.values.ts's own helper functions, and never physics/qc/state.ts's or cmat.ts's own
reducers): every ket, gate and operation here is built or computed by direct numpy construction - `np.kron` for the
tensor/Kronecker product (vectors and matrices alike), `.reshape(2, 2)` to read a two-qubit ket's coefficient matrix
off its 4 amplitudes (big-endian: index = 2*a + b, so `psi.reshape(2, 2)[a, b]` is exactly `c_ab`), `np.linalg.det`
and `np.linalg.matrix_rank` for the product-vs-entangled (Schmidt) test, and plain Python int/bit-string arithmetic
for the big-endian index helpers, rather than calling any single "kron"/"coefMatrix"/"indexOfBits" routine.

Units: hbar = 1 (unused here; F6 has no spin averages). Qubit order (big-endian, engine C2): q0 is the leftmost
factor and the most significant bit, matching Python's own `int(bitstring, 2)`.

Usage (from the repo root): python3 pipeline/claims_qc709/f6.py -> app/src/physics/__fixtures__/claims-qc709/f6.json
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
Z = np.array([[1, 0], [0, -1]], complex)
H = np.array([[1, 1], [1, -1]], complex) * R2

# Kets (hand-written; independent of physics/spin.ts and qc/state.ts)
PLUS_Z = np.array([1, 0], complex)
MINUS_Z = np.array([0, 1], complex)
PLUS_X = np.array([1, 1], complex) * R2
MINUS_X = np.array([1, -1], complex) * R2


def inner(a, b):
    """<a|b>, conjugate-linear in the first slot (linalg.ts `inner`'s own convention)."""
    return complex(np.vdot(a, b))


def coef_matrix(psi):
    """A two-qubit ket's 2x2 coefficient matrix, big-endian: index = 2*a + b, so reshape(2, 2) reads C[a, b] = c_ab
    directly, independent of qc/state.ts's own `coefMatrix` (which walks the same index arithmetic by hand)."""
    return np.asarray(psi).reshape(2, 2)


# bit-string helpers, hand-written (independent of qc/state.ts's indexOfBits/bitsOfIndex)
def index_of_bits(bits):
    return int(bits, 2)


def bits_of_index(i, n):
    return format(i, f"0{n}b")


# two-qubit basis kets, built by hand from np.kron (independent of qc/state.ts's `ket`)
KET_00 = np.kron(PLUS_Z, PLUS_Z)
KET_01 = np.kron(PLUS_Z, MINUS_Z)
KET_10 = np.kron(MINUS_Z, PLUS_Z)
KET_11 = np.kron(MINUS_Z, MINUS_Z)
KET_PLUS_PLUS = np.kron(PLUS_X, PLUS_X)
KET_PLUS_ZERO = np.kron(PLUS_X, PLUS_Z)
KET_PLUS_MINUS = np.kron(PLUS_X, MINUS_X)
BELL_00_11 = (KET_00 + KET_11) * R2
BELL_01_10 = (KET_01 + KET_10) * R2

XI = np.kron(X, I2)
IX = np.kron(I2, X)
IZ = np.kron(I2, Z)
XI_BY_HAND = np.array(
    [
        [0, 0, 1, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 0],
        [0, 1, 0, 0],
    ],
    complex,
)
assert np.allclose(XI, XI_BY_HAND), "X kron I2 must match the hand-built block matrix"

C_PLUS_PLUS = coef_matrix(KET_PLUS_PLUS)
C_BELL = coef_matrix(BELL_00_11)
C_PSI_01_10 = coef_matrix(BELL_01_10)
V2 = np.kron(H, H) @ BELL_00_11
C_BELL_X = coef_matrix(V2)

# the inner-product-factors check (D5): a = |+x>, b = |-x>, c = |+z>, d = |-x>
A_VEC, B_VEC, C_VEC, D_VEC = PLUS_X, MINUS_X, PLUS_Z, MINUS_X
LHS = inner(np.kron(A_VEC, B_VEC), np.kron(C_VEC, D_VEC))
RHS = inner(A_VEC, C_VEC) * inner(B_VEC, D_VEC)
assert abs(LHS - RHS) < 1e-12, "inner products must factor over the tensor product"

values = {
    # f6-pairs
    "f6TwoQDim": float(2**2),
    "f6DimRule": float(2 * 2),
    "f6Idx10": float(index_of_bits("10")),
    "f6Bits3": float(int(bits_of_index(3, 2))),
    "f6Strings": float(2**3),
    "f6Idx110": float(index_of_bits("110")),
    "f6RegLen": float(len(BELL_00_11)),
    "f6TenDim": float(2**10),
    "f6AddWrong": float(2 * 10),
    # f6-kron
    "f6PlusZero": yes(np.isclose(KET_PLUS_ZERO[0], R2) and np.isclose(KET_PLUS_ZERO[2], R2)),
    "f6PlusZeroRe": KET_PLUS_ZERO[0].real,
    "f6PlusMinus": yes(np.isclose(KET_PLUS_MINUS[1], -0.5)),
    "f6PlusMinusRe": KET_PLUS_MINUS[0].real,
    "f6Idx01": float(index_of_bits("01")),
    # f6-operator
    "f6XI": yes(np.allclose(XI, XI_BY_HAND)),
    "f6XIdim": float(XI.shape[0]),
    "f6XIon01": yes(np.allclose(XI @ KET_01, KET_11)),
    "f6Idx11": float(index_of_bits("11")),
    "f6LocalCommute": float(np.max(np.abs(XI @ IZ - IZ @ XI))),
    "f6XIeqIX": yes(np.allclose(XI, IX)),
    "f6IXon01": yes(np.allclose(IX @ KET_01, KET_00)),
    # f6-product-or-not
    "f6ProdDet": np.linalg.det(C_PLUS_PLUS).real,
    "f6ProdEntry": C_PLUS_PLUS[0, 0].real,
    "f6ProdIsProduct": yes(np.linalg.matrix_rank(C_PLUS_PLUS) == 1),
    "f6BellDet": np.linalg.det(C_BELL).real,
    "f6BellSchmidt": float(np.linalg.matrix_rank(C_BELL)),
    "f6BellEntangled": yes(np.linalg.matrix_rank(C_BELL) == 1),
    "f6BellSchmidtX": float(np.linalg.matrix_rank(C_BELL_X)),
    "f6Psi01isProduct": yes(np.linalg.matrix_rank(C_PSI_01_10) == 1),
    # f6-growth
    "f6ProdNorm": float(np.linalg.norm(KET_PLUS_MINUS)),
    "f6InnerFactor": yes(abs(LHS - RHS) < 1e-9),
    "f6BasisCount": float(2**3),
    "f6Mem30": float(2**30 * 16) / float(2**30),
    "f6Mem50": float(2**50 * 16) / float(2**50),
    "f6Params10General": float(2 * 2**10 - 2),
    "f6Params10Product": float(2 * 10),
    "f6ProdFrac": (2 * 10) / (2 * 2**10 - 2),
}

values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "f6.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim twins for Physics 709 chapter F6, numpy built directly from hand-written kets/gates via "
            "np.kron, reshape, det and matrix_rank, independent of the engine's own reducers. Regenerate: "
            "python3 pipeline/claims_qc709/f6.py",
            "values": values,
        },
        indent=1,
    )
    + "\n"
)
