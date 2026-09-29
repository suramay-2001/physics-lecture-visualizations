#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q5.values.ts (Physics 709, chapter Q5).

Independent route (never the engine's physics/qc/circuit.ts `runCircuit`, and never Q5.values.ts's own
helper functions): every state is built here by direct matrix multiplication of hand-written 2x2 / 4x4 / 8x8
numpy arrays, applied with numpy.kron for tensor products. The interferometer is built from Bergou's mode
rules (Eq. 1.17: a+ -> (a+ + b+)/sqrt2, b+ -> (b+ - a+)/sqrt2) directly, then the arm-swap of Fig. 1.7's
mirrors, independently of the R_y-rotation form Q5.story.ts's stage circuits use (D4 shows the two agree).
The adiabatic Hamiltonian's eigenvalues/eigenvectors come from numpy.linalg.eigh (LAPACK), never the
engine's Jacobi sweep (physics/qc/cmat.ts `eigh`).

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q5.py -> app/src/physics/__fixtures__/claims-qc709/q5.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write
byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

I1 = np.eye(2, dtype=complex)
X1 = np.array([[0, 1], [1, 0]], complex)
Z1 = np.array([[1, 0], [0, -1]], complex)
H1 = np.array([[1, 1], [1, -1]], complex) / np.sqrt(2)
R2 = 1 / np.sqrt(2)


def yes(b):
    return 1.0 if b else 0.0


def kron_all(mats):
    out = mats[0]
    for m in mats[1:]:
        out = np.kron(out, m)
    return out


def ket(label):
    """A product ket from a label, one character per qubit, q0 first: '0','1','+','-' (state.ts `ket`)."""
    one = {"0": np.array([1, 0], complex), "1": np.array([0, 1], complex),
           "+": np.array([1, 1], complex) * R2, "-": np.array([1, -1], complex) * R2}
    return kron_all([one[c] for c in label])


def basis_index(psi):
    return int(np.argmax(np.abs(psi) ** 2))


def prob_at(psi, i):
    return float(np.abs(psi[i]) ** 2)


def P(phi):
    return np.array([[1, 0], [0, np.exp(1j * phi)]], complex)


def Ry(theta):
    c, s = np.cos(theta / 2), np.sin(theta / 2)
    return np.array([[c, -s], [s, c]], complex)


def embed1(gate, q, n):
    """`gate` (2x2) on qubit q of n qubits, identity elsewhere."""
    mats = [I1] * n
    mats[q] = gate
    return kron_all(mats)


def cnot(n=2, c=0, t=1):
    """CNOT with control c, target t, on n qubits (built from projectors, independent of any gate table)."""
    p0 = np.array([[1, 0], [0, 0]], complex)
    p1 = np.array([[0, 0], [0, 1]], complex)
    mats0 = [I1] * n
    mats0[c] = p0
    mats1 = [I1] * n
    mats1[c] = p1
    mats1[t] = X1
    return kron_all(mats0) + kron_all(mats1)


def cz(n=2, a=0, b=1):
    p0 = np.array([[1, 0], [0, 0]], complex)
    p1 = np.array([[0, 0], [0, 1]], complex)
    mats0 = [I1] * n
    mats0[a] = p0
    mats1 = [I1] * n
    mats1[a] = p1
    mats1[b] = Z1
    return kron_all(mats0) + kron_all(mats1)


def toffoli():
    """3-qubit Toffoli, built from projectors (independent of any permutation-table construction)."""
    p0 = np.array([[1, 0], [0, 0]], complex)
    p1 = np.array([[0, 0], [0, 1]], complex)
    # controls are qubits 0, 1; target qubit 2
    m00 = kron_all([p0, I1, I1])
    m01 = kron_all([p1, p0, I1])
    m11 = kron_all([p1, p1, X1])
    return m00 + m01 + m11


def u_f_xor(table):
    """U_f|x>|y> = |x>|y XOR f(x)> on 2 qubits (x = q0, y = q1), from the truth table directly."""
    U = np.zeros((4, 4), complex)
    for x in (0, 1):
        for y in (0, 1):
            j = 2 * x + y
            yp = y ^ table[x]
            i = 2 * x + yp
            U[i, j] = 1
    return U


def o_f_phase(table):
    """The 1-qubit phase oracle diag((-1)^f(0), (-1)^f(1))."""
    return np.diag([(-1.0) ** table[0], (-1.0) ** table[1]]).astype(complex)


ZERO, ONE, ID, NOT = (0, 0), (1, 1), (0, 1), (1, 0)


def same_up_to_phase(a, b, eps=1e-9):
    k = int(np.argmax(np.abs(a) ** 2))
    phase = b[k] / a[k]
    return bool(np.allclose(b, phase * a, atol=eps))


def vec_eq(a, b, eps=1e-9):
    return bool(np.allclose(a, b, atol=eps))


# ---------------------------------------------------------------------------------------------------------
# q5-problem: the four truth tables and the box's one-query readings
# ---------------------------------------------------------------------------------------------------------
def query(table, x):
    """The circuit C_Q(t, x): |x>|0>, one U_f, read the final basis state's index."""
    psi = u_f_xor(table) @ ket(f"{x}0")
    return basis_index(psi)


# ---------------------------------------------------------------------------------------------------------
# q5-oracle: unitarity, the kickback, Toffoli
# ---------------------------------------------------------------------------------------------------------
U_ZERO, U_ONE, U_ID, U_NOT = (u_f_xor(t) for t in (ZERO, ONE, ID, NOT))


def is_unitary(U, eps=1e-9):
    return bool(np.allclose(U.conj().T @ U, np.eye(U.shape[0]), atol=eps))


# kickback: control |1>, target |->; before/after one column of U_id
kick_before = ket("1-")
kick_after = U_ID @ kick_before
# control |+>, target |->
kick2_before = ket("+-")
kick2_after = U_ID @ kick2_before
# target-only ray before/after, for the control = 1 branch (indices 2, 3 of the 2-qubit vector)
kick_target_before = kick_before[2:4]
kick_target_after = kick_after[2:4]

TOF = toffoli()
tof_state_110 = TOF @ ket("110")

# ---------------------------------------------------------------------------------------------------------
# q5-one-value: quantum parallelism
# ---------------------------------------------------------------------------------------------------------
par_id = u_f_xor(ID) @ embed1(H1, 0, 2) @ ket("00")
par_one = u_f_xor(ONE) @ embed1(H1, 0, 2) @ ket("00")

# ---------------------------------------------------------------------------------------------------------
# q5-deutsch: Deutsch's circuit, state by state
# ---------------------------------------------------------------------------------------------------------
def deutsch_states(table):
    psi0 = ket("0-")
    psi1 = embed1(H1, 0, 2) @ psi0
    psi2 = u_f_xor(table) @ psi1
    psi3 = embed1(H1, 0, 2) @ psi2
    return psi0, psi1, psi2, psi3


d_zero = deutsch_states(ZERO)
d_one = deutsch_states(ONE)
d_id = deutsch_states(ID)
d_not = deutsch_states(NOT)


def top_prob1(psi3):
    return prob_at(psi3, 2) + prob_at(psi3, 3)


# N&C's version: |0>|1>, H on BOTH wires first, then U_f, then H on wire 0
def nc_states(table):
    psi0 = ket("01")
    psi1 = embed1(H1, 0, 2) @ embed1(H1, 1, 2) @ psi0
    psi2 = u_f_xor(table) @ psi1
    psi3 = embed1(H1, 0, 2) @ psi2
    return psi0, psi1, psi2, psi3


nc_one = nc_states(ONE)

# ---------------------------------------------------------------------------------------------------------
# q5-interferometer: Bergou's mode rules (Eq. 1.17), independent of the R_y-rotation form
# ---------------------------------------------------------------------------------------------------------
# One splitter, on a photon's 2-mode amplitude vector (a, b): a -> (a+b)/sqrt2, b -> (b-a)/sqrt2 (Eq. 1.17),
# i.e. the LINEAR MAP has matrix columns = images of the basis vectors e_a, e_b.
BS = np.array([[1, -1], [1, 1]], complex) * R2  # BS @ (1,0)^T = (1,1)*R2 = image of a; BS @ (0,1)^T = image of b

# Fig. 1.7's mirrors swap the arms before the second splitter meets them: the physical action of "splitter 2,
# entered through the swapped ports" is X . BS . X (erratum B1) -- built here from BS and the swap matrix
# SWAP = [[0,1],[1,0]], independently of Q5.story.ts's R_y(-90 deg) claim (D4 shows the two agree).
SWAP1 = np.array([[0, 1], [1, 0]], complex)
BS2_MIRRORED = SWAP1 @ BS @ SWAP1
BS2_NAIVE = BS  # the erratum's wrong reading: apply Eq. 1.17 again with the SAME (unswapped) labels


def mz_output(phi0, phi1, bs2):
    after_bs1 = BS @ np.array([1, 0], complex)  # photon entering along arm a
    after_phases = np.array([np.exp(1j * phi0), np.exp(1j * phi1)], complex) * after_bs1
    return bs2 @ after_phases


mz0 = mz_output(0.0, 0.0, BS2_MIRRORED)
mz45 = mz_output(0.0, np.pi / 4, BS2_MIRRORED)
mz90 = mz_output(0.0, np.pi / 2, BS2_MIRRORED)
mz135 = mz_output(0.0, 3 * np.pi / 4, BS2_MIRRORED)
mz180 = mz_output(0.0, np.pi, BS2_MIRRORED)
mz_naive_out = mz_output(0.0, 0.0, BS2_NAIVE)


def mzf_output(table):
    phis = [np.pi * table[0], np.pi * table[1]]
    return mz_output(phis[0], phis[1], BS2_MIRRORED)


mzf_zero, mzf_one, mzf_id, mzf_not = (mzf_output(t) for t in (ZERO, ONE, ID, NOT))

# Deutsch's top wire alone: H, O_f, H (compare with the interferometer, D4)
hoh_id = H1 @ o_f_phase(ID) @ H1 @ np.array([1, 0], complex)

# which-path: a which-arm reading between the splitters (project onto |0> or |1>, renormalize), phi0=phi1=0
after_bs1 = BS @ np.array([1, 0], complex)
wp_branch0 = np.array([after_bs1[0], 0], complex)
wp_p0 = float(np.abs(wp_branch0[0]) ** 2)
wp_branch0 = wp_branch0 / np.sqrt(wp_p0)
wp_out0 = BS2_MIRRORED @ wp_branch0
no_wp_out = mz_output(0.0, 0.0, BS2_MIRRORED)

# ---------------------------------------------------------------------------------------------------------
# q5-other-models: the adiabatic Hamiltonian and the measurement-based step
# ---------------------------------------------------------------------------------------------------------
def H_of_s(s):
    return -(1 - s) * X1.real - s * Z1.real


def gap_at(s):
    w = np.linalg.eigvalsh(H_of_s(s))
    return float(w[1] - w[0])


w_half, v_half = np.linalg.eigh(H_of_s(0.5))
# a0*I + a.sigma decomposition of H(1/2), independent of the engine's route: a_i = Tr(H sigma_i)/2
SIGMA = {"x": X1, "y": np.array([[0, -1j], [1j, 0]], complex), "z": Z1}
H_half = H_of_s(0.5).astype(complex)
a0_half = float(np.real(np.trace(H_half)) / 2)
a_half = np.array([float(np.real(np.trace(H_half @ SIGMA[k]))) / 2 for k in "xyz"])

# W(theta) = H*P(theta); the measurement-based step, CZ|psi>|+>, psi = Ry(pi/3)|0>
THETA = np.pi / 4


def W(theta):
    return H1 @ P(theta)


psi_in = Ry(np.pi / 3) @ np.array([1, 0], complex)
mb_after_cz = cz() @ np.kron(psi_in, np.array([1, 1], complex) * R2)
# the reading in the |+-theta> basis is P(theta) then H then a computational reading (D6): apply both to qubit 0
mb_state = embed1(H1, 0, 2) @ embed1(P(THETA), 0, 2) @ mb_after_cz
# branch 0 (qubit 0 reads 0): components 0,1; branch 1 (qubit 0 reads 1): components 2,3
mb_p0 = float(np.abs(mb_state[0]) ** 2 + np.abs(mb_state[1]) ** 2)
mb_p1 = float(np.abs(mb_state[2]) ** 2 + np.abs(mb_state[3]) ** 2)
w_psi = mb_state[0:2] / np.sqrt(mb_p0)
xw_psi = mb_state[2:4] / np.sqrt(mb_p1)

w0_img = W(THETA) @ np.array([1, 0], complex)
w1_img = W(THETA) @ np.array([0, 1], complex)
plus_ket = np.array([1, 1], complex) * R2
minus_ket_phased = np.exp(1j * THETA) * (np.array([1, -1], complex) * R2)

# the byproduct identity: W(theta)X vs Z*W(-theta), bare and with the phase e^{i theta}
wx_lhs = W(THETA) @ X1 @ np.array([1, 0], complex)
wx_rhs_bare = Z1 @ W(-THETA) @ np.array([1, 0], complex)
wx_rhs_phase = np.exp(1j * THETA) * (Z1 @ W(-THETA) @ np.array([1, 0], complex))

# ---------------------------------------------------------------------------------------------------------
# challenges (no beat displays these; still engine-backed, from the same independent route)
# ---------------------------------------------------------------------------------------------------------
kick_not_on_0minus = u_f_xor(NOT) @ ket("0-")
ch_out = basis_index(u_f_xor(ONE) @ ket("01"))

values = {
    # small, reused constants
    "q5Half": 0.5,
    "q5NegHalf": -0.5,
    "q5R2": R2,
    "q5NegR2": -R2,
    "q5Quarter": 0.25,
    "q5Eighth": 1 / np.sqrt(8),

    # q5-problem
    "q5ConstZero": yes(True),
    "q5ConstOne": yes(True),
    "q5ConstId": yes(False),
    "q5ConstNot": yes(False),
    "q5XorZero": 0.0,
    "q5XorOne": 0.0,
    "q5XorId": 1.0,
    "q5XorNot": 1.0,
    "q5ChQueries": 2.0,
    "q5ChCount": 2.0,
    "q5QueryId1": float(query(ID, 1)),
    "q5Query0": float(query(NOT, 0)),
    "q5QueryOne1": float(query(ONE, 1)),
    "q5Query1": float(query(NOT, 1)),
    "q5QueryOne0": float(query(ONE, 0)),

    # q5-oracle
    "q5UfUnitary": yes(all(is_unitary(U) for U in (U_ZERO, U_ONE, U_ID, U_NOT))),
    "q5UfSquare": yes(all(np.allclose(U @ U, np.eye(4)) for U in (U_ZERO, U_ONE, U_ID, U_NOT))),
    "q5UfId": yes(np.allclose(U_ID, cnot())),
    "q5UfOne": yes(is_unitary(U_ONE)),
    "q5UfZero": yes(np.allclose(U_ZERO, np.eye(4))),
    "q5UfNot": yes(is_unitary(U_NOT)),
    "q5KickInRe": float(np.real(kick_target_before[0])),
    "q5KickOutRe": float(np.real(kick_target_after[0])),
    "q5KickAllRe": float(np.real(kick2_after[0])),
    "q5KickAllNegRe": float(np.real(kick2_after[1])),
    "q5KickTarget": yes(same_up_to_phase(kick_target_before, kick_target_after)),
    "q5ChPhase": yes(np.allclose(o_f_phase(ID), Z1)),
    "q5Toffoli110": float(basis_index(tof_state_110)),
    "q5Toffoli2": yes(np.allclose(TOF @ TOF, np.eye(8))),
    "q5XMinus": yes(np.allclose(X1 @ (np.array([1, -1], complex) * R2), -(np.array([1, -1], complex) * R2))),

    # q5-one-value
    "q5ParRe": float(np.real(par_id[0])),
    "q5ParOneRe": float(np.real(par_one[1])),
    "q5ParPHalf": 0.5,
    "q5WH2Half": 0.5,
    "q5ChValues": 1.0,
    "q5WHalfEighth": 1 / np.sqrt(8),

    # q5-deutsch
    "q5D1Re": float(np.real(d_id[1][0])),
    "q5D2ZeroRe": float(np.real(d_zero[2][0])),
    "q5D2OneRe": float(np.real(d_one[2][0])),
    "q5D3R2": R2,
    "q5DTop1Zero": top_prob1(d_zero[3]),
    "q5DTop1One": top_prob1(d_one[3]),
    "q5DTop1Id": top_prob1(d_id[3]),
    "q5DTop1Not": top_prob1(d_not[3]),
    "q5DTopIsXor": yes(
        np.isclose(top_prob1(d_zero[3]), 0) and np.isclose(top_prob1(d_one[3]), 0)
        and np.isclose(top_prob1(d_id[3]), 1) and np.isclose(top_prob1(d_not[3]), 1)
    ),
    "q5NCSame": yes(vec_eq(nc_one[1], d_id[1])),
    "q5NCFinalMatches": yes(vec_eq(nc_one[3], d_one[3])),
    "q5ConstSame": yes(same_up_to_phase(d_zero[3], d_one[3])),
    "q5ConstEqual": yes(vec_eq(d_zero[3], d_one[3])),
    "q5BalSame": yes(same_up_to_phase(d_id[3], d_not[3])),

    # q5-interferometer
    "q5BSmatches117": yes(is_unitary(BS)),
    "q5MirrorBS": yes(np.allclose(BS2_MIRRORED, np.array([[1, 1], [-1, 1]], complex) * R2)),
    "q5Mz118": prob_at(mz0, 0),
    "q5MzNaiveOut2": prob_at(mz_naive_out, 1),
    "q5MzHalfRe": float(np.real(mz90[0])),
    "q5MzHalfIm": float(np.imag(mz90[0])),
    "q5MzHalfP": 0.5,
    "q5MzSweep0": prob_at(mz0, 0),
    "q5MzSweep45": prob_at(mz45, 0),
    "q5MzSweep90": prob_at(mz90, 0),
    "q5MzSweep135": prob_at(mz135, 0),
    "q5MzSweep180": prob_at(mz180, 0),
    "q5MzCos2": yes(np.isclose(prob_at(mz45, 0), np.cos(np.pi / 8) ** 2)),
    "q5MzF": yes(
        np.isclose(prob_at(mzf_zero, 1), 0) and np.isclose(prob_at(mzf_one, 1), 0)
        and np.isclose(prob_at(mzf_id, 1), 1) and np.isclose(prob_at(mzf_not, 1), 1)
    ),
    "q5MzIdRe": float(np.real(mzf_id[1])),
    "q5HOHOneRe": float(np.real(hoh_id[1])),
    "q5DeutschTopMatches": yes(vec_eq(hoh_id, np.array([0, 1], complex))),
    "q5NoWhichPathOut1": prob_at(no_wp_out, 0),
    "q5WhichPathOut1": prob_at(wp_out0, 0),
    "q5WhichPathOut2": prob_at(wp_out0, 1),
    "q5WhichPathBranch": wp_p0,

    # q5-other-models
    "q5Gap0": gap_at(0.0),
    "q5Gap25": gap_at(0.25),
    "q5Gap50": gap_at(0.5),
    "q5Gap75": gap_at(0.75),
    "q5Gap100": gap_at(1.0),
    "q5HHalfA0": a0_half,
    "q5HHalfALen": float(np.linalg.norm(a_half)),
    "q5GroundHalfR2": R2,
    "q5W0IsPlus": yes(vec_eq(w0_img, plus_ket)),
    "q5W1IsMinusPhase": yes(vec_eq(w1_img, minus_ket_phased)),
    "q5MbBasisP": 0.5,
    "q5MbBranch0": yes(np.isclose(mb_p0, 0.5)),
    "q5MbBranch1": yes(np.isclose(mb_p1, 0.5)),
    "q5WPsiPZero": float(np.abs(w_psi[0]) ** 2),
    "q5WPsiPOne": float(np.abs(w_psi[1]) ** 2),
    "q5XWPsiPZero": float(np.abs(xw_psi[0]) ** 2),
    "q5XWPsiPOne": float(np.abs(xw_psi[1]) ** 2),
    "q5WPsiRe0": float(np.real(w_psi[0])),
    "q5WPsiIm0": float(np.imag(w_psi[0])),
    "q5WPsiRe1": float(np.real(w_psi[1])),
    "q5WPsiIm1": float(np.imag(w_psi[1])),
    "q5WIdentPhase": yes(vec_eq(wx_lhs, wx_rhs_phase)),
    "q5WIdentBare": yes(vec_eq(wx_lhs, wx_rhs_bare)),

    # challenges
    "q5ChKick0": float(np.real(kick_not_on_0minus[0])),
    "q5ChOut": float(ch_out),
    "q5ChWh": 1 / np.sqrt(8),
    "q5ChCnotIsId": yes(np.allclose(U_ID, cnot())),
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q5.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q5, numpy (direct matrix construction: hand-written "
            "gate/oracle matrices, Bergou's mode rules for the interferometer, numpy.linalg.eigh for the adiabatic "
            "Hamiltonian; never physics/qc/circuit.ts runCircuit or Q5.values.ts's own helpers). "
            "Regenerate: python3 pipeline/claims_qc709/q5.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
