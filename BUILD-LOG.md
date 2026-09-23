# BUILD-LOG — Quantum Spin Lab (Physics 448 interactive notes)

## Current state
- Phase 1 (ingest) done: `pipeline/ingest.py` + `pipeline/course.config.json` → `sources/` (git-ignored).
- Phase 2 (physics engine) done: `app/src/physics/{complex,linalg,spin,random}.ts`, 18 tests passing,
  checked against numpy fixtures; mutation-tested (σ_y sign flip → 4 failures; Rz phase flip → 1 failure).
- Phase 3 (content schema + app shell) — not started.

## Next action
Write `app/src/content/schema.ts` (the learning-unit schema every lecture must satisfy), then the app
shell (routing, KaTeX, hint ladder, progress in localStorage), then widgets.

## Plan (agreed with user 2026-09-23)
Audience: user + classmates (shareable static site). Scope: all 6 lectures, shallower, one shared
schema from day one so the reusable skill can be extracted at the end. Stack: Vite + React + TS +
KaTeX + three.js in `app/`. Media split: physics visuals in code; Blender → 3D Stern–Gerlach magnet
GLB; Higgsfield → intro/atmosphere only; Canva → printable formula cards (needs user to authorize).
Phases: 1 ingest · 2 engine · 3 schema+shell · 4 widgets · 5 content L1–L6 · 6 audit (content tests,
Playwright) · 7 graphify concept graph · 8 media · 9 extract skill (skill-creator) · 10 deploy (ask first).

## Locked decisions & tuned constants
| Decision | Value | Why |
|---|---|---|
| Internal units | ħ = 1, S = σ/2 | Keeps engine dimensionless; lectures use ±ħ/2 so UI appends ħ |
| Phase convention | eigenvectors: first component real ≥ 0 | Matches L4/L5 "choose a real and positive" |
| |+y⟩ | (1, i)/√2 | L2 derivation (c = +i) |
| Rz(φ) | diag(e^{-iφ/2}, e^{iφ/2}) | L6 convention; Rz(2π) = −I is tested |
| Sources in git | never | copyrighted; app paraphrases + cites |
| Lecture 1 "3/4 at 45°" | corrected to cos²(22.5°) ≈ 0.854; 3/4 occurs at 60° | numpy + engine agree; used as a "spot the error" challenge |
| Lecture 4 p.10 "theoretical mean is zero" | corrected to ħ/4 | leftover from the |+x⟩ example |
| Green Book (quant interviews) | excluded | not physics; format inspiration only |
| Reif | reference-only (§1.2–1.6 binomial) | scanned; only finite-sample statistics are relevant |

## Evidence / score history
- 2026-09-23: engine 18/18 tests vs numpy fixtures (seed 448). Mutation checks above.

## Hard-won platform knowledge
- OneNote PDF exports (L1, L2): PyMuPDF `get_image_info()` returns the SAME image list on every page,
  so image-area flags are meaningless there. Handwriting is stored as hundreds of vector paths per
  page (`page.get_drawings()`), and pasted screenshots carry equations the text layer never sees
  (e.g. L2's c = ±i derivation, L2's "1 → i → −1 → −i ↔ +x → +y → −x → −y"). Rule: every lecture
  gets a visual pass via `sources/<L>/sheets/*.png`, regardless of the flag.
- Reif PDF is a tiff2pdf scan (no text layer at all).
- Axler 4e: printed page = PDF page − 14.
- Canva MCP needs OAuth (user must authorize in claude.ai connector settings). Blender MCP needs
  Blender running with the MCP add-on on localhost:9876 (was not running 2026-09-23).
  Higgsfield connected (995 credits at start) — spending credits needs the user's go-ahead.

## Open issues
- Blocked on user: start Blender with MCP add-on; authorize Canva connector.
- Course's own sources (Vavilov 2019 notes, Walker 2020 notes) are not public; public analogues:
  MIT 8.05 (Zwiebach) L3–6, Susskind TM lectures, 3B1B Essence of Linear Algebra ch. 9/13/14.

## Resume checklist
1. Read this file, then CLAUDE.md
2. `cd app && npx vitest run` (expect all green), `npm run dev`
3. Continue at "Next action"
