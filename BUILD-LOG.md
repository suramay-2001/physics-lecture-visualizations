# BUILD-LOG — Quantum Spin Lab (Physics 448 interactive notes)

## Current state
- Phase 1 (ingest) done: `pipeline/ingest.py` + `pipeline/course.config.json` → `sources/` (git-ignored).
- Phase 2 (physics engine) done: `app/src/physics/{complex,linalg,spin,sg,random}.ts`, tests vs numpy fixtures;
  mutation-tested (σ_y sign flip → 4 failures; Rz phase flip → 1 failure).
- Phase 3 (v1 app) done: schema, 12 widgets, pages, L1 content (5 units, 14 challenges); 48 tests green;
  `vite build` OK (BlochSphere chunk 956 kB — drei is heavy, W role to trim).
- **REVAMP APPROVED 2026-09-24** — see `docs/roles/PLAN.md` (the single source of truth for the revamp).
  Four subagent roles (P physics, D 3D designer, W web dev, S security) with Claude as orchestrator/judge.

## Next action
Phase 0 gate: W subagent (worktree) builds throwaway `app/src/gate/` (pinned dark stage + prose/KaTeX,
Hopf ≥64 fibers, lab scene, ScrollTrigger + drei <View>); in parallel P and S write Round-1 proposals to
`docs/roles/proposals/`. Claude measures the gate in the Browser pane and judges.

## Plan (agreed with user 2026-09-23, revamped 2026-09-24)
See `docs/roles/PLAN.md`. Order: gate → L1 vertical slice → extract skill → L2–L6.

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
- macOS filesystems are case-insensitive: writing `app.css` over Vite's `App.css` kept git's recorded name
  `App.css`, which breaks `import './app.css'` on Linux/CI hosts. Fixed with `git mv -f`. Check
  `git ls-files` casing after any case-only rename.
- The Browser pane's `preview_start` reads `.claude/launch.json` from the session's ORIGINAL folder, not this
  repo. Workaround: start Vite yourself (`npx vite --port 5178 --strictPort` in `app/`, background) and call
  `preview_start` with `url`. Background browser tabs don't paint, so screenshots come back blank; front the
  tab (`tabs_select`) before taking a screenshot. DOM/JS checks work in background tabs.
- The user sometimes clicks around in the pane; do QA in a separate tab rather than the user's.
- Townsend 2E PDF: text layer present, no bookmarks; printed page = PDF page − 16.
- Subagents with broad read-heavy briefs (whole books + many deliverables) stalled at the 600 s watchdog
  with nothing written (P and S, round 1, 2026-09-25). Fix that worked in the relaunch prompt: first action
  = write the doc skeleton, then fill one section at a time; read with offset/limit and greps only; split
  big roles (P → P1 verification, P2 story/layers).
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
