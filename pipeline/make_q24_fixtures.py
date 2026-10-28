#!/usr/bin/env python3
"""Reference tables for the Chapter Q24 engine (app/src/physics/qc/blocheq.ts and pulses.ts), by an INDEPENDENT route (pipeline/q24_numpy.py).

Writes app/src/physics/__fixtures__/qc-q24.json, read by blocheq.test.ts and pulses.test.ts: Lindblad solutions and Kraus steps, T1/T2 from the superoperator, the positivity bound
on T2, Eqs. 12.4 (steady states, solutions, window averages), the lab-frame periodic steady state without the rotating-wave step, Eq. 12.7 (real and complex Omega), composite pulse
errors, Ramsey chances, precession, Gaussian and Ornstein-Uhlenbeck phase averages, the 1/e times, echo variances and pulse trains. Complex numbers are [re, im]; floats are rounded
to 15 significant digits. Deterministic (no randomness).

Usage (from the repo root): python3 pipeline/make_q24_fixtures.py
"""
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import q24_numpy as Q  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def rounded(x):
    if isinstance(x, float):
        return float(f"{x:.15g}")
    if isinstance(x, dict):
        return {str(k): rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def cm(m):
    return [[[float(np.real(z)), float(np.imag(z))] for z in row] for row in np.asarray(m)]


def build():
    out = {'about': 'numpy/scipy reference tables for physics/qc/blocheq.ts and pulses.ts (pipeline/q24_numpy.py)'}
    # ---- Lindblad
    cases = []
    for (r0, gamma, gphi, hx, hz, t) in [((1, 0, 0), 1.0, 0.0, 0.0, 0.0, 1.0), ((1, 0, 0), 1.0, 1.0, 0.0, 0.0, 0.5), ((0.3, -0.4, 0.5), 0.7, 0.4, 0.6, 0.35, 0.9), ((0, 0, -1), 1.0, 0.0, 0.0, 0.0, 2.0)]:
        H = hx * Q.X + hz * Q.Z
        Ls = [np.sqrt(gamma) * Q.LG] + ([np.sqrt(gphi / 2) * Q.Z] if gphi else [])
        rho0 = Q.rho_of(r0)
        sol = Q.lind_solve(rho0, H, Ls, t)
        assert np.abs(sol - Q.lind_solve_ode(rho0, H, Ls, t)).max() < 1e-9
        cases.append({'r0': list(r0), 'gamma': gamma, 'gphi': gphi, 'hx': hx, 'hz': hz, 't': t, 'rho': cm(sol), 'rhs': cm(Q.lind_rhs(rho0, H, Ls))})
    out['lindblad'] = cases
    kr = []
    for dt in (1e-3, 5e-4):
        rho0 = Q.rho_of((1, 0, 0))
        kr.append({'dt': dt, 'gap': Q.kraus_gap(rho0, np.zeros((2, 2), complex), [Q.LG], dt)})
    out['kraus'] = kr
    out['decayTimes'] = [
        {'gamma': 1.0, 'gphi': 0.0, 'T1': Q.decay_times(np.zeros((2, 2), complex), [Q.LG])[0], 'T2': Q.decay_times(np.zeros((2, 2), complex), [Q.LG])[1]},
        {'gamma': 1.0, 'gphi': 1.0, 'T1': Q.decay_times(np.zeros((2, 2), complex), [Q.LG, np.sqrt(0.5) * Q.Z])[0], 'T2': Q.decay_times(np.zeros((2, 2), complex), [Q.LG, np.sqrt(0.5) * Q.Z])[1]},
    ]
    out['positivity'] = [{'T1': 1.0, 'T2': t2, 'min': Q.positivity_min(1.0, t2)[0], 'at': Q.positivity_min(1.0, t2)[1]} for t2 in (2.0, 3.0, 2.5)]
    # ---- Bloch equations
    bs = []
    for (Om, De, T1, T2) in [(2 * np.pi, 20 * np.pi, 2.5, 5.0), (1.0, 0.7, 4.0, 8.0), (0.4, 0.0, 3.0, 3.0), (3.0, -1.2, 2.0, 1.5)]:
        w, rt = Q.bloch_steady(Om, De, T1, T2)
        s = Q.bloch_ode(Om, De, T1, T2, 400.0)
        assert abs(s.y[0, -1] - w) < 1e-9 and abs(s.y[1, -1] + 1j * s.y[2, -1] - rt) < 1e-9
        s1 = Q.bloch_ode(Om, De, T1, T2, 1.3)
        bs.append({'Omega': Om, 'Delta': De, 'T1': T1, 'T2': T2, 'w': w, 'rho': [rt.real, rt.imag], 'at1p3': [float(v) for v in s1.y[:, -1]]})
    out['blochSteady'] = bs
    avg = []
    for (t0, t1) in [(0.0, 0.5), (30.0, 40.0), (0.0, 3.0)]:
        avg.append({'Omega': 2 * np.pi, 'Delta': 20 * np.pi, 'T1': 2.5, 'T2': 5.0, 't0': t0, 't1': t1, 'value': Q.bloch_average_excited(2 * np.pi, 20 * np.pi, 2.5, 5.0, t0, t1)})
    out['blochAverage'] = avg
    w, rt = Q.lab_steady(40.0, 1.0, 0.7, 4.0, 8.0)
    out['labSteady'] = {'omegaQ': 40.0, 'Omega': 1.0, 'Delta': 0.7, 'T1': 4.0, 'T2': 8.0, 'w': w, 'rho': [rt.real, rt.imag]}
    # ---- Rabi
    rb = []
    for (Om, De, t) in [(1.3 + 0j, 0.9, 2.1), (0.8 - 0.6j, 0.9, 2.1), (2 * np.pi + 0j, 4 * np.pi, 0.25), (1.0 + 0j, 0.0, np.pi / 2), (-1j, 0.0, np.pi / 2)]:
        U = Q.rabi_u_ode(Om, De, t)
        assert np.abs(U - Q.rabi_u_frame(Om, De, t)).max() < 1e-9
        rb.append({'Omega': [Om.real, Om.imag], 'Delta': De, 't': t, 'U': cm(U)})
    out['rabi'] = rb
    out['pulseErr'] = [{'eps': e, 'mode': m, 'plain': Q.err_plain(e, m), 'comp': Q.err_comp(e, m)} for (e, m) in [(0.01, 'scale'), (0.1, 'scale'), (0.01, 'add'), (0.001, 'scale'), (0.3, 'scale')]]
    out['ramsey'] = [{'phi': p, 'p1': Q.ramsey_p1(p)} for p in (0.0, 1.0, np.pi / 3, np.pi / 2, 2.5, np.pi, 6.0)]
    pr = []
    for (B, M0, t) in [((1.0, 0.0, 0.8), (0.3, -0.5, 0.6), 1.7), ((0.2, -0.9, 1.4), (0.0, 0.0, 1.0), 2.3)]:
        a = Q.precess_ode(np.array(B), np.array(M0), t)
        b = Q.precess_density(B, M0, t)
        assert np.abs(a - b).max() < 1e-9
        pr.append({'B': list(B), 'M0': list(M0), 't': t, 'M': [float(v) for v in b]})
    out['precess'] = pr
    # ---- noise
    out['gauss'] = [{'sigma': s, 'value': Q.gauss_coherence(s)} for s in (0.5, 1.0, 1.5, 2.0, float(np.sqrt(2)))]
    ou = []
    for (t, s, tc) in [(1.7, 1.0, 0.8), (1.0, 1.0, 10.0), (1.0, 1.0, 0.1), (2.0, 1.0, 10.0), (4.0, 1.0, 10.0)]:
        v = Q.ou_var_closed(t, s, tc)
        assert abs(v - Q.ou_var_quad(t, s, tc)) < 1e-11
        ou.append({'t': t, 'sigma': s, 'tauC': tc, 'var': float(v)})
    out['ou'] = ou
    out['t2star'] = [{'sigma': 1.0, 'tauC': tc, 'value': Q.t2star(1.0, tc)} for tc in (0.1, 1.0, 10.0, 1e-3, 1e3)]
    ec = []
    for (tau, s, tc) in [(1.0, 1.0, 3.0), (1.0, 1.0, 10.0), (1.0, 1.0, 0.1), (2.0, 1.0, 10.0)]:
        v = Q.echo_var_closed(tau, s, tc)
        assert abs(v - Q.echo_var_quad(tau, s, tc)) < 1e-11
        ec.append({'tau': tau, 'sigma': s, 'tauC': tc, 'var': v})
    out['echo'] = ec
    out['echoSequence'] = [{'delta': d, 'tau': 1.3, 'U': cm(Q.echo_unitary(d, 1.3))} for d in (0.0, 2.5, 10.0)]
    out['pulseTrain'] = [{'eps': 0.01, 'N': 10, 'alternate': a, 'p0': Q.pulse_train_p0(0.01, 10, a)} for a in (False, True)] + [{'eps': 0.005, 'N': 15, 'alternate': False, 'p0': Q.pulse_train_p0(0.005, 15, False)}]
    return rounded(out)


if __name__ == '__main__':
    target = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'qc-q24.json'
    target.write_text(json.dumps(build(), indent=1, sort_keys=True) + '\n')
    print('wrote', target.relative_to(ROOT))
