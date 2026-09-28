# Pattern: worktree agent setup

Used by every worktree brief (`skills/course-builder/references/{lecture-agent-brief,chapter-agent-brief-709}.md`
and every fix/platform/stage-kind brief in `05-chapter-build`, `07-chapter-fix`). A fresh `git worktree` has no
`node_modules` and no `sources/` (both git-ignored) — link both before running anything.

## The per-package `node_modules` link

```sh
mkdir app/node_modules
for p in "<MAIN_CHECKOUT>/app/node_modules"/* "<MAIN_CHECKOUT>/app/node_modules"/.bin; do
  ln -s "$p" app/node_modules/
done
```

**Why per-package, not one symlink to the whole folder:** a single `ln -s <MAIN_CHECKOUT>/app/node_modules
app/node_modules` makes the worktree and the main checkout share Vite's dependency-optimization cache and
chunk-report cache — a build or dev server running in one corrupts the other's cache mid-session. Linking each
*package* individually gives the worktree its own `node_modules` directory (so Vite treats it as its own
install) while still sharing the actual installed files on disk (no second `npm install`, no extra disk space).

## The `sources` link, and never committing either

```sh
ln -s "<MAIN_CHECKOUT>/sources" sources   # git-ignored, copyrighted; worktree needs it for citations, never a copy
git status                                # confirm before every commit: no node_modules/ or sources entries
```

If `git status` ever shows either as an untracked addition (it shouldn't — both match `.gitignore`), stop and
check `.gitignore` rather than adding them. Files are added by explicit path in every commit, never `git add -A`,
partly to keep this mistake structurally hard to make.

## graphify before reading/grepping

`graphify query "<question>"` before grepping or reading raw source for orientation — every worktree brief
includes this line; it applies inside a worktree exactly as in the main checkout (`graphify-out/graph.json` is
tracked, so the worktree has it).

## Cleanup (after the branch is merged, `08-merge-gate`)

```sh
rm -rf app/node_modules   # removes the per-package LINKS only — never the real packages in the main checkout
rm sources                # removes the symlink only
git worktree remove <path>
```

Remove `node_modules`'s links and the `sources` link **first**, then remove the worktree itself — removing the
worktree directory directly while it still holds live symlinks into the main checkout's files is the same
operation but harder to verify went cleanly.

## Shared scratchpad discipline

The session scratchpad is shared across every agent in flight. A worktree brief must:
- name its own helper files with a unique prefix (`f1fix-*`, `stagekinds-*`, `q1review-*`, …) so parallel agents
  never collide;
- **never edit a file it did not create there**, and never touch `gate.sh` / `gate-main.sh` — those are the
  orchestrator's own commit-gate scripts, and an agent that points one at its own worktree makes a "green" gate
  silently test the wrong tree.
