# 2026-10-14 the 12 reference PDFs

The 12 approved references of *Tour de gross* were downloaded from arXiv into the untracked `sources/ref-*` and registered as text-only references of `paper-tdg` in `pipeline/course.papers.json` (`role: "reference"`, `paper: "paper-tdg"`; ids `ref-fow12 ref-lit19b ref-gsj24 ref-bra24 ref-bev25 ref-bev22 ref-cro24 ref-wy24 ref-sjy24 ref-lit19a ref-hor12 ref-bk05`). Re-extract with `python3 pipeline/ingest.py pipeline/course.papers.json`.
Rules: paraphrase and cite by section; `verbatim.test.ts` covers them like any source; a number taken from a reference is `reported` with that reference's key (ruling papers-B3B4 R1, platform change pending); no further PDFs without the owner's per-batch approval.
