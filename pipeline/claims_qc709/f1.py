#!/usr/bin/env python3
"""Claim twins for Physics 709 chapter F1 "Numbers that turn", computed with numpy by routes other than the engine's.

One number per key of `V` in app/src/content/qc709/F1.values.ts. The engine (physics/complex.ts, qc/complexExtra.ts,
spin.ts, qc/gates.ts) multiplies parts by hand, takes integer powers by repeated squaring, finds sizes with hypot and
angles with atan2, and builds the gates from spin.ts. This script instead uses:
  - numpy complex scalars and Python's complex power (polar form for large exponents);
  - cmath.sqrt / cmath.exp / cmath.phase, np.abs, np.angle;
  - closed forms where they exist (|z|² = a² + b², the interference law 2 + 2 cos φ, e = the series summed with
    math.factorial, e^{iπ} from cos and sin separately);
  - real calculus for the velocity of e^{iφ} (the derivative of (cos φ, sin φ) is (−sin φ, cos φ));
  - gates written as explicit diagonal matrices (T = diag(1, e^{iπ/4}), R_z(θ) = diag(e^{−iθ/2}, e^{iθ/2})).
Agreement with the engine is therefore evidence, not the same code checking itself.

Usage (from the repo root): python3 pipeline/claims_qc709/f1.py
  -> app/src/physics/__fixtures__/claims-qc709/f1.json (byte-identical on every run)
Checked by app/src/content/claims.test.ts (engine ↔ numpy per key, to 1e-12; displayed numbers ↔ claims in scope).
"""
import cmath
import json
import math
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent
PI = math.pi
DEG = PI / 180


def worst(xs, target):
    """The sample farthest from target (F1.values.ts `worst`): equal to target only if every sample is."""
    w = target
    for x in xs:
        if abs(x - target) > abs(w - target):
            w = x
    return float(w)


def yes(b):
    return 1.0 if b else 0.0


def size(z):
    return float(np.abs(np.complex128(z)))


def sq(z):
    z = complex(z)
    return z.real**2 + z.imag**2


def phasors(phases, amps=None):
    amps = amps or [1.0] * len(phases)
    return complex(np.sum(np.array(amps) * np.exp(1j * np.array(phases))))


def ket_bloch(theta, phi):
    return np.array([np.cos(theta / 2), np.exp(1j * phi) * np.sin(theta / 2)])


def euler(phi, n):
    """(1 + iφ/n)^n by Python's complex power (numpy never multiplies n factors here)."""
    return complex(1, phi / n) ** n


r = 1 / math.sqrt(2)
KX = np.array([r, r], complex)
KMX = np.array([r, -r], complex)
KY = np.array([r, 1j * r])


def same_state(a, b):
    return abs(abs(np.vdot(a, b)) - np.linalg.norm(a) * np.linalg.norm(b)) < 1e-9


T = np.diag([1, cmath.exp(1j * PI / 4)])
S = np.diag([1, 1j])
Z = np.diag([1, -1]).astype(complex)


def Rz(t):
    return np.diag([cmath.exp(-1j * t / 2), cmath.exp(1j * t / 2)])


def eq(phi_deg):
    return ket_bloch(PI / 2, phi_deg * DEG)


GAMMAS = [0, 1, 2.5, 4, 5.5]
sqrt_i = cmath.sqrt(1j)
inv34 = 1 / complex(3, 4)
e180 = complex(math.cos(180), math.sin(180))

values = {
    # f1-number-line
    "f1NegRoot": -2.0 + 5.0,
    "f1Half3": 3 / 2,
    "f1Sqrt2": math.sqrt(2),
    "f1SqNeg3": (-3.0) ** 2,
    "f1HalfTurn": -1.0 * 2.0,
    "f1TwoHalf": (-1.0) ** 2,
    "f1ITimesOne": (1j * 1).imag,
    "f1ISquared": (1j**2).real,
    "f1NegISquared": ((-1j) ** 2).real,
    "f1SqrtM9": cmath.sqrt(-9).imag,
    "f1Roots4": ((2j) ** 2).real,
    "f1Sq4iNeg": 4.0**2,
    "f1YAmp": float(KY[1].imag),
    "f1SqrtIRe": sqrt_i.real,
    "f1SqrtIIm": sqrt_i.imag,
    "f1SqrtISq": (sqrt_i**2).imag,
    "f1TSqS": yes(np.allclose(T @ T, S)),
    "f1SSqZ": yes(np.allclose(S @ S, Z)),
    "f1IPow2026": (1j ** (2026 % 4)).real,
    # f1-plane
    "f1Re34": 3.0,
    "f1Im34": 4.0,
    "f1SumRe": 3.0 + 1.0,
    "f1SumIm": 4.0 - 2.0,
    "f1Abs34": math.sqrt(3**2 + 4**2),
    "f1Conj34Im": complex(3, 4).conjugate().imag,
    "f1AbsConj34": math.sqrt(3**2 + (-4) ** 2),
    "f1ZZstar": 3.0**2 + 4.0**2,
    "f1ZZstarIm": (complex(3, 4) * complex(3, -4)).imag,
    "f1AbsSum": math.sqrt(4**2 + 2**2),
    "f1Abs1m2": math.sqrt(5),
    "f1TwoSides": 5 + math.sqrt(5),
    "f1ConjRealIm": 0.0,
    "f1ConjImag": -3.0,
    "f1TrapZZ": sq(1 + 1j),
    "f1TrapZ2": ((1 + 1j) ** 2).imag,
    "f1Abs512": math.sqrt(25 + 144),
    "f1Prod23": 2.0**2 + 3.0**2,
    "f1TriEq": size(3 + 3j) - (size(2 + 2j) + size(1 + 1j)),
    "f1Abs11": math.sqrt(2),
    "f1Abs22": 2 * math.sqrt(2),
    "f1Abs33": 3 * math.sqrt(2),
    # f1-multiply
    "f1ProdRe": (complex(2, 1) * complex(1, 3)).real,
    "f1ProdIm": (complex(2, 1) * complex(1, 3)).imag,
    "f1I34Re": -4.0,
    "f1I34Im": 3.0,
    "f1AbsI34": size(1j * complex(3, 4)),
    "f1Abs21": math.sqrt(5),
    "f1Abs13": math.sqrt(10),
    "f1AbsProd": math.sqrt(50),
    "f1AbsTimes": math.sqrt(5) * math.sqrt(10),
    "f1SizesAdded": math.sqrt(5) + math.sqrt(10),
    "f1Arg21Deg": math.degrees(math.atan(1 / 2)),
    "f1Arg13Deg": math.degrees(math.atan(3)),
    "f1ArgProdDeg": math.degrees(float(np.angle(complex(-1, 7)))),
    "f1Dir34Re": 3 / 5,
    "f1Dir34Im": 4 / 5,
    "f1Dir34Abs": size(complex(3, 4) / 5),
    "f1Inv34Re": inv34.real,
    "f1Inv34ImNeg": -inv34.imag,
    "f1InvAbs": 1 / 5,
    "f1DeMoivre": cmath.exp(3j * PI / 6).imag,
    "f1OnePlusI8": ((1 + 1j) ** 8).real,
    "f1OnePlusI4": ((1 + 1j) ** 4).real,
    "f1Angle105Deg": math.degrees(math.atan2(1 + math.sqrt(3), 1 - math.sqrt(3))),
    "f1Abs105": math.sqrt(2) * 2,
    # f1-euler
    "f1Pi": PI,
    "f1HalfPi": PI / 2,
    "f1TwoPi": 2 * PI,
    "f1UnitSize": math.hypot(math.cos(1), math.sin(1)),
    "f1Step2": 1 + 1 / 2,
    "f1Grow2": 1.5**2,
    "f1E1000": 1.001**1000,
    "f1E": sum(1 / math.factorial(k) for k in range(20)),
    "f1Euler1Abs": size(euler(PI, 1)),
    "f1Euler2ReNeg": -(1 - PI**2 / 4),
    "f1Euler2Im": PI,
    "f1Euler2Abs": 1 + PI**2 / 4,
    "f1Euler10Abs": (1 + PI**2 / 100) ** 5,
    "f1Euler64Abs": size(euler(PI, 64)),
    "f1Euler100Abs": (1 + PI**2 / 10_000) ** 50,
    "f1Euler1000Abs": (1 + PI**2 / 1_000_000) ** 500,
    "f1ExpiPiRe": math.cos(PI),
    "f1ExpiHalfPiIm": math.sin(PI / 2),
    # velocity of (cos φ, sin φ) is (−sin φ, cos φ): its dot with the position, and its length
    "f1VelDot": math.cos(0.7) * -math.sin(0.7) + math.sin(0.7) * math.cos(0.7),
    "f1VelSize": math.hypot(-math.sin(0.7), math.cos(0.7)),
    "f1Rad60": PI / 3,
    "f1EulerPlusOne": math.cos(PI) + 1,
    "f1Cos75": math.cos(math.radians(75)),
    "f1Deg180ReNeg": -e180.real,
    "f1Deg180ImNeg": -e180.imag,
    # f1-phase
    "f1Phasor60Re": 1 + math.cos(PI / 3),
    "f1Phasor60Im": math.sin(PI / 3),
    "f1Phasor60Abs": math.sqrt(3),
    "f1Interf0": 2 + 2 * math.cos(0),
    "f1Interf60": 2 + 2 * math.cos(PI / 3),
    "f1Interf90": 2 + 2 * math.cos(PI / 2),
    "f1Interf120": 2 + 2 * math.cos(2 * PI / 3),
    "f1Interf180": sq(phasors([0, PI])),
    "f1GlobalAbs": worst([size(phasors([g, g + PI / 3], [0.5, 0.5])) for g in GAMMAS], math.sqrt(3) / 2),
    "f1Global": worst([sq(phasors([g, g + PI / 3], [0.5, 0.5])) for g in GAMMAS], 0.75),
    "f1RelProb": worst([float(abs(eq(p)[1]) ** 2) for p in [0, 60, 90, 180]], 0.5),
    "f1RelSum0": 1 + math.cos(0),
    "f1RelSum60": 1 + math.cos(PI / 3),
    "f1RelSum90": sq(eq(90).sum()),
    "f1RelSum180": sq(eq(180).sum()),
    "f1Mz60": (1 + math.cos(PI / 3)) / 2,
    "f1MzEqual": (1 + math.cos(0)) / 2,
    "f1MzPi": sq(phasors([0, PI], [0.5, 0.5])),
    "f1Mz90": (1 + math.cos(PI / 2)) / 2,
    "f1XOrth": float(abs(np.vdot(KX, KMX))),
    "f1XinX": float(np.linalg.norm(KX) ** 2),
    "f1GlobalMinus": yes(same_state(KX, -KX)),
    "f1GlobalI": yes(same_state(KX, 1j * KX)),
    "f1Three": size(phasors([0, 2 * PI / 3, 4 * PI / 3])),
    "f1Cancel": size(phasors([0, PI])),
    "f1SizeOneDeg": math.degrees(math.acos(-1 / 2)),
    "f1SizeOne": math.sqrt(2 + 2 * math.cos(2 * PI / 3)),
    "f1Pi8": 45 / 2,
    "f1TGlobal": yes(np.allclose(T, cmath.exp(1j * PI / 8) * Rz(PI / 4))),
}

values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "f1.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim twins for Physics 709 chapter F1, numpy and closed forms by routes other than the engine's. "
            "Regenerate: python3 pipeline/claims_qc709/f1.py",
            "values": values,
        },
        indent=1,
    )
    + "\n"
)
print(f"wrote {out.relative_to(ROOT)} ({len(values)} values)")
