#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/optics/O7.values.ts ... O11.values.ts (Physics 709, the Optics Lab experiment track: one cesium
atom in a tweezer array, from the cloud to the count histogram).

Each value is the number a page prints, rounded half-up to the digits and the unit named in the page's values file. The engine (physics/optics/arrays.ts,
imaging.ts) uses closed forms; this script takes another route wherever one exists: an ODE for the stopping length of the capture speed, a numeric derivative for
the MOT damping, the reduced-matrix-element route for the polarizability, enumeration and scipy.stats for the binomial, Poisson and parity laws, the Erlang
(gamma) law convolved with read noise for the EMCCD, a grid search for the toy optimum, a seeded Monte Carlo (checked to 1 %) for the excess noise factor.
Constants are CODATA 2018 as app/src/physics/constants.ts; atoms are the stated inputs of the pages (Steck, Cs D line data).

REPORTED values (keys `o<k>Rep...`): each is a number a paper prints, copied as printed (the page names the source and the location; verified on the PDF text of
the saved reference). They are inputs of the page, not computed: this script lists them in REPORTED so the twin and the engine table hold the same literal.
Usage (from the repo root): python3 pipeline/claims_optics/o_track.py -> app/src/physics/__fixtures__/claims-optics/o7.json ... o11.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key, to 1e-12). Deterministic: two runs write byte-identical files.
"""
import json
import math
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

import numpy as np
from scipy import integrate, stats

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-optics"

h = 6.62607015e-34
hb = h / (2 * np.pi)
kB = 1.380649e-23
c = 299792458.0
u = 1.6605390666e-27
e = 1.602176634e-19
me = 9.1093837015e-31
muB = e * hb / (2 * me)
eps0 = 8.8541878128e-12
a0 = 5.29177210903e-11
Eh = 4.3597447222071e-18
AU_POL = e**2 * a0**2 / Eh
two_pi = 2 * np.pi


def rnd(x, n):
    """Round half up on the exact binary value, as JavaScript's toFixed does."""
    return float(Decimal(float(x)).quantize(Decimal(1).scaleb(-n), rounding=ROUND_HALF_UP))


CS_LAM, CS_G, CS_M = 852.347e-9, two_pi * 5.234e6, 132.905451961 * u
D1_LAM, D1_G = 894.593e-9, two_pi * 4.561e6
k852 = two_pi / CS_LAM
TD = hb * CS_G / (2 * kB)

# ------------------------------------------------------------------ O7
amax = hb * k852 * CS_G / (2 * CS_M)
vc = math.sqrt(2 * amax * 0.025)
stop = lambda t, y: y[1] - 1e-9
stop.terminal = True
ode = integrate.solve_ivp(lambda t, y: [y[1], -amax], [0, 1], [0, vc], events=stop, rtol=1e-12, atol=1e-14)
assert abs(ode.y[0, -1] - 0.025) < 1e-6  # the ODE stopping distance is the beam diameter


def beam_force(v, s, dl):
    f0 = hb * k852 * CS_G / 2
    sh = k852 * v / CS_G
    return f0 * s / (1 + s + 4 * (dl - sh) ** 2) - f0 * s / (1 + s + 4 * (dl + sh) ** 2)


s_mot, dl_mot, A_mot = 10 / 6, -3.17, 0.2
beta = abs((beam_force(1e-3, s_mot, dl_mot) - beam_force(-1e-3, s_mot, dl_mot)) / 2e-3)  # numeric derivative of the force
kappa = beta * muB * A_mot / (hb * k852)
U1 = abs(2 * hb * (-19.5) * CS_G * (7 / 6) / (1 + 4 * 19.5**2)) / kB  # |U1| in K, C^2 = 1
dopp = lambda dl: hb * CS_G / (4 * kB) * (2 * abs(dl) + 1 / (2 * abs(dl)))
N_t = lambda t: 1 - math.exp(-t)
sol_load = integrate.solve_ivp(lambda t, y: [1 - y[0]], [0, 2], [0], rtol=1e-12, atol=1e-14)  # dN/dt = R - N/tau in units R = tau = 1
o7 = {
    "o7IsatCs": rnd(math.pi * h * c * CS_G / (3 * CS_LAM**3) * 0.1, 2),
    "o7MotBetaK2": rnd(beta / (hb * k852**2), 4),
    "o7MotOmegaHz": rnd(math.sqrt(kappa / CS_M) / two_pi, 0),
    "o7MotZeemanMm": rnd(hb * abs(dl_mot) * CS_G / (muB * A_mot) * 1e3, 2),
    "o7CaptureV": rnd(vc, 1),
    "o7Load2Tau": rnd(sol_load.y[0, -1], 3),
    "o7Load95": rnd(-math.log(0.05), 2),
    "o7U1Pgc": rnd(U1 * 1e6, 2),
    "o7TlimLin": rnd(0.125 * U1 * 1e6, 3),
    "o7TlimSig": rnd(0.097 * U1 * 1e6, 3),
    "o7DopplerOverTlim": rnd(TD / (0.125 * U1), 0),
    "o7DopplerPgcmK": rnd(dopp(-19.5) * 1e3, 2),
    # reported (Manetsch et al., arXiv:2403.12021v4, Methods "Loading single atoms in tweezers", p. 21)
    "o7RepIsat": 1.1,
    "o7RepCloudMm": 1.6,
    "o7RepMotDetuning": 3.17,
    "o7RepBeamCm": 2.5,
    "o7RepPgcDetuning": 19.5,
}

# ------------------------------------------------------------------ O8
LAM_T = 1061e-9
fr_rep, fz_rep = 29.30e3, 5.64e3


def alpha_rme(lam_trap):
    """Reduced-matrix-element route: alpha = (1/3) sum_j w_j |<J||d||J'>|^2 / (hbar (w_j^2 - w^2)), |<||>|^2 = 3 pi eps0 hbar c^3 (2J'+1) Gamma/w_j^3."""
    om = two_pi * c / lam_trap
    tot = 0.0
    for lam, G, Jp in ((D1_LAM, D1_G, 0.5), (CS_LAM, CS_G, 1.5)):
        w = two_pi * c / lam
        S = G * 3 * np.pi * eps0 * hb * c**3 * (2 * Jp + 1) / w**3
        tot += (2 / (3 * 2)) * w * S / (hb * (w**2 - om**2))
    return tot


def depth_J(P, w0, lam_trap=LAM_T):
    return alpha_rme(lam_trap) * 2 * P / (np.pi * w0**2) / (2 * eps0 * c)


def rsc(P, w0, lam_trap=LAM_T):
    om = two_pi * c / lam_trap
    I0 = 2 * P / (np.pi * w0**2)
    tot = 0.0
    for lam, G, Jp in ((D1_LAM, D1_G, 0.5), (CS_LAM, CS_G, 1.5)):
        w = two_pi * c / lam
        D = w - om
        Uj = np.pi * c**2 * G * (2 * Jp + 1) / (4 * w**3 * D) * I0
        tot += Uj * G / (hb * D)
    return tot


w0 = LAM_T * (fr_rep / fz_rep) / (math.sqrt(2) * np.pi)
zR = np.pi * w0**2 / LAM_T
U14 = depth_J(1.4e-3, w0)
Uf = CS_M * (two_pi * fr_rep) ** 2 * w0**2 / 4
R14 = rsc(1.4e-3, w0)
Ert = (hb * two_pi / LAM_T) ** 2 / (2 * CS_M)
w_r = two_pi * fr_rep
o8 = {
    "o8WaistUm": rnd(w0 * 1e6, 2),
    "o8RayleighUm": rnd(zR * 1e6, 2),
    "o8AiryUm": rnd(0.61 * LAM_T / 0.65 * 1e6, 3),
    "o8SpacingOverWaist": rnd(7.2e-6 / w0, 2),
    "o8AlphaAu": rnd(alpha_rme(LAM_T) / AU_POL, 0),
    "o8AlphaAu1064": rnd(alpha_rme(1064e-9) / AU_POL, 0),
    "o8Depth14": rnd(U14 / kB * 1e3, 3),
    "o8DepthFromFreq": rnd(Uf / kB * 1e3, 3),
    "o8PowerForFreq": rnd(Uf / depth_J(1.0, w0) * 1e3, 2),
    "o8FrAt14": rnd(math.sqrt(4 * U14 / (CS_M * w0**2)) / two_pi / 1e3, 1),
    "o8FzAt14": rnd(math.sqrt(2 * U14 / (CS_M * zR**2)) / two_pi / 1e3, 2),
    "o8DepthPaperWaist": rnd(depth_J(1.4e-3, 1.17e-6) / kB * 1e3, 3),
    "o8Sigma20": rnd(math.sqrt(kB * 20e-6 / (CS_M * w_r**2)) * 1e9, 0),
    "o8Eta": rnd(k852 * math.sqrt(hb / (2 * CS_M * w_r)), 3),
    "o8EtaSq": rnd((k852 * math.sqrt(hb / (2 * CS_M * w_r))) ** 2, 4),
    "o8DepthOverT20": rnd(U14 / (kB * 20e-6), 2),
    "o8Rsc": rnd(R14, 2),
    "o8RecoilGainK": rnd(2 * Ert / kB * 1e9, 0),
    "o8HeatTime": rnd(U14 / (2 * Ert * R14), 0),
    "o8HeatMin": rnd(U14 / (2 * Ert * R14) / 60, 1),
    # reported (Manetsch et al., arXiv:2403.12021v4): p. 25 (waist, frequencies), p. 18 (Ext. Data Fig. 9 caption), p. 3 (depth, power), p. 4 (lifetime)
    "o8RepWaistUm": 1.17,
    "o8RepDepthmK": 0.18,
    "o8RepFrKHz": 29.30,
    "o8RepFzKHz": 5.64,
    "o8RepPowerMW": 1.4,
    "o8RepLifeMin": 22.9,
    "o8RepSpacingUm": 7.2,
    "o8RepNa": 0.65,
}

# ------------------------------------------------------------------ O9


def parity(mu):
    n = np.arange(400)
    p = stats.poisson.pmf(n, mu)
    return p[1::2].sum(), p[0::2].sum()  # P(odd) -> one atom, P(even) -> none


def need_n(M, p, conf):
    n = M
    while stats.binom.sf(M - 1, n, p) < conf:
        n += 1
    return n


rng = np.random.default_rng(7)
mc = ((rng.poisson(1.0, 2_000_000) % 2) == 1).mean()
assert abs(mc - parity(1.0)[0]) < 5e-4  # the Monte Carlo of the pair loss agrees
eps_, q_ = 0.01, 0.5
trace = [1.0]
for _ in range(5):
    trace.append(trace[-1] * (1 - q_) + (1 - trace[-1]) * eps_)
eq = eps_ / (q_ + eps_)
tau_vac = 22.9 * 60
S_img = 0.9998952
o9 = {
    "o9P1Mu1": rnd(parity(1)[0], 4),
    "o9P0Mu1": rnd(parity(1)[1], 4),
    "o9PoissonMax": rnd(stats.poisson.pmf(1, 1), 4),
    "o9P1Mu2": rnd(parity(2)[0], 4),
    "o9P1Mu5": rnd(parity(5)[0], 5),
    "o9Sites100": float(need_n(100, 0.512, 0.99)),
    "o9Sites100p50": float(need_n(100, 0.5, 0.99)),
    "o9Sites50": float(need_n(50, 0.512, 0.99)),
    "o9PCert200": rnd(stats.binom.sf(99, 200, 0.512), 3),
    "o9PCert220": rnd(stats.binom.sf(99, 220, 0.512), 3),
    "o9ExpAtoms": rnd(12000 * 0.512, 0),
    "o9Empty5": rnd(trace[5], 4),
    "o9EmptyEq": rnd(eq, 4),
    "o9AllFilled100": rnd((1 - eq) ** 100, 3),
    "o9LossPerSec": rnd(6139 / tau_vac, 2),
    "o9LostPerImage": rnd(6139 * (1 - S_img), 3),
    # reported (Manetsch et al., arXiv:2403.12021v4): p. 3 (51.2 %, 3.4 %), p. 2 (6,139 atoms, Fig. 1d caption), p. 4 (survival), p. 4 (lifetime 22.9 min)
    "o9RepFill": 0.512,
    "o9RepSpread": 0.034,
    "o9RepSurv": 0.9998952,
    "o9RepLifeMin": 22.9,
}

# ------------------------------------------------------------------ O10
R_max = CS_G / 2
Rf = lambda G, s, d: G / 2 * s / (1 + s + 4 * d * d)
coll = lambda NA: integrate.quad(lambda t: math.sin(t) / 2, 0, math.asin(NA))[0]
gain_K = 2 * (hb * k852) ** 2 / (2 * CS_M) / kB
R_ex = Rf(CS_G, 2.0, -2.0)
rng2 = np.random.default_rng(3)
o10 = {
    "o10RmaxCs": rnd(R_max / 1e7, 2),
    "o10RSat": rnd(Rf(CS_G, 1, 0) / 1e6, 2),
    "o10RExample": rnd(R_ex / 1e6, 2),
    "o10CollNa40": rnd(coll(0.40), 4),
    "o10CollNa55": rnd(coll(0.55), 4),
    "o10CollNa65": rnd(coll(0.65), 4),
    "o10Floor5": rnd(stats.poisson.pmf(0, 5), 5),
    "o10Floor7": rnd(stats.poisson.pmf(0, 7), 6),
    "o10NScat5": rnd(5 / 0.0096, 0),
    "o10NScat7": rnd(7 / 0.0096, 0),
    "o10TauM5": rnd(5 / (R_ex * 0.05) * 1e3, 4),
    "o10GainK": rnd(gain_K * 1e9, 0),
    "o10PhotonsToDepth": rnd(0.18e-3 / gain_K, 0),
    "o10DepumpN": rnd(-1 / math.log(1 - 3.7e-4), 0),
    "o10Surv500": rnd((1 - 3.7e-4) ** 500, 3),
    # reported: Chow et al., arXiv:2206.00144, p. 3 (collection efficiency 0.96(1) %), p. 5 (depump chance 3.7e-4 per collection event, shown in units of 1e-4);
    # Kwon et al., arXiv:1706.09497, p. 2 (detection efficiency 1.6 to 2.0 %); Manetsch p. 3 (depth 0.18 mK)
    "o10RepCE": 0.0096,
    "o10RepKwonLo": 0.016,
    "o10RepKwonHi": 0.020,
    "o10RepDepump": 3.7,
    "o10RepDepthmK": 0.18,
    "o10RepNa40": 0.4,
    "o10RepNa55": 0.55,
    "o10RepNa65": 0.65,
}

# ------------------------------------------------------------------ O11


def err_poisson(mb, md, nc):
    eb = stats.poisson.cdf(nc - 1, mb) if nc > 0 else 0.0
    ed = stats.poisson.sf(nc - 1, md) if nc > 0 else 1.0
    return 0.5 * (eb + ed), eb, ed


def best(mb, md):
    return min((err_poisson(mb, md, nc)[0], nc) for nc in range(0, 200))


def cell(a, b):
    mid = (a + b) / 2
    return np.where(mid >= 0, stats.norm.sf(a) - stats.norm.sf(b), stats.norm.sf(-b) - stats.norm.sf(-a))


def emccd_cells(mean, gain, sigma):
    nmax = math.ceil(mean + 10 * math.sqrt(mean) + 12)
    P = stats.poisson.pmf(np.arange(nmax + 1), mean)
    J = math.ceil(gain * (nmax + 10 * math.sqrt(nmax) + 10)) + 1
    edges = np.arange(J + 1, dtype=float)
    F = np.zeros(J + 1)
    for n in range(1, nmax + 1):
        F += P[n] * stats.gamma.cdf(edges, n, scale=gain)
    my = np.diff(F)
    R = math.ceil(8 * sigma) + 1
    d = np.arange(-R, R + 1)
    K = cell((d - 0.5) / sigma, (d + 0.5) / sigma)
    mass = np.convolve(my, K)
    cc = np.arange(-R, R)
    mass[cc + R] += P[0] * cell(cc / sigma, (cc + 1) / sigma)
    return -R, mass


def emccd_best(mb, md, gain, sigma):
    lb, B = emccd_cells(mb, gain, sigma)
    ld, D = emccd_cells(md, gain, sigma)
    n = max(len(B), len(D))
    B = np.pad(B, (0, n - len(B)))
    D = np.pad(D, (0, n - len(D)))
    below = np.concatenate([[0.0], np.cumsum(B)])
    tail = np.concatenate([np.cumsum(D[::-1])[::-1], [0.0]])
    err = (below + tail) / 2
    return err.min()


Rb, Rg = 54.4e3, 0.52e3
chow = lambda us: best((Rb + Rg) * us * 1e-6, Rg * us * 1e-6)[0]
toy_tot = lambda us: chow(us) + (1 - math.exp(-4.0 * us * 1e-6))
grid = list(range(30, 600, 2))
t_best = min(grid, key=toy_tot)
n_mc = rng2.poisson(30, 400000)
y_mc = np.where(n_mc > 0, rng2.gamma(np.maximum(n_mc, 1), 300.0), 0.0)
enf_mc = y_mc.var() / (30 * 300.0**2)
assert abs(enf_mc - 2.0) < 0.02  # the Monte Carlo agrees with the exact moments to 1 %
# exact moments by enumeration over the Poisson number n of photoelectrons: an Erlang(n, g) sum has mean n g and variance n g^2
ns = np.arange(0, 400)
pn = stats.poisson.pmf(ns, 30)
g_ = 300.0
mean_y = (pn * ns * g_).sum()
var_y = (pn * (ns * g_**2 + (ns * g_) ** 2)).sum() - mean_y**2
enf_exact = var_y / (30 * g_**2)
ex = err_poisson(9.2, 0.2, 3)
d_ratio = ((Rb * 4e-4) / math.sqrt((Rb + 2 * Rg) * 4e-4)) / ((Rb * 1e-4) / math.sqrt((Rb + 2 * Rg) * 1e-4))
o11 = {
    "o11ExErr": rnd(ex[0], 5),
    "o11ExEb": rnd(ex[1], 5),
    "o11ExEd": rnd(ex[2], 5),
    "o11DprimeRatio": rnd(d_ratio, 2),
    "o11Err50": rnd(chow(50), 4),
    "o11Err100": rnd(chow(100), 4),
    "o11Err150": rnd(chow(150), 5),
    "o11Err260": rnd(chow(260), 6),
    "o11Err350": rnd(chow(350), 7),
    "o11PaperMean": rnd((5e-5 + 4e-4) / 2, 6),
    "o11Enf": rnd(enf_exact, 2),
    "o11EmccdErr": rnd(emccd_best(30, 0.3, 300, 40), 6),
    "o11EmccdFloor": rnd(best(30, 0.3)[0] * 1e8, 1),
    "o11ToyTau": float(t_best),
    "o11ToyTotal": rnd(toy_tot(t_best), 5),
    "o11ToyMisread": rnd(chow(t_best), 6),
    "o11FS80": rnd(0.9999374 * 0.9998952, 6),
    "o11FS20": rnd(0.999571 * 0.99176, 6),
    # reported: Chow et al., arXiv:2206.00144, p. 3 (rates 5.44(3) x 10^4 and 5.2(3) x 10^2 per second, errors 0.005 % and 0.04 % at 0.26 ms);
    # Manetsch et al., arXiv:2403.12021v4, p. 4 (fidelity 99.99374(8) % and survival 99.98952(1) %, 80 ms) and Ext. Data Fig. 6 text, p. 21 (99.9571(4) %, 99.176(1) %, 20 ms)
    "o11SetMb": 9.2,
    "o11SetMd": 0.2,
    "o11RepRateB": 54.4,
    "o11RepRateD": 0.52,
    "o11RepEb": 0.00005,
    "o11RepEd": 0.0004,
    "o11RepMs": 0.26,
    "o11RepF80": 0.9999374,
    "o11RepS80": 0.9998952,
    "o11RepF20": 0.999571,
    "o11RepS20": 0.99176,
}

OUT.mkdir(parents=True, exist_ok=True)
ABOUT = {
    7: "Claim values for the Optics Lab page O7 (from vapour to a cold cloud), ODE stopping distance, numeric MOT damping and the reported inputs.",
    8: "Claim values for the Optics Lab page O8 (one atom in a beam of light), reduced-matrix-element polarizability and the reported inputs.",
    9: "Claim values for the Optics Lab page O9 (one atom per trap), scipy Poisson and binomial laws, enumeration and a Monte Carlo of the parity loss.",
    10: "Claim values for the Optics Lab page O10 (light from one atom), quadrature of the collected solid angle and closed forms.",
    11: "Claim values for the Optics Lab page O11 (counting atoms), scipy Poisson scans, the Erlang law convolved with read noise, and a grid search.",
}
for k, vals in zip(range(7, 12), [o7, o8, o9, o10, o11]):
    (OUT / f"o{k}.json").write_text(json.dumps({"about": ABOUT[k] + " Regenerate: python3 pipeline/claims_optics/o_track.py", "values": vals}, indent=1, ensure_ascii=False) + "\n")
    print(f"wrote o{k}.json ({len(vals)} values)")
