#!/usr/bin/env python3
"""Reference values for the Chapter Q19 engine (app/src/physics/qc/walk.ts, trotter.ts, variational.ts), by an INDEPENDENT route.

The TypeScript engine steps the scattering walk vertex by vertex (r and t at each vertex, a rank-one sum at the centre), evolves the coin walk on the line by
direct stepping, builds the spin chain from embedded Pauli products with closed-form bond gates and an eigenbasis exponential, and sums the QAOA state in place.
This script uses none of that (pipeline/walk_numpy.py): directed arcs with the reflection 2J/n - I, the circuit form X_dir(|0><0| (x) O + |1><1| (x) D), a
momentum-space coin walk with np.fft, np.kron Paulis with scipy.linalg.expm, np.linalg.norm(., 2), dense QAOA matrices and a CNOT-phase-CNOT circuit.
Agreement is therefore evidence, not the same code checking itself.

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the TOP wire = the most significant bit; hbar = 1; S = sigma/2. Complex numbers are
written [re, im]; floats are rounded to 15 significant digits.

Usage: python3 pipeline/make_walk_fixtures.py  -> app/src/physics/__fixtures__/qc-walk.json   (deterministic; no seed)
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import walk_numpy as W  # noqa: E402

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


def rows(M):
    return [[float(v) for v in row] for row in np.asarray(M)]


def first_max(xs, tol=1e-12):
    best = max(xs)
    return next(i for i, v in enumerate(xs) if v >= best - tol)


def build():
    out = {
        'about': 'numpy reference values for physics/qc/walk.ts, trotter.ts and variational.ts (math.comb, momentum-space FFT, directed arcs with 2J/n - I, the circuit '
        'form X_dir(|0><0| (x) O + |1><1| (x) D), np.kron Paulis with scipy expm, np.linalg.norm(., 2), dense QAOA matrices and a CNOT-phase-CNOT circuit; never the '
        'TypeScript formulas). Regenerate: python3 pipeline/make_walk_fixtures.py'
    }

    # ---- classical walks
    classical = {'dist': {str(n): W.walk_dist(n) for n in (0, 1, 2, 3, 4, 10, 100)}, 'sigma': {str(n): W.walk_sigma(n) for n in (1, 2, 10, 50, 100)}}
    classical['pathHitting'] = {str(N): W.path_hitting(N) for N in (2, 3, 4, 10, 25)}
    for N in (2, 3, 4, 10, 25):
        assert abs(W.path_hitting(N) - (N - 1) ** 2) < 1e-8, f'path hitting N={N}'
    out['classical'] = classical

    # ---- the Hadamard coin walk (momentum-space route)
    out['coin'] = {
        'chances': {str(n): W.coin_chances(n) for n in (0, 1, 2, 3, 10, 25)},
        'sigma': {str(n): W.coin_sigma(n) for n in (1, 2, 3, 10, 30, 100)},
    }
    p3 = W.coin_chances(3)
    assert max(abs(p3[k] - W.walk_dist(3)[(k + 0) // 2] * (1 if k % 2 == 0 else 0)) for k in range(7)) < 1e-12, 'three coin steps equal the classical chances'

    # ---- the vertex rule
    out['vertex'] = {str(n): rows(2.0 * np.ones((n, n)) / n - np.eye(n)) for n in (1, 2, 3, 5, 8)}

    # ---- the star walk
    star = {'U': {}, 'chances': {}, 'peak': {}, 'M': {}, 'poly': {}, 'eig': {}}
    for N in (2, 4, 8, 16):
        U = W.star_U(N, marked=1)
        # vertex numbering: the marked SPOKE is vertex 1 (the centre is vertex 0)
        if N in (2, 4, 8):
            assert np.allclose(U, W.star_U_circuit(N, 1)), f'arc route and circuit route agree, N={N}'
        star['U'][str(N)] = rows(U)
    star['U']['8m3'] = rows(W.star_U(8, marked=3))
    star['Uplain4'] = rows(W.star_U(4))
    # walks: dense full U for N = 4, 8, 16; reduced 4-dim M (formula) for N = 1024, validated against the projection of the dense U at N = 8, 16, 32
    for N in (4, 8, 16):
        star['chances'][str(N)] = W.marked_chances(W.star_U(N, 1), N, 40, W.start_vec(N))
    star['chances']['8in'] = W.marked_chances(W.star_U(8, 1), 8, 14, W.start_vec(8, start='in'))
    for N in (8, 16, 32):
        B = W.star_basis(N)
        Mproj = B @ W.star_U(N, 1) @ B.T
        assert np.allclose(Mproj, W.reduced_star_M_formula(N)), f'M (7.53) = projection, N={N}'
        assert np.allclose(W.star_U(N, 1) @ B.T, B.T @ Mproj), f'the span is invariant, N={N}'
    for N in (8, 16, 32):
        star['M'][str(N)] = rows(W.reduced_star_M_formula(N))
        star['poly'][str(N)] = [float(v) for v in np.poly(W.reduced_star_M_formula(N))]
    M8 = W.reduced_star_M_formula(8)
    star['eig']['8'] = sorted(float(a) for a in np.angle(np.linalg.eigvals(M8)))
    star['eig']['16'] = sorted(float(a) for a in np.angle(np.linalg.eigvals(W.reduced_star_M_formula(16))))
    v0 = [1 / math.sqrt(1024), 0, math.sqrt(1023 / 1024), 0]
    ch1024 = W.reduced_chances(W.reduced_star_M_formula(1024), v0, 110, (0, 1))
    star['chances']['1024'] = ch1024
    # the reduced chances equal the full walk
    assert np.allclose(W.reduced_chances(W.reduced_star_M_formula(16), [1 / 4, 0, math.sqrt(15) / 4, 0], 40, (0, 1)), star['chances']['16'])
    for N in (4, 8, 16):
        ch = star['chances'][str(N)]
        star['peak'][str(N)] = first_max(ch[: math.ceil(math.pi / math.asin(1 / math.sqrt(N))) + 3])
    star['peak']['1024'] = first_max(ch1024[: math.ceil(math.pi / math.asin(1 / 32)) + 3])
    out['star'] = star

    # ---- the extra-edge walk
    extra = {'U': {}, 'near': {}, 'edge': {}, 'M': {}, 'poly': {}, 'peak': {}}
    for N in (3, 4, 8):
        extra['U'][str(N)] = rows(W.star_U(N, extra=(1, 2)))
    for N in (8, 16, 64):
        B = W.extra_basis(N)
        Uf = W.star_U(N, extra=(1, 2))
        Mproj = B @ Uf @ B.T
        assert np.allclose(Mproj, W.reduced_extra_M_formula(N)), f'M (7.68) = projection, N={N}'
        assert np.allclose(Uf @ B.T, B.T @ Mproj), f'extra span invariant, N={N}'
        extra['M'][str(N)] = rows(W.reduced_extra_M_formula(N))
        extra['poly'][str(N)] = [float(v) for v in np.poly(W.reduced_extra_M_formula(N))]
    for N, nmax in ((8, 20), (64, 60)):
        for sign, key in ((-1, ''), (1, 'plus')):
            near, edge = W.extra_chances(W.star_U(N, extra=(1, 2)), N, nmax, W.start_vec(N, extra=(1, 2), sign=sign))
            extra['near'][f'{N}{key}'] = near
            extra['edge'][f'{N}{key}'] = edge
    # N = 1024 from the 5-dimensional M (the start is psi_init = (psi1 - psi2 + sqrt(N-2)(psi3 - psi4))/sqrt(2N) in the reduced basis)
    for N in (64, 1024):
        s = 1 / math.sqrt(2 * N)
        v0 = [s * math.sqrt(2), -s * math.sqrt(2), s * math.sqrt(N - 2), -s * math.sqrt(N - 2), 0.0]
        M = W.reduced_extra_M_formula(N)
        near = W.reduced_chances(M, v0, 130, (0, 1))
        edge = W.reduced_chances(M, v0, 130, (4,))
        if N == 64:
            assert np.allclose(near[:61], extra['near']['64']), 'reduced 5-dim walk = full walk at N = 64'
        extra['near'][f'{N}r'] = near
        extra['edge'][f'{N}r'] = edge
    for N in (8, 64, 1024):
        series = extra['near'][f'{N}r'] if N == 1024 else extra['near'][str(N)]
        d = 2 / math.sqrt(3 * N)
        extra['peak'][str(N)] = first_max(series[: math.ceil(math.pi / d) + 1]) if N != 8 else first_max(series[:15])
    out['extra'] = extra

    # ---- the spin chain
    tro = {}
    tro['bond'] = {str(Jt): cmat(W.expm(-1j * Jt * (-sum(np.kron(P, P) for P in (W.X, W.Y, W.Z)) / 4))) for Jt in (0.3, 0.7, math.pi, 2.5)}
    tro['H'] = {'3': cmat(W.chain_H(3, 1.0)), '4': cmat(W.chain_H(4, 0.8))}
    tro['U'] = {'3_1_2': cmat(W.expm(-1j * 2.0 * W.chain_H(3, 1.0))), '4_0.8_1.5': cmat(W.expm(-1j * 1.5 * W.chain_H(4, 0.8)))}
    U3 = W.expm(-1j * 2.0 * W.chain_H(3, 1.0))
    tro['err1'] = {str(M): W.spec_norm(W.trotter(3, 1.0, 2.0, M, 1) - U3) for M in (1, 2, 3, 4, 8, 14, 15, 16, 32)}
    tro['err2'] = {str(M): W.spec_norm(W.trotter(3, 1.0, 2.0, M, 2) - U3) for M in (1, 2, 3, 4, 8, 16, 32)}
    U4 = W.expm(-1j * 1.5 * W.chain_H(4, 0.8))
    tro['n4'] = {'err1_M3': W.spec_norm(W.trotter(4, 0.8, 1.5, 3, 1) - U4), 'err2_M3': W.spec_norm(W.trotter(4, 0.8, 1.5, 3, 2) - U4)}
    H1 = -1.0 * W.s_dot_s(3, 0, 1)
    H2 = -1.0 * W.s_dot_s(3, 1, 2)
    tro['comm'] = W.spec_norm(H1 @ H2 - H2 @ H1)
    tro['bound1_M8'] = 2.0 ** 2 / (2 * 8) * tro['comm']
    tro['mFor05'] = {
        '1': next(M for M in range(1, 200) if W.spec_norm(W.trotter(3, 1.0, 2.0, M, 1) - U3) < 0.05),
        '2': next(M for M in range(1, 200) if W.spec_norm(W.trotter(3, 1.0, 2.0, M, 2) - U3) < 0.05),
    }

    def site_chances(U):
        v = U[:, 4]  # the column of |100>
        return [float(abs(v[i]) ** 2) for i in (4, 2, 1)]

    tro['magnon'] = {'exact': site_chances(U3)}
    for M in (1, 2, 4, 8):
        tro['magnon'][f't1_{M}'] = site_chances(W.trotter(3, 1.0, 2.0, M, 1))
    for M in (1, 2, 4):
        tro['magnon'][f't2_{M}'] = site_chances(W.trotter(3, 1.0, 2.0, M, 2))
    # the one-flip block of H by direct submatrix extraction
    tro['magnon']['block'] = rows(np.real(W.chain_H(3, 1.0))[np.ix_([4, 2, 1], [4, 2, 1])])
    tro['magnon']['hopping'] = [float(abs(W.expm(-1j * 2.0 * np.real(W.chain_H(3, 1.0))[np.ix_([4, 2, 1], [4, 2, 1])])[i, 0]) ** 2) for i in range(3)]
    out['trotter'] = tro

    # ---- QAOA
    ring4 = [(0, 1), (1, 2), (2, 3), (3, 0)]
    ring5 = [(j, (j + 1) % 5) for j in range(5)]
    kite = [(0, 1), (1, 2), (2, 3), (0, 2)]
    q = {'ring4': {}, 'ring5': {}, 'kite': {}}
    q['cutTable4'] = [float(v) for v in W.cut_table(4, ring4)]
    pts = [(0.7, 0.3), (1.9, 2.2), (0.2, 0.1), (math.pi / 4, math.pi / 8), (0.3, 0.2), (0.0, 0.3), (0.7, 0.0), (2.4, 1.1)]
    for g, b in pts:
        q['ring4'][f'{g!r}_{b!r}'] = W.qaoa_F(4, ring4, g, b)
        assert abs(W.qaoa_F(4, ring4, g, b) - (2 + math.sin(4 * b) * math.sin(2 * g))) < 1e-12, 'closed form of the 4-cycle'
    for g, b in pts[:4]:
        q['ring5'][f'{g!r}_{b!r}'] = W.qaoa_F(5, ring5, g, b)
        q['kite'][f'{g!r}_{b!r}'] = W.qaoa_F(4, kite, g, b)
    psi = W.qaoa_psi(4, ring4, 0.7, 0.3)
    q['amp4'] = [[float(np.real(z)), float(np.imag(z))] for z in psi]
    circ = W.qaoa_circuit_psi(4, ring4, 0.7, 0.3)
    assert np.allclose(circ, psi, atol=1e-12), 'CNOT-phase-CNOT circuit = dense exponentials'
    q['hist4'] = [int(sum(1 for v in W.cut_table(4, ring4) if v == k)) for k in range(5)]
    best = W.qaoa_psi(4, ring4, math.pi / 4, math.pi / 8)
    pr = np.abs(best) ** 2
    cuts = W.cut_table(4, ring4)
    q['bestChances'] = [float(v) for v in pr]
    q['bestByCut'] = [float(pr[cuts == k].sum()) for k in range(5)]
    # grid best on a 0.5-degree grid (one mixer per beta, reused for every gamma)
    gs = np.arange(0, 180.0 + 1e-9, 0.5)
    bs = np.arange(0, 90.0 + 1e-9, 0.5)
    base = np.ones(16) / 4
    bestF, bestG, bestB = -1.0, 0.0, 0.0
    mixers = [W.kron(*[W.expm(-1j * math.radians(bd) * W.X)] * 4) for bd in bs]
    for gd in gs:
        st = np.exp(-1j * math.radians(gd) * cuts) * base
        for bd, Mx in zip(bs, mixers):
            f = float((np.abs(Mx @ st) ** 2 * cuts).sum())
            if f > bestF + 1e-12:
                bestF, bestG, bestB = f, float(gd), float(bd)
    q['gridBest'] = {'F': bestF, 'gammaDeg': bestG, 'betaDeg': bestB}
    path, evals = W.pattern_search(lambda g, b: W.qaoa_F(4, ring4, g, b), 0.3, 0.2, 0.2, 0.01)
    q['loop'] = {'moves': len(path) - 1, 'evals': evals, 'path': [[float(a), float(b), float(c)] for a, b, c in path]}
    # shots: ceil(ln(1-conf)/ln(1-p)) by counting runs (no logarithms)
    def shots(p, conf):
        k, miss = 0, 1.0
        while miss > 1 - conf + 1e-12:
            miss *= 1 - p
            k += 1
        return k

    q['shots'] = {'p17_32': shots(17 / 32, 0.9), 'p1_8': shots(1 / 8, 0.9), 'p1_2': shots(0.5, 0.9)}
    out['qaoa'] = q
    return rounded(out)


if __name__ == '__main__':
    path = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'qc-walk.json'
    path.write_text(json.dumps(build(), separators=(',', ':'), ensure_ascii=False, sort_keys=True), encoding='utf-8')
    print(f'wrote {path}')
