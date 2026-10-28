#!/usr/bin/env python3
"""Reference tables for the Chapter Q27 engine (app/src/physics/qc/solid.ts), by INDEPENDENT routes (pipeline/solid_numpy.py: LAPACK tridiagonal solver and 50-digit mpmath for
the charge qubit, scipy's Mathieu characteristic values, `quad` + `brentq` for the Cooper gap equation, Boltzmann sums by mpmath, `expm` of Kronecker Paulis).

Writes app/src/physics/__fixtures__/qc-solid.json, read by app/src/physics/qc/solid.test.ts. Every scalar is {"v": value, "tol": tolerance}; matrices are [re, im] pairs. Floats are rounded
to 15 significant digits. Deterministic: two runs write byte-identical files.

Usage (from the repo root): python3 pipeline/make_solid_fixtures.py
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import solid_numpy as S  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qc-solid.json"


def rounded(x):
    if isinstance(x, (float, np.floating)):
        return float(f"{float(x):.15g}")
    if isinstance(x, dict):
        return {str(k): rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def sc(v, tol):
    return {"v": float(v), "tol": tol}


def cm(m):
    return [[[float(np.real(z)), float(np.imag(z))] for z in row] for row in np.asarray(m)]


out = {"about": "Chapter Q27 engine tables (solid.ts) by independent routes: see pipeline/solid_numpy.py"}

# ---- the LC circuit: L = 3 nH, C = 0.3 pF
L, C = 3e-9, 0.3e-12
f = S.lc_freq(L, C)
out["lc"] = {
    "omega": sc(S.lc_omega(L, C), 1e-4),
    "freq": sc(f, 1e-4),
    "wavelength": sc(S.lc_wavelength(f), 1e-14),
    "impedance": sc(S.lc_impedance(L, C), 1e-12),
    "hfOverK": sc(S.hf_over_k(f), 1e-15),
    "nbar300": sc(S.thermal_n(f, 300), 1e-9),
    "p0_300": sc(S.thermal_ground(f, 300), 1e-14),
    "p0_1K": sc(S.thermal_ground(f, 1.0), 1e-14),
    "p0_20mK": sc(S.thermal_ground(f, 0.02), 1e-14),
    "nbar20mK": sc(S.thermal_n(f, 0.02), 1e-15),
    "t99": sc(S.ground_temperature(f, 0.99), 1e-12),
    "leak": sc(S.leak_ratio(), 1e-14),
    "commGap": sc(S.comm_gap(8), 1e-12),
    "hGap": sc(S.osc_h_gap(L, C), 1e-12),
}

# ---- Cooper binding, flux, London
out["cooper"] = {
    str(nv): {"exact": sc(S.cooper_b(nv, 1.0), 1e-9 * S.cooper_b(nv, 1.0)), "closed": sc(S.cooper_closed(nv, 1.0), 1e-14), "exp": sc(S.cooper_exp(nv, 1.0), 1e-14)}
    for nv in (0.15, 0.2, 0.3, 0.5, 0.6)
}
out["flux"] = {
    "phi0": sc(S.phi0(), 1e-27),
    "loop": sc(1e-3 * 1e-12 / S.phi0(), 1e-12),
    "london": sc(S.london_length(1e28), 1e-12),
    "josephsonHzPerV": sc(2 * S.E / S.H, 1.0),
}
i0 = S.josephson_i0(3e-9)
out["josephson"] = {
    "i0": sc(i0, 1e-18),
    "lj": {str(t): sc(S.josephson_l(i0, math.radians(t)), 1e-15) for t in (0, 30, 60, 80)},
    "freq": {str(t): sc(S.lc_freq(S.josephson_l(i0, math.radians(t)), 0.3e-12), 1e-4) for t in (0, 30, 60, 80)},
    "ej": sc(S.phi0() * i0 / (2 * math.pi), 1e-27),
    "squid": {str(p): sc(abs(math.cos(math.pi * p)), 1e-14) for p in (0.0, 0.1, 0.25, 1 / 3, 0.5)},
}

# ---- the charge qubit
levels = {}
for r in (1, 5, 10, 20, 50):
    for ng in (0.0, 0.25, 0.5):
        levels[f"{r}_{ng}"] = [float(x) for x in S.charge_levels(1.0, float(r), ng, 5)]
out["levels"] = levels
mat = {}
for r in (1.0, 10.0, 50.0):
    for ng in (0.0, 0.5):
        mat[f"{r}_{ng}"] = [float(x) for x in S.mathieu_levels(r, ng, 4)]
out["mathieu"] = mat
out["dispersion"] = {str(r): sc(S.dispersion_exact(r), 5e-14 + 1e-6 * abs(S.dispersion_exact(r))) for r in (5, 10, 15, 20, 25, 30)}
out["dispersionFormulas"] = {str(r): {"printed": sc(S.disp_printed(r), 1e-12 * max(1, S.disp_printed(r))), "koch": sc(S.disp_koch(r), 1e-12 * max(1e-3, S.disp_koch(r)))} for r in (5, 10, 20)}
out["anharmonicity"] = {str(r): sc(S.anharmonicity(r), 1e-12) for r in (1, 5, 10, 20, 50)}
out["ladder"] = {str(r): [float(x) for x in S.ladder(r)] for r in (10, 20, 50)}
zco, xco, U = S.two_level_cut(1.0, 0.2, 0.3)
out["cut"] = {
    "zco": sc(zco, 1e-14),
    "xco": sc(xco, 1e-14),
    "U": sc(U, 1e-14),
    "gapFull": sc(S.full_gap(1.0, 0.2, 0.3), 1e-12),
    "gapDegenerate": sc(S.full_gap(1.0, 0.2, 0.5), 1e-12),
    "slopeSweet": sc(S.gap_slope(1.0, 0.2, 0.5), 1e-6),
    "slopeOff": sc(S.gap_slope(1.0, 0.2, 0.3), 1e-6),
}
out["spread"] = {str(r): sc(S.full_gap(1.0, float(r), 0.0) / S.full_gap(1.0, float(r), 0.5), 1e-12) for r in (1, 5, 20)}

# ---- circuit QED (g = 10, Delta = 100 in one unit)
out["cqed"] = {
    "jc": {f"{d}_{n}": [float(x) for x in S.jc_levels(float(d), 10.0, n)] for d in (0, 100) for n in (0, 1, 2)},
    "swap": {str(t): sc(abs(S.exchange_evolution(t)[2, 1]) ** 2, 1e-14) for t in (math.pi / 8, math.pi / 4, math.pi / 2)},
    "exchange": cm(S.exchange_evolution(math.pi / 2)),
    "coop": sc((2 * math.pi * 1e7) ** 2 / ((2 * math.pi * 1e3) * (1 / 100e-6)), 1e-3),
}

# ---- the spin qubit and the dot
B = 0.1
fz = S.zeeman_freq(B)
out["spin"] = {
    "freq01": sc(fz, 1e-3),
    "freq14": sc(S.zeeman_freq(1.4), 1e-3),
    "hfOverK": sc(S.hf_over_k(fz), 1e-14),
    "down100mK": sc(1 / (1 + math.exp(-S.hf_over_k(fz) / 0.1)), 1e-14),
    "down20mK": sc(1 / (1 + math.exp(-S.hf_over_k(fz) / 0.02)), 1e-14),
    "rabiField": sc(S.HBAR * 2 * math.pi * 1e7 / S.MUB, 1e-15),
    "piTime": sc(math.pi / (2 * math.pi * 1e7), 1e-18),
    "fieldFor5GHz": sc(S.H * 5.305164769729844e9 / (2 * S.MUB), 1e-12),
}
s_eig = np.linalg.eigvalsh(S.s1s2())
out["exchange"] = {
    "s1s2Eigen": [float(x) for x in s_eig],
    "swapPulse": cm(S.heisenberg_u(math.pi)),
    "sqrtSwap": cm(S.heisenberg_u(math.pi / 2)),
    "czProduct": cm(S.cz_product()),
}
e1, gap, gapk = S.dot_box(100e-9, 0.067)
out["dot"] = {"E1meV": sc(e1, 1e-12), "gapMeV": sc(gap, 1e-12), "gapK": sc(gapk, 1e-10)}

OUT.write_text(json.dumps(rounded(out), indent=1, sort_keys=True) + "\n")
print("wrote", OUT.relative_to(ROOT), len(json.dumps(out)), "bytes")
