#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q10.values.ts (Physics 709, chapter Q10).

Independent route (never Q10.values.ts's own helper functions): every state and operator here is built by direct
numpy matrix construction (hand-written 2x2/4x4 arrays via np.kron), and the CHSH dial's 45-degree value is checked
by the CLOSED FORM 2cos(delta) + 2sin(delta) rather than by re-running the operator sum, a genuinely different route
to the same number (matching physics/qc/entangle.ts's `chsh` vs `chshCurve` split).

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q10.py -> app/src/physics/__fixtures__/claims-qc709/q10.json
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
PLUS2 = np.array([1, 1], complex) * R2


def ket(label):
    """A product ket from a label, one char per qubit, q0 first: '0', '1', '+' (state.ts `ket`)."""
    one = {"0": ZERO2, "1": ONE2, "+": PLUS2}
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


def correlator(rho, a, b):
    """<a (x) b> = Tr(rho . a kron b), rho a density matrix (or a ket, auto-promoted)."""
    if rho.ndim == 1:
        rho = density(rho)
    return float(np.real(np.trace(rho @ np.kron(a, b))))


def chsh(rho, a1, a2, b1, b2):
    return correlator(rho, a1, b1) + correlator(rho, a1, b2) + correlator(rho, a2, b1) - correlator(rho, a2, b2)


def reduced(rho, keep):
    """The 2x2 reduced density matrix of qubit `keep` (0 or 1) of a two-qubit rho."""
    r = rho.reshape(2, 2, 2, 2)
    if keep == 0:
        return np.einsum("ikjk->ij", r)
    return np.einsum("kikj->ij", r)


# ---------------------------------------------------------------------------------------------- #
# q10Half: one of Phi+'s partial-transpose eigenvalues, |lambda_min| (the Peres test, se:b3)
# ---------------------------------------------------------------------------------------------- #
PHI_PLUS = (ket("00") + ket("11")) * R2
rho_phi = density(PHI_PLUS)
# partial transpose on qubit B (the second factor): swap qubit-B index between row and column
rho_phi_tb = rho_phi.reshape(2, 2, 2, 2).transpose(0, 3, 2, 1).reshape(4, 4)
phi_pt_eigs = np.sort(np.linalg.eigvalsh(rho_phi_tb))
q10_half = float(abs(phi_pt_eigs[0]))

# ---------------------------------------------------------------------------------------------- #
# q10Third: the separable mixture's reduced Bloch z-component, |r_z| (Bergou Eq. 3.3, se:b1)
# ---------------------------------------------------------------------------------------------- #
sep33 = mixture([(1 / 3, ket("00")), (2 / 3, ket("11"))])
rA_sep33 = reduced(sep33, 0)
# r_z = Tr(rho_A Z) = rho00 - rho11 (the diagonal entries are the qubit's own populations)
q10_third = float(abs(rA_sep33[0, 0].real - rA_sep33[1, 1].real))

# ---------------------------------------------------------------------------------------------- #
# chi(delta) = (|00> + e^{i delta}|11>)/sqrt2 (Bergou Eq. 3.12)
# ---------------------------------------------------------------------------------------------- #
def chi(delta_deg):
    d = np.deg2rad(delta_deg)
    return (ket("00") + np.exp(1j * d) * ket("11")) * R2


CHI45 = chi(45.0)

# q10ChiS: the CHSH value of chi(45 deg) with Alice/Bob both reading sigma_x, sigma_y (Bergou Eqs. 3.11-3.13)
q10_chi_s = chsh(CHI45, X1, Y1, X1, Y1)

# q10R2: the magnitude of chi(45 deg)'s four correlators (three agree, one is the negative of them)
q10_r2 = float(abs(correlator(CHI45, X1, X1)))

# q10DialAt45: the CHSH dial sampled at delta = 45 deg by the CLOSED FORM 2 cos(delta) + 2 sin(delta)
# (Bergou's phase-dial state at settings a = X, Y; b = X, Y) -- independent of the operator-sum route above.
q10_dial_at_45 = 2 * np.cos(np.deg2rad(45.0)) + 2 * np.sin(np.deg2rad(45.0))

# ---------------------------------------------------------------------------------------------- #
# q10Tsirelson: the Tsirelson bound from the CHSH operator's own spectrum, ||C|| (Bergou Eq. 3.17)
# ---------------------------------------------------------------------------------------------- #
C = np.kron(X1, X1) + np.kron(X1, Y1) + np.kron(Y1, X1) - np.kron(Y1, Y1)
c_eigs = np.linalg.eigvalsh(C)
q10_tsirelson = float(np.max(np.abs(c_eigs)))

# ---------------------------------------------------------------------------------------------- #
# q10NCS: N&C's singlet version, Q = Z1, R = X1, S = -(Z2+X2)/sqrt2, T = (Z2-X2)/sqrt2 (N&C Eqs. 2.227-2.230)
# ---------------------------------------------------------------------------------------------- #
PSI_MINUS = (ket("01") - ket("10")) * R2
S_OP = -(Z1 + X1) * R2
T_OP = (Z1 - X1) * R2
# chsh(a1,a2,b1,b2) = <a1b1>+<a1b2>+<a2b1>-<a2b2>; N&C's score is <QS>+<RS>+<RT>-<QT>, so a1=R=X1, a2=Q=Z1
# (a1 is the setting that pairs positively with BOTH b1, b2; a2 is the one whose b2-pairing is negative).
q10_nc_s = chsh(PSI_MINUS, X1, Z1, S_OP, T_OP)

values = {
    "q10Half": q10_half,
    "q10Third": q10_third,
    "q10R2": q10_r2,
    "q10ChiS": q10_chi_s,
    "q10DialAt45": q10_dial_at_45,
    "q10Tsirelson": q10_tsirelson,
    "q10NCS": q10_nc_s,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q10.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q10, numpy (direct matrix construction via np.kron; the "
            "CHSH dial's 45 degree value is checked by the closed form 2cos(delta)+2sin(delta), a second route "
            "independent of the operator-sum route used for q10ChiS/q10NCS/q10Tsirelson; never physics/qc/"
            "entangle.ts or Q10.values.ts's own helpers). "
            "Regenerate: python3 pipeline/claims_qc709/q10.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
