#!/usr/bin/env python3
"""Reference values for the Physics 709 quantum-computing engine (app/src/physics/qc/), computed by INDEPENDENT routes.

The TypeScript engine uses its own algorithms (cyclic Jacobi eigh, one-sided Jacobi SVD, LU determinant, strided
in-place gate loops, bit-offset partial traces, a JSON circuit runner). This script never mirrors them: it uses
np.linalg.eigh/svd/det/inv/matrix_rank, scipy.linalg.expm/sqrtm/logm/polar, np.kron with identities and qubit
PERMUTATION matrices for every many-qubit operator, full-matrix products for gates, np.einsum for partial traces,
reshape/transpose for partial transposes and coefficient matrices, and its own interpreter of the circuit JSON built
from those explicit matrices. Agreement is therefore evidence, not the same code checking itself.

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the most significant bit; |0> = |+z>;
R_n(t) = exp(-i t n.sigma / 2); P(phi) = diag(1, e^{i phi}); S = P(pi/2), T = P(pi/4); root fidelity.

Complex numbers are written as [re, im]; floats are rounded to 15 significant digits to keep the file small.

Usage: python3 pipeline/make_qc_fixtures.py  -> app/src/physics/__fixtures__/qc.json   (seed 709)
"""
import itertools
import json
import math
from functools import reduce
from pathlib import Path

import numpy as np
import scipy.linalg as sla
from scipy.special import entr
from scipy.stats import binom

ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(709)


# ------------------------------------------------------------------ encoding ------------------------------------------------------------------

def cx(z):
    return [float(np.real(z)), float(np.imag(z))]


def vec(v):
    return [cx(x) for x in np.asarray(v).ravel()]


def mat(m):
    return [[cx(x) for x in row] for row in np.asarray(m)]


def rounded(x):
    if isinstance(x, float):
        return 0.0 if x == 0 else float(f"{x:.15g}")
    if isinstance(x, list):
        return [rounded(y) for y in x]
    if isinstance(x, dict):
        return {k: rounded(v) for k, v in x.items()}
    return x


# ------------------------------------------------------------------ building blocks ------------------------------------------------------------------

def ginibre(r, c):
    return (rng.normal(size=(r, c)) + 1j * rng.normal(size=(r, c))) / np.sqrt(2)


def rand_herm(n):
    g = ginibre(n, n)
    return (g + g.conj().T) / 2


def rand_unitary(n):
    q, r = np.linalg.qr(ginibre(n, n))
    return q * (np.diag(r) / np.abs(np.diag(r)))


def rand_state(n_qubits):
    v = ginibre(2 ** n_qubits, 1)[:, 0]
    return v / np.linalg.norm(v)


def rand_density(d, rank=None):
    g = ginibre(d, rank or d)
    w = g @ g.conj().T
    return w / np.trace(w).real


I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], complex)
Y = np.array([[0, -1j], [1j, 0]], complex)
Z = np.array([[1, 0], [0, -1]], complex)
H = np.array([[1, 1], [1, -1]], complex) / np.sqrt(2)
KET0 = np.array([1, 0], complex)
KET1 = np.array([0, 1], complex)
PLUS = (KET0 + KET1) / np.sqrt(2)
MINUS = (KET0 - KET1) / np.sqrt(2)


def P(phi):
    return np.diag([1, np.exp(1j * phi)])


def rot(sigma, theta):
    """exp(-i theta sigma / 2) by scipy's Pade expm (the engine uses the closed form cos I - i sin n.sigma)."""
    return sla.expm(-1j * theta / 2 * sigma)


GATES = {
    "I": I2, "X": X, "Y": Y, "Z": Z, "H": H,
    "S": P(np.pi / 2), "Sdg": P(-np.pi / 2), "T": P(np.pi / 4), "Tdg": P(-np.pi / 4),
}
PARAM = {"P": P, "Rx": lambda t: rot(X, t), "Ry": lambda t: rot(Y, t), "Rz": lambda t: rot(Z, t)}


def perm_matrix(order, n):
    """Q|b_0 ... b_{n-1}> = |b_{order[0]} ... b_{order[n-1]}>: new wire k carries old wire order[k]."""
    N = 2 ** n
    Q = np.zeros((N, N))
    for j in range(N):
        bits = [(j >> (n - 1 - q)) & 1 for q in range(n)]
        i = int("".join(str(bits[order[k]]) for k in range(n)), 2)
        Q[i, j] = 1
    return Q


SWAP = perm_matrix([1, 0], 2).astype(complex)


def embed_np(U, n, targets, controls=()):
    """U on `targets` (targets[0] = U's MSB), applied when all `controls` are 1: permute the wires to
    (controls, targets, rest), use kron(|1..1><1..1|, U, I) + kron(I - |1..1><1..1|, I, I), permute back."""
    targets, controls = list(targets), list(controls)
    rest = [q for q in range(n) if q not in targets and q not in controls]
    Q = perm_matrix(controls + targets + rest, n)
    m, k = len(controls), len(targets)
    P1 = np.zeros((2 ** m, 2 ** m))
    P1[-1, -1] = 1
    Ir = np.eye(2 ** len(rest))
    M = np.kron(np.kron(P1, U), Ir) + np.kron(np.kron(np.eye(2 ** m) - P1, np.eye(2 ** k)), Ir)
    return Q.T @ M @ Q


def pauli_string(s):
    return reduce(np.kron, [{"I": I2, "X": X, "Y": Y, "Z": Z}[ch] for ch in s])


def ptrace_np(rho, trace_out, n):
    """np.einsum partial trace: repeat the row letter in the column slot of every traced wire."""
    keep = [q for q in range(n) if q not in trace_out]
    letters = "abcdefghijklmnopqrstuvwxyz"
    row = "".join(letters[q] for q in range(n))
    col = "".join(letters[q] if q in trace_out else letters[n + q] for q in range(n))
    out = "".join(letters[q] for q in keep) + "".join(letters[n + q] for q in keep)
    d = 2 ** len(keep)
    return np.einsum(f"{row}{col}->{out}", rho.reshape([2] * (2 * n))).reshape(d, d)


def coef_np(psi, A, n):
    """Coefficient matrix for the cut A | rest by reshape/transpose (rest in ascending order)."""
    B = [q for q in range(n) if q not in A]
    return np.transpose(psi.reshape([2] * n), list(A) + B).reshape(2 ** len(A), 2 ** len(B))


# ------------------------------------------------------------------ cmat ------------------------------------------------------------------

def formula_hermitian(n):
    """The deterministic test matrix the vitest side rebuilds (so the large inputs need not be stored)."""
    j = np.arange(n)[:, None]
    k = np.arange(n)[None, :]
    A = np.sin(0.37 * (j + 1) * (k + 2) + 0.11 * j) + 1j * np.cos(0.23 * (j + 2) * (k + 1) - 0.05 * k)
    return (A + A.conj().T) / 2


def cmat_cases():
    eigh_small = []
    for n in (2, 3, 4, 5, 6, 8):
        M = rand_herm(n)
        w, V = np.linalg.eigh(M)
        eigh_small.append({"M": mat(M), "values": [float(x) for x in w],
                           "projectors": [mat(np.outer(V[:, i], V[:, i].conj())) for i in range(n)]})
    eigh_large = []
    for n in (16, 32, 64):
        w, V = np.linalg.eigh(formula_hermitian(n))
        eigh_large.append({"n": n, "values": [float(x) for x in w],
                           "weights": [[float(abs(x) ** 2) for x in V[:, i]] for i in range(n)]})
    eigh_degenerate = []
    for spectrum in ([-1, -1, 0.5, 2, 2, 2], [3, 3, 3, 3], [0, 1, 1, 0, 2]):
        n = len(spectrum)
        U = rand_unitary(n)
        M = U @ np.diag(spectrum) @ U.conj().T
        groups = sorted(set(spectrum))
        eigh_degenerate.append({"M": mat(M), "values": [float(x) for x in sorted(spectrum)],
                                "groups": [{"value": float(g), "mult": spectrum.count(g),
                                            "projector": mat(sum(np.outer(U[:, i], U[:, i].conj()) for i in range(n) if spectrum[i] == g))}
                                           for g in groups]})
    det_inv = []
    for n in (2, 3, 4, 5, 6):
        M = ginibre(n, n)
        det_inv.append({"M": mat(M), "det": cx(np.linalg.det(M)), "inv": mat(np.linalg.inv(M)), "trace": cx(np.trace(M))})
    singular = ginibre(4, 2) @ ginibre(2, 4)
    ranks = []
    for (r, c, k) in ((4, 4, 2), (5, 3, 2), (3, 6, 1), (6, 6, 5), (3, 3, 0), (2, 5, 2)):
        M = ginibre(r, k) @ ginibre(k, c) if k else np.zeros((r, c), complex)
        ranks.append({"M": mat(M), "rank": int(np.linalg.matrix_rank(M))})
    A, B = ginibre(2, 3), ginibre(3, 2)
    svds = []
    for (r, c, k) in ((3, 5, 3), (5, 3, 3), (4, 4, 4), (6, 6, 3), (1, 4, 1)):
        M = ginibre(r, k) @ ginibre(k, c)
        U, s, Vh = np.linalg.svd(M)
        rank = int(np.linalg.matrix_rank(M))
        svds.append({"M": mat(M), "s": [float(x) for x in s], "rank": rank,
                     "uv": [mat(np.outer(U[:, i], Vh[i, :])) for i in range(rank)]})
    polars = []
    for n in (3, 4):
        M = ginibre(n, n)
        u, p = sla.polar(M)
        polars.append({"M": mat(M), "U": mat(u), "P": mat(p)})
    Gp = ginibre(4, 4)
    psd = Gp @ Gp.conj().T
    Gd = ginibre(3, 3)
    pd = Gd @ Gd.conj().T + 0.3 * np.eye(3)
    Hh = rand_herm(4)
    t = 0.83
    G_low = ginibre(4, 2)
    psd_low = G_low @ G_low.conj().T  # rank 2: sqrt = G (G†G)^{-1/2} G†, a route that never takes a singular sqrtm
    sqrt_low = G_low @ np.linalg.inv(sla.sqrtm(G_low.conj().T @ G_low)) @ G_low.conj().T
    funcs = {"psd": mat(psd), "sqrt": mat(sla.sqrtm(psd)), "pd": mat(pd), "log": mat(sla.logm(pd)),
             "H": mat(Hh), "t": t, "expm": mat(sla.expm(-1j * t * Hh)),
             "psdLow": mat(psd_low), "sqrtLow": mat(sqrt_low)}
    # commuting pair with degenerate eigenspaces: A = U diag(1,1,2,2,3) U†, B = U diag(5,6,7,7,8) U†
    U = rand_unitary(5)
    Ac = U @ np.diag([1, 1, 2, 2, 3]) @ U.conj().T
    Bc = U @ np.diag([5, 6, 7, 7, 8]) @ U.conj().T
    _, W = np.linalg.eigh(Ac + (np.pi / 7) * Bc)  # a generic combination separates every joint eigenspace
    pairs = sorted(([float(np.real(W[:, i].conj() @ Ac @ W[:, i])), float(np.real(W[:, i].conj() @ Bc @ W[:, i]))] for i in range(5)),
                   key=lambda p: (round(p[0], 6), round(p[1], 6)))
    Q = rand_unitary(3)
    old = rand_unitary(3)
    sub = ginibre(4, 2)
    q, _ = np.linalg.qr(sub)
    v4 = ginibre(4, 1)[:, 0]
    a3, b3 = rng.normal(size=3), rng.normal(size=3)
    ac, bc = ginibre(3, 1)[:, 0], ginibre(3, 1)[:, 0]
    basis = ginibre(3, 3)
    psi3 = ginibre(3, 1)[:, 0]
    Gw = ginibre(3, 3)
    Mw = Gw @ Gw.conj().T + np.eye(3)
    wa, wb = ginibre(3, 1)[:, 0], ginibre(3, 1)[:, 0]
    return {
        "eighSmall": eigh_small, "eighLarge": eigh_large, "eighDegenerate": eigh_degenerate,
        "detInv": det_inv, "singular": mat(singular), "ranks": ranks,
        "kron": {"A": mat(A), "B": mat(B), "AB": mat(np.kron(A, B))},
        "svd": svds, "polar": polars, "funcs": funcs,
        "commuting": {"A": mat(Ac), "B": mat(Bc), "pairs": pairs},
        "changeU": {"basis": [vec(Q[:, i]) for i in range(3)], "U": mat(Q.conj().T),
                    "old": [vec(old[:, i]) for i in range(3)], "Uold": mat(Q.conj().T @ old)},
        "project": {"v": vec(v4), "span": [vec(sub[:, i]) for i in range(2)], "proj": vec(q @ q.conj().T @ v4),
                    "projector": mat(q @ q.conj().T)},
        "angles": {"a": [float(x) for x in a3], "b": [float(x) for x in b3],
                   "real": float(np.arccos(a3 @ b3 / (np.linalg.norm(a3) * np.linalg.norm(b3)))),
                   "ac": vec(ac), "bc": vec(bc),
                   "complex": float(np.arccos(np.real(np.vdot(ac, bc)) / (np.linalg.norm(ac) * np.linalg.norm(bc)))),
                   "hermitian": float(np.arccos(abs(np.vdot(ac, bc)) / (np.linalg.norm(ac) * np.linalg.norm(bc))))},
        "components": {"basis": [vec(basis[:, i]) for i in range(3)], "psi": vec(psi3), "c": vec(np.linalg.solve(basis, psi3))},
        "independent": [
            {"vs": [vec(basis[:, i]) for i in range(3)], "yes": bool(np.linalg.matrix_rank(basis) == 3)},
            {"vs": [vec(basis[:, 0]), vec(basis[:, 1]), vec(basis[:, 0] + 2 * basis[:, 1])],
             "yes": bool(np.linalg.matrix_rank(np.column_stack([basis[:, 0], basis[:, 1], basis[:, 0] + 2 * basis[:, 1]])) == 3)},
        ],
        "weighted": {"M": mat(Mw), "a": vec(wa), "b": vec(wb), "value": cx(wa.conj() @ Mw @ wb)},
    }


# ------------------------------------------------------------------ state ------------------------------------------------------------------

def basis_vec(bits):
    v = np.zeros(2 ** len(bits), complex)
    v[int(bits, 2)] = 1
    return v


def state_cases():
    a, b = rand_state(1), rand_state(2)
    k3 = [rand_state(1) for _ in range(3)]
    bits = {str(n): [format(i, f"0{n}b") for i in range(2 ** n)] for n in (1, 2, 3, 4)}
    s2 = 1 / np.sqrt(2)
    named = {
        "bell": {c: vec(s2 * (basis_vec(c[:2]) + (1 if c[2] == "+" else -1) * basis_vec(c[3:]))) for c in ("00+11", "00-11", "01+10", "01-10")},
        "ghz3": vec(s2 * (basis_vec("000") + basis_vec("111"))),
        "ghz4": vec(s2 * (basis_vec("0000") + basis_vec("1111"))),
        "w3": vec((basis_vec("100") + basis_vec("010") + basis_vec("001")) / np.sqrt(3)),
        "w4": vec((basis_vec("1000") + basis_vec("0100") + basis_vec("0010") + basis_vec("0001")) / 2),
        "ket0m": vec(np.kron(KET0, MINUS)),
        "ketp1m": vec(reduce(np.kron, [PLUS, KET1, MINUS])),
    }
    cuts = []
    product = reduce(np.kron, [rand_state(1) for _ in range(3)])
    ent3 = rand_state(3)
    ent4 = rand_state(4)
    half = np.kron(rand_state(1), rand_state(2))  # q0 factors out, (q1, q2) entangled
    for name, psi, n, A in (("product", product, 3, [1]), ("product", product, 3, [2, 0]), ("random3", ent3, 3, [0]),
                            ("random3", ent3, 3, [2, 0]), ("random4", ent4, 4, [1, 3]), ("random4", ent4, 4, [3]),
                            ("half", half, 3, [0]), ("half", half, 3, [1])):
        C = coef_np(psi, A, n)
        full = all(np.linalg.matrix_rank(coef_np(psi, [q], n), tol=1e-9) == 1 for q in range(n))
        cuts.append({"name": name, "psi": vec(psi), "A": A, "C": mat(C), "s": [float(x) for x in np.linalg.svd(C, compute_uv=False)],
                     "rank": int(np.linalg.matrix_rank(C, tol=1e-9)), "fullyProduct": bool(full)})
    embeds = []
    for (k, n, targets, controls) in ((1, 3, [2], []), (1, 3, [0], []), (2, 3, [2, 0], []), (2, 3, [1, 2], []),
                                      (2, 4, [3, 1], []), (1, 4, [1], [3]), (2, 4, [0, 3], [1]), (1, 3, [1], [2, 0])):
        U = rand_unitary(2 ** k)
        embeds.append({"U": mat(U), "n": n, "targets": targets, "controls": controls, "M": mat(embed_np(U, n, targets, controls))})
    # paramCount: the formula, independent of the engine's own arithmetic
    param_count = [{"n": n, "general": 2 * 2 ** n - 2, "product": 2 * n} for n in range(1, 7)]
    # bellAmplitudes: an EXPLICIT 4x4 Bell matrix (rows beta_xy, x,y in 00,01,10,11), independent of the engine's
    # per-qubit-index formula route
    bell_rows = [s2 * (basis_vec(f"0{y}") + ((-1) ** x) * basis_vec(f"1{1 - y}")) for x in (0, 1) for y in (0, 1)]
    BELL_M = np.array(bell_rows)  # real, so its own conjugate: BELL_M @ psi = <beta_xy|psi>
    bell_amp = []
    for _ in range(6):
        psi = rand_state(2)
        bell_amp.append({"psi": vec(psi), "amps": vec(BELL_M @ psi)})
    return {"a": vec(a), "b": vec(b), "ab": vec(np.kron(a, b)), "k3": [vec(k) for k in k3], "k3all": vec(reduce(np.kron, k3)),
            "bits": bits, "named": named, "cuts": cuts, "embeds": embeds, "paramCount": param_count, "bellAmplitudes": bell_amp}


# ------------------------------------------------------------------ gates ------------------------------------------------------------------

def oracle_xor_np(table, n_in):
    N = 2 ** (n_in + 1)
    M = np.zeros((N, N))
    for x in range(2 ** n_in):
        for y in (0, 1):
            M[2 * x + (y ^ table[x]), 2 * x + y] = 1
    return M


def gate_cases():
    fixed = {name: mat(G) for name, G in GATES.items()}
    params = [{"gate": g, "angle": float(t), "M": mat(PARAM[g](t))} for g in PARAM for t in (0.7, -2.2, 2 * np.pi)]
    dense = []
    for (name, args, U, targets, controls, n) in (
        ("cnot", [0, 1, 2], X, [1], [0], 2), ("cnot", [1, 0, 2], X, [0], [1], 2), ("cnot", [0, 2, 3], X, [2], [0], 3),
        ("cnot", [2, 0, 3], X, [0], [2], 3), ("cz", [0, 2, 3], Z, [2], [0], 3), ("cz", [2, 0, 3], Z, [0], [2], 3),
        ("swap", [0, 1, 2], SWAP, [0, 1], [], 2), ("swap", [0, 2, 3], SWAP, [0, 2], [], 3),
        ("toffoli", [0, 1, 2, 3], X, [2], [0, 1], 3), ("toffoli", [2, 0, 1, 3], X, [1], [2, 0], 3),
        ("cswap", [0, 1, 2, 3], SWAP, [1, 2], [0], 3), ("cswap", [2, 0, 1, 3], SWAP, [0, 1], [2], 3),
    ):
        dense.append({"name": name, "args": args, "M": mat(embed_np(U, n, targets, controls))})
    oracles = []
    for n_in, tables in ((1, [[0, 0], [1, 1], [0, 1], [1, 0]]), (2, [[0, 1, 1, 0], [1, 1, 1, 1], [0, 0, 1, 0]]),
                         (3, [list(rng.permutation([0, 0, 0, 0, 1, 1, 1, 1])), [0, 1, 1, 0, 1, 0, 0, 1]])):
        for t in tables:
            t = [int(x) for x in t]
            oracles.append({"table": t, "nIn": n_in, "xor": mat(oracle_xor_np(t, n_in)), "phase": mat(np.diag([(-1) ** x for x in t]))})
    walsh = {str(n): mat(reduce(np.kron, [H] * n)) for n in (1, 2, 3, 4)}
    apply_cases = []
    for (n, k, nc) in ((3, 1, 0), (3, 2, 0), (3, 1, 1), (4, 2, 1), (4, 3, 0), (4, 1, 2), (5, 2, 0), (5, 1, 1),
                       (5, 3, 1), (6, 1, 0), (6, 2, 2), (6, 3, 0)):
        wires = [int(q) for q in rng.permutation(n)]
        targets, controls = wires[:k], wires[k:k + nc]
        U = rand_unitary(2 ** k)
        psi = rand_state(n)
        apply_cases.append({"n": n, "targets": targets, "controls": controls, "U": mat(U), "psi": vec(psi),
                            "out": vec(embed_np(U, n, targets, controls) @ psi)})
    clifford = []
    for (gate, n, U) in (("H", 1, H), ("S", 1, GATES["S"]), ("X", 1, X), ("Y", 1, Y),
                         ("cnot", 2, embed_np(X, 2, [1], [0])), ("cz", 2, embed_np(Z, 2, [1], [0])), ("swap", 2, SWAP)):
        for g in ("X", "Y", "Z"):
            for w in range(n):
                p = "I" * w + g + "I" * (n - w - 1)
                M = U @ pauli_string(p) @ U.conj().T
                hits = [(q, np.trace(pauli_string(q) @ M) / 2 ** n) for q in ("".join(t) for t in itertools.product("IXYZ", repeat=n))]
                q, lam = max(hits, key=lambda h: abs(h[1]))
                clifford.append({"gate": gate, "pauli": p, "image": q, "sign": int(np.sign(lam.real))})
    t_image = GATES["T"] @ X @ GATES["T"].conj().T  # (X + Y)/sqrt 2: not a Pauli, so T is not Clifford

    # pauliMul / paulisCommute / pauliEigenvalue / heisenberg: full matrix products and a fresh trace decomposition
    # (independent of the engine's per-qubit PAULI_MUL lookup table and of cliffordConj's own trace loop)
    def pauli_strings_n(n):
        return ["".join(t) for t in itertools.product("IXYZ", repeat=n)]

    def decompose_pauli(M, n):
        best_q, best_lam = None, 0 + 0j
        for q in pauli_strings_n(n):
            lam = np.trace(pauli_string(q) @ M) / 2 ** n
            if abs(lam) > abs(best_lam):
                best_q, best_lam = q, lam
        return best_q, best_lam

    mul_cases = []
    for n in (1, 2, 3):
        ss = pauli_strings_n(n)
        idx_a = range(len(ss)) if n < 3 else rng.choice(len(ss), size=48, replace=False)
        for ia in idx_a:
            a = ss[int(ia)]
            b = ss[int(rng.integers(0, len(ss)))]
            M = pauli_string(a) @ pauli_string(b)
            q, lam = decompose_pauli(M, n)
            commM = pauli_string(a) @ pauli_string(b) - pauli_string(b) @ pauli_string(a)
            mul_cases.append({"a": a, "b": b, "phase": cx(lam), "string": q, "commute": bool(np.max(np.abs(commM)) < 1e-9)})
    eig_cases = []
    s2 = 1 / np.sqrt(2)
    for psi, s, want in (
        (KET0, "Z", 1), (KET1, "Z", -1), (PLUS, "X", 1), (MINUS, "X", -1),
        (s2 * (basis_vec("00") + basis_vec("11")), "ZZ", 1), (s2 * (basis_vec("00") - basis_vec("11")), "ZZ", 1),
        (s2 * (basis_vec("00") + basis_vec("11")), "XX", 1), (s2 * (basis_vec("01") - basis_vec("10")), "XX", -1),
        (s2 * (basis_vec("000") - basis_vec("111")), "XXX", -1), (s2 * (basis_vec("000") - basis_vec("111")), "XYY", 1),
        (s2 * (basis_vec("000") - basis_vec("111")), "YXY", 1), (s2 * (basis_vec("000") - basis_vec("111")), "YYX", 1),
        (KET0, "X", None), (rand_state(2), "ZI", None),
    ):
        psi = np.asarray(psi, dtype=complex)
        out = pauli_string(s) @ psi
        eig_cases.append({"psi": vec(psi), "s": s, "want": want,
                           "isEig": bool(want is not None and np.max(np.abs(out - want * psi)) < 1e-9)})
    heis_cases = []
    for (gate, n, U) in (("H", 1, H), ("S", 1, GATES["S"]), ("cnot", 2, embed_np(X, 2, [1], [0])), ("cz", 2, embed_np(Z, 2, [1], [0]))):
        Ud = U.conj().T
        for g in ("X", "Y", "Z"):
            for w in range(n):
                p = "I" * w + g + "I" * (n - w - 1)
                M = Ud @ pauli_string(p) @ Ud.conj().T  # U† P U, U† = Ud
                q, lam = decompose_pauli(M, n)
                heis_cases.append({"gate": gate, "pauli": p, "image": q, "sign": int(round(lam.real))})
    return {"fixed": fixed, "params": params, "dense": dense, "oracles": oracles, "walsh": walsh, "apply": apply_cases,
            "clifford": clifford, "tImageOfX": mat(t_image), "pauliMul": mul_cases, "pauliEigen": eig_cases, "heisenberg": heis_cases}


# ------------------------------------------------------------------ circuit ------------------------------------------------------------------

def op_matrix_np(op, n):
    """The full 2^n matrix of one non-measurement op, from explicit gate matrices and embed_np."""
    if op["op"] == "gate":
        g = op["gate"]
        U = SWAP if g == "SWAP" else PARAM[g](op["params"][0]) if g in PARAM else GATES[g]
        return embed_np(U, n, op["targets"], op.get("controls", []))
    if op["op"] == "unitary":
        U = np.array([[complex(re, im) for re, im in row] for row in op["matrix"]])
        return embed_np(U, n, op["targets"], op.get("controls", []))
    if op["op"] == "oracle":
        if op["mode"] == "xor":
            return embed_np(oracle_xor_np(op["table"], len(op["inputs"])), n, op["inputs"] + [op["target"]])
        return embed_np(np.diag([(-1) ** x for x in op["table"]]).astype(complex), n, op["inputs"])
    raise ValueError(op)


def init_np(label):
    return reduce(np.kron, [{"0": KET0, "1": KET1, "+": PLUS, "-": MINUS}[ch] for ch in label])


def run_np(circ, psi0=None):
    """Unitary circuits only: the state after every column (column matrix = product of its op matrices)."""
    n = circ["qubits"]
    psi = init_np(circ.get("init", "0" * n)) if psi0 is None else psi0
    states = [psi]
    for col in circ["columns"]:
        Ucol = np.eye(2 ** n, dtype=complex)
        for op in col:
            if op["op"] == "measure":
                continue
            Ucol = op_matrix_np(op, n) @ Ucol
        psi = Ucol @ psi
        states.append(psi)
    return states


def unitary_np(circ):
    n = circ["qubits"]
    U = np.eye(2 ** n, dtype=complex)
    for col in circ["columns"]:
        for op in col:
            U = op_matrix_np(op, n) @ U
    return U


def branches_np(circ, psi0):
    """Every measurement branch, by explicit projectors embed_np(|b><b|) and renormalization."""
    n = circ["qubits"]
    out = []

    def walk(k, j, psi, bits, outcomes, prob):
        while k < len(circ["columns"]):
            col = circ["columns"][k]
            while j < len(col):
                op = col[j]
                j += 1
                if op["op"] == "measure":
                    for b in (0, 1):
                        Pm = embed_np(np.outer(basis_vec(str(b)), basis_vec(str(b))), n, [op["qubit"]])
                        v = Pm @ psi
                        p = float(np.real(np.vdot(v, v)))
                        if p > 1e-12:
                            nb = dict(bits)
                            nb[op["bit"]] = b
                            walk(k, j, v / np.sqrt(p), nb, outcomes + str(b), prob * p)
                    return
                cond = op.get("cond")
                if cond is None or all(bits.get(bb, 0) == int(e) for bb, e in zip(cond["bits"], cond["equals"])):
                    psi = op_matrix_np(op, n) @ psi
            k += 1
            j = 0
        out.append({"outcomes": outcomes, "prob": prob, "final": vec(psi),
                    "bits": "".join(str(bits.get(i, 0)) for i in range(circ.get("clbits", 0)))})

    walk(0, 0, psi0, {}, "", 1.0)
    return out


def g(gate, targets, controls=None, params=None, cond=None):
    op = {"op": "gate", "gate": gate, "targets": targets}
    if controls:
        op["controls"] = controls
    if params is not None:
        op["params"] = params
    if cond:
        op["cond"] = cond
    return op


def random_circuit(n, depth, with_unitary=True):
    cols = []
    for _ in range(depth):
        free = [int(q) for q in rng.permutation(n)]
        col = []
        while free:
            kind = rng.integers(0, 6)
            if kind == 0:
                col.append(g(str(rng.choice(list(GATES))), [free.pop()]))
            elif kind == 1:
                col.append(g(str(rng.choice(list(PARAM))), [free.pop()], params=[float(rng.uniform(-np.pi, np.pi))]))
            elif kind == 2 and len(free) >= 2:
                t, c_ = free.pop(), free.pop()
                gate = str(rng.choice(["X", "Z", "H", "Ry"]))
                col.append(g(gate, [t], [c_], params=[float(rng.uniform(-np.pi, np.pi))] if gate == "Ry" else None))
            elif kind == 3 and len(free) >= 2:
                col.append(g("SWAP", [free.pop(), free.pop()]))
            elif kind == 4 and len(free) >= 2 and with_unitary:
                U = rand_unitary(4)
                col.append({"op": "unitary", "matrix": [[cx(z) for z in row] for row in U], "targets": [free.pop(), free.pop()]})
            elif kind == 5 and len(free) >= 3:
                ins = [free.pop(), free.pop()]
                col.append({"op": "oracle", "mode": "xor", "table": [int(x) for x in rng.integers(0, 2, 4)], "inputs": ins, "target": free.pop()})
            else:
                free.pop()  # leave this wire idle in this column
        cols.append(col)
    return {"version": 1, "qubits": n, "columns": cols}


def circuit_cases():
    deutsch = []
    for name, table in (("zero", [0, 0]), ("one", [1, 1]), ("identity", [0, 1]), ("not", [1, 0])):
        circ = {"version": 1, "qubits": 2, "clbits": 1, "init": "01", "title": f"Deutsch, f = {name}",
                "columns": [[g("H", [0]), g("H", [1])], [{"op": "oracle", "mode": "xor", "table": table, "inputs": [0], "target": 1}],
                            [g("H", [0])], [{"op": "measure", "qubit": 0, "bit": 0}]]}
        states = run_np(circ)
        final = states[-1]
        p1 = float(sum(abs(final[i]) ** 2 for i in range(4) if i >> 1))
        deutsch.append({"f": name, "table": table, "circuit": circ, "states": [vec(s) for s in states], "pQ0is1": p1})
    bell_c = {"version": 1, "qubits": 2, "columns": [[g("H", [0])], [g("X", [1], [0])]]}
    bell = {"circuit": bell_c, "states": [vec(s) for s in run_np(bell_c)]}
    psi = rand_state(1)
    tele = {"version": 1, "qubits": 3, "clbits": 2, "wires": ["|psi>", "|0>", "|0>"],
            "columns": [[g("H", [1])], [g("X", [2], [1])], [g("X", [1], [0])], [g("H", [0])],
                        [{"op": "measure", "qubit": 0, "bit": 0}, {"op": "measure", "qubit": 1, "bit": 1}],
                        [g("X", [2], cond={"bits": [1], "equals": "1"})], [g("Z", [2], cond={"bits": [0], "equals": "1"})]]}
    psi0 = np.kron(psi, np.kron(KET0, KET0))
    teleport = {"psi": vec(psi), "psi0": vec(psi0), "circuit": tele, "branches": branches_np(tele, psi0)}
    for br in teleport["branches"]:
        f = np.array([complex(re, im) for re, im in br["final"]])
        br["q2"] = mat(ptrace_np(np.outer(f, f.conj()), [0, 1], 3))
    dj = []
    tables = (("constant0", [0] * 8), ("constant1", [1] * 8), ("x0", [x >> 2 & 1 for x in range(8)]),
              ("parity", [bin(x).count("1") % 2 for x in range(8)]), ("random", [int(x) for x in rng.permutation([0, 0, 0, 0, 1, 1, 1, 1])]))
    for name, table in tables:
        circ = {"version": 1, "qubits": 4, "init": "0001",
                "columns": [[g("H", [q]) for q in range(4)], [{"op": "oracle", "mode": "xor", "table": table, "inputs": [0, 1, 2], "target": 3}],
                            [g("H", [q]) for q in range(3)]]}
        states = run_np(circ)
        p000 = float(sum(abs(states[-1][i]) ** 2 for i in range(16) if i >> 1 == 0))
        dj.append({"f": name, "table": table, "circuit": circ, "states": [vec(s) for s in states], "pAll0": p000})
    qft = {"version": 1, "qubits": 3,
           "columns": [[g("H", [0])], [g("P", [0], [1], [np.pi / 2])], [g("P", [0], [2], [np.pi / 4])], [g("H", [1])],
                       [g("P", [1], [2], [np.pi / 2])], [g("H", [2])], [g("SWAP", [0, 2])]]}
    qft3 = {"circuit": qft, "U": mat(unitary_np(qft)), "dft": mat(np.fft.ifft(np.eye(8), axis=0, norm="ortho"))}
    randoms = []
    for (n, depth) in ((3, 10), (4, 10), (5, 8), (6, 6)):
        circ = random_circuit(n, depth)
        entry = {"circuit": circ, "states": [vec(s) for s in run_np(circ)]}
        if n <= 4:
            entry["U"] = mat(unitary_np(circ))
        randoms.append(entry)
    # a mid-circuit measurement with classical control on a random 3-qubit input
    mid = {"version": 1, "qubits": 3, "clbits": 2,
           "columns": [[g("H", [0]), g("Ry", [1], params=[0.9])], [g("X", [2], [0])], [{"op": "measure", "qubit": 0, "bit": 0}],
                       [g("H", [0]), g("Rx", [2], params=[1.3], cond={"bits": [0], "equals": "1"})], [g("Z", [1], [2])],
                       [{"op": "measure", "qubit": 1, "bit": 1}], [g("X", [0], cond={"bits": [0, 1], "equals": "10"})]]}
    mid_psi0 = rand_state(3)
    midcase = {"circuit": mid, "psi0": vec(mid_psi0), "branches": branches_np(mid, mid_psi0)}
    return {"deutsch": deutsch, "bell": bell, "teleport": teleport, "dj3": dj, "qft3": qft3, "random": randoms, "mid": midcase}


# ------------------------------------------------------------------ measure ------------------------------------------------------------------

def marginal_np(psi, qubits, n):
    p = (np.abs(psi) ** 2).reshape([2] * n)
    rest = tuple(q for q in range(n) if q not in qubits)
    s = p.sum(axis=rest) if rest else p
    kept = [q for q in range(n) if q in qubits]  # the axes left, in ascending order
    return np.transpose(s, [kept.index(q) for q in qubits]).ravel()


def measure_cases():
    psi4 = rand_state(4)
    marg = [{"qubits": qs, "p": [float(x) for x in marginal_np(psi4, qs, 4)]} for qs in ([0], [3], [2, 0], [1, 3, 2], [0, 1, 2, 3])]
    psi3 = rand_state(3)
    mq = []
    for q in range(3):
        entry = {"q": q, "p": [], "post": []}
        for b in ("0", "1"):
            v = embed_np(np.outer(basis_vec(b), basis_vec(b)), 3, [q]) @ psi3
            p = float(np.real(np.vdot(v, v)))
            entry["p"].append(p)
            entry["post"].append(vec(v / np.sqrt(p)))
        mq.append(entry)
    v = embed_np(np.outer(basis_vec("10"), basis_vec("10")), 4, [2, 0]) @ psi4
    post = {"qubits": [2, 0], "bits": "10", "p": float(np.real(np.vdot(v, v))), "post": vec(v / np.linalg.norm(v))}
    psi2 = rand_state(2)
    bases = {"x": (PLUS, MINUS), "y": (np.array([1, 1j]) / np.sqrt(2), np.array([1, -1j]) / np.sqrt(2))}
    inbasis = []
    for q, name in ((1, "x"), (0, "y"), (0, "x")):
        entry = {"q": q, "basis": name, "p": [], "post": []}
        for k in bases[name]:
            w = embed_np(np.outer(k, k.conj()), 2, [q]) @ psi2
            p = float(np.real(np.vdot(w, w)))
            entry["p"].append(p)
            entry["post"].append(vec(w / np.sqrt(p)))
        inbasis.append(entry)
    s2 = 1 / np.sqrt(2)
    bell_kets = [s2 * (basis_vec("00") + basis_vec("11")), s2 * (basis_vec("00") - basis_vec("11")),
                 s2 * (basis_vec("01") + basis_vec("10")), s2 * (basis_vec("01") - basis_vec("10"))]
    bellm = []
    for (a, b) in ((0, 1), (2, 0)):
        rows = []
        for B in bell_kets:
            w = embed_np(np.outer(B, B.conj()), 3, [a, b]) @ psi3
            p = float(np.real(np.vdot(w, w)))
            rows.append({"p": p, "post": vec(w / np.sqrt(p))})
        bellm.append({"a": a, "b": b, "outcomes": rows})
    A = rand_herm(4)
    Bh = rand_herm(4)
    N = ginibre(2, 2)
    FA = embed_np(A, 3, [2, 0])
    FB = embed_np(Bh, 3, [2, 0])
    FN = embed_np(N, 3, [1])
    ev = lambda M: psi3.conj() @ M @ psi3
    var = lambda M: float(np.real(ev(M @ M) - ev(M) ** 2))
    comm = FA @ FB - FB @ FA
    expect = {"psi": vec(psi3), "A": mat(A), "B": mat(Bh), "qubitsAB": [2, 0], "N": mat(N), "qubitsN": [1],
              "expA": cx(ev(FA)), "expN": cx(ev(FN)), "varA": var(FA), "varB": var(FB),
              "varN": float(np.real(ev(FN.conj().T @ FN) - abs(ev(FN)) ** 2)), "momentA3": cx(ev(FA @ FA @ FA)),
              "robertson": {"product": math.sqrt(var(FA) * var(FB)), "bound": float(abs(ev(comm)) / 2)}}
    # localBasisProbs / runBracket / weightStats: a full kron of each qubit's basis-change dagger, then |.|^2
    # (independent of the engine's strided per-qubit applyGate route)
    BASIS2 = {"x": (PLUS, MINUS), "y": (np.array([1, 1j]) / np.sqrt(2), np.array([1, -1j]) / np.sqrt(2)), "z": (KET0, KET1)}

    def local_basis_probs_np(psi, bs):
        mats = [np.column_stack(BASIS2[b]).conj().T for b in bs]
        R = reduce(np.kron, mats)
        return np.abs(R @ psi) ** 2

    lbp = []
    for n, bs in ((2, ["x", "y"]), (2, ["z", "x"]), (3, ["x", "y", "z"]), (3, ["y", "y", "y"])):
        psi = rand_state(n)
        lbp.append({"psi": vec(psi), "bases": bs, "p": [float(x) for x in local_basis_probs_np(psi, bs)]})
    ghz_minus3 = s2 * (basis_vec("000") - basis_vec("111"))
    bracket = []
    for bs, want in ((["x", "x", "x"], -1.0), (["x", "y", "y"], 1.0), (["y", "x", "y"], 1.0), (["y", "y", "x"], 1.0)):
        p = local_basis_probs_np(ghz_minus3, bs)
        value = float(sum(pi * (-1 if bin(i).count("1") % 2 else 1) for i, pi in enumerate(p)))
        bracket.append({"bases": bs, "value": value, "want": want})
    psi_rand3 = rand_state(3)
    p_rand = local_basis_probs_np(psi_rand3, ["x", "y", "z"])
    bracket.append({"bases": ["x", "y", "z"], "psi": vec(psi_rand3),
                    "value": float(sum(pi * (-1 if bin(i).count("1") % 2 else 1) for i, pi in enumerate(p_rand)))})
    ws = []
    for n, psi, bit in ((3, rand_state(3), 1), (3, rand_state(3), 0), (4, reduce(np.kron, [PLUS] * 4), 1)):
        p = np.abs(psi) ** 2
        counts = np.array([bin(i).count("1") if bit == 1 else n - bin(i).count("1") for i in range(2 ** n)])
        m = float(np.sum(p * counts))
        v = float(np.sum(p * (counts - m) ** 2))
        ws.append({"psi": vec(psi), "bit": bit, "mean": m, "variance": v})
    return {"psi4": vec(psi4), "probs4": [float(x) for x in np.abs(psi4) ** 2], "marginals": marg, "psi3": vec(psi3),
            "measureQubit": mq, "postMeasure": post, "psi2": vec(psi2), "inBasis": inbasis, "bell": bellm, "expect": expect,
            "localBasisProbs": lbp, "runBracket": bracket, "weightStats": ws}


# ------------------------------------------------------------------ density ------------------------------------------------------------------

def ptranspose_np(rho, qubits, n):
    t = rho.reshape([2] * (2 * n))
    axes = list(range(2 * n))
    for q in qubits:
        axes[q], axes[n + q] = axes[n + q], axes[q]
    return np.transpose(t, axes).reshape(2 ** n, 2 ** n)


def fidelity_np(r, s):
    """Root fidelity with NO matrix square root: F = sum sqrt(lambda_i) over the eigenvalues of r @ s (the same
    nonzero spectrum as sqrt(r) s sqrt(r)); eigenvalues below 1e-13 are rounding noise around 0 for rank-deficient
    states. Cross-checked against scipy's sqrtm route Tr sqrtm(sqrtm(r) s sqrtm(r)), which is only good to ~1e-8
    when a state is singular."""
    lam = np.linalg.eigvals(r @ s)
    F = float(sum(np.sqrt(x.real) for x in lam if x.real > 1e-13))
    sr = sla.sqrtm(r)
    assert abs(F - np.real(np.trace(sla.sqrtm(sr @ s @ sr)))) < 1e-7
    return F


def bloch_np(r1):
    return [float(np.real(np.trace(r1 @ S))) for S in (X, Y, Z)]


def density_cases():
    rho3, rho4, rho5 = rand_density(8, 3), rand_density(16, 5), rand_density(32, 2)
    ptr = []
    for rho, n, outs in ((rho3, 3, ([1], [0, 2], [2], [0])), (rho4, 4, ([0, 3], [1], [0, 1, 2])), (rho5, 5, ([1, 3], [0, 1, 2, 4]))):
        for t in outs:
            ptr.append({"n": n, "traceOut": t, "result": mat(ptrace_np(rho, t, n))})
    rho2 = rand_density(4)
    s2 = 1 / np.sqrt(2)
    phi = s2 * (basis_vec("00") + basis_vec("11"))
    rho_bell = np.outer(phi, phi.conj())
    ptt = [{"rho": mat(rho2), "qubits": [1], "result": mat(ptranspose_np(rho2, [1], 2))},
           {"rho": mat(rho3), "qubits": [0, 2], "result": mat(ptranspose_np(rho3, [0, 2], 3))},
           {"rho": mat(rho_bell), "qubits": [1], "result": mat(ptranspose_np(rho_bell, [1], 2)),
            "eig": [float(x) for x in np.linalg.eigvalsh(ptranspose_np(rho_bell, [1], 2))]}]
    pure3 = rand_state(3)
    rho_p = np.outer(pure3, pure3.conj())
    reduced = [{"keep": [1], "rho": mat(ptrace_np(rho_p, [0, 2], 3))}, {"keep": [0, 2], "rho": mat(ptrace_np(rho_p, [1], 3))}]
    bloch = {"pure": [bloch_np(ptrace_np(rho_p, [k for k in range(3) if k != q], 3)) for q in range(3)],
             "mixed": [bloch_np(ptrace_np(rho3, [k for k in range(3) if k != q], 3)) for q in range(3)]}
    r1, s1 = rand_density(2), rand_density(2)
    sig2 = rand_density(4)
    k1 = rand_state(1)
    low = rand_density(4, 1) * 0.6 + rand_density(4, 1) * 0.4  # rank 2
    pairs = []
    for name, a, b in (("1q", r1, s1), ("2q", rho2, sig2), ("pureMixed", np.outer(k1, k1.conj()), r1), ("rank2", low, sig2)):
        pairs.append({"name": name, "rho": mat(a), "sigma": mat(b),
                      "D": float(0.5 * np.sum(np.abs(np.linalg.eigvalsh(a - b)))), "F": fidelity_np(a, b),
                      "purityRho": float(np.real(np.trace(a @ a)))})
    ka, kb = rand_state(2), rand_state(2)
    pure_pair = {"a": vec(ka), "b": vec(kb), "F": float(abs(np.vdot(ka, kb))),
                 "D": float(0.5 * np.sum(np.abs(np.linalg.eigvalsh(np.outer(ka, ka.conj()) - np.outer(kb, kb.conj())))))}
    postm = []
    for qubits, bits in (([2], "1"), ([0, 1], "01")):
        Pm = embed_np(np.outer(basis_vec(bits), basis_vec(bits)), 3, qubits)
        num = Pm @ rho3 @ Pm
        p = float(np.real(np.trace(num)))
        postm.append({"qubits": qubits, "bits": bits, "p": p, "post": mat(num / p)})
    # vonNeumann / spectrum: eigvalsh (same algorithm family as cmat's own numpy check, already independently
    # verified there; the real evidence for these two is the worked 0 / 1 / log2(d) cases, checked in the vitest)
    def von_neumann_np(rho):
        w = np.linalg.eigvalsh(rho)
        return float(-sum(x * np.log2(x) for x in w if x > 1e-15))

    vn_cases = [{"name": name, "rho": mat(rho), "S": von_neumann_np(rho)}
                for name, rho in (("rho3", rho3), ("rho4", rho4), ("pure", rho_p),
                                  ("mixed2", np.eye(2) / 2), ("mixed4", np.eye(4) / 4))]
    spec_cases = [{"name": name, "rho": mat(rho), "spectrum": [float(max(0, x)) for x in sorted(np.linalg.eigvalsh(rho), reverse=True)]}
                  for name, rho in (("rho3", rho3), ("rho4", rho4))]

    # entanglementEntropy: squared SINGULAR VALUES of the coefficient matrix (an SVD route, independent of the
    # engine's reducedDensity + eigh route)
    ent_cases = []
    for A_cut, n, psi_e in (([0], 3, pure3), ([1, 2], 3, pure3), ([0], 2, rand_state(2))):
        lam = np.linalg.svd(coef_np(psi_e, A_cut, n), compute_uv=False) ** 2
        ent_cases.append({"psi": vec(psi_e), "A": A_cut, "n": n, "S": float(-sum(x * np.log2(x) for x in lam if x > 1e-15))})

    # evolveRho: scipy's Pade expm (the engine's expmHermitian goes through its own eigh)
    H4 = rand_herm(4)
    rho4b = rand_density(4)
    t_val = 0.6
    U4 = sla.expm(-1j * H4 * t_val)
    evolve_case = {"H": mat(H4), "rho": mat(rho4b), "t": t_val, "result": mat(U4 @ rho4b @ U4.conj().T)}

    therm_cases = [{"x": x, "r": float(np.tanh(x / 2))} for x in (-3.0, -1.0, 0.0, 0.5, 2.0, 5.0)]

    # eigenEnsemble: eigh, kept and sorted descending
    w, V = np.linalg.eigh(rho3)
    keep = w > 1e-10
    p_e = w[keep]
    order = np.argsort(-p_e)
    eigen_ensemble_case = {"rho": mat(rho3), "p": [float(x) for x in p_e[order]],
                           "kets": [vec(V[:, i]) for i in np.where(keep)[0][order]]}

    # ensembleUnitary: a full-rank rho's eigen-ensemble (A, no padding needed) and a SECOND ensemble for the same
    # rho built by mixing A with a Haar-random unitary W (B = A W; this is exactly the unitary-freedom theorem, so
    # B is guaranteed to sum to the same rho). U is solved by lstsq (LAPACK), independent of the engine's own
    # hand-rolled Jacobi-SVD pseudoinverse; both routes must land on a genuinely unitary U with A U = B.
    rho_full = rand_density(4, 4)
    wf, Vf = np.linalg.eigh(rho_full)
    orderf = np.argsort(-wf)
    p1 = wf[orderf]
    kets1 = [Vf[:, i] for i in orderf]
    A = np.column_stack([np.sqrt(pi) * k for pi, k in zip(p1, kets1)])
    W = rand_unitary(4)
    B = A @ W
    p2 = np.sum(np.abs(B) ** 2, axis=0)
    kets2 = [B[:, j] / np.sqrt(p2[j]) for j in range(4)]
    U_np, *_ = np.linalg.lstsq(A, B, rcond=None)
    assert np.max(np.abs(U_np.conj().T @ U_np - np.eye(4))) < 1e-8, "ensembleUnitary fixture: U is not unitary"
    assert np.max(np.abs(A @ U_np - B)) < 1e-8, "ensembleUnitary fixture: A U != B"
    ensemble_unitary_case = {"p1": [float(x) for x in p1], "kets1": [vec(k) for k in kets1],
                             "p2": [float(x) for x in p2], "kets2": [vec(k) for k in kets2], "U": mat(U_np)}

    # ensembleUnitary PADDING case (q8TrineUUnitary; qc709-Q8Q9.md ruling 1): the trine (three equatorial states
    # 120 degrees apart, weight 1/3 each) against the z poles (|0>, |1>, weight 1/2 each) -- BOTH give rho = I/2 on
    # one qubit, but n = 3 > d = 2. A's THIN svd (k = min(d, n) = 2 columns) misses A's right null space (the one
    # extra dimension of C^3 orthogonal to A's two forced directions); completing V to the FULL 3x3 unitary via
    # np.linalg.svd(..., full_matrices=True) -- independent of the engine's hand-rolled Jacobi-SVD plus its own
    # manual null-space completion -- is what makes U genuinely unitary. No RNG draws: both ensembles and the whole
    # computation are exact/analytic, so this case needs no seed to reproduce byte-identically.
    S2 = 1 / np.sqrt(2)
    pad_p1 = [0.5, 0.5]
    pad_kets1 = [np.array([1, 0], dtype=complex), np.array([0, 1], dtype=complex)]  # the z poles
    pad_p2 = [1 / 3, 1 / 3, 1 / 3]
    pad_kets2 = [np.array([S2, S2 * np.exp(1j * np.deg2rad(deg))], dtype=complex) for deg in (0, 120, 240)]  # the trine
    pad_rho1 = sum(w * np.outer(k, k.conj()) for w, k in zip(pad_p1, pad_kets1))
    pad_rho2 = sum(w * np.outer(k, k.conj()) for w, k in zip(pad_p2, pad_kets2))
    assert np.max(np.abs(pad_rho1 - pad_rho2)) < 1e-12, "ensembleUnitary padding fixture: the two ensembles must give the SAME rho"
    pad_n = 3
    pad_A = np.column_stack([np.sqrt(pad_p1[i]) * pad_kets1[i] if i < 2 else np.zeros(2, dtype=complex) for i in range(pad_n)])  # 2x3, zero-padded
    pad_B = np.column_stack([np.sqrt(pad_p2[i]) * pad_kets2[i] for i in range(pad_n)])  # 2x3
    pad_Ua, pad_s, pad_VaH = np.linalg.svd(pad_A, full_matrices=True)  # pad_Ua: 2x2; pad_s: length 2; pad_VaH: FULL 3x3
    pad_Va = pad_VaH.conj().T
    pad_UaB = pad_Ua.conj().T @ pad_B  # 2x3
    pad_D = np.zeros((pad_n, pad_n), dtype=complex)
    pad_tol = 1e-9 * max(pad_s[0], 1e-300)
    pad_forced_rows: list = []
    pad_done = set()
    for i in range(len(pad_s)):
        if pad_s[i] > pad_tol:
            pad_D[i, :] = pad_UaB[i, :] / pad_s[i]
            pad_forced_rows.append(pad_D[i, :].copy())
            pad_done.add(i)
    for i in range(pad_n):
        if i in pad_done:
            continue
        for e in range(pad_n):
            w = np.zeros(pad_n, dtype=complex)
            w[e] = 1
            for v in pad_forced_rows:
                w = w - v * np.vdot(v, w)
            nw = np.linalg.norm(w)
            if nw > 1e-6:
                pad_D[i, :] = w / nw
                pad_forced_rows.append(pad_D[i, :].copy())
                break
    pad_U = pad_Va @ pad_D
    assert np.max(np.abs(pad_U.conj().T @ pad_U - np.eye(pad_n))) < 1e-8, "ensembleUnitary padding fixture: U is not unitary"
    assert np.max(np.abs(pad_A @ pad_U - pad_B)) < 1e-8, "ensembleUnitary padding fixture: A U != B"
    ensemble_unitary_pad_case = {"p1": [float(x) for x in pad_p1], "kets1": [vec(k) for k in pad_kets1],
                                 "p2": [float(x) for x in pad_p2], "kets2": [vec(k) for k in pad_kets2], "U": mat(pad_U)}

    return {"rho3": mat(rho3), "rho4": mat(rho4), "rho5": mat(rho5), "partialTrace": ptr, "ptranspose": ptt,
            "pure3": vec(pure3), "reduced": reduced, "bloch": bloch, "pairs": pairs, "purePair": pure_pair,
            "postMeasure": postm, "notDensity": [mat(np.diag([0.7, 0.4])), mat(np.diag([1.2, -0.2])), mat(np.array([[0.5, 0.5], [0.4, 0.5]]))],
            "vonNeumann": vn_cases, "spectrum": spec_cases, "entanglementEntropy": ent_cases, "evolveRho": evolve_case,
            "thermalPolarization": therm_cases, "eigenEnsemble": eigen_ensemble_case, "ensembleUnitary": ensemble_unitary_case,
            "ensembleUnitaryPad": ensemble_unitary_pad_case}


# ------------------------------------------------------------------ entangle (E2) ------------------------------------------------------------------

S2 = 1 / np.sqrt(2)
PHI_P = S2 * (basis_vec("00") + basis_vec("11"))
PHI_M = S2 * (basis_vec("00") - basis_vec("11"))
PSI_P = S2 * (basis_vec("01") + basis_vec("10"))
PSI_M = S2 * (basis_vec("01") - basis_vec("10"))
BELL_NP = {"Phi+": PHI_P, "Phi-": PHI_M, "Psi+": PSI_P, "Psi-": PSI_M}


def as_rho(state):
    """A ket or a density matrix -> a density matrix (the one place this script, like the engine, accepts either)."""
    return np.outer(state, state.conj()) if state.ndim == 1 else state


def correlator_np(state, A, B):
    """<A tensor B> = Tr(rho (A kron B)), by np.kron + np.trace -- the engine route is apply/inner, never np.kron."""
    return float(np.real(np.trace(as_rho(state) @ np.kron(A, B))))


def correlation_tensor_np(state):
    return [[correlator_np(state, A, B) for B in (X, Y, Z)] for A in (X, Y, Z)]


def n_dot_sigma_np(n):
    return n[0] * X + n[1] * Y + n[2] * Z


def chsh_np(state, a1, a2, b1, b2):
    return correlator_np(state, a1, b1) + correlator_np(state, a1, b2) + correlator_np(state, a2, b1) - correlator_np(state, a2, b2)


def ptranspose_b_np(rho):
    return ptranspose_np(rho, [1], 2)


def negativity_np(rho):
    return float(-sum(x for x in np.linalg.eigvalsh(ptranspose_b_np(rho)) if x < 0))


def concurrence_pure_svd_np(psi):
    """2 s1 s2 of the 2x2 coefficient matrix (Bergou Eq. 3.68): independent of the engine's own spin-flip overlap."""
    s = np.linalg.svd(coef_np(psi, [0], 2), compute_uv=False)
    return float(2 * s[0] * s[1])


def concurrence_mixed_np(rho):
    """Wootters' C via the FULL (non-Hermitian) eigenvalues of rho @ rho_tilde -- independent of the engine's
    Hermitian sqrt(rho) rho_tilde sqrt(rho) route."""
    YY = np.kron(Y, Y)
    rho_tilde = YY @ rho.conj() @ YY
    lam = np.sort(np.sqrt(np.maximum(0, np.real(np.linalg.eigvals(rho @ rho_tilde)))))[::-1]
    return float(max(0, lam[0] - lam[1] - lam[2] - lam[3]))


def werner_np(w):
    return w * np.outer(PHI_P, PHI_P.conj()) + (1 - w) * np.eye(4) / 4


def phase_bell_np(delta_deg):
    return np.array([S2, 0, 0, S2 * np.exp(1j * np.deg2rad(delta_deg))], complex)


def entangle_cases():
    corr_grid = {"Phi+": correlation_tensor_np(PHI_P), "Psi-": correlation_tensor_np(PSI_M)}
    rho_rand = rand_density(4, 3)
    corr_grid_rand = {"rho": mat(rho_rand), "T": correlation_tensor_np(rho_rand)}

    # Bergou's phase-dial example (P-Q10-story §9.1): a1=X, a2=Y for Alice, b1=X, b2=Y for Bob (the SAME two
    # directions on each side) gives S(delta) = <XX> + <XY> + <YX> - <YY> = 2cos(delta) + 2sin(delta) exactly.
    AX, AY = np.array([1.0, 0, 0]), np.array([0.0, 1.0, 0])
    BD1, BD2 = AX, AY
    chsh_phase = [{"deltaDeg": d, "S": chsh_np(phase_bell_np(d), n_dot_sigma_np(AX), n_dot_sigma_np(AY), n_dot_sigma_np(BD1), n_dot_sigma_np(BD2)),
                   "closedForm": 2 * np.cos(np.deg2rad(d)) + 2 * np.sin(np.deg2rad(d))} for d in (0, 20, 45, 70, 90)]
    for case in chsh_phase:
        assert abs(case["S"] - case["closedForm"]) < 1e-9, "chshCurve fixture: does not match 2cos(delta)+2sin(delta)"

    horodecki = []
    for name, state in (("Phi+", PHI_P), ("Psi-", PSI_M), ("rhoRand", rho_rand), ("product", np.kron(rand_state(1), rand_state(1)))):
        T = np.array(correlation_tensor_np(state))
        s = np.linalg.svd(T, compute_uv=False)
        horodecki.append({"name": name, "M": float(2 * np.sqrt(s[0] ** 2 + s[1] ** 2))})
    assert abs(horodecki[0]["M"] - 2 * np.sqrt(2)) < 1e-9, "chshMaxHorodecki fixture: a Bell state must hit 2sqrt2"

    lhv_assignments, lhv_x = [], []
    for a1, a2, b1, b2 in itertools.product((1, -1), repeat=4):
        lhv_assignments.append([a1, a2, b1, b2])
        lhv_x.append(a1 * b1 + a1 * b2 + a2 * b1 - a2 * b2)
    assert max(lhv_x) == 2, "lhvChsh fixture: the classical bound is 2"

    pr_table = [[1, 1], [1, -1]]
    pr_s = pr_table[0][0] + pr_table[0][1] + pr_table[1][0] - pr_table[1][1]
    assert pr_s == 4

    product_ket = np.kron(rand_state(1), rand_state(1))
    product_rho = np.outer(product_ket, product_ket.conj())
    rho_mixed = rand_density(4, 2)
    ppt_cases = []
    for name, rho in (("product", product_rho), ("Phi+", np.outer(PHI_P, PHI_P.conj())), ("Psi-", np.outer(PSI_M, PSI_M.conj())),
                      ("werner13", werner_np(1 / 3)), ("werner12", werner_np(0.5)), ("rhoMixed", rho_mixed)):
        eig = np.linalg.eigvalsh(ptranspose_b_np(rho))
        ppt_cases.append({"name": name, "rho": mat(rho), "isPPT": bool(np.all(eig >= -1e-9)), "negativity": negativity_np(rho)})
    assert ppt_cases[0]["isPPT"] and abs(ppt_cases[0]["negativity"]) < 1e-9
    assert not ppt_cases[1]["isPPT"] and abs(ppt_cases[1]["negativity"] - 0.5) < 1e-9, "a Bell state's negativity is exactly 1/2"

    cpure_cases = []
    for name, psi in (("Phi+", PHI_P), ("product", np.kron(rand_state(1), rand_state(1))), ("tilt30", np.array([np.cos(np.pi / 6), 0, 0, np.sin(np.pi / 6)], complex)),
                      ("rand1", rand_state(2)), ("rand2", rand_state(2))):
        cpure_cases.append({"name": name, "psi": vec(psi), "C": concurrence_pure_svd_np(psi)})
    assert abs(cpure_cases[0]["C"] - 1) < 1e-9 and abs(cpure_cases[1]["C"]) < 1e-9

    ghz3, w3 = S2 * (basis_vec("000") + basis_vec("111")), (basis_vec("100") + basis_vec("010") + basis_vec("001")) / np.sqrt(3)
    ghz_pair = ptrace_np(np.outer(ghz3, ghz3.conj()), [2], 3)
    w_pair_ab = ptrace_np(np.outer(w3, w3.conj()), [2], 3)
    cmix_cases = []
    for name, rho in (("werner13", werner_np(1 / 3)), ("werner12", werner_np(0.5)), ("werner1", werner_np(1.0)),
                      ("ghzPair", ghz_pair), ("wPair", w_pair_ab), ("rhoMixed", rho_mixed), ("rhoRand", rho_rand)):
        cmix_cases.append({"name": name, "rho": mat(rho), "C": concurrence_mixed_np(rho)})
    assert abs(cmix_cases[0]["C"]) < 1e-9, "Werner at w=1/3 (the PPT threshold) has concurrence 0"
    assert abs(cmix_cases[1]["C"] - 0.25) < 1e-9, "Werner concurrence max(0,(3w-1)/2) at w=1/2 is 0.25"
    assert abs(cmix_cases[2]["C"] - 1) < 1e-9, "Werner at w=1 is the pure Bell state, concurrence 1"
    assert abs(cmix_cases[3]["C"]) < 1e-9, "the GHZ pair (tracing out the third qubit) is separable"
    assert abs(cmix_cases[4]["C"] - 2 / 3) < 1e-9, "the W-state pair has concurrence 2/3 (Eq. 3.85)"

    eof_cases = [{"C": Cv, "E": float(entr([(1 + np.sqrt(max(0, 1 - Cv ** 2))) / 2, (1 - np.sqrt(max(0, 1 - Cv ** 2))) / 2]).sum() / np.log(2))}
                 for Cv in (0.0, 0.25, 0.5, 2 / 3, 0.866, 1.0)]
    assert abs(eof_cases[-1]["E"] - 1) < 1e-9, "eofFromC(1) is 1 bit (a Bell state)"
    assert abs(eof_cases[0]["E"]) < 1e-9, "eofFromC(0) is 0 (a product state)"

    return {"correlationTensor": corr_grid, "correlationTensorRandom": corr_grid_rand, "chshPhase": chsh_phase,
            "chshMaxHorodecki": horodecki, "lhvChsh": {"assignments": lhv_assignments, "maxS": int(max(lhv_x)), "xValues": lhv_x},
            "prBox": {"table": pr_table, "S": pr_s}, "ppt": ppt_cases, "concurrencePure": cpure_cases,
            "concurrence": cmix_cases, "eofFromC": eof_cases}


# ------------------------------------------------------------------ teleport (E2) ------------------------------------------------------------------

GATE_OF_BITS = {"00": I2, "01": X, "10": Z, "11": Y}
READOUT_OF_BELL = {"Phi+": "00", "Psi+": "01", "Phi-": "10", "Psi-": "11"}


def extract_product_factor(branch, B):
    """branch (normalized, 2^k * 2 dims) is KNOWN to equal B (on the first k qubits) tensor a 1-qubit ket: divide out
    B's own amplitude at its largest-magnitude index to read the last qubit's ket off directly (no SVD)."""
    k = int(np.log2(B.size))
    idx = int(np.argmax(np.abs(B)))
    branch_r = branch.reshape(2 ** k, 2)
    out = branch_r[idx, :] / B[idx]
    return out / np.linalg.norm(out)


def extract_product_factor_ac(branch, keep_lo, keep_hi, B, n):
    """Entanglement swapping: branch (n qubits) is KNOWN to equal B (on qubits [keep_lo+1 .. keep_hi-1], the measured
    pair) tensor a ket on the two OUTER qubits keep_lo, keep_hi: contract the measured pair's index out against B."""
    t = branch.reshape([2] * n)
    t = np.moveaxis(t, [keep_lo, keep_hi] + [q for q in range(n) if q not in (keep_lo, keep_hi)], list(range(n)))
    t = t.reshape(4, B.size)
    idx = int(np.argmax(np.abs(B)))
    out = t[:, idx] / B[idx]
    return out / np.linalg.norm(out)


def teleport_cases():
    bell_cycle = []
    for op, G in (("I", I2), ("X", X), ("Y", Y), ("Z", Z)):
        ket = np.kron(G, I2) @ PHI_P
        name = max(BELL_NP, key=lambda nm: abs(np.vdot(BELL_NP[nm], ket)))
        bell_cycle.append({"op": op, "ket": vec(ket), "name": name})
    assert [b["name"] for b in bell_cycle] == ["Phi+", "Psi+", "Psi-", "Phi-"], "bellCycle fixture: I,X,Y,Z land on Phi+,Psi+,Psi-,Phi- in that order"

    dense_code = []
    for bits, G in GATE_OF_BITS.items():
        encoded = np.kron(G, I2) @ PHI_P
        name = max(BELL_NP, key=lambda nm: abs(np.vdot(BELL_NP[nm], encoded)))
        dense_code.append({"bits": bits, "encoded": vec(encoded), "readout": READOUT_OF_BELL[name], "prob": float(abs(np.vdot(BELL_NP[name], encoded)) ** 2)})
    assert all(d["readout"] == d["bits"] and abs(d["prob"] - 1) < 1e-9 for d in dense_code), "denseCode fixture: every readout must equal its bits with prob 1"

    teleport_cases_out = []
    for name, psi in (("plusX", np.array([S2, S2], complex)), ("tilt30", np.array([np.cos(np.pi / 12), np.sin(np.pi / 12)], complex)), ("rand", rand_state(1))):
        full = np.kron(psi, PHI_P)
        rho_full = np.outer(full, full.conj())
        bob_pre = ptrace_np(rho_full, [0, 1], 3)
        assert np.max(np.abs(bob_pre - np.eye(2) / 2)) < 1e-9, "teleport fixture: Bob's pre-correction reduced state must be I/2 for every psi"
        for outcome, bname in (("00", "Phi+"), ("01", "Psi+"), ("10", "Phi-"), ("11", "Psi-")):
            B = BELL_NP[bname]
            P = np.kron(np.outer(B, B.conj()), I2)
            branch_un = P @ full
            prob = float(np.real(np.vdot(branch_un, branch_un)))
            assert abs(prob - 0.25) < 1e-9, "teleport fixture: every Bell outcome has probability 1/4"
            branch = branch_un / np.sqrt(prob)
            bob_raw = extract_product_factor(branch, B)
            corrected = bob_raw
            if outcome[1] == "1":
                corrected = X @ corrected
            if outcome[0] == "1":
                corrected = Z @ corrected
            fidelity = float(abs(np.vdot(psi, corrected)))
            assert abs(fidelity - 1) < 1e-9, f"teleport fixture: outcome {outcome} must recover psi exactly (fidelity 1)"
            teleport_cases_out.append({"psiName": name, "psi": vec(psi), "outcome": outcome, "prob": prob, "fidelity": fidelity, "bobPre": mat(bob_pre)})

    swap_cases = []
    full4 = np.kron(PHI_P, PHI_P)
    for bname, readout in READOUT_OF_BELL.items():
        B = BELL_NP[bname]
        P = np.kron(np.kron(I2, np.outer(B, B.conj())), I2)
        branch_un = P @ full4
        prob = float(np.real(np.vdot(branch_un, branch_un)))
        assert abs(prob - 0.25) < 1e-9, "swapIdentity fixture: every Bell outcome has probability 1/4"
        branch = branch_un / np.sqrt(prob)
        ac = extract_product_factor_ac(branch, 0, 3, B, 4)
        ac_name = max(BELL_NP, key=lambda nm: abs(np.vdot(BELL_NP[nm], ac)))
        swap_cases.append({"outcome": readout, "prob": prob, "name": ac_name})

    weyl_cases = []
    for N in (2, 3):
        chis = {}
        for n in range(N):
            for m in range(N):
                chi = np.zeros(N * N, complex)
                for j in range(N):
                    k = (j + m) % N
                    chi[j * N + k] = np.exp(2j * np.pi * j * n / N) / np.sqrt(N)
                chis[(n, m)] = chi
                weyl_cases.append({"N": N, "n": n, "m": m, "chi": vec(chi)})
        gram = np.array([[np.vdot(chis[a], chis[b]) for b in chis] for a in chis])
        max_off = float(np.max(np.abs(gram - np.eye(N * N))))
        assert max_off < 1e-9, f"weylBell fixture: the N={N} Weyl-Bell basis must be orthonormal"
        if N == 2:
            assert abs(np.vdot(chis[(0, 0)], PHI_P) - 1) < 1e-9, "weylBell(2,0,0) must be Phi+"

    return {"bellCycle": bell_cycle, "denseCode": dense_code, "teleport": teleport_cases_out, "swapIdentity": swap_cases, "weylBell": weyl_cases}


# ------------------------------------------------------------------ bits ------------------------------------------------------------------

def rref_gf2(M):
    """Our own Gauss-Jordan mod 2 (numpy has none): the pivot row is the first with a 1, then XOR it everywhere."""
    R = np.array(M, dtype=int) % 2
    rows, cols = R.shape
    pivots, r = [], 0
    for c in range(cols):
        if r == rows:
            break
        nz = [i for i in range(r, rows) if R[i, c]]
        if not nz:
            continue
        R[[r, nz[0]]] = R[[nz[0], r]]
        for i in range(rows):
            if i != r and R[i, c]:
                R[i] ^= R[r]
        pivots.append(c)
        r += 1
    return R, pivots


def bits_cases():
    n = 4
    pairs = [{"x": x, "z": z, "dot": bin(x & z).count("1") % 2, "dist": bin(x ^ z).count("1")} for x in range(2 ** n) for z in range(2 ** n)]
    weights = [bin(x).count("1") for x in range(64)]
    funcs2 = [{"table": [(f >> (3 - x)) & 1 for x in range(4)]} for f in range(16)]
    for f in funcs2:
        f["constant"] = len(set(f["table"])) == 1
        f["balanced"] = sum(f["table"]) == 2
    funcs3 = []
    for f in range(256):
        t = [(f >> (7 - x)) & 1 for x in range(8)]
        funcs3.append([int(len(set(t)) == 1), int(sum(t) == 4)])
    rev = []
    for t in ([0, 0], [1, 1], [0, 1], [1, 0], [0, 1, 1, 0], [1, 0, 0, 0]):
        perm = [0] * (2 * len(t))
        for x in range(len(t)):
            for y in (0, 1):
                perm[2 * x + y] = 2 * x + (y ^ t[x])
        rev.append({"table": t, "perm": perm})
    gf2 = []
    for (r, c) in ((3, 5), (4, 4), (5, 7), (6, 6), (7, 4), (4, 8), (1, 5), (5, 1), (6, 10)):
        M = rng.integers(0, 2, (r, c))
        if r == 6 and c == 6:
            M[5] = M[0] ^ M[1]  # force a dependent row
        R, piv = rref_gf2(M)
        x0 = rng.integers(0, 2, c)
        b_ok = (M @ x0) % 2
        b_bad = None
        for _ in range(200):
            b = rng.integers(0, 2, r)
            if len(rref_gf2(np.column_stack([M, b]))[1]) > len(piv):
                b_bad = b
                break
        gf2.append({"M": M.tolist(), "R": R.tolist(), "pivots": piv, "rank": len(piv), "nullity": c - len(piv),
                    "bOk": b_ok.tolist(), "bBad": None if b_bad is None else b_bad.tolist()})
    hamming = {str(r): [[((j + 1) >> (r - 1 - i)) & 1 for j in range(2 ** r - 1)] for i in range(r)] for r in (2, 3, 4)}
    # merminInstructionSets: itertools.product over the 6 local variables directly (independent of the engine's
    # nested loops over a 4-element settings array)
    target = {"XXX": -1, "XYY": 1, "YXY": 1, "YYX": 1}
    assignments = []
    best = 0
    for ax1, ay1, ax2, ay2, ax3, ay3 in itertools.product((1, -1), repeat=6):
        values = {"XXX": ax1 * ax2 * ax3, "XYY": ax1 * ay2 * ay3, "YXY": ay1 * ax2 * ay3, "YYX": ay1 * ay2 * ax3}
        matches = sum(1 for k in target if values[k] == target[k])
        best = max(best, matches)
        assignments.append({"a": [{"x": ax1, "y": ay1}, {"x": ax2, "y": ay2}, {"x": ax3, "y": ay3}], "values": values, "matches": matches})
    mermin = {"assignments": assignments, "maxMatches": best}
    return {"pairs": pairs, "weights": weights, "funcs2": funcs2, "funcs3": funcs3, "reversible": rev, "gf2": gf2, "hamming": hamming,
            "mermin": mermin}


# ------------------------------------------------------------------ info ------------------------------------------------------------------

def info_cases():
    xs = [0.0, 1.0, 2.0, 3.0, 4.0]
    p = [0.1, 0.2, 0.4, 0.2, 0.1]
    xa, pa = np.array(xs), np.array(p)
    m = float(np.sum(xa * pa))
    mean_var = {"xs": xs, "p": p, "mean": m, "variance": float(np.sum(pa * (xa - m) ** 2))}
    binomial = []
    for N, pp in ((10, 0.3), (50, 0.5), (4, 0.9), (20, 0.05)):
        bm, bv = binom.stats(N, pp, moments="mv")  # scipy's own binomial moments, not the closed form Np, Np(1-p)
        binomial.append({"N": N, "p": pp, "mean": float(bm), "variance": float(bv)})
    shannon_cases = [{"p": pk, "H": float(entr(np.array(pk)).sum() / np.log(2))}
                      for pk in ([0.5, 0.5], [1.0, 0.0], [0.25, 0.25, 0.25, 0.25], [0.1, 0.2, 0.3, 0.4], [1.0])]
    binary = [{"p": pp, "h": float(entr(np.array([pp, 1 - pp])).sum() / np.log(2))} for pp in (0.0, 0.1, 0.5, 0.9, 1.0, 0.3)]
    pxy_cases = []
    for pxy in ([[0.4, 0.1], [0.1, 0.4]], [[0.25, 0.25], [0.25, 0.25]], [[0.5, 0.0], [0.0, 0.5]], [[0.3, 0.2], [0.1, 0.4]]):
        arr = np.array(pxy)
        pxy_cases.append({"pxy": pxy, "px": [float(x) for x in arr.sum(axis=1)], "py": [float(x) for x in arr.sum(axis=0)],
                          "C": float(arr[0][0] - arr[0][1] - arr[1][0] + arr[1][1])})
    return {"meanVar": mean_var, "binomial": binomial, "shannon": shannon_cases, "binaryEntropy": binary, "pxy": pxy_cases}


# ------------------------------------------------------------------ complex ------------------------------------------------------------------

def complex_cases():
    euler = [{"phi": phi, "n": n, "value": cx((1 + 1j * phi / n) ** n), "limit": cx(np.exp(1j * phi))}
             for phi in (np.pi, 1.0, -2.5, 2 * np.pi) for n in (1, 2, 10, 100, 1000)]
    phases = rng.uniform(-np.pi, np.pi, 7)
    amps = rng.uniform(0.2, 1.5, 7)
    spread = 2 * np.pi * np.arange(5) / 5 + 0.3
    # G1 (stage kinds batch): partial sums of the exponential series, by Python's complex power and math.factorial (the
    # engine runs the term recursion t_{k+1} = t_k z / (k + 1)); no random draws, so the blocks above are unchanged
    series = [{"z": cx(z), "K": K, "value": cx(sum(z ** k / math.factorial(k) for k in range(K))), "limit": cx(np.exp(z))}
              for z in (1j * np.pi, 1 + 0j, 2 + 1j, -1.5j, 0.3 - 0.4j) for K in (0, 1, 2, 5, 10, 20, 30)]
    # G2: the N-th roots of unity as np.exp(2j pi k / N) (the engine uses expi), and their sums (0 for N >= 2)
    roots = [{"N": N, "roots": [cx(w) for w in np.exp(2j * np.pi * np.arange(N) / N)], "sum": cx(np.sum(np.exp(2j * np.pi * np.arange(N) / N)))}
             for N in range(1, 13)]
    return {"euler": euler, "phasor": {"phases": phases.tolist(), "amps": amps.tolist(), "sum": cx(np.sum(amps * np.exp(1j * phases))),
                                       "unitSum": cx(np.sum(np.exp(1j * phases))), "spread": spread.tolist(), "spreadSum": cx(np.sum(np.exp(1j * spread)))},
            "series": series, "roots": roots}


# ------------------------------------------------------------------ channels (E3) ------------------------------------------------------------------

def swap_matrix(d):
    """The unnormalized SWAP on C^d (x) C^d: |a>|i> -> |i>|a>. Choi(transposeMap) = SWAP exactly -- a CLOSED FORM (no
    loop over a basis of matrices: a route independent of the engine's elementary-basis-and-scatter `choi`)."""
    S = np.zeros((d * d, d * d), dtype=complex)
    for a in range(d):
        for i in range(d):
            S[a * d + i, i * d + a] = 1
    return S


def phi_phi_matrix(d):
    """|Phi><Phi|, Phi = sum_i |i>|i> (UNNORMALIZED): Choi(unotMap) = (I - |Phi><Phi|)/(d-1), a DIFFERENT closed form
    from swap_matrix (|Phi><Phi| is rank 1, not full-rank like SWAP; verified against the elementary-basis route by
    hand before use here -- the two are easy to conflate and only one is right)."""
    phi = np.eye(d, dtype=complex).reshape(-1)
    return np.outer(phi, phi.conj())


def choi_np(kraus, d):
    """J(E) = sum_m (K_m (x) I) |Phi+><Phi+| (K_m (x) I)^dagger, Phi+ = vec(I_d) UNNORMALIZED: an independent
    (np.kron-based) route from the engine's "apply to each elementary basis matrix and scatter" loop."""
    phi = np.eye(d, dtype=complex).reshape(-1)
    Phi = np.outer(phi, phi.conj())
    J = np.zeros((d * d, d * d), dtype=complex)
    for K in kraus:
        KI = np.kron(K, np.eye(d))
        J += KI @ Phi @ KI.conj().T
    return J


def apply_kraus_np(ks, rho):
    return sum(K @ rho @ K.conj().T for K in ks)


def dep_kraus_np(p):
    return [math.sqrt(1 - p) * I2, math.sqrt(p / 3) * X, math.sqrt(p / 3) * Y, math.sqrt(p / 3) * Z]


def deph_kraus_np(p):
    return [math.sqrt(1 - p) * I2, math.sqrt(p) * Z]


def bitflip_kraus_np(p):
    return [math.sqrt(1 - p) * I2, math.sqrt(p) * X]


def ad_kraus_np(g):
    return [np.array([[1, 0], [0, math.sqrt(1 - g)]], complex), np.array([[0, math.sqrt(g)], [0, 0]], complex)]


def channels_cases():
    ps = [0.0, 0.1, 0.3, 0.5, 0.75, 1.0]
    gammas = [0.0, 0.2, 0.5, 0.8, 1.0]
    named = []
    for name, builder, params in (("depolarizing", dep_kraus_np, ps), ("dephasing", deph_kraus_np, ps),
                                   ("bitFlip", bitflip_kraus_np, ps), ("amplitudeDamping", ad_kraus_np, gammas)):
        for pp in params:
            ks = builder(pp)
            rho = rand_density(2)
            J = choi_np(ks, 2)
            named.append({"name": name, "p": pp, "kraus": [mat(K) for K in ks],
                          "sumKdK": mat(sum(K.conj().T @ K for K in ks)), "rho": mat(rho),
                          "applied": mat(apply_kraus_np(ks, rho)), "choi": mat(J),
                          "choiEig": [float(x) for x in np.linalg.eigvalsh(J)]})
    # composeChannels: "apply A then B" has Kraus set {B_j A_i} -- checked directly against applyKraus(A, .) then
    # applyKraus(B, .) composed, both sides independent of the engine's composeChannels
    A, B = dep_kraus_np(0.2), bitflip_kraus_np(0.3)
    rho_c = rand_density(2)
    compose_case = {"rhoIn": mat(rho_c), "result": mat(apply_kraus_np(B, apply_kraus_np(A, rho_c)))}
    # pauliTwirl: direct (1/4) sum_P P.E(P rho P).P route (an "apply to basis states and average" algorithm,
    # independent of the engine's "halve each twirled Kraus operator" shortcut)
    twirl_rho = rand_density(2)
    Ks = dep_kraus_np(0.4)
    twirled = sum(P @ apply_kraus_np(Ks, P @ twirl_rho @ P) @ P for P in (I2, X, Y, Z)) / 4
    twirl_case = {"rho": mat(twirl_rho), "p": 0.4, "result": mat(twirled)}
    # transposeMap / unotMap: NOT CP, but trace-preserving; Choi by the closed forms above (no basis loop)
    d = 2
    choi_t, choi_u = swap_matrix(d), (np.eye(d * d, dtype=complex) - phi_phi_matrix(d)) / (d - 1)
    rho_t = rand_density(2)
    nonphys = {"d": d, "rho": mat(rho_t), "transposed": mat(rho_t.T), "unot": mat((np.trace(rho_t) * np.eye(d) - rho_t) / (d - 1)),
               "choiTranspose": mat(choi_t), "choiTransposeEig": [float(x) for x in np.linalg.eigvalsh(choi_t)],
               "choiUnot": mat(choi_u), "choiUnotEig": [float(x) for x in np.linalg.eigvalsh(choi_u)]}
    return {"named": named, "compose": compose_case, "twirl": twirl_case, "nonphys": nonphys}


# ------------------------------------------------------------------ povm (E3) ------------------------------------------------------------------

def trine_povm():
    """The symmetric qubit trine POVM: (1/3)(I + n_k.sigma) for three Bloch directions 120 degrees apart in the
    xz-plane (Bergou's minimal example of an overcomplete, m=3 > d=2, rank-1 POVM)."""
    Es = []
    for k in range(3):
        theta = 2 * np.pi * k / 3
        n = np.array([np.cos(theta), 0.0, np.sin(theta)])
        Es.append((I2 + n[0] * X + n[1] * Y + n[2] * Z) / 3)
    return Es


def povm_cases():
    proj = [np.outer(KET0, KET0.conj()), np.outer(KET1, KET1.conj())]  # a projective (rank-1, complete) POVM
    trine = trine_povm()
    bad_sum = [np.outer(KET0, KET0.conj()), 0.4 * np.outer(KET1, KET1.conj())]  # does not sum to I
    bad_psd = [np.array([[1, 0], [0, -0.2]], complex), np.array([[0, 0], [0, 1.2]], complex)]  # a negative eigenvalue
    povms = {"valid": [{"name": "projective", "Es": [mat(E) for E in proj]}, {"name": "trine", "Es": [mat(E) for E in trine]}],
             "invalid": [{"name": "badSum", "Es": [mat(E) for E in bad_sum]}, {"name": "badPSD", "Es": [mat(E) for E in bad_psd]}]}
    born = []
    for name, Es in (("projective", proj), ("trine", trine)):
        rho = rand_density(2)
        born.append({"name": name, "Es": [mat(E) for E in Es], "rho": mat(rho),
                     "p": [float(np.real(np.trace(E @ rho))) for E in Es]})
    # neumark: V built from scipy.linalg.sqrtm, a Schur-based route INDEPENDENT of the engine's eigh-based sqrtPSD
    neumark_cases = []
    for name, Es in (("projective", proj), ("trine", trine)):
        d, m = Es[0].shape[0], len(Es)
        roots = [sla.sqrtm(E) for E in Es]
        V = np.zeros((d * m, d), dtype=complex)
        for a in range(d):
            for i in range(m):
                V[a * m + i, :] = roots[i][a, :]
        rho = rand_density(d)
        rho_dil = V @ rho @ V.conj().T
        probs = []
        for i in range(m):
            P = np.zeros((d * m, d * m), dtype=complex)
            for a in range(d):
                P[a * m + i, a * m + i] = 1
            probs.append(float(np.real(np.trace(P @ rho_dil))))
        neumark_cases.append({"name": name, "Es": [mat(E) for E in Es], "V": mat(V), "rho": mat(rho),
                              "probs": probs, "VdaggerV": mat(V.conj().T @ V)})
    # helstrom: trace norm via SVD (independent of the engine's eigh-based traceNorm route)
    rho0, rho1 = rand_density(2), rand_density(2)
    helstrom_cases = []
    for p0 in (0.5, 0.3, 0.7):
        diff = p0 * rho0 - (1 - p0) * rho1
        P = float(0.5 * (1 + np.sum(np.linalg.svd(diff, compute_uv=False))))
        helstrom_cases.append({"rho0": mat(rho0), "rho1": mat(rho1), "p0": p0, "P": P})
    orth = {"rho0": mat(np.outer(KET0, KET0.conj())), "rho1": mat(np.outer(KET1, KET1.conj())), "p0": 0.5, "P": 1.0}
    ident = {"rho0": mat(rho0), "rho1": mat(rho0), "p0": 0.5, "P": 0.5}
    # usd: pairs of non-orthogonal pure states at several overlaps
    usd_cases = []
    for ang in (0.1, 0.3, 0.7, 1.0, 1.4):
        psi0, psi1 = KET0, np.cos(ang) * KET0 + np.sin(ang) * KET1
        helP = float(0.5 * (1 + np.linalg.norm(0.5 * np.outer(psi0, psi0.conj()) - 0.5 * np.outer(psi1, psi1.conj()), ord="nuc")))
        usd_cases.append({"psi0": vec(psi0), "psi1": vec(psi1), "success": float(1 - abs(np.vdot(psi0, psi1))), "helstromP": helP})
    return {"povms": povms, "born": born, "neumark": neumark_cases,
            "helstrom": helstrom_cases, "helstromOrth": orth, "helstromIdentical": ident, "usd": usd_cases}


out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qc.json"
out.parent.mkdir(parents=True, exist_ok=True)
data = {"seed": 709, "cmat": cmat_cases(), "state": state_cases(), "gates": gate_cases(), "circuit": circuit_cases(),
        "measure": measure_cases(), "density": density_cases(), "bits": bits_cases(), "complex": complex_cases(),
        "info": info_cases(), "entangle": entangle_cases(), "teleport": teleport_cases(),
        "channels": channels_cases(), "povm": povm_cases()}
out.write_text(json.dumps(rounded(data), separators=(",", ":"), allow_nan=False))
print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
