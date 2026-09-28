---
name: 14-decor-clip
description: Generate Higgsfield decor video clips for a course — atmosphere-only background footage with no text, numbers or diagrams, gated by a per-batch user credit approval. Trigger when a chapter or Part plan lists Higgsfield decor in its Media section (03-chapter-plan §10.3).
---

# Decor clip — Higgsfield atmosphere video

Reference: `skills/course-builder/references/media.md` "Generated media"; house rule: `BUILD-LOG.md` /
`CLAUDE.md` "Generated media (Higgsfield) is decoration only and never states a physical result."

## When to use
A Part or chapter plan's media section lists Higgsfield decor shots (e.g. "the cryostat interior", "a lab bench
ambience loop"). Only after the user has approved spending credits for that specific batch.

## Inputs
- A shot list from the plan: one line per clip, describing atmosphere only (lighting, material, mood) — never a
  diagram, a labelled quantity, or a stated result.
- The course's decor destination folder convention: `app/public/decor/<course-slug>/` (e.g.
  `app/public/decor/qc709/`).

## Steps
1. **Preflight the cost** with the Higgsfield tool's `get_cost` before generating anything: e.g.
   `seedance_2_5` at 720p for 5 s costs 35 credits. Multiply by the batch size and present the total to the user.
2. **Get per-batch credit approval from the user** before spending anything — this is required every batch, not
   a one-time standing approval, per the house rule and the Explicit-permission-required action category
   (spending the user's credits/money).
3. Generate the batch (atmosphere only — no on-screen text, no numbers, no diagrams; a generated clip must never
   be able to be mistaken for a source of a physical claim).
4. **A download needs the user's OK** as a separate confirmation from the generation approval (downloading a
   file is its own explicit-permission action).
5. Place files at `app/public/decor/<course-slug>/`.
6. Wire display through a `DecorVideo` component: `aria-hidden` (it carries no information a screen reader
   should announce), a poster frame, and reduced-motion behaviour that falls back to the poster (never autoplays
   a moving clip when the user has asked for reduced motion).

## Gates
- Cost preflighted and the total presented to the user *before* generation.
- User approval obtained for this specific batch, and separately for any download.
- No text, number, diagram or physical claim appears in any clip (a visual scan of every clip before it ships).
- The component is `aria-hidden`, has a poster, and honours reduced motion (tested the same way the opener
  player's reduced-motion path is tested: 0 frames/clip fetched under `prefers-reduced-motion`/the app's Motion
  toggle).

## Outputs
- Clip files under `app/public/decor/<course-slug>/`.
- A `DecorVideo` usage in the relevant page/component.
- A BUILD-LOG line recording credits spent and the batch's shot list.

## Pitfalls
- Treating "the user approved 709 decor in general" as covering a later batch — re-ask every batch; approval is
  per-action, not standing.
- A decor clip that accidentally contains readable text (e.g. a UI element caught in a generated interior shot)
  slips past a casual glance — check specifically for any incidental text or numerals before shipping.
- Skipping the poster/reduced-motion wiring because the clip "looks fine playing" ignores the accessibility and
  motion-preference contract every other moving element in the app already follows.

## Next
`09-visual-qa` to confirm the poster and reduced-motion fallback actually render where placed.
