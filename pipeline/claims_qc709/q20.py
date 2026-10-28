#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q20.values.ts (Physics 709, chapter Q20: quantum machines).

Independent route (never Q20.values.ts's own helpers, never physics/qc/machines.ts): pipeline/machines_numpy.py builds the CNOTs by bit manipulation, takes partial traces by
reshaping, averages over the sphere with numpy's Gauss-Legendre nodes (60 x 60), finds the U-NOT limit and the discriminator optimum with brentq, builds the antisymmetric
projector from the explicit singlet, simulates the retry rounds with 2-qubit Kronecker matrices and enumerates the program strings for the counts. The drawn circuits are
re-assembled here from Ry, P and CNOT matrices (with a QR completion for the program box) and compared with the matrix route.

Units: q0 = leftmost tensor factor = top wire = most significant bit; hbar = 1. Angles are degrees in names and arguments.

Usage (from the repo root): python3 pipeline/claims_qc709/q20.py -> app/src/physics/__fixtures__/claims-qc709/q20.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import math
import sys
from fractions import Fraction
from itertools import product
from pathlib import Path

import numpy as np
from scipy.linalg import sqrtm

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import machines_numpy as M  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent.parent
values = {}

I2, X, Y, Z = M.I2, M.X, M.Y, M.Z
PSI = M.PSI_RUN
PSI_OTHER = M.ket_bloch(120, 30)
PLUS = M.ket_bloch(90, 0)
PP = M.dm(PSI)
GAP_US = [5, 17, 41, 55]


def norm(v):
    return float(np.linalg.norm(v))


def circuit_state(xi, th=60, ph=90):
    """The drawn six-column circuit rebuilt from matrices: Ry(theta) and a program box (QR completion) on column 1, P(phi) on column 2, then the four CNOTs."""
    t = math.radians(th)
    Ry = np.array([[math.cos(t / 2), -math.sin(t / 2)], [math.sin(t / 2), math.cos(t / 2)]], dtype=complex)
    cols = np.stack([xi] + [np.eye(4, dtype=complex)[:, k] for k in (1, 2, 3)], axis=1)  # independent since xi has a |00> part for every program used here
    q, r = np.linalg.qr(cols)
    box = q * (np.diag(r) / np.abs(np.diag(r)))  # first column = xi (phase fixed)
    st = np.kron(Ry, box) @ M.kv(M.K0, M.K0, M.K0)
    st = np.kron(np.diag([1, np.exp(1j * math.radians(ph))]), np.eye(4)) @ st
    for c, tg in ((0, 1), (0, 2), (1, 0), (2, 0)):
        st = M.cnot(c, tg, 3) @ st
    return st


# ---- q20-cloner
values['q20OverlapPrograms'] = float(np.real(np.vdot(M.XI00, M.XI0X)))
out = M.U4 @ M.kv(PSI, M.XI00)
values['q20Xi00Gap'] = float(np.abs(out - M.kv(PSI, M.XI00)).max())
out = M.U4 @ M.kv(PSI, M.XI0X)
want = np.einsum('ac,b->abc', M.XI00.reshape(2, 2), PSI).reshape(8)  # Xi00 on wires 1, 3 and psi on wire 2
values['q20Xi0xGap'] = float(np.abs(out - want).max())
o0x = M.outputs(PSI, M.XI0X)
values['q20Out2PurityXi0x'] = float(np.real(np.trace(o0x[1] @ o0x[1])))
spec_xi = [M.XI00, M.XI0X, M.PHI_M, M.program(22)[2], M.flip_prog(60, 0)[1]]
values['q20ClonerCircuitGap'] = float(max(np.abs(circuit_state(xi) - M.U4 @ M.kv(PSI, xi)).max() for xi in spec_xi))
values['q20NormGap'] = float(max(abs(M.program(u)[0] ** 2 + M.program(u)[1] ** 2 + M.program(u)[0] * M.program(u)[1] - 1) for u in GAP_US))
gaps = [M.formula_gaps(u) for u in GAP_US]
values['q20Rho1Gap'] = float(max(g[0] for g in gaps))
values['q20Rho2Gap'] = float(max(g[1] for g in gaps))
values['q20CrossGap'] = float(max(g[3] for g in gaps))
values['q20C0u15'] = M.program(15)[0]
values['q20C1u15'] = M.program(15)[1]
for u in (15, 0, 60):
    f1, f2 = M.fidelities(u)
    values[f'q20F1u{u}'] = f1
    values[f'q20F2u{u}'] = f2
values['q20C'] = M.program(30)[0]
o30 = M.outputs(PSI, M.program(30)[2])
values['q20F56'] = M.fc(o30[0], PSI)
sq = sqrtm(o30[0])
w_root = np.linalg.eigvalsh(sq @ PP @ sq)
values['q20F56Root'] = float(np.sqrt(w_root[w_root > 1e-12]).sum())  # root fidelity Tr sqrt(sqrt(rho) psi sqrt(rho)): the root eigenvalues summed, roundoff-size ones dropped
values['q20Weight16'] = M.fc(o30[0], M.perp(PSI))
values['q20ShrinkClone'] = float(norm(M.bvec(o30[0])) / norm(M.bvec(PP)))
target85 = 5 / 6 * PP + 1 / 6 * M.dm(M.perp(PSI))
values['q20Out1Gap'] = float(max(np.abs(o30[0] - target85).max(), np.abs(o30[1] - target85).max()))
values['q20UniversalSpread'] = M.universal_spread(30, 200, 709)
values['q20F56Other'] = M.fidelities(30, 120, 30)[0]

# ---- q20-unot
rhos = [PP, M.dm(PSI_OTHER), M.dm(PLUS), I2 / 2]
values['q20UnotIsYTYGap'] = float(max(np.abs(M.unot_ideal(r) - Y @ r.T @ Y).max() for r in rhos))
ideal = M.choi_spectrum(M.unot_ideal)
values['q20UnotChoiNeg'] = float(-ideal[0])
values['q20UnotChoiMax'] = float(ideal[-1])
values['q20Rho3Gap'] = float(max(g[2] for g in gaps))
values['q20Rho3Y'] = float(abs(M.bvec(o30[2])[1]))
values['q20PsiY'] = float(M.bvec(PP)[1])
values['q20Rho3Len'] = float(norm(M.bvec(o30[2])) / norm(M.bvec(PP)))
values['q20U0Sign'] = float(np.real((-1j * Y)[1][0]))
turned = M.U0 @ o30[2] @ M.U0.conj().T
values['q20UnotGap'] = float(np.abs(turned - (2 / 3 * M.dm(M.perp(PSI)) + 1 / 3 * PP)).max())
values['q20UnotFid'] = M.fc(turned, M.perp(PSI))
values['q20UnotDot'] = float(-np.dot(M.bvec(turned), M.bvec(PP)))
values['q20UnotShrink'] = float(norm(M.bvec(turned)) / norm(M.bvec(PP)))
values['q20ChoiMinP02'] = float(M.choi_spectrum(M.unot_shrunk(0.2))[0])
values['q20ChoiNegP05'] = float(-M.choi_spectrum(M.unot_shrunk(0.5))[0])
values['q20UnotPStar'] = float(M.unot_limit())
values['q20MaxC0C1'] = M.max_c0c1()[0]
mpu = M.mp_unot(PSI)
values['q20MpUnotFid'] = M.fc(mpu, M.perp(PSI))
values['q20MpUnotGap'] = float(np.abs(mpu - (2 / 3 * M.dm(M.perp(PSI)) + 1 / 3 * PP)).max())
single, both = M.mp_clone(PSI)
values['q20MpCloneSingle'] = single
values['q20MpCloneBoth'] = both
values['q20CloneBoth'] = M.pair_overlap(30, PSI)

# ---- q20-no-go
for th in (0, 60, 90, 120, 180):
    values[f'q20ExpZ{th}'] = float(np.real(M.expectation(I2, Z, M.ket_bloch(th, 0))))
KICK = np.diag([np.exp(-0.2j), np.exp(0.2j)])
values['q20SpreadZ'] = float(M.spread(I2, Z))
values['q20SpreadPhase'] = float(M.spread(np.exp(0.7j) * I2, I2))
values['q20ProcOverlapGap'] = float(max(M.processor_gap(I2, Z, PSI), M.processor_gap(I2, KICK, PSI)))
values['q20MaxOps10'] = float(len(list(product((0, 1), repeat=10))))
values['q20MaxOps8'] = float(len(list(product((0, 1), repeat=8))))
U2 = np.exp(1j * math.radians(40)) * KICK
values['q20MeasCorrectOps'] = float(M.distinct_ops([KICK, X @ KICK, U2, X @ U2]))

# ---- q20-probabilistic
p0, p1, succ, fail = M.cnot_proc(30, PLUS)
values['q20CnotSuccess'] = p0
bs = M.bvec(M.dm(succ))
values['q20RotX'] = float(bs[0])
values['q20RotY'] = float(abs(bs[1]))
values['q20RotGap'] = float(max(M.ray_gap(succ, M.u_alpha(30) @ PLUS), M.ray_gap(fail, M.u_alpha(-30) @ PLUS)))
for k in range(1, 8):
    values[f'q20Rus{k}'] = M.rus_success(k)


def rus_branch_gap(k, a=30, psi=PLUS):
    data, gap = psi, 0.0
    for j in range(1, k + 1):
        _, _, s, f = M.cnot_proc(2 ** (j - 1) * a, data)
        gap = max(gap, M.ray_gap(s, M.u_alpha(a) @ psi))
        data = f
    return gap


values['q20RusGap'] = float(max(abs(M.rus_success(2) - M.rus_circuit_chance(30)), rus_branch_gap(7)))
t99, t999 = float(Fraction(99, 100)), float(Fraction(999, 1000))
values['q20Target99'] = t99
values['q20Target999'] = t999
values['q20RusRounds99'] = float(next(k for k in range(1, 60) if M.rus_success(k) >= t99))
values['q20RusRounds999'] = float(next(k for k in range(1, 60) if M.rus_success(k) >= t999))
reads, data = M.toffoli_proc(30, PLUS)
values['q20ToffoliSuccess'] = float(sum(reads[:3]))
values['q20ToffoliFail'] = float(reads[3])
values['q20FailOverlap'] = float(abs(np.vdot(data[0], data[3])) ** 2)


def toffoli_gap(a, psi):
    r, dd = M.toffoli_proc(a, psi)
    goal = M.u_alpha(a) @ psi
    return max([abs(p - 0.25) for p in r] + [M.ray_gap(dd[m], goal) for m in range(3)] + [M.ray_gap(dd[3], M.u_alpha(-3 * a) @ psi)])


values['q20ToffoliGap'] = float(max(toffoli_gap(30, PLUS), toffoli_gap(20, PSI)))
s20 = M.bvec(M.dm(M.cnot_proc(20, PLUS)[2]))
values['q20AzAlpha20'] = float(math.degrees(math.atan2(s20[1], s20[0])))

# ---- q20-bell-programs
values['q20BellProgGap'] = float(max(np.abs(M.U4 @ M.kv(PSI, B) - M.kv(M.BELL_PAULI[n] @ PSI, B)).max() for n, B in M.BELLS.items()))
flip_dirs = [(90, 0), (90, 90), (60, 0), (120, 40)]
cf = M.flip_prog(60, 0)[0]
values['q20Prog60x'] = float(abs(cf[0].real))
values['q20Prog60y'] = float(abs(cf[1]))
values['q20Prog60z'] = float(abs(cf[2].real))
values['q20UphiGap'] = float(max([M.flip_formula_gap(t, p) for t, p in flip_dirs] + [M.flip_formula_gap(60, 0)]))
values['q20Prog120z'] = float(M.flip_prog(120, 0)[0][2].real)
runs = [M.flip_run(PSI, t, p) for t, p in flip_dirs]
values['q20FlipSuccess'] = float(min(r[0] for r in runs))
gaps_flip = []
for (t, p), (pr, dat) in zip(flip_dirs, runs):
    gaps_flip.append(max(abs(pr - 1 / 3), M.ray_gap(dat, M.flip_prog(t, p)[2] @ PSI)))
pr2, dat2 = M.flip_run(PLUS, 60, 0)
gaps_flip.append(max(abs(pr2 - 1 / 3), M.ray_gap(dat2, M.flip_prog(60, 0)[2] @ PLUS)))
values['q20FlipGap'] = float(max(gaps_flip))
Uin = M.uin_matrix()
values['q20UinGap'] = float(np.abs(Uin.conj().T @ Uin - np.eye(4)).max())
values['q20Xi28Overlap'] = float(min(abs(np.vdot(M.uin_program(t, p), M.flip_prog(t, p)[1])) for t, p in flip_dirs))
values['q20ProgPlusX'] = float(M.flip_prog(90, 0)[0][0].real)
values['q20ProgPlusYy'] = float(abs(M.flip_prog(90, 90)[0][1]) ** 2)

# ---- q20-discriminator
P1, P2 = M.ket_bloch(60, 0), M.ket_bloch(60, 180)
res = M.prog_usd(P1, P2, 2 / 3, 2 / 3)
values['q20DiscOverlap'] = float(abs(np.vdot(P1, P2)))
values['q20DiscZeroGap'] = res[4]
values['q20DiscPj'] = res[0]
values['q20BlockGap'] = float(max(M.disc_block_gap(2 / 3, 2 / 3), M.disc_block_gap(0.3, 0.5), M.disc_block_gap(0.9, 0.1)))
_, _, det_true, det_printed, disc_printed, ev = M.block(2 / 3, 2 / 3)
values['q20ConstTrue'] = float(det_true)
values['q20ConstPrinted'] = float(det_printed)
values['q20DiscPrinted'] = float(-disc_printed)
values['q20BlockEigLo'] = float(ev[0])
values['q20BlockEigHi'] = float(ev[1])
values['q20OptC'] = float(M.disc_opt_c())


def prog_at(s):
    a, b = M.pair_at_overlap(s)
    return M.prog_usd(a, b, 2 / 3, 2 / 3)[2], 1 - abs(np.vdot(a, b))


p05, k05 = prog_at(0.5)
values['q20DiscP05'] = float(p05)
values['q20DiscKnown05'] = float(k05)
values['q20DiscRatio05'] = float(p05 / k05)
a7, b7 = M.pair_at_overlap(math.sqrt(0.5))
values['q20S0707'] = float(abs(np.vdot(a7, b7)))
p07, k07 = prog_at(math.sqrt(0.5))
values['q20DiscP0707'] = float(p07)
values['q20DiscKnown0707'] = float(k07)
values['q20DiscRatio0707'] = float(p07 / k07)
p0_, k0_ = prog_at(0.0)
values['q20DiscP0'] = float(p0_)
values['q20DiscKnown0'] = float(k0_)

out_path = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-qc709' / 'q20.json'
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(
    json.dumps(
        {
            'about': 'Claim values for Physics 709 chapter Q20, numpy (CNOTs from bit manipulation, reshaped partial traces, leggauss and brentq, explicit singlet projectors, '
            'Kronecker retry rounds, enumerated program strings; never physics/qc/machines.ts or Q20.values.ts). Regenerate: python3 pipeline/claims_qc709/q20.py',
            'values': values,
        },
        indent=1,
        ensure_ascii=False,
        sort_keys=False,
    )
    + '\n'
)
print(f'wrote {out_path.relative_to(ROOT)} ({len(values)} values)')
