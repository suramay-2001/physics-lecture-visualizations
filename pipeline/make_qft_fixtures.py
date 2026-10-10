#!/usr/bin/env python3
"""Reference values for the Chapter Q18 engine (app/src/physics/qc/qft.ts and the Simon helpers of app/src/physics/qc/oracles.ts), by an INDEPENDENT route.

The TypeScript engine builds each circuit from the circuit module and reads its states column by column with in-place kernels; it also has closed forms
(the Dirichlet kernel, the product form of the QFT, the mean of eigenphase distributions). This script uses neither: pipeline/qft_numpy.py builds every
gate as an explicit dense matrix (np.kron, a controlled-gate builder over the basis states), multiplies the circuits out, takes the Fourier matrix from
np.fft.ifft(norm='ortho'), sums unit arrows with np.exp, finds eigenvalues with np.linalg.eigvals, reads continued fractions on exact Fractions and counts
by enumeration. Agreement is therefore evidence, not the same code checking itself.

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the TOP wire = the most significant bit; the eigenphase tau is a fraction of a turn.
Complex numbers are written [re, im]; floats are rounded to 15 significant digits.

Usage: python3 pipeline/make_qft_fixtures.py  -> app/src/physics/__fixtures__/qc-qft.json   (deterministic; no seed)
"""
import json
import math
import sys
from fractions import Fraction
from itertools import combinations
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qft_numpy as Q  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def cx(z):
    return [float(np.real(z)), float(np.imag(z))]


def mat(M):
    return [[cx(z) for z in row] for row in np.asarray(M)]


def rounded(x):
    if isinstance(x, float):
        return float(f"{x:.15g}")
    if isinstance(x, dict):
        return {k: rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def build():
    out = {
        'about': 'numpy reference values for physics/qc/qft.ts and the Simon helpers of physics/qc/oracles.ts (dense gate matrices, np.fft, np.linalg.eigvals, exact '
        'Fractions, enumeration; never the TypeScript formulas). Regenerate: python3 pipeline/make_qft_fixtures.py'
    }

    # ---- the QFT circuit as a product of dense gates; checked here against numpy's own transform
    qft = {}
    for m in range(1, 6):
        U = Q.qft_circuit_matrix(m)
        assert np.allclose(U, Q.F(2 ** m)), f'QFT circuit m={m}'
        qft[str(m)] = mat(U)
    out['qft'] = qft
    out['counts'] = {str(m): {'gates': Q.qft_gate_counts(m)[0], 'swaps': Q.qft_gate_counts(m)[1], 'fft': m * 2 ** m} for m in (1, 2, 3, 4, 5, 10)}

    # ---- the product form, wire by wire
    prod = []
    for m, a in [(3, a) for a in range(8)] + [(4, 5), (4, 11), (5, 22)]:
        angles = Q.product_angles_deg(a, m)
        fac = [np.array([1, np.exp(1j * math.radians(g))]) / math.sqrt(2) for g in angles]
        assert np.allclose(Q.kron_all(fac), Q.F(2 ** m)[:, a]), f'product form m={m} a={a}'
        prod.append({'m': m, 'a': a, 'anglesDeg': angles})
    out['product'] = prod

    # ---- Bergou's printed prefactor and the printed expansion
    printed_norm = {}
    for m in range(1, 6):
        M = 2 ** m
        v = np.array([np.exp(2j * math.pi * 1 * y / M) for y in range(M)]) / M  # a = 1, prefactor 1/2^m as printed
        printed_norm[str(m)] = float(np.sum(np.abs(v) ** 2))
    out['printedNorm2'] = printed_norm

    def printed_value(bits):
        m = len(bits)
        w = [2 ** (m - 1)] + [2 ** (m - 1)] + [2 ** (m - j) for j in range(3, m + 1)]
        return sum(int(b) * wt for b, wt in zip(bits, w))

    out['expandPrinted'] = {format(a, '03b'): printed_value(format(a, '03b')) for a in range(8)}
    out['expandPrinted4'] = {format(a, '04b'): printed_value(format(a, '04b')) for a in range(16)}

    # ---- phase estimation: the circuit by dense matrices, and the sum of unit arrows
    pe = []
    for tau, m, tgt in [(5 / 8, 3, '1'), (1 / 3, 3, '1'), (1 / 3, 4, '1'), (11 / 16, 3, '1'), (11 / 16, 4, '1'), (0.3, 3, '1'), (0.3, 4, '1'), (5 / 8, 3, '+'), (0.3, 4, '+'), (0.0, 3, '0')]:
        reading = Q.pe_reading(tau, m, tgt)
        if tgt == '1':
            assert np.allclose(reading, Q.pe_sum(tau, m)), f'PE closed form tau={tau} m={m}'
        pe.append({'tau': tau, 'm': m, 'target': tgt, 'reading': list(reading)})
    out['pe'] = pe
    kick = Q.pe_state(5 / 8, 3, '1', upto='kick')
    out['peKick'] = [cx(kick[(y << 1) | 1]) for y in range(8)]
    out['peSum'] = [{'tau': tau, 'm': m, 'dist': list(Q.pe_sum(tau, m))} for tau, m in [(5 / 8, 3), (1 / 3, 3), (1 / 3, 5), (11 / 16, 4), (0.3, 3), (0.05, 6), (0.999, 3), (1 / 3, 8)]]
    out['peWorst'] = {str(m): float(abs(np.sum(np.exp(2j * math.pi * 2.0 ** -(m + 1) * np.arange(2 ** m))) / 2 ** m) ** 2) for m in range(1, 11)}
    out['peTail'] = [{'m': m, 'k': k, 'v': Q.pe_far_tail(m, k, 1000)} for m in (4, 6, 8) for k in (1, 2, 3)]
    within = []
    for tau, m, w in [(1 / 3, 3, 1 / 8), (1 / 3, 6, 1 / 8), (5 / 8, 3, 1 / 8), (0.3, 5, 1 / 16)]:
        p = Q.pe_sum(tau, m)
        v = 0.0
        for x in range(2 ** m):
            d = abs(x / 2 ** m - tau) % 1
            if min(d, 1 - d) <= w + 1e-9:
                v += p[x]
        within.append({'tau': tau, 'm': m, 'w': w, 'v': float(v)})
    out['peWithin'] = within
    out['ncWires'] = [{'n': n, 'eps': e, 't': n + math.ceil(math.log2(2 + 1 / (2 * e)))} for n, e in [(3, 0.1), (3, 0.25), (4, 0.05), (5, 0.01), (1, 0.5)]]

    # ---- quantum counting, N = 4 (two search wires), m = 3 counting wires
    counting = []
    for marked in ([], [3], [1, 2], [1, 2, 3], [0]):
        reading = Q.counting_reading(marked)
        counting.append({'marked': marked, 'm': 3, 'n': 2, 'reading': list(reading)})
    out['counting'] = counting
    ev = np.linalg.eigvals(Q.grover_q(2, [3]))
    out['countQAnglesDeg'] = sorted(float(np.degrees(np.angle(z))) for z in ev)
    out['countQ'] = {'M1': mat(Q.grover_q(2, [3])), 'M0': mat(Q.grover_q(2, [])), 'M2': mat(Q.grover_q(2, [1, 2]))}
    out['countEstimate'] = {str(a): float(4 * math.sin(math.pi * a / 8) ** 2) for a in range(8)}

    # ---- order finding, x = 2 mod 21
    x, N = 2, 21
    r = Q.multiplicative_order(x, N)
    shift = Q.shift_matrix(r)
    phases = sorted(float((np.angle(z) / (2 * math.pi)) % 1.0) for z in np.linalg.eigvals(shift))
    # eigenvalues near 1 - 1e-16 wrap to 1.0: fold them back to 0
    phases = sorted(0.0 if abs(p - 1.0) < 1e-9 else p for p in phases)
    order = {'x': x, 'N': N, 'r': r, 'orbit': [pow(x, k, N) for k in range(r)], 'eigenphases': phases}
    for t in (5, 6, 11):
        dist = Q.comb_mixture_distribution(x, N, t)
        good = [y for y in range(2 ** t) if Q.order_from_reading(y, t, x, N) == r]
        order[f't{t}'] = {'dist': list(dist), 'good': good, 'success': float(sum(dist[y] for y in good))}
    sq = np.linalg.eigvals(np.linalg.matrix_power(shift, 2))
    order['distinctSquare'] = len({round(float((np.angle(z) / (2 * math.pi)) % 1.0) % 1.0, 6) % 1.0 for z in sq})
    order['order4'] = Q.multiplicative_order(4, N)
    order['other'] = [{'x': xx, 'N': NN, 'r': Q.multiplicative_order(xx, NN), 'orbit': [pow(xx, k, NN) for k in range(Q.multiplicative_order(xx, NN))]} for xx, NN in [(4, 21), (5, 21), (2, 15), (7, 15), (3, 7)]]
    order['cf27'] = Q.order_from_reading(27, 5, 2, 21)
    out['order'] = order

    # ---- Simon
    simon = {}
    for n, s in [(2, 3), (2, 1), (3, 6), (3, 1), (3, 5), (3, 7)]:
        f = Q.simon_function(s, n)
        simon[f'{n}_{s}'] = {'n': n, 's': s, 'table': f, 'perp': [y for y in range(2 ** n) if Q.dot2(y, s) == 0]}
    # the dense 5-wire circuit for s = 110: the first n wires' chances after the last H, for each answer read
    n, s = 3, 6
    nq = 5
    st = Q.simon_state(s, n, 'query')
    out_dist = {}
    out_chance = {}
    for ans in range(4):
        mask = np.array([1.0 if (i & 3) == ans else 0.0 for i in range(32)])
        p = float(np.sum(np.abs(st * mask) ** 2))
        post = st * mask / math.sqrt(p)
        for q in range(n):
            post = Q.op_on(nq, Q.H1, q) @ post
        out_chance[str(ans)] = p
        out_dist[str(ans)] = [float(sum(abs(post[(y << 2) | o]) ** 2 for o in range(4))) for y in range(8)]
        if ans == 1:
            simon['post01'] = {'places': [i for i in range(32) if abs(st[i] * mask[i]) > 1e-12], 'afterH': [i for i in range(32) if abs(post[i]) > 1e-12]}
    simon['answerChance'] = out_chance
    simon['yDist'] = out_dist
    # the printed Eq. 7.33: 2^-(n+1)/2 over y.s = 0 with z = 1
    simon['printedNorm2'] = {str(nn): float(sum((2.0 ** (-(nn + 1) / 2)) ** 2 for y in range(2 ** nn) if Q.dot2(y, ss) == 0)) for nn, ss in [(2, 3), (3, 6), (3, 5)]}
    simon['expectedRuns'] = {str(nn): float(Q.expected_runs_chain(nn)) for nn in (2, 3, 4, 10)}
    simon['runsSuffice'] = {f'{nn}_{ss}': float(Q.runs_suffice_enumerated(ss, nn)) for nn, ss in [(2, 3), (3, 6), (3, 1), (4, 9)]}
    simon['collision'] = {f'{nn}_{ss}_{k}': float(Q.collision_probability(ss, nn, k)) for nn, ss in [(3, 6), (3, 1), (4, 9)] for k in (2, 3, 4)}
    simon['union'] = {f'{nn}_{k}': float(Fraction(k * (k - 1), 2 * (2 ** nn - 1))) for nn in (3, 4) for k in (2, 3, 4)}
    out['simon'] = simon
    return rounded(out)


if __name__ == '__main__':
    path = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'qc-qft.json'
    path.write_text(json.dumps(build(), separators=(',', ':'), ensure_ascii=False, sort_keys=True), encoding='utf-8')
    print(f'wrote {path}')
