#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q18.values.ts (Physics 709, chapter Q18: Simon, the QFT, phase estimation).

Independent route (never Q18.values.ts's own helpers, never physics/qc/qft.ts, oracles.ts or the circuit module): every gate is an explicit dense matrix built by
pipeline/qft_numpy.py (np.kron, a controlled-gate builder that walks the basis states); a circuit is the product of its gates applied to a state vector; the Fourier
matrix is np.fft.ifft(norm='ortho') (N&C's sign +); phase-estimation chances are summed unit arrows (np.exp); eigenvalues come from np.linalg.eigvals; continued fractions
and Simon's run counts use exact fractions.Fraction; classical collisions are counted by enumerating subsets.

Units: the qubit order is q0 = leftmost tensor factor = top wire = most significant bit (matches state.ts); Simon's five wires are x (q0 q1 q2) then the answer (q3 q4), so
a place is (x << 2) | answer. The eigenphase tau is a fraction of a turn.

Usage (from the repo root): python3 pipeline/claims_qc709/q18.py -> app/src/physics/__fixtures__/claims-qc709/q18.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import math
import sys
from fractions import Fraction
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import qft_numpy as Q  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent.parent
TWO_PI = 2 * math.pi


def deg(z):
    return float((math.degrees(math.atan2(z.imag, z.real)) % 360 + 360) % 360)


def ratio_deg(num, den):
    return deg(num * np.conj(den))


# ---------------------------------------------------------------- Simon, n = 3, s = 110 (dense five-wire simulation)
n, s = 3, 6
f = Q.simon_function(s, n)
nq = 5
st_query = Q.simon_state(s, n, 'query')            # after H on the inputs and U_f
idx = lambda x, o: (x << 2) | o
mask01 = np.array([1.0 if (i & 3) == 1 else 0.0 for i in range(32)])
p01 = float(np.sum(np.abs(st_query * mask01) ** 2))
post = st_query * mask01 / math.sqrt(p01)            # after reading the answer 01
st_y = post.copy()
for q in range(n):
    st_y = Q.op_on(nq, Q.H1, q) @ st_y               # after the last H
y_chance = [float(sum(abs(st_y[(y << 2) | o]) ** 2 for o in range(4))) for y in range(8)]
perp_rows = [[(y >> 2) & 1, (y >> 1) & 1, y & 1] for y in range(8) if y_chance[y] > 1e-9]  # the circuit's support
query_bars = [abs(st_query[idx(x, f[x])]) for x in range(8)]


def moves_of_row_reduction(rows):
    """Number of row swaps and row additions Gauss-Jordan elimination makes over GF(2) (a swap only when the pivot is not already in place)."""
    R = [list(r) for r in rows]
    moves = 0
    r = 0
    for col in range(len(R[0])):
        p = next((i for i in range(r, len(R)) if R[i][col]), None)
        if p is None:
            continue
        if p != r:
            R[p], R[r] = R[r], R[p]
            moves += 1
        for i in range(len(R)):
            if i != r and R[i][col]:
                R[i] = [a ^ b for a, b in zip(R[i], R[r])]
                moves += 1
        r += 1
        if r == len(R):
            break
    return moves


null_members = Q.gf2_nullspace_members([7, 6], 3)

# ---------------------------------------------------------------- the QFT, m = 3
F8 = Q.F(8)
col5 = F8[:, 5]
formula = lambda a: np.array([np.exp(TWO_PI * 1j * a * y / 8) for y in range(8)]) / math.sqrt(8)
qft_formula_gap = max(float(np.max(np.abs(formula(a) - F8[:, a]))) for a in range(8))
prod_gap = 0.0
for a in range(8):
    fac = [np.array([1, np.exp(1j * math.radians(g))]) / math.sqrt(2) for g in Q.product_angles_deg(a, 3)]
    prod_gap = max(prod_gap, float(np.max(np.abs(Q.kron_all(fac) - F8[:, a]))))


def printed_value(bits):
    m = len(bits)
    w = [2 ** (m - 1), 2 ** (m - 1)] + [2 ** (m - j) for j in range(3, m + 1)]
    return sum(int(b) * wt for b, wt in zip(bits, w))


wrong = sum(printed_value(format(a, '03b')) != a for a in range(8))
Uq = Q.qft_circuit_matrix(3)
H3 = Q.kron_all([Q.H1] * 3)
out5 = Uq @ Q.ket('101')

# ---------------------------------------------------------------- kickback (the kick state, target 1)
kick = Q.pe_state(5 / 8, 3, '1', upto='kick')
kick_ratio = lambda state, q: ratio_deg(state[(1 << (3 - q)) | 1], state[1])
kick38 = Q.pe_state(3 / 8, 3, '1', upto='kick')
CK = np.zeros(4, dtype=complex)                      # two wires: control q0 and target q1
ck = Q.ket('01')
ck = Q.op_on(2, Q.H1, 0) @ ck
ck = Q.ctrl(2, Q.P(TWO_PI * 5 / 8), 0, [1]) @ ck
plus_read = Q.pe_reading(5 / 8, 3, '+')

# ---------------------------------------------------------------- phase estimation
read58 = Q.pe_reading(5 / 8, 3)
read13 = Q.pe_reading(1 / 3, 3)
read13_4 = Q.pe_reading(1 / 3, 4)
read13_5 = Q.pe_reading(1 / 3, 5)
read1116 = Q.pe_reading(11 / 16, 3)
read1116_4 = Q.pe_reading(11 / 16, 4)


def within(tau, m, w):
    p = Q.pe_sum(tau, m)
    tot = 0.0
    for x in range(2 ** m):
        dd = abs(x / 2 ** m - tau) % 1
        if min(dd, 1 - dd) <= w + 1e-9:
            tot += p[x]
    return float(tot)


def worst_best(m):
    return float(abs(np.sum(np.exp(TWO_PI * 1j * 2.0 ** -(m + 1) * np.arange(2 ** m))) / 2 ** m) ** 2)


t_nc = 3 + math.ceil(math.log2(2 + 1 / (2 * 0.1)))

# ---------------------------------------------------------------- counting, N = 4, m = 3
cnt0 = Q.counting_reading([])
cnt1 = Q.counting_reading([3])
cnt2 = Q.counting_reading([1, 2])
alpha = math.asin(math.sqrt(1 / 4))
Qm = Q.grover_q(2, [3])
w0 = Q.kron_all([Q.H1] * 2) @ np.array([1, 0, 0, 0], dtype=complex)
x0 = np.array([0, 0, 0, 1], dtype=complex)
w_perp = x0 - np.vdot(w0, x0) * w0
w_perp = w_perp / np.linalg.norm(w_perp)
alpha_plus = (w0 - 1j * w_perp) / math.sqrt(2)
eig_gap = float(np.linalg.norm(Qm @ alpha_plus - np.exp(1j * math.pi / 3) * alpha_plus))
a_plus = round(8 * alpha / TWO_PI)
a_minus = round(8 * (TWO_PI - alpha) / TWO_PI) % 8
cnt_closed = float(np.max(np.abs(cnt1 - (0.5 * Q.pe_sum(alpha / math.pi, 3) + 0.5 * Q.pe_sum(1 - alpha / math.pi, 3)))))

# ---------------------------------------------------------------- order finding, x = 2 mod 21
x, N = 2, 21
r = Q.multiplicative_order(x, N)
shift = Q.shift_matrix(r)
ev = np.linalg.eigvals(shift)
us = [np.array([np.exp(-TWO_PI * 1j * sv * k / r) for k in range(r)]) / math.sqrt(r) for sv in range(r)]
eig_res = max(float(np.linalg.norm(shift @ us[sv] - np.exp(TWO_PI * 1j * sv / r) * us[sv])) for sv in range(r))
one_res = float(np.linalg.norm(sum(us) / math.sqrt(r) - np.eye(r)[0]))
dist5 = Q.comb_mixture_distribution(x, N, 5)
good5 = [y for y in range(32) if Q.order_from_reading(y, 5, x, N) == r]
peaks5 = sorted(int(i) for i in np.argsort(dist5)[-6:])
comb = np.zeros(32, dtype=complex)
comb[[0, 6, 12, 18, 24, 30]] = 1 / math.sqrt(6)
comb_peaks = sorted(int(i) for i in np.argsort(np.abs(Q.F(32) @ comb) ** 2)[-6:])


def success(t):
    dist = Q.comb_mixture_distribution(x, N, t)
    return float(sum(dist[y] for y in range(2 ** t) if Q.order_from_reading(y, t, x, N) == r))


def cf_len(p, q):
    n_terms = 0
    v = Fraction(p, q)
    while True:
        n_terms += 1
        fl = math.floor(v)
        fr = v - fl
        if fr == 0:
            return n_terms
        v = 1 / fr


squared_phases = len({round(float((np.angle(z) / TWO_PI) % 1.0) % 1.0, 6) % 1.0 for z in np.linalg.eigvals(np.linalg.matrix_power(shift, 2))})

values = {
    # q18-simon
    'q18SimonAnswers': float(len(set(f))),
    'q18SimonPerAnswer': float(min(f.count(v) for v in set(f))),
    'q18SimonF001': float(f[1]),
    'q18SimonF111': float(f[7]),
    'q18SimonQueryBar': float(query_bars[0]),
    'q18SimonQueryBarsEqual': float(max(query_bars) - min(query_bars)),
    'q18SimonOutChance': p01,
    'q18SimonPairBar': float(abs(post[idx(1, 1)])),
    'q18SimonYBar': float(abs(st_y[idx(0, 1)].real)),
    'q18SimonYSign': float(np.sign(st_y[idx(0, 1)].real) * np.sign(st_y[idx(1, 1)].real)),
    'q18SimonYChance': float(y_chance[0]),
    'q18SimonPerpCount': float(sum(1 for p in y_chance if p > 1e-9)),
    'q18SimonBadY': float(sum(p for y, p in enumerate(y_chance) if Q.dot2(y, s) == 1)),
    'q18SimonPrintedNorm2': float(sum((2.0 ** (-(n + 1) / 2)) ** 2 for y in range(2 ** n) if Q.dot2(y, s) == 0)),
    'q18SimonTrueNorm2': float(sum(y_chance)),
    'q18SimonRank': float(Q.gf2_rank([[1, 1, 1], [1, 1, 0]])),
    'q18SimonMoves': float(moves_of_row_reduction([[1, 1, 1], [1, 1, 0]])),
    'q18SimonNullSize': float(len(null_members)),
    'q18SimonSolved': float(max(null_members)),
    'q18PerpRank': float(Q.gf2_rank(perp_rows)),
    'q18ThreeForceZero': float(len(Q.gf2_nullspace_members([4, 2, 1], 3))),
    'q18Dot110x111': float(Q.dot2(6, 7)),
    'q18Dot110x010': float(Q.dot2(6, 2)),
    'q18SimonNew0': float(1 - Fraction(2) ** (0 - (n - 1))),
    'q18SimonNew1': float(1 - Fraction(2) ** (1 - (n - 1))),
    'q18SimonTwoRuns': float(Q.runs_suffice_enumerated(s, n)),
    'q18SimonExpRuns': float(Q.expected_runs_chain(3)),
    'q18SimonExpRuns10': float(Q.expected_runs_chain(10)),
    'q18SimonCollide3': float(Q.collision_probability(s, n, 3)),
    'q18SimonCollideBound': float(Fraction(3 * 2, 2 * 7)),
    'q18CollisionXor': float(0b010 ^ 0b100),
    # q18-qft
    'q18F8Entry00': float(F8[0, 0].real),
    'q18QftIsF8': qft_formula_gap,
    'q18Qft101Bar': float(abs(col5[3])),
    'q18Qft101BarsEqual': float(np.max(np.abs(col5)) - np.min(np.abs(col5))),
    'q18Qft101Step': ratio_deg(col5[1], col5[0]),
    'q18Qft101Chance': float(abs(col5[3]) ** 2),
    'q18QftPrintedNorm2': float(np.sum(np.abs(np.array([np.exp(TWO_PI * 1j * 5 * y / 8) for y in range(8)]) / 8) ** 2)),
    'q18QftTrueNorm2': float(np.sum(np.abs(col5) ** 2)),
    'q18ProdTop': Q.product_angles_deg(5, 3)[0],
    'q18ProdMid': Q.product_angles_deg(5, 3)[1],
    'q18ProdBot': Q.product_angles_deg(5, 3)[2],
    'q18ProdIsQft': prod_gap,
    'q18ExpandPrinted110': float(printed_value('110')),
    'q18ExpandTrue110': float(int('110', 2)),
    'q18ExpandWrong': float(wrong),
    'q18QftCircuitIsF8': float(np.max(np.abs(Uq - F8))),
    'q18QftOutIsF8Col': float(np.max(np.abs(out5 - col5))),
    'q18QftGates3': float(Q.qft_gate_counts(3)[0]),
    'q18QftSwaps3': float(Q.qft_gate_counts(3)[1]),
    'q18QftGates10': float(Q.qft_gate_counts(10)[0]),
    'q18QftSwaps10': float(Q.qft_gate_counts(10)[1]),
    'q18Fft10': float(10 * 2 ** 10),
    'q18QftGates5': float(Q.qft_gate_counts(5)[0]),
    'q18Qft000IsH': float(np.max(np.abs(F8[:, 0] - H3[:, 0]))),
    'q18Qft001VsH': float(np.max(np.abs(F8[:, 1] - H3[:, 1]))),
    'q18Prod110Top': Q.product_angles_deg(6, 3)[0],
    'q18Prod110Mid': Q.product_angles_deg(6, 3)[1],
    'q18Prod110Bot': Q.product_angles_deg(6, 3)[2],
    # q18-kickback
    'q18Tau': float(Fraction(1, 2) + Fraction(1, 8)),
    'q18TauThird': 1 / 3,
    'q18TauEleven': 11 / 16,
    'q18TauDeg': float((Fraction(1, 2) + Fraction(1, 8)) * 360),
    'q18KickTarget': float(abs(ck[1]) ** 2 + abs(ck[3]) ** 2),
    'q18KickPhase': ratio_deg(ck[3], ck[1]),
    'q18KickQ0': kick_ratio(kick, 0),
    'q18KickQ1': kick_ratio(kick, 1),
    'q18KickQ2': kick_ratio(kick, 2),
    'q18KickIsQft': float(np.max(np.abs(np.array([kick[(y << 1) | 1] for y in range(8)]) - col5))),
    'q18PlusHalf0': float(plus_read[0]),
    'q18PlusHalf5': float(plus_read[5]),
    'q18KickU2Deg': kick_ratio(kick38, 1),
    # q18-phase-est
    'q18PeExact': float(read58[5]),
    'q18Pe13Best': float(read13[3]),
    'q18Pe13Next': float(read13[2]),
    'q18Pe13a': float(round(8 / 3)),
    'q18Pe13Grid': float(Fraction(round(8 / 3), 8)),
    'q18Pe3Arrow': float(Fraction(1, 8)),
    'q18Pe13Delta': abs(1 / 3 - 3 / 8),
    'q18FourOverPi2': 4 / math.pi ** 2,
    'q18PeWorst3': worst_best(3),
    'q18PeWorst4': worst_best(4),
    'q18PeWorst5': worst_best(5),
    'q18PeTie': float(read1116[5]),
    'q18PeTieNext': float(read1116[6]),
    'q18Pe4Exact': float(read1116_4[11]),
    'q18NcEps': 0.1,
    'q18NcRadius': float(Fraction(1, 8)),
    'q18NcT': float(t_nc),
    'q18NcWithin': within(1 / 3, t_nc, 1 / 8),
    'q18Pe13m4': float(read13_4[5]),
    'q18Pe13m4Next': float(read13_4[6]),
    'q18Pe13m5': float(np.max(read13_5)),
    'q18Pe13Limit': (math.sin(math.pi / 3) / (math.pi / 3)) ** 2,
    'q18Pe13Near': within(1 / 3, 3, 1 / 8),
    'q18Tail8k1': Q.pe_far_tail(8, 1, 4000),
    'q18Tail8k2': Q.pe_far_tail(8, 2, 4000),
    'q18Tail8k3': Q.pe_far_tail(8, 3, 4000),
    # q18-counting
    'q18CntAlpha': math.degrees(alpha),
    'q18CntTurn': math.degrees(2 * alpha),
    'q18CntTau': alpha / math.pi,
    'q18CntTauMinus': 1 - alpha / math.pi,
    'q18CntEig': eig_gap,
    'q18Cnt0': float(cnt0[0]),
    'q18Cnt2': float(cnt2[2]),
    'q18Cnt2b': float(cnt2[6]),
    'q18CntPrinted': float(cnt2[1] + cnt2[7]) if (a_plus, a_minus) == (1, 7) else float('nan'),
    'q18CntEst1': float(4 * math.sin(math.pi * 1 / 8) ** 2),
    'q18CntEst2': float(4 * math.sin(math.pi * 2 / 8) ** 2),
    'q18CntEst3': float(4 * math.sin(math.pi * 3 / 8) ** 2),
    'q18Cnt1Peak': float(cnt1[1]),
    'q18Cnt1PeakB': float(cnt1[7]),
    'q18CntFalseEmpty': float(cnt1[0]),
    'q18CntClosed': cnt_closed,
    # q18-order
    'q18Ord': float(r),
    'q18OrdEig': eig_res,
    'q18OrdPhases': float(len({round(float((np.angle(z) / TWO_PI) % 1.0) % 1.0, 6) % 1.0 for z in ev})),
    'q18OrdPeakA': float(peaks5[0]),
    'q18OrdPeakB': float(peaks5[1]),
    'q18OrdPeakC': float(peaks5[2]),
    'q18OrdPeakD': float(peaks5[3]),
    'q18OrdPeakE': float(peaks5[4]),
    'q18OrdPeakF': float(peaks5[5]),
    'q18OrdPeaksComb': float(sum(abs(a - b) for a, b in zip(comb_peaks, peaks5))),
    'q18OneIsSum': one_res,
    'q18OrdTauHat': float(Fraction(5, 32)),
    'q18OrdSixth': float(Fraction(1, r)),
    'q18OrdRead5': 5 / 32 * 360,
    'q18OrdTrue': 1 / 6 * 360,
    'q18OrdGoodA': float(good5[0]),
    'q18OrdGoodB': float(good5[1]),
    'q18OrdGoodCount': float(len(good5)),
    'q18OrdSuccess5': success(5),
    'q18OrdSuccess11': success(11),
    'q18OrdGcdMinus': float(math.gcd(2 ** 3 - 1, 21)),
    'q18OrdGcdPlus': float(math.gcd(2 ** 3 + 1, 21)),
    'q18Ord4': float(Q.multiplicative_order(4, 21)),
    'q18U2Distinct': float(squared_phases),
    'q18Ord27': float(Q.order_from_reading(27, 5, 2, 21)),
    'q18Cf27Len': float(cf_len(27, 32)),
}

out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-qc709' / 'q18.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            'about': 'Claim values for Physics 709 chapter Q18, numpy (dense gate matrices built with np.kron and a controlled-gate builder, circuits as products of them, '
            "np.fft.ifft(norm='ortho') for the Fourier matrix, summed unit arrows for the phase-estimation chances, np.linalg.eigvals, exact Fractions for continued fractions "
            "and Simon's run counts, subset enumeration for the classical collision; never physics/qc/qft.ts, oracles.ts or Q18.values.ts's own helpers). "
            'Regenerate: python3 pipeline/claims_qc709/q18.py',
            'values': values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + '\n'
)
print(f'wrote {out.relative_to(ROOT)} ({len(values)} values)')
