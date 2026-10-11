# Rulings: the deferred 709 features (judge, 2026-10-11)

The user raised the weekly cap to 50 % and asked for "the remaining features as planned". Everything planned for the
courses' content is built, reviewed and fixed (448 L1–L11; 709 F1–F8, Q1–Q18). What remains are the items the plans
proposed and earlier rulings deferred. Order of work, and the rulings each one builds under.

## D1 W16 `oracle-bench` (P-Q16 §9.3, P-Q17 §9.3; deferred by Q15Q17 R5 and Q18 R7)
- One widget, the `bb84-bench` shell pattern (controls on the left, live SVG kinds on the right): pick $n \le 4$ and $f$
  (constant, balanced, linear $a\cdot x \oplus b$, one marked item) and step the circuit; the `circuit` and `amplitudes`
  kinds draw live. Modes: **DJ**, **BV**, **Grover** ($N \le 16$, mark one item, step $U_f$ / $D$ / $Q$, the
  `grover-plane` kind beside `amplitudes`). **Simon** ($n = 3$, a chosen $s$, 5 wires as Q18 draws it) only if the
  `circuit` kind needs no new field; otherwise it is deferred again and the build says so.
- Every number the widget shows comes from `physics/qc/oracles.ts`, `grover.ts`, `qft.ts` (`runCircuit`); any new helper
  gets a numpy twin. The Try-it props gate (`widgets/visualSpecs.test.tsx`) covers the new widget's props interface.
- The Q16 and Q17 Try-its that are one-qubit stand-ins become `oracle-bench` Try-its whose stated readings the engine
  computes (the chapter's `*.tryits.test.tsx` asserts them). Q18's Try-its stay (reviewed true on their own widgets).
- Lazy: the widget loads with the chapter page or the 709 pack, never in the entry closure (rule (l) budget unchanged).

## D2 Seeded B92 ledger (P-Q15 §9.1–9.2 "optional R4"; deferred by Q15 R4)
- `b92Rounds(count, seed, eve)` in `physics/qc/crypto.ts`, seeded the same way as `bb84Rounds` so its numpy twin
  reproduces every row; attack models limited to the two attacks the B92 unit already describes.
- The shared `bb84` SVG kind gains `protocol: 'b92'` additively (skill 10): rows Alice's state, Bob's conclusive / blank
  result, Eve's attack; readouts the kept fraction and Eve's error, both from the engine.
- One beat of the Q15 B92 unit shows the ledger (a `split` with the exact-rate picture, two different kinds); the
  exact-rate pictures stay. Q15's bridges to 448 L8 stay; BB84 is still not re-derived in 709.

## D3 Review and fix
One independent review covers D1 and D2 together (skill 06: numbers re-derived, Try-its against widget code, captions
against the drawn kinds, both tracks), then one fix pass. The fix is merged before D4 starts.

## D4 Platform: lazy L1–L7 widgets, KaTeX and GSAP (BUILD-LOG open issue)
After D3 merges, so the lazy registry sees the final widget set. Same contract as the lazy 448 pack: first paint keeps only
what it needs; no flash of missing content where a test asserts content; the entry budget comes DOWN to measured + ~5 %
with a dated history line. Fold in the e2e hardening: specs that pick `section.widget` by `.nth(k)` (`l11-widgets`,
`bit-table`, `roots-widget`, `pair-grid`) name their widget (`hasText` or an id), as the L10 fix did.

## D5 Media (after D1–D4, budget permitting)
Blender opener for Part VII (the Grover rotation, before Unit 17.2; Q16 R6) and the two deferred films (`qc-q16-cancel`,
`qc-q17-mean`) — engine data only, manifests checked against the engine (skills 15, 16). Higgsfield decor needs the
owner's go-ahead per batch and is not started without it.

## Not planned, not built
No new chapters: the 709 syllabus ends at Q18 and 448 at L11 (the lectures the user supplied). Arcade rounds for
Q16–Q18 were never planned (Q16/Q17 have none). The L7 p. 14 and L10 p. 18 questions stay with the user.
