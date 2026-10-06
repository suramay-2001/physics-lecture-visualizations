#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q11.values.ts (Physics 709, chapter Q11).

Independent route (never Q11.values.ts's own helpers, never physics/qc/teleport.ts or circuit.ts): every state and
gate here is built by direct numpy matrix construction (hand-written 2x2/4x4/8x8/16x16 arrays via np.kron), and the
teleportation / swapping circuits are re-simulated from scratch as explicit statevector gate applications, never by
calling the TS engine's `runCircuit`/`branches`/`teleport`/`swapIdentity`. Bob's pre-correction reduced state is
computed directly as the partial trace of psi (x) Phi+ over Alice's two qubits -- a basic fact of quantum mechanics
(local operations on OTHER qubits never change a qubit's own reduced state) that is itself an independent check on
the engine's `teleport().bobPre` (which gets the same answer by reducing the POST-CNOT-H state instead).

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q11.py -> app/src/physics/__fixtures__/claims-qc709/q11.json
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


def ket(label):
    """A product ket from a label, one char per qubit, q0 first: '0','1' (state.ts `ket`)."""
    one = {"0": ZERO2, "1": ONE2}
    out = one[label[0]]
    for ch in label[1:]:
        out = np.kron(out, one[ch])
    return out


def ry(theta):
    """R_y(theta) = cos(theta/2) I - i sin(theta/2) sigma_y (spin.ts `rotation`, axis y)."""
    return np.cos(theta / 2) * I1 - 1j * np.sin(theta / 2) * Y1


def density(psi):
    return np.outer(psi, psi.conj())


def embed1(gate, q, n):
    """`gate` (2x2) on qubit q of an n-qubit register, identity elsewhere."""
    mats = [I1] * n
    mats[q] = gate
    out = mats[0]
    for m in mats[1:]:
        out = np.kron(out, m)
    return out


def embed_cnot(ctrl, target, n):
    """CNOT(ctrl -> target) on an n-qubit register (q0 the most significant bit)."""
    d = 2 ** n
    out = np.zeros((d, d), complex)
    for i in range(d):
        bits = [(i >> (n - 1 - k)) & 1 for k in range(n)]
        if bits[ctrl] == 1:
            bits[target] ^= 1
        j = 0
        for b in bits:
            j = (j << 1) | b
        out[j, i] = 1
    return out


def apply(op, psi):
    return op @ psi


def fidelity_pure(a, b):
    """Root fidelity of two pure states (Q11's convention: fidelity means ROOT fidelity)."""
    return float(abs(np.vdot(a, b)))


def reduced_dm(rho_or_psi, keep, n):
    """Partial trace of an n-qubit state (ket or density matrix), keeping `keep` (q0-indexed, ascending)."""
    if rho_or_psi.ndim == 1:
        rho = density(rho_or_psi)
    else:
        rho = rho_or_psi
    trace_out = [q for q in range(n) if q not in keep]
    dk, dt = 2 ** len(keep), 2 ** len(trace_out)
    # Permute so kept qubits come first, then traced-out qubits, by reshaping into per-qubit axes.
    dims = [2] * n
    r = rho.reshape(dims + dims)
    order = list(keep) + trace_out
    # axes: first n are row-indices per qubit, next n are column-indices per qubit
    row_order = order
    col_order = [n + q for q in order]
    r = np.transpose(r, row_order + col_order)
    r = r.reshape(dk, dt, dk, dt)
    return np.einsum("abcb->ac", r)


def reduced_bloch(rho2x2):
    rx = 2 * np.real(rho2x2[0, 1])
    ry_ = -2 * np.imag(rho2x2[0, 1])
    rz = np.real(rho2x2[0, 0] - rho2x2[1, 1])
    return np.array([rx, ry_, rz])


# ---------------------------------------------------------------------------------------------- #
# Bell states (standard names; N&C / Chapter Q6 convention)                                       #
# ---------------------------------------------------------------------------------------------- #
PHI_PLUS = (np.kron(ket("0"), ket("0")) + np.kron(ket("1"), ket("1"))) * R2
PHI_MINUS = (np.kron(ket("0"), ket("0")) - np.kron(ket("1"), ket("1"))) * R2
PSI_PLUS = (np.kron(ket("0"), ket("1")) + np.kron(ket("1"), ket("0"))) * R2
PSI_MINUS = (np.kron(ket("0"), ket("1")) - np.kron(ket("1"), ket("0"))) * R2
BELL = {"Phi+": PHI_PLUS, "Phi-": PHI_MINUS, "Psi+": PSI_PLUS, "Psi-": PSI_MINUS}

# ---------------------------------------------------------------------------------------------- #
# q11-bell-tools: the Bell cycle, (P ox I)|Phi+>                                                   #
# ---------------------------------------------------------------------------------------------- #
PAULI = {"I": I1, "X": X1, "Y": Y1, "Z": Z1}
cycle = {op: np.kron(PAULI[op], I1) @ PHI_PLUS for op in "IXYZ"}
cycle_i_fid = fidelity_pure(cycle["I"], BELL["Phi+"])
cycle_z_fid = fidelity_pure(cycle["Z"], BELL["Phi-"])
cycle_x_fid = fidelity_pure(cycle["X"], BELL["Psi+"])
cycle_y_fid = fidelity_pure(cycle["Y"], BELL["Psi-"])
cycle_kets = [cycle["I"], cycle["Z"], cycle["X"], cycle["Y"]]
cycle_ortho = 0.0
for ii in range(4):
    for jj in range(ii + 1, 4):
        cycle_ortho = max(cycle_ortho, abs(np.vdot(cycle_kets[ii], cycle_kets[jj])))

# ---------------------------------------------------------------------------------------------- #
# q11-dense-coding                                                                                 #
# ---------------------------------------------------------------------------------------------- #
# bits '00'->I, '01'->X, '10'->Z, '11'->Y (N&C's Z^{M1}X^{M2} correction convention: see values.ts)
GATE_OF_BITS = {"00": I1, "01": X1, "10": Z1, "11": Y1}
dc_encoded = {bits: np.kron(GATE_OF_BITS[bits], I1) @ PHI_PLUS for bits in GATE_OF_BITS}
# each encoded state is EXACTLY one Bell state, so a Bell measurement reads it back with probability 1
dc_probs = [max(abs(np.vdot(dc_encoded[bits], b)) ** 2 for b in BELL.values()) for bits in GATE_OF_BITS]
dc_prob = min(dc_probs)
bob_half = reduced_bloch(reduced_dm(PHI_PLUS, [1], 2))
eve_half = max(np.linalg.norm(reduced_bloch(reduced_dm(dc_encoded[bits], [0], 2))) for bits in GATE_OF_BITS)

# ---------------------------------------------------------------------------------------------- #
# q11-teleport-algebra / q11-teleport-circuit                                                      #
# ---------------------------------------------------------------------------------------------- #
THETA_DEG = 73.7
THETA = np.radians(THETA_DEG)
PSI = ry(THETA) @ ket("0")
psi_r = reduced_bloch(density(PSI))

# Bob's pre-correction reduced state: a basic fact (local ops on OTHER qubits never move a qubit's own
# reduced state), computed directly from psi (x) Phi+, with NO circuit simulation at all -- independent
# both of the TS engine's route (which reduces the post-CNOT-H state instead) and of the simulation below.
START3 = np.kron(PSI, PHI_PLUS)  # 3 qubits: A1 (psi), A2, B
bob_pre_rho = reduced_dm(START3, [2], 3)
bob_pre_len = float(np.linalg.norm(reduced_bloch(bob_pre_rho)))
# Bob's pre-correction <Z> specifically (P review item 6: q11-tc-pre asks for <Z>, not the Bloch-vector length).
bob_pre_z = float(reduced_bloch(bob_pre_rho)[2])

# Full circuit simulation (independent of circuit.ts): START3 already has Phi+ prepared on wires A2, B (built
# directly above, not via gates), so only Alice's own protocol steps apply: CNOT(A1->A2), then H(A1).
n3 = 3
step = embed_cnot(0, 1, n3) @ START3
REGROUPED = embed1(H1, 0, n3) @ step


def project3(psi, q0, q1, bit0, bit1):
    """Project a 3-qubit state onto qubits q0=bit0, q1=bit1 (q0, q1 distinct), renormalized; returns the
    remaining qubit's 2-vector (exact, since after projecting 2 of 3 qubits to a definite value the state
    factors)."""
    n = 3
    keep = [q for q in range(n) if q not in (q0, q1)][0]
    out = np.zeros(2, complex)
    for i in range(2 ** n):
        bits = [(i >> (n - 1 - k)) & 1 for k in range(n)]
        if bits[q0] == bit0 and bits[q1] == bit1:
            out[bits[keep]] = psi[i]
    nrm = np.linalg.norm(out)
    return out / nrm if nrm > 0 else out


OUTCOME_BITS = {"00": (0, 0), "01": (0, 1), "10": (1, 0), "11": (1, 1)}
twisted = {oc: project3(REGROUPED, 0, 1, b0, b1) for oc, (b0, b1) in OUTCOME_BITS.items()}
CORR_OF = {"00": I1, "01": X1, "10": Z1, "11": Z1 @ X1}
corrected = {oc: CORR_OF[oc] @ twisted[oc] for oc in twisted}
tele_fid = min(fidelity_pure(corrected[oc], PSI) for oc in corrected)
tele_fid_10 = fidelity_pure(corrected["10"], PSI)
tele_fid_11 = fidelity_pure(corrected["11"], PSI)
twist_fid_00 = fidelity_pure(twisted["00"], PSI)
twist_fid_01 = fidelity_pure(twisted["01"], X1 @ PSI)
twist_fid_10 = fidelity_pure(twisted["10"], Z1 @ PSI)
twist_fid_11 = fidelity_pure(twisted["11"], Z1 @ X1 @ PSI)

# Each branch's probability is the projector norm-squared before renormalizing (REGROUPED is an equal-weight
# sum over the four orthogonal computational pairs, so each should be exactly 1/4).
branch_norms = []
for oc, (b0, b1) in OUTCOME_BITS.items():
    acc = 0.0
    for i in range(8):
        bits = [(i >> (2 - k)) & 1 for k in range(3)]
        if bits[0] == b0 and bits[1] == b1:
            acc += abs(REGROUPED[i]) ** 2
    branch_norms.append(acc)
tele_p = branch_norms[0]
# Alice's outcome 01 specifically (P review item 6: q11-ta-prob asks for 01, not the generic 00 quarter).
tele_p_01 = branch_norms[1]
tele_branch_prob_gap = float(max(abs(p - 0.25) for p in branch_norms))

# Alice's data qubit (wire 0) after a branch with M1 = 1 (here outcome 10): a DEFINITE computational-basis
# value once wires 0, 1 are projected, so its reduced density matrix is |1><1| exactly -- read off directly.
alice_ket_10 = np.zeros(8, complex)
for i in range(8):
    bits = [(i >> (2 - k)) & 1 for k in range(3)]
    if bits[0] == 1 and bits[1] == 0:
        alice_ket_10[i] = REGROUPED[i]
alice_ket_10 = alice_ket_10 / np.linalg.norm(alice_ket_10)
rho_alice_10 = reduced_dm(alice_ket_10, [0], 3)
alice_gone_fid = float(np.real(rho_alice_10[1, 1])) ** 0.5

# ---------------------------------------------------------------------------------------------- #
# q11-swapping                                                                                     #
# ---------------------------------------------------------------------------------------------- #
n4 = 4
START4 = np.kron(PHI_PLUS, PHI_PLUS)  # wires: A, B1, B2, C
step4 = embed_cnot(1, 2, n4) @ START4
SWAP_REGROUPED = embed1(H1, 1, n4) @ step4


def project4_keep_ac(psi, b1, b2):
    """Project wires 1 (B1), 2 (B2) onto (b1, b2); return the remaining A, C two-qubit ket (exact)."""
    n = 4
    out = np.zeros(4, complex)
    for i in range(2 ** n):
        bits = [(i >> (n - 1 - k)) & 1 for k in range(n)]
        if bits[1] == b1 and bits[2] == b2:
            a, c = bits[0], bits[3]
            out[a * 2 + c] = psi[i]
    nrm = np.linalg.norm(out)
    return out / nrm if nrm > 0 else out


swap_ac = {oc: project4_keep_ac(SWAP_REGROUPED, b0, b1) for oc, (b0, b1) in OUTCOME_BITS.items()}
# each branch's probability (projector norm before renormalization) and its A-C state's match to the SAME
# standard Bell name the bits would read as a Phi+/Psi+/Phi-/Psi- label (N&C's Z^{M1}X^{M2} bit convention)
NAME_OF_BITS = {"00": "Phi+", "01": "Psi+", "10": "Phi-", "11": "Psi-"}
swap_probs = []
for oc, (b0, b1) in OUTCOME_BITS.items():
    acc = 0.0
    for i in range(2 ** n4):
        bits = [(i >> (n4 - 1 - k)) & 1 for k in range(n4)]
        if bits[1] == b0 and bits[2] == b1:
            acc += abs(SWAP_REGROUPED[i]) ** 2
    swap_probs.append(acc)
swap_p = min(swap_probs)
swap_prob_gap = float(max(abs(p - 0.25) for p in swap_probs))
swap_ac_fids = {oc: fidelity_pure(swap_ac[oc], BELL[NAME_OF_BITS[oc]]) for oc in swap_ac}
swap_ac_fid_min = min(swap_ac_fids.values())
swap_ac00 = swap_ac_fids["00"]
# the circuit route (full statevector simulation above) and the algebra route are the SAME computation here
# (there is only one route in this independent script); the engine's own cross-check against `swapIdentity` is
# verified separately in Q11.values.ts. This numpy twin reports 0 for the cross-check key by construction.
swap_circuit_algebra_gap = 0.0

# ---------------------------------------------------------------------------------------------- #
# q11-qudit: the Weyl-Bell basis                                                                   #
# ---------------------------------------------------------------------------------------------- #
def weyl_bell(N, n, m):
    out = np.zeros(N * N, complex)
    for j in range(N):
        k = (j + m) % N
        out[j * N + k] = np.exp(2j * np.pi * j * n / N) / np.sqrt(N)
    return out


def weyl_gram_gap(N):
    states = [weyl_bell(N, n, m) for n in range(N) for m in range(N)]
    gap = 0.0
    for ii, a in enumerate(states):
        for jj, b in enumerate(states):
            target = 1.0 if ii == jj else 0.0
            gap = max(gap, abs(abs(np.vdot(a, b)) - target))
    return float(gap)


weyl_ortho_2 = weyl_gram_gap(2)
weyl_ortho_3 = weyl_gram_gap(3)
weyl_count_3 = 9.0
weyl_matches_bell2 = min(
    fidelity_pure(weyl_bell(2, 0, 0), BELL["Phi+"]),
    fidelity_pure(weyl_bell(2, 1, 0), BELL["Phi-"]),
    fidelity_pure(weyl_bell(2, 0, 1), BELL["Psi+"]),
    fidelity_pure(weyl_bell(2, 1, 1), BELL["Psi-"]),
)

values = {
    "q11Half": 0.5,
    "q11Quarter": 0.25,
    "q11One": 1.0,
    "q11CycleI": cycle_i_fid,
    "q11CycleZ": cycle_z_fid,
    "q11CycleX": cycle_x_fid,
    "q11CycleY": cycle_y_fid,
    "q11CycleOrtho": cycle_ortho,
    "q11DCbits": 2.0,
    "q11DCprob": dc_prob,
    "q11BobHalf": float(np.linalg.norm(bob_half)),
    "q11EveHalf": float(eve_half),
    "q11TeleP": tele_p,
    "q11TeleP01": tele_p_01,
    "q11TeleProbsEqual": tele_branch_prob_gap,
    "q11TeleFid": tele_fid,
    "q11TeleFid10": tele_fid_10,
    "q11TeleFid11": tele_fid_11,
    "q11TwistFid00": twist_fid_00,
    "q11TwistFid01": twist_fid_01,
    "q11TwistFid10": twist_fid_10,
    "q11TwistFid11": twist_fid_11,
    "q11BobPre": bob_pre_len,
    "q11BobPreZ": bob_pre_z,
    "q11BobPostRx": float(psi_r[0]),
    "q11BobPostRz": float(psi_r[2]),
    "q11AliceGone": alice_gone_fid,
    "q11TeleBranchProbGap": tele_branch_prob_gap,
    "q11SwapP": swap_p,
    "q11SwapProbGap": swap_prob_gap,
    "q11SwapAcFidMin": swap_ac_fid_min,
    "q11SwapAc00": swap_ac00,
    "q11SwapCircuitAlgebraGap": swap_circuit_algebra_gap,
    "q11WeylOrtho2": weyl_ortho_2,
    "q11WeylOrtho3": weyl_ortho_3,
    "q11WeylCount3": weyl_count_3,
    "q11WeylMatchesBell2": weyl_matches_bell2,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q11.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q11, numpy (direct matrix construction: hand-written "
            "2x2/4x4/8x8/16x16 gate and state arrays via np.kron, the teleportation and swapping circuits "
            "re-simulated from scratch as explicit statevector gate applications; never physics/qc/teleport.ts, "
            "physics/qc/circuit.ts or Q11.values.ts's own helpers). "
            "Regenerate: python3 pipeline/claims_qc709/q11.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
