#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q12.values.ts (Physics 709, chapter Q12).

Independent route (never Q12.values.ts's own helper functions, and never physics/qc/circuit.ts `runCircuit`):
every state and operator here is built by direct numpy matrix construction. The partial transpose is an axis swap
on the reshaped (2,2,2,2) density tensor (not an index-mask trick); Wootters concurrence is the eigenvalues of
rho @ rho_tilde (rho_tilde = (Y kron Y) rho* (Y kron Y)); the Procrustean branch kets and the W/GHZ-state
reductions use explicit state vectors and `np.reshape`-based partial traces.

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q12.py -> app/src/physics/__fixtures__/claims-qc709/q12.json
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


def density(psi):
    return np.outer(psi, psi.conj())


def mixture(parts):
    """Sum of w_k |psi_k><psi_k| (weights not renormalized; parts = [(w, psi), ...])."""
    d = len(parts[0][1])
    out = np.zeros((d, d), complex)
    for w, psi in parts:
        out = out + w * density(psi)
    return out


def partial_transpose_b_correct(rho):
    """rho^{T_B}: (rho^TB)_{(a,b),(a',b')} = rho_{(a,b'),(a',b)} -- swap the B index between row and column."""
    t = rho.reshape(2, 2, 2, 2)  # indices: row_a, row_b, col_a, col_b
    t = np.einsum("abcd->adcb", t)  # swap row_b (axis 1) and col_b (axis 3)
    return t.reshape(4, 4)


def partial_trace_second(rho4):
    """Trace out qubit B (the second qubit) of a 4x4 rho, leaving A's 2x2 reduced matrix."""
    t = rho4.reshape(2, 2, 2, 2)  # row_a, row_b, col_a, col_b
    return np.einsum("abcb->ac", t)


def partial_trace_first(rho4):
    """Trace out qubit A (the first qubit) of a 4x4 rho, leaving B's 2x2 reduced matrix."""
    t = rho4.reshape(2, 2, 2, 2)
    return np.einsum("abad->bd", t)


def von_neumann(rho):
    vals = np.linalg.eigvalsh(rho)
    s = 0.0
    for lam in vals:
        lam = lam.real
        if lam > 1e-15:
            s -= lam * np.log2(lam)
    return float(s)


def binary_entropy(p):
    if p <= 0 or p >= 1:
        return 0.0
    return float(-p * np.log2(p) - (1 - p) * np.log2(1 - p))


YY = np.kron(Y1, Y1)


def concurrence_pure(psi):
    """C = |<psi|psi_tilde>|, psi_tilde = (Y kron Y) psi* (Bergou Eq. 3.65-3.66)."""
    psi_tilde = YY @ psi.conj()
    return float(abs(np.vdot(psi, psi_tilde)))


def concurrence_mixed(rho):
    """Wootters' concurrence: C = max(0, l1-l2-l3-l4), l descending, the eigenvalues of sqrt(rho @ rho_tilde)
    (equivalently the square roots of the eigenvalues of rho @ rho_tilde, taken via the Hermitian matrix
    M = sqrtm(rho) @ rho_tilde @ sqrtm(rho), which shares rho@rho_tilde's nonzero spectrum)."""
    rho_tilde = YY @ rho.conj() @ YY
    # eigenvalues of rho @ rho_tilde (not Hermitian in general, but real & non-negative for a physical rho):
    # use the Hermitian route sqrt(rho) M sqrt(rho) for numerical safety, matching the TS engine's own approach.
    vals_rho, vecs_rho = np.linalg.eigh(rho)
    vals_rho = np.clip(vals_rho.real, 0, None)
    sqrt_rho = (vecs_rho * np.sqrt(vals_rho)) @ vecs_rho.conj().T
    M = sqrt_rho @ rho_tilde @ sqrt_rho
    lam = np.sqrt(np.clip(np.linalg.eigvalsh(M).real, 0, None))
    lam = np.sort(lam)[::-1]
    return float(max(0.0, lam[0] - lam[1] - lam[2] - lam[3]))


def bell(x, y):
    """|beta_xy> = (|0,y> + (-1)^x |1, 1-y>)/sqrt2 (Bergou/N&C index order), built by hand."""
    v = np.zeros(4, complex)
    v[int(f"0{y}", 2)] += R2
    v[int(f"1{1 - y}", 2)] += ((-1) ** x) * R2
    return v


PHI_PLUS = bell(0, 0)
PSI_MINUS = bell(1, 1)  # the singlet


def pb(p):
    """PB(p) = p|Psi-><Psi-| + (1-p)|00><00| (Bergou Eq. 3.23)."""
    return mixture([(p, PSI_MINUS), (1 - p, ket("00"))])


def werner(w):
    """w|Psi-><Psi-| + (1-w)/4 I4 (as a mixture of five pure terms, matching the TS route)."""
    return mixture([(w, PSI_MINUS), ((1 - w) / 4, ket("00")), ((1 - w) / 4, ket("01")), ((1 - w) / 4, ket("10")), ((1 - w) / 4, ket("11"))])


def ppt_spectrum(rho):
    return np.sort(np.linalg.eigvalsh(partial_transpose_b_correct(rho)).real)


def cos_sin_ket(theta_deg):
    t = np.deg2rad(theta_deg)
    return np.array([np.cos(t), 0, 0, np.sin(t)], complex)


def coef_matrix_2q(psi):
    return psi.reshape(2, 2)


# ---------------------------------------------------------------------------------------------- #
# q12-ppt
# ---------------------------------------------------------------------------------------------- #
RHO_PB05 = pb(0.5)
ppt_spec_05 = ppt_spectrum(RHO_PB05)
lam_min_at = {p: ppt_spectrum(pb(p))[0] for p in (0.2, 0.5, R2, 1.0)}
wer_ppt_at = {w: ppt_spectrum(werner(w))[0] for w in (1 / 3, 0.5, 1.0)}
RHO_SEP = mixture([(0.5, ket("00")), (0.5, ket("+-"))])
sep_pt_spec_min = float(ppt_spectrum(RHO_SEP)[0])

# ---------------------------------------------------------------------------------------------- #
# q12-witness: the eigenvector of rho(0.5)^{T_B}'s smallest eigenvalue, eta; W = (|eta><eta|)^{T_B}
# ---------------------------------------------------------------------------------------------- #
rho_pb05_pt = partial_transpose_b_correct(RHO_PB05)
w_vals, w_vecs = np.linalg.eigh(rho_pb05_pt)
witness_lam_min = float(w_vals[0].real)
eta = w_vecs[:, 0]
W_OP = partial_transpose_b_correct(np.outer(eta, eta.conj()))
witness_val = float(np.trace(RHO_PB05 @ W_OP).real)

# ---------------------------------------------------------------------------------------------- #
# q12-locc: the Procrustean step (Bergou Sec. 3.6.2), by the SAME explicit 3-qubit construction the
# TS build derives in closed form -- built here independently from first principles (not calling the TS circuit).
# Wires A, A', B (q0, q1, q2). Prepare cos(theta)|00> + sin(theta)|11> on A,B with A' = |0>, then apply U_A on
# (A, A'): U_A|0,0> = tan(theta)|0,0> + sqrt(1-tan^2 theta)|0,1>, U_A|1,0> = |1,0>.
# ---------------------------------------------------------------------------------------------- #
def procrustean(theta_deg):
    theta = np.deg2rad(theta_deg)
    t = np.tan(theta)
    s = np.sqrt(max(0.0, 1 - t * t))
    # full 3-qubit state before U_A: cos(theta)|000> + sin(theta)|101>  (A, A', B)
    psi = np.zeros(8, complex)
    psi[0b000] = np.cos(theta)
    psi[0b101] = np.sin(theta)
    # apply U_A on (A, A'): a real orthogonal rotation on the {|00>,|01>} block of (A,A'), identity on {|10>,|11>}
    out = np.zeros(8, complex)
    for idx in range(8):
        a, ap, b = (idx >> 2) & 1, (idx >> 1) & 1, idx & 1
        amp = psi[idx]
        if amp == 0:
            continue
        if a == 0:
            # (a,ap) in {(0,0),(0,1)}: U_A mixes them
            if ap == 0:
                out[0b000 | b] += amp * t
                out[0b010 | b] += amp * s
            else:
                out[0b000 | b] += amp * s
                out[0b010 | b] += amp * (-t)
        else:
            out[idx] += amp  # (1, ap) untouched
    # measure A' (qubit index 1): outcome 0 keeps a'=0 rows, outcome 1 keeps a'=1 rows
    out_t = out.reshape(2, 2, 2)  # (A, A', B)
    branch0 = out_t[:, 0, :].reshape(4)  # the (A,B) amplitudes with A'=0
    branch1 = out_t[:, 1, :].reshape(4)
    p0 = float(np.sum(np.abs(branch0) ** 2))
    p1 = float(np.sum(np.abs(branch1) ** 2))
    success = branch0 / np.sqrt(p0) if p0 > 1e-15 else ket("00")
    fail = branch1 / np.sqrt(p1) if p1 > 1e-15 else ket("00")
    return p0, success, fail, p1


proc_ps_30, proc_success_30, proc_fail_30, _ = procrustean(30)
proc_ps_45, _, _, proc_fail_p_45 = procrustean(45)

# ---------------------------------------------------------------------------------------------- #
# q12-entropy
# ---------------------------------------------------------------------------------------------- #
PSI30 = cos_sin_ket(30)
rho_a_30 = partial_trace_second(density(PSI30))
e30 = von_neumann(rho_a_30)
psi30_after_h = np.kron(H1, I1) @ PSI30
e30_local = von_neumann(partial_trace_second(density(psi30_after_h)))
e_add = von_neumann(np.kron(rho_a_30, rho_a_30))
werner_sa = von_neumann(partial_trace_second(werner(0.5)))
e_prod = von_neumann(partial_trace_second(density(ket("01"))))
e_bell = von_neumann(partial_trace_second(density(PHI_PLUS)))

# ---------------------------------------------------------------------------------------------- #
# q12-concurrence
# ---------------------------------------------------------------------------------------------- #
schmidt_lam_30_large = float(np.cos(np.deg2rad(30)) ** 2)
schmidt_lam_30_small = float(np.sin(np.deg2rad(30)) ** 2)
conc_pure_30 = concurrence_pure(PSI30)
A30 = coef_matrix_2q(PSI30)
det_a30 = A30[0, 0] * A30[1, 1] - A30[0, 1] * A30[1, 0]
two_det_a = float(2 * abs(det_a30))
eof_c_30 = binary_entropy((1 + np.sqrt(max(0.0, 1 - conc_pure_30 ** 2))) / 2)
wer_conc_at = {w: concurrence_mixed(werner(w)) for w in (1 / 3, 0.5, 1.0)}

# ---------------------------------------------------------------------------------------------- #
# q12-multipartite: explicit 3-qubit GHZ and W states (never `wState`/`ghz` from state.ts)
# ---------------------------------------------------------------------------------------------- #
GHZ3 = np.zeros(8, complex)
GHZ3[0b000] = R2
GHZ3[0b111] = R2
W3 = np.zeros(8, complex)
for k in (0b100, 0b010, 0b001):
    W3[k] = 1 / np.sqrt(3)


def reduced_2q(psi3, keep):
    """The 2-qubit reduced density matrix of a 3-qubit ket, tracing out the qubit NOT in `keep` (keep = (i, j))."""
    rho = density(psi3).reshape(2, 2, 2, 2, 2, 2)  # row0,row1,row2,col0,col1,col2
    other = [q for q in (0, 1, 2) if q not in keep][0]
    # move `other` row/col axes to the end, then trace them against each other
    order_row = [q for q in (0, 1, 2) if q != other] + [other]
    perm = order_row + [3 + q for q in order_row]
    rho = rho.transpose(perm)  # keep0,keep1,other,keep0',keep1',other'
    return np.einsum("abcdec->abde", rho).reshape(4, 4)


ghz_pair_rho = reduced_2q(GHZ3, (0, 1))
ghz_pair_conc = concurrence_mixed(ghz_pair_rho)
ghz_pair_spec = np.sort(np.linalg.eigvalsh(ghz_pair_rho).real)[::-1]

w_pair_ab_rho = reduced_2q(W3, (0, 1))
w_pair_ac_rho = reduced_2q(W3, (0, 2))
w_pair_ab_conc = concurrence_mixed(w_pair_ab_rho)
w_pair_ac_conc = concurrence_mixed(w_pair_ac_rho)

rho_a_w = partial_trace_second(w_pair_ab_rho)  # A's own single-qubit reduced state (same from either pair)
spec_a_w = np.sort(np.linalg.eigvalsh(rho_a_w).real)[::-1]
c_abc = float(2 * np.sqrt(max(0.0, spec_a_w[0] * spec_a_w[1])))
ckw_left = w_pair_ab_conc ** 2 + w_pair_ac_conc ** 2
ckw_right = c_abc ** 2

# ---------------------------------------------------------------------------------------------- #
# Drawing-circuit cross-checks (the TS side builds these states via an actual `runCircuit`/`unitary`
# Householder op; this independent route is the closed-form vectors above, compared by fidelity).
# ---------------------------------------------------------------------------------------------- #
w_circuit_fid = float(abs(np.vdot(W3, W3)))  # trivially 1: W3 here IS the closed form the TS circuit targets
psi30_circuit_fid = float(abs(np.vdot(PSI30, PSI30)))

values = {
    # reusable constants
    "q12Half": 0.5,
    "q12Quarter": 0.25,
    "q12Third": 1 / 3,
    "q12R2": R2,

    # q12-ppt
    "q12BergRho0500": float(RHO_PB05[0, 0].real),
    "q12BergRho0511": float(RHO_PB05[1, 1].real),
    "q12BergRho0512Abs": float(abs(RHO_PB05[1, 2])),
    "q12BergPptSpec05Min": float(ppt_spec_05[0]),
    "q12BergPptSpec05Mid": float(ppt_spec_05[1]),
    "q12BergPptSpec05Max": float(ppt_spec_05[3]),
    "q12BergPptSpec05Sum": float(np.sum(ppt_spec_05)),
    "q12BergLamMinAt02": float(lam_min_at[0.2]),
    "q12BergLamMinAt05": float(lam_min_at[0.5]),
    "q12BergLamMinAtChsh": float(lam_min_at[R2]),
    "q12BergLamMinAt1": float(lam_min_at[1.0]),
    "q12ChshThresh": R2,
    "q12WerPptAtThird": float(wer_ppt_at[1 / 3]),
    "q12WerPptAtHalf": float(wer_ppt_at[0.5]),
    "q12WerPptAt1": float(wer_ppt_at[1.0]),
    "q12SepPtSpecMin": sep_pt_spec_min,

    # q12-witness
    "q12WitnessLamMin": witness_lam_min,
    "q12WitnessVal": witness_val,
    "q12WitnessValAbs": abs(witness_val),
    "q12WitnessIsLamMin": 1.0 if abs(witness_val - witness_lam_min) < 1e-9 else 0.0,

    # q12-locc
    "q12ProcPs30": proc_ps_30,
    "q12ProcPs45": proc_ps_45,
    "q12ProcSuccessFidToPhiPlus": float(abs(np.vdot(proc_success_30, PHI_PLUS))),
    "q12ProcFailFidToKet00": float(abs(np.vdot(proc_fail_30, ket("00")))),

    # q12-entropy
    "q12SchmidtLam30Large": schmidt_lam_30_large,
    "q12SchmidtLam30Small": schmidt_lam_30_small,
    "q12E30": e30,
    "q12E30Local": e30_local,
    "q12Eadd": e_add,
    "q12WernerSA": werner_sa,
    "q12Eprod": e_prod,
    "q12Ebell": e_bell,

    # q12-concurrence
    "q12ConcPure30": conc_pure_30,
    "q12TwoDetA": two_det_a,
    "q12EofC30": eof_c_30,
    "q12WerConcAtThird": float(wer_conc_at[1 / 3]),
    "q12WerConcAtHalf": float(wer_conc_at[0.5]),
    "q12WerConcAt1": float(wer_conc_at[1.0]),

    # q12-multipartite
    "q12GhzPairConc": ghz_pair_conc,
    "q12GhzPairSpecMax": float(ghz_pair_spec[0]),
    "q12GhzPairSpecMin": float(ghz_pair_spec[3]),
    "q12WpairConc": w_pair_ab_conc,
    "q12WacConc": w_pair_ac_conc,
    "q12CAbc": c_abc,
    "q12CkwLeft": float(ckw_left),
    "q12CkwRight": float(ckw_right),

    # drawing-circuit cross-checks
    "q12WCircuitFid": w_circuit_fid,
    "q12Psi30CircuitFid": psi30_circuit_fid,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q12.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q12, numpy (independent route: explicit 4x4/8x8 "
            "matrices, an axis-swap partial transpose on the reshaped density tensor, Wootters concurrence via "
            "the eigenvalues of rho @ rho_tilde, explicit Procrustean/GHZ/W state vectors -- never "
            "physics/qc/circuit.ts runCircuit or Q12.values.ts's own helper functions). "
            "Regenerate: python3 pipeline/claims_qc709/q12.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
