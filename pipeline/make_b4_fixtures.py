#!/usr/bin/env python3
"""Fixtures for the magic-state and Pauli-based engine of the Papers background chapter B4 (app/src/physics/qec: magic, pbc, inject, postselect, tcount).

Every answer comes from the independent routes of pipeline/b4_numpy.py (the Clifford orbit from the 2 x 2 unitary group, the 15-qubit code from bit masks and exact fractions, the
compiler from dense matrices, injection on dense state vectors, a vectorised search over 2 x 2 unitaries, a 2-state linear system, a loop over all 2^n flip patterns). The TypeScript tests
(physics/qec/b4.fixtures.test.ts) compare the engine to this file.

Usage (repo root): python3 pipeline/make_b4_fixtures.py -> app/src/physics/__fixtures__/qec-b4.json. Deterministic: run twice and diff.
"""
import json
from pathlib import Path

import numpy as np

import b4_numpy as bn

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qec-b4.json"


def clean(x):
    if isinstance(x, dict):
        return {str(k): clean(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [clean(v) for v in x]
    if isinstance(x, (np.floating,)):
        return float(x)
    if isinstance(x, (np.integer,)):
        return int(x)
    if isinstance(x, (np.bool_,)):
        return bool(x)
    return x


def main():
    data = dict(
        about="B4 engine fixtures: independent numpy / exact-fraction routes (pipeline/b4_numpy.py)",
        magic=bn.magic_block(),
        fifteen=bn.fifteen_block(),
        distill=bn.distill_block(),
        pbc=bn.pbc_block(),
        absorb=bn.absorb_block(),
        teleport=bn.teleport_block(),
        inject=bn.inject_general_block(),
        axes=bn.axes_block(),
        post=bn.post_block(),
        gap=bn.gap_block(),
        ht=bn.ht_block(),
        tcount=bn.tcount_block(),
    )
    OUT.write_text(json.dumps(clean(data), indent=1, sort_keys=True) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
