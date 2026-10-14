"""Independent numpy / pure-Python routes for the engine additions of the Papers background chapter B2 (app/src/physics/qec/bbfamily.ts, bp.ts, qldpc.ts).

Nothing here imports the TypeScript. Each object is rebuilt from its definition:
  - BB codes from np.kron circulants (qec_numpy.bb_matrices), k from GF(2) ranks and from the kernel of A and B together (Lemma 1 of Bravyi et al.);
  - the distance of [[72,12,6]] by a meet-in-the-middle search over syndromes (weights up to 6, both Pauli types), the toy code and the 3 x 4 torus by exhaustive search;
  - two presentations of one code: permute the columns of one pair of matrices and compare the SETS of rows with the other pair;
  - the thickness-2 layers: edges split by term name, degrees and pieces by a union-find;
  - the depth-8 cycle: clash counts and the parity rule by dictionaries, and a hand-written stabilizer tableau (Aaronson-Gottesman rules) that runs two cycles with a seeded generator;
  - the logical action of the translations through qec_numpy.logical_action (an XOR-integer elimination) in the paper's own logical basis;
  - belief propagation as min-sum over dictionaries of edge messages, OSD-0 with a greedy rank test; Hamming matrices from the binary expansion of 1 ... n.
Usage: imported by pipeline/make_bb2_fixtures.py and pipeline/claims_papers/b2.py.
"""
import itertools
import math
import random
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qec_numpy as Q  # noqa: E402
from surface_numpy import css_k, degrees, in_rowspace, kitaev_torus, mul2, nullspace, rank, rref  # noqa: E402

TABLE3 = {  # name: (l, m, A terms, B terms)
    "b72": (6, 6, [(3, 0), (0, 1), (0, 2)], [(0, 3), (1, 0), (2, 0)]),
    "b90": (15, 3, [(9, 0), (0, 1), (0, 2)], [(0, 0), (2, 0), (7, 0)]),
    "b108": (9, 6, [(3, 0), (0, 1), (0, 2)], [(0, 3), (1, 0), (2, 0)]),
    "b144": (12, 6, [(3, 0), (0, 1), (0, 2)], [(0, 3), (1, 0), (2, 0)]),
    "b288": (12, 12, [(3, 0), (0, 2), (0, 7)], [(0, 3), (1, 0), (2, 0)]),
    "b360": (30, 6, [(9, 0), (0, 1), (0, 2)], [(0, 3), (25, 0), (26, 0)]),
    "b756": (21, 18, [(3, 0), (0, 10), (0, 17)], [(0, 5), (3, 0), (19, 0)]),
}
GROSS_TORIC = (12, 6, [(0, 0), (0, 1), (3, -1)], [(0, 0), (1, 0), (-1, -3)])
TWO_GROSS_TORIC = (12, 12, [(0, 0), (0, 1), (3, -1)], [(0, 0), (1, 0), (-1, -3)])
TOY = (2, 6, [(0, 0), (0, 1), (0, 2)], [(0, 0), (0, 1), (1, 2)])


def bb(l, m, A, B):
    """(HX, HZ) of the BB code with polynomials A and B, from kron circulants."""
    _, _, hx, hz = Q.bb_matrices(l, m, A, B)
    return hx.astype(np.uint8), hz.astype(np.uint8)


# ---------------------------------------------------------------- Table 3 and Lemma 1
def table3_row(name):
    l, m, A, B = TABLE3[name]
    HX, HZ = bb(l, m, A, B)
    MA, MB, _, _ = Q.bb_matrices(l, m, A, B)
    ker = nullspace(np.vstack([MA % 2, MB % 2]).astype(np.uint8))
    cw, qd = degrees(HX, HZ)
    return dict(n=int(HX.shape[1]), k=int(css_k(HX, HZ)), rankX=int(rank(HX)), rankZ=int(rank(HZ)), kerDim=int(ker.shape[0]), checkWeight=cw, qubitDegree=qd, commute=not mul2(HX, HZ.T).any())


# ---------------------------------------------------------------- distance of [[72,12,6]] by meet in the middle
def mitm(HX, HZ, maxw):
    """The least weight w <= maxw of a vector v with HZ v = 0 outside the row space of HX (an X-type logical operator), with how many zero-syndrome vectors of that
    weight were found (capped) and how many of those are not stabilizers, plus up to 3 witnesses."""
    n = HX.shape[1]
    cols = [int("".join(str(int(b)) for b in HZ[:, j]), 2) for j in range(n)]
    half = (maxw + 1) // 2
    by = {}
    for w in range(0, half + 1):
        for S in itertools.combinations(range(n), w):
            s = 0
            for j in S:
                s ^= cols[j]
            by.setdefault(s, []).append(S)
    rsX = rank(HX)
    for w in range(1, maxw + 1):
        a = w // 2
        b = w - a
        hit = []
        for S1 in itertools.combinations(range(n), b):
            s1 = 0
            for j in S1:
                s1 ^= cols[j]
            for S2 in by.get(s1, []):
                if len(S2) == a and set(S1).isdisjoint(S2) and ((a == b and S1 < S2) or a != b):
                    v = np.zeros(n, dtype=np.uint8)
                    v[list(S1) + list(S2)] = 1
                    hit.append(v)
                    if len(hit) > 4000:
                        break
            if len(hit) > 4000:
                break
        nontrivial = [v for v in hit if rank(np.vstack([HX, v])) > rsX]
        if nontrivial:
            return dict(d=w, zeroSyndrome=len(hit), nontrivial=len(nontrivial), witnesses=[[int(i) for i in np.nonzero(v)[0]] for v in nontrivial[:3]])
    return dict(d=None, zeroSyndrome=0, nontrivial=0, witnesses=[])


def distance_exhaustive(HX, HZ, maxw):
    n = HX.shape[1]

    def dmin(Hk, Hs):
        rs = rank(Hs)
        for w in range(1, maxw + 1):
            for S in itertools.combinations(range(n), w):
                v = np.zeros(n, dtype=np.uint8)
                v[list(S)] = 1
                if not (Hk @ v % 2).any() and rank(np.vstack([Hs, v])) > rs:
                    return w
        return None

    return min(dmin(HZ, HX), dmin(HX, HZ))


# ---------------------------------------------------------------- presentations
def iso_holds(l, m, A1, B1, A2, B2, alpha, beta, u=1):
    """Do the columns of (HX1, HZ1), moved by L cell (i, j) -> (i + alpha0, u*j + alpha1) and R cell likewise with beta, give exactly the rows of (HX2, HZ2) as sets?"""
    HX1, HZ1 = bb(l, m, A1, B1)
    HX2, HZ2 = bb(l, m, A2, B2)
    cells = l * m
    perm = list(range(2 * cells))
    for i in range(l):
        for j in range(m):
            c = i * m + j
            jp = (u * j) % m
            perm[c] = ((i + alpha[0]) % l) * m + (jp + alpha[1]) % m
            perm[cells + c] = cells + ((i + beta[0]) % l) * m + (jp + beta[1]) % m

    def moved(H):
        out = np.zeros_like(H)
        for c in range(H.shape[1]):
            out[:, perm[c]] = H[:, c]
        return out

    rows = lambda H: sorted(tuple(r) for r in H)
    return rows(moved(HX1)) == rows(HX2) and rows(moved(HZ1)) == rows(HZ2)


# ---------------------------------------------------------------- layers
def layers(l, m, A, B, layer1):
    """Edges named by term (X: L by A, R by B; Z: L by B^T, R by A^T), split by name; returns per layer (edges, max degree, {piece size: count})."""
    out = [dict(nodes={}, edges=0), dict(nodes={}, edges=0)]
    idx = lambda i, j: (i % l) * m + (j % m)
    parents = [{}, {}]

    def find(p, a):
        while p[a] != a:
            p[a] = p[p[a]]
            a = p[a]
        return a

    def link(layer, a, b):
        p = parents[layer]
        for v in (a, b):
            p.setdefault(v, v)
            out[layer]["nodes"][v] = out[layer]["nodes"].get(v, 0) + 1
        p[find(p, a)] = find(p, b)
        out[layer]["edges"] += 1

    for c in range(l * m):
        i, j = divmod(c, m)
        for k in range(3):
            for name, node in ((f"A{k+1}", ("L", idx(i + A[k][0], j + A[k][1]), "X")), (f"B{k+1}", ("R", idx(i + B[k][0], j + B[k][1]), "X")),
                               (f"B{k+1}", ("L", idx(i - B[k][0], j - B[k][1]), "Z")), (f"A{k+1}", ("R", idx(i - A[k][0], j - A[k][1]), "Z"))):
                layer = 0 if name in layer1 else 1
                link(layer, (node[2], c), (node[0], node[1]))
    res = []
    for layer in (0, 1):
        p = parents[layer]
        sizes = {}
        for v in p:
            r = find(p, v)
            sizes[r] = sizes.get(r, 0) + 1
        hist = {}
        for s in sizes.values():
            hist[s] = hist.get(s, 0) + 1
        res.append(dict(edges=out[layer]["edges"], maxDegree=max(out[layer]["nodes"].values()), pieces={str(k): v for k, v in sorted(hist.items())}))
    return res


# ---------------------------------------------------------------- the depth-8 cycle
SLOTS = {  # (check, family, poly, term) -> round
    "printed": {("X", "L", "A", 1): 2, ("X", "L", "A", 0): 6, ("X", "L", "A", 2): 7, ("X", "R", "B", 1): 3, ("X", "R", "B", 0): 4, ("X", "R", "B", 2): 5,
                ("Z", "R", "A", 0): 1, ("Z", "R", "A", 2): 2, ("Z", "R", "A", 1): 6, ("Z", "L", "B", 0): 3, ("Z", "L", "B", 1): 4, ("Z", "L", "B", 2): 5},
}
SLOTS["swap-z-reads"] = dict(SLOTS["printed"])
SLOTS["swap-z-reads"][("Z", "R", "A", 0)] = 6
SLOTS["swap-z-reads"][("Z", "R", "A", 1)] = 1


def touches(l, m, A, B, variant):
    """Per check kind and cell: {data qubit: round}."""
    cells = l * m
    idx = lambda i, j: (i % l) * m + (j % m)
    out = {"X": [], "Z": []}
    for c in range(cells):
        i, j = divmod(c, m)
        for kind in ("X", "Z"):
            d = {}
            for (ck, fam, poly, term), rnd in SLOTS[variant].items():
                if ck != kind:
                    continue
                off = (A if poly == "A" else B)[term]
                sg = 1 if kind == "X" else -1
                cell = idx(i + sg * off[0], j + sg * off[1])
                d[cell if fam == "L" else cells + cell] = rnd
            out[kind].append(d)
    return out


def schedule_report(l, m, A, B, variant):
    cells = l * m
    t = touches(l, m, A, B, variant)
    use = {}
    for kind in ("X", "Z"):
        for c in range(cells):
            for q, r in t[kind][c].items():
                use[(q, r)] = use.get((q, r), 0) + 1
    clashes = sum(1 for v in use.values() if v > 1)
    bad = 0
    maxov = 0
    for a in range(cells):
        for b in range(cells):
            shared = set(t["X"][a]) & set(t["Z"][b])
            maxov = max(maxov, len(shared))
            if sum(1 for q in shared if t["X"][a][q] < t["Z"][b][q]) % 2:
                bad += 1
    return dict(clashes=clashes, badPairs=bad, pairs=cells * cells, maxOverlap=maxov)


class Tab:
    """Aaronson-Gottesman tableau (n qubits), written separately from the TypeScript."""

    def __init__(self, n, rng):
        self.n = n
        self.rng = rng
        self.x = np.zeros((2 * n + 1, n), dtype=np.uint8)
        self.z = np.zeros((2 * n + 1, n), dtype=np.uint8)
        self.r = np.zeros(2 * n + 1, dtype=np.uint8)
        for i in range(n):
            self.x[i, i] = 1
            self.z[n + i, i] = 1

    def h(self, a):
        self.r ^= self.x[:, a] & self.z[:, a]
        t = self.x[:, a].copy()
        self.x[:, a] = self.z[:, a]
        self.z[:, a] = t

    def cnot(self, a, b):
        self.r ^= self.x[:, a] & self.z[:, b] & (self.x[:, b] ^ self.z[:, a] ^ 1)
        self.x[:, b] ^= self.x[:, a]
        self.z[:, a] ^= self.z[:, b]

    def rowsum(self, hh, ii):
        x1, z1, x2, z2 = self.x[ii].astype(int), self.z[ii].astype(int), self.x[hh].astype(int), self.z[hh].astype(int)
        g = np.where((x1 == 0) & (z1 == 0), 0, np.where((x1 == 1) & (z1 == 1), z2 - x2, np.where((x1 == 1) & (z1 == 0), z2 * (2 * x2 - 1), x2 * (1 - 2 * z2)))).sum()
        tot = 2 * int(self.r[hh]) + 2 * int(self.r[ii]) + int(g)
        self.r[hh] = (tot % 4) // 2
        self.x[hh] ^= self.x[ii]
        self.z[hh] ^= self.z[ii]

    def measure_z(self, a):
        n = self.n
        ps = np.nonzero(self.x[n:2 * n, a])[0]
        if len(ps):
            p = ps[0] + n
            for i in range(2 * n):
                if i != p and self.x[i, a]:
                    self.rowsum(i, p)
            self.x[p - n] = self.x[p]
            self.z[p - n] = self.z[p]
            self.r[p - n] = self.r[p]
            self.x[p] = 0
            self.z[p] = 0
            self.z[p, a] = 1
            out = self.rng.randint(0, 1)
            self.r[p] = out
            return out
        h = 2 * n
        self.x[h] = 0
        self.z[h] = 0
        self.r[h] = 0
        for i in range(n):
            if self.x[i, a]:
                self.rowsum(h, i + n)
        return int(self.r[h])

    def reset(self, a):
        if self.measure_z(a):
            self.r ^= self.z[:, a]


def cycle_detectors(l, m, A, B, variant, cycles, seed):
    cells = l * m
    n = 2 * cells
    rng = random.Random(seed)
    T = Tab(n + 2 * cells, rng)
    t = touches(l, m, A, B, variant)
    byround = {}
    for kind in ("X", "Z"):
        for c in range(cells):
            for q, r in t[kind][c].items():
                byround.setdefault(r, []).append((kind, c, q))
    meas = {}
    for cyc in range(cycles):
        for r in range(1, 9):
            if r == 1:
                for c in range(cells):
                    T.reset(n + c)
                    T.h(n + c)
            for kind, c, q in byround.get(r, []):
                if kind == "X":
                    T.cnot(n + c, q)
                else:
                    T.cnot(q, n + cells + c)
            if r == 7:
                for c in range(cells):
                    meas[("Z", c, cyc)] = T.measure_z(n + cells + c)
            if r == 8:
                for c in range(cells):
                    T.h(n + c)
                    meas[("X", c, cyc)] = T.measure_z(n + c)
                    T.reset(n + cells + c)
    det = []
    for c in range(cells):
        for cyc in range(cycles):
            det.append(meas[("Z", c, cyc)] ^ (meas[("Z", c, cyc - 1)] if cyc else 0))
            if cyc:
                det.append(meas[("X", c, cyc)] ^ meas[("X", c, cyc - 1)])
    return dict(detectors=len(det), nonzero=int(sum(det)))


# ---------------------------------------------------------------- translations and the logical qubits
def int_matrix_key(M):
    return "/".join("".join(str(int(b)) for b in row) for row in M)


def mat_mul(A, B):
    return (np.array(A, dtype=np.int64) @ np.array(B, dtype=np.int64) % 2).astype(np.uint8)


def mat_order(M, cap=200):
    I = np.eye(len(M), dtype=np.uint8)
    P = np.array(M, dtype=np.uint8)
    for e in range(1, cap):
        if (P == I).all():
            return e
        P = mat_mul(P, M)
    return None


def group_order(gens, cap=100000):
    I = np.eye(len(gens[0]), dtype=np.uint8)
    seen = {int_matrix_key(I)}
    frontier = [I]
    while frontier:
        nxt = []
        for Mt in frontier:
            for g in gens:
                P = mat_mul(Mt, g)
                k = int_matrix_key(P)
                if k not in seen:
                    seen.add(k)
                    nxt.append(P)
        frontier = nxt
        if len(seen) > cap:
            return None
    return len(seen)


def shift_facts(which):
    """The translations of the gross (or two-gross) code and their logical action in the paper's own basis (qec_numpy.paper_logical_basis)."""
    D = Q.PAPER[which]
    l, m = D["l"], D["m"]
    Xs, _, cells = Q.paper_logical_basis(which)
    A_, B_ = Q.A_TERMS, Q.B_TERMS
    _, _, hx, hz = Q.bb_matrices(l, m, A_, B_)
    hx_rows = hx.astype(np.uint8).tolist()
    hz = hz.astype(np.uint8)
    hxu = hx.astype(np.uint8)
    n = 2 * cells

    def perm_of(a, b):
        p = []
        for q in range(n):
            base = 0 if q < cells else cells
            i, j = divmod(q - base, m)
            p.append(base + ((i + a) % l) * m + ((j + b) % m))
        return p

    def preserves(perm):
        for H in (hxu, hz):
            rows = {tuple(r) for r in H}
            for r in H:
                moved = np.zeros_like(r)
                moved[[perm[i] for i in np.nonzero(r)[0]]] = 1
                if tuple(moved) not in rows:
                    return False
        return True

    kept = sum(1 for a in range(l) for b in range(m) if preserves(perm_of(a, b)))
    swap = list(range(n))
    swap[0], swap[1] = 1, 0
    acts = {}
    for a in range(l):
        for b in range(m):
            M = Q.logical_action(l, m, hx_rows, Xs, (a, b))
            acts.setdefault(int_matrix_key(M), []).append((a, b))
    Mx = np.array(Q.logical_action(l, m, hx_rows, Xs, (1, 0)), dtype=np.uint8)
    My = np.array(Q.logical_action(l, m, hx_rows, Xs, (0, 1)), dtype=np.uint8)
    idkey = int_matrix_key(np.eye(12, dtype=np.uint8))
    return dict(preserved=kept, swapPreserves=bool(preserves(swap)), orderX=mat_order(Mx), orderY=mat_order(My), onesX=int(Mx.sum()), distinct=len(acts),
                trivial=len(acts.get(idkey, [])), groupOrder=group_order([Mx, My]))


# ---------------------------------------------------------------- belief propagation and OSD-0
def min_sum(H, s, p, iters):
    m, n = H.shape
    lam0 = math.log((1 - p) / p)
    edges = [(c, v) for c in range(m) for v in range(n) if H[c, v]]
    cv = {e: 0.0 for e in edges}
    vc = {e: lam0 for e in edges}
    hist = []
    for it in range(1, iters + 1):
        for c in range(m):
            vs = [v for v in range(n) if H[c, v]]
            sgn_s = -1.0 if s[c] else 1.0
            for v in vs:
                others = [vc[(c, u)] for u in vs if u != v]
                sg = sgn_s * np.prod([1.0 if x >= 0 else -1.0 for x in others])
                cv[(c, v)] = sg * min(abs(x) for x in others)
        marg = np.full(n, lam0)
        for (c, v), val in cv.items():
            marg[v] += val
        for (c, v) in edges:
            vc[(c, v)] = marg[v] - cv[(c, v)]
        hard = (marg <= 0).astype(np.uint8)
        hist.append((it, marg.copy(), hard.copy()))
        if not (((H @ hard) % 2) ^ s).any():
            return True, it, marg, hard, hist
    return False, iters, marg, hard, hist


def osd0(H, s, marg, tie="low"):
    m, n = H.shape
    order = sorted(range(n), key=lambda j: (marg[j], j if tie == "low" else -j))
    rk = rank(H)
    S = []
    cur = np.zeros((m, 0), dtype=np.uint8)
    for j in order:
        test = np.hstack([cur, H[:, [j]]])
        if rank(test) > cur.shape[1]:
            cur = test
            S.append(j)
        if len(S) == rk:
            break
    A_ = np.hstack([cur, s.reshape(-1, 1)]).astype(np.uint8)
    R, piv = rref(A_)
    e = np.zeros(n, dtype=np.uint8)
    for i, pc in enumerate(piv):
        e[S[pc]] = R[i, -1]
    return e, S


def rep_check(n):
    H = np.zeros((n - 1, n), dtype=np.uint8)
    for i in range(n - 1):
        H[i, i] = H[i, i + 1] = 1
    return H


def four_cycles(H):
    G = H.astype(int) @ H.T.astype(int)
    np.fill_diagonal(G, 0)
    return int((G >= 2).sum() // 2)


def bp_facts():
    out = {}
    H7 = rep_check(7)
    e = np.zeros(7, dtype=np.uint8)
    e[3] = 1
    ok, it, marg, hard, hist = min_sum(H7, H7 @ e % 2, 0.05, 7)
    out["rep7"] = dict(converged=bool(ok), iterations=int(it), estimate=[int(i) for i in np.nonzero(hard)[0]], marginals=[float(x) for x in marg], hardWeights=[int(h.sum()) for _, _, h in hist])
    T3 = kitaev_torus(3)
    HZ3, HX3 = T3["HZ"], T3["HX"]
    e = np.zeros(T3["n"], dtype=np.uint8)
    e[[T3["h"](0, 0), T3["v"](0, 0)]] = 1
    s = HZ3 @ e % 2
    ok, it, marg, hard, hist = min_sum(HZ3, s, 0.05, T3["n"])
    star0 = [int(i) for i in np.nonzero(HX3[0])[0]]
    tor = dict(error=[int(i) for i in np.nonzero(e)[0]], lit=[int(i) for i in np.nonzero(s)[0]], converged=bool(ok), iterations=int(it), hardWeights=[int(h.sum()) for _, _, h in hist],
               marginals=[float(x) for x in marg], star=star0, finalWeight=int(hard.sum()))
    for tie in ("low", "high"):
        eo, S = osd0(HZ3, s, marg, tie)
        diff = eo ^ e
        tor[f"osd_{tie}"] = dict(weight=int(eo.sum()), support=[int(i) for i in np.nonzero(eo)[0]], valid=not (((HZ3 @ eo) % 2) ^ s).any(), diffIsStabilizer=bool(in_rowspace(HX3, diff)), diffWeight=int(diff.sum()), infoSet=[int(j) for j in S])
    out["toric3"] = tor
    e1 = np.zeros(T3["n"], dtype=np.uint8)
    e1[T3["h"](1, 1)] = 1
    ok1, it1, marg1, hard1, hist1 = min_sum(HZ3, HZ3 @ e1 % 2, 0.05, T3["n"])
    out["toric3Single"] = dict(converged=bool(ok1), iterations=int(it1), estimate=[int(i) for i in np.nonzero(hard1)[0]])
    out["fourCycles"] = dict(toric3=four_cycles(HZ3), gross=four_cycles(bb(*GROSS_TORIC)[1]), grossX=four_cycles(bb(*GROSS_TORIC)[0]))
    out["llr"] = dict(p05=math.log(0.95 / 0.05), p01=math.log(0.99 / 0.01))
    return out


def hamming_H(r):
    n = 2 ** r - 1
    return np.array([[(c >> (r - 1 - i)) & 1 for c in range(1, n + 1)] for i in range(r)], dtype=np.uint8)
