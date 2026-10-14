# Card: the offline pipeline (ingest, fixtures, numpy twins, audit)

All scripts run from the repo root (`python3 pipeline/<script>`); Python 3 with numpy (scipy, PyMuPDF for ingest). Nothing here runs in the browser; the app only reads the JSON outputs.

**Ingest** (`ingest.py`; step `01-course-ingest`): turns the git-ignored course PDFs/EPUBs into `sources/<id>/text.md` (one `## pN` section per page), `pages/pNN.png` and `manifest.json` (pages flagged `needs_vision` carry content the text layer misses:
read them as images). Configs: `course.config.json` (448: the instructor notes and the books), `course.qc709.json` (709: Bergou, N&C, the 709 notes and homework sheet), `course.papers.json` (Papers: the paper `paper-tdg` plus 12 text-only
`ref-*` references; each item has `id`, `file`, `role`, `title`, `license`, `render`). Local paths live in git-ignored `pipeline/course.config.local.json` (template `course.config.local.example.json`). `python3 pipeline/ingest.py pipeline/course.papers.json`.
`sources/` is NEVER committed and its text is never pasted into `app/`; `verbatim.test.ts` and the pre-commit hook enforce it. A worktree finds the main checkout's `sources/` automatically for the verbatim test.

**Fixtures (engine vs numpy)**, each deterministic (seeded, no clock; run twice and diff), each writes `app/src/physics/__fixtures__/*.json` read by the engine's own tests:
`make_fixtures.py` -> `numpy.json` (448 engine), `make_qc_fixtures.py` -> `qc.json` (multi-qubit engine; independent routes: dense `np.kron`, scipy), `make_bits_fixtures.py`, `make_oracles_fixtures.py`, `make_grover_fixtures.py`, `make_qft_fixtures.py` (+ `qft_numpy.py`),
`make_numtheory_fixtures.py`, `make_crypto_fixtures.py`, `make_qec_fixtures.py` (+ `qec_numpy.py`) -> `qec.json` (GF(2) by Python integers, dense Pauli matrices, a dense tableau cross-check, exhaustive distances, BB codes from `np.kron` circulants, overhead arithmetic), `make_q22_fixtures.py` -> `q22.json` (Q22's linear codes, coset states, Clifford conjugations and tableau traces against dense routes).
`make_numtheory_fixtures.py`, `make_crypto_fixtures.py`, `make_qec_q21_fixtures.py` (+ `qec_q21_numpy.py`, also used by `claims_qc709/q21.py`) -> `qec-q21.json`, `make_qec_fixtures.py` (+ `qec_numpy.py`) -> `qec.json` (GF(2) by Python integers, dense Pauli matrices, a dense tableau cross-check, exhaustive distances, BB codes from `np.kron` circulants, overhead arithmetic).
`make_numtheory_fixtures.py`, `make_crypto_fixtures.py`, `make_surface_fixtures.py` (+ `surface_numpy.py`) -> `qec-surface.json` (B1: torus, patches, the schedule rule checked by a tableau, fault signatures, space-time failure counts, curves, frames), `make_qec_fixtures.py` (+ `qec_numpy.py`) -> `qec.json` (GF(2) by Python integers, dense Pauli matrices, a dense tableau cross-check, exhaustive distances, BB codes from `np.kron` circulants, overhead arithmetic).
New engine function = a block in the matching script (or a new `make_<topic>_fixtures.py`) + the TypeScript test that reads it.

**Claim twins** (what a chapter agent writes): one python file per chapter, one line per `V` key, each by a route the engine does not use.
- 448: `make_claim_fixtures.py` -> `__fixtures__/claims.json` (all lectures in one file).
- 709: `pipeline/claims_qc709/<id>.py` -> `__fixtures__/claims-qc709/<id>.json` (`{"about", "values": {key: number}}`, `json.dumps(..., indent=2, sort_keys=True)` + newline).
- Papers: `pipeline/claims_papers/<id>.py` -> `__fixtures__/claims-papers/<id>.json` (`{"source", "values"}`).
Pattern (copy `claims_papers/p1.py` for a tiny one, `claims_qc709/q18.py` for a large one): docstring naming the independent route and the units, `ROOT = Path(__file__).resolve().parent.parent.parent`, a helper module for shared gates (`qft_numpy.py`, `qec_numpy.py`),
`values = {...}` with a comment per key naming the beat, write the JSON, print the count. A twin must COMPUTE (`float(np.real(3+4j))`, not `3.0`); `claims.test.ts` compares each key at 1e-12 and fails on a key with no twin or a twin with no key.
A key whose value is an exact integer or a boolean flag (0/1) is fine; keep them numbers.

**Audit** (`audit_public.py`; the repo is PUBLIC): flags credentials, personal home paths, e-mails other than GitHub no-reply/Anthropic's co-author line, agent scratchpad paths, signed URLs, tracked PDFs/EPUBs/Office files and anything under `sources/`.
`--staged` (the pre-commit hook, `git config core.hooksPath .githooks` once per clone) checks the diff; `--verbatim` adds an 8-word overlap check of every tracked text file against `sources/`; no flag audits the whole history. The judge runs the full audit unpiped before a push.
Keep local absolute paths, scratchpad paths and e-mail addresses out of every committed file (docs included).

**Other generators** (only when a plan lists media): Blender openers `node pipeline/blender/gen_opener_data.ts`, `sh pipeline/blender/render_openers.sh`, hardware via `Blender -b --factory-startup -P pipeline/blender/lab_assets.py` (Blender draws engine data only);
Motion Canvas films `node pipeline/films/render.ts`, `sh pipeline/films/encode.sh`, `node pipeline/films/check_manifest.ts` (a manifest of every drawn number re-checked against the engine); decor video needs the owner's per-batch go-ahead.
**The gate** is `pipeline/gate.sh` (card `tests-and-gate`). **The context bus** is `node pipeline/context/build_context.mjs <ids>` (README in `docs/context/`).
