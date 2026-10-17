# Rulings: the 709 "Lecture notes" section and the new notes edition (judge, 2026-10-17)

Owner's decisions (2026-10-17): a new in-site 709 "Lecture notes" section, one prose page per class lecture (L1–L7 short,
L8–L11 full), engine-backed numbers, links into the chapter units; HW3 submitted (`homework-status.md`); budget 20 weekly
points for the whole batch. Platform design: `docs/roles/proposals/W-709-notes.md` (adopted as written except where a
ruling below says otherwise). Content and chapter deltas: `docs/roles/proposals/P-709-remap-L8L11.md` (rulings P1–Pn below,
added when that plan is judged).

## Platform (W-709-notes §10)
- W1 **Ids and URLs.** Notes lectures are `N1`…`N11` (forced: `L<k>` is 448). Canonical `#/709/notes/N8`;
  `#/709/notes/L8` redirects. The title reads "Lecture 8 notes" so the owner's numbering stays visible.
- W2 **No fourth CourseId.** `N<k>` belongs to `qc709` by id, with the one-voice lint profile (`tracksOfChapter`,
  `sentenceCapOf` = 40).
- W3 **Number guard.** For notes the "at least one displayed number" guard is per lecture: a full lecture shows ≥ 3
  engine-backed numbers, a short one ≥ 1. The displayed-number ledger itself is unchanged (every decimal is a claim).
- W4 **Feeds** are derived from the prose bridges (one source of truth). Add the lint: every section of EVERY notes
  lecture links at least one built unit (short lectures too; they are companions to the chapters).
- W5 **Seed.** The platform builder writes `N1` as a minimal real seed (two sections, one figure, one claim, one bridge);
  the content builder replaces its prose.
- W6 **Chapter → notes link** is per unit ("From the lecture notes" chips). Per-beat links are out of scope.
- W7 **No notes glossary, Arcade, Map, Formulas or Help presence.** New concepts get their glossary entries in the chapter
  that owns them.
- W8 **Register.** One voice in the Formal register of the notes, sentences ≤ 40 words, every symbol defined at first use
  on the page, cohesive full-sentence paragraphs (no bullet chunks).
- W9 **Print.** No new print button. The page must print correctly through the browser (figures via `FigureFor`, running
  head as chapters do); one in-memory `page.pdf()` check in `notes.spec.ts`.
- W10 **Weekly additions.** The lecture checklist in the `notes-platform` card lists every shared edit (three files, one
  twin, `UPDATE_META=1` twice, one `ROUTES` line, one e2e count).
- W11 **Scope guard.** The platform builder edits no chapter content, no `physics/` and no `stage/` file except the two
  one-line items W-709-notes names (`StaticStory` export, `readingPosition` selector).
- W12 **Chapter-owned numbers** (amendment sent to the platform builder, 2026-10-17): a notes paragraph shows a number
  a chapter already owns by citing the CHAPTER's claim key (one value, one twin). Only numbers no chapter owns get
  `n<k>…` keys with twins in `pipeline/claims_notes/`. A notes chunk may include chapter values modules, never another
  lecture's story, content or glossary module (rule (r) asserts this).

## Content and chapter deltas (P-709-remap-L8L11 §8; the judge re-derived C = 2|det Λ| (ψ̃ components and
## ⟨ψ|ψ̃⟩ = −2(Λ₀₀Λ₁₁ − Λ₀₁Λ₁₀)*), the family's CHSH threshold (T = diag(−α, −α, 1 − 2α) ⇒ 2√2·α > 2 iff α > 1/√2),
## F, det σ and E_f at α = 0.6 by hand; all agree with the plan)
- P1 **Citations.** Apply the 384-row TSV in one scripted pass that asserts `old_text` occurs once on its line before
  replacing, then fix the §1.3 stale statements. The judge verified old pp. 2–20 → new pp. 4–22 as identical text
  (difflib ratio 1.000 on every page), so Q2's three notes-Corrections and Q3's Û†ÂÛ slip are re-cited only, with
  no re-verification. Documents outside `app/` keep their old numbers (historical); `P-709-remap-L8L11.md` §1.1 is the
  map. Equation cites move by content (2.21 → 3.3 convexity, 2.22 → 2.23, 2.23 → 3.28).
- P2 **Entropy stays in Q9**; Q12 owns S(A|B); Q9 gets one Formal link-forward line.
- P3 **r stays** for the Bloch vector, with one Rosetta line (notes n).
- P4 **New units** `q12-coherence` (first in Q12), `q12-family` (after `q12-concurrence`), `q10-bell` (after
  `q10-hidden`). Unit order inside a unit: lecture → books → clue → deeper (P11).
- P5 **Names**: the coherence figure is F_coh in the chapters (F is Q9's fidelity); `qc-alpha-family`; the notes'
  α is both an amplitude (3.1) and a weight (3.12): one line in each unit.
- P6 **Extras kept**: the Φ⁺ blind spot of F_coh and the family's CHSH threshold 1/√2. If the budget binds they are
  the first cut.
- P7 **No Correction box**: the two cross-reference slips (pp. 41, 54) get a Rosetta line each only where a beat
  cites that page; the degenerate-basis caveat (p. 46) is our Formal wording in `q9-purification:b5`.
- P8 **Engine gaps** `coherenceCriterion`, `conditionalEntropy`, `bellThreeDirections`, `purifyEnsemble`, each with
  an independent numpy twin, are built by the FIRST chapter builder (with Q8/Q9), so the Q10/Q12 builder starts from
  them.
- P9 **Build split**: builder A = TSV + §1.3 + engine gaps + Q8 + Q9 deltas; builder B (after A merges) = Q10 + Q12
  deltas; builder C (after the platform and A, B merge) = notes content N1–N11 from §6, replacing the platform's seed.
- P10 **Homework**: HW2, HW3 submitted; every derivation and example in L8–L11 may be worked in full.
- P11 **Bergou problems** for the new units are cited only.
- P12 **The notes pages** follow §6 (lengths: L1–L7 150–300 words, L8 ≈ 1,100, L9 ≈ 900, L10 ≈ 1,500, L11 ≈ 1,000),
  with the α-family table on N10 built from claims (no hand-typed decimals) and Aspect/Weihs cited by name, journal
  and year only.

## Notes-pages review (`audits/P-709-notes-pages-review.md`, 2026-10-18)
- R1 **Correction of the judge's own heads-up** (sent to builder C): CHSH is ALSO sufficient-only. Exact statement for the
  α-family: F_coh, PPT and C switch on at ½, CHSH at 1/√2, S(A|B) at 0.7729; F_coh, CHSH and S(A|B) are sufficient but
  not necessary; only PPT and C are exact, and only for two qubits (2×2; PPT also 2×3). Q12's wording was checked and
  does not claim otherwise.
- R2 **Copyright is blocking.** Every near-verbatim run (B3) and every paragraph that tracks the source sentence by
  sentence (S13) is rewritten from the idea, in a different order. A new notes-only overlap test (no 7-word alphabetic
  run shared with `sources/qc709-n*` after dropping TeX; skipped when sources are absent) holds every future lecture to it.
- R3 **P12 amended**: the α-family comparison is two short prose paragraphs (tests at α = 0.6; the entropy at 0.75, 0.8
  and the singlet), not a table — the notes kit has no table, and the numbers stay claims.
- R4 **S14**: N2–N7 carry no figure (short companions; the chapters they link draw everything). Accepted, not a defect.
