#!/usr/bin/env python3
"""Numpy twins for every computed claim key of the Papers section's chapter P1 (app/src/content/papers/P1.paper.ts).

A paper spec's computed claims cite a recipe's named output (app/src/papers/recipes.ts); the claim ledger
(app/src/content/claims.test.ts) checks each engine value against the twin written here.

Independent route from the engine (which builds the Bell pair by its content string in physics/qc/state.ts `bell`):
  - |Phi+> is prepared by the circuit CNOT (H x I) |00>, with H, CNOT and the Kronecker product written out in numpy;
  - the size of the |00> amplitude is numpy.abs of that vector's first entry.
Units: none (amplitudes are pure numbers).

Usage (from the repo root): python3 pipeline/claims_papers/p1.py -> app/src/physics/__fixtures__/claims-papers/p1.json
Checked by app/src/content/claims.test.ts. The output is deterministic: two runs write byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

H = (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], complex)
I2 = np.eye(2, dtype=complex)
CNOT = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], complex)  # control q0 (the left factor), target q1
KET00 = np.array([1, 0, 0, 0], complex)

phi_plus = CNOT @ np.kron(H, I2) @ KET00

values = {
    # p1-checks:b2 — each nonzero amplitude of the Bell pair |Phi+> has size 1/sqrt(2)
    "p1BellAmp": float(np.abs(phi_plus[0])),
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-papers" / "p1.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({"source": "pipeline/claims_papers/p1.py", "values": values}, indent=2, sort_keys=True) + "\n")
print(f"wrote {out.relative_to(ROOT)}: {len(values)} values")
