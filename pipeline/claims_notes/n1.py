#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/notes/N1.values.ts (Physics 709, Lecture 1 notes).

The engine reads the chance as |<+z|+x>|^2 from closed-form kets (physics/spin.ts KET, prob). This script takes another
route, so agreement is evidence rather than the same code checking itself: the beam is a density matrix pushed through
Lüders projectors built from numpy.linalg.eigh of the Pauli matrices (z+ prepares, x+ selects, the last z test reads), and
the chance is a ratio of traces.

Usage (from the repo root): python3 pipeline/claims_notes/n1.py -> app/src/physics/__fixtures__/claims-notes/n1.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). The output is deterministic: two runs write
byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

SX = np.array([[0, 1], [1, 0]], complex)
SZ = np.array([[1, 0], [0, -1]], complex)


def plus_projector(M):
    """Projector onto the +1 eigenvector of a Hermitian 2x2 matrix, from eigh."""
    w, v = np.linalg.eigh(M)
    k = int(np.argmax(w))
    col = v[:, k].reshape(2, 1)
    return col @ col.conj().T


Pz, Px = plus_projector(SZ), plus_projector(SX)

# z+ prepares (the beam is the density matrix Pz), x+ selects, then the last z magnet reads the up chance
rho = Pz
rho = Px @ rho @ Px
rho = rho / np.trace(rho).real  # the x+ beam, renormalised
p_up_after_x = np.trace(Pz @ rho).real

values = {
    "n1UpAfterX": float(p_up_after_x),
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-notes" / "n1.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 Lecture 1 notes (N1), numpy (eigh projectors, Lüders update on a density matrix). "
            "Regenerate: python3 pipeline/claims_notes/n1.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
