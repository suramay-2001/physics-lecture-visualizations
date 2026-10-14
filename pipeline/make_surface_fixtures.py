#!/usr/bin/env python3
"""Fixtures for the surface-code engine of the Papers background chapter B1 (app/src/physics/qec: toric, planar, schedule, faults, spacetime, curves, frame).

Every answer is reached by the independent routes of pipeline/surface_numpy.py (Kitaev's torus built edge by edge, the rotated patch from its faces, the planar code
by np.kron, Pauli propagation on bit masks, a Gottesman tableau for the schedule rule, enumeration against a lookup for the space-time failure counts). The
TypeScript tests (physics/qec/surface.fixtures.test.ts) compare the engine to this file.

Usage (repo root): python3 pipeline/make_surface_fixtures.py -> app/src/physics/__fixtures__/qec-surface.json. Deterministic: run twice and diff.
"""
import itertools
import json
import math
from decimal import Decimal, getcontext
import random
from pathlib import Path

import numpy as np

import surface_numpy as sn

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qec-surface.json"


def supports(H):
    return [[int(j) for j in np.nonzero(row)[0]] for row in H]


def order_steps(order):
    return {c: i + 1 for i, c in enumerate(order)}


def toric_block():
    out = []
    for L in (3, 4, 5, 6):
        T = sn.kitaev_torus(L)
        HX, HZ = T["HX"], T["HZ"]
        overlaps = sorted(set(int((HX[a] & HZ[b]).sum()) for a in range(L * L) for b in range(L * L)))
        e = dict(L=L, n=int(T["n"]), hx=supports(HX), hz=supports(HZ), rankX=sn.rank(HX), rankZ=sn.rank(HZ), k=int(sn.css_k(HX, HZ)), overlaps=overlaps)
        if L <= 4:
            e["d"] = int(sn.css_distance(HX, HZ, maxw=L))
        out.append(e)
    T = sn.kitaev_torus(4)
    L = 4
    zh = np.zeros(T["n"], dtype=np.uint8)
    for i in range(L):
        zh[T["h"](i, 0)] = 1
    zh2 = np.zeros(T["n"], dtype=np.uint8)
    for i in range(L):
        zh2[T["h"](i, 2)] = 1
    cut = np.zeros(T["n"], dtype=np.uint8)
    for j in range(L):
        cut[T["h"](1, j)] = 1
    chain = np.zeros(T["n"], dtype=np.uint8)
    for i in range(3):
        chain[T["h"](i, 0)] = 1
    ops = dict(
        loopLit=int((T["HX"] @ zh % 2).sum()),
        loopStabilizer=bool(sn.in_rowspace(T["HZ"], zh)),
        loopsSameClass=bool(sn.in_rowspace(T["HZ"], zh ^ zh2)),
        plaquetteStabilizer=bool(sn.in_rowspace(T["HZ"], T["HZ"][5])),
        cutLit=int((T["HZ"] @ cut % 2).sum()),
        loopCutOverlap=int((zh & cut).sum()),
        chainLit=int((T["HX"] @ chain % 2).sum()),
    )
    return dict(codes=out, operators=ops)


def rotated_block():
    out = []
    for d in (3, 5, 7, 9):
        S = sn.rotated_surface(d)
        HX, HZ = S["HX"], S["HZ"]
        w4 = sum(1 for c in S["checks"] if len(c[1]) == 4)
        w2 = sum(1 for c in S["checks"] if len(c[1]) == 2)
        lit = [int(HZ[:, q].sum()) for q in range(d * d)]
        e = dict(d=d, data=d * d, checks=len(S["checks"]), w4=w4, w2=w2, k=int(sn.css_k(HX, HZ)), litOne=lit.count(1), litTwo=lit.count(2), hx=supports(HX), hz=supports(HZ), degrees=list(sn.degrees(HX, HZ)))
        if d <= 5:
            e["d_exact"] = int(sn.css_distance(HX, HZ, maxw=d))
        out.append(e)
    planar = []
    for d in (3, 5, 7):
        HX, HZ = sn.planar_unrotated(d)
        e = dict(d=d, data=int(HX.shape[1]), checks=int(HX.shape[0] + HZ.shape[0]), k=int(sn.css_k(HX, HZ)), hx=supports(HX), hz=supports(HZ))
        if d <= 5:
            e["d_exact"] = int(sn.css_distance(HX, HZ, maxw=d))
        planar.append(e)
    return dict(rotated=out, planar=planar)


def schedule_block():
    S3 = sn.rotated_surface(3)
    perms = list(itertools.permutations(range(1, 5)))
    cf = valid = 0
    cf_pairs = []
    for px in perms:
        for pz in perms:
            c, ok, bad = sn.schedule_ok(S3, dict(zip(sn.CORN, px)), dict(zip(sn.CORN, pz)))
            if c:
                cf += 1
                cf_pairs.append((px, pz, ok))
                valid += int(ok)
    # a second route: simulate the noiseless patch with a stabilizer tableau; a schedule is valid when no detector ever fires
    rng = random.Random(7)

    def tableau_ok(px, pz, trials=8):
        tX = dict(zip(sn.CORN, px))
        tZ = dict(zip(sn.CORN, pz))
        return not any(any(sn.run_detectors(S3, tX, tZ, 3, random.Random(rng.random()))) for _ in range(trials))

    agree = sum(1 for px, pz, ok in cf_pairs if tableau_ok(px, pz) == ok)
    ex_x, ex_z = ["TL", "TR", "BL", "BR"], ["BR", "TR", "BL", "TL"]
    c, ok, bad = sn.schedule_ok(S3, order_steps(ex_x), order_steps(ex_z))
    return dict(total=len(perms) ** 2, conflictFree=cf, valid=valid, tableauAgree=agree, tableauChecked=len(cf_pairs), example=dict(xOrder=ex_x, zOrder=ex_z, conflictFree=bool(c), valid=bool(ok), badPairs=len(bad)))


def circuit_block():
    S3 = sn.rotated_surface(3)
    good = (order_steps(["TL", "TR", "BL", "BR"]), order_steps(["TL", "BL", "TR", "BR"]))
    bad = (order_steps(["TL", "BL", "TR", "BR"]), order_steps(["TL", "TR", "BL", "BR"]))
    out = {}
    for name, (tx, tz) in (("good", good), ("bad", bad)):
        d, n_loc, n_sig = sn.circuit_distance(S3, tx, tz, rounds=3)
        out[name] = dict(dCirc=d, events=n_loc, signatures=n_sig)
    out["badTwoRounds"] = dict(zip(("dCirc", "events", "signatures"), sn.circuit_distance(S3, *bad, rounds=2)))
    return out


def rep_block():
    out = []
    for n, R, maxw in ((3, 3, 4), (5, 5, 3), (5, 4, 3)):
        E, byw = sn.logical_failure_counts(n, R, maxw)
        det, edges = sn.rep_graph(n, R)
        e = dict(n=n, R=R, edges=E, byWeight={str(w): v for w, v in byw.items()}, detectors=len(det), edgeList=[[k, list(p), m, o] for k, p, m, o in edges])
        out.append(e)
    # full polynomial for n = 3, R = 3
    det, edges = sn.rep_graph(3, 3)
    E = len(edges)
    table = sn.build_lookup(edges, E)
    F = [0] * (E + 1)
    T = [0] * (E + 1)
    for S in range(1 << E):
        m = o = w = 0
        for e in range(E):
            if (S >> e) & 1:
                m ^= edges[e][2]
                o ^= edges[e][3]
                w += 1
        mw, os_ = table[m]
        if len(os_) == 2:
            T[w] += 1
        elif next(iter(os_)) != o:
            F[w] += 1
    pl = {str(p): sum((F[w] + 0.5 * T[w]) * p**w * (1 - p) ** (E - w) for w in range(E + 1)) for p in (0.001, 0.01, 0.05)}
    return dict(graphs=out, full33=dict(F=F, T=T, pL=pl))


def curves_block():
    presets = {"tdg-2.6": (0.1, 0.01, 0.0), "tdg-A10": (0.03, 0.01, 0.0), "bev22": (0.03, 0.01, 0.5)}

    def fit(d, p, name):
        a, ps, shift = presets[name]
        return a * (p / ps) ** (d / 2 + shift)

    getcontext().prec = 60  # 1 - (2/3)^(1/N) cancels badly in floats: use 60 digits
    budget = float(1 - (Decimal(2) / Decimal(3)) ** (Decimal(1) / Decimal(10**9)))
    need = {}
    for name in presets:
        need[name] = next(d for d in range(3, 99, 2) if fit(d, 1e-3, name) <= budget)
    return dict(
        cleanRun={str(N): (1 - 1e-3) ** N for N in (500, 1000, 10000)},
        budget=budget,
        repTail={str(d): [sn.rep_tail(d, p) for p in (0.001, 0.01, 0.1, 0.4, 0.6)] for d in (3, 5, 7, 13, 37)},
        fits={name: {str(d): [fit(d, p, name) for p in (0.001, 0.005, 0.01)] for d in (7, 9, 11, 17)} for name in presets},
        dNeeded=need,
        repNeeded={"0.01": next(d for d in range(3, 99, 2) if sn.rep_tail(d, 0.01) <= budget), "0.1": next(d for d in range(3, 399, 2) if sn.rep_tail(d, 0.1) <= budget)},
    )


def frame_block():
    cases = [
        ([1, 0], [0, 0], [("CNOT", 0, 1)]),
        ([0, 0], [0, 1], [("CNOT", 0, 1)]),
        ([1, 0], [0, 0], [("H", 0), ("CNOT", 0, 1)]),
        ([1], [0], [("S", 0)]),
        ([1, 0, 1], [0, 1, 0], [("H", 0), ("CNOT", 0, 1), ("S", 1), ("CNOT", 1, 2), ("H", 2)]),
    ]
    out = []
    for x, z, gates in cases:
        steps = [sn.frame_through((x, z), gates[: k + 1]) for k in range(len(gates))]
        out.append(dict(x=x, z=z, gates=[list(g) for g in gates], after=[[list(map(int, s[0])), list(map(int, s[1]))] for s in steps]))
    return out


def main():
    data = dict(about="pipeline/make_surface_fixtures.py (independent routes in pipeline/surface_numpy.py)", toric=toric_block(), surface=rotated_block(), schedule=schedule_block(), circuit=circuit_block(), rep=rep_block(), curves=curves_block(), frame=frame_block())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(",", ":"), sort_keys=True) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
