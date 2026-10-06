#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q14.values.ts (Physics 709, chapter Q14).

Independent route (never Q14.values.ts's own helpers, never physics/qc/povm.ts): every POVM element here is built
by direct numpy matrix construction (hand-written 2x2 arrays); the Neumark isometry uses `scipy.linalg.sqrtm`
(Schur-based), independent of the engine's own eigh-based `sqrtPSD`; the Helstrom bound uses the SVD trace norm.

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q14.py -> app/src/physics/__fixtures__/claims-qc709/q14.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write
byte-identical files.
"""
import json
from pathlib import Path

import numpy as np
from scipy.linalg import sqrtm

ROOT = Path(__file__).resolve().parent.parent.parent

R2 = 1 / np.sqrt(2)

I1 = np.eye(2, dtype=complex)
X1 = np.array([[0, 1], [1, 0]], complex)
Z1 = np.array([[1, 0], [0, -1]], complex)

ZERO2 = np.array([1, 0], complex)
ONE2 = np.array([0, 1], complex)
PLUS2 = (ZERO2 + ONE2) * R2
MINUS2 = (ZERO2 - ONE2) * R2


def ket(label):
    one = {"0": ZERO2, "1": ONE2, "+": PLUS2, "-": MINUS2}
    return one[label]


def density(psi):
    return np.outer(psi, psi.conj())


def trace_norm(M):
    """Sum of the singular values (SVD route; independent of the engine's eigh-based `traceNorm`)."""
    return float(np.sum(np.linalg.svd(M, compute_uv=False)))


def id_gap(M):
    n = M.shape[0]
    return float(np.max(np.abs(M - np.eye(n, dtype=complex))))


def is_povm(es, eps=1e-9):
    s = sum(es)
    if np.max(np.abs(s - np.eye(es[0].shape[0], dtype=complex))) > eps:
        return False
    for E in es:
        if np.max(np.abs(E - E.conj().T)) > 1e-7:
            return False
        if np.min(np.linalg.eigvalsh(E)) < -eps:
            return False
    return True


# ---------------------------------------------------------------------------------------------- #
# q14-pointer: the unsharp-Z meter at eta = 1/2 -- E+/- = 1/2(I +/- 1/2 Z) = 1/2 I +/- 1/4 Z        #
# ---------------------------------------------------------------------------------------------- #
ETA = 0.5
E_PLUS = 0.5 * (I1 + ETA * Z1)
E_MINUS = 0.5 * (I1 - ETA * Z1)
assert is_povm([E_PLUS, E_MINUS])
unsharp_sum_gap = id_gap(E_PLUS + E_MINUS)
p0_unsharp = [float(np.real(np.trace(E @ density(ket("0"))))) for E in (E_PLUS, E_MINUS)]
p_plus_unsharp = [float(np.real(np.trace(E @ density(ket("+"))))) for E in (E_PLUS, E_MINUS)]

# ---------------------------------------------------------------------------------------------- #
# q14-povm / q14-neumark: the trine (Bergou Eq. 5.24)                                              #
# ---------------------------------------------------------------------------------------------- #
PSI0 = np.array([-0.5, -0.5 * np.sqrt(3)], complex)
PSI1 = np.array([-0.5, 0.5 * np.sqrt(3)], complex)
PSI2 = np.array([1, 0], complex)
TRINE = [(2 / 3) * density(psi) for psi in (PSI0, PSI1, PSI2)]
assert is_povm(TRINE)
trine_sum_gap = id_gap(sum(TRINE))
# unscaled sum of the three rank-one projectors, summed directly (not via the 2/3-scaled POVM): 1.5 I
trine_proj_sum = np.outer(PSI0, PSI0.conj()) + np.outer(PSI1, PSI1.conj()) + np.outer(PSI2, PSI2.conj())


def born_povm(es, rho):
    return [float(np.real(np.trace(E @ rho))) for E in es]


born_on_psi0 = born_povm(TRINE, density(PSI0))
born_on_0 = born_povm(TRINE, density(ket("0")))

# Neumark dilation: V = sum_i sqrtm(E_i) (x) |i>, row a*m+i = sqrtm(E_i)'s row a (d=2, m=3).
d_sys, m_out = 2, len(TRINE)
roots = [sqrtm(E) for E in TRINE]
V_ISO = np.zeros((d_sys * m_out, d_sys), complex)
for a in range(d_sys):
    for i in range(m_out):
        for b in range(d_sys):
            V_ISO[a * m_out + i, b] = roots[i][a, b]
neumark_vdagv_gap = id_gap(V_ISO.conj().T @ V_ISO)

PROJECTORS = []
for i in range(m_out):
    P = np.zeros((d_sys * m_out, d_sys * m_out), complex)
    for a in range(d_sys):
        P[a * m_out + i, a * m_out + i] = 1
    PROJECTORS.append(P)

v_rho_vdag = V_ISO @ density(ket("0")) @ V_ISO.conj().T
neumark_match = [float(np.real(np.trace(P @ v_rho_vdag))) for P in PROJECTORS]

# Bergou p. 86's 'e.g.': extend V by the identity on the complement of |psi_B> = |0>_B (slots a*m+i, i >= 1).
# V's own columns go in the |a>|0_B> slots; U is NOT unitary (max |U^dag U - I| = 0.816).
U_EXT = np.zeros((d_sys * m_out, d_sys * m_out), complex)
for a in range(d_sys):
    U_EXT[:, a * m_out] = V_ISO[:, a]
    for i in range(1, m_out):
        U_EXT[a * m_out + i, a * m_out + i] = 1
neumark_extend_gap = id_gap(U_EXT.conj().T @ U_EXT)

# ---------------------------------------------------------------------------------------------- #
# q14-usd: |0> vs |+>, equal priors -- N&C's never-err POVM (Eqs. 2.118-2.120)                     #
# ---------------------------------------------------------------------------------------------- #
overlap_0_plus = float(abs(np.vdot(ket("0"), ket("+"))))
usd_succ = 1 - overlap_0_plus
usd_half_inconcl = 0.5 * overlap_0_plus  # half the inconclusive rate, closed form

NC_CONST = 2 - np.sqrt(2)  # independent closed form (TS computes sqrt2/(1+sqrt2))
E1_NC = NC_CONST * density(ket("1"))
E2_NC = NC_CONST * density(ket("-"))
E0_NC = I1 - E1_NC - E2_NC
assert is_povm([E0_NC, E1_NC, E2_NC])

# ---------------------------------------------------------------------------------------------- #
# q14-min-error / q14-compare: Gamma = eta2 rho2 - eta1 rho1 at equal priors                       #
# ---------------------------------------------------------------------------------------------- #
GAMMA = 0.5 * (density(ket("+")) - density(ket("0")))
gamma_spec = sorted(np.linalg.eigvalsh(GAMMA).tolist())
gamma_trace_norm = trace_norm(GAMMA)  # SVD route: sqrt(1 - c^2)


def helstrom_succ(rho0, rho1, p0):
    diff = p0 * rho0 - (1 - p0) * rho1
    return 0.5 * (1 + trace_norm(diff))


helstrom_succ_val = helstrom_succ(density(ket("0")), density(ket("+")), 0.5)
helstrom_err_val = 1 - helstrom_succ_val
helstrom_coin_toss = helstrom_succ(density(ket("+")), density(ket("+")), 0.5)  # identical states: 1/2
even_prior = 1 / len([ket("0"), ket("+")])

helstrom_c0 = helstrom_succ(density(ket("0")), density(ket("1")), 0.5)
usd_c0 = 1 - float(abs(np.vdot(ket("0"), ket("1"))))

values = {
    "q14UnsharpEPlus00": E_PLUS[0, 0].real,
    "q14UnsharpEPlus11": E_PLUS[1, 1].real,
    "q14UnsharpEMinus00": E_MINUS[0, 0].real,
    "q14UnsharpEMinus11": E_MINUS[1, 1].real,
    "q14UnsharpSumGap": unsharp_sum_gap,
    "q14UnsharpP0Plus": p0_unsharp[0],
    "q14UnsharpP0Minus": p0_unsharp[1],
    "q14UnsharpPPlusPlus": p_plus_unsharp[0],
    "q14TrineSumGap": trine_sum_gap,
    "q14TrineCorrect": born_on_psi0[0],
    "q14TrineError": born_on_psi0[1],
    "q14TrineOnZero0": born_on_0[0],
    "q14TrineOnZero2": born_on_0[2],
    "q14TrineProjDiag": trine_proj_sum[0, 0].real,
    "q14NeumarkVdagVGap": neumark_vdagv_gap,
    "q14NeumarkMatch0": neumark_match[0],
    "q14NeumarkMatch2": neumark_match[2],
    "q14NeumarkAncillaDim": float(len(PROJECTORS)),
    "q14NeumarkExtendGap": neumark_extend_gap,
    "q14Overlap0Plus": overlap_0_plus,
    "q14UsdSucc": usd_succ,
    "q14UsdInconcl": 1 - usd_succ,
    "q14UsdHalfInconcl": usd_half_inconcl,
    "q14NcConst": NC_CONST,
    "q14HelstromSucc": helstrom_succ_val,
    "q14HelstromErr": helstrom_err_val,
    "q14HelstromGammaLo": gamma_spec[0],
    "q14HelstromGammaHi": gamma_spec[1],
    "q14GammaTraceNorm": gamma_trace_norm,
    "q14EvenPrior": even_prior,
    "q14CompareC0Helstrom": helstrom_c0,
    "q14CompareC0Usd": usd_c0,
    "q14HelstromCoinToss": helstrom_coin_toss,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q14.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q14, numpy (direct matrix construction: hand-written "
            "2x2 POVM-element arrays, scipy.linalg.sqrtm for the Neumark isometry, SVD trace norm for Helstrom; "
            "never physics/qc/povm.ts or Q14.values.ts's own helpers). Regenerate: python3 pipeline/claims_qc709/q14.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
