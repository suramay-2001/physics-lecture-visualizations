# Spin Lab

Interactive study notes for two university quantum courses, built as one web app:

- **Physics 448: spin-½.** Seven lectures that start at the Stern–Gerlach experiment and end at rotations, compatible
  measurements and uncertainty.
- **Physics 709: Introduction to Quantum Computing.** A full-semester map in the "Cryostat" identity. Built so far:
  - **Foundations:** F1 *Numbers that turn*.
  - **Part I** (quantum mechanics review): Q1 *Stern–Gerlach and the rules of the game*, Q2 *Coordinates, bases and
    turning frames*, Q3 *Measurement, the Bloch sphere and uncertainty*.
  - **Part II** (qubits and circuits): Q4 *The qubit, gates and circuits*, Q5 *Deutsch's trick and interference*.

Each lecture is a scroll-driven story. The prose moves beat by beat while a live 3D or SVG stage draws the physics: Bloch
spheres, Hilbert-space planes, Stern–Gerlach beams, amplitude bars and quantum circuits.

## What's inside

- **Story and Read modes.** A cinematic scroll story, or a print-ready page of notes with one numbered figure per stage
  change.
- **Two tracks in every 709 chapter.**
  - *Ground-up* starts from 9th-grade math and derives every step.
  - *Formal* uses full notation and vocabulary.
  - A toggle switches between them at the same place in the text.
- **Bridges between courses.** A 709 idea that 448 already teaches links to the exact 448 unit, and a return bar brings
  you back to the same 709 beat.
- **Derivations** stepped line by line, each step with a one-sentence reason.
- **Challenges** with three hints each, and walkthroughs for problems that aren't open homework.
- **Arcade.** Short practice games: spot the error, Stern–Gerlach puzzles, Bloch-sphere golf.
- **Lab.** Hands-on benches: a Stern–Gerlach bench, an operator lab and an expression grapher.
- **Glossary, formula board, concept map and review cards** for each course.

## Correctness rules

- **Every number a learner sees is computed by the physics engine** (`app/src/physics/`) and covered by a test.
- **The engine is checked against numpy** (`pipeline/make_*fixtures.py`, `pipeline/claims_qc709/`). Each chapter's
  claims have an independent numpy "twin".
- **Visuals that make a physical claim are computed live in code.** Generated video is decoration only and never states a
  result.
- **Units:** ħ = 1 inside the engine, S = σ/2, and the UI adds the ħ.

## Sources

The courses paraphrase and cite (section and printed page) these works, plus the instructors' lecture notes:

- Bergou, Hillery & Saffman, *Quantum Information Processing* (2e)
- Nielsen & Chuang, *Quantum Computation and Quantum Information*
- Axler, *Linear Algebra Done Right* (4e)
- Townsend, *A Modern Approach to Quantum Mechanics* (2e)
- Susskind & Friedman, *The Theoretical Minimum*

None of the source texts are in this repository. `sources/` is git-ignored, and a verbatim test fails the build if app
text shares an 8-word run with a source.

## Running it

You need Node 24 and npm. The end-to-end tests use your installed Google Chrome; Playwright downloads no browsers.

```bash
cd app
npm ci
npm run dev          # dev server
npx vitest run       # engine and content tests
npm run build        # type-check and production build
npm run e2e          # build, then Playwright against the production preview
```

**Optional pipelines**, run from the repo root; they need Python 3 with numpy and PyMuPDF:

- `python3 pipeline/ingest.py` re-extracts your own local copies of the sources. Paths go in the git-ignored
  `pipeline/course.config.local.json`; see `course.config.local.example.json`.
- `python3 pipeline/make_fixtures.py` regenerates the numpy reference values.
- **Films** (Motion Canvas) are in `films/`; **Blender** opener scripts are in `pipeline/blender/`. See `CLAUDE.md` for the
  commands.

## Repository map

| Path | What's there |
|---|---|
| `app/src/physics/` | The engine: spin-½, operators, density matrices; `qc/` for states, gates, circuits and measurement |
| `app/src/content/` | 448 lectures (`L*.ts`), 709 chapters (`qc709/`), schema, glossary and claims |
| `app/src/stage/` | The story stage: stage kinds, resolver, WebGL and SVG scenes, print figures |
| `app/src/lab/` | Lab benches (Babylon.js) |
| `app/e2e/` | Playwright specs (preview and dev projects) |
| `pipeline/` | Source ingest, numpy fixtures and claim twins, Blender and film scripts, the leak audit |
| `docs/specs/`, `docs/patterns/` | Design specs (content model, stage kinds, the Cryostat identity) and short code patterns |
| `docs/roles/` | Chapter plans, reviews and rulings for each lecture |
| `skills/` | Numbered, repeatable build steps (`00-course-pipeline` is the index) |
| `BUILD-LOG.md` | Current state, next action, locked decisions and hard-won lessons |

## Building with Claude Code

This repo is set up for AI-assisted development with Claude Code:

- `CLAUDE.md` is the session bootstrap: the hard rules and commands.
- `skills/00-course-pipeline` … `18-usage-budget` are the per-chapter pipeline: plan → rule → build → merge → review → fix
  → visual check.
- `docs/specs/` holds the design specs; `docs/patterns/` holds the code patterns.

## Privacy and leak guard

Run this once per clone:

```bash
git config core.hooksPath .githooks
```

Its pre-commit hook blocks credentials, personal paths, e-mail addresses and course PDFs.
`python3 pipeline/audit_public.py --verbatim` audits the whole history.

## Credits

- **Fonts:** Archivo, Atkinson Hyperlegible Next, Barlow Condensed, Literata, Martian Mono and STIX Two Text, all under the
  SIL Open Font License. The license texts are in `app/public/licenses/fonts/`.
- **Libraries:** React, three.js / React Three Fiber, Babylon.js, GSAP, KaTeX, Vite, Vitest, Playwright and Motion
  Canvas.
