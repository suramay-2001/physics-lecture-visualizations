#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q13.values.ts (Physics 709, chapter Q13).

Independent route (never Q13.values.ts's own helpers, never physics/qc/channels.ts, physics/qc/density.ts or
physics/qc/circuit.ts): every Kraus operator, gate and state here is built by direct numpy matrix construction
(hand-written 2x2/4x4 arrays), and every channel is applied by hand as Sum_m K_m rho K_m^dagger -- never by calling
the TS engine's `applyKraus`. The partial transpose, the reduced Bloch vector and the CNOT fidelities are each
re-derived from first principles (index arithmetic / np.vdot), not by re-using any engine routine.

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q13.py -> app/src/physics/__fixtures__/claims-qc709/q13.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write
byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

R2 = 1 / np.sqrt(2)

I1 = np.eye(2, dtype=complex)
X1 = np.array([[0, 1], [1, 0]], complex)
Y1 = np.array([[0, -1j], [1j, 0]], complex)
Z1 = np.array([[1, 0], [0, -1]], complex)

ZERO2 = np.array([1, 0], complex)
ONE2 = np.array([0, 1], complex)
PLUS2 = (ZERO2 + ONE2) * R2
MINUS2 = (ZERO2 - ONE2) * R2


def ket(label):
    """A product ket from a label, one char per qubit, q0 first: '0','1','+','-' (state.ts `ket`)."""
    one = {"0": ZERO2, "1": ONE2, "+": PLUS2, "-": MINUS2}
    out = one[label[0]]
    for ch in label[1:]:
        out = np.kron(out, one[ch])
    return out


def density(psi):
    return np.outer(psi, psi.conj())


def apply_kraus(ks, rho):
    """Sum_m K_m rho K_m^dagger."""
    return sum(K @ rho @ K.conj().T for K in ks)


def fidelity_pure(a, b):
    """Root fidelity of two pure (possibly unnormalized) states (Q13's convention: fidelity means ROOT fidelity)."""
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    return float(abs(np.vdot(a, b)) / (na * nb))


def reduced_bloch_1q(rho2x2):
    """r = (2 Re rho01, -2 Im rho01, rho00 - rho11) of a 1-qubit density matrix (density.ts `reducedBloch`)."""
    rx = 2 * np.real(rho2x2[0, 1])
    ry_ = -2 * np.imag(rho2x2[0, 1])
    rz = np.real(rho2x2[0, 0] - rho2x2[1, 1])
    return np.array([rx, ry_, rz])


def partial_trace_2q(rho4x4, keep):
    """Partial trace of a 2-qubit (4x4) density matrix, keeping qubit `keep` (0 or 1)."""
    trace_out = 1 - keep
    out = np.zeros((2, 2), complex)
    for a in range(2):
        for b in range(2):
            s = 0j
            for t in range(2):
                ia = (a, t) if keep == 0 else (t, a)
                ib = (b, t) if keep == 0 else (t, b)
                i = ia[0] * 2 + ia[1]
                j = ib[0] * 2 + ib[1]
                s += rho4x4[i, j]
            out[a, b] = s
    return out


def ptranspose_qubit1(rho4x4):
    """Partial transpose on qubit 1 (the second/last qubit) of a 2-qubit (4x4) density matrix: swap qubit 1's bit
    between the row and column index (density.ts `ptranspose`, mask m = 1 for qubit 1 of n = 2)."""
    out = np.zeros((4, 4), complex)
    m = 1  # qubitMask(1, 2) = 1 << (2-1-1) = 1
    for i in range(4):
        for j in range(4):
            ii = (i & ~m) | (j & m)
            jj = (j & ~m) | (i & m)
            out[i, j] = rho4x4[ii, jj]
    return out


def embed_cnot_2q(ctrl, target):
    """CNOT(ctrl -> target) on a 2-qubit register (q0 the most significant bit)."""
    d = 4
    out = np.zeros((d, d), complex)
    for i in range(d):
        bits = [(i >> 1) & 1, i & 1]
        if bits[ctrl] == 1:
            bits[target] ^= 1
        j = bits[0] * 2 + bits[1]
        out[j, i] = 1
    return out


CNOT01 = embed_cnot_2q(0, 1)

# ---------------------------------------------------------------------------------------------- #
# q13-from-unitary / q13-stinespring: completeness, Sum_m A_m^dagger A_m = I                       #
# ---------------------------------------------------------------------------------------------- #
# dephasing(p): {sqrt(1-p) I, sqrt(p) Z} (channels.ts `dephasing`)
def dephasing_kraus(p):
    return [np.sqrt(1 - p) * I1, np.sqrt(p) * Z1]


# depolarizing(p): {sqrt(1-p) I, sqrt(p/3) X, sqrt(p/3) Y, sqrt(p/3) Z} (channels.ts `depolarizing`)
def depolarizing_kraus(p):
    return [np.sqrt(1 - p) * I1, np.sqrt(p / 3) * X1, np.sqrt(p / 3) * Y1, np.sqrt(p / 3) * Z1]


def sum_adag_a(ks):
    return sum(K.conj().T @ K for K in ks)


deph_sum_gap = float(np.max(np.abs(sum_adag_a(dephasing_kraus(0.5)) - I1)))
depol_sum_gap = float(np.max(np.abs(sum_adag_a(depolarizing_kraus(0.5)) - I1)))


def choi_unnormalized(ks, d=2):
    """J = Sum_{ij} E(|i><j|) kron |i><j|, built from np.kron and elementary matrices (rank is order-independent)."""
    J = np.zeros((d * d, d * d), complex)
    for i in range(d):
        for j in range(d):
            e_ij = np.zeros((d, d), complex)
            e_ij[i, j] = 1
            J += np.kron(apply_kraus(ks, e_ij), e_ij)
    return J


# The Kraus bound N^2 = 4, as the Choi RANK of depolarizing(1/2) (all four Pauli terms independent).
max_kraus_2 = float(np.linalg.matrix_rank(choi_unnormalized(depolarizing_kraus(0.5))))

# Bergou p. 67's flawed Stinespring extension for dephasing(1/2): V = Sum_m A_m kron |m>_E (4x2), U = V on H_S x |0>_E,
# U = identity on H_S x |1>_E. Built from kron products (not the TS engine's hand-written 4x4); ||U^dag U - I|| > 0.
_E0 = np.array([[1], [0]], complex)
_E1 = np.array([[0], [1]], complex)
_V_ISO = sum(np.kron(K, e) for K, e in zip(dephasing_kraus(0.5), (_E0, _E1)))
_U_BAD = _V_ISO @ np.kron(I1, _E0).T + np.kron(I1, _E1 @ _E1.T)
stinespring_id_ext_gap = float(np.max(np.abs(_U_BAD.conj().T @ _U_BAD - np.eye(4))))

# ---------------------------------------------------------------------------------------------- #
# q13-properties: the transpose's Choi matrix (Phi+'s partial transpose)                           #
# ---------------------------------------------------------------------------------------------- #
PHI_PLUS = (np.kron(ket("0"), ket("0")) + np.kron(ket("1"), ket("1"))) * R2
PHI_RHO = density(PHI_PLUS)
PHI_PT = ptranspose_qubit1(PHI_RHO)
phi_pt_eigs = np.linalg.eigvalsh(PHI_PT)  # ascending, like cmat.ts `eigh`
transpose_spec_min = float(phi_pt_eigs[0])
transpose_spec_max = float(phi_pt_eigs[-1])

# ---------------------------------------------------------------------------------------------- #
# q13-depolarizing: the shrinking Bloch ball, and amplitude damping's offset                       #
# ---------------------------------------------------------------------------------------------- #
RHO_PLUS = density(ket("+"))


def depol_factor_at(p):
    out = apply_kraus(depolarizing_kraus(p), RHO_PLUS)
    return float(reduced_bloch_1q(out)[0])


depol_factor_p0 = depol_factor_at(0.0)
depol_factor_p50 = depol_factor_at(0.5)
depol_factor_p75 = depol_factor_at(0.75)
depol_factor_p100 = depol_factor_at(1.0)
p_three_quarters = depol_factor_p0 / (depol_factor_p0 - depol_factor_p100)  # the factor is linear in p


def amp_damping_kraus(gamma):
    return [np.array([[1, 0], [0, np.sqrt(1 - gamma)]], complex), np.array([[0, np.sqrt(gamma)], [0, 0]], complex)]


OVEN_RHO = 0.5 * I1
amp_damp_c = reduced_bloch_1q(apply_kraus(amp_damping_kraus(0.5), OVEN_RHO))
amp_damp_plus_out = reduced_bloch_1q(apply_kraus(amp_damping_kraus(0.5), RHO_PLUS))
amp_damp_zero_out = reduced_bloch_1q(apply_kraus(amp_damping_kraus(0.5), density(ket("0"))))
amp_damp_cz = float(amp_damp_c[2])
amp_damp_mxx = float(amp_damp_plus_out[0] - amp_damp_c[0])
amp_damp_mzz = float(amp_damp_zero_out[2] - amp_damp_cz)

# ---------------------------------------------------------------------------------------------- #
# q13-no-cloning                                                                                   #
# ---------------------------------------------------------------------------------------------- #
clone_basis_fid = min(fidelity_pure(CNOT01 @ ket("00"), ket("00")), fidelity_pure(CNOT01 @ ket("10"), ket("11")))
clone_sup_fid = fidelity_pure(CNOT01 @ ket("+0"), PHI_PLUS)
overlap_0_plus = float(abs(np.vdot(ket("0"), ket("+"))))

# ---------------------------------------------------------------------------------------------- #
# q13-herbert                                                                                      #
# ---------------------------------------------------------------------------------------------- #
MZ_RHO = 0.5 * density(ket("00")) + 0.5 * density(ket("11"))
MX_RHO = 0.5 * density(ket("++")) + 0.5 * density(ket("--"))
herbert_rb_z = reduced_bloch_1q(partial_trace_2q(MZ_RHO, keep=1))
herbert_rb_x = reduced_bloch_1q(partial_trace_2q(MX_RHO, keep=1))
herbert_rb_z_len = float(np.linalg.norm(herbert_rb_z))
herbert_rb_x_len = float(np.linalg.norm(herbert_rb_x))

values = {
    "q13Half": 0.5,
    "q13Quarter": 0.25,
    "q13DephSumGap": deph_sum_gap,
    "q13DepolSumGap": depol_sum_gap,
    "q13MaxKraus2": max_kraus_2,
    "q13StinespringIdExtGap": stinespring_id_ext_gap,
    "q13TransposeSpecMin": transpose_spec_min,
    "q13TransposeSpecMax": transpose_spec_max,
    "q13DepolFactorP0": depol_factor_p0,
    "q13DepolFactorP50": depol_factor_p50,
    "q13DepolFactorP75": depol_factor_p75,
    "q13DepolFactorP100": depol_factor_p100,
    "q13PThreeQuarters": p_three_quarters,
    "q13AmpDampCz": amp_damp_cz,
    "q13AmpDampMxx": amp_damp_mxx,
    "q13AmpDampMzz": amp_damp_mzz,
    "q13CloneBasisFid": clone_basis_fid,
    "q13CloneSupFid": clone_sup_fid,
    "q13Overlap0Plus": overlap_0_plus,
    "q13HerbertRbZLen": herbert_rb_z_len,
    "q13HerbertRbXLen": herbert_rb_x_len,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q13.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q13, numpy (direct matrix construction: hand-written "
            "2x2/4x4 Kraus/gate/state arrays, every channel applied by hand as Sum_m K_m rho K_m^dagger; never "
            "physics/qc/channels.ts, physics/qc/density.ts, physics/qc/circuit.ts or Q13.values.ts's own helpers). "
            "Regenerate: python3 pipeline/claims_qc709/q13.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
