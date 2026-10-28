#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q24.values.ts (Physics 709, chapter Q24: controlling a real qubit).

Independent route (never Q24.values.ts's own helpers, never physics/qc/blocheq.ts or pulses.ts): pipeline/q24_numpy.py builds the Lindbladian as a Kronecker superoperator and takes scipy's
expm; solves Eqs. 12.4 by a complex linear system (and solve_ivp for the window averages); finds the driven qubit's periodic steady state without the rotating-wave step by DOP853 over one
period; reads Omega', the tilt and the field strength off eigenvalues and eigenvectors; finds a pi-pulse time as a simple root of cos(Omega t/2); builds composite pulses, Ramsey and echo
sequences from scipy's expm; integrates phase variances with scipy.integrate.quad (double) and the 1/e times with brentq. Keys that come from numerical integration or a search are ROUNDED
to the digits the text shows, as in the values file.

Units: hbar = 1; |g> = |0>, |e> = |1>; times in units of T1 where gamma = 1 (the gate budget in microseconds).

Usage (from the repo root): python3 pipeline/claims_qc709/q24.py -> app/src/physics/__fixtures__/claims-qc709/q24.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import sys
import warnings
from pathlib import Path

import numpy as np
from scipy.linalg import expm
from scipy.optimize import brentq

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import q24_numpy as Q  # noqa: E402

warnings.filterwarnings('ignore')
ROOT = Path(__file__).resolve().parent.parent.parent
values = {}
X, Y, Z, LG, R = Q.X, Q.Y, Q.Z, Q.LG, Q.R
H0 = np.zeros((2, 2), dtype=complex)
PLUS = Q.rho_of((1, 0, 0))
DECAY = [LG]
TPHI = [LG, np.sqrt(0.5) * Z]


def v(key, x):
    values[key] = float(x)


# ---- q24-divincenzo
criteria = [('scalable', 'computer'), ('initialise', 'computer'), ('coherence', 'computer'), ('gates', 'computer'), ('measure', 'computer'), ('convert', 'network'), ('transmit', 'network')]
platforms = ['neutral atoms', 'trapped ions', 'photons', 'superconducting circuits', 'quantum dots']
v('q24Criteria', len(criteria))
v('q24CritCompute', sum(1 for _, k in criteria if k == 'computer'))
v('q24CritNet', sum(1 for _, k in criteria if k == 'network'))
v('q24Platforms', len(platforms))
T2_S, GATE_S = 1e-3, 1e-6  # seconds
v('q24GatesPerT2', round(T2_S / GATE_S))
v('q24SurviveGate', np.exp(-GATE_S / T2_S))
v('q24SurviveAll', np.exp(-(T2_S / GATE_S) * GATE_S / T2_S))
v('q24GatesPerT2x2', round(T2_S / 2e-6))
v('q24Keep100', np.exp(-100 * GATE_S / T2_S))

# ---- q24-lindblad
v('q24KrausGapRatio', round(Q.kraus_gap(PLUS, H0, DECAY, 1e-3) / Q.kraus_gap(PLUS, H0, DECAY, 5e-4), 4))
v('q24TraceRate', abs(np.trace(Q.lind_rhs(PLUS, H0, DECAY))))
rho1 = Q.lind_solve(PLUS, H0, DECAY, 1.0)
assert np.abs(rho1 - Q.lind_solve_ode(PLUS, H0, DECAY, 1.0)).max() < 1e-9
v('q24ExcT1', rho1[1, 1].real)
v('q24CohT1', abs(rho1[0, 1]))
b1 = Q.bloch(rho1)
v('q24RT1x', b1[0])
v('q24RT1z', b1[2])
v('q24PurT1', np.trace(rho1 @ rho1).real)
rho2 = Q.lind_solve(PLUS, H0, DECAY, 2.0)
v('q24PopFactorT1', rho1[1, 1].real / PLUS[1, 1].real)
v('q24CohFactorT1', abs(rho1[0, 1]) / abs(PLUS[0, 1]))
v('q24CohFactor2T1', abs(rho2[0, 1]) / abs(PLUS[0, 1]))
t1_, t2_ = Q.decay_times(H0, DECAY)
v('q24T2OverT1', t2_ / t1_)
v('q24MinEig2', Q.positivity_min(1.0, 2.0)[0])
m3, at3 = Q.positivity_min(1.0, 3.0)
v('q24MinEig3', -m3)
v('q24MinEig3Sign', np.sign(m3))
v('q24MinEigAt', round(at3, 2))
t1p, t2p = Q.decay_times(H0, TPHI)
v('q24T2Tphi', t2p)
v('q24CohRate', 1.0 / t2p)
p_deph = (1 - np.exp(-0.5)) / 2
kraus_deph = (1 - p_deph) * PLUS + p_deph * Z @ PLUS @ Z
v('q24DephKrausGap', np.abs(Q.lind_solve(PLUS, H0, [np.sqrt(0.5) * Z], 0.5) - kraus_deph).max())
gam_d = 1 - np.exp(-0.5)
K0 = np.array([[1, 0], [0, np.sqrt(1 - gam_d)]], dtype=complex)
K1 = np.sqrt(gam_d) * LG
kraus_damp = K0 @ PLUS @ K0.conj().T + K1 @ PLUS @ K1.conj().T
v('q24DampKrausGap', np.abs(Q.lind_solve(PLUS, H0, DECAY, 0.5) - kraus_damp).max())
v('q24SWeak', 1.0 / 5.0)
v('q24LabDelta', 7.0 / 10.0)
v('q24ChT2', round(Q.decay_times(H0, [np.sqrt(0.2) * LG])[1], 9))
v('q24ChEe', rho2[1, 1].real)
v('q24ChTphi', Q.decay_times(H0, [np.sqrt(0.5) * LG, np.sqrt(1 / 6) * Z])[1])

# ---- q24-bloch-eq
Om, De, T1, T2 = 1.0, 0.7, 4.0, 8.0
gam, gphi = 1 / T1, 1 / T2 - 0.5 / T1
lab_Ls = [np.sqrt(gam) * LG, np.sqrt(gphi / 2) * Z]
lab_H = np.diag([-20.0, 20.0]).astype(complex) + (-Om * np.cos(40.7 * 0.37)) * X
v('q24Bloch3Trace', abs(np.trace(Q.lind_rhs(Q.rho_of((0.3, -0.4, 0.5)), lab_H, lab_Ls))))
w_rwa, rt_rwa = Q.bloch_steady(Om, De, T1, T2)
w_full, rt_full = Q.lab_steady(40.0, Om, De, T1, T2)
v('q24RwaRelErr', round(abs(w_full - w_rwa) / abs(w_rwa), 4))
for key, s in (('q24ReeRes1', 1.0), ('q24ReeRes100', 100.0), ('q24ReeRes3', 3.0)):
    w_s, _ = Q.bloch_steady(np.sqrt(s), 0.0, 1.0, 1.0)  # T1 = T2 = 1, so s = T1 T2 Omega^2
    v(key, (1 + w_s) / 2)
FIG = (2 * np.pi, 20 * np.pi, 2.5, 5.0)
v('q24FigT1', FIG[2])
v('q24InHalf', 1.0 / 2.0)
w_fig, rt_fig = Q.bloch_steady(*FIG)
sol = Q.bloch_ode(*FIG, 400.0)
assert abs(sol.y[0, -1] - w_fig) < 1e-9
v('q24WssFig', abs(w_fig))
v('q24WssFigSign', np.sign(w_fig))
x_fig = FIG[1] * FIG[3]
rt_form = -1j * w_fig * (FIG[0] * FIG[3] / 2) * (1 + 1j * x_fig) / (1 + x_fig**2)
x_lab = De * T2
rt_ours = -1j * w_rwa * (Om * T2 / 2) * (1 + 1j * x_lab) / (1 + x_lab**2)
rt_printed = -1j * w_rwa * (Om * T2 / 2) * (1 - 1j * x_lab) / (1 + x_lab**2)
v('q24RtSSgap', max(abs(rt_fig - rt_form), abs(rt_rwa - rt_ours)))
v('q24RtRe', abs(rt_rwa.real))
v('q24RtReSign', np.sign(rt_rwa.real))
v('q24RtPrintedRe', abs(rt_printed.real))
v('q24RtPrintedReSign', np.sign(rt_printed.real))
v('q24FullGapDerived', round(abs(rt_full - rt_ours), 5))
v('q24FullGapPrinted', round(abs(rt_full - rt_printed), 3))
# the lossless average of P_e over one period 2 pi / Omega' (numeric quadrature of the closed chance)
from scipy.integrate import quad  # noqa: E402

opr = np.sqrt(FIG[0] ** 2 + FIG[1] ** 2)
sch, _ = quad(lambda t: FIG[0] ** 2 / opr**2 * np.sin(opr * t / 2) ** 2, 0, 2 * np.pi / opr, epsabs=1e-16, epsrel=1e-13)
v('q24SchrAvg', sch / (2 * np.pi / opr))
v('q24ReeSS', (1 + w_fig) / 2)
v('q24SchrOverBloch', (sch / (2 * np.pi / opr)) / ((1 + w_fig) / 2))
v('q24ReeAvgEarly', round(Q.bloch_average_excited(*FIG, 0.0, 0.5), 5))
v('q24ReeAvgLate', round(Q.bloch_average_excited(*FIG, 30.0, 40.0), 6))


def fwhm(s):
    g = lambda x: 1 / (1 + x * x + s)
    return 2 * brentq(lambda x: g(x) - g(0) / 2, 0, 100, xtol=1e-15, rtol=4 * np.finfo(float).eps)


for key, s in (('q24FWHM0', 0.0), ('q24FWHM3', 3.0), ('q24FWHM8', 8.0)):
    v(key, fwhm(s))
v('q24FwhmGap', max(abs(fwhm(s) - 2 * np.sqrt(1 + s)) for s in (0.0, 3.0, 8.0)))


# ---- q24-rabi
def u_closed(O, D, t):
    """Eq. 12.7 as printed, coded here (not by the engine)."""
    Op = np.sqrt(abs(O) ** 2 + D**2)
    c_, s_ = np.cos(Op * t / 2), np.sin(Op * t / 2)
    return np.array([[np.exp(1j * D * t / 2) * (c_ - 1j * D / Op * s_), 1j * np.exp(1j * D * t / 2) * np.conj(O) / Op * s_],
                     [1j * np.exp(-1j * D * t / 2) * O / Op * s_, np.exp(-1j * D * t / 2) * (c_ + 1j * D / Op * s_)]])


cases = [(1.3 + 0j, 0.9, 2.1), (0.8 - 0.6j, 0.9, 2.1), (2 * np.pi + 0j, 4 * np.pi, 0.25)]
for (O, D, t) in cases:
    assert np.abs(Q.rabi_u_ode(O, D, t) - Q.rabi_u_frame(O, D, t)).max() < 1e-9
v('q24U127Gap', max(np.abs(u_closed(O, D, t) - Q.rabi_u_frame(O, D, t)).max() for (O, D, t) in cases))
v('q24TownsendGap', abs(Q.rabi_pe_town(2, 1, 3, 3.7) - abs(Q.rabi_u_frame(0.5, 1.0, 3.7)[1, 0]) ** 2))


def eig_op(O, D):
    K = 0.5j * np.array([[-D, np.conj(O)], [O, D]])
    return 2 * abs(np.linalg.eigvals(K)[0])  # the eigenvalues are +- i Omega'/2


def pi_time(O):
    return brentq(lambda t: Q.rabi_u_frame(O, 0.0, t)[0, 0].real, 0.5 * np.pi / abs(O), 1.5 * np.pi / abs(O), xtol=1e-15, rtol=4 * np.finfo(float).eps)


def ceiling(O, D):
    return abs(Q.rabi_u_frame(O, D, np.pi / eig_op(O, D))[1, 0]) ** 2


v('q24Tpi', pi_time(2 * np.pi + 0j))
v('q24PeOff', ceiling(2 * np.pi + 0j, 4 * np.pi))
v('q24OmPrimeOff', eig_op(2 * np.pi + 0j, 4 * np.pi))
v('q24PeQuarter', abs(Q.rabi_u_frame(2 * np.pi + 0j, 0.0, 0.25)[1, 0]) ** 2)
v('q24TQuarter', 1.0 / 4.0)
v('q24U2piGap', np.abs(Q.rabi_u_frame(1.0 + 0j, 0.0, 2 * np.pi) + np.eye(2)).max())
v('q24U4piGap', np.abs(Q.rabi_u_frame(1.0 + 0j, 0.0, 4 * np.pi) - np.eye(2)).max())
Uq = Q.rabi_u_frame(1.0 + 0j, 0.0, np.pi / 2)
v('q24SignRxPlus', np.abs(Uq - R(X, np.pi / 2)).max())
v('q24SignRxMinus', np.abs(Uq - R(X, -np.pi / 2)).max())
v('q24RyGap', np.abs(Q.rabi_u_frame(-1j, 0.0, np.pi / 2) - R(Y, np.pi / 2)).max())
v('q24RxNegGap', np.abs(Q.rabi_u_frame(-1.0 + 0j, 0.0, np.pi / 2) - R(X, np.pi / 2)).max())
v('q24CompExact', np.abs(Q.comp(0.0) - R(X, np.pi)).max())
v('q24InEps001', 1.0 / 100.0)
v('q24InEps01', 1.0 / 10.0)
v('q24ErrPlain01', Q.err_plain(0.01))
v('q24ErrComp01', Q.err_comp(0.01))
v('q24RatioEps01', round(Q.err_plain(0.01) / Q.err_comp(0.01), 3))
v('q24ErrPlain10', Q.err_plain(0.1))
v('q24ErrComp10', Q.err_comp(0.1))
v('q24ZfromYX', np.abs(1j * Y @ X - Z).max())
v('q24ZTime', 2 * pi_time(2 * np.pi + 0j))
v('q24TpiOm4', pi_time(4.0 + 0j))
v('q24CeilEq', ceiling(1.0 + 0j, 1.0))

# ---- q24-ramsey
for key, deg in (('q24RamseyP1Deg0', 0), ('q24RamseyP1Deg60', 60), ('q24RamseyP1Deg90', 90), ('q24RamseyP1Deg180', 180), ('q24RamseyP1Deg120', 120)):
    v(key, Q.ramsey_p1(np.radians(deg)))
v('q24RamseyGap', max(abs(Q.ramsey_p1(0.25 * k) - np.cos(0.125 * k) ** 2) for k in range(29)))


def field(Om_, de_):
    H = 0.5 * (Om_ * X + de_ * Z)
    w, vec = np.linalg.eigh(H)
    axis = Q.bloch(np.outer(vec[:, 1], vec[:, 1].conj()))  # the eigenstate of the larger eigenvalue points along B
    return float(np.degrees(np.arctan2(axis[2], axis[0]))), float(w[1] - w[0])


v('q24InDelta08', 4.0 / 5.0)
v('q24TiltDeg', field(1.0, 0.8)[0])
v('q24OmPrimeNoise', field(1.0, 0.8)[1])
B_, M0_ = np.array([1.0, 0.0, 0.8]), np.array([0.3, -0.5, 0.6])
assert np.abs(Q.precess_ode(B_, M0_, 1.7) - Q.precess_density(B_, M0_, 1.7)).max() < 1e-9


def rodrigues(Bv, M, t):
    nB = np.linalg.norm(Bv)
    n = Bv / nB
    th = nB * t
    return M * np.cos(th) + np.cross(n, M) * np.sin(th) + n * np.dot(n, M) * (1 - np.cos(th))


v('q24PrecessGap', np.abs(rodrigues(B_, M0_, 1.7) - Q.precess_density(B_, M0_, 1.7)).max())
v('q24GaussGap', abs(Q.gauss_coherence(1.0) - np.exp(-0.5)))
v('q24InTauFast', 1.0 / 10.0)
v('q24Gauss1', Q.gauss_coherence(1.0))
v('q24Gauss2', Q.gauss_coherence(2.0))
v('q24GaussE', Q.gauss_coherence(np.sqrt(2.0)))
v('q24Gauss15', Q.gauss_coherence(1.5))
v('q24T2starFast', Q.t2star(1.0, 0.1))
v('q24T2starSlow', Q.t2star(1.0, 10.0))
v('q24T2starStatic', np.sqrt(2.0) / 1.0)
v('q24T2starWhite', 1.0 / (1.0**2 * 0.1))
v('q24OuVarGap', abs(Q.ou_var_closed(1.7, 1.0, 0.8) - Q.ou_var_quad(1.7, 1.0, 0.8)))
v('q24T2starMid', Q.t2star(1.0, 1.0))
v('q24TiltDeg2', field(2.0, 1.5)[0])

# ---- q24-decoupling
v('q24EchoGap', max(np.abs(Q.echo_unitary(float(d), 1.3) + np.eye(2)).max() for d in range(11)))
v('q24EchoCoh10', np.exp(-Q.echo_var_quad(1.0, 1.0, 10.0) / 2))
v('q24RamseyCoh10', np.exp(-Q.ou_var_quad(2.0, 1.0, 10.0) / 2))
v('q24EchoCoh01', np.exp(-Q.echo_var_quad(1.0, 1.0, 0.1) / 2))
v('q24RamseyCoh01', np.exp(-Q.ou_var_quad(2.0, 1.0, 0.1) / 2))
v('q24EchoVarGap', abs(Q.echo_var_closed(1.0, 1.0, 3.0) - Q.echo_var_quad(1.0, 1.0, 3.0)))


def train_angle(eps, N):
    U = np.eye(2, dtype=complex)
    for _ in range(2 * N):
        U = R(X, np.pi * (1 + eps)) @ U
    return float(np.degrees(2 * np.arctan2(abs(U[1, 0]), abs(U[0, 0]))))


v('q24AccumDeg', round(train_angle(0.01, 10), 9))
v('q24AccumGap', round(abs(360 * 10 * 0.01 - train_angle(0.01, 10)), 9))
v('q24PlainPulses', Q.pulse_train_p0(0.01, 10, False))
v('q24AltPulses', Q.pulse_train_p0(0.01, 10, True))
v('q24Accum27', round(train_angle(0.005, 15), 9))
v('q24EchoCohTau2', np.exp(-Q.echo_var_quad(2.0, 1.0, 10.0) / 2))
v('q24RamseyCohTau2', np.exp(-Q.ou_var_quad(4.0, 1.0, 10.0) / 2))

out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-qc709' / 'q24.json'
out.write_text(json.dumps({'about': 'numpy/scipy twins of every V key of Q24.values.ts (pipeline/claims_qc709/q24.py)', 'values': values}, indent=2, sort_keys=True) + '\n')
print('wrote', len(values), 'keys')
