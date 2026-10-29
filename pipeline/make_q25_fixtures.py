#!/usr/bin/env python3
"""Reference tables for the Chapter Q25 engine (app/src/physics/qc/atoms.ts and iontrap.ts), by the INDEPENDENT routes of pipeline/q25_numpy.py.

Writes app/src/physics/__fixtures__/qc-q25.json, read by atoms.test.ts and iontrap.test.ts: Table 13.1 recomputed, the stopping row, thermal photons, loading, the readout errors and the
incomplete-gamma identity, the 1/e times of the thermal envelopes, the Raman pi time and loss, the Rydberg gate (ideal, leaky, best Omega), the W coupling, the Mathieu monodromy and its edge,
the trap numbers, the two-ion modes, the Lamb-Dicke numbers, the oscillator kicks, the Cirac-Zoller sequence, the Molmer-Sorensen force model and the GHZ scan. Complex numbers are
[re, im]; floats are rounded to 15 significant digits. Deterministic (no randomness).

Usage (from the repo root): python3 pipeline/make_q25_fixtures.py
"""
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import q25_numpy as Q  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def rounded(x):
    if isinstance(x, (float, np.floating)):
        return float(f"{float(x):.15g}")
    if isinstance(x, dict):
        return {str(k): rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def cm(m):
    return [[[float(np.real(z)), float(np.imag(z))] for z in row] for row in np.asarray(m)]


OMEGAS = [2 * np.pi * 50e3, 2 * np.pi * 50e3, 2 * np.pi * 10e3]


def build():
    out = {'about': 'numpy/scipy reference tables for physics/qc/atoms.ts and iontrap.ts (pipeline/q25_numpy.py)'}
    out['table'] = {k: {'vRec': Q.v_rec(k), 'TD': Q.t_doppler(k), 'Tr': Q.t_recoil(k), 'accelOverG': Q.accel_over_g(k)} for k in Q.COLS}
    v, N, t, L = Q.stop_numbers('Rb', 300.0)
    out['stopRb300'] = {'speed': v, 'photons': N, 'time': t, 'length': L}
    out['thermalSpeed'] = [{'name': 'Cs', 'T': T, 'v': float(np.sqrt(3 * Q.KB * T / Q.col('Cs')[2]))} for T in (300.0, 0.01)]
    out['photons'] = {'nbarCs300': Q.nbar(9.192631770e9, 300.0), 'exp698': Q.H * (Q.C0 / 698e-9) / (Q.KB * 300.0), 'nu698': Q.C0 / 698e-9}
    out['parity'] = [{'mu': mu, 'closed': Q.parity_load(mu), 'series': Q.parity_load_series(mu)} for mu in (0.5, 1.0, 2.0)]
    out['binomial'] = {'tail200': float(Q.binom.sf(99, 200, 0.5)), 'tail224': float(Q.binom.sf(99, 224, 0.5)), 'sites100': Q.sites_for(100, 0.99)}
    out['poisson'] = [{'n': n, 'mean': m, 'pmf': float(Q.poisson.pmf(n, m)), 'cdf': float(Q.poisson.cdf(n, m)), 'sf': float(Q.poisson.sf(n, m))} for n, m in ((0, 0.2), (8, 8.2), (3, 8.2), (2, 0.2))]
    out['readout'] = [{'nc': nc, 'err': Q.read_err(nc, 0.2, 8.2)} for nc in range(1, 11)]
    nc, e = Q.best_cut(0.2, 8.2)
    out['readoutBest'] = {'nc': nc, 'err': e, 'dark': Q.read_err(nc, 0.2, 8.2, 1, 0), 'bright': Q.read_err(nc, 0.2, 8.2, 0, 1)}
    ts, ncs = Q.scale_for(1e-3, 0.2, 8.2)
    out['scaleFor'] = {'scale': ts, 'nc': ncs}
    out['gammaId'] = [{'nc': n, 'mean': m, 'gap': Q.gamma_gap(n, m)} for n, m in ((3, 2.2), (3, 8.4), (5, 0.7))]
    out['t2star'] = [{'T': T, 'eta': 2.5e-4, 'semi': Q.t2star_semi(T, 2.5e-4), 'quantum': Q.t2star_quant(T, 2.5e-4, OMEGAS), 'T0': Q.t0_thermal(T, 2.5e-4)} for T in (1e-6, 2e-6, 5e-6, 1e-5)]
    out['t2starCoeff'] = 2 * float(np.sqrt(np.exp(2 / 3) - 1))
    out['sandwich'] = [{'theta': th, 'gx': Q.sandwich_gaps(th)[0], 'gy': Q.sandwich_gaps(th)[1]} for th in (0.7, 1.9)]
    out['raman'] = []
    for Dl in (30.0, 50.0, 100.0, 200.0):
        loss, tp = Q.raman_loss(Dl, 1.0)
        out['raman'].append({'Delta': Dl, 'gamma': 1.0, 'loss': loss, 'time': tp, 'timeOver': tp / (2 * np.pi * Dl)})
    out['rydIdeal'] = float(np.abs(Q.ryd_block(1.0, 1e9, 0.0) - Q.IDEAL).max())
    m1 = Q.ryd_block(1.0, 100.0, 0.0)
    m2 = Q.ryd_block(0.05, 1.0, 1e-4)
    out['rydBlock'] = [
        {'Omega': 1.0, 'B': 100.0, 'gamma': 0.0, 'M': cm(m1), 'err': Q.ryd_err(m1)},
        {'Omega': 0.05, 'B': 1.0, 'gamma': 1e-4, 'M': cm(m2), 'err': Q.ryd_err(m2)},
    ]
    best = []
    for g in (1e-4, 1e-5, 1e-6):
        om, er = Q.ryd_best(g)
        best.append({'gamma': g, 'omega': om, 'error': er})
    out['rydBest'] = best
    out['rydSlopes'] = {'error': Q.log_slope([b['gamma'] for b in best], [b['error'] for b in best]), 'omega': Q.log_slope([b['gamma'] for b in best], [b['omega'] for b in best])}
    out['wCoupling'] = [{'N': n, 'value': Q.w_coupling(n)} for n in (4, 8, 24, 100)]
    out['mathieu'] = [{'q': q, 'trace': Q.mono_trace(q), 'beta': Q.mathieu_beta(q)} for q in (0.1, 0.3, 0.5, 0.5411, 0.8, 0.9)]
    out['mathieuEdge'] = Q.mathieu_edge()
    tn = Q.trap_numbers()
    out['trap'] = {k: float(v) for k, v in tn.items()}
    Z, w0, w1, ratio = Q.two_ion(Q.BE['m'], tn['wz'])
    out['twoIon'] = {'Zeq': Z, 'com': w0, 'stretch': w1, 'ratio': ratio, 'omegaZ': tn['wz']}
    z0, eta = Q.lamb_dicke(313e-9, Q.BE['m'], tn['wz'])
    out['lambDicke'] = {'z0': z0, 'eta': eta, 'etaMicro': Q.lamb_dicke(Q.C0 / 9.19263177e9, Q.BE['m'], tn['wz'])[1]}
    K1 = Q.kick(0.1, 80)
    out['sideband'] = [{'eta': 0.1, 'n': n, 'blue': float(abs(K1[n + 1, n])), 'carrier': float(abs(K1[n, n]))} for n in (0, 5, 10)]
    K3 = Q.kick(0.343, 24)
    out['recoil'] = {'eta': 0.343, 'amps': cm(K3[:4, 0:1])}
    out['bch'] = [{'eta': 0.3, 'gap': Q.bch_gap(0.3)}]
    out['coolTime'] = [{'n': n, 'value': Q.cool_time(n)} for n in (1, 10)]
    out['czPulse'] = {'red': Q.sideband_pulse_prob('red'), 'blue': Q.sideband_pulse_prob('blue')}
    out['czBell'] = []
    for nm, n0 in ((1, 0), (6, 0), (8, 0), (8, 1), (8, 2), (8, 3)):
        b, vac = Q.cz_bell(nm, n0)
        out['czBell'].append({'nmax': nm, 'n0': n0, 'bell': b, 'vacuum': vac})
    out['ms'] = []
    for n0, eo, dl, N, nm, K in ((0, 0.1, 1.0, 2, 14, 25), (1, 0.1, 1.0, 2, 14, 25), (4, 0.1, 1.0, 2, 14, 25), (0, 0.12, 1.0, 2, 14, 17)):
        t = 2 * np.pi * K / dl
        out['ms'].append({'n0': n0, 'etaOmega': eo, 'delta': dl, 'N': N, 'nmax': nm, 't': t, 'bell': Q.ms_bell(n0, eo, dl, N, nm, t)})
    tb = float(np.pi / 2 / (0.12 ** 2))
    out['ms'].append({'n0': 0, 'etaOmega': 0.12, 'delta': 1.0, 'N': 2, 'nmax': 14, 't': tb, 'bell': Q.ms_bell(0, 0.12, 1.0, 2, 14, tb)})
    out['ms'].append({'n0': 0, 'etaOmega': 0.1, 'delta': 1.0, 'N': 3, 'nmax': 14, 't': 2 * np.pi * 25, 'bell': Q.ms_bell(0, 0.1, 1.0, 3, 14, 2 * np.pi * 25)})
    gs = [Q.ghz_scan(n) for n in (2, 3, 4)]
    out['ghz'] = [{'N': n, 'fidelity': g[0], 'theta': g[1]} for n, g in zip((2, 3, 4), gs)]
    return rounded(out)


if __name__ == '__main__':
    target = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'qc-q25.json'
    target.write_text(json.dumps(build(), indent=1, sort_keys=True) + '\n')
    print('wrote', target.relative_to(ROOT))
