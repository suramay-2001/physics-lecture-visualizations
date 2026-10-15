#!/usr/bin/env python3
"""Offline computation behind Fig. 9 of "Tour de gross" (arXiv:2506.03094, p. 25): how many bicycle measurements beta a Pauli measurement on ONE module costs.

The paper prints beta = 1 + 6 k (Eq. 17), where k is the fewest native rotations that carry a native measurement Q (x) R into the wanted Q (x) P. Here P is a Pauli on the
other eleven logical qubits of the module and Q is the pivot letter on logical qubit 1. A native rotation about the Pauli g (its pivot letter dropped) acts on Paulis p of the
eleven qubits as a transvection, p -> p g if p and g anticommute and p -> p otherwise; it is its own inverse, so k is the breadth-first distance from P to the set of R with
Q (x) R native. The script runs that breadth-first search over ALL 4^11 = 4 194 304 Paulis (22-bit symplectic vectors) for each of

  code     gross [[144,12,12]] and two-gross [[288,12,18]]
  reading  rotations245      the shift action the engine computes (A (+) A^T on qubits 7-12), rotations about native Paulis with a pivot letter X, Y or Z (Eq. 15 as printed)
           rotations510      the same native set with the pivot letter I allowed (the 510 the paper's text counts)
           hypothetical245   the shift action the paper's p. 47 states (A (+) A on qubits 7-12), 245 rotations
  target   Q = I, X, Y, Z

and writes the beta histogram and mean of each, the mean over all P of the best (smallest) beta over Q in {X, Y, Z}, and a seeded stratified sample of Paulis with the beta the
full search gave them (app/src/physics/qec/tdgFig9.test.ts re-derives these in TypeScript by an independent meet-in-the-middle search).

Everything is rebuilt here from the paper's printed inputs and numpy alone (nothing imports the TypeScript or another pipeline module): the two bivariate-bicycle codes in the
toric form of Eq. 27, the logical basis of Eqs. 31-36, the logical action of every translation by pairing an image with the dual basis (App. A.2), the 540 native measurements
(Eq. 14) as the images of the 15 Paulis of the LPU's two logical qubits, and the search itself. A transvection set of 245 or 510 vectors makes the search cheap if each level is
expanded from its smaller side (forward from the frontier, or backward from the unvisited Paulis).

Usage: python3 pipeline/tdg_fig9.py        (from the repo root; deterministic: no network, no clock; the only random choice is the seeded sample; run twice and cmp)
Writes app/src/physics/__fixtures__/tdg-fig9.json
"""
import json
from itertools import product
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app/src/physics/__fixtures__/tdg-fig9.json"

SEED = 20250603                      # the sample: numpy.random.default_rng(SEED), drawn in the fixed order code -> Q -> beta level
SAMPLE_QUOTA = {0: 6, 1: 10, 2: 16, 3: 20, 4: 12}   # per (code, Q): Paulis with k = 0..4 rotations (beta 1, 7, 13, 19, 25); 64 in all
STATES = 1 << 22                     # 4^11 Paulis on eleven qubits
MASK = (1 << 11) - 1
PAR = np.array([bin(i).count("1") & 1 for i in range(1 << 11)], dtype=bool)   # parity of an 11-bit word
LETTERS = {(0, 0): "I", (1, 0): "X", (0, 1): "Z", (1, 1): "Y"}
QS = "IXYZ"
MU = NU = (1, 1)


# ------------------------------------------------------------------ GF(2) helpers
def rref2(M):
    """Reduced row echelon form over GF(2): (rows, pivot columns)."""
    M = (np.array(M, dtype=np.uint8) & 1).copy()
    r = 0
    piv = []
    rows, cols = M.shape
    for c in range(cols):
        hit = np.flatnonzero(M[r:, c])
        if hit.size == 0:
            continue
        p = r + int(hit[0])
        M[[r, p]] = M[[p, r]]
        idx = np.flatnonzero(M[:, c])
        idx = idx[idx != r]
        M[idx] ^= M[r]
        piv.append(c)
        r += 1
        if r == rows:
            break
    return M[:r], piv


def in_rowspace(R, piv, v):
    v = v.copy()
    for row, c in zip(R, piv):
        if v[c]:
            v ^= row
    return not v.any()


def inv2(A):
    n = A.shape[0]
    M = np.concatenate([A.astype(np.uint8) & 1, np.eye(n, dtype=np.uint8)], axis=1)
    r = 0
    for c in range(n):
        p = r + int(np.flatnonzero(M[r:, c])[0])
        M[[r, p]] = M[[p, r]]
        idx = np.flatnonzero(M[:, c])
        idx = idx[idx != r]
        M[idx] ^= M[r]
        r += 1
    return M[:, n:]


# ------------------------------------------------------------------ the codes in the paper's toric form (Eq. 27) and the logical basis (Eqs. 31-36)
class BB:
    def __init__(self, l, m, A=((0, 0), (0, 1), (3, -1)), B=((0, 0), (1, 0), (-1, -3))):
        self.l, self.m = l, m
        self.cells = l * m
        self.n = 2 * self.cells
        HX = np.zeros((self.cells, self.n), dtype=np.uint8)
        HZ = np.zeros((self.cells, self.n), dtype=np.uint8)
        for i in range(l):
            for j in range(m):
                c = self.idx(i, j)
                for (a, b) in A:
                    HX[c, self.idx(i + a, j + b)] ^= 1                 # X check: L qubits at alpha * A
                    HZ[c, self.cells + self.idx(i - a, j - b)] ^= 1    # Z check: R qubits at alpha * A^T
                for (a, b) in B:
                    HX[c, self.cells + self.idx(i + a, j + b)] ^= 1    # X check: R qubits at alpha * B
                    HZ[c, self.idx(i - a, j - b)] ^= 1                 # Z check: L qubits at alpha * B^T
        self.HX, self.HZ = HX, HZ

    def idx(self, i, j):
        return (i % self.l) * self.m + (j % self.m)

    def poly(self, terms, shift=(0, 0), transpose=False):
        v = np.zeros(self.cells, dtype=np.uint8)
        for (a, b) in terms:
            if transpose:
                a, b = -a, -b
            v[self.idx(a + shift[0], b + shift[1])] ^= 1
        return v

    def shift_perm(self, a, b):
        perm = np.zeros(self.n, dtype=int)
        for i in range(self.l):
            for j in range(self.m):
                perm[self.idx(i, j)] = self.idx(i + a, j + b)
                perm[self.cells + self.idx(i, j)] = self.cells + self.idx(i + a, j + b)
        return perm


def mono_mul(t, u):
    return (t[0] + u[0], t[1] + u[1])


def neg(t):
    return (-t[0], -t[1])


BASES = {   # Eqs. 32-36 as printed (p. 45)
    "gross": dict(l=12, m=6,
                  p=[(4, 0), (5, 0), (6, 1), (4, 2), (5, 4), (6, 5)],
                  q=[(3, 0), (4, 0), (3, 1), (3, 2), (4, 2), (3, 5)],
                  r=[(0, 0), (8, 0), (1, 1), (9, 1), (3, 4), (11, 4)],
                  s=[(1, 0), (9, 0), (4, 4), (8, 4), (0, 5), (8, 5)],
                  alpha=[(0, 0), (3, 5), (11, 5), (10, 1), (5, 4), (4, 2)],
                  beta=[(0, 0), (2, 4), (1, 2), (2, 5), (1, 1), (3, 1)]),
    "two-gross": dict(l=12, m=12,
                      p=[(2, 0), (2, 2), (8, 2), (9, 2), (3, 3), (4, 3), (7, 4), (8, 6), (6, 7), (7, 11)],
                      q=[(3, 2), (5, 3), (7, 3), (11, 3), (8, 4), (8, 5), (6, 7), (4, 8), (1, 9), (1, 10)],
                      r=[(4, 2), (11, 2), (0, 5), (1, 5), (5, 5), (6, 5), (1, 8), (8, 8), (2, 11), (10, 11)],
                      s=[(2, 6), (2, 9), (2, 10), (11, 6), (11, 9), (11, 10), (8, 7), (11, 7), (5, 8), (11, 8)],
                      alpha=[(0, 0), (0, 3), (3, 7), (11, 11), (2, 9), (7, 4)],
                      beta=[(0, 0), (1, 1), (4, 0), (5, 4), (4, 3), (3, 5)]),
}


def build_code(name):
    D = BASES[name]
    code = BB(D["l"], D["m"])
    Xs, Zs = [], []
    for a in D["alpha"]:                                                       # X1 .. X6 = X(p, q) shifted by alpha
        Xs.append(np.concatenate([code.poly(D["p"], a), code.poly(D["q"], a)]))
    for b in D["beta"]:                                                        # X7 .. X12 = X(r, s) shifted by beta^-1
        Xs.append(np.concatenate([code.poly(D["r"], neg(b)), code.poly(D["s"], neg(b))]))
    for b in D["beta"]:                                                        # Z1 .. Z6 = Z(nu s^T, nu r^T) shifted by beta
        Zs.append(np.concatenate([code.poly(D["s"], mono_mul(b, NU), True), code.poly(D["r"], mono_mul(b, NU), True)]))
    for a in D["alpha"]:                                                       # Z7 .. Z12 = Z(mu q^T, mu p^T) shifted by alpha^-1
        Zs.append(np.concatenate([code.poly(D["q"], mono_mul(neg(a), MU), True), code.poly(D["p"], mono_mul(neg(a), MU), True)]))
    Xs, Zs = np.array(Xs), np.array(Zs)
    assert code.n == {"gross": 144, "two-gross": 288}[name]
    assert not (Xs.astype(int) @ code.HZ.T.astype(int) % 2).any(), "X-bar commutes with every Z check"
    assert not (Zs.astype(int) @ code.HX.T.astype(int) % 2).any(), "Z-bar commutes with every X check"
    assert ((Xs.astype(int) @ Zs.T.astype(int) % 2) == np.eye(12)).all(), "canonical pairing"
    R, piv = rref2(code.HX)
    assert code.n - len(piv) - rref2(code.HZ)[0].shape[0] == 12, "k = 12"
    return code, Xs, Zs, (R, piv)


def logical_action(code, Xs, Zs, stab, a, b):
    """12 x 12 matrix of the translation x^a y^b: column i = coefficients of its image of X-bar_i (pairing with the dual basis, App. A.2)."""
    R, piv = stab
    perm = code.shift_perm(a, b)
    M = np.zeros((12, 12), dtype=np.uint8)
    for i in range(12):
        img = np.zeros(code.n, dtype=np.uint8)
        img[perm[np.nonzero(Xs[i])[0]]] = 1
        coeff = (img.astype(int) @ Zs.T.astype(int) % 2).astype(np.uint8)
        resid = img ^ (coeff @ Xs % 2).astype(np.uint8)
        assert in_rowspace(R, piv, resid), "the image is the coefficient product up to a stabilizer"
        M[:, i] = coeff
    return M


def distinct(mats):
    return list({M.tobytes(): M for M in mats}.values())


# ------------------------------------------------------------------ Eq. 14: native measurements = images of the 15 non-trivial Paulis on logical qubits 1 and 7
def pauli_vec(x1, z1, x7, z7):
    v = np.zeros(24, dtype=np.uint8)           # (x_1 .. x_12 | z_1 .. z_12)
    v[0], v[12], v[6], v[18] = x1, z1, x7, z7
    return v


M15 = [pauli_vec(*bits) for bits in product((0, 1), repeat=4) if any(bits)]


def native_set(mats):
    """All distinct images (x -> M x, z -> M^-T z) of the 15 LPU Paulis under the given logical shift matrices."""
    N = {}
    for Mf in mats:
        Minvt = inv2(Mf).T
        for P in M15:
            v = np.concatenate([Mf.astype(int) @ P[:12] % 2, Minvt.astype(int) @ P[12:] % 2]).astype(np.uint8)
            N[v.tobytes()] = v
    return [N[k] for k in sorted(N)]


def enc(v):
    """The eleven qubits 2..12 of a 24-vector as one 22-bit integer: x bits 0..10, z bits 11..21."""
    x = sum(int(v[1 + i]) << i for i in range(11))
    z = sum(int(v[13 + i]) << i for i in range(11))
    return x | (z << 11)


def letter(v):
    return LETTERS[(int(v[0]), int(v[12]))]


# ------------------------------------------------------------------ the search over all 4^11 Paulis
def distances(gens, seeds):
    """dist[p] = fewest transvections by `gens` from p to a seed (-1 if none). Each transvection is an involution, so the graph is undirected and a search from the seeds is exact.
    Each level is expanded from its smaller side: forward from the frontier, or backward from the Paulis not yet reached. The identity is fixed by every transvection, so it is
    reached only when it is itself a seed (Q = X, Y, Z: Q (x) I is native); for Q = I the target I (x) I is no measurement and dist[0] stays -1."""
    gens = np.asarray(gens, dtype=np.int32)
    gx, gz = gens & MASK, gens >> 11
    dist = np.full(STATES, -1, dtype=np.int8)
    seeds = np.asarray(seeds, dtype=np.int32)
    dist[seeds] = 0
    frontier, visited, k = seeds, seeds.size, 0
    while frontier.size:
        k += 1
        if frontier.size <= STATES - visited:
            fx, fz = frontier & MASK, frontier >> 11
            for j in range(gens.size):
                cand = frontier[PAR[(fx & gz[j]) ^ (fz & gx[j])]] ^ gens[j]
                cand = cand[dist[cand] < 0]
                dist[cand] = k
        else:
            pool = np.flatnonzero(dist < 0).astype(np.int32)
            px, pz = pool & MASK, pool >> 11
            for j in range(gens.size):
                sel = pool[PAR[(px & gz[j]) ^ (pz & gx[j])]]
                dist[sel[dist[sel ^ gens[j]] == k - 1]] = k
        frontier = np.flatnonzero(dist == k).astype(np.int32)
        visited += frontier.size
    assert dist.max() <= 4
    assert np.flatnonzero(dist < 0).tolist() in ([], [0]), "every Pauli but the identity is reached"
    return dist


def summarize(dist):
    """beta histogram over the Paulis reached (all 4^11, or all but the identity), their sum of beta and mean."""
    counts = np.bincount(dist[dist >= 0].astype(np.int64), minlength=5)
    hist = {str(1 + 6 * k): int(counts[k]) for k in range(5)}
    total = sum(hist.values())
    assert total in (STATES, STATES - 1)
    s = sum((1 + 6 * k) * int(counts[k]) for k in range(5))
    return {"hist": hist, "total": total, "sum": s, "mean": s / total}


# ------------------------------------------------------------------ main
def main():
    out_codes, sample = {}, {}
    rng = np.random.default_rng(SEED)
    sizes = None
    for name in BASES:
        code, Xs, Zs, stab = build_code(name)
        acts = [logical_action(code, Xs, Zs, stab, a, b) for a in range(code.l) for b in range(code.m)]
        mats = distinct(acts)
        assert len(mats) == 36, "36 distinct logical shift classes"
        hyp = []
        for M in mats:
            H = np.zeros((12, 12), dtype=np.uint8)
            H[:6, :6] = M[:6, :6]
            H[6:, 6:] = M[:6, :6]
            hyp.append(H)
        readings = {"rotations245": distinct(mats), "rotations510": distinct(mats), "hypothetical245": distinct(hyp)}
        out_codes[name] = {}
        cache = {}
        for rname, rmats in readings.items():
            N = native_set(rmats)
            seeds = {Q: sorted({enc(v) for v in N if letter(v) == Q}) for Q in QS}
            if rname == "rotations510":
                gens = sorted({enc(v) for v in N if enc(v)})
            else:
                gens = sorted({enc(v) for v in N if letter(v) != "I" and enc(v)})
            entry = {"native": len(N), "rotations": len(gens), "seeds": {Q: len(seeds[Q]) for Q in QS}, "byQ": {}}
            dists = {}
            for Q in QS:
                key = (tuple(gens), tuple(seeds[Q]))
                if key not in cache:                      # the hypothetical reading often repeats a search verbatim
                    cache[key] = distances(gens, seeds[Q])
                dists[Q] = cache[key]
                entry["byQ"][Q] = summarize(dists[Q])
                print(f"{name} {rname} Q={Q}: native {len(N)}, rotations {len(gens)}, seeds {len(seeds[Q])}, mean beta {entry['byQ'][Q]['mean']:.3f}, hist {entry['byQ'][Q]['hist']}", flush=True)
            best = np.minimum(np.minimum(dists["X"], dists["Y"]), dists["Z"])
            entry["minOverQ"] = summarize(best)
            print(f"{name} {rname}: min over Q in XYZ mean {entry['minOverQ']['mean']:.3f}, hist {entry['minOverQ']['hist']}", flush=True)
            out_codes[name][rname] = entry
            if rname == "rotations245":
                sz = {"native": len(N), "rotations245": len(gens)}
                sample[name] = {}
                for Q in QS:                              # stratified over the five beta levels, identity excluded, drawn in a fixed order
                    paulis = []
                    for kk in range(5):
                        pool = np.flatnonzero(dists[Q] == kk)
                        pool = pool[pool != 0]
                        assert pool.size >= SAMPLE_QUOTA[kk]
                        paulis += sorted(int(p) for p in rng.choice(pool, size=SAMPLE_QUOTA[kk], replace=False))
                    sample[name][Q] = {"pauli": paulis, "beta": [1 + 6 * int(dists[Q][p]) for p in paulis]}
            elif rname == "rotations510":
                sz["rotations510"] = len(gens)
        sizes = sizes or sz
        assert sz == sizes, "both codes have the same native counts"
    assert sizes == {"native": 540, "rotations245": 245, "rotations510": 510}, sizes
    # regression guard: the best-of-Q means the lecture quotes
    expected = {("gross", "rotations245"): 18.526, ("two-gross", "rotations245"): 18.482, ("gross", "rotations510"): 16.483, ("two-gross", "rotations510"): 16.457}
    for (name, rname), want in expected.items():
        got = out_codes[name][rname]["minOverQ"]["mean"]
        assert abs(got - want) < 5e-4, (name, rname, got, want)
    for name in BASES:
        hyp = out_codes[name]["hypothetical245"]
        assert (hyp["native"], hyp["rotations"]) == (540, 245), "the hypothetical action keeps 540 native and 245 rotations"
    data = {
        "about": "Offline computation, pipeline/tdg_fig9.py: a breadth-first search over all 4^11 = 4194304 Paulis of the eleven other logical qubits of one module, for the cost beta = 1 + 6k (Eq. 17) of a Pauli measurement "
                 "in Fig. 9 of arXiv:2506.03094, k being the fewest native rotations that carry a native Q (x) R into Q (x) P. numpy only, deterministic; no result of the paper is copied.",
        "encoding": "A Pauli on logical qubits 2..12 is a 22-bit integer: x bits 0..10 (qubit i + 2 in bit i), z bits 11..21. The identity is 0. A transvection by a native rotation g maps p to p ^ g when "
                    "p and g anticommute (symplectic product 1) and fixes p otherwise. For Q = X, Y, Z the histograms cover all 4^11 Paulis (the identity costs beta = 1: Q alone is native); for Q = I the "
                    "identity I (x) I is no measurement and is left out, so those histograms cover 4^11 - 1 Paulis (see `total`).",
        "readings": {
            "rotations245": "the engine's shift action (A (+) A^T on logical qubits 7-12); rotations about native Paulis whose pivot letter is X, Y or Z (Eq. 15 as printed)",
            "rotations510": "the same shift action with the pivot letter I allowed in the rotations (the 510 the paper's text counts)",
            "hypothetical245": "if every shift acted as A (+) A, as p. 47 of the paper states; 245 rotations",
        },
        "seed": SEED,
        "sampleQuota": {str(1 + 6 * k): v for k, v in SAMPLE_QUOTA.items()},
        "sampleOf": "rotations245",
        "sizes": sizes,
        "states": STATES,
        "codes": out_codes,
        "sample": sample,
    }
    OUT.write_text(json.dumps(data, indent=1, sort_keys=True) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
