#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q2.values.ts (Physics 709, chapter Q2).

Independent route from the engine (which uses closed-form kets, `components()` via an explicit 2x2/3x3 inverse,
and `gramSchmidt()`'s own loop):
  - kets |±x>, |±y>, |±z> are eigenvectors of the Pauli matrices from numpy.linalg.eigh, phase-fixed (first
    nonzero entry real > 0), as in q1.py;
  - a real plane arrow at angle "deg" (0 = |+z>, 90 = |-z>) is the '+' eigenvector of sin(2*deg)*sx + cos(2*deg)*sz,
    i.e. the SAME arrow the engine's `ketFromBloch(2*deg, 0)` builds, but reached by diagonalizing a matrix instead
    of writing cos/sin directly;
  - Gram-Schmidt is a from-scratch loop (subtract each earlier projection, normalize what remains);
  - components(psi, basis) solves the linear system with numpy.linalg.solve, not a hand-written 2x2/3x3 inverse;
  - the z<->x, z<->y change-of-basis matrices are built as U[i,j] = <new_i|old_j> from vdot, not `changeU`;
  - the photon frame turn is R_y(-2*chi) = cos(chi) I + i sin(chi) sigma_y, i.e. the notes' own U(chi) matrix,
    checked here against numpy's eigh-built rotation rather than assumed equal;
  - rank/independence use numpy.linalg.matrix_rank.
Units: hbar = 1 (S = sigma/2), matching the engine.

Usage (from the repo root): python3 pipeline/claims_qc709/q2.py -> app/src/physics/__fixtures__/claims-qc709/q2.json
Checked by app/src/content/claims.test.ts. The output is deterministic: two runs write byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

SX = np.array([[0, 1], [1, 0]], complex)
SY = np.array([[0, -1j], [1j, 0]], complex)  # the full (unscaled) Pauli Y = the engine's SIGMA_Y = the photon J_z/hbar table
SZ = np.array([[1, 0], [0, -1]], complex)
I2 = np.eye(2, dtype=complex)
SPIN_X, SPIN_Y, SPIN_Z = SX / 2, SY / 2, SZ / 2  # S_i = sigma_i / 2 (hbar = 1)
H = (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], complex)


def fixed(v):
    k = next(i for i, x in enumerate(v) if abs(x) > 1e-12)
    return v * np.exp(-1j * np.angle(v[k]))


def eigvec(M, sign):
    w, v = np.linalg.eigh(M)
    return fixed(v[:, np.argmax(w) if sign == "+" else np.argmin(w)])


def ket(name):
    sign, axis = name[0], name[1]
    return eigvec({"x": SX, "y": SY, "z": SZ}[axis], sign)


def plane_vec(deg):
    """The real arrow at plane angle `deg` (0 = |+z>, 90 = |-z>): cos(deg), sin(deg) (= ketFromBloch(2*deg, 0)).

    NOT built through `eigvec`'s eigh + "first entry real positive" phase-fixing: that convention is discontinuous
    across deg = 90 deg (theta = 180 deg), where the natural cos(deg) turns negative, so it would silently flip the
    sign of half the arrows this script builds (caught by comparing against the engine at deg = 135, an easy mistake
    to leave in un-noticed). The trig form matches `ketFromBloch` for every deg with no branch.
    """
    t = np.radians(deg)
    return np.array([np.cos(t), np.sin(t)], complex)


pol = plane_vec  # the photon's linear-polarization state at frame angle chi (degrees): the same construction


def norm(v):
    return float(np.sqrt(np.real(np.vdot(v, v))))


def norm2(v):
    return float(np.real(np.vdot(v, v)))


def prob(a, psi):
    return float(abs(np.vdot(a, psi)) ** 2)


def yes(b):
    return 1 if b else 0


def angle_between_deg(a, b):
    x = np.vdot(a, b).real / (norm(a) * norm(b))
    return float(np.degrees(np.arccos(np.clip(x, -1, 1))))


def bloch_vector(psi):
    p = psi / norm(psi)
    return np.array([np.vdot(p, SX @ p).real, np.vdot(p, SY @ p).real, np.vdot(p, SZ @ p).real])


def bloch_angle_deg(a, b):
    ra, rb = bloch_vector(a), bloch_vector(b)
    return float(np.degrees(np.arccos(np.clip(np.dot(ra, rb), -1, 1))))


def is_independent(vs, rtol=1e-10):
    M = np.column_stack(vs)
    return np.linalg.matrix_rank(M, tol=rtol) == len(vs)


def components(psi, basis):
    """The unique c with psi = sum_k c_k basis_k, solved as a linear system (not the engine's explicit inverse)."""
    B = np.column_stack(basis)
    return np.linalg.solve(B, psi)


def gram_schmidt(vs):
    """From scratch: keep the first vector's direction, remove each new vector's shadow on the earlier ones, normalize."""
    basis, steps = [], []
    for v in vs:
        w = v.astype(complex).copy()
        for e in basis:
            w = w - e * np.vdot(e, v)
        if norm(w) < 1e-10:
            continue
        e = w / norm(w)
        basis.append(e)
        steps.append({"residual": w, "e": e})
    return {"basis": basis, "steps": steps}


def change_u(new_basis, old_basis=None):
    """U_ij = <new_i|old_j> (old_basis defaults to the standard basis)."""
    n = len(new_basis)
    old = old_basis if old_basis is not None else [np.eye(n, dtype=complex)[:, j] for j in range(n)]
    return np.array([[np.vdot(new_basis[i], old[j]) for j in range(n)] for i in range(n)])


def is_unitary(U, eps=1e-9):
    return np.allclose(U.conj().T @ U, np.eye(U.shape[0]), atol=eps)


def mat_eq(A, B, eps=1e-9):
    return np.allclose(A, B, atol=eps)


def rotation(axis, phi):
    """e^{-i phi n.S} = cos(phi/2) I - i sin(phi/2) n.sigma (the engine's convention)."""
    n = np.array(axis, dtype=float)
    n = n / np.linalg.norm(n)
    n_sigma = n[0] * SX + n[1] * SY + n[2] * SZ
    return np.cos(phi / 2) * I2 - 1j * np.sin(phi / 2) * n_sigma


def frame_turn(chi_deg):
    """The photon frame turned by chi (degrees): the notes' U(chi) = (cos chi, sin chi; -sin chi, cos chi)."""
    return rotation([0, 1, 0], -2 * np.radians(chi_deg))


def same_physical_state(a, b, eps=1e-9):
    return abs(prob(a / norm(a), b / norm(b)) - 1) < eps


def bench_plus_minus(source, axis):
    """Single-device Lüders bench (q2XHalf*): the + and - fractions of `source` read along `axis`."""
    rho = np.outer(ket(source), ket(source).conj())
    M = {"x": SX, "y": SY, "z": SZ}[axis]
    plus = float(np.real(np.trace(np.outer(eigvec(M, "+"), eigvec(M, "+").conj()) @ rho)))
    minus = float(np.real(np.trace(np.outer(eigvec(M, "-"), eigvec(M, "-").conj()) @ rho)))
    return plus, minus


# ---- q2-basis --------------------------------------------------------------------------------------------------
psi30 = plane_vec(30)
c30 = components(psi30, [ket("+z"), ket("-z")])
c30x = components(psi30, [ket("+x"), ket("-x")])
c_mz = components(ket("-z"), [ket("+z"), ket("+x")])

# ---- q2-gram-schmidt --------------------------------------------------------------------------------------------
gs_zb60 = gram_schmidt([ket("+z"), plane_vec(60)])
gs3d = gram_schmidt([np.array([1, 1, 0], complex), np.array([1, 0, 1], complex), np.array([0, 1, 1], complex)])
gs_yz = gram_schmidt([ket("+y"), ket("+z")])
gs_left = gram_schmidt([ket("+z"), np.array([0.6, 0.8], complex)])
gs_order = gram_schmidt([plane_vec(60), ket("+z")])
gs_dep = gram_schmidt([ket("+z"), ket("-z"), ket("+x")])

# ---- q2-operators ----------------------------------------------------------------------------------------------
A = np.array([[1, -1], [1, 1]], complex)
K = np.array([[1, 1], [0, 1]], complex)


def outer(a, b):
    return np.outer(a, b.conj())


def sum_outer(Aij, basis):
    M = np.zeros((2, 2), complex)
    for i in range(len(basis)):
        for j in range(len(basis)):
            M = M + Aij[i, j] * outer(basis[i], basis[j])
    return M


# ---- q2-change -------------------------------------------------------------------------------------------------
u_zx = change_u([ket("+x"), ket("-x")])
u_zy = change_u([ket("+y"), ket("-y")])
d30 = u_zx @ psi30
wrong = u_zx.conj().T @ np.array([d30[0].real, -d30[1].real], complex)

# ---- q2-photon -------------------------------------------------------------------------------------------------
R = ket("+y")  # |R> = (|x> + i|y>)/sqrt2
L = ket("-y")  # |L> = (|x> - i|y>)/sqrt2
rp45 = (pol(45) + 1j * pol(135)) / np.sqrt(2)
lp45 = (pol(45) - 1j * pol(135)) / np.sqrt(2)
rp90 = R * np.exp(-1j * np.pi / 2)
bergou_correct = np.array([np.cos(np.pi / 6), 1j * np.sin(np.pi / 6)], complex)  # theta=30deg, phi=0: cos th |0> + i sin th |1>
bergou_printed = np.array([np.cos(np.pi / 6), np.sin(np.pi / 6)], complex)  # the notes' printed U|0>, phase i dropped

values = {
    # q2-basis
    "q2Dep": norm(ket("+x") - (ket("+z") + ket("-z")) / np.sqrt(2)),
    "q2DepZZX": yes(is_independent([ket("+z"), ket("-z"), ket("+x")])),
    "q2IndepZX": yes(is_independent([ket("+z"), ket("+x")])),
    "q2Dim": float(np.linalg.matrix_rank(np.column_stack([ket("+z"), ket("-z"), ket("+x")]))),
    "q2AngZX": angle_between_deg(ket("+z"), ket("+x")),
    "q2Comp30Re0": float(c30[0].real),
    "q2Comp30Re1": float(c30[1].real),
    "q2Orth": abs(np.vdot(ket("+z"), ket("-z"))),
    "q2Comp30xRe0": float(c30x[0].real),
    "q2Comp30xRe1": float(c30x[1].real),
    "q2NonOrthRe0": float(c_mz[0].real),
    "q2NonOrthRe1": float(c_mz[1].real),
    "q2NonOrthOvZ": float(np.vdot(ket("+z"), ket("-z")).real),
    "q2NonOrthOvX": float(np.vdot(ket("+x"), ket("-z")).real),
    "q2BComp": float(np.vdot(ket("+x"), np.array([0.6, 0.8])).real),
    "q2IndepXNegX": yes(is_independent([ket("+x"), -ket("+x")])),
    "q2IndepZZero": yes(is_independent([ket("+z"), np.zeros(2, complex)])),
    # q2-gram-schmidt
    "q2Gs60": float(np.vdot(ket("+z"), plane_vec(60)).real),
    "q2GsResRe0": float(gs_zb60["steps"][1]["residual"][0].real),
    "q2GsResRe1": float(gs_zb60["steps"][1]["residual"][1].real),
    "q2GsResOrth": float(np.vdot(ket("+z"), gs_zb60["steps"][1]["residual"]).real),
    "q2GsE2Re0": float(gs_zb60["steps"][1]["e"][0].real),
    "q2GsE2Re1": float(gs_zb60["steps"][1]["e"][1].real),
    "q2Gs3DRes1Re0": float(gs3d["steps"][1]["residual"][0].real),
    "q2Gs3DRes1Re1": float(gs3d["steps"][1]["residual"][1].real),
    "q2Gs3DRes1Re2": float(gs3d["steps"][1]["residual"][2].real),
    "q2Gs3DRes2Re0": float(gs3d["steps"][2]["residual"][0].real),
    "q2Gs3DRes2Re1": float(gs3d["steps"][2]["residual"][1].real),
    "q2Gs3DRes2Re2": float(gs3d["steps"][2]["residual"][2].real),
    "q2Gs3DOrthAll": yes(
        abs(np.vdot(gs3d["basis"][0], gs3d["basis"][1])) < 1e-9
        and abs(np.vdot(gs3d["basis"][0], gs3d["basis"][2])) < 1e-9
        and abs(np.vdot(gs3d["basis"][1], gs3d["basis"][2])) < 1e-9
    ),
    "q2GsYOv": float(np.vdot(ket("+y"), ket("+z")).real),
    "q2GsYResRe0": float(gs_yz["steps"][1]["residual"][0].real),
    "q2GsYResIm1": float(gs_yz["steps"][1]["residual"][1].imag),
    "q2GsYE2": yes(np.allclose(gs_yz["basis"][1], ket("-y"), atol=1e-9)),
    "q2GsDep": float(len(gs_dep["basis"])),
    "q2GLeft": norm(gs_left["steps"][1]["residual"]),
    "q2G3DRes2Norm2": norm2(gs3d["steps"][1]["residual"]),
    "q2GOrderE1Re0": float(gs_order["basis"][1][0].real),
    "q2GOrderE1Re1": float(gs_order["basis"][1][1].real),
    # q2-spin-space (Bloch theta=pi/3, phi=pi/2: (cos(theta/2), i sin(theta/2)))
    "q2AmpExRe0": float(np.cos(np.pi / 6)),
    "q2AmpExIm1": float(np.sin(np.pi / 6)),
    "q2AmpExP0": prob(ket("+z"), np.array([np.cos(np.pi / 6), 1j * np.sin(np.pi / 6)])),
    "q2AmpExP1": prob(ket("-z"), np.array([np.cos(np.pi / 6), 1j * np.sin(np.pi / 6)])),
    "q2XHalfPlus": bench_plus_minus("+x", "z")[0],
    "q2XHalfMinus": bench_plus_minus("+x", "z")[1],
    "q2XOrth": float(np.vdot(ket("+x"), ket("-x")).real),
    "q2DeltaAt0": abs(np.vdot(ket("+x"), np.array([1, np.exp(1j * 0)]) / np.sqrt(2))),
    "q2DeltaAt90": abs(np.vdot(ket("+x"), np.array([1, np.exp(1j * np.pi / 2)]) / np.sqrt(2))),
    "q2DeltaAt180": abs(np.vdot(ket("+x"), np.array([1, np.exp(1j * np.pi)]) / np.sqrt(2))),
    "q2ZfromXPlusRe0": float(((ket("+x") + ket("-x")) / np.sqrt(2))[0].real),
    "q2ZfromXPlusRe1": float(((ket("+x") + ket("-x")) / np.sqrt(2))[1].real),
    "q2ZfromXMinusRe0": float(((ket("+x") - ket("-x")) / np.sqrt(2))[0].real),
    "q2ZfromXMinusRe1": float(((ket("+x") - ket("-x")) / np.sqrt(2))[1].real),
    "q2AngXX90": angle_between_deg(ket("+x"), ket("-x")),
    "q2AngXXBloch180": bloch_angle_deg(ket("+x"), ket("-x")),
    "q2Delta90Prob": prob(ket("+x"), np.array([1, 1j]) / np.sqrt(2)),
    "q2Delta90Same": yes(same_physical_state(np.array([1, 1j], complex), ket("+y"))),
    "q2SAngle": angle_between_deg(ket("+z"), ket("-x")),
    "q2ZXOverlap": abs(np.vdot(ket("+z"), ket("+x"))),
    # q2-operators
    "q2ProjRank": float(np.linalg.matrix_rank(outer(ket("+z"), ket("+z")))),
    "q2FigAzRe0": float((A @ ket("+z"))[0].real),
    "q2FigAzRe1": float((A @ ket("+z"))[1].real),
    "q2FigAmzRe0": float((A @ ket("-z"))[0].real),
    "q2FigAmzRe1": float((A @ ket("-z"))[1].real),
    "q2FigAInner": float(np.vdot(A @ ket("+z"), A @ ket("-z")).real),
    "q2FigANorm": norm(A @ ket("+z")),
    "q2FigAAngle": angle_between_deg(ket("+z"), A @ ket("+z")),
    "q2ShearRe0": float((K @ ket("-z"))[0].real),
    "q2ShearRe1": float((K @ ket("-z"))[1].real),
    "q2ShearInner": float(np.vdot(K @ ket("+z"), K @ ket("-z")).real),
    "q2ShearAngle": angle_between_deg(K @ ket("+z"), K @ ket("-z")),
    "q2OuterRe00": float(outer(ket("+z"), ket("+x"))[0, 0].real),
    "q2OuterRe01": float(outer(ket("+z"), ket("+x"))[0, 1].real),
    "q2OuterRe10": float(outer(ket("+z"), ket("+x"))[1, 0].real),
    "q2OuterRe11": float(outer(ket("+z"), ket("+x"))[1, 1].real),
    "q2OuterPsiRe0": float((outer(ket("+z"), ket("+x")) @ psi30)[0].real),
    "q2OuterPsiRe1": float((outer(ket("+z"), ket("+x")) @ psi30)[1].real),
    "q2OuterMxRe0": float((outer(ket("+z"), ket("+x")) @ ket("-x"))[0].real),
    "q2OuterMxRe1": float((outer(ket("+z"), ket("+x")) @ ket("-x"))[1].real),
    "q2OOuterZ": float((outer(ket("+z"), ket("+x")) @ ket("-z"))[0].real),
    "q2FacRe0": float((A @ psi30)[0].real),
    "q2FacRe1": float((A @ psi30)[1].real),
    "q2Aij00": float(A[0, 0].real),
    "q2Aij01": float(A[0, 1].real),
    "q2Aij10": float(A[1, 0].real),
    "q2Aij11": float(A[1, 1].real),
    "q2SumOuter": yes(mat_eq(sum_outer(A, [ket("+z"), ket("-z")]), A)),
    "q2Shift": norm(np.zeros(2, complex) + ket("+z")),
    # q2-change
    "q2URe00": float(u_zx[0, 0].real),
    "q2URe01": float(u_zx[0, 1].real),
    "q2URe10": float(u_zx[1, 0].real),
    "q2URe11": float(u_zx[1, 1].real),
    "q2D30Re0": float(d30[0].real),
    "q2D30Re1": float(d30[1].real),
    "q2Px30Plus": prob(ket("+x"), psi30),
    "q2Px30Minus": prob(ket("-x"), psi30),
    "q2Printed": (float(c30[1].real) - float(c30[0].real)) / np.sqrt(2),
    "q2UnitZX": yes(is_unitary(u_zx)),
    "q2UnitZY": yes(is_unitary(u_zy)),
    "q2UyDag01Re": float(u_zy.conj().T[0, 1].real),
    "q2UyDag10Im": float(u_zy.conj().T[1, 0].imag),
    "q2UyNotes01Im": float(np.vdot(ket("-z"), ket("+y")).imag),
    "q2UyRight01Re": float(np.vdot(ket("+z"), ket("-y")).real),
    "q2SzXCheck": yes(mat_eq(u_zx @ SPIN_Z @ u_zx.conj().T, SPIN_X)),
    "q2SzXTopRight": float((u_zx @ SPIN_Z @ u_zx.conj().T)[0, 1].real),
    "q2SzPsiXRe0": float((u_zx @ (SPIN_Z @ psi30))[0].real),
    "q2SzPsiXRe1": float((u_zx @ (SPIN_Z @ psi30))[1].real),
    "q2UisH": yes(mat_eq(u_zx, H)),
    "q2HH": yes(mat_eq(H @ H, I2)),
    "q2H0": yes(np.allclose(H @ np.array([1, 0], complex), ket("+x"), atol=1e-9)),
    "q2WrongRe0": float(wrong[0].real),
    "q2WrongRe1": float(wrong[1].real),
    "q2WrongSame": yes(same_physical_state(wrong, plane_vec(60))),
    "q2WrongPzPlus": prob(ket("+z"), plane_vec(60)),
    "q2WrongPzMinus": prob(ket("-z"), plane_vec(60)),
    "q2CU22": float(u_zx[1, 1].real),
    "q2CD2": float((u_zx @ np.array([0.6, 0.8]))[1].real),
    # q2-photon
    "q2Pol45Re0": float(pol(45)[0].real),
    "q2Pol45Re1": float(pol(45)[1].real),
    "q2FrameU45Unitary": yes(is_unitary(frame_turn(45))),
    "q2DetUH": float(np.linalg.det(H).real),
    "q2DetU45": float(np.linalg.det(frame_turn(45)).real),
    "q2RRe0": float(R[0].real),
    "q2RIm1": float(R[1].imag),
    "q2RL": abs(np.vdot(R, L)),
    "q2PxR": prob(pol(0), R),
    "q2Rp45Re0": float(rp45[0].real),
    "q2Rp45Im0": float(rp45[0].imag),
    "q2Rp45Re1": float(rp45[1].real),
    "q2Rp45Im1": float(rp45[1].imag),
    "q2Rp45Phase": yes(np.allclose(rp45, R * np.exp(-1j * np.pi / 4), atol=1e-9)),
    "q2LpPhase": yes(np.allclose(lp45, L * np.exp(1j * np.pi / 4), atol=1e-9)),
    "q2JzR": yes(np.allclose(SY @ R, R, atol=1e-9)),
    "q2JzL": yes(np.allclose(SY @ L, -L, atol=1e-9)),
    "q2SandwichR": float(np.vdot(R, SY @ R).real),
    "q2FrameExp": yes(
        mat_eq(np.cos(np.pi / 6) * I2 - 1j * np.sin(np.pi / 6) * SY, rotation([0, 1, 0], np.pi / 3))
    ),
    "q2Malus45": prob(pol(0), pol(45)),
    "q2Spin45": prob(ket("+z"), plane_vec(22.5)),  # Bloch angle 45deg = plane angle 22.5deg
    "q2PolBloch45": bloch_angle_deg(pol(0), pol(45)),
    "q2FrameIsRy": yes(mat_eq(frame_turn(45), rotation([0, 1, 0], -np.pi / 2))),
    "q2BergouOverlap": prob(bergou_correct, bergou_printed),
    "q2Rot90P0": prob(pol(0), pol(90)),
    "q2Rot90P1": prob(R, rp90),
    "q2Rot90InnerIm": float(np.vdot(R, rp90).imag),
    "q2Rp90isMinusIR": yes(np.allclose(rp90, -1j * R, atol=1e-9)),
    "q2PMalus60": prob(pol(0), pol(60)),
    "q2PSpin60": prob(ket("+z"), plane_vec(30)),  # Bloch angle 60deg = plane angle 30deg
    "q2PhaseCos30": float(np.cos(np.pi / 6)),
    "q2PhaseSin30": float(-np.sin(np.pi / 6)),
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q2.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q2, numpy (eigh kets, a from-scratch Gram-Schmidt loop, "
            "linalg.solve for components, eigh-built rotations for the photon frame turn). "
            "Regenerate: python3 pipeline/claims_qc709/q2.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
