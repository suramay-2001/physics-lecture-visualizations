#!/usr/bin/env python3
"""Reference values for the cryptography engine (app/src/physics/qc/crypto.ts and povm.ts's usdPovm / helstromPovm), computed by an
INDEPENDENT route.

The TypeScript engine builds circuits from the circuit module, reads reduced states with its partial-trace helpers and takes
trace norms with its own Jacobi SVD. This script uses none of that: every state is an explicit numpy vector, every gate an
explicit matrix (np.kron, block-diagonal controlled-Ry), every reduced state an einsum over the reshaped tensor, every eigen- or
trace-norm calculation numpy's own. The never-wrong POVM's coefficient is not taken from the closed form 1/(1 + c): it is FOUND, by
bisection on the largest t for which I - t(|a><a| + |b><b|) stays positive semidefinite; the Helstrom success is checked against a
brute-force scan of projective measurements over the Bloch sphere. Agreement is evidence, not the same code twice.

Conventions (decisions/qc709-map.md): q0 is the leftmost tensor factor = the most significant bit; kets are '0', '1', '+', '-';
complex numbers are written [re, im]; floats are rounded to 15 significant digits.

Usage: python3 pipeline/make_crypto_fixtures.py  -> app/src/physics/__fixtures__/qc-crypto.json   (deterministic; no seed)
"""
import json
import math
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
S2 = math.sqrt(2)
I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
KETS = {
    "0": np.array([1, 0], dtype=complex),
    "1": np.array([0, 1], dtype=complex),
    "+": np.array([1, 1], dtype=complex) / S2,
    "-": np.array([1, -1], dtype=complex) / S2,
}


def cx(z):
    return [float(np.real(z)), float(np.imag(z))]


def vec(v):
    return [cx(z) for z in np.asarray(v).ravel()]


def mat(m):
    return [[cx(z) for z in row] for row in np.asarray(m)]


def rounded(x):
    if isinstance(x, float):
        return float(f"{x:.15g}")
    if isinstance(x, dict):
        return {k: rounded(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rounded(v) for v in x]
    return x


def proj(v):
    return np.outer(v, v.conj())


def ry(phi):
    return np.array([[math.cos(phi / 2), -math.sin(phi / 2)], [math.sin(phi / 2), math.cos(phi / 2)]], dtype=complex)


def trace_norm(m):
    return float(np.sum(np.linalg.svd(m, compute_uv=False)))


def perp(v):
    """The unit vector orthogonal to a 2-vector: the eigenvector of 1 - |v><v| with eigenvalue 1 (numpy eigh, not the formula)."""
    w, u = np.linalg.eigh(np.eye(2) - proj(v))
    return u[:, int(np.argmax(w))]


def usd_povm(a, b):
    """E0 = t |b_perp><b_perp|, E1 = t |a_perp><a_perp|, E? = I - E0 - E1, t the LARGEST value keeping E? >= 0 (found by bisection)."""
    pb, pa = proj(perp(b)), proj(perp(a))
    lo, hi = 0.0, 4.0
    for _ in range(200):
        t = (lo + hi) / 2
        if np.linalg.eigvalsh(np.eye(2) - t * (pa + pb)).min() >= -1e-15:
            lo = t
        else:
            hi = t
    t = lo
    return [t * pb, t * pa, np.eye(2) - t * pb - t * pa], t


def helstrom_povm(r0, r1, eta):
    """Projectors on the non-positive (E0) and positive (E1) eigenspaces of Gamma = (1 - eta) r1 - eta r0."""
    g = (1 - eta) * r1 - eta * r0
    w, u = np.linalg.eigh(g)
    e1 = sum((proj(u[:, k]) for k in range(len(w)) if w[k] > 1e-12), np.zeros((2, 2), dtype=complex))
    return [np.eye(2) - e1, e1]


def helstrom_scan(r0, r1, eta, steps=2000):
    """The best success of a projective measurement, by scanning the Bloch sphere (a brute-force check of 1/2 (1 + ||Gamma||_1))."""
    best = 0.0
    for i in range(steps + 1):
        th = math.pi * i / steps
        for j in range(72):
            ph = 2 * math.pi * j / 72
            n = np.array([math.sin(th) * math.cos(ph), math.sin(th) * math.sin(ph), math.cos(th)])
            e1 = 0.5 * (np.eye(2) + n[0] * X + n[1] * Y + n[2] * Z)
            e0 = np.eye(2) - e1
            best = max(best, eta * np.trace(e0 @ r0).real + (1 - eta) * np.trace(e1 @ r1).real)
    return best


def caesar(text, shift):
    out = []
    for ch in text:
        if "a" <= ch <= "z":
            out.append(chr((ord(ch) - 97 + shift) % 26 + 97))
        elif "A" <= ch <= "Z":
            out.append(chr((ord(ch) - 65 + shift) % 26 + 65))
        else:
            out.append(ch)
    return "".join(out)


def xor_bits(a, b):
    return format(int(a, 2) ^ int(b, 2), f"0{len(a)}b")


# ------------------------------------------------------------------ B92
PSI0, PSI1 = KETS["0"], KETS["+"]
RHO = [proj(PSI0), proj(PSI1)]
BOB, _ = usd_povm(PSI0, PSI1)
EVE_MIN = helstrom_povm(RHO[0], RHO[1], 0.5)


def p_of(E, rho):
    return [float(np.trace(e @ rho).real) for e in E]


def b92(eve):
    kept = wrong = right = fail = 0.0
    for a in (0, 1):
        if eve == "none":
            br = [(1.0, a, None)]
        elif eve == "usd":
            q = p_of(BOB, RHO[a])
            br = [(q[0], 0, 0), (q[1], 1, 1), (q[2] / 2, 0, 0), (q[2] / 2, 1, 1)]
            fail += q[2] / 2
        else:
            q = p_of(EVE_MIN, RHO[a])
            br = [(q[0], 0, 0), (q[1], 1, 1)]
        for p, resend, belief in br:
            g = p_of(BOB, RHO[resend])
            conclusive = g[0] + g[1]
            kept += 0.5 * p * conclusive
            wrong += 0.5 * p * g[1 - a]
            right += 0.5 * p * conclusive * (0.5 if belief is None else (1.0 if belief == a else 0.0))
    return {"kept": kept, "inconclusive": 1 - kept, "qber": wrong / kept, "eveRight": right / kept, "eveFail": fail}


# ------------------------------------------------------------------ the probe
def probe(phi):
    cry = np.block([[np.eye(2), np.zeros((2, 2))], [np.zeros((2, 2)), ry(phi)]]).astype(complex)  # control = first wire

    def final(a, b):
        return cry @ np.kron(KETS[a], KETS[b])

    def reduced(psi, keep):
        t = psi.reshape(2, 2)
        return t @ t.conj().T if keep == 0 else t.T @ t.conj()

    def bloch(rho):
        return np.array([np.trace(rho @ P).real for P in (X, Y, Z)])

    z0, z1, xp, xm = final("0", "0"), final("1", "0"), final("+", "0"), final("-", "0")
    z_err = 0.5 * (1 - bloch(reduced(z0, 0))[2]) / 2 + 0.5 * (1 + bloch(reduced(z1, 0))[2]) / 2
    x_err = 0.5 * (1 - bloch(reduced(xp, 0))[0]) / 2 + 0.5 * (1 + bloch(reduced(xm, 0))[0]) / 2
    guess = 0.5 * (1 + 0.5 * trace_norm(reduced(z0, 1) - reduced(z1, 1)))
    return {
        "phi": phi,
        "zError": z_err,
        "xError": x_err,
        "qber": (z_err + x_err) / 2,
        "eveGuess": guess,
        "rA": float(np.linalg.norm(bloch(reduced(xp, 0)))),
        "rE": float(np.linalg.norm(bloch(reduced(xp, 1)))),
    }


# ------------------------------------------------------------------ secret sharing
def logical(theta, a):
    v = np.zeros(4, dtype=complex)
    v[0] = math.cos(theta)
    v[3] = math.sin(theta) * (1 if a == 0 else -1)
    return v


def share(theta):
    psi = logical(theta, 0)
    t = psi.reshape(2, 2)
    out = {}
    kets = []
    for sign in (1, -1):
        bra = KETS["+" if sign == 1 else "-"].conj()
        v = bra @ t  # Charlie's unnormalised ket after Bob reads +x / -x
        p = float(np.vdot(v, v).real)
        kets.append((v / math.sqrt(p), p))
    (kp, pp), (km, pm) = kets
    bloch = lambda k: [float(np.vdot(k, P @ k).real) for P in (X, Y, Z)]
    overlap = abs(np.vdot(kp, km))
    return {"theta": theta, "bobPlus": pp, "charliePlus": bloch(kp), "charlieMinus": bloch(km), "overlap": float(overlap), "usd": 1 - float(overlap)}


def share_theta_for(target):
    lo, hi = 0.0, math.pi / 4
    for _ in range(80):
        mid = (lo + hi) / 2
        if 1 - abs(math.cos(2 * mid)) < target:  # Charlie's two kets cos t|0> +- sin t|1> overlap exactly |cos 2t|
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2 * 180 / math.pi


def cheat(order, theta=math.pi / 8):
    kp = np.array([math.cos(theta), math.sin(theta)], dtype=complex)
    km = np.array([math.cos(theta), -math.sin(theta)], dtype=complex)
    E, _ = usd_povm(kp, km)
    XP = [proj(KETS["+"]), proj(KETS["-"])]
    Zs = [np.eye(4, dtype=complex), np.kron(Z, I2)]

    def sandwich(U, r):
        return U @ r @ U.conj().T

    def run(ord_):
        table = np.zeros((2, 2, 2, 3))
        joint = {}
        for a in (0, 1):
            rho = proj(logical(theta, a))
            for s in (0, 1):
                def read(after, m):
                    for b in (0, 1):
                        for cc in (0, 1, 2):
                            p = float(np.trace(np.kron(XP[b], E[cc]) @ after).real)
                            table[a, s, b, cc] += p
                            joint[(a, s, m, cc)] = joint.get((a, s, m, cc), 0.0) + p
                if ord_ == "honest":
                    read(sandwich(Zs[s], rho), None)
                else:
                    for m in (0, 1):
                        grab = lambda r: sandwich(np.kron(XP[m], I2), r)
                        read(sandwich(Zs[s], grab(rho)) if ord_ == "cheat-first" else grab(sandwich(Zs[s], rho)), m)
        return table, joint

    t, joint = run(order)
    h, _ = run("honest")
    gap = float(np.max(np.abs(t - h)))
    wrong = kept = 0.0
    for a in (0, 1):
        for s in (0, 1):
            for b in (0, 1):
                for cc in (0, 1):
                    kept += t[a, s, b, cc]
                    if (b ^ cc ^ s) != a:
                        wrong += t[a, s, b, cc]
    right = seen = 0.0
    for m in ((None,) if order == "honest" else (0, 1)):
        for cc in (0, 1):
            per = [sum(joint.get((a, s, m, cc), 0.0) for s in (0, 1)) for a in (0, 1)]
            right += max(per)
            seen += sum(per)
    return {"recordGap": gap, "errorRate": wrong / kept, "charlieGuess": right / seen, "kept": kept / 4}


# ------------------------------------------------------------------ Eq. 6.6
def eq66():
    phi = np.zeros(4, dtype=complex)
    phi[0] = phi[3] = 1 / S2
    bases = {0: [KETS["0"], KETS["1"]], 1: [KETS["+"], KETS["-"]]}  # setting 0 = z, 1 = x
    table = [[[0.0] * 4 for _ in range(2)] for _ in range(2)]
    for x in (0, 1):
        for y in (0, 1):
            for a in (0, 1):
                for b in (0, 1):
                    amp = np.vdot(np.kron(bases[x][a], bases[y][b]), phi)
                    table[x][y][2 * a + b] = float(abs(amp) ** 2)
    printed = [[[0.5 if x == y else 0.25] * 4 for y in (0, 1)] for x in (0, 1)]
    corrected = [[[(0.5 if a == b else 0.0) if x == y else 0.25 for a in (0, 1) for b in (0, 1)] for y in (0, 1)] for x in (0, 1)]
    lam = [[[0.0] * 4 for _ in range(2)] for _ in range(2)]
    for lz in (0, 1):
        for lx in (0, 1):
            for x in (0, 1):
                for y in (0, 1):
                    a = lz if x == 0 else lx
                    b = lz if y == 0 else lx
                    lam[x][y][2 * a + b] += 0.25
    gap = lambda p, q: float(max(abs(p[x][y][k] - q[x][y][k]) for x in (0, 1) for y in (0, 1) for k in range(4)))
    return {
        "table": table,
        "printedRowSum": float(sum(printed[0][0])),
        "printedGap": gap(table, printed),
        "correctedGap": gap(table, corrected),
        "lambdaGap": gap(table, lam),
    }


# ------------------------------------------------------------------ assemble
def build():
    usd_cases = []
    for name, (a, b) in {
        "0|+": (KETS["0"], KETS["+"]),
        "0|1": (KETS["0"], KETS["1"]),
        "tilt30": (np.array([1, 0], dtype=complex), np.array([math.cos(math.pi / 6), math.sin(math.pi / 6)], dtype=complex)),
        "complex": (np.array([1, 1j], dtype=complex) / S2, np.array([math.cos(0.4), math.sin(0.4) * np.exp(1j * 0.7)], dtype=complex)),
        "same": (KETS["+"], KETS["+"]),
    }.items():
        E, t = usd_povm(a, b)
        usd_cases.append({"name": name, "psi0": vec(a), "psi1": vec(b), "E": [mat(e) for e in E], "scale": t, "overlap": float(abs(np.vdot(a, b))), "success": 1 - float(abs(np.vdot(a, b)))})
    hel_cases = []
    for name, (r0, r1, eta) in {
        "0|+ even": (RHO[0], RHO[1], 0.5),
        "0|+ prior 0.3": (RHO[0], RHO[1], 0.3),
        "mixed": (0.7 * proj(KETS["0"]) + 0.3 * proj(KETS["1"]), proj(KETS["+"]), 0.5),
        "one-sided": (RHO[0], RHO[1], 0.95),
    }.items():
        E = helstrom_povm(r0, r1, eta)
        succ = float(eta * np.trace(E[0] @ r0).real + (1 - eta) * np.trace(E[1] @ r1).real)
        norm1 = trace_norm(eta * r0 - (1 - eta) * r1)
        hel_cases.append({"name": name, "rho0": mat(r0), "rho1": mat(r1), "eta": eta, "E": [mat(e) for e in E], "success": succ, "bound": 0.5 * (1 + norm1), "scan": helstrom_scan(r0, r1, eta, 300)})
    return {
        "about": "Reference values for physics/qc/crypto.ts and povm.ts (usdPovm, helstromPovm): explicit numpy vectors and matrices, a bisection for the never-wrong coefficient, a scan of projective measurements for Helstrom, einsum-free reductions. Regenerate: python3 pipeline/make_crypto_fixtures.py",
        "caesar": [{"text": t, "shift": s, "out": caesar(t, s)} for t, s in [("Caesar", 3), ("qubit", 3), ("Fdhvdu", -3), ("Zz aA!", 1), ("Attack at dawn", 13), ("hello", 26), ("hello", -29)]],
        "xor": [{"a": a, "b": b, "out": xor_bits(a, b)} for a, b in [("10110", "01101"), ("1111", "1111"), ("0101", "0000")]],
        "usd": usd_cases,
        "helstromPovm": hel_cases,
        "b92": {k: b92(k) for k in ("none", "usd", "minerr")},
        "probe": [probe(math.radians(d)) for d in (0, 30, 60, 90, 120, 180)],
        "share": [share(math.radians(d)) for d in (10, 22.5, 30, 40)],
        "shareTheta": {str(t): share_theta_for(t) for t in (0.2929, 0.5, 0.75)},
        "cheat": {k: cheat(k) for k in ("honest", "cheat-first", "sigma-first")},
        "eq66": eq66(),
    }


if __name__ == "__main__":
    out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qc-crypto.json"
    out.write_text(json.dumps(rounded(build()), indent=1, ensure_ascii=False) + "\n")
    print(f"wrote {out.relative_to(ROOT)}")
