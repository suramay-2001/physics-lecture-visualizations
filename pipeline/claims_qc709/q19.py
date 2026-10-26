#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q19.values.ts (Physics 709, chapter Q19: walks, simulation and hybrid algorithms).

Independent route (never Q19.values.ts's own helpers, never physics/qc/walk.ts, trotter.ts, variational.ts): the walk is assembled from directed ARCS with the vertex
rule G_v = 2J/n - I (pipeline/walk_numpy.py), the circuit form is X_dir (|0><0| (x) O + |1><1| (x) D), the invariant subspaces come from explicit basis vectors, the coin
walk is evolved in momentum space and read back with np.fft, the spin chain is built from Pauli matrices and exponentiated with scipy.linalg.expm, the Trotter errors are
np.linalg.norm(., 2), the QAOA is dense matrices (and a CNOT-phase-CNOT circuit), the grid maximum is a vectorised scan of the closed form of the state, and the run counts
use exact fractions.

Units: q0 = leftmost tensor factor = top wire = most significant bit; hbar = 1; S = sigma/2. The star has N SPOKES; its edge states are ordered |0,1..N>, |1..N,0>, then the
extra edge's a->b, b->a, so the place of |0,j> is j-1 and of |j,0> is N+j-1.

Usage (from the repo root): python3 pipeline/claims_qc709/q19.py -> app/src/physics/__fixtures__/claims-qc709/q19.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import math
import sys
from fractions import Fraction
from itertools import product
from pathlib import Path

import numpy as np
from scipy.linalg import expm

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import walk_numpy as W  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent.parent
values = {}


def first_max(xs, tol=1e-12):
    best = max(xs)
    return next(i for i, v in enumerate(xs) if v >= best - tol)


def maxabs(A):
    return float(np.max(np.abs(A)))


# ---------------------------------------------------------------- q19-random-walk
values['q19P2Left'] = W.walk_dist(2)[0]
values['q19P2Mid'] = W.walk_dist(2)[1]
values['q19P10Zero'] = math.comb(10, 5) / 2 ** 10
values['q19SigmaClass100'] = W.walk_sigma(100)
values['q19ConnSteps10'] = float(2 * 10 ** 3)
values['q19ConnFail5'] = float(Fraction(1, 2 ** 5))
values['q19PathHit10'] = W.path_hitting(10)
values['q19CoinSigma10'] = W.coin_sigma(10)
values['q19CoinSigma100'] = W.coin_sigma(100)
values['q19CoinRatio100'] = W.coin_sigma(100) / 100
classical3 = [math.comb(3, k) / 8 if k <= 3 else 0.0 for k in range(4)]
coin3 = W.coin_chances(3)  # x = -3..3
cl = [classical3[0], 0.0, classical3[1], 0.0, classical3[2], 0.0, classical3[3]]
values['q19Coin3Binomial'] = max(abs(a - b) for a, b in zip(coin3, cl))
values['q19P4Zero'] = math.comb(4, 2) / 2 ** 4
values['q19Conn6'] = float(2 * 6 ** 3)


# ---------------------------------------------------------------- q19-scatter
def vertex(n):
    return 2.0 * np.ones((n, n)) / n - np.eye(n)


G8 = vertex(8)
values['q19EdgeStates8'] = float(len(W.arcs_of(8)))
values['q19Vertex8R'] = float(-G8[0, 0])
values['q19Vertex8T'] = float(G8[0, 1])
values['q19VertexUnit8'] = maxabs(G8 @ G8.T - np.eye(8))
s8 = np.ones(8) / math.sqrt(8)
values['q19VertexIsInv8'] = maxabs(G8 - (2 * np.outer(s8, s8) - np.eye(8)))
# one Grover step on three wires, marked string 000: H, oracle (flip 000), H, flip all but 000, H
H3 = W.kron(W.HAD, W.HAD, W.HAD)
psi = H3 @ np.eye(8)[0]
psi = np.diag([-1.0] + [1.0] * 7) @ psi
psi = H3 @ psi
psi = np.diag([1.0] + [-1.0] * 7) @ psi
psi = H3 @ psi
values['q19Grover8Marked'] = float(abs(psi[0]))
values['q19Grover8Other'] = float(abs(psi[1]))
values['q19Vertex1'] = float(vertex(1)[0, 0])
values['q19Vertex2R'] = float(-vertex(2)[0, 0])
values['q19Vertex2T'] = float(vertex(2)[0, 1])
values['q19Vertex5T'] = float(vertex(5)[0, 1])
values['q19Vertex5MinusR'] = float(vertex(5)[0, 0])

# ---------------------------------------------------------------- q19-star-search
U8 = W.star_U(8, marked=1)
v0 = W.start_vec(8)
values['q19WalkUnit8'] = maxabs(U8 @ U8.T - np.eye(16))
values['q19WalkCircuitGap'] = maxabs(W.star_U_circuit(8, 1) - U8)
B8 = W.star_basis(8)
M8 = B8 @ U8 @ B8.T
values['q19MGap'] = maxabs(M8 - W.reduced_star_M_formula(8))
values['q19MR'] = float(-M8[0, 1])
values['q19MT'] = float(M8[0, 3])
ev8 = np.linalg.eigvals(M8)
alpha8 = float(min(abs(np.angle(ev8))))
values['q19Alpha8'] = math.degrees(alpha8)
t8 = float(G8[0, 1])
values['q19Delta8Deg'] = math.degrees(math.sqrt(t8 / 2))
r8 = float(-G8[0, 0])
values['q19CharPoly8'] = maxabs(np.poly(M8) - np.array([1, 0, -2 * r8, 0, 1]))
want = sorted([np.exp(1j * alpha8), np.exp(-1j * alpha8), -np.exp(1j * alpha8), -np.exp(-1j * alpha8)], key=lambda z: (round(z.real, 9), round(z.imag, 9)))
got = sorted(ev8, key=lambda z: (round(z.real, 9), round(z.imag, 9)))
values['q19EigenGap8'] = maxabs(np.array(got) - np.array(want))
ch8 = W.marked_chances(U8, 8, 30, v0)
values['q19StarP2'] = ch8[2]
values['q19StarP4'] = ch8[4]
values['q19StarAmp4'] = float((np.linalg.matrix_power(U8, 4) @ v0)[0])
values['q19StarAmp5'] = float((np.linalg.matrix_power(U8, 5) @ v0)[8])
delta8 = math.sqrt(t8 / 2)
values['q19StarPeak8'] = float(first_max(ch8[: math.ceil(math.pi / delta8) + 1]))
values['q19Bergou8'] = math.pi / (2 * delta8)
grover_gap = 0.0
for N in (4, 8, 16):
    UN = W.star_U(N, marked=1)
    chN = W.marked_chances(UN, N, 30, W.start_vec(N))
    a = math.asin(1 / math.sqrt(N))
    for n in range(31):
        grover_gap = max(grover_gap, abs(chN[n] - math.sin((2 * (n // 2) + 1) * a) ** 2))
values['q19WalkIsGrover'] = grover_gap


def reduced_star_first_peak(N):
    """First peak of the marked chance from the 4 x 4 table (7.53 written out), the start (1/sqrt N, 0, sqrt((N-1)/N), 0), over n <= ceil(pi/Delta)."""
    t = 2 / N
    M = W.reduced_star_M_formula(N)
    v = [1 / math.sqrt(N), 0.0, math.sqrt((N - 1) / N), 0.0]
    nmax = math.ceil(math.pi / math.sqrt(t / 2))
    ch = W.reduced_chances(M, v, nmax, [0, 1])
    k = first_max(ch)
    return k, ch[k]


k1024, p1024 = reduced_star_first_peak(1024)
values['q19StarN1024'] = float(k1024)
values['q19StarP1024'] = p1024
values['q19Bergou1024'] = math.pi / (2 * math.sqrt((2 / 1024) / 2))
values['q19ClassAvg1024'] = sum(range(1, 1025)) / 1024
U16 = W.star_U(16, marked=1)
ch16 = W.marked_chances(U16, 16, 30, W.start_vec(16))
k16 = first_max(ch16[: math.ceil(math.pi / math.sqrt((2 / 16) / 2)) + 1])
values['q19StarPeak16'] = float(k16)
values['q19StarP16'] = ch16[k16]
chin = W.marked_chances(U8, 8, 12, W.start_vec(8, start='in'))
values['q19InStart8'] = max(chin)
values['q19InStartStep'] = float(next(i for i, v in enumerate(chin) if v >= max(chin) - 1e-9))
values['q19InStart4'] = chin[4]
ev16 = np.linalg.eigvals(W.star_basis(16) @ U16 @ W.star_basis(16).T)
values['q19Alpha16'] = math.degrees(float(min(abs(np.angle(ev16)))))
k64, _ = reduced_star_first_peak(64)
values['q19StarPeak64'] = float(k64)

# ---------------------------------------------------------------- q19-extra-edge
EX = (1, 2)
Ux8 = W.star_U(8, extra=EX)
values['q19Extra8Dim'] = float(len(W.arcs_of(8, extra=EX)))
values['q19ExtraUnit'] = maxabs(Ux8 @ Ux8.T - np.eye(18))
Bx8 = W.extra_basis(8)
Mx8 = Bx8 @ Ux8 @ Bx8.T
values['q19M5Gap'] = maxabs(Mx8 - W.reduced_extra_M_formula(8))
rm, tm = (8 - 2) / 8, 2 / 8
values['q19ExtraPoly'] = maxabs(np.poly(Mx8) - np.array([1, 0, -(rm - tm), (rm - tm), 0, -1]))
delta64 = math.sqrt(2 * (2 / 64) / 3)
values['q19ExtraDelta64'] = delta64
# Eq. 7.79 written out at n Delta = pi/2: (sin, sin, sqrt(3/2) cos, -sqrt(3/2) cos, -sin) / sqrt 3 on psi_1 ... psi_5
x = math.pi / 2
v79 = np.array([math.sin(x), math.sin(x), math.sqrt(1.5) * math.cos(x), -math.sqrt(1.5) * math.cos(x), -math.sin(x)]) / math.sqrt(3)
values['q19ExtraAsym'] = float(v79[0] ** 2 + v79[1] ** 2)
values['q19ExtraAsymEdge'] = float(v79[4] ** 2)
Ux64 = W.star_U(64, extra=EX)
near64, edge64 = W.extra_chances(Ux64, 64, 40, W.start_vec(64, extra=EX, sign=-1))
pk64 = first_max(near64[: math.ceil(math.pi / delta64) + 1])
values['q19ExtraPeak64'] = float(pk64)
values['q19ExtraNear64'] = near64[pk64]
values['q19ExtraEdge64'] = edge64[pk64]
values['q19ExtraBergou64'] = math.pi / (2 * delta64)
delta8x = math.sqrt(2 * (2 / 8) / 3)
nearx8, _ = W.extra_chances(Ux8, 8, 30, W.start_vec(8, extra=EX, sign=-1))
pk8 = first_max(nearx8[: math.ceil(math.pi / delta8x) + 1])
values['q19ExtraPeak8'] = float(pk8)
values['q19Extra8Near'] = nearx8[pk8]
nearp, edgep = W.extra_chances(Ux64, 64, 40, W.start_vec(64, extra=EX, sign=1))
values['q19ExtraPlus64'] = max(nearp)
values['q19ExtraPlusEdge64'] = max(edgep)
# N = 1024 from the 5 x 5 table (7.68 written out) and the start projected on its basis
N1k = 1024
Bx1k = W.extra_basis(N1k)
v1k = Bx1k @ W.start_vec(N1k, extra=EX, sign=-1)
delta1k = math.sqrt(2 * (2 / N1k) / 3)
near1k = W.reduced_chances(W.reduced_extra_M_formula(N1k), v1k, math.ceil(math.pi / delta1k), [0, 1])
values['q19ExtraPeak1024'] = float(first_max(near1k))
values['q19ExtraBergou1024'] = math.pi / (2 * delta1k)

# ---------------------------------------------------------------- q19-simulation
values['q19Amps50'] = 2 ** 50 / 1e15
values['q19Bytes50'] = 2 ** 50 * 16 / 1e15
values['q19Terms50'] = float(50 - 1)
values['q19Amps20'] = float(2 ** 20)
SWAP = np.array([[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]], dtype=complex)
XX = np.kron(W.X, W.X)
YY = np.kron(W.Y, W.Y)
ZZ = np.kron(W.Z, W.Z)
values['q19SwapIdentity'] = maxabs(XX + YY + ZZ - (2 * SWAP - np.eye(4)))
H2 = -(XX + YY + ZZ) / 4


def bond_closed(Jt):
    return np.exp(-1j * Jt / 4) * (math.cos(Jt / 2) * np.eye(4) + 1j * math.sin(Jt / 2) * SWAP)


values['q19BondClosed'] = max(maxabs(expm(-1j * Jt * H2) - bond_closed(Jt)) for Jt in (math.pi, 1.7, 0.5))
out = expm(-1j * math.pi * H2) @ np.array([0, 0, 1, 0], dtype=complex)
values['q19BondSwapChance'] = float(abs(out[1]) ** 2)
values['q19SwapJt'] = float(2 * np.arccos(0.0))
H3c = W.chain_H(3, 1.0)
Uex = expm(-1j * 2.0 * H3c)
Hb0, Hb1 = -W.s_dot_s(3, 0, 1), -W.s_dot_s(3, 1, 2)
comm = W.spec_norm(Hb0 @ Hb1 - Hb1 @ Hb0)
values['q19Comm'] = comm


def terr(M, order):
    return W.spec_norm(W.trotter(3, 1.0, 2.0, M, order) - Uex)


values['q19TrotErr1'] = terr(1, 1)
values['q19TrotErr4'] = terr(4, 1)
values['q19TrotErr8'] = terr(8, 1)
values['q19TrotErr14'] = terr(14, 1)
values['q19TrotErr15'] = terr(15, 1)
values['q19TrotBound8'] = 2.0 ** 2 / (2 * 8) * comm
values['q19TrotRatio1'] = terr(4, 1) / terr(8, 1)
values['q19Trot2Err3'] = terr(3, 2)
values['q19Trot2Err4'] = terr(4, 2)
values['q19Trot2Ratio'] = terr(4, 2) / terr(8, 2)
values['q19TrotMFor05'] = float(next(M for M in range(1, 200) if terr(M, 1) < 0.05))
values['q19Trot2MFor05'] = float(next(M for M in range(1, 200) if terr(M, 2) < 0.05))


def flip_chances(U):
    col = U[:, 4]  # the column of |100>
    return [float(abs(col[4 >> k]) ** 2) for k in range(3)]  # |100>, |010>, |001> are the places 4, 2, 1


ex = flip_chances(Uex)
values['q19MagnonExact1'], values['q19MagnonExact2'], values['q19MagnonExact3'] = ex
values['q19MagnonTrotM1'] = flip_chances(W.trotter(3, 1.0, 2.0, 1, 1))[2]
values['q19MagnonTrotM4'] = flip_chances(W.trotter(3, 1.0, 2.0, 4, 1))[2]
values['q19MagnonTrotM8'] = flip_chances(W.trotter(3, 1.0, 2.0, 8, 1))[2]
# the one-flip block: H restricted to |100>, |010>, |001>, exponentiated on its own
idx = [4, 2, 1]
Hblock = H3c[np.ix_(idx, idx)]
blk = expm(-1j * 2.0 * Hblock)
values['q19MagnonRoutes'] = max(abs(abs(blk[k, 0]) ** 2 - ex[k]) for k in range(3))

# ---------------------------------------------------------------- q19-qaoa
E4 = [(0, 1), (1, 2), (2, 3), (3, 0)]
cut = W.cut_table(4, E4)
values['q19Assign4'] = float(len(cut))
values['q19MaxCut'] = float(cut.max())
values['q19CutCount4'] = float((cut == cut.max()).sum())
values['q19CutMean'] = float(cut.mean())
values['q19CutHist0'] = float((cut == 0).sum())
values['q19CutHist2'] = float((cut == 2).sum())
HC = sum(0.5 * (np.eye(16) - W.op_on(4, {a: W.Z, b: W.Z})) for a, b in E4)
values['q19HcGap'] = maxabs(np.diag(cut) - HC)
GA, BA = 0.7, 0.3
values['q19GammaA'] = float(GA)
values['q19BetaA'] = float(BA)
values['q19F0Gamma'] = W.qaoa_F(4, E4, 0.0, BA)
values['q19F0Beta'] = W.qaoa_F(4, E4, GA, 0.0)
values['q19QaoaCircuitGap'] = maxabs(W.qaoa_circuit_psi(4, E4, GA, BA) - W.qaoa_psi(4, E4, GA, BA))
values['q19RingFormulaGap'] = max(abs(W.qaoa_F(4, E4, g, b) - (2 + math.sin(4 * b) * math.sin(2 * g))) for g, b in [(0.7, 0.3), (1.9, 2.2), (0.2, 0.1)])

# the best angle on the grid gamma in [0, 180] deg, beta in [0, 90] deg, step 0.5 (gamma outer, beta inner, the first within 1e-12): a vectorised scan of the state
gs = np.arange(0, 361) * 0.5
bs = np.arange(0, 181) * 0.5
phase = np.exp(-1j * np.deg2rad(gs)[None, :] * cut[:, None]) / 4.0  # 16 x 361
Ftab = np.zeros((len(gs), len(bs)))
for j, bdeg in enumerate(bs):
    UB = W.kron(*[expm(-1j * math.radians(bdeg) * W.X)] * 4)
    Ftab[:, j] = (np.abs(UB @ phase) ** 2 * cut[:, None]).sum(axis=0)
bestF, bg, bb = -1.0, 0.0, 0.0
for i in range(len(gs)):
    for j in range(len(bs)):
        if Ftab[i, j] > bestF + 1e-12:
            bestF, bg, bb = float(Ftab[i, j]), float(gs[i]), float(bs[j])
values['q19FStar'] = bestF
values['q19GammaStar'] = bg
values['q19BetaStar'] = bb
values['q19QaoaRatio'] = bestF / float(cut.max())
pst = np.abs(W.qaoa_psi(4, E4, math.pi / 4, math.pi / 8)) ** 2
values['q19QaoaPOpt'] = float(pst[cut == 4].sum())
values['q19QaoaP0101'] = float(pst[0b0101])
values['q19QaoaP2'] = float(pst[cut == 2].sum())
values['q19QaoaP0'] = float(pst[cut == 0].sum())
values['q19CutRandomP'] = float((cut == cut.max()).sum() / len(cut))
path, evals = W.pattern_search(lambda g, b: W.qaoa_F(4, E4, g, b), 0.3, 0.2, 0.2, 0.01)
values['q19LoopStartG'] = float(path[0][0])
values['q19LoopStartB'] = float(path[0][1])
values['q19LoopMoves'] = float(len(path) - 1)
values['q19LoopEvals'] = float(evals)
values['q19LoopStart'] = float(path[0][2])
values['q19LoopEnd'] = float(path[-1][2])
values['q19LoopGamma'] = float(path[-1][0])
values['q19LoopBeta'] = float(path[-1][1])
values['q19LoopGammaDeg'] = math.degrees(path[-1][0])
values['q19LoopBetaDeg'] = math.degrees(path[-1][1])


def runs_needed(p):
    """Fewest runs m with (1 - p)^m <= 1 - 0.9, by exact fractions."""
    q = 1 - Fraction(p).limit_denominator(1000)
    m, cur = 0, Fraction(1)
    while cur > Fraction(1, 10):
        cur *= q
        m += 1
    return m


values['q19Shots90'] = float(runs_needed(float(pst[cut == 4].sum())))
values['q19Shots90Random'] = float(runs_needed(float((cut == cut.max()).sum() / len(cut))))
values['q19Cut0011'] = float(cut[0b0011])

out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-qc709' / 'q19.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            'about': 'Claim values for Physics 709 chapter Q19, numpy (directed arcs with 2J/n - I, the circuit form X_dir (|0><0| (x) O + |1><1| (x) D), explicit invariant-subspace '
            'bases, a momentum-space FFT coin walk, Pauli matrices with scipy expm, spectral norms, dense QAOA matrices with a vectorised grid scan, exact Fractions for the run '
            'counts; never physics/qc/walk.ts, trotter.ts, variational.ts or Q19.values.ts). Regenerate: python3 pipeline/claims_qc709/q19.py',
            'values': values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + '\n'
)
print(f'wrote {out.relative_to(ROOT)} ({len(values)} values)')
