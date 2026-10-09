#!/usr/bin/env python3
"""Reference values for the Grover engine (app/src/physics/qc/grover.ts), computed by an INDEPENDENT route.

The TypeScript engine builds Grover's circuit from the circuit module (phase oracles, H columns) and reads the state
column by column with in-place kernels; it also has a closed-form route through the invariant real plane. This script
uses neither: every operator is an explicit 2^n x 2^n numpy matrix (np.kron of Hadamards, np.diag for the oracles,
np.outer for projectors), Q = -U_H U_0 U_H U_f is multiplied out as in Bergou Eq. 7.14, the state after k steps is
np.linalg.matrix_power(Q, k) applied to |w0>, the best k is found by scanning k (not by the rounding rule), and Q's
eigenphase comes from np.linalg.eigvals. Agreement is therefore evidence, not the same code checking itself.

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the most significant bit; N = 2^n; a marked
string is read as the index of its bits (so 101 is 5). Complex numbers are written [re, im]; floats are rounded to 15
significant digits.

Usage: python3 pipeline/make_grover_fixtures.py  -> app/src/physics/__fixtures__/qc-grover.json   (deterministic; no seed)
"""
import json
import math
from functools import reduce
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
H1 = np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2)


def cx(z):
    return [float(np.real(z)), float(np.imag(z))]


def vec(v):
    return [cx(z) for z in np.asarray(v).ravel()]


def rounded(x):
    if isinstance(x, float):
        return float(f"{x:.15g}")
    if isinstance(x, dict):
        return {k: rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def hn(n):
    return reduce(np.kron, [H1] * n)


def basis(N, i):
    v = np.zeros(N, dtype=complex)
    v[i] = 1
    return v


def u_f(N, marked):
    """U_f = I - 2 sum_x |x><x| over the marked strings (Bergou Eq. 7.14, first line, many marked)."""
    return np.eye(N, dtype=complex) - 2 * sum(np.outer(basis(N, x), basis(N, x).conj()) for x in marked)


def u_0(N):
    return np.eye(N, dtype=complex) - 2 * np.outer(basis(N, 0), basis(N, 0).conj())


def big_q(n, marked):
    """Bergou's Q = -U_H U_0 U_H U_f."""
    N = 2 ** n
    H = hn(n)
    return -H @ u_0(N) @ H @ u_f(N, marked)


def w0(n):
    N = 2 ** n
    return hn(n) @ basis(N, 0)


def circuit_form(n, marked, k):
    """The circuit's own columns as matrices: H, then k times (phase oracle f, H, phase oracle 'flip all but 0', H)."""
    N = 2 ** n
    H = hn(n)
    f_mark = np.diag([(-1.0) ** (1 if x in marked else 0) for x in range(N)]).astype(complex)
    f_nz = np.diag([(-1.0) ** (0 if x == 0 else 1) for x in range(N)]).astype(complex)
    psi = H @ basis(N, 0)
    for _ in range(k):
        psi = H @ (f_nz @ (H @ (f_mark @ psi)))
    return psi


def alpha_np(N, M):
    return float(np.arcsin(np.sqrt(M / N)))


def kopt_scan(N, M):
    """The k leaving the arrow nearest straight up, found by scanning (ties go to the smaller k, N&C's halves-down)."""
    a = alpha_np(N, M)
    best, best_d = 0, abs(a - math.pi / 2)
    for k in range(1, 4 * int(math.sqrt(N)) + 4):
        d = abs((2 * k + 1) * a - math.pi / 2)
        if d < best_d - 1e-9:
            best, best_d = k, d
    return best


def plane_cases():
    cases = []
    # M = 1: n = 2..5, k = 0..6 (the 28 circuit-versus-plane cases of the plan), x0 spread over the strings
    for n in range(2, 6):
        N = 2 ** n
        for k in range(0, 7):
            x0 = (5 * k + 3 * n) % N
            Q = big_q(n, [x0])
            psi = np.linalg.matrix_power(Q, k) @ w0(n)
            circ = circuit_form(n, [x0], k)
            M = 1
            a = alpha_np(N, M)
            cases.append({"n": n, "marked": [x0], "k": k, "state": vec(psi), "circuit": vec(circ),
                          "pMarked": float(np.sum(np.abs(psi[[x0]]) ** 2)),
                          "plane": [float(np.cos((2 * k + 1) * a)), float(np.sin((2 * k + 1) * a))]})
    # several marked strings
    for n, marked in ((4, [1, 6, 11, 12]), (5, [3, 9, 17]), (3, [2, 7]), (4, [0, 15]), (5, [0])):
        N = 2 ** n
        M = len(marked)
        for k in range(0, 5):
            Q = big_q(n, marked)
            psi = np.linalg.matrix_power(Q, k) @ w0(n)
            circ = circuit_form(n, marked, k)
            a = alpha_np(N, M)
            cases.append({"n": n, "marked": marked, "k": k, "state": vec(psi), "circuit": vec(circ),
                          "pMarked": float(np.sum(np.abs(psi[marked]) ** 2)),
                          "plane": [float(np.cos((2 * k + 1) * a)), float(np.sin((2 * k + 1) * a))]})
    return cases


def angle_cases():
    out = []
    for N, M in ((2, 1), (4, 1), (8, 1), (16, 1), (16, 4), (32, 1), (64, 1), (1024, 1), (64, 5), (1024, 3)):
        a = alpha_np(N, M)
        out.append({"N": N, "M": M, "alpha": a, "alphaDeg": math.degrees(a), "kopt": kopt_scan(N, M),
                    "success": [float(np.sin((2 * k + 1) * a) ** 2) for k in range(0, 8)],
                    "successAtKopt": float(np.sin((2 * kopt_scan(N, M) + 1) * a) ** 2)})
    return out


def kopt_table():
    return [{"N": 2 ** n, "kopt": kopt_scan(2 ** n, 1)} for n in range(1, 11)] + \
           [{"N": N, "M": M, "kopt": kopt_scan(N, M)} for N, M in ((16, 4), (64, 3), (100, 7), (1000, 2))]


def reflection_cases():
    out = []
    for deg in (0.0, 20.704811, 30.0, 45.0, 60.0, 90.0, -15.0):
        th = math.radians(deg)
        u = np.array([np.cos(th), np.sin(th)])
        R = 2 * np.outer(u, u) - np.eye(2)  # reflection about the line through u, as 2|u><u| - I
        out.append({"deg": deg, "R": R.tolist()})
    alpha = alpha_np(8, 1)
    R0 = 2 * np.outer([1, 0], [1, 0]) - np.eye(2)
    RW = 2 * np.outer([np.cos(alpha), np.sin(alpha)], [np.cos(alpha), np.sin(alpha)]) - np.eye(2)
    rot = lambda t: np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
    return {"cases": out, "alphaDeg8": math.degrees(alpha), "product": (RW @ R0).tolist(), "reverse": (R0 @ RW).tolist(),
            "rot2a": rot(2 * alpha).tolist(), "rotMinus2a": rot(-2 * alpha).tolist()}


def bbbv_cases():
    out = []
    for n in range(1, 6):
        N = 2 ** n
        H = hn(n)
        for k in range(0, 6):
            # no oracle at all: the fixed steps only, D = -U_H U_0 U_H (the oracle removed from Q)
            D = -H @ u_0(N) @ H
            ref = np.linalg.matrix_power(D, k) @ w0(n)
            total = 0.0
            for x in range(N):
                Q = big_q(n, [x])
                psi = np.linalg.matrix_power(Q, k) @ w0(n)
                total += float(np.linalg.norm(psi - ref) ** 2)
            out.append({"n": n, "k": k, "D": total, "ref": vec(ref)})
    bounds = []
    a = 2 - math.sqrt(2)
    for N in (2, 4, 8, 16, 64, 256, 1024, 4096):
        d_low = N * a - 2 * math.sqrt(N)
        kmin = math.sqrt(max(d_low, 0) / 4)  # 4k^2 >= D_low  =>  k >= sqrt(D_low / 4)
        bounds.append({"N": N, "dLow": d_low, "k": kmin})
    return {"D": out, "bounds": bounds}


def step_bound_cases():
    """sum_x (|D_x|^2 + 4|D_x||<x|psi_k>| + w |<x|psi_k>|^2) for w = 1 (as printed) and w = 4 (the algebra), n = 3."""
    out = []
    n = 3
    N = 2 ** n
    H = hn(n)
    Dm = -H @ u_0(N) @ H
    for k in range(0, 3):
        ref = np.linalg.matrix_power(Dm, k) @ w0(n)
        row = {"n": n, "k": k}
        for w in (1, 4):
            s = 0.0
            for x in range(N):
                Q = big_q(n, [x])
                psi = np.linalg.matrix_power(Q, k) @ w0(n)
                d = float(np.linalg.norm(psi - ref))
                ax = float(abs(ref[x]))
                s += d * d + 4 * d * ax + w * ax * ax
            row[f"w{w}"] = s
        # D_{k+1}, the left side of the inequality
        total = 0.0
        refn = np.linalg.matrix_power(Dm, k + 1) @ w0(n)
        for x in range(N):
            Q = big_q(n, [x])
            total += float(np.linalg.norm(np.linalg.matrix_power(Q, k + 1) @ w0(n) - refn) ** 2)
        row["dNext"] = total
        out.append(row)
    return out


def slips_cases():
    out = {}
    # Eq. 7.15 (p. 121): printed versus corrected right side against the matrix Q, one marked string
    eq = []
    for n, x0, c1, c2 in ((3, 5, 1.0, 0.0), (4, 9, 1.0, 1.0), (4, 9, 0.6, -0.8), (3, 5, 0.0, 1.0), (5, 12, 0.3, 0.7)):
        N = 2 ** n
        t = 2 / math.sqrt(N)
        W = w0(n)
        X = basis(N, x0)
        psi = c1 * W + c2 * X
        Qpsi = big_q(n, [x0]) @ psi
        printed = c1 * W + (t + c2) * (X - t * X)
        corrected = c1 * W + (t * c1 + c2) * (X - t * W)
        eq.append({"n": n, "x0": x0, "c1": c1, "c2": c2, "printed": float(np.linalg.norm(printed - Qpsi)),
                   "corrected": float(np.linalg.norm(corrected - Qpsi))})
    out["eq715"] = eq
    # |x0perp> with a plus (printed) or minus: overlap with |x0>
    perp = []
    for n in (2, 3, 4, 5, 8):
        N = 2 ** n
        s = 1 / math.sqrt(N)
        W = w0(n)
        X = basis(N, 1)
        for sign in (1, -1):
            v = (W + sign * s * X) / math.sqrt(1 - s * s)
            perp.append({"n": n, "sign": sign, "overlap": float(abs(np.vdot(X, v))), "norm": float(np.linalg.norm(v))})
    out["perp"] = perp
    # -U_f against -(I - 2|w0><w0|)
    mu = []
    for n in (2, 3, 4):
        N = 2 ** n
        x0 = 1
        W = w0(n)
        a = -u_f(N, [x0])
        b = -(np.eye(N) - 2 * np.outer(W, W.conj()))
        mu.append({"n": n, "gap": float(np.max(np.abs(a - b)))})
    out["minusUf"] = mu
    # cos alpha
    ca = []
    for n in (2, 3, 4, 5, 8):
        N = 2 ** n
        ca.append({"N": N, "correct": math.sqrt(1 - 1 / N), "printed": math.sqrt(1 - 1 / math.sqrt(N)),
                   "overlapWith": float(np.vdot(w0(n), (w0(n) - (1 / math.sqrt(N)) * basis(N, 1)) / math.sqrt(1 - 1 / N)).real)})
    out["cosAlpha"] = ca
    # miss chances after k* steps
    miss = []
    for n in (3, 4, 5, 6):
        N = 2 ** n
        k = kopt_scan(N, 1)
        psi = np.linalg.matrix_power(big_q(n, [1]), k) @ w0(n)
        p = np.abs(psi) ** 2
        miss.append({"n": n, "k": k, "total": float(1 - p[1]), "perItem": float(p[0]), "bound": 1 / N})
    out["miss"] = miss
    return out


def eigen_cases():
    out = []
    for n, marked in ((3, [5]), (4, [3]), (4, [1, 6, 11, 12]), (5, [7]), (5, [2, 3, 4])):
        N = 2 ** n
        Q = big_q(n, marked)
        ev = np.linalg.eigvals(Q)
        phases = sorted(set(round(float(np.angle(z)), 9) for z in ev if abs(z - 1) > 1e-6 and abs(z + 1) > 1e-6))
        a = alpha_np(N, len(marked))
        # the eigenvector (|x0perp> - i |x0>) / sqrt 2 in the plane, to be mapped by Q to e^{2ia} times itself
        out.append({"n": n, "marked": marked, "alpha": a, "twoAlpha": 2 * a, "phases": phases,
                    "maxPhase": float(max(phases))})
    return out


data = {"plane": plane_cases(), "angle": angle_cases(), "kopt": kopt_table(), "reflect": reflection_cases(),
        "bbbv": bbbv_cases(), "stepBound": step_bound_cases(), "slips": slips_cases(), "eigen": eigen_cases()}
out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qc-grover.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(rounded(data), separators=(",", ":"), allow_nan=False))
print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
