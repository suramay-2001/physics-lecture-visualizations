#!/usr/bin/env python3
"""Reference values for the TypeScript physics engine, computed independently with numpy.

The engine uses closed forms (a₀ ± |a| eigenvalues, cos/sin rotation formula); this script
uses numpy.linalg.eigh and spectral exponentials instead, so agreement is real evidence and
not the same code checking itself.

Usage: python3 pipeline/make_fixtures.py  → app/src/physics/__fixtures__/numpy.json
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(448)

sx = np.array([[0, 1], [1, 0]], complex) / 2
sy = np.array([[0, -1j], [1j, 0]], complex) / 2
sz = np.array([[1, 0], [0, -1]], complex) / 2


def cplx(z):
    return {"re": float(np.real(z)), "im": float(np.imag(z))}


def vec(v):
    return [cplx(x) for x in v]


def mat(m):
    return [[cplx(x) for x in row] for row in m]


def rand_state():
    v = rng.normal(size=2) + 1j * rng.normal(size=2)
    return v / np.linalg.norm(v)


def rand_hermitian():
    a = rng.normal(size=(2, 2)) + 1j * rng.normal(size=(2, 2))
    return (a + a.conj().T) / 2


def expm_hermitian(H, t):
    """exp(-i t H) through the eigen-decomposition (not the closed form the engine uses)."""
    w, V = np.linalg.eigh(H)
    return V @ np.diag(np.exp(-1j * t * w)) @ V.conj().T


states = []
for _ in range(20):
    psi = rand_state()
    ev = lambda A: float(np.real(psi.conj() @ A @ psi))
    states.append({
        "psi": vec(psi),
        "Sx": ev(sx), "Sy": ev(sy), "Sz": ev(sz),
        "varSx": ev(sx @ sx) - ev(sx) ** 2,
        "bloch": [2 * ev(sx), 2 * ev(sy), 2 * ev(sz)],
    })

hermitians = []
for _ in range(20):
    H = rand_hermitian()
    w, V = np.linalg.eigh(H)  # ascending
    order = np.argsort(-w)
    hermitians.append({
        "M": mat(H),
        "values": [float(w[i]) for i in order],
        # projectors are phase-independent, so compare those rather than eigenvectors
        "projectors": [mat(np.outer(V[:, i], V[:, i].conj())) for i in order],
    })

rotations = []
for _ in range(15):
    n = rng.normal(size=3)
    n /= np.linalg.norm(n)
    phi = float(rng.uniform(-2 * np.pi, 2 * np.pi))
    H = n[0] * sx + n[1] * sy + n[2] * sz
    psi = rand_state()
    U = expm_hermitian(H, phi)
    out = U @ psi
    rotations.append({
        "n": n.tolist(), "phi": phi, "U": mat(U), "psi": vec(psi),
        "bloch_after": [float(np.real(2 * out.conj() @ A @ out)) for A in (sx, sy, sz)],
    })

basis_changes = []
for _ in range(10):
    Q, _ = np.linalg.qr(rng.normal(size=(2, 2)) + 1j * rng.normal(size=(2, 2)))
    A = rand_hermitian()
    psi = rand_state()
    basis_changes.append({
        "basis": [vec(Q[:, 0]), vec(Q[:, 1])],
        "A": mat(A), "psi": vec(psi),
        "A_new": mat(Q.conj().T @ A @ Q),
        "psi_new": vec(Q.conj().T @ psi),
        "expectation": float(np.real(psi.conj() @ A @ psi)),
    })

# Numbers quoted in (or corrected from) the lectures.
def p_up(theta):
    n = np.array([np.sin(theta), 0, np.cos(theta)])
    H = n[0] * sx + n[2] * sz
    w, V = np.linalg.eigh(H)
    up = V[:, np.argmax(w)]
    return float(abs(up.conj() @ np.array([1, 0])) ** 2)

lecture_numbers = {
    "P_up_45deg": p_up(np.pi / 4),   # Lecture 1 claims 3/4; the correct value is ≈ 0.854
    "P_up_60deg": p_up(np.pi / 3),   # where 3/4 actually occurs
    "P_up_90deg": p_up(np.pi / 2),
    "Sz_L4_state": float(np.real(np.array([np.sqrt(3) / 2, 0.5]).conj() @ sz @ np.array([np.sqrt(3) / 2, 0.5]))),
}

# ---------------------------------------------------------------------------------------------------------
# W1 sections (W-L1 §3.2, §3.3, §3.5). Each uses its OWN generator, so the sections above keep their exact
# values (they consume `rng` first, in the same order as before) and the new ones do not depend on them.

PAULI = [
    np.array([[0, 1], [1, 0]], complex),
    np.array([[0, -1j], [1j, 0]], complex),
    np.array([[1, 0], [0, -1]], complex),
]  # σ_k (NOT S_k = σ_k / 2)
I2 = np.eye(2, dtype=complex)
EPS = 1e-9  # the engine's default eps in classify()


def unit3(v):
    return v / np.linalg.norm(v)


def n_dot_sigma(n):
    return n[0] * PAULI[0] + n[1] * PAULI[1] + n[2] * PAULI[2]


def expm_taylor(M, terms=30):
    """e^M by a Taylor series with scaling and squaring: halve M until ‖M‖₁ ≤ 1/2, sum 30 terms, square back.
    Deliberately NOT the closed form e^s (cosh q I + sinh q / q N) that operators.ts uses."""
    s = 0
    norm1 = np.linalg.norm(M, 1)
    while norm1 / 2 ** s > 0.5:
        s += 1
    A = M / 2 ** s
    E = I2.copy()
    term = I2.copy()
    for k in range(1, terms + 1):
        term = term @ A / k
        E = E + term
    for _ in range(s):
        E = E @ E
    return E


def classify_np(M):
    """Mirror of OpClass by np.allclose(atol=EPS). Returns None when any test sits within a factor 10 of EPS:
    such a matrix's class depends on the threshold, so it is not a fair fixture (the TS test skips it)."""
    Md = M.conj().T
    ambiguous = False

    def ac(X, Y):
        nonlocal ambiguous
        dev = float(np.max(np.abs(np.asarray(X) - np.asarray(Y))))
        if EPS / 10 <= dev <= EPS * 10:
            ambiguous = True
        return bool(np.allclose(X, Y, rtol=0, atol=EPS))

    hermitian = ac(M, Md)
    M2 = M @ M
    out = {
        "hermitian": hermitian,
        "antiHermitian": ac(M, -Md),
        "unitary": ac(Md @ M, I2),
        "normal": ac(M @ Md, Md @ M),
        "projector": hermitian and ac(M2, M),
        "involution": ac(M2, I2),
        "scalar": ac(np.array([np.trace(M @ P) / 2 for P in PAULI]), np.zeros(3)),
        "rank": int(np.linalg.matrix_rank(M, tol=EPS)),
    }
    sv = np.linalg.svd(M, compute_uv=False)
    det = abs(M[0, 0] * M[1, 1] - M[0, 1] * M[1, 0])
    if any(EPS / 10 <= x <= EPS * 10 for x in sv) or EPS / 10 <= det <= EPS * 10:
        ambiguous = True
    # The engine ranks by |det| (rank 1 ⇔ |det| ≤ eps); only keep cases where that agrees with the SVD rank.
    if out["rank"] == 2 and det <= EPS:
        ambiguous = True
    return None if ambiguous else out


def op_case(kind, M):
    M = np.asarray(M, complex)
    return {
        "kind": kind,
        "M": mat(M),
        "a0": cplx(np.trace(M) / 2),
        "a": [cplx(np.trace(M @ P) / 2) for P in PAULI],
        "class": classify_np(M),
        "expm": mat(expm_taylor(M)),
    }


def operator_cases():
    g = np.random.default_rng(4481)

    def cnormal():
        return g.normal(size=(2, 2)) + 1j * g.normal(size=(2, 2))

    def herm():
        a = cnormal()
        return (a + a.conj().T) / 2

    def ket():
        v = g.normal(size=2) + 1j * g.normal(size=2)
        return v / np.linalg.norm(v)

    cases = []
    for _ in range(4):
        cases.append(op_case("general", cnormal()))
    for k in (2.0, 3.0):  # larger norms exercise several squarings
        cases.append(op_case("general", k * cnormal()))
    for _ in range(3):
        cases.append(op_case("hermitian", herm()))
    for _ in range(2):
        cases.append(op_case("antiHermitian", 1j * herm()))
    for _ in range(3):
        Q, _ = np.linalg.qr(cnormal())
        cases.append(op_case("unitary", Q))
    for _ in range(2):
        psi = ket()
        cases.append(op_case("projector", np.outer(psi, psi.conj())))
    cases.append(op_case("projector", np.zeros((2, 2))))  # rank 0
    cases.append(op_case("projector", I2))  # rank 2, scalar
    cases.append(op_case("nilpotent", [[0, 1], [0, 0]]))
    V = cnormal()
    cases.append(op_case("nilpotent", V @ np.array([[0, 0.8 - 0.3j], [0, 0]]) @ np.linalg.inv(V)))
    cases.append(op_case("scalar", complex(g.normal(), g.normal()) * I2))
    cases.append(op_case("involution", n_dot_sigma(unit3(g.normal(size=3)))))
    # Near-degenerate: M = s I + N with N² = q² I and tiny q, on both sides of the engine's series switch
    # (|q| < 1e-4). Three shapes of N: q n̂·σ⃗ (normal), a complex q, and q [[1, 50], [0, −1]] (non-normal).
    for q in (1e-9, 1e-5, 2e-4, 1e-3):
        s = complex(g.normal(), g.normal())
        n = unit3(g.normal(size=3))
        cases.append(op_case("near-degenerate", s * I2 + q * n_dot_sigma(n)))
        cases.append(op_case("near-degenerate", s * I2 + q * (0.6 + 0.8j) * n_dot_sigma(n)))
        cases.append(op_case("near-degenerate", s * I2 + q * np.array([[1, 50], [0, -1]])))
    evolve = []
    for _ in range(5):
        H = herm()
        t = float(g.uniform(-3, 3))
        evolve.append({"H": mat(H), "t": t, "U": mat(expm_taylor(-1j * t * H))})
    return {"cases": cases, "evolve": evolve}


def bloch_of(rho):
    return [float(np.real(np.trace(rho @ P))) for P in PAULI]


def max_p_plus_scan(rho):
    """Best P(+) over measurement axes by a GRID SCAN: rotate ρ about z so its Bloch vector lies in the x–z
    half-plane (x ≥ 0), then try n(θ) = (sin θ, 0, cos θ) for θ ∈ [0°, 360°) in 0.01° steps, with P(+) from the
    eigh projector of n·σ. Honest scope: the scan covers only the great circle through ±z and r̂ (after the
    rotation), not the whole sphere; the value it checks is the maximum over that circle. The grid is at most
    0.005° off the best axis, so the scan sits below the exact maximum by at most |r|(1 − cos 0.005°)/2 ≈ 2e-9."""
    r = bloch_of(rho)
    phi = np.arctan2(r[1], r[0])
    U = np.diag([np.exp(0.5j * phi), np.exp(-0.5j * phi)])  # R_z(−φ)
    rho_r = U @ rho @ U.conj().T
    assert abs(bloch_of(rho_r)[1]) < 1e-12
    th = np.deg2rad(np.arange(36000) * 0.01)
    ops = np.sin(th)[:, None, None] * PAULI[0] + np.cos(th)[:, None, None] * PAULI[2]
    _, V = np.linalg.eigh(ops)  # ascending, so column 1 is the +1 eigenvector
    v = V[:, :, 1]
    p = np.real(np.einsum("ni,ij,nj->n", v.conj(), rho_r, v))
    return float(p.max())


def density_case(label, weights, kets, n_raw):
    kets = [np.asarray(k, complex) for k in kets]
    rho = sum(w * np.outer(k, k.conj()) for w, k in zip(weights, kets))
    n = unit3(np.asarray(n_raw, float))
    _, V = np.linalg.eigh(n_dot_sigma(n))
    P_minus = np.outer(V[:, 0], V[:, 0].conj())
    P_plus = np.outer(V[:, 1], V[:, 1].conj())
    p_plus = float(np.real(np.trace(P_plus @ rho)))
    p_minus = float(np.real(np.trace(P_minus @ rho)))
    return {
        "label": label,
        "parts": [{"w": float(w), "psi": vec(k), "r": bloch_of(np.outer(k, k.conj()))} for w, k in zip(weights, kets)],
        "rho": mat(rho),
        "r": bloch_of(rho),
        "purity": float(np.real(np.trace(rho @ rho))),
        "n": [float(x) for x in n_raw],
        "pPlus": p_plus,
        "nonSelective": bloch_of(P_plus @ rho @ P_plus + P_minus @ rho @ P_minus),
        # the kept beam's state is undefined when that outcome never happens (p ≈ 0): stored as null
        "selectivePlus": {"p": p_plus, "r": bloch_of(P_plus @ rho @ P_plus / p_plus) if p_plus > 1e-9 else None},
        "selectiveMinus": {"p": p_minus, "r": bloch_of(P_minus @ rho @ P_minus / p_minus) if p_minus > 1e-9 else None},
        "maxPPlusScan": max_p_plus_scan(rho),
    }


def density_cases():
    g = np.random.default_rng(4482)

    def ket():
        v = g.normal(size=2) + 1j * g.normal(size=2)
        return v / np.linalg.norm(v)

    cases = []
    for i in range(12):
        k = int(g.integers(2, 5))  # 2–4 kets
        w = g.dirichlet(np.ones(k))
        kets = [ket() for _ in range(k)]
        n_raw = g.normal(size=3) * g.uniform(0.5, 2.0)  # not unit: the engine normalizes n
        cases.append(density_case(f"random-{i}", w, kets, n_raw))
    zp = np.array([1, 0], complex)
    zm = np.array([0, 1], complex)
    xp = np.array([1, 1], complex) / np.sqrt(2)
    sup = (zp + xp) / np.linalg.norm(zp + xp)
    # Decision #6: ½|+z⟩⟨+z| + ½|+x⟩⟨+x| → |r| = 1/√2, best P(+) = (1 + 1/√2)/2 ≈ 0.8536; the superposition → 1.
    cases.append(density_case("decision6-mixture", [0.5, 0.5], [zp, xp], [1, 0, 1]))
    cases.append(density_case("decision6-superposition", [1.0], [sup], [1, 0, 1]))
    cases.append(density_case("oven", [0.5, 0.5], [zp, zm], [0, 0, 1]))
    return cases


def expr_value_cases():
    """Hand-written Python equivalents of expression strings; the expected values never come from a parser.
    value None = the engine must reject (Python raises or returns a non-finite value)."""
    import cmath
    import math

    pi = math.pi
    real = [
        ("0.75", lambda: 0.75),
        ("3/4", lambda: 3 / 4),
        (".5", lambda: 0.5),
        ("√3/2", lambda: math.sqrt(3) / 2),
        ("sqrt(3)/2", lambda: math.sqrt(3) / 2),
        ("1/sqrt2", lambda: 1 / math.sqrt(2)),
        ("1/√2", lambda: 1 / math.sqrt(2)),
        ("cos(pi/8)^2", lambda: math.cos(pi / 8) ** 2),
        ("2pi", lambda: 2 * pi),
        ("2 pi", lambda: 2 * pi),
        ("-ħ/2", lambda: -0.5),
        ("ħ/4", lambda: 0.25),
        ("hbar/4", lambda: 0.25),
        ("(1+√2)/2", lambda: (1 + math.sqrt(2)) / 2),
        ("−1/2", lambda: -1 / 2),
        ("3 × 0.25", lambda: 3 * 0.25),
        ("6 ÷ 4", lambda: 6 / 4),
        ("2·3", lambda: 2 * 3),
        ("1e-3", lambda: 1e-3),
        ("2e3", lambda: 2e3),
        ("2e", lambda: 2 * math.e),
        ("e^2", lambda: math.e ** 2),
        ("exp(1)", lambda: math.exp(1)),
        ("ln(e^3)", lambda: math.log(math.e ** 3)),
        ("abs(-3)", lambda: abs(-3)),
        ("tan(pi/3)", lambda: math.tan(pi / 3)),
        ("sin(pi/6)cos(pi/3)", lambda: math.sin(pi / 6) * math.cos(pi / 3)),
        ("2sqrt(2)", lambda: 2 * math.sqrt(2)),
        ("√2√2", lambda: math.sqrt(2) * math.sqrt(2)),
        ("√√16", lambda: math.sqrt(math.sqrt(16))),
        ("2(3+4)", lambda: 2 * (3 + 4)),
        ("(1)(2)", lambda: 1 * 2),
        ("PI/2", lambda: pi / 2),
        ("1 2", lambda: 12),
        ("-2^2", lambda: -(2 ** 2)),
        ("2^-1", lambda: 2 ** -1),
        ("2^3^2", lambda: 2 ** (3 ** 2)),
        ("2^-2^2", lambda: 2 ** -(2 ** 2)),
        ("2^3*4", lambda: 2 ** 3 * 4),
        ("4/2/2", lambda: 4 / 2 / 2),
        ("--2", lambda: 2),
        ("+-+2", lambda: -2),
        ("-√4", lambda: -math.sqrt(4)),
        ("cos(pi)^2", lambda: math.cos(pi) ** 2),
        ("1/0", lambda: 1 / 0),
        ("0/0", lambda: 0 / 0),
        ("9^9^9", lambda: 9.0 ** (9.0 ** 9)),
        ("1e309", lambda: float("1e309")),
        ("ln(0)", lambda: math.log(0)),
        ("sqrt(-1)", lambda: math.sqrt(-1)),
        ("1/(1/0)", lambda: 1 / (1 / 0)),
    ]
    complex_ = [
        ("i^2", lambda: 1j ** 2),
        ("sqrt(-1)", lambda: cmath.sqrt(-1)),
        ("sqrt(-4)", lambda: cmath.sqrt(-4)),
        ("sqrt(3+4i)", lambda: cmath.sqrt(3 + 4j)),
        ("sqrt(-3-4i)", lambda: cmath.sqrt(-3 - 4j)),
        ("2i", lambda: 2j),
        ("3+4i", lambda: 3 + 4j),
        ("-i/√2", lambda: -1j / math.sqrt(2)),
        ("(1+i)/√2", lambda: (1 + 1j) / math.sqrt(2)),
        ("1/(1+i)", lambda: 1 / (1 + 1j)),
        ("e^(i*pi)", lambda: cmath.exp(1j * pi)),
        ("e^(i pi/4)", lambda: cmath.exp(1j * pi / 4)),
        ("e^(iπ/4)/√2", lambda: cmath.exp(1j * pi / 4) / math.sqrt(2)),
        ("exp(1+2i)", lambda: cmath.exp(1 + 2j)),
        ("i sin(1)", lambda: 1j * math.sin(1)),
        ("conj(3+4i)", lambda: (3 + 4j).conjugate()),
        ("abs(3+4i)", lambda: abs(3 + 4j)),
        ("arg(i)", lambda: cmath.phase(1j)),
        ("arg(-1)", lambda: cmath.phase(-1)),
        ("re(2-3i)", lambda: (2 - 3j).real),
        ("im(2-3i)", lambda: (2 - 3j).imag),
        ("ln(-1)", lambda: cmath.log(-1)),
        ("cos(i)", lambda: cmath.cos(1j)),
        ("sin(1+i)", lambda: cmath.sin(1 + 1j)),
        ("tan(1+i)", lambda: cmath.tan(1 + 1j)),
        ("(2+i)^(1-i)", lambda: (2 + 1j) ** (1 - 1j)),
        ("i^i", lambda: 1j ** 1j),
        ("(1-i)^3", lambda: (1 - 1j) ** 3),
        ("(-8)^(1/3)", lambda: (-8) ** (1 / 3)),
        ("cos(pi/8)^2", lambda: math.cos(pi / 8) ** 2),
        ("2pi", lambda: 2 * pi),
        ("1/0", lambda: 1 / 0),
        ("ln(0)", lambda: cmath.log(0)),
        ("0^i", lambda: 0 ** 1j),
    ]
    with_vars = [
        ("sin(x)^2+cos(x)^2", {"x": 0.7}, lambda x: math.sin(x) ** 2 + math.cos(x) ** 2),
        ("2x^2-3x+1", {"x": 1.5}, lambda x: 2 * x ** 2 - 3 * x + 1),
        ("e^(-x)cos(2πx)", {"x": 0.3}, lambda x: math.exp(-x) * math.cos(2 * pi * x)),
        ("x/t", {"x": 1.0, "t": 0.0}, lambda x, t: x / t),
        ("x/t", {"x": 1.0, "t": 4.0}, lambda x, t: x / t),
    ]

    def run(f, *args):
        try:
            v = complex(f(*args))
        except (ZeroDivisionError, ValueError, OverflowError):
            return None
        return v if math.isfinite(v.real) and math.isfinite(v.imag) else None

    out = []
    for src, f in real:
        v = run(f)
        assert v is None or v.imag == 0, src
        out.append({"src": src, "mode": "real", "value": None if v is None else {"re": v.real, "im": 0.0}})
    for src, f in complex_:
        v = run(f)
        out.append({"src": src, "mode": "complex", "value": None if v is None else {"re": v.real, "im": v.imag}})
    for src, env, f in with_vars:
        v = run(f, *env.values())
        out.append({"src": src, "mode": "real", "vars": env, "value": None if v is None else {"re": v.real, "im": 0.0}})
    return out


def lecture2_cases():
    """L2 helpers: the unconjugated product, the trial family (1, c)/norm, relative coefficient, unbiased bases."""
    def eig(M, sign):
        w, v = np.linalg.eigh(M)
        x = v[:, np.argmax(w) if sign == "+" else np.argmin(w)]
        return x
    kets = {f"{s}{a}": eig(M, s) for a, M in (("x", sx), ("y", sy), ("z", sz)) for s in "+-"}
    bases = {a: [kets["+" + a], kets["-" + a]] for a in "xyz"}
    t = np.radians(45)
    tilt = sx * np.sin(t) * 2 + sz * np.cos(t) * 2
    bases["t45"] = [eig(tilt, "+"), eig(tilt, "-")]

    def unbiased(A, B):
        G = np.abs(np.array(A).conj() @ np.array(B).T) ** 2
        return bool(np.allclose(G, 1 / len(A))), float(G.max())

    coeffs = [1, -1, 1j, -1j, np.exp(1j * np.pi / 4), 0.6 + 0.8j, 2.0]
    family = []
    for cf in coeffs:
        v = np.array([1, cf], complex)
        v = v / np.linalg.norm(v)
        family.append({"c": cplx(cf), "psi_abs": [float(abs(x)) for x in v],
                       "pz": prob_np(kets["+z"], v), "px": prob_np(kets["+x"], v), "py": prob_np(kets["+y"], v)})
    pairs = []
    for a, b in (("z", "x"), ("x", "y"), ("z", "y"), ("z", "t45"), ("z", "z")):
        ok, mx = unbiased(bases[a], bases[b])
        pairs.append({"a": a, "b": b, "unbiased": ok, "max": mx})
    y = kets["+y"]
    return {
        "bilinear_yy": cplx(np.dot(y, y)), "inner_yy": cplx(np.vdot(y, y)),
        "bilinear_xx": cplx(np.dot(kets["+x"], kets["+x"])),
        "family": family, "pairs": pairs,
        "relcoeff_arg_minus_y": float(np.angle(kets["-y"][1] / kets["-y"][0])),
        "sqrt_minus2": cplx(np.sqrt(-2 + 0j)),
        "i_powers": {str(n): cplx(1j ** n) for n in (2, 3, 4, -1, 2026)},
    }


def prob_np(a, psi):
    return float(abs(np.vdot(a, psi)) ** 2)


def lecture3_cases():
    """L3 helpers: eigen2 of ANY 2×2 (np.linalg.eig), the complex sandwich, Rule 3's collapse, the spread of readings."""
    R = np.array([[0, -1], [1, 0]], complex)
    mats = [R, np.array([[2, 1], [1, 2]], complex), np.array([[0, 1], [0, 0]], complex),
            np.diag([np.exp(-1j * np.pi / 4), np.exp(1j * np.pi / 4)])]
    for _ in range(6):
        mats.append(rng.normal(size=(2, 2)) + 1j * rng.normal(size=(2, 2)))
    eig = []
    for M in mats:
        w, _ = np.linalg.eig(M)
        eig.append({"M": mat(M), "values": [cplx(x) for x in sorted(w, key=lambda z: (-z.real, -z.imag))]})
    sandwiches = []
    for M in mats[:2] + mats[4:7]:
        psi = rand_state()
        sandwiches.append({"M": mat(M), "psi": vec(psi), "value": cplx(np.vdot(psi, M @ psi))})
    def up(v):
        v = np.array(v, complex)
        return v / np.linalg.norm(v)
    Pu, Pd = np.diag([1, 0]).astype(complex), np.diag([0, 1]).astype(complex)
    plus_y = up([1, 1j])
    p60 = np.array([0.5, np.sqrt(3) / 2], complex)
    collapses = []
    for P, psi in ((Pd, plus_y), (Pu, p60), (Pu, np.array([0, 1], complex))):
        pr = float(np.real(np.vdot(psi, P @ psi)))
        post = None if pr < 1e-12 else vec(P @ psi / np.sqrt(pr))
        collapses.append({"P": mat(P), "psi": vec(psi), "p": pr, "post": post})
    spreads = []
    for _ in range(12):
        tn, tm = rng.uniform(0, 360, size=2)
        n = np.radians(tn)
        m = np.radians(tm)
        A = (np.sin(n) * sx + np.cos(n) * sz)  # S along a tilt in the x–z plane (ħ = 1)
        w, V = np.linalg.eigh(np.sin(m) * sx + np.cos(m) * sz)
        psi = V[:, np.argmax(w)]
        var = float(np.real(np.vdot(psi, A @ A @ psi) - np.vdot(psi, A @ psi) ** 2))
        spreads.append({"n": float(tn), "m": float(tm), "spread": 2 * np.sqrt(max(var, 0.0))})
    return {"eig": eig, "sandwiches": sandwiches, "collapses": collapses, "spreads": spreads}


def lectures4to7_cases():
    """L4–L7 helpers by independent routes: np.poly, np.linalg.inv, matrix_power, eigen-decomposition exponentials,
    the SU(2) route for rotations (state → rotate → Bloch vector), vdot phases, path products."""
    SXh, SYh, SZh = sx, sy, sz  # spin matrices (ħ = 1)
    I2 = np.eye(2, dtype=complex)

    def fixed(v):
        k = next(i for i, x in enumerate(v) if abs(x) > 1e-12)
        return v * np.exp(-1j * np.angle(v[k]))

    def eigk(M, sign):
        w, V = np.linalg.eigh(M)
        return fixed(V[:, np.argmax(w) if sign == "+" else np.argmin(w)])

    kets = {a + s: eigk(M, s) for a, M in (("x", SXh), ("y", SYh), ("z", SZh)) for s in "+-"}

    def bloch(psi):
        psi = psi / np.linalg.norm(psi)
        return [float(np.real(np.vdot(psi, 2 * M @ psi))) for M in (SXh, SYh, SZh)]

    def expm_eig(M):
        w, V = np.linalg.eig(M)
        return V @ np.diag(np.exp(w)) @ np.linalg.inv(V)

    def rot(n, phi):
        n = np.array(n, float) / np.linalg.norm(n)
        return expm_eig(-1j * phi * (n[0] * SXh + n[1] * SYh + n[2] * SZh))

    def spread_np(A, psi):
        psi = psi / np.linalg.norm(psi)
        v = np.real(np.vdot(psi, A @ A @ psi) - np.vdot(psi, A @ psi) ** 2)
        return float(np.sqrt(max(v, 0.0)))

    rand_c = [rng.normal(size=(2, 2)) + 1j * rng.normal(size=(2, 2)) for _ in range(4)]
    polys = [{"M": mat(M), "poly": [cplx(x) for x in np.poly(M)]} for M in [SXh, SYh, SZh, np.array([[2, 1], [1, 2]], complex)] + rand_c]
    Nskew = np.array([[1, 1 / np.sqrt(2)], [0, 1 / np.sqrt(2)]], complex)
    invs = [{"M": mat(M), "inv": mat(np.linalg.inv(M))} for M in [Nskew] + rand_c]
    Mphi = -1j * (np.pi / 2) * SZh
    exact = expm_eig(Mphi)
    series = []
    for K in (1, 2, 3, 5, 10):
        term, total = I2.copy(), I2.copy()
        for k in range(1, K + 1):
            term = term @ Mphi / k
            total = total + term
        series.append({"K": K, "sum": mat(total), "err": float(np.max(np.abs(total - exact)))})
    compound = []
    for N in (1, 10, 100, 1000):
        P = np.linalg.matrix_power(I2 - 1j * SZh * (np.pi / 2) / N, N)
        compound.append({"N": N, "gap": float(np.max(np.abs(P - exact)))})
    herm = [SXh, SYh, np.array([[2, 1], [1, 2]], complex)] + [rand_hermitian() for _ in range(3)]
    eigvecs = []
    for M in herm:
        w, V = np.linalg.eigh(M)
        eigvecs.append({"M": mat(M), "values": [float(x) for x in w], "vectors": [vec(fixed(V[:, i])) for i in range(2)]})
    names = "xyz"
    changes = []
    for a in names:
        for b in names:
            Ba = np.column_stack([kets[a + "+"], kets[a + "-"]])
            Bb = np.column_stack([kets[b + "+"], kets[b + "-"]])
            changes.append({"from": a, "to": b, "B": mat(Bb.conj().T @ Ba)})
    rotations = []
    for _ in range(6):
        n = rng.normal(size=3)
        phi = float(rng.uniform(-np.pi, np.pi))
        psi = rand_state()
        rotations.append({"n": [float(x) for x in n], "phi": phi, "r": bloch(psi), "r_after": bloch(rot(n, phi) @ psi)})
    uncert = []
    pairs = [(SXh, SYh, "Sx,Sy"), (SXh, (SXh + SZh) / np.sqrt(2), "Sx,S45"), (SZh, np.sin(np.pi / 3) * SXh + np.cos(np.pi / 3) * SZh, "Sz,S60")]
    for _ in range(4):
        psi = rand_state()
        for A, B, name in pairs:
            comm = A @ B - B @ A
            bound = 0.5 * abs(np.vdot(psi, comm @ psi))
            uncert.append({"pair": name, "psi": vec(psi), "product": spread_np(A, psi) * spread_np(B, psi), "bound": float(bound),
                           "spreads": [spread_np(M, psi) for M in (SXh, SYh, SZh)], "r": bloch(psi)})
    angles = []
    for _ in range(6):
        a, b = rand_state(), rand_state()
        ra, rb = bloch(a), bloch(b)
        angles.append({"a": vec(a), "b": vec(b), "ray": float(np.arccos(min(1, abs(np.vdot(a, b))))),
                       "bloch": float(np.arccos(np.clip(np.dot(ra, rb), -1, 1)))})
    crosses = []
    for _ in range(4):
        n, m = rng.normal(size=3), rng.normal(size=3)
        n, m = n / np.linalg.norm(n), m / np.linalg.norm(m)
        Sn = n[0] * SXh + n[1] * SYh + n[2] * SZh
        Sm = m[0] * SXh + m[1] * SYh + m[2] * SZh
        c3 = np.cross(n, m)
        crosses.append({"n": [float(x) for x in n], "m": [float(x) for x in m], "cross": [float(x) for x in c3],
                        "comm": mat(Sn @ Sm - Sm @ Sn), "rhs": mat(1j * (c3[0] * SXh + c3[1] * SYh + c3[2] * SZh))})
    Rz2pi = np.diag([np.exp(-1j * np.pi), np.exp(1j * np.pi)])
    signs = {"full": cplx(np.vdot(kets["x+"], Rz2pi @ kets["x+"])), "double": cplx(np.vdot(kets["x+"], Rz2pi @ Rz2pi @ kets["x+"]))}
    P = {k: np.outer(v, v.conj()) for k, v in kets.items()}
    joint = [
        {"path": ["z+", "x+"], "psi": "z+", "p": float(np.linalg.norm(P["x+"] @ P["z+"] @ kets["z+"]) ** 2)},
        {"path": ["x+", "z+"], "psi": "z+", "p": float(np.linalg.norm(P["z+"] @ P["x+"] @ kets["z+"]) ** 2)},
        {"path": ["z+", "x+"], "psi": "y+", "p": float(np.linalg.norm(P["x+"] @ P["z+"] @ kets["y+"]) ** 2)},
    ]

    def along(tilt_deg, sign):
        t = np.radians(tilt_deg)
        return eigk(np.sin(t) * SXh + np.cos(t) * SZh, sign)

    def seq(source, axes):
        def ax(a):
            return {"z": 0.0, "x": 90.0}.get(a, a) if isinstance(a, str) else a
        paths = {}

        def walk(k, state, path, p):
            if k == len(axes):
                paths[path] = paths.get(path, 0.0) + p
                return
            for sgn in "+-":
                nxt = along(ax(axes[k]), sgn)
                q = 0.5 if state is None else float(abs(np.vdot(nxt, state)) ** 2)
                walk(k + 1, nxt, path + sgn, p * q)
        walk(0, None if source == "oven" else kets[source[1] + source[0]], "", 1.0)
        return paths
    sequences = [{"source": src, "axes": axes, "paths": seq(src, axes)} for src, axes in (("+z", ["x", "z"]), ("+z", [60, "z"]), ("oven", ["z", "x"]))]
    return {"polys": polys, "invs": invs, "series": series, "compound": compound, "eigvecs": eigvecs, "changes": changes,
            "rotations": rotations, "uncert": uncert, "angles": angles, "crosses": crosses, "signs": signs, "joint": joint,
            "sequences": sequences}


out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "numpy.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({
    "states": states, "hermitians": hermitians, "rotations": rotations,
    "basis_changes": basis_changes, "lecture_numbers": lecture_numbers,
    "operators": operator_cases(), "density": density_cases(), "expr_values": expr_value_cases(),
    "lecture2": lecture2_cases(),
    "lecture3": lecture3_cases(),
    "lectures4to7": lectures4to7_cases(),
}, indent=1, allow_nan=False))
print(f"wrote {out.relative_to(ROOT)}", lecture_numbers)
