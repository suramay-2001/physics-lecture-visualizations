#!/usr/bin/env python3
"""Independent numpy routes for the Chapter Q20 engine (app/src/physics/qc/machines.ts): quantum cloners, the U-NOT, programmable processors, the programmable discriminator.

The TypeScript engine builds the cloner from `embed`/`controlled` operators, takes partial traces with coefficient matrices, averages over the sphere with its own Gauss-Legendre
nodes (48 x 48), finds the U-NOT limit and the discriminator optimum by bisection on a smallest eigenvalue, and builds the antisymmetric projector as (I - SWAP)/2. This module
uses none of that: CNOTs from bit manipulation of the index, partial traces by reshaping, `numpy.polynomial.legendre.leggauss` (60 x 60) for the sphere, `scipy.optimize.brentq`
for the U-NOT limit, a grid for the discriminator optimum, and the antisymmetric projector as the outer product of the explicit singlet. Agreement is evidence, not the same
code checking itself. Used by pipeline/make_machines_fixtures.py (engine tables) and pipeline/claims_qc709/q20.py (the chapter's numbers).

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the TOP wire = the most significant bit; hbar = 1. Angles in functions are DEGREES unless the name says rad.
"""
import math

import numpy as np
from numpy.linalg import eigvalsh, norm
from scipy import optimize

I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]])
Z = np.diag([1, -1]).astype(complex)
K0 = np.array([1, 0], dtype=complex)
K1 = np.array([0, 1], dtype=complex)
S2 = 1 / math.sqrt(2)
S3 = math.sqrt(3)


def kv(*vs):
    r = np.array([1], dtype=complex)
    for v in vs:
        r = np.kron(r, v)
    return r


def dm(v):
    v = np.asarray(v).reshape(-1, 1)
    return v @ v.conj().T


def ket_bloch(th, ph):
    t, p = math.radians(th), math.radians(ph)
    return np.array([math.cos(t / 2), np.exp(1j * p) * math.sin(t / 2)])


def perp(v):
    return np.array([-np.conj(v[1]), np.conj(v[0])])


def bvec(rho):
    return np.real([np.trace(rho @ P) for P in (X, Y, Z)])


def fc(rho, psi):
    return float(np.real(np.vdot(psi, rho @ psi)))


def cnot(c, t, n):
    d = 2 ** n
    M = np.zeros((d, d), dtype=complex)
    for i in range(d):
        bits = [(i >> (n - 1 - q)) & 1 for q in range(n)]
        if bits[c]:
            bits[t] ^= 1
        j = sum(b << (n - 1 - q) for q, b in enumerate(bits))
        M[j, i] = 1
    return M


def toffoli(c1, c2, t, n):
    d = 2 ** n
    M = np.zeros((d, d), dtype=complex)
    for i in range(d):
        bits = [(i >> (n - 1 - q)) & 1 for q in range(n)]
        if bits[c1] and bits[c2]:
            bits[t] ^= 1
        j = sum(b << (n - 1 - q) for q, b in enumerate(bits))
        M[j, i] = 1
    return M


def ptrace(rho, keep, n):
    """Reduced density matrix of the listed qubits, in the listed order (tensor reshape and traces)."""
    T = rho.reshape([2] * (2 * n))
    cur = n
    for q in sorted([q for q in range(n) if q not in keep], reverse=True):
        T = np.trace(T, axis1=q, axis2=q + cur)
        cur -= 1
    rem = sorted(keep)
    perm = [rem.index(q) for q in keep]
    k = len(keep)
    T = T.transpose(perm + [p + k for p in perm])
    return T.reshape(2 ** k, 2 ** k)


# ---------------------------------------------------------------------------------------------------- the cloner (Eqs. 8.1-8.8)
XI00 = (kv(K0, K0) + kv(K1, K1)) * S2
XI0X = kv(K0, (K0 + K1) * S2)
PHI_P = (kv(K0, K0) + kv(K1, K1)) * S2
PHI_M = (kv(K0, K0) - kv(K1, K1)) * S2
PSI_P = (kv(K0, K1) + kv(K1, K0)) * S2
PSI_M = (kv(K0, K1) - kv(K1, K0)) * S2
BELLS = {'Phi+': PHI_P, 'Phi-': PHI_M, 'Psi+': PSI_P, 'Psi-': PSI_M}
BELL_PAULI = {'Phi+': I2, 'Phi-': Z, 'Psi+': X, 'Psi-': -1j * Y}
U4 = cnot(2, 0, 3) @ cnot(1, 0, 3) @ cnot(0, 2, 3) @ cnot(0, 1, 3)
PSI_RUN = ket_bloch(60, 90)


def program(u_deg):
    u = math.radians(u_deg)
    c0 = math.cos(u) - math.sin(u) / S3
    c1 = 2 * math.sin(u) / S3
    return c0, c1, c0 * XI00 + c1 * XI0X


def outputs(psi, xi):
    st = U4 @ kv(psi, xi)
    r = dm(st)
    return [ptrace(r, [k], 3) for k in range(3)]


def fidelities(u_deg, th=60, ph=90):
    psi = ket_bloch(th, ph)
    o = outputs(psi, program(u_deg)[2])
    return fc(o[0], psi), fc(o[1], psi)


def formula_gaps(u_deg, th=60, ph=90):
    c0, c1, xi = program(u_deg)
    psi = ket_bloch(th, ph)
    pp = dm(psi)
    o = outputs(psi, xi)
    f1 = (c0 ** 2 + c0 * c1) * pp + c1 ** 2 / 2 * I2
    f2 = (c1 ** 2 + c0 * c1) * pp + c0 ** 2 / 2 * I2
    f3 = c0 * c1 * dm(np.conj(psi)) + 0.5 * (1 - c0 * c1) * I2
    a = c0 * (U4 @ kv(psi, XI00))
    b = c1 * (U4 @ kv(psi, XI0X))
    cross = ptrace(dm(a + b) - dm(a) - dm(b), [0], 3)  # the cross terms |a><b| + |b><a|
    return (float(np.abs(o[0] - f1).max()), float(np.abs(o[1] - f2).max()), float(np.abs(o[2] - f3).max()), float(np.abs(cross - c0 * c1 * pp).max()))


def universal_spread(u_deg, n, seed):
    rng = np.random.default_rng(seed)
    xi = program(u_deg)[2]
    fs = []
    for _ in range(n):
        v = rng.normal(size=2) + 1j * rng.normal(size=2)
        v /= norm(v)
        fs.append(fc(outputs(v, xi)[0], v))
    return max(fs) - min(fs)


def pair_overlap(u_deg, psi):
    xi = program(u_deg)[2]
    r12 = ptrace(dm(U4 @ kv(psi, xi)), [0, 1], 3)
    pp = kv(psi, psi)
    return float(np.real(np.vdot(pp, r12 @ pp)))


def max_c0c1():
    us = np.linspace(0, 60, 6001)
    vals = [program(u)[0] * program(u)[1] for u in us]
    k = int(np.argmax(vals))
    return float(vals[k]), float(us[k])


# ---------------------------------------------------------------------------------------------------- the U-NOT (Eqs. 8.6-8.12)
U0 = -1j * Y


def choi(lam):
    J = np.zeros((4, 4), dtype=complex)
    for i in range(2):
        for j in range(2):
            E = np.zeros((2, 2), dtype=complex)
            E[i, j] = 1
            J += np.kron(lam(E), E)
    return J


def unot_ideal(r):
    return np.trace(r) * I2 - r


def unot_shrunk(p):
    return lambda r: p * unot_ideal(r) + (1 - p) * np.trace(r) * I2 / 2


def choi_spectrum(lam):
    return np.sort(eigvalsh(choi(lam) / 2))


def unot_limit():
    return optimize.brentq(lambda p: choi_spectrum(unot_shrunk(p))[0], 0.05, 0.9, xtol=1e-15, rtol=1e-15)


def sphere_avg(f, n=60):
    xs, ws = np.polynomial.legendre.leggauss(n)
    tot = 0
    for x, w in zip(xs, ws):
        th = math.acos(x)
        for j in range(n):
            ph = 2 * math.pi * j / n
            eta = np.array([math.cos(th / 2), np.exp(1j * ph) * math.sin(th / 2)])
            tot = tot + (w / 2 / n) * f(eta)
    return tot


def mp_unot(psi):
    def f(eta):
        x = abs(np.vdot(eta, psi)) ** 2
        return x * dm(perp(eta)) + (1 - x) * dm(eta)

    return sphere_avg(f)


def mp_clone(psi):
    def f(eta):
        x = abs(np.vdot(eta, psi)) ** 2
        ep = perp(eta)
        return x * dm(kv(eta, eta)) + (1 - x) * dm(kv(ep, ep))

    r12 = sphere_avg(f)
    pp = kv(psi, psi)
    return fc(ptrace(r12, [0], 2), psi), float(np.real(np.vdot(pp, r12 @ pp)))


# ---------------------------------------------------------------------------------------------------- the no-go (Eqs. 8.13-8.19)
def expectation(U1, U2, psi):
    return np.vdot(psi, U2.conj().T @ U1 @ psi)


def spread(U1, U2, n_theta=37):
    vals = [expectation(U1, U2, ket_bloch(180 * i / (n_theta - 1), ph)) for i in range(n_theta) for ph in (0, 90, 180, 270)]
    return max(abs(a - b) for a in vals for b in vals)


def distinct_ops(ms):
    reps = []
    for m in ms:
        if not any(abs(abs(np.trace(r.conj().T @ m)) / m.shape[0] - 1) < 1e-9 for r in reps):
            reps.append(m)
    return len(reps)


def processor_gap(U1, U2, psi):
    P0 = np.diag([1, 0]).astype(complex)
    P1 = np.diag([0, 1]).astype(complex)
    G = np.kron(U1, P0) + np.kron(U2, P1)
    o1 = G @ kv(psi, K0)
    o2 = G @ kv(psi, K1)
    lhs = np.vdot(K1, K0)  # <Pi2|Pi1> with Pi1 = |0>, Pi2 = |1>
    rhs = expectation(U1, U2, psi) * np.vdot(K1, K0)
    return max(abs(lhs - rhs), abs(lhs - np.vdot(o2, o1)))


# ---------------------------------------------------------------------------------------------------- probabilistic processors (Eqs. 8.20-8.30)
def xi_prog(a_deg):
    a = math.radians(a_deg)
    return np.array([np.exp(1j * a), np.exp(-1j * a)]) * S2


def u_alpha(a_deg):
    a = math.radians(a_deg)
    return np.diag([np.exp(1j * a), np.exp(-1j * a)])


def cnot_proc(a_deg, psi):
    T = (cnot(0, 1, 2) @ kv(psi, xi_prog(a_deg))).reshape(2, 2)  # [data, program]
    p0, p1 = norm(T[:, 0]) ** 2, norm(T[:, 1]) ** 2
    return p0, p1, T[:, 0] / norm(T[:, 0]), T[:, 1] / norm(T[:, 1])


def ray_gap(a, b):
    return 1 - abs(np.vdot(a / norm(a), b / norm(b)))


def rus_success(k, a_deg=30, psi=None):
    data = ket_bloch(90, 0) if psi is None else psi
    remain, total = 1.0, 0.0
    for j in range(1, k + 1):
        p0, p1, _, fail = cnot_proc(2 ** (j - 1) * a_deg, data)
        total += remain * p0
        remain *= p1
        data = fail
    return total


def rus_circuit_chance(a_deg):
    """Two rounds as a coherent circuit: H, P(-2a) / P(-4a), CNOT 0->1, Toffoli 0,1->2; the chance of readings p1 = 0, or p1 = 1 and p2 = 0."""
    a = math.radians(a_deg)
    Ry90 = np.array([[math.cos(math.pi / 4), -math.sin(math.pi / 4)], [math.sin(math.pi / 4), math.cos(math.pi / 4)]], dtype=complex)
    Hm = np.array([[1, 1], [1, -1]], dtype=complex) * S2
    Pm = lambda ph: np.diag([1, np.exp(1j * ph)])
    st = kv(Ry90 @ K0, Hm @ K0, Hm @ K0)
    st = np.kron(np.eye(2), np.kron(Pm(-2 * a), Pm(-4 * a))) @ st
    st = toffoli(0, 1, 2, 3) @ cnot(0, 1, 3) @ st
    p = np.abs(st) ** 2  # index = d p1 p2
    return float(sum(p[i] for i in (0, 1, 4, 5, 2, 6)))


def toffoli_proc(a_deg, psi):
    st = toffoli(0, 1, 2, 3) @ cnot(0, 1, 3) @ kv(psi, xi_prog(a_deg), xi_prog(2 * a_deg))
    T = st.reshape(2, 4)  # [data, readings 00,01,10,11]
    pr = [float(norm(T[:, m]) ** 2) for m in range(4)]
    return pr, [T[:, m] / norm(T[:, m]) for m in range(4)]


# ---------------------------------------------------------------------------------------------------- Bell programs (Eqs. 8.22-8.28)
def flip_prog(th, ph):
    mu, nu = ket_bloch(th, ph)
    cx = -(mu * np.conj(nu) + np.conj(mu) * nu)
    cy = mu * np.conj(nu) - np.conj(mu) * nu
    cz = abs(nu) ** 2 - abs(mu) ** 2
    xi = cx * PSI_P + cy * PSI_M + cz * PHI_M
    U = I2 - 2 * dm(np.array([mu, nu]))
    return (cx, cy, cz), xi, U


def flip_formula_gap(th, ph):
    (cx, cy, cz), _, U = flip_prog(th, ph)
    return float(np.abs(cx * X + cy * (-1j * Y) + cz * Z - U).max())


def flip_run(psi, th, ph):
    M = (PSI_P + PSI_M + PHI_M) * S3 / 3
    _, xi, _ = flip_prog(th, ph)
    T = (U4 @ kv(psi, xi)).reshape(2, 4)
    amp = T @ M.conj()
    return float(norm(amp) ** 2), amp / norm(amp)


def uin_matrix():
    U = np.zeros((4, 4), dtype=complex)
    U[2, 0] = -1  # |00> -> -|10>
    U[3, 2] = -1  # |10> -> -|11>
    U[0, 1] = 1  # |01> -> |00>
    U[1, 3] = 1  # |11> -> |01>
    return U


def uin_program(th, ph):
    phi = ket_bloch(th, ph)
    pp = perp(phi)
    return uin_matrix() @ ((kv(phi, pp) + kv(pp, phi)) * S2)


# ---------------------------------------------------------------------------------------------------- the programmable discriminator (Eqs. 8.31-8.47)
SING = (kv(K0, K1) - kv(K1, K0)) * S2


def asym(i, j, n=3):
    """The projector onto the singlet of wires i < j, identity on the other wire (element by element)."""
    P = dm(SING)
    d = 2 ** n
    M = np.zeros((d, d), dtype=complex)
    for a in range(d):
        ba = [(a >> (n - 1 - q)) & 1 for q in range(n)]
        for b in range(d):
            bb = [(b >> (n - 1 - q)) & 1 for q in range(n)]
            if all(ba[q] == bb[q] for q in range(n) if q not in (i, j)):
                M[a, b] = P[ba[i] * 2 + ba[j], bb[i] * 2 + bb[j]]
    return M


P_BC = asym(1, 2)
P_AC = asym(0, 2)


def disc_ops(c1, c2):
    return c1 * P_BC, c2 * P_AC


def disc_inputs(p1, p2):
    return kv(p1, p2, p1), kv(p1, p2, p2)


def prog_usd(p1, p2, c1, c2):
    in1, in2 = disc_inputs(p1, p2)
    A, B = disc_ops(c1, c2)
    pj1 = float(np.real(np.vdot(in1, A @ in1)))
    pj2 = float(np.real(np.vdot(in2, B @ in2)))
    pi0 = np.eye(8) - A - B
    return pj1, pj2, (pj1 + pj2) / 2, float(eigvalsh(pi0)[0]), float(max(norm(B @ in1), norm(A @ in2)))


def pair_at_overlap(s):
    return K0, np.array([s, math.sqrt(1 - s * s)], dtype=complex)


def disc_basis():
    def a_bc(a):
        return np.kron(a, SING)

    def b_ac(b):
        out = np.zeros(8, dtype=complex)
        for (a, cc), amp in {(0, 1): S2, (1, 0): -S2}.items():
            for bb in range(2):
                out[a * 4 + bb * 2 + cc] += amp * b[bb]
        return out

    return [a_bc(K0), (2 * b_ac(K0) - a_bc(K0)) / S3, a_bc(K1), (2 * b_ac(K1) - a_bc(K1)) / S3]


def disc_block_gap(c1, c2):
    B = np.stack(disc_basis(), axis=1)
    A, Bo = disc_ops(c1, c2)
    blk = B.conj().T @ (np.eye(8) - A - Bo) @ B
    m = np.array([[1 - c1 - c2 / 4, -S3 / 4 * c2], [-S3 / 4 * c2, 1 - 3 / 4 * c2]])
    want = np.zeros((4, 4), dtype=complex)
    want[:2, :2] = m
    want[2:, 2:] = m
    return float(np.abs(blk - want).max())


def block(c1, c2):
    m = np.array([[1 - c1 - c2 / 4, -S3 / 4 * c2], [-S3 / 4 * c2, 1 - 3 / 4 * c2]])
    tr = 2 - c1 - c2
    det_true = 1 - c1 - c2 + 0.75 * c1 * c2
    det_printed = 1 - (2 - c1 - c2) + 0.75 * c1 * c2
    ev = np.sort(eigvalsh(m))
    return m, tr, det_true, det_printed, tr * tr - 4 * det_printed, ev


def disc_grid_best(n=60):
    best = (0.0, 0.0, -1.0)
    for i in range(n + 1):
        for j in range(n + 1):
            c1, c2 = i / n, j / n
            A, B = disc_ops(c1, c2)
            if eigvalsh(np.eye(8) - A - B)[0] >= -1e-12 and c1 + c2 > best[2]:
                best = (c1, c2, c1 + c2)
    return best


def disc_opt_c():
    """The largest c with Pi0(c, c) >= 0 (brentq on the smallest eigenvalue)."""
    f = lambda c: eigvalsh(np.eye(8) - c * P_BC - c * P_AC)[0]
    return optimize.brentq(f, 0.1, 1.5, xtol=1e-15, rtol=1e-15)
