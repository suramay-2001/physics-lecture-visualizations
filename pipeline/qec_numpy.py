#!/usr/bin/env python3
"""Independent numpy / Python reference for the error-correction engine (app/src/physics/qec/*.ts). A library; pipeline/make_qec_fixtures.py writes the fixture.

Every routine here reaches its answer by a DIFFERENT route from the TypeScript engine, so agreement is evidence and not one formula typed twice:

  GF(2) linear algebra   TS: packed 32-bit rows, reduced row echelon form.  Here: rows are Python big integers and rank is the size of an XOR basis; the
                         null space is COUNTED by brute force over all 2^n vectors (numpy) for n <= 14.
  Pauli algebra          TS: symplectic vectors plus an exact phase rule.   Here: dense 2^n x 2^n matrices (np.kron); a product or a conjugation U P U^dagger
                         is multiplied out and decomposed by traces onto the 4^n strings.
  Stabilizer tableau     TS: Aaronson-Gottesman bit tableau.                Here: a dense state vector; the stabilizer group of the final state is found by
                         testing all 4^n signed Pauli strings for expectation value +1; a measurement outcome is sampled from the exact probability.
  Distances              TS: depth-first search on syndromes.               Here: itertools.combinations over supports with numpy syndromes (CSS), and brute
                         force over all 4^n Paulis in dense symplectic form (the [[5,1,3]] code).
  BB codes               TS: a ring of exponent vectors (TorusRing).        Here: x = kron(S_l, I_m), y = kron(I_l, S_m) with numpy circulants and np.roll for
                         any power; k also from a Groebner basis of the ideal (x^l-1, y^m-1, A, B) over GF(2) in sympy (k = 2 dim F2[x,y]/(...)), which
                         never builds a check matrix. The paper's logical basis is built again from the printed polynomials and the logical action of the
                         shifts x and y is solved with the XOR-integer solver.
  Light logical operators  TS: information-set decoding on packed rows.     Here: information-set decoding on Python integers with its own seed.

Conventions (docs/roles/decisions/papers.md, paper-tdg): qubit 0 is the leftmost tensor factor; a Pauli is i^phase times Hermitian letters (Y a letter); BB qubit
order is the L qubits (index i*m + j for cell (i, j)) then the R qubits; the cyclic shift S has S[i][i+1] = 1.
"""
import itertools
import math
import random

import numpy as np

# ------------------------------------------------------------------ GF(2) by big integers ------------------------------------------------------------------


def rows_to_ints(rows):
    """Each 0/1 row as a Python integer, bit j (value 2^j) = entry j."""
    return [sum(int(b) << j for j, b in enumerate(r)) for r in rows]


def ints_to_row(v, n):
    return [(v >> j) & 1 for j in range(n)]


class XorBasis:
    """An XOR basis of Python integers keyed by their highest set bit (the classic route; no Gaussian elimination on a matrix)."""

    def __init__(self):
        self.by_top = {}

    def reduce(self, v):
        while v:
            top = v.bit_length() - 1
            b = self.by_top.get(top)
            if b is None:
                return v
            v ^= b
        return 0

    def add(self, v):
        v = self.reduce(v)
        if v:
            self.by_top[v.bit_length() - 1] = v
            return True
        return False

    def contains(self, v):
        return self.reduce(v) == 0

    def __len__(self):
        return len(self.by_top)


def rank_gf2(rows):
    b = XorBasis()
    for v in rows_to_ints(rows):
        b.add(v)
    return len(b)


def null_count_bruteforce(rows, n):
    """The number of x in {0,1}^n with H x = 0 mod 2, by testing every x with numpy (n <= 14)."""
    if n > 14:
        raise ValueError("brute-force null count only for n <= 14")
    H = np.array(rows, dtype=np.int64).reshape(len(rows), n)
    X = ((np.arange(2**n)[:, None] >> np.arange(n)[None, :]) & 1).astype(np.int64)
    S = (X @ H.T) % 2 if len(rows) else np.zeros((2**n, 0), dtype=np.int64)
    return int(np.sum(~S.any(axis=1)))


# ------------------------------------------------------------------ Pauli algebra by dense matrices ------------------------------------------------------------------

I2 = np.eye(2, dtype=complex)
PX = np.array([[0, 1], [1, 0]], dtype=complex)
PY = np.array([[0, -1j], [1j, 0]], dtype=complex)
PZ = np.array([[1, 0], [0, -1]], dtype=complex)
LET = {"I": I2, "X": PX, "Y": PY, "Z": PZ}


def kron_all(ms):
    out = np.array([[1]], dtype=complex)
    for m in ms:
        out = np.kron(out, m)
    return out


def pauli_matrix(s):
    return kron_all([LET[c] for c in s])


def strings(n):
    return ["".join(t) for t in itertools.product("IXYZ", repeat=n)]


def decompose(M, n):
    """M = i^phase * P for a Pauli string P: returns (phase exponent 0..3, string), found by tracing against every string."""
    N = 2**n
    for s in strings(n):
        c = np.trace(pauli_matrix(s).conj().T @ M) / N
        if abs(c) > 0.5:
            for p, val in enumerate([1, 1j, -1, -1j]):
                if abs(c - val) < 1e-9:
                    return p, s
            raise ValueError("coefficient is not a power of i")
    raise ValueError("not a Pauli string")


def gate_matrix(name, qubits, n):
    """The 2^n x 2^n matrix of a Clifford gate, built by acting on basis indices (q0 most significant), not by kron of projectors."""
    N = 2**n
    U = np.zeros((N, N), dtype=complex)
    bit = lambda idx, q: (idx >> (n - 1 - q)) & 1
    for col in range(N):
        if name in ("H", "S", "Sdg", "X", "Y", "Z"):
            q = qubits[0]
            b = bit(col, q)
            flip = col ^ (1 << (n - 1 - q))
            if name == "H":
                r = 1 / math.sqrt(2)
                lo = col & ~(1 << (n - 1 - q))  # the index with this qubit 0
                hi = col | (1 << (n - 1 - q))  # the index with this qubit 1
                U[lo, col] += r
                U[hi, col] += r * (-1) ** b
            elif name == "S":
                U[col, col] = 1j if b else 1
            elif name == "Sdg":
                U[col, col] = -1j if b else 1
            elif name == "X":
                U[flip, col] = 1
            elif name == "Y":
                U[flip, col] = 1j if b == 0 else -1j
            elif name == "Z":
                U[col, col] = -1 if b else 1
        elif name == "CNOT":
            c, t = qubits
            U[col ^ ((1 << (n - 1 - t)) if bit(col, c) else 0), col] = 1
        elif name == "CZ":
            a, b2 = qubits
            U[col, col] = -1 if (bit(col, a) and bit(col, b2)) else 1
        elif name == "SWAP":
            a, b2 = qubits
            ba, bb = bit(col, a), bit(col, b2)
            row = col
            if ba != bb:
                row = col ^ (1 << (n - 1 - a)) ^ (1 << (n - 1 - b2))
            U[row, col] = 1
        else:
            raise ValueError(name)
    return U


def pauli_product_table(n):
    """For every ordered pair of n-qubit strings: [phase exponent, string] of the product P_a P_b, by dense multiplication."""
    mats = {s: pauli_matrix(s) for s in strings(n)}
    out = {}
    for a in mats:
        for b in mats:
            p, s = decompose(mats[a] @ mats[b], n)
            out[f"{a},{b}"] = [p, s]
    return out


def commutes_dense(a, b):
    A, B = pauli_matrix(a), pauli_matrix(b)
    return bool(np.allclose(A @ B, B @ A))


def conjugation_table(n, gates):
    """For each gate (name, wires) and each string with phase 0: [phase exponent, string] of U P U^dagger by dense multiplication."""
    out = {}
    for name, wires in gates:
        U = gate_matrix(name, wires, n)
        assert np.allclose(U @ U.conj().T, np.eye(2**n)), name
        for s in strings(n):
            p, t = decompose(U @ pauli_matrix(s) @ U.conj().T, n)
            out[f"{name}{''.join(str(w) for w in wires)}:{s}"] = [p, t]
    return out


# ------------------------------------------------------------------ stabilizer states by dense simulation ------------------------------------------------------------------


def random_clifford_ops(n, length, rnd, measure):
    """The same op mix as the TS testkit (H S Sdg X Y Z, CNOT CZ SWAP, Z measurements), from Python's own generator; stored in the fixture so TS replays it."""
    one = ["H", "S", "Sdg", "X", "Y", "Z"]
    two = ["CNOT", "CZ", "SWAP"]
    ops = []
    for _ in range(length):
        roll = rnd.random()
        if measure and roll < 0.12:
            ops.append({"m": int(rnd.random() * n)})
        elif n >= 2 and roll < 0.55:
            a = int(rnd.random() * n)
            b = int(rnd.random() * (n - 1))
            if b >= a:
                b += 1
            ops.append({"g": two[int(rnd.random() * 3)], "q": [a, b]})
        else:
            ops.append({"g": one[int(rnd.random() * len(one))], "q": [int(rnd.random() * n)]})
    return ops


def simulate_dense(n, ops, rnd):
    """Run the ops on a dense state vector. Measurement outcomes are sampled from the exact probabilities with `rnd`. Returns the final state, the outcomes
    (with whether each was certain), and the product of the probabilities of the outcomes taken."""
    psi = np.zeros(2**n, dtype=complex)
    psi[0] = 1
    outcomes = []
    prob = 1.0
    for op in ops:
        if "g" in op:
            psi = gate_matrix(op["g"], op["q"], n) @ psi
            continue
        q = op["m"]
        mask = 1 << (n - 1 - q)
        idx = np.arange(2**n)
        p1 = float(np.sum(np.abs(psi[(idx & mask) != 0]) ** 2))
        p0 = 1.0 - p1
        certain = p1 < 1e-12 or p0 < 1e-12
        out = 0 if (p0 > 1 - 1e-12 or (not certain and rnd.random() < p0)) else 1
        keep = ((idx & mask) != 0) == bool(out)
        psi = np.where(keep, psi, 0)
        pr = p1 if out else p0
        psi = psi / math.sqrt(pr)
        prob *= round(pr, 12)
        outcomes.append({"q": q, "out": out, "certain": bool(certain)})
    return psi, outcomes, prob


def stabilizer_group_dense(psi, n):
    """Every signed Pauli string P with <psi|P|psi> = +1, as '+XZ' / '-YY' text, sorted. (Exactly the stabilizer group of a stabilizer state.)"""
    out = []
    for s in strings(n):
        ev = (psi.conj() @ (pauli_matrix(s) @ psi)).real
        if abs(ev - 1) < 1e-9:
            out.append("+" + s)
        elif abs(ev + 1) < 1e-9:
            out.append("-" + s)
    return sorted(out)


# ------------------------------------------------------------------ small codes and exhaustive distances ------------------------------------------------------------------


def hamming_columns(r):
    """The [2^r - 1, 2^r - r - 1] Hamming parity-check matrix: column j (1-based) is the binary expansion of j, row t = bit t (least significant first)."""
    cols = list(range(1, 2**r))
    return [[(c >> t) & 1 for c in cols] for t in range(r)]


def supports(rows):
    return [[j for j, b in enumerate(r) if b] for r in rows]


def css_k(hx, hz, n):
    return n - rank_gf2(hx) - rank_gf2(hz) if (hx or hz) else n


def css_distance_bruteforce(hcheck, hstab, n, max_w=None):
    """Lightest x with H x = 0 outside the row space of hstab: itertools.combinations over supports, syndromes by numpy. Returns (weight, support)."""
    H = np.array(hcheck, dtype=np.int64).reshape(len(hcheck), n)
    basis = XorBasis()
    for v in rows_to_ints(hstab):
        basis.add(v)
    for w in range(1, (max_w or n) + 1):
        for comb in itertools.combinations(range(n), w):
            if len(hcheck) and (H[:, list(comb)].sum(axis=1) % 2).any():
                continue
            v = sum(1 << j for j in comb)
            if not basis.contains(v):
                return w, list(comb)
    return None, None


def syndrome_css(hx, hz, n, letters):
    """The two syndromes of a Pauli error given as a string of I/X/Y/Z: Z checks see the X part, X checks see the Z part. Returns (x_checks, z_checks) as bit strings."""
    ex = [1 if c in "XY" else 0 for c in letters]
    ez = [1 if c in "ZY" else 0 for c in letters]
    sx = [sum(h[j] * ez[j] for j in range(n)) % 2 for h in hx]
    sz = [sum(h[j] * ex[j] for j in range(n)) % 2 for h in hz]
    return "".join(map(str, sx)), "".join(map(str, sz))


def symplectic_vec(s):
    return [1 if c in "XY" else 0 for c in s] + [1 if c in "ZY" else 0 for c in s]


def stabilizer_distance_bruteforce(gens, n):
    """The lightest Pauli that commutes with every generator but is not a product of generators (letters only), by testing all 4^n strings densely."""
    G = [pauli_matrix(g) for g in gens]
    gv = rows_to_ints([symplectic_vec(g) for g in gens])
    basis = XorBasis()
    for v in gv:
        basis.add(v)
    best = None
    for s in strings(n):
        w = sum(1 for c in s if c != "I")
        if w == 0 or (best is not None and w >= best):
            continue
        P = pauli_matrix(s)
        if all(np.allclose(P @ g, g @ P) for g in G) and not basis.contains(sum(b << j for j, b in enumerate(symplectic_vec(s)))):
            best = w
    return best


def rotated_surface(d):
    """The rotated surface code from its face lattice: faces (r, c), r and c from -1 to d-1, touch qubits (r..r+1, c..c+1) inside the d x d grid; checkerboard
    X when r + c is even; keep faces with four qubits, X faces with two on the top and bottom edges, Z faces with two on the left and right edges."""
    qubit = lambda r, c: r * d + c
    hx, hz = [], []
    for r in range(-1, d):
        for c in range(-1, d):
            qs = [qubit(rr, cc) for rr in (r, r + 1) for cc in (c, c + 1) if 0 <= rr < d and 0 <= cc < d]
            kind = "X" if (r + c) % 2 == 0 else "Z"
            keep = len(qs) == 4 or (len(qs) == 2 and ((kind == "X" and r in (-1, d - 1) and c not in (-1, d - 1)) or (kind == "Z" and c in (-1, d - 1) and r not in (-1, d - 1))))
            if keep:
                row = [1 if q in qs else 0 for q in range(d * d)]
                (hx if kind == "X" else hz).append(row)
    return hx, hz


# ------------------------------------------------------------------ bivariate bicycle codes ------------------------------------------------------------------


def cyclic(n, power):
    """The n x n cyclic shift S^power with S[i][i+1] = 1 (np.roll handles negative powers)."""
    return np.roll(np.eye(n, dtype=np.int64), power, axis=1)


def bb_matrices(l, m, a_terms, b_terms):
    """H_X = [A | B], H_Z = [B^T | A^T] with x = kron(S_l, I_m) and y = kron(I_l, S_m), monomial x^a y^b = kron(S_l^a, S_m^b)."""
    mono = lambda a, b: np.kron(cyclic(l, a), cyclic(m, b))
    A = sum(mono(a, b) for a, b in a_terms) % 2
    B = sum(mono(a, b) for a, b in b_terms) % 2
    return A, B, np.hstack([A, B]) % 2, np.hstack([B.T, A.T]) % 2


def bb_k_groebner(l, m, a_terms, b_terms):
    """k = 2 * dim F2[x,y]/(x^l - 1, y^m - 1, A, B), counting standard monomials of a Groebner basis (sympy, GF(2)). No check matrix is built."""
    import sympy as sp

    x, y = sp.symbols("x y")
    mono = lambda a, b: x ** (a % l) * y ** (b % m)
    A = sum(mono(a, b) for a, b in a_terms)
    B = sum(mono(a, b) for a, b in b_terms)
    G = sp.groebner([x**l - 1, y**m - 1, A, B], x, y, modulus=2, order="grevlex")
    leads = []
    for g in G.exprs:
        P = sp.Poly(g, x, y, modulus=2)
        leads.append(P.monoms(order="grevlex")[0])
    std = 0
    for i in range(l):
        for j in range(m):
            if not any(i >= li and j >= lj for li, lj in leads):
                std += 1
    return 2 * std


def polymul_terms(l, m, t1, t2):
    """Product of two polynomials given as term lists on the torus, as a sorted list of exponent pairs (terms cancel mod 2)."""
    cnt = {}
    for a, b in t1:
        for c, d in t2:
            key = ((a + c) % l, (b + d) % m)
            cnt[key] = cnt.get(key, 0) ^ 1
    return sorted(k for k, v in cnt.items() if v)


def poly_vec(l, m, terms):
    v = [0] * (l * m)
    for a, b in terms:
        v[(a % l) * m + (b % m)] ^= 1
    return v


# the paper's printed polynomials (paper-tdg p. 45, Eq. 32, 33, 35, 36), typed again here from the page text
PAPER = {
    "gross": dict(
        l=12,
        m=6,
        p=[(4, 0), (5, 0), (6, 1), (4, 2), (5, 4), (6, 5)],
        q=[(3, 0), (4, 0), (3, 1), (3, 2), (4, 2), (3, 5)],
        r=[(0, 0), (8, 0), (1, 1), (9, 1), (3, 4), (11, 4)],
        s=[(1, 0), (9, 0), (4, 4), (8, 4), (0, 5), (8, 5)],
        alpha=[(0, 0), (3, 5), (11, 5), (10, 1), (5, 4), (4, 2)],
        beta=[(0, 0), (2, 4), (1, 2), (2, 5), (1, 1), (3, 1)],
        # Eq. (37): the printed 6 x 6 matrices for the shifts x and y
        Ax=["010100", "010001", "001100", "110110", "010010", "111101"],
        Ay=["100001", "111001", "000010", "010000", "011001", "001101"],
    ),
    "two-gross": dict(
        l=12,
        m=12,
        p=[(2, 0), (2, 2), (8, 2), (9, 2), (3, 3), (4, 3), (7, 4), (8, 6), (6, 7), (7, 11)],
        q=[(3, 2), (5, 3), (7, 3), (11, 3), (8, 4), (8, 5), (6, 7), (4, 8), (1, 9), (1, 10)],
        r=[(4, 2), (11, 2), (0, 5), (1, 5), (5, 5), (6, 5), (1, 8), (8, 8), (2, 11), (10, 11)],
        s=[(2, 6), (2, 9), (2, 10), (11, 6), (11, 9), (11, 10), (8, 7), (11, 7), (5, 8), (11, 8)],
        alpha=[(0, 0), (0, 3), (3, 7), (11, 11), (2, 9), (7, 4)],
        beta=[(0, 0), (1, 1), (4, 0), (5, 4), (4, 3), (3, 5)],
        Ax=["011101", "101011", "101010", "101111", "011111", "100110"],
        Ay=["111110", "110111", "011000", "100010", "100111", "100001"],
    ),
}
A_TERMS = [(0, 0), (0, 1), (3, -1)]
B_TERMS = [(0, 0), (1, 0), (-1, -3)]


def paper_logical_basis(which):
    """The twelve X-type and Z-type logical operators of Eq. (34) as 0/1 vectors of length n = 2lm (L part then R part), built from the printed polynomials."""
    D = PAPER[which]
    l, m = D["l"], D["m"]
    neg = lambda t: [(-a, -b) for a, b in t]
    shift = lambda t, mono: [(a + mono[0], b + mono[1]) for a, b in t]
    mu = nu = (1, 1)
    cells = l * m
    Xs, Zs = [], []

    def xop(pt, qt):
        return poly_vec(l, m, pt) + poly_vec(l, m, qt)

    zop = xop  # same layout: Z(r, s) acts on L qubits at r and R qubits at s
    for al in D["alpha"]:
        Xs.append(xop(shift(D["p"], al), shift(D["q"], al)))
    for be in D["beta"]:
        bt = (-be[0], -be[1])
        Xs.append(xop(shift(D["r"], bt), shift(D["s"], bt)))
    for be in D["beta"]:
        Zs.append(zop(shift(shift(neg(D["s"]), nu), be), shift(shift(neg(D["r"]), nu), be)))
    for al in D["alpha"]:
        at = (-al[0], -al[1])
        Zs.append(zop(shift(shift(neg(D["q"]), mu), at), shift(shift(neg(D["p"]), mu), at)))
    return Xs, Zs, cells


def logical_action(l, m, hx_rows, Xs, shift_ab):
    """M[i][j] = 1 when X_i appears in the image of X_j under the qubit shift (a, b), modulo the X stabilizers: solved with an XOR-integer elimination that
    tracks which generators were used (a different solver from the TS augmented-matrix route)."""
    cells = l * m
    n = 2 * cells
    a, b = shift_ab
    perm = []
    for q in range(n):
        base = 0 if q < cells else cells
        c = q - base
        i, j = divmod(c, m)
        perm.append(base + ((i + a) % l) * m + ((j + b) % m))
    # generators: the X stabilizer rows, then the 12 logical X operators (tag bits above n)
    gens = rows_to_ints(hx_rows) + rows_to_ints(Xs)
    k = len(Xs)
    tagged = []
    for idx, v in enumerate(gens):
        tag = 1 << (n + (idx - len(hx_rows))) if idx >= len(hx_rows) else 0
        tagged.append(v | tag)
    basis = {}  # top bit among the first n bits -> (value with tags)
    mask = (1 << n) - 1
    for v in tagged:
        while v & mask:
            top = (v & mask).bit_length() - 1
            if top in basis:
                v ^= basis[top]
            else:
                basis[top] = v
                break
    M = [[0] * k for _ in range(k)]
    for j, X in enumerate(Xs):
        img = 0
        for q in range(n):
            if X[q]:
                img |= 1 << perm[q]
        v = img
        while v & mask:
            top = (v & mask).bit_length() - 1
            if top not in basis:
                return None
            v ^= basis[top]
        for i in range(k):
            M[i][j] = (v >> (n + i)) & 1
    return M


def isd_light_logical(hz_rows, hx_rows, n, seed, rounds, target):
    """Prange information-set decoding on Python integers: random column order, eliminate a basis of ker(H_Z) in that order, test the reduced rows; keep the
    lightest vector outside the row space of H_X. Returns (weight, support, rounds used)."""
    rnd = random.Random(seed)
    # basis of the null space of H_Z by elimination on identity-augmented columns is clumsy with big ints; use the transposed route:
    Hz = np.array(hz_rows, dtype=np.int64).reshape(len(hz_rows), n)
    # null space via sympy-free elimination on numpy (done once)
    K = null_space_numpy(Hz, n)
    stab = XorBasis()
    for v in rows_to_ints(hx_rows):
        stab.add(v)
    kc = len(K)
    best = (None, None, 0)
    cols = list(range(n))
    for rd in range(1, rounds + 1):
        rnd.shuffle(cols)
        rows = list(K)
        used = []
        r = 0
        for c in cols:
            bit = 1 << c
            p = next((i for i in range(r, kc) if rows[i] & bit), None)
            if p is None:
                continue
            rows[r], rows[p] = rows[p], rows[r]
            for i in range(kc):
                if i != r and rows[i] & bit:
                    rows[i] ^= rows[r]
            r += 1
            if r == kc:
                break
        for v in rows:
            w = v.bit_count()
            if (best[0] is None or w < best[0]) and not stab.contains(v):
                best = (w, [j for j in range(n) if (v >> j) & 1], rd)
        if best[0] is not None and best[0] <= target:
            break
    return best


def null_space_numpy(H, n):
    """A basis of {x : H x = 0 mod 2} as Python integers (bit j = x_j), by numpy elimination on the matrix."""
    M = (H.copy() % 2).astype(np.uint8)
    rows = M.shape[0]
    pivots = []
    r = 0
    for c in range(n):
        if r >= rows:
            break
        nz = np.nonzero(M[r:, c])[0]
        if len(nz) == 0:
            continue
        p = r + int(nz[0])
        M[[r, p]] = M[[p, r]]
        mask = M[:, c].astype(bool)
        mask[r] = False
        M[mask] ^= M[r]
        pivots.append(c)
        r += 1
    free = [c for c in range(n) if c not in pivots]
    out = []
    for f in free:
        v = 1 << f
        for row, pc in enumerate(pivots):
            if M[row, f]:
                v |= 1 << pc
        out.append(v)
    return out
