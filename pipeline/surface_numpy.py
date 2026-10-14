"""Independent numpy/pure-Python routes for the surface-code engine of the Papers background chapter B1 (app/src/physics/qec: toric, planar,
schedule, faults, spacetime, curves, frame). Nothing here imports the TypeScript engine: Kitaev's torus is built edge by edge, the rotated patch from
its faces, the planar code as a hypergraph product with np.kron, the schedule rule and every fault signature by explicit Pauli propagation on bit masks,
and the space-time failure counts by enumerating fault sets against a lookup of lightest explanations. make_surface_fixtures.py turns these into
app/src/physics/__fixtures__/qec-surface.json (read by physics/qec/surface.fixtures.test.ts); pipeline/claims_papers/b1.py uses the same routes."""
import itertools, math
import numpy as np

CORN = ['TL', 'TR', 'BL', 'BR']

def rref(M):
    M = (np.array(M, dtype=np.uint8) % 2).copy()
    rows, cols = M.shape
    piv = []; r = 0
    for c in range(cols):
        if r >= rows: break
        p = np.nonzero(M[r:, c])[0]
        if len(p) == 0: continue
        p = p[0] + r
        if p != r: M[[r, p]] = M[[p, r]]
        for i in range(rows):
            if i != r and M[i, c]: M[i] ^= M[r]
        piv.append(c); r += 1
    return M[:r], piv
def rank(M):
    M = np.array(M, dtype=np.uint8)
    if M.size == 0: return 0
    return len(rref(M)[1])
def nullspace(M):
    M = np.array(M, dtype=np.uint8) % 2
    R, piv = rref(M); n = M.shape[1]
    free = [c for c in range(n) if c not in piv]
    out = []
    for f in free:
        v = np.zeros(n, dtype=np.uint8); v[f] = 1
        for i, pc in enumerate(piv):
            if R[i, f]: v[pc] = 1
        out.append(v)
    return np.array(out, dtype=np.uint8).reshape(len(out), n)
def in_rowspace(Hrows, v):
    return rank(np.vstack([Hrows, v])) == rank(Hrows)
def mul2(A, B): return (np.array(A, dtype=np.int64) @ np.array(B, dtype=np.int64)) % 2

def kitaev_torus(L, M=None):
    M = M or L
    h = lambda i, j: (j % M) * L + (i % L)           # horizontal edge from vertex (i,j) to (i+1,j)
    v = lambda i, j: L * M + (j % M) * L + (i % L)   # vertical edge from vertex (i,j) to (i,j+1)
    n = 2 * L * M
    stars, plaqs = [], []
    for j in range(M):
        for i in range(L):
            stars.append([h(i, j), h(i - 1, j), v(i, j), v(i, j - 1)])     # X on the 4 edges at vertex (i,j)
            plaqs.append([h(i, j), h(i, j + 1), v(i, j), v(i + 1, j)])      # Z on the 4 edges around the face with corner (i,j)
    HX = np.zeros((L * M, n), dtype=np.uint8); HZ = np.zeros((L * M, n), dtype=np.uint8)
    for r, s in enumerate(stars):
        for q in s: HX[r, q] ^= 1
    for r, s in enumerate(plaqs):
        for q in s: HZ[r, q] ^= 1
    return dict(L=L, M=M, n=n, HX=HX, HZ=HZ, h=h, v=v)

def css_k(HX, HZ): return HX.shape[1] - rank(HX) - rank(HZ)

def css_distance(HX, HZ, maxw=6):
    """exact d = min over type X (kernel of HZ not in rowspace HX) and Z, by increasing-weight enumeration"""
    n = HX.shape[1]
    def dmin(Hk, Hs):                      # vectors v with Hk v = 0, v not in rowspace(Hs)
        rs = rank(Hs) if Hs.size else 0
        for w in range(1, maxw + 1):
            for S in itertools.combinations(range(n), w):
                v = np.zeros(n, dtype=np.uint8); v[list(S)] = 1
                if not (Hk @ v % 2).any():
                    if Hs.size == 0 or rank(np.vstack([Hs, v])) > rs: return w
        return None
    return min(dmin(HZ, HX), dmin(HX, HZ))

def rep_tail(d, p):               # majority vote fails when more than half of d copies flip
    return sum(math.comb(d, w) * p ** w * (1 - p) ** (d - w) for w in range((d + 1) // 2, d + 1))

def degrees(HX, HZ):
    cw = max(int(HX.sum(1).max()), int(HZ.sum(1).max()))
    qd = int((HX.sum(0) + HZ.sum(0)).max())
    return cw, qd

def rotated_surface(d):
    n = d * d
    q = lambda r, c: r * d + c
    checks = []
    for r in range(-1, d):
        for c in range(-1, d):
            typ = 'X' if (r + c) % 2 == 0 else 'Z'
            qs = [q(rr, cc) for rr, cc in [(r, c), (r, c + 1), (r + 1, c), (r + 1, c + 1)] if 0 <= rr < d and 0 <= cc < d]
            corners = [(rr, cc, name) for rr, cc, name in [(r, c, 'TL'), (r, c + 1, 'TR'), (r + 1, c, 'BL'), (r + 1, c + 1, 'BR')] if 0 <= rr < d and 0 <= cc < d]
            if len(qs) == 4: checks.append((typ, corners, (r, c)))
            elif len(qs) == 2:
                top = r == -1 or r == d - 1; side = c == -1 or c == d - 1
                if top and not side and typ == 'X': checks.append((typ, corners, (r, c)))
                if side and not top and typ == 'Z': checks.append((typ, corners, (r, c)))
    HX = np.zeros((sum(1 for k in checks if k[0] == 'X'), n), dtype=np.uint8)
    HZ = np.zeros((sum(1 for k in checks if k[0] == 'Z'), n), dtype=np.uint8)
    ix = iz = 0
    for typ, corners, f in checks:
        if typ == 'X':
            for rr, cc, _ in corners: HX[ix, q(rr, cc)] = 1
            ix += 1
        else:
            for rr, cc, _ in corners: HZ[iz, q(rr, cc)] = 1
            iz += 1
    return dict(d=d, n=n, HX=HX, HZ=HZ, checks=checks, q=q)

def open_rep(d):
    H = np.zeros((d - 1, d), dtype=np.uint8)
    for i in range(d - 1): H[i, i] = H[i, i + 1] = 1
    return H
def planar_unrotated(d):
    H = open_rep(d); r, n1 = H.shape
    I_n = np.eye(n1, dtype=np.uint8); I_r = np.eye(r, dtype=np.uint8)
    HX = np.hstack([np.kron(H, I_n), np.kron(I_r, H.T)])        # r*n1 rows ; n1*n1 + r*r columns
    HZ = np.hstack([np.kron(I_n, H), np.kron(H.T, I_r)])
    return HX, HZ

CORN = ['TL', 'TR', 'BL', 'BR']
def schedule_ok(S, tX, tZ):
    """tX, tZ: dict corner -> time step (1..4). Returns (conflict_free, parity_valid, violations)"""
    use = {}
    times = {}                                  # (check index, qubit) -> time
    for ci, (typ, corners, f) in enumerate(S['checks']):
        for rr, cc, name in corners:
            t = (tX if typ == 'X' else tZ)[name]
            times[(ci, S['q'](rr, cc))] = t
            use.setdefault((S['q'](rr, cc), t), []).append(ci)
    conflict_free = all(len(v) == 1 for v in use.values())
    bad = []
    xs = [ci for ci, c in enumerate(S['checks']) if c[0] == 'X']; zs = [ci for ci, c in enumerate(S['checks']) if c[0] == 'Z']
    for a in xs:
        for b in zs:
            shared = [q for (ci, q) in times if ci == a and (b, q) in times]
            if not shared: continue
            xfirst = sum(1 for q in shared if times[(a, q)] < times[(b, q)])
            if xfirst % 2: bad.append((a, b, shared))
    return conflict_free, not bad, bad

def memory_circuit(S, tX, tZ, rounds):
    """flat op list for a Z-memory experiment on a rotated patch. qubits: data 0..n-1, ancilla n..n+C-1.
    ops: ('RZ',a) ('RX',a) ('CX',c,t) ('MZ',a,idx) ('MX',a,idx) ; layer markers for idle bookkeeping."""
    n = S['n']; C = len(S['checks'])
    anc = {ci: n + ci for ci in range(C)}
    ops = []                                    # (layer, kind, qubits, extra)
    for r in range(rounds):
        for ci, (typ, corners, f) in enumerate(S['checks']):
            ops.append((0, 'RX' if typ == 'X' else 'RZ', (anc[ci],), None))
        for step in range(1, 5):
            for ci, (typ, corners, f) in enumerate(S['checks']):
                t = tX if typ == 'X' else tZ
                for rr, cc, name in corners:
                    if t[name] == step:
                        q = S['q'](rr, cc)
                        ops.append((step, 'CX', (anc[ci], q) if typ == 'X' else (q, anc[ci]), None))
        for ci, (typ, corners, f) in enumerate(S['checks']):
            ops.append((5, 'MX' if typ == 'X' else 'MZ', (anc[ci],), (ci, r)))
    return ops

def locations(S, ops, rounds, include_idle=True):
    """list of (position, [(x,z) pauli over the qubits touched]) elementary faults. position = index in ops AFTER which the fault is applied (-1 = before all)."""
    n = S['n']; C = len(S['checks']); NQ = n + C
    faults = []                                 # (pos, xmask, zmask, label)
    # group ops by (round, layer)
    per = len(ops) // rounds
    for r in range(rounds):
        base = r * per
        busy_by_layer = {l: set() for l in range(6)}
        last_idx_by_layer = {}
        for k in range(per):
            l, kind, qs, ex = ops[base + k]
            busy_by_layer[l].update(qs); last_idx_by_layer[l] = base + k
        for k in range(per):
            idx = base + k
            l, kind, qs, ex = ops[idx]
            if kind == 'RZ': faults.append((idx, 1 << qs[0], 0, 'prepflip'))                 # |0> -> |1> : X
            elif kind == 'RX': faults.append((idx, 0, 1 << qs[0], 'prepflip'))               # |+> -> |-> : Z
            elif kind == 'MZ': faults.append((idx - 1, 1 << qs[0], 0, 'measflip'))           # X just before Z-measure
            elif kind == 'MX': faults.append((idx - 1, 0, 1 << qs[0], 'measflip'))
            elif kind == 'CX':
                a, b = qs
                for pa in range(4):
                    for pb in range(4):
                        if pa == 0 and pb == 0: continue
                        xm = ((pa & 1) << a) | ((pb & 1) << b); zm = (((pa >> 1) & 1) << a) | (((pb >> 1) & 1) << b)
                        faults.append((idx, xm, zm, 'cnot'))
        if include_idle:
            for l in range(6):
                lastpos = last_idx_by_layer[l]
                for q in range(NQ):
                    if q in busy_by_layer[l]: continue
                    # ancilla idle only between its reset and its measurement
                    if q >= n and l in (0, 5): continue          # ancillas are busy in layers 0 and 5 by construction
                    for (xm, zm) in ((1 << q, 0), (0, 1 << q), (1 << q, 1 << q)):
                        faults.append((lastpos, xm, zm, 'idle'))
    return faults

def signature(S, ops, rounds, fault):
    n = S['n']; C = len(S['checks'])
    pos, xm, zm, _ = fault
    flips = {}                                  # (ci, r) -> measurement outcome flipped?
    for idx in range(pos + 1, len(ops)):
        l, kind, qs, ex = ops[idx]
        if kind == 'CX':
            c, t = qs
            if (xm >> c) & 1: xm ^= (1 << t)
            if (zm >> t) & 1: zm ^= (1 << c)
        elif kind in ('RZ', 'RX'):
            q = qs[0]; xm &= ~(1 << q); zm &= ~(1 << q)
        elif kind == 'MZ': flips[ex] = (xm >> qs[0]) & 1
        elif kind == 'MX': flips[ex] = (zm >> qs[0]) & 1
    # detectors: Z checks (index with type Z): first-round and consecutive; X checks: consecutive from round 1; final ideal comparison for Z checks
    det = []
    for ci, (typ, corners, f) in enumerate(S['checks']):
        for r in range(rounds):
            cur = flips.get((ci, r), 0)
            if typ == 'Z':
                prev = flips.get((ci, r - 1), 0) if r > 0 else 0
                det.append(cur ^ prev)
            elif r > 0:
                det.append(cur ^ flips.get((ci, r - 1), 0))
        if typ == 'Z':   # final ideal data readout : parity of x on the check's qubits vs last measured value
            par = 0
            for rr, cc, name in corners: par ^= (xm >> S['q'](rr, cc)) & 1
            det.append(par ^ flips.get((ci, rounds - 1), 0))
    obs = 0
    for c in range(S['d']): obs ^= (xm >> S['q'](0, c)) & 1       # Z-bar = Z on row 0
    d = 0
    for i, b in enumerate(det):
        if b: d |= (1 << i)
    return d, obs

def circuit_distance(S, tX, tZ, rounds=3, kmax=3):
    ops = memory_circuit(S, tX, tZ, rounds)
    faults = locations(S, ops, rounds)
    sigs = {}
    for f in faults:
        s = signature(S, ops, rounds, f)
        if s != (0, 0): sigs.setdefault(s, f)
    nloc = len(faults)
    # k = 1
    if (0, 1) in sigs: return 1, nloc, len(sigs)
    byDet = {}
    for (dd, o) in sigs: byDet.setdefault(dd, set()).add(o)
    # k = 2 : two faults with same det and different obs
    for dd, os_ in byDet.items():
        if 0 in os_ and 1 in os_ and dd != 0: return 2, nloc, len(sigs)
    # k = 3: pairs
    keys = list(sigs)
    for i in range(len(keys)):
        d1, o1 = keys[i]
        for j in range(i + 1, len(keys)):
            d2, o2 = keys[j]
            need = d1 ^ d2
            os_ = byDet.get(need, None)
            if os_ is not None and (1 ^ o1 ^ o2) in os_: return 3, nloc, len(sigs)
    return None, nloc, len(sigs)

def rep_graph(n, R):
    """repetition code, n data qubits, checks i=0..n-2, R noisy rounds + final ideal round. edges = fault mechanisms.
    detectors D(i,t), t=1..R+1.  data error on qubit q at time t (1..R): flips D(q-1,t) (if q>=1) and D(q,t) (if q<=n-2) ... persists => later rounds see no new flips
    measurement error on check i at round t (1..R): flips D(i,t) and D(i,t+1)."""
    det_index = {}
    for t in range(1, R + 2):
        for i in range(n - 1): det_index[(i, t)] = len(det_index)
    edges = []                                    # (kind, params, detector set mask, obs)
    for t in range(1, R + 1):
        for qb in range(n):
            ds = []
            if qb >= 1: ds.append(det_index[(qb - 1, t)])
            if qb <= n - 2: ds.append(det_index[(qb, t)])
            mask = sum(1 << d for d in ds)
            edges.append(('data', (qb, t), mask, 1 if qb == 0 else 0))
    for t in range(1, R + 1):
        for i in range(n - 1):
            mask = (1 << det_index[(i, t)]) | (1 << det_index[(i, t + 1)])
            edges.append(('meas', (i, t), mask, 0))
    return det_index, edges

def build_lookup(edges, maxw):
    table = {}                                    # syndrome -> (minweight, set(obs))
    E = len(edges)
    for w in range(0, maxw + 1):
        for S in itertools.combinations(range(E), w):
            m = 0; o = 0
            for e in S: m ^= edges[e][2]; o ^= edges[e][3]
            cur = table.get(m)
            if cur is None: table[m] = (w, {o})
            elif cur[0] == w: cur[1].add(o)
    return table

def logical_failure_counts(n, R, maxw):
    det_index, edges = rep_graph(n, R)
    E = len(edges)
    table = build_lookup(edges, maxw)
    out = {}
    for w in range(1, maxw + 1):
        fail = tie = 0; tot = 0
        for S in itertools.combinations(range(E), w):
            m = 0; o = 0
            for e in S: m ^= edges[e][2]; o ^= edges[e][3]
            mw, os_ = table[m]
            tot += 1
            if len(os_) == 2: tie += 1
            elif next(iter(os_)) != o: fail += 1
        out[w] = dict(total=tot, fail=fail, tie=tie)
    return E, out

def frame_through(frame, gates):
    x, z = list(frame[0]), list(frame[1])
    for g in gates:
        if g[0] == 'H': a = g[1]; x[a], z[a] = z[a], x[a]
        elif g[0] == 'S': a = g[1]; z[a] ^= x[a]
        elif g[0] == 'CNOT':
            c, t = g[1], g[2]; x[t] ^= x[c]; z[c] ^= z[t]
    return x, z
def wt(f): return sum(1 for a, b in zip(*f) if a or b)


# ------------------------------------------------------------------ a second route for the schedule rule: an Aaronson-Gottesman tableau ------------------------------------------------------------------
# Simulate the noiseless patch memory with random measurement outcomes; a schedule is "valid" exactly when every detector stays 0 every time.
import random
class Tab:
    def __init__(self, n, rng):
        self.n = n; self.rng = rng
        self.x = np.zeros((2*n, n), dtype=np.uint8); self.z = np.zeros((2*n, n), dtype=np.uint8); self.r = np.zeros(2*n, dtype=np.uint8)
        for i in range(n): self.x[i, i] = 1; self.z[n+i, i] = 1
    def h(self, a): self.r ^= self.x[:, a] & self.z[:, a]; self.x[:, a], self.z[:, a] = self.z[:, a].copy(), self.x[:, a].copy()
    def cnot(self, a, b):
        self.r ^= self.x[:, a] & self.z[:, b] & (self.x[:, b] ^ self.z[:, a] ^ 1)
        self.x[:, b] ^= self.x[:, a]; self.z[:, a] ^= self.z[:, b]
    def rowsum(self, h, i):
        g = 0
        for j in range(self.n):
            x1, z1, x2, z2 = self.x[i, j], self.z[i, j], self.x[h, j], self.z[h, j]
            if x1 == 0 and z1 == 0: gg = 0
            elif x1 == 1 and z1 == 1: gg = int(z2) - int(x2)
            elif x1 == 1 and z1 == 0: gg = int(z2) * (2 * int(x2) - 1)
            else: gg = int(x2) * (1 - 2 * int(z2))
            g += gg
        tot = 2 * int(self.r[h]) + 2 * int(self.r[i]) + g
        self.r[h] = (tot % 4) // 2
        self.x[h] ^= self.x[i]; self.z[h] ^= self.z[i]
    def measure_z(self, a):
        n = self.n
        p = [i for i in range(n, 2*n) if self.x[i, a]]
        if p:
            p = p[0]
            for i in range(2*n):
                if i != p and self.x[i, a]: self.rowsum(i, p)
            self.x[p-n] = self.x[p]; self.z[p-n] = self.z[p]; self.r[p-n] = self.r[p]
            self.x[p] = 0; self.z[p] = 0; self.z[p, a] = 1
            out = self.rng.randint(0, 1); self.r[p] = out
            return out, True
        # deterministic
        sx = np.zeros(n, dtype=np.uint8); sz = np.zeros(n, dtype=np.uint8); sr = 0
        # scratch row via rowsum into temp
        tx = np.zeros((1, n), dtype=np.uint8)
        self.x = np.vstack([self.x, np.zeros((1, n), dtype=np.uint8)]); self.z = np.vstack([self.z, np.zeros((1, n), dtype=np.uint8)]); self.r = np.append(self.r, 0)
        h = 2*n
        for i in range(n):
            if self.x[i, a]: self.rowsum(h, i + n)
        out = int(self.r[h])
        self.x = self.x[:-1]; self.z = self.z[:-1]; self.r = self.r[:-1]
        return out, False
    def reset_z(self, a):
        out, rnd = self.measure_z(a)
        if out: # flip back with X = H Z H
            self.h(a); self.s_like_z(a); self.h(a)
    def s_like_z(self, a):   # apply Z on qubit a : flips r of rows with x=1
        self.r ^= self.x[:, a]

def run_detectors(S, tX, tZ, rounds, rng):
    n = S['n']; C = len(S['checks']); NQ = n + C
    ops = memory_circuit(S, tX, tZ, rounds)
    T = Tab(NQ, rng)
    meas = {}
    for (l, kind, qs, ex) in ops:
        if kind == 'RZ': T.reset_z(qs[0])
        elif kind == 'RX': T.reset_z(qs[0]); T.h(qs[0])
        elif kind == 'CX': T.cnot(qs[0], qs[1])
        elif kind == 'MZ': meas[ex], _ = T.measure_z(qs[0])
        elif kind == 'MX': T.h(qs[0]); meas[ex], _ = T.measure_z(qs[0])
    det = []
    for ci, (typ, corners, f) in enumerate(S['checks']):
        for r in range(rounds):
            if typ == 'Z': det.append(meas[(ci, r)] ^ (meas[(ci, r-1)] if r else 0))
            elif r: det.append(meas[(ci, r)] ^ meas[(ci, r-1)])
    return det
