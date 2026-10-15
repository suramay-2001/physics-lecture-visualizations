"""Planarity check behind the "thickness 2" claim of Papers chapter B2 (Bra+24 Lemma 2; app/src/content/papers/B2.paper.ts, unit b2-bpt).

The chapter computes the two layers of the gross code's Tanner graph (edges split by the monomial they come from: 432 edges per layer, every
node of degree 3) with `bbfamily.ts`, but it does not decide planarity itself. This script does, offline and independently of the TypeScript:
it rebuilds the layers the way pipeline/bb2_numpy.py `layers` does, then asks networkx for a planar embedding of every connected piece.

Usage (from the repo root):  python3 pipeline/check_bb_planarity.py
Prints one line per layer (edges, max degree, number of pieces and their sizes, planar or not) and exits 1 if any piece is not planar,
if a layer does not have 432 edges, or if a node has degree other than 3. Needs networkx (not used by the app or the tests).
"""
import sys
from collections import Counter
from pathlib import Path

import networkx as nx

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bb2_numpy as N  # noqa: E402

LAYER_ONE = {"A2", "A3", "B3"}  # the monomials of the first layer; the other three form the second


def layer_graphs(l, m, A, B, layer_one):
    """Two networkx graphs: the edges of the Tanner graph named by term, split by whether the name is in `layer_one`."""
    graphs = [nx.Graph(), nx.Graph()]
    idx = lambda i, j: (i % l) * m + (j % m)
    for c in range(l * m):
        i, j = divmod(c, m)
        for k in range(3):
            for name, kind, qubit in (
                (f"A{k+1}", "X", ("L", idx(i + A[k][0], j + A[k][1]))),
                (f"B{k+1}", "X", ("R", idx(i + B[k][0], j + B[k][1]))),
                (f"B{k+1}", "Z", ("L", idx(i - B[k][0], j - B[k][1]))),
                (f"A{k+1}", "Z", ("R", idx(i - A[k][0], j - A[k][1]))),
            ):
                graphs[0 if name in layer_one else 1].add_edge((kind, c), qubit)
    return graphs


def main():
    l, m, A, B = N.TABLE3["b144"]
    ok = True
    for number, g in enumerate(layer_graphs(l, m, A, B, LAYER_ONE), start=1):
        pieces = [g.subgraph(nodes) for nodes in nx.connected_components(g)]
        planar = [nx.check_planarity(p)[0] for p in pieces]
        sizes = Counter(p.number_of_nodes() for p in pieces)
        degrees = Counter(d for _, d in g.degree())
        line_ok = g.number_of_edges() == 432 and set(degrees) == {3} and all(planar)
        ok = ok and line_ok
        print(f"layer {number}: {g.number_of_edges()} edges, degrees {dict(degrees)}, pieces {dict(sorted(sizes.items()))}, "
              f"{'all planar' if all(planar) else 'NOT planar'}{'' if line_ok else '  <-- check failed'}")
    print("thickness at most 2: " + ("confirmed" if ok else "FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
