#!/bin/sh
# Motion Canvas PNG sequence → the openers' format (what app/src/openers/OpenerScrub.tsx scrubs):
# NNNN.webp from 0000, 1080 × 1350, RGB, lossy quality 80 (as pipeline/blender/common.py), plus poster.webp
# (a copy of one frame) and the scene's manifest.json. From the repo root:
#   sh pipeline/films/encode.sh <film> [poster-frame|last] [out-dir]
# Uses cwebp already on the machine (Homebrew libwebp); installs nothing.
set -eu
FILM="${1:?usage: encode.sh <film> [poster-frame|last] [out-dir]}"
POSTER="${2:-last}"
OUT="${3:-films/output/webp/$FILM}"
SRC="films/output/png/$FILM"
QUALITY=80
command -v cwebp >/dev/null 2>&1 || { echo "encode.sh: cwebp not found" >&2; exit 1; }
[ -d "$SRC" ] || { echo "encode.sh: no PNG frames in $SRC (run node pipeline/films/render.ts)" >&2; exit 1; }
rm -rf "$OUT"
mkdir -p "$OUT"
i=0
for f in "$SRC"/*.png; do
  # the exporter names frames 000000.png, 000001.png, …: refuse a gap
  [ "$(basename "$f")" = "$(printf %06d "$i").png" ] || { echo "encode.sh: expected frame $i, found $(basename "$f")" >&2; exit 1; }
  cwebp -quiet -q "$QUALITY" -m 6 -noalpha -metadata none "$f" -o "$OUT/$(printf %04d "$i").webp"
  i=$((i + 1))
done
[ "$POSTER" = last ] && POSTER=$((i - 1))
cp "$OUT/$(printf %04d "$POSTER").webp" "$OUT/poster.webp"
cp "films/output/$FILM/manifest.json" "$OUT/manifest.json"
echo "encode.sh: $i frames -> $OUT (poster = frame $POSTER)"
