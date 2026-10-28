#!/usr/bin/env python3
"""Independent numpy / scipy / sympy routes for the Chapter Q26 engine (app/src/physics/qc/photons.ts; Bergou Chapter 14).

Nothing here imports or mirrors the TypeScript. The routes differ from the engine's on purpose:
- many-photon amplitudes: the exponential of the mode generator on a truncated Fock space, U = expm(sum_ij a_i^dagger [log S]_ij a_j), so that U a_j^dagger U^-1 = sum_k S_kj a_k^dagger
  (the engine uses permanents; here permanents are only a cross-check, by itertools);
- the nonlinear sign gate: sympy polynomial expansion of the operator substitution, and scipy fsolve on the two printed conditions (the engine solves 7x^2 - 6x + 1 = 0);
- the photonic CZ: the same expm route on four modes with the sign gate as a diagonal operator;
- gate teleportation: a six-index tensor, gates applied by tensordot and controlled slices, readings by slicing (the engine runs its circuit simulator);
- the Bell analyser: explicit patterns of the four Bell states through the expm of the mode generator on four modes;
- Jaynes-Cummings levels by numpy eigvalsh, coherent states by math.factorial series.

Units and conventions: S = [[t', r], [r', t]] (rows = exits, columns = entrances); Fock |n0 n1 ...> has n_j photons in mode j; hbar = 1; angles in degrees in names and arguments.
"""
import itertools
import math

import numpy as np
import sympy as sp
from scipy.linalg import expm, logm, null_space
from scipy.optimize import fsolve

DEG = math.pi / 180
S2 = 1 / math.sqrt(2)
I2 = np.eye(2, dtype=complex)


# ---------------------------------------------------------------- one-qubit pieces
def wave_unitary(theta, phi):
    t, p = theta * DEG, phi * DEG
    return np.array([[math.cos(t), 1j * np.exp(-1j * p) * math.sin(t)], [1j * np.exp(1j * p) * math.sin(t), math.cos(t)]], dtype=complex)


def dual_rail_ket(theta, phi):
    t, p = theta * DEG, phi * DEG
    return np.array([math.cos(t), np.exp(1j * p) * math.sin(t)], dtype=complex)


def bloch_polar(psi):
    """Polar angle in degrees from the state's own Bloch vector (expectation of the Pauli matrices)."""
    sx = np.array([[0, 1], [1, 0]], dtype=complex)
    sy = np.array([[0, -1j], [1j, 0]], dtype=complex)
    sz = np.array([[1, 0], [0, -1]], dtype=complex)
    v = [float(np.real(np.conj(psi) @ s @ psi)) for s in (sx, sy, sz)]
    return math.degrees(math.atan2(math.hypot(v[0], v[1]), v[2]))


def rel_phase(psi):
    return math.degrees(float(np.angle(psi[1] / psi[0])))


# ---------------------------------------------------------------- splitters
def bs_real(R):
    t, r = math.sqrt(1 - R), math.sqrt(R)
    return np.array([[t, r], [-r, t]], dtype=complex)


def bs_sym():
    return S2 * np.array([[1, 1j], [1j, 1]], dtype=complex)


def bs_q5():
    return S2 * np.array([[1, -1], [1, 1]], dtype=complex)


def stokes(S):
    """The six relations as residuals: |r|^2+|t|^2-1, |r'|^2+|t'|^2-1, |r|^2+|t'|^2-1, |r'|^2+|t|^2-1, |r t'* + r'* t|, |r t* + r'* t'|."""
    tp, r, rp, t = S[0, 0], S[0, 1], S[1, 0], S[1, 1]
    return [abs(abs(r) ** 2 + abs(t) ** 2 - 1), abs(abs(rp) ** 2 + abs(tp) ** 2 - 1), abs(abs(r) ** 2 + abs(tp) ** 2 - 1), abs(abs(rp) ** 2 + abs(t) ** 2 - 1),
            abs(r * np.conj(tp) + np.conj(rp) * t), abs(r * np.conj(t) + np.conj(rp) * tp)]


def haar(d, rng):
    """QR of a complex Gaussian with the diagonal of R made positive: a Haar unitary."""
    z = (rng.standard_normal((d, d)) + 1j * rng.standard_normal((d, d))) / math.sqrt(2)
    q, r = np.linalg.qr(z)
    ph = np.diag(r) / np.abs(np.diag(r))
    return q * ph


def balanced(rng):
    a, b = S2 * np.exp(2j * math.pi * rng.random()), S2 * np.exp(2j * math.pi * rng.random())
    e = np.exp(2j * math.pi * rng.random())
    return np.array([[a, b], [-e * np.conj(b), e * np.conj(a)]], dtype=complex)


# ---------------------------------------------------------------- Fock machinery: permanents and the mode-generator exponential
def perm(A):
    n = len(A)
    if n == 0:
        return 1.0 + 0j
    return sum(np.prod([A[i][p[i]] for i in range(n)]) for p in itertools.permutations(range(n)))


def amp_perm(M, nin, nout):
    M = np.asarray(M, dtype=complex)
    rows = [j for j, n in enumerate(nout) for _ in range(n)]
    cols = [k for k, n in enumerate(nin) for _ in range(n)]
    A = [[M[j][k] for k in cols] for j in rows]
    norm = math.sqrt(np.prod([math.factorial(n) for n in nin]) * np.prod([math.factorial(n) for n in nout]))
    return perm(A) / norm


def _lowering(nmax):
    a = np.zeros((nmax + 1, nmax + 1))
    for n in range(1, nmax + 1):
        a[n - 1, n] = math.sqrt(n)
    return a


def fock_ops(modes, nmax):
    """Annihilation operators of `modes` modes truncated at nmax photons each (dimension (nmax+1)^modes)."""
    a1 = _lowering(nmax)
    eye = np.eye(nmax + 1)
    ops = []
    for j in range(modes):
        m = np.array([[1.0]])
        for k in range(modes):
            m = np.kron(m, a1 if k == j else eye)
        ops.append(m)
    return ops


def completed_unitary(M):
    """A square unitary whose first columns are those of M (rows = exits, columns = entrances); a rectangular M is an isometry."""
    M = np.asarray(M, dtype=complex)
    rows, cols = M.shape
    if rows == cols:
        return M
    extra = null_space(M.conj().T)
    return np.hstack([M, extra[:, : rows - cols]])


_CACHE = {}


def mode_unitary(M, nmax, total_modes=None, acting=None):
    """U = expm(sum_ij a_i^dagger G_ij a_j), G = logm(M) on the modes `acting` of `total_modes` (identity elsewhere)."""
    M = completed_unitary(M)
    key = (np.asarray(M).tobytes(), nmax, total_modes, tuple(acting) if acting is not None else None)
    if key in _CACHE:
        return _CACHE[key]
    U = _mode_unitary(M, nmax, total_modes, acting)
    _CACHE[key] = U
    return U


def _mode_unitary(M, nmax, total_modes, acting):
    k = M.shape[0]
    total_modes = total_modes or k
    acting = acting if acting is not None else list(range(k))
    ops = fock_ops(total_modes, nmax)
    G = logm(M)
    H = sum(G[i, j] * ops[acting[i]].T @ ops[acting[j]] for i in range(k) for j in range(k))
    return expm(H)


def fock_index(occ, nmax):
    idx = 0
    for n in occ:
        idx = idx * (nmax + 1) + n
    return idx


def amp_expm(M, nin, nout):
    """<nout|U|nin> by the matrix exponential of the mode generator on a Fock space truncated at the total photon number."""
    N = sum(nin)
    M = np.asarray(M, dtype=complex)
    k = max(M.shape)
    nin = list(nin) + [0] * (k - len(nin))
    nout = list(nout) + [0] * (k - len(nout))
    U = mode_unitary(M, max(N, 1))
    return U[fock_index(nout, max(N, 1)), fock_index(nin, max(N, 1))]


def block(S, n, via='expm'):
    f = amp_expm if via == 'expm' else amp_perm
    return np.array([[f(S, [n - b, b], [n - a, a]) for b in range(n + 1)] for a in range(n + 1)])


def two_photon(S, via='expm'):
    B = block(S, 2, via)
    return B[0][1], B[1][1], B[2][1]


def hom_dip(R):
    return abs(two_photon(bs_real(R))[1]) ** 2


def distinguishable(S):
    return abs(S[0, 0]) ** 2 * abs(S[1, 1]) ** 2 + abs(S[0, 1]) ** 2 * abs(S[1, 0]) ** 2


# ---------------------------------------------------------------- the nonlinear sign gate
def ns_matrix(theta, phi):
    ct, st, cp, sp_ = math.cos(theta * DEG), math.sin(theta * DEG), math.cos(phi * DEG), math.sin(phi * DEG)
    return np.array([[ct * cp, -sp_], [st, 0.0], [ct * sp_, cp]], dtype=complex)


def ns_amps_expm(theta, phi, nmax):
    M = ns_matrix(theta, phi)
    return [float(np.real(amp_expm(M, [n, 1], [n, 0, 1]))) for n in range(nmax + 1)]


def ns_amps_sympy(theta, phi, nmax):
    """Operator substitution by sympy polynomials: the state (s^n / sqrt n!) b |0> with s -> cos(th)(cos(ph) o + sin(ph) d1) + sin(th) d0 and b -> -sin(ph) o + cos(ph) d1; the coefficient of o^n d1 times sqrt(n!)."""
    o, d0, d1 = sp.symbols('o d0 d1')
    ct, st, cp, sq = (sp.Float(math.cos(theta * DEG), 30), sp.Float(math.sin(theta * DEG), 30), sp.Float(math.cos(phi * DEG), 30), sp.Float(math.sin(phi * DEG), 30))
    s_new = ct * (cp * o + sq * d1) + st * d0
    b_new = -sq * o + cp * d1
    out = []
    for n in range(nmax + 1):
        poly = sp.Poly(sp.expand(s_new**n * b_new / sp.sqrt(sp.factorial(n))), o, d0, d1)
        coeff = poly.coeff_monomial(o**n * d1)
        out.append(float(coeff * sp.sqrt(sp.factorial(n))))
    return out


def ns_conditions(v):
    th, ph = v
    A = ns_amps_closed(th, ph, 2)
    return [A[1] / A[0] - 1.0, A[2] / A[0] + 1.0]


def ns_amps_closed(theta, phi, nmax):
    ct, cp, sq = math.cos(theta * DEG), math.cos(phi * DEG), math.sin(phi * DEG)
    return [ct**n * cp ** (n - 1) * (cp * cp - n * sq * sq) for n in range(nmax + 1)]


def ns_solve():
    """fsolve on the two printed conditions from two starting points (one converges to the good root, the quadratic's other root has cos theta > 1)."""
    sol = fsolve(ns_conditions, [150.0, 61.0], xtol=1e-14)
    th, ph = float(sol[0]), float(sol[1])
    x = math.cos(ph * DEG) ** 2
    # the other root of 7x^2 - 6x + 1 by sympy
    xs = sp.symbols('x')
    roots = sorted(float(r) for r in sp.solve(7 * xs**2 - 6 * xs + 1, xs))
    other = [r for r in roots if abs(r - x) > 1e-6][0]
    other_cos = math.sqrt(other) / (2 * other - 1)
    return th, ph, x, other_cos, other


# ---------------------------------------------------------------- the photonic CZ on four modes (expm of the mode generator, the sign gate a diagonal operator)
def cz_dual_rail(with_ns):
    nmax = 2
    dim = (nmax + 1) ** 4
    S = bs_sym()
    US = mode_unitary(S, nmax, 4, [1, 2])
    # the crossing is the permutation of modes 1 and 2: built on occupations, not by a logarithm (log of a swap is singular-prone)
    perm_op = np.zeros((dim, dim))
    for occ in itertools.product(range(nmax + 1), repeat=4):
        o2 = (occ[0], occ[2], occ[1], occ[3])
        perm_op[fock_index(o2, nmax), fock_index(occ, nmax)] = 1.0
    ns_diag = np.eye(dim)
    if with_ns:
        for occ in itertools.product(range(nmax + 1), repeat=4):
            sign = 1.0
            for m in (1, 2):
                if occ[m] == 2:
                    sign = -sign
            ns_diag[fock_index(occ, nmax), fock_index(occ, nmax)] = sign
    U = US @ perm_op @ ns_diag @ US
    out = np.zeros((4, 4), dtype=complex)
    leak = 0.0
    for q in range(4):
        occ = [0, 0, 0, 0]
        occ[q >> 1] = 1
        occ[2 + (q & 1)] = 1
        col = U[:, fock_index(occ, nmax)]
        inside = 0.0
        for p in range(4):
            oo = [0, 0, 0, 0]
            oo[p >> 1] = 1
            oo[2 + (p & 1)] = 1
            out[p, q] = col[fock_index(oo, nmax)]
            inside += abs(out[p, q]) ** 2
        leak = max(leak, abs(float(np.vdot(col, col).real) - inside))
    return out, leak


# ---------------------------------------------------------------- gate teleportation by a six-index tensor
H1 = S2 * np.array([[1, 1], [1, -1]], dtype=complex)
PAULIS = [np.eye(2, dtype=complex), np.array([[0, 1], [1, 0]], dtype=complex), np.array([[0, -1j], [1j, 0]], dtype=complex), np.array([[1, 0], [0, -1]], dtype=complex)]
XM = PAULIS[1]


def _one(psi, U, q):
    return np.moveaxis(np.tensordot(U, psi, axes=([1], [q])), 0, q)


def _ctrl(psi, U, c, t):
    out = psi.copy()
    idx = [slice(None)] * psi.ndim
    idx[c] = 1
    sub = psi[tuple(idx)]
    tt = t - 1 if t > c else t
    out[tuple(idx)] = np.moveaxis(np.tensordot(U, sub, axes=([1], [tt])), 0, tt)
    return out


def resource_state():
    psi = np.zeros((2,) * 4, dtype=complex)
    psi[0, 0, 0, 0] = 1
    psi = _one(psi, H1, 0)
    psi = _one(psi, H1, 2)
    psi = _ctrl(psi, XM, 0, 1)
    psi = _ctrl(psi, XM, 2, 3)
    psi = _ctrl(psi, XM, 0, 3)
    return psi.reshape(16)


def resource_printed():
    v = np.zeros(16, dtype=complex)
    for s in ('0000', '0011', '1110', '1101'):
        v[int(s, 2)] = 0.5
    return v


def teleport_run(cket, tket, outcome):
    """Wires c, t, r0, r1, r2, r3 as axes 0..5. Readings c, r0, t, r2. Returns (chance, 4-vector on (r1, r3), best Pauli overlap with CNOT|c,t>)."""
    psi = np.einsum('a,b,cdef->abcdef', np.asarray(cket, dtype=complex), np.asarray(tket, dtype=complex), resource_state().reshape(2, 2, 2, 2))
    psi = _ctrl(psi, XM, 0, 2)
    psi = _ctrl(psi, XM, 1, 4)
    psi = _one(psi, H1, 0)
    psi = _one(psi, H1, 1)
    o = [int(ch) for ch in outcome]
    sub = psi[o[0], o[2], o[1], :, o[3], :]  # c, t, r0, r1, r2, r3 -> (r1, r3)
    chance = float(np.sum(np.abs(sub) ** 2))
    out = (sub / math.sqrt(chance)).reshape(4)
    cnot = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], dtype=complex)
    target = cnot @ np.kron(np.asarray(cket, dtype=complex), np.asarray(tket, dtype=complex))
    best = max(abs(np.vdot(target, np.kron(P1, P2) @ out)) for P1 in PAULIS for P2 in PAULIS)
    return chance, out, best


def haar_ket(rng):
    th = math.acos(1 - 2 * rng.random())
    return np.array([math.cos(th / 2), np.exp(2j * math.pi * rng.random()) * math.sin(th / 2)], dtype=complex)


def teleport_sweep(count=6, seed=26):
    rng = np.random.default_rng(seed)
    gap, lo, hi = 0.0, 1.0, 0.0
    for _ in range(count):
        ck, tk = haar_ket(rng), haar_ket(rng)
        for m in range(16):
            chance, _, best = teleport_run(ck, tk, format(m, '04b'))
            gap = max(gap, 1 - best)
            lo, hi = min(lo, chance), max(hi, chance)
    return gap, lo, hi


# ---------------------------------------------------------------- KLM and the Bell analyser
def klm(n):
    return (n / (n + 1)) ** 2


def klm_least(F):
    """The least whole n with (n/(n+1))^2 >= F, by search."""
    n = 1
    while klm(n) < F:
        n += 1
    return n


def bell_analyzer():
    S = bs_sym()
    M = np.kron(S, I2)  # modes: (port a/b) x (H/V)
    nmax = 2
    ops = fock_ops(4, nmax)
    G = logm(M)
    H = sum(G[i, j] * ops[i].T @ ops[j] for i in range(4) for j in range(4))
    U = expm(H)

    def occ_vec(occ):
        v = np.zeros((nmax + 1) ** 4, dtype=complex)
        v[fock_index(occ, nmax)] = 1
        return v

    states = {
        'Phi+': S2 * (occ_vec([1, 0, 1, 0]) + occ_vec([0, 1, 0, 1])),
        'Phi-': S2 * (occ_vec([1, 0, 1, 0]) - occ_vec([0, 1, 0, 1])),
        'Psi+': S2 * (occ_vec([1, 0, 0, 1]) + occ_vec([0, 1, 1, 0])),
        'Psi-': S2 * (occ_vec([1, 0, 0, 1]) - occ_vec([0, 1, 1, 0])),
    }
    dists = {k: np.abs(U @ v) ** 2 for k, v in states.items()}
    total = 0.0
    for k, d in dists.items():
        others = [dists[j] for j in dists if j != k]
        for idx in np.nonzero(d > 1e-12)[0]:
            if all(o[idx] < 1e-12 for o in others):
                total += d[idx]
    return total / 4


# ---------------------------------------------------------------- Kerr, Jaynes-Cummings, coherent states
def kerr(phi):
    return np.diag([1, 1, 1, np.exp(1j * phi)]).astype(complex)


def jc_levels(n, delta, om0):
    w = om0 * math.sqrt(n + 1)
    return np.linalg.eigvalsh(np.array([[delta / 2, w / 2], [w / 2, -delta / 2]]))


def jc_shift(n, delta, om0):
    return float(jc_levels(n, delta, om0)[0] - jc_levels(0, delta, om0)[0])


def jc_chi(delta, om0):
    return om0**2 / (4 * abs(delta))


def coherent(alpha, N):
    return np.array([math.exp(-alpha * alpha / 2) * alpha**n / math.sqrt(math.factorial(n)) for n in range(N + 1)])


def cat(alpha, parity, N):
    a = coherent(alpha, N)
    b = np.array([(-1.0) ** n for n in range(N + 1)])
    v = a * (1 + parity * b)
    return v / np.linalg.norm(v)
