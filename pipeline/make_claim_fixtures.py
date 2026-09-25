#!/usr/bin/env python3
"""Claim-specific reference values for Lecture 1, computed independently with numpy (owner: P).

One number per key of `V` in app/src/content/L1.values.ts. The engine computes those with closed forms
(pure kets, (1 + n·m)/2, a running "alive" fraction). This script takes other routes, so agreement is
evidence rather than the same code checking itself:
  - kets are eigenvectors from numpy.linalg.eigh of n·σ (never the closed-form kets);
  - Stern–Gerlach benches propagate an unnormalized density matrix with Lüders projectors (the oven is I/2);
  - the 3 : 1 angle is found by bisection on the eigenvector probability;
  - light uses Malus's law cos²χ directly (the engine maps χ to a Bloch angle 2χ);
  - the scatter of the mean uses ⟨A²⟩ − ⟨A⟩² from matrices.

Usage (from the repo root): python3 pipeline/make_claim_fixtures.py → app/src/physics/__fixtures__/claims.json
Checked by app/src/content/claims.test.ts (engine ↔ numpy per key; displayed numbers ↔ claims in scope).
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent

SX = np.array([[0, 1], [1, 0]], complex)
SY = np.array([[0, -1j], [1j, 0]], complex)
SZ = np.array([[1, 0], [0, -1]], complex)
I2 = np.eye(2, dtype=complex)


def n_sigma(tilt_deg):
    """n·σ for a magnet tilted tilt_deg from +z toward +x (the beam flies along y)."""
    t = np.radians(tilt_deg)
    return np.sin(t) * SX + np.cos(t) * SZ


AXES = {"z": 0.0, "x": 90.0}


def axis_deg(a):
    return AXES[a] if isinstance(a, str) else float(a)


def eigvec(M, sign):
    w, v = np.linalg.eigh(M)
    return v[:, np.argmax(w) if sign == "+" else np.argmin(w)]


def ket(name):
    """'+z', '-x', … as eigenvectors of σ_axis."""
    sign, axis = name[0], name[1]
    M = {"x": SX, "y": SY, "z": SZ}[axis]
    return eigvec(M, sign)


def proj(v):
    return np.outer(v, v.conj())


def prob(a, psi):
    return float(abs(np.vdot(a, psi)) ** 2)


def bench(source, axes, keep):
    """Lüders-rule propagation of an unnormalized density matrix. Returns plus, minus, blocked[]."""
    rho = I2 / 2 if source == "oven" else proj(ket(source))
    blocked = []
    for k, a in enumerate(axes[:-1]):
        P = proj(eigvec(n_sigma(axis_deg(a)), keep[k]))
        kept = P @ rho @ P
        blocked.append(float(np.real(np.trace(rho) - np.trace(kept))))
        rho = kept
    M = n_sigma(axis_deg(axes[-1]))
    plus = float(np.real(np.trace(proj(eigvec(M, "+")) @ rho)))
    minus = float(np.real(np.trace(proj(eigvec(M, "-")) @ rho)))
    return plus, minus, blocked


def p_plus(tilt_deg, psi):
    return prob(eigvec(n_sigma(tilt_deg), "+"), psi)


def expect(A, psi):
    return float(np.real(np.vdot(psi, A @ psi)))


def bisect(f, lo, hi, tol=1e-13):
    flo = f(lo)
    for _ in range(200):
        mid = (lo + hi) / 2
        fm = f(mid)
        if (fm > 0) == (flo > 0):
            lo, flo = mid, fm
        else:
            hi = mid
        if hi - lo < tol:
            break
    return (lo + hi) / 2


up = ket("+z")
oz = bench("oven", ["z"], [])
rz = bench("oven", ["z", "z"], ["+"])
zx = bench("oven", ["z", "x"], ["+"])
zxx = bench("oven", ["z", "x", "x"], ["+", "+"])
zxz = bench("oven", ["z", "x", "z"], ["+", "+"])
zmx = bench("oven", ["z", "x", "z"], ["+", "-"])
A45 = n_sigma(45)
var45 = expect(A45 @ A45, up) - expect(A45, up) ** 2

values = {
    # l1-quantized
    "ovenZPlus": oz[0],
    "ovenZMinus": oz[1],
    "repeatZPlate": rz[0] / (rz[0] + rz[1]),
    "repeatZMinus": rz[1],
    # l1-sequential
    "pXgivenZ": prob(ket("+x"), ket("+z")),
    "pZgivenX": prob(ket("+z"), ket("+x")),
    "zxPlus": zx[0],
    "zxAlive1": 1 - zx[2][0],
    "zxxAlive2": 1 - zxx[2][0] - zxx[2][1],
    "zxxPlate": zxx[0] / (zxx[0] + zxx[1]),
    "zxzAlive1": 1 - zxz[2][0],
    "zxzAlive2": 1 - zxz[2][0] - zxz[2][1],
    "zxzPlus": zxz[0],
    "zxzMinus": zxz[1],
    "zxzPlate": zxz[0] / (zxz[0] + zxz[1]),
    "zMinusXBlocked2": zmx[2][1],
    # l1-average
    "p45": p_plus(45, up),
    "avg45": expect(A45, up),
    "p60": p_plus(60, up),
    "cos60": expect(n_sigma(60), up),
    "p90": p_plus(90, up),
    "avg90": expect(n_sigma(90), up),
    "theta34": bisect(lambda th: p_plus(th, up) - 0.75, 0.0, 180.0),
    "band10": float(np.sqrt(var45 / 10)),
    "band100": float(np.sqrt(var45 / 100)),
    "band1000": float(np.sqrt(var45 / 1000)),
    "photon45": float(np.cos(np.radians(45)) ** 2),  # Malus's law for light, full angle
    # l1-logic ("up OR right" is false only for not-up AND not-right)
    "pLeftGivenUp": prob(ket("-x"), ket("+z")),
    "pDownGivenLeft": prob(ket("-z"), ket("-x")),
    "falseZFirst": prob(ket("-z"), ket("+z")) * prob(ket("-x"), ket("-z")),
    "falseXFirst": prob(ket("-x"), ket("+z")) * prob(ket("-z"), ket("-x")),
    "trueXFirst": prob(ket("+x"), ket("+z")) + prob(ket("-x"), ket("+z")) * prob(ket("+z"), ket("-x")),
    # l1-vectors
    "pUpRight": prob(ket("+z"), ket("+x")),
    "ampUpRight": float(abs(np.vdot(ket("+z"), ket("+x")))),
    "pRightRight": prob(ket("+x"), ket("+x")),
    "pRightLeft": prob(ket("+x"), ket("-x")),
    "negSame": 1.0 if abs(prob(ket("+x"), -ket("+x")) - 1) < 1e-12 else 0.0,
    "betaSq": 1 - 0.6**2,
    "plusXAlongZ": bench("+x", ["z"], [])[0],
    "plusXAlongX": bench("+x", ["x"], [])[0],
    "ovenAlongX": bench("oven", ["x"], [])[0],
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims.json"
out.write_text(
    json.dumps(
        {
            "about": "Lecture 1 claim values, numpy (eigh, Lüders projectors, bisection, Malus). "
            "Regenerate: python3 pipeline/make_claim_fixtures.py",
            "values": values,
        },
        indent=1,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
