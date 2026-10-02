---
name: 08-merge-gate
description: Merge a worktree branch into main, resolve the known conflict points, run `pipeline/gate.sh` and both Playwright projects, update the graph, and clean up the worktree. Trigger whenever a worktree agent (build, fix, platform, engine or stage-kind) reports a green commit ready to land.
---

# Merge gate

## When to use
Any worktree agent — chapter build, fix pass, platform commit, engine module, stage kind — reports done. Do this
in the **main checkout**, never inside a worktree.

## Inputs
- The worktree branch name and commit hash from the agent's report.
- `pipeline/gate.sh` (tracked in the repo, so no agent can delete it; agents run it in their own worktree; runs build then vitest,
  exits 1 on failure).

## Steps
1. `git fetch`/merge the worktree branch into main (`git merge --ff-only` if possible; otherwise a real merge).
2. **Conflict playbook** for the files every parallel chapter/agent touches:
   - `BUILT_709` / `BUILT` lists in e2e specs (`story.spec.ts` `_GL`/`_SVG`, `course709.spec.ts`): union both
     sides' additions.
   - Route lists (`security.spec.ts` ROUTES): union.
   - `concepts.ts`, `bridges.ts`: both sides only **appended** (per `05-chapter-build`'s rule) — union is safe;
     if either side reordered or reformatted existing entries, that itself is a defect to flag back.
   - Chapter glossaries: exempt from the chunk-contract's rule (d); a new rule (d2) checks the course pack
     instead — don't "fix" a glossary chunk placement that's supposed to be there.
   - `meta.generated.ts`: never hand-merge — regenerate with `UPDATE_META=1 npx vitest run
     src/content/meta.test.ts` after the text merge resolves.
   - `outline.test.ts`: only changes if a chapter moved Parts; apply the judge's ruling, not a guess.
   - The chunk contract: re-run `build/chunks.test.ts` after merging — two parallel additions can each be fine
     alone and together exceed a budget.
3. Run `sh pipeline/gate.sh` (build → vitest). Fix in a *new* commit if it fails (never `--amend` past a hook/gate
   failure — the failed run never happened as a commit).
4. Run **both** Playwright projects **separately** (one webServer per run): preview on its assigned port, dev on
   its assigned port. Never run both projects in one `playwright test` invocation.
5. `graphify update .` and confirm the graph is free of `sources/`, `/Users/`, or other local-path leaks.
6. Clean up the worktree: `rm -rf` the `node_modules` symlink folder and the `sources` symlink first, then
   remove the worktree (`git worktree remove`).
7. Update BUILD-LOG's "Current state" / "Next action" with the merge and evidence.

## Gates
- `pipeline/gate.sh` exits green (build + full vitest).
- Both e2e projects, run separately, are fully green with 0 CSP violations.
- `graphify update .` reports 0 tracked-path leaks.
- The worktree's `node_modules`/`sources` symlinks never appear in `git status` before the merge commit.

## Outputs
- A green main branch with the merged commit(s).
- Updated BUILD-LOG entry.
- A clean worktree list (`git worktree list` shows only what's still in flight).

## Pitfalls
- Playwright starts one webServer per run keyed off `argv` containing "preview"; running both projects together
  leaves the preview tests with no server (all fail in ~170 ms, easy to misread as a real regression).
- A multi-hour e2e run almost always means the machine slept mid-run, not that the suite is actually slow —
  rerun rather than trusting the elapsed time or a timeout as a real failure.
- An agent that overwrote `gate.sh` (pointing it at its own worktree) makes a "green" gate test the wrong tree —
  the main checkout's gate is `pipeline/gate.sh` specifically so agents' throwaway `gate.sh` copies never collide
  with it; if a result looks odd, check which directory the gate script actually `cd`s into.
- Stale `dist/`: security/chunk tests read the built output — always `npm run build` immediately before
  `vitest run`, never rely on a build from an earlier commit.

## Next
`09-visual-qa` on everything just merged, in both tracks if applicable.
