#!/usr/bin/env python3
"""Reference values for the whole-number and Fourier helpers added for Chapter F8 (app/src/physics/qc/numtheory.ts and fourier.ts), computed by an
INDEPENDENT route.

The TypeScript engine runs Euclid's algorithm by hand, extends it for the Bezout pair, finds an order by multiplying until the product returns to 1,
sums the transform entry by entry with reduced exponents, and gets continued fractions from the quotients of Euclid and convergents from the
recurrence p_l = a_l p_{l-1} + p_{l-2}. This script uses none of that: remainders and powers come from Python's own `%` and three-argument `pow`
(including the modular inverse `pow(a, -1, N)`), the Bezout pair is checked by scanning every (x, y) in a window for the least positive a*x + b*y,
the order is a scan of the whole list of powers with big integers, Euler's count is the product formula over the prime factors, the transform
matrices are numpy's `ifft(..., norm='ortho')` of the identity (numpy's `fft` has the sign minus; `ifft` is N&C's Eq. 5.1 up to the factor sqrt(N)),
the comb transforms use numpy, geometric sums are numpy sums of powers, the Dirichlet kernel is the modulus of a numpy sum of unit arrows, binary
fractions are exact Fractions, continued fractions repeat x -> 1/(x - floor x) on exact Fractions and convergents are evaluated from the nested form
of the quotients, never from the recurrence.

Conventions (docs/roles/proposals/P-F8-story.md): omega = exp(2 pi i / N); (F_N)_{kj} = omega^{jk} / sqrt(N); a bit string is the number its bits spell
(first bit most significant).

Usage: python3 pipeline/make_numtheory_fixtures.py  -> app/src/physics/__fixtures__/qc-numtheory.json   (deterministic; no seed)
"""
import json
import math
from fractions import Fraction
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent


def rounded(x):
    if isinstance(x, float):
        return float(f"{x:.15g}")
    if isinstance(x, dict):
        return {k: rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def pair(z):
    return [float(z.real), float(z.imag)]


def pairs(v):
    return [pair(z) for z in v]


def prime_factors(n):
    out, p = [], 2
    while p * p <= n:
        if n % p == 0:
            out.append(p)
            while n % p == 0:
                n //= p
        p += 1
    if n > 1:
        out.append(n)
    return out


def euler_count(n):
    t = Fraction(n)
    for p in prime_factors(n):
        t *= Fraction(p - 1, p)
    return int(t)


def least_positive_combination(a, b, window=120):
    """The least positive a*x + b*y over a window of whole x, y, and one pair (x, y) reaching it (scan, not Euclid)."""
    best = None
    for x in range(-window, window + 1):
        for y in range(-window, window + 1):
            v = a * x + b * y
            if v > 0 and (best is None or v < best[0]):
                best = (v, x, y)
    return best[0]


def division_lines(a, b):
    out = []
    while b:
        q, r = divmod(a, b)
        out.append([a, b, q, r])
        a, b = b, r
    return out


def powers_list(x, N, count):
    return [pow(x, k, N) for k in range(count)]


def order_by_scan(x, N):
    if math.gcd(x, N) != 1:
        return None
    for r in range(1, N + 1):
        if pow(x, r, N) == 1 % N:
            return r
    return None


def cf_of(p, q):
    """Continued fraction by x -> 1/(x - floor(x)) on exact Fractions."""
    x = Fraction(p, q)
    out = []
    while True:
        a = x.numerator // x.denominator
        out.append(a)
        frac = x - a
        if frac == 0:
            return out
        x = 1 / frac


def nested(cf):
    """The value of [a0; a1, ..., an] evaluated from the inside out (the convergent, without the recurrence)."""
    v = Fraction(cf[-1])
    for a in reversed(cf[:-1]):
        v = a + 1 / v if v != 0 else Fraction(a)
    return v


def convergent_list(cf):
    return [[nested(cf[: l + 1]).numerator, nested(cf[: l + 1]).denominator] for l in range(len(cf))]


def order_from_peak(y, m, x, N):
    for p, q in convergent_list(cf_of(y, 2**m)):
        if 1 <= q < N and pow(x, q, N) == 1 % N:
            return q
    return None


def dft_matrix(N):
    return np.fft.ifft(np.eye(N), axis=0, norm="ortho")


def comb_vec(N, r, s=0):
    v = np.zeros(N, dtype=complex)
    v[s::r] = 1
    return v / np.linalg.norm(v)


def main():
    fx = {}
    # remainders (Python's % on a positive modulus is never negative)
    fx["mod"] = [[a, N, a % N] for a in (17, -3, 0, 12, 24, -12, -25, 100) for N in (12, 7, 21, 1)]
    # gcd, the division lines and the Bezout combination
    gcd_pairs = [(84, 36), (36, 84), (21, 6), (35, 8), (1, 1), (12, 18), (2, 21), (3, 21), (100, 75), (17, 5), (221, 91), (1071, 462), (5, 1), (0, 7)]
    fx["gcd"] = [[a, b, math.gcd(a, b)] for a, b in gcd_pairs]
    fx["lines"] = {f"{a},{b}": division_lines(a, b) for a, b in gcd_pairs if a >= 1 and b >= 1}
    fx["bezout"] = {f"{a},{b}": least_positive_combination(a, b) for a, b in [(84, 36), (21, 6), (35, 8), (12, 18), (100, 75), (17, 5), (5, 3)]}
    # inverses: pow(a, -1, N) where it exists
    inv = {}
    for N in (21, 12, 15, 7, 2, 1):
        for a in range(0, 2 * N + 1):
            try:
                inv[f"{a},{N}"] = pow(a, -1, N)
            except ValueError:
                inv[f"{a},{N}"] = None
    fx["inverse"] = inv
    # powers and orders
    fx["powers"] = {f"{x},{N}": powers_list(x, N, 14) for x, N in [(2, 21), (3, 21), (5, 21), (10, 21), (8, 21), (7, 15), (2, 15), (11, 15)]}
    fx["pow"] = [[x, e, N, pow(x, e, N)] for x, e, N in [(2, 100, 21), (2, 6, 21), (2, 13, 21), (3, 7, 21), (7, 2**40, 1000003), (123456789, 987654321, 1000000007), (5, 0, 7), (2, 5, 1)]]
    orders = {}
    for N in (21, 15, 35, 7, 2, 1, 12, 24, 91):
        for x in range(0, N + 3):
            orders[f"{x},{N}"] = order_by_scan(x, N)
    fx["order"] = orders
    fx["units"] = {str(N): euler_count(N) for N in (1, 2, 7, 12, 15, 21, 36, 91)}
    # the order divides Euler's count (a check on the claim in the story; also a property of the engine)
    fx["orderDividesUnits"] = all(euler_count(N) % order_by_scan(x, N) == 0 for N in (7, 12, 15, 21, 35, 91) for x in range(1, N) if math.gcd(x, N) == 1)
    # factors from an order: the even order r, x^(r/2) != -1, then the gcds (checked here against trial division)
    shor = {}
    for x, N in [(2, 21), (5, 21), (4, 21), (8, 21), (7, 15), (2, 15), (4, 15), (11, 15), (2, 35), (3, 35), (13, 35), (2, 91)]:
        r = order_by_scan(x, N)
        if r is None or r % 2:
            shor[f"{x},{N}"] = None
            continue
        h = pow(x, r // 2, N)
        if h == N - 1:
            shor[f"{x},{N}"] = None
            continue
        a, b = math.gcd(h - 1, N), math.gcd(h + 1, N)
        ok = all(1 < f < N and N % f == 0 for f in (a, b))
        shor[f"{x},{N}"] = sorted([a, b]) if ok else None
    fx["factors"] = shor
    # the transform matrices and the comb transforms
    fx["dft"] = {str(N): [pairs(row) for row in dft_matrix(N)] for N in (1, 2, 3, 4, 5, 6, 8, 12)}
    rng_vec = {N: np.array([math.sin(0.7 * j + 0.3) + 1j * math.cos(0.4 * j * j + 0.2) for j in range(N)]) for N in (4, 6, 8, 11)}
    fx["dftVec"] = {str(N): {"in": pairs(v), "out": pairs(dft_matrix(N) @ v)} for N, v in rng_vec.items()}
    fx["comb"] = {}
    for N, r, s in [(8, 2, 0), (8, 4, 0), (8, 2, 1), (8, 3, 0), (32, 6, 0), (32, 6, 1), (32, 6, 5), (16, 4, 3), (21, 3, 0)]:
        v = comb_vec(N, r, s)
        fx["comb"][f"{N},{r},{s}"] = {"vec": pairs(v), "dft": pairs(dft_matrix(N) @ v)}
    # geometric sums and the Dirichlet kernel (modulus of the mean of unit arrows)
    fx["geom"] = []
    for u in (0.5 + 0j, 1j, -1 + 0j, 0.3 + 0.4j, np.exp(2j * np.pi / 5), 1 + 0j, 2 + 0j, np.exp(1j)):
        for M in (1, 2, 4, 7):
            fx["geom"].append([pair(u), M, pair(np.sum(u ** np.arange(M)))])
    fx["dirichlet"] = {}
    for M in (1, 2, 8, 64):
        for delta in (0.0, 1 / 128, 1 / 16, 1 / (2 * M), 1 / M, 1.0, 0.3, -0.1, 0.5, 2.25):
            fx["dirichlet"][f"{M},{delta!r}"] = float(abs(np.sum(np.exp(2j * np.pi * delta * np.arange(M)))) / M)
    # the minimum of D_M over |delta| <= 1/(2M) (sampled finely) and the limit 2/pi
    fx["dirichletMin"] = {str(M): float(min(abs(np.sum(np.exp(2j * np.pi * d * np.arange(M)))) / M for d in np.linspace(-1 / (2 * M), 1 / (2 * M), 4001))) for M in (2, 3, 4, 8, 16, 64, 256)}
    fx["chord"] = {str(t): float(abs(1 - np.exp(1j * t))) for t in (0.5, 1.0, math.pi / 3, math.pi / 2, math.pi, 2.0)}
    # binary fractions
    fx["binary"] = {s: float(sum(Fraction(int(d), 2 ** (l + 1)) for l, d in enumerate(s))) for s in ("", "1", "0", "101", "01", "1111", "00101101")}
    # continued fractions and convergents
    fx["cf"] = {}
    for p, q in [(5, 32), (11, 32), (16, 32), (21, 32), (27, 32), (1, 6), (355, 113), (0, 5), (7, 1), (3, 7), (22, 7), (13, 8), (415, 93)]:
        cf = cf_of(p, q)
        fx["cf"][f"{p},{q}"] = {"cf": cf, "convergents": convergent_list(cf)}
    # reading an order off a peak, and the whole success set
    fx["peak"] = {f"{y},{m},{x},{N}": order_from_peak(y, m, x, N) for m, x, N in [(5, 2, 21), (6, 2, 21), (5, 5, 21), (4, 7, 15), (6, 7, 15), (11, 2, 21)] for y in range(0, min(2**m, 64))}
    fx["success"] = {f"{m},{x},{N}": [y for y in range(2**m) if order_from_peak(y, m, x, N) == order_by_scan(x, N)] for m, x, N in [(5, 2, 21), (6, 2, 21), (8, 2, 21), (4, 7, 15), (8, 7, 15), (9, 2, 21), (10, 5, 21)]}
    # the chance of the success set for the comb that starts at 0 (rows of F times the comb of step r)
    fx["successChance"] = {}
    for m, x, N in [(5, 2, 21), (6, 2, 21), (8, 2, 21), (10, 2, 21)]:
        r = order_by_scan(x, N)
        v = dft_matrix(2**m) @ comb_vec(2**m, r, 0)
        fx["successChance"][f"{m},{x},{N}"] = float(sum(abs(v[y]) ** 2 for y in range(2**m) if order_from_peak(y, m, x, N) == r))
    out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qc-numtheory.json"
    out.write_text(json.dumps(rounded(fx), sort_keys=True, separators=(",", ":")) + "\n")
    print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
