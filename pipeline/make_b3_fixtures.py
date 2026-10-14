#!/usr/bin/env python3
"""Fixtures for the measurement engine of the Papers background chapter B3 (app/src/physics/qec: update, tableau measurePauli, surgery, gauge, graph, cssdist, timelike, cnot).

Every answer comes from the independent routes of pipeline/b3_numpy.py (dense 21-qubit state vectors, GF(2) on integers, brute-force distances, solving the incidence system, summing every
flip pattern). The TypeScript tests (physics/qec/measure.fixtures.test.ts) compare the engine to this file.

Usage (repo root): python3 pipeline/make_b3_fixtures.py -> app/src/physics/__fixtures__/qec-b3.json. Deterministic: run twice and diff.
"""
import json
from pathlib import Path

import b3_numpy as bn

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app" / "src" / "physics" / "__fixtures__" / "qec-b3.json"


def update_block():
    cases = [
        (["XI", "IX"], "ZZ"),  # replaced
        (["ZZ", "XX"], "ZZ"),  # fixed
        (["XXXX", "ZZZZ"], "IZZI"),  # added
        (["XXXX", "ZZZZ"], "XXII"),  # clashing with ZZZZ
        (["ZZI", "IZZ"], "ZIZ"),  # fixed (product)
        (["ZZI", "IZZ"], "XXX"),  # clashing with both
        (["ZZI", "IZZ"], "XII"),  # clashing with ZZI only
    ]
    out = []
    for gens, pm in cases:
        n = len(pm)
        g = [bn.sym(s) for s in gens]
        new, kind = bn.update_rule(g, bn.sym(pm))
        out.append(dict(gens=gens, measure=pm, kind=kind, after=[bn.letters(x, n) for x in new], kBefore=n - len(g), kAfter=n - len(new)))
    cen = dict(
        bell=bn.census([bn.sym("XX"), bn.sym("ZZ")], 2),
        bitflip3=bn.census([bn.sym("ZZI"), bn.sym("IZZ")], 3),
        c422=bn.census([bn.sym("XXXX"), bn.sym("ZZZZ")], 4),
        plus2=bn.census([bn.sym("XI"), bn.sym("IX")], 2),
    )
    clash = {}
    for a, b in (("IZZI", "IXXI"), ("IZZI", "XXII"), ("IZZI", "XXXX")):
        clash[a + "/" + b] = bin(bn.sym(a)[0] & bn.sym(b)[1]).count("1") + bin(bn.sym(a)[1] & bn.sym(b)[0]).count("1")
    return dict(cases=out, census=cen, clashes=clash)


def surgery_block():
    stats = {f"{p}{d}": bn.merge_stats(d, p) for p in ("XX", "ZZ") for d in (3, 5, 7)}
    dist = {f"{p}3": list(bn.merged_distance(3, p)) for p in ("XX", "ZZ")}
    return dict(stats=stats, distances=dist, dense=bn.dense_surgery_d3())


def gauge_block():
    out = {}
    out["patch3-x"] = bn.host_system("patch3-x")
    out["seam3"] = bn.host_system("seam3")
    for r in (1, 2, 3):
        out[f"patches3-xx:rungs{r}"] = bn.host_system("patches3-xx", rungs=r)
    for dr in (1, 2):
        out[f"patches3-xx:rungs3:drop{dr}"] = bn.host_system("patches3-xx", rungs=3, drop=dr)
    for w in (1, 2, 3):
        out[f"patch3-steane:w{w}"] = bn.host_system("patch3-steane", w=w)
    orders = {}
    for perm in [(0, 1, 2), (0, 2, 1), (1, 0, 2), (1, 2, 0), (2, 0, 1), (2, 1, 0)]:
        s = bn.host_system("patch3-steane", w=3, order=perm)
        orders["".join(map(str, perm))] = dict(h=s["h"], d=s["d"])
    return dict(systems=out, steaneOrders=orders)


def graph_block():
    graphs = {
        "ladder": (6, [(0, 1), (1, 2), (3, 4), (4, 5), (0, 3), (2, 5), (1, 4)]),
        "path4": (4, [(0, 1), (1, 2), (2, 3)]),
        "cycle6": (6, [(i, (i + 1) % 6) for i in range(6)]),
        "k4": (4, [(a, b) for a in range(4) for b in range(a + 1, 4)]),
        "cube": (8, [(a, a ^ (1 << b)) for a in range(8) for b in range(3) if a < a ^ (1 << b)]),
        "two-components": (6, [(0, 1), (1, 2), (2, 0), (3, 4), (4, 5)]),
    }
    out = {}
    for name, (V, el) in graphs.items():
        inc_rows = [sum(1 << j for j, (a, b) in enumerate(el) if v in (a, b)) for v in range(V)]
        rank = bn.gf2_rank(inc_rows)
        entry = dict(V=V, edges=[list(e) for e in el], rank=rank, cycleRank=len(el) - rank, components=V - rank)
        if V - rank == 1:
            h, _ = bn.cheeger(V, el)
            entry["h"] = h
        out[name] = entry
    return out


def timelike_block():
    ps = bn.prod_flip(0.02, 4)
    return dict(
        flips=[dict(q=q, m=m, p=bn.prod_flip(q, m)) for q, m in ((0.02, 4), (0.05, 1), (0.1, 3), (0.3, 6))],
        p=ps,
        votes={str(R): bn.vote_fail(R, ps) for R in (1, 3, 5, 7, 9, 11)},
        roundsFor1e3=bn.rounds_for(ps, 1e-3),
        otherVotes=[dict(R=R, p=p, v=bn.vote_fail(R, p)) for R, p in ((3, 0.1), (5, 0.25), (7, 0.4))],
    )


def main():
    data = dict(
        about="pipeline/make_b3_fixtures.py (independent routes in pipeline/b3_numpy.py)",
        update=update_block(),
        product=bn.product_measure_dense(),
        surgery=surgery_block(),
        cnot=bn.cnot_stats(),
        gauge=gauge_block(),
        graph=graph_block(),
        timelike=timelike_block(),
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(",", ":"), sort_keys=True) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
