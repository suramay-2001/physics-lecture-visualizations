#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q21.values.ts (Physics 709, chapter Q21: protecting qubits from noise).

Independent route (never Q21.values.ts's helpers, never physics/qec/*.ts or the circuit module): every gate is an explicit dense matrix built here with a basis-state
walk, a circuit is the product of those matrices applied to a state vector, a measurement is a projector and a renormalisation; the code words are the textbook ones
written out with np.kron (pipeline/qec_q21_numpy.py), a syndrome is an expectation value on a dense vector, the Knill-Laflamme table a dense Gram matrix, majority
failures are found by listing all 2^n flip patterns and by exact fractions, the Shor weight-2 decoding by brute force over all 2^9 X patterns with GF(2) row-space
membership on Python integers, the break-even chance from the roots of a polynomial, and the Gaussian dephasing factor from its closed form exp(-sigma^2/2).

Units: q0 is the leftmost tensor factor (most significant bit); the bit-flip and phase-flip circuits have 5 wires (3 code qubits, 2 helpers); a syndrome is kept as
the helper bits read as a binary number (10 -> 2, 11 -> 3, 01 -> 1).

Usage (from the repo root): python3 pipeline/claims_qc709/q21.py -> app/src/physics/__fixtures__/claims-qc709/q21.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import itertools
import json
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import qec_q21_numpy as N  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "app/src/physics/__fixtures__/claims-qc709/q21.json"
DEG = math.pi / 180
A, B = 0.6, 0.8
THETA = 2 * math.acos(A)

# ------------------------------------------------------------------ a tiny dense simulator (basis-state walk)


def bit(x, q, n):
    return (x >> (n - 1 - q)) & 1


def full(n, U, t, controls=()):
    """The 2^n x 2^n matrix of the one-qubit U on wire t, controlled on the wires in `controls`."""
    M = np.zeros((2**n, 2**n), dtype=complex)
    for x in range(2**n):
        if all(bit(x, c, n) == 1 for c in controls):
            for out in (0, 1):
                y = (x & ~(1 << (n - 1 - t))) | (out << (n - 1 - t))
                M[y, x] += U[out, bit(x, t, n)]
        else:
            M[x, x] += 1
    return M


def Pg(deg):
    return np.diag([1, np.exp(1j * deg * DEG)]).astype(complex)


def Rxm(deg):
    return N.rx(deg)


def Rym(theta):
    return np.cos(theta / 2) * N.I2 - 1j * np.sin(theta / 2) * N.Y


H = (N.X + N.Z) / math.sqrt(2)


def run_cols(n, cols, psi):
    """States after every column; a column is a list of full matrices applied in order (they act on different wires)."""
    out = [psi]
    for mats in cols:
        for M in mats:
            psi = M @ psi
        out.append(psi)
    return out


def project_helpers(psi, n, wires, bits_):
    """Collapse the given wires onto bits and renormalise; returns (state, probability)."""
    keep = np.array([1.0 if all(bit(x, w, n) == b for w, b in zip(wires, bits_)) else 0.0 for x in range(2**n)])
    q = psi * keep
    p = float(np.vdot(q, q).real)
    return q / math.sqrt(p), p


def marginal(psi, n, wires):
    out = np.zeros(2 ** len(wires))
    for x in range(2**n):
        idx = 0
        for w in wires:
            idx = 2 * idx + bit(x, w, n)
        out[idx] += abs(psi[x]) ** 2
    return out


def err_mats(n, e):
    if e == "none":
        return [np.eye(2**n, dtype=complex)]
    if e == "X1X2":
        return [full(n, N.X, 0), full(n, N.X, 1)]
    if e[0] in "XZ" and len(e) == 2:
        return [full(n, N.X if e[0] == "X" else N.Z, int(e[1]) - 1)]
    if e.startswith("rx"):
        return [full(n, Rxm(int(e[2:])), 1)]
    raise ValueError(e)


def encoder_cols(n):
    return [[full(n, Rym(THETA), 0)], [full(n, N.X, 1, (0,))], [full(n, N.X, 2, (0,))]]


PARITY = lambda n: [[full(n, N.X, 3, (0,))], [full(n, N.X, 3, (1,))], [full(n, N.X, 4, (1,))], [full(n, N.X, 4, (2,))]]
ZERO5 = np.zeros(32, dtype=complex)
ZERO5[0] = 1


def bf_states(e, outcomes):
    """The bit-flip circuit: states after columns 0 .. 10 (the measurement collapses onto `outcomes`, then the conditioned X)."""
    n = 5
    cols = encoder_cols(n) + [err_mats(n, e)] + PARITY(n)
    st = run_cols(n, cols, ZERO5)  # st[k] after column k, k = 0 .. 8
    psi, _ = project_helpers(st[-1], n, (3, 4), (int(outcomes[0]), int(outcomes[1])))
    st.append(psi)  # column 9: measurement
    fix = {"10": 0, "11": 1, "01": 2}.get(outcomes)
    psi = full(n, N.X, fix) @ psi if fix is not None else psi
    st.append(psi)  # column 10
    return st


def pf_states(e, outcomes):
    n = 5
    h3 = [full(n, H, 0), full(n, H, 1), full(n, H, 2)]
    cols = encoder_cols(n) + [h3, err_mats(n, e), h3] + PARITY(n)
    st = run_cols(n, cols, ZERO5)
    psi, _ = project_helpers(st[-1], n, (3, 4), (int(outcomes[0]), int(outcomes[1])))
    st.append(psi)
    return st


def helper_index(psi):
    m = marginal(psi, 5, (3, 4))
    return int(np.argmax(m))


def idx(bits_):
    return int(bits_, 2)


# ------------------------------------------------------------------ the numbers
v = {}
P_FLIP, P_LOW = 0.1, 0.01

# q21-classical
v["q21P"] = float(np.float64(1) / 10)
v["q21PLow"] = float(np.float64(1) / 100)
counts = [0.0] * 4
for pat in itertools.product((0, 1), repeat=3):
    counts[sum(pat)] += P_FLIP ** sum(pat) * (1 - P_FLIP) ** (3 - sum(pat))
for k in range(4):
    v[f"q21RepC{k}"] = counts[k]
v["q21RepFail01"] = N.rep_fail_enum(P_FLIP, 3)
v["q21RepFail001"] = N.rep_fail_exact(P_LOW, 3)
v["q21BreakEven"] = float(N.break_even(3))
v["q21RepFail5"] = N.rep_fail_exact(P_FLIP, 5)
v["q21RepRatio"] = N.rep_fail_enum(P_FLIP, 3) / N.rep_fail_enum(P_FLIP, 5)
M = np.array([[1, 1, 0], [0, 1, 1]])
for j, e in enumerate(([1, 0, 0], [0, 1, 0], [0, 0, 1]), start=1):
    s = (M @ np.array(e)) % 2
    v[f"q21RepSyn{j}"] = int(2 * s[0] + s[1])
v["q21RepNullWords"] = sum(1 for x in itertools.product((0, 1), repeat=3) if not ((M @ np.array(x)) % 2).any())
psi1 = Rym(THETA) @ N.KET0
v["q21A"] = float(psi1[0].real)
v["q21B"] = float(psi1[1].real)
v["q21Chance0"] = float(abs(psi1[0]) ** 2)
v["q21Chance1"] = float(abs(psi1[1]) ** 2)

# q21-bit-flip
none = bf_states("none", "00")
v["q21EncBar0"] = float(np.real(none[3][idx("00000")]))
v["q21EncBar1"] = float(np.real(none[3][idx("11100")]))
code3 = A * N.code_words("rep3")[0] + B * N.code_words("rep3")[1]
psi3 = np.kron(np.kron(psi1, psi1), psi1)
v["q21NotCopy"] = float(np.real(np.vdot(psi3, code3)))
v["q21EncChecks"] = float(sum(np.real(np.vdot(code3, N.pmat(p) @ code3)) for p in ("ZZI", "IZZ", "ZIZ")))
v["q21T91None"] = N.syndrome_int("rep3", "III")
v["q21T91X1"] = N.syndrome_int("rep3", "XII")
v["q21T91X2"] = N.syndrome_int("rep3", "IXI")
v["q21T91X3"] = N.syndrome_int("rep3", "IIX")
x2 = bf_states("X2", "11")
v["q21BfSynX2"] = float(marginal(x2[8], 5, (3, 4))[3])
v["q21BfRestored0"] = float(abs(x2[10][idx("00011")]) ** 2)
v["q21BfRestored1"] = float(abs(x2[10][idx("11111")]) ** 2)
rx60 = bf_states("rx60", "00")
m60 = marginal(rx60[8], 5, (3, 4))
v["q21SmallP00"] = float(m60[0])
v["q21SmallP11"] = float(m60[3])
v["q21SmallEps"] = float(abs(N.pauli_coefficients(N.rx(60))["X"]))
x1x2 = bf_states("X1X2", "01")
v["q21TwoFlipSyn"] = helper_index(x1x2[8])
v["q21TwoFlipBar0"] = float(np.real(x1x2[10][idx("00001")]))
v["q21TwoFlipBar1"] = float(np.real(x1x2[10][idx("11101")]))

# q21-phase-flip
z1 = bf_states("Z1", "00")
v["q21Z1Syn"] = helper_index(z1[8])
Z1code = N.pmat("ZII") @ code3
v["q21Z1Overlap"] = float(np.real(np.vdot(code3, Z1code)))
v["q21Z1OverlapSize"] = float(abs(np.real(np.vdot(code3, Z1code))))
v["q21Z1Fid"] = float(np.real(np.vdot(code3, Z1code)) ** 2)
pfcode = A * N.code_words("rep3x")[0] + B * N.code_words("rep3x")[1]
v["q21PfBar000"] = float(np.real(pfcode[0]))
v["q21PfSynZ1"] = N.syndrome_int("rep3x", "ZII")
v["q21PfSynZ2"] = N.syndrome_int("rep3x", "IZI")
v["q21PfSynZ3"] = N.syndrome_int("rep3x", "IIZ")
v["q21PfX1Syn"] = N.syndrome_int("rep3x", "XII")
v["q21PfX1Bar000"] = float(np.real((N.pmat("XII") @ pfcode)[0]))
v["q21PfX1BarSize"] = float(abs(np.real((N.pmat("XII") @ pfcode)[0])))

# q21-shor
z0, z1w = N.code_words("shor9")
v["q21ShorBar"] = float(np.real(z0[0]))
v["q21ShorTerms"] = int(np.count_nonzero(np.abs(z0) > 1e-9))
v["q21ShorChecks"] = len(N.GENERATORS["shor9"])
v["q21ShorX5Lit"] = sum(1 for x in N.check_values("shor9", N.err_string(9, "X5")) if x < 0)
for j, q in ((1, 1), (2, 4), (3, 7)):
    v[f"q21ShorZg{j}"] = N.syndrome_int("shor9", N.err_string(9, f"Z{q}"), which=[0, 1])
w1 = N.paulis_of_weight(9, 1)
v["q21ShorWt1"] = len(w1)
v["q21ShorDistinct"] = len({tuple(N.syndrome_signs("shor9", e)) for e in w1})
shpsi = A * z0 + B * z1w
v["q21Z1Z2Trivial"] = float(np.linalg.norm(N.pmat("ZZIIIIIII") @ shpsi - shpsi))


def gf2_in_span(vec, basis):
    """Is the bit-vector `vec` (an int) in the GF(2) span of `basis` (ints)?"""
    red = []
    for b in basis:
        for r in red:
            b = min(b, b ^ r)
        if b:
            red.append(b)
    for r in red:
        vec = min(vec, vec ^ r)
    return vec == 0


zz_pairs = [(0, 1), (1, 2), (3, 4), (4, 5), (6, 7), (7, 8)]
xsupp = [sum(1 << q for q in range(0, 6)), sum(1 << q for q in range(3, 9))]  # the two six-qubit X checks as bit masks over qubits 0..8


def zz_syndrome(mask):
    return tuple(((mask >> a) & 1) ^ ((mask >> b) & 1) for a, b in zz_pairs)


lightest = {}
for mask in sorted(range(2**9), key=lambda m: (bin(m).count("1"), m)):
    lightest.setdefault(zz_syndrome(mask), mask)
fixed = total = 0
for i, j in itertools.combinations(range(9), 2):
    e = (1 << i) | (1 << j)
    corr = lightest[zz_syndrome(e)]
    fixed += gf2_in_span(e ^ corr, xsupp)
    total += 1
v["q21ShorW2Fixed"] = fixed
v["q21ShorW2"] = total

# q21-digitize
co = N.pauli_coefficients(N.rx(60))
v["q21RxCI"] = float(co["I"].real)
v["q21RxCX"] = float(abs(co["X"]))
v["q21RxCXIm"] = float(co["X"].imag)
v["q21RxCYZ"] = float(abs(co["Y"]) + abs(co["Z"]))
U = N.seeded_unitary(709)
v["q21EnvSplit"] = N.env_split(U, np.array([A, B], dtype=complex))[1]
for n_, t_, key in ((3, 1, "q21Wt1n3"), (9, 1, "q21Wt1n9"), (5, 1, "q21Wt1n5")):
    v[key] = len(N.paulis_of_weight(n_, t_))
v["q21Wt2n5"] = len(N.paulis_of_weight(5, 2)) - len(N.paulis_of_weight(5, 1))
v["q21Gamma"] = 0.6**2
v["q21DampCoef"] = float(abs(N.pauli_coefficients(np.array([[0, 0.6], [0, 0]], dtype=complex))["X"]))

# q21-kl
errs = ["III", "XII", "IXI", "IIX"]
C0, C1, ev, gap = N.kl("rep3", errs)
v["q21KlBitflipI"] = float(np.abs(C0 - np.eye(4)).max())
Cz0, Cz1, _, _ = N.kl("rep3", ["III", "ZII"])
v["q21KlZ1Zero"] = float(Cz0[0, 1].real)
v["q21KlZ1One"] = float(Cz1[0, 1].real)
Cs, _, evs, _ = N.kl("shor9", ["I" * 9, N.err_string(9, "Z1"), N.err_string(9, "Z2")])
v["q21KlShorC"] = float(np.abs(Cs - np.array([[1, 0, 0], [0, 1, 1], [0, 1, 1]])).max())
v["q21KlShorEig0"], v["q21KlShorEig1"], v["q21KlShorEig2"] = (float(x) for x in evs)
need = lambda n_, k_=1, t_=1: 2**k_ * sum(math.comb(n_, j) * 3**j for j in range(t_ + 1))
v["q21QhbMinN"] = next(n_ for n_ in range(1, 100) if need(n_) <= 2**n_)
v["q21Qhb5"] = need(5)
v["q21Qhb5Rooms"] = need(5) // 2
v["q21QhbShorNeed"] = need(9)
v["q21QhbShorHave"] = 2**9
v["q21Qhb4Need"] = need(4)
v["q21Qhb4Have"] = 2**4

# q21-dfs
v["q21Z60"] = float(np.real((np.exp(1j * 60 * DEG) + np.exp(-1j * 60 * DEG)) / 2))
v["q21Z60Sq"] = float(np.real((np.exp(1j * 60 * DEG) + np.exp(-1j * 60 * DEG)) / 2) ** 2)
rho_one = np.outer(psi1, psi1.conj())
v["q21Off0"] = float(rho_one[0, 1].real)
def rho_mix(states):
    return sum(np.outer(s, s.conj()) for s in states) / len(states)
one_states = [Pg(p) @ psi1 for p in (60, -60)]
v["q21Off1"] = float(rho_mix(one_states)[0, 1].real)
v["q21ZUniform"] = float(np.real(np.mean(np.exp(2j * np.pi * np.arange(360) / 360))))
v["q21ZGauss"] = float(np.exp(-0.5))
turn = np.diag(np.kron(Pg(60), Pg(60)))
v["q21DfsPh01"] = float((np.degrees(np.angle(turn[1])) + 360) % 360)
v["q21DfsPh11"] = float((np.degrees(np.angle(turn[3])) + 360) % 360)
dfs0 = np.zeros(4, dtype=complex)
dfs0[1], dfs0[2] = A, B  # 0.6|01> + 0.8|10>
v["q21DfsOff"] = float(rho_mix([np.kron(Pg(p), Pg(p)) @ dfs0 for p in (60, -60)])[1, 2].real)
def ind_states(a_deg):
    return [np.kron(Pg(p1), Pg(p2)) @ dfs0 for p1 in (a_deg, -a_deg) for p2 in (a_deg, -a_deg)]
v["q21IndOff"] = float(rho_mix(ind_states(60))[1, 2].real)
true_rho = rho_mix(one_states)
printed = true_rho.copy()
printed[0, 0] += printed[0, 1]
printed[0, 1] = 0
v["q21PrintedTrace"] = float(np.trace(printed).real)
v["q21TrueTrace"] = float(np.trace(true_rho).real)

# challenges
v["q21ChFail"] = N.rep_fail_enum(0.2, 3)
v["q21ChFive"] = N.rep_fail_enum(0.2, 5)
v["q21ChSmall"] = float(marginal(bf_states("rx90", "00")[8], 5, (3, 4))[3])
w = np.zeros(8, dtype=complex)
w[0], w[7] = 0.8, 0.6
v["q21ChOverlap"] = float(np.real(np.vdot(w, N.pmat("ZII") @ w)))
v["q21ChCI"] = float(N.pauli_coefficients(N.rx(90))["I"].real)
v["q21ChZ90"] = float(np.real((np.exp(1j * 90 * DEG) + np.exp(-1j * 90 * DEG)) / 2))
v["q21ChOff30"] = float(rho_one[0, 1].real * np.real((np.exp(1j * 30 * DEG) + np.exp(-1j * 30 * DEG)) / 2))
v["q21ChInd30"] = float(rho_mix(ind_states(30))[1, 2].real)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q21, numpy (dense gate matrices from a basis-state walk, circuits as products of them, textbook code words by np.kron, "
            "syndromes as expectation values on dense vectors, Knill-Laflamme Gram matrices, enumeration of flip patterns and Shor X pairs, exact fractions, polynomial roots, "
            "the Gaussian closed form; never physics/qec/errors.ts or Q21.values.ts's own helpers). Regenerate: python3 pipeline/claims_qc709/q21.py",
            "values": {k: float(x) for k, x in sorted(v.items())},
        },
        indent=1,
        sort_keys=True,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {OUT.relative_to(ROOT)} ({len(v)} values)")
