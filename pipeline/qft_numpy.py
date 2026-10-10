"""numpy routes for Chapter Q18 (Simon, the quantum Fourier transform, phase estimation, quantum counting, order finding).

Shared by pipeline/make_qft_fixtures.py (engine cross-checks) and pipeline/claims_qc709/q18.py (the claim ledger's numpy twins). It is an
INDEPENDENT route to physics/qc/qft.ts and physics/qc/oracles.ts: every gate is an explicit dense matrix (np.kron and a controlled-gate
builder that walks the basis states), a circuit is a product of those matrices, the Fourier matrix is numpy's own `ifft(..., norm='ortho')`
(N&C's sign +), eigenvalues come from `np.linalg.eigvals`, continued fractions are exact `fractions.Fraction` arithmetic, and counts are by
enumeration. Nothing here imports or retypes the TypeScript engine's formulas.

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the TOP wire = the most significant bit. A register's number is
read with q0 as its first (largest) digit. The eigenphase tau is a FRACTION of a turn (U|u> = e^{2 pi i tau}|u>).
"""
import math
from fractions import Fraction
from functools import reduce
from itertools import combinations, product

import numpy as np

TWO_PI = 2 * math.pi
I2 = np.eye(2, dtype=complex)
H1 = np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2)


def P(angle):
    return np.diag([1, np.exp(1j * angle)]).astype(complex)


S_GATE = P(math.pi / 2)
T_GATE = P(math.pi / 4)


def kron_all(mats):
    return reduce(np.kron, mats)


def op_on(n, gate, t):
    """A one-wire gate on wire t of n wires."""
    mats = [I2] * n
    mats[t] = gate
    return kron_all(mats)


def bits_of(x, n):
    return [(x >> (n - 1 - q)) & 1 for q in range(n)]


def index_of(bits):
    y = 0
    for b in bits:
        y = 2 * y + b
    return y


def ctrl(n, gate, c, targets):
    """Controlled gate: `gate` (a 2^k matrix) on the wires `targets` (in that order), controlled by wire c, built by walking the basis states."""
    N = 2 ** n
    k = len(targets)
    U = np.zeros((N, N), dtype=complex)
    for x in range(N):
        b = bits_of(x, n)
        if b[c] == 0:
            U[x, x] = 1
            continue
        col = index_of([b[t] for t in targets])
        for row in range(2 ** k):
            b2 = list(b)
            for i, t in enumerate(targets):
                b2[t] = (row >> (k - 1 - i)) & 1
            U[index_of(b2), x] += gate[row, col]
    return U


def swap(n, a, b):
    N = 2 ** n
    U = np.zeros((N, N), dtype=complex)
    for x in range(N):
        bits = bits_of(x, n)
        bits[a], bits[b] = bits[b], bits[a]
        U[index_of(bits), x] = 1
    return U


def ket(label):
    """A product ket from a label of 0 1 + - (q0 first)."""
    one = {'0': np.array([1, 0], dtype=complex), '1': np.array([0, 1], dtype=complex),
           '+': np.array([1, 1], dtype=complex) / math.sqrt(2), '-': np.array([1, -1], dtype=complex) / math.sqrt(2)}
    return kron_all([one[ch] for ch in label])


def F(N):
    """N&C Eq. 5.1: (F_N)_{kj} = e^{2 pi i jk/N}/sqrt(N), numpy's ifft with the orthonormal factor."""
    return np.fft.ifft(np.eye(N), axis=0, norm='ortho')


# ------------------------------------------------------------------------------------------------ the QFT circuit
def qft_circuit_matrix(m):
    """Fig. 5.1 of N&C as a product of dense gates: H on a wire, the controlled R_k from every wire below it, wire after wire, then the SWAPs."""
    U = np.eye(2 ** m, dtype=complex)
    for l in range(m):
        U = op_on(m, H1, l) @ U
        for j in range(l + 1, m):
            U = ctrl(m, P(TWO_PI / 2 ** (j - l + 1)), j, [l]) @ U
    for i in range(m // 2):
        U = swap(m, i, m - 1 - i) @ U
    return U


def qft_gate_counts(m):
    """H plus controlled-R gates, and swaps, of the circuit above (counted from its own loops)."""
    gates = 0
    for l in range(m):
        gates += 1 + (m - 1 - l)
    return gates, m // 2


def product_angles_deg(a, m):
    """N&C Eq. 5.4 by the factor of each wire: output wire l (l = 1 top ... m bottom) carries e^{2 pi i a / 2^l}; whole turns drop out."""
    return [((a / 2 ** l) % 1.0) * 360 for l in range(1, m + 1)]


# ------------------------------------------------------------------------------------------------ phase estimation
def pe_state(tau, m, target='1', upto='all'):
    """Dense simulation of the circuit: H on the m control wires, U^(2^j) controlled by wire m-1-j (P gates), then F^dagger on the controls."""
    n = m + 1
    st = ket('0' * m + target)
    for q in range(m):
        st = op_on(n, H1, q) @ st
    for j in range(m):
        st = ctrl(n, P(TWO_PI * tau * 2 ** j), m - 1 - j, [m]) @ st
    if upto == 'kick':
        return st
    return np.kron(F(2 ** m).conj().T, I2) @ st


def pe_reading(tau, m, target='1'):
    st = pe_state(tau, m, target)
    return np.array([sum(abs(st[(x << 1) | t]) ** 2 for t in range(2)) for x in range(2 ** m)])


def pe_sum(tau, m):
    """The chance of each reading from the sum itself: |2^-m sum_y e^{2 pi i (tau - x/2^m) y}|^2."""
    M = 2 ** m
    y = np.arange(M)
    return np.array([abs(np.sum(np.exp(TWO_PI * 1j * (tau - x / M) * y)) / M) ** 2 for x in range(M)])


def pe_far_tail(m, k, grid=4000):
    """max over u = frac(2^m tau) of P(circular |x - u| > k), scanning a grid (that holds u = 1/2)."""
    M = 2 ** m
    xs = np.arange(M)
    worst = 0.0
    for i in range(grid):
        u = i / grid
        p = pe_sum(u / M, m)
        d = np.abs(xs - u)
        d = np.minimum(d, M - d)
        worst = max(worst, float(p[d > k + 1e-12].sum()))
    return worst


# ------------------------------------------------------------------------------------------------ quantum counting
def grover_q(nq, marked):
    N = 2 ** nq
    Hn = kron_all([H1] * nq)
    Uf = np.diag([-1.0 if x in marked else 1.0 for x in range(N)]).astype(complex)
    U0 = np.eye(N, dtype=complex)
    U0[0, 0] = -1
    return -Hn @ U0 @ Hn @ Uf


def counting_reading(marked, m=3, nq=2):
    """Dense simulation: H on every wire, Q^(2^j) controlled by counting wire m-1-j (acting on the search wires), then F^dagger on the counting wires."""
    Q = grover_q(nq, marked)
    total = m + nq
    st = np.zeros(2 ** total, dtype=complex)
    st[0] = 1
    for q in range(total):
        st = op_on(total, H1, q) @ st
    targets = list(range(m, total))
    for j in range(m):
        st = ctrl(total, np.linalg.matrix_power(Q, 2 ** j), m - 1 - j, targets) @ st
    st = np.kron(F(2 ** m).conj().T, np.eye(2 ** nq)) @ st
    return np.array([sum(abs(st[(x << nq) | t]) ** 2 for t in range(2 ** nq)) for x in range(2 ** m)])


# ------------------------------------------------------------------------------------------------ order finding
def multiplicative_order(x, N):
    return next(k for k in range(1, N + 1) if pow(x, k, N) == 1)


def cf_convergent_denominators(p, q):
    """(numerator, denominator) of every convergent of p/q: the quotients of Euclid's algorithm on exact Fractions, then
    p_l = a_l p_(l-1) + p_(l-2), q_l = a_l q_(l-1) + q_(l-2)."""
    x = Fraction(p, q)
    quotients = []
    while True:
        a0 = math.floor(x)
        quotients.append(a0)
        frac = x - a0
        if frac == 0:
            break
        x = 1 / frac
    out = []
    pm2, pm1, qm2, qm1 = 0, 1, 1, 0
    for a0 in quotients:
        pm2, pm1 = pm1, a0 * pm1 + pm2
        qm2, qm1 = qm1, a0 * qm1 + qm2
        out.append((pm1, qm1))
    return out


def order_from_reading(y, t, x, N):
    """The first convergent denominator q < N of y/2^t with x^q = 1 (mod N), or None."""
    for _, q in cf_convergent_denominators(y, 2 ** t):
        if 1 <= q < N and pow(x, q, N) == 1:
            return q
    return None


def comb_mixture_distribution(x, N, t):
    """The reading's chance when phase estimation starts the multiplier U_x in |1>, by the F8 picture: measure the second register
    (the value x^j mod N), leaving a comb of period r on the first, then take the Fourier transform of each comb and mix them by their weights."""
    r = multiplicative_order(x, N)
    M = 2 ** t
    total = np.zeros(M)
    for j0 in range(r):
        teeth = [j for j in range(M) if j % r == j0]
        v = np.zeros(M, dtype=complex)
        v[teeth] = 1
        v /= np.linalg.norm(v)
        total += (len(teeth) / M) * np.abs(F(M) @ v) ** 2
    return total


def shift_matrix(r):
    """U_x on the orbit 1, x, x^2, ... : the cyclic shift k -> k+1."""
    return np.roll(np.eye(r), 1, axis=0)


# ------------------------------------------------------------------------------------------------ Simon
def dot2(a, b):
    return bin(a & b).count('1') % 2


def simon_function(s, n):
    """f(x) = rank of min(x, x^s) among the pairs' minima."""
    reps = [min(x, x ^ s) for x in range(2 ** n)]
    order = sorted(set(reps))
    return [order.index(r) for r in reps]


def simon_state(s, n, upto):
    """Dense simulation of the 2n-1 wire circuit: H on the inputs, U_f (all answer bits at once as a permutation), [measure], H on the inputs.
    upto: 'query' = after U_f, returns the state; the measurement and last H are applied by the caller."""
    f = simon_function(s, n)
    nq = n + (n - 1)
    st = ket('0' * nq)
    for q in range(n):
        st = op_on(nq, H1, q) @ st
    Uf = np.zeros((2 ** nq, 2 ** nq), dtype=complex)
    for x in range(2 ** n):
        for y in range(2 ** (n - 1)):
            Uf[(x << (n - 1)) | (y ^ f[x]), (x << (n - 1)) | y] = 1
    return Uf @ st


def gf2_rank(rows):
    R = [list(r) for r in rows]
    rank = 0
    cols = len(R[0]) if R else 0
    for col in range(cols):
        piv = next((i for i in range(rank, len(R)) if R[i][col]), None)
        if piv is None:
            continue
        R[rank], R[piv] = R[piv], R[rank]
        for i in range(len(R)):
            if i != rank and R[i][col]:
                R[i] = [a ^ b for a, b in zip(R[i], R[rank])]
        rank += 1
    return rank


def gf2_nullspace_members(rows, n):
    """All z of n bits with y.z = 0 for every row y (rows given as numbers)."""
    return [z for z in range(2 ** n) if all(dot2(z, y) == 0 for y in rows)]


def expected_runs_chain(n):
    """Exact Fractions: from rank k the next run is new with probability 1 - 2^(k-(n-1)); expected runs = sum of 1/p."""
    return sum(Fraction(1) / (1 - Fraction(2) ** (k - (n - 1))) for k in range(n - 1))


def runs_suffice_enumerated(s, n):
    perp = [y for y in range(2 ** n) if dot2(y, s) == 0]
    good = 0
    total = 0
    for tup in product(perp, repeat=n - 1):
        rows = [[(y >> (n - 1 - j)) & 1 for j in range(n)] for y in tup]
        good += gf2_rank(rows) == n - 1
        total += 1
    return Fraction(good, total)


def collision_probability(s, n, k):
    N = 2 ** n
    hit = 0
    total = 0
    for subset in combinations(range(N), k):
        total += 1
        sset = set(subset)
        hit += any((a ^ s) in sset for a in subset)
    return Fraction(hit, total)
