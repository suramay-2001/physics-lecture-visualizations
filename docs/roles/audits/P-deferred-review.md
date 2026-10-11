# P review — the deferred 709 features: W16 `oracle-bench` (Q16/Q17 Try-its) and the seeded B92 ledger (Q15)

Independent, read-only (skill 06, both tracks; reviewer did not build either feature). Judged against rulings
`qc709-deferred-features.md` D1–D2, the plans (P-Q16 §3/§9.3, P-Q17 §3/§9.3, P-Q15 §9.1–9.2) and the sources: Bergou §6.3
pp. 107–109 and §7.1–7.3 pp. 117–125 (page images `sources/bergou-full`, PDF page = printed + 11), N&C §1.4.3–1.4.4, §6.1.
Merges reviewed: `d12810c` (oracle-bench), `c903cbf` (B92 ledger). Helpers (scratchpad, `revdef-*`): a vitest dump of the
RENDERED widget and of the engine rows, my own numpy (`revdef-oracle.py`: dense Kronecker Hadamards, `np.diag` phase oracles,
permutation f-CNOTs, projectors for Simon's answer wires; `revdef-b92.py`: my own mulberry32 port and closed-form POVM chances,
never the repo's twins), and the pre-merge `bb84.ts` resolved beside the merged one.

## Verdict: PASS — 0 blocking · 2 should-fix · 6 nits

## Evidence
- **Oracle bench, re-derived from the widget's markup** (`renderToString` with `step` at every legal cursor, 19 settings: DJ n = 1–4
  constant / linear / balanced, BV n = 1–4 incl. a = 0 and a = 1011 b = 1, Grover N = 4, 8, 16 with marked 11 / 101 / 0101 / 0000, Simon
  s = 110, 011, 101, 111 with every answer): **2 113 checks, 0 mismatches**. Every state vector at every column equals the dense-matrix
  state (max gap < 1e-9, imaginary parts 0); every bar label, every reading and headline number, the plane's angle, chance and k*,
  and the DJ verdict after Measure all equal the numpy value formatted as the kind formats it (five flags were my own formatter
  rounding exact halves down where `toFixed` rounds up: 1/16 → 0.063, 9/16 → 0.563; both are right on the page).
- Grover closed forms (mine): N = 4: α = 30°, k* = 1, P = 0.25, 1, 0.25…; N = 8: α = 20.70°, k* = 2, P_k = 0.125, 0.7813, 0.9453,
  0.3301, 0.0122, 0.548; N = 16: α = 14.48°, k* = 3, P_k = 0.0625, 0.4727, 0.9084, 0.9613, 0.5817, 0.1255. The widget's `kopt`,
  `chance` and plane readouts print exactly these; k* follows N&C's CI (a half down; p. 253); the step arc reads 2α = 41.4° for N = 8,
  the number Q17's text states (41.41°). Mean after the mark 0.265 = 0.75/√8, as Q17 says.
- Bit order and wires: q0 = MSB throughout (the read-off a = 1011 lands on index 11; Simon's y with y·s = 0 are 000, 001, 110, 111 for
  s = 110); DJ/BV draw the phase form on wires x_{n−1} … x₀, which is the form Q16 draws in 14 of its 16 circuit views (the ancilla form
  only in dj:b1 and the query circuits); Grover draws `groverCircuit(3, ['101'], k)`, Q17's own object; Simon the five wires of Q18.
- **Try-its against the widget's code**: all 19 lines of the nine units name only buttons / choices / sliders the markup carries
  ("Prepare", "Oracle", "Final Hadamards", "Mark (U_f)", "Diffuse (D)", "Whole step (Q)", "constant", "f = 1", "b = 0", "wires n") and
  quote only numbers the bench prints (0.354, −1, 1, 0, 5, 9, 1011, 0.125, 0.265, 20.7°, 62.1°, 41.4°, 0.781, 0.945, 0.33, k* = 2,
  0.961, 0.582). Word counts: 35 of 36 sentences ≤ 25 (one at 26, nit 3). The Try-its are single-track; the Formal cap (40) is met.
- **B92 ledger**: 2 000 rows over four seeded runs (155/usd 1000, 84/minerr 400, 9/usd 400, 7/none 200) replayed with my own
  mulberry32 and the closed-form chances (click 1 − 1/√2 on the right state, never on the other; Helstrom names bit 0 with
  ½(1 ± 1/√2)): **every row equal, every tally equal**. `b92Rates` equals the closed forms (kept 0.292893; Q 0, 0.353553, 0.146447;
  Eve right 0.5, 0.646447, 0.853553) to 1e-9. Beat b3's run: kept 293 of 1000 (z = 0.01 from 0.2929), 105 wrong of 293 (0.358,
  z = 0.17 from 0.3536); every wrong kept bit sits in an "unsure" row; the six drawn rows (995–1000) hold a sure-and-right kept bit,
  an unsure-and-wrong kept bit and two blanks, as the caption says. Readouts: "kept 293 of 1000 · exact share 0.2929 · kept bits
  wrong 0.358 · 1σ band ±0.028 · exact error rate 0.3536" — all recomputed.
- Sources: Bergou p. 107 (PDF 118): Bob's success 1 − 1/√2 ≈ 0.293; a never-wrong Eve fails 1/√2 ≈ 71 % and Bob's wrong bit is
  1/(2√2) ≈ 35.3 %; p. 108: the minimum-error Eve's 14.6 % and "about 85 %". These are exactly the two attacks `b92Rounds` offers
  ('usd', 'minerr'), no third; b3 Formal's "(Bergou p. 107)" is the right page. §7.1 p. 117: 2^{n−1} + 1 classical queries (the cost line's
  5 and 9); §7.2 p. 120: n + 1 queries, x = 0 then the unit strings (the BV cost line's 4 and 5).
- Existing BB84 content: the 21 `bb84` states of L8 and Q15 (no `protocol`) resolve byte-identically under the pre-merge and merged
  resolvers at s = 0, ½, 1, readouts included. Q15's four L8 bridges still register and are used (`Q15.test.ts`).
- Tests: `vitest run` on crypto, oracles, OracleBench, bb84B92, Q15, Q16/Q17 tryits, visualSpecs, claims: **9 files, 4 529 passed**.
  `e2e/oracle-bench.spec.ts` on :5261 (preview): first run 11/12 (nit 6), the failing test 3/3 on repeat, the whole file 12/12 alone.
  Screens at 1280 and 375 for all four modes read.
- Lazy and budget: the chunk report of the 08:00 build on `c903cbf` has `OracleBench-*.js` (widget, model, css) as its own dynamic chunk,
  `crypto-*.js` and `Bb84Scene-*.js` likewise; the entry closure (21 files) is 885 434 raw / 292 960 gzip, inside 915 000 / 301 000 and
  free of all three. `visualSpecs.test.tsx` carries the props interface, value, cross and dormant-prop rules. `interface-changes.md`
  rows W16-A, W16-B, Q15-A, Q15-B present and accurate (Simon needed no kind field: `outcomes` and `keep` already existed).
- A11y (read + e2e): every control is a native button, range or radio with a name (`radiogroup` + `aria-label`, bit buttons
  `aria-pressed` with "…, bit k of n: b", slider `<label>`); the step buttons are enabled one at a time in circuit order; the
  sentence under them is `role="status"` (the widget-local pattern of the other benches); the three svgs are `role="img"` whose labels
  carry the kind readouts; a long circuit scrolls in a focusable, named group. 375 px: a container query (≤ 700 px) stacks setup →
  steps → drawing → readings; no page overflow (asserted at 375 for every mode).

## Blocking
None.

## Should-fix
1. **Q17 unit 3 (`q17-two-reflections`) Try-it uses symbols the Ground track has not met.** "The arrow lands at (2k+1)α = 62.1° …" names
   k and (2k+1)α, which unit 4 introduces (story `q17-iterate`, "After k steps it sits at (2k+1)α"); unit 3's own beats only say "one
   step turns the arrow by 41.41°". Its first line says "the line through |w₀⟩, which D uses", but D is named only in unit 3's Formal
   beat (`D = −U_{w₀}`) and in Ground at unit 4; a Ground reader knows it as "the other mirror R_{w₀}". Fix (text only, both tests
   re-point): "Press Diffuse (D), the mirror through |w₀⟩. The arrow lands at 62.1°, 41.4° beyond its start at 20.7°: two mirrors have
   made one turn of 2α." and "…and the line through |w₀⟩, which the rest of the step uses."
2. **Q16 unit 1 (`q16-hadamard-n`) runs the bench in BV mode, so the widget itself names things three units early.** With
   `{mode:'bv', n:3, a:5, b:0}` the selected radio reads "Bernstein–Vazirani", the function line "f(x) = a·x ⊕ b with a = 101, b = 0"
   and the cost line "4 classical" — a·x ⊕ b and the algorithm's name arrive in `q16-bv:b1` (the ⊕ b part is nowhere in unit 1). The
   two Try-it sentences themselves are true and well scoped (the bars after Oracle ARE H^{⊗3}|101⟩, verified). Cheapest honest fix: a
   third sentence that frames it ("The function line names a later unit's f; for now the oracle only writes the signs (−1)^{101·x}.")
   or `editable:false` plus the same framing; the clean fix is a `hadamard` family (engine `hadamardRun(x, n)` exists) with no cost line.

## Nits
3. `q16-classical-cost` Try-it, sentence 1 is 26 words (cap 25): drop "under the buttons" (the readings sit under the buttons in both
   layouts anyway).
4. Wire names differ by mode inside one widget: DJ/BV/Simon label x₂ x₁ x₀ (and f₁ f₀), Grover labels q0 q1 q2 (`groverCircuit` sets no
   `wires`); Q17's own views are the same, so this is chapter-consistent, but a learner switching modes sees two conventions. Fix in
   `grover.ts` (`wires: inputWires(n)`-style names) if Q17's captions never say "q0".
5. Bar labels show two decimals when eight or more bars are drawn ("0.35", "−0.31") while the headline, readings and Try-its say 0.354
   / −0.309 — the shared kind's crowded rule; fine, but the Try-it's "each of size 0.354" is read off the headline, not the bars.
6. e2e flake, worth a note for skill 17: in the first full run (a vitest batch running beside it) the Grover unit-1 test found the headline
   back at "Start: every wire is |0⟩. Press Prepare." right after a successful Prepare and a click on Mark (U_f) — the symptom of a
   remount or a `setHist([START])`, not a timeout. 4/4 green alone; if it recurs, instrument `hist` resets.
7. `OracleBench.tsx` computes `N = 2 ** v` for the slider caption and the model `N: 2 ** n` — counts, not physics, but the only numbers
   on the widget not read from the engine; `benchModel` could expose `N` from the circuit (`2 ** circuit.qubits` is the same thing).
8. B92 ledger: Bob's blank reads "unsure" (the same word as Eve's failed never-wrong reading); the chapter's own word for Bob is
   "no answer" / inconclusive (b2). Consider "no answer" in Bob's cell so the two parties' states are not confused in a glance.

## Checked and right (beyond the evidence above)
- D1: one widget, `bb84-bench` shell, n ≤ 4, DJ / BV / Grover (N ≤ 16, steps U_f / D / Q, plane beside the bars) and Simon with no new
  kind field; every number via `oracles.ts` / `grover.ts` / `runCircuit`; new helpers (`balancedStepTable`, `djFamilyTable`,
  `mostLikelyString`, `onesCount`) have numpy twins (`bench_cases`); the nine stand-ins replaced; Q18's Try-its untouched.
- D2: `b92Rounds(count, seed, eve)` seeded like `bb84Rounds` (four draws a round, so Eve on/off never moves Alice's bits — checked across
  seeds 84 none/usd/minerr in the fixture); the `bb84` kind's `protocol:'b92'` and `last` are additive (validator rejects 'usd'/'minerr'
  for BB84, boards and test samples for B92); b3 is a `split` of two different kinds (`bb84`, `bloch-ball`), the exact-rate sphere kept;
  both captions name what the rows show and quote 1000 / 6 / 293 / 105; 293 and 105 are claims with numpy twins (`q15.py`); BB84 is still
  not re-derived in 709. Passport "PROTOCOL LEDGER · B92" and the `bb84-b92` drawer (6 notes, the lucky-guess caveat included).
- No raw TeX outside `$…$` in the new strings; no plan ids in learner-visible text; no glossary change (no duplicate possible); the new
  formulas use notation already carded (kets, Q = s/2); the `qber` gauge's "exact 0.354" tick and the 0 … ½ scale are honest for B92.
- The e2e's Simon check (any answer read gives ¼ on s^⊥) and its keyboard test (Enter / Space on buttons, bit buttons, radios) pass.
