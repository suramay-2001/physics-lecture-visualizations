#!/bin/sh
# Render the chapter openers headless (decisions P3-blender.md). From the repo root:
#   sh pipeline/blender/render_openers.sh [hopf|belt|grover|both|all]     (both = hopf + belt, the 448 pair; all = all three)
# Needs Blender at $BLENDER (default: the macOS app bundle). --factory-startup keeps the user's add-ons
# (e.g. the MCP server on :9876) and preferences out of the render process.
set -eu
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
WHICH="${1:-both}"
node pipeline/blender/gen_opener_data.ts
render() {
  name="$1"; poster="$2"
  "$BLENDER" -b --factory-startup --python-exit-code 1 -P "pipeline/blender/opener_$name.py" -- --frames 0-119
  cp "app/public/openers/$name/$poster.webp" "app/public/openers/$name/poster.webp"
}
# posters: the frame that carries the idea alone (reduced motion, narrow screens)
case "$WHICH" in hopf | both | all) render hopf 0089 ;; esac
case "$WHICH" in belt | both | all) render belt 0098 ;; esac
# Grover: after two steps (frame 71): the arrow at its best, two earlier positions faint, the marked bar tall
case "$WHICH" in grover | all) render grover 0071 ;; esac
