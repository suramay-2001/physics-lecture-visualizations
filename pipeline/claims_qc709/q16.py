#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q16.values.ts (Physics 709, chapter Q16: Deutsch-Jozsa and Bernstein-Vazirani).

Independent route (never Q16.values.ts's own helpers, never physics/qc/oracles.ts or the circuit module): every operator is an explicit
dense numpy matrix (np.kron of Hadamards, np.diag for the phase oracle, an explicit permutation matrix for the f-CNOT), parities are
read from strings of bits (not popcounts), the exact classical cost is found by asking "after k queries answered 0, does a balanced function
still fit?" with exact binomial counts (and the n = 3 minimax by a frozenset search over whole functions), and the chance that random
queries miss a balanced function is an exact Fraction of binomials.

Units: the qubit order is q0 = leftmost tensor factor = most significant bit (matches state.ts); the string 101 is index 5, 1011 is 11.

Usage (from the repo root): python3 pipeline/claims_qc709/q16.py -> app/src/physics/__fixtures__/claims-qc709/q16.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import itertools
import json
import math
from fractions import Fraction
from functools import reduce
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
H1 = np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2)
MINUS = np.array([1, -1], dtype=complex) / math.sqrt(2)


def hn(n):
    return reduce(np.kron, [H1] * n)


def e(N, i):
    v = np.zeros(N, dtype=complex)
    v[i] = 1
    return v


def dot2(x, z, n):
    """x.z mod 2 from the two strings of bits."""
    return sum(int(a) * int(b) for a, b in zip(format(x, f"0{n}b"), format(z, f"0{n}b"))) % 2


def table(f, n):
    return [int(f(x)) for x in range(2 ** n)]


def bv_table(a, b, n):
    return table(lambda x: (dot2(a, x, n) + b) % 2, n)


def dj_states(t):
    """The phase form column by column: [H^n|0>, phase oracle on that, H^n on that]."""
    n = int(round(math.log2(len(t))))
    H = hn(n)
    O = np.diag([(-1.0) ** v for v in t]).astype(complex)
    s1 = H @ e(2 ** n, 0)
    s2 = O @ s1
    s3 = H @ s2
    return s1, s2, s3


def fcnot(t):
    n = int(round(math.log2(len(t))))
    N = 2 ** n
    U = np.zeros((2 * N, 2 * N), dtype=complex)
    for x in range(N):
        for y in range(2):
            U[2 * x + (y ^ t[x]), 2 * x + y] = 1
    return U


def query_target(t, x):
    n = int(round(math.log2(len(t))))
    psi = fcnot(t) @ e(2 ** (n + 1), 2 * x)
    return int(np.argmax(np.abs(psi))) % 2


def det_worst(n):
    """After k distinct queries all answered 0, a balanced function still fits iff C(N-k, N/2) > 0; the worst case is the first k with none."""
    N = 2 ** n
    return next(k for k in range(N + 1) if math.comb(N - k, N // 2) == 0)


def minimax(n):
    """Frozenset route: the value of a position (the set of whole functions still consistent) is 0 once every one shares a verdict."""
    N = 2 ** n
    funcs = [tuple([0] * N), tuple([1] * N)]
    for ones in itertools.combinations(range(N), N // 2):
        funcs.append(tuple(1 if i in ones else 0 for i in range(N)))
    memo = {}

    def value(alive):
        if alive in memo:
            return memo[alive]
        if len({len(set(f)) == 1 for f in alive}) <= 1:
            memo[alive] = 0
            return 0
        best = None
        for x in range(N):
            parts = [frozenset(f for f in alive if f[x] == bit) for bit in (0, 1)]
            if any(len(p) == len(alive) for p in parts):
                continue
            worst = max(1 + value(p) for p in parts if p)
            best = worst if best is None else min(best, worst)
        memo[alive] = best
        return best

    return value(frozenset(funcs))


def miss(N, k):
    return float(Fraction(2 * math.comb(N // 2, k), math.comb(N, k)))


F_BALN = [0, 1, 1, 1, 1, 0, 0, 0]
F_BAL = table(lambda x: dot2(x, 0b101, 3), 3)
F_ONE = [1] * 8

# --- hadamard-n
h1 = hn(1) @ e(2, 1)
h2 = hn(2) @ e(4, 3)
h3 = hn(3) @ e(8, 5)
hh3 = hn(3) @ (hn(3) @ e(8, 5))
hsum = lambda z, n: float(np.real((hn(n) * 2 ** (n / 2))[:, z].sum()))

# --- dj
baln = dj_states(F_BALN)
one = dj_states(F_ONE)
bal = dj_states(F_BAL)

# --- bv: the pair (a, b) that fits Bergou's n + 1 classical answers, by brute-force search (must be unique)
a, b = 0b1011, 1
t4 = bv_table(a, b, 4)
asked = [0] + [1 << j for j in range(3, -1, -1)]
fits = [(aa, bb) for aa in range(16) for bb in (0, 1) if all(bv_table(aa, bb, 4)[x] == t4[x] for x in asked)]
assert fits == [(a, b)], fits
bvs = dj_states(t4)

bal_iff_a = all((sum(bv_table(aa, bb, 4)) == 8) == (aa != 0) and ((len(set(bv_table(aa, bb, 4))) == 1) == (aa == 0)) for aa in range(16) for bb in (0, 1))

values = {
    # hadamard-n
    "q16H1Bar": float(abs(h1[0])),
    "q16H1Minus": float(np.real(h1[1])),
    "q16H2Pos": float(np.real(h2[0])),
    "q16H2Neg": float(np.real(h2[1])),
    "q16H3Amp": float(abs(h3[0])),
    "q16H3Mean": float(np.real(h3.mean())),
    "q16H3ZeroMean": float(np.real((hn(3) @ e(8, 0)).mean())),
    "q16HHBack": float(abs(hh3[5]) ** 2),
    "q16WalshZ010": hsum(2, 3),
    "q16WalshZ000": hsum(0, 3),
    "q16MinusCount": float(sum(1 for z in range(8) if dot2(5, z, 3))),
    "q16DotPair": float(dot2(0b1011, 0b1101, 4)),
    # dj
    "q16DjBar": float(abs(baln[1][0])),
    "q16DjMean": float(np.real(baln[1].mean())),
    "q16DjBalnZero": float(abs(baln[2][0]) ** 2),
    "q16DjBalnP": float(abs(baln[2][4]) ** 2),
    "q16DjConstAmp": float(np.real(one[2][0])),
    "q16DjOneMean": float(np.real(one[1].mean())),
    "q16DjBalLands": float(abs(bal[2][5]) ** 2),
    # classical-cost
    "q16ClqBit": float(query_target(F_BALN, 0b011)),
    "q16ClqBit110": float(query_target(F_BALN, 0b110)),
    "q16DetWorst3": float(det_worst(3)),
    "q16MinimaxN3": float(minimax(3)),
    "q16DetWorst10": float(det_worst(10)),
    "q16Miss8k3": miss(8, 3),
    "q16Miss1024k10": miss(1024, 10),
    # bv
    "q16BvClassical": float(len(asked)),
    "q16BvQ1000": float(query_target(t4, 0b1000)),
    "q16BvAmp": float(np.real(bvs[2][11])),
    "q16BvP": float(abs(bvs[2][11]) ** 2),
    "q16BvPreAmp": float(abs(bvs[1][0])),
    "q16BalIffA": 1.0 if bal_iff_a else 0.0,
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q16.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q16, numpy (explicit dense matrices: np.kron Hadamards, np.diag phase oracle, an explicit "
            "permutation matrix for the f-CNOT, parities from strings of bits, the exact classical cost from binomial counts and a frozenset minimax, "
            "an exact Fraction for the random-query miss chance; never physics/qc/oracles.ts or Q16.values.ts's own helpers). "
            "Regenerate: python3 pipeline/claims_qc709/q16.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
