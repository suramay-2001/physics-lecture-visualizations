"""make_tdg_fixtures.py: reference values for app/src/physics/qec/tdg.ts, from the independent route in tdg_numpy.py.

Writes app/src/physics/__fixtures__/qec-tdg.json (read by app/src/physics/qec/tdg.fixtures.test.ts). Deterministic: no clock, no randomness; run twice and compare.
Usage (repo root): python3 pipeline/make_tdg_fixtures.py
"""
import json
from pathlib import Path

import tdg_numpy as T

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'qec-tdg.json'

fx = {'about': 'Route B (symplectic pairing, dense overlaps, Decimal sums) for physics/qec/tdg.ts; transcribed printed inputs only.'}

fx['machine'] = [
    dict(code=c, factory=f, M=M, **{k: v for k, v in T.parts(c, f).items()}, q=T.q_of(c, M, f), n=11 * M)
    for (c, f, M) in [('gross', '1e-3', 3), ('gross', '1e-4', 10), ('two-gross', '1e-3', 10), ('two-gross', '1e-4', 4)]
]
fx['qA29'] = T.q_of('gross', 10, '1e-4', 29)
fx['maxModules'] = [T.max_modules(c, b, f) for (c, f, b) in [(c, f, b) for (c, f, b) in T.FIG10A_BIC]]
fx['yield'] = {str(n): T.yield_(n) for n in (378, 1000, 5000, 6936)}
fx['cultivation'] = {str(d): T.cultivation(d) for d in (3, 5)}
fx['piid'] = [[s, p, T.piid(s, p)] for s in T.FIT for p in (1e-3, 1e-4)]
fx['tfim'] = [['gross', p, T.tfim('gross', p)] for p in (1e-3, 1e-4, 3e-5, 1e-5)] + [['two-gross', p, T.tfim('two-gross', p)] for p in (1e-3, 1e-4)]
fx['crossing'] = {c: list(T.crossing(c)) for c in ('gross', 'two-gross')}
fx['rotations'] = T.tfim_rotations()
fx['eq96'] = [[d, nt, T.eq96(d, nt)] for d in (7, 9, 17, 19) for nt in (1.5542e7, 1.9e7)]
fx['surface'] = [list(T.surface_row(*r)) for r in T.FIG10A_SURF]
fx['family'] = [list(T.family(r, b)) for (r, b) in [(1, 0), (1, 1), (2, 0), (2, 1), (3, 0)]]
fx['basis'] = {c: {k: v for k, v in T.basis_facts(c).items() if k != 'G'} for c in ('gross', 'two-gross')}
fx['blocks'] = {c: {k: v for k, v in T.blocks(c, 1, 0, 'x').items() if k != 'M'} for c in ('gross', 'two-gross')}
fx['blocksY'] = {c: {k: v for k, v in T.blocks(c, 0, 1, 'y').items() if k != 'M'} for c in ('gross', 'two-gross')}
fx['shifts'] = {c: T.shift_summary(c) for c in ('gross', 'two-gross')}
fx['native'] = {c: {r: T.native(c, r) for r in ('actual', 'as-printed')} for c in ('gross', 'two-gross')}
fx['lpu'] = {c: T.lpu(c) for c in ('gross', 'two-gross')}

OUT.write_text(json.dumps(fx, indent=1, sort_keys=True) + '\n')
print('wrote', OUT.relative_to(ROOT), len(fx), 'blocks')
