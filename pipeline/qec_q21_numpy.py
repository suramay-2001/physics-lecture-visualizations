"""Independent numpy routes for the Q21 error-correction helpers (app/src/physics/qec/errors.ts) and for Chapter Q21's claim keys.

Nothing here imports the TypeScript engine's ideas: Pauli strings are dense Kronecker products, the code words are written out from the textbook formulas
(Bergou Ch. 9: |000>, |111>; |+++>, |--->; the nine-qubit products), a syndrome is an expectation value <psi|E^+ g E|psi> on a dense state vector,
the Knill-Laflamme table is a dense Gram matrix, and the environment split is an np.reshape of a seeded unitary. Used by make_qec_q21_fixtures.py
(-> app/src/physics/__fixtures__/qec-q21.json) and by claims_qc709/q21.py (-> claims-qc709/q21.json).
"""
import itertools
from fractions import Fraction

import numpy as np

I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
LET = {"I": I2, "X": X, "Y": Y, "Z": Z}

KET0 = np.array([1, 0], dtype=complex)
KET1 = np.array([0, 1], dtype=complex)
KETP = (KET0 + KET1) / np.sqrt(2)
KETM = (KET0 - KET1) / np.sqrt(2)


def kron_all(ms):
    out = np.array([[1]], dtype=complex) if ms[0].ndim == 2 else np.array([1], dtype=complex)
    for m in ms:
        out = np.kron(out, m)
    return out


def pmat(s):
    """The dense matrix of a Pauli string such as 'ZZI' (leftmost letter = leftmost tensor factor)."""
    return kron_all([LET[ch] for ch in s])


def ketn(*ks):
    return kron_all(list(ks))


# the textbook code words and the generators in the registry's order (X checks first for a CSS code; the order is only used to line up the comparison by name)
def code_words(name):
    if name == "rep3":
        return ketn(KET0, KET0, KET0), ketn(KET1, KET1, KET1)
    if name == "rep3x":
        return ketn(KETP, KETP, KETP), ketn(KETM, KETM, KETM)
    if name == "shor9":
        g0 = (ketn(KET0, KET0, KET0) + ketn(KET1, KET1, KET1)) / np.sqrt(2)
        g1 = (ketn(KET0, KET0, KET0) - ketn(KET1, KET1, KET1)) / np.sqrt(2)
        return kron_all([g0, g0, g0]), kron_all([g1, g1, g1])
    raise ValueError(name)


GENERATORS = {
    "rep3": ["ZZI", "IZZ"],
    "rep3x": ["XXI", "IXX"],
    "shor9": ["XXXXXXIII", "IIIXXXXXX", "ZZIIIIIII", "IZZIIIIII", "IIIZZIIII", "IIIIZZIII", "IIIIIIZZI", "IIIIIIIZZ"],
}


def paulis_of_weight(n, t):
    """All Pauli strings of weight <= t, by itertools (positions, then letters)."""
    out = ["I" * n]
    for w in range(1, t + 1):
        for pos in itertools.combinations(range(n), w):
            for ls in itertools.product("XYZ", repeat=w):
                row = ["I"] * n
                for p, l in zip(pos, ls):
                    row[p] = l
                out.append("".join(row))
    return out


def err_string(n, spec):
    """'X2' or 'X1Z4' (qubits from 1) -> a full-length string."""
    row = ["I"] * n
    i = 0
    while i < len(spec):
        row[int(spec[i + 1]) - 1] = spec[i]
        i += 2
    return "".join(row)


def check_values(name, err, a=0.6, b=0.8):
    """<psi|E^+ g E|psi> for the code state a|0bar> + b|1bar> and every generator, on dense vectors."""
    z, o = code_words(name)
    psi = a * z + b * o
    E = pmat(err)
    hit = E @ psi
    return [float(np.real(np.vdot(hit, pmat(g) @ hit))) for g in GENERATORS[name]]


def syndrome_signs(name, err):
    return [1 if v > 0 else -1 for v in check_values(name, err)]


def syndrome_int(name, err, which=None):
    """The signs as the helper bits of the chapter: +1 -> 0, -1 -> 1, first check as the high bit (over the generators `which`, default all)."""
    s = syndrome_signs(name, err)
    if which is not None:
        s = [s[i] for i in which]
    v = 0
    for x in s:
        v = 2 * v + (0 if x > 0 else 1)
    return v


def kl(name, errs):
    """The Knill-Laflamme tables on |0bar> and |1bar>, the cross terms, and the gap."""
    z, o = code_words(name)
    Es = [pmat(e) for e in errs]

    def table(u, v):
        return np.array([[np.vdot(Eb @ u, Ea @ v) for Ea in Es] for Eb in Es])

    C0, C1, C01, C10 = table(z, z), table(o, o), table(z, o), table(o, z)
    gap = float(max(np.abs(C1 - C0).max(), np.abs(C01).max(), np.abs(C10).max()))
    return C0, C1, np.sort(np.linalg.eigvalsh(C0)), gap


def pauli_coefficients(A):
    return {k: complex(np.trace(M @ A) / 2) for k, M in (("I", I2), ("X", X), ("Y", Y), ("Z", Z))}


def rx(deg):
    t = np.deg2rad(deg)
    return np.cos(t / 2) * I2 - 1j * np.sin(t / 2) * X


def ry(deg):
    t = np.deg2rad(deg)
    return np.cos(t / 2) * I2 - 1j * np.sin(t / 2) * Y


def seeded_unitary(seed, d=4):
    r = np.random.default_rng(seed)
    G = r.normal(size=(d, d)) + 1j * r.normal(size=(d, d))
    Q, R = np.linalg.qr(G)
    return Q * (np.diag(R) / np.abs(np.diag(R)))


def env_split(U, psi):
    """Bergou's four environment notes of a unitary on (system x one-qubit environment), by reshaping to U[out_sys, out_env, in_sys, in_env]."""
    T = U.reshape(2, 2, 2, 2)
    e = lambda j, k: T[k, :, j, 0]  # system input j, system output k, environment vector
    eI = (e(0, 0) + e(1, 1)) / 2
    eZ = (e(0, 0) - e(1, 1)) / 2
    eX = (e(0, 1) + e(1, 0)) / 2
    eY = 1j * (e(1, 0) - e(0, 1)) / 2
    lhs = U @ np.kron(psi, KET0)
    rhs = sum(np.kron(P @ psi, ev) for P, ev in ((I2, eI), (X, eX), (Y, eY), (Z, eZ)))
    return {"I": eI, "X": eX, "Y": eY, "Z": eZ}, float(np.abs(lhs - rhs).max())


def rep_fail_exact(p, n):
    """P(a majority vote over n copies is wrong) with exact rational arithmetic."""
    p = Fraction(p).limit_denominator(10**9)
    from math import comb

    return float(sum(comb(n, k) * p**k * (1 - p) ** (n - k) for k in range((n + 1) // 2, n + 1)))


def rep_fail_enum(p, n):
    """The same by listing all 2^n flip patterns."""
    tot = 0.0
    for pat in itertools.product((0, 1), repeat=n):
        w = sum(pat)
        if w > n // 2:
            tot += p**w * (1 - p) ** (n - w)
    return tot


def break_even(n):
    """The root of rep_fail(p, n) = p in (0, 1), from the polynomial's roots."""
    from math import comb

    # sum_{k>n/2} C(n,k) p^k (1-p)^(n-k) - p as a numpy polynomial
    P = np.polynomial.polynomial
    poly = np.array([0.0])
    for k in range((n + 1) // 2, n + 1):
        term = P.polymul(P.polypow([0, 1], k), P.polypow([1, -1], n - k)) * comb(n, k)
        poly = P.polyadd(poly, term)
    poly = P.polysub(poly, [0, 1])
    roots = P.polyroots(poly)
    real = sorted(float(r.real) for r in roots if abs(r.imag) < 1e-9 and 1e-3 < r.real < 1 - 1e-3)
    return real[0] if len(real) == 1 else real
