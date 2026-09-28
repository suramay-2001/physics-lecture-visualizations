---
name: 01-course-ingest
description: Add one source PDF or EPUB (lecture notes or a textbook) to a course's ingest pipeline — config entry, render/dpi choices, the mandatory visual pass, verbatim-test coverage and pages that need a vision read. Trigger when a new source file is being added or a source has moved.
---

# Course ingest — add a source

Full reference: `skills/course-builder/references/pipeline.md`.

## When to use
A new lecture-notes PDF, a new textbook, or a homework sheet needs to enter the pipeline; or an existing source
moved on disk and shows as `MISSING <id>`.

## Inputs
- The file itself (PDF or EPUB), never committed.
- Its role: `primary` (lecture notes) · `course-textbook` · `math-backbone` · `beyond-the-lecture` ·
  `reference-only` · `assigned` (homework — hints only downstream).
- For a book: the page range(s) actually used (`pages: [[from, to], …]`), to avoid rendering hundreds of unused
  pages.

## Steps
1. Add the **tracked** entry to `pipeline/course.config.json`: `{id, role, title, printed_page_offset?, pages?}`.
   No path here — paths are PII (they can name the source).
2. Add the **local, git-ignored** path to `pipeline/course.config.local.json`: `{"paths": {"<id>": "~/…/File.pdf"}}`.
   If this file does not exist yet for a new course, create it and confirm it is listed in `.gitignore`.
3. Run `python3 pipeline/ingest.py --only <id>` (add more ids comma-separated to batch). This writes
   `sources/<id>/{text.md, pages/pNN.png, sheets/, manifest.json}` — all git-ignored.
4. **Visual pass (mandatory, every lecture and every typeset book gets at least a spot-check):** read every
   contact sheet in `sources/<id>/sheets/`, not just `text.md`. OneNote/handwritten exports keep handwriting as
   vector paths and pasted screenshots as images that never reach the text layer (`get_image_info()` returns the
   same list on every page there, so image-area flags are meaningless). Flag every page whose meaning depends on
   a picture, a boxed derivation, or handwriting as **needs-vision**: it must be read again as an image, not
   assumed from `text.md`.
5. Record the printed-page offset once you can read a page number on the rendered page: `printed = PDF_page −
   offset`. It is usually constant (Axler −14, Townsend −16, Nielsen & Chuang −28) but can drift per chapter in
   an e-book that drops blank pages (Bergou: use the per-chapter table in `docs/roles/proposals/P-709-map.md`
   (d)-E1, not a single constant).
6. If a source is `assigned` (homework), mark it so downstream chapter plans default every problem it contains
   to hints-only (`04-chapter-rule` "homework guard").

## Gates
- `sources/` stays entirely git-ignored; `pipeline/course.config.local.json` is git-ignored; a `grep` of tracked
  files for `/Users/` or a local username must return nothing (checked by `graphify update .`, which reports 0
  leaks).
- Every needs-vision page has actually been read as an image before any chapter plan cites it.
- The printed-page offset is verified on at least one rendered page (not assumed from a book's stated
  pagination).

## Outputs
- `sources/<id>/` (text, page renders, sheets, manifest) — local only.
- An updated `pipeline/course.config.json` entry (tracked) and `.local.json` path (untracked).
- A note of the offset and any needs-vision pages, carried into `02-part-map` or `03-chapter-plan`.

## Pitfalls
- Some `sources/*/text.md` files classify as binary to `grep` (odd bytes): use `grep -a`.
- A moved source shows as `MISSING <id>`; `mdfind -name "<title>"` finds it on macOS — fix the local path only,
  never the tracked config.
- Reif-style scanned PDFs (tiff2pdf) have no text layer at all: treat every page as needs-vision.
- Re-ingesting weekly for a growing notes PDF can re-order or renumber chapters; diff against the map and record
  the change in BUILD-LOG rather than silently re-numbering built chapters.

## Next
`02-part-map` (if this source opens a new Part) or `03-chapter-plan` (if it feeds a chapter already mapped).
