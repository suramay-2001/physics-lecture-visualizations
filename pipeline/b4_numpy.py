"""Independent numpy / exact-arithmetic routes for the Papers background chapter B4 (magic states and Pauli-based computation).

Used by pipeline/make_b4_fixtures.py (engine fixtures, app/src/physics/__fixtures__/qec-b4.json) and by pipeline/claims_papers/b4.py (the claim twins).
Nothing here calls the TypeScript engine. The routes differ from it on purpose:
  - the Clifford orbit of a state is found from the 2 x 2 unitary group (closure of H and S modulo phase), not from Bloch rotations;
  - the 15-qubit code is checked by integer bit masks over all 2^15 flip patterns; the output error is a sum of exact Fractions (no closed form);
  - the Pauli-based compiler is checked with DENSE matrices: the axis of every T gate is found by conjugating Z_w with the dense Clifford and reading the Pauli
    back from the 4^n basis, the layers by dense commutators, and the whole program by multiplying the rotations back together;
  - teleporting T, the general injection and the absorbed measurement run on dense state vectors;
  - the T-count sets and the best approximation of a z-rotation come from a breadth-first search over 2 x 2 unitaries, vectorised, keyed by the
    phase-normalised entries rounded to 8 digits;
  - the staged time is the solution of a 2-state linear system, the expected tries a long series, the gap table a loop over all 2^n patterns.
"""
import itertools
from fractions import Fraction
from math import comb

import numpy as np

I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
S = np.diag([1, 1j]).astype(complex)
Sdg = S.conj().T
T = np.diag([1, np.exp(1j * np.pi / 4)]).astype(complex)
Tdg = T.conj().T
PAULI = {"I": I2, "X": X, "Y": Y, "Z": Z}


def bloch(psi):
    rho = np.outer(psi, psi.conj())
    return np.array([np.real(np.trace(rho @ P)) for P in (X, Y, Z)])


def phase_key(U, digits=8):
    """Normalise a 2 x 2 unitary modulo global phase and return a hashable key."""
    flat = U.reshape(-1)
    k = 0 if abs(flat[0]) > 1e-9 else 1
    V = U * (abs(flat[k]) / flat[k])
    return tuple(np.round(np.concatenate([V.real.ravel(), V.imag.ravel()]), digits) + 0.0)


def unitary_group_mod_phase(gens):
    found = {phase_key(I2): I2}
    frontier = [I2]
    while frontier:
        nxt = []
        for U in frontier:
            for G in gens:
                V = G @ U
                k = phase_key(V)
                if k not in found:
                    found[k] = V
                    nxt.append(V)
        frontier = nxt
    return list(found.values())


CLIFF1 = unitary_group_mod_phase([H, S])


def clifford_orbit(psi):
    pts = {}
    for U in CLIFF1:
        v = bloch(U @ psi)
        pts[tuple(np.round(v, 6) + 0.0)] = v
    return list(pts.values())


def magic_block():
    plus = np.array([1, 1], dtype=complex) / np.sqrt(2)
    tplus = T @ plus
    zero = np.array([1, 0], dtype=complex)
    # a T-type state (BK05): Bloch vector along a cube diagonal, found as the unitary image (H S ... ) of an eigenstate of (X+Y+Z)/sqrt(3)
    w, v = np.linalg.eigh((X + Y + Z) / np.sqrt(3))
    ttype = v[:, 1]
    orbit_t = clifford_orbit(ttype)
    return dict(
        cliffordCount=len(CLIFF1),
        orbitStab=len(clifford_orbit(zero)),
        orbitH=len(clifford_orbit(tplus)),
        orbitT=len(orbit_t),
        l1Magic=float(np.abs(bloch(tplus)).sum()),
        l1TType=float(np.abs(bloch(ttype)).sum()),
        blochTPlus=[float(x) for x in bloch(tplus)],
        orbitPoints=sorted([[round(float(c), 6) + 0.0 for c in p] for p in clifford_orbit(tplus)]),
        octaEdge=float(0.5 * (1 - 1 / np.sqrt(2))),
    )


# ---------------------------------------------------------------- the 15-qubit code (bit masks and exact fractions)
N15 = 15
HX_ROWS = [sum(((j >> b) & 1) << (j - 1) for j in range(1, 16)) for b in range(4)]  # row b: bit b of the column number j (qubit j)


def pc(x):
    return bin(x).count("1")


def hamming_words():
    """All flip patterns e (as 15-bit integers) with H_X e = 0, found by testing every pattern."""
    out = []
    for e in range(1 << N15):
        if all(pc(r & e) % 2 == 0 for r in HX_ROWS):
            out.append(e)
    return out


_FIFTEEN = []


def fifteen_block():
    if not _FIFTEEN:
        _FIFTEEN.append(_fifteen_block())
    return _FIFTEEN[0]


def _fifteen_block():
    words = hamming_words()
    A = [0] * 16
    for e in words:
        A[pc(e)] += 1
    even = [e for e in words if pc(e) % 2 == 0]
    odd = [e for e in words if pc(e) % 2 == 1]
    # ten Z checks: rank of the even-weight subcode (GF(2) elimination on bit masks)
    def rank(vs):
        basis = []
        for v in vs:
            for b in basis:
                v = min(v, v ^ b)
            if v:
                basis.append(v)
        return len(basis)

    zrank = rank(even)
    # Z-type logical distance: lightest odd-weight word that passes (undetected, corrupting); X-type: lightest word orthogonal to every even word, not in the row space of H_X
    dz = min(pc(e) for e in odd)
    ortho = [x for x in range(1 << N15) if all(pc(x & e) % 2 == 0 for e in [b for b in basis_of(even)])]
    rowspace = set()
    for m in range(16):
        v = 0
        for b in range(4):
            if (m >> b) & 1:
                v ^= HX_ROWS[b]
        rowspace.add(v)
    dx = min(pc(x) for x in ortho if x not in rowspace)
    # the logical states: |0bar> = sum over the row space of H_X, |1bar> = the complement coset of each word; T^{x15} multiplies a basis string of weight w by exp(i pi w / 4)
    zero_weights = sorted({pc(v) for v in rowspace})
    one_weights = sorted({pc(v ^ ((1 << N15) - 1)) for v in rowspace})
    phase0 = sorted({round(float(np.degrees(np.angle(np.exp(1j * np.pi * w / 4)))), 6) + 0.0 for w in zero_weights})
    phase1 = sorted({round(float(np.degrees(np.angle(np.exp(1j * np.pi * w / 4)))), 6) + 0.0 for w in one_weights})
    return dict(
        hxRows=[pc(r) for r in HX_ROWS],
        xChecks=len(HX_ROWS),
        xWeight=pc(HX_ROWS[0]),
        zChecks=zrank,
        accepted=len(words),
        weights=A,
        a3=A[3],
        a4=A[4],
        dX=dx,
        dZ=dz,
        phase0=phase0,
        phase1=phase1,
        columns=[[((j >> b) & 1) for b in range(4)] for j in range(1, 16)],
    )


def basis_of(vs):
    basis = []
    for v in vs:
        w = v
        for b in basis:
            w = min(w, w ^ b)
        if w:
            basis.append(w)
    return basis


def distill_exact(eps):
    """Exact (Fraction) acceptance and output error of 15-to-1 at flip chance eps (a Fraction)."""
    A = fifteen_block()["weights"]
    acc = Fraction(0)
    bad = Fraction(0)
    for w, a in enumerate(A):
        t = a * eps**w * (1 - eps) ** (15 - w)
        acc += t
        if w % 2 == 1:
            bad += t
    return acc, bad / acc


def distill_block():
    out = {}
    for tag, e in (("1e2", Fraction(1, 100)), ("1e3", Fraction(1, 1000)), ("1e4", Fraction(1, 10000)), ("5e2", Fraction(5, 100)), ("1e1", Fraction(1, 10))):
        a, o = distill_exact(e)
        out[tag] = dict(eps=float(e), accept=float(a), out=float(o))
    # two rounds from 1e-3
    a1, o1 = distill_exact(Fraction(1, 1000))
    a2, o2 = distill_exact(o1)
    out["level2"] = float(o2)
    out["inputsPer1e3"] = float(Fraction(15) / a1)
    # threshold: bisection on out(e) - e (Fractions; 80 steps)
    lo, hi = Fraction(5, 100), Fraction(2, 10)
    for _ in range(80):
        mid = (lo + hi) / 2
        if distill_exact(mid)[1] < mid:
            lo = mid
        else:
            hi = mid
    out["threshold"] = float(lo)
    # leading coefficient: out / eps^3 at 1e-3 against 35
    out["lead35at1e3"] = float(o1 / Fraction(1, 1000) ** 3 / 35)
    out["lead35p4"] = float(35 * Fraction(1, 10000) ** 3)
    # closed forms of Bravyi-Kitaev (Eqs. 35-36) as rational numbers at seven values
    cf = {}
    for e in (Fraction(1, 1000), Fraction(1, 100), Fraction(5, 100), Fraction(1, 10)):
        a, o = distill_exact(e)
        pS = (1 + 15 * (1 - 2 * e) ** 8) / 16
        # Eq. 36 numerator (BK05): (1 - (1-2e)^8)/... written via the code: out*acc = sum over odd weights
        cf[str(e)] = float(abs(pS - a))
    out["closedFormDev"] = max(cf.values())
    return out


# ---------------------------------------------------------------- Pauli-based compiler, dense
def kron_all(ms):
    out = np.array([[1]], dtype=complex)
    for m in ms:
        out = np.kron(out, m)
    return out


def pauli_matrix(s):
    return kron_all([PAULI[c] for c in s])


def embed1(U, q, n):
    return kron_all([U if i == q else I2 for i in range(n)])


def cnot_matrix(c, t, n):
    P0 = np.diag([1, 0]).astype(complex)
    P1 = np.diag([0, 1]).astype(complex)
    return kron_all([P0 if i == c else I2 for i in range(n)]) + kron_all([P1 if i == c else (X if i == t else I2) for i in range(n)])


def rot_matrix(pauli, angle):
    """P(phi) = exp(i phi P / 2) with phi = +-pi/2 (c) or +-pi/4 (t)."""
    phi = {"c+": np.pi / 2, "c-": -np.pi / 2, "t+": np.pi / 4, "t-": -np.pi / 4}[angle]
    P = pauli_matrix(pauli)
    return np.cos(phi / 2) * np.eye(P.shape[0]) + 1j * np.sin(phi / 2) * P


GATE1 = {"H": H, "S": S, "Sdg": Sdg, "T": T, "Tdg": Tdg}


def gate_matrix(g, n):
    name = g[0]
    if name == "CNOT":
        return cnot_matrix(g[1], g[2], n)
    if name == "R":
        return rot_matrix(g[1], g[2])
    return embed1(GATE1[name], g[1], n)


def is_clifford_gate(g):
    return g[0] in ("H", "S", "Sdg", "CNOT") or (g[0] == "R" and g[2][0] == "c")


def same_up_to_phase(A, B, tol=1e-9):
    k = np.argmax(np.abs(B))
    if abs(B.flat[k]) < tol:
        return False
    c = A.flat[k] / B.flat[k]
    return abs(abs(c) - 1) < 1e-8 and np.allclose(A, c * B, atol=tol)


def pauli_label(M, n):
    """Find the Pauli string and sign with M = sign * P, or None."""
    for letters in itertools.product("IXYZ", repeat=n):
        s = "".join(letters)
        P = pauli_matrix(s)
        for sgn in (1, -1):
            if np.allclose(M, sgn * P, atol=1e-9):
                return s, sgn
    return None


def compile_dense(n, gates):
    """Slide every Clifford to the end. Axis of a non-Clifford gate = C^dagger (its own axis) C for C = the Clifford so far (dense)."""
    C = np.eye(2**n, dtype=complex)
    rots = []
    for i, g in enumerate(gates):
        if is_clifford_gate(g):
            C = gate_matrix(g, n) @ C
            continue
        axis = "I" * g[1] + "Z" + "I" * (n - g[1] - 1) if g[0] in ("T", "Tdg") else g[1]
        ang = "t-" if g[0] == "T" else ("t+" if g[0] == "Tdg" else g[2])
        M = C.conj().T @ pauli_matrix(axis) @ C
        s, sgn = pauli_label(M, n)
        rots.append(dict(pauli=s, sign=sgn, angle=ang, source=i))
    # full check: U = C_final * prod rotations (first rotation applied first)
    U = np.eye(2**n, dtype=complex)
    for g in gates:
        U = gate_matrix(g, n) @ U
    W = np.eye(2**n, dtype=complex)
    for r in rots:
        ang = r["angle"] if r["sign"] == 1 else {"t-": "t+", "t+": "t-"}[r["angle"]]
        W = rot_matrix(r["pauli"], ang) @ W
    equivalent = same_up_to_phase(U, C @ W)
    final_identity = same_up_to_phase(C, np.eye(2**n, dtype=complex))
    # layers: greedy, a rotation goes one layer after the latest earlier rotation it does not commute with
    layers = []
    for i, r in enumerate(rots):
        P = pauli_matrix(r["pauli"])
        lay = 0
        for j in range(i):
            Q = pauli_matrix(rots[j]["pauli"])
            if not np.allclose(P @ Q, Q @ P):
                lay = max(lay, layers[j] + 1)
        layers.append(lay)
    return dict(rots=rots, equivalent=bool(equivalent), finalIdentity=bool(final_identity), layers=(max(layers) + 1 if layers else 0), clifford=C)


def textbook_toffoli():
    # N&C Fig. 4.9 (wires 0,1,2; target 2): H, CNOT(1,2), Tdg, CNOT(0,2), T, CNOT(1,2), Tdg, CNOT(0,2), T(1), T(2), H, CNOT(0,1), T(0), Tdg(1), CNOT(0,1)
    return [
        ("H", 2),
        ("CNOT", 1, 2),
        ("Tdg", 2),
        ("CNOT", 0, 2),
        ("T", 2),
        ("CNOT", 1, 2),
        ("Tdg", 2),
        ("CNOT", 0, 2),
        ("T", 1),
        ("T", 2),
        ("H", 2),
        ("CNOT", 0, 1),
        ("T", 0),
        ("Tdg", 1),
        ("CNOT", 0, 1),
    ]


def phase_toffoli():
    return [("H", 2)] + [("R", s, a) for s, a in (("ZII", "t-"), ("IZI", "t-"), ("IIZ", "t-"), ("ZZI", "t+"), ("ZIZ", "t+"), ("IZZ", "t+"), ("ZZZ", "t-"))] + [("H", 2)]


def toffoli_matrix():
    M = np.eye(8, dtype=complex)
    M[6:, 6:] = X
    return M


def pbc_block():
    out = {}
    tb = textbook_toffoli()
    r = compile_dense(3, tb)
    out["textbookGates"] = len(tb)
    out["textbookRots"] = len(r["rots"])
    out["textbookAxes"] = sorted([(x["pauli"], x["sign"], x["angle"]) for x in r["rots"]])
    out["textbookOrder"] = [(x["pauli"], x["sign"], x["angle"]) for x in r["rots"]]
    out["textbookEquivalent"] = r["equivalent"]
    out["textbookFinalIdentity"] = r["finalIdentity"]
    out["textbookLayers"] = r["layers"]
    # the circuit is the Toffoli
    U = np.eye(8, dtype=complex)
    for g in tb:
        U = gate_matrix(g, 3) @ U
    out["textbookIsToffoli"] = bool(same_up_to_phase(U, toffoli_matrix()))
    ph = phase_toffoli()
    rp = compile_dense(3, ph)
    out["phaseRots"] = len(rp["rots"])
    out["phaseAxes"] = sorted([(x["pauli"], x["sign"], x["angle"]) for x in rp["rots"]])
    out["phaseOrder"] = [(x["pauli"], x["sign"], x["angle"]) for x in rp["rots"]]
    out["phaseChanged"] = sum(1 for x, g in zip(rp["rots"], [g for g in ph if not is_clifford_gate(g)]) if x["pauli"] != g[1])
    out["phaseFinalIdentity"] = rp["finalIdentity"]
    out["phaseLayers"] = rp["layers"]
    out["phaseEquivalent"] = rp["equivalent"]
    Uph = np.eye(8, dtype=complex)
    for g in ph:
        Uph = gate_matrix(g, 3) @ Uph
    out["phaseIsToffoli"] = bool(same_up_to_phase(Uph, toffoli_matrix()))
    out["sameSet"] = int(out["textbookAxes"] == out["phaseAxes"])
    # prefix compiles for the stage: after k gates
    pre = {}
    for name, gs, n in (("textbook", tb, 3), ("phase", ph, 3)):
        pre[name] = []
        for k in range(len(gs) + 1):
            rr = compile_dense(n, gs[:k]) if k else dict(rots=[], clifford=np.eye(2**n, dtype=complex))
            pre[name].append(dict(k=k, rots=[(x["pauli"], x["sign"], x["angle"]) for x in rr["rots"]], identity=bool(same_up_to_phase(rr["clifford"], np.eye(2**n, dtype=complex)))))
    out["prefix"] = pre
    # cnot as three Clifford turns
    cn = [("R", "ZX", "c-"), ("R", "IX", "c+"), ("R", "ZI", "c+")]
    Uc = np.eye(4, dtype=complex)
    for g in cn:
        Uc = gate_matrix(g, 2) @ Uc
    out["cnotRotations"] = len(cn)
    out["cnotMatches"] = bool(same_up_to_phase(Uc, cnot_matrix(0, 1, 2)))
    # one qubit: a Clifford turn about Z against X, Y, Z
    sign_rows = {}
    for L in "XYZ":
        for ang in ("c+", "c-"):
            R = rot_matrix("Z", ang)
            M = R @ PAULI[L] @ R.conj().T
            s, sg = pauli_label(M, 1)
            sign_rows[f"{L}{ang}"] = f"{'+' if sg > 0 else '-'}{s}"
    out["zTurn"] = sign_rows
    out["changedByZturn"] = sum(1 for L in "XYZ" if sign_rows[f"{L}c+"][1:] != L)
    # z-then-x: Z(-pi/2) then X(-pi/4): the axis the rotation ends on
    zx = compile_dense(1, [("R", "Z", "c-"), ("R", "X", "t-")])
    out["zThenX"] = [(x["pauli"], x["sign"], x["angle"]) for x in zx["rots"]]
    return out


def absorb_block(seed=2024, cases=240):
    rng = np.random.RandomState(seed)
    bad = 0
    worst = 0.0
    done = 0
    while done < cases:
        n = int(rng.randint(1, 4))
        P = "".join(rng.choice(list("IXYZ"), n))
        Q = "".join(rng.choice(list("IXYZ"), n))
        if set(P) == {"I"} or set(Q) == {"I"}:
            continue
        Pm, Qm = pauli_matrix(P), pauli_matrix(Q)
        if np.allclose(Pm @ Qm, Qm @ Pm):
            continue
        s = int(rng.randint(0, 2))
        sg = 1 - 2 * s
        proj = (np.eye(2**n) + sg * Pm) / 2
        W = 1j * sg * Qm @ Pm  # W = i s Q P
        projW = (np.eye(2**n) + W) / 2
        lhs = (np.cos(np.pi / 4) * np.eye(2**n) + 1j * np.sin(np.pi / 4) * Qm) @ proj  # e^{i pi Q / 4} Pi_P^s
        rhs = np.sqrt(2) * projW @ proj
        d = float(np.abs(lhs - rhs).max())
        worst = max(worst, d)
        bad += int(d > 1e-9)
        done += 1
    return dict(cases=cases, bad=bad, worst=worst)


# ---------------------------------------------------------------- injection on dense state vectors
def ket(bits):
    v = np.zeros(2 ** len(bits), dtype=complex)
    v[int(bits, 2)] = 1
    return v


def project(v, op, sign):
    return (v + sign * (op @ v)) / 2


def teleport_block(seed=11, trials=200):
    omega = np.exp(1j * np.pi / 4)
    magic = np.array([1, omega], dtype=complex) / np.sqrt(2)
    out = {}
    for name, psi in (("real", np.array([0.6, 0.8], dtype=complex)), ("plus", np.array([1, 1], dtype=complex) / np.sqrt(2))):
        v = np.kron(psi, magic)
        v = cnot_matrix(0, 1, 2) @ v
        res = []
        for o in (0, 1):
            Pz = embed1(Z, 1, 2)
            w = project(v, Pz, 1 - 2 * o)
            p = float(np.vdot(w, w).real)
            w = w / np.sqrt(p)
            data = w.reshape(2, 2)[:, o]
            res.append(dict(prob=p, data=[[float(c.real), float(c.imag)] for c in data]))
        out[name] = res
    # fidelity of the fixed branches with T|psi> on random states
    rng = np.random.RandomState(seed)
    worst = 1.0
    probs = []
    for _ in range(trials):
        psi = rng.randn(2) + 1j * rng.randn(2)
        psi /= np.linalg.norm(psi)
        v = cnot_matrix(0, 1, 2) @ np.kron(psi, magic)
        for o in (0, 1):
            w = project(v, embed1(Z, 1, 2), 1 - 2 * o)
            p = float(np.vdot(w, w).real)
            probs.append(p)
            data = w.reshape(2, 2)[:, o] / np.sqrt(p)
            if o == 1:
                data = S @ data
            f = abs(np.vdot(T @ psi, data)) ** 2
            worst = min(worst, float(f))
    out["fidelityMin"] = worst
    out["probSpread"] = float(max(probs) - min(probs))
    return out


def inject_general_block(seed=5):
    """measure P (x) Z_m (outcome s), then X_m (outcome t), on a magic lane |m>; compare with P^[t] P(-s pi/4) |psi>."""
    omega = np.exp(1j * np.pi / 4)
    magic = np.array([1, omega], dtype=complex) / np.sqrt(2)
    rng = np.random.RandomState(seed)
    cases = ["X", "Z", "Y", "XX", "ZZ", "XZ", "ZX", "YZ", "XY", "ZYX", "XIZ"]
    worst = 0.0
    probs = {}
    for P in cases:
        n = len(P)
        psi = rng.randn(2**n) + 1j * rng.randn(2**n)
        psi /= np.linalg.norm(psi)
        v = np.kron(psi, magic)
        Pm = pauli_matrix(P)
        PZ = np.kron(Pm, Z)
        Xm = embed1(X, n, n + 1)
        for s in (0, 1):
            for t in (0, 1):
                w = project(v, PZ, 1 - 2 * s)
                w = project(w, Xm, 1 - 2 * t)
                p = float(np.vdot(w, w).real)
                probs[f"{P}{s}{t}"] = p
                data = w.reshape(2**n, 2) @ np.array([1, 1 - 2 * t]) / 1  # contract the magic qubit with <t| (X eigenstate)
                data = data / np.linalg.norm(data)
                sg = 1 - 2 * s
                Rm = np.cos(np.pi / 8) * np.eye(2**n) - 1j * sg * np.sin(np.pi / 8) * Pm  # P(-s pi/4) = exp(-i s pi P/8)
                expect = Rm @ psi
                if t:
                    expect = Pm @ expect
                expect = expect / np.linalg.norm(expect)
                worst = max(worst, 1 - abs(np.vdot(expect, data)) ** 2)
    return dict(paulis=len(cases), worst=float(worst), probMin=min(probs.values()), probMax=max(probs.values()))


def axes_block():
    """Executed axes under the pending Clifford (s outcomes only): dense 2 x 2 matrices."""
    def run(planned, bits):
        F = I2.copy()
        ex = []
        for B, o in zip(planned, bits):
            M = F @ PAULI[B] @ F.conj().T
            lab, sg = pauli_label(M, 1)
            ex.append(("-" if sg < 0 else "+") + lab)
            if o:
                # Clifford fix: rotation by +pi/2 about the executed (signed) axis
                A = sg * PAULI[lab]
                R = (I2 + 1j * A) / np.sqrt(2)
                F = R @ F
        return ex

    out = {}
    for planned in ("ZXZX", "ZZZ", "ZX"):
        seqs = set()
        for bits in itertools.product((0, 1), repeat=len(planned)):
            seqs.add(tuple(run(planned, bits)))
        out[planned] = dict(histories=2 ** len(planned), distinct=len(seqs))
    out["ZXZX_0100"] = run("ZXZX", (0, 1, 0, 0))
    out["ZX_10"] = run("ZX", (1, 0))
    out["ZX_00"] = run("ZX", (0, 0))
    out["ZZZ_111"] = run("ZZZ", (1, 1, 1))
    return out


# ---------------------------------------------------------------- post-selection arithmetic
def attempts_series(s, terms=60000):
    k = np.arange(1, terms + 1)
    return float(np.sum(k * s * (1 - s) ** (k - 1)))


def staged_time(t1, t2, s1, s2, abort=True):
    """Mean time to one kept state: a 2-state chain (start, passed stage 1), solved as a linear system."""
    # E0 = t1 + s1 * E1 + (1 - s1) * E0 ;  E1 = t2 + (1 - s2) * E0   (abort: stage 2 only runs after stage 1 passes)
    # without abort stage 2 always runs: E0 = t1 + t2 + (1 - s1 * s2) * E0
    if abort:
        A = np.array([[s1, -s1], [-(1 - s2), 1.0]])
        b = np.array([t1, t2])
        E0, E1 = np.linalg.solve(A, b)
        return float(E0)
    return float((t1 + t2) / (s1 * s2))


def staged_mc(t, s, abort, runs=400000, seed=7):
    rng = np.random.RandomState(seed)
    total = 0.0
    kept = 0
    # vectorised: simulate attempts until `runs` states are kept
    n = int(runs / (s[0] * s[1]) * 1.2)
    u1 = rng.rand(n) < s[0]
    u2 = rng.rand(n) < s[1]
    time = np.where(u1, t[0] + t[1], t[0]) if abort else np.full(n, t[0] + t[1], dtype=float)
    ok = u1 & u2
    return float(time.sum() / ok.sum())


def post_block():
    out = dict(mean5=attempts_series(0.2), mean035=attempts_series(0.35), mean1e2=attempts_series(0.01, 20000))
    s1 = 0.65
    keep = 0.2
    s2 = keep / s1
    out["s2"] = s2
    out["time"] = staged_time(10, 4, s1, s2, True)
    out["noAbort"] = staged_time(10, 4, s1, s2, False)
    out["mc"] = staged_mc((10, 4), (s1, s2), True)
    out["mcNoAbort"] = staged_mc((10, 4), (s1, s2), False)
    # reported-input arithmetic: escape-stage discard from (cultivation discard, end-to-end discard)
    esc = lambda c, e: float((Fraction(e) - Fraction(c)) / (1 - Fraction(c)))
    out["esc3"] = esc("0.35", "0.80")
    out["esc5"] = esc("0.85", "0.99")
    out["keep3"] = 1 - 0.80
    out["keep5"] = 1 - 0.99
    out["ratio"] = attempts_series(0.01, 30000) / attempts_series(0.2)
    return out


def gap_block(n=7, p=0.1):
    """Decode by comparing the weight of the two candidate corrections; loop over all 2^n flip patterns."""
    res = {}
    pat = []
    for e in range(1 << n):
        w = pc(e)
        prob = p**w * (1 - p) ** (n - w)
        gap = abs(n - 2 * w)
        fail = w > n / 2
        pat.append((gap, fail, prob))
    res["noCut"] = sum(pr for g, f, pr in pat if f)
    for cut in range(1, n + 1, 2):
        kept = sum(pr for g, f, pr in pat if g >= cut)
        bad = sum(pr for g, f, pr in pat if g >= cut and f)
        res[f"keep{cut}"] = kept
        res[f"err{cut}"] = bad / kept if kept else 0.0
    return res


# ---------------------------------------------------------------- T-count
def keyed(arr, digits=8):
    """Batch of 2 x 2 unitaries (m,2,2) -> phase-normalised rounded rows for dedupe."""
    flat = arr.reshape(len(arr), 4)
    first = np.where(np.abs(flat[:, 0]) > 1e-9, flat[:, 0], flat[:, 1])
    norm = (np.abs(first) / first)[:, None]
    v = flat * norm
    return np.round(np.concatenate([v.real, v.imag], axis=1), digits) + 0.0, v.reshape(len(arr), 2, 2)


def cliff_array():
    return np.array(CLIFF1)


def tcount_sets(kmax):
    cl = cliff_array()
    keys0, mats0 = keyed(cl)
    seen = {tuple(k) for k in keys0}
    new = mats0
    counts = [len(seen)]
    allmats = [mats0]
    for k in range(1, kmax + 1):
        cand = np.einsum("cij,jk,mkl->cmil", cl, T, new).reshape(-1, 2, 2)
        keys, mats = keyed(cand)
        fresh = []
        fkeys = set()
        for i, kk in enumerate(map(tuple, keys)):
            if kk not in seen and kk not in fkeys:
                fkeys.add(kk)
                fresh.append(mats[i])
        seen |= fkeys
        new = np.array(fresh)
        counts.append(len(seen))
        allmats.append(new)
    return counts, allmats


def rz(phi):
    return np.diag([np.exp(-1j * phi / 2), np.exp(1j * phi / 2)])


def best_errors(phi, kmax):
    """min over the unitaries with T-count <= k of sqrt(2 - |tr(U^dagger Rz(phi))|), for k = 0..kmax."""
    counts, allm = tcount_sets(kmax)
    R = rz(phi)
    best = 9.0
    out = []
    for lay in allm:
        tr = np.abs(np.einsum("mij,ij->m", lay.conj().transpose(0, 2, 1), R))
        best = min(best, float(np.sqrt(max(0.0, 2 - tr.max()))))
        out.append(best)
    return out


def dist_to_identity(W):
    """sqrt(2 - |tr W|) modulo phase, in the form that stays accurate when it is tiny (scale to det 1, then sqrt(2) sin(a) / sqrt(1 + cos(a)))."""
    V = W / np.sqrt(W[0, 0] * W[1, 1] - W[0, 1] * W[1, 0])
    if V[0, 0].real < 0:
        V = -V
    return float(np.sqrt(2) * np.hypot(V[0, 0].imag, abs(V[0, 1])) / np.sqrt(1 + V[0, 0].real))


def ht_block(nmax=1000):
    W = H @ T
    P = I2.copy()
    best = 9.0
    closest = {}
    trace = []
    for n in range(1, nmax + 1):
        P = P @ W
        e = dist_to_identity(P)
        best = min(best, e)
        trace.append(best)
        if n in (10, 100, 1000):
            closest[n] = best
    ang = 2 * np.degrees(np.arccos(abs(np.trace(W)) / 2))
    return dict(angleDeg=float(ang), turns=float(ang / 360), close=[closest[k] for k in (10, 100, 1000)], trace=[trace[i] for i in (0, 1, 4, 9, 19, 49, 99, 199, 499, 999)])


def rx_mat(b):
    return np.cos(b / 2) * np.eye(2) - 1j * np.sin(b / 2) * X


def generic_targets():
    """The 27 generic rotations Rz(a) Rx(b) Rz(c), a and c in {0.7, 2.4, 4.1}, b in {0.6, 1.5, 2.4} (same list as app/src/physics/qec/tcount.ts)."""
    return [rz(a) @ rx_mat(b) @ rz(c) for a in (0.7, 2.4, 4.1) for b in (0.6, 1.5, 2.4) for c in (0.7, 2.4, 4.1)]


def best_errors_many(targets, kmax):
    counts, allm = tcount_sets(kmax)
    best = [0.0] * len(targets)
    out = [[] for _ in targets]
    for lay in allm:
        L = lay.conj().transpose(0, 2, 1)
        for i, V in enumerate(targets):
            tr = np.abs(np.einsum("mij,ij->m", L, V)).max()
            best[i] = max(best[i], float(tr))
            out[i].append(float(np.sqrt(max(0.0, 2 - best[i]))))
    return counts, out


def tcount_block(kmax=11):
    counts, errs = best_errors_many([rz(1.0), rz(np.pi / 8), rz(np.pi / 4)] + generic_targets(), kmax)
    out = dict(counts=counts[:7], err_phi1=errs[0], pi8=errs[1][:4], exactT=errs[2][:2])
    gen = np.array(errs[3:])
    mean_log = np.mean(np.log2(1 / gen), axis=0)
    ks = np.arange(4, kmax + 1)
    out["meanLog"] = [float(x) for x in mean_log]
    out["slope"] = float(np.polyfit(ks, mean_log[4 : kmax + 1], 1)[0])
    return out


if __name__ == "__main__":
    import json

    for name, fn in (("magic", magic_block), ("fifteen", fifteen_block), ("distill", distill_block), ("pbc", pbc_block), ("absorb", absorb_block), ("teleport", teleport_block), ("inject", inject_general_block), ("axes", axes_block), ("post", post_block), ("gap", gap_block), ("ht", ht_block), ("tcount", tcount_block)):
        print("==", name)
        r = fn()
        if name == "pbc":
            r.pop("prefix", None)
        print(json.dumps(r, default=str)[:1800])
