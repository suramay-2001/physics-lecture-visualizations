#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q6.values.ts (Physics 709, chapter Q6).

Independent route (never Q6.values.ts's own helper functions, and never physics/qc/circuit.ts `runCircuit`):
every state and operator here is built by direct numpy matrix construction and multiplication from hand-written
2x2 / 4x4 arrays, with numpy.kron for tensor products. CNOT is built as a projector sum, |0><0| kron I + |1><1|
kron X, independent of any embed/gate-table helper. The Bell-measurement circuit U = (H kron I) @ CNOT is built the
same way and applied directly to kets; HW2's triplet-and-singlet basis is four explicit 4-vectors.

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q6.py -> app/src/physics/__fixtures__/claims-qc709/q6.json
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


def cnot2():
    """CNOT (control q0, target q1) as a projector sum, independent of any embed helper."""
    p0 = np.array([[1, 0], [0, 0]], complex)
    p1 = np.array([[0, 0], [0, 1]], complex)
    return np.kron(p0, I1) + np.kron(p1, X1)


def embed1(gate, q, n=2):
    """`gate` (2x2) on qubit q of n qubits, identity elsewhere."""
    mats = [I1] * n
    mats[q] = gate
    out = mats[0]
    for m in mats[1:]:
        out = np.kron(out, m)
    return out


def pauli_string(s):
    letters = {"I": I1, "X": X1, "Y": Y1, "Z": Z1}
    out = letters[s[0]]
    for ch in s[1:]:
        out = np.kron(out, letters[ch])
    return out


def bell(x, y):
    """|beta_xy> = (|0,y> + (-1)^x |1, 1-y>)/sqrt2 (notes Eq. 2.4), built by hand (never state.ts `bell`)."""
    v = np.zeros(4, complex)
    v[int(f"0{y}", 2)] += R2
    v[int(f"1{1 - y}", 2)] += ((-1) ** x) * R2
    return v


PHI_PLUS = bell(0, 0)
PHI_MINUS = bell(1, 0)
PSI_PLUS = bell(0, 1)
PSI_MINUS = bell(1, 1)

CNOT = cnot2()
H_ON_0 = embed1(H1, 0)
U_BM = H_ON_0 @ CNOT  # Fig. 7's measuring circuit, U = (H kron I) CNOT

XX = pauli_string("XX")
ZZ = pauli_string("ZZ")
YY = pauli_string("YY")
I4 = np.eye(4, dtype=complex)


def coef_matrix(psi):
    """The 2x2 coefficient matrix C_ab = <a,b|psi> for a two-qubit ket (state.ts `coefMatrix`, independent route)."""
    return psi.reshape(2, 2)


def det2x2(C):
    return C[0, 0] * C[1, 1] - C[0, 1] * C[1, 0]


def pauli_eigenvalue(psi, P, eps=1e-9):
    out = P @ psi
    for lam in (1, -1):
        if np.max(np.abs(out - lam * psi)) < eps:
            return float(lam)
    return 0.0


def clifford_sign(U, P, eps=1e-9):
    """U P U^dagger, identified as (sign) * (some Pauli string), by trace inner product against every 2-qubit
    Pauli string; returns the sign only (Q6 only ever needs the sign, never the string, here)."""
    M = U @ P @ U.conj().T
    for letters in ["II", "IX", "IY", "IZ", "XI", "XX", "XY", "XZ", "YI", "YX", "YY", "YZ", "ZI", "ZX", "ZY", "ZZ"]:
        Q = pauli_string(letters)
        lam = np.trace(Q @ M) / 4
        if abs(lam) > 0.5:
            sign = 1.0 if lam.real > 0 else -1.0
            return sign
    return 0.0


def pauli_mul_phase(a, b):
    """Pa Pb = phase * P_result, single-qubit table, phase accumulated per qubit (gates.ts PAULI_MUL, independent
    hand-written table here)."""
    table = {
        "II": (1, "I"), "IX": (1, "X"), "IY": (1, "Y"), "IZ": (1, "Z"),
        "XI": (1, "X"), "XX": (1, "I"), "XY": (1j, "Z"), "XZ": (-1j, "Y"),
        "YI": (1, "Y"), "YX": (-1j, "Z"), "YY": (1, "I"), "YZ": (1j, "X"),
        "ZI": (1, "Z"), "ZX": (1j, "Y"), "ZY": (-1j, "X"), "ZZ": (1, "I"),
    }
    phase = 1 + 0j
    for ka, kb in zip(a, b):
        ph, _ = table[ka + kb]
        phase *= ph
    return phase


# ---------------------------------------------------------------------------------------------- #
# q6-bell-basis (HW2 P1): the triplet-and-singlet basis, built by hand from the two spin-1/2 kets.
# ---------------------------------------------------------------------------------------------- #
T1 = ket("00")           # |1,1>
T0 = PSI_PLUS             # |1,0> = Psi+
Tm1 = ket("11")           # |1,-1>
S0 = PSI_MINUS            # |0,0> = singlet = Psi-
TS_BASIS = [T1, T0, Tm1, S0]

plus_x_plus_x = np.kron(PLUS2, PLUS2)
minus_x_minus_x = np.kron(MINUS2, MINUS2)
plus_x_minus_x = np.kron(PLUS2, MINUS2)
minus_x_plus_x = np.kron(MINUS2, PLUS2)
sym_pm = (plus_x_minus_x + minus_x_plus_x) * R2

p1a_mid = np.vdot(T0, plus_x_plus_x)
p1b_mid = np.vdot(T0, minus_x_minus_x)
p1c_singlet = np.vdot(S0, plus_x_minus_x)
p1c_sym_is_phi_minus = 1.0 if np.max(np.abs(sym_pm - PHI_MINUS)) < 1e-9 else 0.0

S_X_TOT = 0.5 * (np.kron(X1, I1) + np.kron(I1, X1))
stot_entry = np.vdot(T1, S_X_TOT @ T0)
stot_singlet_row = max(abs(np.vdot(S0, S_X_TOT @ b)) for b in TS_BASIS)

# ---------------------------------------------------------------------------------------------- #
# q6-bell-circuit (HW2 P2): the measuring circuit applied directly to ket('0+') and to Psi_2.
# ---------------------------------------------------------------------------------------------- #
psi1_bell_amps = U_BM @ ket("0+")
p2a = float(abs(psi1_bell_amps[0]) ** 2)

ry_pi3 = np.array([[np.cos(np.pi / 6), -np.sin(np.pi / 6)], [np.sin(np.pi / 6), np.cos(np.pi / 6)]], complex)
psi2 = CNOT @ embed1(ry_pi3, 0) @ ket("00")  # (sqrt3 |00> + |11>)/2
psi2_bell_amps = U_BM @ psi2
psi2_probs = np.abs(psi2_bell_amps) ** 2

# ---------------------------------------------------------------------------------------------- #
# q6-parities
# ---------------------------------------------------------------------------------------------- #
hzh = H1 @ Z1 @ H1
hzh_dev = float(np.max(np.abs(hzh - X1)))
anti_xz = float(np.max(np.abs(X1 @ Z1 + Z1 @ X1)))
comm_xxzz = float(np.max(np.abs(XX @ ZZ - ZZ @ XX)))
xxzz_sign = float(pauli_mul_phase("XX", "ZZ").real)

cnot_xi_sign = clifford_sign(CNOT, np.kron(X1, I1))
cnot_iz_sign = clifford_sign(CNOT, np.kron(I1, Z1))
heis_zi_sign = clifford_sign(U_BM.conj().T, np.kron(Z1, I1))
heis_iz_sign = clifford_sign(U_BM.conj().T, np.kron(I1, Z1))
inv_xx_sign = clifford_sign(U_BM, XX)
inv_zz_sign = clifford_sign(U_BM, ZZ)

eig_xx_beta00 = pauli_eigenvalue(PHI_PLUS, XX)
eig_zz_beta00 = pauli_eigenvalue(PHI_PLUS, ZZ)
eig_yy_beta00 = pauli_eigenvalue(PHI_PLUS, YY)
eig_xx_beta10 = pauli_eigenvalue(PHI_MINUS, XX)
eig_xx_psi_minus = pauli_eigenvalue(PSI_MINUS, XX)

M_HAT = (I4 - XX) + 0.5 * (I4 - ZZ)
m_eig_beta00 = float(np.vdot(PHI_PLUS, M_HAT @ PHI_PLUS).real)
m_eig_beta10 = float(np.vdot(PHI_MINUS, M_HAT @ PHI_MINUS).real)
m_eig_beta11 = float(np.vdot(PSI_MINUS, M_HAT @ PSI_MINUS).real)

N1 = 0.5 * (I4 - np.kron(Z1, I1))
n1_beta00 = float(np.vdot(ket("00"), N1 @ ket("00")).real)
n1_beta11 = float(np.vdot(ket("11"), N1 @ ket("11")).real)

psi2_full = psi2  # Psi_2 itself (before the measuring circuit)
psi2_exp_xx = float(np.vdot(psi2_full, XX @ psi2_full).real)
psi2_exp_zz = float(np.vdot(psi2_full, ZZ @ psi2_full).real)

psi1_product = ket("0+")
p2b_exp_xx = float(np.vdot(psi1_product, XX @ psi1_product).real)
p2b_exp_zz = float(np.vdot(psi1_product, ZZ @ psi1_product).real)

# ---------------------------------------------------------------------------------------------- #
# q6-entangled
# ---------------------------------------------------------------------------------------------- #
C_phi_plus = coef_matrix(PHI_PLUS)
det_phi = float(det2x2(C_phi_plus).real)

cz_pp = np.diag([1, 1, 1, -1]).astype(complex) @ np.kron(PLUS2, PLUS2)
C_czpp = coef_matrix(cz_pp)
det_czpp = float(det2x2(C_czpp).real)

values = {
    # reusable constants
    "q6Half": 0.5,
    "q6NegHalf": -0.5,
    "q6R2": R2,
    "q6NegR2": -R2,
    "q6Sqrt32": np.sqrt(3) / 2,
    "q6Quarter": 0.25,

    # q6-many
    "q6AmpN1": float(len(ket("0"))),
    "q6AmpN2": float(len(ket("00"))),
    "q6AmpN3": float(len(ket("000"))),
    "q6AmpN10": float(2 ** 10),
    "q6DimSpin1": 2.0 * 3.0,
    "q6Amp30B": 2 ** 30 / 1e9,
    "q6Gib30": (2 ** 30 * 16) / 2 ** 30,

    # q6-tensor
    "q6XZEntry": float(np.kron(X1, Z1)[1, 3].real),

    # q6-entangled
    "q6Param3General": 2 * 2 ** 3 - 2,
    "q6Param3Product": 2 * 3,
    "q6Param3Frac": (2 * 3) / (2 * 2 ** 3 - 2),
    "q6Param10General": 2 * 2 ** 10 - 2,
    "q6Param10Product": 2 * 10,
    "q6Param10Frac": (2 * 10) / (2 * 2 ** 10 - 2),
    "q6DetPhi": det_phi,
    "q6RankPhi": float(np.linalg.matrix_rank(C_phi_plus)),
    "q6DetProd": 0.0,
    "q6DetPP": 0.0,
    "q6DetCZpp": det_czpp,

    # q6-bell-basis (HW2 P1)
    "q6P1aMid": float(p1a_mid.real),
    "q6P1bMid": float(p1b_mid.real),
    "q6P1cS": float(p1c_singlet.real),
    "q6P1cSymIsPhiMinus": p1c_sym_is_phi_minus,
    "q6StotEntry": float(stot_entry.real),
    "q6StotSingletRow": float(stot_singlet_row),

    # q6-bell-circuit (HW2 P2)
    "q6P2a": p2a,
    "q6P2c00": float(psi2_probs[0]),
    "q6P2c10": float(psi2_probs[2]),
    "q6P2cAmp00": float(psi2_bell_amps[0].real),
    "q6P2cAmp10": float(psi2_bell_amps[2].real),

    # q6-parities
    "q6HZH": hzh_dev,
    "q6AntiXZ": anti_xz,
    "q6Comm": comm_xxzz,
    "q6XXZZSign": xxzz_sign,
    "q6CnotXISign": cnot_xi_sign,
    "q6CnotIZSign": cnot_iz_sign,
    "q6HeisZISign": heis_zi_sign,
    "q6HeisIZSign": heis_iz_sign,
    "q6EigXXBeta00": eig_xx_beta00,
    "q6EigZZBeta00": eig_zz_beta00,
    "q6EigYYBeta00": eig_yy_beta00,
    "q6EigXXBeta10": eig_xx_beta10,
    "q6EigXXPsiMinus": eig_xx_psi_minus,
    "q6MEigBeta00": m_eig_beta00,
    "q6MEigBeta10": m_eig_beta10,
    "q6MEigBeta11": m_eig_beta11,
    "q6InvXXSign": inv_xx_sign,
    "q6InvZZSign": inv_zz_sign,
    "q6N1Beta00": n1_beta00,
    "q6N1Beta11": n1_beta11,
    "q6Psi2ExpXX": psi2_exp_xx,
    "q6Psi2ExpZZ": psi2_exp_zz,
    "q6P2bExpXX": p2b_exp_xx,
    "q6P2bExpZZ": p2b_exp_zz,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q6.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q6, numpy (direct matrix construction: hand-written "
            "gate/Bell/CNOT matrices, the measuring circuit U = (H kron I) CNOT applied directly to kets; never "
            "physics/qc/circuit.ts runCircuit or Q6.values.ts's own helpers). "
            "Regenerate: python3 pipeline/claims_qc709/q6.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
