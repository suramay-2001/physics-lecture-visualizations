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
- Blender (from the repo root): `node pipeline/blender/gen_opener_data.ts`, `sh pipeline/blender/render_openers.sh`,
  `/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P pipeline/blender/lab_assets.py`.
  Blender draws engine data only; it never computes physics.
- Films (Motion Canvas, Physics 709; from the repo root): `cd films && npm ci --ignore-scripts`, then
  `node pipeline/films/render.ts`, `sh pipeline/films/encode.sh`, `node pipeline/films/check_manifest.ts`.
  Films draw engine data only (a manifest of every drawn number is re-checked against the engine).
