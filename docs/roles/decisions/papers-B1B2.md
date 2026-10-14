# Rulings: Papers B1 "The surface code: a memory you can keep" and B2 "Quantum LDPC codes and bivariate bicycle codes" (judge, 2026-10-14)

Plans: `docs/roles/proposals/P-B1-story.md` (6 units, 32 beats), `P-B2-story.md` (6 units, 29 beats); numpy 52 checks, 0
failed; 15 new recipes. Scope: `papers-tdg-scope.md` S2, S4, S5.

- R1 **Phases.** Background chapters use the 709 phases: `story` for taught units, `books` for a unit that walks a
  reference's construction step by step, `deeper` for optional material beyond the sources. No `lecture` phase (there are
  no class notes).
- R2 **Reported values from online-only references** cite version + section / figure / table / equation number (arXiv
  HTML has no pages), e.g. "Bra+24 v2, Table 3". Pages are added only if the PDF is later approved and ingested.
- R3 **The ancilla circuit that measures a check** (the gap between Q22 and B1): B1 teaches it as the first beat of
  `b1-cycle`, with a bridge back to Q22's stabilizer unit; Q22 adds only a forward hook. No change to the Q22 plan.
- R4 **Distances and planarity.** A distance is computed where exact search is feasible (the engine's search confirms
  [[72,12,6]]) and `reported` otherwise (Bra+24's table, with location). Thickness-2 / planarity of the BB Tanner graph is
  `reported` with its location; the picture may show the two edge layers, but no caption claims a planarity we did not test.
- R5 **BP scaling.** No scaling numbers (Rof+20 App. C was not readable). B2 shows min-sum BP and OSD-0 working and failing
  on small codes, computed by the engine; scaling is described in words, citing the abstracts.
- R6 **Bev+22's (d+1)/2 versus the paper's d/2 (and 0.1 in §2.6):** show the three named presets as the plan does, each
  labelled with its source; this is a difference between references, not a Correction of the paper.
- R7 **Widgets.** `code-lab` (place errors on a small code, watch the syndrome and the decoder's correction; reusable by
  Q21/Q22 and B3) is approved, lazy, through the props gate. `curve-explorer` is deferred: B1's threshold curves use the
  `plot` kind with named presets across beats.
- R8 **Stage work** goes to ONE stage-kind agent after the `code` kind merges: `spacetime` (new, contract in P-B1 §9.2);
  `code` additions (toric, planar, schedule, BB fields); `circuit` fault markers; `plot` series and points; `bits` bitmap
  and grid. `surgery-graph` and `pauli-program` (B3/B4) follow in the same agent if those plans are ruled by then.
- R9 **Engine additions** (toric, planar, schedule, circuit faults / circuit distance, space-time sim + small matching,
  curves, Pauli frame, BB isomorphism, layers, shift action, min-sum BP, OSD-0, quantum Hamming) are built inside the B1
  and B2 builds in `physics/qec/` with numpy twins, B1 first.
