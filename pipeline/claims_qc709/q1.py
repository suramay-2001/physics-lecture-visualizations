#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q1.values.ts (Physics 709, chapter Q1).

The engine computes Q1's numbers with closed forms (pure kets, benchTheory's running fractions, sgDeflection's
formula). This script takes other routes, so agreement is evidence rather than the same code checking itself:
  - kets are eigenvectors from numpy.linalg.eigh of n·σ, phase-fixed (first nonzero entry real > 0);
  - Stern–Gerlach benches propagate an unnormalized density matrix with Lüders projectors (the oven is I/2), and
    sign paths multiply projector probabilities along the path;
  - the deflection integrates the constant acceleration twice as a polynomial (numpy.polynomial), then evaluates it
    at the exit time;
  - weighted inner products, eigenvalues and angles use numpy's own vdot, eigvalsh and arccos;
  - N10's lazy scaling is tested on numpy's seeded generator, not the engine's mulberry32.
Constants are CODATA 2018, the values the engine's `SILVER` carries (μ_B, the atomic mass unit; silver 107.8682 u).

Usage (from the repo root): python3 pipeline/claims_qc709/q1.py → app/src/physics/__fixtures__/claims-qc709/q1.json
Checked by app/src/content/claims.test.ts (engine ↔ numpy per key; displayed numbers ↔ claims in scope). The output
is deterministic: two runs write byte-identical files.
"""
import json
from pathlib import Path

import numpy as np
from numpy.polynomial import polynomial as npoly

ROOT = Path(__file__).resolve().parent.parent.parent

# ---- constants (CODATA 2018) and the chapter's bench P0 ---------------------------------------------------------
MU_B = 9.2740100783e-24  # J/T, Bohr magneton
AMU = 1.66053906660e-27  # kg
M_AG = 107.8682 * AMU  # kg, silver
G = 1000.0  # T/m
L = 0.035  # m
VEL = 550.0  # m/s

SX = np.array([[0, 1], [1, 0]], complex)
SY = np.array([[0, -1j], [1j, 0]], complex)
SZ = np.array([[1, 0], [0, -1]], complex)
I2 = np.eye(2, dtype=complex)


def fixed(v):
    k = next(i for i, x in enumerate(v) if abs(x) > 1e-12)
    return v * np.exp(-1j * np.angle(v[k]))


def eigvec(M, sign):
    w, v = np.linalg.eigh(M)
    return fixed(v[:, np.argmax(w) if sign == "+" else np.argmin(w)])


def n_sigma(tilt_deg):
    t = np.radians(tilt_deg)
    return np.sin(t) * SX + np.cos(t) * SZ


AXES = {"z": 0.0, "x": 90.0}


def ket(name):
    sign, axis = name[0], name[1]
    return eigvec({"x": SX, "y": SY, "z": SZ}[axis], sign)


def plane_ket(theta_bloch):
    """|+n⟩ for n at Bloch angle θ in the x–z plane: the + eigenvector of n·σ."""
    return eigvec(np.sin(theta_bloch) * SX + np.cos(theta_bloch) * SZ, "+")


def proj(v):
    return np.outer(v, v.conj())


def prob(a, psi):
    return float(abs(np.vdot(a, psi)) ** 2)


def bench(source, axes, keep):
    """Lüders propagation: returns plus, minus, blocked[]."""
    rho = I2 / 2 if source == "oven" else proj(ket(source))
    blocked = []
    for k, a in enumerate(axes[:-1]):
        P = proj(eigvec(n_sigma(AXES[a]), keep[k]))
        kept = P @ rho @ P
        blocked.append(float(np.real(np.trace(rho) - np.trace(kept))))
        rho = kept
    M = n_sigma(AXES[axes[-1]])
    plus = float(np.real(np.trace(proj(eigvec(M, "+")) @ rho)))
    minus = float(np.real(np.trace(proj(eigvec(M, "-")) @ rho)))
    return plus, minus, blocked


def paths(source, axes):
    """Probability of each sign path through unblocked magnets, by products of Lüders probabilities."""
    out = {}
    for code in range(2 ** len(axes)):
        signs = ["+" if (code >> (len(axes) - 1 - k)) & 1 == 0 else "-" for k in range(len(axes))]
        rho = I2 / 2 if source == "oven" else proj(ket(source))
        p = 1.0
        for a, s in zip(axes, signs):
            P = proj(eigvec(n_sigma(AXES[a]), s))
            q = float(np.real(np.trace(P @ rho)))
            p *= q
            rho = P @ rho @ P / q if q > 1e-15 else P
        out["".join(signs)] = p
    return out


def deflection(mu_z, grad):
    """Δz at the magnet's exit: integrate the constant acceleration twice, evaluate at t = L/v."""
    a = mu_z * grad / M_AG
    z_of_t = npoly.polyint([a], 2)  # coefficients of a t²/2
    return float(npoly.polyval(L / VEL, z_of_t))


def norm(v):
    return float(np.sqrt(np.real(np.vdot(v, v))))


def worst(xs, target):
    return max(xs, key=lambda x: abs(x - target)) if xs else target


def yes(b):
    return 1 if b else 0


# ---- q1-two-spots -----------------------------------------------------------------------------------------------
force = MU_B * G
d0 = deflection(MU_B, G)
d2 = deflection(MU_B, 2 * G)

# ---- q1-sequences ------------------------------------------------------------------------------------------------
zxz = bench("oven", ["z", "x", "z"], ["+", "+"])
zzz = bench("oven", ["z", "z", "z"], ["+", "+"])
Pz = proj(ket("+z"))
comm = (SZ / 2) @ (SX / 2) - (SX / 2) @ (SZ / 2)

# ---- q1-superposition --------------------------------------------------------------------------------------------
psi30 = plane_ket(np.pi / 3)
not_unit = (ket("+z") + ket("+x")) / np.sqrt(2)
diff = ket("+z") - ket("+x")
v34 = np.array([0.6, 0.8j])


def same_ray(a, b):
    return abs(abs(np.vdot(a, b)) - norm(a) * norm(b)) < 1e-9


# ---- q1-vector-space ---------------------------------------------------------------------------------------------
fig2a = plane_ket(np.pi / 6)
fig2b = plane_ket(2 * np.pi / 3)


def lazy_passes():
    """c·v = 0 for every c satisfies both scaling rules of the notes, and fails 1·v = v (numpy's generator)."""
    g = np.random.default_rng(709)
    lazy = lambda k, v: np.zeros_like(v)  # noqa: E731
    for _ in range(50):
        c1, c2, a, b = g.uniform(-1, 1, 4) + 1j * g.uniform(-1, 1, 4)
        al, be, ga = (g.uniform(-1, 1, 2) + 1j * g.uniform(-1, 1, 2) for _ in range(3))
        if not np.allclose(lazy(c1 + c2, al + be), lazy(c1, al) + lazy(c1, be) + lazy(c2, al) + lazy(c2, be), atol=1e-12):
            return False
        if not np.allclose(lazy(a, lazy(b, ga)), lazy(a * b, ga), atol=1e-12):
            return False
        if np.allclose(lazy(1, al), al):
            return False
    return True


# ---- q1-inner-product --------------------------------------------------------------------------------------------
M = np.array([[2, 1j], [-1j, 2]])
evals = np.linalg.eigvalsh(M)
conj_lin = np.vdot((2 + 1j) * ket("+y"), ket("+z"))
conj_lin_ch = np.vdot((2 + 1j) * np.array([1, 0]), np.array([0.6, 0.8]))


def weighted(Mx, a, b):
    return complex(np.conj(a) @ Mx @ b)


values = {
    # q1-two-spots
    "q1Force": force / 1e-21,
    "q1Accel": force / M_AG / 1e4,
    "q1Mass": M_AG / 1e-25,
    "q1Flight": (L / VEL) * 1e6,
    "q1MuB": MU_B * 1e24,
    "q1DeflHalf": deflection(MU_B / 2, G) / d0,
    "q1OvenZ": bench("oven", ["z"], [])[0],
    "q1Defl": d0 * 1000,
    "q1DeflG2": d2 * 1000,
    "q1DeflRatio": d2 / d0,
    "q1Spots": len(paths("oven", ["z"])),
    "q1SignDown": -deflection(-MU_B, G) * 1000,
    # q1-sequences
    "q1OvenZZ": bench("oven", ["z", "z"], ["+"])[0],
    "q1Repeat": bench("+z", ["z"], [])[0],
    "q1ProjIdem": yes(np.allclose(Pz @ Pz, Pz)),
    "q1ZthenX": bench("+z", ["x"], [])[0],
    "q1Zxz": zxz[0],
    "q1ZxzBlocked1": zxz[2][0],
    "q1ZxzBlocked2": zxz[2][1],
    "q1XZ": bench("+x", ["z"], [])[0],
    "q1Commutator": yes(np.allclose(comm, 1j * SY / 2)),
    "q1SyNoZero": yes(np.min(np.abs(np.linalg.eigvals(1j * SY / 2))) > 1e-9),  # i S_y has eigenvalues ±i/2
    "q1Zzz": zzz[0],
    "q1Zxzx": bench("oven", ["z", "x", "z", "x"], ["+", "+", "+"])[0],
    # q1-superposition
    "q1ZOrth": abs(np.vdot(ket("+z"), ket("-z"))),
    "q1ShadowsSum": worst([prob(ket("+z"), plane_ket(t)) + prob(ket("-z"), plane_ket(t)) for t in np.linspace(0, np.pi, 37)], 1.0),
    "q1AmpX": abs(np.vdot(ket("+z"), ket("+x"))),
    "q1PX": prob(ket("+z"), ket("+x")),
    "q1PMinusX": prob(ket("+z"), ket("-x")),
    "q1SeqZ": paths("+z", ["x", "z"])["++"],
    "q1PY": prob(ket("-z"), ket("+y")),
    "q1AmpY": float(np.vdot(ket("-z"), ket("+y")).imag),
    "q1YnotX": yes(same_ray(ket("+y"), ket("+x"))),
    "q1Qubit30": prob(ket("+z"), psi30),
    "q1Qubit30Minus": prob(ket("-z"), psi30),
    "q1Alpha30": float(np.vdot(ket("+z"), psi30).real),
    "q1Beta30": float(np.vdot(ket("-z"), psi30).real),
    "q1ZeroIsUp": yes(np.allclose(np.array([1, 0]), ket("+z"))),  # |0⟩ = (1, 0) is the + eigenvector of σ_z
    "q1SupZ": bench("+x", ["z"], [])[0],
    "q1MixZ": bench("oven", ["z"], [])[0],
    "q1SupX": bench("+x", ["x"], [])[0],
    "q1MixX": bench("oven", ["x"], [])[0],
    "q1ZeroSum": norm(ket("+z") - ket("+z")),
    "q1LenSqrt2": norm(ket("+z") + ket("-z")),
    "q1PNotUnit": norm(not_unit),
    "q1PNotUnitTop": float(not_unit[0].real),
    "q1PNotUnitLen2": norm(not_unit) ** 2,
    "q1PNotUnitBottom": float(not_unit[1].real),
    "q1PNotUnitCross": norm(not_unit) ** 2 - 1,  # the squared length minus the two squared coefficients (½ + ½)
    "q1P34i": prob(ket("-z"), v34),
    "q1P34iUp": prob(ket("+z"), v34),
    "q1Sq34i": -float((0.8j * 0.8j).real),
    "q1PNorm": prob(ket("+z"), np.array([1, 2]) / np.sqrt(5)),
    "q1PDiff": prob(ket("+z"), diff / norm(diff)),
    "q1DiffLen2": norm(diff) ** 2,
    "q1DiffTop2": float(diff[0].real) ** 2,
    # q1-vector-space
    "q1Fig2Sum": norm(fig2a + fig2b),
    "q1Commute": yes(np.allclose(fig2a + fig2b, fig2b + fig2a, atol=1e-12)),
    "q1Inverse": norm(ket("+x") - ket("+x")),
    "q1KetZeroNotZero": norm(np.array([1.0, 0.0])),
    "q1ScaleTwice": yes(np.allclose(3 * (2 * fig2a), 6 * fig2a, atol=1e-12)),
    "q1Lazy": yes(lazy_passes()),
    "q1PolySum": float(npoly.polyadd([1, 2, 0], [0, 1, -1])[1]),
    "q1Degree": float(npoly.polyadd([0, 1, 1], [1, 0, -1])[2]) if len(npoly.polyadd([0, 1, 1], [1, 0, -1])) > 2 else 0.0,
    "q1VPoly": float(npoly.polyadd([1, 2, 0], 3 * np.array([0, 1, -1]))[1]),
    "q1RealScalars": float((1j * np.array([1, 0]))[0].imag),
    "q1ZeroVec": norm(np.zeros(2)),
    # q1-inner-product
    "q1BraY": float(np.vdot(ket("+y"), ket("+y")).real),
    "q1ConjLinRe": float(conj_lin.real),
    "q1ConjLinMinusIm": -float(conj_lin.imag),
    "q1Dot": float(np.vdot([1, 2], [3, -1]).real),
    "q1Norm34i": float(np.vdot([3, 4j], [3, 4j]).real),
    "q1Len34i": norm(np.array([3, 4j])),
    "q1Bilinear34i": float(np.dot([3, 4j], [3, 4j]).real),
    "q1MHerm": yes(np.allclose(M, M.conj().T)),
    "q1MEigLow": float(evals[0]),
    "q1MEigHigh": float(evals[1]),
    "q1MNorm10": weighted(M, np.array([1, 0]), np.array([1, 0])).real,
    "q1MNorm1i": weighted(M, np.array([1, 1j]), np.array([1, 1j])).real,
    "q1MNorm1mi": weighted(M, np.array([1, -1j]), np.array([1, -1j])).real,
    "q1Axler": float(np.vdot(1j * ket("+z"), ket("+z")).imag),
    "q1AxlerIm": float((1j * np.vdot(ket("+z"), ket("+z"))).imag),
    "q1Shadow": float(np.vdot(ket("+z"), ket("+x")).real),
    "q1Angle": float(np.degrees(np.arccos(np.vdot(ket("+z"), ket("+x")).real / (norm(ket("+z")) * norm(ket("+x")))))),
    "q1Fig3": float(np.vdot([2, 0], [1, 1]).real) / norm(np.array([2.0, 0.0])),
    "q1BadM11": weighted(np.diag([1, -1]), np.array([1, 1]), np.array([1, 1])).real,
    "q1BadM01": weighted(np.diag([1, -1]), np.array([0, 1]), np.array([0, 1])).real,
    "q1Orth": abs(np.vdot([1, 1j], [1j, 1])),
    "q1ConjLinCh": float(conj_lin_ch.imag),
    "q1ConjLinChRe": float(conj_lin_ch.real),
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q1.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q1, numpy (eigh kets, Lüders projectors, polynomial integration). "
            "Regenerate: python3 pipeline/claims_qc709/q1.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
