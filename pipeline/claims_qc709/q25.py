#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q25.values.ts (Physics 709, chapter Q25: neutral atoms and trapped ions).

Independent route (never Q25.values.ts's own helpers, never physics/qc/atoms.ts or iontrap.ts, never physics/optics/cooling.ts): pipeline/q25_numpy.py takes the atoms of Table 13.1 as plain
constants; the loading and the readout from scipy.stats (Poisson, binomial) and scipy.special.gammaincc; the 1/e times by brentq; the Raman pi time from an eigen-evolution with the
bright-dark phase unwrapped, and its loss and the Rydberg gate from scipy expm (a Hermitian eigenproblem for the lossless gate); the Mathieu monodromy by solve_ivp (DOP853) with brentq
for its edge; the two-ion modes from an ANALYTIC Hessian; light kicks, sidebands and Cirac-Zoller from dense expm of a truncated oscillator; Molmer-Sorensen by DOP853 over the force
Hamiltonian; the GHZ scan from expm of S^2. Keys that come from a numerical integration, a root search or a finite difference are ROUNDED to the digits the text shows, as in the values file.

Units: hbar = 1 in the gate matrices, SI where the text shows a unit (microkelvin, mm/s, millions per second, MHz, nm, micrometres, ms).

Usage (from the repo root): python3 pipeline/claims_qc709/q25.py -> app/src/physics/__fixtures__/claims-qc709/q25.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import sys
import warnings
from pathlib import Path

import numpy as np
from scipy.stats import binom, poisson

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import q25_numpy as Q  # noqa: E402

warnings.filterwarnings('ignore')
ROOT = Path(__file__).resolve().parent.parent.parent
values = {}
MHZ = 2 * np.pi * 1e6


def v(key, x):
    values[key] = float(x)


def r(x, places):
    x = abs(float(x))
    return 0.0 if x < 0.5 * 10 ** -places else float(f'{x:.{places}f}')


def sublevels(I, J):
    n, F = 0.0, abs(I - J)
    while F <= I + J + 1e-9:
        n += 2 * F + 1
        F += 1
    return round(n)


# ---- q25-cooling
v('q25ZeemanCs', sublevels(3.5, 0.5))
v('q25NuclearSr', sublevels(4.5, 0))
v('q25nbarCs300', Q.nbar(9_192_631_770, 300.0))
nu698 = Q.C0 / 698e-9
v('q25OptExponent', Q.H * nu698 / (Q.KB * 300.0))
v('q25FreqRatio', nu698 / 9_192_631_770)
v('q25vRecRb', Q.v_rec('Rb') * 1e3)
v('q25vCs300', np.sqrt(3 * Q.KB * 300.0 / Q.col('Cs')[2]))
v('q25vCs10mK', np.sqrt(3 * Q.KB * 0.01 / Q.col('Cs')[2]))
speed, photons, tstop, dstop = Q.stop_numbers('Rb', 300.0)
v('q25vRb300', speed)
v('q25rmaxRb', Q.col('Rb')[1] / 2 / 1e6)
v('q25GammaRb', Q.col('Rb')[1] / MHZ)
v('q25aRb', r(Q.v_rec('Rb') * Q.col('Rb')[1] / 2, 2))
v('q25aOverG', r(Q.accel_over_g('Rb'), 2))
v('q25NstopRb', r(photons, 3))
v('q25tstopRb', tstop * 1e3)
v('q25DstopRb', dstop)
v('q25HeatPerPhoton', Q.t_recoil('Rb') / 3 * 1e6)
v('q25Heat100', 100 * Q.t_recoil('Rb') / 3 * 1e6)
for key, name in (('Rb', 'Rb'), ('Cs', 'Cs'), ('Sr461', 'Sr461'), ('Sr689', 'Sr689')):
    v('q25TD' + key, Q.t_doppler(name) * 1e6)
    v('q25Tr' + key, Q.t_recoil(name) * 1e6)
v('q25TDPrintedRb', 146)
v('q25TDPrintedCs', 125)
v('q25TDPrintedSr461', 720)
v('q25TDPrinted', 1.02)
v('q25ScatPerDepth', (1 / 100) / (1 / 10))
v('q25PodMu1', Q.parity_load(1.0))
v('q25Sites100', Q.sites_for(100, 0.99))
v('q25P100of200', binom.sf(99, 200, 0.5))
v('q25P100of235', binom.sf(99, 235, 0.5))
v('q25cSpeed', speed - 20000 * Q.v_rec('Rb'))
v('q25cHeat', 200 * Q.t_recoil('Rb') / 3 * 1e6)
v('q25cOdd', Q.parity_load(2.0))

# ---- q25-readout
v('q25MeanDark', 0.2)
v('q25MeanBright', 8.0 + 0.2)
v('q25PDark0', poisson.pmf(0, 0.2))
v('q25PBright8', poisson.pmf(8, 8.2))
conv = np.convolve(poisson.pmf(np.arange(41), 8.0), poisson.pmf(np.arange(41), 0.2))[:41]
v('q25ConvGap', r(np.abs(conv - poisson.pmf(np.arange(41), 8.2)).max(), 9))
v('q25GammaIdGap', r(max(Q.gamma_gap(3, 0.2), Q.gamma_gap(3, 8.2)), 6))
nc, err = Q.best_cut(0.2, 8.2)
v('q25ncOpt', nc)
v('q25ErrOpt', err)
v('q25ErrNc1', Q.read_err(1, 0.2, 8.2))
v('q25ErrNc5', Q.read_err(5, 0.2, 8.2))
v('q25ErrDark', Q.read_err(3, 0.2, 8.2, 1, 0))
v('q25ErrBright', Q.read_err(3, 0.2, 8.2, 0, 1))
v('q25ScaleFor1e3', Q.scale_for(1e-3, 0.2, 8.2)[0])
ETA = 2.5e-4
OM = [2 * np.pi * 50e3, 2 * np.pi * 50e3, 2 * np.pi * 10e3]
v('q25EtaLS', ETA)
v('q25T2starCoeff', 2 * np.sqrt(np.exp(2 / 3) - 1))
v('q25T2starOverT0', np.sqrt(np.exp(2 / 3) - 1))
v('q25T2star10uK', Q.t2star_semi(1e-5, ETA) * 1e3)
v('q25T2star1uK', Q.t2star_semi(1e-6, ETA) * 1e3)
v('q25T2starQ10uK', Q.t2star_quant(1e-5, ETA, OM) * 1e3)
v('q25T2starQ1uK', Q.t2star_quant(1e-6, ETA, OM))
v('q25SemiAtT2star', Q.semi_env(Q.t2star_semi(1e-5, ETA), 1e-5, ETA))
v('q25TwoThirdsArg', 2 / 3)
v('q25OneThirdArg', 1 / 3)
v('q25QuantRatio1uK', Q.t2star_quant(1e-6, ETA, OM) / Q.t2star_semi(1e-6, ETA))
v('q25rP0', poisson.pmf(0, 0.5))
v('q25rSum', 6.0 + 0.3)
v('q25rErr', Q.read_err(2, 0.2, 8.2))

# ---- q25-atom-gates
gx, gy = Q.sandwich_gaps(0.7)
v('q25InTheta', 0.7)
v('q25RBexp', 11 / 6)
v('q25IdRxGap', r(gx, 9))
v('q25IdRyGap', r(gy, 9))
l50, t50 = Q.raman_loss(50.0, 1.0)
l200, _ = Q.raman_loss(200.0, 1.0)
v('q25RamanLoss50', r(l50, 5))
v('q25RamanLoss200', r(l200, 5))
v('q25RamanHalfPi50', (np.pi / 2) * 1.0 / 50)
v('q25RamanTpiRatio50', r(t50 / (2 * np.pi * 50), 4))
v('q25VdwExp', 2 * (2 * 2) + 3)
v('q25RydScale2n', 2.0 ** 11)
v('q25RBscale2n', 2.0 ** (11 / 6))
v('q25RydIdealGap', r(np.abs(Q.ryd_block(1.0, 1e9, 0.0) - Q.IDEAL).max(), 6))
CZ = np.diag([1, 1, 1, -1]).astype(complex)
v('q25ZZCZgap', r(np.abs(np.kron(Q.Z, Q.Z) @ CZ - Q.IDEAL).max(), 6))
v('q25RydErr100', r(Q.ryd_err(Q.ryd_block(1.0, 100.0, 0.0)), 9))
best = [Q.ryd_best(g) for g in (1e-4, 1e-5, 1e-6)]
for i, k in enumerate(('4', '5', '6')):
    v('q25RydErrOpt' + k, best[i][1])
    v('q25RydOptOm' + k, best[i][0])
taus = [1e4, 1e5, 1e6]
v('q25RydSlopeErr', r(-Q.log_slope(taus, [b[1] for b in best]), 6))
v('q25RydSlopeOm', r(-Q.log_slope(taus, [b[0] for b in best]), 6))
v('q25TwoThirds', 2.0 ** (-2 / 3))
v('q25TenfoldFactor', 10.0 ** (-2 / 3))
v('q25WCouple4', Q.w_coupling(4))
v('q25WCouple100', Q.w_coupling(100))
v('q25W3Amp', 1 / np.sqrt(3))
v('q25aRaman', (np.pi / 2) * 1.0 / 100)

# ---- q25-ion-trap
tn = Q.trap_numbers()
v('q25EarnshawSum', r(2 + 2 - 4, 6))
edge = Q.mathieu_edge()
v('q25StabEdge', r(edge, 4))
v('q25qz', r(tn['q'], 4))
v('q25RfMin', r(10.0 * np.sqrt(tn['q'] / edge), 4))
v('q25wz', tn['wz'] / MHZ)
v('q25wzx', tn['wxy'] / MHZ)
v('q25UzetaCoef', tn['ucoef'] / 1e10)
zloc = np.sqrt(Q.KB * 1e-5 / (Q.BE['m'] * tn['wz'] ** 2))
v('q25Zloc', zloc * 1e9)
v('q25zeta', tn['q'] / 2 * zloc * 1e9)
v('q25Depth', tn['depth'])
beta = Q.mathieu_beta(tn['q'])
sec = beta * Q.BE['wrf'] / 2
v('q25BetaExact', r(beta, 4))
v('q25BetaApprox', r(tn['q'] / np.sqrt(2), 4))
v('q25SecExact', r(sec / MHZ, 4))
v('q25SecDiff', r(sec / tn['wz'] - 1, 4))
Zeq, wcom, wstr, ratio = Q.two_ion(Q.BE['m'], tn['wz'])
v('q25Zeq', Zeq * 1e6)
v('q25TwoIonMin', 0.25 + 0.5)
v('q25ModeRatio', r(ratio, 4))
v('q25Stretch', r(wstr / MHZ, 4))
tn15 = Q.trap_numbers(dict(Q.BE, wrf=2 * np.pi * 15e6))
v('q25tq', tn15['q'])
v('q25twz', tn15['wz'] / MHZ)

# ---- q25-phonons
v('q25RedFromG0', r(Q.sideband_pulse_prob('red'), 9))
v('q25BlueFromE0', r(Q.sideband_pulse_prob('blue'), 9))
z0, eta0 = Q.lamb_dicke(313e-9, Q.BE['m'], tn['wz'])
v('q25z0', z0 * 1e9)
v('q25eta0', eta0)
v('q25eta2', (Q.HB * (2 * np.pi / 313e-9) ** 2) / (2 * Q.BE['m'] * tn['wz']))
v('q25BCHgap', r(Q.bch_gap(0.3), 9))
v('q25KickKeep', abs(Q.kick(eta0, 24)[0, 0]))
K1 = Q.kick(0.1, 80)
v('q25BlueExact0', abs(K1[1, 0]))
v('q25BlueExact5', abs(K1[6, 5]))
v('q25BlueExact10', abs(K1[11, 10]))
v('q25BlueFirst5', 0.1 * np.sqrt(6))
v('q25BlueFirst10', 0.1 * np.sqrt(11))
v('q25Carrier0', abs(K1[0, 0]))
v('q25CoolT10', Q.cool_time(10))
v('q25CoolNaive10', 10 * np.pi)
etaMicro = Q.lamb_dicke(Q.C0 / 9_192_631_770, Q.BE['m'], tn['wz'])[1]
v('q25etaMicro', etaMicro * 1e6)
v('q25MicroSlow', r(1 / etaMicro, 2))
v('q25MicroLambda', Q.C0 / 9_192_631_770 * 100)
v('q25ClockGHz', 9_192_631_770 / 1e9)
v('q25pEta2', 0.2 ** 2)
v('q25pBlue', 0.1 * np.sqrt(8 + 1))

# ---- q25-ion-gates
for n0 in (0, 1, 2):
    b, vac = Q.cz_bell(8, n0)
    v('q25CZbell%d' % n0, r(b, 6))
    if n0 == 0:
        v('q25CZphonon0', r(vac, 6))
tg = 2 * np.pi * 25 / 1.0
v('q25MSetaOmega', 0.1)
v('q25MSetaOmega2', 0.12)
v('q25MSOmTilde', 0.1 ** 2 / 1.0)
for n0 in (0, 1, 2, 4):
    v('q25MSBell%d' % n0, r(Q.ms_bell(n0, 0.1, 1.0, 2, 14, tg), 6))
v('q25MSloopsK', (1.0 / 0.1) ** 2 / 4)
v('q25MSGateTime', tg)
v('q25MSloops1736', (np.pi / 2 / (0.12 ** 2 / 1.0)) / (2 * np.pi))
v('q25MSInfid1736', r(1 - Q.ms_bell(0, 0.12, 1.0, 2, 14, np.pi / 2 / (0.12 ** 2 / 1.0)), 6))
v('q25MSInfidK17', r(1 - Q.ms_bell(0, 0.12, 1.0, 2, 14, 2 * np.pi * 17 / 1.0), 7))
g2, g3, g4 = Q.ghz_scan(2), Q.ghz_scan(3), Q.ghz_scan(4)
v('q25GHZfid2', r(g2[0], 6))
v('q25GHZfid3', r(g3[0], 6))
v('q25GHZfid4', r(g4[0], 6))
v('q25GHZtheta', r(g2[1], 4))
v('q25gOmt', 0.2 ** 2 / 2.0)
v('q25gLoops', (1.0 / 0.05) ** 2 / 4)

out = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-qc709' / 'q25.json'
out.write_text(json.dumps({'about': 'numpy/scipy twins of every V key of Q25.values.ts (pipeline/claims_qc709/q25.py)', 'values': values}, indent=2, sort_keys=True) + '\n')
print('wrote', len(values), 'keys')
