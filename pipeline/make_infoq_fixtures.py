#!/usr/bin/env python3
"""Reference values for the Chapter Q23 engine (app/src/physics/qc/infoq.ts), by an INDEPENDENT route (pipeline/infoq_numpy.py).

The TypeScript engine works from Vec/Mat arrays with its own Jacobi eigen-solver and plain loops. This script uses none of that: np.kron states, einsum partial traces,
np.linalg.eigvalsh entropies, scipy.linalg.logm for the relative entropy, a vectorised grid plus scipy.optimize for the channel capacity and the accessible information, density
matrices rebuilt from the ensembles for the Holevo quantities, and the dephasing / GHZ circuits applied gate by gate with dense matrices. Agreement is evidence, not the same code
checking itself.

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the TOP wire = the most significant bit; entropies are in bits. Complex numbers are [re, im]; floats are
rounded to 15 significant digits; an infinite value is null. Random states come from numpy's default_rng(23), so the output is deterministic.

Usage: python3 pipeline/make_infoq_fixtures.py -> app/src/physics/__fixtures__/qc-infoq.json   (run twice: byte-identical)
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import infoq_numpy as N  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def rounded(x):
    if isinstance(x, float):
        return float(f"{x:.15g}")
    if isinstance(x, dict):
        return {str(k): rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def cmat(M):
    return [[[float(np.real(z)), float(np.imag(z))] for z in row] for row in np.asarray(M)]


def cvec(v):
    return [[float(np.real(z)), float(np.imag(z))] for z in np.asarray(v).ravel()]


def random_state(rng, n):
    v = rng.normal(size=2 ** n) + 1j * rng.normal(size=2 ** n)
    return v / np.linalg.norm(v)


def random_rho(rng, d, rank):
    G = rng.normal(size=(d, rank)) + 1j * rng.normal(size=(d, rank))
    R = G @ G.conj().T
    return R / np.trace(R).real


def random_joint(rng, rows, cols):
    P = rng.random(size=(rows, cols))
    return P / P.sum()


def build():
    rng = np.random.default_rng(23)
    out = {}

    # ---- chance tables
    tables = [([0.5, 0.5], [0.9, 0.1]), ([0.9, 0.1], [0.5, 0.5]), ([0.5, 0.5], [0.7, 0.3]), ([0.7, 0.3], [0.9, 0.1]), ([0.5, 0.5], [1.0, 0.0]), ([1.0, 0.0], [0.5, 0.5]),
              ([0.6, 0.4], [0.2, 0.8]), ([0.5, 0.5], [0.25, 0.75]), ([0.25, 0.25, 0.5], [0.5, 0.25, 0.25]), ([0.1, 0.2, 0.3, 0.4], [0.4, 0.3, 0.2, 0.1])]
    cases = []
    for p, q in tables:
        cases.append({'p': p, 'q': q, 'D': N.dist(p, q), 'F': N.fid(p, q), 'angleDeg': N.angle_deg(p, q), 'H': N.rel(p, q)})
    out['tables'] = cases
    out['planeDeg'] = [{'p': p, 'deg': math.degrees(math.atan2(math.sqrt(p[1]), math.sqrt(p[0])))} for p in ([0.5, 0.5], [0.9, 0.1], [0.7, 0.3], [1.0, 0.0], [0.25, 0.75])]
    qt3 = N.quarter_tables(3)
    least = min(N.dist(p, r) + N.dist(r, q) - N.dist(p, q) for p in qt3 for q in qt3 for r in qt3)
    fin = [N.rel(p, q) for p in qt3 for q in qt3]
    out['quarter'] = {'n3': qt3, 'n2': N.quarter_tables(2), 'count4': len(N.quarter_tables(4)), 'triangleSlackMin': least, 'relMinFinite': min(v for v in fin if v is not None),
                      'relInfinite': sum(1 for v in fin if v is None), 'pairs': len(fin)}

    # ---- quantum relative entropy and the Klein chain
    rho_a = np.diag([0.75, 0.25]).astype(complex)
    half = np.eye(2, dtype=complex) / 2
    rho_b = np.diag([0.9, 0.1]).astype(complex)
    sig_x = N.bloch_rho([0.8, 0, 0])
    plus = N.rho_of(N.KET['+'])
    zero = N.rho_of(N.KET['0'])
    pairs = [('diag75_half', rho_a, half), ('half_diag75', half, rho_a), ('plus_diag9', plus, rho_b), ('diag9_plus', rho_b, plus), ('diag9_x08', rho_b, sig_x), ('x08_diag9', sig_x, rho_b),
             ('zero_plus', zero, plus), ('self', rho_b, rho_b)]
    for k in range(3):
        pairs.append((f'rand2_{k}', random_rho(rng, 2, 2), random_rho(rng, 2, 2)))
    for k in range(2):
        pairs.append((f'rand4_{k}', random_rho(rng, 4, 4), random_rho(rng, 4, 4)))
    qrel = []
    for name, r, s in pairs:
        S, Hh, rr, pp = N.klein_chain(r, s) if N.rel_q(r, s) is not None else (None, None, None, None)
        qrel.append({'name': name, 'rho': cmat(r), 'sigma': cmat(s), 'S': N.rel_q(r, s), 'klein': None if S is None else {'H': Hh, 'r': rr, 'p': pp}})
    out['qrel'] = qrel

    # ---- measurement tables of two qubit states
    meas = []
    for name, r, s in [('zero_plus', zero, plus), ('zero_minus', zero, N.rho_of(N.KET['-'])), ('diag9_x08', rho_b, sig_x), ('rand', random_rho(rng, 2, 2), random_rho(rng, 2, 2)), ('rand2', random_rho(rng, 2, 1), random_rho(rng, 2, 2))]:
        best, ang = N.best_table_dist(r, s, 3601)
        meas.append({'name': name, 'rho': cmat(r), 'sigma': cmat(s), 'D': N.trace_dist(r, s), 'z': N.table_dist_basis(r, s, N.plane_basis(0.0)), 'x': N.table_dist_basis(r, s, N.plane_basis(math.pi / 2)),
                     'eigen': N.eigen_table_dist(r, s), 'gridMax': best, 'gridAngleDeg': ang})
    out['measure'] = meas

    # ---- two variables
    joints = [('bsc01', N.bsc(0.1)), ('bsc02', N.bsc(0.2)), ('bsc05', N.bsc(0.5)), ('dealer', np.array([[0.0, 0.5], [0.5, 0.0]])), ('indep', np.full((2, 2), 0.25)), ('bscUnbal', N.bsc(0.1, (0.3, 0.7)))]
    joints += [('rand3x4', random_joint(rng, 3, 4)), ('rand2x2', random_joint(rng, 2, 2))]
    out['joint'] = [{'name': nm, 'pxy': [[float(v) for v in row] for row in P], 'H': N.joint_h(P), 'HYgX': N.cond_h(P), 'I': N.mutual(P)} for nm, P in joints]
    caps = []
    for f in (0.0, 0.1, 0.11, 0.2, 0.25, 0.5, 0.9):
        pyx = [[1 - f, f], [f, 1 - f]]
        g, at = N.capacity_grid(pyx, 1001)
        o, ox = N.capacity_opt(pyx)
        caps.append({'f': f, 'grid': g, 'argmax': at, 'opt': o, 'closed': 1 - N.h2(f)})
    # an asymmetric channel (Z channel): the grid argmax is not at one half
    z = [[1.0, 0.0], [0.3, 0.7]]
    g, at = N.capacity_grid(z, 1001)
    o, ox = N.capacity_opt(z)
    caps.append({'f': None, 'channel': z, 'grid': g, 'argmax': at, 'opt': o, 'closed': None, 'optArg': ox})
    out['capacity'] = caps

    # ---- quantum mutual information
    qm = []
    bell_p = N.bell(1)
    qm.append({'name': 'bell', 'rho': cmat(N.rho_of(bell_p)), 'a': [0], 'b': [1], 'n': 2, 'I': N.qmi(N.rho_of(bell_p), [0], [1], 2)})
    for p in (0.1, 0.25, 0.5, 1.0):
        rho = (1 - p) * N.rho_of(N.bell(1)) + p * N.rho_of(N.bell(-1))
        qm.append({'name': f'deph{p}', 'rho': cmat(rho), 'a': [0], 'b': [1], 'n': 2, 'I': N.qmi(rho, [0], [1], 2), 'SAB': N.vn(rho)})
    ghz = N.ghz_state()
    rg = N.rho_of(ghz)
    qm.append({'name': 'ghzAB', 'rho': cmat(rg), 'a': [0], 'b': [1], 'n': 3, 'I': N.qmi(rg, [0], [1], 3)})
    qm.append({'name': 'ghzABC', 'rho': cmat(rg), 'a': [0], 'b': [1, 2], 'n': 3, 'I': N.qmi(rg, [0], [1, 2], 3)})
    for k in range(3):
        rr = N.rho_of(random_state(rng, 3))
        qm.append({'name': f'rand3_{k}', 'rho': cmat(rr), 'a': [0], 'b': [2], 'n': 3, 'I': N.qmi(rr, [0], [2], 3)})
    rm = random_rho(rng, 8, 8)
    qm.append({'name': 'mixed3', 'rho': cmat(rm), 'a': [0, 1], 'b': [2], 'n': 3, 'I': N.qmi(rm, [0, 1], [2], 3)})
    out['qmi'] = qm
    out['dephasedBell'] = [{'p': p, 'rho': cmat((1 - p) * N.rho_of(N.bell(1)) + p * N.rho_of(N.bell(-1)))} for p in (0.0, 0.1, 0.5)]
    out['circuits'] = {'dephasing': [{'p': p, 'psi': cvec(N.dephasing_state(p))} for p in (0.0, 0.1, 0.25, 1.0)], 'ghz': cvec(N.ghz_state())}

    # ---- Holevo
    def rho_pair(s):
        return [N.rho_of(v) for v in N.pair_states(s)]

    ens = []
    z0, zp = N.rho_of(N.KET['0']), N.rho_of(N.KET['+'])
    e_pair = ([0.5, 0.5], [z0, zp])
    e_orth = ([0.5, 0.5], [z0, N.rho_of(N.KET['1'])])
    e_bb84 = ([0.25] * 4, [N.rho_of(N.KET[k]) for k in '01+-'])
    e_s06 = ([0.5, 0.5], rho_pair(0.6))
    e_mixed = ([0.3, 0.7], [random_rho(rng, 2, 2), random_rho(rng, 2, 1)])
    e_unequal = ([0.8, 0.2], [z0, zp])
    e_bellpair = ([0.25] * 4, [N.rho_of(N.bell(1)), N.rho_of(N.bell(-1)), N.rho_of(np.array([0, 1, 1, 0], dtype=complex) / math.sqrt(2)), N.rho_of(np.array([0, 1, -1, 0], dtype=complex) / math.sqrt(2))])
    e_alice = ([0.25] * 4, [N.ptrace(r, [0], 2) for r in e_bellpair[1]])
    for name, (ps, rs) in [('pair', e_pair), ('orth', e_orth), ('bb84', e_bb84), ('s06', e_s06), ('mixed', e_mixed), ('unequal', e_unequal), ('bellpair', e_bellpair), ('aliceHalf', e_alice)]:
        ens.append({'name': name, 'ps': ps, 'rhos': [cmat(r) for r in rs], 'chi': N.holevo_chi(ps, rs), 'usdBound': N.usd_bound(ps, rs)})
    # the qubit ensembles: reading along z, x and the grid / optimiser maxima
    reads = []
    for name, (ps, rs) in [('pair', e_pair), ('bb84', e_bb84), ('s06', e_s06), ('mixed', e_mixed), ('unequal', e_unequal)]:
        gI, gA = N.accessible_projective(ps, rs, 3601)
        oI, oA = N.accessible_opt(ps, rs)
        reads.append({'name': name, 'z': N.info_povm(ps, rs, N.projector_pair([0, 0, 1])), 'x': N.info_povm(ps, rs, N.projector_pair([1, 0, 0])), 'gridMax': gI, 'gridAngleDeg': gA, 'opt': oI})
    out['holevo'] = ens
    out['reads'] = reads
    # Bell measurement on the Bell ensemble: the four joint outcomes are certain
    bell_proj = [N.rho_of(v) for v in (N.bell(1), N.bell(-1), np.array([0, 1, 1, 0], dtype=complex) / math.sqrt(2), np.array([0, 1, -1, 0], dtype=complex) / math.sqrt(2))]
    out['bellMeasure'] = N.info_povm(e_bellpair[0], e_bellpair[1], bell_proj)
    proofs = []
    for name, (ps, rs), ax in [('pairZ', e_pair, [0, 0, 1]), ('pairBest', e_pair, [-1, 0, 1]), ('s06X', e_s06, [1, 0, 0]), ('mixedTilt', e_mixed, [0.3, 0.5, 0.8])]:
        a, b = N.proof_states(ps, rs, ax)
        proofs.append({'name': name, 'axis': [float(v) for v in ax], 'SPQ': a, 'SPprimeMprime': b})
    out['proof'] = proofs
    out['cq'] = {'pair': cmat(N.cq_state(e_pair[0], e_pair[1]))}
    out['curves'] = {
        'holevoChiPair': [{'s': s, 'y': N.pair_chi(s)} for s in (0.0, 0.2, 0.5, 0.7071067811865476, 0.9, 1.0)],
        'accessibleInfoPair': [{'s': s, 'y': N.accessible_projective([0.5, 0.5], rho_pair(s), 721)[0]} for s in (0.0, 0.3, 0.7071067811865476, 0.9, 1.0)],
        'usdBoundPair': [{'s': s, 'y': max(0.0, 1 - N.pair_chi(s))} for s in (0.0, 0.5, 0.7071067811865476, 0.9, 1.0)],
        'bscCapacity': [{'f': f, 'y': N.capacity_grid([[1 - f, f], [f, 1 - f]], 1001)[0]} for f in (0.0, 0.05, 0.1, 0.25, 0.5)],
    }
    return rounded(out)


if __name__ == '__main__':
    path = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'qc-infoq.json'
    path.write_text(json.dumps(build(), separators=(',', ':'), ensure_ascii=False, sort_keys=True), encoding='utf-8')
    print(f'wrote {path}')
