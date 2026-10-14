#!/usr/bin/env python3
"""Reference values for app/src/physics/qec/errors.ts (Chapter Q21's helpers), by routes the engine does not use (see pipeline/qec_q21_numpy.py).

Blocks of app/src/physics/__fixtures__/qec-q21.json:
  syndromes   the +-1 reading of every check for every Pauli error of weight <= 1 on rep3, rep3x and shor9, as <psi|E^+ g E|psi> on a dense state (a = 0.6, b = 0.8)
  kl          Knill-Laflamme tables (C on |0bar>, C on |1bar>, eigenvalues, gap) for sets of Pauli errors, from dense Gram matrices
  coeffs      Pauli coefficients Tr(PA)/2 of Rx(60 deg), Ry(34 deg) and three seeded random 2 x 2 matrices
  env         a seeded 4 x 4 unitary, its four environment notes by np.reshape, and the gap of the split
  weights     the Pauli strings of weight <= t on n qubits by itertools (n = 3, 4, 5; t = 1, 2)
  dephasing   z for discrete phase sets (np.exp), the uniform circle (0) and a Gaussian of width sigma (exp(-sigma^2/2))
  breakEven   the roots of the polynomial P(fail) - p for 3, 5, 7 copies

Usage: python3 pipeline/make_qec_q21_fixtures.py   (from the repo root; deterministic: seeded generators, no clock; run twice and diff)
"""
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qec_q21_numpy as N  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app/src/physics/__fixtures__/qec-q21.json"


def cx(z):
    return [float(np.real(z)), float(np.imag(z))]


def block_syndromes():
    out = {}
    for name, n in (("rep3", 3), ("rep3x", 3), ("shor9", 9)):
        errs = N.paulis_of_weight(n, 1)
        out[name] = {"generators": N.GENERATORS[name], "errors": {e: N.check_values(name, e) for e in errs}}
    return out


def block_kl():
    cases = [
        ("rep3", ["III", "XII", "IXI", "IIX"]),
        ("rep3", ["III", "ZII"]),
        ("rep3x", ["III", "ZII", "IZI", "IIZ"]),
        ("shor9", ["I" * 9, N.err_string(9, "Z1"), N.err_string(9, "Z2")]),
        ("shor9", ["I" * 9, N.err_string(9, "X1"), N.err_string(9, "Z1"), N.err_string(9, "Y1")]),
        ("shor9", ["I" * 9, N.err_string(9, "X1"), N.err_string(9, "X2"), N.err_string(9, "Z1")]),
    ]
    out = []
    for name, errs in cases:
        C0, C1, ev, gap = N.kl(name, errs)
        out.append({"code": name, "errors": errs, "C": [[cx(v) for v in row] for row in C0], "C1": [[cx(v) for v in row] for row in C1], "eigenvalues": [float(x) for x in ev], "gap": gap})
    return out


def block_coeffs():
    r = np.random.default_rng(448)
    mats = [N.rx(60), N.ry(34)] + [r.normal(size=(2, 2)) + 1j * r.normal(size=(2, 2)) for _ in range(3)]
    out = []
    for A in mats:
        co = N.pauli_coefficients(A)
        rebuilt = co["I"] * N.I2 + co["X"] * N.X + co["Y"] * N.Y + co["Z"] * N.Z
        out.append({"A": [[cx(v) for v in row] for row in A], "c": {k: cx(v) for k, v in co.items()}, "rebuildGap": float(np.abs(A - rebuilt).max())})
    return out


def block_env():
    U = N.seeded_unitary(709)
    psi = np.array([0.6, 0.8], dtype=complex)
    e, gap = N.env_split(U, psi)
    assert abs(np.linalg.norm(U.conj().T @ U - np.eye(4))) < 1e-12
    return {"U": [[cx(v) for v in row] for row in U], "psi": [cx(v) for v in psi], "e": {k: [cx(v) for v in vec] for k, vec in e.items()}, "gap": gap}


def block_weights():
    out = {}
    for n, t in ((3, 1), (3, 2), (4, 1), (4, 2), (5, 1), (5, 2), (9, 1)):
        strings = N.paulis_of_weight(n, t)
        out[f"{n},{t}"] = {"count": len(strings), "strings": strings if n <= 5 else []}
    return out


def block_dephasing():
    cases = [
        ([60, -60], [0.5, 0.5]),
        ([90, -90], [0.5, 0.5]),
        ([30, -30], [0.5, 0.5]),
        ([0, 120, 240], [1 / 3, 1 / 3, 1 / 3]),
        ([0, 90], [0.25, 0.75]),
    ]
    out = {"discrete": []}
    for deg, w in cases:
        z = sum(wi * np.exp(1j * np.deg2rad(d)) for d, wi in zip(deg, w))
        out["discrete"].append({"degrees": deg, "weights": w, "z": cx(z)})
    out["uniform"] = 0.0
    out["gaussian"] = [{"sigma": s, "z": float(np.exp(-s * s / 2))} for s in (0.3, 0.5, 1.0, 1.5)]
    return out


def block_break_even():
    return {str(n): N.break_even(n) for n in (3, 5, 7)}


def main():
    data = {
        "about": "Independent numpy reference values for app/src/physics/qec/errors.ts; regenerate with python3 pipeline/make_qec_q21_fixtures.py.",
        "syndromes": block_syndromes(),
        "kl": block_kl(),
        "coeffs": block_coeffs(),
        "env": block_env(),
        "weights": block_weights(),
        "dephasing": block_dephasing(),
        "breakEven": block_break_even(),
    }
    OUT.write_text(json.dumps(data, indent=1, sort_keys=True) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(data['syndromes'])} codes, {len(data['kl'])} KL tables, {len(data['coeffs'])} matrices")


if __name__ == "__main__":
    main()
