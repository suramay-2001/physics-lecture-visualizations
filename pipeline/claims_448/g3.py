#!/usr/bin/env python3
"""claims_448/g3.py : numpy twins of every claim key of the Townsend pass for Lectures 9 and 10 (G3), by routes independent of the engine.
numpy only; no repo imports. Conventions: |0> = |u> = |+z>, first factor = particle 1 = Alice; hbar = 1.
Run:  python3 pipeline/claims_448/g3.py  (from the repo root) -> asserts the digest transcriptions, writes
      app/src/physics/__fixtures__/claims-448/g3.json ({"about", "values"}); twice, byte-identical.
"""
import itertools
import json
from pathlib import Path

import numpy as np

print = lambda *a, **k: None  # quiet: the output is the JSON file

I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
H = (X + Z) / np.sqrt(2)
k = np.kron
u = np.array([1, 0], dtype=complex)
d = np.array([0, 1], dtype=complex)
px = (u + d) / np.sqrt(2)
mx = (u - d) / np.sqrt(2)
py = (u + 1j * d) / np.sqrt(2)
my = (u - 1j * d) / np.sqrt(2)
SWAP = np.array([[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]], dtype=complex)
uu, ud, du, dd = k(u, u), k(u, d), k(d, u), k(d, d)
sing = (ud - du) / np.sqrt(2)
trip0 = (ud + du) / np.sqrt(2)
OUT = {}


def put(key, val):
    OUT[key] = float(np.real(val)) if np.isscalar(val) or np.ndim(val) == 0 else val
    print(f"{key:22s} = {OUT[key]:.10g}")


def n_ket(theta_deg, phi_deg=0.0):
    t, p = np.radians(theta_deg), np.radians(phi_deg)
    return np.array([np.cos(t / 2), np.exp(1j * p) * np.sin(t / 2)], dtype=complex)


def prob(bra_kets, psi):
    """|<bra|psi>|^2 for a product bra (list of single-qubit kets, one per wire)."""
    b = bra_kets[0]
    for x in bra_kets[1:]:
        b = k(b, x)
    return abs(np.vdot(b, psi)) ** 2


# ---------------------------------------------------------------- digest checks (Townsend equations)
# (5.14) hyperfine matrix, A = 1: H = (2A/hbar^2) S1.S2 = (A/2)(XX+YY+ZZ)
Hhf = 0.5 * (k(X, X) + k(Y, Y) + k(Z, Z))
want514 = np.array([[.5, 0, 0, 0], [0, -.5, 1, 0], [0, 1, -.5, 0], [0, 0, 0, .5]])
assert np.allclose(Hhf, want514), "5.14"
ev = np.linalg.eigvalsh(Hhf)
assert np.allclose(sorted(ev), [-1.5, .5, .5, .5]), "5.16 roots"
assert np.allclose(Hhf @ trip0, .5 * trip0) and np.allclose(Hhf @ sing, -1.5 * sing), "5.18b/5.20"
# (5.36) S_-|1,1> = sqrt2 hbar |1,0>
Sm1 = np.array([[0, 0], [1, 0]], dtype=complex)  # lowering, hbar = 1 (S_- = Sx - iSy)
Sminus = k(Sm1, I2) + k(I2, Sm1)
assert np.allclose(Sminus @ uu, np.sqrt(2) * trip0), "5.36"
# total spin: S^2 eigenvalues, [S2,Sz] = 0, commutator (5.25)
S1v = [k(s / 2, I2) for s in (X, Y, Z)]
S2v = [k(I2, s / 2) for s in (X, Y, Z)]
St = [a + b for a, b in zip(S1v, S2v)]
S2tot = sum(m @ m for m in St)
assert np.allclose(sorted(np.linalg.eigvalsh(S2tot)), [0, 2, 2, 2]), "S^2"
assert np.allclose(St[0] @ St[1] - St[1] @ St[0], 1j * St[2]), "5.25"
assert np.allclose(S2tot @ St[2] - St[2] @ S2tot, 0), "5.32"
# (5.21)/(5.22): 2 S1.S2 eigenvalues +1/2 (x3) and -3/2
dot = sum(a @ b for a, b in zip(S1v, S2v))
assert np.allclose(2 * dot @ trip0, .5 * trip0) and np.allclose(2 * dot @ sing, -1.5 * sing), "5.21/5.22"
# [S1, S2] = 0 (5.6)
assert all(np.allclose(a @ b, b @ a) for a in S1v for b in S2v), "5.6"
# (5.4) |+x,+z> = (|+z,+z> + |-z,+z>)/sqrt2
assert np.allclose(k(px, u), (uu + du) / np.sqrt(2)), "5.4"
# (5.38) |1,0> = (|+x,+x> - |-x,-x>)/sqrt2 ; (5.39) |0,0> = -(|+x,-x> - |-x,+x>)/sqrt2
assert np.allclose(trip0, (k(px, px) - k(mx, mx)) / np.sqrt(2)), "5.38"
assert np.allclose(sing, -(k(px, mx) - k(mx, px)) / np.sqrt(2)), "5.39"
# Problem 5.24 Bell states in x basis
phip = (uu + dd) / np.sqrt(2)
phim = (uu - dd) / np.sqrt(2)
assert np.allclose(phip, (k(px, px) + k(mx, mx)) / np.sqrt(2)) and np.allclose(phim, (k(px, mx) + k(mx, px)) / np.sqrt(2)), "5.24"
# (5.69) teleportation decomposition, random a,b
a_, b_ = np.cos(np.radians(25)), np.exp(1j * np.radians(40)) * np.sin(np.radians(25))
psi1 = a_ * u + b_ * d
psi123 = k(psi1, sing)
psi_m = (k(u, d) - k(d, u)) / np.sqrt(2)
psi_p = (k(u, d) + k(d, u)) / np.sqrt(2)
bell = {"Psi-": psi_m, "Psi+": psi_p, "Phi-": (uu - dd) / np.sqrt(2), "Phi+": (uu + dd) / np.sqrt(2)}
bob = {"Psi-": -a_ * u - b_ * d, "Psi+": -a_ * u + b_ * d, "Phi-": b_ * u + a_ * d, "Phi+": -b_ * u + a_ * d}
recon = sum(0.5 * k(bell[n], bob[n]) for n in bell)
assert np.allclose(recon, psi123), "5.69"
# Example 5.3: R(pi j) on (-b|+z> + a|-z>) = -(a,b)
Ry = lambda th: np.cos(th / 2) * I2 - 1j * np.sin(th / 2) * Y
assert np.allclose(Ry(np.pi) @ bob["Phi+"], -psi1), "Ex 5.3"
# five-point check that Bob's four states are (up to phase) related to psi by rotations by pi (about y, x, z, 0)
corr = {"Psi-": I2, "Psi+": Z, "Phi-": X, "Phi+": Ry(np.pi)}
fids = []
for n in bell:
    v = corr[n] @ bob[n]
    fids.append(abs(np.vdot(psi1, v)) ** 2)
assert np.allclose(fids, 1), "teleport fidelity"
# (5.100)/(5.101): Bob's average state is I/2
rho3 = sum(0.25 * np.outer(v, v.conj()) for v in bob.values())
assert np.allclose(rho3, I2 / 2), "5.101"
# (5.94), (5.96)
rho_s = np.outer(sing, sing.conj())
assert np.allclose(rho_s, 0.5 * np.array([[0, 0, 0, 0], [0, 1, -1, 0], [0, -1, 1, 0], [0, 0, 0, 0]])), "5.94"
rho_m = 0.5 * np.outer(ud, ud.conj()) + 0.5 * np.outer(du, du.conj())
assert np.allclose(rho_m, 0.5 * np.diag([0, 1, 1, 0])), "5.96"
# reduced (5.97)
red = lambda r: np.einsum("ijkj->ik", r.reshape(2, 2, 2, 2))
assert np.allclose(red(rho_s), I2 / 2) and np.allclose(red(rho_m), I2 / 2), "5.97"
# Example 5.5(b): rho = 1/2|+z><+z| + 1/2|-x><-x| = 1/4 [[3,-1],[-1,1]], tr rho^2 = 3/4, <Sx> = -1/4
rb = 0.5 * np.outer(u, u.conj()) + 0.5 * np.outer(mx, mx.conj())
assert np.allclose(rb, 0.25 * np.array([[3, -1], [-1, 1]])) and np.isclose(np.trace(rb @ rb).real, 0.75), "5.5b"
assert np.isclose(np.trace((X / 2) @ rb).real, -0.25), "5.5b Sx"
# Example 5.4: <S_y> for |+y> = 1/2
assert np.isclose(np.trace((Y / 2) @ np.outer(py, py.conj())).real, 0.5), "5.4"
# Example 5.6 Curie: M = N mu tanh(mu B / kT) ; check small-x limit numerically
x = 1e-4
assert np.isclose(np.tanh(x), x, rtol=1e-6)
# Example 5.1 (EPR with tilted A): page prints <-n,+z|0,0> = -cos(th/2)/sqrt2; the page's own |-n> gives +cos(th/2)/sqrt2
th = 60.0
npl = n_ket(th)
nmi = np.array([np.sin(np.radians(th) / 2), -np.cos(np.radians(th) / 2)], dtype=complex)  # |-n> as printed in Example 5.1
amp = lambda bra: np.vdot(k(*bra), sing)
a_pz, a_pmz, a_mpz, a_mmz = amp((npl, u)), amp((npl, d)), amp((nmi, u)), amp((nmi, d))
assert np.isclose(a_pz, -np.sin(np.radians(th) / 2) / np.sqrt(2)) and np.isclose(a_pmz, np.cos(np.radians(th) / 2) / np.sqrt(2))
assert np.isclose(a_mmz, np.sin(np.radians(th) / 2) / np.sqrt(2))
ERR_5_1_third = float(np.real(a_mpz))  # = +cos(30deg)/sqrt2 = +0.612, the page prints the negative of it
assert ERR_5_1_third > 0
# (5.48), (5.57): cos^2(th/2) opposite-sign probability, 1/2 sin^2(th/2) for (+a;+b); verify by amplitudes at several angles
for t in (0, 30, 60, 90, 120, 150, 180):
    pa, pb = u, n_ket(t)
    mb = np.array([np.sin(np.radians(t) / 2), -np.cos(np.radians(t) / 2)], dtype=complex)
    ma = d
    p_opp = prob((pa, mb), sing) + prob((ma, pb), sing)  # (+a,-b) + (-a,+b)
    assert np.isclose(p_opp, np.cos(np.radians(t) / 2) ** 2), "5.48"
    assert np.isclose(prob((pa, pb), sing), 0.5 * np.sin(np.radians(t) / 2) ** 2), "5.57"
# Problem 5.8: E(a,b) = -cos; Problem 5.9
for t in (0, 40, 90, 150):
    Sb = np.cos(np.radians(t)) * Z + np.sin(np.radians(t)) * X
    E = np.vdot(sing, k(Z, Sb) @ sing).real
    assert np.isclose(E, -np.cos(np.radians(t))), "5.8"
    assert np.isclose(np.vdot(sing, k(Z / 2, Sb / 2) @ sing).real, -np.cos(np.radians(t)) / 4), "5.9"
# Problem 5.10 (photons) and 5.12: E = cos 2 theta, S = 2 sqrt2 at 22.5/67.5
xx, yy = k([1, 0], [1, 0]), k([0, 1], [0, 1])
phot = (xx + yy) / np.sqrt(2)
def Ephot(a, b):
    ea = np.array([np.cos(a), np.sin(a)]); ea_p = np.array([-np.sin(a), np.cos(a)])
    eb = np.array([np.cos(b), np.sin(b)]); eb_p = np.array([-np.sin(b), np.cos(b)])
    P = lambda s, t: abs(np.vdot(k(s, t), phot)) ** 2
    return P(ea, eb) + P(ea_p, eb_p) - P(ea, eb_p) - P(ea_p, eb)
for t in (10, 22.5, 45, 80):
    assert np.isclose(Ephot(0, np.radians(t)), np.cos(2 * np.radians(t))), "5.10"
r = np.radians
Sch = Ephot(r(67.5), r(45)) - Ephot(r(67.5), r(0)) + Ephot(r(22.5), r(45)) + Ephot(r(22.5), r(0))
assert np.isclose(Sch, 2 * np.sqrt(2)), "5.12"
# Problem 5.5 (c): sin^2(w0 t)/2 ; (b) oscillation spin0 <-> spin1
w0 = 1.0
tt = 0.37
Hp = w0 * (k(Z / 2, I2) - k(I2, Z / 2))
Ut = np.diag(np.exp(-1j * np.diag(Hp) * tt))
psit = Ut @ sing
assert np.isclose(abs(np.vdot(k(px, px), psit)) ** 2, np.sin(w0 * tt) ** 2 / 2), "5.5c"
assert np.isclose(abs(np.vdot(sing, psit)) ** 2, np.cos(w0 * tt) ** 2), "5.5b"
print("digest checks: all assertions hold\n")

# ---------------------------------------------------------------- L9 claims
print("== L9 claims")
put("l9TwXZamp", abs(np.vdot(uu, k(px, u))))                     # |+x,+z> has amplitude 1/sqrt2 on |uu> (5.4)
put("l9TwXZorth", max(abs(np.vdot(k(a, b), k(c, e))) for (a, b), (c, e) in itertools.combinations(
    [(px, u), (px, d), (mx, u), (mx, d)], 2)))                   # the four x(x)z kets are orthogonal: 0
put("l9TwXXtripPP", prob((px, px), trip0))                       # (5.38): 1/2
put("l9TwXXtripPM", prob((px, mx), trip0))                       # 0
put("l9TwXXsingPM", prob((px, mx), sing))                        # (5.39): 1/2
put("l9TwXXsingPP", prob((px, px), sing))                        # 0
put("l9TwXXtripAmpMag", abs(np.vdot(k(mx, mx), trip0)))          # |-x,-x> amplitude magnitude 1/sqrt2 (sign is -1)
sw = np.linalg.eigvalsh(SWAP)
put("l9TwSymDim", int(np.sum(np.isclose(sw, 1))))                # 3 symmetric states
put("l9TwAntiDim", int(np.sum(np.isclose(sw, -1))))              # 1 antisymmetric state
put("l9TwSwapTrip", np.vdot(trip0, SWAP @ trip0))                # +1
put("l9TwSwapSing", np.vdot(sing, SWAP @ sing))                  # -1 (displayed as: the sign flips; magnitude 1)
put("l9TwSwapSingMag", abs(np.vdot(sing, SWAP @ sing)))          # 1
put("l9TwTripCount", 3)                                          # |1,1>,|1,0>,|1,-1>, from s=1: 2s+1 (numpy: eigenvalue 2 of S^2 repeated)
put("l9TwTripS2", int(np.sum(np.isclose(np.linalg.eigvalsh(S2tot), 2))))  # 3
# practice
alice, bob_ = px, n_ket(60)  # Alice along +x; Bob at polar angle 60 from z: cos30|u> + sin30|d>
put("l9PrQ1", prob((d, u), k(alice, bob_)))                      # P(Alice d, Bob u) = 3/8
cs = np.array([1, 2, 3, 6]) / np.sqrt(50)
put("l9PrQ2", 6)                                                 # c = 6 makes (1,2,3,c) a product (route below)
C = np.array([[1, 2], [3, 0]], dtype=float)
cs_found = [c for c in range(-20, 21) if np.linalg.matrix_rank(np.array([[1, 2], [3, c]], dtype=float)) == 1]
assert cs_found == [6], cs_found
psiq3 = (ud + 2 * du) / np.sqrt(5)
put("l9PrQ3", prob((px, px), psiq3))                             # 9/20
put("l9PrQ3b", prob((px, mx), psiq3))                            # 1/20
phi = 70.0
psiq4 = (uu + np.exp(1j * np.radians(phi)) * dd) / np.sqrt(2)
put("l9PrQ4", prob((px, px), psiq4))                             # (1 + cos phi)/4
put("l9PrQ4z", np.vdot(psiq4, k(Z, Z) @ psiq4))                  # ZZ = +1 for every phi
assert np.isclose(OUT["l9PrQ4"], (1 + np.cos(np.radians(phi))) / 4)

# ---------------------------------------------------------------- L10 claims
print("\n== L10 claims")
put("l10TwCommRes", np.linalg.norm(St[0] @ St[1] - St[1] @ St[0] - 1j * St[2]))   # (5.25): 0
put("l10TwSzMax", max(np.linalg.eigvalsh(St[2])))                # 1
put("l10TwSzZeros", int(np.sum(np.isclose(np.linalg.eigvalsh(St[2]), 0))))  # 2
put("l10TwS2Trip", max(np.linalg.eigvalsh(S2tot)))               # 2 = s(s+1), s = 1
put("l10TwS2Sing", min(np.linalg.eigvalsh(S2tot)))               # 0
put("l10TwSdotTrip", float(np.vdot(trip0, 2 * dot @ trip0).real))   # hbar^2/2 -> 1/2
put("l10TwSdotSingMag", float(abs(np.vdot(sing, 2 * dot @ sing))))  # 3/2
put("l10TwH11", Hhf[0, 0])                                       # (5.12) A/2
put("l10TwH22Mag", abs(Hhf[1, 1]))                               # A/2 (sign minus)
put("l10TwH23", Hhf[1, 2])                                       # (5.13) A
put("l10TwEUp", float(max(ev)))                                  # A/2
put("l10TwEDownMag", float(abs(min(ev))))                        # 3A/2
put("l10TwEUpDeg", int(np.sum(np.isclose(ev, 0.5))))             # 3
put("l10TwGap", float(max(ev) - min(ev)))                        # 2A
dotpm = 2 * 2 * dot                                              # sigma.tau = XX+YY+ZZ = 4 S1.S2
put("l10TwSigTauSingMag", abs(np.linalg.eigvalsh(k(X, X) + k(Y, Y) + k(Z, Z))[0]))  # 3
put("l10TwSigTauTrip", np.linalg.eigvalsh(k(X, X) + k(Y, Y) + k(Z, Z))[-1])        # +1
# density matrices (5.94)-(5.97)
put("l10TwPurPair", np.trace(rho_s @ rho_s))                     # 1
put("l10TwPurMix", np.trace(rho_m @ rho_m))                      # 1/2
put("l10TwCohPure", abs(rho_s[1, 2]))                            # 1/2
put("l10TwCohMix", abs(rho_m[1, 2]))                             # 0
put("l10TwXXmix", np.trace(rho_m @ k(X, X)))                     # 0
put("l10TwXXpureMag", abs(np.trace(rho_s @ k(X, X))))            # 1
put("l10TwZZboth", np.trace(rho_m @ k(Z, Z)) - np.trace(rho_s @ k(Z, Z)))   # 0: same Z statistics
put("l10TwRedGap", np.linalg.norm(red(rho_s) - I2 / 2))          # 0 (5.97)
# EPR (Example 5.1)
sweep = [abs(sum(prob((n_ket(t), u), sing) for _ in [0]) + prob((np.array([np.sin(np.radians(t) / 2), -np.cos(np.radians(t) / 2)], dtype=complex), u), sing) - 0.5)
         for t in range(0, 181, 15)]
put("l10TwEprMargDev", max(sweep))                               # B's chance of +z is 1/2 at every tilt: worst deviation 0
p_Aplus = prob((n_ket(60), u), sing) + prob((n_ket(60), d), sing)
put("l10TwEprCond60", prob((n_ket(60), u), sing) / p_Aplus)       # P(B=+z | A=+n, 60deg) = sin^2(30) = 1/4
put("l10TwEprJoint60", prob((n_ket(60), u), sing))               # joint = 1/2 sin^2(30) = 1/8
# three-axis populations (5.41)
tables = list(itertools.product([1, -1], repeat=3))             # particle 1's (a,b,c) signs; particle 2 = negated
def differ_frac(s1):
    s2 = [-x for x in s1]
    pairs = [(i, j) for i in range(3) for j in range(3) if i != j]
    return sum(1 for i, j in pairs if s1[i] != s2[j]) / len(pairs)
fr = [differ_frac(t) for t in tables]
put("l10TwTableSame", fr[0])                                     # N1: +++ -> always differ = 1
put("l10TwTableMixed", fr[1])                                    # 1/3
put("l10TwDeckFloor", min(fr))                                   # smallest value over decks? min over tables = 1/3
put("l10TwDeckUniform", float(np.mean(fr)))                      # 1/2
put("l10TwTablesCount", len(tables))                             # 8
put("l10TwTablesMixedCount", sum(1 for f in fr if abs(f - 1 / 3) < 1e-12))   # 6
# quantum, 120 degrees
t = 120
pa, pb = u, n_ket(t)
mb = np.array([np.sin(np.radians(t) / 2), -np.cos(np.radians(t) / 2)], dtype=complex)
put("l10TwQuant120", prob((pa, mb), sing) + prob((d, pb), sing))  # 1/4
put("l10TwBelow", OUT["l10TwDeckFloor"] - OUT["l10TwQuant120"])   # 1/12
# Bell inequality (5.54)-(5.60): c bisects a (angle 0) and b (angle 2 Theta)
def Ppp(t1, t2):
    """P(+a;+b) for the singlet, axes in the x-z plane at polar angles t1, t2 (deg): amplitude method."""
    return prob((n_ket(t1), n_ket(t2)), sing)
Th = 60.0
left = Ppp(0, 2 * Th)           # P(+a;+b), theta_ab = 2 Theta
right = Ppp(0, Th) + Ppp(Th, 2 * Th)  # P(+a;+c) + P(+c;+b)
put("l10TwBellLeft", left)       # 3/8
put("l10TwBellRight", right)     # 1/4
put("l10TwBell60Left", 2 * left)   # 3/4 as printed in (5.60)
put("l10TwBell60Right", 2 * right)  # 1/2
gap = lambda Thd: Ppp(0, 2 * Thd) - Ppp(0, Thd) - Ppp(Thd, 2 * Thd)
grid = np.linspace(0.0, 180.0, 18001)
g = np.array([gap(x) for x in grid[::10]])
imax = int(np.argmax(g))
put("l10TwBellGapMaxAt", round(float(grid[::10][imax]), 9))                        # 60 degrees
put("l10TwBellGapMax", g[imax])                                   # 1/8
# zero crossing in (0,180): bisect
lo, hi = 45.0, 135.0
for _ in range(80):
    mid = 0.5 * (lo + hi)
    if gap(mid) > 0:
        lo = mid
    else:
        hi = mid
put("l10TwBellCross", 0.5 * (lo + hi))                            # 90 degrees
viol = [x for x in np.linspace(0.5, 179.5, 359) if gap(x) > 1e-12]
put("l10TwBellViolLo", min(viol) - 0.5 if min(viol) > 1 else 0)   # violated for 0 < Theta < 90
put("l10TwBellViolHi", max(viol) + 0.5)                           # 90
# CHSH value of Problem 5.12 for spin-1/2 singlet at the optimal settings is 2 sqrt2 (photon case checked above)
put("l10TwChshPhoton", Sch)
# teleportation (5.69)
put("l10TwTeleP", 0.25)
probs_out = [np.linalg.norm(0.5 * v) ** 2 for v in bob.values()]
put("l10TwTelePmin", min(probs_out)); put("l10TwTelePmax", max(probs_out))   # all four = 1/4
put("l10TwTeleFid", min(fids))                                    # 1 after the rotation
put("l10TwTeleMixDev", np.linalg.norm(rho3 - I2 / 2))             # 0
put("l10TwTeleRaw", min(abs(np.vdot(psi1, v)) ** 2 for v in bob.values()))  # fidelity WITHOUT correction: min over outcomes
put("l10TwTeleRawAvg", np.mean([abs(np.vdot(psi1, v)) ** 2 for v in bob.values()]))  # = 1/2 for any psi
# erratum check value
put("errExample51Third", ERR_5_1_third)
# practice
t30 = np.radians(30)
fam = np.cos(t30) * ud - np.sin(t30) * du
put("l10PrQ1", prob((u, u), fam) + prob((u, d), fam))             # P(Alice up) = cos^2(30) = 3/4
pA = prob((px, u), fam) + prob((px, d), fam)
condB = sum(abs(np.vdot(k(px, b), fam)) ** 2 for b in (u, d))
vecB = np.array([np.vdot(k(px, b), fam) for b in (u, d)])
vecB /= np.linalg.norm(vecB)
put("l10PrQ2", abs(np.vdot(px, vecB)) ** 2)                       # P(Bob +x | Alice +x) = (cos t - sin t)^2 / 2
assert np.isclose(OUT["l10PrQ2"], (np.cos(t30) - np.sin(t30)) ** 2 / 2)
# GHZ-type: lecture's G = (|000> - |011> - |101> - |110>)/2 ; stray rotation of Alice by 40 deg about z before XZX
def e3(s): return np.array([1.0 if i == int(s, 2) else 0.0 for i in range(8)], dtype=complex)
G = (e3("000") - e3("011") - e3("101") - e3("110")) / 2
for op, want in ((k(k(Z, Z), Z), +1), (k(k(Z, X), X), -1), (k(k(X, Z), X), -1), (k(k(X, X), Z), -1)):
    assert np.isclose(np.vdot(G, op @ G).real, want), "GHZ rows"
Rz = lambda ph: np.diag([np.exp(-1j * ph / 2), np.exp(1j * ph / 2)])
phz = np.radians(40)
Gs = k(k(Rz(phz), I2), I2) @ G
op = k(k(X, Z), X)
pwin = (1 - np.vdot(Gs, op @ Gs).real) / 2   # win iff product of answers = -1
put("l10PrQ3", pwin)                                               # cos^2(20deg) = 0.8830
assert np.isclose(pwin, np.cos(phz / 2) ** 2)
put("l10PrQ3rows", (1 - np.vdot(Gs, k(k(Z, X), X) @ Gs).real) / 2)  # input ZXX unaffected: 1
# classical best with a biased referee: ZZZ 1/2, others 1/6 each
probs_in = {"ZZZ": 1 / 2, "ZXX": 1 / 6, "XZX": 1 / 6, "XXZ": 1 / 6}
need = {"ZZZ": 1, "ZXX": -1, "XZX": -1, "XXZ": -1}
best = 0.0
# a deterministic plan: Alice/Bob/Charlie each pick answer for Z and X (6 bits)
for bits in itertools.product([1, -1], repeat=6):
    aZ, aX, bZ, bX, cZ, cX = bits
    ans = {"ZZZ": aZ * bZ * cZ, "ZXX": aZ * bX * cX, "XZX": aX * bZ * cX, "XXZ": aX * bX * cZ}
    best = max(best, sum(p for r_, p in probs_in.items() if ans[r_] == need[r_]))
put("l10PrQ4", best)                                               # 5/6
# mean of deterministic plans can't beat the best one (shared randomness): check by uniform mixture
allw = []
for bits in itertools.product([1, -1], repeat=6):
    aZ, aX, bZ, bX, cZ, cX = bits
    ans = {"ZZZ": aZ * bZ * cZ, "ZXX": aZ * bX * cX, "XZX": aX * bZ * cX, "XXZ": aX * bX * cZ}
    allw.append(sum(p for r_, p in probs_in.items() if ans[r_] == need[r_]))
put("l10PrQ4mix", float(np.mean(allw)))                            # 1/2
# correlator of (|uu> + e^{i phi}|dd>)/sqrt2 : <XX> = cos phi, <ZZ> = 1
phi5 = 50.0
bs = (uu + np.exp(1j * np.radians(phi5)) * dd) / np.sqrt(2)
put("l10PrQ5", np.vdot(bs, k(X, X) @ bs))                          # cos 50 = 0.6428
put("l10PrQ5z", np.vdot(bs, k(Z, Z) @ bs))                         # 1
put("l10PrQ5yy", np.vdot(bs, k(Y, Y) @ bs))                        # -cos 50
assert np.isclose(OUT["l10PrQ5"], np.cos(np.radians(phi5)))

KEYS = ['l9TwXZamp', 'l9TwXZorth', 'l9TwXXtripPP', 'l9TwXXtripPM', 'l9TwXXsingPM', 'l9TwXXsingPP', 'l9TwXXtripAmpMag', 'l9TwSymDim', 'l9TwAntiDim', 'l9TwSwapTrip', 'l9TwSwapSingMag', 'l9PrQ1', 'l9PrQ2', 'l9PrQ3', 'l9PrQ3b', 'l9PrQ4', 'l9PrQ4z'] + ['l10TwCommRes', 'l10TwSzMax', 'l10TwSzZeros', 'l10TwS2Trip', 'l10TwS2Sing', 'l10TwSdotTrip', 'l10TwSdotSingMag', 'l10TwH11', 'l10TwH22Mag', 'l10TwH23', 'l10TwEUp', 'l10TwEDownMag', 'l10TwEUpDeg', 'l10TwGap', 'l10TwSigTauTrip', 'l10TwSigTauSingMag', 'l10TwPurPair', 'l10TwPurMix', 'l10TwCohPure', 'l10TwCohMix', 'l10TwXXmix', 'l10TwXXpureMag', 'l10TwRedGap', 'l10TwEprMargDev', 'l10TwEprCond60', 'l10TwEprJoint60', 'l10TwTablesCount', 'l10TwTablesMixedCount', 'l10TwTableSame', 'l10TwTableMixed', 'l10TwDeckFloor', 'l10TwDeckUniform', 'l10TwQuant120', 'l10TwBelow', 'l10TwBellLeft', 'l10TwBellRight', 'l10TwBell60Left', 'l10TwBell60Right', 'l10TwBellGapMaxAt', 'l10TwBellGapMax', 'l10TwBellCross', 'l10TwTeleP', 'l10TwTeleFid', 'l10TwTeleMixDev', 'l10TwTeleRawAvg', 'l10PrQ1', 'l10PrQ2', 'l10PrQ3', 'l10PrQ4', 'l10PrQ5', 'l10PrQ3rows', 'l10PrQ4mix', 'l10PrQ5z']
missing = [k for k in KEYS if k not in OUT]
assert not missing, missing
ROOT = Path(__file__).resolve().parent.parent.parent
out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-448" / "g3.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({"about": "numpy twins of the Townsend-pass claim keys of Lectures 9 and 10 (pipeline/claims_448/g3.py)",
                           "values": {k: float(OUT[k]) for k in sorted(KEYS)}}, indent=1, sort_keys=True) + "\n")
import sys as _sys
_sys.stdout.write("wrote %s (%d keys)\n" % (out.relative_to(ROOT), len(KEYS)))
