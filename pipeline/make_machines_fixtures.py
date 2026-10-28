#!/usr/bin/env python3
"""Reference tables for the Chapter Q20 engine (app/src/physics/qc/machines.ts), by an INDEPENDENT route (pipeline/machines_numpy.py).

Writes app/src/physics/__fixtures__/qc-machines.json, read by app/src/physics/qc/machines.test.ts: the four-CNOT cloner (fidelities, outputs, pair overlap), the U-NOT (Choi
spectra, the limit, measure-and-prepare), the processor identities, the CNOT / retry / Toffoli processors, the Bell and phase-flip programs, and the programmable discriminator
(chances, the Eq. 8.41 block, the optimum). Complex numbers are [re, im]; floats are rounded to 15 significant digits. Deterministic (seeded where random).

Usage (from the repo root): python3 pipeline/make_machines_fixtures.py
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import machines_numpy as M  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def rounded(x):
    if isinstance(x, float):
        return float(f"{x:.15g}")
    if isinstance(x, dict):
        return {str(k): rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def cm(m):
    return [[[float(np.real(z)), float(np.imag(z))] for z in row] for row in np.asarray(m)]


def cv(v):
    return [[float(np.real(z)), float(np.imag(z))] for z in np.asarray(v)]


def build():
    out = {'about': 'numpy reference tables for physics/qc/machines.ts (pipeline/machines_numpy.py)'}
    # ---- cloner
    cl = {'cases': [], 'outputs': {}}
    for u in (0, 5, 15, 30, 41, 60):
        c0, c1, _ = M.program(u)
        f1, f2 = M.fidelities(u)
        cl['cases'].append({'u': u, 'c0': c0, 'c1': c1, 'f1': f1, 'f2': f2, 'pair': M.pair_overlap(u, M.PSI_RUN)})
    cl['other'] = {'theta': 120, 'phi': 30, 'u': 30, 'f': M.fidelities(30, 120, 30)[0], 'f2': M.fidelities(30, 120, 30)[1]}
    for u in (0, 15, 30):
        o = M.outputs(M.PSI_RUN, M.program(u)[2])
        cl['outputs'][str(u)] = [cm(r) for r in o]
    cl['maxC0C1'] = list(M.max_c0c1())
    cl['spread'] = M.universal_spread(30, 200, 709)
    # ---- U-NOT
    un = {'ideal': [float(x) for x in M.choi_spectrum(M.unot_ideal)], 'limit': M.unot_limit(), 'choiMin': []}
    for p in (0.0, 0.2, 1 / 3, 0.5, 1.0):
        un['choiMin'].append({'p': p, 'spectrum': [float(x) for x in M.choi_spectrum(M.unot_shrunk(p))]})
    o30 = M.outputs(M.PSI_RUN, M.program(30)[2])
    un['turned'] = cm(M.U0 @ o30[2] @ M.U0.conj().T)
    un['mpUnot'] = cm(M.mp_unot(M.PSI_RUN))
    un['mpClone'] = list(M.mp_clone(M.PSI_RUN))
    un['mpCloneOther'] = list(M.mp_clone(M.ket_bloch(120, 30)))
    out['cloner'] = cl
    out['unot'] = un
    # ---- no-go
    I, X, Y, Z = M.I2, M.X, M.Y, M.Z
    Ry = lambda t: np.array([[math.cos(t / 2), -math.sin(t / 2)], [math.sin(t / 2), math.cos(t / 2)]], dtype=complex)
    Rz = lambda t: np.diag([np.exp(-1j * t / 2), np.exp(1j * t / 2)])
    ng = {'expect': [], 'spread': {}}
    for th in (0, 60, 90, 120, 180):
        e = M.expectation(I, Z, M.ket_bloch(th, 0))
        ng['expect'].append({'theta': th, 'value': [float(e.real), float(e.imag)]})
    ng['spread'] = {
        'Z': M.spread(I, Z), 'X': M.spread(I, X), 'phase': M.spread(np.exp(0.7j) * I, I), 'Rz': M.spread(I, Rz(0.6)), 'YX': M.spread(Y, X),
    }
    ng['processorGap'] = [M.processor_gap(a, b, M.PSI_RUN) for a, b in ((I, Z), (X, Y), (Ry(0.8), Rz(1.1)))]
    ng['distinct'] = M.distinct_ops([Rz(0.4), X @ Rz(0.4), np.exp(0.7j) * Rz(0.4), np.exp(0.7j) * (X @ Rz(0.4))])
    ng['distinctAll'] = M.distinct_ops([I, X, Y, Z])
    out['nogo'] = ng
    # ---- processors
    pr = {'cnot': [], 'rus': [], 'toffoli': []}
    for a in (20, 30, 45):
        for name, psi in (('+x', M.ket_bloch(90, 0)), ('run', M.PSI_RUN)):
            p0, p1, s, f = M.cnot_proc(a, psi)
            pr['cnot'].append({'alpha': a, 'psi': name, 'p0': p0, 'p1': p1, 'success': cv(s), 'failure': cv(f),
                               'azimuth': math.degrees(math.atan2(*M.bvec(M.dm(s))[[1, 0]]))})
    for k in range(1, 9):
        pr['rus'].append({'k': k, 'p': M.rus_success(k)})
    pr['rusCircuit30'] = M.rus_circuit_chance(30)
    for a in (20, 30):
        for name, psi in (('+x', M.ket_bloch(90, 0)), ('run', M.PSI_RUN)):
            reads, data = M.toffoli_proc(a, psi)
            pr['toffoli'].append({'alpha': a, 'psi': name, 'readings': reads, 'data': [cv(d) for d in data]})
    out['proc'] = pr
    # ---- Bell programs and the phase flip
    bp = {'flips': [], 'uin': []}
    for th, ph in ((60, 0), (120, 0), (90, 0), (90, 90), (120, 40), (45, 200)):
        (cx, cy, cz), xi, U = M.flip_prog(th, ph)
        p, data = M.flip_run(M.PSI_RUN, th, ph)
        bp['flips'].append({'theta': th, 'phi': ph, 'coef': [[float(z.real), float(z.imag)] for z in (cx, cy, cz)], 'xi': cv(xi), 'p': p, 'data': cv(data),
                            'formulaGap': M.flip_formula_gap(th, ph), 'uin': float(abs(np.vdot(M.uin_program(th, ph), xi)))})
    bp['uinMatrix'] = cm(M.uin_matrix())
    out['bell'] = bp
    # ---- programmable discriminator
    dc = {'cases': [], 'block': [], 'known': []}
    for name, (a, b) in {'s0.5': (M.ket_bloch(0, 0), M.ket_bloch(120, 0)), 's0.707': (M.K0, (M.K0 + M.K1) * M.S2), 's0': (M.K0, M.K1),
                         'complex': (M.ket_bloch(50, 20), M.ket_bloch(130, 200))}.items():
        s = float(abs(np.vdot(a, b)))
        for c1, c2 in ((2 / 3, 2 / 3), (0.3, 0.5)):
            p1, p2, P, mn, zg = M.prog_usd(a, b, c1, c2)
            dc['cases'].append({'name': name, 'psi1': cv(a), 'psi2': cv(b), 's': s, 'c1': c1, 'c2': c2, 'p1': p1, 'p2': p2, 'P': P, 'minEig': mn, 'zeroGap': zg})
    for c1, c2 in ((2 / 3, 2 / 3), (0.3, 0.5), (0.9, 0.1)):
        m, tr, dt, dp, disc, ev = M.block(c1, c2)
        dc['block'].append({'c1': c1, 'c2': c2, 'matrix': cm(m), 'trace': tr, 'detTrue': dt, 'detPrinted': dp, 'discPrinted': disc, 'eigs': [float(x) for x in ev],
                            'gap': M.disc_block_gap(c1, c2)})
    dc['optC'] = M.disc_opt_c()
    dc['grid'] = list(M.disc_grid_best(30))
    for s in (0.0, 0.25, 0.5, 0.7071067811865476, 0.9):
        dc['known'].append({'s': s, 'known': 1 - s, 'prog': (1 - s * s) / 3})
    out['disc'] = dc
    return rounded(out)


if __name__ == '__main__':
    path = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'qc-machines.json'
    path.write_text(json.dumps(build(), separators=(',', ':'), ensure_ascii=False, sort_keys=True), encoding='utf-8')
    print(f'wrote {path}')
