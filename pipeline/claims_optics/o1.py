#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/optics/O1.values.ts (Physics 709, Optics Lab page O1).

The engine reads the resonance curve from the closed form `rabiPeak(delta, w1) = (w1^2/4) / (delta^2 + w1^2/4)`
(physics/dynamics.ts). This script takes another route, so agreement is evidence rather than the same code checking itself:
it builds the two-level Hamiltonian H = (delta/2) sigma_z + (w1/4) sigma_x (a drive of coupling w1/2), diagonalises it with
numpy.linalg.eigh, evolves |0> to the first time of largest transfer t* = pi / (E_hi - E_lo) by the spectral decomposition
exp(-iHt) = V exp(-i E t) V^dagger, and reads the chance of |1>. No closed form for the Lorentzian is used.

Usage (from the repo root): python3 pipeline/claims_optics/o1.py -> app/src/physics/__fixtures__/claims-optics/o1.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). The output is deterministic: two runs write
byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

SX = np.array([[0, 1], [1, 0]], complex)
SZ = np.array([[1, 0], [0, -1]], complex)


def peak_transfer(delta: float, w1: float) -> float:
    """Largest chance of finding |1> after starting in |0>, for the rotating-frame H = (delta/2) sz + (w1/4) sx."""
    H = (delta / 2) * SZ + (w1 / 4) * SX
    E, V = np.linalg.eigh(H)
    t_star = np.pi / (E[1] - E[0])  # the first time the Bloch vector is farthest from |0>
    U = V @ np.diag(np.exp(-1j * E * t_star)) @ V.conj().T
    psi = U @ np.array([1, 0], complex)
    return float(abs(psi[1]) ** 2)


values = {
    # o1-line-width: the detuning equals the drive strength (delta = w1 = 1)
    "o1PeakAtTwoOmega": peak_transfer(1.0, 1.0),
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-optics" / "o1.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 Optics Lab page O1, numpy (eigh evolution of the driven two-level Hamiltonian to the time of largest transfer). "
            "Regenerate: python3 pipeline/claims_optics/o1.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
