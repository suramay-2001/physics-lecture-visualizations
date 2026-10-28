#!/usr/bin/env python3
"""Reference tables for the Chapter Q26 engine (app/src/physics/qc/photons.ts), by INDEPENDENT routes (pipeline/photon_numpy.py).

Writes app/src/physics/__fixtures__/qc-photons.json, read by app/src/physics/qc/photons.test.ts: the wave plates and the dual-rail state, the six Stokes relations for named and Haar-random
splitters, the one-, two- and three-photon blocks (the exponential of the mode generator; permanents as a cross-check), the dip, the sign gate's amplitudes (sympy and expm) and its solution
(fsolve), the photonic CZ (four-mode expm), gate teleportation (a six-index tensor), the KLM table, the Bell analyser, the Kerr gate, the Jaynes-Cummings levels and the coherent and cat
states. Complex numbers are [re, im]; floats are rounded to 15 significant digits. Deterministic (seeded).

Usage (from the repo root): python3 pipeline/make_photon_fixtures.py
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import photon_numpy as P  # noqa: E402

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
    return [[float(np.real(z)), float(np.imag(z))] for z in np.asarray(v).reshape(-1)]


def build():
    out = {'about': 'numpy / scipy / sympy reference tables for physics/qc/photons.ts (pipeline/photon_numpy.py)'}
    # ---- wave plates and dual rail
    out['wave'] = []
    for th, ph in ((30, 40), (22.5, 112.5), (45, 0), (10, -70)):
        U = P.wave_unitary(th, ph)
        out['wave'].append({'theta': th, 'phi': ph, 'U': cm(U), 'polar': P.bloch_polar(U[:, 0]), 'relPhase': P.rel_phase(U[:, 0]), 'p1': float(abs(U[1, 0]) ** 2), 'dual': cv(P.dual_rail_ket(th, ph))})
    # ---- splitters: the named ones and three Haar-random lossless ones (the matrices are written out so the engine reads the same ones)
    rng = np.random.default_rng(26)
    splitters = [('real0.3', P.bs_real(0.3)), ('real0.5', P.bs_real(0.5)), ('sym', P.bs_sym()), ('q5', P.bs_q5())]
    splitters += [(f'haar{k}', P.haar(2, rng)) for k in range(3)] + [(f'balanced{k}', P.balanced(rng)) for k in range(2)]
    out['splitters'] = []
    for name, S in splitters:
        entry = {'name': name, 'S': cm(S), 'stokes': P.stokes(S), 'block1': cm(P.block(S, 1)), 'block2': cm(P.block(S, 2)), 'block3': cm(P.block(S, 3)),
                 'block2perm': cm(P.block(S, 2, 'perm')), 'block3perm': cm(P.block(S, 3, 'perm')), 'distinguishable': P.distinguishable(S)}
        out['splitters'].append(entry)
    # ---- the dip (real convention, exponential route)
    out['dip'] = []
    for k in range(11):
        R = k / 10
        a20, a11, a02 = P.two_photon(P.bs_real(R))
        out['dip'].append({'R': R, 'a20': cv([a20])[0], 'a11': cv([a11])[0], 'a02': cv([a02])[0], 'p11': float(abs(a11) ** 2), 'dist': P.distinguishable(P.bs_real(R))})
    out['homPhase'] = {}
    for name, S in (('real', P.bs_real(0.5)), ('sym', P.bs_sym()), ('q5', P.bs_q5())):
        a20, _, a02 = P.two_photon(S)
        out['homPhase'][name] = abs(math.degrees(float(np.angle(a02 / a20))))
    # ---- the sign gate
    ns = {'amps': []}
    for th, ph in ((150.49, 61.58), (20.0, 33.0), (100.0, 75.0)):
        ns['amps'].append({'theta': th, 'phi': ph, 'expm': P.ns_amps_expm(th, ph, 3), 'sympy': P.ns_amps_sympy(th, ph, 4)})
    th, ph, x, other_cos, other = P.ns_solve()
    ns['solve'] = {'theta': th, 'phi': ph, 'success': x, 'otherCos': other_cos, 'otherRoot': other}
    A = P.ns_amps_closed(th, ph, 3)
    ns['ratio3'] = A[3] / A[0]
    out['ns'] = ns
    # ---- the photonic CZ
    lin, leak0 = P.cz_dual_rail(False)
    nsm, leak1 = P.cz_dual_rail(True)
    out['cz'] = {'lin': cm(lin), 'ns': cm(nsm), 'leakLin': leak0, 'leakNs': leak1}
    # ---- gate teleportation
    rng = np.random.default_rng(709)
    ck, tk = P.haar_ket(rng), P.haar_ket(rng)
    gt = {'resource': cv(P.resource_state()), 'printed': cv(P.resource_printed()), 'c': cv(ck), 't': cv(tk), 'outcomes': []}
    for m in range(16):
        bits = format(m, '04b')
        chance, outv, best = P.teleport_run(ck, tk, bits)
        gt['outcomes'].append({'bits': bits, 'chance': chance, 'best': float(best), 'out': cv(outv)})
    chance, outv, _ = P.teleport_run(np.array([P.S2, P.S2], dtype=complex), np.array([1, 0], dtype=complex), '0000')
    gt['plusZero'] = {'chance': chance, 'out': cv(outv)}
    gap, lo, hi = P.teleport_sweep(6, 26)
    gt['sweep'] = {'gap': gap, 'min': lo, 'max': hi}
    out['gt'] = gt
    # ---- KLM and the analyser
    out['klm'] = {'table': [{'n': n, 'p': P.klm(n)} for n in (1, 2, 3, 5, 9, 18, 19, 49, 99, 199)], 'least': {str(F): P.klm_least(F) for F in (0.9, 0.99)},
                  'exact': {str(F): math.sqrt(F) / (1 - math.sqrt(F)) for F in (0.9, 0.99)}}
    out['analyzer'] = P.bell_analyzer()
    # ---- Kerr, JC, coherent and cat
    out['kerr'] = cm(P.kerr(math.pi))
    out['jc'] = [{'n': n, 'levels': [float(v) for v in P.jc_levels(n, 10.0, 1.0)], 'shift': P.jc_shift(n, 10.0, 1.0)} for n in range(6)]
    out['jcOther'] = {'delta': -4.0, 'om0': 1.5, 'levels': [[float(v) for v in P.jc_levels(n, -4.0, 1.5)] for n in range(4)], 'chi': P.jc_chi(-4.0, 1.5)}
    out['coherent'] = {'alpha2': [float(v) for v in P.coherent(2.0, 11)], 'alpha1': [float(v) for v in P.coherent(1.0, 11)],
                       'even2': [float(v) for v in P.cat(2.0, 1, 11)], 'odd2': [float(v) for v in P.cat(2.0, -1, 11)],
                       'overlap1': math.exp(-4.0), 'overlap2': math.exp(-16.0),
                       'series1': float(np.dot(P.coherent(1.0, 80), P.coherent(-1.0, 80)) ** 2), 'series2': float(np.dot(P.coherent(2.0, 90), P.coherent(-2.0, 90)) ** 2)}
    return rounded(out)


if __name__ == '__main__':
    path = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'qc-photons.json'
    path.write_text(json.dumps(build(), separators=(',', ':'), ensure_ascii=False, sort_keys=True), encoding='utf-8')
    print(f'wrote {path}')
