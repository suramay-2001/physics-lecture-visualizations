#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q17.values.ts (Physics 709, chapter Q17: Grover's search).

Independent route (never Q17.values.ts's own helpers, never physics/qc/grover.ts or the circuit module): every operator is an explicit
2^n x 2^n numpy matrix (np.kron of Hadamards, np.eye minus np.outer for U_f and U_0), Bergou's Q = -U_H U_0 U_H U_f is multiplied out,
the state after k steps is Q^k applied to |w0> by repeated matrix-vector products (dense matrices all the way to N = 1024), the best
k is found by SCANNING k for the arrow nearest straight up (not by the rounding rule), the plane's angle is atan2 of the state's own
components, a reflection is 2|u><u| - I from the unit vector of its line, and the sqrt(N) lower bound is solved from 4k^2 = N(2 - sqrt 2) - 2 sqrt N.

Units: the qubit order is q0 = leftmost tensor factor = most significant bit (matches state.ts); the marked string 101 is index 5.

Usage (from the repo root): python3 pipeline/claims_qc709/q17.py -> app/src/physics/__fixtures__/claims-qc709/q17.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import math
from functools import reduce
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
H1 = np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2)


def hn(n):
    return reduce(np.kron, [H1] * n)


def e(N, i):
    v = np.zeros(N, dtype=complex)
    v[i] = 1
    return v


def u_f(N, marked):
    return np.eye(N, dtype=complex) - 2 * sum(np.outer(e(N, x), e(N, x).conj()) for x in marked)


def u_0(N):
    return np.eye(N, dtype=complex) - 2 * np.outer(e(N, 0), e(N, 0).conj())


def big_q(n, marked):
    N = 2 ** n
    H = hn(n)
    return -H @ u_0(N) @ H @ u_f(N, marked)


def diffusion(n):
    N = 2 ** n
    H = hn(n)
    return -H @ u_0(N) @ H


def w0(n):
    return hn(n) @ e(2 ** n, 0)


def step(M, v, k):
    for _ in range(k):
        v = M @ v
    return v


def scan_kopt(alpha):
    best, best_d = 0, abs(alpha - math.pi / 2)
    for k in range(1, 400):
        dist = abs((2 * k + 1) * alpha - math.pi / 2)
        if dist < best_d - 1e-9:
            best, best_d = k, dist
    return best


def plane_angle_deg(psi, x0, N):
    # the plane's coordinates: along |x0perp> the unmarked amplitude times sqrt(N-1), along |x0> the marked one
    other = 0 if x0 != 0 else 1
    return math.degrees(math.atan2(psi[x0].real, psi[other].real * math.sqrt(N - 1)))


n, N, X0 = 3, 8, 5
H3 = hn(n)
W = w0(n)
UF = u_f(N, [X0])
Q = big_q(n, [X0])
alpha = float(np.arcsin(abs(W[X0])))
alpha_deg = math.degrees(alpha)

s_mark = UF @ W                       # after the marking column
s1 = Q @ W                            # after one whole step
s2 = step(Q, W, 2)
s3 = step(Q, W, 3)
mark2, mark3 = UF @ s1, UF @ s2        # after the 2nd and 3rd marking columns


def spread(psi):
    rest = [psi[i].real for i in range(N) if i != X0]
    return max(rest) - min(rest)


# the circuit's own columns as matrices: H, phase oracle f, H, phase oracle 'flip all but 000', H
f_mark = np.diag([-1.0 if x == X0 else 1.0 for x in range(N)]).astype(complex)
f_nz = np.diag([1.0 if x == 0 else -1.0 for x in range(N)]).astype(complex)
step_cols = H3 @ f_nz @ H3 @ f_mark

# Eq. 7.15
t = 2 / math.sqrt(N)


def eq715(c1, c2):
    X = e(N, X0)
    psi = c1 * W + c2 * X
    Qpsi = Q @ psi
    printed = c1 * W + (t + c2) * (X - t * X)
    corrected = c1 * W + (t * c1 + c2) * (X - t * W)
    return float(np.linalg.norm(printed - Qpsi)), float(np.linalg.norm(corrected - Qpsi))


def perp_overlap(sign):
    s = float(W[X0].real)
    v = (W + sign * s * e(N, X0)) / math.sqrt(1 - s * s)
    return float(abs(np.vdot(e(N, X0), v)))


def reflection(deg):
    u = np.array([math.cos(math.radians(deg)), math.sin(math.radians(deg))])
    return 2 * np.outer(u, u) - np.eye(2)


def rot(deg):
    a = math.radians(deg)
    return np.array([[math.cos(a), -math.sin(a)], [math.sin(a), math.cos(a)]])


RW = reflection(alpha_deg)
R0 = reflection(0)
M30 = reflection(30) @ reflection(0)

# N = 4, N = 16 with four marked strings, N = 1024
Q4 = big_q(2, [3])
p_n4 = float(abs((Q4 @ w0(2))[3]) ** 2)
a4 = float(np.arcsin(abs(w0(2)[3])))
marked16 = [1, 6, 11, 12]
Q16 = big_q(4, marked16)
f16 = Q16 @ w0(4)
p_m4 = float(sum(abs(f16[i]) ** 2 for i in marked16))
N1024 = 1024
a1024 = float(np.arcsin(abs(w0(10)[7])))
k1024 = scan_kopt(a1024)
Q1024 = big_q(10, [7])
W1024 = w0(10)
p1024 = float(abs(step(Q1024, W1024, k1024)[7]) ** 2)
p12 = float(abs(step(Q1024, W1024, 12)[7]) ** 2)


# D_k of Grover's own run, matrix route
def d_k(k):
    Dm = diffusion(n)
    ref = step(Dm, W, k)
    total = 0.0
    for x in range(N):
        psi = step(big_q(n, [x]), W, k)
        total += float(np.linalg.norm(psi - ref) ** 2)
    return total


still = float(np.max(np.abs(step(diffusion(n), W, 2) - W)))


def step_bound(weight):
    ref = W  # k = 0: no oracle, no steps
    s = 0.0
    for x in range(N):
        psi = W  # |psi_0^x> = |psi_in>
        dd = float(np.linalg.norm(psi - ref))
        ax = float(abs(ref[x]))
        s += dd * dd + 4 * dd * ax + weight * ax * ax
    return s


# the oracle call is the first thing in Eq. 7.20, so psi_0^x = psi_in for every x and the induction starts from D_0 = 0
step_bound_printed = step_bound(1)
step_bound_true = step_bound(4)

a_dlow = 2 - math.sqrt(2)
bbbv_1024 = math.sqrt((N1024 * a_dlow - 2 * math.sqrt(N1024)) / 4)

p = abs(step(Q, W, 2)) ** 2
mgap = float(np.max(np.abs(-UF - (-(np.eye(N) - 2 * np.outer(W, W.conj()))))))
kopt8 = scan_kopt(alpha)

values = {
    # q17-oracle
    "q17Bar": float(abs(s_mark[0])),
    "q17MeanAfterOracle": float(np.mean(s_mark).real),
    "q17Blind": float(abs(s_mark[X0]) ** 2),
    "q17QIsCircuit": float(np.max(np.abs(step_cols - Q))),
    # q17-plane
    "q17StartChance": float(abs(W[X0]) ** 2),
    "q17SinA": float(abs(W[X0])),
    "q17AlphaDeg": alpha_deg,
    "q17CosA": float(np.linalg.norm(np.delete(W, X0))),
    "q17TwoOverRootN": float(((W - UF @ W)[X0]).real),
    "q17PlaneClosed": eq715(0.6, -0.8)[1],
    "q17UnmarkedEqual": max(spread(W), spread(s_mark), spread(s1), spread(mark2), spread(s2), spread(mark3), spread(s3)),
    "q17Angle1": plane_angle_deg(s1, X0, N),
    "q17Angle2": plane_angle_deg(s2, X0, N),
    "q17Angle3": plane_angle_deg(s3, X0, N),
    "q17BookPerpOverlap": perp_overlap(1),
    "q17PerpTrueOverlap": perp_overlap(-1),
    "q17SinN16": float(abs(w0(4)[5])),
    # q17-two-reflections
    "q17R0": float(np.max(np.abs(R0 - np.diag([1.0, -1.0])))),
    "q17Cos2a": float(RW[0, 0]),
    "q17Sin2a": float(RW[0, 1]),
    "q17TwoAlphaDeg": 2 * alpha_deg,
    "q17ProductIsRot": float(np.max(np.abs(RW @ R0 - rot(2 * alpha_deg)))),
    "q17ReverseTurn": float(np.max(np.abs(R0 @ RW - rot(-2 * alpha_deg)))),
    "q17TrThirty": math.degrees(math.atan2(M30[1, 0], M30[0, 0])),
    # q17-iterate
    "q17P1": float(abs(s1[X0]) ** 2),
    "q17P2": float(abs(s2[X0]) ** 2),
    "q17P3": float(abs(s3[X0]) ** 2),
    "q17InvUnmarked": float(s1[0].real),
    "q17InvMarked": float(s1[X0].real),
    "q17MeanAfterStep": float(np.mean(s1).real),
    "q17Kopt8": float(kopt8),
    "q17Kopt1024": float(k1024),
    "q17P1024": p1024,
    "q17Fail8": float(1 - abs(s2[X0]) ** 2),
    "q17FailBound8": float(abs(W[X0]) ** 2),
    "q17QuarterSteps": math.pi / (4 * alpha),
    "q17KoptRaw": (math.pi - 2 * alpha) / (4 * alpha),
    "q17Angle1024": math.degrees((2 * k1024 + 1) * a1024),
    "q17Over2": plane_angle_deg(s2, X0, N) - 90,
    "q17Short1": 90 - plane_angle_deg(s1, X0, N),
    "q17N4P": p_n4,
    "q17N4Alpha": math.degrees(a4),
    "q17M4P": p_m4,
    # q17-optimal
    "q17DiffOnlyStill": still,
    "q17D1": d_k(1),
    "q17D2": d_k(2),
    "q17D3": d_k(3),
    "q17Bbbv1024": bbbv_1024,
    "q17BbbvQueries1024": float(math.ceil(bbbv_1024)),
    "q17P12of1024": p12,
    # the four Corrections
    "q17E1Printed": eq715(1.0, 0.0)[0],
    "q17E1Corrected": eq715(1.0, 0.0)[1],
    "q17E2UfGap": mgap,
    "q17CosPrinted": math.sqrt(1 - 1 / math.sqrt(N)),
    "q17MissPerItem": float(p[0]),
    "q17StepBoundPrinted": step_bound_printed,
    "q17StepBoundTrue": step_bound_true,
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q17.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q17, numpy (explicit 2^n x 2^n matrices: np.kron Hadamards, np.eye - np.outer oracles, "
            "Q = -U_H U_0 U_H U_f multiplied out, matrix-vector products to N = 1024, k found by a scan, reflections as 2|u><u| - I; never "
            "physics/qc/grover.ts or Q17.values.ts's own helpers). Regenerate: python3 pipeline/claims_qc709/q17.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
