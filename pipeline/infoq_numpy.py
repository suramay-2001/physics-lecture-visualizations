"""Independent numpy/scipy routes for Chapter Q23 (app/src/physics/qc/infoq.ts), shared by pipeline/make_infoq_fixtures.py and pipeline/claims_qc709/q23.py.

Nothing here reads the TypeScript engine or the chapter's value tables. States are built from explicit np.kron products; partial traces reshape the density matrix into a
tensor and contract it with np.einsum; entropies come from np.linalg.eigvalsh; quantum relative entropy comes from scipy.linalg.logm when both states have full rank (a
support test and an eigen-decomposition otherwise); the channel capacity is a vectorised grid AND scipy.optimize; the accessible information is a vectorised angle scan AND a
scipy.optimize refinement; the Holevo quantities are rebuilt from density matrices; and the dephasing circuit is applied to a state vector gate by gate with dense matrices.

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the top wire = the most significant bit; entropies are in bits.
"""
import math
from itertools import product

import numpy as np
from scipy.linalg import logm
from scipy.optimize import minimize_scalar

LN2 = math.log(2)
I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2)
KET = {'0': np.array([1, 0], dtype=complex), '1': np.array([0, 1], dtype=complex),
       '+': np.array([1, 1], dtype=complex) / math.sqrt(2), '-': np.array([1, -1], dtype=complex) / math.sqrt(2)}


def kron(*ms):
    out = np.array([[1.0 + 0j]]) if np.ndim(ms[0]) == 2 else np.array([1.0 + 0j])
    for m in ms:
        out = np.kron(out, m)
    return out


def ket(label):
    return kron(*[KET[ch] for ch in label])


def bell(sign=1):
    """(|00> + sign |11>)/sqrt 2."""
    v = np.zeros(4, dtype=complex)
    v[0] = 1 / math.sqrt(2)
    v[3] = sign / math.sqrt(2)
    return v


def rho_of(psi):
    psi = np.asarray(psi, dtype=complex).reshape(-1, 1)
    return psi @ psi.conj().T


def mix(parts):
    """parts: list of (weight, ket vector)."""
    return sum(w * rho_of(v) for w, v in parts)


def bloch_rho(r):
    return 0.5 * (I2 + r[0] * X + r[1] * Y + r[2] * Z)


# ---------------------------------------------------------------- classical tables
def h2(p):
    return 0.0 if p <= 0 or p >= 1 else float(-p * math.log2(p) - (1 - p) * math.log2(1 - p))


def shannon(v):
    v = np.asarray(v, dtype=float).ravel()
    v = v[v > 1e-15]
    return float(-(v * np.log2(v)).sum())


def dist(p, q):
    return float(0.5 * np.abs(np.asarray(p, float) - np.asarray(q, float)).sum())


def fid(p, q):
    return float(np.sqrt(np.asarray(p, float) * np.asarray(q, float)).sum())


def angle_deg(p, q):
    return float(np.degrees(np.arccos(min(1.0, fid(p, q)))))


def rel(p, q):
    """H(p||q) in bits; None for infinity."""
    p = np.asarray(p, float)
    q = np.asarray(q, float)
    tot = 0.0
    for a, b in zip(p, q):
        if a <= 1e-15:
            continue
        if b <= 1e-15:
            return None
        tot += a * math.log2(a / b)
    return float(tot)


def quarter_tables(n):
    """All n-outcome tables with entries k/4, by itertools.product over numerators."""
    return [[k / 4 for k in ks] for ks in product(range(5), repeat=n) if sum(ks) == 4]


def joint_marg(pxy):
    pxy = np.asarray(pxy, float)
    return pxy.sum(axis=1), pxy.sum(axis=0)


def joint_h(pxy):
    return shannon(pxy)


def cond_h(pxy):
    """H(Y|X) = sum_x p(x) H(Y | X = x), written as the weighted rows (not H(XY) - H(X))."""
    pxy = np.asarray(pxy, float)
    px = pxy.sum(axis=1)
    return float(sum(px[k] * shannon(pxy[k] / px[k]) for k in range(len(px)) if px[k] > 1e-15))


def mutual(pxy):
    pxy = np.asarray(pxy, float)
    px, py = joint_marg(pxy)
    tot = 0.0
    for i in range(pxy.shape[0]):
        for j in range(pxy.shape[1]):
            if pxy[i, j] > 1e-15:
                tot += pxy[i, j] * math.log2(pxy[i, j] / (px[i] * py[j]))
    return float(tot)


def bsc(f, px=(0.5, 0.5)):
    return np.array([[px[0] * (1 - f), px[0] * f], [px[1] * f, px[1] * (1 - f)]])


def capacity_grid(pyx, n_grid):
    """Vectorised grid of input chances k/(n_grid-1): the largest I(X:Y) and its first argmax."""
    pyx = np.asarray(pyx, float)
    a = np.linspace(0.0, 1.0, n_grid)
    best, at = -1.0, 0.0
    for av in a:
        i = mutual(np.vstack([av * pyx[0], (1 - av) * pyx[1]]))
        if i > best + 1e-13:
            best, at = i, float(av)
    return best, at


def capacity_opt(pyx):
    """The exact capacity of a two-input channel by a bounded scalar optimisation of the input chance."""
    pyx = np.asarray(pyx, float)
    res = minimize_scalar(lambda a: -mutual(np.vstack([a * pyx[0], (1 - a) * pyx[1]])), bounds=(0.0, 1.0), method='bounded', options={'xatol': 1e-12})
    return float(-res.fun), float(res.x)


# ---------------------------------------------------------------- quantum
def vn(rho):
    w = np.linalg.eigvalsh(np.asarray(rho, complex))
    w = w[w > 1e-15]
    return float(-(w * np.log2(w)).sum())


def ptrace(rho, keep, n):
    """Reduced state of the qubits `keep` (a sorted list), by reshaping into a tensor with 2n indices and tracing the others with einsum."""
    rho = np.asarray(rho, complex).reshape([2] * (2 * n))
    keep = sorted(keep)
    letters_row = [chr(97 + k) for k in range(n)]
    letters_col = [chr(97 + k) if k not in keep else chr(97 + n + k) for k in range(n)]
    out_row = [letters_row[k] for k in keep]
    out_col = [letters_col[k] for k in keep]
    sub = ''.join(letters_row) + ''.join(letters_col) + '->' + ''.join(out_row) + ''.join(out_col)
    red = np.einsum(sub, rho)
    d = 2 ** len(keep)
    return red.reshape(d, d)


def ent(rho, keep, n):
    return vn(ptrace(rho, keep, n)) if len(keep) < n else vn(rho)


def qmi(rho, a, b, n):
    return ent(rho, a, n) + ent(rho, b, n) - ent(rho, sorted(a + b), n)


def rel_q(rho, sigma):
    """S(rho||sigma) in bits; None for infinity. logm for a full-rank sigma, a support test and an eigen-decomposition otherwise."""
    rho = np.asarray(rho, complex)
    sigma = np.asarray(sigma, complex)
    ws, vs = np.linalg.eigh(sigma)
    if ws.min() > 1e-12:
        t = np.trace(rho @ logm(sigma)).real / LN2
        return float(-vn(rho) - t)
    # rank-deficient sigma: infinite when rho has weight on sigma's kernel
    ker = vs[:, ws <= 1e-12]
    if ker.shape[1] and np.trace(ker.conj().T @ rho @ ker).real > 1e-12:
        return None
    sup = vs[:, ws > 1e-12]
    logsig = sup @ np.diag(np.log(ws[ws > 1e-12])) @ sup.conj().T / LN2
    return float(-vn(rho) - np.trace(rho @ logsig).real)


def klein_chain(rho, sigma):
    """(S, H, r, p): p = eigenvalues of rho (largest first), r_i = sum_j |<u_i|v_j>|^2 q_j."""
    wr, vr = np.linalg.eigh(rho)
    ws, vs = np.linalg.eigh(sigma)
    order = np.argsort(-wr)
    wr, vr = wr[order], vr[:, order]
    ov = np.abs(vr.conj().T @ vs) ** 2
    r = ov @ ws
    p = np.clip(wr, 0, None)
    return rel_q(rho, sigma), rel(p, r), [float(x) for x in r], [float(x) for x in p]


def plane_basis(t):
    return np.array([[math.cos(t / 2), math.sin(t / 2)], [-math.sin(t / 2), math.cos(t / 2)]], dtype=complex)


def table_in(rho, B):
    """Chances <b_i|rho|b_i> for the rows b_i of B."""
    return [float((b.conj() @ rho @ b).real) for b in B]


def table_dist_basis(rho, sigma, B):
    return dist(table_in(rho, B), table_in(sigma, B))


def trace_dist(rho, sigma):
    return float(0.5 * np.abs(np.linalg.eigvalsh(rho - sigma)).sum())


def best_table_dist(rho, sigma, n_angles):
    best, at = -1.0, 0.0
    for k in range(n_angles):
        t = math.pi * k / (n_angles - 1)
        v = table_dist_basis(rho, sigma, plane_basis(t))
        if v > best + 1e-13:
            best, at = v, math.degrees(t)
    return best, at


def eigen_table_dist(rho, sigma):
    w, v = np.linalg.eigh(rho - sigma)
    return table_dist_basis(rho, sigma, [v[:, k] for k in range(v.shape[1])])


# ---------------------------------------------------------------- Holevo
def holevo_chi(ps, rhos):
    avg = sum(p * r for p, r in zip(ps, rhos))
    return vn(avg) - sum(p * vn(r) for p, r in zip(ps, rhos))


def projector_pair(n):
    n = np.asarray(n, float)
    n = n / np.linalg.norm(n)
    s = n[0] * X + n[1] * Y + n[2] * Z
    return [0.5 * (I2 + s), 0.5 * (I2 - s)]


def povm_joint(ps, rhos, povm):
    return np.array([[p * float(np.trace(E @ r).real) for E in povm] for p, r in zip(ps, rhos)])


def info_povm(ps, rhos, povm):
    return mutual(povm_joint(ps, rhos, povm))


def info_plane(ps, rhos, t):
    P = [rho_of(plane_basis(t)[0]), rho_of(plane_basis(t)[1])]
    return info_povm(ps, rhos, P)


def accessible_projective(ps, rhos, n_angles):
    best, at = -1.0, 0.0
    for k in range(n_angles):
        t = math.pi * k / (n_angles - 1)
        v = info_plane(ps, rhos, t)
        if v > best + 1e-13:
            best, at = v, math.degrees(t)
    return best, at


def accessible_opt(ps, rhos):
    """The maximum over projective readings in the x-z plane by a bounded optimisation seeded from a coarse scan (an independent route to the grid)."""
    ts = np.linspace(0, math.pi, 361)
    vals = [info_plane(ps, rhos, t) for t in ts]
    k = int(np.argmax(vals))
    lo, hi = ts[max(k - 1, 0)], ts[min(k + 1, len(ts) - 1)]
    res = minimize_scalar(lambda t: -info_plane(ps, rhos, t), bounds=(lo, hi), method='bounded', options={'xatol': 1e-12})
    return float(-res.fun), math.degrees(res.x)


def usd_bound(ps, rhos):
    avg = sum(p * r for p, r in zip(ps, rhos))
    return max(0.0, (shannon(ps) - vn(avg)) / math.log2(len(ps)))


def cq_state(ps, rhos):
    P = [np.diag([1.0, 0.0]).astype(complex), np.diag([0.0, 1.0]).astype(complex)]
    return sum(p * np.kron(P[x], rhos[x]) for x, p in enumerate(ps))


def proof_states(ps, rhos, axis):
    E = projector_pair(axis)
    tab = povm_joint(ps, rhos, E)
    after = np.diag(tab.ravel()).astype(complex)
    return qmi(cq_state(ps, rhos), [0], [1], 2), qmi(after, [0], [1], 2)


def pair_states(s):
    return [np.array([1, 0], dtype=complex), np.array([s, math.sqrt(max(0.0, 1 - s * s))], dtype=complex)]


def pair_chi(s):
    st = [rho_of(v) for v in pair_states(s)]
    return holevo_chi([0.5, 0.5], st)


# ---------------------------------------------------------------- circuits applied gate by gate
def apply_gate(psi, U, targets, n, controls=()):
    """Apply a one-qubit matrix U to `targets` (one wire) with optional controls, by building the dense n-qubit operator."""
    t = targets[0]
    dim = 2 ** n
    full = np.zeros((dim, dim), dtype=complex)
    for i in range(dim):
        bits = [(i >> (n - 1 - q)) & 1 for q in range(n)]
        if all(bits[c] == 1 for c in controls):
            for b in (0, 1):
                j = i & ~(1 << (n - 1 - t)) | (b << (n - 1 - t))
                full[j, i] += U[b, bits[t]]
        else:
            full[i, i] += 1
    return full @ psi


def ry(theta):
    return np.array([[math.cos(theta / 2), -math.sin(theta / 2)], [math.sin(theta / 2), math.cos(theta / 2)]], dtype=complex)


def dephasing_state(p):
    psi = ket('000')
    psi = apply_gate(psi, H, [0], 3)
    psi = apply_gate(psi, X, [1], 3, controls=[0])
    psi = apply_gate(psi, ry(2 * math.asin(math.sqrt(p))), [2], 3)
    psi = apply_gate(psi, Z, [1], 3, controls=[2])
    return psi


def ghz_state():
    psi = ket('000')
    psi = apply_gate(psi, H, [0], 3)
    psi = apply_gate(psi, X, [1], 3, controls=[0])
    psi = apply_gate(psi, X, [2], 3, controls=[1])
    return psi
