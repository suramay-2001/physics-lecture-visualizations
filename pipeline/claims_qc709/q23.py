#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q23.values.ts (Physics 709, chapter Q23: measuring information, distances, entropies and Holevo).

Independent route (never Q23.values.ts's own helpers, never physics/qc/infoq.ts, density.ts, info.ts or povm.ts): states are np.kron products, partial traces are einsum
contractions of the density tensor (pipeline/infoq_numpy.py), entropies are np.linalg.eigvalsh sums, the quantum relative entropy is scipy.linalg.logm (a support test and an
eigen-decomposition for a singular second state), the root fidelity is scipy.linalg.sqrtm, the channel capacity is a vectorised grid of 1001 inputs, the accessible information is a
scan of 3601 axes of the x-z plane, the chance tables of a POVM are traces of the elements with the density matrices, the dephasing and GHZ circuits are applied gate by gate with
dense matrices, and the run counts of the repetition code are binomial sums.

Units: q0 = leftmost tensor factor = top wire = most significant bit; entropies are in bits; |0> = |+z>.

Usage (from the repo root): python3 pipeline/claims_qc709/q23.py -> app/src/physics/__fixtures__/claims-qc709/q23.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import math
import sys
from fractions import Fraction
from pathlib import Path

import numpy as np
from scipy.linalg import sqrtm

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import infoq_numpy as N  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent.parent
values = {}

P = [0.5, 0.5]
Q = [0.9, 0.1]
R3 = [0.7, 0.3]


def diag2(a):
    return np.diag([a, 1 - a]).astype(complex)


def root_fidelity(r, s):
    sr = sqrtm(r)
    return float(np.trace(sqrtm(sr @ s @ sr)).real)


Z0 = N.rho_of(N.KET['0'])
ZP = N.rho_of(N.KET['+'])
ZM = N.rho_of(N.KET['-'])
ZO = N.rho_of(N.KET['1'])
HALF = diag2(0.5)
RHO9 = diag2(0.9)
SIG_X = N.mix([(0.9, N.KET['+']), (0.1, N.KET['-'])])

# ---------------------------------------------------------------- model inputs the chapter states
values['q23InFair'] = float(Fraction(1, 2))
values['q23InBiasHi'] = float(Fraction(9, 10))
values['q23InBiasLo'] = float(Fraction(1, 10))
values['q23InMidHi'] = float(Fraction(7, 10))
values['q23InMidLo'] = float(Fraction(3, 10))
values['q23InQuarter3'] = float(Fraction(3, 4))
values['q23InQuarter1'] = float(1 - Fraction(3, 4))
values['q23InX08'] = float(Fraction(4, 5))
for tag, fr in (('L1', Fraction(2, 5)), ('L2', Fraction(3, 10)), ('L3', Fraction(1, 5)), ('L4', Fraction(1, 10))):
    values[f'q23In{tag}'] = float(fr)
values['q23InFlip'] = float(Fraction(1, 10))
values['q23InFlip11'] = float(Fraction(11, 100))
values['q23InFlipKeep'] = float(1 - Fraction(1, 10))
values['q23SqrtP'] = math.sqrt(0.5)
values['q23SqrtQ0'] = math.sqrt(0.9)
values['q23SqrtQ1'] = math.sqrt(0.1)

# ---------------------------------------------------------------- q23-classical-compare
values['q23Dpq'] = N.dist(P, Q)
values['q23Dpr'] = N.dist(P, R3)
values['q23Dqr'] = N.dist(R3, Q)
qt3 = N.quarter_tables(3)
values['q23TriangleGridSlack'] = min(N.dist(p, r) + N.dist(r, q) - N.dist(p, q) for p in qt3 for q in qt3 for r in qt3)
values['q23Fpq'] = N.fid(P, Q)
values['q23ThetaPq'] = N.angle_deg(P, Q)
values['q23ThetaPr'] = N.angle_deg(P, R3)
values['q23ThetaRq'] = N.angle_deg(R3, Q)
values['q23PlaneP'] = math.degrees(math.atan2(math.sqrt(P[1]), math.sqrt(P[0])))
values['q23PlaneQ'] = math.degrees(math.atan2(math.sqrt(Q[1]), math.sqrt(Q[0])))
values['q23Hpq'] = N.rel(P, Q)
values['q23Hqp'] = N.rel(Q, P)
fin = [N.rel(p, q) for p in qt3 for q in qt3]
values['q23HrelGridMin'] = min(v for v in fin if v is not None)
values['q23HrelGridInf'] = float(sum(1 for v in fin if v is None))
values['q23HInfFlag'] = 1.0 if N.rel(P, [1.0, 0.0]) is None else 0.0

# ---------------------------------------------------------------- q23-quantum-compare
values['q23DquantumZP'] = N.trace_dist(Z0, ZP)
values['q23DmeasZ'] = N.table_dist_basis(Z0, ZP, N.plane_basis(0.0))
values['q23DmeasX'] = N.table_dist_basis(Z0, ZP, N.plane_basis(math.pi / 2))
values['q23DmeasBest'] = N.eigen_table_dist(Z0, ZP)
values['q23DmeasGridMax'] = N.best_table_dist(Z0, ZP, 3601)[0]
values['q23FquantumDiag'] = root_fidelity(HALF, RHO9)
values['q23SrelA'] = N.rel_q(diag2(0.75), HALF)
values['q23SrelAreverse'] = N.rel_q(HALF, diag2(0.75))
values['q23SDiag75'] = N.vn(diag2(0.75))
values['q23SrelPureVsMixed'] = N.rel_q(ZP, RHO9)
values['q23SrelMixedVsPureInf'] = 1.0 if N.rel_q(RHO9, ZP) is None else 0.0
S_nc, H_nc, r_nc, p_nc = N.klein_chain(RHO9, SIG_X)
values['q23SrelNC'] = S_nc
values['q23KleinR0'] = r_nc[0]
values['q23KleinH'] = H_nc
values['q23SrelSameEig'] = N.rel_q(RHO9, SIG_X)
eig_r = sorted(np.linalg.eigvalsh(RHO9), reverse=True)
eig_s = sorted(np.linalg.eigvalsh(SIG_X), reverse=True)
values['q23HeigSame'] = N.rel(eig_r, eig_s)
# the chord of log2 between x1 = 1 and x2 = 4 at x = 1.5, with the printed denominator (x1 - x2) and the right one (x2 - x1)
x1, x2, x = 1.0, 4.0, 1.5
for tag, den in (('Printed', x1 - x2), ('True', x2 - x1)):
    s = (x - x1) / den
    values[f'q23Lhs{tag}'] = math.log2(x1) + s * (math.log2(x2) - math.log2(x1))
    values[f'q23Rhs{tag}'] = math.log2(x1 + s * (x2 - x1))

# ---------------------------------------------------------------- q23-entropy-props
RHO4 = np.diag([0.4, 0.3, 0.2, 0.1]).astype(complex)
values['q23S4Level'] = N.vn(RHO4)
values['q23SMaxGap'] = abs(N.rel_q(RHO4, np.eye(4, dtype=complex) / 4) - (math.log2(4) - N.vn(RHO4)))
BLOCK = N.mix([(0.25, N.ket('00')), (0.25, N.ket('01')), (0.5, N.ket('1+'))])
values['q23SBlock'] = N.vn(BLOCK)
BELL = N.bell(1)
RB = N.rho_of(BELL)
values['q23SubaddGap'] = N.ent(RB, [0], 2) + N.ent(RB, [1], 2) - N.vn(RB)
MIX = N.mix([(0.5, N.KET['0']), (0.5, N.KET['+'])])
values['q23SConcaveMix'] = N.vn(MIX)
values['q23SConcaveAvg'] = 0.5 * N.vn(Z0) + 0.5 * N.vn(ZP)
W = np.zeros(8, dtype=complex)
for idx in (4, 2, 1):
    W[idx] = 1 / math.sqrt(3)
RW = 0.5 * N.rho_of(W) + 0.5 * N.rho_of(N.ket('000'))
sA, sB, sAB, sBC, sAC, sABC = N.ent(RW, [0], 3), N.ent(RW, [1], 3), N.ent(RW, [0, 1], 3), N.ent(RW, [1, 2], 3), N.ent(RW, [0, 2], 3), N.vn(RW)
values['q23SsaMixSA'] = sA
values['q23SsaMixSAC'] = sAC
values['q23SsaMixS'] = sABC
values['q23SsaLhs1'] = sA + sB
values['q23SsaRhs1'] = sAC + sBC
values['q23SsaLhs2'] = sABC + sB
values['q23SsaRhs2'] = sAB + sBC
values['q23SsaGap1'] = sAC + sBC - sA - sB
values['q23SsaGap2'] = sAB + sBC - sABC - sB
values['q23SBell'] = N.vn(RB)
values['q23SBellA'] = N.ent(RB, [0], 2)
values['q23SCondBell'] = N.vn(RB) - N.ent(RB, [1], 2)  # S(AB) - S(B)
values['q23S3Qubits'] = N.vn(np.eye(8, dtype=complex) / 8)

# ---------------------------------------------------------------- q23-two-variables
J = N.bsc(0.1)
px, py = N.joint_marg(J)
values['q23JointH'] = N.joint_h(J)
values['q23HX'] = N.shannon(px)
values['q23HYgX'] = N.cond_h(J)
values['q23BscJoint00'] = float(J[0, 0])
values['q23BscJoint01'] = float(J[0, 1])
values['q23Imutual'] = N.mutual(J)
values['q23ImutualAsRel'] = N.rel(J.ravel(), np.outer(px, py).ravel())
values['q23ImutualCorr'] = N.mutual(np.array([[0.5, 0.0], [0.0, 0.5]]))
cap, arg = N.capacity_grid([[0.9, 0.1], [0.1, 0.9]], 1001)
values['q23BscCap'] = cap
values['q23BscCapArg'] = arg
for tag, f in (('25', 0.25), ('11', 0.11), ('Half', 0.5)):
    values[f'q23BscCap{tag}'] = N.capacity_grid([[1 - f, f], [f, 1 - f]], 1001)[0]
f = Fraction(1, 10)
values['q23Rep3Fail'] = float(3 * f ** 2 * (1 - f) + f ** 3)
values['q23Rep3Rate'] = float(Fraction(1, 3))
values['q23IDealer'] = N.mutual(np.array([[0.0, 0.5], [0.5, 0.0]]))
values['q23IIndep'] = N.mutual(np.outer([0.5, 0.5], [0.5, 0.5]))

# ---------------------------------------------------------------- q23-quantum-mutual
values['q23IBell'] = N.qmi(RB, [0], [1], 2)
values['q23SDeph01'] = N.vn(0.9 * N.rho_of(N.bell(1)) + 0.1 * N.rho_of(N.bell(-1)))
for tag, p in (('01', 0.1), ('05', 0.5)):
    values[f'q23IDeph{tag}'] = N.qmi((1 - p) * N.rho_of(N.bell(1)) + p * N.rho_of(N.bell(-1)), [0], [1], 2)
RG = N.rho_of(N.ghz_state())
values['q23IGhzAB'] = N.qmi(RG, [0], [1], 3)
values['q23IGhzABC'] = N.qmi(RG, [0], [1, 2], 3)
circuit_rho = N.rho_of(N.dephasing_state(0.1))
ab = N.ptrace(circuit_rho, [0, 1], 3)
mixed = 0.9 * N.rho_of(N.bell(1)) + 0.1 * N.rho_of(N.bell(-1))
values['q23DephCircuitGap'] = float(np.max(np.abs(ab - mixed)))
values['q23DataProcFall'] = N.qmi(RB, [0], [1], 2) - N.qmi(mixed, [0], [1], 2)
values['q23SlipSAB'] = N.vn(RB)
values['q23SlipSB'] = N.ent(RB, [1], 2)
R3q = N.rho_of(np.kron(BELL, N.KET['0']))
values['q23SlipSBC'] = N.ent(R3q, [1, 2], 3)
theta = 1.1
ry = np.array([[math.cos(theta / 2), -math.sin(theta / 2)], [math.sin(theta / 2), math.cos(theta / 2)]], dtype=complex)
turned = np.kron(np.eye(2), ry) @ BELL
values['q23ILocalU'] = N.qmi(N.rho_of(turned), [0], [1], 2)

# ---------------------------------------------------------------- q23-holevo
PS2 = [0.5, 0.5]
PAIR = [Z0, ZP]
chi = N.holevo_chi(PS2, PAIR)
s_over = abs(np.vdot(N.KET['0'], N.KET['+']))
values['q23ChiZP'] = chi
values['q23ChiZPClosed'] = abs(chi - N.h2((1 + s_over) / 2))
values['q23PairOverlap'] = float(s_over)
avg = 0.5 * Z0 + 0.5 * ZP
values['q23PairArrow'] = float(math.sqrt(sum(float(np.trace(avg @ M).real) ** 2 for M in (N.X, N.Y, N.Z))))
ev = sorted(np.linalg.eigvalsh(avg), reverse=True)
values['q23PairEig1'] = float(ev[0])
values['q23PairEig2'] = float(ev[1])
values['q23ChiOrth'] = N.holevo_chi(PS2, [Z0, ZO])
values['q23ChiSame'] = N.holevo_chi(PS2, [Z0, Z0])
values['q23ChiS05'] = N.pair_chi(0.5)
zP = N.projector_pair([0, 0, 1])
xP = N.projector_pair([1, 0, 0])
values['q23IZPz'] = N.info_povm(PS2, PAIR, zP)
jz = N.povm_joint(PS2, PAIR, zP)
values['q23PairZHY'] = N.shannon(jz.sum(axis=0))
values['q23PairZHYgX'] = N.cond_h(jz)
values['q23IBestZP'] = N.accessible_projective(PS2, PAIR, 3601)[0]
values['q23IHelstromClosed'] = 1 - N.h2((1 - math.sqrt(1 - s_over ** 2)) / 2)
a, b = N.proof_states(PS2, PAIR, [0, 0, 1])
values['q23ProofStart'] = a
values['q23ProofEnd'] = b


def pair_rhos(s):
    return [N.rho_of(v) for v in N.pair_states(s)]


values['q23UsdBound05'] = N.usd_bound(PS2, pair_rhos(0.5))
values['q23UsdBound0707'] = N.usd_bound(PS2, pair_rhos(math.sqrt(0.5)))
values['q23UsdBound09'] = N.usd_bound(PS2, pair_rhos(0.9))
for tag, s in (('05', 0.5), ('0707', math.sqrt(0.5)), ('09', 0.9)):
    v0, v1 = N.pair_states(s)
    values[f'q23UsdPfExact{tag}'] = float(abs(np.vdot(v0, v1)))


def perp(v):
    return np.array([-np.conj(v[1]), np.conj(v[0])])


psi0, psi1 = N.pair_states(0.5)
cc = abs(np.vdot(psi0, psi1))
E0 = np.outer(perp(psi1), perp(psi1).conj()) / (1 + cc)
E1 = np.outer(perp(psi0), perp(psi0).conj()) / (1 + cc)
Eq = np.eye(2) - E0 - E1
values['q23UsdInfo05'] = N.info_povm(PS2, pair_rhos(0.5), [E0, E1, Eq])
BB = [N.rho_of(N.KET[k]) for k in '01+-']
BB_P = [0.25] * 4
values['q23ChiBB84'] = N.holevo_chi(BB_P, BB)
values['q23IBB84z'] = N.info_povm(BB_P, BB, zP)
values['q23IBB84x'] = N.info_povm(BB_P, BB, xP)
values['q23IBB84Best'] = N.accessible_projective(BB_P, BB, 3601)[0]
BELLS = [N.rho_of(v) for v in (N.bell(1), N.bell(-1), np.array([0, 1, 1, 0], dtype=complex) / math.sqrt(2), np.array([0, 1, -1, 0], dtype=complex) / math.sqrt(2))]
values['q23ChiBellPair'] = N.holevo_chi(BB_P, BELLS)
values['q23ChiBellAliceOnly'] = N.holevo_chi(BB_P, [N.ptrace(r, [0], 2) for r in BELLS])
values['q23IBellMeasure'] = N.info_povm(BB_P, BELLS, BELLS)

# ---------------------------------------------------------------- challenges
values['q23ChDpq'] = N.dist([0.6, 0.4], [0.2, 0.8])
values['q23ChF'] = N.fid(P, [1.0, 0.0])
values['q23ChH'] = N.rel(P, [0.25, 0.75])
values['q23ChDmeasZminus'] = N.table_dist_basis(Z0, ZM, N.plane_basis(0.0))
values['q23ChSrelDiag'] = N.rel_q(RHO9, HALF)
values['q23ChBlock'] = N.vn(N.mix([(0.25, N.ket('0+')), (0.375, N.ket('10')), (0.375, N.ket('11'))]))
J2 = N.bsc(0.2)
values['q23ChJoint'] = N.joint_h(J2)
values['q23ChI'] = N.mutual(J2)
values['q23ChDeph25'] = N.qmi(0.75 * N.rho_of(N.bell(1)) + 0.25 * N.rho_of(N.bell(-1)), [0], [1], 2)
values['q23ChChiS06'] = N.pair_chi(0.6)
values['q23ChUsdS08'] = N.usd_bound(PS2, pair_rhos(0.8))

values = {k: float(v) for k, v in values.items()}
out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-qc709' / 'q23.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            'about': 'Claim values for Physics 709 chapter Q23, numpy (np.kron states, einsum partial traces, eigvalsh entropies, scipy logm and sqrtm, a vectorised capacity grid, an axis scan '
            'for the accessible information, gate-by-gate circuits, binomial sums; never physics/qc/infoq.ts, density.ts, info.ts, povm.ts or Q23.values.ts). Regenerate: python3 pipeline/claims_qc709/q23.py',
            'values': values,
        },
        indent=1,
        ensure_ascii=False,
        sort_keys=True,
    )
    + '\n'
)
print(f'wrote {out.relative_to(ROOT)} ({len(values)} values)')
