#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/F8.values.ts (Physics 709, chapter F8: hidden rhythms).

Independent route (never F8.values.ts's own helpers, never physics/qc/numtheory.ts or fourier.ts): remainders, powers, gcds and inverses are Python's own
`%`, three-argument `pow`, `math.gcd` and `pow(a, -1, N)`; the Bezout pair is checked by scanning a window of (x, y); the order is a scan of the list of
powers with big integers; Euler's count is a count of coprime residues; the Fourier matrix is numpy's `ifft(..., norm='ortho')` of the identity (numpy's
`fft` has the sign minus; `ifft` is N&C's Eq. 5.1); the roots of unity, their sums and the kernel D_M are numpy exponentials; combs are numpy arrays; the
chain of arrows is a numpy cumulative sum; binary fractions and continued fractions are exact Fractions (continued fractions by x -> 1/(x - floor x),
convergents evaluated from the nested form, never from the recurrence).

Units: a bit string a stage names is the number its bits spell, first bit most significant (00110 is 6). A key that stands for a LIST is a checksum of it
(the sum), documented in F8.values.ts; the lists themselves are checked whole in the story's claims against the engine, whose own functions are verified
against Python in physics/qc/numtheory.test.ts and fourier.test.ts.

Usage (from the repo root): python3 pipeline/claims_qc709/f8.py -> app/src/physics/__fixtures__/claims-qc709/f8.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import math
from fractions import Fraction
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent


def ifft_matrix(N):
    return np.fft.ifft(np.eye(N), axis=0, norm="ortho")


def comb_state(N, r, s=0):
    v = np.zeros(N, dtype=complex)
    v[s::r] = 1
    return v / np.linalg.norm(v)


def ket_plus_zero(bits):
    """The state of a product of single-qubit labels 0, 1, + (first label most significant), by np.kron."""
    one = {"0": np.array([1, 0], dtype=complex), "1": np.array([0, 1], dtype=complex), "+": np.array([1, 1], dtype=complex) / math.sqrt(2)}
    v = np.array([1], dtype=complex)
    for ch in bits:
        v = np.kron(v, one[ch])
    return v


def terms_state(terms):
    idx = [int(t, 2) for t in terms.split("+")]
    n = len(terms.split("+")[0])
    v = np.zeros(2**n, dtype=complex)
    v[idx] = 1
    return v / np.linalg.norm(v)


def order_by_scan(x, N):
    if math.gcd(x, N) != 1:
        return None
    for r in range(1, N + 1):
        if pow(x, r, N) == 1 % N:
            return r
    return None


def cf_of(p, q):
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
    v = Fraction(cf[-1])
    for a in reversed(cf[:-1]):
        v = a + 1 / v
    return v


def convergent_fractions(cf):
    return [nested(cf[: l + 1]) for l in range(len(cf))]


def order_from_peak(y, m, x, N):
    for conv in convergent_fractions(cf_of(y, 2**m)):
        q = conv.denominator
        if 1 <= q < N and pow(x, q, N) == 1 % N:
            return q
    return None


def top_indices(p, k):
    rounded = [(-round(float(v) * 1e9), i) for i, v in enumerate(p)]
    return sorted(i for _, i in sorted(rounded)[:k])


def kernel(M, delta):
    return float(abs(np.mean(np.exp(2j * np.pi * delta * np.arange(M)))))


def clean(x, tol=1e-12):
    """Rounding noise below tol is the zero it is (the stage and the story read it as 0)."""
    return 0.0 if abs(x) < tol else float(x)


def root_sum(N, j):
    return float(abs(np.sum(np.exp(2j * np.pi * ((j * np.arange(N)) % N) / N))))


# ------------------------------------------------------------------ lists
P2 = [pow(2, k, 21) for k in range(7)]
P3 = [pow(3, k, 21) for k in range(8)]
places32 = [x for x in range(32) if pow(2, x, 21) == 1]

# the least period of f(x) = 2^x mod 21 over a long window, by comparing the list with shifted copies of itself
f = np.array([pow(2, x, 21) for x in range(60)])
period = next(r for r in range(1, 30) if np.array_equal(f[: 60 - r], f[r:]))

# the division lines of Euclid on (84, 36) by divmod, and the shortest whole pair (x, y) with 84x + 36y = 12 found by scanning a window
euclid_lines = []
_a, _b = 84, 36
while _b:
    euclid_lines.append(divmod(_a, _b))
    _a, _b = _b, _a % _b
bezout = min(((x, y) for x in range(-40, 41) for y in range(-40, 41) if 84 * x + 36 * y == math.gcd(84, 36)), key=lambda t: (abs(t[0]) + abs(t[1]), t[0]))

F8 = ifft_matrix(8)
c2 = F8 @ ket_plus_zero("++0")
c4 = F8 @ ket_plus_zero("+00")
c2s = F8 @ ket_plus_zero("++1")
c3 = F8 @ terms_state("000+011+110")
c32 = ifft_matrix(32) @ terms_state("00000+00110+01100+10010+11000+11110")
p32 = np.abs(c32) ** 2
p3 = np.abs(c3) ** 2

# the success set of the convergent test and the 6 tallest bars
success = [y for y in range(32) if order_from_peak(y, 5, 2, 21) == 6]
cf5 = cf_of(5, 32)
conv5 = convergent_fractions(cf5)


def conv_at(p, q, i):
    return float(convergent_fractions(cf_of(p, q))[i])


# the phase of (F_8)_{kj}: numpy's angle against 45*jk degrees (as a turn, mod 360)
phase_gap = 0.0
for k in range(8):
    for j in range(8):
        want = 45.0 * ((j * k) % 8)
        got = math.degrees(float(np.angle(F8[k, j]))) % 360.0
        diff = abs(got - want)
        phase_gap = max(phase_gap, min(diff, 360.0 - diff))

omega5 = np.exp(2j * np.pi / 5)
roots5 = np.exp(2j * np.pi * np.arange(5) / 5)
pair_gaps = [abs(roots5[i] - roots5[j]) for i in range(5) for j in range(5) if i != j]
ones_minus_i = abs(np.exp(2j * np.pi * 3 / 12) - 1j)

# the worst case of the kernel on |delta| <= 1/16 (M = 8), scanned finely on the grid the engine also uses
min_window = min(kernel(8, k / (64 * 16)) for k in range(-64, 65))
# the step-3 comb on eight places against sqrt(A/N) D_A(rk/N), A = 3 teeth
kernel_gap = max(abs(abs(c3[k]) - math.sqrt(3 / 8) * kernel(3, 3 * k / 8)) for k in range(8))
shift_gap = max(abs(abs(c2s[k]) - abs(c2[k])) for k in range(8))
unitary_gap = float(np.max(np.abs(F8.conj().T @ F8 - np.eye(8))))
spikes2 = [k for k in range(8) if abs(c2[k]) > 0.1]

values = {
    # f8-clock
    "f8Clock14": float(14 % 12),
    "f8Clock9p5": float((9 + 5) % 12),
    "f8NegMod": float((-3) % 12),
    "f8Pow2Sum6": float(sum(P2[:6])),
    "f8Pow2Back": float(P2[6]),
    "f8Period2Pow": float(period),
    "f8Comb32Sum": float(sum(places32)),
    "f8Comb32Count": float(len(places32)),
    "f8Comb32Step": float(places32[1] - places32[0]),
    "f8CombChance": float(abs(terms_state("00000+00110+01100+10010+11000+11110")[0]) ** 2),
    "f8Pow2e100": float(pow(2, 100, 21)),
    "f8HundredMod6": float(100 % 6),
    "f8Pow2e4": float(pow(2, 4, 21)),
    # f8-euclid
    "f8Gcd8436": float(math.gcd(84, 36)),
    "f8Mod8436": float(84 % 36),
    "f8Ratio8436": float(Fraction(84, 36)),
    "f8EuclidLines8436": float(len(euclid_lines)),
    "f8BezoutX": float(bezout[0]),
    "f8BezoutY": float(bezout[1]),
    "f8Gcd321": float(math.gcd(3, 21)),
    "f8Inv2mod21": float(pow(2, -1, 21)),
    "f8Inv4mod21": float(pow(4, -1, 21)),
    "f8Mul2x11": float((2 * 11) % 21),
    "f8Mul4x16": float((4 * 16) % 21),
    "f8Inv3Exists": 0.0,
    "f8Order2mod21": float(order_by_scan(2, 21)),
    "f8Order5mod21": float(order_by_scan(5, 21)),
    "f8Units21": float(sum(1 for a in range(1, 22) if math.gcd(a, 21) == 1)),
    "f8OrderDividesUnits": float(all(12 % order_by_scan(x, 21) == 0 for x in range(1, 21) if math.gcd(x, 21) == 1)),
    "f8HalfPow": float(pow(2, 3, 21)),
    "f8EightSqMinus1": float(pow(2, 3, 21) ** 2 - 1),
    "f8EightSqMinus1Mod21": float((pow(2, 3, 21) ** 2 - 1) % 21),
    "f8FacA": float(math.gcd(pow(2, 3, 21) - 1, 21)),
    "f8FacB": float(math.gcd(pow(2, 3, 21) + 1, 21)),
    "f8FacProduct": float(math.gcd(pow(2, 3, 21) - 1, 21) * math.gcd(pow(2, 3, 21) + 1, 21)),
    "f8Pow3Sum6": float(sum(P3[1:7])),
    "f8Pow3Back": float(P3[7]),
    "f8Pow3Hits1": float(sum(1 for v in P3[1:7] if v == 1)),
    "f8Order3Exists": 0.0 if order_by_scan(3, 21) is None else 1.0,
    # f8-roots
    "f8Omega5Re": float(omega5.real),
    "f8Omega5Im": float(omega5.imag),
    "f8Omega5pow5Gap": float(abs(omega5**5 - 1)),
    "f8Angle5": float(math.degrees(np.angle(omega5))),
    "f8Roots5AllRoots": float(max(abs(r**5 - 1) for r in roots5)),
    "f8Roots5MinGap": float(min(pair_gaps)),
    "f8RootSum5": root_sum(5, 1),
    "f8RootSum2": root_sum(2, 1),
    "f8ShiftSum5": float(abs(omega5 * np.sum(roots5) - np.sum(roots5))),
    "f8PowSum8j3": root_sum(8, 3),
    "f8PowSum8j2": root_sum(8, 2),
    "f8PowSum8j8": root_sum(8, 8),
    "f8Star8Corners": float(len({(3 * k) % 8 for k in range(8)})),
    "f8RootSum12": root_sum(12, 1),
    "f8Every3rd12": float(abs(np.sum(np.exp(2j * np.pi * 3 * np.arange(4) / 12)))),
    "f8First3of12": float(abs(np.sum(np.exp(2j * np.pi * np.arange(3) / 12)))),
    "f8Omega12CubeGap": float(ones_minus_i),
    # f8-dft
    "f8DftEntry11Re": float(F8[1, 1].real),
    "f8DftEntry11Im": float(F8[1, 1].imag),
    "f8DftEntry00": float(F8[0, 0].real),
    "f8DftEntry12Im": float(F8[1, 2].imag),
    "f8DftPhaseGap": float(phase_gap),
    "f8DftUnitary": unitary_gap,
    "f8Comb2Peak": float(abs(c2[0])),
    "f8Comb2Others": float(max(abs(c2[k]) for k in range(8) if k not in (0, 4))),
    "f8Comb4Peak": float(abs(c4[0])),
    "f8Comb4Others": float(max(abs(c4[k]) for k in range(1, 8, 2))),
    "f8Spike2Spacing": float(spikes2[1] - spikes2[0]),
    "f8ShiftC0Re": float(c2s[0].real),
    "f8ShiftC4Re": float(c2s[4].real),
    "f8ShiftSizeGap": float(shift_gap),
    "f8Omega84Re": float(np.exp(2j * np.pi * 4 / 8).real),
    "f8Comb3P0": float(p3[0]),
    "f8Comb3P3": float(p3[3]),
    "f8Comb3P5": float(p3[5]),
    "f8NoverR83a": 8 / 3,
    "f8NoverR83b": 16 / 3,
    "f8CombKernelGap": float(kernel_gap),
    # f8-geometric
    "f8GeomHalf4": float(np.sum(0.5 ** np.arange(4))),
    "f8GeomDirect": float(np.cumsum(0.5 ** np.arange(4))[-1]),
    "f8Chain240": float(abs(1 + np.exp(1j * math.radians(240)))),
    "f8Chord60": float(abs(1 - np.exp(1j * math.pi / 3))),
    "f8Chord90": float(abs(1 - np.exp(1j * math.pi / 2))),
    "f8Chord1rad": float(abs(1 - np.exp(1j * 1.0))),
    "f8TwoOverPi": 2 / math.pi,
    "f8Dir8Half": kernel(8, 1 / 16),
    "f8WorstChance8": kernel(8, 1 / 16) ** 2,
    "f8FourOverPi2": 4 / math.pi**2,
    "f8MinOnWindow8": float(min_window),
    "f8GeomU": 0.5,
    "f8Delta8Half": 1 / 16,
    "f8Delta8Full": 1 / 8,
    "f8Dir80": kernel(8, 0.0),
    "f8Dir8Full": clean(kernel(8, 1 / 8)),
    "f8Dir64half": kernel(64, 1 / 128),
    "f8Dir64Zero": clean(kernel(64, 1 / 64)),
    "f8Delta64Half": 1 / 128,
    "f8DirLimitGap": kernel(10000, 1 / 20000) - 2 / math.pi,
    # f8-fractions
    "f8Bin101": float(Fraction(1, 2) + Fraction(0) + Fraction(1, 8)),
    "f8Bin1Half": float(Fraction(1, 2)),
    "f8Bin001Eighth": float(Fraction(1, 8)),
    "f8Angle101": float(Fraction(5, 8) * 360),
    "f8Bin101x2frac": float((2 * Fraction(5, 8)) % 1),
    "f8Angle101x2": float(math.degrees(float(np.angle(np.exp(2j * np.pi * 0.625) ** 2))) % 360),
    "f8CfLast": float(Fraction(1, cf5[3])),
    "f8Frac1132": float(Fraction(11, 32)),
    "f8Frac2132": float(Fraction(21, 32)),
    "f8Conv1": float(conv5[1]),
    "f8Conv2": float(conv5[2]),
    "f8Conv3": float(conv5[3]),
    "f8Comb6TopSum": float(sum(top_indices(p32, 6))),
    "f8Gap5": float(abs(Fraction(5, 32) - Fraction(1, 6))),
    "f8HalfQsq6": float(Fraction(1, 2 * 36)),
    "f8Pow213mod21": float(pow(2, 13, 21)),
    "f8Pick5": float(order_from_peak(5, 5, 2, 21)),
    "f8Pick27": float(order_from_peak(27, 5, 2, 21)),
    "f8Pick11None": 0.0 if order_from_peak(11, 5, 2, 21) is None else 1.0,
    "f8Conv1132": conv_at(11, 32, 2),
    "f8Conv1632": float(convergent_fractions(cf_of(16, 32))[-1]),
    "f8Conv2132": conv_at(21, 32, 3),
    "f8Pow23mod21": float(pow(2, 3, 21)),
    "f8SuccessCount": float(len(success)),
    "f8SuccessP": float(sum(p32[y] for y in success)),
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "f8.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter F8, numpy and Python (remainders, powers, gcds and inverses from Python's %, pow and math.gcd; the Fourier "
            "matrix from numpy ifft(norm='ortho'); the roots of unity, their sums and the kernel D_M as numpy exponentials; exact Fractions for the binary and "
            "continued fractions, convergents from the nested form; never physics/qc/numtheory.ts, fourier.ts or F8.values.ts's own helpers). "
            "Regenerate: python3 pipeline/claims_qc709/f8.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
