# Quantum Spin Lab (Physics 448) — session bootstrap

**Read `BUILD-LOG.md` before taking any action in this repo.** It carries the current phase,
the next action, locked decisions, and evidence history. Do not re-derive decisions recorded there.

Hard rules that survive any context reset:
- `sources/` is git-ignored on purpose: instructor notes and textbooks are copyrighted. The app
  paraphrases and cites (book § / page); never paste source text into `app/`.
- Every numeric answer a learner sees must come from `app/src/physics/` and be covered by a test.
  The engine itself is checked against numpy fixtures (`pipeline/make_fixtures.py`).
- Physics visuals that make a claim are computed live in code. Generated media (Higgsfield) is
  decoration only and never states a physical result.
- Units: ħ = 1 inside the engine; S = σ/2; the UI appends ħ.
- Lecture content lives in `app/src/content/L*.ts` and must satisfy `app/src/content/schema.ts`.

Commands (run from `app/`):
- `npm run dev` — dev server
- `npx vitest run` — engine + content tests
- `npm run build` — type-check and build
- `python3 ../pipeline/ingest.py` — re-extract sources (from repo root: `python3 pipeline/ingest.py`)
- `python3 ../pipeline/make_fixtures.py` — regenerate numpy reference values
- After code changes: `graphify update .` from the repo root
