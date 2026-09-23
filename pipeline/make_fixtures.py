#!/usr/bin/env python3
"""Reference values for the TypeScript physics engine, computed independently with numpy.

The engine uses closed forms (a₀ ± |a| eigenvalues, cos/sin rotation formula); this script
uses numpy.linalg.eigh and spectral exponentials instead, so agreement is real evidence and
not the same code checking itself.

Usage: python3 pipeline/make_fixtures.py  → app/src/physics/__fixtures__/numpy.json
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(448)

sx = np.array([[0, 1], [1, 0]], complex) / 2
sy = np.array([[0, -1j], [1j, 0]], complex) / 2
sz = np.array([[1, 0], [0, -1]], complex) / 2


def cplx(z):
    return {"re": float(np.real(z)), "im": float(np.imag(z))}


def vec(v):
    return [cplx(x) for x in v]


def mat(m):
    return [[cplx(x) for x in row] for row in m]


def rand_state():
    v = rng.normal(size=2) + 1j * rng.normal(size=2)
    return v / np.linalg.norm(v)


def rand_hermitian():
    a = rng.normal(size=(2, 2)) + 1j * rng.normal(size=(2, 2))
    return (a + a.conj().T) / 2


def expm_hermitian(H, t):
    """exp(-i t H) through the eigen-decomposition (not the closed form the engine uses)."""
    w, V = np.linalg.eigh(H)
    return V @ np.diag(np.exp(-1j * t * w)) @ V.conj().T


states = []
for _ in range(20):
    psi = rand_state()
    ev = lambda A: float(np.real(psi.conj() @ A @ psi))
    states.append({
        "psi": vec(psi),
        "Sx": ev(sx), "Sy": ev(sy), "Sz": ev(sz),
        "varSx": ev(sx @ sx) - ev(sx) ** 2,
        "bloch": [2 * ev(sx), 2 * ev(sy), 2 * ev(sz)],
    })

hermitians = []
for _ in range(20):
    H = rand_hermitian()
    w, V = np.linalg.eigh(H)  # ascending
    order = np.argsort(-w)
    hermitians.append({
        "M": mat(H),
        "values": [float(w[i]) for i in order],
        # projectors are phase-independent, so compare those rather than eigenvectors
        "projectors": [mat(np.outer(V[:, i], V[:, i].conj())) for i in order],
    })

rotations = []
for _ in range(15):
    n = rng.normal(size=3)
    n /= np.linalg.norm(n)
    phi = float(rng.uniform(-2 * np.pi, 2 * np.pi))
    H = n[0] * sx + n[1] * sy + n[2] * sz
    psi = rand_state()
    U = expm_hermitian(H, phi)
    out = U @ psi
    rotations.append({
        "n": n.tolist(), "phi": phi, "U": mat(U), "psi": vec(psi),
        "bloch_after": [float(np.real(2 * out.conj() @ A @ out)) for A in (sx, sy, sz)],
    })

basis_changes = []
for _ in range(10):
    Q, _ = np.linalg.qr(rng.normal(size=(2, 2)) + 1j * rng.normal(size=(2, 2)))
    A = rand_hermitian()
    psi = rand_state()
    basis_changes.append({
        "basis": [vec(Q[:, 0]), vec(Q[:, 1])],
        "A": mat(A), "psi": vec(psi),
        "A_new": mat(Q.conj().T @ A @ Q),
        "psi_new": vec(Q.conj().T @ psi),
        "expectation": float(np.real(psi.conj() @ A @ psi)),
    })

# Numbers quoted in (or corrected from) the lectures.
def p_up(theta):
    n = np.array([np.sin(theta), 0, np.cos(theta)])
    H = n[0] * sx + n[2] * sz
    w, V = np.linalg.eigh(H)
    up = V[:, np.argmax(w)]
    return float(abs(up.conj() @ np.array([1, 0])) ** 2)

lecture_numbers = {
    "P_up_45deg": p_up(np.pi / 4),   # Lecture 1 claims 3/4; the correct value is ≈ 0.854
    "P_up_60deg": p_up(np.pi / 3),   # where 3/4 actually occurs
    "P_up_90deg": p_up(np.pi / 2),
    "Sz_L4_state": float(np.real(np.array([np.sqrt(3) / 2, 0.5]).conj() @ sz @ np.array([np.sqrt(3) / 2, 0.5]))),
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "numpy.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({
    "states": states, "hermitians": hermitians, "rotations": rotations,
    "basis_changes": basis_changes, "lecture_numbers": lecture_numbers,
}, indent=1))
print(f"wrote {out.relative_to(ROOT)}", lecture_numbers)
