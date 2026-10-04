#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q9.values.ts (Physics 709, chapter Q9).

Independent route (never Q9.values.ts's own helper functions, nor physics/qc/density.ts or physics/qc/cmat.ts):
every state and operator here is built by direct numpy matrix construction (hand-written 2x2/4x4/8x8 arrays via
np.kron, np.outer), eigenvalues and singular values from numpy's own eigh/svd, von Neumann entropy from eigvalsh
and the closed-form binary-entropy formula, trace distance and fidelity from explicit eigendecompositions. The
unitary-freedom check (q9PurUGap) uses numpy's OWN full_matrices=True SVD, mirroring Q8's independent check.

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q9.py -> app/src/physics/__fixtures__/claims-qc709/q9.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write
byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

R2 = 1 / np.sqrt(2)
DEG = np.pi / 180

I1 = np.eye(2, dtype=complex)
X1 = np.array([[0, 1], [1, 0]], complex)
Y1 = np.array([[0, -1j], [1j, 0]], complex)
Z1 = np.array([[1, 0], [0, -1]], complex)
H1 = np.array([[1, 1], [1, -1]], complex) * R2

ZERO2 = np.array([1, 0], complex)
ONE2 = np.array([0, 1], complex)
PLUS2 = np.array([1, 1], complex) * R2
MINUS2 = np.array([1, -1], complex) * R2


def ket(label):
    """A product ket from a label, one char per qubit, q0 first: '0','1','+','-' (state.ts `ket`)."""
    one = {"0": ZERO2, "1": ONE2, "+": PLUS2, "-": MINUS2}
    out = one[label[0]]
    for ch in label[1:]:
        out = np.kron(out, one[ch])
    return out


def density(psi):
    return np.outer(psi, psi.conj())


def mixture(parts):
    """parts: list of (weight, ket) pairs."""
    d = len(parts[0][1])
    rho = np.zeros((d, d), complex)
    for w, psi in parts:
        rho += w * density(psi)
    return rho


def pauli_string(s):
    letters = {"I": I1, "X": X1, "Y": Y1, "Z": Z1}
    out = letters[s[0]]
    for ch in s[1:]:
        out = np.kron(out, letters[ch])
    return out


def trace_of(a, rho):
    return float(np.real(np.trace(a @ rho)))


def purity(rho):
    return float(np.real(np.trace(rho @ rho)))


def reduced_bloch(rho2x2):
    rx = 2 * np.real(rho2x2[0, 1])
    ry = -2 * np.imag(rho2x2[0, 1])
    rz = np.real(rho2x2[0, 0] - rho2x2[1, 1])
    return np.array([rx, ry, rz])


def ptrace2(rho4x4, keep):
    """Partial trace of a 2-qubit (4x4) density matrix, keeping qubit 0 or qubit 1."""
    r = rho4x4.reshape(2, 2, 2, 2)
    if keep == 0:
        return np.einsum("abcb->ac", r)
    return np.einsum("abad->bd", r)


def partial_trace_last(rho8x8, keep_first):
    """Partial trace of a 3-qubit (8x8) density matrix, tracing out the LAST (3 - keep_first) qubits."""
    dk = 2 ** keep_first
    dt = 2 ** (3 - keep_first)
    r = rho8x8.reshape(dk, dt, dk, dt)
    return np.einsum("abcb->ac", r)


def reduced_density_of_ket(psi, n, keep):
    """rho_keep = C C^dagger, C the coefficient matrix of psi (n qubits) across keep | rest (q0 first)."""
    rest = [q for q in range(n) if q not in keep]
    d_keep = 2 ** len(keep)
    d_rest = 2 ** len(rest)
    # reshape psi into a tensor with one axis per qubit, then move kept axes first
    t = psi.reshape([2] * n)
    order = list(keep) + rest
    t = np.transpose(t, order)
    c = t.reshape(d_keep, d_rest)
    return c @ c.conj().T


def von_neumann(rho):
    vals = np.linalg.eigvalsh(rho)
    s = 0.0
    for lam in vals:
        lam = float(np.real(lam))
        if lam > 1e-15:
            s -= lam * np.log2(lam)
    return s


def h_binary(p):
    if p <= 0 or p >= 1:
        return 0.0
    return -p * np.log2(p) - (1 - p) * np.log2(1 - p)


def canonical_phase(v):
    for x in v:
        if abs(x) > 1e-12:
            return v / (x / abs(x))
    return v


def ens_matrix(weights, kets, n, d):
    """A d x n matrix whose column i is sqrt(weights[i]) * kets[i] (i < len(weights)) or zero (padding to n)."""
    cols = []
    for i in range(n):
        if i < len(weights):
            cols.append(np.sqrt(weights[i]) * kets[i])
        else:
            cols.append(np.zeros(d, complex))
    return np.array(cols).T


def ensemble_unitary(a, b):
    """The unitary-freedom theorem's U (Bergou (2.19)-(2.20)): A @ U = B. Built with numpy's OWN full SVD
    (full_matrices=True already gives a full n x n right-singular-vector matrix)."""
    d, n = a.shape
    ua, s, vah = np.linalg.svd(a, full_matrices=True)
    va = vah.conj().T
    uab = ua.conj().T @ b
    tol = 1e-9 * max(float(s[0]) if len(s) else 1.0, 1e-300)
    d_mat = np.zeros((n, n), dtype=complex)
    free = []
    for i in range(len(s)):
        if s[i] > tol:
            d_mat[i, :] = uab[i, :] / s[i]
            free.append(d_mat[i, :].copy())
    todo = [i for i in range(n) if i >= len(s) or s[i] <= tol]
    for i in todo:
        for e in range(n):
            w = np.zeros(n, dtype=complex)
            w[e] = 1.0
            for f in free:
                w = w - np.vdot(f, w) * f
            nrm = np.linalg.norm(w)
            if nrm > 1e-6:
                w = w / nrm
                d_mat[i, :] = w
                free.append(w)
                break
    return va @ d_mat


def fidelity_pure_pure(a, b):
    return float(abs(np.vdot(a, b)))


def fidelity_pure_mixed(psi, rho):
    q = float(np.real(np.vdot(psi, rho @ psi)))
    return float(np.sqrt(max(0.0, q)))


def sqrtm_psd(rho):
    vals, vecs = np.linalg.eigh(rho)
    vals = np.clip(vals, 0, None)
    return (vecs * np.sqrt(vals)) @ vecs.conj().T


def fidelity_mixed_mixed(rho, sigma):
    sa = sqrtm_psd(rho)
    sb = sqrtm_psd(sigma)
    # trace norm of sa @ sb = sum of its singular values
    s = np.linalg.svd(sa @ sb, compute_uv=False)
    return float(np.sum(s))


def trace_distance(rho, sigma):
    diff = rho - sigma
    vals = np.linalg.eigvalsh(diff)
    return float(np.sum(np.abs(vals))) / 2


def coef_matrix_2q(psi):
    """2x2 coefficient matrix of a 2-qubit ket, rows = qubit A (q0), cols = qubit B (q1)."""
    return psi.reshape(2, 2)


# ---------------------------------------------------------------------------------------------- #
# Running states (plan Sec 0)                                                                     #
# ---------------------------------------------------------------------------------------------- #
PSI1 = np.array([np.cos(30 * DEG), np.sin(30 * DEG)], complex)  # Ry(pi/3)|0> = 0.866|0> + 0.5|1>
PROD = np.kron(PSI1, PLUS2)  # psi1 (x) |+>
PSI2 = np.array([np.sqrt(3) / 2, 0, 0, 0.5], complex)  # (sqrt3|00> + |11>)/2
SING = (ket("01") - ket("10")) * R2  # the singlet
GHZ3 = np.zeros(8, complex)
GHZ3[0] = R2
GHZ3[7] = R2
COIN = mixture([(0.5, ket("01")), (0.5, ket("10"))])

# ZX: Unit 8.4's mixture, 1/2|0><0| + 1/2|+><+| (Q8's own running mixture, reused directly)
ZX = mixture([(0.5, ket("0")), (0.5, ket("+"))])
HALF_I = 0.5 * I1
HALF4 = 0.25 * np.eye(4, dtype=complex)

PXX, PYY, PZZ = pauli_string("XX"), pauli_string("YY"), pauli_string("ZZ")
PXXI, PYYI, PZZI = pauli_string("XXI"), pauli_string("YYI"), pauli_string("ZZI")

# the eigen-recipe of ZX (descending p), sign-fixed exactly as Q8's own U_PLUS/U_MINUS
zx_vals, zx_vecs = np.linalg.eigh(ZX)  # ascending
zx_order = np.argsort(-zx_vals)
ZX_P = zx_vals[zx_order]  # descending: lambda+, lambda-
U_PLUS = canonical_phase(zx_vecs[:, zx_order[0]])
U_MINUS = canonical_phase(zx_vecs[:, zx_order[1]])

# the running pair P, built by the controlled-H circuit: 0.707|00> + 0.5|01> + 0.5|11>
# (independently, from the circuit's own two steps: H on qubit B, then H on qubit A controlled on B=1)
state = np.kron(ZERO2, ZERO2)
state = np.kron(I1, H1) @ state  # H on B
# controlled-H where control is qubit B (q1) and target is qubit A (q0)
cH_AonB = np.eye(4, dtype=complex)
# basis index = 2*a + b; apply H to the 'a' part only when b = 1, i.e. rows/cols {01,11} mix as H
cH_AonB[np.ix_([1, 3], [1, 3])] = H1
PP = cH_AonB @ state

# cos(22.5deg)|00> + sin(22.5deg)|11>
CS225 = np.array([np.cos(22.5 * DEG), 0, 0, np.sin(22.5 * DEG)], complex)


# ---------------------------------------------------------------------------------------------- #
# 9.1 q9-partial-trace                                                                             #
# ---------------------------------------------------------------------------------------------- #
rho_a_prod = reduced_density_of_ket(PROD, 2, [0])
rho_a_prod_ideal = np.array([[0.75, np.sqrt(3) / 4], [np.sqrt(3) / 4, 0.25]], complex)
rho_psi2 = density(PSI2)
rho_a_psi2 = reduced_density_of_ket(PSI2, 2, [0])
rho_sing = density(SING)
rho_a_sing = reduced_density_of_ket(SING, 2, [0])
r_a_sing = reduced_bloch(rho_a_sing)
sing_xx = trace_of(PXX, rho_sing)
sing_yy = trace_of(PYY, rho_sing)
sing_zz = trace_of(PZZ, rho_sing)

beta_phi_plus = (ket("00") + ket("11")) * R2
beta_psi_plus = (ket("01") + ket("10")) * R2
beta_phi_minus = (ket("00") - ket("11")) * R2
beta_psi_minus = (ket("01") - ket("10")) * R2
BETA = [beta_phi_plus, beta_psi_plus, beta_phi_minus, beta_psi_minus]
beta_ra = [reduced_density_of_ket(b, 2, [0]) for b in BETA]
beta_ra_gap = [float(np.max(np.abs(r - HALF_I))) for r in beta_ra]
beta_grid = [(trace_of(PXX, density(b)), trace_of(PYY, density(b)), trace_of(PZZ, density(b))) for b in BETA]

rho_ghz = density(GHZ3)
r12 = partial_trace_last(rho_ghz, 2)
r12_grid = (trace_of(PXXI, rho_ghz), trace_of(PYYI, rho_ghz), trace_of(PZZI, rho_ghz))
r12_arrow_a = reduced_bloch(ptrace2(r12, 0))
r12_arrow_b = reduced_bloch(ptrace2(r12, 1))

# ---------------------------------------------------------------------------------------------- #
# 9.2 q9-same-part                                                                                 #
# ---------------------------------------------------------------------------------------------- #
coin_xx = trace_of(PXX, COIN)
coin_yy = trace_of(PYY, COIN)
coin_zz = trace_of(PZZ, COIN)
coin_ra_gap = float(np.max(np.abs(ptrace2(COIN, 0) - HALF_I)))
coin_pur = purity(COIN)
rho_a_psi_plus_gap = float(np.max(np.abs(reduced_density_of_ket(beta_psi_plus, 2, [0]) - HALF_I)))

# ---------------------------------------------------------------------------------------------- #
# 9.3 q9-entropy                                                                                   #
# ---------------------------------------------------------------------------------------------- #
s_zx = von_neumann(ZX)
zx_eig_large = float(ZX_P[0])
zx_eig_small = float(ZX_P[1])
s_pure = von_neumann(density(ket("0")))
s_half = von_neumann(HALF_I)
s_quarter4 = von_neumann(HALF4)


def rho_z(r):
    return np.array([[(1 + r) / 2, 0], [0, (1 - r) / 2]], complex)


r_in = [0.0, 0.5, R2, 1.0]
s_of_r = [von_neumann(rho_z(r)) for r in r_in]

e_prod = von_neumann(reduced_density_of_ket(PROD, 2, [0]))
e_bell = von_neumann(reduced_density_of_ket(beta_phi_plus, 2, [0]))
e_psi2 = von_neumann(rho_a_psi2)
s_box = von_neumann(r12)

therm_x = 2.0
therm_p_up = (1 + np.tanh(therm_x / 2)) / 2
s_thermal = von_neumann(np.array([[therm_p_up, 0], [0, 1 - therm_p_up]], complex))

# ---------------------------------------------------------------------------------------------- #
# 9.4 q9-schmidt                                                                                   #
# ---------------------------------------------------------------------------------------------- #
c_pp = coef_matrix_2q(PP)
p_vt_overlap = float(np.real(np.vdot(c_pp[0], c_pp[1])))

u_ab = np.array([U_PLUS, U_MINUS]).T  # columns u+, u-
vt_eig = u_ab.conj().T @ c_pp  # rows: vtilde+, vtilde-
p_vt_eig_overlap = float(np.real(np.vdot(vt_eig[0], vt_eig[1])))
p_vt_eig_norm2 = [float(np.sum(np.abs(vt_eig[0]) ** 2)), float(np.sum(np.abs(vt_eig[1]) ** 2))]
p_schmidt = [np.sqrt(x) for x in p_vt_eig_norm2]

svd_c_pp = np.linalg.svd(c_pp, compute_uv=False)
rank_prod = int(np.sum(np.linalg.svd(coef_matrix_2q(PROD), compute_uv=False) > 1e-9))
rank_p = int(np.sum(svd_c_pp > 1e-9))
rank_bell = int(np.sum(np.linalg.svd(coef_matrix_2q(beta_phi_plus), compute_uv=False) > 1e-9))

rho_a_p = reduced_density_of_ket(PP, 2, [0])
rho_b_p = reduced_density_of_ket(PP, 2, [1])
spec_a = sorted(np.real(np.linalg.eigvalsh(rho_a_p)), reverse=True)
spec_b = sorted(np.real(np.linalg.eigvalsh(rho_b_p)), reverse=True)
r_a_p = reduced_bloch(rho_a_p)
r_b_p = reduced_bloch(rho_b_p)

svd_cs225 = sorted(np.linalg.svd(coef_matrix_2q(CS225), compute_uv=False), reverse=True)
e_cs225 = von_neumann(reduced_density_of_ket(CS225, 2, [0]))

# ---------------------------------------------------------------------------------------------- #
# 9.5 q9-purification                                                                              #
# ---------------------------------------------------------------------------------------------- #
pur_gap = float(np.max(np.abs(rho_a_p - ZX)))

# purify(ZX) as the engine does: eigh's own ascending order, ancilla tagged 0 (smallest), 1 (largest)
purify_vals, purify_vecs = np.linalg.eigh(ZX)  # ascending
purify_psi = np.zeros(4, complex)
for i in range(2):
    w = np.sqrt(max(0.0, purify_vals[i]))
    purify_psi += w * np.kron(purify_vecs[:, i], ket(str(i)))
purify_gap = float(np.max(np.abs(reduced_density_of_ket(purify_psi, 2, [0]) - ZX)))

# Psi_eig = sqrt(lambda+) |u+>|0> + sqrt(lambda-) |u->|1>
psi_eig_ket = np.sqrt(ZX_P[0]) * np.kron(U_PLUS, ket("0")) + np.sqrt(ZX_P[1]) * np.kron(U_MINUS, ket("1"))

eigen_mat = ens_matrix(list(ZX_P), [U_PLUS, U_MINUS], 2, 2)
zx_ensemble_mat = ens_matrix([0.5, 0.5], [ket("0"), ket("+")], 2, 2)
pur_u = ensemble_unitary(eigen_mat, zx_ensemble_mat)
pur_u_gap = float(np.max(np.abs(pur_u - H1)))

h_on_b = np.kron(I1, H1)
pur_h_gap = float(np.max(np.abs(density(h_on_b @ psi_eig_ket) - density(PP))))


def measure_in_basis_qubitB(psi, basis_kets):
    """p[k], post[k] (2-qubit ket) for measuring qubit B (q1) in {basis_kets[0], basis_kets[1]}."""
    out_p = []
    out_post = []
    for bket in basis_kets:
        proj = np.kron(I1, np.outer(bket, bket.conj()))
        projected = proj @ psi
        p = float(np.real(np.vdot(projected, projected)))
        out_p.append(p)
        out_post.append(projected / np.sqrt(p) if p > 1e-15 else None)
    return out_p, out_post


steer_x_p, steer_x_post = measure_in_basis_qubitB(PP, [PLUS2, MINUS2])
steer_x_f = []
for post, ref in zip(steer_x_post, [U_PLUS, U_MINUS]):
    if post is None:
        steer_x_f.append(0.0)
    else:
        ra = reduced_density_of_ket(post, 2, [0])
        steer_x_f.append(fidelity_pure_mixed(ref, ra))

steer_z_p, steer_z_post = measure_in_basis_qubitB(PP, [ZERO2, ONE2])
steer_z_f = []
for post, ref in zip(steer_z_post, [ket("0"), ket("+")]):
    if post is None:
        steer_z_f.append(0.0)
    else:
        ra = reduced_density_of_ket(post, 2, [0])
        steer_z_f.append(fidelity_pure_mixed(ref, ra))

e_p = von_neumann(rho_a_p)

# ---------------------------------------------------------------------------------------------- #
# 9.6 q9-distance                                                                                  #
# ---------------------------------------------------------------------------------------------- #
rho0 = density(ket("0"))
rhop = density(ket("+"))
d0p = trace_distance(rho0, rhop)
d0p_eig = sorted(np.real(np.linalg.eigvalsh(rho0 - rhop)))  # ascending: [-0.707, 0.707]
f0p = fidelity_pure_pure(ket("0"), ket("+"))
sq0p = float(np.sqrt(max(0.0, 1 - f0p ** 2)))
r0 = reduced_bloch(rho0)
rplus = reduced_bloch(rhop)
d0p_ball = float(np.linalg.norm(r0 - rplus)) / 2
f0_half = fidelity_pure_mixed(ket("0"), HALF_I)

fvdg_d = trace_distance(ZX, HALF_I)
fvdg_f = fidelity_mixed_mixed(ZX, HALF_I)
fvdg_lower = 1 - fvdg_f
fvdg_upper = float(np.sqrt(max(0.0, 1 - fvdg_f ** 2)))

ang0p = 45.0

psi_06 = np.array([0.6, 0.8], complex)
f06 = fidelity_pure_pure(ket("0"), psi_06)
d06 = trace_distance(density(ket("0")), density(psi_06))
ang06 = float(np.degrees(np.arctan2(0.8, 0.6)))
theta06 = 2 * ang06

d_sing_coin = trace_distance(rho_sing, COIN)
d_sing_coin_a = trace_distance(rho_a_sing, ptrace2(COIN, 0))

# ---------------------------------------------------------------------------------------------- #
values = {
    # reusable constants
    "q9Half": 0.5,
    "q9Quarter": 0.25,
    "q9ThreeQuarter": 0.75,
    "q9R2": R2,
    "q9Sqrt32": np.sqrt(3) / 2,
    # 9.1 q9-partial-trace
    "q9ProdRA00": float(np.real(rho_a_prod[0, 0])),
    "q9ProdRA01Abs": float(abs(rho_a_prod[0, 1])),
    "q9ProdRA11": float(np.real(rho_a_prod[1, 1])),
    "q9ProdRAGap": float(np.max(np.abs(rho_a_prod - rho_a_prod_ideal))),
    "q9ProdRAPur": purity(rho_a_prod),
    "q9ProdExpZ1": trace_of(Z1, rho_a_prod),
    "q9ProdExpX1": trace_of(X1, rho_a_prod),
    "q9Psi2Coh": float(abs(rho_psi2[0, 3])),
    "q9Psi2RA00": float(np.real(rho_a_psi2[0, 0])),
    "q9Psi2RA01": float(abs(rho_a_psi2[0, 1])),
    "q9Psi2RA11": float(np.real(rho_a_psi2[1, 1])),
    "q9Psi2Pur": purity(rho_a_psi2),
    "q9Psi2ExpZ1": trace_of(Z1, rho_a_psi2),
    "q9Psi2ExpX1": trace_of(X1, rho_a_psi2),
    "q9SingRA00": float(np.real(rho_a_sing[0, 0])),
    "q9SingArrowsLen": float(np.linalg.norm(r_a_sing)),
    "q9SingXX": sing_xx,
    "q9SingYY": sing_yy,
    "q9SingZZ": sing_zz,
    "q9BellRA00": float(np.real(beta_ra[2][0, 0])),
    "q9BellRAGapMax": float(max(beta_ra_gap)),
    "q9BellGrid00XX": beta_grid[0][0],
    "q9BellGrid00YY": beta_grid[0][1],
    "q9BellGrid00ZZ": beta_grid[0][2],
    "q9BellGrid01XX": beta_grid[1][0],
    "q9BellGrid01YY": beta_grid[1][1],
    "q9BellGrid01ZZ": beta_grid[1][2],
    "q9BellGrid10XX": beta_grid[2][0],
    "q9BellGrid10YY": beta_grid[2][1],
    "q9BellGrid10ZZ": beta_grid[2][2],
    "q9BellGrid11XX": beta_grid[3][0],
    "q9BellGrid11YY": beta_grid[3][1],
    "q9BellGrid11ZZ": beta_grid[3][2],
    "q9GhzR1200": float(np.real(r12[0, 0])),
    "q9GhzR1203": float(abs(r12[0, 3])),
    "q9GhzR12XX": r12_grid[0],
    "q9GhzR12YY": r12_grid[1],
    "q9GhzR12ZZ": r12_grid[2],
    "q9GhzR12ArrowsLen": float(np.linalg.norm(r12_arrow_a) + np.linalg.norm(r12_arrow_b)),
    # 9.2 q9-same-part
    "q9CoinRAGap": coin_ra_gap,
    "q9CoinXX": coin_xx,
    "q9CoinYY": coin_yy,
    "q9CoinZZ": coin_zz,
    "q9CoinPur": coin_pur,
    "q9BellPlusRAGap": rho_a_psi_plus_gap,
    # 9.3 q9-entropy
    "q9SZX": s_zx,
    "q9ZXEigLarge": zx_eig_large,
    "q9ZXEigSmall": zx_eig_small,
    "q9SPure": s_pure,
    "q9SHalf": s_half,
    "q9SQuarter4": s_quarter4,
    "q9S0": s_of_r[0],
    "q9S05": s_of_r[1],
    "q9S0707": s_of_r[2],
    "q9S1": s_of_r[3],
    "q9EProd": e_prod,
    "q9EBell": e_bell,
    "q9EPsi2": e_psi2,
    "q9SBox": s_box,
    "q9SThermal": s_thermal,
    # 9.4 q9-schmidt
    "q9P00": float(np.real(c_pp[0, 0])),
    "q9P01": float(np.real(c_pp[0, 1])),
    "q9P11": float(np.real(c_pp[1, 1])),
    "q9PVtOverlap": p_vt_overlap,
    "q9PVtEigP0": float(np.real(vt_eig[0, 0])),
    "q9PVtEigP1": float(np.real(vt_eig[0, 1])),
    "q9PVtEigM0": float(np.real(vt_eig[1, 0])),
    "q9PVtEigM1Abs": float(abs(np.real(vt_eig[1, 1]))),
    "q9PVtEigOverlap": p_vt_eig_overlap,
    "q9PVtEigNorm2Large": p_vt_eig_norm2[0],
    "q9PVtEigNorm2Small": p_vt_eig_norm2[1],
    "q9PSchmidtLarge": float(p_schmidt[0]),
    "q9PSchmidtSmall": float(p_schmidt[1]),
    "q9SvdLarge": float(svd_c_pp[0]),
    "q9SvdSmall": float(svd_c_pp[1]),
    "q9RankProd": rank_prod,
    "q9RankP": rank_p,
    "q9RankBell": rank_bell,
    "q9SpecALarge": float(spec_a[0]),
    "q9SpecASmall": float(spec_a[1]),
    "q9SpecBLarge": float(spec_b[0]),
    "q9SpecBSmall": float(spec_b[1]),
    "q9RA0": float(r_a_p[0]),
    "q9RA2": float(r_a_p[2]),
    "q9RB0": float(r_b_p[0]),
    "q9RALen": float(np.linalg.norm(r_a_p)),
    "q9RBLen": float(np.linalg.norm(r_b_p)),
    "q9RhoB00": float(np.real(rho_b_p[0, 0])),
    "q9RhoB01Abs": float(abs(rho_b_p[0, 1])),
    "q9CS225In": 22.5,
    "q9CS225SchmidtLarge": float(svd_cs225[0]),
    "q9CS225SchmidtSmall": float(svd_cs225[1]),
    "q9CS225E": e_cs225,
    # 9.5 q9-purification
    "q9PurGap": pur_gap,
    "q9PurifyGap": purify_gap,
    "q9PurUGap": pur_u_gap,
    "q9PurHGap": pur_h_gap,
    "q9SteerX0": steer_x_p[0],
    "q9SteerX1": steer_x_p[1],
    "q9SteerXF0": steer_x_f[0],
    "q9SteerXF1": steer_x_f[1],
    "q9SteerZ0": steer_z_p[0],
    "q9SteerZ1": steer_z_p[1],
    "q9SteerZF0": steer_z_f[0],
    "q9SteerZF1": steer_z_f[1],
    "q9EP": e_p,
    # 9.6 q9-distance
    "q9D0P": d0p,
    "q9D0PEig": float(d0p_eig[1]),
    "q9F0P": f0p,
    "q9Sq0P": sq0p,
    "q9D0PBall": d0p_ball,
    "q9F0Half": f0_half,
    "q9DZXHalf": fvdg_d,
    "q9FZXHalf": fvdg_f,
    "q9FvdgLower": fvdg_lower,
    "q9FvdgUpper": fvdg_upper,
    "q9Ang0P": ang0p,
    "q9F06": f06,
    "q9F06Sq": f06 * f06,
    "q9D06": d06,
    "q9Ang06": ang06,
    "q9Theta06": theta06,
    "q9DSingCoin": d_sing_coin,
    "q9DSingCoinA": d_sing_coin_a,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q9.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q9, numpy (direct matrix construction: hand-written "
            "2x2/4x4/8x8 gate and state arrays via np.kron/np.outer, numpy's own eigh/svd for spectra and "
            "Schmidt weights, explicit eigendecompositions for trace distance and fidelity, numpy's own full "
            "SVD for the unitary-freedom check; never physics/qc/density.ts, physics/qc/cmat.ts or "
            "Q9.values.ts's own helpers). "
            "Regenerate: python3 pipeline/claims_qc709/q9.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
