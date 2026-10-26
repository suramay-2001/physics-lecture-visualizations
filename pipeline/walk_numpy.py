"""Independent numpy routes for the Chapter Q19 engine (physics/qc/walk.ts, trotter.ts, variational.ts).

Used by pipeline/make_walk_fixtures.py (reference values for the engine's tests) and by pipeline/claims_qc709/q19.py (the chapter's claim twin).
None of the TypeScript formulas is reused: the walk is assembled from directed ARCS and the reflection 2/n J - I (the engine steps vertex by vertex with
r and t), the circuit form is X_dir (|0><0| (x) O + |1><1| (x) D) with dense Kronecker products, the coin walk is evolved in momentum space and
transformed back with np.fft, the spin chain is built from Pauli matrices and exponentiated with scipy.linalg.expm (Pade, not an eigenbasis), Trotter
errors are np.linalg.norm(., 2), and the QAOA is dense matrices. Conventions: q0 = the leftmost tensor factor = top wire = most significant bit; hbar = 1.
"""
import math
from itertools import product

import numpy as np
from scipy.linalg import expm

I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
HAD = np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2)


def kron(*ms):
    out = np.eye(1, dtype=complex)
    for m in ms:
        out = np.kron(out, m)
    return out


def op_on(n, mats):
    """Tensor product with the 2x2 matrices of `mats` ({wire: matrix}) on their wires, identity elsewhere."""
    return kron(*[mats.get(q, I2) for q in range(n)])


# ------------------------------------------------------------------ classical walks
def walk_dist(n):
    """Chances of x = -n, -n+2, ..., n from exact binomials."""
    return [math.comb(n, k) / 2 ** n for k in range(n + 1)]


def walk_sigma(n):
    return math.sqrt(sum((2 * k - n) ** 2 * p for k, p in enumerate(walk_dist(n))))


def path_hitting(N):
    """Mean steps from vertex 0 to vertex N-1 of a path (reflecting at 0): (I - Q) E = 1 on the transient vertices 0..N-2."""
    n = N - 1
    Q = np.zeros((n, n))
    if n > 1:
        Q[0, 1] = 1.0
    for k in range(1, n):
        Q[k, k - 1] = 0.5
        if k + 1 < n:
            Q[k, k + 1] = 0.5
    return float(np.linalg.solve(np.eye(n) - Q, np.ones(n))[0])


def coin_chances(n, K=512):
    """Chances at x = -n..n of the Hadamard-coin walk from (|0> + i|1>)/sqrt2, by evolving each momentum k with U(k) = diag(e^{ik}, e^{-ik}) H and inverse FFT."""
    ks = 2 * math.pi * np.arange(K) / K
    c0 = np.array([1, 1j]) / math.sqrt(2)
    psi = np.zeros((K, 2), dtype=complex)
    for m, k in enumerate(ks):
        U = np.diag([np.exp(1j * k), np.exp(-1j * k)]) @ HAD
        psi[m] = np.linalg.matrix_power(U, n) @ c0
    pos = np.fft.ifft(psi, axis=0)  # pos[x mod K, coin]
    p = (np.abs(pos) ** 2).sum(axis=1)
    return [float(p[x % K]) for x in range(-n, n + 1)]


def coin_sigma(n):
    p = coin_chances(n)
    xs = np.arange(-n, n + 1)
    p = np.array(p)
    return float(math.sqrt((p * xs ** 2).sum() - ((p * xs).sum()) ** 2))


# ------------------------------------------------------------------ the scattering walk on arcs
def star_adjacency(N, extra=None):
    nb = {0: list(range(1, N + 1))}
    for j in range(1, N + 1):
        nb[j] = [0]
    if extra:
        a, b = extra
        nb[a].append(b)
        nb[b].append(a)
    return nb


def arcs_of(N, extra=None):
    """Directed edges in the engine's documented order: 0->j, j->0, then the extra edge's a->b, b->a."""
    arcs = [(0, j) for j in range(1, N + 1)] + [(j, 0) for j in range(1, N + 1)]
    if extra:
        arcs += [(extra[0], extra[1]), (extra[1], extra[0])]
    return arcs


def star_U(N, marked=None, extra=None):
    """The walk step: at each vertex the arriving arcs go to the leaving arcs through G_v = 2 J / n - I (the reflection about the mean of the n edges);
    the marked vertex multiplies its output by -1."""
    nb = star_adjacency(N, extra)
    arcs = arcs_of(N, extra)
    idx = {a: i for i, a in enumerate(arcs)}
    U = np.zeros((len(arcs), len(arcs)))
    for v, nbrs in nb.items():
        n = len(nbrs)
        G = 2.0 * np.ones((n, n)) / n - np.eye(n)
        s = -1.0 if marked == v else 1.0
        for ku, u in enumerate(nbrs):
            for kw, w in enumerate(nbrs):
                U[idx[(v, w)], idx[(u, v)]] += s * G[kw, ku]
    return U


def star_U_circuit(N, marked=1):
    """Route B (N = 2^m): U = X_dir (|0><0| (x) O + |1><1| (x) D), O the sign flip of the marked spoke, D = 2|s><s| - I on the spoke register."""
    s = np.ones(N) / math.sqrt(N)
    O = np.eye(N)
    O[marked - 1, marked - 1] = -1.0
    D = 2 * np.outer(s, s) - np.eye(N)
    P0 = np.diag([1.0, 0.0])
    P1 = np.diag([0.0, 1.0])
    Xr = np.array([[0.0, 1.0], [1.0, 0.0]])
    return np.kron(Xr, np.eye(N)) @ (np.kron(P0, O) + np.kron(P1, D))


def start_vec(N, extra=None, start='out', sign=-1):
    d = 2 * N + (2 if extra else 0)
    v = np.zeros(d)
    if extra:
        v[:N] = 1 / math.sqrt(2 * N)
        v[N:2 * N] = sign / math.sqrt(2 * N)
    elif start == 'out':
        v[:N] = 1 / math.sqrt(N)
    else:
        v[N:2 * N] = 1 / math.sqrt(N)
    return v


def marked_chances(U, N, nmax, v0):
    out = []
    v = v0.copy()
    for _ in range(nmax + 1):
        out.append(float(v[0] ** 2 + v[N] ** 2))
        v = U @ v
    return out


def extra_chances(U, N, nmax, v0):
    near, edge = [], []
    v = v0.copy()
    for _ in range(nmax + 1):
        near.append(float(v[0] ** 2 + v[1] ** 2 + v[N] ** 2 + v[N + 1] ** 2))
        edge.append(float(v[2 * N] ** 2 + v[2 * N + 1] ** 2))
        v = U @ v
    return near, edge


def star_basis(N):
    d = 2 * N
    B = np.zeros((4, d))
    B[0, 0] = 1
    B[1, N] = 1
    B[2, 1:N] = 1 / math.sqrt(N - 1)
    B[3, N + 1:2 * N] = 1 / math.sqrt(N - 1)
    return B


def extra_basis(N):
    d = 2 * N + 2
    B = np.zeros((5, d))
    h = 1 / math.sqrt(2)
    B[0, 0] = B[0, 1] = h
    B[1, N] = B[1, N + 1] = h
    B[2, 2:N] = 1 / math.sqrt(N - 2)
    B[3, N + 2:2 * N] = 1 / math.sqrt(N - 2)
    B[4, 2 * N] = B[4, 2 * N + 1] = h
    return B


def reduced_star_M_formula(N):
    r, t = (N - 2) / N, 2 / N
    q = t * math.sqrt(N - 1)
    return np.array([[0, -r, 0, q], [-1, 0, 0, 0], [0, q, 0, r], [0, 0, 1, 0]])


def reduced_extra_M_formula(N):
    r, t = (N - 2) / N, 2 / N
    q = 2 * math.sqrt(r * t)
    return np.array([[0, -(r - t), 0, q, 0], [0, 0, 0, 0, 1], [0, q, 0, r - t, 0], [0, 0, 1, 0, 0], [1, 0, 0, 0, 0]])


def reduced_chances(M, v0, nmax, pick):
    out = []
    v = np.array(v0, dtype=float)
    for _ in range(nmax + 1):
        out.append(float(sum(v[i] ** 2 for i in pick)))
        v = M @ v
    return out


# ------------------------------------------------------------------ the spin chain
def s_dot_s(n, a, b):
    return sum(op_on(n, {a: P, b: P}) for P in (X, Y, Z)) / 4


def chain_H(N, J=1.0):
    return sum(-J * s_dot_s(N, b, b + 1) for b in range(N - 1))


def bond_gate(N, J, b, tau):
    """exp(-i tau H_b) as a scipy Pade exponential of the two-spin block, placed on wires (b, b+1)."""
    H2 = -J * sum(np.kron(P, P) for P in (X, Y, Z)) / 4
    U2 = expm(-1j * tau * H2)
    return kron(np.eye(2 ** b), U2, np.eye(2 ** (N - b - 2)))


def trotter(N, J, t, M, order):
    tau = t / M
    if order == 1:
        P = np.eye(2 ** N, dtype=complex)
        for b in range(N - 1):
            P = bond_gate(N, J, b, tau) @ P
    else:
        seq = [(b, tau / 2) for b in range(N - 2)] + [(N - 2, tau)] + [(b, tau / 2) for b in range(N - 3, -1, -1)]
        P = np.eye(2 ** N, dtype=complex)
        for b, s in seq:
            P = bond_gate(N, J, b, s) @ P
    return np.linalg.matrix_power(P, M)


def spec_norm(A):
    return float(np.linalg.norm(A, 2))


# ------------------------------------------------------------------ QAOA
def cut_table(n, edges):
    return np.array([sum(1 for a, b in edges if bits[a] != bits[b]) for bits in product((0, 1), repeat=n)], dtype=float)


def qaoa_psi(n, edges, g, b):
    cut = cut_table(n, edges)
    psi = np.exp(-1j * g * cut) * np.ones(2 ** n) / math.sqrt(2 ** n)
    UB = kron(*[expm(-1j * b * X)] * n)
    return UB @ psi


def qaoa_F(n, edges, g, b):
    return float((np.abs(qaoa_psi(n, edges, g, b)) ** 2 * cut_table(n, edges)).sum())


def cnot(n, c, t):
    M = np.zeros((2 ** n, 2 ** n))
    for x in range(2 ** n):
        bits = [(x >> (n - 1 - q)) & 1 for q in range(n)]
        if bits[c]:
            bits[t] ^= 1
        y = sum(v << (n - 1 - q) for q, v in enumerate(bits))
        M[y, x] = 1
    return M


def qaoa_circuit_psi(n, edges, g, b):
    """H's, then per edge CNOT - P(-g) on the target - CNOT (the phase e^{-ig} when the ends differ), then Rx(2b) = exp(-i b X)."""
    psi = np.zeros(2 ** n, dtype=complex)
    psi[0] = 1
    psi = kron(*[HAD] * n) @ psi
    for a, c in edges:
        psi = cnot(n, a, c) @ psi
        psi = op_on(n, {c: np.diag([1, np.exp(-1j * g)])}) @ psi
        psi = cnot(n, a, c) @ psi
    th = 2 * b
    Rx = np.array([[math.cos(th / 2), -1j * math.sin(th / 2)], [-1j * math.sin(th / 2), math.cos(th / 2)]])
    return kron(*[Rx] * n) @ psi


def pattern_search(f, g, b, step, tol):
    cur = f(g, b)
    path = [(g, b, cur)]
    evals = 1
    while step >= tol:
        cands = [(g + step, b), (g - step, b), (g, b + step), (g, b - step)]
        vals = [f(*p) for p in cands]
        evals += 4
        k = int(np.argmax(vals))  # first maximum wins
        if vals[k] > cur + 1e-12:
            g, b = cands[k]
            cur = vals[k]
            path.append((g, b, cur))
        else:
            step /= 2
    return path, evals
