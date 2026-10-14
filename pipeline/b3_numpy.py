"""Independent numpy / pure-Python routes for Chapter B3 (measuring logical operators: lattice surgery and gauging).

Nothing here imports the app. Each function is the "twin" of a TypeScript engine function in app/src/physics/qec/ (update.ts, tableau.ts measurePauli, surgery.ts, gauge.ts, graph.ts,
cssdist.ts, timelike.ts, cnot.ts) reached by a DIFFERENT route:
  - a state is a dense 2^n vector and a Pauli acts by index arithmetic (bit q of the basis index is qubit q); a measurement is the projector (1 + s P)/2;
  - GF(2) objects are Python integers used as bit masks (bit q = qubit q); ranks, null spaces and spans by elimination on those integers;
  - a distance is the minimum over EVERY vector of the null space that is not in the row span (no coset trick);
  - the gauging deformation paths are found by solving the incidence system over GF(2) (the engine walks a spanning tree), and the cycle space as a null space (the engine uses fundamental cycles);
  - merged-code check classes (kept / widened / new) come from rank arithmetic against the checks of the two separate patches, not from comparing supports;
  - time-like chances sum the probability of every flip pattern (the engine uses the closed form / binomial tail).
Conventions as the app: rotated patch qubit (r, c) = r * cols + c, X faces where r + c is even, X half-faces on top and bottom, Z half-faces on the left and right.
"""
import itertools
import math
from math import comb, sqrt

import numpy as np

# ------------------------------------------------------------------------------------------------------------------------------ GF(2) on integers


def mask(qs):
    m = 0
    for q in qs:
        m |= 1 << q
    return m


def pop(v):
    return bin(v).count("1")


def gf2_reduce(v, basis):
    for b in basis:
        v = min(v, v ^ b)
    return v


def gf2_basis(rows):
    basis = []
    for r in rows:
        r = gf2_reduce(int(r), basis)
        if r:
            basis.append(r)
            basis.sort(reverse=True)
    return basis


def gf2_rank(rows):
    return len(gf2_basis(rows))


def gf2_in_span(v, rows):
    return gf2_reduce(int(v), gf2_basis(rows)) == 0


def gf2_nullspace(rows, n):
    """A basis (ints) of {v : popcount(row & v) even for every row}."""
    mat = [int(r) for r in rows]
    piv = []
    r = 0
    for c in range(n):
        p = next((i for i in range(r, len(mat)) if (mat[i] >> c) & 1), None)
        if p is None:
            continue
        mat[r], mat[p] = mat[p], mat[r]
        for i in range(len(mat)):
            if i != r and (mat[i] >> c) & 1:
                mat[i] ^= mat[r]
        piv.append(c)
        r += 1
    basis = []
    for f in [c for c in range(n) if c not in piv]:
        v = 1 << f
        for i, c in enumerate(piv):
            if (mat[i] >> f) & 1:
                v |= 1 << c
        basis.append(v)
    return basis


def span_iter(basis):
    for m in range(1 << len(basis)):
        v = 0
        for i, b in enumerate(basis):
            if (m >> i) & 1:
                v ^= b
        yield v


def css_distance(HX, HZ, n):
    """(dX, dZ): dX = least weight of v with HZ v = 0 that is not in rowspace(HX); dZ the same with the roles swapped. None when k = 0."""

    def dmin(kill, stab):
        sb = gf2_basis(stab)
        best = None
        for v in span_iter(gf2_nullspace(kill, n)):
            if v and gf2_reduce(v, sb) != 0:
                w = pop(v)
                best = w if best is None or w < best else best
        return best

    return dmin(HZ, HX), dmin(HX, HZ)


def css_k(n, HX, HZ):
    return n - gf2_rank(HX) - gf2_rank(HZ)


def css_commutes(HX, HZ):
    return all(pop(x & z) % 2 == 0 for x in HX for z in HZ)


# ------------------------------------------------------------------------------------------------------------------------------ rotated patches


def rotated(rows, cols):
    """(n, X checks, Z checks) as sorted qubit tuples; face rule of the app's rotatedSurfaceCode on a rows x cols grid."""
    q = lambda r, c: r * cols + c
    at = lambda r, c: q(r, c) if 0 <= r < rows and 0 <= c < cols else None
    X, Z = [], []
    for r in range(-1, rows):
        for c in range(-1, cols):
            typ = "X" if (r + c) % 2 == 0 else "Z"
            qs = tuple(sorted(x for x in (at(r, c), at(r, c + 1), at(r + 1, c), at(r + 1, c + 1)) if x is not None))
            if len(qs) == 4:
                (X if typ == "X" else Z).append(qs)
            elif len(qs) == 2:
                top = r == -1 or r == rows - 1
                side = c == -1 or c == cols - 1
                if top and not side and typ == "X":
                    X.append(qs)
                if side and not top and typ == "Z":
                    Z.append(qs)
    return rows * cols, X, Z


def merge_stats(d, product="XX"):
    """n, k, seam size, new checks and widened checks of the merged patch, by GF(2) rank arithmetic against the two separate patches."""
    xx = product == "XX"
    rows, cols = (d, 2 * d + 1) if xx else (2 * d + 1, d)
    n, MX, MZ = rotated(rows, cols)
    _, SX, SZ = rotated(d, d)
    qm = lambda r, c: r * cols + c
    offB = (0, d + 1) if xx else (d + 1, 0)
    mapA = lambda i: qm(i // d, i % d)
    mapB = lambda i: qm(i // d + offB[0], i % d + offB[1])
    oldX = [mask(mapA(i) for i in s) for s in SX] + [mask(mapB(i) for i in s) for s in SX]
    oldZ = [mask(mapA(i) for i in s) for s in SZ] + [mask(mapB(i) for i in s) for s in SZ]
    mX = [mask(s) for s in MX]
    mZ = [mask(s) for s in MZ]
    k = css_k(n, mX, mZ)
    if xx:
        new = gf2_rank(mX) - gf2_rank(oldX)
        widened = sum(1 for z in mZ if not gf2_in_span(z, oldZ))
    else:
        new = gf2_rank(mZ) - gf2_rank(oldZ)
        widened = sum(1 for x in mX if not gf2_in_span(x, oldX))
    return dict(n=n, k=k, seam=d, new=new, widened=widened)


def merged_distance(d, product="XX"):
    rows, cols = (d, 2 * d + 1) if product == "XX" else (2 * d + 1, d)
    n, MX, MZ = rotated(rows, cols)
    return css_distance([mask(s) for s in MX], [mask(s) for s in MZ], n)


# ------------------------------------------------------------------------------------------------------------------------------ dense states


_IDX = {}


def idx(n):
    if n not in _IDX:
        _IDX[n] = np.arange(2**n, dtype=np.int64)
    return _IDX[n]


def apply_pauli(psi, n, x, z):
    """Hermitian-letter Pauli with X part x and Z part z (bit masks); Y where both are set."""
    i = idx(n)
    par = np.zeros(len(i), dtype=np.int8)
    for b in range(n):
        if (z >> b) & 1:
            par ^= ((i >> b) & 1).astype(np.int8)
    sgn = 1 - 2 * par.astype(np.int64)
    out = np.empty_like(psi)
    out[i ^ x] = (1j ** pop(x & z)) * sgn * psi
    return out


def expect(psi, n, x, z):
    return float(np.vdot(psi, apply_pauli(psi, n, x, z)).real)


def project(psi, n, x, z, s):
    return 0.5 * (psi + s * apply_pauli(psi, n, x, z))


def dense_surgery_d3():
    """Merge two distance-3 patches across a 3-qubit seam in |0>, then split, on the full 21-qubit state vector (XX product).
    Returns the numbers the chapter claims: chances of the 16 merge patterns, of the product, of the 8 seam outcomes, how many flip Zbar Zbar."""
    d = 3
    rows, cols = 3, 7
    nq = 21
    q7 = lambda r, c: r * cols + c
    _, SX, SZ = rotated(3, 3)
    mapA = lambda i: q7(i // 3, i % 3)
    mapB = lambda i: q7(i // 3, i % 3 + 4)
    oldX = [tuple(sorted(mapA(i) for i in s)) for s in SX] + [tuple(sorted(mapB(i) for i in s)) for s in SX]
    _, MX, MZ = rotated(rows, cols)
    newX = [s for s in MX if s not in oldX]
    seam = [q7(r, 3) for r in range(3)]
    XbA = mask(mapA(r * 3) for r in range(3))
    XbB = mask(mapB(r * 3) for r in range(3))
    ZbA = mask(mapA(c) for c in range(3))
    ZbB = mask(mapB(c) for c in range(3))
    XX = XbA ^ XbB
    out = {}
    base = np.zeros(2**nq, complex)
    base[0] = 1.0
    for s in oldX:
        base = project(base, nq, mask(s), 0, +1)
    base /= np.linalg.norm(base)
    zero_zero = base.copy()
    plus_plus = project(project(base, nq, XbA, 0, +1), nq, XbB, 0, +1)
    plus_plus /= np.linalg.norm(plus_plus)
    for name, psi0 in (("zero", zero_zero), ("plus", plus_plus)):
        pats = {}
        prods = {}

        def rec(v, i, signs):
            if i == len(newX):
                p = float(np.vdot(v, v).real)
                pats[signs] = p
                return
            for s in (+1, -1):
                w = project(v, nq, mask(newX[i]), 0, s)
                if float(np.vdot(w, w).real) > 1e-12:
                    rec(w, i + 1, signs + (s,))
                else:
                    pats[signs + (s,) + (0,) * (len(newX) - i - 1)] = 0.0

        rec(psi0, 0, ())
        live = {k: v for k, v in pats.items() if v > 1e-12}
        out[name] = dict(
            total=sum(pats.values()),
            nPatterns=len(live),
            minChance=min(live.values()),
            maxChance=max(live.values()),
            pPlus=sum(p for s, p in live.items() if int(np.prod(s)) == 1),
        )
    # split after the all +1 merge on |0bar 0bar>
    v = zero_zero.copy()
    for s in newX:
        v = project(v, nq, mask(s), 0, +1)
    v /= np.linalg.norm(v)
    ps, flips, zzs = [], 0, []
    for zs in itertools.product([0, 1], repeat=3):
        w = v.copy()
        for q, b in zip(seam, zs):
            w = project(w, nq, 0, 1 << q, 1 - 2 * b)
        p = float(np.vdot(w, w).real)
        if p > 1e-12:
            w /= math.sqrt(p)
            ps.append(p)
            zz = expect(w, nq, 0, ZbA ^ ZbB)
            zzs.append(zz)
            if zz < 0:
                flips += 1
            assert abs(expect(w, nq, XX, 0) - 1.0) < 1e-9, "the merge product is lost by the split"
            assert abs(zz - (1 - 2 * zs[0])) < 1e-9, "Zbar Zbar sign must follow the top seam readout"
    out["split"] = dict(count=len(ps), chance=ps[0], minChance=min(ps), maxChance=max(ps), flips=flips)
    return out


# ------------------------------------------------------------------------------------------------------------------------------ three measurements make a CNOT


def cnot_stats():
    """All 8 outcome triples on three wires (c, a, t), dense 8-vectors (kron order c, a, t)."""
    I2 = np.eye(2)
    Xg = np.array([[0.0, 1.0], [1.0, 0.0]])
    Zg = np.diag([1.0, -1.0])
    kron = lambda *ms: np.kron(np.kron(ms[0], ms[1]), ms[2])
    ZZI, IXX, IZI = kron(Zg, Zg, I2), kron(I2, Xg, Xg), kron(I2, Zg, I2)
    plus = np.array([1.0, 1.0]) / sqrt(2)
    CN = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], float)
    rows = []
    for m1, m2, m3 in itertools.product((0, 1), repeat=3):
        s1, s2, s3 = (1 - 2 * m1), (1 - 2 * m2), (1 - 2 * m3)
        cols = []
        for b in range(4):
            e = np.zeros(4)
            e[b] = 1.0
            v = np.einsum("ct,a->cat", e.reshape(2, 2), plus).reshape(8)
            v = 0.5 * (v + s1 * ZZI @ v)
            v = 0.5 * (v + s2 * IXX @ v)
            v = 0.5 * (v + s3 * IZI @ v)
            cols.append(v.reshape(2, 2, 2)[:, m3, :].reshape(4))
        M = np.array(cols).T
        fix = np.kron(np.linalg.matrix_power(Zg, m2), np.linalg.matrix_power(Xg, m1 ^ m3)) @ CN
        match = np.allclose(M * sqrt(8), fix) or np.allclose(M * sqrt(8), -fix)
        mtm = np.allclose(M.T @ M, np.eye(4) / 8)
        rows.append(dict(m=(m1, m2, m3), z=m2, x=m1 ^ m3, match=bool(match), mtm=bool(mtm)))
    return dict(
        noFix=sum(1 for r in rows if r["z"] == 0 and r["x"] == 0),
        zFix=sum(1 for r in rows if r["z"] == 1),
        xFix=sum(1 for r in rows if r["x"] == 1),
        allMatch=all(r["match"] and r["mtm"] for r in rows),
        chance=1 / 8,
    )


def product_measure_dense():
    """Two data qubits in |++>, a helper; Z1Z2 through two CNOTs onto the helper (dense 3-qubit vector, little endian) against reading Z1 then Z2."""
    psi = np.zeros(8, complex)
    for a in range(2):
        for b in range(2):
            psi[a + 2 * b] = 0.5
    v = psi.copy()
    for ctl in (0, 1):
        w = np.zeros_like(v)
        for i in range(8):
            j = i ^ (1 << 2) if (i >> ctl) & 1 else i
            w[j] += v[i]
        v = w
    p_even = float(sum(abs(v[i]) ** 2 for i in range(8) if ((i >> 2) & 1) == 0))
    post = np.array([v[i] if ((i >> 2) & 1) == 0 else 0 for i in range(8)]) / sqrt(p_even)
    conc = 2 * abs(post[0] * post[3] - post[1] * post[2])
    return dict(pEven=p_even, ampSame=float(abs(post[0])), pSep=float(abs(psi[0]) ** 2), concurrence=float(conc))


# ------------------------------------------------------------------------------------------------------------------------------ symplectic update rule and census


def sym(p):
    x = z = 0
    for q, ch in enumerate(p):
        if ch in "XY":
            x |= 1 << q
        if ch in "ZY":
            z |= 1 << q
    return x, z


def anticommute(p, q):
    return (pop(p[0] & q[1]) + pop(p[1] & q[0])) % 2 == 1


def census(gens, n):
    """Counts of the 4^n - 1 non-identity Paulis: fixed (+-P in the group), logical (commute with all, not in the group), clashing."""
    rows = [(g[0] << n) | g[1] for g in gens]
    basis = gf2_basis(rows)
    fixed = logical = clash = 0
    for a in range(1, 4**n):
        x = z = 0
        v = a
        for q in range(n):
            l = v % 4
            v //= 4
            if l in (1, 3):
                x |= 1 << q
            if l in (2, 3):
                z |= 1 << q
        P = (x, z)
        if any(anticommute(g, P) for g in gens):
            clash += 1
        elif gf2_reduce((x << n) | z, basis) == 0:
            fixed += 1
        else:
            logical += 1
    return dict(fixed=fixed, logical=logical, clashing=clash)


def update_rule(gens, P):
    """Symplectic update: the first clashing generator is replaced by P, the other clashing ones multiplied by it. Returns (new generators as (x, z), kind)."""
    anti = [anticommute(g, P) for g in gens]
    if any(anti):
        first = anti.index(True)
        new = []
        for i, g in enumerate(gens):
            if i == first:
                new.append(P)
            elif anti[i]:
                new.append((g[0] ^ gens[first][0], g[1] ^ gens[first][1]))
            else:
                new.append(g)
        return new, "replaced"
    n = max(1, max(max(g[0].bit_length(), g[1].bit_length()) for g in gens + [P]))
    rows = [(g[0] << n) | g[1] for g in gens]
    return (gens, "fixed") if gf2_in_span((P[0] << n) | P[1], rows) else (gens + [P], "added")


def letters(p, n):
    out = ""
    for q in range(n):
        xb, zb = (p[0] >> q) & 1, (p[1] >> q) & 1
        out += "I" if not (xb or zb) else "X" if xb and not zb else "Z" if zb and not xb else "Y"
    return out


# ------------------------------------------------------------------------------------------------------------------------------ gauging


def solve_columns(cols, target):
    """A set of columns (as a bit mask over their indices) whose XOR is `target`; asserts it exists."""
    basis = []
    for j, c in enumerate(cols):
        v, t = c, 1 << j
        for bv, bt in basis:
            if v ^ bv < v:
                v ^= bv
                t ^= bt
        if v:
            basis.append((v, t))
            basis.sort(reverse=True)
    v, t = target, 0
    for bv, bt in basis:
        if v ^ bv < v:
            v ^= bv
            t ^= bt
    assert v == 0, "no edge set has this boundary"
    return t


def gauge_build(n, Xch, Zch, support, edges):
    """Gauging of L = X on `support` along the graph `edges` (pairs of support qubits). Checks are int masks. New qubit n + j = edge j."""
    V, E = len(support), len(edges)
    vidx = {q: i for i, q in enumerate(support)}
    inc_cols = [(1 << vidx[a]) | (1 << vidx[b]) for a, b in edges]  # V-bit column per edge
    A = []
    for v, q in enumerate(support):
        m = 1 << q
        for j, (a, b) in enumerate(edges):
            if v in (vidx[a], vidx[b]):
                m |= 1 << (n + j)
        A.append(m)
    inc_rows = [sum(1 << j for j in range(E) if (inc_cols[j] >> v) & 1) for v in range(V)]
    cyc = [c << n for c in gf2_nullspace(inc_rows, E)]  # cycle space = null space of the incidence matrix
    HZ = []
    for z in Zch:
        touched = sum(1 << vidx[q] for q in support if (z >> q) & 1)
        assert pop(touched) % 2 == 0, "check meets the support oddly"
        gamma = solve_columns(inc_cols, touched)
        HZ.append(z ^ (gamma << n))
    prodA = 0
    for a in A:
        prodA ^= a
    comps = V - gf2_rank(inc_rows)  # components = V - rank(incidence)
    return dict(n=n + E, HX=list(Xch) + A, HZ=HZ + cyc, A=A, cycles=cyc, E=E, V=V, comps=comps, prodA=prodA, nOrig=n, HZdef=HZ)


def cheeger(Vn, edges):
    best, arg = None, None
    for m in range(1, 1 << Vn):
        S = [i for i in range(Vn) if (m >> i) & 1]
        if len(S) > Vn // 2:
            continue
        bd = sum(1 for a, b in edges if ((m >> a) & 1) != ((m >> b) & 1))
        r = bd / len(S)
        if best is None or r < best - 1e-12:
            best, arg = r, S
    return best, arg


def steane_rows():
    out = []
    for b in range(3):
        out.append(sum(1 << j for j in range(7) if ((j + 1) >> b) & 1))
    return out


def host_system(host, rungs=3, w=3, order=(0, 1, 2), drop=0):
    """The four teaching systems of the chapter. Returns the numbers the stage and the claims use."""
    n3, X3, Z3 = rotated(3, 3)
    x3 = [mask(s) for s in X3]
    z3 = [mask(s) for s in Z3]
    if host == "seam3":
        st = merge_stats(3, "XX")
        dx, dz = merged_distance(3, "XX")
        return dict(V=4, E=3, cycles=0, n=st["n"], growth=3 / 18, kBefore=2, kAfter=st["k"], kTotal=st["k"], dX=dx, dZ=dz, d=min(dx, dz))
    forced = lambda Zs, supp: [tuple(q for q in supp if (z >> q) & 1) for z in Zs if sum(1 for q in supp if (z >> q) & 1) == 2]
    if host == "patch3-x":
        supp = [0, 3, 6]
        n, Xs, Zs = 9, x3, z3
        edges = forced(Zs, supp)
        pairs = []
    elif host == "patches3-xx":
        LA, LB = [2, 5, 8], [9, 12, 15]
        supp = LA + LB
        n = 18
        Xs = x3 + [m << 9 for m in x3]
        Zs = z3 + [m << 9 for m in z3]
        edges = forced(Zs, supp)
        pairs = [(LA[i], LB[order[i]]) for i in (0, 2, 1)][:rungs]
    else:
        LP = [0, 3, 6]
        LS = [9, 10, 11]
        supp = LP + LS
        n = 16
        srows = steane_rows()
        Xs = x3 + [m << 9 for m in srows]
        Zs = z3 + [m << 9 for m in srows]
        edges = forced(Zs, supp)
        spath = [9, 11, 10]
        pairs = [(LP[i], spath[order[i]]) for i in range(3)][:w]
    el = edges + pairs
    g = gauge_build(n, Xs, Zs, supp, el)
    assert g["comps"] == 1
    assert css_commutes(g["HX"], g["HZ"])
    assert g["prodA"] == mask(supp)
    loc = {q: i for i, q in enumerate(supp)}
    h, _ = cheeger(len(supp), [(loc[a], loc[b]) for a, b in el])
    dx, dz = css_distance(g["HX"], g["HZ"], g["n"])
    keep = len(g["cycles"]) - drop
    HZ_ = g["HZdef"] + g["cycles"][:keep]
    return dict(
        V=g["V"],
        E=g["E"],
        cycles=len(g["cycles"]),
        n=g["n"],
        kBefore=css_k(n, Xs, Zs),
        kAfter=css_k(g["n"], g["HX"], g["HZ"]),
        kTotal=css_k(g["n"], g["HX"], HZ_),
        productOk=float(g["prodA"] == mask(supp)),
        growth=g["E"] / n,
        h=h,
        dX=dx,
        dZ=dz,
        d=None if dx is None or dz is None else min(dx, dz),
    )


# ------------------------------------------------------------------------------------------------------------------------------ time-like readout


def prod_flip(q, m):
    """Chance that an odd number of m readings flipped, summed over every flip pattern."""
    tot = 0.0
    for pat in itertools.product([0, 1], repeat=m):
        k = sum(pat)
        if k % 2 == 1:
            tot += q**k * (1 - q) ** (m - k)
    return tot


def vote_fail(R, p):
    """Chance that more than half of R product readings are wrong, summed over every one of the 2^R patterns."""
    tot = 0.0
    for pat in itertools.product([0, 1], repeat=R):
        k = sum(pat)
        if 2 * k > R:
            tot += p**k * (1 - p) ** (R - k)
    return tot


def rounds_for(p, target):
    return next(R for R in (1, 3, 5, 7, 9, 11, 13) if vote_fail(R, p) < target)
