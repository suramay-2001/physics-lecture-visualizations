# R review: notation explainers (merge 175b646, reviewed 2026-10-11)

An independent, read-only review of the notation explainers on main. It judges the build against the decision
(`docs/roles/decisions/notation-explainers.md`) and the spec (`docs/specs/notation-explainers.md`), not against the
builder's report. No code was changed.

**Verdict: PASS with fixes. 0 Blocker, 13 Major, 14 Minor.**
- **Safe and lazy.** The KaTeX trust, the context codec, the CSP and chunk rule (o) all hold.
- **The examples' numbers are right.** All 59 examples are correct: 263/263 notation tests pass, and I re-derived
  every value by hand.
- **The defects are in the words.** Two dictionary sentences are wrong physics. Six classes of context sentence say
  something false about the formula they sit on. Three 448 "learn it" links point at units that do not teach the
  notation.
- **Keyboard and screen readers.** The open concern is confirmed: up to 282 Tab stops in one chapter, and a card opens
  on every one of them. Tab out of a card leaves the page, and a screen reader is not told the card's text.

**How this was checked**
- **Tests.** The four notation test files ran green (263 tests).
- **Corpus scripts.** Temporary vitest scripts, since deleted and never committed, read every TeX span of all 36
  chapters in every track. Each span went through the real path: `markNotation`, then `renderAuthoredTex`, then the
  `data-*` attributes, then `readMark`, then `entry.here()`. That gave 16 924 marks, each with its context sentence.
- **Coverage.** A regex scan of the same spans looked for notation that is never marked.
- **Security.** Probes went through `renderAuthoredTex` and `renderUserTex`.
- **Bundle.** The chunk report of main's 2026-10-11 03:58 build was walked with the rule (o) logic.
- **Not run (per the brief).** No Playwright and no `npm run build`, so on-screen geometry is flagged "verify", not
  asserted.

## Findings

| # | Sev | Where | What is wrong | Fix |
|---|---|---|---|---|
| 1 | Major | `ui/Rich.tsx:35-40`, `components/NotationRuntime.tsx:145-153` | **Tab stops.** Every formula with a mark is a Tab stop: L4 has 282, L3 275, Q2 Formal 261 (table below). That is 2 071 stops across 448 and 3 806 across 709 Formal. Focus alone also opens a card, so tabbing through L4 pops up 282 cards. The decision says "Tab to it, **Enter opens**". WCAG 2.1.1 is met, but the keyboard path to a chapter's controls is impractical, and SR users in focus mode hear every formula. | Use one roving Tab stop per reading group (a story beat with its derivation, a review card, a challenge, the insight and pitfalls); code shape below. The arrows walk every mark of the group across its formulas, Home and End jump, and Tab leaves the group. Open the card on Enter or Space, not on focus. Worst chapter: 282 → 63 stops. |
| 2 | Major | `components/NotationCard.tsx:68`, `:74-78`; `Popover.tsx:56-71` | **Focus order out of a card (WCAG 2.4.3).** The card is portalled to the end of `<body>` and gets no `onKey`, so Tab from its link leaves the document. Focus goes to the browser chrome, the card closes, and the reader's place is lost; Shift+Tab lands on the page's last control. The × button closes the card but leaves focus on a removed node (body). | Give the card an `onKey`: Tab or Shift+Tab closes it and focuses the formula (`host.focus()`), then lets the next Tab carry on from there. × returns focus to the formula when the card held it. Add an e2e step. |
| 3 | Major | `components/NotationRuntime.tsx:74-85`, `:187-192` | **Screen readers.** `aria-describedby` is set on the formula before the card exists, and on first use the card is still a lazy chunk. The value never changes when the arrows move to another mark, so the new card's text is never announced. The spec's "screen readers get the card text" is not met in practice. | Add one visually hidden `role="status"` (`aria-live="polite"`) region in `NotationRuntime`. When a keyboard-opened card mounts or its anchor changes, write a short line into it: name, "read as …", plain meaning. Keep `aria-describedby` for an on-demand reread. Check with VoiceOver and NVDA. |
| 4 | Major | `content/notation.entries.ts:179` (ket.physics) | "**Squaring an amplitude** gives the chance" is false for complex amplitudes: (i/√2)² = −½. This sentence shows on every ket card: 4 420 marks in 35 chapters. | Change it to "The squared size of an amplitude, \|c\|², is the chance of the matching reading." |
| 5 | Major | `content/notation.entries.ts:962` (hbar.ground) | "Spin values come in **steps of ħ/2**" is wrong. A spin-½ component reads ±ħ/2, which are a step of ħ apart, and components always step by ħ. This is 448's only voice for ħ: 569 marks in 19 chapters. | Change it to "A spin component of an electron reads only +ħ/2 or −ħ/2." |
| 6 | Major | `content/notation.entries.ts:330` (commutator.here) | "Here: A then B minus B then A" contradicts the card's own meaning: "AB: do B first, then A". Read that way it is BA − AB, the wrong sign. It appears at 38 sites (L7, F3, F4, Q3 …), e.g. `l7-compatible:b2`, `l7-uncertainty:b3`, `f4-commuting:b2.derivation`. | Change it to "Here: $A$ times $B$ minus $B$ times $A$ (in $AB$, $B$ acts first). Zero means the order does not matter." |
| 7 | Major | `content/notation.entries.ts:312-315` (abs.here) | Any `\|…\|` with a `\langle` inside is called "the size of an **overlap**. Squared, it is a **chance**." That includes averages: \|⟨S_z⟩\|, \|⟨[A,B]⟩\|, \|⟨ΔA ΔB⟩\|² are the uncertainty relations, the key formulas of L7, Q3 and Q10. 15 sites, e.g. `l7-uncertainty.lecture`, `l7-uncertainty:b4`, Q3 `q3-uncertainty`, Q10 `\|⟨C⟩\|`. | Call it an overlap only when the bracket holds a bar (`⟨a\|b⟩`, `⟨a\|M\|b⟩`). Otherwise say "The size of the average of …" and drop "a chance". |
| 8 | Major | `ui/notationMark.ts:456-465` (phase), `notation.entries.ts:691-695` | **Operator exponentials are marked as a phase factor.** `e^{-iφS_z/ħ}`, `e^{-iĴ_zφ/ħ}`, `e^{-iφσ_y}`, `e^{-iθ n̂·σ⃗/2}`, `e^{-iωtZ/2}`, `e^{-iσ_z t}` all get "a point on the circle of radius 1 … a turn by φS_z/ħ from 1". These are rotation or evolution **operators**. 18 sites: `l5-invariance:b6`, `l6-generator` (5), `l7-full-turn`, `l8-photon-spin`, L11, F4 `f4-unitary`, Q4 `R_n(θ)`. `e^{-iHt}` stays unmarked only because `iH` is not followed by a non-letter. | Do not mark `phase` when the exponent holds an operator token (`S_`, `J_`, `\sigma`, `\hat`, `\vec`, `\mathbf`, `\boldsymbol`, or a capital gate letter). Better, add an `exp-operator` entry: "e to an operator: the rotation or evolution it generates". |
| 9 | Major | `ui/notationMark.ts:526-550` (gate trigger: `X²` at 536-542, a bar after a letter at 535) | **Bare gate letters mark things that are not gates.** In F5, X is a random variable, but `⟨X²⟩` triggers gate mode and every X becomes "Pauli X … the NOT gate": 11 formulas in `f5-spread` (b1, derivation, books, review). In Q10, the CHSH value `\|X\| = 2` and `\|∑P X\|` get the same (5). In Q12, `Tr(X^{T_B}Y)` has arbitrary operators (1). The existing test only covers `⟨X⟩` and `(ΔX)²` alone. | Drop the `X²` trigger when the X sits inside `\langle…\rangle` or has no ket, ⊗ or gate neighbour. Make a letter followed by `\|` count only when a `\rangle` closes the bar. Simplest option: a per-chapter opt-out (`NotationScope.gates = false` for F5). Add these formulas to the never-marked test. |
| 10 | Major | `ui/notationMark.ts:432` (named → trace), `notation.entries.ts:336-349` | **The partial trace is explained as the full trace.** `\mathrm{Tr}_B ρ` gets the Tr card: "add up the numbers on the diagonal … The result is a single number". The partial trace is an operator. 22 sites, in Q9 `q9-partial-trace` (its subject), Q10, Q11, Q13. | Emit a `partial-trace` id when Tr has a subscript, with its own entry: "trace out B: what is left is the state of A". Its taught link is `q9-partial-trace`. |
| 11 | Major | `content/notation.entries.ts:472-476`, `:465` (hat) | **F8's DFT coefficients get the wrong meaning.** `\hat c_k` is read as "Here the hat on c marks a direction of length 1". There are 8 sites in `f8-dft` (21 distinct formulas, both tracks). The entry's two meanings miss the Fourier-transform hat. | Treat a hatted letter as a unit vector only for n, r, x, y, z, m, a, b in a spatial context. Add a third meaning, "a transformed (Fourier) coefficient", and use it in F8, or keep `\hat c` unmarked. |
| 12 | Major | `content/notation.entries.ts:331`, `:152`, `:525` (taught) | **Three 448 "learn it" links go to units that do not teach the notation.** Commutator → `l7-order`, which has no commutator in its text; `l7-compatible` defines `[A, B] = AB − BA`. Dagger → `l11-unitary`, which uses † but does not define it; `l3-eigen` defines "the Hermitian conjugate A†", and † appears from L3 on. Sigma-dot → `l6-bloch`, which has n̂·r⃗, not n̂·σ⃗; `l5-inverse` defines σ_n = n̂·σ⃗. | Point them at `l7-compatible`, `l3-eigen` and `l5-inverse`. Add a test that the taught unit's own text marks the id, or names it in a gloss. |
| 13 | Major | `content/notation.entries.ts` (every `example`), e.g. `:166`, `:219`, `:611`, `:751`, `:924` | **Numbers typed, not computed.** The decision (#4) and CLAUDE.md say every learner-visible number is computed and tested. Most example captions (`says`) restate results as typed text: "gives 25", "50 % chance", "the rank is 1", "84 = 2·36 + 12". 51 of 59 captions contain digits, and only sum, product and part of xor interpolate them. Eight example TeX strings type the result: `−\|11⟩` (cz; its computed `amplitude` is unused), `\|−z⟩` (arrow), the Pauli and H result labels, "is true or false" (element), and the σ⃗ coefficients. `gcd` re-implements the engine's `physics/qc/numtheory.ts` `gcd`. Every number is currently right (hand-checked), but nothing ties the words to `values`. | Interpolate from `values`. Add a lint test: every digit run in `says` and `tex` is an input constant or appears in `values`. Use `numtheory.gcd`. |
| 14 | Minor | `content/notation.entries.ts:584` (hadamard.here) | "Here H is the Hadamard gate acting on **one qubit**" also shows on `H^{⊗n}` (8 sites: `q16-hadamard-n` …, Q4, Q5, Q17). The nested ⊗n mark is right. | Use the captured script: "applied to each of n qubits" when the mark has `^{\otimes …}`. |
| 15 | Minor | `ui/notationMark.ts:243-261` (operand) | **Capture slips in the operand.** `\det S_x` → "the determinant of S" (the subscript is dropped); likewise `\det B_{z←x}`, `\det R_z`, `\det A_{jk}`. `\det\begin{pmatrix}…` → "the determinant of `\begin`", which renders as red error text in the card (`f4-eigen:b2.derivation.ground[2]`). | Take a letter together with its scripts. Take `\begin…\end` as one unit via `envEnd`. Never return a bare control word. |
| 16 | Minor | `ui/notationMark.ts:309-321` (langle sandwich) | In `⟨b\|_B ρ\|b⟩_B` the bra's subscript leaks into M: "The average of `_B ρ` in the state b". ⟨b\|ρ\|b⟩ inside a partial trace is a partial matrix element (an operator), not an average (`q9-partial-trace` ×3). `⟨0\|ρ\|0⟩` is "the average of ρ", which is literal but should read "the population of \|0⟩". | Let the scripts after the bra's bar belong to the bra. Give M = ρ (or a projector) a "chance of …" sentence. |
| 17 | Minor | `content/notation.entries.ts:435-442` (matrix.here) | Every 2 × 2 grid is "an operator on a space of 2 states". That is wrong for F6's amplitude table `C` (`f6-product-or-not` hints ×2), the block matrix `[A_{ij}B]` in Q6, and F1's rotation of the plane. "A state of 1 qubit" is 709 wording on 448 cards. | Use softer wording ("a 2 × 2 table, for example an operator …"), or key off the captured name (`C =`). Use "spin state" for 448. |
| 18 | Minor | `content/notation.entries.ts:240` (sandwich.here) | Off the diagonal, the sentence is always "How much M turns b into a", in both tracks. The brief asks for "M's matrix element between a and b". The "turns" picture misleads for observables and POVM elements (`l4-matrices.play.l4-m-basis`, `q14-usd`). | Formal: "the (a, b) matrix element of M". Ground can keep "turns". |
| 19 | Minor | `notation.entries.ts:515`, `:517` (sigma-dot) | "Readings +1 and −1" and "a Stern–Gerlach magnet … measures exactly this operator" leave out the ħ/2. The ħ card says ±ħ/2. | Add "in units of ħ/2" (S_n = (ħ/2) n̂·σ⃗). |
| 20 | Minor | `notation.entries.ts:401`, `:747`, `:549` | **Wording.** span: "two **different** states span the qubit space" should be "two states that are not multiples of each other". arrow.formal uses → for element-wise "M: \|a⟩ → \|b⟩", which the ↦ entry says is ↦'s job. pauli-y: "which is why spin states need complex numbers" overreaches. | Reword. |
| 21 | Minor | `content/notation.entries.ts:168`, `:940`, `:492`, `:508` (taught) | **Weak links.** Conjugate (448) → `l2-inner-product`, but `l2-complex` defines z*. Floor → `f8-fractions`: no chapter writes ⌊ ⌋, and F8 only says "integer part" in prose. vec (709) → `q3-bloch`, which never writes r⃗ (709 uses `\mathbf r` in Q8). sigma-vec (448) → `l4-matrices`, which has no σ⃗. | Repoint, or drop the link when nothing teaches the notation. |
| 22 | Minor | `ui/notationMark.ts` (coverage) | **Universal notation in ≥ 3 chapters that is never marked.** S_x, S_y, S_z: 18 chapters, 657 spans. ×: 26 / 145. ≠, ≤, ≥: 19 / 14 / 13 chapters, while ≈, ∝, ⇒ are explained. ΔA spread: 7 / 205. R_z, R_n: 7 / 148. Bold vectors `\mathbf r`, `\boldsymbol\sigma`: 5 and 3 chapters; Q8's Bloch vector is unexplained although `\vec r` is explained. `\binom10` column vectors: 4 chapters, 60 spans, 44 of them in L4; pmatrix columns are marked. ≡: 4. ⊥: 4. ∣: 4. `e^{2πi…}` (DFT and QFT phases): 3. | Map `\mathbf{x}` to vec and `\boldsymbol\sigma` to sigma-vec or sigma-dot, and `\binom` columns to matrix. Accept `2\pi i` as a phase prefix. Add ×, ≠, ≤, ≥ next to ≈. Put S_i, ΔA and R_n in the decision #3 "later phase" list. |
| 23 | Minor | `ui/notationMark.ts:551-559`, Q7 | Subscript labels such as `P_{XXX}` and `\hat O_{XXX}` get the "NOT gate acting on one qubit" card (Q7). | Skip gate letters inside a script. |
| 24 | Minor | `styles/notation.css:8-11` | **Verify in 09-visual-qa.** The dotted underline is a `border-bottom` on an inline `.enclosing` span. Around tall content (a display Σ with limits, a pmatrix, `\frac{d}{dt}`) the border follows the span's own font box, not its inline-table children, so it may cross the lower limit or the matrix. | If confirmed, give marks around tall content `display: inline-block` (atomic, the same as a mark already is for line breaking) or draw the underline on the inner box. |
| 25 | Minor | `components/Popover.tsx:36-43`, `styles/notation.css:32-33` | **375 px card position.** The clamp keeps the card on screen, but when it fits neither below nor above it is clamped over its own anchor. `max-height: calc(100vh − 16px)` runs under iOS toolbars, so the card's bottom can sit off-screen. The CSS width of 22rem (352 px) disagrees with the Popover's 320 px max. | Use `100dvh` or `innerHeight` for max-height, and prefer placing the card beside or below with internal scroll. Align the widths. |
| 26 | Minor | `content/walk.ts:156-163`, `components/NotationKey.tsx:22-27` | `texSpans` does not look inside `**bold**` or `*italic*`, but `Rich` does. Notation used only there is marked on the page but missing from "Notation in this chapter". The key also lists notation that occurs only in hidden hints and walkthroughs. | Walk bold and italic tokens in the key, the way `Rich.inline` does. |
| 27 | Minor | `build/chunkGraph.ts:151-152`, `components/NotationRuntime.tsx:161-164`, LecturePage | **Small items.** `isNotationLazy` omits `ui/notationCodec.ts`, so a later static import into the entry would go unnoticed. While any card is open, Esc is captured and stopped at `document`, so another widget's Esc never fires. The ruling "Read/print mode: no cards" is built as print-only: on-screen Read mode keeps marks, cards and Tab stops. The key fetches the dictionary, the pre-processor and itself (≈ 69 KB raw) on every lecture view, even with cards off. | Add the codec to the regex. Stop Esc only when the card or its formula has focus. Confirm with the judge whether "Read mode" in the ruling means the on-screen mode. Load the key's data on unfold or `beforeprint`. |

**Code shape for fix 1** (one Tab stop per reading group, Enter opens):

```ts
// ui/Rich.tsx: after the formulas of a group render
const GROUP = '[data-notation-group]'          // StoryStage beat, ReviewCard, each Play challenge, insight + pitfalls
function rovingMarks(root: HTMLElement) {
  const group = root.closest<HTMLElement>(GROUP) ?? root
  const hosts = [...group.querySelectorAll<HTMLElement>('.katex')].filter((k) => k.querySelector('[data-notation]') && !k.closest(UNEXPLAINED))
  hosts.forEach((k, i) => (k.tabIndex = k.dataset.nfocus !== undefined || (i === 0 && !group.querySelector('[data-nfocus]')) ? 0 : -1))
}
// components/NotationRuntime.tsx keydown, focus on a host
const all = hostsOf(group).flatMap(marksIn)    // every mark of the group, in reading order
const next = all[all.indexOf(c.anchor) + step]
if (next) {
  const h = hostOf(next)!
  if (h !== host) { host.tabIndex = -1; delete host.dataset.nfocus; h.tabIndex = 0; h.dataset.nfocus = ''; h.focus() }
  set({ ...c, anchor: next, host: h }); announce(next)   // the live region of fix 3
}
// focusin: outline only, plus a static hint (aria-describedby → "Enter explains the notation; arrows move"); Enter or Space opens and pins
```

## Tab stops per chapter

The count is formulas with at least one mark that are visible by default and not inside a control. Hints,
walkthroughs, reveals, answer options and `.lecture`/`.books` blocks of story units are left out. Each cell reads
"now / with fix 1". 448 has one track.

| Chapter | Ground-up | Formal | Marks shown | Most marks in one formula | Worst unit (stops) |
|---|---|---|---|---|---|
| L4 | 282 / 63 | — | 502 | 11 | l4-matrices (58) |
| L3 | 275 / 60 | — | 550 | 15 | l3-postulates (67) |
| Q2 | 210 / 49 | 261 / 56 | 532 | 12 | q2-change (52) |
| Q6 | 220 / 48 | 249 / 57 | 882 | 18 | q6-parities (64) |
| Q8 | 246 / 49 | 232 / 52 | 477 | 10 | q8-mixed (60) |
| L6 | 233 / 61 | — | 429 | 13 | l6-bloch (60) |
| L11 | 227 / 52 | — | 353 | 6 | l11-two-level (60) |
| L7 | 214 / 59 | — | 350 | 7 | l7-spreads (45) |
| F4 | 182 / 45 | 213 / 48 | 357 | 7 | f4-spectral (50) |
| L2 | 203 / 52 | — | 358 | 11 | l2-inner-product (52) |
| Q1 | 147 / 39 | 203 / 51 | 418 | 11 | q1-two-spots (49) |
| F3 | 148 / 40 | 201 / 43 | 453 | 9 | f3-change-of-basis (47) |
| F2 | 154 / 37 | 191 / 44 | 420 | 7 | f2-norm-angle (47) |
| L5 | 190 / 49 | — | 323 | 12 | l5-averages (56) |
| F6 | 167 / 41 | 185 / 42 | 404 | 11 | f6-operator (42) |
| Q9 | 162 / 37 | 177 / 46 | 428 | 13 | q9-distance (37) |
| F1 | 116 / 34 | 174 / 45 | 327 | 7 | f1-phase (47) |
| Q14 | 119 / 29 | 165 / 45 | 288 | 6 | q14-usd (36) |
| F8 | 71 / 29 | 164 / 42 | 245 | 4 | f8-dft (44) |
| Q4 | 65 / 15 | 137 / 41 | 380 | 11 | q4-one-qubit-gates (41) |
| Q12 | 79 / 28 | 137 / 42 | 265 | 9 | q12-concurrence (27) |
| Q15 | 97 / 25 | 135 / 32 | 240 | 6 | q15-sharing (41) |
| L10 | 134 / 45 | — | 250 | 7 | l10-empty-centre (34) |
| L9 | 128 / 41 | — | 261 | 12 | l9-two-spins (32) |
| Q17 | 74 / 21 | 124 / 32 | 251 | 9 | q17-plane (38) |
| F5 | 85 / 23 | 117 / 29 | 205 | 7 | f5-spread (42) |
| Q16 | 91 / 18 | 117 / 23 | 289 | 9 | q16-hadamard-n (49) |
| Q10 | 83 / 25 | 111 / 31 | 188 | 6 | q10-violation (42) |
| F7 | 69 / 20 | 108 / 32 | 164 | 6 | f7-xor (55) |
| Q13 | 78 / 25 | 107 / 35 | 264 | 8 | q13-from-unitary (27) |
| L8 | 98 / 35 | — | 154 | 7 | l8-photon-spin (36) |
| Q7 | 88 / 18 | 93 / 28 | 284 | 22 | q7-observables (33) |
| Q11 | 70 / 28 | 93 / 31 | 249 | 8 | q11-teleport-algebra (24) |
| L1 | 87 / 36 | — | 142 | 13 | l1-vectors (39) |
| Q3 | 72 / 18 | 68 / 26 | 181 | 9 | q3-spectral (19) |
| Q5 | 42 / 10 | 44 / 19 | 194 | 11 | q5-deutsch (13) |

Totals: 448 has 2 071; 709 has 2 935 (Ground-up) and 3 806 (Formal). Before this feature, only formulas with TeX term
links were Tab stops: 7 in L1 and 4 in L3.

## Context sentences checked

These are sentences produced through the real render path, with the formula's location id. Beyond this sample, every
sum, product, matrix element, outer product and absolute value in the corpus was scanned for the failure classes above.

**Physics 709**
- **Sums and products: OK.** `q11-swapping:b2.derivation`, `q2-gram-schmidt.review` (∑ over i<j),
  `q16-dj.play.q16-dj-const.hints[0]`, `q13-from-unitary:b3.derivation.ground[0]`, `q8-recipes:b4.derivation.ground[0]`,
  `f2-inner-product.review`, `f5-spread:b3.derivation.ground[0]`, `q9-partial-trace:b1.derivation.ground[1]`,
  `f3-matrix-of-map:b2`, `q14-povm.review`, and the product over j: z_j = 1 at
  `q16-hadamard-n:b2.derivation.ground[2]`. Nit: `\sum_{xy}` reads "every possible xy", one counter rather than a pair.
- **Bra-kets: OK.** `f2-norm-angle:b5.derivation.ground[1]`, `q3-born:b2.derivation.ground[2]`,
  `q1-inner-product:b7`, `q2-change.play.q2-c-u22`, `q8-pure-rho:b3.derivation.ground[3]`,
  `f4-hermitian:b4.derivation.ground[1]`, `q9-schmidt.play.q9-sc-overlap`, `q7-brackets:b3.derivation.ground[2]`.
- **Matrix elements: OK, with one wrong.** OK: `q3-born.review`, `f3-matrix-of-map:b5`, `f4-positive:b1`,
  `q6-tensor:b4.derivation.ground[3]`, `q2-change:b5.derivation.ground[0]`, `q12-witness.play.q12-wi-why.hints[2]`.
  OK but loose wording ("turns", #18): `q14-usd:b1.derivation.ground[2]`. **WRONG**:
  `q9-partial-trace:b1.derivation.ground[3]` (#16).
- **Outer products: OK.** `q8-recipes:b2.derivation`, `q14-povm:b2.derivation.ground[2]`,
  `q11-teleport-circuit:b3.derivation.ground[0]`, `q9-partial-trace:b3.derivation.ground[1]`,
  `f2-orthonormal:b5.refs[0]`.
- **Absolute values: OK, with three wrong.** OK: `q7-parity-table:b1.derivation`, `q15-e91.review`,
  `f4-commuting.play.f4-c-commutator.hints[2]`, `q14-usd.play.q14-usd-succ.hints[0]`, `f1-multiply:b3`,
  `f8-geometric:b3.derivation.ground[2]`. **WRONG**: `q3-uncertainty.play.q3-u-floor` and Q10 `|⟨C⟩|` (#7), and
  Q10 `|X| = 2` (#9).
- **Averages: OK.** `q10-no-signal.play.q10-n-rb.hints[2]`, `f5-spread:b1.derivation.ground[0]` (the ⟨X⟩ mark itself),
  `q3-spectral:b5.derivation.ground[0]`, `q8-why.play.q8-w-yy`, `q6-tensor:b4.derivation.ground[4]`.
- **Commutators: WRONG (#6).** `f4-commuting:b2.derivation`, `q3-uncertainty.play.q3-u-floor`.
- **Determinant and trace: OK, with partial traces wrong.** OK: `f4-eigen:b2`, `f6-product-or-not.play.f6-pr-det-prod`,
  `q8-recipes:b2.derivation.ground[3]`, `q12-witness.play.q12-wi-val`, `q9-entropy.review`, `q8-trace-rule.review`.
  **WRONG**: every `Tr_B` in `q9-partial-trace` (#10).
- **Phase factors: OK, with one wrong.** OK: `f1-phase:b3.derivation`, `q8-trace-rule.play.q8-t-quarter.hints[0]`,
  `f4-unitary.visual.tryThis[1]`, `q5-interferometer:b2.derivation.ground[4]`. **WRONG**: Q4 `R_n(θ) = e^{-iθ n̂·σ⃗/2}`
  (#8).
- **Kronecker deltas and tensor powers: OK.** `q2-basis:b4`, `q8-recipes:b4.derivation.ground[3]`,
  `q16-bv:b2.derivation.ground[2]`, `q7-ghz:b3.derivation.ground[4]`.
- **Gate letters: OK, with three wrong.** OK: `q5-deutsch:b3.derivation.ground[0]`,
  `q4-one-qubit-gates:b4.derivation.ground[0]`, `q7-observables:b3.derivation.ground[1]`,
  `q8-ball:b4.derivation.ground[0]`. Loose wording, X is an observable here: `q10-violation.play.q10-v-s.walkthrough[0]`.
  **WRONG**: `f5-spread:b1` and its derivation and review (#9), `q16-hadamard-n:b2.derivation` (#14), and every F8
  `\hat c_k` in `f8-dft:b1` and `b3` (#11).

**Physics 448**
- **Sums: OK.** `l9-classical:b3.derivation.ground[2]`, `l6-mixture.review.points[0]`, `l3-spread.lecture`,
  `l8-variance-sum:b3.derivation`, `l4-basis:b5`.
- **Bra-kets: OK.** `l2-inner-product:b2`, `l1-sequential.play.l1-s-zxz.walkthrough[1]`, `l3-postulates:b2`,
  `l7-two-angles.review`.
- **Matrix elements: OK.** `l3-postulates:b4`, `l7-order.review`, `l11-unitary:b2.derivation.ground[1]`. Loose
  wording (#18): `l4-matrices.play.l4-m-basis`.
- **Outer products: OK.** `l3-postulates:b2`, `l4-matrices:b3`, `l5-coordinates:b6`.
- **Absolute values: OK, with uncertainty relations wrong.** OK: `l9-product:b4.derivation.ground[1]`,
  `l7-two-angles.review`, `l3-postulates:b5`, `l6-bloch.review.points[0]`. **WRONG**: `l7-uncertainty:b2`, `:b4`,
  `.lecture`, `.lecture.equations[0]`, `.visual.tryThis[0]` (#7).
- **Averages: OK.** `l1-average.review.points[2]`, `l5-averages.review.points[1]`, `l6-bloch.lecture.equations[0]`.
- **Commutators: WRONG (#6).** `l7-uncertainty:b3`, `l7-compatible:b2`, `:b4`, `:b7`, `l7-compatible.pitfalls[1]`.
- **Phase factors: OK, with operator exponentials wrong.** OK: `l2-complex:b7`, `l11-two-level:b4`. **WRONG**:
  `l5-invariance:b6`, `l6-generator` and its `.lecture`, `l7-full-turn:b4`, `l8-photon-spin.lecture.equations[1]`
  (#8).
- **Kronecker deltas: OK.** `l4-basis.review`.
- **Determinants: OK, with two wrong.** OK: `l5-inverse.play.l5-inv-values.hints[1]`, `l4-eigen.review`. **WRONG**:
  `l4-eigen.play.l4-g-zero.walkthrough[0]` (`\det S_x` → "S") and `l6-active:b8` (#15).

Tally: 117 sentences. A group such as "every `Tr_B` in q9-partial-trace" counts as one. 86 are right, 3 are right but
loosely worded, and 28 are wrong (11 in 709, 17 in 448). Every wrong one belongs to findings #6–#11 or #14–#16.

## What passes

- **The dictionary's arithmetic.** I re-derived all 59 examples by hand: Σi² = 30, 4! = 24, 1011 ⊕ 0110 = 1101,
  A† of [[1, i], [0, 2]], ⟨+z|+x⟩ = 1/√2, ⟨σ_z⟩ = ½ in (√3/2, ½), Tr = 7, det = 10, rank 1, [σ_x, σ_y] = 2iσ_z,
  n̂·σ⃗ at 60°, CNOT|10⟩ = |11⟩, SWAP|01⟩ = |10⟩, gcd(84, 36) = 12, H(½) = 1 bit, S_z readings ±½ħ, and the rest.
  Conventions are right: † vs * vs transpose, ⟨a|b⟩ linear in b, ‖·‖ vs |·|, and ⊗ big-endian with q0 leftmost
  (engine C2; |01⟩ is index 1, CNOT control first, CZ = (I⊗H) CNOT (I⊗H)). δᵢⱼ, mod, gcd, floor, log₂, e^{iφ}, the
  Pauli and Hadamard matrices, and ħ = 1 in the engine with ħ added in the UI are all correct. In the plain meanings,
  only #4, #5, #19 and #20 need changes.
- **Voices.** Ground-up sentences stay within 25 words and Formal within 40, as the test enforces. 448 reads the
  Ground voice. All 709 entries except the school symbols have a distinct Formal voice.
- **Security.** Every probe below was refused: it rendered no mark, the strict renderer threw, and no attribute or tag
  was emitted.
  - `\href{javascript:…}`, `\href{https://…}`, `\url`
  - `\htmlClass{evil}`, `\htmlStyle`, `\htmlId`, `\includegraphics`
  - `\htmlData{foo=bar}`, `\htmlData{notation=sum,foo=…}`, `…,style=…`, `…,nopen=1`, `…,LO=…`
  - a quote-injected value, a bad id, and `\href` nested in a mark
  - Allowed, and harmless: duplicate keys (the last one wins) and an empty value.
  - Captured context is rendered only through `renderUserTex` (trust off). `\htmlClass` and `\href` in a capture
    render as red text, never as markup. The decoder maps bad bytes to "?".
  - The CSP (`app/public/_headers`) is unchanged by the merge.
- **Bundle, rule (o).** I checked main's 03:58 build. The entry closure (18 files) holds only `notationPref`,
  `notationKeys`, `Popover`, `NotationHost` and `notation.css`. The dictionary is its own lazy chunk (`notation-*.js`,
  52.7 KB raw, three modules, no chapter content). The rest are lazy too: the pre-processor (14.6 KB), the runtime
  (5.0 KB), the card (2.4 KB), the key (1.9 KB) and the codec (0.5 KB). The rule checks entry-closure membership, that
  each lazy module is bundled, and that the dictionary chunk has no lecture content. It is sound, apart from the codec
  gap in #27.
- **Toggle on vs off.** The corpus test renders every span both ways and found no layout difference beyond the
  wrappers. The only intended differences are the line-break points lost inside a mark (documented), the focus ring
  and `tabindex`, and #24, which still needs checking on screen. Escape returns focus to the formula. Reduced motion
  is honoured: the 90 ms fade runs only under `data-motion='on'`.

## Fix list, by priority

1. **#1–#3, keyboard and screen readers.**
   - One roving Tab stop per reading group, and Enter opens the card, as the decision says.
   - Tab and Shift+Tab out of a card return focus to the formula; × does the same.
   - A polite live region speaks the card.
   - Extend `e2e/notation.spec.ts` with Tab-out, ×, a live-region text check, and a Tab-stop count budget per chapter.
2. **#4, #5, #6: wrong words on high-traffic cards.** Ket "squaring", ħ "steps of ħ/2", and the commutator order. These
   are one-line text edits, plus a `notation.context.test.ts` case for the commutator.
3. **#7–#11: context classes that misstate the formula.** Averages inside |…|, operator exponentials, gate letters on
   random variables and generic operators (F5, Q10, Q12), partial trace, and F8's ĉ_k. Add each listed site to
   `notationMark.test.ts` (never-marked or new id) and to `notation.context.test.ts` (sentence).
4. **#12: taught links.** Commutator → `l7-compatible`, dagger → `l3-eigen`, sigma-dot → `l5-inverse`. Add a test that
   the taught unit marks the id or glosses it.
5. **#13: numbers in captions.** Interpolate from `values`, add the digit lint test, and use `numtheory.gcd`.
6. **#14–#18: smaller context slips.** H^{⊗n}, operand capture (`\det S_x`, `\det\begin`), the leaking bra subscript,
   2 × 2 "operator" wording, and Formal "matrix element" wording.
7. **#19–#27: the rest.** Wording, weak links, coverage (`\mathbf`, `\boldsymbol\sigma`, `\binom`, `2\pi i`, ×, ≠, ≤,
   ≥; S_i, ΔA and R_n go to the later phase), Q7 subscript labels, visual QA of the underline on tall content, 375 px
   max-height, the key's bold/italic walk, the codec in rule (o), Esc capture, the Read-mode ruling, and deferred key
   data.

## R fixes (2026-10-11)

The fixer's pass over this review, one commit per group (branch `worktree-agent-a4fcb601f2f43ea07`, from main `bf0f8b1`). The review
file above is unchanged. Every Major and the listed Minors are fixed; #22, #24 and the rest of #27 were deferred and are done in the
second pass at the end of this section (branch `worktree-agent-aa07d4387594ad2d1`, from main `9d9e60d`).

| # | Finding | Commit | What changed |
|---|---|---|---|
| 1 | Tab stops | `6ae85d2` | Reading groups with one roving Tab stop each (`ui/notationFocus.ts`); Enter or Space opens, focus alone never does. L4: 83 Tab stops for 246 formulas with marks in 86 groups (it was one per formula). |
| 2 | Focus out of a card | `6ae85d2` | Tab and Shift+Tab inside the card go to its next control, or back to the formula at its ends; × returns focus. e2e: focus is never `body` or outside the document. |
| 3 | Screen readers | `6ae85d2` | One polite live region (`.notation-live`) speaks name, "Read it as" and plain meaning when a card opens from the keyboard or moves; the arrows say the mark's name when no card is open; `aria-describedby` points at the hint or the card. |
| 4 | ket "squaring" | `98f4581` | "The squared size of an amplitude, \|c\|², is the chance". |
| 5 | ħ "steps of ħ/2" | `98f4581` | A spin component reads +ħ/2 or −ħ/2, one step of ħ apart. |
| 6 | commutator order | `98f4581` | "A times B minus B times A (in AB, B acts first)". |
| 7 | \|⟨…⟩\| an overlap | `875cade` | Overlap only with a bar inside the bracket; averages and matrix elements say what they are. Corpus test lists the 13 sites. |
| 8 | operator exponentials | `875cade` | New `exp-operator` entry (rotation or evolution); the phase card is only for numbers. 21 listed sites. |
| 9 | gate letters | `875cade` | Off for `⟨X²⟩` (F5), `\|X\|` and `\|∑PX\|` (Q10), transposed operators (Q12); none inside any script. |
| 10 | partial trace | `875cade` | New `partial-trace` entry (the result is an operator); every `Tr_B`, `Tr_2`, `Tr_3` of the course. |
| 11 | F8 ĉ_k | `875cade` | A hat is a unit vector only on n r m x y z a b; c, f, g are the Fourier transform. |
| 12 | weak 448 links | `b4c0a65` | Commutator → l7-compatible, dagger → l3-eigen, n̂·σ⃗ → l5-inverse; test: every taught unit writes or defines the notation. |
| 13 | typed numbers | `69341f8` | Every caption number goes through `N()` from a computed value; `ex` reports typed digits; `notation.numbers.test.ts`; result labels computed; `gcd` uses the engine. |
| 14 | H^{⊗n} | `875cade` | "applied to each of n qubits". |
| 15 | operand capture | `875cade` | `\det S_x`, `\det R_z`, `\det A_{jk}`, `\det\begin{pmatrix}…`, `Tr\sqrt{M}`; every captured piece renders as maths (corpus test). |
| 16 | ⟨b\|_B ρ \|b⟩_B | `875cade` | The bra's subscript belongs to the bra (partial matrix element); ⟨0\|ρ\|0⟩ is a chance. |
| 17 | matrix wording | `875cade` | "A 2 × 2 grid of numbers. When it acts on states, it is an operator"; 448 says spin, no 448 card says qubit. |
| 18 | sandwich Formal | `875cade` | Formal: "the (a, b) matrix element of M"; Ground-up keeps "turns". |
| 19 | σ readings | `98f4581` | "in units of ħ/2" on the entry, the example and the card for this spot. |
| 20 | span, →, σ_y | `98f4581` | "not multiples of each other"; → names source and target, ↦ what a map does to one state; no overreach on σ_y. |
| 21 | weak links | `b4c0a65` | Conjugate (448) → l2-complex; vec (709) → q1-two-spots; span (709) → f2-gram-schmidt; ℂⁿ, ℝⁿ (709) → q1-vector-space; ≅ (709) → f1-phase; σ⃗ (448) → l5-inverse. Floor stays on f8-fractions ("integer part"), recorded in the test's words-only list. |
| 22 | coverage | deferred, then `f81f31b` | First pass: deferred. Second pass: see below. |
| 23 | Q7 subscript labels | `875cade` | No gate letter inside any script (`P_{XXX}`, `\hat O_{XYY}`). |
| 24 | underline on tall content | deferred, then `5c6bb47` | First pass: deferred. Second pass: see below. |
| 25 | 375 px card | `e65cb9b` | Popover takes the roomier side and scrolls inside when it fits neither below nor above (never over its anchor); `100dvh`; one card width, 320 px. |
| 26 | key walk | `e65cb9b` | The key walks bold, italic, gloss and term text as Rich does and skips hidden hints and walkthrough steps (`NotationKey.test.ts`). |
| 27 | small items | `6ae85d2`, `e65cb9b`, then `ef0e43c` | First pass: Esc is stopped only while a card is open; `isNotationLazy` covers `ui/notationCodec.ts` and rule (o) checks it is bundled. The "Read mode" ruling and the key's data were left; second pass: see below. |

Checks: `npx tsc -p tsconfig.app.json --noEmit`, `npm run build`, `npx vitest run` (181 files, 9075 tests), Playwright preview
(`notation`, `security`, `print`, `nav`: 95 passed after the arrows test was made independent of scroll position, 36/36 under
`--repeat-each=4`; `story` for L4, F5, Q10, Q18: 7 passed).

### Second pass: #22, #24 and the #27 leftovers (2026-10-11)

| # | What changed | Commit |
|---|---|---|
| 22 | Seven new dictionary entries, each with both voices, an engine-computed example (hand value in `notation.test.ts`, no typed digit in `notation.numbers.test.ts`) and a unit that writes it: `spin-component` (S_x, S_y, S_z always; S_i, S_n, S_{n̂} only in a chapter that writes S_x, S_y or S_z, read by `chapterVocab.spin`, so Q10 and Q15's CHSH S never is; also Ŝ_z of L3 and L4), `spread` (Δ before an observable or random variable: ΔA, ΔS_z, Δσ_i, ΔX, Δ\hat O; Δx with Δp; never Δz, Δφ, Δχ, ΔE), `rotation` (R_x, R_y, R_z, R_n, R_{n̂}, with its angle; never R_k, R_pol, R_θ, the reflections of Q17; its card names the operator exponential and links where it is derived, `l6-generator` like the `exp-operator` card), `cross` (× only between vectors; × between numbers, sizes and sets is plain multiplication and stays unmarked, 150 or more spans), `not-equal`, `at-most`, `at-least` (no "learn it" link: school maths, like ≈ and ∝). `\mathbf r` and `\boldsymbol\sigma` use the `vec`, `sigma-vec` and `sigma-dot` entries (a bold capital, `\mathbf Z_N`, is not a vector). Corpus class tests (`notation.classes.test.ts`): every S_x, S_y, S_z (529), ≠ ≤ ≥ (each over 100), R_x, R_y, R_z, R_n and bold vector is marked; no mark lands on a wrong site (CHSH S, Δz, Δφ, Δχ, R_k, a bold capital). Still unmarked, as before: `\binom` columns, ≡, ⊥, ∣, `e^{2πi…}`. | `f81f31b` |
| 24 | Confirmed in the preview: the border of a mark over a matrix ran across its lower row, and over a display Σ or Π it sat 17 to 20 px above the lower limit (KaTeX offsets the stacked parts with `top`, so the span's box stays one font high). A mark holding `.mtable`, `.op-limits` or `.mfrac` is now an `inline-block`: its box is the whole content (glyphs of the line move at most half a pixel). Screenshots before and after at 1280 and 375 px: L4's S_z matrix, Q16's Σ and Π with limits, F8's |sin θ/2|; e2e checks the geometry. | `5c6bb47` |
| 27 (a) | The app has an on-screen Read mode, and the print notes run in it, so the ruling "Read/print mode: no cards" meant both. Read mode now has no marks, no underline, no Tab stops and no cards (an open card goes), the key is open and its lede no longer mentions cards, and the topbar toggle's title says so. | `ef0e43c` |
| 27 (b) | The key, the dictionary and the pre-processor are fetched when the key's slot (`NotationKeySlot`, entry) comes within 1500 px of the viewport, or in print: `beforeprint`, the print media query, the print shortcut, and the Print notes button waits for the key. Cards off: nothing of the key is fetched on a lecture view that stays at the top. Known gap, in the spec: a print started from a browser menu at the top of a page, with the chunk not cached, cannot wait for it. | `ef0e43c` |

Checks: `npx tsc -p tsconfig.app.json --noEmit`, `npm run build`, `npx vitest run` (181 files, 9139 tests), Playwright preview (`notation`,
`print`, `nav`, `security`: 98 passed; `story` Q10 and Q16: 4 passed).
