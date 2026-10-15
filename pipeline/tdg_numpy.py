"""tdg_numpy.py: the independent numpy / exact-arithmetic route for app/src/physics/qec/tdg.ts (the paper lecture P1, arXiv:2506.03094).

The TypeScript engine builds the logical action of a shift by row reduction against the stabilizer rows and the failure sum by an exact term recurrence; this
module goes another way (route B): the logical action by SYMPLECTIC PAIRING with the dual basis (no row reduction of the images), the native sets by explicit
enumeration of images, the LPU graph sizes from dense overlaps, and Eq. 82 by 50-digit Decimal arithmetic with exact integer binomials. It is written from the
paper's PRINTED inputs (the polynomial tables, Table 1, 3, 6, 9 values) and does not read app/src. Used by make_tdg_fixtures.py and claims_papers/p1.py.
"""
import math
from decimal import Decimal, getcontext
from functools import lru_cache

import numpy as np

getcontext().prec = 50


# ------------------------------------------------------------------ GF(2) helpers
def rank2(M):
    M = (np.array(M, dtype=np.uint8) & 1).copy()
    r = 0
    rows, cols = M.shape
    for c in range(cols):
        piv = next((i for i in range(r, rows) if M[i, c]), None)
        if piv is None:
            continue
        M[[r, piv]] = M[[piv, r]]
        for i in range(rows):
            if i != r and M[i, c]:
                M[i] ^= M[r]
        r += 1
        if r == rows:
            break
    return r


def inv2(A):
    n = A.shape[0]
    M = np.concatenate([A.astype(np.uint8) & 1, np.eye(n, dtype=np.uint8)], axis=1)
    r = 0
    for c in range(n):
        piv = next(i for i in range(r, n) if M[i, c])
        M[[r, piv]] = M[[piv, r]]
        for i in range(n):
            if i != r and M[i, c]:
                M[i] ^= M[r]
        r += 1
    return M[:, n:]


def mat(s):
    return np.array([[int(ch) for ch in row] for row in s.split()], dtype=np.uint8)


# ------------------------------------------------------------------ the codes of Eq. 27 and the bases of Eqs. 31-36 (typed from the paper's p. 45)
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
                    HX[c, self.idx(i + a, j + b)] ^= 1
                    HZ[c, self.cells + self.idx(i - a, j - b)] ^= 1
                for (a, b) in B:
                    HX[c, self.cells + self.idx(i + a, j + b)] ^= 1
                    HZ[c, self.idx(i - a, j - b)] ^= 1
        self.HX, self.HZ = HX, HZ

    def idx(self, i, j):
        return (i % self.l) * self.m + (j % self.m)

    def k(self):
        return self.n - rank2(self.HX) - rank2(self.HZ)

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


BASES = {
    'gross': dict(l=12, m=6,
                  p=[(4, 0), (5, 0), (6, 1), (4, 2), (5, 4), (6, 5)], q=[(3, 0), (4, 0), (3, 1), (3, 2), (4, 2), (3, 5)],
                  r=[(0, 0), (8, 0), (1, 1), (9, 1), (3, 4), (11, 4)], s=[(1, 0), (9, 0), (4, 4), (8, 4), (0, 5), (8, 5)],
                  alpha=[(0, 0), (3, 5), (11, 5), (10, 1), (5, 4), (4, 2)], beta=[(0, 0), (2, 4), (1, 2), (2, 5), (1, 1), (3, 1)],
                  Ax='010100 010001 001100 110110 010010 111101', Ay='100001 111001 000010 010000 011001 001101'),
    'two-gross': dict(l=12, m=12,
                      p=[(2, 0), (2, 2), (8, 2), (9, 2), (3, 3), (4, 3), (7, 4), (8, 6), (6, 7), (7, 11)],
                      q=[(3, 2), (5, 3), (7, 3), (11, 3), (8, 4), (8, 5), (6, 7), (4, 8), (1, 9), (1, 10)],
                      r=[(4, 2), (11, 2), (0, 5), (1, 5), (5, 5), (6, 5), (1, 8), (8, 8), (2, 11), (10, 11)],
                      s=[(2, 6), (2, 9), (2, 10), (11, 6), (11, 9), (11, 10), (8, 7), (11, 7), (5, 8), (11, 8)],
                      alpha=[(0, 0), (0, 3), (3, 7), (11, 11), (2, 9), (7, 4)], beta=[(0, 0), (1, 1), (4, 0), (5, 4), (4, 3), (3, 5)],
                      Ax='011101 101011 101010 101111 011111 100110', Ay='111110 110111 011000 100010 100111 100001'),
}
MU = NU = (1, 1)


def _neg(t):
    return (-t[0], -t[1])


def _mul(t, u):
    return (t[0] + u[0], t[1] + u[1])


@lru_cache(maxsize=None)
def code_data(name):
    D = BASES[name]
    code = BB(D['l'], D['m'])
    Xs, Zs = [], []
    for a in D['alpha']:
        Xs.append(np.concatenate([code.poly(D['p'], a), code.poly(D['q'], a)]))
    for b in D['beta']:
        Xs.append(np.concatenate([code.poly(D['r'], _neg(b)), code.poly(D['s'], _neg(b))]))
    for b in D['beta']:
        Zs.append(np.concatenate([code.poly(D['s'], _mul(b, NU), True), code.poly(D['r'], _mul(b, NU), True)]))
    for a in D['alpha']:
        Zs.append(np.concatenate([code.poly(D['q'], _mul(_neg(a), MU), True), code.poly(D['p'], _mul(_neg(a), MU), True)]))
    return dict(code=code, X=np.array(Xs), Z=np.array(Zs), D=D)


def basis_facts(name):
    d = code_data(name)
    code, Xs, Zs = d['code'], d['X'], d['Z']
    ov = lambda u, v: int((u & v).sum())
    ovl = code.HZ.astype(int) @ Xs[0].astype(int)
    G = Xs.astype(int) @ Zs.T.astype(int) % 2
    return dict(
        n=code.n, k=code.k(), checkWeight=int(code.HX[0].sum()), weights=[int(Xs[0].sum()), int(Xs[6].sum()), int(Zs[0].sum()), int(Zs[6].sum())],
        overlaps=[ov(Xs[0], Zs[0]), ov(Xs[6], Zs[6]), ov(Xs[0], Zs[6]), ov(Xs[6], Zs[0]), ov(Xs[0], Xs[6]), ov(Zs[0], Zs[6])],
        meetsMin=int(ovl.min()), meetsMax=int(ovl.max()), rankAbove=rank2(np.vstack([code.HX, Xs])) - rank2(code.HX), G=G, cells=code.cells)


@lru_cache(maxsize=None)
def acts(name):
    """The logical action of every shift: M[:, i] = coefficients of the image of X-bar_i against the dual basis (route B: pairing, not row reduction)."""
    d = code_data(name)
    code, Xs, Zs = d['code'], d['X'], d['Z']
    out = {}
    for a in range(code.l):
        for b in range(code.m):
            perm = code.shift_perm(a, b)
            M = np.zeros((12, 12), dtype=np.uint8)
            for i in range(12):
                img = np.zeros(code.n, dtype=np.uint8)
                img[perm[np.nonzero(Xs[i])[0]]] = 1
                coeff = img.astype(int) @ Zs.T.astype(int) % 2
                resid = img ^ (coeff.astype(np.uint8) @ Xs % 2).astype(np.uint8)
                assert rank2(np.vstack([code.HX, resid])) == rank2(code.HX), 'image outside the code space'
                M[:, i] = coeff
            out[(a, b)] = M
    return out


def blocks(name, a, b, which=None):
    M = acts(name)[(a % code_data(name)['code'].l, b % code_data(name)['code'].m)]
    D = BASES[name]
    printed = mat(D['Ax'] if which == 'x' else D['Ay']) if which else M[:6, :6]
    up, lo = M[:6, :6], M[6:, 6:]
    return dict(
        offBlock=int(M[:6, 6:].sum() + M[6:, :6].sum()), gapUpper=int((up != printed).sum()), gapLowerT=int((lo != printed.T).sum()),
        gapLowerPrinted=int((lo != printed).sum()), printedAsym=int((printed != printed.T).sum()), col0=[i + 1 for i in range(12) if M[i, 0]], M=M)


def shift_summary(name):
    d = code_data(name)
    code = d['code']
    A = acts(name)
    classes = {M.tobytes() for M in A.values()}
    Mx = A[(1, 0)]
    order, P = None, np.eye(12, dtype=int)
    for t in range(1, 80):
        P = P @ Mx.astype(int) % 2
        if (P == np.eye(12, dtype=int)).all():
            order = t
            break
    basic = [(1, 0), (0, 1), (3, -1), (1, 3), (3, -2), (2, 3)]
    gens = basic + [_neg(t) for t in basic]
    key = lambda x, y: A[(x % code.l, y % code.m)].tobytes()
    seen, reach, maxf = {key(0, 0)}, [(0, 0)], 0
    for step in range(1, 4):
        nxt = []
        for (x, y) in reach:
            for (gx, gy) in gens:
                k = key(x + gx, y + gy)
                if k not in seen:
                    seen.add(k)
                    nxt.append((x + gx, y + gy))
                    maxf = step
        reach = nxt
    ident = np.eye(12, dtype=np.uint8)
    return dict(classes=len(classes), order=order, maxFactors=maxf, trivial=sum(1 for M in A.values() if (M == ident).all()), reached=len(seen))


def _pauli_vec(x1, z1, x7, z7):
    v = np.zeros(24, dtype=np.uint8)
    v[0], v[12], v[6], v[18] = x1, z1, x7, z7
    return v


def native(name, reading='actual'):
    from itertools import product
    mats = {}
    for M in acts(name).values():
        if reading == 'as-printed':
            H = np.zeros((12, 12), dtype=np.uint8)
            H[:6, :6] = M[:6, :6]
            H[6:, 6:] = M[:6, :6]
            M = H
        mats[M.tobytes()] = M
    paulis = [_pauli_vec(*bits) for bits in product((0, 1), repeat=4) if any(bits)]
    N = set()
    for M in mats.values():
        Minvt = inv2(M).T
        for v in paulis:
            N.add(np.concatenate([M.astype(int) @ v[:12] % 2, Minvt.astype(int) @ v[12:] % 2]).astype(np.uint8).tobytes())
    Nv = [np.frombuffer(s, dtype=np.uint8) for s in N]
    rest = lambda v: (v[1:12].tobytes(), v[13:24].tobytes())
    piv = lambda v: (int(v[0]), int(v[12]))
    lit = {rest(v) for v in Nv if piv(v) != (0, 0) and (v[1:12].any() or v[13:24].any())}
    anyp = {rest(v) for v in Nv if v[1:12].any() or v[13:24].any()}
    pivotI = sum(1 for v in Nv if piv(v) == (0, 0))
    return dict(native=len(Nv), rot=len(lit), rotAll=len(anyp), pivotI=pivotI, pivotLetter=len(Nv) - pivotI)


LPU = {'gross': dict(keptL=5, keptR=3, bridge=11, extra=0), 'two-gross': dict(keptL=11, keptR=9, bridge=17, extra=2)}


def lpu(name):
    d = code_data(name)
    code, Xs = d['code'], d['X']
    half = lambda op: (int(op.sum()), int((code.HZ.astype(int) @ op.astype(int) == 2).sum()))
    (vl, el), (vr, er) = half(Xs[0]), half(Xs[6])
    P = LPU[name]
    elx, erx = el + P['extra'], er + P['extra']
    V = (vl - 1) + (vr - 1) + 1
    E = elx + erx + P['bridge']
    kept = P['keptL'] + P['keptR'] + P['bridge']
    return dict(lV=vl, lEbase=el, lE=elx, lRank=elx - vl + 1, rV=vr, rE=erx, V=V, Vq=V + 1, E=E, rank=E - V + 1, kept=kept, u=(V + 1) + E + kept, bridge=P['bridge'])


# ------------------------------------------------------------------ Table 1 / Eq. 25
T1 = {'gross': dict(l=12, m=6, u=90, d=12, f={'1e-3': 454, '1e-4': 810}, dfac={'1e-3': 15, '1e-4': 7}),
      'two-gross': dict(l=12, m=12, u=158, d=18, f={'1e-3': 463, '1e-4': 18600}, dfac={'1e-3': 15, '1e-4': 25})}


def parts(code, fac):
    t = T1[code]
    return dict(c=4 * t['l'] * t['m'], u=t['u'], a=2 * (t['d'] - 1), aPrime=(2 * t['dfac'][fac] - 1) if fac else 0, f=t['f'][fac] if fac else 0, d=t['d'], dFactory=t['dfac'][fac] if fac else 0)


def q_of(code, M, fac, aprime=None):
    p = parts(code, fac)
    return M * (p['c'] + p['u'] + p['a']) - p['a'] + ((p['aPrime'] if aprime is None else aprime) + p['f'] if fac else 0)


def max_modules(code, budget, fac):
    M = 0
    while q_of(code, M + 1, fac) <= budget:
        M += 1
    return M


def surface_patch_qubits(d):
    return 2 * d * d - 1


def yield_(qubits, couplers=2, y=0.9998):
    J = 2 * qubits + 3 * couplers * qubits
    return dict(J=J, yld=y ** J, oneIn=1 / y ** J)


# ------------------------------------------------------------------ Eq. 82-83 by exact integers / Decimal
FIT = {'g-idle': (-31.02, 8.66, 5, 24, 210960), 'g-aut': (-28.63, 7.13, 5, 24, 483840), 'g-X': (-23.97, 6.31, 5, 23, 324526),
       'g-XX': (-22.06, 5.87, 5, 23, 398717), 'g-Y': (-19.49, 4.65, 5, 23, 400117), 'g-XxX': (-18.32, 5.19, 5, 23, 743456),
       '2g-idle': (-95.83, 25.78, 9, 24, 762912), '2g-aut': (-108.53, 28.22, 9, 24, 1748736)}
W_MAX = 3000


@lru_cache(maxsize=None)
def piid(series, p):
    lf0, g, w0, K, N = FIT[series]
    q = Decimal(p) / 15
    one = Decimal(1)
    a = one - Decimal(2) ** (-K)
    f0 = Decimal(lf0).exp()
    gam = Decimal(g)
    term = Decimal(math.comb(N, w0)) * q ** w0 * (one - q) ** (N - w0)
    ratio = q / (one - q)
    total = Decimal(0)
    for w in range(w0, min(N, W_MAX) + 1):
        x = f0 / a * (Decimal(w) / Decimal(w0)) ** gam
        total += a * (one - (-x).exp()) * term
        term = term * Decimal(N - w) / Decimal(w + 1) * ratio
    return float(total)


def sci(x):
    e = math.floor(math.log10(x))
    return x / 10 ** e, e


T9 = {'gross': (4.1634e10, 2.2704e6, 4.2152e6, 9.468e5, 1.5542e7), 'two-gross': (4.1637e10, 2.2944e6, 4.2388e6, 9.468e5, 1.5542e7)}
ASSUMED_2G = {1e-3: (1e-11, 1e-9), 1e-4: (1e-20, 1e-18)}


def tfim(code, p):
    NI, NU, NM, NC, NT = T9[code]
    if code == 'gross':
        PI, PU, PM, PC = piid('g-idle', p), piid('g-aut', p), piid('g-Y', p), piid('g-XxX', p)
    else:
        PI, PU, (PM, PC) = piid('2g-idle', p), piid('2g-aut', p), ASSUMED_2G[p]
    return NI * PI + NU * PU + NM * PM + NC * PC + NT * PC


def power_law(p1, F1, p2, F2, target=1e-3):
    b = math.log(F1 / F2) / math.log(p1 / p2)
    return b, (target / (F1 / p1 ** b)) ** (1 / b)


def crossing(code):
    pa, pb = (3e-5, 1e-5) if code == 'gross' else (1e-3, 1e-4)
    return power_law(pa, tfim(code, pa), pb, tfim(code, pb))


def tfim_rotations(side=10, steps=80):
    bonds = 2 * side * (side - 1)
    return steps * 5 * (2 * bonds + side * side)


def eq96(d, NT, nL=100):
    NR = tfim_rotations()
    K = 2 * nL * NR + NT - NR
    return 0.01 * (1e-3 / (0.03 * d * K)) ** (2 / d)


def surface_row(p, q, d, f, tf):
    n = (q - f) // (4 * d * d)
    NT = (1 / 3) / (2 * n * 0.03 * (p / 0.01) ** (d / 2) * d)
    return n, NT, tf + 6 * d


FIG10A_SURF = [(1e-3, 5000, 5, 454, 351), (1e-3, 50000, 17, 463, 2167), (1e-4, 5000, 7, 810, 73), (1e-4, 50000, 7, 810, 73), (1e-4, 50000, 17, 18600, 407), (1e-4, 500000, 17, 18600, 407)]
FIG10A_BIC = [('gross', '1e-3', 5000), ('two-gross', '1e-3', 50000), ('gross', '1e-4', 5000), ('gross', '1e-4', 50000), ('two-gross', '1e-4', 50000), ('two-gross', '1e-4', 500000)]


def cultivation(d1):
    pc, pe, tc, te, c1, c2 = {3: (0.35, 0.80, 39, 90, 1.54, 3.23), 5: (0.85, 0.99, 89, 110, 6.67, 14.3)}[d1]
    esc = (pe - pc) / (1 - pc)
    return esc, c1 * tc + c2 * te, tc / (1 - pc) + te / (1 - esc)


@lru_cache(maxsize=None)
def family(r, b):
    code = BB(6 * (r + b), 6 * r)
    d = 6 * (2 * r + b - 1)
    k = code.k()
    return code.n, k, d, k * d * d / code.n
