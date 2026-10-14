#!/usr/bin/env python3
"""Reference values for the Chapter Q22 engine additions (app/src/physics/qec/q22.ts), computed by INDEPENDENT routes.

Blocks of app/src/physics/__fixtures__/q22.json:
  linear     binary linear codes from basic words: every word by looping over the 2^k coefficient vectors with Python integers, the weight enumerator, the distance, and
             the dual found by brute force (every y in {0,1}^n that is orthogonal to every word)
  decode     the single-flip table for a check matrix, applied to chosen received words by comparing the syndrome with each column
  coset      Steane's |0bar> and |1bar> as cosets of the even Hamming words (np), and their image under H on all seven qubits by np.kron of 2 x 2 Hadamards
  conjugate  U P U^dagger for H, S, T (one qubit) and CNOT (two qubits) on every Pauli string, expanded in Pauli strings by traces of explicit numpy matrices; the
             24 one-qubit Cliffords found as products of H and S, equal up to a global phase when |tr(A^dagger B)| = 2
  trace      three stabilizer circuits (the phase-flip encoder, a measurement of X on qubit 1, a bit-flip code cycle) run on a dense state vector with forced outcomes:
             the full signed stabilizer group after every column (every signed Pauli string with expectation +1)
  threshold  the failures-by-weight of the Steane code against X flips (all 2^7 patterns, a numpy syndrome table, the lightest leader per syndrome), the polynomial
             P_L(p), and its crossing p* with the line P_L = p by bisection on exact Fractions

Usage: python3 pipeline/make_q22_fixtures.py   (from the repo root; deterministic: seeded generators, no clock; run twice and diff)
"""
import itertools
import json
import math
import random
import sys
from fractions import Fraction
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qec_numpy as Q  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app/src/physics/__fixtures__/q22.json"

M7 = ["0001111", "0110011", "1010101"]
M62 = ["110000", "101000", "000110", "000101"]


def to_int(w):
    return int(w, 2)


def to_str(v, n):
    return format(v, f"0{n}b")


# ------------------------------------------------------------------ linear codes ------------------------------------------------------------------


def words_of(basic):
    n = len(basic[0])
    vals = [to_int(b) for b in basic]
    out = set()
    for coeffs in itertools.product([0, 1], repeat=len(basic)):
        v = 0
        for c, b in zip(coeffs, vals):
            if c:
                v ^= b
        out.add(v)
    return sorted(to_str(v, n) for v in out)


def enumerator(words, n):
    e = [0] * (n + 1)
    for w in words:
        e[w.count("1")] += 1
    return e


def distance(words):
    return min(w.count("1") for w in words if "1" in w)


def dual_brute(words, n):
    wv = [to_int(w) for w in words]
    return sorted(to_str(y, n) for y in range(2**n) if all(bin(y & x).count("1") % 2 == 0 for x in wv))


def kernel_basic(checks):
    """A set of basic words for the kernel of the checks: every word passing all checks, reduced to an independent set greedily."""
    n = len(checks[0])
    cv = [to_int(c) for c in checks]
    ker = [y for y in range(2**n) if all(bin(y & c).count("1") % 2 == 0 for c in cv)]
    basis = Q.XorBasis()
    out = []
    for y in ker:
        if basis.add(y):
            out.append(to_str(y, n))
    return out


def block_linear():
    rnd = random.Random(20261014)
    cases = [
        ["111000", "000111"],
        kernel_basic(M7),
        M7,
        kernel_basic(M62),
        ["1010", "0101"],
        ["1111"],
    ]
    while len(cases) < 14:
        n = 5 + int(rnd.random() * 5)
        k = 1 + int(rnd.random() * 4)
        rows = [to_str(int(rnd.random() * 2**n), n) for _ in range(k)]
        b = Q.XorBasis()
        if all(b.add(to_int(r)) for r in rows):
            cases.append(rows)
    out = []
    for basic in cases:
        n = len(basic[0])
        ws = words_of(basic)
        dual = dual_brute(ws, n)
        out.append(
            {
                "basic": basic,
                "n": n,
                "k": len(basic),
                "words": ws,
                "enum": enumerator(ws, n),
                "distance": distance(ws),
                "dualWords": dual,
                "dualEnum": enumerator(dual, n),
                "dualDistance": distance(dual) if len(dual) > 1 else None,
            }
        )
    return out


# ------------------------------------------------------------------ the single-flip table ------------------------------------------------------------------


def block_decode():
    cols = [
        "".join(str(bin(to_int(row) & (1 << (len(row) - 1 - j))).count("1") % 2) for row in M62)
        for j in range(6)
    ]
    out = {"checks": M62, "columns": cols, "cases": []}
    for r in ["000000", "100000", "011000", "111000", "000100", "010010", "111111", "101000", "001100"]:
        syn = "".join(str(bin(to_int(row) & to_int(r)).count("1") % 2) for row in M62)
        place = cols.index(syn) + 1 if "1" in syn and syn in cols else None
        fixed = r
        if place:
            fixed = to_str(to_int(r) ^ (1 << (6 - place)), 6)
        out["cases"].append({"received": r, "syndrome": syn, "place": place, "word": fixed})
    return out


# ------------------------------------------------------------------ coset states of Steane's code ------------------------------------------------------------------


def block_coset():
    n = 7
    c2 = words_of(M7)  # the eight even words: rows of M7 and their sums
    out = {"c2": c2, "states": []}
    Hd = np.array([[1, 1], [1, -1]], dtype=float) / math.sqrt(2)
    HH = np.array([[1.0]])
    for _ in range(n):
        HH = np.kron(HH, Hd)
    for x in ["0000000", "1111111", "1000000"]:
        v = np.zeros(2**n)
        for y in c2:
            v[to_int(x) ^ to_int(y)] += 1 / math.sqrt(len(c2))
        img = HH @ v
        out["states"].append(
            {
                "x": x,
                "coset": [[to_str(i, n), float(v[i])] for i in range(2**n) if abs(v[i]) > 1e-12],
                "image": [[to_str(i, n), float(img[i])] for i in range(2**n) if abs(img[i]) > 1e-12],
            }
        )
    return out


# ------------------------------------------------------------------ Clifford conjugation ------------------------------------------------------------------

GATES = {
    "H": np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2),
    "S": np.array([[1, 0], [0, 1j]], dtype=complex),
    "T": np.array([[1, 0], [0, np.exp(1j * math.pi / 4)]], dtype=complex),
}
CNOT = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], dtype=complex)


def expansion(U, s):
    n = len(s)
    M = U @ Q.pauli_matrix(s) @ U.conj().T
    terms = []
    for q in Q.strings(n):
        lam = np.trace(Q.pauli_matrix(q) @ M) / 2**n
        if abs(lam) > 1e-9:
            terms.append([q, round(float(lam.real), 12) + 0.0, round(float(lam.imag), 12) + 0.0])
    return terms


def closure24():
    gens = [GATES["H"], GATES["S"]]
    found = [np.eye(2, dtype=complex)]
    frontier = [np.eye(2, dtype=complex)]
    while frontier:
        nxt = []
        for A in frontier:
            for G in gens:
                B = G @ A
                if not any(abs(abs(np.trace(F.conj().T @ B)) - 2) < 1e-9 for F in found):
                    found.append(B)
                    nxt.append(B)
        frontier = nxt
    return len(found)


def block_conjugate():
    out = {"one": {}, "two": {}, "closure": closure24()}
    for name in ["H", "S", "T"]:
        out["one"][name] = {s: expansion(GATES[name], s) for s in Q.strings(1)}
    out["two"]["CNOT"] = {s: expansion(CNOT, s) for s in Q.strings(2)}
    return out


# ------------------------------------------------------------------ the tableau through three circuits ------------------------------------------------------------------


def run_dense(n, init, columns, outcomes):
    """Columns are lists of ops: {'g': name, 'q': [wires]} or {'m': wire, 'bit': k} or with 'cond': [bits, equals]. Measurements are post-selected on `outcomes` in order."""
    psi = np.zeros(2**n, dtype=complex)
    psi[to_int(init)] = 1
    used = 0
    bits = {}
    groups = [Q.stabilizer_group_dense(psi, n)]
    for col in columns:
        for op in col:
            if "m" in op:
                want = int(outcomes[used])
                used += 1
                q = op["m"]
                mask = 1 << (n - 1 - q)
                idx = np.arange(2**n)
                keep = ((idx & mask) != 0) == bool(want)
                psi = np.where(keep, psi, 0)
                psi = psi / np.linalg.norm(psi)
                bits[op["bit"]] = want
                continue
            if "cond" in op:
                cb, eq = op["cond"]
                if not all(bits[b] == int(e) for b, e in zip(cb, eq)):
                    continue
            psi = Q.gate_matrix(op["g"], op["q"], n) @ psi
        groups.append(Q.stabilizer_group_dense(psi, n))
    return groups


def block_trace():
    cases = []
    enc = [[{"g": "CNOT", "q": [0, 1]}], [{"g": "CNOT", "q": [0, 2]}], [{"g": "H", "q": [0]}, {"g": "H", "q": [1]}, {"g": "H", "q": [2]}]]
    cases.append({"name": "encoder", "n": 3, "init": "000", "columns": enc, "outcomes": "", "groups": run_dense(3, "000", enc, "")})
    mx = [[{"g": "H", "q": [0]}], [{"m": 0, "bit": 0}], [{"g": "H", "q": [0]}]]
    cases.append({"name": "measureX", "n": 3, "init": "000", "columns": mx, "outcomes": "0", "groups": run_dense(3, "000", mx, "0")})
    cycle = [
        [{"g": "CNOT", "q": [0, 1]}],
        [{"g": "CNOT", "q": [0, 2]}],
        [{"g": "X", "q": [1]}],
        [{"g": "CNOT", "q": [0, 3]}],
        [{"g": "CNOT", "q": [1, 3]}],
        [{"g": "CNOT", "q": [1, 4]}],
        [{"g": "CNOT", "q": [2, 4]}],
        [{"m": 3, "bit": 0}, {"m": 4, "bit": 1}],
        [{"g": "X", "q": [1], "cond": [[0, 1], "11"]}],
    ]
    cases.append({"name": "cycle", "n": 5, "init": "00000", "columns": cycle, "outcomes": "11", "groups": run_dense(5, "00000", cycle, "11")})
    return cases


# ------------------------------------------------------------------ failures of the Steane code against X flips ------------------------------------------------------------------


def block_threshold():
    n = 7
    H = np.array([[int(ch) for ch in row] for row in M7], dtype=np.int64)  # H_X = H_Z = M7
    basis = Q.XorBasis()
    for row in M7:
        basis.add(to_int(row[::-1]))  # bit j of the integer = place j+1
    pats = list(itertools.product([0, 1], repeat=n))
    syn = {p: tuple((H @ np.array(p)) % 2) for p in pats}
    leader = {}
    for p in sorted(pats, key=lambda p: (sum(p), p)):
        leader.setdefault(syn[p], p)
    fails = [0] * (n + 1)
    for p in pats:
        res = tuple(a ^ b for a, b in zip(p, leader[syn[p]]))
        rv = sum(b << j for j, b in enumerate(res))
        if not basis.contains(rv):
            fails[sum(p)] += 1

    def pl(p):
        return sum(Fraction(f) * p**w * (1 - p) ** (n - w) for w, f in enumerate(fails))

    lo, hi = Fraction(1, 1000), Fraction(1, 2)
    for _ in range(100):
        mid = (lo + hi) / 2
        if pl(mid) - mid < 0:
            lo = mid
        else:
            hi = mid
    pstar = float((lo + hi) / 2)
    return {
        "fails": fails,
        "pL": {str(p): float(pl(Fraction(p))) for p in ["1/100", "1/10", "1/20"]},
        "pStar": pstar,
    }


def main():
    data = {
        "about": "Chapter Q22 engine references (pipeline/make_q22_fixtures.py): GF(2) codes by integer loops, dense numpy Paulis and Hadamards, dense stabilizer groups, exact Fractions.",
        "linear": block_linear(),
        "decode": block_decode(),
        "coset": block_coset(),
        "conjugate": block_conjugate(),
        "trace": block_trace(),
        "threshold": block_threshold(),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=1, sort_keys=True) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(data['linear'])} linear codes, {len(data['trace'])} traces")


if __name__ == "__main__":
    main()
