#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q15.values.ts (Physics 709, chapter Q15: secret keys from quantum rules).

Independent route (never Q15.values.ts's own helpers, never physics/qc/crypto.ts, povm.ts or the circuit module): every state is an explicit numpy vector,
every gate an explicit matrix (np.kron, the XOR gates as permutation matrices, a controlled-Ry as a block matrix), every reduced state an einsum over a
reshaped tensor, every eigenvalue numpy's own, every trace norm an SVD. The never-wrong POVM's coefficient is found by bisection (see
pipeline/make_crypto_fixtures.py, whose helpers this script reuses for the B92 receiver, the probe, the sharing code and Eq. 6.6: they are numpy too),
the BB84 intercept-resend rate is an explicit enumeration over bases and outcomes, the CHSH scores are traces of explicit 4 x 4 products.

Units: the qubit order is q0 = leftmost tensor factor = most significant bit (matches state.ts).

Usage (from the repo root): python3 pipeline/claims_qc709/q15.py -> app/src/physics/__fixtures__/claims-qc709/q15.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write byte-identical files.
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "pipeline"))
import make_crypto_fixtures as mcf  # noqa: E402  (numpy helpers: usd_povm, helstrom_povm, probe, share, cheat, eq66)

S2 = math.sqrt(2)
I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
K0 = np.array([1, 0], dtype=complex)
K1 = np.array([0, 1], dtype=complex)
KP = np.array([1, 1], dtype=complex) / S2
KM = np.array([1, -1], dtype=complex) / S2


def cnot(n, ctrl, target):
    """A CNOT on n wires as a permutation matrix (q0 most significant)."""
    N = 2 ** n
    M = np.zeros((N, N), dtype=complex)
    for i in range(N):
        bits = [(i >> (n - 1 - q)) & 1 for q in range(n)]
        if bits[ctrl]:
            bits[target] ^= 1
        j = sum(b << (n - 1 - q) for q, b in enumerate(bits))
        M[j, i] = 1
    return M


def basis(label):
    m = {"0": K0, "1": K1, "+": KP, "-": KM}
    v = np.array([1], dtype=complex)
    for ch in label:
        v = np.kron(v, m[ch])
    return v


def wire_one(psi, wire, n):
    """The chance that a wire reads 1."""
    p = np.abs(psi) ** 2
    return float(sum(p[i] for i in range(2 ** n) if (i >> (n - 1 - wire)) & 1))


def caesar_char(ch, shift):
    return chr((ord(ch) - ord("A") + shift) % 26 + ord("A")) if ch.isupper() else chr((ord(ch) - ord("a") + shift) % 26 + ord("a"))


def proj(v):
    return np.outer(v, v.conj())


# ------------------------------------------------------------------ otp
pad_state = basis("11")
pad1 = cnot(2, 0, 1) @ pad_state
pad2 = cnot(2, 0, 1) @ pad1
reuse = basis("110")
reuse = cnot(3, 1, 2) @ (cnot(3, 0, 2) @ (cnot(3, 0, 1) @ reuse))
copy = cnot(2, 0, 1) @ basis("+0")

# ------------------------------------------------------------------ B92
c_overlap = float(abs(np.vdot(K0, KP)))
# the encoder's controlled-H as a block matrix, applied to |10> (bit 1): the bars on |10> and |11> (the story's "each ... long")
HAD = np.array([[1, 1], [1, -1]], dtype=complex) / S2
CH_GATE = np.block([[I2, np.zeros((2, 2), dtype=complex)], [np.zeros((2, 2), dtype=complex), HAD]])
b92_one = CH_GATE @ basis("10")
bob, _ = mcf.usd_povm(K0, KP)
rho0, rho1 = proj(K0), proj(KP)
r_none, r_usd, r_min = mcf.b92("none"), mcf.b92("usd"), mcf.b92("minerr")
gamma = 0.5 * (rho1 - rho0)
gamma_w = np.linalg.eigvalsh(gamma)
# the seeded B92 ledger of q15-b92:b3 (seed 155, 1000 qubits, the never-wrong Eve): replayed with this repo's own mulberry32 port and the bisection / eigh POVMs
# of make_crypto_fixtures (never physics/qc/crypto.ts), then tallied row by row
ledger = mcf.b92_tally(mcf.b92_rounds(155, 1000, "usd"))


# ------------------------------------------------------------------ BB84 intercept-resend, by enumeration over the 16 equally likely histories
def bb84_q():
    st = {("H", 0): K0, ("H", 1): K1, ("D", 0): KP, ("D", 1): KM}
    kept = err = 0.0
    for a_basis in "HD":
        for a_bit in (0, 1):
            for b_basis in "HD":
                for e_basis in "HD":
                    if a_basis != b_basis:
                        continue
                    for e_bit in (0, 1):
                        p_e = abs(np.vdot(st[(e_basis, e_bit)], st[(a_basis, a_bit)])) ** 2
                        wrong = 1 - a_bit
                        p_wrong = abs(np.vdot(st[(b_basis, wrong)], st[(e_basis, e_bit)])) ** 2
                        kept += p_e / 16
                        err += p_e * p_wrong / 16
    return err / kept


p0, p90, p180 = mcf.probe(0.0), mcf.probe(math.pi / 2), mcf.probe(math.pi)

# ------------------------------------------------------------------ E91
SING = (np.kron(K0, K1) - np.kron(K1, K0)) / S2
PHI = (np.kron(K0, K0) + np.kron(K1, K1)) / S2


def equal_chance(psi, b1, b2):
    """P(equal results) when side 1 reads basis b1 and side 2 reads b2 (each basis a pair of kets)."""
    return float(sum(abs(np.vdot(np.kron(b1[k], b2[k]), psi)) ** 2 for k in (0, 1)))


XB, YB = (KP, KM), (np.array([1, 1j]) / S2, np.array([1, -1j]) / S2)
corr = lambda A, B, psi: float(np.vdot(psi, np.kron(A, B) @ psi).real)  # noqa: E731
n_of = lambda th, ph: math.sin(math.radians(th)) * math.cos(math.radians(ph)) * X + math.sin(math.radians(th)) * math.sin(math.radians(ph)) * Y + math.cos(math.radians(th)) * Z  # noqa: E731
A1, A2 = X, Z
B1, B2 = n_of(135, 180), n_of(45, 180)


def chsh(psi, a1, a2, b1, b2):
    return corr(a1, b1, psi) + corr(a1, b2, psi) + corr(a2, b1, psi) - corr(a2, b2, psi)


def horodecki(psi):
    T = np.array([[corr(P, Q, psi) for Q in (X, Y, Z)] for P in (X, Y, Z)])
    s = np.linalg.svd(T, compute_uv=False)
    return 2 * math.sqrt(s[0] ** 2 + s[1] ** 2)


prod = np.kron(KP, KM)
corr_xx = corr(X, X, SING)
corr_yy = corr(Y, Y, SING)
e66 = mcf.eq66()

# ------------------------------------------------------------------ secret sharing
split = basis("110")
split = cnot(3, 1, 2) @ (cnot(3, 1, 2) @ (cnot(3, 0, 2) @ split))
split2 = cnot(3, 1, 2) @ (cnot(3, 0, 2) @ basis("110"))
theta = math.pi / 8
sh = mcf.share(theta)
code0 = mcf.logical(theta, 0)
t = code0.reshape(2, 2)
r_bob = float(np.linalg.norm([np.trace(t @ t.conj().T @ P).real for P in (X, Y, Z)]))
p_plus_charlie = (1 + sh["charliePlus"][0]) / 2
p_plus_charlie_m = (1 + sh["charlieMinus"][0]) / 2
chA, chE = mcf.cheat("cheat-first"), mcf.cheat("sigma-first")
chH = mcf.cheat("honest")

clean = lambda x: 0.0 if abs(x) < 1e-12 else float(x)  # noqa: E731

values = {
    # q15-otp
    "q15CaesarShift": float(ord(caesar_char("C", 3)) - ord("C")),
    "q15CaesarOk": float("".join(caesar_char(ch, 3) for ch in "Caesar") == "Fdhvdu"),
    "q15PadCipher": wire_one(pad1, 1, 2),
    "q15PadBack": wire_one(pad2, 1, 2),
    "q15OtpEx": float(0b10110 ^ 0b01101),
    "q15CopyOverlap": float(abs(np.vdot(np.kron(KP, KP), copy)) ** 2),
    "q15ReuseLeak": wire_one(reuse, 2, 3),
    # q15-b92
    "q15Overlap": c_overlap,
    "q15OverlapSq": float(abs(np.vdot(KP, K0)) ** 2),
    "q15B92Amp": float(abs(b92_one[3])),
    "q15UsdScale": float(mcf.usd_povm(K0, KP)[1]),
    "q15B92Kept": r_none["kept"],
    "q15B92Inconcl": r_none["inconclusive"],
    "q15B92Q0": clean(r_none["qber"]),
    "q15EveUsdFail": float(np.trace(bob[2] @ rho0).real),
    "q15QUsdEve": r_usd["qber"],
    "q15EveWrongShare": r_usd["qber"] / r_usd["eveFail"],
    "q15EveUsdRight": r_usd["eveRight"],
    "q15QMinEve": r_min["qber"],
    "q15EveMinRight": r_min["eveRight"],
    "q15GammaNorm": mcf.trace_norm(gamma),
    "q15GammaHi": float(gamma_w[1]),
    "q15B92LedgerKept": float(ledger["kept"]),
    "q15B92LedgerWrong": float(ledger["errors"]),
    # q15-bb84
    "q15BridgeQ": bb84_q(),
    "q15ProbeX0": clean(p0["xError"]),
    "q15ProbeGuess0": p0["eveGuess"],
    "q15ProbeX90": p90["xError"],
    "q15ProbeZ90": clean(p90["zError"]),
    "q15ProbeGuess90": p90["eveGuess"],
    "q15ProbeR90": p90["rA"],
    "q15ProbeRE90": p90["rE"],
    "q15ProbeGuess180": p180["eveGuess"],
    "q15ProbeQ180": p180["qber"],
    # q15-e91
    "q15SameX": clean(equal_chance(SING, XB, XB)),
    "q15SameY": clean(equal_chance(SING, YB, YB)),
    "q15DiffXY": equal_chance(SING, XB, YB),
    "q15CorrXX": corr_xx,
    "q15CorrYY": corr_yy,
    "q15ChshSinglet": chsh(SING, A1, A2, B1, B2),
    "q15ChshProduct": chsh(prod, A1, A2, B1, B2),
    "q15ChshProductMax": horodecki(prod),
    "q15Eq66Chsh": chsh(PHI, Z, X, X, Z),
    "q15Eq66Diff": e66["table"][0][1][0],
    "q15Eq66PrintedSum": e66["printedRowSum"],
    "q15Eq66PrintedGap": e66["printedGap"],
    "q15Eq66CorrectedGap": clean(e66["correctedGap"]),
    "q15Eq66LocalGap": clean(e66["lambdaGap"]),
    # q15-sharing
    "q15SplitShare": wire_one(split2, 2, 3),
    "q15SplitBack": wire_one(split, 2, 3),
    "q15ShareR": r_bob,
    "q15ShareBobPlus": sh["bobPlus"],
    "q15ShareCharlieX": sh["charliePlus"][0],
    "q15ShareOverlap": sh["overlap"],
    "q15ShareUsd": sh["usd"],
    "q15ShareTheta50": mcf.share_theta_for(0.5),
    "q15SharePxPlus": p_plus_charlie,
    "q15SharePxMinus": p_plus_charlie_m,
    "q15ShareAlpha2": float(abs(np.vdot(K0, np.array([math.cos(theta), math.sin(theta)], dtype=complex))) ** 2),
    "q15CheatGap": clean(chA["recordGap"]),
    "q15CheatErr": clean(chA["errorRate"]),
    "q15CheatKnows": chA["charlieGuess"],
    "q15CheatEarlyGuess": chE["charlieGuess"],
    "q15CheatEarlyGap": clean(chE["recordGap"]),
    "q15HonestGuess": chH["charlieGuess"],
    "q15ZAgreeHonest": mcf.zagree(False, theta),
    "q15ZAgreeGrab": mcf.zagree(True, theta),
}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q15.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q15, numpy (explicit state vectors and matrices, XOR gates as permutation matrices, a controlled-Ry as a block matrix, "
            "einsum-free reductions, SVD trace norms, a bisection for the never-wrong coefficient, an enumeration for BB84's intercept-resend rate; never physics/qc/crypto.ts or "
            "Q15.values.ts's own helpers). Regenerate: python3 pipeline/claims_qc709/q15.py",
            "values": {k: float(f"{v:.15g}") for k, v in values.items()},
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
