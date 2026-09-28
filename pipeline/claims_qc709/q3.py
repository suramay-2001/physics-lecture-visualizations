#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q3.values.ts (Physics 709, chapter Q3).

The engine computes Q3's numbers through spin.ts's a0*I + a.sigma decomposition (eigenHermitian2, nDotSigma) and
qc/cmat.ts's cyclic-Jacobi `eigh`. This script takes a different, independent route for every fact:
  - kets are built directly from the Bloch-angle formula cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>;
  - eigenvalues/eigenvectors use numpy.linalg.eigh (LAPACK), never the engine's a.sigma geometry;
  - Stern-Gerlach benches propagate an unnormalized density matrix with Lueders projectors (the oven is I/2);
  - Robertson's bound, moments and dispersions are evaluated directly from ket sandwiches, not the engine's
    varianceN/robertsonBound helpers.
Units: hbar = 1 (S_i = sigma_i / 2), matching the engine. Phase convention: ketFromBloch's first component is
cos(theta/2), real and >= 0, so no extra phase-fixing is needed for the chapter's own states.

Usage (from the repo root): python3 pipeline/claims_qc709/q3.py -> app/src/physics/__fixtures__/claims-qc709/q3.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key; displayed numbers <-> claims in scope). The
output is deterministic: two runs write byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

SX = np.array([[0, 1], [1, 0]], complex) / 2
SY = np.array([[0, -1j], [1j, 0]], complex) / 2
SZ = np.array([[1, 0], [0, -1]], complex) / 2
SIGMA_X = np.array([[0, 1], [1, 0]], complex)
SIGMA_Y = np.array([[0, -1j], [1j, 0]], complex)
SIGMA_Z = np.array([[1, 0], [0, -1]], complex)
I2 = np.eye(2, dtype=complex)
H = np.array([[1, 1], [1, -1]], complex) / np.sqrt(2)


def yes(b):
    return 1.0 if b else 0.0


def ket_bloch(theta, phi):
    """cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>, the notes' Eq. 1.4."""
    return np.array([np.cos(theta / 2), np.exp(1j * phi) * np.sin(theta / 2)], complex)


def n_hat(theta, phi):
    return np.array([np.sin(theta) * np.cos(phi), np.sin(theta) * np.sin(phi), np.cos(theta)])


def n_dot_sigma(n):
    return n[0] * SIGMA_X + n[1] * SIGMA_Y + n[2] * SIGMA_Z


def spin_along(n):
    return n_dot_sigma(n) / 2


def proj(v):
    return np.outer(v, v.conj())


def prob(a, psi):
    return float(abs(np.vdot(a, psi)) ** 2)


def sandwich(A, psi):
    return complex(np.vdot(psi, A @ psi))


def expectation(A, psi):
    z = sandwich(A, psi)
    assert abs(z.imag) < 1e-9, "expectation: not real"
    return float(z.real)


def variance(A, psi):
    m = expectation(A, psi)
    v = expectation(A @ A, psi) - m * m
    # a variance below 1e-12 is floating-point roundoff around an exact eigenstate (e.g. Delta S_x = 0 for |+x>)
    return 0.0 if v < 1e-12 else v


def dagger(M):
    return M.conj().T


def commutator(A, B):
    return A @ B - B @ A


def anticommutator(A, B):
    return A @ B + B @ A


def same_ray(a, b):
    return abs(prob(a / np.linalg.norm(a), b / np.linalg.norm(b)) - 1) < 1e-9


def robertson(A, B, psi):
    product = np.sqrt(variance(A, psi) * variance(B, psi))
    comm = commutator(A, B)
    e = sandwich(comm, psi)
    bound = 0.5 * abs(e)
    return product, bound


# ---- Stern-Gerlach benches (independent of physics/sg.ts): Lueders propagation of a density matrix -----------------
KET = {"+z": np.array([1, 0], complex), "-z": np.array([0, 1], complex),
       "+x": np.array([1, 1], complex) / np.sqrt(2), "-x": np.array([1, -1], complex) / np.sqrt(2),
       "+y": np.array([1, 1j], complex) / np.sqrt(2), "-y": np.array([1, -1j], complex) / np.sqrt(2)}
AXIS_OP = {"x": SIGMA_X, "z": SIGMA_Z}


def eigvec(M, sign):
    w, v = np.linalg.eigh(M)
    return v[:, np.argmax(w)] if sign == "+" else v[:, np.argmin(w)]


def bench(source, axes, keep):
    rho = I2 / 2 if source == "oven" else proj(KET[source])
    blocked = []
    for k, a in enumerate(axes[:-1]):
        P = proj(eigvec(AXIS_OP[a], keep[k]))
        kept = P @ rho @ P
        blocked.append(float(np.real(np.trace(rho) - np.trace(kept))))
        rho = kept
    Mlast = AXIS_OP[axes[-1]]
    plus = float(np.real(np.trace(proj(eigvec(Mlast, "+")) @ rho)))
    minus = float(np.real(np.trace(proj(eigvec(Mlast, "-")) @ rho)))
    return plus, minus, blocked


# ---- shared states ---------------------------------------------------------------------------------------------
psi = ket_bloch(np.pi / 3, 0)  # (0.866, 0.5), Q2's running state
N = ket_bloch(np.pi / 3, np.pi / 4)  # |+n>, theta=60, phi=45
MINUS_N = ket_bloch(2 * np.pi / 3, 5 * np.pi / 4)  # |-n>
NVEC = n_hat(np.pi / 3, np.pi / 4)
PX, MX = proj(KET["+x"]), proj(KET["-x"])
PZ, MZ = proj(KET["+z"]), proj(KET["-z"])

M = np.array([[1, 2 - 1j], [2 + 1j, -3]], complex)
J = np.array([[0, -1], [1, 0]], complex)
A_OP = np.array([[1, -1], [1, 1]], complex)
NONHERM = np.array([[0, 1], [0, 0]], complex)
S2 = SX @ SX + SY @ SY + SZ @ SZ

# z -> y and z -> x basis-change matrices: U_ij = <new_i|old_j> with the standard basis as "old"
U_ZY = np.array([KET["+y"].conj(), KET["-y"].conj()])
U_ZX = np.array([KET["+x"].conj(), KET["-x"].conj()])
P_Z_IN_X = H @ PZ @ H

w_M, v_M = np.linalg.eigh(M)
a0_M = float(np.real(np.trace(M)) / 2)
a_M = np.array([float(np.real(np.trace(M @ SIGMA_X))) / 2, float(np.real(np.trace(M @ SIGMA_Y))) / 2, float(np.real(np.trace(M @ SIGMA_Z))) / 2])
w_J = np.linalg.eigvals(J)
w_sigma_n = np.linalg.eigvalsh(n_dot_sigma(NVEC))

robN_product, robN_bound = robertson(SX, SY, N)
robZ_product, robZ_bound = robertson(SX, SY, KET["+z"])
robX_product, robX_bound = robertson(SX, SY, KET["+x"])

deltaSx = SX - expectation(SX, N) * I2
deltaSy = SY - expectation(SY, N) * I2
cov_xy = float(np.real(sandwich(anticommutator(deltaSx, deltaSy), N))) / 2

SCHWARZ_A = np.array([1, 1j], complex)
SCHWARZ_B = np.array([2, 1], complex)
inner_BA = np.vdot(SCHWARZ_B, SCHWARZ_A)  # <b|a>
lambda_best = -inner_BA / float(np.vdot(SCHWARZ_B, SCHWARZ_B).real)

values = {
    # q3-born
    "q3Pzx": prob(KET["+x"], KET["+z"]),
    "q3BornPlus": prob(KET["+x"], psi),
    "q3BornMinus": prob(KET["-x"], psi),
    "q3ProjLen": float(np.linalg.norm(PX @ psi)),
    "q3SandwichMatchesProb": yes(abs(float(np.real(sandwich(PX, psi))) - prob(KET["+x"], psi)) < 1e-9),
    "q3Complete": yes(np.allclose(PX + MX, I2) and np.allclose(PZ + MZ, I2)),
    "q3AfterPlus": yes(same_ray(PX @ psi, KET["+x"])),
    "q3PhaseProj": yes(np.allclose(proj(-KET["+x"]), PX) and np.allclose(proj(1j * KET["+x"]), PX)),
    "q3BSandwich": float(np.real(sandwich(PX, np.array([0.6, 0.8], complex)))),
    "q3BPhase": float(np.real(sandwich(MX, np.array([0.6, 0.8j], complex)))),
    # q3-bloch
    "q3NAlpha": float(np.real(N[0])),
    "q3NBetaRe": float(np.real(N[1])),
    "q3NBetaIm": float(np.imag(N[1])),
    "q3NVecXY": float(NVEC[0]),
    "q3NVecZ": float(NVEC[2]),
    "q3MinusNAlpha": float(np.real(MINUS_N[0])),
    "q3NOrth": float(abs(np.vdot(N, MINUS_N))),
    "q3MinusZpole": yes(same_ray(ket_bloch(np.pi, np.pi), KET["-z"]) and same_ray(-KET["+z"], KET["+z"])),
    "q3STheta": float(np.degrees(np.arccos(2 * 0.75 - 1))),
    "q3SNx": float(n_hat(np.pi / 2, np.pi / 3)[0]),
    "q3SMinus": float(np.real(ket_bloch(2 * np.pi / 3, np.pi)[0])),
    "q3S120": prob(KET["+z"], ket_bloch(2 * np.pi / 3, 0)),
    # q3-spin-operators
    "q3PsiBeta": float(np.real(psi[1])),
    "q3ReducePsi0": float(np.real((PZ @ psi)[0])),
    "q3XZOverlap": float(abs(np.vdot(KET["+x"], KET["+z"]))),
    "q3PzInX": yes(np.allclose(P_Z_IN_X, 0.5 * np.array([[1, 1], [1, 1]]))),
    "q3Idem": yes(np.allclose(P_Z_IN_X @ P_Z_IN_X, P_Z_IN_X)),
    "q3SzBuild": yes(np.allclose(0.5 * (PZ - MZ), SZ)),
    "q3SxBuild": yes(np.allclose(0.5 * (PX - MX), SX)),
    "q3SyBuild": yes(np.allclose(0.5 * (proj(KET["+y"]) - proj(KET["-y"])), SY)),
    "q3Y5050": prob(KET["+z"], KET["+y"]),
    "q3SigmaNTop": float(np.real(n_dot_sigma(NVEC)[0][1])),
    "q3SnIsSpinAlong": yes(np.allclose(0.5 * (proj(N) - proj(MINUS_N)), spin_along(NVEC))),
    "q3SigmaNEig": yes(abs(min(w_sigma_n) + 1) < 1e-9 and abs(max(w_sigma_n) - 1) < 1e-9),
    "q3PzInXisPx": yes(np.allclose(P_Z_IN_X, PX)),
    "q3NotSame": yes(not np.allclose(PZ, PX)),
    "q3OPx": float(np.real(PX[0][1])),
    "q3OPz": float(np.linalg.norm(PZ @ np.array([0.6, 0.8], complex))),
    "q3OSigmaN": float(np.real(n_dot_sigma(n_hat(np.pi / 3, 0))[0][0])),
    # q3-observables
    "q3SelectivePlus": bench("oven", ["z", "z"], ["+"])[0],
    "q3SelectiveBlocked": bench("oven", ["z", "z"], ["+"])[2][0],
    "q3Pz75": prob(KET["+z"], N),
    "q3Pz25": prob(KET["-z"], N),
    "q3AvgSz": expectation(SZ, N),
    "q3AvgSzSum": 0.5 * prob(KET["+z"], N) - 0.5 * prob(KET["-z"], N),
    "q3AvgSx": expectation(SX, N),
    "q3AvgSy": expectation(SY, N),
    "q3AvgSigma": yes(abs(expectation(SIGMA_X, N) - NVEC[0]) < 1e-9 and abs(expectation(SIGMA_Y, N) - NVEC[1]) < 1e-9 and abs(expectation(SIGMA_Z, N) - NVEC[2]) < 1e-9),
    "q3AdagCheck": yes(np.allclose(dagger(A_OP), np.array([[1, 1], [-1, 1]]))),
    "q3AdagNorm": float(np.linalg.norm(dagger(A_OP) @ psi)),
    "q3AdjProdEq": yes(np.allclose(dagger(A_OP @ SX), dagger(SX) @ dagger(A_OP))),
    "q3AdjProdNeq": yes(not np.allclose(dagger(A_OP @ SX), dagger(A_OP) @ dagger(SX))),
    "q3AdjScale": yes(np.allclose(dagger(1j * A_OP), np.conj(1j) * dagger(A_OP))),
    "q3NonHerm": float(np.real(sandwich(NONHERM, N))),
    "q3NonHermIsHerm": yes(np.allclose(NONHERM, dagger(NONHERM))),
    "q3MAvg": expectation(SZ, np.array([np.sqrt(0.9), np.sqrt(0.1)], complex)),
    # q3-spectral
    "q3MPolyB": float(-np.real(np.trace(M))),
    "q3MPolyC": float(np.real(np.linalg.det(M))),
    "q3MValLow": float(w_M[0]),
    "q3MValHigh": float(w_M[1]),
    "q3MGaugeA0": a0_M,
    "q3MGaugeLen": float(np.linalg.norm(a_M)),
    "q3JEig": yes(abs(w_J[0].real) < 1e-9 and abs(w_J[1].real) < 1e-9 and abs(abs(w_J[0].imag) - 1) < 1e-9 and abs(abs(w_J[1].imag) - 1) < 1e-9),
    "q3MOrth": float(abs(np.vdot(v_M[:, 0], v_M[:, 1]))),
    "q3F": float(np.real(np.linalg.eigh(SZ)[1] @ np.diag(np.linalg.eigh(SZ)[0] ** 2) @ dagger(np.linalg.eigh(SZ)[1]))[0][0]),
    "q3DiagUAUdIsDiag": yes(abs((U_ZY @ SIGMA_Y @ dagger(U_ZY))[0][1]) < 1e-9),
    "q3DiagUdAUIsDiag": yes(abs((dagger(U_ZY) @ SIGMA_Y @ U_ZY)[0][1]) < 1e-9),
    "q3Moment1": float(np.real(sandwich(SZ, N))),
    "q3Moment2": float(np.real(sandwich(SZ @ SZ, N))),
    "q3VarSz": variance(SZ, N),
    "q3SpreadZ": float(np.sqrt(variance(SZ, N))),
    "q3VarXY": variance(SX, N),
    "q3SpreadXY": float(np.sqrt(variance(SX, N))),
    "q3EigZeroAvg": expectation(spin_along(NVEC), N),
    "q3EigZeroVar": variance(spin_along(NVEC), N),
    "q3EEig": float(w_M[1]),
    # q3-uncertainty
    "q3CommXY": yes(np.allclose(commutator(SX, SY), 1j * SZ)),
    "q3AntiXY": yes(np.allclose(anticommutator(SX, SY), np.zeros((2, 2)))),
    "q3AntiXX": yes(np.allclose(anticommutator(SX, SX), 0.5 * I2)),
    "q3S2Val": float(np.real(S2[0][0])),
    "q3S2Check": yes(np.allclose(S2, 0.75 * I2)),
    "q3S2Comm": yes(np.allclose(commutator(S2, SZ), np.zeros((2, 2)))),
    "q3Jacobi": yes(np.allclose(
        commutator(SX, commutator(SY, SZ)) + commutator(SY, commutator(SZ, SX)) + commutator(SZ, commutator(SX, SY)),
        np.zeros((2, 2)),
    )),
    "q3CompatPx": yes(np.allclose(commutator(SX, PX), np.zeros((2, 2)))),
    "q3CompatPxDiag": yes(np.allclose(U_ZX @ PX @ dagger(U_ZX), np.array([[1, 0], [0, 0]]))),
    "q3SchwarzLHS": float(abs(np.vdot(SCHWARZ_A, SCHWARZ_B)) ** 2),
    "q3SchwarzRHS": float(np.vdot(SCHWARZ_A, SCHWARZ_A).real * np.vdot(SCHWARZ_B, SCHWARZ_B).real),
    "q3SchwarzLambdaRe": float(abs(lambda_best.real)),
    "q3SchwarzLambdaIm": float(abs(lambda_best.imag)),
    "q3SchwarzBestNorm": float(np.vdot(SCHWARZ_A, SCHWARZ_A).real - abs(np.vdot(SCHWARZ_A, SCHWARZ_B)) ** 2 / np.vdot(SCHWARZ_B, SCHWARZ_B).real),
    "q3UComm": float(np.imag(sandwich(commutator(SX, SY), KET["+z"]))),
    "q3RobProduct": robN_product,
    "q3RobBound": robN_bound,
    "q3RobProdSq": robN_product ** 2,
    "q3RobBoundSq": robN_bound ** 2,
    "q3CommExpIm": float(np.imag(sandwich(commutator(SX, SY), N))),
    "q3Cov2": cov_xy ** 2,
    "q3RobZProduct": robZ_product,
    "q3RobZSq": robZ_product ** 2,
    "q3RobXVarY": variance(SY, KET["+x"]),
    "q3RobXProduct": robX_product,
    "q3RobXBound": robX_bound,
    "q3EnsXPlus": bench("+z", ["x"], [])[0],
    "q3EnsZPlus": bench("+z", ["z"], [])[0],
    "q3SatNx0": yes(abs(robertson(SX, SY, ket_bloch(np.pi / 3, np.pi / 2))[0] - robertson(SX, SY, ket_bloch(np.pi / 3, np.pi / 2))[1]) < 1e-6),
    "q3SatNy0": yes(abs(robertson(SX, SY, ket_bloch(np.pi / 3, 0))[0] - robertson(SX, SY, ket_bloch(np.pi / 3, 0))[1]) < 1e-6),
    # small constants displayed as formula coefficients, plus two derived squares
    "q3Half": 0.5,
    "q3Quarter": 0.25,
    "q3PzInXHalf": float(abs(np.vdot(KET["+x"], KET["+z"])) ** 2),
    "q3AvgSzSq": expectation(SZ, N) ** 2,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q3.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q3, numpy (numpy.linalg.eigh, Lueders projectors, direct "
            "ket sandwiches, never the engine's a0*I + a.sigma decomposition). Regenerate: python3 pipeline/claims_qc709/q3.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
