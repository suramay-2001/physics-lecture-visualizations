#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q27.values.ts (Physics 709, chapter Q27: qubits in chips).

Independent route (never Q27.values.ts's own helpers, never physics/qc/solid.ts): pipeline/solid_numpy.py builds the LC and Josephson numbers from the exact SI constants, the Cooper
binding energy from the gap equation with scipy `quad` and `brentq`, the thermal chances from Boltzmann sums (mpmath), the charge qubit from LAPACK's tridiagonal solver and, for the
dispersions, 50-digit mpmath, the Jaynes-Cummings blocks with `eigvalsh`, the exchange, iSWAP and half-swap evolutions with `scipy.linalg.expm` of explicit Kronecker Paulis, and
the circuit of Eq. 15.14 from Rz, Hadamard and the half-swap matrices. Here the stored value is rounded exactly as Q27.values.ts rounds it (the digits the text shows).

Units: SI for circuits; hbar = 1 in the dimensionless blocks (g = 10 means 10 MHz); angles in radians.

Usage (from the repo root): python3 pipeline/claims_qc709/q27.py -> app/src/physics/__fixtures__/claims-qc709/q27.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import math
import sys
from fractions import Fraction
from pathlib import Path

import numpy as np
from scipy.linalg import expm

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import solid_numpy as S  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent.parent
values = {}


def rd(x, k):
    return round(float(x), k)


def fr(a, b):
    return float(Fraction(a, b))


TAU = 2 * math.pi
L, C = 3e-9, 0.3e-12
F_LC = S.lc_freq(L, C)

# ------------------------------------------------------------------------------------------------ q27-lc
values['q27LcC'] = rd(C * 1e12, 9)
values['q27LcOmega'] = rd(S.lc_omega(L, C) / 1e10, 6)
values['q27LcFreqGHz'] = rd(F_LC / 1e9, 6)
values['q27LcLambdaCm'] = rd(S.lc_wavelength(F_LC) * 100, 6)
values['q27LcLambdaOverChip'] = rd(S.lc_wavelength(F_LC) / 1e-3, 5)
values['q27LcZ'] = rd(S.lc_impedance(L, C), 6)
Z0 = S.lc_impedance(L, C)
w0 = S.lc_omega(L, C)
_, Pm, Qm = S.osc_ops(8, Z0)
Hm = Qm @ Qm / (2 * C) + Pm @ Pm / (2 * L)
values['q27ZeroPoint'] = rd(Hm[0, 0].real / w0, 9)
values['q27CommGap'] = max(S.comm_gap(8), S.osc_h_gap(L, C))
values['q27LeakRatio'] = rd(S.leak_ratio(), 6)
values['q27HfOverK'] = rd(S.hf_over_k(F_LC), 6)
nbar300 = S.thermal_n(F_LC, 300)
assert abs(nbar300 - 1 / math.expm1(S.hf_over_k(F_LC) / 300)) < 1e-8
values['q27Nbar300'] = rd(nbar300, 4)
values['q27P0300'] = rd(S.thermal_ground(F_LC, 300), 8)
values['q27P01K'] = rd(S.thermal_ground(F_LC, 1.0), 8)
values['q27P020mK'] = rd(S.thermal_ground(F_LC, 0.02), 8)
values['q27Nbar20mK'] = rd(S.thermal_n(F_LC, 0.02) * 1e6, 4)
values['q27Target99'] = fr(99, 100)
values['q27T99mK'] = rd(S.ground_temperature(F_LC, 0.99) * 1e3, 4)

# ------------------------------------------------------------------------------------------------ q27-superconductivity
values['q27CooperNV'] = fr(3, 10)
b_quad = S.cooper_b(0.3, 1.0)
values['q27CooperB'] = rd(b_quad * 1e3, 3)
values['q27CooperApprox'] = rd(S.cooper_exp(0.3, 1.0) * 1e3, 3)
values['q27CooperRatio'] = rd(b_quad / S.cooper_exp(0.3, 1.0), 4)
values['q27CooperQuadGap'] = abs(b_quad - S.cooper_closed(0.3, 1.0))
values['q27LondonNm'] = rd(S.london_length(1e28) * 1e9, 4)
values['q27Phi0'] = S.phi0() * 1e15
values['q27FluxLoop'] = rd(1e-3 * 1e-12 / S.phi0(), 6)

# ------------------------------------------------------------------------------------------------ q27-josephson
i0 = S.josephson_i0(L)
values['q27JosephsonMHzPerUV'] = rd((2 * S.E * 1e-6 / S.H) / 1e6, 4)
values['q27I0nA'] = rd(i0 * 1e9, 5)
values['q27Lj60nH'] = rd(S.josephson_l(i0, math.pi / 3) * 1e9, 6)
f0 = S.lc_freq(S.josephson_l(i0, 0.0), C)
f60 = S.lc_freq(S.josephson_l(i0, math.pi / 3), C)
values['q27F0GHz'] = rd(f0 / 1e9, 6)
values['q27F60GHz'] = rd(f60 / 1e9, 6)
values['q27F60Ratio'] = rd(f60 / f0, 6)
values['q27EJoverH'] = rd(S.phi0() * i0 / (2 * math.pi) / S.H / 1e9, 4)
values['q27Squid025'] = rd(abs(math.cos(math.pi * 0.25)), 6)
values['q27Squid13'] = rd(abs(math.cos(math.pi / 3)), 6)
values['q27SquidHalf'] = abs(math.cos(math.pi * 0.5))
flux_half = math.acos(0.25) / math.pi
values['q27SquidHalfFlux'] = rd(flux_half, 6)
values['q27SquidHalfFreq'] = rd(math.sqrt(abs(math.cos(math.pi * flux_half))), 9)
values['q27SquidQuarter'] = rd(abs(math.cos(math.pi * flux_half)), 9)

# ------------------------------------------------------------------------------------------------ q27-transmon
CSIG = 1e-15
values['q27EcFactor'] = rd(((2 * S.E) ** 2 / (2 * CSIG)) / (S.E**2 / (2 * CSIG)), 9)
# the matrix element <n|cos theta|n+1> by quadrature over one period of theta
th = np.linspace(0, 2 * math.pi, 4001)[:-1]
elem = np.mean(np.cos(th) * np.exp(-1j * 0 * th) * np.exp(1j * th)).real  # (1/2 pi) integral of cos(theta) e^{i theta} d theta
values['q27CosElem'] = rd(elem, 9)
EJ_IN, NG_IN = fr(1, 5), fr(3, 10)
values['q27InEJ'] = EJ_IN
values['q27InNg'] = NG_IN
zco, xco, U = S.two_level_cut(1.0, EJ_IN, NG_IN)
values['q27ZcoTrue'] = rd(zco, 9)
values['q27ZcoPrinted'] = rd(-zco, 9)
values['q27UCut'] = rd(U, 6)
values['q27GapFull'] = rd(S.full_gap(1.0, EJ_IN, NG_IN), 6)
values['q27GapCut'] = rd(2 * U, 6)
values['q27GapDegenerate'] = rd(S.full_gap(1.0, EJ_IN, 0.5), 6)
values['q27SlopeSweet'] = rd(abs(S.gap_slope(1.0, EJ_IN, 0.5)), 6)
values['q27SlopeOff'] = rd(abs(S.gap_slope(1.0, EJ_IN, NG_IN)), 4)
spread1 = S.full_gap(1.0, 1.0, 0.0) / S.full_gap(1.0, 1.0, 0.5)
values['q27F01spread1'] = rd(spread1, 6)
values['q27F01swing1'] = rd(spread1 - 1, 6)
e0_0 = S.charge_level_mp(20, 0, 2)
e0_h = S.charge_level_mp(20, 0.5, 2)
values['q27F01Excess20'] = rd(float((e0_0[1] - e0_0[0]) / (e0_h[1] - e0_h[0]) - 1) * 1e8, 3)
values['q27E0120'] = rd(S.full_gap(1.0, 20.0, 0.5), 6)
values['q27SqrtApprox20'] = rd(math.sqrt(2 * 20.0 * 1.0), 6)
lad = S.ladder(20.0)
values['q27Ladder2'] = rd(lad[2], 6)
values['q27Ladder3'] = rd(lad[3], 6)
values['q27Ladder4'] = rd(lad[4], 6)
for r in (10, 20, 50):
    values[f'q27Anh{r}'] = rd(abs(S.anharmonicity(float(r))), 6)
    values[f'q27Anh{r}Formula'] = rd(1 / math.sqrt(32 * r), 6)
d10 = S.dispersion_exact(10)
d20 = S.dispersion_exact(20)
values['q27Disp10'] = rd(d10 * 1e7, 3)
values['q27Disp20'] = rd(d20 * 1e9, 3)
values['q27DispRatio1020'] = rd(d10 / d20, 1)
values['q27Disp10Printed'] = rd(S.disp_printed(10), 4)
values['q27Disp10Koch'] = rd(S.disp_koch(10) * 1e6, 3)
values['q27Disp20Koch'] = rd(S.disp_koch(20) * 1e9, 3)
values['q27KochErr10'] = rd(S.disp_koch(10) / d10 - 1, 4)
values['q27KochErr20'] = rd(S.disp_koch(20) / d20 - 1, 4)
values['q27DispPrintedLog10'] = rd(math.log10(S.disp_printed(10) / d10), 3)
values['q27AnhRatio1020'] = rd(S.anharmonicity(10.0) / S.anharmonicity(20.0), 3)

# ------------------------------------------------------------------------------------------------ q27-cqed
for n in range(5):
    lv = S.jc_levels(0.0, 10.0, n)
    values[f'q27VacRabi{n}'] = rd(lv[1] - lv[0], 6)
G = TAU * 1e7
DELTA = TAU * 1e8
kappa = TAU * 10e9 / 1e7
gamma = 1 / 100e-6
values['q27KappakHz'] = rd(kappa / TAU / 1e3, 6)
values['q27GammakHz'] = rd(gamma / TAU / 1e3, 5)
values['q27Coop'] = rd(G * G / (kappa * gamma) / 1e7, 5)
chi = G * G / DELTA
values['q27DispShiftMHz'] = rd(chi / TAU / 1e6, 6)
values['q27DispSepMHz'] = rd(2 * chi / TAU / 1e6, 6)
values['q27DispShiftExact'] = rd(S.jc_levels(100.0, 10.0, 0)[1] - 50.0, 5)
values['q27ReadoutRatio'] = rd(2 * chi / kappa, 6)
t_isw = (math.pi / 2) * DELTA / (G * G)
assert abs(abs(S.exchange_evolution(G * G / DELTA * t_isw)[2, 1]) ** 2 - 1) < 1e-12
values['q27IswapNs'] = rd(t_isw * 1e9, 6)
values['q27ISwapQuarterP'] = rd(abs(S.exchange_evolution(math.pi / 4)[2, 1]) ** 2, 9)
mi = -1j
isw = np.array([[1, 0, 0, 0], [0, 0, mi, 0], [0, mi, 0, 0], [0, 0, 0, 1]], dtype=complex)
values['q27IswapGap'] = float(np.abs(S.exchange_evolution(math.pi / 2) - isw).max())
values['q27Iswap200Ns'] = rd((math.pi / 2) * (2 * DELTA) / (G * G) * 1e9, 6)
values['q27DispShift200'] = rd(G * G / (2 * DELTA) / TAU / 1e6, 6)

# ------------------------------------------------------------------------------------------------ q27-dots
values['q27InB'] = fr(1, 10)
values['q27InB14'] = fr(14, 10)
f_spin = S.zeeman_freq(0.1)
values['q27Zeeman01GHz'] = rd(f_spin / 1e9, 6)
values['q27ZeemanTmK'] = rd(S.hf_over_k(f_spin) * 1e3, 5)
values['q27Zeeman14GHz'] = rd(S.zeeman_freq(1.4) / 1e9, 6)


def down(f, T):
    return 0.5 * (1 + math.tanh(S.hf_over_k(f) / (2 * T)))


values['q27ZeemanPDown100mK'] = rd(down(f_spin, 0.1), 6)
values['q27ZeemanPDown20mK'] = rd(down(f_spin, 0.02), 6)
omega = TAU * 1e7
values['q27RabiBxmT'] = rd(S.HBAR * omega / S.MUB * 1e3, 6)
# the pi time: the flip chance under (omega/2) sigma_x, from expm, is sin^2(omega t/2) = 1 at t = pi/omega
tpi = math.pi / omega
flip = abs(expm(-1j * (omega / 2) * S.SX * tpi)[1, 0]) ** 2
assert abs(flip - 1) < 1e-12
values['q27PiTimeNs'] = rd(tpi * 1e9, 6)
values['q27InK'] = fr(1, 10)
Hex = (1 - 0.1 / 2) * np.eye(4) - 2 * 0.1 * S.s1s2()
ev = np.linalg.eigvalsh(Hex)
values['q27ES'] = rd(ev[-1], 9)
values['q27ET'] = rd(ev[0], 9)
sev = np.linalg.eigvalsh(S.s1s2())
values['q27S1S2Singlet'] = rd(abs(sev[0]), 9)
values['q27S1S2Triplet'] = rd(sev[1], 9)
values['q27SwapPulseGap'] = float(np.abs(S.heisenberg_u(math.pi) - np.exp(1j * math.pi / 4) * S.SWAP).max())
sq = S.heisenberg_u(math.pi / 2)
values['q27HalfSwapP'] = rd(abs(sq[2, 1]) ** 2, 9)
values['q27SqrtSwapSquareGap'] = float(np.abs(sq @ sq - np.exp(1j * math.pi / 4) * S.SWAP).max())
CZ = np.diag([1, 1, 1, -1]).astype(complex)
values['q27Cz1514Gap'] = float(np.abs(S.cz_product() - CZ).max())


def rz(theta):
    return np.diag([np.exp(-1j * theta / 2), np.exp(1j * theta / 2)])


Hd = np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2)
HH = np.kron(Hd, Hd)
Ucirc = np.kron(rz(-math.pi / 2), rz(math.pi / 2)) @ sq @ np.kron(rz(-math.pi), np.eye(2)) @ sq @ HH
values['q27CzCircuitGap'] = float(np.abs(np.exp(-3j * math.pi / 4) * (Ucirc @ HH) - S.cz_product()).max())
psi = Ucirc @ np.array([1, 0, 0, 0], dtype=complex)
YY = np.kron(S.SY, S.SY)
values['q27CzDotConc'] = rd(abs(np.vdot(psi, YY @ psi.conj())), 9)
values['q27F5GHz'] = rd(F_LC / 1e9, 6)
values['q27ZeemanB5GHz'] = rd(S.H * F_LC / (2 * S.MUB), 6)
values['q27DotMass'] = fr(67, 1000)
e1, gap, gapk = S.dot_box(100e-9, 0.067)
values['q27DotE1meV'] = rd(e1, 6)
values['q27DotE2meV'] = rd(e1 + gap, 6)
values['q27DotGapmeV'] = rd(gap, 6)
values['q27DotGapK'] = rd(gapk, 5)
values['q27DotKT100mKueV'] = rd(S.KB * 0.1 / S.E * 1e6, 6)

out_path = ROOT / 'app' / 'src' / 'physics' / '__fixtures__' / 'claims-qc709' / 'q27.json'
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(
    json.dumps(
        {
            'about': 'Claim values for Physics 709 chapter Q27, numpy (exact SI constants, scipy quad and brentq for the Cooper gap equation, mpmath Boltzmann sums and 50-digit charge-qubit levels, '
            'LAPACK tridiagonal levels, eigvalsh blocks, expm of Kronecker Paulis; never physics/qc/solid.ts or Q27.values.ts). Regenerate: python3 pipeline/claims_qc709/q27.py',
            'values': values,
        },
        indent=1,
        ensure_ascii=False,
        sort_keys=False,
    )
    + '\n'
)
print(f'wrote {out_path.relative_to(ROOT)} ({len(values)} values)')
