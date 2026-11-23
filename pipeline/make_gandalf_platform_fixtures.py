#!/usr/bin/env python3
"""Numpy/scipy twins of the GANDALF platform engine cores (app/src/physics/optics/imaging.ts and app/src/physics/qec/timing.ts, Physics 709).

Routes DIFFERENT from the engine's wherever one exists: scipy.stats poisson / gamma / norm for the count laws (the engine sums logarithms, the
Erlang cdf as a Poisson cdf, and a positive erf series), np.convolve for the EMCCD read-noise convolution, an event loop for the pipelined total, and a
mulberry32 (uint32 arithmetic) mirrored by hand for the one seeded frame. Each scalar is [value, relative tolerance]; frames carry exact draws and means.
Usage (repo root): python3 pipeline/make_gandalf_platform_fixtures.py -> app/src/physics/__fixtures__/gandalf-platform.json
Deterministic: two runs write byte-identical files.
"""
import json
import math
from pathlib import Path

import numpy as np
from scipy import stats

ROOT = Path(__file__).resolve().parent.parent
out = {}


def put(key, value, tol=1e-12):
    out[key] = [float(value), tol]


# ---- Poisson
for m in (0.3, 5, 30, 150):
    for k in (0, 3, 9, 40):
        put(f"poissonPmf.{k}.{m}", stats.poisson.pmf(k, m), 1e-10)
        put(f"poissonCdf.{k}.{m}", stats.poisson.cdf(k, m), 1e-10)
put("zeroCountFloor.5", math.exp(-5))
put("collectionEfficiency.0.4", (1 - math.sqrt(1 - 0.16)) / 2)
put("collectionEfficiency.0.7", (1 - math.sqrt(1 - 0.49)) / 2)

# ---- the normal law (engine: erf series and a continued fraction)
for z in (-6.0, -2.5, -0.3, 0.0, 0.7, 2.9, 4.5, 8.0, 12.0):
    put(f"normalTail.{z:g}", stats.norm.sf(z), 1e-11)
put("psfShare.2.2.0.8", stats.norm.cdf((2.5 - 2) / 0.8) - stats.norm.cdf((1.5 - 2) / 0.8), 1e-11)
put("psfShare.0.0.3.0.6", stats.norm.cdf((0.5 - 0.3) / 0.6) - stats.norm.cdf((-0.5 - 0.3) / 0.6), 1e-11)


# ---- the EMCCD count law: Erlang cell masses by gamma.cdf, Gaussian read noise by np.convolve on a one-count grid
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
    if sigma == 0:
        mass = my.copy()
        mass[0] += P[0]
        return 0, mass
    R = math.ceil(8 * sigma) + 1
    d = np.arange(-R, R + 1)
    K = cell((d - 0.5) / sigma, (d + 0.5) / sigma)
    mass = np.convolve(my, K)  # index i <-> count cell i - R
    c = np.arange(-R, R)
    mass[c + R] += P[0] * cell(c / sigma, (c + 1) / sigma)
    return -R, mass


def best_error(mb, md, gain, sigma):
    lb, B = emccd_cells(mb, gain, sigma)
    ld, D = emccd_cells(md, gain, sigma)
    n = max(len(B), len(D))
    B = np.pad(B, (0, n - len(B)))
    D = np.pad(D, (0, n - len(D)))
    below = np.concatenate([[0.0], np.cumsum(B)])
    tail = np.concatenate([np.cumsum(D[::-1])[::-1], [0.0]])
    err = (below + tail) / 2
    i = int(np.argmin(err))
    return err[i], lb + i, below[i], tail[i]


for tag, (mb, md, g, s) in {"a": (30, 0.3, 300, 40), "b": (8, 0.2, 100, 15), "c": (12, 0.5, 50, 0)}.items():
    e, cut, eb, ed = best_error(mb, md, g, s)
    put(f"emccdBestError.{tag}.err", e, 1e-8)
    put(f"emccdBestError.{tag}.cutoff", cut, 0.0)
    put(f"emccdBestError.{tag}.eb", eb, 1e-8)
    put(f"emccdBestError.{tag}.ed", ed, 1e-8)
lo, mass = emccd_cells(5, 100, 20)
put("emccdCells.5.100.20.lo", lo, 0.0)
for c in (-20, 0, 100, 450, 700):
    put(f"emccdPdf.5.100.20.{c}", mass[c - lo], 1e-8)


# ---- the timing of a cycle: the pipelined total by an event loop (one acquisition chain, one classifier)
def pipe_events(d, g, r, c):
    acq = 0.0
    cls = 0.0
    for _ in range(d):
        acq += g + r
        cls = max(cls, acq) + c
    return cls


for tag, (d, g, r, c) in {"p2": (11, 0.02, 2.0, 0.5), "slow": (11, 0.02, 0.3, 0.5), "eq5": (100, 0.01, 3.0, 0.5), "fig": (9, 0.01, 1.0, 0.4), "fig2": (9, 0.01, 1.0, 1.5)}.items():
    put(f"unpipelined.{tag}", d * (g + r + c))
    put(f"pipelined.{tag}", pipe_events(d, g, r, c))
parts = [("gate", 0.02), ("move", 0.3), ("acquire", 2.0), ("classify", 0.5), ("reset", 0.1)]
put("roundTime.mixed", sum(t for _, t in parts))
put("readoutFraction.mixed", sum(t for k, t in parts if k in ("acquire", "classify", "denoise")) / sum(t for _, t in parts))


# ---- one seeded frame: mulberry32 mirrored in uint32 arithmetic, Poisson by inversion, the same draw order
class Mulberry:
    def __init__(self, seed):
        self.a = seed & 0xFFFFFFFF

    def __call__(self):
        self.a = (self.a + 0x6D2B79F5) & 0xFFFFFFFF
        t = self.a
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296


def poisson_inv(m, rand):
    if m == 0:
        return 0
    u = rand()
    p = math.exp(-m)
    cum = p
    k = 0
    while u > cum and k < 4000:
        k += 1
        p *= m / k
        cum += p
    return k


rows, cols, psf, photons, bg = 5, 6, 0.7, 40.0, 0.3
sites = [(1, 1), (3, 4)]
means = np.full(rows * cols, bg)
for (sr, sc) in sites:
    fr = np.array([stats.norm.cdf((i + 0.5 - sr) / psf) - stats.norm.cdf((i - 0.5 - sr) / psf) for i in range(rows)])
    fc = np.array([stats.norm.cdf((j + 0.5 - sc) / psf) - stats.norm.cdf((j - 0.5 - sc) / psf) for j in range(cols)])
    means += photons * np.outer(fr, fc).ravel()
rand = Mulberry(7)
counts = [poisson_inv(float(m), rand) for m in means]
frames = {"poisson.5x6.seed7": {"means": [float(x) for x in means], "counts": counts, "tol": 1e-10}}

payload = {
    "about": "GANDALF platform engine cores (imaging.ts, timing.ts), numpy/scipy routes. Scalar = [value, relative tolerance]. Regenerate: python3 pipeline/make_gandalf_platform_fixtures.py",
    "values": dict(sorted(out.items())),
    "frames": frames,
}
dest = ROOT / "app" / "src" / "physics" / "__fixtures__" / "gandalf-platform.json"
dest.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n")
print(f"wrote {dest.relative_to(ROOT)} ({len(out)} values)")
