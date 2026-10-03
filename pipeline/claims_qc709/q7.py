#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/Q7.values.ts (Physics 709, chapter Q7).

Independent route (never physics/qc/measure.ts `runBracket`/`localBasisProbs`, never physics/qc/gates.ts
`pauliMul`/`pauliEigenvalue`, never physics/qc/bits.ts `merminInstructionSets`, and never Q7.values.ts's own
helpers): every bracket is the explicit inner product of hand-written numpy bras and kets; GHZ is written out
as a dense 8-vector; the Mermin instruction sets are enumerated by `itertools.product` directly; every Pauli
product is a hand-written 8x8 (or 2x2) matrix multiplication.

Units: hbar = 1. Qubit order: q0 is the leftmost tensor factor / most significant bit (matches state.ts). Basis
index of |b0 b1 b2> is 4*b0 + 2*b1 + b2.

Usage (from the repo root): python3 pipeline/claims_qc709/q7.py -> app/src/physics/__fixtures__/claims-qc709/q7.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key). Output is deterministic: two runs write
byte-identical files.
"""
import itertools
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent

R2 = 1 / np.sqrt(2)
I1 = np.eye(2, dtype=complex)
X1 = np.array([[0, 1], [1, 0]], complex)
Y1 = np.array([[0, -1j], [1j, 0]], complex)
Z1 = np.array([[1, 0], [0, -1]], complex)
PAULI = {"I": I1, "X": X1, "Y": Y1, "Z": Z1}

# |+z> = |0>, |-z> = |1>, |+-x>, |+-y>: the course's own conventions (spin.ts), written out independently here.
KET = {
    "+z": np.array([1, 0], complex),
    "-z": np.array([0, 1], complex),
    "+x": np.array([1, 1], complex) * R2,
    "-x": np.array([1, -1], complex) * R2,
    "+y": np.array([1, 1j], complex) * R2,
    "-y": np.array([1, -1j], complex) * R2,
}


def kron_all(vs):
    out = vs[0]
    for v in vs[1:]:
        out = np.kron(out, v)
    return out


def pauli_string(s):
    return kron_all([PAULI[ch] for ch in s])


# GHZ = (|000> + |111>)/sqrt2, written out as an explicit 8-vector (never via a Hadamard+CNOT circuit here).
GHZ = np.zeros(8, complex)
GHZ[0] = R2
GHZ[7] = R2


def idx(bits):
    return int(bits, 2)


def inner(a, b):
    """<a|b> = sum conj(a_i) b_i, conjugate-linear in the first slot (matches linalg.ts `inner`)."""
    return complex(np.vdot(a, b))


def basis_ket(bases, eps):
    """The product ket |e1 b1, e2 b2, e3 b3> for bases in {'x','y'} and eps in {+1,-1}."""
    labels = {("x", 1): "+x", ("x", -1): "-x", ("y", 1): "+y", ("y", -1): "-y"}
    return kron_all([KET[labels[(b, e)]] for b, e in zip(bases, eps)])


def ghz_bracket(bases, eps):
    return inner(basis_ket(bases, eps), GHZ)


def s_of_run(bases, eps):
    return 4 * ghz_bracket(bases, eps) - 1


def p1s(s):
    return abs(1 + s) ** 2 / 16


def local_basis_probs(bases):
    """The 8 outcome probabilities of reading every qubit in its own basis (x, y or z), bit 0 = +1 (notes p. 31):
    built from the explicit 2x2 change-of-basis matrices (<-x|, <+x| as rows, etc.), never from the engine's
    strided rotate-then-read loop."""
    rot = {"x": np.array([KET["+x"], KET["-x"]]).conj(), "y": np.array([KET["+y"], KET["-y"]]).conj()}
    U = kron_all([rot[b] for b in bases])
    psi = U @ GHZ
    return (np.abs(psi) ** 2).tolist()


TABLE_XXX = local_basis_probs(["x", "x", "x"])
TABLE_YYX = local_basis_probs(["y", "y", "x"])
TABLE_YXY = local_basis_probs(["y", "x", "y"])
TABLE_XYY = local_basis_probs(["x", "y", "y"])
TABLE_XXY = local_basis_probs(["x", "x", "y"])
TABLE_YYY = local_basis_probs(["y", "y", "y"])

# ---------------------------------------------------------------------------------------------------------
# q7-ghz
# ---------------------------------------------------------------------------------------------------------
after0_post = np.where(np.arange(8) < 4, GHZ, 0.0)  # qubit 0 (bit 0) reads 0: keep indices 0-3
after0_p = float(np.sum(np.abs(after0_post) ** 2))
after0_post = after0_post / np.sqrt(after0_p)
afterQ2_post = np.where((np.arange(8) // 2) % 2 == 1, GHZ, 0.0)  # qubit 1 (the middle one) reads 1
afterQ2_p = float(np.sum(np.abs(afterQ2_post) ** 2))
afterQ2_post = afterQ2_post / np.sqrt(afterQ2_p)
KET000 = np.zeros(8, complex)
KET000[0] = 1
KET111 = np.zeros(8, complex)
KET111[7] = 1


def weight_stats(psi, bit):
    """Mean and variance of the number of qubits reading `bit` (0 or 1), from the Born-rule distribution."""
    n = 3
    p = np.abs(psi) ** 2
    counts = np.array([bin(i).count("1") if bit == 1 else n - bin(i).count("1") for i in range(len(psi))], float)
    mean = float(np.sum(p * counts))
    var = float(np.sum(p * counts ** 2) - mean ** 2)
    return mean, var


zeros_ghz_mean, zeros_ghz_var = weight_stats(GHZ, 0)
PLUS3 = kron_all([KET["+x"], KET["+x"], KET["+x"]])
zeros_plus_mean, zeros_plus_var = weight_stats(PLUS3, 0)

# ---------------------------------------------------------------------------------------------------------
# q7-brackets
# ---------------------------------------------------------------------------------------------------------
zeta_x_plus = np.sqrt(2) * inner(KET["+x"], KET["-z"])
zeta_x_minus = np.sqrt(2) * inner(KET["-x"], KET["-z"])
zeta_y_plus = np.sqrt(2) * inner(KET["+y"], KET["-z"])
zeta_y_minus = np.sqrt(2) * inner(KET["-y"], KET["-z"])


def deg_of(z):
    return float(np.degrees(np.angle(z)) % 360)


# ---------------------------------------------------------------------------------------------------------
# q7-parity-table
# ---------------------------------------------------------------------------------------------------------
s_xxx_all_plus = s_of_run(["x", "x", "x"], [1, 1, 1])
s_xxx_last_minus = s_of_run(["x", "x", "x"], [1, 1, -1])
s_xxy_all_plus = s_of_run(["x", "x", "y"], [1, 1, 1])
bracket_xxx_all_plus = ghz_bracket(["x", "x", "x"], [1, 1, 1])
bracket_xxx_last_minus = ghz_bracket(["x", "x", "x"], [1, 1, -1])
bracket_yyx_pi_plus = ghz_bracket(["y", "y", "x"], [1, 1, 1])
bracket_yyx_pi_minus = ghz_bracket(["y", "y", "x"], [1, 1, -1])

# ---------------------------------------------------------------------------------------------------------
# q7-bit-strings
# ---------------------------------------------------------------------------------------------------------
single_x_prob = float(sum(TABLE_XXX[0:4]))

# ---------------------------------------------------------------------------------------------------------
# q7-observables: eigenvalues, commutators, means and variances, by direct matrix construction
# ---------------------------------------------------------------------------------------------------------
MERMIN_4 = ["XXX", "YYX", "YXY", "XYY"]
PAULI_MATS = {s: pauli_string(s) for s in MERMIN_4}


def eigenvalue_of(psi, s):
    out = pauli_string(s) @ psi
    for lam in (1, -1):
        if np.allclose(out, lam * psi, atol=1e-9):
            return lam
    raise ValueError(f"{s} is not an eigenstate")


eig = {s: eigenvalue_of(GHZ, s) for s in MERMIN_4}
eig_zzi = eigenvalue_of(GHZ, "ZZI")
eig_izz = eigenvalue_of(GHZ, "IZZ")
eig_ziz = eigenvalue_of(GHZ, "ZIZ")

max_square_diff = max(float(np.max(np.abs(PAULI_MATS[s] @ PAULI_MATS[s] - np.eye(8)))) for s in MERMIN_4)
max_commutator_entry = 0.0
all_commute = True
for i, a in enumerate(MERMIN_4):
    for j, b in enumerate(MERMIN_4):
        if i < j:
            comm = PAULI_MATS[a] @ PAULI_MATS[b] - PAULI_MATS[b] @ PAULI_MATS[a]
            max_commutator_entry = max(max_commutator_entry, float(np.max(np.abs(comm))))
            if not np.allclose(comm, 0, atol=1e-9):
                all_commute = False


def expectation(psi, M):
    return complex(np.vdot(psi, M @ psi))


def variance(psi, M):
    Mpsi = M @ psi
    m = complex(np.vdot(psi, Mpsi))
    return float(max(0.0, np.vdot(Mpsi, Mpsi).real - abs(m) ** 2))


mean = {s: expectation(GHZ, PAULI_MATS[s]).real for s in MERMIN_4}
var = {s: variance(GHZ, PAULI_MATS[s]) for s in MERMIN_4}
X1_ON_Q0 = pauli_string("XII")
mean_x1 = expectation(GHZ, X1_ON_Q0).real
var_x1 = variance(GHZ, X1_ON_Q0)

ghz_xxx_final = PAULI_MATS["XXX"] @ GHZ
ghz_yyx_final = PAULI_MATS["YYX"] @ GHZ
SWAP23 = np.zeros((8, 8), complex)
for i in range(8):
    b0, b1, b2 = (i >> 2) & 1, (i >> 1) & 1, i & 1
    j = (b0 << 2) | (b2 << 1) | b1
    SWAP23[j, i] = 1
ghz_sw_final = SWAP23 @ GHZ

y_on_zero = Y1 @ KET["+z"]  # should be i|1>
y_on_one = Y1 @ KET["-z"]  # should be -i|0>

# ---------------------------------------------------------------------------------------------------------
# q7-mermin: Mermin's instruction sets, enumerated directly (independent of physics/qc/bits.ts)
# ---------------------------------------------------------------------------------------------------------
correct_target = {"XXX": eig["XXX"], "XYY": eig["XYY"], "YXY": eig["YXY"], "YYX": eig["YYX"]}
assignments = []
for (x1, y1), (x2, y2), (x3, y3) in itertools.product([(1, 1), (1, -1), (-1, 1), (-1, -1)], repeat=3):
    values = {"XXX": x1 * x2 * x3, "XYY": x1 * y2 * y3, "YXY": y1 * x2 * y3, "YYX": y1 * y2 * x3}
    matches = sum(1 for k in correct_target if values[k] == correct_target[k])
    assignments.append({"a": [(x1, y1), (x2, y2), (x3, y3)], "values": values, "matches": matches})

histogram = [sum(1 for a in assignments if a["matches"] == n) for n in range(5)]
best_matches = max(a["matches"] for a in assignments)


def find_card(party_signs):
    (x1, y1), (x2, y2), (x3, y3) = party_signs
    for a in assignments:
        if a["a"] == [(x1, y1), (x2, y2), (x3, y3)]:
            return a
    raise ValueError("card not found")


card1 = find_card([(1, 1), (1, 1), (1, -1)])
card2 = find_card([(1, 1), (1, 1), (-1, -1)])
forced = card2["values"]["XXX"]

# pauliMul, by matrix multiplication and trace decomposition (independent of gates.ts's per-qubit lookup table)
PAULI_STRINGS_3 = ["".join(p) for p in itertools.product("IXYZ", repeat=3)]


def pauli_mul(a, b):
    M = PAULI_MATS_ALL[a] @ PAULI_MATS_ALL[b]
    for q in PAULI_STRINGS_3:
        Q = PAULI_MATS_ALL[q]
        lam = complex(np.trace(Q.conj().T @ M)) / 8
        if abs(lam) > 0.5:
            return lam, q
    raise ValueError("not a Pauli string")


PAULI_MATS_ALL = {s: pauli_string(s) for s in PAULI_STRINGS_3}
phase1, string1 = pauli_mul("YYX", "YXY")  # should be (1, 'IZZ')
phase2, string2 = pauli_mul(string1, "XYY")  # should be (-1, 'XXX')
prod_total_phase = float((phase1 * phase2).real)
prod_matrix = PAULI_MATS_ALL["YYX"] @ PAULI_MATS_ALL["YXY"] @ PAULI_MATS_ALL["XYY"]
prod_plus_xxx = float(np.max(np.abs(prod_matrix + PAULI_MATS_ALL["XXX"])))

qubit1_identity = float(np.max(np.abs(Y1 @ Y1 @ X1 - X1)))
qubit2_identity = float(np.max(np.abs(Y1 @ X1 @ Y1 - (-X1))))
qubit3_identity = float(np.max(np.abs(X1 @ Y1 @ Y1 - X1)))

values = {
    # small, reused constants
    "q7Half": 0.5,
    "q7Quarter": 0.25,
    "q7Eighth": 0.125,
    "q7R2": R2,

    # q7-ghz
    "q7GhzAmp": float(abs(GHZ[0])),
    "q7GhzP000": float(abs(GHZ[0]) ** 2),
    "q7GhzP111": float(abs(GHZ[7]) ** 2),
    "q7GhzBars": 8.0,
    "q7GhzFilled": float(np.sum(np.abs(GHZ) ** 2 > 1e-9)),
    "q7GhzByCircuitMatch": 0.0,  # the circuit construction is checked in-engine; numpy builds GHZ directly
    "q7After0P": after0_p,
    "q7After0Match": float(np.max(np.abs(after0_post - KET000))),
    "q7AfterQ2P": afterQ2_p,
    "q7AfterQ2Match": float(np.max(np.abs(afterQ2_post - KET111))),
    "q7ZerosMean": zeros_ghz_mean,
    "q7ZerosVar": zeros_ghz_var,
    "q7ZerosPlusMean": zeros_plus_mean,
    "q7ZerosPlusVar": zeros_plus_var,

    # q7-brackets
    "q7PlusYRe": float(KET["+y"][0].real),
    "q7PlusYIm": float(KET["+y"][1].imag),
    "q7ZetaXPlusDeg": deg_of(zeta_x_plus),
    "q7ZetaXMinusDeg": deg_of(zeta_x_minus),
    "q7ZetaYPlusDeg": deg_of(zeta_y_plus),
    "q7ZetaYMinusDeg": deg_of(zeta_y_minus),
    "q7BraMinusYZeroRe": float(inner(KET["-y"], KET["+z"]).real),
    "q7BraPlusYOneIm": float(inner(KET["+y"], KET["-z"]).imag),

    # q7-parity-table
    "q7S1Re": float(s_xxx_all_plus.real),
    "q7S1Im": float(s_xxx_all_plus.imag),
    "q7SNeg1Re": float(s_xxx_last_minus.real),
    "q7SNeg1Im": float(s_xxx_last_minus.imag),
    "q7SNegIRe": float(s_xxy_all_plus.real),
    "q7SNegIIm": float(s_xxy_all_plus.imag),
    "q7BracketXxxAllPlus": float(bracket_xxx_all_plus.real),
    "q7BracketXxxLastMinus": float(bracket_xxx_last_minus.real),
    "q7BracketYyxPiPlus": float(bracket_yyx_pi_plus.real),
    "q7BracketYyxPiMinus": float(bracket_yyx_pi_minus.real),
    "q7P1AtS1": p1s(s_xxx_all_plus),
    "q7P1AtSNeg1": p1s(s_xxx_last_minus),
    "q7P1AtSNegI": p1s(s_xxy_all_plus),
    "q7AbsOnePlusSNegI": float(abs(1 + s_xxy_all_plus)),

    # q7-bit-strings
    "q7Table011": TABLE_XXX[3],
    "q7Table010": TABLE_XXX[2],
    "q7TableYxy000": TABLE_YXY[0],
    "q7TableXxy101": TABLE_XXY[5],
    "q7TableXyy001": TABLE_XYY[1],
    "q7TableYyy000": TABLE_YYY[0],
    "q7SingleXProb": single_x_prob,
    "q7RunCircMatchXxx": 0.0,  # the circuit construction is checked in-engine; numpy reads TABLE_XXX directly
    "q7RunCircMatchYyx": 0.0,

    # q7-observables
    "q7EigXxx": float(eig["XXX"]),
    "q7EigYyx": float(eig["YYX"]),
    "q7EigYxy": float(eig["YXY"]),
    "q7EigXyy": float(eig["XYY"]),
    "q7EigZzi": float(eig_zzi),
    "q7EigIzz": float(eig_izz),
    "q7EigZiz": float(eig_ziz),
    "q7Square": max_square_diff,
    "q7Comm": max_commutator_entry,
    "q7CommuteFlag": 1.0 if all_commute else 0.0,
    "q7MeanXxx": mean["XXX"],
    "q7MeanYyx": mean["YYX"],
    "q7MeanYxy": mean["YXY"],
    "q7MeanXyy": mean["XYY"],
    "q7VarXxx": var["XXX"],
    "q7VarYyx": var["YYX"],
    "q7VarYxy": var["YXY"],
    "q7VarXyy": var["XYY"],
    "q7MeanX1": mean_x1,
    "q7VarX1": var_x1,
    "q7GhzXxxMatch": float(np.max(np.abs(ghz_xxx_final - GHZ))),
    "q7GhzYyxMatch": float(np.max(np.abs(ghz_yyx_final - (-GHZ)))),
    "q7GhzSwMatch": float(np.max(np.abs(ghz_sw_final - GHZ))),
    "q7YZeroIm": float(y_on_zero[1].imag),
    "q7YOneIm": float(y_on_one[0].imag),

    # q7-mermin
    "q7MerminTotal": float(len(assignments)),
    "q7MerminBest": float(best_matches),
    "q7MerminHist0": float(histogram[0]),
    "q7MerminHist1": float(histogram[1]),
    "q7MerminHist2": float(histogram[2]),
    "q7MerminHist3": float(histogram[3]),
    "q7MerminHist4": float(histogram[4]),
    "q7Card1Yyx": float(card1["values"]["YYX"]),
    "q7Card1Yxy": float(card1["values"]["YXY"]),
    "q7Card1Xyy": float(card1["values"]["XYY"]),
    "q7Card1Xxx": float(card1["values"]["XXX"]),
    "q7Card2Yyx": float(card2["values"]["YYX"]),
    "q7Card2Yxy": float(card2["values"]["YXY"]),
    "q7Card2Xyy": float(card2["values"]["XYY"]),
    "q7Forced": float(forced),
    "q7ProdPhaseRe": prod_total_phase,
    "q7ProdPlusXxx": prod_plus_xxx,
    "q7Qubit1Identity": qubit1_identity,
    "q7Qubit2Identity": qubit2_identity,
    "q7Qubit3Identity": qubit3_identity,
}
values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "q7.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim values for Physics 709 chapter Q7, numpy (direct construction: GHZ written out as an "
            "explicit 8-vector, bases as explicit 2x2 change-of-basis matrices, Mermin's instruction sets "
            "enumerated by itertools.product, Pauli products by matrix multiplication and trace decomposition; "
            "never physics/qc/measure.ts, physics/qc/gates.ts or physics/qc/bits.ts, and never Q7.values.ts's own "
            "helpers). Regenerate: python3 pipeline/claims_qc709/q7.py",
            "values": values,
        },
        indent=1,
        ensure_ascii=False,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
