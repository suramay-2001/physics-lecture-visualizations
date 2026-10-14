#!/usr/bin/env python3
"""Reference values for the error-correction engine (app/src/physics/qec/*.ts), computed by INDEPENDENT routes (see pipeline/qec_numpy.py for what each route is).

Blocks of app/src/physics/__fixtures__/qec.json:
  gf2       random binary matrices with rank (XOR basis on Python integers) and the number of solutions of Hx = 0 counted by brute force, plus row-space membership
  pauli     dense-matrix products, commutation and Clifford conjugations of Pauli strings (decomposed by traces)
  tableau   random Clifford circuits (with Z measurements) run on a dense state vector: the final stabilizer group, the sampled outcomes, which were certain
  codes     check matrices built a second way, k from ranks, exhaustive distances, syndrome tables (Steane, Shor, [[4,2,2]], repetition, surface d = 3, 5, [[5,1,3]])
  bb        gross and two-gross: H_X, H_Z from np.kron circulants, ranks, k (also from a Groebner basis), the paper's logical basis rebuilt from the printed polynomials,
            the logical action of the shifts x and y checked against the paper's printed 6 x 6 matrices, the 36 logical classes, and light logical operators found by
            information-set decoding with Python's own seed (witnesses the TypeScript tests re-check against THEIR matrices)
  overhead  the qubit-count arithmetic typed again

Usage: python3 pipeline/make_qec_fixtures.py   (from the repo root; deterministic: seeded generators, no clock, no dict-order dependence; run twice and diff)
"""
import itertools
import json
import random
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qec_numpy as Q  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app/src/physics/__fixtures__/qec.json"


def bits(row):
    return "".join(str(int(b)) for b in row)


# ------------------------------------------------------------------ gf2 ------------------------------------------------------------------


def block_gf2():
    rnd = random.Random(20241014)
    mats = []
    for t in range(30):
        cols = 3 + (t * 7) % 38
        rows = 1 + (t * 5) % 20
        density = [0.25, 0.5, 0.75][t % 3]
        M = [[1 if rnd.random() < density else 0 for _ in range(cols)] for _ in range(rows)]
        rank = Q.rank_gf2(M)
        entry = {"rows": [bits(r) for r in M], "cols": cols, "rank": rank, "nullCount": None, "vectors": []}
        if cols <= 14:
            entry["nullCount"] = Q.null_count_bruteforce(M, cols)
            assert entry["nullCount"] == 2 ** (cols - rank)
        basis = Q.XorBasis()
        for v in Q.rows_to_ints(M):
            basis.add(v)
        for u in range(6):
            if u % 2 == 0:  # a random combination of rows: certainly in the row space
                v = 0
                for r in Q.rows_to_ints(M):
                    if rnd.random() < 0.5:
                        v ^= r
            else:
                v = sum(1 << j for j in range(cols) if rnd.random() < 0.5)
            entry["vectors"].append({"v": bits(Q.ints_to_row(v, cols)), "inRowspace": basis.contains(v)})
        mats.append(entry)
    return {"matrices": mats}


# ------------------------------------------------------------------ pauli ------------------------------------------------------------------


@lru_cache(maxsize=None)
def pm(s):
    return Q.pauli_matrix(s)


def block_pauli():
    two = Q.pauli_product_table(2)
    rnd = random.Random(777)
    s3 = Q.strings(3)
    prod3 = {}
    for _ in range(200):
        a, b = rnd.choice(s3), rnd.choice(s3)
        p, s = Q.decompose(pm(a) @ pm(b), 3)
        prod3[f"{a},{b}"] = [p, s]
    commute2 = {f"{a},{b}": Q.commutes_dense(a, b) for a in Q.strings(2) for b in Q.strings(2)}
    gates = [("H", [1]), ("S", [0]), ("Sdg", [2]), ("X", [0]), ("Y", [1]), ("Z", [2]), ("CNOT", [2, 0]), ("CZ", [0, 2]), ("SWAP", [1, 2])]
    return {"product2": two, "product3": prod3, "commute2": commute2, "conj3": Q.conjugation_table(3, gates)}


# ------------------------------------------------------------------ tableau ------------------------------------------------------------------


def block_tableau():
    rnd = random.Random(31415)
    out = []
    for t in range(40):
        n = 1 + t % 4
        ops = Q.random_clifford_ops(n, 8 + int(rnd.random() * 22), rnd, measure=(t % 2 == 1))
        psi, outcomes, prob = Q.simulate_dense(n, ops, rnd)
        group = Q.stabilizer_group_dense(psi, n)
        assert len(group) == 2**n, (t, len(group))
        out.append({"n": n, "ops": ops, "outcomes": outcomes, "prob": prob, "group": group})
    return out


# ------------------------------------------------------------------ codes ------------------------------------------------------------------


def css_entry(name, n, hx, hz, errors_up_to=0, distance=True):
    e = {"name": name, "n": n, "hx": Q.supports(hx), "hz": Q.supports(hz), "rankX": Q.rank_gf2(hx) if hx else 0, "rankZ": Q.rank_gf2(hz) if hz else 0}
    e["k"] = n - e["rankX"] - e["rankZ"]
    # H_X H_Z^T = 0 by integer arithmetic
    if hx and hz:
        assert not (np.array(hx) @ np.array(hz).T % 2).any(), name
    if distance:
        wx, sx = Q.css_distance_bruteforce(hz, hx, n)
        wz, sz = Q.css_distance_bruteforce(hx, hz, n)
        e["dX"], e["dZ"], e["witnessX"], e["witnessZ"] = wx, wz, sx, sz
    if errors_up_to:
        table = []
        for w in range(1, errors_up_to + 1):
            for pos in itertools.combinations(range(n), w):
                for ls in itertools.product("XYZ", repeat=w):
                    letters = ["I"] * n
                    for p, l in zip(pos, ls):
                        letters[p] = l
                    s = "".join(letters)
                    sx, sz = Q.syndrome_css(hx, hz, n, s)
                    table.append([s, sx, sz])
        e["syndromes"] = table
    return e


def block_codes():
    codes = {}
    ham = Q.hamming_columns(3)
    codes["steane"] = css_entry("Steane", 7, ham, ham, errors_up_to=2)
    hz = [[1 if j in (3 * b + t, 3 * b + t + 1) else 0 for j in range(9)] for b in range(3) for t in (0, 1)]
    hx = [[1 if j // 3 in (b, b + 1) else 0 for j in range(9)] for b in (0, 1)]
    codes["shor"] = css_entry("Shor", 9, hx, hz, errors_up_to=2)
    codes["fourTwoTwo"] = css_entry("[[4,2,2]]", 4, [[1, 1, 1, 1]], [[1, 1, 1, 1]], errors_up_to=2)
    chain = lambda n: [[1 if j in (i, i + 1) else 0 for j in range(n)] for i in range(n - 1)]
    codes["bitflip3"] = css_entry("bit-flip 3", 3, [], chain(3), errors_up_to=2)
    codes["bitflip5"] = css_entry("bit-flip 5", 5, [], chain(5), errors_up_to=1)
    for d in (3, 5):
        hxs, hzs = Q.rotated_surface(d)
        codes[f"surface{d}"] = css_entry(f"surface {d}", d * d, hxs, hzs)
        assert len(hxs) + len(hzs) == d * d - 1
    # the 5-qubit code: general stabilizer, brute-force over all 4^5 Paulis
    gens = ["XZZXI", "IXZZX", "XIXZZ", "ZXIXZ"]
    gm = [pm(g) for g in gens]
    syn = {}
    for q in range(5):
        for l in "XYZ":
            s = "I" * q + l + "I" * (4 - q)
            syn[s] = "".join("0" if np.allclose(pm(s) @ g, g @ pm(s)) else "1" for g in gm)
    codes["five"] = {
        "name": "[[5,1,3]]",
        "n": 5,
        "generators": gens,
        "rank": Q.rank_gf2([Q.symplectic_vec(g) for g in gens]),
        "d": Q.stabilizer_distance_bruteforce(gens, 5),
        "syndromes": syn,
    }
    codes["five"]["k"] = 5 - codes["five"]["rank"]
    return codes


# ------------------------------------------------------------------ bb ------------------------------------------------------------------


def int_matrix_ranks(H):
    return Q.rank_gf2(H.tolist())


def bb_entry(which, isd_seed, isd_target, isd_rounds):
    D = Q.PAPER[which]
    l, m = D["l"], D["m"]
    A, B, HX, HZ = Q.bb_matrices(l, m, Q.A_TERMS, Q.B_TERMS)
    assert not (HX @ HZ.T % 2).any()
    n = 2 * l * m
    rx, rz = int_matrix_ranks(HX), int_matrix_ranks(HZ)
    e = {
        "l": l,
        "m": m,
        "n": n,
        "rankX": rx,
        "rankZ": rz,
        "k": n - rx - rz,
        "checkWeight": int(max(HX.sum(axis=1).max(), HZ.sum(axis=1).max())),
        "colWeightX": sorted({int(v) for v in HX.sum(axis=0)}),
        "colWeightZ": sorted({int(v) for v in HZ.sum(axis=0)}),
        "hx": Q.supports(HX.tolist()),
        "hz": Q.supports(HZ.tolist()),
    }
    e["kGroebner"] = Q.bb_k_groebner(l, m, Q.A_TERMS, Q.B_TERMS)
    assert e["kGroebner"] == e["k"], (which, e["kGroebner"], e["k"])
    # the paper's logical basis, built again from the printed polynomials
    Xs, Zs, cells = Q.paper_logical_basis(which)
    hx_rows = HX.tolist()
    hz_rows = HZ.tolist()
    nl = len(Xs)
    zeros = [0] * n
    xw = [sum(x) for x in Xs]
    zw = [sum(z) for z in Zs]
    # a vector commutes with every Z check iff H_Z x = 0 (X-type), and with every X check iff H_X z = 0 (Z-type)
    assert all(not (HZ @ np.array(x) % 2).any() for x in Xs)
    assert all(not (HX @ np.array(z) % 2).any() for z in Zs)
    pairing = [[sum(Xs[i][j] * Zs[k][j] for j in range(n)) % 2 for k in range(nl)] for i in range(nl)]
    assert pairing == [[1 if i == j else 0 for j in range(nl)] for i in range(nl)]
    assert Q.rank_gf2(hx_rows + Xs) == rx + nl and Q.rank_gf2(hz_rows + Zs) == rz + nl
    e["logicalWeightsX"] = xw
    e["logicalWeightsZ"] = zw
    # logical action of x and y, against the paper's printed matrices
    acts = {}
    for key, ab in (("x", (1, 0)), ("y", (0, 1))):
        M = Q.logical_action(l, m, hx_rows, Xs, ab)
        assert M is not None
        printed = [[int(c) for c in row] for row in D["A" + key]]
        assert [r[:6] for r in M[:6]] == printed, (which, key, "block 1 differs from the printed matrix")
        assert [r[6:] for r in M[:6]] == [[0] * 6] * 6 and [r[:6] for r in M[6:]] == [[0] * 6] * 6
        assert [r[6:] for r in M[6:]] == [list(c) for c in zip(*printed)], (which, key, "block 2 is not the transpose")
        acts[key] = [bits(r) for r in M]
    e["logicalAction"] = acts
    classes = set()
    for a in range(l):
        for b in range(m):
            M = Q.logical_action(l, m, hx_rows, Xs, (a, b))
            classes.add(tuple(tuple(r) for r in M))
    e["shiftClasses"] = len(classes)
    # light logical operators by information-set decoding with Python's own seed
    w, sup, rounds = Q.isd_light_logical(hz_rows, hx_rows, n, isd_seed, isd_rounds, isd_target)
    e["isd"] = {"seed": isd_seed, "target": isd_target, "rounds": rounds, "weight": w, "support": sup}
    return e


def block_bb():
    return {"gross": bb_entry("gross", 11, 12, 6000), "twoGross": bb_entry("two-gross", 12, 18, 30000)}


# ------------------------------------------------------------------ overhead ------------------------------------------------------------------


def block_overhead():
    surf = {str(d): {"data": d * d, "checks": d * d - 1, "perLogical": 2 * d * d - 1} for d in (3, 5, 7, 9, 11, 13, 17)}
    mod = {"gross": 4 * 12 * 6, "twoGross": 4 * 12 * 12}
    ratio = {"grossD11": 12 * (2 * 11 * 11 - 1) / mod["gross"], "twoGrossD17": 12 * (2 * 17 * 17 - 1) / mod["twoGross"]}
    return {"surface": surf, "module": mod, "ratio": ratio, "adapter": {"12": 2 * (12 - 1), "18": 2 * (18 - 1)}}


def main():
    data = {
        "gf2": block_gf2(),
        "pauli": block_pauli(),
        "tableau": block_tableau(),
        "codes": block_codes(),
        "bb": block_bb(),
        "overhead": block_overhead(),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(",", ":")) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")
    for k in ("gross", "twoGross"):
        b = data["bb"][k]
        print(k, "n", b["n"], "k", b["k"], "kGroebner", b["kGroebner"], "classes", b["shiftClasses"], "isd weight", b["isd"]["weight"], "after", b["isd"]["rounds"], "rounds")


if __name__ == "__main__":
    main()
