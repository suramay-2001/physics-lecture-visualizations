#!/usr/bin/env python3
"""Reference values for the engine additions of the background chapter B2 (app/src/physics/qec/bbfamily.ts, bp.ts, qldpc.ts), by the independent routes of pipeline/bb2_numpy.py.

Blocks of app/src/physics/__fixtures__/qec-bb2.json:
  table3     n, k, ranks, common-kernel dimension (Lemma 1), check weight and qubit degree of the seven codes of Bravyi et al. Table 3
  distance   [[72,12,6]] by meet-in-the-middle (both Pauli types, witnesses), the toy 2 x 6 code and the 3 x 4 torus by exhaustive search
  iso        gross and two-gross: paper-tdg form against Bravyi et al.'s form, with and without the shifts / the row map
  layers     the two edge layers of the gross code in Bravyi's form: edges, maximum degree, piece sizes
  schedule   the depth-8 cycle: clashes, bad pairs, maximum overlap for the printed and the swapped Z reads, on [[72,12,6]] and the gross code; two cycles on a hand-written tableau
  shifts     the gross code's translations: preserved, swap, orders, ones, distinct, trivial, group order (the paper's logical basis)
  bp         min-sum belief propagation and OSD-0 on the 7-bit repetition code and the 3 x 3 torus, four-cycle counts, channel ratios
  family     quantum Hamming codes r = 3..6 and tori L = 3..8 (n, k, check weight, qubit degree)

Usage: python3 pipeline/make_bb2_fixtures.py   (from the repo root; deterministic: seeded generators, no clock; run twice and diff)
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bb2_numpy as N  # noqa: E402
from surface_numpy import css_k, degrees, kitaev_torus, mul2  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app/src/physics/__fixtures__/qec-bb2.json"


def main():
    data = {}
    data["table3"] = {name: N.table3_row(name) for name in N.TABLE3}

    HX72, HZ72 = N.bb(*N.TABLE3["b72"])
    X = N.mitm(HX72, HZ72, 6)
    Z = N.mitm(HZ72, HX72, 6)
    HXt, HZt = N.bb(*N.TOY)
    T34 = kitaev_torus(3, 4)
    data["distance"] = {
        "b72": {"dX": X["d"], "dZ": Z["d"], "zeroSyndromeAtD": X["zeroSyndrome"], "nontrivialAtD": X["nontrivial"], "witnessesX": X["witnesses"], "witnessesZ": Z["witnesses"]},
        "toy": {"n": int(HXt.shape[1]), "k": int(css_k(HXt, HZt)), "d": int(N.distance_exhaustive(HXt, HZt, 5)), "commute": not mul2(HXt, HZt.T).any()},
        "toric3x4": {"n": int(T34["n"]), "k": int(css_k(T34["HX"], T34["HZ"])), "d": int(N.distance_exhaustive(T34["HX"], T34["HZ"], 4))},
    }

    A_b, B_b = N.TABLE3["b144"][2], N.TABLE3["b144"][3]
    A_b2 = N.TABLE3["b288"][2]
    data["iso"] = {
        "gross": N.iso_holds(12, 6, N.GROSS_TORIC[2], N.GROSS_TORIC[3], A_b, B_b, (0, 1), (1, 0)),
        "grossNoShift": N.iso_holds(12, 6, N.GROSS_TORIC[2], N.GROSS_TORIC[3], A_b, B_b, (0, 0), (0, 0)),
        "twoGross": N.iso_holds(12, 12, N.TWO_GROSS_TORIC[2], N.TWO_GROSS_TORIC[3], A_b2, B_b, (0, 7), (1, 0), 7),
        "twoGrossNoMap": N.iso_holds(12, 12, N.TWO_GROSS_TORIC[2], N.TWO_GROSS_TORIC[3], A_b2, B_b, (0, 7), (1, 0), 1),
    }

    data["layers"] = {"gross": N.layers(12, 6, A_b, B_b, {"A2", "A3", "B3"})}

    sched = {}
    for name in ("b72", "b144"):
        l, m, A, B = N.TABLE3[name]
        sched[name] = {v: N.schedule_report(l, m, A, B, v) for v in ("printed", "swap-z-reads")}
    l, m, A, B = N.TABLE3["b72"]
    sched["tableau"] = {
        "b72": {
            "printed": [N.cycle_detectors(l, m, A, B, "printed", 2, s) for s in (1, 2)],
            "swap": [N.cycle_detectors(l, m, A, B, "swap-z-reads", 2, s) for s in (3, 4)],
        }
    }
    data["schedule"] = sched

    data["shifts"] = {"gross": N.shift_facts("gross")}
    data["bp"] = N.bp_facts()

    fam = {}
    for r in (3, 4, 5, 6):
        H = N.hamming_H(r)
        cw, qd = degrees(H, H)
        fam[f"hamming{r}"] = {"n": int(H.shape[1]), "k": int(css_k(H, H)), "checkWeight": cw, "qubitDegree": qd, "selfOrthogonal": not mul2(H, H.T).any()}
    for L in (3, 4, 5, 6, 8):
        T = kitaev_torus(L)
        cw, qd = degrees(T["HX"], T["HZ"])
        fam[f"toric{L}"] = {"n": int(T["n"]), "k": int(css_k(T["HX"], T["HZ"])), "checkWeight": cw, "qubitDegree": qd}
    data["family"] = fam

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(",", ":"), sort_keys=True) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")
    print("b72 d", X["d"], Z["d"], "| toy", data["distance"]["toy"], "| shifts", data["shifts"]["gross"])
    print("schedule b144", sched["b144"], "| tableau", sched["tableau"])


if __name__ == "__main__":
    main()
