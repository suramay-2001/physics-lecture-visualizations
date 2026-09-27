# Pipeline: sources → text, pages, sheets → engine fixtures → claims

## Config (two files)
- `pipeline/course.config.json` (tracked): course id/title, `lectures: [{id}]`, `books: [{id, role, title,
  printed_page_offset?, pages?: [[from, to], …]}]`. **No paths.** Roles: primary · course-textbook ·
  math-backbone · beyond-the-lecture · reference-only.
- `pipeline/course.config.local.json` (git-ignored): `{ "paths": { "L1": "~/…/Lecture 1.pdf", … } }`. Paths
  and file names can leak where a book came from (PII); they never enter git. If a history ever held them:
  rewrite, expire the reflog, gc, and verify 0 leaking blobs.

## Ingest
`python3 pipeline/ingest.py [--only L7,townsend]` writes `sources/<id>/{text.md, pages/pNN.png, sheets/,
manifest.json}`. `sources/` is git-ignored (copyrighted). Lectures render pages (110 dpi) and contact sheets;
books render only the configured page ranges. EPUBs are split into chapter files.
- **Visual pass is mandatory for every lecture.** OneNote exports keep handwriting as vector paths and pasted
  screenshots as images; `get_image_info` returns the same list on every page, so image flags are useless there.
  Read every contact sheet. Typeset (LaTeX) notes still get a spot-check for figures and boxed results.
- Record each book's printed-page offset (Axler −14, Townsend −16 here) and cite § + printed page.
- A moved source shows as `MISSING <id>`; `mdfind -name "<title>"` finds it; fix the local path only.
- Some extracted `text.md` files contain odd bytes: `grep -a`.

## Engine and fixtures
- The subject's math lives in `app/src/physics/*.ts` as pure functions (no DOM, no three.js).
- `pipeline/make_fixtures.py` recomputes reference values with an **independent** numpy implementation;
  `make_claim_fixtures.py` writes the numbers the content claims. Tests compare engine vs fixtures (1e-12).
- Conventions are decided once and tested (here: ħ = 1, S = σ/2, |+y⟩ = (1, i)/√2, Rz(φ) = diag(e^{−iφ/2},
  e^{iφ/2}), eigenvector phase first component real ≥ 0).

## Claims
- `L<n>.values.ts` computes every number with the engine and exposes `claim(id, text, check)`.
- Content text interpolates values (`${pct(V.x)}`) — never a typed number.
- Tests: every claim holds; every claim id has a numpy fixture; content tests fail on unknown ids.
