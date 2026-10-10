#!/usr/bin/env python3
"""Reference values for the classical-bit helpers added for Chapter F7 (app/src/physics/qc/bits.ts), computed by an INDEPENDENT route.

The TypeScript engine builds each gate's table from its definition bit by bit, counts functions by listing every truth table with bit
operations on integers, loops for the sort count, runs Gauss-Jordan on arrays of 0/1 and finds the big-O threshold by scanning n. This
script uses none of that: gates are Python lambdas over tuples of bits, the function census uses numpy arrays of the output columns,
reversible maps are counted with itertools.permutations, the sort count is len(list(itertools.combinations(...))), elimination works on
integer bitmasks (a row is one int, XOR is ^) instead of arrays, null spaces are found by trying every vector, and the threshold of the
definition f = O(g) is checked with exact Fractions. Agreement is therefore evidence, not the same code typed twice.

Conventions (decisions/qc709-map.md): a string x is the index of its bits with the first bit most significant (101 is 5); a truth table is
the list of outputs for x = 0 ... 2^n - 1; a table with m output bits stores each output as the number its bits spell.

Usage: python3 pipeline/make_bits_fixtures.py  -> app/src/physics/__fixtures__/qc-bits.json   (deterministic; no seed)
"""
import itertools
import json
import math
from fractions import Fraction
from math import comb
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent


def rounded(x):
    if isinstance(x, float):
        return float(f"{x:.15g}")
    if isinstance(x, dict):
        return {k: rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def bits_of(x, n):
    return tuple(int(c) for c in format(x, f"0{n}b"))


def num(bits):
    return int("".join(str(b) for b in bits), 2) if bits else 0


# ------------------------------------------------------------------ gates as maps of bits
GATES = {
    "NOT": (1, 1, lambda b: (1 - b[0],)),
    "AND": (2, 1, lambda b: (b[0] * b[1],)),
    "OR": (2, 1, lambda b: (1 if (b[0] or b[1]) else 0,)),
    "XOR": (2, 1, lambda b: ((b[0] + b[1]) % 2,)),
    "NAND": (2, 1, lambda b: (1 - b[0] * b[1],)),
    "CNOT": (2, 2, lambda b: (b[0], (b[0] + b[1]) % 2)),
    "SWAP": (2, 2, lambda b: (b[1], b[0])),
    "Toffoli": (3, 3, lambda b: (b[0], b[1], (b[2] + b[0] * b[1]) % 2)),
    "Fredkin": (3, 3, lambda b: (b[0], b[2], b[1]) if b[0] == 1 else b),
}


def gate_table(name):
    n, m, f = GATES[name]
    return {"n": n, "m": m, "out": [num(f(bits_of(x, n))) for x in range(2 ** n)]}


# ------------------------------------------------------------------ census of Boolean functions (numpy columns)
def census(n):
    rows = 2 ** n
    codes = np.arange(2 ** rows, dtype=np.int64)
    # column x of the table of function `code` is bit x of the code
    cols = np.stack([(codes >> x) & 1 for x in range(rows)], axis=1)
    ones = cols.sum(axis=1)
    constant = int(np.sum((ones == 0) | (ones == rows)))
    balanced = int(np.sum(ones == rows // 2))
    return {"total": int(len(codes)), "constant": constant, "balanced": balanced, "neither": int(len(codes)) - constant - balanced}


# ------------------------------------------------------------------ reversible maps of two bits
def maps_two_bits():
    total = 0
    perms = 0
    for out in itertools.product(range(4), repeat=4):
        total += 1
        if len(set(out)) == 4:
            perms += 1
    check = len(list(itertools.permutations(range(4))))
    return {"total": total, "perms": perms, "permutations": check}


def perm_matrix(out):
    N = len(out)
    P = np.zeros((N, N))
    for j, o in enumerate(out):
        P[o, j] = 1.0
    return P


# ------------------------------------------------------------------ elimination mod 2 on integer bitmasks
def rref_masks(rows, cols):
    """rows: list of 0/1 lists. Rows become ints (first column = most significant bit); Gauss-Jordan by XOR of ints."""
    R = [num(r) for r in rows]
    bit = lambda r, c: (r >> (cols - 1 - c)) & 1
    pivots = []
    r = 0
    swaps = 0
    xors = 0
    for c in range(cols):
        if r >= len(R):
            break
        p = next((i for i in range(r, len(R)) if bit(R[i], c)), None)
        if p is None:
            continue
        if p != r:
            R[r], R[p] = R[p], R[r]
            swaps += 1
        for i in range(len(R)):
            if i != r and bit(R[i], c):
                R[i] ^= R[r]
                xors += 1
        pivots.append(c)
        r += 1
    return {"R": [list(bits_of(v, cols)) for v in R], "pivots": pivots, "rank": len(pivots), "swaps": swaps, "xors": xors}


def null_space_all(rows, cols):
    """Every x in {0,1}^cols with M x = 0 mod 2, by trying all of them; returned as numbers, sorted."""
    out = []
    for x in range(2 ** cols):
        xb = bits_of(x, cols)
        if all(sum(a * b for a, b in zip(r, xb)) % 2 == 0 for r in rows):
            out.append(x)
    return out


def rref_case(rows):
    cols = len(rows[0])
    d = rref_masks(rows, cols)
    d["M"] = rows
    d["null"] = null_space_all(rows, cols)
    d["nullity"] = int(math.log2(len(d["null"])))
    return d


def hamming_parity(r):
    N = 2 ** r - 1
    return [[((j + 1) >> (r - 1 - i)) & 1 for j in range(N)] for i in range(r)]


def main():
    fx = {}
    fx["gates"] = {name: gate_table(name) for name in GATES}
    fx["census"] = {str(n): census(n) for n in (1, 2, 3, 4)}
    fx["maps22"] = maps_two_bits()
    tof = gate_table("Toffoli")["out"]
    P = perm_matrix(tof)
    fx["toffoliPermMatrix"] = P.astype(int).tolist()
    fx["toffoliPtP"] = float(np.max(np.abs(P.T @ P - np.eye(8))))
    # Landauer: k_B T ln 2 with the exact SI constants
    kB = 1.380649e-23
    eV = 1.602176634e-19
    fx["landauer"] = {str(T): {"J": kB * T * math.log(2), "eV": kB * T * math.log(2) / eV} for T in (1, 4, 77, 300, 310)}
    fx["sort"] = {str(n): len(list(itertools.combinations(range(n), 2))) for n in list(range(0, 21)) + [30, 50, 100]}
    fx["cost"] = {
        str(n): {"sq": n ** 2, "exp": 2 ** n, "root": float(np.sqrt(2.0 ** n)), "ratio": float((3 * n ** 2 + 5 * n + 7) / n ** 2)}
        for n in (1, 2, 3, 6, 7, 8, 10, 20, 30, 50)
    }
    # the definition of f = O(g): the least n0 with f(n) <= 4 n^2 from n0 on, scanned in exact arithmetic over a long range
    fails = [n for n in range(1, 2001) if Fraction(3 * n * n + 5 * n + 7) > 4 * Fraction(n * n)]
    fx["bigO"] = {"c": 4, "n0": max(fails) + 1, "lastFail": max(fails)}
    fx["bigOc3"] = {"fails_up_to_2000": len([n for n in range(1, 2001) if 3 * n * n + 5 * n + 7 > 3 * n * n])}
    # the periodic (Simon) tables: f(x) = f(x xor s), two inputs per value
    fx["periodic"] = {}
    for n in (2, 3):
        for s in range(1, 2 ** n):
            seen = {}
            table = []
            for x in range(2 ** n):
                key = min(x, x ^ s)
                table.append(key)
                seen.setdefault(key, []).append(x)
            fx["periodic"][f"{n}-{s}"] = {"table": table, "classes": sorted(len(v) for v in seen.values())}
    fx["rref"] = [
        rref_case(rows)
        for rows in (
            [[0, 0, 1], [1, 1, 1]],
            [[0, 1, 1], [0, 0, 1]],
            [[1, 1, 0], [0, 1, 1], [1, 0, 1]],
            [[1, 0, 1, 1], [0, 1, 1, 0], [1, 1, 0, 1]],
            [[0, 0, 0], [0, 0, 0]],
            [[1, 1, 1, 1, 1], [0, 0, 1, 1, 0], [1, 0, 1, 0, 1], [1, 1, 0, 1, 1]],
            [[0, 1, 0], [1, 0, 0], [1, 1, 0]],
        )
    ]
    # Hamming [7,4]: every single flip at position j (1-based) reads j in binary
    M = hamming_parity(3)
    fx["hamming3"] = {
        "M": M,
        "syndromes": {str(j): "".join(str(sum(M[i][c] * (1 if c == j - 1 else 0) for c in range(7)) % 2) for i in range(3)) for j in range(1, 8)},
        "word": "1110010",
        "wordSyndrome": "".join(str(sum(M[i][c] * int("1110010"[c]) for c in range(7)) % 2) for i in range(3)),
        "codewords": [format(w, "07b") for w in range(128) if all(sum(M[i][c] * ((w >> (6 - c)) & 1) for c in range(7)) % 2 == 0 for i in range(3))],
    }
    out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qc-bits.json"
    out.write_text(json.dumps(rounded(fx), sort_keys=True, separators=(",", ":")) + "\n")
    print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
