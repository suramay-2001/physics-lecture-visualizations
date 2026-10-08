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


# ---- Lecture 4 -------------------------------------------------------------------------------------
# Independent routes: the example state is the eigh "+" eigenvector of n·σ at 60° (never the closed form); benches
# propagate Lüders projectors; eigenvalues come from eigh / eigvals, the characteristic polynomial from np.poly and
# determinants from np.linalg.det; the back-substituted eigenvector is the SVD null vector of S − λI; Gram–Schmidt
# subtracts with the projector I − |e₁⟩⟨e₁|; matrices in the x basis are B†AB with B from eigh kets; Bloch vectors
# are ⟨σ⟩ from matrices; the count scatter is √(N·var) of one Bernoulli trial built from ⟨P⟩ and ⟨P²⟩.
def null_vec(A):
    """Unit vector spanning the null space of a singular 2×2 A (last right-singular vector), phase-fixed."""
    _, _, vh = np.linalg.svd(A)
    return fixed(vh[-1].conj())


def maxabs(A):
    return float(np.max(np.abs(A)))


S_y = SY / 2
psi4 = bloch_ket(60 * D, 0)
v68n = np.array([0.6, 0.8], complex)
Qm = np.array([[1, 1], [0, 0]], complex)
A2m = np.array([[2, 1], [1, 2]], complex)
PYbad = 0.5 * np.outer([1, 1j], [1, 1j])
Pu4, Pd4, Ppx4, Pmx4, Ppy4, Pmy4 = (proj(kf(n)) for n in ("+z", "-z", "+x", "-x", "+y", "-y"))
Bx = np.column_stack(xB2)
in_x = lambda A: Bx.conj().T @ A @ Bx  # noqa: E731
e1 = kf("+z")
w2 = (I2 - proj(e1)) @ kf("+x")
yn4 = bench("+x", ["z", "z"], ["+"])
filt4 = bench("+x", ["z", "z", "z"], ["+", "+"])
down4 = bench("-z", ["z", "z"], ["+"])
prep4 = bench("oven", [60, "z"], ["+"])
prep4zz = bench("oven", [60, "z", "z"], ["+", "+"])
prep4x = bench("oven", [60, "x"], ["+"])
sxw, sxv = eig_desc(S_x)
tw, tv = eig_desc(n_sigma(60) / 2)
a2w, a2v = eig_desc(A2m)
qw = sorted(np.linalg.eigvals(Qm).real, reverse=True)
cp = np.poly(S_x)
sz_psi = S_z @ psi4
psi_x = coords(psi4, xB2)
p_up4 = expect(Pu4, psi4)
formula4 = all(
    abs(abs(s[0] + s[1]) ** 2 / 2 - prob(ket("+x"), s)) < 1e-12 and abs(abs(s[0] - s[1]) ** 2 / 2 - prob(ket("-x"), s)) < 1e-12
    for s in (psi4, v68n, kf("+y"))
)
mix_r = 0.75 * np.array(bloch_vec(kf("+z"))) + 0.25 * np.array(bloch_vec(kf("-z")))

values.update({
    # l4-basis
    "l4XonZPlus": bench("+x", ["z"], [])[0],
    "l4XonZMinus": bench("+x", ["z"], [])[1],
    "l4UpOnZ": bench("+z", ["z"], [])[0],
    "l4ZMinusZ": float(abs(np.vdot(kf("+z"), kf("-z")))),
    "l4ZXOverlap": float(np.vdot(kf("+z"), kf("+x")).real),
    "l4MZXOverlap": float(np.vdot(kf("-z"), kf("+x")).real),
    "l4ZXProb": prob(ket("+z"), ket("+x")),
    "l4BarsTotal": worst([prob(kf("+z"), plane(90 * t)) + prob(kf("-z"), plane(90 * t)) for t in np.linspace(0, 1, 19)], 1.0),
    "l4ComplZ": flag(np.allclose(Pu4 + Pd4, I2)),
    "l4ComplX": flag(np.allclose(Ppx4 + Pmx4, I2)),
    "l4ZonXPlus": prob(ket("+x"), ket("+z")),
    "l4ZonXMinus": prob(ket("-x"), ket("+z")),
    "l4SxEigUp": float(sxw[0]),
    "l4SxEigDown": float(sxw[1]),
    "l4XMinusXOverlap": float(abs(np.vdot(kf("+x"), kf("-x")))),
    "l4GsResidualUp": float(abs(w2[0])),
    "l4GsResidualDown": float(w2[1].real),
    "l4GsE2IsDown": flag(same_vec(fixed(w2 / np.linalg.norm(w2)), kf("-z"))),
    "l4IdEigTop": float(eig_desc(I2)[0][0]),
    "l4IdEigLow": float(eig_desc(I2)[0][1]),
    "l4IdAnyEigen": flag(all(same_state(I2 @ v, v) for v in (kf("+z"), kf("+x"), kf("-x"), plane(30), plane(75)))),
    # l4-projectors
    "l4PuP60": float((Pu4 @ plane(60))[0].real),
    "l4PuP60Rest": float(abs((Pu4 @ plane(60))[1])),
    "l4PuEigTop": float(eig_desc(Pu4)[0][0]),
    "l4PuEigLow": float(eig_desc(Pu4)[0][1]),
    "l4PuVecs": flag(same_vec(eig_desc(Pu4)[1][0], kf("+z")) and same_vec(eig_desc(Pu4)[1][1], kf("-z"))),
    "l4PuKillsDown": float(np.linalg.norm(Pu4 @ kf("-z"))),
    "l4PuMeanX": expect(Pu4, kf("+x")),
    "l4YesNoBlocked": yn4[2][0],
    "l4YesNoPlus": yn4[0],
    "l4YesNoMinus": yn4[1],
    "l4PdIsIMinusPu": flag(np.allclose(I2 - Pu4, Pd4)),
    "l4Pu60Exp": expect(Pu4, plane(60)),
    "l4Pd60Exp": expect(Pd4, plane(60)),
    "l4SpecSz": flag(np.allclose(spectrum([0.5, -0.5], [ket("+z"), ket("-z")]), S_z)),
    "l4FilterBlocked1": filt4[2][0],
    "l4FilterBlocked2": filt4[2][1],
    "l4FilterPlus": filt4[0],
    "l4FilterMinus": filt4[1],
    "l4PuIdem": flag(np.allclose(Pu4 @ Pu4, Pu4)),
    "l4PuPdZero": maxabs(Pu4 @ Pd4),
    "l4QIdem": flag(np.allclose(Qm @ Qm, Qm)),
    "l4QHerm": flag(herm(Qm)),
    "l4QProj": flag(is_proj(Qm)),
    "l4PuProj": flag(is_proj(Pu4)),
    "l4QEigTop": float(qw[0]),
    "l4QEigLow": float(qw[1]),
    "l4QKeepsUp": flag(same_vec(Qm @ kf("+z"), kf("+z"))),
    "l4QKillsMinusX": float(np.linalg.norm(Qm @ kf("-x"))),
    "l4ZMinusXOverlap": float(np.vdot(kf("+z"), kf("-x")).real),
    "l4UpGivenDown": prob(ket("+z"), ket("-z")),
    "l4DownAskedBlocked": down4[2][0],
    # l4-example
    "l4PsiNorm": float(np.linalg.norm(psi4)),
    "l4PsiIsPlane30": flag(same_vec(psi4, plane(30))),
    "l4SzEigUp": float(eig_desc(S_z)[0][0]),
    "l4SzEigDown": float(eig_desc(S_z)[0][1]),
    "l4PsiAmpUp": float(np.vdot(kf("+z"), psi4).real),
    "l4PsiAmpDown": float(np.vdot(kf("-z"), psi4).real),
    "l4PsiUp": prob(ket("+z"), psi4),
    "l4PsiDown": prob(ket("-z"), psi4),
    "l4CollapseUp": flag(same_vec(after(Pu4, psi4), kf("+z"))),
    "l4CollapseDown": flag(same_vec(after(Pd4, psi4), kf("-z"))),
    "l4PuPsiLen": float(np.linalg.norm(Pu4 @ psi4)),
    "l4RepeatUp": prob(ket("+z"), ket("+z")),
    "l4PuMatrix": flag(np.allclose(Pu4, np.array([[1, 0], [0, 0]]))),
    "l4PuPsi0": float((Pu4 @ psi4)[0].real),
    "l4PuPsi1": float(abs((Pu4 @ psi4)[1])),
    "l4PuPsiRescaled": flag(same_vec(Pu4 @ psi4 / np.sqrt(p_up4), kf("+z"))),
    "l4Prep60Blocked": prep4[2][0],
    "l4Prep60Plus": prep4[0],
    "l4Prep60Minus": prep4[1],
    "l4Prep60Fill": prep4[0] / (prep4[0] + prep4[1]),
    "l4Prep60Ket": flag(same_vec(fixed(eigvec(n_sigma(60), "+")), psi4)),
    "l4PsiXPlus": prob(ket("+x"), psi4),
    "l4PsiXMinus": prob(ket("-x"), psi4),
    "l4MixXPlus": float(np.real(np.trace(Ppx4 @ (0.75 * Pu4 + 0.25 * Pd4)))),
    "l4MixZPlus": float(np.real(np.trace(Pu4 @ (0.75 * Pu4 + 0.25 * Pd4)))),
    "l4PsiBlochX": bloch_vec(psi4)[0],
    "l4PsiBlochZ": bloch_vec(psi4)[2],
    "l4MixBlochX": float(mix_r[0]),
    "l4MixBlochZ": float(mix_r[2]),
    # l4-average
    "l4MeanSz": expect(S_z, psi4),
    "l4MeanSzSum": 0.5 * prob(ket("+z"), psi4) - 0.5 * prob(ket("-z"), psi4),
    "l4Centroid60": (prep4[0] - prep4[1]) / (prep4[0] + prep4[1]),
    "l4Rep60Blocked1": prep4zz[2][0],
    "l4Rep60Blocked2": prep4zz[2][1],
    "l4Rep60Plus": prep4zz[0],
    "l4Rep60Minus": prep4zz[1],
    "l4SzPsi0": float(sz_psi[0].real),
    "l4SzPsi1": float(sz_psi[1].real),
    "l4SzPsiLen": float(np.linalg.norm(sz_psi)),
    "l4SzPsiAtMinus30": flag(same_state(sz_psi, plane(-30))),
    "l4SandwichSz": float(np.vdot(psi4, sz_psi).real),
    "l4MeanSzInX": float(np.vdot(psi_x, in_x(S_z) @ psi_x).real),
    "l4SzPsiNotUp": flag(not same_state(sz_psi, kf("+z"))),
    "l4SzPsiNotDown": flag(not same_state(sz_psi, kf("-z"))),
    "l4ImgXPlus": prob(ket("+x"), sz_psi / np.linalg.norm(sz_psi)),
    "l4MeanSzX": expect(S_z, kf("+x")),
    "l4Count1000Std": float(np.sqrt(1000 * (expect(Pu4 @ Pu4, psi4) - p_up4 ** 2))),
    # l4-matrices
    "l4DownOnZ": bench("-z", ["z"], [])[1],
    "l4SzUpCol": float((S_z @ kf("+z"))[0].real),
    "l4SzUpColLow": float(abs((S_z @ kf("+z"))[1])),
    "l4SzDownCol": float((S_z @ kf("-z"))[1].real),
    "l4SzIsDiag": flag(np.allclose(S_z, np.diag([0.5, -0.5]))),
    "l4PpxEntry": float(Ppx4[0, 0].real),
    "l4PpxOff": float(Ppx4[0, 1].real),
    "l4PpxAllHalf": 1.0 if np.allclose(Ppx4, 0.5 * np.ones((2, 2)), atol=1e-12) else 0.0,
    "l4PmxOff": float(Pmx4[0, 1].real),
    "l4SpecSx": flag(np.allclose(spectrum([0.5, -0.5], [ket("+x"), ket("-x")]), S_x)),
    "l4PyEntry11": float(Ppy4[1, 1].real),
    "l4PyEntry01Im": float(Ppy4[0, 1].imag),
    "l4PmyEntry01Im": float(Pmy4[0, 1].imag),
    "l4SpecSy": flag(np.allclose(spectrum([0.5, -0.5], [ket("+y"), ket("-y")]), S_y)),
    "l4SyArrow": pauli_parts(S_y)[2],
    "l4SigmaHalf": flag(np.allclose(SX / 2, S_x) and np.allclose(SY / 2, spectrum([0.5, -0.5], [ket("+y"), ket("-y")])) and np.allclose(SZ / 2, S_z)),
    "l4SzArrowZ": pauli_parts(S_z)[3],
    "l4SzGauge": pauli_parts(S_z)[0],
    "l4SxArrowX": pauli_parts(S_x)[1],
    "l4SpinHerm": flag(herm(S_x) and herm(S_y) and herm(S_z)),
    "l4SigmaYDagger": flag(np.allclose(SY.conj().T, SY)),
    "l4SxVectors": flag(same_vec(sxv[0], kf("+x")) and same_vec(sxv[1], kf("-x"))),
    "l4SzInXIsSx": flag(np.allclose(in_x(S_z), S_x)),
    "l4SxInXIsSz": flag(np.allclose(in_x(S_x), S_z)),
    # l4-eigen
    "l4CharPolyLin": float(np.real(cp[1])),
    "l4CharPolyDet": float(np.real(cp[2])),
    "l4CharPolyDetSize": float(abs(cp[2])),
    "l4DetAtPlus": float(abs(np.prod(np.linalg.eigvals(S_x - 0.5 * I2)))),
    "l4DetAtMinus": float(abs(np.prod(np.linalg.eigvals(S_x + 0.5 * I2)))),
    "l4DetAtZero": float(np.linalg.det(S_x.real)),  # S_x is real; numpy warns spuriously on a complex det with a zero pivot
    "l4EigForPlus0": float(null_vec(S_x - 0.5 * I2)[0].real),
    "l4EigForPlus1": float(null_vec(S_x - 0.5 * I2)[1].real),
    "l4EigForMinus1": float(null_vec(S_x + 0.5 * I2)[1].real),
    "l4EigForAgree": flag(same_vec(null_vec(S_x - 0.5 * I2), sxv[0]) and same_vec(null_vec(S_x + 0.5 * I2), sxv[1])),
    "l4HalfFactor": float((kf("+x")[0] * kf("-x")[0]).real),
    "l4Formula": flag(formula4),
    "l4YPlusX": prob(ket("+x"), ket("+y")),
    "l4MeanSx": expect(S_x, psi4),
    "l4MeanSxSum": 0.5 * (prob(ket("+x"), psi4) - prob(ket("-x"), psi4)),
    "l4Prep60XPlus": prep4x[0],
    "l4Prep60XMinus": prep4x[1],
    "l4CentroidX": (prep4x[0] - prep4x[1]) / (prep4x[0] + prep4x[1]),
    "l4TiltEigUp": float(tw[0]),
    "l4TiltEigDown": float(tw[1]),
    "l4TiltVecIsPsi": flag(same_vec(tv[0], psi4)),
    "l4TiltMeanUp": expect(n_sigma(60), kf("+z")),
    "l4TiltAx": pauli_parts(n_sigma(60) / 2)[1],
    "l4TiltAz": pauli_parts(n_sigma(60) / 2)[3],
    "l4TiltLen": float(np.linalg.norm(pauli_parts(n_sigma(60) / 2)[1:])),
    "l4NegSame": flag(same_state(kf("+x"), -kf("+x"))),
    "l4ISame": flag(same_state(kf("+x"), 1j * kf("+x"))),
    "l4CanonI": flag(same_vec(fixed(1j * kf("+x")), kf("+x"))),
    # challenges
    "l4ChMinusXofZ": float(np.vdot(kf("-x"), kf("+z")).real),
    "l4ChXYOverlap": float(abs(np.vdot(kf("+x"), kf("+y")))),
    "l4ChYMinusY": float(abs(np.vdot(kf("+y"), -kf("+y")))),
    "l4ChYes68": expect(Pu4, v68n),
    "l4ChNo68": expect(Pd4, v68n),
    "l4ChTwoFilters": bench("+z", ["x", "z"], ["+"])[0],
    "l4ChTwoFiltersNorm": float(np.linalg.norm(Pu4 @ Ppx4 @ kf("+z")) ** 2),
    "l4ChPxUp0": float((Ppx4 @ kf("+z"))[0].real),
    "l4ChNormalize": prob(ket("+z"), np.array([2, 1]) / np.linalg.norm([2, 1])),
    "l4ChThenX": prob(ket("+x"), after(Pu4, psi4)),
    "l4ChMean68": expect(S_z, v68n),
    "l4ChMean68Size": abs(expect(S_z, v68n)),
    "l4ChYesNoMean": p_up4,
    "l4ChM22": float(S_z[1, 1].real),
    "l4ChNoConjHerm": flag(herm(PYbad)),
    "l4ChNoConjSquare": maxabs(PYbad @ PYbad),
    "l4ChNoConj11": float(PYbad[1, 1].real),
    "l4ChSzInX01": float(in_x(S_z)[0, 1].real),
    "l4ChSx68Plus": prob(ket("+x"), v68n),
    "l4ChSx68Minus": prob(ket("-x"), v68n),
    "l4ChShiftTop": float(a2w[0]),
    "l4ChShiftLow": float(a2w[1]),
    "l4ChShiftVecs": flag(same_vec(a2v[0], kf("+x")) and same_vec(a2v[1], kf("-x"))),
    "l4ChShiftA0": pauli_parts(A2m)[0],
    "l4ChShiftAx": pauli_parts(A2m)[1],
    "l4ChSyIm": float(eig_desc(S_y)[1][0][1].imag),
})


# ---- Lecture 5 -------------------------------------------------------------------------------------
# Independent routes: kets are phase-fixed eigh eigenvectors (never the closed forms); averages are np.vdot sandwiches;
# basis-change matrices are np.column_stack of eigh kets, their inverses np.linalg.inv; characteristic polynomials come
# from np.poly and back-substitution from the SVD null vector; benches propagate Lüders projectors; R_z(φ) is built from
# an eigendecomposition. The "every state / every basis" values run over the same seeded fixture the engine reads
# (numpy.json `basis_changes`, seed 448: a random Hermitian A, state ψ and orthonormal basis each).
fx5 = json.loads((ROOT / "app" / "src" / "physics" / "__fixtures__" / "numpy.json").read_text())["basis_changes"]


def cvec(xs):
    return np.array([complex(x["re"], x["im"]) for x in xs])


def cmat(rows):
    return np.array([[complex(x["re"], x["im"]) for x in r] for r in rows])


FX5 = [(cmat(b["A"]), cvec(b["psi"]), [cvec(v) for v in b["basis"]]) for b in fx5]


def in_b(A, basis):
    B = np.column_stack(basis)
    return B.conj().T @ A @ B


def nsig(n):
    return n[0] * SX + n[1] * SY + n[2] * SZ


def is_diag(M):
    return abs(M[0, 1]) < 1e-9 and abs(M[1, 0]) < 1e-9


psiEx5 = bloch_ket(60 * D, 90 * D)
psi30_5 = bloch_ket(60 * D, 0)
psiT5 = bloch_ket(120 * D, 90 * D)
v68_5 = np.array([0.6, 0.8], complex)
v68i_5 = np.array([0.6, 0.8j])
A12m = np.array([[1, 2], [2, 1]], complex)
ACm = np.array([[2, 1 - 1j], [1 + 1j, 0]])
Nsk = np.column_stack([kf("+z"), kf("+x")])
XB5, YB5, ZB5 = xB2, yB2, zB2
XT5 = [kf("+x"), -kf("-x")]
Bzx5 = np.column_stack(XB5)
Bxz5 = np.linalg.inv(Bzx5)
Bzy5 = np.column_stack(YB5)
Byz5 = np.linalg.inv(Bzy5)
cx30_5 = coords(psi30_5, XB5)
cxZ5 = coords(kf("+z"), XB5)
nEx5 = bloch_vec(psiEx5)
Rz90 = turn(SZ, np.pi / 2)
dirs5 = [[np.sin(t * D) * np.cos(p * D), np.sin(t * D) * np.sin(p * D), np.cos(t * D)] for t in (30, 60, 90, 137) for p in (0, 45, 90, 200)]
dir_eigs = [np.linalg.eigh(nsig(n)) for n in dirs5]
acw, acv = eig_desc(ACm)
a12w, a12v = eig_desc(A12m)
PzX5 = in_b(proj(kf("+z")), XB5)

values.update({
    # l5-averages
    "l5SpecSy": flag(np.allclose(spectrum([0.5, -0.5], [ket("+y"), ket("-y")]), S_y)),
    "l5PyEntry11": float(proj(kf("+y"))[1, 1].real),
    "l5NoConj11": float((kf("+y")[1] * kf("+y")[1]).real),
    "l5SpinHerm": flag(herm(S_x) and herm(S_y) and herm(S_z)),
    "l5SyArrow": pauli_parts(S_y)[2],
    "l5SzAtEveryPhase": worst([expect(S_z, bloch_ket(60 * D, 360 * t * D)) for t in np.linspace(0, 1, 25)], 0.25),
    "l5SxPhi0": expect(S_x, bloch_ket(60 * D, 0)),
    "l5SxPhi180": expect(S_x, bloch_ket(60 * D, 180 * D)),
    "l5CohRuleX": worst([expect(S_x, p) - np.vdot(p[0], p[1]).real for _, p, _ in FX5], 0.0),
    "l5SyPhi90": expect(S_y, bloch_ket(60 * D, 90 * D)),
    "l5SyPhi270": expect(S_y, bloch_ket(60 * D, 270 * D)),
    "l5CohRuleY": worst([expect(S_y, p) - np.vdot(p[0], p[1]).imag for _, p, _ in FX5], 0.0),
    "l5SyReal": worst([float(np.vdot(p, S_y @ p).imag) for _, p, _ in FX5], 0.0),
    "l5PsiExIsNotes": flag(same_vec(psiEx5, np.array([np.sqrt(3) / 2, 0.5j]))),
    "l5PopUp": prob(ket("+z"), psiEx5),
    "l5PopDown": prob(ket("-z"), psiEx5),
    "l5CohExRe": float(np.vdot(psiEx5[0], psiEx5[1]).real),
    "l5CohExIm": float(np.vdot(psiEx5[0], psiEx5[1]).imag),
    "l5MeanSz": expect(S_z, psiEx5),
    "l5MeanSx": expect(S_x, psiEx5),
    "l5MeanSy": expect(S_y, psiEx5),
    "l5SyPsi0": float((S_y @ psiEx5)[0].real),
    "l5SyPsi1Im": float((S_y @ psiEx5)[1].imag),
    "l5BlochX": nEx5[0],
    "l5BlochY": nEx5[1],
    "l5BlochZ": nEx5[2],
    "l5TownsendKet": flag(same_vec(psiT5, np.array([0.5, 1j * np.sqrt(3) / 2]))),
    "l5TownsendAlpha": float(psiT5[0].real),
    "l5TownsendSz": expect(S_z, psiT5),
    "l5SqY": nEx5[1] ** 2,
    "l5SqZ": nEx5[2] ** 2,
    "l5SqSum": float(sum(x * x for x in nEx5)),
    "l5PolarizedEx": prob(eigvec(nsig(nEx5), "+"), psiEx5),
    "l5PolarizedAll": worst([prob(eigvec(nsig(bloch_vec(p)), "+"), p) for _, p, _ in FX5], 1.0),
    "l5YonZ": bench("+y", ["z"], [])[0],
    "l5YonX": bench("+y", ["x"], [])[0],
    "l5OvenZ": bench("oven", ["z"], [])[0],
    "l5PlusYSx": expect(S_x, kf("+y")),
    "l5PlusYSy": expect(S_y, kf("+y")),
    "l5PlusYSz": expect(S_z, kf("+y")),
    "l5PlusYCohIm": float(np.vdot(kf("+y")[0], kf("+y")[1]).imag),
    "l5OvenAvgY": 0.5 * (expect(S_y, np.array([1, 0], complex)) + expect(S_y, np.array([0, 1], complex))),
    "l5MEigHi": float(max(np.linalg.eigvalsh(np.array([[2, 1], [1, 2]], complex)))),
    "l5MEigLo": float(min(np.linalg.eigvalsh(np.array([[2, 1], [1, 2]], complex)))),
    "l5OvenAvg": worst([2 * bench("oven", [t], [])[0] - 1 for t in (0, 45, 90)], 0.0),
    # l5-inverse
    "l5CharPolyLin": float(np.real(np.poly(S_x)[1])),
    "l5CharPolyDet": float(np.real(np.poly(S_x)[2])),
    "l5DetAtPlus": float(abs(np.linalg.det(S_x.real - 0.5 * np.eye(2)))),
    "l5DetAtMinus": float(abs(np.linalg.det(S_x.real + 0.5 * np.eye(2)))),
    "l5SxBackSub": flag(same_vec(null_vec(S_x - 0.5 * I2), kf("+x")) and same_vec(null_vec(S_x + 0.5 * I2), kf("-x"))),
    "l5XOrth": float(abs(np.vdot(kf("+x"), kf("-x")))),
    "l5XNorms": worst([float(np.linalg.norm(kf("+x"))), float(np.linalg.norm(kf("-x")))], 1.0),
    "l5ComplX": flag(np.allclose(proj(kf("+x")) + proj(kf("-x")), I2)),
    "l5SyHerm": flag(herm(S_y)),
    "l5DirEigUp": worst([float(max(w)) for w, _ in dir_eigs], 1.0),
    "l5DirEigDown": worst([float(min(w)) for w, _ in dir_eigs], -1.0),
    "l5DirOrth": worst([float(abs(np.vdot(v[:, 0], v[:, 1]))) for _, v in dir_eigs], 0.0),
    "l5DirExUp": float(max(np.linalg.eigvalsh(nsig(nEx5)))),
    "l5DirExIsPsi": flag(same_state(eigvec(nsig(nEx5), "+"), psiEx5)),
    "l5AHerm": flag(herm(ACm)),
    "l5AA0": pauli_parts(ACm)[0],
    "l5AAx": pauli_parts(ACm)[1],
    "l5AAy": pauli_parts(ACm)[2],
    "l5AAz": pauli_parts(ACm)[3],
    "l5AEigUp": float(acw[0]),
    "l5AEigDown": float(acw[1]),
    "l5AEigDownSize": float(abs(acw[1])),
    "l5MinusXNegSame": flag(same_state(kf("-x"), -kf("-x"))),
    "l5SzInXOff": float(in_b(S_z, XB5)[0, 1].real),
    "l5SzInXTOff": float(in_b(S_z, XT5)[0, 1].real),
    # l5-coordinates
    "l5Psi30Up": prob(ket("+z"), psi30_5),
    "l5Psi30Down": prob(ket("-z"), psi30_5),
    "l5Psi30Beta": float(psi30_5[1].real),
    "l5Psi30U": float(cx30_5[0].real),
    "l5Psi30V": float(cx30_5[1].real),
    "l5Psi30XUp": prob(ket("+x"), psi30_5),
    "l5Psi30XDown": prob(ket("-x"), psi30_5),
    "l5RebuildAlpha": float((cx30_5[0].real + cx30_5[1].real) / np.sqrt(2)),
    "l5RebuildBeta": float((cx30_5[0].real - cx30_5[1].real) / np.sqrt(2)),
    "l5BzxEntries": flag(np.allclose(Bzx5, np.array([[1, 1], [1, -1]]) / np.sqrt(2))),
    "l5BzxIsColumns": flag(np.allclose(Bzx5 @ np.array([1, 0]), kf("+x")) and np.allclose(Bzx5 @ np.array([0, 1]), kf("-x"))),
    "l5Rebuild": flag(same_vec(Bzx5 @ cx30_5, psi30_5)),
    "l5BzxUnitary": flag(np.allclose(Bzx5.conj().T @ Bzx5, I2)),
    "l5BxzIsDagger": flag(np.allclose(Bxz5, Bzx5.conj().T)),
    "l5UIsBra": flag(abs(cx30_5[0] - np.vdot(kf("+x"), psi30_5)) < 1e-12 and abs(cx30_5[1] - np.vdot(kf("-x"), psi30_5)) < 1e-12),
    "l5Cx30Norm": float(np.linalg.norm(cx30_5)),
    "l5ZcxU": float(cxZ5[0].real),
    "l5ZcxV": float(cxZ5[1].real),
    "l5ZonXPlus": prob(ket("+x"), ket("+z")),
    "l5XinX": flag(same_vec(coords(kf("+x"), XB5), np.array([1, 0]))),
    "l5Bzx01": float(np.vdot(kf("+z"), kf("-x")).real),
    "l5Bzx11": float(np.vdot(kf("-z"), kf("-x")).real),
    "l5BzxOverlaps": flag(all(abs(Bzx5[j, k] - np.vdot(ZB5[j], XB5[k])) < 1e-12 for j in (0, 1) for k in (0, 1))),
    "l5BxSym": flag(np.allclose(Bzx5, Bxz5)),
    "l5BySym": flag(np.allclose(Bzy5, Byz5)),
    "l5Bzy10Im": float(Bzy5[1, 0].imag),
    "l5Byz01Im": float(Byz5[0, 1].imag),
    "l5SkewUnitary": flag(np.allclose(Nsk.conj().T @ Nsk, I2)),
    "l5SkewDagger1": float((Nsk.conj().T @ kf("+z"))[1].real),
    "l5SkewInvOk": flag(same_vec(np.linalg.inv(Nsk) @ kf("+z"), np.array([1, 0]))),
    # l5-operators
    "l5SzArrowZ": pauli_parts(S_z)[3],
    "l5ActConvert": worst([float(np.linalg.norm(coords(A @ p, bs) - in_b(A, bs) @ coords(p, bs))) for A, p, b in FX5 for bs in (XB5, YB5, b)], 0.0),
    "l5ActConvertAny": worst(
        [float(np.linalg.norm(coords(M @ p, bs) - in_b(M, bs) @ coords(p, bs))) for A, p, b in FX5 for M in [A @ np.column_stack(b)] for bs in (XB5, YB5, b)], 0.0
    ),
    "l5AnyNotHerm": flag(all(not herm(A @ np.column_stack(b)) for A, _, b in FX5)),
    "l5SxInX00": float(in_b(S_x, XB5)[0, 0].real),
    "l5SxInX11": float(in_b(S_x, XB5)[1, 1].real),
    "l5SxInXDiag": flag(np.allclose(in_b(S_x, XB5), np.diag([0.5, -0.5]))),
    "l5ABeqBD": flag(np.allclose(S_x @ Bzx5, Bzx5 @ np.diag([0.5, -0.5]))),
    "l5DiagAll": worst([maxabs(in_b(A, eig_desc(A)[1]) - np.diag(eig_desc(A)[0])) for A, _, _ in FX5], 0.0),
    "l5SzInXIsSx": flag(np.allclose(in_b(S_z, XB5), S_x)),
    "l5SxInXIsSz": flag(np.allclose(in_b(S_x, XB5), S_z)),
    "l5TownsendPlusZ1": float(coords(kf("+z"), XT5)[1].real),
    "l5TownsendMean": expect(in_b(S_z, XT5), coords(kf("+z"), XT5)),
    "l5OurMean": expect(in_b(S_z, XB5), cxZ5),
    "l5SyInY00": float(in_b(S_y, YB5)[0, 0].real),
    "l5SyInYDiag": flag(np.allclose(in_b(S_y, YB5), np.diag([0.5, -0.5]))),
    "l5ByUnitary": flag(np.allclose(Bzy5.conj().T @ Bzy5, I2)),
    # l5-invariance
    "l5ZMeanInX": expect(in_b(S_z, XB5), cxZ5),
    "l5ZMeanInZ": expect(S_z, kf("+z")),
    "l5PzInX00": float(PzX5[0, 0].real),
    "l5PzInXAll": flag(np.allclose(PzX5, 0.5 * np.ones((2, 2)))),
    "l5PzInXProb": expect(PzX5, cxZ5),
    "l5ZVarInX": var(in_b(S_z, XB5), cxZ5),
    "l5Psi30Mean": expect(S_z, psi30_5),
    "l5Psi30MeanX": expect(in_b(S_z, XB5), cx30_5),
    "l5BBdagger": flag(np.allclose(Bzx5 @ Bzx5.conj().T, I2)),
    "l5InvarAll": worst([expect(in_b(A, bs), coords(p, bs)) - expect(A, p) for A, p, b in FX5 for bs in (XB5, YB5, b)], 0.0),
    "l5EigenEqInX": flag(same_vec(in_b(S_z, XB5) @ cxZ5, 0.5 * cxZ5)),
    "l5XMeanZInX": expect(in_b(S_z, XB5), np.array([1, 0], complex)),
    "l5XMeanZ": expect(S_z, kf("+x")),
    "l5MixedWrong": expect(S_z, cxZ5),
    "l5RzUnitary": flag(np.allclose(Rz90.conj().T @ Rz90, I2)),
    "l5RzXtoY": flag(same_state(Rz90 @ kf("+x"), kf("+y"))),
    "l5RzXProb": prob(ket("+x"), Rz90 @ kf("+x")),
    "l5XX": prob(ket("+x"), ket("+x")),
    # challenges
    "l5ChPopUp": prob(ket("+z"), v68i_5),
    "l5ChPopDown": prob(ket("-z"), v68i_5),
    "l5ChPopDiff": prob(ket("+z"), v68i_5) - prob(ket("-z"), v68i_5),
    "l5ChPopDiffSize": abs(prob(ket("+z"), v68i_5) - prob(ket("-z"), v68i_5)),
    "l5ChSz": expect(S_z, v68i_5),
    "l5ChSzSize": abs(expect(S_z, v68i_5)),
    "l5ChSy": expect(S_y, v68i_5),
    "l5ChSxI": expect(S_x, v68i_5),
    "l5ChSxReal": expect(S_x, v68_5),
    "l5ChSxGlobal": expect(S_x, np.exp(1j) * v68_5),
    "l5ChSzSwap": expect(S_z, np.array([0.8, 0.6], complex)),
    "l5ChMissingSy": expect(S_y, bloch_ket(90 * D, 60 * D)),
    "l5ChMissingSx": expect(S_x, bloch_ket(90 * D, 60 * D)),
    "l5ChMissingSz": expect(S_z, bloch_ket(90 * D, 60 * D)),
    "l5ChInvTop": float(a12w[0]),
    "l5ChInvLow": float(a12w[1]),
    "l5ChInvLowSize": float(abs(a12w[1])),
    "l5ChInvVec0": float(null_vec(A12m + I2)[0].real),
    "l5ChInvVec1": float(null_vec(A12m + I2)[1].real),
    "l5ChInvBackSub": flag(same_vec(null_vec(A12m + I2), a12v[1]) and same_vec(null_vec(A12m - 3 * I2), a12v[0])),
    "l5ChInvCharLin": float(np.real(np.poly(A12m)[1])),
    "l5ChInvCharDet": float(np.real(np.poly(A12m)[2])),
    "l5ChACharLin": float(np.real(np.poly(ACm)[1])),
    "l5ChACharDet": float(np.real(np.poly(ACm)[2])),
    "l5ChCoU": float(coords(v68_5, XB5)[0].real),
    "l5ChCoV": float(coords(v68_5, XB5)[1].real),
    "l5ChCoVSize": float(abs(coords(v68_5, XB5)[1].real)),
    "l5ChCoProbMinus": prob(ket("-x"), v68_5),
    "l5ChCoProbPlus": prob(ket("+x"), v68_5),
    "l5ChByzIsDagger": flag(np.allclose(Byz5, Bzy5.conj().T) and np.allclose(Byz5, np.array([[1, -1j], [1, 1j]]) / np.sqrt(2))),
    "l5ChSkewQ": float((np.linalg.inv(Nsk) @ kf("-z"))[1].real),
    "l5ChSkewP": float((np.linalg.inv(Nsk) @ kf("-z"))[0].real),
    "l5ChSkewDagger": float((Nsk.conj().T @ kf("-z"))[1].real),
    "l5ChOpTop": float(in_b(A12m, XB5)[0, 0].real),
    "l5ChOpDiag": flag(np.allclose(in_b(A12m, XB5), np.diag([3, -1]))),
    "l5ChSyInX01Im": float(in_b(S_y, XB5)[0, 1].imag),
    "l5ChSyInXIsMinusSy": flag(np.allclose(in_b(S_y, XB5), -S_y)),
    "l5ChSxInY": flag(not is_diag(in_b(S_x, YB5)) and not is_diag(in_b(S_z, YB5))),
    "l5ChSxInYIsSy": flag(np.allclose(in_b(S_x, YB5), S_y)),
    "l5ChSzInYIsSx": flag(np.allclose(in_b(S_z, YB5), S_x)),
    "l5ChSxInXMean": expect(in_b(S_x, XB5), cx30_5),
    "l5ChSxInZMean": expect(S_x, psi30_5),
    "l5ChByBy": flag(np.allclose(Bzy5 @ Bzy5, I2)),
    "l5ChBBdagY": flag(np.allclose(Bzy5 @ Bzy5.conj().T, I2)),
    "l5ChYBasisProb": expect(in_b(proj(kf("+x")), YB5), coords(psiEx5, YB5)),
    "l5ChYBasisProbZ": prob(ket("+x"), psiEx5),
    "l5ChPsiExY": prob(ket("+y"), psiEx5),
    "l5ChPsiExMinusY": prob(ket("-y"), psiEx5),
})

# ---- Lecture 6 -------------------------------------------------------------------------------------
# Independent routes: states are phase-fixed eigh eigenvectors of n·σ (never ketFromBloch); Bloch vectors are ⟨σ⟩ from
# np.vdot sandwiches; angles come from np.angle of α*β and 2·arccos|α| (the engine uses atan2 and acos of r);
# R_z(φ) and turns about any axis are e^{−iφσ/2} from an eigendecomposition; matrix exponentials use np.linalg.eig
# (never the engine's cosh/sinh closed form); partial sums use matrix_power/k! (the engine builds T_k = T_{k−1}M/k);
# compound turns use np.linalg.matrix_power; the SO(3) check is Rodrigues' formula in numpy; mixtures are density
# matrices Σw|ψ⟩⟨ψ| with r_k = tr(ρσ_k), purity tr ρ², odds tr(ρP) with a Lüders projector, and the best odds the
# largest eigenvalue of ρ; benches use the Lüders propagation above; the 90 % angle is found by bisection.
import math  # noqa: E402


def expm_eig(M):
    w, v = np.linalg.eig(M)
    return v @ np.diag(np.exp(w)) @ np.linalg.inv(v)


def gap(A, B):
    return float(np.max(np.abs(np.asarray(A) - np.asarray(B))))


def unit3(n):
    n = np.array(n, float)
    return n / np.linalg.norm(n)


def rot(n, phi):
    return turn(nsig(unit3(n)), phi)


def rz(phi):
    return turn(SZ, phi)


def angles(psi):
    """(θ, φ) in radians from the amplitudes: θ = 2 arccos|α|, φ = arg(α*β)."""
    psi = psi / np.linalg.norm(psi)
    return 2 * np.arccos(min(1.0, abs(psi[0]))), float(np.angle(np.conj(psi[0]) * psi[1]))


def rodrigues(n, phi, r):
    k = unit3(n)
    r = np.array(r, float)
    return r * np.cos(phi) + np.cross(k, r) * np.sin(phi) + k * np.dot(k, r) * (1 - np.cos(phi))


def rho_mix(parts):
    return sum(w * proj(p / np.linalg.norm(p)) for w, p in parts)


def r_of_rho(rho):
    return [float(np.real(np.trace(rho @ P))) for P in (SX, SY, SZ)]


def odds(rho, n):
    return float(np.real(np.trace(proj(eigvec(nsig(unit3(n)), "+")) @ rho)))


def tiltv(deg):
    return [np.sin(deg * D), 0.0, np.cos(deg * D)]


def len3(r):
    return float(np.linalg.norm(r))


def coh6(p):
    return np.conj(p[0]) * p[1]


psiS6 = bloch_ket(60 * D, 45 * D)
psi60_6 = bloch_ket(60 * D, 0)
psi45_6 = bloch_ket(90 * D, 45 * D)
psi120_6 = bloch_ket(90 * D, 120 * D)
psi30eq6 = bloch_ket(90 * D, 30 * D)
XB6 = [kf("+x"), kf("-x")]
rS6 = bloch_vec(psiS6)
rz90x6 = rz(np.pi / 2) @ kf("+x")
rz90p60 = rz(np.pi / 2) @ psi60_6
mhat6 = [1.0, 0.0, 1.0]
half6 = rot(mhat6, np.pi)
Bzx6 = np.column_stack(XB6)
Mq6 = -1j * (np.pi / 2) * S_z


def seriesErr6(K):
    return gap(sum(np.linalg.matrix_power(Mq6, k) / math.factorial(k) for k in range(K + 1)), expm_eig(Mq6))


def small6(phi):
    return I2 - 1j * phi * S_z


def compound6(N):
    return gap(np.linalg.matrix_power(small6(np.pi / 2 / N), N), rz(np.pi / 2))


h6 = 1e-6
rateEx6 = -1j * S_z @ kf("+x")
rateFd6 = (rz(h6) @ kf("+x") - kf("+x")) / h6


def vel6(psi):
    a, b = bloch_vec(rz(h6) @ psi), bloch_vec(rz(-h6) @ psi)
    return (np.array(a) - np.array(b)) / (2 * h6)


w01_6 = small6(0.1)[0, 0]
so3_cases = [([0, 0, 1], 90 * D, psi60_6), ([0, 0, 1], 37 * D, psiS6), ([0.3, 0.5, 0.8], 2.2, psi60_6), ([0.3, 0.5, 0.8], 2.2, psiS6), (mhat6, np.pi, psiS6)]
theta90_6 = bisect(lambda t: prob(kf("+z"), bloch_ket(t, 0)) - 0.9, 0.1, 1.5, tol=1e-15)
v68_6 = np.array([0.6, 0.8], complex)
v68i_6 = np.array([0.6, 0.8j])
vPh6 = np.array([1 + 1j, 2]) / np.linalg.norm([1 + 1j, 2])
anti6 = eigvec(nsig(-np.array(rS6)), "+")
avgPsi6 = bloch_ket(90 * D, np.arctan2(0.8, 0.6))
avgTurn6 = rz(np.pi / 2) @ avgPsi6
rhoOvenZ = rho_mix([(0.5, kf("+z")), (0.5, kf("-z"))])
rhoOvenX = rho_mix([(0.5, kf("+x")), (0.5, kf("-x"))])
rhoZX = rho_mix([(0.5, kf("+z")), (0.5, kf("+x"))])
rhoT55 = rho_mix([(0.5, kf("+z")), (0.5, kf("-x"))])
rhoTurn = rho_mix([(0.5, rz(np.pi / 2) @ kf("+z")), (0.5, rz(np.pi / 2) @ kf("+x"))])
rhoOvenTurn = rho_mix([(0.5, rz(np.pi / 2) @ kf("+x")), (0.5, rz(np.pi / 2) @ kf("-x"))])
axes6 = [[1, 0, 0], [0, 1, 0], [0, 0, 1], tiltv(45), tiltv(-120), [0.3, 0.5, 0.8]]
sup6 = (kf("+z") + kf("+x")) / np.linalg.norm(kf("+z") + kf("+x"))
eq6 = ["+x", "+y", "-x", "-y"]
six6 = {"+z": [0, 0, 1], "-z": [0, 0, -1], "+x": [1, 0, 0], "-x": [-1, 0, 0], "+y": [0, 1, 0], "-y": [0, -1, 0]}
fx6 = [p / np.linalg.norm(p) for _, p, _ in FX5]
szE6, szV6 = eig_desc(S_z)

values.update({
    # l6-bloch
    "l6RStarX": rS6[0],
    "l6RStarY": rS6[1],
    "l6RStarZ": rS6[2],
    "l6AvgStarX": expect(S_x, psiS6),
    "l6AvgStarY": expect(S_y, psiS6),
    "l6AvgStarZ": expect(S_z, psiS6),
    "l6CohStarRe": float(coh6(psiS6).real),
    "l6CohStarIm": float(coh6(psiS6).imag),
    "l6PopStarUp": prob(kf("+z"), psiS6),
    "l6PopStarDown": prob(kf("-z"), psiS6),
    "l6UnitSphere": worst([len3(bloch_vec(bloch_ket(t * D, 45 * D))) for t in range(0, 181, 30)] + [len3(bloch_vec(p)) for p in fx6], 1.0),
    "l6UnitCross": 4 * prob(kf("+z"), psiS6) * prob(kf("-z"), psiS6),
    "l6UnitHeight": (prob(kf("+z"), psiS6) - prob(kf("-z"), psiS6)) ** 2,
    "l6SixPoints": flag(all(np.allclose(bloch_vec(kf(k)), a, atol=1e-12) for k, a in six6.items())),
    "l6PzRule": prob(kf("+z"), psiS6),
    "l6PzRuleBorn": flag(abs(odds(proj(psiS6), [0, 0, 1]) - prob(kf("+z"), psiS6)) < 1e-12),
    "l6TwoTheta": float(np.degrees(angles(psiS6)[0])),
    "l6TwoPhi": float(np.degrees(angles(psiS6)[1])),
    "l6TwoRecover": flag(same_state(bloch_ket(*angles(np.exp(1j) * psiS6)), np.exp(1j) * psiS6)),
    "l6Polarized": prob(eigvec(nsig(rS6), "+"), psiS6),
    "l6PolarizedMean": expect(nsig(unit3(rS6)) / 2, psiS6),
    "l6TownsendN": flag(same_vec(psiS6, np.array([np.cos(np.pi / 6), np.exp(1j * np.pi / 4) * np.sin(np.pi / 6)]))),
    "l6ZOrth": float(abs(np.vdot(kf("+z"), kf("-z")))),
    "l6NegSame": flag(same_state(kf("+z"), -kf("+z"))),
    "l6NegSameZ": bloch_vec(-kf("+z"))[2],
    "l6Theta90": float(np.degrees(theta90_6)),
    "l6Theta90P": worst([prob(kf("+z"), bloch_ket(theta90_6, p * D)) for p in (0, 90, 200)], 0.9),
    "l6HeightAt60": worst([bloch_vec(bloch_ket(60 * D, p * D))[2] for p in range(0, 331, 30)], 0.5),
    # l6-equator
    "l6EqHalf": worst([prob(kf("+z"), kf(k)) for k in eq6], 0.5),
    "l6PhaseX": float(np.degrees(angles(kf("+x"))[1])),
    "l6PhaseY": float(np.degrees(angles(kf("+y"))[1])),
    "l6PhaseMinusX": float(np.degrees(angles(kf("-x"))[1])),
    "l6PhaseMinusY": float(np.degrees(angles(kf("-y"))[1])),
    "l6Psi45Alpha": float(psi45_6[0].real),
    "l6Psi45BetaRe": float(psi45_6[1].real),
    "l6Psi45BetaIm": float(psi45_6[1].imag),
    "l6Psi45Rx": bloch_vec(psi45_6)[0],
    "l6Psi45Ry": bloch_vec(psi45_6)[1],
    "l6Psi45Rz": bloch_vec(psi45_6)[2],
    "l6UnitFactor": float(abs(psi45_6[1] / kf("+x")[1])),
    "l6Psi45Pz": prob(kf("+z"), psi45_6),
    "l6Avg45X": expect(S_x, psi45_6),
    "l6Avg45Y": expect(S_y, psi45_6),
    "l6Avg45Z": expect(S_z, psi45_6),
    "l6Coh45Re": float(coh6(psi45_6).real),
    "l6Coh45Im": float(coh6(psi45_6).imag),
    "l6EqAnyX": bloch_vec(psi120_6)[0],
    "l6EqAnyXSize": abs(bloch_vec(psi120_6)[0]),
    "l6EqAnyY": bloch_vec(psi120_6)[1],
    "l6EqAnyZ": bloch_vec(psi120_6)[2],
    "l6AzimuthIsPhase": worst([float(np.arctan2(bloch_vec(bloch_ket(90 * D, p * D))[1], bloch_vec(bloch_ket(90 * D, p * D))[0])) - p * D for p in range(0, 181, 45)], 0.0),
    "l6ArgIsPhase": worst([angles(bloch_ket(90 * D, p * D))[1] - p * D for p in range(0, 181, 45)], 0.0),
    "l6YFromPhase": flag(same_state(bloch_ket(90 * D, 90 * D), kf("+y"))),
    "l6YX": prob(kf("+y"), kf("+x")),
    "l6CohYRe": float(coh6(kf("+y")).real),
    "l6CohYIm": float(coh6(kf("+y")).imag),
    "l6PlusYRx": bloch_vec(kf("+y"))[0],
    "l6PlusYRy": bloch_vec(kf("+y"))[1],
    "l6GlobalX": bloch_vec(1j * psi120_6)[0],
    "l6GlobalY": bloch_vec(1j * psi120_6)[1],
    "l6GlobalSame": flag(all(same_state(np.exp(1j * x * D) * psi120_6, psi120_6) and np.allclose(bloch_vec(np.exp(1j * x * D) * psi120_6), bloch_vec(psi120_6), atol=1e-12) for x in range(0, 361, 30))),
    "l6PlusXAlongZ": bench("+x", ["z"], [])[0],
    "l6OvenAlongZ": bench("oven", ["z"], [])[0],
    "l6PlusXAlongX": bench("+x", ["x"], [])[0],
    "l6OvenAlongX": bench("oven", ["x"], [])[0],
    "l6BetaY": float(kf("+y")[1].imag),
    # l6-active
    "l6PassiveU": float(coords(psi60_6, XB6)[0].real),
    "l6PassiveV": float(coords(psi60_6, XB6)[1].real),
    "l6PassiveMeanX": expect(in_b(S_z, XB6), coords(psi60_6, XB6)),
    "l6PassiveMeanZ": expect(S_z, psi60_6),
    "l6ActiveRx": bloch_vec(rz90x6)[0],
    "l6ActiveRy": bloch_vec(rz90x6)[1],
    "l6DiagTurns": float(np.degrees(angles(np.diag([1, np.exp(1j * 60 * D)]) @ psi30eq6)[1])),
    "l6RzEven": flag(np.allclose(rz(1.0), np.exp(-0.5j) * np.diag([1, np.exp(1j)]), atol=1e-12)),
    "l6RzSameState": flag(same_state(rz(60 * D) @ psi30eq6, np.diag([1, np.exp(1j * 60 * D)]) @ psi30eq6)),
    "l6Rz90xRe": float(np.vdot(kf("+y"), rz90x6).real),
    "l6Rz90xIm": float(np.vdot(kf("+y"), rz90x6).imag),
    "l6Rz90xImSize": float(abs(np.vdot(kf("+y"), rz90x6).imag)),
    "l6Rz90xState": flag(same_state(rz90x6, kf("+y"))),
    "l6RzProps": flag(np.allclose(rz(0), I2) and np.allclose(rz(1.3).conj().T @ rz(1.3), I2) and np.allclose(rz(-1.3), rz(1.3).conj().T) and np.allclose(rz(60 * D) @ rz(30 * D), rz(90 * D))),
    "l6Psi60Rx": bloch_vec(psi60_6)[0],
    "l6Psi60Rz": bloch_vec(psi60_6)[2],
    "l6TurnedRx": bloch_vec(rz90p60)[0],
    "l6TurnedRy": bloch_vec(rz90p60)[1],
    "l6SzKept": worst([expect(S_z, rz(p * D) @ psi60_6) for p in range(0, 91, 15)], 0.25),
    "l6PyBefore": prob(kf("+y"), psi60_6),
    "l6PyAfter": prob(kf("+y"), rz90p60),
    "l6SyAfter": expect(S_y, rz90p60),
    "l6So3": worst([len3(rodrigues(n, phi, bloch_vec(psi)) - np.array(bloch_vec(rot(n, phi) @ psi))) for n, phi, psi in so3_cases], 0.0),
    "l6Rz180xRe": float(np.vdot(kf("-x"), rz(np.pi) @ kf("+x")).real),
    "l6Rz180xIm": float(np.vdot(kf("-x"), rz(np.pi) @ kf("+x")).imag),
    "l6Rz180xState": flag(same_state(rz(np.pi) @ kf("+x"), kf("-x"))),
    "l6RzPlusZRe": float((rz(np.pi / 2) @ kf("+z"))[0].real),
    "l6RzPlusZIm": float((rz(np.pi / 2) @ kf("+z"))[0].imag),
    "l6RzPlusZState": flag(all(same_state(rz(p * D) @ kf("+z"), kf("+z")) for p in range(0, 181, 15))),
    "l6SuperMoves": flag(same_state(rz90p60, psi60_6)),
    "l6SuperOverlap": prob(psi60_6, rz90p60),
    "l6DetB": float(np.linalg.det(Bzx6.real)),  # B is real; numpy warns spuriously on the complex det (as in L4)
    "l6DetRz": float(np.linalg.det(rz(1.2)).real),
    "l6BIsHalfTurn": flag(np.allclose(Bzx6, 1j * half6, atol=1e-12)),
    "l6BArrowX": pauli_parts(Bzx6)[1],
    "l6BArrowZ": pauli_parts(Bzx6)[3],
    "l6PassiveIsActive": flag(same_state(coords(psiS6, XB6), half6 @ psiS6)),
    "l6HalfTurnZ": bloch_vec(half6 @ kf("+z"))[0],
    "l6HalfTurnY": bloch_vec(half6 @ kf("+y"))[1],
    # l6-generator
    "l6SeriesErr1": seriesErr6(1),
    "l6SeriesErr2": seriesErr6(2),
    "l6SeriesErr3": seriesErr6(3),
    "l6SeriesErr5": seriesErr6(5),
    "l6SeriesErr10": seriesErr6(10),
    "l6SeriesLimit": flag(gap(expm_eig(Mq6), rz(np.pi / 2)) < 1e-12),
    "l6ExpDiagTop": float((-1j * 1.2 * S_z)[0, 0].imag),
    "l6ExpDiagTopSize": float(abs((-1j * 1.2 * S_z)[0, 0].imag)),
    "l6ExpDiagBottom": float((-1j * 1.2 * S_z)[1, 1].imag),
    "l6ExpAngle": float(2 * np.angle(rz(1.2)[1, 1])),
    "l6ExpIsRz": flag(gap(expm_eig(-1j * 1.2 * S_z), rz(1.2)) < 1e-12),
    "l6SzEigUp": float(szE6[0]),
    "l6SzEigDown": float(szE6[1]),
    "l6SzEigVecs": flag(same_state(szV6[0], kf("+z")) and same_state(szV6[1], kf("-z"))),
    "l6PolesFixed": flag(same_state(rz(1.2) @ kf("+z"), kf("+z")) and same_state(rz(1.2) @ kf("-z"), kf("-z"))),
    "l6LinErr01": gap(rz(0.1), small6(0.1)),
    "l6LinRatio": gap(rz(0.1), small6(0.1)) / gap(rz(0.01), small6(0.01)),
    "l6RateTopIm": float(rateEx6[0].imag),
    "l6RateTopImSize": float(abs(rateEx6[0].imag)),
    "l6RateBottomIm": float(rateEx6[1].imag),
    "l6RateFd": flag(np.linalg.norm(rateFd6 - rateEx6) < 1e-5),
    "l6GenIsSz": flag(gap(1j * (rz(1e-5) - rz(-1e-5)) / 2e-5, S_z) < 1e-9),
    "l6BlochVelY": float(np.cross([0, 0, 1], bloch_vec(kf("+x")))[1]),
    "l6BlochVelFd": flag(np.linalg.norm(vel6(kf("+x")) - np.array([0, 1, 0])) < 1e-6),
    "l6Compound1": compound6(1),
    "l6Compound10": compound6(10),
    "l6Compound100": compound6(100),
    "l6Compound1000": compound6(1000),
    "l6EvolveIsRz": flag(gap(expm_eig(-1j * 1.2 * S_z), rz(1.2)) < 1e-12),
    "l6NoI": float(np.linalg.norm((I2 + 0.1 * S_z) @ kf("+z"))),
    "l6WithI": float(np.linalg.norm(small6(0.1) @ kf("+z"))),
    "l6WIm": float(w01_6.imag),
    "l6WImSize": float(abs(w01_6.imag)),
    "l6WSize": float(abs(w01_6)),
    "l6WAngle": float(np.degrees(np.angle(w01_6))),
    "l6WHalfStep": float(np.degrees(np.angle(rz(0.1)[0, 0]))),
    "l6BetaByI": float(rz(np.pi)[1, 1].imag),
    "l6AlphaByMinusI": float(rz(np.pi)[0, 0].imag),
    # l6-mixture
    "l6BallPlusX": bloch_vec(kf("+x"))[0],
    "l6BallOvenLen": len3(r_of_rho(rhoOvenZ)),
    "l6BallP60Pure": odds(proj(kf("+x")), tiltv(60)),
    "l6BallP60Oven": odds(rhoOvenZ, tiltv(60)),
    "l6RecipesLen": worst([len3(r_of_rho(rhoOvenZ)), len3(r_of_rho(rhoOvenX))], 0.0),
    "l6RecipesP": worst([odds(r, n) for n in axes6 for r in (rhoOvenZ, rhoOvenX)], 0.5),
    "l6MixZXx": r_of_rho(rhoZX)[0],
    "l6MixZXz": r_of_rho(rhoZX)[2],
    "l6MixZXLen": len3(r_of_rho(rhoZX)),
    "l6MixZXPurity": float(np.real(np.trace(rhoZX @ rhoZX))),
    "l6MixZXPurityRho": float(np.real(np.trace(rhoZX @ rhoZX))),
    "l6SupZXx": bloch_vec(sup6)[0],
    "l6SupZXz": bloch_vec(sup6)[2],
    "l6T55X": r_of_rho(rhoT55)[0],
    "l6T55XSize": abs(r_of_rho(rhoT55)[0]),
    "l6T55Z": r_of_rho(rhoT55)[2],
    "l6T55Sx": float(np.real(np.trace(rhoT55 @ S_x))),
    "l6T55Purity": float(np.real(np.trace(rhoT55 @ rhoT55))),
    "l6OvenPurity": float(np.real(np.trace(rhoOvenZ @ rhoOvenZ))),
    "l6T55Px": odds(rhoT55, [1, 0, 0]),
    "l6MixTurnX": r_of_rho(rhoTurn)[0],
    "l6MixTurnY": r_of_rho(rhoTurn)[1],
    "l6MixTurnZ": r_of_rho(rhoTurn)[2],
    "l6MixTurnLen": len3(r_of_rho(rhoTurn)),
    "l6OvenTurned": len3(r_of_rho(rhoOvenTurn)),
    "l6FilterX": bench("oven", ["x", "x"], ["+"])[0],
    "l6FilterXMinus": bench("oven", ["x", "x"], ["+"])[1],
    "l6FilterTilt": bench("oven", ["x", 60], ["+"])[0],
    # challenges
    "l6ChPopUp": prob(kf("+z"), v68_6),
    "l6ChPopDown": prob(kf("-z"), v68_6),
    "l6ChRz": bloch_vec(v68_6)[2],
    "l6ChRzSize": abs(bloch_vec(v68_6)[2]),
    "l6ChTheta": float(np.degrees(angles(v68_6)[0])),
    "l6ChHalfTheta": float(np.degrees(angles(v68_6)[0]) / 2),
    "l6ChAlphaBack": float(np.cos(angles(v68_6)[0] / 2)),
    "l6ChPhi": float(np.degrees(angles(v68i_6)[1])),
    "l6ChThetaI": float(np.degrees(angles(v68i_6)[0])),
    "l6ChCohIm": float(coh6(v68i_6).imag),
    "l6ChRy": bloch_vec(v68i_6)[1],
    "l6ChPy": prob(kf("+y"), v68i_6),
    "l6ChOpp": prob(anti6, psiS6),
    "l6ChOppPz": prob(kf("+z"), anti6),
    "l6ChOppTrap": prob(-psiS6, psiS6),
    "l6ChDisguise": flag(same_state(np.array([1j, 1]) / np.sqrt(2), kf("-y"))),
    "l6ChDisguiseWrong": flag(same_state(np.array([-1j, 1]) / np.sqrt(2), kf("+y"))),
    "l6ChPhase": float(np.degrees(angles(vPh6)[1])),
    "l6ChPhaseRx": bloch_vec(vPh6)[0],
    "l6ChPhaseRy": bloch_vec(vPh6)[1],
    "l6ChPhaseRz": bloch_vec(vPh6)[2],
    "l6ChPhaseRzSize": abs(bloch_vec(vPh6)[2]),
    "l6ChPx": prob(kf("+x"), bloch_ket(90 * D, 60 * D)),
    "l6ChPxRx": bloch_vec(bloch_ket(90 * D, 60 * D))[0],
    "l6ChActPx": prob(kf("+x"), rz(60 * D) @ psi60_6),
    "l6ChActRx": bloch_vec(rz(60 * D) @ psi60_6)[0],
    "l6ChActRy": bloch_vec(rz(60 * D) @ psi60_6)[1],
    "l6ChActBefore": prob(kf("+x"), psi60_6),
    "l6ChMinusY": float(np.degrees(angles(kf("-y"))[1]) % 360),
    "l6ChMinusYOk": flag(same_state(rz(270 * D) @ kf("+x"), kf("-y")) and same_state(rz(90 * D) @ kf("+x"), kf("+y"))),
    "l6ChRotAvgX": expect(S_x, avgTurn6),
    "l6ChRotAvgXSize": abs(expect(S_x, avgTurn6)),
    "l6ChRotAvgY": expect(S_y, avgTurn6),
    "l6ChRotBeforeX": expect(S_x, avgPsi6),
    "l6ChRotBeforeY": expect(S_y, avgPsi6),
    "l6ChExpDiag": float(expm_eig(np.diag([0, 1j * np.pi]))[1, 1].real),
    "l6ChLeftover": gap(rz(0.2), small6(0.2)),
    "l6ChLeftExactRe": float(rz(0.2)[0, 0].real),
    "l6ChLeftExactImSize": float(abs(rz(0.2)[0, 0].imag)),
    "l6ChVelX": float(np.cross([0, 0, 1], bloch_vec(kf("+y")))[0]),
    "l6ChVelFd": flag(np.linalg.norm(vel6(kf("+y")) - np.array([-1, 0, 0])) < 1e-6),
    "l6ChCertain": float(np.max(np.linalg.eigvalsh(rhoZX))),
    "l6ChOneMagnet": bench("+x", ["x"], [])[0] - bench("oven", ["x"], [])[0],
    "l6ChBestTilt": float(np.degrees(np.arctan2(r_of_rho(rhoT55)[0], r_of_rho(rhoT55)[2]))),
    "l6ChBestTiltP": odds(rhoT55, tiltv(-45)),
})

# ---- Lecture 7 -------------------------------------------------------------------------------------
# Independent routes: states are phase-fixed eigh eigenvectors of n·σ (bloch_ket, never ketFromBloch); overlaps are
# np.vdot; ray angles are arccos|⟨a|b⟩| and Bloch angles arccos of the dot product of ⟨σ⟩ vectors; R_z(φ) and turns
# about any axis are e^{−iφσ/2} from an eigendecomposition; commutators are A@B − B@A with numpy matrices; the
# a-vector of a Hermitian matrix comes from traces with the Pauli matrices; spectra use np.linalg.eigvalsh; the
# update rule and joint probabilities use explicit projector products and np.linalg.norm; benches use the Lüders
# propagation above and the unblocked sequence is a sum over projector paths; spreads are √(⟨A²⟩ − ⟨A⟩²) from
# np.vdot sandwiches; the sphere-wide extremes use the closed form ¼√((1 − r_x²)(1 − r_y²)) on the same 3° grid.
def at7(t, p):
    return bloch_ket(t * D, p * D)


def eq7(p):
    return at7(90, p)


def ray7(a, b):
    return float(np.degrees(np.arccos(min(1.0, abs(np.vdot(a, b)) / (np.linalg.norm(a) * np.linalg.norm(b))))))


def sep7(a, b):
    return float(np.degrees(np.arccos(max(-1.0, min(1.0, float(np.dot(bloch_vec(a), bloch_vec(b))))))))


def sw7(A, psi):
    return complex(np.vdot(psi, A @ psi))


def sd7(A, psi):
    return float(np.sqrt(max(0.0, var(A, psi))))


def comm7(A, B):
    return A @ B - B @ A


def spin7(n):
    return nsig(np.array(n, float)) / 2


def joint7(Ps, psi):
    v = psi / np.linalg.norm(psi)
    for Pk in Ps:
        v = Pk @ v
    return float(np.linalg.norm(v) ** 2)


def seq7(source, axes):
    """Every sign path through unblocked magnets (no normalization between steps): Σ over paths of ‖P_k…P_1ψ‖²."""
    out = {}
    psi = kf(source)

    def walk(k, v, path):
        if k == len(axes):
            out[path] = out.get(path, 0.0) + float(np.linalg.norm(v) ** 2)
            return
        for sgn in "+-":
            walk(k + 1, proj(eigvec(n_sigma(axis_deg(axes[k])), sgn)) @ v, path + sgn)

    walk(0, psi, "")
    return out


Z2 = np.zeros((2, 2), complex)
Rz2 = rz(2 * np.pi)
Rz4 = rz(4 * np.pi)
rz2x7 = Rz2 @ kf("+x")
rz4x7 = Rz4 @ kf("+x")
refB0_7 = bloch_vec(at7(60, 30))
refB1_7 = bloch_vec(rz(90 * D) @ at7(60, 30))
Pz7, Px7 = proj(kf("+z")), proj(kf("+x"))
B7 = I2 + 4 * S_z
S60_7 = spin7(tiltv(60))
S45_7 = spin7(tiltv(45))
psi6045_7 = at7(60, 45)
psi60_7 = at7(60, 0)
psiT7 = np.array([0.5, 1j * np.sqrt(3) / 2])
r6045_7 = bloch_vec(psi6045_7)
r60_7 = bloch_vec(psi60_7)
psi90_7 = bloch_ket(2 * np.arccos(np.sqrt(0.9)), 0)
sums7 = [at7(60, 0), at7(60, 45), at7(90, 45), at7(120, 200), at7(33, 77)]
forms7 = [psi60_7, psi6045_7, at7(120, 200), at7(33, 77), kf("+y")]
S3 = [S_x, S_y, S_z]
eight7 = [kf("+z"), kf("+x"), kf("+y"), at7(60, 0), at7(60, 45), at7(90, 45), at7(30, 90), at7(45, 30)]


def prod7(psi):
    return sd7(S_x, psi) * sd7(S_y, psi)


def bound7(psi):
    return 0.5 * abs(expect(S_z, psi))


def grid7(f):
    return [f(np.sin(t * D) * np.cos(p * D), np.sin(t * D) * np.sin(p * D), np.cos(t * D)) for t in range(0, 181, 3) for p in range(0, 358, 3)]


gridProd7 = grid7(lambda x, y, z: 0.25 * np.sqrt(max(0.0, (1 - x * x) * (1 - y * y))))
gridGap7 = grid7(lambda x, y, z: 0.25 * np.sqrt(max(0.0, (1 - x * x) * (1 - y * y))) - 0.25 * abs(z))
branch7 = Px7 @ kf("+z")
seqXZ7 = seq7("+z", ["x", "z"])
nA7 = [np.sin(30 * D), 0.0, np.cos(30 * D)]
mA7 = [0.0, np.sin(50 * D), np.cos(50 * D)]
cA7 = np.cross(nA7, mA7)
commArrow7 = pauli_parts(-1j * comm7(S_x, S_y))
commTilt7 = comm7(S_z, S60_7)
eps7 = 0.01
small7 = gap(rot([1, 0, 0], eps7) @ rot([0, 1, 0], eps7) - rot([0, 1, 0], eps7) @ rot([1, 0, 0], eps7), -1j * eps7 ** 2 * S_z)
refA7 = [float(np.linalg.norm((2 * S_x + s * 2j * S_y) @ kf("+z")) ** 2) for s in (1, -1)]
iComm7 = 1j * sw7(comm7(S_x, S_y), kf("+z"))
sdz7 = sd7(S_x, kf("+z")) * sd7(S_y, kf("+z"))
home7 = next((p for p in range(1, 1441) if abs(sw7(rz(p * D), kf("+x")) - 1) < 1e-12), float("nan"))
genFd7 = 1j * (rz(1e-6) - rz(-1e-6)) / 2e-6
eigB7 = np.linalg.eigvalsh(B7)

values.update({
    "l7EqR60x": bloch_vec(eq7(60))[0],
    "l7EqR60y": bloch_vec(eq7(60))[1],
    "l7EqR60z": bloch_vec(eq7(60))[2],
    "l7EqHalfZ": worst([prob(kf("+z"), eq7(p)) for p in (0, 60, 200)], 0.5),
    "l7Ov120Re": float(np.vdot(eq7(0), eq7(120)).real),
    "l7Ov120Im": float(np.vdot(eq7(0), eq7(120)).imag),
    "l7Ov120Abs": float(abs(np.vdot(eq7(0), eq7(120)))),
    "l7Ov120Arg": float(np.degrees(np.angle(np.vdot(eq7(0), eq7(120))))),
    "l7Ov120P": prob(kf("+x"), eq7(120)),
    "l7Ov90P": prob(kf("+x"), eq7(90)),
    "l7EtaXmX": ray7(kf("+x"), kf("-x")),
    "l7EtaXY": ray7(kf("+x"), kf("+y")),
    "l7SepXY": sep7(kf("+x"), kf("+y")),
    "l7PXY": prob(kf("+x"), kf("+y")),
    "l7PzT120": prob(kf("+z"), at7(120, 0)),
    "l7PzT120Rule": p_plus(120, kf("+z")),
    "l7EtaZX": ray7(kf("+z"), kf("+x")),
    "l7PZX": prob(kf("+z"), kf("+x")),
    "l7EtaShort": ray7(eq7(10), eq7(350)),
    "l7SepShort": sep7(eq7(10), eq7(350)),
    "l7OvShort": float(abs(np.vdot(eq7(10), eq7(350)))),
    "l7PShort": prob(eq7(10), eq7(350)),
    "l7HalfRule": worst([ray7(a, b) - sep7(a, b) / 2 for a, b in [(eq7(10), eq7(350)), (kf("+x"), kf("+y")), (kf("+z"), at7(120, 0)), (at7(60, 90), kf("+y")), (at7(33, 77), at7(120, 200))]], 0),
    "l7Orth30": prob(eq7(30), eq7(210)),
    "l7EtaOff": ray7(kf("+y"), at7(60, 90)),
    "l7POff": prob(kf("+y"), at7(60, 90)),
    "l7TryP10": prob(kf("+x"), eq7(-10)),
    "l7TryPx60": prob(kf("+x"), at7(60, 0)),
    "l7RzShift": flag(same_state(rz(100 * D) @ eq7(30), eq7(130)) and abs(np.vdot(eq7(130), rz(100 * D) @ eq7(30)) - np.exp(-50j * D)) < 1e-12),
    "l7Rz90Same": flag(same_state(rz(90 * D) @ kf("+x"), kf("+y"))),
    "l7Rz90Re": float(np.vdot(kf("+y"), rz(90 * D) @ kf("+x")).real),
    "l7Rz90Im": float(np.vdot(kf("+y"), rz(90 * D) @ kf("+x")).imag),
    "l7Rz90ImSize": float(abs(np.vdot(kf("+y"), rz(90 * D) @ kf("+x")).imag)),
    "l7Rz2piNeg": flag(np.allclose(Rz2, -I2, atol=1e-12)),
    "l7Rz2piX": sw7(Rz2, kf("+x")).real,
    "l7Rz2piRx": bloch_vec(rz2x7)[0],
    "l7Rz2piP": prob(kf("+x"), rz2x7),
    "l7Rz4piId": flag(np.allclose(Rz4, I2, atol=1e-12)),
    "l7Rz4piX": sw7(Rz4, kf("+x")).real,
    "l7Rz2piSame": flag(same_state(kf("+x"), rz2x7)),
    "l7Rz4piBack": flag(np.allclose(rz4x7, kf("+x"), atol=1e-12)),
    "l7ExpRz": flag(gap(expm_eig(-1j * 1.234 * S_z), rz(1.234)) < 1e-12),
    "l7GenSz": flag(gap(genFd7, S_z) < 1e-8),
    "l7PoleFixed": flag(same_state(rz(1.234) @ kf("+z"), kf("+z"))),
    "l7RefB0x": refB0_7[0],
    "l7RefB0y": refB0_7[1],
    "l7RefB0z": refB0_7[2],
    "l7RefB1x": refB1_7[0],
    "l7RefB1xSize": abs(refB1_7[0]),
    "l7RefB1y": refB1_7[1],
    "l7RefB1z": refB1_7[2],
    "l7RefBSo3": float(np.linalg.norm(rodrigues([0, 0, 1], 90 * D, refB0_7) - np.array(refB1_7))),
    "l7Rz180Same": flag(same_state(rz(np.pi) @ kf("+x"), kf("-x"))),
    "l7Rz180Re": float(np.vdot(kf("-x"), rz(np.pi) @ kf("+x")).real),
    "l7Rz180Im": float(np.vdot(kf("-x"), rz(np.pi) @ kf("+x")).imag),
    "l7Eq360a": float(eq7(360)[0].real),
    "l7Eq360Same": flag(np.allclose(eq7(360), eq7(0), atol=1e-12)),
    "l7Rz2piA": float(rz2x7[0].real),
    "l7Rz2piASize": float(abs(rz2x7[0].real)),
    "l7ExpMinusPi": float(np.exp(-1j * np.pi).real),
    "l7OvFull": float(abs(np.vdot(kf("+x"), rz2x7))),
    "l7FullSign": float((np.vdot(kf("+x"), rz2x7) / abs(np.vdot(kf("+x"), rz2x7))).real),
    "l7FullSign4": float((np.vdot(kf("+x"), rz4x7) / abs(np.vdot(kf("+x"), rz4x7))).real),
    "l7Rz2piZ": sw7(Rz2, kf("+z")).real,
    "l7Cos90": sw7(rz(90 * D), kf("+x")).real,
    "l7Cos180": sw7(rz(180 * D), kf("+x")).real,
    "l7FirstHome": float(home7),
    "l7PxFromZ": expect(Px7, kf("+z")),
    "l7BranchLen": float(np.linalg.norm(branch7)),
    "l7BranchIsX": flag(same_state(after(Px7, kf("+z")), kf("+x"))),
    "l7MeasureHalf": worst([prob(eigvec(SX, s), kf("+z")) for s in "+-"], 0.5),
    "l7ZxPlus": bench("+z", ["z", "x"], ["+"])[0],
    "l7ZxMinus": bench("+z", ["z", "x"], ["+"])[1],
    "l7ZxBlocked": bench("+z", ["z", "x"], ["+"])[2][0],
    "l7XzBlocked": bench("+z", ["x", "z"], ["+"])[2][0],
    "l7XzPlusMinus": bench("+z", ["x", "z"], ["+"])[1],
    "l7XzMinusMinus": bench("+z", ["x", "z"], ["-"])[1],
    "l7XzPMinusZ": bench("+z", ["x", "z"], ["+"])[1] + bench("+z", ["x", "z"], ["-"])[1],
    "l7SeqMinusZ": seqXZ7["+-"] + seqXZ7["--"],
    "l7ZzFirstMinus": bench("+z", ["z", "z"], ["+"])[1],
    "l7XzzPlus": bench("+z", ["x", "z", "z"], ["+", "+"])[0],
    "l7XzzMinus": bench("+z", ["x", "z", "z"], ["+", "+"])[1],
    "l7PzZ": prob(kf("+z"), kf("+z")),
    "l7XzzRepeatPlus": bench("+x", ["z", "z"], ["+"])[0],
    "l7ZzMinus": bench("+x", ["z", "z"], ["+"])[1],
    "l7PzX": prob(kf("+z"), kf("+x")),
    "l7TiltKeepPlus": bench("+z", [60, "z"], ["+"])[1],
    "l7TiltKeepMinus": bench("+z", [60, "z"], ["-"])[1],
    "l7TiltMinusZ": bench("+z", [60, "z"], ["+"])[1] + bench("+z", [60, "z"], ["-"])[1],
    "l7TiltPass": p_plus(60, kf("+z")),
    "l7BEig1": float(eigB7[1]),
    "l7BEig2": float(eigB7[0]),
    "l7BIsI4Sz": flag(np.allclose(3 * Pz7 - proj(kf("-z")), B7, atol=1e-12)),
    "l7BVecs": flag(same_state(eigvec(B7, "+"), kf("+z")) and same_state(eigvec(B7, "-"), kf("-z"))),
    "l7CommSzB": gap(comm7(S_z, B7), Z2),
    "l7JointZX": joint7([Pz7, Px7], kf("+z")),
    "l7JointXZ": joint7([Px7, Pz7], kf("+z")),
    "l7JointBench": flag(abs(joint7([Pz7, Px7], kf("+z")) - bench("+z", ["z", "x"], ["+"])[0]) < 1e-12 and abs(joint7([Px7, Pz7], kf("+z")) - bench("+z", ["x", "z"], ["+"])[0]) < 1e-12),
    "l7ProjCommute": flag(np.allclose(Px7 @ Pz7, Pz7 @ Px7, atol=1e-9)),
    "l7JointDiff": joint7([Pz7, Px7], kf("+z")) - joint7([Px7, Pz7], kf("+z")),
    "l7SxSyIm": float((S_x @ S_y)[0, 0].imag),
    "l7SySxIm": float((S_y @ S_x)[0, 0].imag),
    "l7SySxImSize": float(abs((S_y @ S_x)[0, 0].imag)),
    "l7CommXY": flag(np.allclose(comm7(S_x, S_y), 1j * S_z, atol=1e-12)),
    "l7CommCyclic": flag(np.allclose(comm7(S_y, S_z), 1j * S_x, atol=1e-12) and np.allclose(comm7(S_z, S_x), 1j * S_y, atol=1e-12)),
    "l7CommRev": flag(np.allclose(comm7(S_y, S_x), -1j * S_z, atol=1e-12)),
    "l7CommArrowZ": commArrow7[3],
    "l7CommArrowCross": flag(np.allclose(commArrow7[1:], 2 * np.cross([0.5, 0, 0], [0, 0.5, 0]), atol=1e-12)),
    "l7XYendY": bloch_vec(rot([0, 1, 0], np.pi / 2) @ rot([1, 0, 0], np.pi / 2) @ kf("+z"))[1],
    "l7YXendX": bloch_vec(rot([1, 0, 0], np.pi / 2) @ rot([0, 1, 0], np.pi / 2) @ kf("+z"))[0],
    "l7SmallTurns": flag(small7 < 1e-6),
    "l7IdEig": worst([float(x) for x in np.linalg.eigvalsh(I2)], 1),
    "l7CommIdX": gap(comm7(I2, S_x), Z2),
    "l7JointYZX": joint7([Pz7, Px7], kf("+y")),
    "l7JointYXZ": joint7([Px7, Pz7], kf("+y")),
    "l7FinalZX": flag(same_state(Px7 @ Pz7 @ kf("+y"), kf("+x"))),
    "l7FinalXZ": flag(same_state(Pz7 @ Px7 @ kf("+y"), kf("+z"))),
    "l7CommOpp": gap(comm7(S_z, -S_z), Z2),
    "l7CrossRule": flag(np.allclose(comm7(spin7(nA7), spin7(mA7)), 1j * spin7(cA7), atol=1e-12)),
    "l7Cross60": float(np.linalg.norm(np.cross([0, 0, 1], tiltv(60)))),
    "l7CommXZNonzero": gap(comm7(S_x, S_z), Z2),
    "l7CoTilt": float(np.linalg.norm(pauli_parts(-1j * commTilt7)[1:]) * 2),
    "l7CoTiltOk": flag(np.allclose(commTilt7, 1j * np.sin(60 * D) * S_y, atol=1e-12)),
    "l7Tilt60P": p_plus(60, kf("+z")),
    "l7Tilt60Avg": expect(S60_7, kf("+z")),
    "l7Tilt60Sd": sd7(S60_7, kf("+z")),
    "l7Tilt60Var": var(S60_7, kf("+z")),
    "l7SqQuarter": flag(all(np.allclose(A @ A, I2 / 4, atol=1e-12) for A in S3)),
    "l7SpreadFormula": worst([abs(var(A, psi) - (1 - bloch_vec(psi)[j] ** 2) / 4) for psi in forms7 for j, A in enumerate(S3)], 0),
    "l7SpreadFromBloch": worst([abs(0.25 * (1 - bloch_vec(psi)[j] ** 2) - var(A, psi)) for psi in forms7 for j, A in enumerate(S3)], 0),
    "l7R60x": r60_7[0],
    "l7R60z": r60_7[2],
    "l7Sd60x": sd7(S_x, psi60_7),
    "l7Sd60y": sd7(S_y, psi60_7),
    "l7Sd60z": sd7(S_z, psi60_7),
    "l7VarZz": var(S_z, kf("+z")),
    "l7SdZx": sd7(S_x, kf("+z")),
    "l7SdZy": sd7(S_y, kf("+z")),
    "l7SemX100": sd7(S_x, kf("+z")) / 10,
    "l7SemX10000": sd7(S_x, kf("+z")) / 100,
    "l7AvgZ60": expect(S_z, psi60_7),
    "l7PplusRule": 0.5 + expect(S_z, psi60_7),
    "l7PminusRule": 0.5 - expect(S_z, psi60_7),
    "l7PplusBorn": flag(abs(0.5 + expect(S_z, psi60_7) - prob(kf("+z"), psi60_7)) < 1e-12),
    "l7TPz": prob(kf("+z"), psiT7),
    "l7TPminus": prob(kf("-z"), psiT7),
    "l7TAvg": expect(S_z, psiT7),
    "l7TAvgSize": abs(expect(S_z, psiT7)),
    "l7TSd": sd7(S_z, psiT7),
    "l7TIsSphere": flag(np.allclose(psiT7, at7(120, 90), atol=1e-12)),
    "l7OwnAxisVar": worst([var(spin7(bloch_vec(psi)), psi) for psi in sums7], 0),
    "l7OwnAxisP": worst([prob(eigvec(nsig(np.array(bloch_vec(psi))), "+"), psi) for psi in sums7], 1),
    "l7Sd6045x": sd7(S_x, psi6045_7),
    "l7Dist6045x": float(np.hypot(r6045_7[1], r6045_7[2])),
    "l7DistRule": flag(abs(sd7(S_x, psi6045_7) - 0.5 * np.hypot(r6045_7[1], r6045_7[2])) < 1e-12),
    "l7SumSq": worst([sum(var(A, psi) for A in S3) for psi in sums7], 0.5),
    "l7Sd90": sd7(S_z, psi90_7),
    "l7Avg90": expect(S_z, psi90_7),
    "l7Var90": var(S_z, psi90_7),
    "l7P90": prob(kf("+z"), psi90_7),
    "l7Prod6045": prod7(psi6045_7),
    "l7IdLeft": (1 - r6045_7[0] ** 2) * (1 - r6045_7[1] ** 2),
    "l7IdRight": r6045_7[2] ** 2 + r6045_7[0] ** 2 * r6045_7[1] ** 2,
    "l7Bound6045": bound7(psi6045_7),
    "l7BoundComm": 0.5 * abs(sw7(comm7(S_x, S_y), psi6045_7)),
    "l7Holds6045": flag(prod7(psi6045_7) >= 0.5 * abs(sw7(comm7(S_x, S_y), psi6045_7))),
    "l7Rx2": r6045_7[0] ** 2,
    "l7OneMinusRx2": 1 - r6045_7[0] ** 2,
    "l7SatP0": prod7(kf("+z")),
    "l7SatP60": prod7(at7(60, 0)),
    "l7SatB60": bound7(at7(60, 0)),
    "l7SatP90Sq": var(S_x, at7(90, 0)) * var(S_y, at7(90, 0)),
    "l7SatSlack": worst([var(S_x, at7(t, 0)) * var(S_y, at7(t, 0)) - (0.5 * abs(sw7(comm7(S_x, S_y), at7(t, 0)))) ** 2 for t in range(0, 181, 15)], 0),
    "l7CommXYNonzero": gap(comm7(S_x, S_y), Z2),
    "l7CommAvgX": float(abs(sw7(comm7(S_x, S_y), kf("+x")))),
    "l7VarXx": var(S_x, kf("+x")),
    "l7SdXy": sd7(S_y, kf("+x")),
    "l7RobProd": sd7(S_x, kf("+y")) * sd7(S45_7, kf("+y")),
    "l7RobBound": 0.5 * abs(sw7(comm7(S_x, S45_7), kf("+y"))),
    "l7RefAPlus": refA7[0],
    "l7RefAMinus": refA7[1],
    "l7RefAi": float(iComm7.real),
    "l7RefAFormulaPlus": 2 + float(iComm7.real) / sdz7,
    "l7RefAFormulaMinus": 2 - float(iComm7.real) / sdz7,
    "l7ExactEq": worst([prod7(psi) ** 2 - bound7(psi) ** 2 - (expect(S_x, psi) * expect(S_y, psi)) ** 2 for psi in eight7], 0),
    "l7MaxProd": float(max(gridProd7)),
    "l7MaxGap": float(max(gridGap7)),
    "l7Prod9045": prod7(at7(90, 45)),
    "l7Bound9045": bound7(at7(90, 45)),
    "l7Anti": gap(S_x @ S_y + S_y @ S_x, Z2),
    "l7BoundSharp": prod7(kf("+z")) / abs(np.vdot(kf("+z"), (S_x @ S_y - S_y @ S_x) @ kf("+z"))),
    "l7TAlpha": float(abs(at7(120, 90)[0])),
})

# ---- Lecture 9 -------------------------------------------------------------------------------------
# Independent routes: single-spin kets are phase-fixed eigh eigenvectors of n·σ (bloch_ket, never ketFromBloch) and pair states
# are np.kron of them; a pair's coefficient matrix is psi.reshape(2, 2), its determinant np.linalg.det and the product test
# np.linalg.matrix_rank (the engine uses an LU determinant and its own SVD rank); the ud-du family is a plane rotation applied to
# |ud>; the dealer's table is an enumeration of his two equally likely deals and independent coins are np.outer; means and the
# correlation are E[ab] − E[a]E[b] over explicit ±1 arrays; row and column chances are sums of |ψ_ab|²; dimensions are np.kron
# sizes. The random-state facts draw numpy's own 20 000 states (seed 448): only the count (0) and the ½ bound are compared,
# never a seed-dependent number.
def uni9(n):
    return np.ones(n) / np.sqrt(n)


def coef9(psi):
    return np.asarray(psi, complex).reshape(2, 2)


def det9(psi):
    with np.errstate(all="ignore"):  # numpy warns on an exactly singular (product) matrix; its determinant is 0
        return complex(np.linalg.det(coef9(psi)))


def is_product9(psi):
    return int(np.linalg.matrix_rank(coef9(psi), tol=1e-9)) == 1


def ud_fam9(t_deg):
    t = np.radians(t_deg)
    ud, du = np.array([[np.cos(t), np.sin(t)], [-np.sin(t), np.cos(t)]]) @ np.array([1.0, 0.0])  # (ud, du) components
    v = np.zeros(4, complex)
    v[1], v[2] = ud, du
    return v


def dealer9():
    P = np.zeros((2, 2))
    for alice_gets_penny in (True, False):  # the two equally likely deals; penny scores +1, dime −1
        a = 1 if alice_gets_penny else -1
        b = -1 if alice_gets_penny else 1
        P[0 if a == 1 else 1][0 if b == 1 else 1] += 0.5
    return P


def stats9(P):
    s = np.array([1.0, -1.0])
    ea, eb, eab = float(s @ P.sum(axis=1)), float(s @ P.sum(axis=0)), float(s @ P @ s)
    return ea, eb, eab, eab - ea * eb


def bob_pu9(th):
    psi = np.kron(bloch_ket(th * D, 0.0), kf("+x"))
    return float(np.sum(np.abs(coef9(psi)[:, 0]) ** 2))


dealer_p9 = dealer9()
dealer_s9 = stats9(dealer_p9)
bi_p9 = np.outer([0.7, 0.3], [0.4, 0.6])
bi_s9 = stats9(bi_p9)
fair_p9 = np.outer([0.5, 0.5], [0.5, 0.5])
alice60_9 = bloch_ket(60 * D, 0.0)
bobx_9 = kf("+x")
prod9 = np.kron(alice60_9, bobx_9)
fam30_9 = ud_fam9(30)
sing9 = (np.array([0, 1, 0, 0], complex) - np.array([0, 0, 1, 0], complex)) / np.sqrt(2)
uniform9 = 0.5 * np.ones(4, complex)
flip9 = np.diag([1, 1, 1, -1]).astype(complex) @ uniform9
pp9 = np.kron(kf("+x"), kf("+x"))
_r9 = np.random.default_rng(448)
_z9 = _r9.normal(size=(20000, 2, 2)) + 1j * _r9.normal(size=(20000, 2, 2))
_z9 = _z9 / np.sqrt(np.sum(np.abs(_z9) ** 2, axis=(1, 2)))[:, None, None]
_sv9 = np.linalg.svd(_z9, compute_uv=False)
_products9 = int(np.sum(_sv9[:, 1] < 1e-9 * _sv9[:, 0]))
with np.errstate(all="ignore"):
    _detmax9 = float(np.max(np.abs(np.linalg.det(_z9))))
values.update({
    "l9DimCoinDie": float(np.kron(uni9(2), uni9(6)).size),
    "l9DimThreeDie": float(np.kron(uni9(3), uni9(6)).size),
    "l9Twelfth": float(abs(np.kron(uni9(2), uni9(6))[0]) ** 2),
    "l9CharlieP": float(dealer_p9[0][1]),
    "l9CoinMeanA": dealer_s9[0],
    "l9CoinMeanB": dealer_s9[1],
    "l9CoinAB": dealer_s9[2],
    "l9CoinCorr": dealer_s9[3],
    "l9BiasedPA": float(bi_p9.sum(axis=1)[0]),
    "l9BiasedPB": float(bi_p9.sum(axis=0)[0]),
    "l9BiasedA": bi_s9[0],
    "l9BiasedB": bi_s9[1],
    "l9BiasedBSize": abs(bi_s9[1]),
    "l9BiasedAB": bi_s9[2],
    "l9BiasedABSize": abs(bi_s9[2]),
    "l9BiasedCorr": bi_s9[3],
    "l9IndepChance": float(fair_p9[0][0]),
    "l9IndepAB": stats9(fair_p9)[2],
    "l9DimSpins": float(np.kron(uni9(2), uni9(2)).size),
    "l9UdUd": float(np.vdot(np.kron([1, 0], [0, 1]), np.kron([1, 0], [0, 1])).real),
    "l9UdDu": float(np.vdot(np.kron([1, 0], [0, 1]), np.kron([0, 1], [1, 0])).real),
    "l9UniAmp": float(uniform9[0].real),
    "l9UniNorm": float(np.linalg.norm(uniform9) ** 2),
    "l9AlphaU": float(alice60_9[0].real),
    "l9AlphaD": float(alice60_9[1].real),
    "l9BetaU": float(bobx_9[0].real),
    "l9BetaD": float(bobx_9[1].real),
    "l9ProdUU": float(prod9[0].real),
    "l9ProdUD": float(prod9[1].real),
    "l9ProdDU": float(prod9[2].real),
    "l9ProdDD": float(prod9[3].real),
    "l9ProdChanceTop": float(abs(prod9[0]) ** 2),
    "l9ProdChanceBottom": float(abs(prod9[2]) ** 2),
    "l9ProdNorm": float(np.linalg.norm(prod9) ** 2),
    "l9ProdIsProduct": flag(is_product9(prod9)),
    "l9BobPu": worst([bob_pu9(th) for th in (0, 60, 120, 180)], 0.5),
    "l9Fam30Norm": float(np.linalg.norm(fam30_9) ** 2),
    "l9Fam30Ud": float(fam30_9[1].real),
    "l9Fam30Du": float(-fam30_9[2].real),
    "l9ParamsOne": float(2 * 2 - 1 - 1),
    "l9ParamsGeneral": float(2 * 4 - 1 - 1),
    "l9ParamsProduct": float(2 * (2 * 2 - 1 - 1)),
    "l9RandomProducts": float(_products9),
    "l9SingUd": float(sing9[1].real),
    "l9SingDu": float(-sing9[2].real),
    "l9SingNorm": float(np.linalg.norm(sing9) ** 2),
    "l9SingIsProduct": flag(is_product9(sing9)),
    "l9ExitPlusPlus": flag(abs(abs(np.vdot(uniform9, pp9)) - 1) < 1e-9),
    "l9ExitProduct": flag(is_product9(uniform9)),
    "l9FlipProduct": flag(is_product9(flip9)),
    "l9Det15": det9(ud_fam9(15)).real,
    "l9Det30": det9(ud_fam9(30)).real,
    "l9SingDet": det9(sing9).real,
    "l9ProdDet": abs(det9(prod9)),
    "l9DetMax": flag(_detmax9 <= 0.5 + 1e-12),
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
