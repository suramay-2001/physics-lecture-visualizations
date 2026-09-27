#!/usr/bin/env python3
"""Claim-specific reference values for every built lecture, computed independently with numpy (owner: P).

One number per key of `V` in app/src/content/L1.values.ts. The engine computes those with closed forms
(pure kets, (1 + n·m)/2, a running "alive" fraction). This script takes other routes, so agreement is
evidence rather than the same code checking itself:
  - kets are eigenvectors from numpy.linalg.eigh of n·σ (never the closed-form kets);
  - Stern–Gerlach benches propagate an unnormalized density matrix with Lüders projectors (the oven is I/2);
  - the 3 : 1 angle is found by bisection on the eigenvector probability;
  - light uses Malus's law cos²χ directly (the engine maps χ to a Bloch angle 2χ);
  - the scatter of the mean uses ⟨A²⟩ − ⟨A⟩² from matrices.

Usage (from the repo root): python3 pipeline/make_claim_fixtures.py → app/src/physics/__fixtures__/claims.json
Checked by app/src/content/claims.test.ts (engine ↔ numpy per key; displayed numbers ↔ claims in scope).
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent

SX = np.array([[0, 1], [1, 0]], complex)
SY = np.array([[0, -1j], [1j, 0]], complex)
SZ = np.array([[1, 0], [0, -1]], complex)
I2 = np.eye(2, dtype=complex)


def n_sigma(tilt_deg):
    """n·σ for a magnet tilted tilt_deg from +z toward +x (the beam flies along y)."""
    t = np.radians(tilt_deg)
    return np.sin(t) * SX + np.cos(t) * SZ


AXES = {"z": 0.0, "x": 90.0}


def axis_deg(a):
    return AXES[a] if isinstance(a, str) else float(a)


def eigvec(M, sign):
    w, v = np.linalg.eigh(M)
    return v[:, np.argmax(w) if sign == "+" else np.argmin(w)]


def ket(name):
    """'+z', '-x', … as eigenvectors of σ_axis."""
    sign, axis = name[0], name[1]
    M = {"x": SX, "y": SY, "z": SZ}[axis]
    return eigvec(M, sign)


def proj(v):
    return np.outer(v, v.conj())


def prob(a, psi):
    return float(abs(np.vdot(a, psi)) ** 2)


def bench(source, axes, keep):
    """Lüders-rule propagation of an unnormalized density matrix. Returns plus, minus, blocked[]."""
    rho = I2 / 2 if source == "oven" else proj(ket(source))
    blocked = []
    for k, a in enumerate(axes[:-1]):
        P = proj(eigvec(n_sigma(axis_deg(a)), keep[k]))
        kept = P @ rho @ P
        blocked.append(float(np.real(np.trace(rho) - np.trace(kept))))
        rho = kept
    M = n_sigma(axis_deg(axes[-1]))
    plus = float(np.real(np.trace(proj(eigvec(M, "+")) @ rho)))
    minus = float(np.real(np.trace(proj(eigvec(M, "-")) @ rho)))
    return plus, minus, blocked


def p_plus(tilt_deg, psi):
    return prob(eigvec(n_sigma(tilt_deg), "+"), psi)


def expect(A, psi):
    return float(np.real(np.vdot(psi, A @ psi)))


def bisect(f, lo, hi, tol=1e-13):
    flo = f(lo)
    for _ in range(200):
        mid = (lo + hi) / 2
        fm = f(mid)
        if (fm > 0) == (flo > 0):
            lo, flo = mid, fm
        else:
            hi = mid
        if hi - lo < tol:
            break
    return (lo + hi) / 2


up = ket("+z")
oz = bench("oven", ["z"], [])
rz = bench("oven", ["z", "z"], ["+"])
zx = bench("oven", ["z", "x"], ["+"])
zxx = bench("oven", ["z", "x", "x"], ["+", "+"])
zxz = bench("oven", ["z", "x", "z"], ["+", "+"])
zmx = bench("oven", ["z", "x", "z"], ["+", "-"])
zzz = bench("oven", ["z", "z", "z"], ["+", "+"])
A45 = n_sigma(45)
var45 = expect(A45 @ A45, up) - expect(A45, up) ** 2

values = {
    # l1-quantized
    "ovenZPlus": oz[0],
    "ovenZMinus": oz[1],
    "repeatZPlate": rz[0] / (rz[0] + rz[1]),
    "repeatZMinus": rz[1],
    "zzzPlate": zzz[0] / (zzz[0] + zzz[1]),
    # l1-sequential
    "pXgivenZ": prob(ket("+x"), ket("+z")),
    "pZgivenX": prob(ket("+z"), ket("+x")),
    "zxPlus": zx[0],
    "zxAlive1": 1 - zx[2][0],
    "zxxAlive2": 1 - zxx[2][0] - zxx[2][1],
    "zxxPlate": zxx[0] / (zxx[0] + zxx[1]),
    "zxzAlive1": 1 - zxz[2][0],
    "zxzAlive2": 1 - zxz[2][0] - zxz[2][1],
    "zxzPlus": zxz[0],
    "zxzMinus": zxz[1],
    "zxzPlate": zxz[0] / (zxz[0] + zxz[1]),
    "zMinusXBlocked2": zmx[2][1],
    # l1-average
    "p45": p_plus(45, up),
    "avg45": expect(A45, up),
    "p60": p_plus(60, up),
    "cos60": expect(n_sigma(60), up),
    "p90": p_plus(90, up),
    "avg90": expect(n_sigma(90), up),
    "theta34": bisect(lambda th: p_plus(th, up) - 0.75, 0.0, 180.0),
    "band10": float(np.sqrt(var45 / 10)),
    "band100": float(np.sqrt(var45 / 100)),
    "band1000": float(np.sqrt(var45 / 1000)),
    "photon45": float(np.cos(np.radians(45)) ** 2),  # Malus's law for light, full angle
    # l1-logic ("up OR right" is false only for not-up AND not-right)
    "pLeftGivenUp": prob(ket("-x"), ket("+z")),
    "pDownGivenLeft": prob(ket("-z"), ket("-x")),
    "falseZFirst": prob(ket("-z"), ket("+z")) * prob(ket("-x"), ket("-z")),
    "falseXFirst": prob(ket("-x"), ket("+z")) * prob(ket("-z"), ket("-x")),
    "trueXFirst": prob(ket("+x"), ket("+z")) + prob(ket("-x"), ket("+z")) * prob(ket("+z"), ket("-x")),
    # l1-vectors
    "pUpRight": prob(ket("+z"), ket("+x")),
    "ampUpRight": float(abs(np.vdot(ket("+z"), ket("+x")))),
    "pRightRight": prob(ket("+x"), ket("+x")),
    "pRightLeft": prob(ket("+x"), ket("-x")),
    "negSame": 1.0 if abs(prob(ket("+x"), -ket("+x")) - 1) < 1e-12 else 0.0,
    "betaSq": 1 - 0.6**2,
    "plusXAlongZ": bench("+x", ["z"], [])[0],
    "plusXAlongX": bench("+x", ["x"], [])[0],
    "ovenAlongX": bench("oven", ["x"], [])[0],
}


# ---- Lecture 2 -------------------------------------------------------------------------------------
# Independent routes: kets are eigh eigenvectors with the phase fixed (first nonzero entry real > 0, the
# engine's convention) wherever a coordinate's sign or phase is shown; complex arithmetic uses Python's
# complex/cmath; Bloch vectors come from ⟨σ_i⟩; benches use the Lüders propagation above.
import cmath  # noqa: E402


def fixed(v):
    k = next(i for i, x in enumerate(v) if abs(x) > 1e-12)
    return v * np.exp(-1j * np.angle(v[k]))


def kf(name):
    return fixed(ket(name))


def bloch_ket(theta, phi):
    n = [np.sin(theta) * np.cos(phi), np.sin(theta) * np.sin(phi), np.cos(theta)]
    return fixed(eigvec(n[0] * SX + n[1] * SY + n[2] * SZ, "+"))


def bloch_vec(psi):
    return [expect(M, psi) for M in (SX, SY, SZ)]


def coords(psi, basis):
    B = np.column_stack(basis)
    return B.conj().T @ psi


def same_state(a, b):
    a, b = a / np.linalg.norm(a), b / np.linalg.norm(b)
    return abs(abs(np.vdot(a, b)) ** 2 - 1) < 1e-9


def trial(cf):
    v = np.array([1, cf], complex)
    return v / np.linalg.norm(v)


def p_up_dirs(n, m):
    """P(+ along n) for the + state along m, from eigenvectors (not (1 + n·m)/2)."""
    def op(u):
        u = np.array(u, float) / np.linalg.norm(u)
        return u[0] * SX + u[1] * SY + u[2] * SZ
    return prob(eigvec(op(n), "+"), eigvec(op(m), "+"))


D = np.pi / 180
zB2, xB2, yB2 = [kf("+z"), kf("-z")], [kf("+x"), kf("-x")], [kf("+y"), kf("-y")]
psi30 = bloch_ket(60 * D, 0)
psiT = np.array([0.5, 1j * np.sqrt(3) / 2])
psi35 = np.array([0.6, 0.8j])
d30 = coords(psi30, xB2)
names = ["+z", "-z", "+x", "-x", "+y", "-y"]
cross = [prob(ket(a), ket(b)) for a in names for b in names if a[1] != b[1]]
axis_of = {"+z": [0, 0, 1], "-z": [0, 0, -1], "+x": [1, 0, 0], "-x": [-1, 0, 0], "+y": [0, 1, 0], "-y": [0, -1, 0]}
tp = bloch_vec(bloch_ket(120 * D, 60 * D))
yb = bench("+y", ["z"], [])
unit_cs = [1, -1, 1j, -1j, cmath.exp(1j * np.pi / 4)]
xc = coords(trial(cmath.exp(1j * np.pi / 4)), xB2)
Sy = SY / 2


def unbiased(A, B):
    return all(abs(abs(np.vdot(a, b)) ** 2 - 1 / len(A)) < 1e-9 for a in A for b in B)


def worst(xs, target):
    """The sample farthest from target (equal to target only if every sample is)."""
    return float(max(xs, key=lambda x: abs(x - target), default=target))


def deg360(z):
    return float(np.degrees(np.angle(z)) % 360)


values.update({
    # l2-vector-space
    "l2ZzOrth": float(abs(np.vdot(ket("+z"), ket("-z")))),
    "l2SumIsX": 1.0 if same_state(ket("+z") + ket("-z"), ket("+x")) else 0.0,
    "l2SumLen": float(np.linalg.norm(ket("+z") + ket("-z"))),
    "l2Inverse": float(np.linalg.norm(ket("+x") - ket("+x"))),
    "l2IxUnit": float(np.linalg.norm(1j * ket("+x"))),
    "l2BraConjIm": float(np.vdot(1j * ket("+z"), ket("+z")).imag),
    "l2ShadowsSum": worst([prob(ket("+z"), bloch_ket(t, 0)) + prob(ket("-z"), bloch_ket(t, 0)) for t in np.linspace(0, np.pi, 37)], 1.0),
    "l2TwoZ": 1.0 if same_state(ket("+z"), 2 * ket("+z")) else 0.0,
    "l2MinusZ": 1.0 if same_state(ket("+z"), -ket("+z")) else 0.0,
    # l2-inner-product
    "l2Overlap30": float(np.vdot(kf("+z"), psi30).real),
    "l2PsiTAlpha": float(abs(np.vdot(ket("+z"), psiT))),
    "l2SwapA": float(np.vdot(kf("-z"), psiT).imag),
    "l2SwapB": float(np.vdot(psiT, kf("-z")).imag),
    "l2RowCol": float(np.vdot(kf("+z"), kf("+x")).real),
    "l2UnitX": float(np.vdot(ket("+x"), ket("+x")).real),
    "l2OrthX": float(abs(np.vdot(ket("+x"), ket("-x")))),
    "l2ZinX": float(coords(kf("+z"), xB2)[1].real),
    "l2MzInX": float(coords(kf("-z"), xB2)[1].real),
    "l2Delta30": float(d30[0].real),
    "l2Eps30": float(d30[1].real),
    "l2DeltaSq": float(abs(d30[0]) ** 2),
    "l2EpsSq": float(abs(d30[1]) ** 2),
    "l2AxlerIm": float((1j * np.vdot(ket("+z"), ket("+z"))).imag),
    "l2PsiTx": float(abs(coords(psiT, xB2)[0]) ** 2),
    # l2-complex
    "l2ISquared": (1j * 1j).real,
    "l2TimesITurn": float(np.degrees(cmath.phase(1j * 1))),
    "l2Abs1i": abs(1 + 1j),
    "l2Arg1i": float(np.degrees(cmath.phase(1 + 1j))),
    "l2Abs34": abs(3 + 4j),
    "l2EulerPi": cmath.exp(1j * np.pi).real,
    "l2EulerHalfPi": cmath.exp(1j * np.pi / 2).imag,
    "l2Conj34": (3 + 4j).conjugate().imag,
    "l2ZstarZ": ((3 + 4j).conjugate() * (3 + 4j)).real,
    "l2PolarProduct": (cmath.rect(2, 30 * D) * cmath.rect(3, 60 * D)).imag,
    "l2ICubed": (1j ** 3).imag,
    "l2IFourth": (1j ** 4).real,
    "l2ModSq1i": ((1 + 1j).conjugate() * (1 + 1j)).real,
    "l2Sq1i": ((1 + 1j) ** 2).imag,
    # l2-plus-y
    "l2YOnZ": yb[0],
    "l2CUnit5050": worst([prob(ket("+z"), trial(cf)) for cf in unit_cs], 0.5),
    "l2RealCIsX": 1.0 if same_state(trial(1), ket("+x")) and same_state(trial(-1), ket("-x")) else 0.0,
    "l2XCoeffRe": float(xc[0].real),
    "l2RealFailPlus": bench("+x", ["x"], [])[0],
    "l2RealFailMinus": bench("-x", ["x"], [])[0],
    "l2XSplit0": prob(ket("+x"), bloch_ket(np.pi / 2, 0)),
    "l2XSplit90": prob(ket("+x"), bloch_ket(np.pi / 2, np.pi / 2)),
    "l2IConjSum": (1j + (1j).conjugate()).real,
    "l2IConjProd": (1j * (1j).conjugate()).real,
    "l2YOnX": bench("+y", ["x"], [])[0],
    "l2YOrth": float(abs(np.vdot(ket("+y"), ket("-y")))),
    "l2YBloch": bloch_vec(ket("+y"))[1],
    "l2T128": float(0.5 * (1 + np.cos(-90 * D))),
    "l2YNorm": float(np.vdot(ket("+y"), ket("+y")).real),
    "l2YBilinear": float(abs(np.dot(kf("+y"), kf("+y")))),
    # l2-three-bases
    "l2Cycle": 1.0 if all(same_state(trial(1j ** k), ket(n)) and same_state(bloch_ket(np.pi / 2, k * np.pi / 2), ket(n))
                          for k, n in enumerate(["+x", "+y", "-x", "-y"])) else 0.0,
    "l2PairsOrth": float(max(abs(np.vdot(ket("+" + a), ket("-" + a))) for a in "zxy")),
    "l2Mub": float(max(cross)),
    "l2MubAll": 1.0 if unbiased(zB2, xB2) and unbiased(xB2, yB2) and unbiased(zB2, yB2) else 0.0,
    "l2XOnY": prob(ket("+y"), ket("+x")),
    "l2GeneralUnit": float(np.linalg.norm(bloch_ket(60 * D, 45 * D))),
    "l2SixPoints": 1.0 if all(np.allclose(bloch_vec(ket(n)), axis_of[n], atol=1e-12) for n in names) else 0.0,
    "l2TwoParamsTheta": float(np.degrees(np.arccos(tp[2]))),
    "l2TwoParamsPhi": float(np.degrees(np.arctan2(tp[1], tp[0]))),
    "l2Perp5050": worst([p_up_dirs([0, 0, 1], [np.cos(2 * np.pi * t), np.sin(2 * np.pi * t), 0]) for t in np.linspace(0, 1, 25)], 0.5),
    # challenges
    "l2VsSumProb": prob(ket("+z"), (kf("+z") + kf("+x")) / np.linalg.norm(kf("+z") + kf("+x"))),
    "l2VsBraScaleIm": float(np.vdot((2 + 1j) * ket("+z"), ket("+z")).imag),
    "l2IpOverlap": float(np.vdot(kf("+x"), kf("+z")).real),
    "l2IpRightLeft": float(coords(kf("-x"), zB2)[1].real),
    "l2IpTownsend": prob(ket("-z"), psiT),
    "l2IpTownsendPlus": prob(ket("+z"), psiT),
    "l2IpDeltaL1": p_up_dirs([1, 0, 0], [np.sin(60 * D), 0, np.cos(60 * D)]),
    "l2CModulus": abs(3 - 4j),
    "l2CTurn": deg360(1j * (1 + 1j)),
    "l2CSqrt": cmath.sqrt(-2).imag,
    "l2YZsplit": prob(ket("+z"), ket("+y")),
    "l2YTownsend": prob(ket("+y"), psiT),
    "l2SyTownsend": expect(Sy, psiT),
    "l2Y35": prob(ket("+y"), psi35),
    "l2X35": prob(ket("+x"), psi35),
    "l2MubWhich45": p_up_dirs([np.sin(45 * D), 0, np.cos(45 * D)], [0, 0, 1]),
    "l2MubPhase": deg360(kf("-y")[1] / kf("-y")[0]),
    "l2MubCount": 4.0 - 1 - 1,
    "l2ThreeEighths": bench("+y", [30, "x"], ["+"])[0],
})


# ---- Lecture 3 -------------------------------------------------------------------------------------
# Independent routes: kets are phase-fixed eigh eigenvectors (never the closed forms); eigenvalues come from
# numpy.linalg.eigh (Hermitian) or eigvals (the quarter turn R); a₀ and a⃗ are traces with the Pauli matrices
# (not the engine's entry formulas); turns are e^{−iφσ/2} built from an eigendecomposition; benches use the
# Lüders propagation above; the update rule is P|ψ⟩/√⟨ψ|P|ψ⟩ with np.vdot; spreads are √(⟨A²⟩ − ⟨A⟩²).
def flag(b):
    return 1.0 if b else 0.0


def plane(deg):
    """The hilbert-plane arrow at deg (0° = |+z⟩, 90° = |−z⟩) = the Bloch state at polar angle 2·deg."""
    return bloch_ket(2 * deg * D, 0)


def eig_desc(A):
    w, v = np.linalg.eigh(A)
    order = np.argsort(w)[::-1]
    return w[order], [fixed(v[:, k]) for k in order]


def turn(axis_sigma, phi):
    """e^{−iφ σ/2} from the eigendecomposition of σ (not cos/sin of the half angle)."""
    w, v = np.linalg.eigh(axis_sigma)
    return v @ np.diag(np.exp(-1j * phi * w / 2)) @ v.conj().T


def herm(A):
    return bool(np.allclose(A, A.conj().T, atol=1e-12))


def is_proj(A):
    return herm(A) and bool(np.allclose(A @ A, A, atol=1e-12))


def pauli_parts(A):
    """(a₀, a_x, a_y, a_z) with A = a₀I + a·σ, from traces."""
    return [float(np.real(np.trace(P @ A)) / 2) for P in (I2, SX, SY, SZ)]


def var(A, psi):
    return expect(A @ A, psi) - expect(A, psi) ** 2


def after(P, psi):
    p = float(np.real(np.vdot(psi, P @ psi)))
    return P @ psi / np.sqrt(p)


def same_vec(a, b):
    return bool(np.allclose(a, b, atol=1e-12))


def spectrum(vals, kets):
    return sum(v * proj(k) for v, k in zip(vals, kets))


def measure_post(A, psi, u):
    """Outcome chosen by the cumulative probability u (eigenvalues largest first), and the eigenvector left."""
    w, vs = eig_desc(A)
    acc = 0.0
    for k, v in enumerate(vs):
        acc += prob(v, psi)
        if u < acc:
            return vs[k], [prob(x, psi) for x in vs]
    return vs[-1], [prob(x, psi) for x in vs]


S_z, S_x = SZ / 2, SX / 2
p60 = plane(60)
psiT3 = np.array([0.5, 1j * np.sqrt(3) / 2])
SW = np.array([[0, 1], [1, 0]], complex)
Mm = np.array([[2, 1], [1, 2]], complex)
Hm = np.array([[1, -2j], [2j, -1]], complex)
Rm = np.array([[0, -1], [1, 0]], complex)
Bm = np.column_stack([[1, 2], [0, 3]]).astype(complex)
Pu3, Pd3, Ppx3, Pmx3 = proj(kf("+z")), proj(kf("-z")), proj(kf("+x")), proj(kf("-x"))
hw, hv = eig_desc(Hm)
blk = bench("+x", ["z", "z"], ["+"])
zxz3 = bench("+x", ["z", "x", "z"], ["+", "+"])
t120 = bench("+z", [120], [])
cxp, cxm = np.vdot(kf("+x"), p60), np.vdot(kf("-x"), p60)
spread_grid = [var(n_sigma(tn) / 2, bloch_ket(th * D, ph * D))
               for tn in range(0, 181, 30) for th in range(0, 181, 30) for ph in (0, 90, 180, 270)]
herm_opts = [np.array([[1, 2j], [-2j, 1]]), np.array([[1, 2j], [2j, 1]]), np.array([[1j, 0], [0, 1]]), Rm]
m_up, m_dn = measure_post(S_z, kf("+x"), 0.3), measure_post(S_z, kf("+x"), 0.7)
s_up, s_dn = measure_post(S_z, p60, 0.1), measure_post(S_z, p60, 0.5)
Ry90, Ry180 = turn(SY, np.pi / 2), turn(SY, np.pi)

values.update({
    # l3-operators
    "l3XonZPlus": bench("+x", ["z"], [])[0],
    "l3XonZMinus": bench("+x", ["z"], [])[1],
    "l3SwapMirror": worst([float(np.vdot(SW @ plane(t), plane(90 - t)).real) for t in (10, 20, 45, 80)], 1.0),
    "l3SwapIsSigmaX": flag(np.allclose(SW, SX)),
    "l3SwapUpDown": flag(same_vec(SW @ kf("+z"), kf("-z")) and same_vec(SW @ kf("-z"), kf("+z"))),
    "l3SwapA11": float(np.vdot(kf("+z"), SW @ kf("+z")).real),
    "l3SwapA21": float(np.vdot(kf("-z"), SW @ kf("+z")).real),
    "l3TurnYIsX": flag(same_vec(Ry90 @ kf("+z"), kf("+x"))),
    "l3TurnYUp": float((Ry90 @ kf("+z"))[0].real),
    "l3XinX1": float(coords(kf("+x"), xB2)[0].real),
    "l3XinX2": float(abs(coords(kf("+x"), xB2)[1])),
    "l3ZXOverlap": float(np.vdot(kf("+z"), kf("+x")).real),
    "l3MZXOverlap": float(np.vdot(kf("-z"), kf("+x")).real),
    # l3-eigen
    "l3MPlusX": float((Mm @ kf("+x"))[0].real),
    "l3MStretchPlus": float(np.vdot(kf("+x"), Mm @ kf("+x")).real),
    "l3MStretchMinus": float(np.vdot(kf("-x"), Mm @ kf("-x")).real),
    "l3MXEigen": flag(same_vec(Mm @ kf("+x"), 3 * kf("+x")) and same_vec(Mm @ kf("-x"), kf("-x"))),
    "l3MTurnsUp": flag(not same_state(Mm @ kf("+z"), kf("+z"))),
    "l3MUpImage": float((Mm @ kf("+z"))[0].real),
    "l3MUpImage2": float((Mm @ kf("+z"))[1].real),
    "l3MEigTop": float(eig_desc(Mm)[0][0]),
    "l3MEigLow": float(eig_desc(Mm)[0][1]),
    "l3SzEigUp": float(eig_desc(S_z)[0][0]),
    "l3SzEigDown": float(eig_desc(S_z)[0][1]),
    "l3SzUp": float((S_z @ kf("+z"))[0].real),
    "l3SzDown": float((S_z @ kf("-z"))[1].real),
    "l3SzArrow": pauli_parts(S_z)[3],
    "l3SzGauge": pauli_parts(S_z)[0],
    "l3SzVectors": flag(same_vec(eig_desc(S_z)[1][0], kf("+z")) and same_vec(eig_desc(S_z)[1][1], kf("-z"))),
    "l3HHerm": flag(herm(Hm)),
    "l3HEigPlus": float(hw[0]),
    "l3HEigMinus": float(hw[1]),
    "l3HArrowY": pauli_parts(Hm)[2],
    "l3HArrowZ": pauli_parts(Hm)[3],
    "l3HGauge": pauli_parts(Hm)[0],
    "l3HEigOrth": float(abs(np.vdot(hv[0], hv[1]))),
    "l3OvenZPlus": bench("oven", ["z"], [])[0],
    "l3BornSum": worst([prob(kf("+z"), plane(90 * t)) + prob(kf("-z"), plane(90 * t)) for t in np.linspace(0, 1, 19)], 1.0),
    "l3P60Up": prob(ket("+z"), p60),
    "l3P60Down": prob(ket("-z"), p60),
    "l3HUpDownIm": float(np.vdot(kf("+z"), Hm @ kf("-z")).imag),
    "l3HDownUpIm": float(np.vdot(kf("-z"), Hm @ kf("+z")).imag),
    "l3HDiagReal": flag(abs(Hm[0, 0].imag) < 1e-15 and abs(Hm[1, 1].imag) < 1e-15),
    "l3RHerm": flag(herm(Rm)),
    "l3RIsTurn": flag(np.allclose(Rm, Ry180, atol=1e-12)),
    "l3RYPlusIm": float(np.vdot(kf("+y"), Rm @ kf("+y")).imag),
    "l3RYMinusIm": float(np.vdot(kf("-y"), Rm @ kf("-y")).imag),
    "l3RYSame": flag(same_state(Rm @ kf("+y"), kf("+y"))),
    "l3REigIm": float(max(np.linalg.eigvals(Rm).imag)),
    "l3REigRe": float(max(abs(np.linalg.eigvals(Rm).real))),
    "l3RNoRealEigen": flag(all(not same_state(Rm @ plane(t), plane(t)) for t in (0, 30, 60, 90, 120, 150))),
    # l3-projectors
    "l3C60Up": float(np.vdot(kf("+z"), p60).real),
    "l3PuP60": float((Pu3 @ p60)[0].real),
    "l3PuP60Rest": float(abs((Pu3 @ p60)[1])),
    "l3PuIdem": flag(is_proj(Pu3)),
    "l3PuTwice": float((Pu3 @ Pu3 @ p60)[0].real),
    "l3ComplZ": flag(np.allclose(Pu3 + Pd3, I2)),
    "l3ComplX": flag(np.allclose(Ppx3 + Pmx3, I2)),
    "l3CxPlus": float(cxp.real),
    "l3CxMinus": float(cxm.real),
    "l3CxMinusSize": float(abs(cxm)),
    "l3Rebuild": float(np.linalg.norm(cxp * kf("+x") + cxm * kf("-x") - p60)),
    "l3HalfPuA0": pauli_parts(0.5 * Pu3)[0],
    "l3HalfPuAz": pauli_parts(0.5 * Pu3)[3],
    "l3HalfPdA0": pauli_parts(-0.5 * Pd3)[0],
    "l3HalfPdAz": pauli_parts(-0.5 * Pd3)[3],
    "l3SpecSz": flag(np.allclose(spectrum([0.5, -0.5], [ket("+z"), ket("-z")]), S_z)),
    "l3BlockBlocked": blk[2][0],
    "l3BlockPlus": blk[0],
    "l3BlockMinus": blk[1],
    "l3PuEigTop": float(eig_desc(Pu3)[0][0]),
    "l3PuEigLow": float(eig_desc(Pu3)[0][1]),
    "l3PuKillsDown": float(np.linalg.norm(Pu3 @ kf("-z"))),
    "l3PuA0": pauli_parts(Pu3)[0],
    "l3PuAz": pauli_parts(Pu3)[3],
    "l3PuP60Len": float(np.linalg.norm(Pu3 @ p60)),
    "l3PuP60Renorm": flag(same_vec(after(Pu3, p60), kf("+z"))),
    "l3PuP60Exp": expect(Pu3, p60),
    # l3-postulates
    "l3P60PlusX": prob(ket("+x"), p60),
    "l3P60MinusX": prob(ket("-x"), p60),
    "l3XBarsSum": worst([expect(Ppx3, plane(180 * t)) + expect(Pmx3, plane(180 * t)) for t in np.linspace(0, 1, 13)], 1.0),
    "l3CollapseDown": flag(same_vec(after(Pd3, p60), kf("-z"))),
    "l3P60DownAmp": float(np.vdot(kf("-z"), p60).real),
    "l3YDownPostIm": float(after(Pd3, kf("+y"))[1].imag),
    "l3YDownSame": flag(same_state(after(Pd3, kf("+y")), ket("-z"))),
    "l3SzOnX": float((S_z @ kf("+x"))[0].real),
    "l3SzOnXLen": float(np.linalg.norm(S_z @ kf("+x"))),
    "l3SzOnXIsMinusX": flag(same_vec(S_z @ kf("+x"), 0.5 * kf("-x"))),
    "l3MinusXNotZ": flag(not same_state(ket("-x"), ket("+z")) and not same_state(ket("-x"), ket("-z"))),
    "l3MeasureXPost": flag(same_vec(m_up[0], kf("+z")) and same_vec(m_dn[0], kf("-z"))),
    "l3MeasureXProb": m_up[1][0],
    "l3SigZOnX": flag(same_vec(SZ @ kf("+x"), kf("-x"))),
    "l3XMinusXOverlap": float(abs(np.vdot(kf("+x"), kf("-x")))),
    "l3SigZMeanX": expect(SZ, kf("+x")),
    "l3SzDownSame": flag(same_state(S_z @ kf("-z"), kf("-z"))),
    "l3DownDown": prob(ket("-z"), ket("-z")),
    "l3MinusXOnZ": prob(ket("-x"), ket("+z")),
    # l3-spin-example
    "l3ProbZX": prob(ket("+z"), ket("+x")),
    "l3RepeatCertain": prob(ket("+z"), ket("+z")),
    "l3ZxzAlive1": 1 - zxz3[2][0],
    "l3ZxzAlive2": 1 - zxz3[2][0] - zxz3[2][1],
    "l3ZxzPlus": zxz3[0],
    "l3ZxzMinus": zxz3[1],
    "l3ProbXZ": prob(ket("+x"), ket("+z")),
    "l3ProbMXZ": prob(ket("-x"), ket("+z")),
    "l3MXZOverlap": float(np.vdot(kf("-x"), kf("+z")).real),
    "l3SxMovesZ": flag(not same_state(S_x @ kf("+z"), kf("+z"))),
    "l3SzKeepsZ": flag(same_state(S_z @ kf("+z"), kf("+z"))),
    # l3-spread
    "l3MeanSzX": expect(S_z, kf("+x")),
    "l3MeanSzXSum": 0.5 * prob(ket("+z"), ket("+x")) - 0.5 * prob(ket("-z"), ket("+x")),
    "l3MeanSzP60": expect(S_z, p60),
    "l3MeanSzP60Sum": 0.5 * prob(ket("+z"), p60) - 0.5 * prob(ket("-z"), p60),
    "l3SzSquaredId": flag(np.allclose(S_z @ S_z, 0.25 * I2)),
    "l3SzSqP60": expect(S_z @ S_z, p60),
    "l3SpreadX": float(np.sqrt(var(S_z, kf("+x")))),
    "l3SigmaSpreadX": float(np.sqrt(max(0.0, var(SZ, kf("+x"))))),
    "l3MeanSzUp": expect(S_z, kf("+z")),
    "l3VarSzUp": max(0.0, var(S_z, kf("+z"))),
    "l3UpOnZ": bench("+z", ["z"], [])[0],
    "l3TiltPlus": t120[0],
    "l3TiltMinus": t120[1],
    "l3TownsendUp": prob(ket("+z"), psiT3),
    "l3TownsendDown": prob(ket("-z"), psiT3),
    "l3TownsendMean": expect(S_z, psiT3),
    "l3TownsendSpread": float(np.sqrt(var(S_z, psiT3))),
    "l3SpreadP60": float(np.sqrt(var(S_z, p60))),
    "l3SigmaSpreadTilt": float(np.sqrt(var(n_sigma(120), kf("+z")))),
    "l3MeanSxUp": expect(S_x, kf("+z")),
    "l3SpreadSxUp": float(np.sqrt(var(S_x, kf("+z")))),
    "l3ZonXPlus": bench("+z", ["x"], [])[0],
    "l3SpreadMax": float(max(spread_grid)),
    "l3ZeroSpreadIffEigen": flag(all(
        (var(A, s) < 1e-12) == same_state(A @ s, s)
        for A in (S_z, S_x, Mm / 4)
        for s in [ket(n) for n in names] + [bloch_ket(60 * D, 0), bloch_ket(120 * D, 90 * D), bloch_ket(45 * D, 200 * D)]
    )),
    # challenges
    "l3ChSwap": float(np.vdot(kf("+z"), SW @ np.array([0.6, 0.8])).real),
    "l3ChB21": float(np.vdot(kf("-z"), Bm @ kf("+z")).real),
    "l3ChB12": float(np.vdot(kf("+z"), Bm @ kf("-z")).real),
    "l3ChBx": float(np.vdot(kf("-z"), Bm @ kf("+x")).real),
    "l3ChSzDown": float(np.vdot(kf("-z"), S_z @ kf("-z")).real),
    "l3ChMEigenCount": float(sum(same_state(Mm @ ket(n), ket(n)) for n in names)),
    "l3ChMMinusX": flag(same_vec(Mm @ kf("-x"), kf("-x"))),
    "l3ChMOneTwo": flag(not same_state(Mm @ np.array([1, 2]), np.array([1, 2]))),
    "l3ChHermOnlyFirst": flag([herm(A) for A in herm_opts] == [True, False, False, False]),
    "l3ChHYIm": float(np.vdot(kf("+y"), Hm @ kf("+y")).imag),
    "l3ChHYRe": float(np.vdot(kf("+y"), Hm @ kf("+y")).real),
    "l3ChPdLen": float(np.linalg.norm(Pd3 @ p60)),
    "l3ChPpsi01": float(proj(p60)[0, 1].real),
    "l3ChPpsi00": float(proj(p60)[0, 0].real),
    "l3ChPpsiIsProj": flag(is_proj(proj(p60))),
    "l3ChBuild12": float(spectrum([3, 1], [ket("+x"), ket("-x")])[0, 1].real),
    "l3ChBuildIsM": flag(np.allclose(spectrum([3, 1], [ket("+x"), ket("-x")]), Mm)),
    "l3ChSumProj": flag(is_proj(Pu3 + Ppx3)),
    "l3ChSum00": float((Pu3 + Ppx3)[0, 0].real),
    "l3ChSzYIsMinusY": flag(same_state(S_z @ kf("+y"), kf("-y"))),
    "l3ChPdYLen": float(np.linalg.norm(Pd3 @ kf("+y"))),
    "l3ChStepsPost": flag(same_vec(s_up[0], kf("+z")) and same_vec(s_dn[0], kf("-z"))),
    "l3ChStepsProbUp": s_up[1][0],
    "l3ChTilt": bench("+x", ["z", 60, "z"], ["+", "+"])[0],
    "l3ChSpreadComplex": float(np.sqrt(var(S_z, np.array([1 / np.sqrt(3), 1j * np.sqrt(2 / 3)])))),
})

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims.json"
out.write_text(
    json.dumps(
        {
            "about": "Claim values for every built lecture, numpy (eigh, Lüders projectors, bisection, Malus, cmath). "
            "Regenerate: python3 pipeline/make_claim_fixtures.py",
            "values": values,
        },
        indent=1,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
