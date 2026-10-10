#!/usr/bin/env python3
"""Reference values for the oracle helpers (app/src/physics/qc/oracles.ts), computed by an INDEPENDENT route.

The TypeScript engine builds Deutsch-Jozsa and Bernstein-Vazirani circuits from the circuit module, runs them column by column with
in-place kernels, counts parities with bit tricks, solves the exact classical minimax over bit masks, and gets the chance of a missed
balanced function from a running product. This script uses none of that: every operator is an explicit dense numpy matrix (np.kron of
Hadamards, an explicit permutation matrix for the f-CNOT, np.diag for the phase oracle), parities come from Python's string of bits, the
minimax runs over frozensets of whole functions (a different state from the engine's masks), the random-query miss chance is counted over
every balanced function and every k-subset of inputs (exact Fractions), and Bergou's classical method is cross-checked by brute-force search
for the pair (a, b) that fits the n + 1 answers. Agreement is therefore evidence, not the same code typed twice.

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the most significant bit; a string x is the index of its bits (so
101 is 5); f[x] is the truth table. Complex numbers are written [re, im]; floats are rounded to 15 significant digits.

Usage: python3 pipeline/make_oracles_fixtures.py  -> app/src/physics/__fixtures__/qc-oracles.json   (deterministic; no seed)
"""
import itertools
import json
import math
from fractions import Fraction
from functools import reduce
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
H1 = np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2)
MINUS = np.array([1, -1], dtype=complex) / math.sqrt(2)


def rounded(x):
    if isinstance(x, float):
        return float(f"{x:.15g}")
    if isinstance(x, dict):
        return {k: rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def cx(z):
    return [float(np.real(z)), float(np.imag(z))]


def vec(v):
    return [cx(z) for z in np.asarray(v).ravel()]


def dot2(x, z, n):
    """x.z mod 2 from the strings of bits (not the engine's popcount)."""
    xs = format(x, f"0{n}b")
    zs = format(z, f"0{n}b")
    return sum(int(a) * int(b) for a, b in zip(xs, zs)) % 2


def hn(n):
    return reduce(np.kron, [H1] * n)


def basis(N, i):
    v = np.zeros(N, dtype=complex)
    v[i] = 1
    return v


def phase_out(table):
    """Dense route, the kickback form: H^n . diag((-1)^f) . H^n |0..0>."""
    n = int(round(math.log2(len(table))))
    H = hn(n)
    return H @ np.diag([(-1.0) ** v for v in table]).astype(complex) @ H @ basis(2 ** n, 0)


def ancilla_out(table):
    """Dense route, Bergou's Fig. 7.1: (H^n x I) . U_f . (H^n x I) |0..0>|->, U_f an explicit permutation matrix."""
    n = int(round(math.log2(len(table))))
    N = 2 ** n
    U = np.zeros((2 * N, 2 * N), dtype=complex)
    for x in range(N):
        for y in range(2):
            U[2 * x + (y ^ table[x]), 2 * x + y] = 1
    HI = np.kron(hn(n), np.eye(2))
    return HI @ U @ HI @ np.kron(basis(N, 0), MINUS)


def table_of(f, n):
    return [int(f(x)) for x in range(2 ** n)]


def bv(a, b, n):
    return [(dot2(a, x, n) + b) % 2 for x in range(2 ** n)]


def balanced_tables(n):
    N = 2 ** n
    out = []
    for ones in itertools.combinations(range(N), N // 2):
        t = [0] * N
        for i in ones:
            t[i] = 1
        out.append(t)
    return out


# ------------------------------------------------------------------ blocks


def walsh_cases():
    out = []
    for n in (1, 2, 3, 4):
        H = hn(n) * (2 ** (n / 2))  # entries are exactly +-1: (-1)^(x.z)
        sums = [float(np.real(H[:, z].sum())) for z in range(2 ** n)]
        odd = {str(x): int(sum(1 for z in range(2 ** n) if dot2(x, z, n))) for x in range(2 ** n)}
        out.append({"n": n, "sums": sums, "oddCount": odd})
    # H^{(x)n}|x> for n = 3, every x (the columns of the dense Kronecker product)
    cols = [vec(hn(3) @ basis(8, x)) for x in range(8)]
    # twice is nothing
    twice = [float(np.max(np.abs(hn(n) @ hn(n) - np.eye(2 ** n)))) for n in (1, 2, 3, 4)]
    return {"cases": out, "columns3": cols, "twiceGap": twice}


def dj_cases():
    f_baln = [0, 1, 1, 1, 1, 0, 0, 0]
    f_bal = table_of(lambda x: dot2(x, 0b101, 3), 3)
    one = [1] * 8
    zero = [0] * 8
    named = {"F_BALN": f_baln, "F_BAL": f_bal, "F_ONE": one, "F_ZERO": zero}
    out = {}
    for k, t in named.items():
        out[k] = {"table": t, "phase": vec(phase_out(t)), "ancilla": vec(ancilla_out(t))}
    # every balanced function on 2 and 3 bits, and every table on 3 bits (promise or not), both circuit forms
    bal3 = balanced_tables(3)
    out["balanced3"] = [{"table": t, "phase": vec(phase_out(t))} for t in bal3]
    out["balanced2"] = [{"table": t, "phase": vec(phase_out(t))} for t in balanced_tables(2)]
    # n = 4: only the quantity the promise is about, over all 12870 balanced functions
    worst0 = max(abs(complex(phase_out(t)[0])) for t in balanced_tables(4))
    out["balanced4MaxZeroAmp"] = float(worst0)
    # the 256 tables on three bits: the all-zeros amplitude of the phase form (Eq. 7.7)
    out["allTables3Zero"] = [float(np.real(phase_out([(m >> x) & 1 for x in range(8)])[0])) for m in range(256)]
    return out


def bv_cases():
    out = []
    for n in (1, 2, 3, 4):
        for a in range(2 ** n):
            for b in (0, 1):
                t = bv(a, b, n)
                psi = phase_out(t)
                k = int(np.argmax(np.abs(psi)))
                out.append({"n": n, "a": a, "b": b, "table": t, "outIndex": k, "outAmp": cx(psi[k]), "balanced": int(sum(t) == 2 ** (n - 1))})
    # the running example: before the last Hadamards, sixteen signs of size 1/4
    t = bv(0b1011, 1, 4)
    pre = hn(4) @ basis(16, 0)
    pre = np.diag([(-1.0) ** v for v in t]).astype(complex) @ pre
    return {"cases": out, "preAmps": vec(pre)}


def classical_bv():
    """Bergou's method: the n + 1 asked strings, and the pairs (a, b) that fit ALL the answers (brute-force search; must be exactly one)."""
    out = []
    for n in (2, 3, 4):
        for a, b in ((0b1011 % 2 ** n, 1), (1, 0), (2 ** n - 1, 1), (0, 0)):
            t = bv(a, b, n)
            asked = [0] + [1 << j for j in range(n - 1, -1, -1)]
            answers = [t[x] for x in asked]
            fits = [(aa, bb) for aa in range(2 ** n) for bb in (0, 1) if all(bv(aa, bb, n)[x] == r for x, r in zip(asked, answers))]
            out.append({"n": n, "a": a, "b": b, "asked": asked, "count": len(asked), "fits": [list(p) for p in fits]})
    return out


def minimax(n):
    """Frozenset route: a position is the set of whole functions still consistent with the answers; the value is 0 once all agree on the verdict."""
    N = 2 ** n
    funcs = [tuple([0] * N), tuple([1] * N)] + [tuple(t) for t in balanced_tables(n)]
    memo = {}

    def verdict(f):
        return "c" if len(set(f)) == 1 else "b"

    def value(alive):
        if alive in memo:
            return memo[alive]
        if len({verdict(f) for f in alive}) <= 1:
            memo[alive] = 0
            return 0
        best = None
        for x in range(N):
            parts = [frozenset(f for f in alive if f[x] == bit) for bit in (0, 1)]
            if any(len(p) == len(alive) for p in parts):
                continue  # every consistent function answers alike at x: asking it teaches nothing
            parts = [p for p in parts if p]
            worst = max(1 + value(p) for p in parts)
            best = worst if best is None else min(best, worst)
        memo[alive] = best
        return best

    return value(frozenset(funcs))


def miss_brute(N):
    """Over every balanced function and every k-subset of the N inputs, the exact fraction of pairs whose answers all agree."""
    fs = balanced_tables(int(round(math.log2(N))))
    out = {}
    for k in range(1, N + 1):
        agree = total = 0
        for f in fs:
            for S in itertools.combinations(range(N), k):
                vals = {f[x] for x in S}
                total += 1
                agree += 1 if len(vals) == 1 else 0
        out[str(k)] = float(Fraction(agree, total))
    return out


def miss_cases():
    exact = []
    for N, k in ((8, 3), (8, 1), (8, 4), (8, 5), (4, 2), (4, 3), (16, 5), (64, 6), (1024, 10), (1024, 1), (1024, 2), (1024, 512), (1024, 513), (2 ** 20, 10)):
        p = Fraction(2 * math.comb(N // 2, k), math.comb(N, k)) if k >= 1 else Fraction(1)
        exact.append({"N": N, "k": k, "p": float(p)})
    return {"exact": exact, "brute4": miss_brute(4), "brute8": miss_brute(8)}


def query_cases():
    """One classical query: the f-CNOT alone on |x>|0>, as a dense permutation matrix."""
    out = []
    f = [0, 1, 1, 1, 1, 0, 0, 0]
    n = 3
    N = 8
    U = np.zeros((2 * N, 2 * N), dtype=complex)
    for x in range(N):
        for y in range(2):
            U[2 * x + (y ^ f[x]), 2 * x + y] = 1
    for x in range(N):
        psi = U @ basis(2 * N, 2 * x)
        k = int(np.argmax(np.abs(psi)))
        out.append({"x": x, "index": k, "target": k % 2})
    return out


data = {
    "walsh": walsh_cases(),
    "dj": dj_cases(),
    "bv": bv_cases(),
    "bvClassical": classical_bv(),
    "minimax": {str(n): minimax(n) for n in (1, 2, 3)},
    "miss": miss_cases(),
    "query": query_cases(),
}
out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qc-oracles.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(rounded(data), separators=(",", ":"), allow_nan=False))
print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
