#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q4.values.ts (Physics 709, chapter Q4).

Independent route (P-Q4-story.md "Evidence"): explicit 2x2 / 4x4 / 8x8 matrices and np.kron, qubit 0 the leftmost
(most significant) factor -- never the engine's applyGate/embed strided loops or its Circuit runner. Every gate is
built from its defining formula (Bergou Eqs. 1.5-1.9, N&C Eqs. 1.8-1.27), and every circuit is built as one explicit
product of kron'd matrices in the columns' own order (rightmost factor applied first), not by replaying the
content file's Circuit JSON.

Usage (from the repo root): python3 pipeline/claims_qc709/q4.py -> app/src/physics/__fixtures__/claims-qc709/q4.json
Checked by app/src/content/claims.test.ts. The output is deterministic: two runs write byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

SQRT2 = np.sqrt(2.0)
R2 = 1 / SQRT2

I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], complex)
Y = np.array([[0, -1j], [1j, 0]], complex)
Z = np.array([[1, 0], [0, -1]], complex)
H = np.array([[1, 1], [1, -1]], complex) / SQRT2
S = np.array([[1, 0], [0, 1j]], complex)
T = np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]], complex)


def Rx(theta):
    return np.cos(theta / 2) * I2 - 1j * np.sin(theta / 2) * X


def Ry(theta):
    return np.cos(theta / 2) * I2 - 1j * np.sin(theta / 2) * Y


def Rz(theta):
    return np.array([[np.exp(-1j * theta / 2), 0], [0, np.exp(1j * theta / 2)]], complex)


def rotation_n(n, phi):
    """e^{-i phi n.sigma/2} for a unit 3-vector n (Rodrigues form), independent of Rx/Ry/Rz above."""
    nx, ny, nz = n
    n_dot_sigma = nx * X + ny * Y + nz * Z
    return np.cos(phi / 2) * I2 - 1j * np.sin(phi / 2) * n_dot_sigma


def P(chi):
    return np.array([[1, 0], [0, np.exp(1j * chi)]], complex)


def ket_bloch(theta, phi):
    """cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>, the notes' two-angle form."""
    return np.array([np.cos(theta / 2), np.exp(1j * phi) * np.sin(theta / 2)], complex)


def yes(b):
    return 1.0 if b else 0.0


def bloch_vector(psi):
    psi = psi / np.linalg.norm(psi)
    a, b = psi
    ab = np.conj(a) * b
    return np.array([2 * ab.real, 2 * ab.imag, abs(a) ** 2 - abs(b) ** 2])


def probs(psi):
    return np.abs(psi) ** 2


KET0 = np.array([1, 0], complex)
KET1 = np.array([0, 1], complex)
PLUS = np.array([1, 1], complex) / SQRT2
MINUS = np.array([1, -1], complex) / SQRT2
ONE_QUBIT = {"0": KET0, "1": KET1, "+": PLUS, "-": MINUS}


def ket(label):
    """A product ket from a label, one character per qubit, q0 first (qc/state.ts `ket`)."""
    v = ONE_QUBIT[label[0]]
    for ch in label[1:]:
        v = np.kron(v, ONE_QUBIT[ch])
    return v


def index_of_bits(s):
    return int(s, 2)


PSI = ket_bloch(np.pi / 3, 0)  # (0.8660, 0.5): Q1/Q3's running state

# ---- two-qubit gates, built explicitly (never via a generic embed/kron-with-identity helper) ------------------
CNOT01 = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], complex)  # control q0, target q1
CNOT10 = np.array([[1, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0]], complex)  # control q1, target q0
CZ = np.diag([1, 1, 1, -1]).astype(complex)
SWAP = np.array([[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]], complex)

# ---- worked quantities ------------------------------------------------------------------------------------
psi_chances = probs(PSI)
psi_bloch = bloch_vector(PSI)
plus_chances = probs(PLUS)

x0 = X @ KET0
x_psi = X @ PSI
x_psi_chances = probs(x_psi)
z_psi = Z @ PSI
z_bloch = bloch_vector(z_psi)

h0 = H @ KET0
h1 = H @ KET1
h_psi = H @ PSI
h_psi_chances = probs(h_psi)
h_bloch = bloch_vector(h_psi)

s_plus = S @ PLUS
s_plus_bloch = bloch_vector(s_plus)

rx90 = Rx(np.pi / 2)
rx90_sq = rx90 @ rx90
rx90_on_zero = rx90 @ KET0
rx90_chances = probs(rx90_on_zero)

prod = np.kron(PSI, PLUS)
prod_chances = probs(prod)
prod_det = prod[0] * prod[3] - prod[1] * prod[2]
bell = (ket("00") + ket("11")) / SQRT2
bell_det = bell[0] * bell[3] - bell[1] * bell[2]

H3 = np.kron(np.kron(H, H), H)
h3_final = H3 @ ket("000")


def walsh_hadamard(n):
    N = 2 ** n
    k = 1 / np.sqrt(N)
    W = np.zeros((N, N), complex)
    for x in range(N):
        for y in range(N):
            W[x, y] = -k if bin(x & y).count("1") % 2 else k
    return W


cnot10_on_10 = CNOT01 @ ket("10")
cz_on_pp = CZ @ np.kron(PLUS, PLUS)
cz_from_cnot = np.kron(I2, H) @ CNOT01 @ np.kron(I2, H)
and_zeros = sum(1 for a in (0, 1) for b in (0, 1) if not (a and b))
copy_out = CNOT01 @ np.kron(PSI, KET0)
psi_psi = np.kron(PSI, PSI)

h_then_z = (Z @ H) @ KET0  # circuit "H then Z" = matrix ZH
z_then_h = (H @ Z) @ KET0  # circuit "Z then H" = matrix HZ

bell_mid = np.kron(H, I2) @ ket("00")
bell_final = CNOT01 @ bell_mid


def bell_formula_holds():
    for x in (0, 1):
        for y in (0, 1):
            out = CNOT01 @ np.kron(H, I2) @ ket(f"{x}{y}")
            ybar = 1 - y
            want = np.zeros(4, complex)
            want[index_of_bits(f"0{y}")] = R2
            want[index_of_bits(f"1{ybar}")] = -R2 if x else R2
            if not np.allclose(out, want, atol=1e-9):
                return False
    return True


swap_unitary = CNOT01 @ CNOT10 @ CNOT01
hhcx_unitary = np.kron(H, H) @ CNOT01 @ np.kron(H, H)
hhcx01 = hhcx_unitary @ ket("01")
hxh = H @ X @ H

prod_measure = prod_chances

m2pre_state = ket("00")
m2pre_state = np.kron(Ry(np.pi / 3), I2) @ m2pre_state
m2pre_state = CNOT01 @ m2pre_state
m2pre_state = np.kron(I2, H) @ m2pre_state
m2pre = m2pre_state
m2p0 = abs(m2pre[0]) ** 2 + abs(m2pre[1]) ** 2
m2p1 = abs(m2pre[2]) ** 2 + abs(m2pre[3]) ** 2
m2_post0 = np.array([m2pre[0], m2pre[1]])
m2_post0 = m2_post0 / np.linalg.norm(m2_post0)
m2_post1 = np.array([m2pre[2], m2pre[3]])
m2_post1 = m2_post1 / np.linalg.norm(m2_post1)

bell_m0 = abs(bell_final[0]) ** 2 + abs(bell_final[1]) ** 2
bell_m1 = abs(bell_final[2]) ** 2 + abs(bell_final[3]) ** 2
bell_post0 = np.array([bell_final[0], bell_final[1]])
bell_post0 = bell_post0 / np.linalg.norm(bell_post0)
bell_post1 = np.array([bell_final[2], bell_final[3]])
bell_post1 = bell_post1 / np.linalg.norm(bell_post1)

p_plus = abs(np.vdot(PLUS, PSI)) ** 2
p_minus = abs(np.vdot(MINUS, PSI)) ** 2
plus_formula = abs(PSI[0] + PSI[1]) ** 2 / 2

copy_read0 = abs(copy_out[0]) ** 2 + abs(copy_out[1]) ** 2
copy_read1 = abs(copy_out[2]) ** 2 + abs(copy_out[3]) ** 2
copy_read_post0 = np.array([copy_out[0], copy_out[1]])
copy_read_post0 = copy_read_post0 / np.linalg.norm(copy_read_post0)
copy_read_post1 = np.array([copy_out[2], copy_out[3]])
copy_read_post1 = copy_read_post1 / np.linalg.norm(copy_read_post1)

# ---- challenge answers (fresh states, independent of the beats above) -----------------------------------------
ch_p1 = probs(np.array([0.6, 0.8], complex))[1]
ch_complex = probs(np.array([0.6, 0.8j], complex))[1]
ch_theta = np.degrees(2 * np.arccos(np.sqrt(0.25)))
ch_x = probs(X @ np.array([0.6, 0.8], complex))[0]
ch_h1 = (H @ KET1)[1].real
ch_count = 2 ** 5
ch_prod = np.kron(np.array([0.6, 0.8], complex), np.array([0.6, 0.8], complex))[1].real
ch_index = index_of_bits("110")
ch_entry = CNOT01[3][2].real
ch_cz = (CZ @ np.array([0.5, 0.5, 0.5, 0.5], complex))[3].real
ch_copy = (CNOT01 @ np.kron(np.array([0.6, 0.8], complex), KET0))[3].real
ch_bell11 = (CNOT01 @ np.kron(H, I2) @ ket("10"))[3].real
ch_hzh = hxh[0][1].real
ch_all = probs(np.array([0.5, 0.5, 0.5, 0.5], complex))[2]
ch_first = abs(np.array([0.0, 0.8], complex)[1]) ** 2  # marginal P(q0=1) for 0.6|00>+0.8|11>: only |11> has q0=1
ch_plus0 = abs(np.vdot(PLUS, KET0)) ** 2
_post = np.array([0.5, -0.5], complex)
_post = _post / np.linalg.norm(_post)
ch_post3 = _post[1].real

arc_theta = 2 * np.pi / 3  # 120 degrees
arc_sg = np.cos(arc_theta / 2) ** 2

values = {
    # q4-qubit
    "q4PsiAlpha": PSI[0].real,
    "q4PsiBeta": PSI[1].real,
    "q4P0": psi_chances[0],
    "q4P1": psi_chances[1],
    "q4PsiVecX": psi_bloch[0],
    "q4PsiVecZ": psi_bloch[2],
    "q4PhaseSame": yes(abs(np.vdot(1j * PSI, PSI)) ** 2 > 1 - 1e-9),
    "q4PlusAmp": float(np.sqrt(plus_chances[0])),
    "q4PlusP0": plus_chances[0],
    "q4PlusP1": plus_chances[1],
    # q4-one-qubit-gates
    "q4X0": x0[1].real,
    "q4XPsi0": x_psi[0].real,
    "q4XPsi1": x_psi[1].real,
    "q4XP0": x_psi_chances[0],
    "q4XP1": x_psi_chances[1],
    "q4XUnitary": yes(np.allclose(X.conj().T @ X, I2)),
    "q4ZPsi0": z_psi[0].real,
    "q4ZPsi1": z_psi[1].real,
    "q4ZBlochX": z_bloch[0],
    "q4ZBlochZ": z_bloch[2],
    "q4XisRx": yes(np.allclose(X, 1j * Rx(np.pi))),
    "q4ZisRz": yes(np.allclose(Z, 1j * Rz(np.pi))),
    "q4H00": h0[0].real,
    "q4H01": h0[1].real,
    "q4H10": h1[0].real,
    "q4H11": h1[1].real,
    "q4HH": yes(np.allclose(H @ H, I2)),
    "q4HXZ": yes(np.allclose(H, (X + Z) / SQRT2)),
    "q4HPsi0": h_psi[0].real,
    "q4HPsi1": h_psi[1].real,
    "q4HBlochX": h_bloch[0],
    "q4HBlochZ": h_bloch[2],
    "q4HP0": h_psi_chances[0],
    "q4HP1": h_psi_chances[1],
    "q4HTurn": yes(np.allclose(H, 1j * (Rx(np.pi) @ Ry(np.pi / 2)))),
    "q4HNC": yes(np.allclose(H, 1j * rotation_n((R2, 0, R2), np.pi))),
    "q4SPlus": yes(abs(np.vdot(np.array([1, 1j], complex) / SQRT2, s_plus)) ** 2 > 1 - 1e-9),
    "q4SPlusVecY": s_plus_bloch[1],
    "q4PRz": yes(all(np.allclose(P(chi), np.exp(1j * chi / 2) * Rz(chi)) for chi in (0.37, 2.1))),
    "q4TRz": yes(np.allclose(T, np.exp(1j * np.pi / 8) * Rz(np.pi / 4))),
    "q4Rz2pi": yes(np.allclose(Rz(2 * np.pi), -I2)),
    "q4HHisX": yes(np.allclose(H @ H, X)),
    "q4SqrtNot": yes(np.allclose(rx90_sq, -1j * X)),
    "q4SqrtNotP0": rx90_chances[0],
    "q4SqrtNotP1": rx90_chances[1],
    # q4-registers
    "q4Prod0": prod[0].real,
    "q4Prod2": prod[2].real,
    "q4ProdIsProduct": yes(abs(prod_det) < 1e-9),
    "q4ProdP0": prod_chances[0],
    "q4ProdP2": prod_chances[2],
    "q4ProdPsum": float(np.sum(prod_chances)),
    "q4Dim3": 8.0,
    "q4H3Amp": h3_final[0].real,
    "q4H3isWH": yes(np.allclose(H3, walsh_hadamard(3))),
    "q4Digits500": float(np.floor(500 * np.log10(2)) + 1),
    "q4Idx101": float(index_of_bits("101")),
    "q4Bits6": float(format(6, "03b")),
    "q4ProdDet": prod_det.real,
    "q4BellDet": bell_det.real,
    "q4ProdProduct": yes(abs(prod_det) < 1e-9),
    "q4BellProduct": yes(abs(bell_det) < 1e-9),
    # q4-cnot
    "q4Cnot10": yes(np.allclose(cnot10_on_10, ket("11"))),
    "q4CnotMat": yes(np.allclose(CNOT01, np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]]))),
    "q4CnotUnitary": yes(np.allclose(CNOT01.conj().T @ CNOT01, np.eye(4))),
    "q4Cnot2": yes(np.allclose(CNOT01 @ CNOT01, np.eye(4))),
    "q4CZpp3": cz_on_pp[3].real,
    "q4CZ": yes(np.allclose(CZ, np.diag([1, 1, 1, -1]))),
    "q4CZSym": yes(np.allclose(SWAP @ CZ @ SWAP, CZ)),  # CZ is invariant under swapping the two wires
    "q4CZfromCnot": yes(np.allclose(CZ, cz_from_cnot)),
    "q4CZcircuit": yes(np.allclose(cz_from_cnot, CZ)),
    "q4AndZeros": float(and_zeros),
    "q4CopyBasis": yes(np.allclose(CNOT01 @ ket("00"), ket("00")) and np.allclose(CNOT01 @ ket("10"), ket("11"))),
    "q4CopyOut0": copy_out[0].real,
    "q4CopyOut3": copy_out[3].real,
    "q4PsiPsi0": psi_psi[0].real,
    "q4PsiPsi1": psi_psi[1].real,
    "q4PsiPsi3": psi_psi[3].real,
    "q4CopyFails": yes(not np.allclose(copy_out, psi_psi)),
    # q4-circuits
    "q4HthenZ0": h_then_z[0].real,
    "q4HthenZ1": h_then_z[1].real,
    "q4ZthenH0": z_then_h[0].real,
    "q4ZthenH1": z_then_h[1].real,
    "q4CircOrder": yes(np.allclose(Z @ H, Z @ H)),
    "q4CircOrderWrong": yes(np.allclose(Z @ H, H @ Z)),
    "q4BellMid0": bell_mid[0].real,
    "q4BellMid2": bell_mid[2].real,
    "q4Bell0": bell_final[0].real,
    "q4Bell3": bell_final[3].real,
    "q4BellIsPhi": yes(np.allclose(bell_final, bell)),
    "q4BellFormula": yes(bell_formula_holds()),
    "q4SwapIsSwap": yes(np.allclose(swap_unitary, SWAP)),
    "q4HHcx01": yes(np.allclose(hhcx01, ket("11"))),
    "q4HHcnot": yes(np.allclose(hhcx_unitary, CNOT10)),
    "q4HXH": yes(np.allclose(hxh, Z)),
    # q4-measure
    "q4ProdMeasure0": prod_measure[0],
    "q4ProdMeasure2": prod_measure[2],
    "q4M2pre0": m2pre[0].real,
    "q4M2pre3": m2pre[3].real,
    "q4M2p0": m2p0,
    "q4M2p1": m2p1,
    "q4M2post0IsPlus": yes(np.allclose(m2_post0, PLUS)),
    "q4M2post1IsMinus": yes(np.allclose(m2_post1, MINUS)),
    "q4BellM0": bell_m0,
    "q4BellM1": bell_m1,
    "q4BellMpost0": yes(np.allclose(bell_post0, KET0)),
    "q4BellMpost1": yes(np.allclose(bell_post1, KET1)),
    "q4PlusBasisP0": p_plus,
    "q4PlusBasisP1": p_minus,
    "q4PlusBasisViaH": yes(abs(p_plus - h_psi_chances[0]) < 1e-9),
    "q4PlusFormula": plus_formula,
    "q4CopyRead0": copy_read0,
    "q4CopyRead1": copy_read1,
    "q4CopyReadPost0": yes(np.allclose(copy_read_post0, KET0)),
    "q4CopyReadPost1": yes(np.allclose(copy_read_post1, KET1)),
    # challenges
    "q4ChP1": ch_p1,
    "q4ChComplex": ch_complex,
    "q4ChTheta": ch_theta,
    "q4ChX": ch_x,
    "q4ChH1": ch_h1,
    "q4ChCount": float(ch_count),
    "q4ChProd": ch_prod,
    "q4ChIndex": float(ch_index),
    "q4ChEntry": ch_entry,
    "q4ChCZ": ch_cz,
    "q4ChCopy": ch_copy,
    "q4ChBell11": ch_bell11,
    "q4ChHZH": ch_hzh,
    "q4ChAll": ch_all,
    "q4ChFirst": ch_first,
    "q4ChPlus0": ch_plus0,
    "q4ChPost3": ch_post3,
    # arcade
    "q4ArcSg": arc_sg,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q4.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q4, numpy (explicit 2x2/4x4/8x8 matrices and np.kron, "
            "never the engine's applyGate/embed strided loops or its Circuit runner). Regenerate: "
            "python3 pipeline/claims_qc709/q4.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
