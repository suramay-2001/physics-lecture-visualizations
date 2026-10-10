# Decision: notation explainers (user + judge, 2026-10-10)

**Feature.** Click, tap, hover or keyboard-focus a piece of notation in any rendered maths (both courses) to see a
plain-English card explaining it.

**User decisions**
1. On by default; a topbar toggle "Explain notation" turns it off (remembered per viewer, like the track toggle).
2. Desktop: hover opens after ~300 ms, click pins; touch: tap; keyboard: Tab to it, Enter opens, Esc closes;
   screen readers get the card text.
3. Scope v1 = universal notation (≈ 40: Σ, Π, ⊗, ⊕, †, *, ⟨·|·⟩, |·⟩, ‖·‖, Tr, det, [A, B], δᵢⱼ, ∈, ℂⁿ, e^{iφ},
   ≅, ∝, operator hats, matrix brackets, …) PLUS context-aware explanations that use the expression's own limits and
   contents (Σ over x from 0 to 2ⁿ−1 says exactly that). Chapter-specific symbols (ρ, η₁, θ, c …) are a later phase.
4. Full card: name and read-aloud; plain meaning; a tiny worked example (every number computed in code and tested,
   like all learner-visible numbers); what it means physically in this spot; a link to where it is taught (F-chapter or
   448 lecture), with the usual return bar. 709 cards follow the reader's track (Ground-up / Formal).

**Judge's design rulings**
- Mark notation at the SOURCE: a TeX pre-processor wraps known notation in KaTeX `\htmlData{notation=…}` before render;
  one delegated listener handles the cards. KaTeX `trust` allows `\htmlData` with these data keys only, so the CSP is
  unchanged (no inline script or style).
- The dictionary and the card component load lazily on first use; nothing joins the entry chunk (its budget has been
  raised three times in the 448 L8–L11 batch).
- Read/print mode: no cards; an optional "notation key" at the end of each chapter lists the notation it uses.
- Roles: P writes the dictionary (both voices, examples, links) and verifies every example; W builds the pre-processor,
  card, toggle, tests (unit, a11y, CSP, e2e) and the notation key.
