#!/usr/bin/env python3
"""Stage 1 of the course pipeline: turn lecture notes and books into readable sources.

For every document listed in course.config.json this writes, under sources/<id>/:
  text.md        extracted text, one "## p<N>" section per page
  pages/pNN.png  rendered page images (lectures only; books are text-first)
  manifest.json  per-page stats; pages flagged `needs_vision` carry content the text
                 layer missed (handwriting, pasted screenshots, scans) and must be
                 read as images before authoring.

Books can be large, so they are only rendered for the page ranges named in the config.
EPUBs are converted chapter-by-chapter to plain text.

Usage: python3 pipeline/ingest.py [pipeline/course.config.json]
"""
import html
import json
import re
import sys
import zipfile
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parent.parent
# A page whose text layer is shorter than this, or that has large embedded images,
# probably has content only visible to a human (or a vision model).
MIN_TEXT_CHARS = 250
MIN_IMAGE_AREA_FRACTION = 0.15


# Pen strokes in OneNote/tablet exports are stored as vector paths, not text or images.
MAX_VECTOR_PATHS = 50


def page_needs_vision(page: "fitz.Page", text: str) -> bool:
    """Advisory only. Lectures always get a full visual pass regardless of this flag.

    OneNote PDF exports report the same image list on every page, so image presence
    alone over-flags; ink strokes show up as hundreds of vector paths instead.
    """
    if len(text.strip()) < MIN_TEXT_CHARS:
        return True
    if len(page.get_drawings()) > MAX_VECTOR_PATHS:
        return True
    page_area = page.rect.width * page.rect.height
    for info in page.get_image_info():
        x0, y0, x1, y1 = info["bbox"]
        if (x1 - x0) * (y1 - y0) / page_area > MIN_IMAGE_AREA_FRACTION:
            return True
    return False


def write_contact_sheets(doc: "fitz.Document", out: Path, per_sheet: int = 2, dpi: int = 80) -> None:
    """Two pages side by side per image: the cheapest way to do the mandatory visual pass."""
    import io
    from PIL import Image

    (out / "sheets").mkdir(exist_ok=True)
    for s in range(0, doc.page_count, per_sheet):
        ims = [Image.open(io.BytesIO(doc[i].get_pixmap(dpi=dpi).tobytes("png")))
               for i in range(s, min(s + per_sheet, doc.page_count))]
        sheet = Image.new("RGB", (sum(i.width for i in ims), max(i.height for i in ims)), "white")
        x = 0
        for im in ims:
            sheet.paste(im, (x, 0))
            x += im.width
        sheet.save(out / "sheets" / f"p{s + 1:02d}.png")


def ingest_pdf(doc_id: str, path: Path, render: bool, page_ranges, dpi: int) -> dict:
    out = ROOT / "sources" / doc_id
    (out / "pages").mkdir(parents=True, exist_ok=True)
    doc = fitz.open(path)
    wanted = set(range(doc.page_count))
    if page_ranges:
        wanted = {p - 1 for a, b in page_ranges for p in range(a, b + 1) if p <= doc.page_count}
    lines, pages = [f"# {doc_id}\n\nsource: {path.name}\n"], []
    for i in sorted(wanted):
        page = doc[i]
        text = page.get_text()
        flag = page_needs_vision(page, text)
        lines.append(f"\n## p{i + 1}{'  [NEEDS VISION]' if flag else ''}\n\n{text}")
        if render and (flag or not page_ranges):
            page.get_pixmap(dpi=dpi).save(out / "pages" / f"p{i + 1:02d}.png")
        pages.append({"page": i + 1, "chars": len(text), "needs_vision": flag})
    (out / "text.md").write_text("".join(lines))
    if render and not page_ranges:
        write_contact_sheets(doc, out)
    manifest = {"id": doc_id, "source": str(path), "page_count": doc.page_count, "pages": pages}
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2))
    return manifest


def ingest_epub(doc_id: str, path: Path) -> dict:
    out = ROOT / "sources" / doc_id
    out.mkdir(parents=True, exist_ok=True)
    chapters = []
    with zipfile.ZipFile(path) as z:
        names = sorted(n for n in z.namelist() if re.search(r"\.(x?html?)$", n))
        for n in names:
            raw = z.read(n).decode("utf-8", "ignore")
            raw = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", raw, flags=re.S)
            raw = re.sub(r"<br\s*/?>|</p>|</h\d>|</li>|</div>", "\n", raw)
            text = html.unescape(re.sub(r"<[^>]+>", "", raw))
            text = re.sub(r"\n\s*\n+", "\n\n", text).strip()
            if len(text) > 200:
                stem = Path(n).stem
                (out / f"{stem}.md").write_text(text)
                chapters.append({"file": f"{stem}.md", "chars": len(text)})
    manifest = {"id": doc_id, "source": str(path), "chapters": chapters}
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2))
    return manifest


def main() -> None:
    # usage: ingest.py [config.json] [--only L7,townsend]   (--only: re-extract just these ids)
    args = sys.argv[1:]
    only = None
    if "--only" in args:
        i = args.index("--only")
        only = set(args[i + 1].split(","))
        del args[i:i + 2]
    cfg_path = Path(args[0]) if args else ROOT / "pipeline" / "course.config.json"
    cfg = json.loads(cfg_path.read_text())
    # Where each source lives on this machine is private, so it sits in a git-ignored file.
    local_path = cfg_path.with_name("course.config.local.json")
    if not local_path.exists():
        sys.exit(f"Missing {local_path.name}: copy course.config.local.example.json and fill in your paths.")
    paths = json.loads(local_path.read_text())["paths"]
    report = []
    for item in cfg["lectures"] + cfg["books"]:
        if only and item["id"] not in only:
            continue
        if item["id"] not in paths:
            report.append(f"NO PATH {item['id']}: add it to {local_path.name}")
            continue
        path = Path(paths[item["id"]]).expanduser()
        if not path.exists():
            report.append(f"MISSING {item['id']}: {path}")
            continue
        if path.suffix == ".epub":
            m = ingest_epub(item["id"], path)
            report.append(f"{item['id']}: epub, {len(m['chapters'])} chapters")
        else:
            is_lecture = item in cfg["lectures"]
            m = ingest_pdf(item["id"], path, render=is_lecture or bool(item.get("render")),
                           page_ranges=item.get("pages"), dpi=item.get("dpi", 110 if is_lecture else 80))
            flagged = [p["page"] for p in m["pages"] if p["needs_vision"]]
            report.append(f"{item['id']}: {len(m['pages'])} pages, needs vision: {flagged or 'none'}")
    print("\n".join(report))


if __name__ == "__main__":
    main()
