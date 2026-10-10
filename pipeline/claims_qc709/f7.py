#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/F7.values.ts (Physics 709, chapter F7: bits and logic that can run backwards).

Independent route (never F7.values.ts's own helpers, never physics/qc/bits.ts or the circuit module): gates are Python lambdas over tuples
of bits; the function census uses numpy columns of every truth table; reversible circuits are explicit dense permutation matrices (the
Toffoli as a 2^n x 2^n 0/1 matrix built from its definition) multiplied out with np.kron for the Hadamard columns, and the garbage
test's reduced state comes from reshaping the 3-qubit state and tracing with einsum; the sort count is len(list(itertools.combinations));
the big-O threshold is scanned in exact Fractions; elimination works on integer bitmasks and the null space is found by trying every
vector; the real determinant and rank come from numpy.linalg on the 3 x 3 matrix; Landauer's number is the SI constants times ln 2.

Units: a string is the number its bits spell, first bit most significant (110 is 6, 1011 is 11); wires are q0 = leftmost tensor factor.

Usage (from the repo root): python3 pipeline/claims_qc709/f7.py -> app/src/physics/__fixtures__/claims-qc709/f7.json
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


def bits_of(x, n):
    return tuple(int(c) for c in format(x, f"0{n}b"))


def num(bits):
    return int("".join(str(b) for b in bits), 2)


def dot2(x, z, n):
    return sum(int(a) * int(b) for a, b in zip(format(x, f"0{n}b"), format(z, f"0{n}b"))) % 2


# ------------------------------------------------------------------ gates as maps of bits
GATES = {
    "AND": (2, lambda b: (b[0] & b[1],)),
    "OR": (2, lambda b: (b[0] | b[1],)),
    "XOR": (2, lambda b: (b[0] ^ b[1],)),
    "NAND": (2, lambda b: (1 - (b[0] & b[1]),)),
    "CNOT": (2, lambda b: (b[0], b[0] ^ b[1])),
}


def table(name):
    n, f = GATES[name]
    return [num(f(bits_of(x, n))) for x in range(2 ** n)]


def column(name):
    """The output column of a one-output gate as the number its bits spell: AND is 0001 = 1."""
    return num(tuple(table(name)))


# ------------------------------------------------------------------ the census of Boolean functions
def census(n):
    rows = 2 ** n
    codes = np.arange(2 ** rows, dtype=np.int64)
    cols = np.stack([(codes >> x) & 1 for x in range(rows)], axis=1)
    ones = cols.sum(axis=1)
    constant = int(np.sum((ones == 0) | (ones == rows)))
    balanced = int(np.sum(ones == rows // 2))
    return {"total": int(len(codes)), "constant": constant, "balanced": balanced, "neither": int(len(codes)) - constant - balanced}


# ------------------------------------------------------------------ dense circuits
def perm_matrix_from(n, f):
    """A 2^n x 2^n 0/1 matrix sending basis state x to basis state f(x) (bits as tuples, wire 0 first)."""
    N = 2 ** n
    P = np.zeros((N, N))
    for x in range(N):
        P[num(f(bits_of(x, n))), x] = 1.0
    return P


def toffoli_matrix(n, a, b, t):
    def f(bits):
        out = list(bits)
        out[t] ^= bits[a] & bits[b]
        return tuple(out)

    return perm_matrix_from(n, f)


def hh_matrix(n, wires):
    """Hadamard on the listed wires, identity on the others, by np.kron."""
    return reduce(np.kron, [H1 if q in wires else np.eye(2) for q in range(n)])


def basis(n, s):
    v = np.zeros(2 ** n)
    v[int(s, 2)] = 1.0
    return v


def end_string(U_list, n, s):
    v = basis(n, s)
    for U in U_list:
        v = U @ v
    k = int(np.argmax(np.abs(v)))
    assert abs(abs(v[k]) - 1) < 1e-12, (s, v)
    return k


T3 = toffoli_matrix(3, 0, 1, 2)
tof_col = lambda cin: num(tuple(end_string([T3], 3, format(ab, "02b") + str(cin)) & 1 for ab in range(4)))

# three-bit AND through a work wire: wires x0 x1 x2 w y
A1 = toffoli_matrix(5, 0, 1, 3)
A2 = toffoli_matrix(5, 3, 2, 4)
and3_all = all(
    end_string([A1, A2, A1], 5, format(x, "03b") + "00") == int(format(x, "03b") + "0" + ("1" if x == 7 else "0"), 2) for x in range(8)
)

# the garbage test: x0 x1 w, init 000
HH = hh_matrix(3, {0, 1})
G = toffoli_matrix(3, 0, 1, 2)
garb = HH @ G @ HH @ basis(3, "000")
clean = HH @ G @ G @ HH @ basis(3, "000")
psi = garb.reshape(2, 2, 2)  # (x0, x1, w)
rho_in = np.einsum("abw,cdw->abcd", psi, psi.conj()).reshape(4, 4)

# every two-bit f: (x, y) -> (x, y xor f(x)) is a permutation of the 8 strings that is its own inverse
oracle_ok = True
for code in range(16):
    f = [(code >> x) & 1 for x in range(4)]
    perm = [2 * x + (y ^ f[x]) for x in range(4) for y in range(2)]
    # perm[j] for j = 2x + y
    oracle_ok = oracle_ok and sorted(perm) == list(range(8)) and all(perm[perm[j]] == j for j in range(8))

# NAND builds NOT, AND, OR
def nand(a, b):
    return 1 - a * b


nand_universal = all(
    nand(a, a) == 1 - a and nand(nand(a, b), nand(a, b)) == a * b and nand(nand(a, a), nand(b, b)) == max(a, b) for a in (0, 1) for b in (0, 1)
)

# (-1)^(a xor b) = (-1)^a (-1)^b
signs_multiply = all(complex(-1) ** ((a + b) % 2) == complex(-1) ** a * complex(-1) ** b for a in (0, 1) for b in (0, 1))

# a.x + b is balanced iff a != 0 (all 16 pairs, n = 3)
def lin_ok():
    for a in range(8):
        for b in (0, 1):
            t = [(dot2(a, x, 3) + b) % 2 for x in range(8)]
            if (sum(t) == 4) != (a != 0) or (len(set(t)) == 1) != (a == 0):
                return False
    return True


# the pairing x <-> x xor 100 flips 110.x
pair_flips = all(dot2(0b110, x ^ 0b100, 3) != dot2(0b110, x, 3) for x in range(8))

# Walsh sums by the dense Hadamard column: column z of 2^(n/2) H^n has entries (-1)^(x.z) summing over x
hn3 = reduce(np.kron, [H1] * 3) * 2 ** 1.5
walsh = lambda z: float(np.real(hn3[:, z].sum()))

# ------------------------------------------------------------------ mod-2 elimination on integer bitmasks
def rref_masks(rows, cols):
    R = [num(r) for r in rows]
    bit = lambda r, c: (r >> (cols - 1 - c)) & 1
    pivots = []
    r = 0
    moves = 0
    for c in range(cols):
        if r >= len(R):
            break
        p = next((i for i in range(r, len(R)) if bit(R[i], c)), None)
        if p is None:
            continue
        if p != r:
            R[r], R[p] = R[p], R[r]
            moves += 1
        for i in range(len(R)):
            if i != r and bit(R[i], c):
                R[i] ^= R[r]
                moves += 1
        pivots.append(c)
        r += 1
    return len(pivots), moves


def null_space(rows, cols):
    return [x for x in range(2 ** cols) if all(sum(a * b for a, b in zip(r, bits_of(x, cols))) % 2 == 0 for r in rows)]


rows_y = [[0, 0, 1], [1, 1, 1]]
rank_y, moves_y = rref_masks(rows_y, 3)
null_y = null_space(rows_y, 3)
rows_dep = [[1, 1, 0], [0, 1, 1], [1, 0, 1]]
dep_real = np.array(rows_dep, dtype=float)


def hamming_parity(r):
    return [[((j + 1) >> (r - 1 - i)) & 1 for j in range(2 ** r - 1)] for i in range(r)]


M7 = hamming_parity(3)
# the data bits of the code: n minus the GF(2) rank of the check matrix (mod-2 elimination, not a real-number rank)
hamming_k = len(M7[0]) - rref_masks(M7, len(M7[0]))[0]


def syndrome(word):
    return num(tuple(sum(M7[i][c] * int(word[c]) for c in range(7)) % 2 for i in range(3)))


# Simon's table: f(x) = f(x xor 110), every value twice
t_sim = [min(x, x ^ 0b110) for x in range(8)]
simon_ok = all(t_sim[x] == t_sim[x ^ 6] for x in range(8)) and sorted(len([1 for v in t_sim if v == w]) for w in set(t_sim)) == [2, 2, 2, 2]

# the least n0 with 3n^2 + 5n + 7 <= 4n^2 from n0 on, exact
fails = [n for n in range(1, 3001) if Fraction(3 * n * n + 5 * n + 7) > Fraction(4 * n * n)]
n0 = max(fails) + 1

# Grover's best number of steps for N = 2^20: the integer nearest pi/(4 arcsin(1/sqrt N)) - 1/2
alpha = math.asin(1 / math.sqrt(2 ** 20))
k_opt = int(math.floor(math.pi / (4 * alpha) - 0.5 + 0.5))

# exact classical Deutsch-Jozsa cost: after k distinct queries all answered 0 a balanced function still fits iff C(N-k, N/2) > 0
dj10 = next(k for k in range(1025) if math.comb(1024 - k, 512) == 0)

kB = 1.380649e-23
eV = 1.602176634e-19
landauer300 = kB * 300 * math.log(2)

c2, c3 = census(2), census(3)
maps22_total = sum(1 for _ in itertools.product(range(4), repeat=4))
maps22_perm = sum(1 for out in itertools.product(range(4), repeat=4) if len(set(out)) == 4)
P_tof = perm_matrix_from(3, lambda b: (b[0], b[1], b[2] ^ (b[0] & b[1])))

values = {
    # boolean
    "f7AndCol": float(column("AND")),
    "f7OrCol": float(column("OR")),
    "f7XorCol": float(column("XOR")),
    "f7NandCol": float(column("NAND")),
    "f7AndOnes": float(sum(table("AND"))),
    "f7AndOnlyAt": float(table("AND").index(1)),
    "f7Funcs1": float(census(1)["total"]),
    "f7Funcs2": float(c2["total"]),
    "f7Funcs3": float(c3["total"]),
    "f7Rows3": float(len(list(itertools.product((0, 1), repeat=3)))),
    "f7Const": float(c3["constant"]),
    "f7Balanced3": float(c3["balanced"]),
    "f7Neither3": float(c3["neither"]),
    "f7Balanced2": float(c2["balanced"]),
    "f7BalancedShare3": c3["balanced"] / c3["total"],
    "f7Neither2": float(c2["neither"]),
    "f7BalIs": 1.0 if sum([1, 0, 0, 1, 1, 1, 0, 0]) == 4 else 0.0,
    "f7BalOnes": float(sum([1, 0, 0, 1, 1, 1, 0, 0])),
    "f7NandUniversal": 1.0 if nand_universal else 0.0,
    "f7HalfSum11": float((1 + 1) % 2),
    "f7HalfCarry11": float(1 * 1),
    # reversible
    "f7AndZeroPre": float(sum(1 for x in range(4) if table("AND")[x] == 0)),
    "f7CnotBij": 1.0 if sorted(table("CNOT")) == [0, 1, 2, 3] else 0.0,
    "f7CnotMaxPre": float(max(table("CNOT").count(v) for v in range(4))),
    "f7Maps22": float(maps22_total),
    "f7Perms22": float(maps22_perm),
    "f7TofUnitary": float(np.max(np.abs(P_tof.T @ P_tof - np.eye(8)))),
    "f7Tof110": float(end_string([T3], 3, "110")),
    "f7TofAnd": float(tof_col(0)),
    "f7TofNand": float(tof_col(1)),
    "f7TofBack110": float(end_string([T3, T3], 3, "110")),
    "f7OracleSelfInv16": 1.0 if oracle_ok else 0.0,
    "f7Landauer300Mant": landauer300 / 1e-21,
    "f7Landauer300eV": landauer300 / eV,
    "f7And3In11100": float(end_string([A1, A2, A1], 5, "11100")),
    "f7And3WorkMid": float((end_string([A1], 5, "11100") >> 1) & 1),
    "f7And3WorkEnd": float((end_string([A1, A2, A1], 5, "11100") >> 1) & 1),
    "f7And3CleanAll": 1.0 if and3_all else 0.0,
    "f7GarbageP00": float(abs(garb[0]) ** 2 + abs(garb[1]) ** 2),
    "f7GarbageP000": float(abs(garb[0]) ** 2),
    "f7GarbageP001": float(abs(garb[1]) ** 2),
    "f7CleanP00": float(abs(clean[0]) ** 2 + abs(clean[1]) ** 2),
    "f7GarbageAmp000": float(np.real(garb[0])),
    "f7GarbageAmp001": float(np.real(garb[1])),
    "f7GarbagePurity": float(np.real(np.trace(rho_in @ rho_in))),
    # xor
    "f7Xor1011With0110": float(0b1011 ^ 0b0110),
    "f7OtpBack": float((0b1011 ^ 0b0110) ^ 0b0110),
    "f7SignsMultiply": 1.0 if signs_multiply else 0.0,
    "f7Dot110With011": float(dot2(0b110, 0b011, 3)),
    "f7Dot110With111": float(dot2(0b110, 0b111, 3)),
    "f7Count110": float(sum(1 for x in range(8) if dot2(0b110, x, 3))),
    "f7SignSum110": walsh(0b110),
    "f7SignSum000": walsh(0),
    "f7PairFlips": 1.0 if pair_flips else 0.0,
    "f7LinBalancedIff": 1.0 if lin_ok() else 0.0,
    "f7MinusShare110": float(sum(1 for x in range(8) if dot2(0b110, x, 3)) / 8),
    "f7Dot1011With0110": float(dot2(0b1011, 0b0110, 4)),
    # gf2
    "f7Xor101With011": float(0b101 ^ 0b011),
    "f7Wt1101": float(bin(0b1101).count("1")),
    "f7Dist1011To0110": float(bin(0b1011 ^ 0b0110).count("1")),
    "f7HammingCodeword": float(syndrome("1110000")),
    "f7Syndrome6": float(syndrome("1110010")),
    "f7HammingAllFlips": 1.0 if all(syndrome("".join("1" if i == j - 1 else "0" for i in range(7))) == j for j in range(1, 8)) else 0.0,
    "f7HammingN": float(len(M7[0])),
    "f7HammingK": float(hamming_k),
    "f7HammingRate": float(hamming_k / len(M7[0])),
    "f7SimonPeriod110": 1.0 if simon_ok else 0.0,
    "f7SimonRank": float(rank_y),
    "f7RankY": float(rank_y),
    "f7NullYVec": float([v for v in null_y if v != 0][0]),
    "f7NullYSize": float(len(null_y)),
    "f7PerpOf110": float(sum(1 for y in range(8) if dot2(y, 0b110, 3) == 0)),
    "f7ReduceMoves": float(moves_y),
    "f7RankGF2Dep": float(rref_masks(rows_dep, 3)[0]),
    "f7DetRealDep": float(np.linalg.det(dep_real)),
    "f7RankRealDep": float(np.linalg.matrix_rank(dep_real)),
    "f7RowsDepXor": float(num(tuple(rows_dep[0])) ^ num(tuple(rows_dep[1]))),
    # cost
    "f7Sort10": float(len(list(itertools.combinations(range(10), 2)))),
    "f7Sq10": float(10 ** 2),
    "f7SqDouble": float((20 ** 2) / (10 ** 2)),
    "f7Exp10": float(2 ** 10),
    "f7BigOn0": float(n0),
    "f7BigOlast": float((3 * 49 + 35 + 7) / 49),
    "f7Sq30": float(30 ** 2),
    "f7Exp30": float(2 ** 30),
    "f7Exp30Mant9": float(2 ** 30 / 1e9),
    "f7Sq50": float(50 ** 2),
    "f7Exp50Mant15": float(2 ** 50 / 1e15),
    "f7Exp21over20": float(Fraction(2 ** 21, 2 ** 20)),
    "f7Sq21minus20": float(21 ** 2 - 20 ** 2),
    "f7Dj10": float(dj10),
    "f7Grover2e20": float(k_opt),
    "f7Classical2e20": float(2 ** 20 - 1),
    "f7Exp20": float(2 ** 20),
    "f7Sqrt2e20": float(np.sqrt(2.0 ** 20)),
    "f7SqrtDoubles": float(np.sqrt(2.0 ** 22) / np.sqrt(2.0 ** 20)),
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "f7.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter F7, numpy (gates as Python lambdas over tuples of bits; a census over numpy columns; explicit dense "
            "permutation matrices for the Toffoli circuits and np.kron Hadamard columns, the garbage test traced with einsum; itertools counts; elimination on "
            "integer bitmasks with every null space found by trying all vectors; the real determinant and rank from numpy.linalg; a threshold scanned in exact "
            "Fractions; never physics/qc/bits.ts or F7.values.ts's own helpers). Regenerate: python3 pipeline/claims_qc709/f7.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
