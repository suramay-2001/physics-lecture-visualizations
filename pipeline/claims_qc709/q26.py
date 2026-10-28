#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q26.values.ts (Physics 709, chapter Q26: qubits made of light, Bergou Chapter 14).

Independent route (never Q26.values.ts's own helpers, never physics/qc/photons.ts): pipeline/photon_numpy.py takes many-photon amplitudes from the exponential of the mode generator on a
truncated Fock space (permanents only as a check, by itertools), expands the nonlinear sign gate's operator substitution with sympy, solves the two printed conditions with mpmath
(30 digits, after scipy fsolve), simulates the photonic CZ on four modes with a diagonal sign gate, runs gate teleportation on a six-index tensor with sliced readings, builds the
Bell analyser's patterns from the exponential on four modes, takes the Jaynes-Cummings levels from numpy eigvalsh and the coherent states from math.factorial series. Concurrences
use the pure-state form 2|ad - bc| and entropies come from the eigenvalues of the reduced matrix.

Units: S = [[t', r], [r', t]] (rows = exits, columns = entrances); hbar = 1; angles are degrees in names and arguments.

Usage (from the repo root): python3 pipeline/claims_qc709/q26.py -> app/src/physics/__fixtures__/claims-qc709/q26.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import math
import sys
from fractions import Fraction
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import photon_numpy as P  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent.parent
values = {}
S2 = P.S2


def conc(psi):
    """Wootters for a pure two-qubit ket: 2 |a d - b c|."""
    return float(2 * abs(psi[0] * psi[3] - psi[1] * psi[2]))


def entropy_bits(psi4):
    m = np.asarray(psi4).reshape(2, 2)
    lam = np.linalg.eigvalsh(m @ m.conj().T)
    return float(-sum(x * math.log2(x) for x in lam if x > 1e-15))


def unit_gap(S):
    return float(np.max(np.abs(S @ S.conj().T - np.eye(2))))


# ---- q26-encodings
U = P.wave_unitary(30, 40)
ket = U[:, 0]
dr = P.dual_rail_ket(30, 40)
values['q26WaveP0'] = float(abs(ket[0]) ** 2)
values['q26WaveP1'] = float(abs(ket[1]) ** 2)
values['q26WaveAmp0'] = float(abs(ket[0]))
values['q26WaveAmp1'] = float(abs(ket[1]))
values['q26TruePhase'] = P.rel_phase(ket)
values['q26PrintedPhase'] = P.rel_phase(dr)
values['q26BlochPolar'] = P.bloch_polar(ket)
values['q26DoubledGap'] = max(abs(P.bloch_polar(P.wave_unitary(t, p)[:, 0]) - 2 * t) for t, p in ((30, 40), (22.5, 112.5), (10, -70)))
values['q26DualRailP0'] = float(abs(dr[0]) ** 2)
values['q26DualRailP1'] = float(abs(dr[1]) ** 2)
th = math.radians(30)
bs_dr = np.array([[math.cos(th), -math.sin(th)], [math.sin(th), math.cos(th)]], dtype=complex)
circ_dr = np.diag([1, np.exp(1j * math.radians(40))]) @ bs_dr @ np.array([1, 0], dtype=complex)
values['q26DualRailGap'] = float(np.max(np.abs(circ_dr - dr)))
u225 = P.wave_unitary(22.5, 0)[:, 0]
values['q26Polar225'] = P.bloch_polar(u225)
values['q26Sin2_225'] = float(abs(u225[1]) ** 2)

# ---- q26-beamsplitter
S70 = P.bs_real(0.3)
values['q26T2_70'] = float(abs(S70[0, 0]) ** 2)
values['q26R_70'] = float(abs(S70[1, 0]) ** 2)
rng = np.random.default_rng(26)
named = [P.bs_sym(), P.bs_q5()] + [P.bs_real(k / 10) for k in range(11)]
values['q26StokesGap'] = max(max(P.stokes(S)) for S in named + [P.haar(2, rng) for _ in range(200)])
values['q26ConvGap'] = max(max(max(P.stokes(S)), unit_gap(S)) for S in (P.bs_real(0.5), P.bs_sym(), P.bs_q5()))
ent30 = np.array([0, S70[1, 0], S70[0, 0], 0], dtype=complex)
S50 = P.bs_real(0.5)
ent50 = np.array([0, S50[1, 0], S50[0, 0], 0], dtype=complex)
values['q26Conc70'] = conc(ent30)
values['q26Entropy70'] = entropy_bits(ent30)
values['q26Entropy50'] = entropy_bits(ent50)
Ssym = P.bs_sym()
sq = Ssym @ Ssym
values['q26TwoBsChance'] = float(abs(sq[1, 0]) ** 2)
values['q26TwoBsPhase'] = math.degrees(float(np.angle(sq[1, 0])))
values['q26UnitaryGap'] = max(unit_gap(S) for S in (P.bs_real(0.5), P.bs_sym(), P.bs_q5()))

# ---- q26-hom
values['q26R25'] = float(Fraction(1, 4))
values['q26R20'] = float(Fraction(1, 5))
a20, a11, a02 = P.two_photon(P.bs_real(0.25))
values['q26HomP20_R25'] = float(abs(a20) ** 2)
values['q26HomP11_R25'] = float(abs(a11) ** 2)
values['q26HomP02_R25'] = float(abs(a02) ** 2)
rng = np.random.default_rng(26)
values['q26HomCancel'] = max(float(abs(S[0, 0] * S[1, 1] + S[1, 0] * S[0, 1])) for S in [P.bs_real(0.5), P.bs_sym(), P.bs_q5()] + [P.balanced(rng) for _ in range(200)])
values['q26HomTt'] = float(np.real(S50[0, 0] * S50[1, 1]))
values['q26HomRr'] = float(np.real(S50[1, 0] * S50[0, 1]))
b20, b11, b02 = P.two_photon(S50)
values['q26HomP20_R50'] = float(abs(b20) ** 2)
values['q26HomP11_R50'] = float(abs(b11) ** 2)
values['q26HomPhaseReal'] = abs(math.degrees(float(np.angle(b02 / b20))))
c20, _, c02 = P.two_photon(P.bs_sym())
values['q26HomPhaseSym'] = abs(math.degrees(float(np.angle(c02 / c20))))
d20, d11, d02 = P.two_photon(P.bs_real(0.2))
values['q26HomR20'] = float(abs(d11) ** 2)
values['q26HomP20_R20'] = float(abs(d20) ** 2)
values['q26HomBunch20'] = float(1 - abs(d11) ** 2)
values['q26DistinguishableR50'] = P.distinguishable(S50)
rng = np.random.default_rng(26)
gap = 0.0
for S in [P.bs_real(0.25), P.bs_sym(), P.bs_q5()] + [P.haar(2, rng) for _ in range(50)]:
    tp, r, rp, t = S[0, 0], S[0, 1], S[1, 0], S[1, 1]
    w = P.two_photon(S)
    gap = max(gap, abs(w[0] - math.sqrt(2) * tp * r), abs(w[1] - (tp * t + rp * r)), abs(w[2] - math.sqrt(2) * rp * t))
values['q26HomClosedGap'] = float(gap)
cg = 0.0
for S in (P.bs_real(0.25), P.bs_sym(), P.bs_q5(), P.bs_real(0.2)):
    B = P.block(S, 2, 'perm')
    box = np.eye(4, dtype=complex)
    box[:3, :3] = B
    inp = np.zeros(4, dtype=complex)
    inp[1] = 1
    out = box @ inp
    w = P.two_photon(S)
    cg = max(cg, float(np.max(np.abs(out[:3] - np.array(w)))), float(abs(out[3])))
values['q26HomCircuitGap'] = cg

# ---- q26-ns-cz
th_deg, ph_deg = P.ns_solve_precise()
x = math.cos(math.radians(ph_deg)) ** 2
_, _, _, other_cos, _ = P.ns_solve()
A = P.ns_amps_sympy(th_deg, ph_deg, 4)
values['q26NsBar'] = float((np.ones(3) / np.linalg.norm(np.ones(3)))[0])
values['q26NsA0'] = A[0]
values['q26NsA1'] = A[1]
values['q26NsA2'] = A[2]
values['q26NsA3'] = A[3]
values['q26NsRatio0'] = A[0] / A[0]
values['q26NsA1overA0'] = A[1] / A[0]
values['q26NsA2overA0'] = A[2] / A[0]
values['q26NsRatio3'] = A[3] / A[0]
values['q26NsTheta'] = th_deg
values['q26NsPhi'] = ph_deg
values['q26NsSuccess'] = x
values['q26NsOtherRootCosTheta'] = other_cos
values['q26NsFormulaGap'] = max(max(abs(a - b) for a, b in zip(P.ns_amps_expm(t, p, 4), P.ns_amps_closed(t, p, 4))) for t, p in ((th_deg, ph_deg), (20, 33), (100, 75)))
values['q26NsSignGap'] = max(abs(A[1] - A[0]), abs(A[2] + A[0]))
lin, leak0 = P.cz_dual_rail(False)
nsm, leak1 = P.cz_dual_rail(True)
plus2 = np.kron([S2, S2], [S2, S2]).astype(complex)
values['q26ConcLinear'] = conc(lin @ plus2)
values['q26ConcCz'] = conc(nsm @ plus2)
print_lin = np.diag([1j, 1, -1, 1j])
print_ns = np.diag([1j, 1, 1, 1j])
values['q26CzGap'] = max(float(np.max(np.abs(lin - print_lin))), float(np.max(np.abs(nsm - print_ns))))
values['q26CzLeak'] = max(leak0, leak1)
p_cz = x * x
values['q26CzSuccess'] = p_cz
values['q26CzAttempts'] = 1 / p_cz
values['q26NsBound'] = float(Fraction(2, 27))
values['q26NsBoundRatio'] = float(Fraction(2, 27)) / p_cz
values['q26CzIn100'] = 100 * p_cz
values['q26Cz3Chain'] = p_cz**3
values['q26CzAttempts3'] = float(round(1 / p_cz**3))
for k in range(4):
    values[f'q26CzChain{k}'] = p_cz ** (k + 1)

# ---- q26-teleport-gate
values['q26NsInverse'] = 1 / x
gap_t, lo_t, hi_t = P.teleport_sweep(6, 26)
values['q26GateTeleportOutcome'] = lo_t
values['q26TeleportOneOutcome'] = P.teleport_one_chance([1, 0], '00')
values['q26ResourceGap'] = float(np.max(np.abs(P.resource_state() - P.resource_printed())))
values['q26GtGap'] = gap_t
_, out0, _ = P.teleport_run(np.array([S2, S2], dtype=complex), np.array([1, 0], dtype=complex), '0000')
values['q26GtOut00'] = float(abs(out0[0]) ** 2)
values['q26GtOut11'] = float(abs(out0[3]) ** 2)
values['q26GtSpread'] = hi_t - lo_t
for n in (1, 3, 9, 18, 19, 199):
    values[f'q26Klm{n}'] = P.klm(n)
values['q26Target90'] = float(Fraction(9, 10))
values['q26Target99'] = float(Fraction(99, 100))
values['q26KlmExact99'] = math.sqrt(0.99) / (1 - math.sqrt(0.99))
values['q26KlmN99'] = float(P.klm_least(0.99))
values['q26KlmN90'] = float(P.klm_least(0.9))
values['q26KlmPhotons10'] = float(10 * (P.klm_least(0.99) + 1))
ba = P.bell_analyzer()
values['q26BellAnalyserSuccess'] = ba
values['q26BellGate'] = ba**2

# ---- q26-nonlinear
kerr_state = P.kerr(math.pi) @ plus2
values['q26KerrConc'] = conc(kerr_state)
cphase = np.eye(4, dtype=complex)
cphase[3, 3] = np.exp(1j * math.pi)
values['q26KerrGap'] = float(np.max(np.abs(cphase - P.kerr(math.pi))))
w, v = np.linalg.eigh(np.array([[10 / 2, 1 / 2], [1 / 2, -10 / 2]], dtype=complex))
values['q26MixAngle0'] = P.bloch_polar(v[:, 1])
values['q26JcEigGap'] = max(float(np.max(np.abs(P.jc_levels(n, 10.0, 1.0) - np.array([-0.5 * math.sqrt(100 + (n + 1)), 0.5 * math.sqrt(100 + (n + 1))])))) for n in range(6))
chi = P.jc_chi(10.0, 1.0)
values['q26Chi'] = chi
values['q26ChiExact01'] = float(-(P.jc_shift(1, 10.0, 1.0) - P.jc_shift(0, 10.0, 1.0)))
values['q26ChiPhaseTime'] = math.pi / chi
for n in range(6):
    values[f'q26JcShift{n}'] = P.jc_shift(n, 10.0, 1.0)
    values[f'q26JcLine{n}'] = -chi * n
values['q26Overlap1'] = float(np.dot(P.coherent(1.0, 80), P.coherent(-1.0, 80)) ** 2)
values['q26Overlap2'] = float(np.dot(P.coherent(2.0, 90), P.coherent(-2.0, 90)) ** 2)
values['q26OverlapSeriesGap'] = abs(float(np.dot(P.coherent(1.0, 80), P.coherent(-1.0, 80)) ** 2) - math.exp(-4.0))
raw_even = P.coherent(2.0, 60) * (1 + (-1.0) ** np.arange(61))
values['q26CatEvenNorm'] = float(1 / np.linalg.norm(raw_even))
cat60 = P.cat(2.0, 1, 60)
values['q26CatOddP'] = float(np.sum(cat60[1::2] ** 2))
cat11 = P.cat(2.0, 1, 11)
coh11 = P.coherent(2.0, 11)
values['q26CatP0'] = float(cat11[0] ** 2)
values['q26CohP0'] = float(coh11[0] ** 2)
n60 = np.arange(61)
values['q26CatMean'] = float(np.sum(n60 * cat60**2))
values['q26CohMean'] = float(np.sum(n60 * P.coherent(2.0, 60) ** 2))
for n in range(12):
    values[f'q26CohPn{n}'] = float(coh11[n] ** 2)
    values[f'q26CatPn{n}'] = float(cat11[n] ** 2)

out = {
    'about': 'numpy twins for Q26.values.ts (pipeline/claims_qc709/q26.py; routes in pipeline/photon_numpy.py)',
    'values': {k: float(v) for k, v in values.items()},
}
path = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-qc709' / 'q26.json'
path.write_text(json.dumps(out, indent=2, sort_keys=True) + '\n', encoding='utf-8')
print(f'wrote {len(values)} keys to {path.name}')
