#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q8.values.ts (Physics 709, chapter Q8).

Independent route (never Q8.values.ts's own helper functions): every state and operator here is built by direct
numpy matrix construction (hand-written 2x2/4x4/8x8 arrays via np.kron, np.outer), never calling physics/qc/
density.ts or physics/qc/cmat.ts. Where the engine uses its own eigendecomposition-based matrix exponential
(expmHermitian) this script instead calls scipy.linalg.expm (Pade approximation) — a genuinely different numerical
route to the same physical answer. Where the engine's ensembleUnitary needed a hand-written orthonormal-basis
completion to fix a bug (padding when an ensemble has more members than the Hilbert dimension), this script uses
numpy's OWN full_matrices=True SVD, which already returns a full square right-singular-vector matrix — no manual
completion needed, which is itself an independent check that the engine's fix is correct.

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q8.py -> app/src/physics/__fixtures__/claims-qc709/q8.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write
byte-identical files.
"""
import json
from pathlib import Path

import numpy as np
from scipy.linalg import expm

ROOT = Path(__file__).resolve().parent.parent.parent

R2 = 1 / np.sqrt(2)

I1 = np.eye(2, dtype=complex)
X1 = np.array([[0, 1], [1, 0]], complex)
Y1 = np.array([[0, -1j], [1j, 0]], complex)
Z1 = np.array([[1, 0], [0, -1]], complex)
H1 = np.array([[1, 1], [1, -1]], complex) * R2

ZERO2 = np.array([1, 0], complex)
ONE2 = np.array([0, 1], complex)
PLUS2 = np.array([1, 1], complex) * R2
MINUS2 = np.array([1, -1], complex) * R2
PLUS_Y2 = (ZERO2 + 1j * ONE2) * R2
MINUS_Y2 = (ZERO2 - 1j * ONE2) * R2


def ket(label):
    """A product ket from a label, one char per qubit, q0 first: '0','1','+','-' (state.ts `ket`)."""
    one = {"0": ZERO2, "1": ONE2, "+": PLUS2, "-": MINUS2}
    out = one[label[0]]
    for ch in label[1:]:
        out = np.kron(out, one[ch])
    return out


def ket_from_bloch(theta, phi):
    """|psi> at Bloch polar angle theta (from +z) and azimuth phi (spin.ts `ketFromBloch`, radians)."""
    return np.array([np.cos(theta / 2), np.exp(1j * phi) * np.sin(theta / 2)], complex)


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


def expectation(psi, a):
    return float(np.real(np.vdot(psi, a @ psi)))


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


def deg_of(z):
    return float(np.degrees(np.arctan2(np.imag(z), np.real(z))))


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
    (full_matrices=True already gives a full n x n right-singular-vector matrix — no manual completion needed,
    unlike the TS engine's thin `svd`, which this independently confirms is handled correctly)."""
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


# ---------------------------------------------------------------------------------------------- #
# q8-why: the GHZ box                                                                              #
# ---------------------------------------------------------------------------------------------- #
ghz3 = np.zeros(8, complex)
ghz3[0] = R2  # |000>
ghz3[7] = R2  # |111>
rho_ghz = density(ghz3)
box = partial_trace_last(rho_ghz, 2)  # keep qubits 0, 1; trace out qubit 2
box_direct = mixture([(0.5, ket("00")), (0.5, ket("11"))])
box_tr3_gap = float(np.max(np.abs(box - box_direct)))

probs_ghz = np.abs(ghz3) ** 2
ghz_p3 = float(sum(probs_ghz[i] for i in range(8) if format(i, "03b")[-1] == "0"))

pxx = pauli_string("XX")
pyy = pauli_string("YY")
pzz = pauli_string("ZZ")
box_xx = trace_of(pxx, box)
box_yy = trace_of(pyy, box)
box_zz = trace_of(pzz, box)
box_pur = purity(box)
box_coh = float(abs(box[0, 3]))
box_arrows_zero = float(np.linalg.norm(reduced_bloch(ptrace2(box, 0))) + np.linalg.norm(reduced_bloch(ptrace2(box, 1))))

phi_plus = np.zeros(4, complex)
phi_plus[0] = R2
phi_plus[3] = R2
rho_phi = density(phi_plus)
phi_xx = expectation(phi_plus, pxx)
phi_yy = expectation(phi_plus, pyy)
phi_zz = expectation(phi_plus, pzz)
phi_coh = float(abs(rho_phi[0, 3]))
phi_pur = purity(rho_phi)
phi_arrows_zero = float(np.linalg.norm(reduced_bloch(ptrace2(rho_phi, 0))) + np.linalg.norm(reduced_bloch(ptrace2(rho_phi, 1))))

# ---------------------------------------------------------------------------------------------- #
# q8-pure-rho / q8-trace-rule: one pure state                                                     #
# ---------------------------------------------------------------------------------------------- #
n_ket = ket_from_bloch(np.radians(60), np.radians(45))
rho_n = density(n_ket)
rho_n_r = reduced_bloch(rho_n)
rho_n00 = float(np.real(rho_n[0, 0]))
rho_n11 = float(np.real(rho_n[1, 1]))
rho_n01_abs = float(abs(rho_n[0, 1]))
rho_n01_deg = deg_of(rho_n[0, 1])
rho_n_tr = float(np.real(np.trace(rho_n)))
rho_n_sq_gap = float(np.max(np.abs(rho_n @ rho_n - rho_n)))
rho_n_herm_gap = float(np.max(np.abs(rho_n - rho_n.conj().T)))
n_phase = n_ket * np.exp(1j * np.radians(37))
phase_gap = float(np.max(np.abs(density(n_phase) - rho_n)))

hs = 0.5 * Z1
comm = hs @ rho_n - rho_n @ hs
vn_comm01_abs = float(abs(comm[0, 1]))
vn_comm_diag_gap = float(np.hypot(np.real(comm[0, 0]), np.real(comm[1, 1])))
vn_check = float(abs(comm[0, 1] - rho_n[0, 1]))

u_quarter = expm(-1j * hs * (np.pi / 2))
rho_n_quarter = u_quarter @ rho_n @ u_quarter.conj().T
rho_n_quarter_r = reduced_bloch(rho_n_quarter)
rho_quarter_diag0 = float(np.real(rho_n_quarter[0, 0]))
rho_quarter_diag1 = float(np.real(rho_n_quarter[1, 1]))
rho_quarter01_abs = float(abs(rho_n_quarter[0, 1]))
rho_quarter01_deg = deg_of(rho_n_quarter[0, 1])
quarter_turn_deg = float(abs(rho_quarter01_deg - rho_n01_deg))

p0_proj = np.diag([1, 0]).astype(complex)
p1_proj = np.diag([0, 1]).astype(complex)
meas_p0 = trace_of(p0_proj, rho_n)
meas_p1 = trace_of(p1_proj, rho_n)
nonsel = p0_proj @ rho_n @ p0_proj + p1_proj @ rho_n @ p1_proj
nonsel_off_diag = float(abs(nonsel[0, 1]))
nonsel0 = float(np.real(nonsel[0, 0]))
nonsel1 = float(np.real(nonsel[1, 1]))
diag_rho_quarter = np.diag([rho_n_quarter[0, 0], rho_n_quarter[1, 1]])
comm_diag_gap = float(np.hypot(np.real((hs @ diag_rho_quarter - diag_rho_quarter @ hs)[0, 0]), 0))

# ---------------------------------------------------------------------------------------------- #
# q8-mixed: ensembles, purity, the ball, a thermal box, HW2 P4                                     #
# ---------------------------------------------------------------------------------------------- #
zx = mixture([(0.5, ket("0")), (0.5, ket("+"))])
zx_r = reduced_bloch(zx)
zx_pur = purity(zx)
zx_det = float(np.real(np.linalg.det(zx)))

half_i = 0.5 * I1
half_i_gap_z = float(np.max(np.abs(mixture([(0.5, ket("0")), (0.5, ket("1"))]) - half_i)))
half_i_gap_x = float(np.max(np.abs(mixture([(0.5, ket("+")), (0.5, ket("-"))]) - half_i)))
half_i_gap_y = float(np.max(np.abs(mixture([(0.5, PLUS_Y2), (0.5, MINUS_Y2)]) - half_i)))

therm_x = 2.0
therm_rz = float(np.tanh(therm_x / 2))
therm_p_up = (1 + therm_rz) / 2
therm_p_down = 1 - therm_p_up
therm_sz = therm_rz / 2

p4_p = 0.25
rho_p4 = mixture([(p4_p, ket("1")), (1 - p4_p, ket("+"))])
rho_p4_r = reduced_bloch(rho_p4)
p4_pur = purity(rho_p4)

rho_r_half = np.diag([0.75, 0.25]).astype(complex)
pur_r_centre = purity(half_i)
pur_r_half = purity(rho_r_half)
pur_r_surface = purity(rho_n)

# ---------------------------------------------------------------------------------------------- #
# q8-ball: rho = 1/2(I + r.sigma), positivity, a bad matrix                                        #
# ---------------------------------------------------------------------------------------------- #
zx_a0 = float(np.real(np.trace(zx))) / 2
zx_ax = zx_r[0] / 2
zx_ay = zx_r[1] / 2 + 0.0
zx_az = zx_r[2] / 2
n_det = float(np.real(np.linalg.det(rho_n)))
n_eig = np.linalg.eigvalsh(rho_n)
n_eig_large = float(n_eig[-1])
n_eig_small = float(n_eig[0])
n_rlen = float(np.linalg.norm(reduced_bloch(rho_n)))
tr_sig_sig_diag = float(np.real(np.trace(X1 @ X1)))
tr_sig_sig_off = float(np.real(np.trace(X1 @ Z1)))

bad = 0.5 * I1 + R2 * X1
bad_r = reduced_bloch(bad)
bad_rx = float(bad_r[0])
bad_rlen = float(np.linalg.norm(bad_r))
bad_det = float(np.real(np.linalg.det(bad)))
bad_eig = np.linalg.eigvalsh(bad)
bad_eig_small = float(bad_eig[0])
bad_eig_large = float(bad_eig[-1])
bad_eig_small_abs = float(abs(bad_eig[0]))
bad_hermitian = np.max(np.abs(bad - bad.conj().T)) < 1e-9
bad_is_density = 1.0 if (bad_hermitian and abs(np.trace(bad).real - 1) < 1e-9 and bad_eig[0] >= -1e-9) else 0.0

# ---------------------------------------------------------------------------------------------- #
# q8-recipes: eigen-recipes, convexity, unitary freedom, the trine                                 #
# ---------------------------------------------------------------------------------------------- #
half_gap_z = half_i_gap_z
half_gap_x = half_i_gap_x
half_gap_y = half_i_gap_y

eigvals, eigvecs = np.linalg.eigh(zx)  # ascending
order = np.argsort(-eigvals)
zx_eig_p = eigvals[order]
zx_eig_kets = [canonical_phase(eigvecs[:, i]) for i in order]
u_plus, u_minus = zx_eig_kets[0], zx_eig_kets[1]
u_plus0, u_plus1 = float(np.real(u_plus[0])), float(np.real(u_plus[1]))
u_minus0, u_minus1 = float(np.real(u_minus[0])), float(np.real(u_minus[1]))
u_h_eig_plus = expectation(u_plus, H1)
u_h_eig_minus = expectation(u_minus, H1)
rho_from_eigen = zx_eig_p[0] * density(u_plus) + zx_eig_p[1] * density(u_minus)
eig_recipe_gap = float(np.max(np.abs(rho_from_eigen - zx)))

conv_rho_025 = mixture([(0.25, ket("0")), (0.75, ket("+"))])
conv_r_025 = reduced_bloch(conv_rho_025)
conv_pur_025 = purity(conv_rho_025)

z_poles_mat = ens_matrix([0.5, 0.5], [ket("0"), ket("1")], 2, 2)
x_poles_mat = ens_matrix([0.5, 0.5], [ket("+"), ket("-")], 2, 2)
u_free_poles = ensemble_unitary(z_poles_mat, x_poles_mat)
u_free_poles_gap = float(np.max(np.abs(u_free_poles - H1)))

zx_ensemble_mat = ens_matrix([0.5, 0.5], [ket("0"), ket("+")], 2, 2)
zx_eigen_mat = ens_matrix(list(zx_eig_p[:2]), [u_plus, u_minus], 2, 2)
u_free_zx = ensemble_unitary(zx_ensemble_mat, zx_eigen_mat)
u_free_zx_gap = float(np.max(np.abs(u_free_zx - H1)))

trine_kets = [
    ket_from_bloch(0.0, 0.0),
    ket_from_bloch(np.radians(120), 0.0),
    ket_from_bloch(np.radians(120), np.radians(180)),
]
trine_rho = mixture([(1 / 3, k) for k in trine_kets])
trine_gap = float(np.max(np.abs(trine_rho - half_i)))
trine_r = reduced_bloch(trine_rho)
trine_rlen = float(np.linalg.norm(trine_r))

trine_mat = ens_matrix([1 / 3, 1 / 3, 1 / 3], trine_kets, 3, 2)
z_poles_mat3 = ens_matrix([0.5, 0.5], [ket("0"), ket("1")], 3, 2)
u_trine = ensemble_unitary(trine_mat, z_poles_mat3)
trine_unitary_gap = float(np.max(np.abs(u_trine.conj().T @ u_trine - np.eye(3))))

values = {
    # reusable constants
    "q8Half": 0.5,
    "q8NegHalf": -0.5,
    "q8Quarter": 0.25,
    "q8NegQuarter": -0.25,
    "q8ThreeQuarter": 0.75,
    "q8Eighth": 0.125,
    "q8Third": 1 / 3,
    "q8R2": R2,
    "q8Sqrt32": np.sqrt(3) / 2,
    # q8-why
    "q8GhzP3": ghz_p3,
    "q8BoxTr3Gap": box_tr3_gap,
    "q8BoxCoh": box_coh,
    "q8BoxXX": box_xx,
    "q8BoxYY": box_yy,
    "q8BoxZZ": box_zz,
    "q8BoxPur": box_pur,
    "q8BoxArrowsZero": box_arrows_zero,
    "q8PhiXX": phi_xx,
    "q8PhiYY": phi_yy,
    "q8PhiZZ": phi_zz,
    "q8PhiCoh": phi_coh,
    "q8PhiPur": phi_pur,
    "q8PhiArrowsZero": phi_arrows_zero,
    # q8-pure-rho
    "q8RhoN00": rho_n00,
    "q8RhoN11": rho_n11,
    "q8RhoN01Abs": rho_n01_abs,
    "q8RhoN01Deg": rho_n01_deg,
    "q8RhoNTr": rho_n_tr,
    "q8RhoNSqGap": rho_n_sq_gap,
    "q8RhoNHermGap": rho_n_herm_gap,
    "q8PhaseGap": phase_gap,
    # q8-trace-rule
    "q8TrXN": float(rho_n_r[0]),
    "q8TrYN": float(rho_n_r[1]),
    "q8TrZN": float(rho_n_r[2]),
    "q8VNComm01Abs": vn_comm01_abs,
    "q8VNCommDiagGap": vn_comm_diag_gap,
    "q8VNCheck": vn_check,
    "q8RhoQuarterDiag0": rho_quarter_diag0,
    "q8RhoQuarterDiag1": rho_quarter_diag1,
    "q8RhoQuarter01Abs": rho_quarter01_abs,
    "q8RhoQuarter01Deg": rho_quarter01_deg,
    "q8QuarterTurnDeg": quarter_turn_deg,
    "q8NQuarterRx": float(rho_n_quarter_r[0]),
    "q8NQuarterRy": float(rho_n_quarter_r[1]),
    "q8NQuarterRz": float(rho_n_quarter_r[2]),
    "q8MeasP0": meas_p0,
    "q8MeasP1": meas_p1,
    "q8NonSelOffDiag": nonsel_off_diag,
    "q8NonSel0": nonsel0,
    "q8NonSel1": nonsel1,
    "q8CommDiagGap": comm_diag_gap,
    # q8-mixed
    "q8ZXRx": float(zx_r[0]),
    "q8ZXRy": float(zx_r[1]),
    "q8ZXRz": float(zx_r[2]),
    "q8ZXRLen": float(np.linalg.norm(zx_r)),
    "q8ZX00": float(np.real(zx[0, 0])),
    "q8ZX01": float(np.real(zx[0, 1])),
    "q8ZX11": float(np.real(zx[1, 1])),
    "q8ZX00Sq": float(np.real(zx[0, 0])) ** 2,
    "q8ZX01Sq": float(np.real(zx[0, 1])) ** 2,
    "q8ZXPur": zx_pur,
    "q8ZXDet": zx_det,
    "q8HalfIGapZ": half_i_gap_z,
    "q8HalfIGapX": half_i_gap_x,
    "q8HalfIGapY": half_i_gap_y,
    "q8ThermX": therm_x,
    "q8ThermPUp": therm_p_up,
    "q8ThermPDown": therm_p_down,
    "q8ThermSz": therm_sz,
    "q8ThermR": therm_rz,
    "q8P4In": p4_p,
    "q8P4Pur": p4_pur,
    "q8P4Rho00": float(np.real(rho_p4[0, 0])),
    "q8P4Rho01": float(np.real(rho_p4[0, 1])),
    "q8P4Rho11": float(np.real(rho_p4[1, 1])),
    "q8P4SigX": float(rho_p4_r[0]),
    "q8P4SigY": float(rho_p4_r[1]),
    "q8P4SigZ": float(rho_p4_r[2]),
    "q8PurRCentre": pur_r_centre,
    "q8PurRHalf": pur_r_half,
    "q8PurRSurface": pur_r_surface,
    # q8-ball
    "q8ZXA0": zx_a0,
    "q8ZXAx": float(zx_ax),
    "q8ZXAy": float(zx_ay),
    "q8ZXAz": float(zx_az),
    "q8NDet": n_det,
    "q8NEigLarge": n_eig_large,
    "q8NEigSmall": n_eig_small,
    "q8NRLen": n_rlen,
    "q8TrSigSigDiag": tr_sig_sig_diag,
    "q8TrSigSigOff": tr_sig_sig_off,
    "q8BadRx": bad_rx,
    "q8BadRLen": bad_rlen,
    "q8BadDet": bad_det,
    "q8BadEigLarge": bad_eig_large,
    "q8BadEigSmall": bad_eig_small,
    "q8BadEigSmallAbs": bad_eig_small_abs,
    "q8BadIsDensity": bad_is_density,
    # q8-recipes
    "q8HalfGapZ": half_gap_z,
    "q8HalfGapX": half_gap_x,
    "q8HalfGapY": half_gap_y,
    "q8ZXEigLarge": float(zx_eig_p[0]),
    "q8ZXEigSmall": float(zx_eig_p[1]),
    "q8UPlus0": u_plus0,
    "q8UPlus1": u_plus1,
    "q8UMinus0": u_minus0,
    "q8UMinus1": u_minus1,
    "q8UHEigPlus": u_h_eig_plus,
    "q8UHEigMinus": u_h_eig_minus,
    "q8EigRecipeGap": eig_recipe_gap,
    "q8ConvRx025": float(conv_r_025[0]),
    "q8ConvRz025": float(conv_r_025[2]),
    "q8ConvPur025": conv_pur_025,
    "q8UfreePolesGap": u_free_poles_gap,
    "q8UfreeZXGap": u_free_zx_gap,
    "q8TrineGap": trine_gap,
    "q8TrineRLen": trine_rlen,
    "q8TrineUUnitary": trine_unitary_gap,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q8.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q8, numpy (direct matrix construction: hand-written "
            "2x2/4x4/8x8 gate and state arrays via np.kron/np.outer, scipy.linalg.expm for the von Neumann "
            "time-evolution check, numpy's own full SVD for the unitary-freedom theorem; never physics/qc/"
            "density.ts, physics/qc/cmat.ts or Q8.values.ts's own helpers). "
            "Regenerate: python3 pipeline/claims_qc709/q8.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
