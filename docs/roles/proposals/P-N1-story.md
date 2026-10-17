# P-N1-story: Lecture 1 notes, the seed (platform builder, 2026-10-17)

A SEED plan, written with the notes platform (docs/roles/proposals/W-709-notes.md; rulings W1 to W12 in docs/roles/decisions/qc709-notes.md) so the platform has a real subject and the context generator has a plan to read. The content builder replaces the prose of `app/src/content/qc709/notes/N1.ts` and widens this plan to the whole of Lecture 1 of the new edition (printed pp. 4 to 7 are §I.A and §I.B only).

## 1. Scope

Lecture 1 of the notes (class of 2026-09-02, "short": 150 to 300 words of prose), sections §I.A (pp. 4 to 5) and §I.B (pp. 5 to 7). One voice, the Formal register, sentences at most 40 words, every symbol defined at first use. Sources: `sources/qc709-n1` (never pasted; paraphrase only). Short lecture: one engine-backed claim at least (W3); every section links a built unit (W4).

## 2. Units (the notes' sections)

### Unit `n1-stern-gerlach` (§I.A, pp. 4 to 5)

- Paragraph 1: the experiment, the force on a moment in a varying field, two beams, the quantized component.
- Paragraph 2 (figure): the kets for up and down, repeated z magnets, a turned magnet, the chance one half at the last z magnet; the figure draws `|+x⟩` in the z basis (stage kind `amplitudes`, mode `probability`).
- Claim `n1UpAfterX` (twin `pipeline/claims_notes/n1.py`). Bridge: `qc-q1-sequences` (feeds `q1-sequences`).

### Unit `n1-formalism` (§I.B, pp. 5 to 7)

- Paragraph 1: a state is a ket; the vector space with an inner product is a Hilbert space; the superposition principle.
- Paragraph 2: the rules of a vector space.
- Paragraph 3: the inner product, its rules, the length, right angles.
- Bridges: `qc-q1-superposition` (feeds `q1-superposition`), `qc-q1-inner-product` (feeds `q1-inner-product`).

## 3. Open for the content builder

Replace the seed prose with the final text; add the bra and the projection picture only if a built stage kind draws it; keep the page range monotone; cite chapter-owned numbers by the chapter's own key (W12), not by a new key.

## 5. Glossary

Tags used (all existing): `qc-stern-gerlach`, `qc-quantized`, `qc-vector-space`, `qc-inner-product`, `qc-hilbert-space`, `qc-superposition`. A note defines no concept (W7).
