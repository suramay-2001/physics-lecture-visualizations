#!/usr/bin/env python3
"""Numpy twins for every key of `V` in app/src/content/qc709/F5.values.ts (Physics 709 Foundations, chapter F5
"Chance with numbers": probability, expectation and variance).

Independent route (never calls app/src/physics/qc/info.ts's own `mean`/`variance`/`binomialMoments`/`shannon`/
`binaryEntropy`, nor physics/spin.ts's `prob`): every number here is an explicit sum over outcomes (plain Python
loops / np.array arithmetic), `np.log2` for entropy, and closed forms for the Binomial moments and the Born-rule
angle, exactly as docs/roles/proposals/P-F5-story.md's "Evidence" section describes
(`scratchpad/f456plan-numpy.py`, block "F5").

Units: hbar = 1 inside the engine (the spin bridge values are in units of hbar, dimensionless here).

Usage (from the repo root): python3 pipeline/claims_qc709/f5.py -> app/src/physics/__fixtures__/claims-qc709/f5.json
Checked by app/src/content/claims.test.ts (engine <-> numpy per key, to 1e-12). Output is deterministic: two runs
write byte-identical files.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent.parent


def yes(b):
    return 1.0 if b else 0.0


def mean_of(xs, ps):
    """<X> = sum_x x P(x), by explicit sum (independent of info.ts's `mean`)."""
    xs = np.asarray(xs, dtype=float)
    ps = np.asarray(ps, dtype=float)
    return float(np.sum(xs * ps))


def variance_of(xs, ps):
    """(Delta X)^2 = sum_x P(x) (x - <X>)^2, by explicit sum (independent of info.ts's `variance`)."""
    m = mean_of(xs, ps)
    xs = np.asarray(xs, dtype=float)
    ps = np.asarray(ps, dtype=float)
    return float(np.sum(ps * (xs - m) ** 2))


def shannon_of(ps):
    """H = -sum_x P(x) log2 P(x), 0 log 0 = 0 (independent of info.ts's `shannon`)."""
    out = 0.0
    for p in ps:
        if p > 1e-15:
            out -= p * np.log2(p)
    return float(out)


def binary_entropy_of(p):
    return shannon_of([p, 1 - p])


# the running fair-die example: outcomes 1..6, each chance 1/6
DIE_XS = [1, 2, 3, 4, 5, 6]
DIE_PS = [1 / 6] * 6

# the Born-rule spin bridge: theta = 60 deg, closed form p = cos^2(theta/2) (never the app's ket/inner-product route)
THETA_DEG = 60.0
BORN_P = float(np.cos(np.radians(THETA_DEG) / 2) ** 2)

values = {
    # f5-probability
    "f5DieP": DIE_PS[0],
    "f5DieN": float(len(DIE_XS)),
    "f5DieSum": float(sum(DIE_PS)),
    "f5CoinHalf": 0.5,
    "f5TwoCoin": 0.5 * 0.5,
    "f5TwoCoinSum": 4 * (0.5 * 0.5),
    "f5BornP": BORN_P,
    "f5BornSum": BORN_P + (1 - BORN_P),
    "f5TwoSix": (1 / 6) * (1 / 6),
    "f5SixOrFive": 1 / 6 + 1 / 6,
    # f5-average
    "f5DieMean": mean_of(DIE_XS, DIE_PS),
    "f5LinMean": 2 * mean_of(DIE_XS, DIE_PS) + 1,
    "f5SpinAvg": mean_of([0.5, -0.5], [BORN_P, 1 - BORN_P]),
    "f5GameNet": mean_of(DIE_XS, DIE_PS) - 3,
    # f5-spread
    "f5DieVar": variance_of(DIE_XS, DIE_PS),
    "f5DieM2": mean_of([x * x for x in DIE_XS], DIE_PS),
    "f5DieMeanSq": mean_of(DIE_XS, DIE_PS) ** 2,
    "f5DieSD": float(np.sqrt(variance_of(DIE_XS, DIE_PS))),
    "f5BinMean": 100 * 0.5,
    "f5BinVar": 100 * 0.5 * (1 - 0.5),
    "f5BinSD": float(np.sqrt(100 * 0.5 * (1 - 0.5))),
    "f5MeanSD100": float(np.sqrt(variance_of(DIE_XS, DIE_PS)) / np.sqrt(100)),
    "f5SpinVar": variance_of([0.5, -0.5], [BORN_P, 1 - BORN_P]),
    "f5SpinSD": float(np.sqrt(variance_of([0.5, -0.5], [BORN_P, 1 - BORN_P]))),
    "f5VarSure": variance_of([0, 1], [1, 0]),
    "f5VarHalf": variance_of([0, 1], [0.5, 0.5]),
    # f5-surprise
    "f5HCoin": shannon_of([0.5, 0.5]),
    "f5HDie": shannon_of(DIE_PS),
    "f5HSure": shannon_of([1, 0]),
    "f5hThreeQuarter": binary_entropy_of(0.75),
    "f5hHalf": binary_entropy_of(0.5),
    # challenges (new keys only)
    "f5DieEven": 3 / 6,
    "f5AtLeastOne": 1 - 0.5**3,
    "f5BiasedMean": mean_of([1, 0], [0.6, 0.4]),
    "f5SqrtN64": 2 / np.sqrt(64),
}

values = {k: float(v) for k, v in values.items()}

out = ROOT / "app" / "src" / "physics" / "__fixtures__" / "claims-qc709" / "f5.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(
        {
            "about": "Claim twins for Physics 709 chapter F5, numpy built from explicit sums over outcomes, "
            "np.log2 and closed forms, independent of the engine's info.ts/spin.ts routes. Regenerate: "
            "python3 pipeline/claims_qc709/f5.py",
            "values": values,
        },
        indent=1,
    )
    + "\n"
)
