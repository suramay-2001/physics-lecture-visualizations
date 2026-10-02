#!/bin/sh
# The merge gate (skills/08-merge-gate): production build, then every vitest suite. Run from anywhere.
# Logs go to $GATE_LOGS (default: a temp folder) as build.log and vitest.log; exit status is non-zero on any failure.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGS="${GATE_LOGS:-${TMPDIR:-/tmp}/spinlab-gate}"
mkdir -p "$LOGS"
cd "$ROOT/app" || exit 2
npm run build > "$LOGS/build.log" 2>&1 || { echo "gate: build FAILED (see $LOGS/build.log)"; tail -20 "$LOGS/build.log"; exit 1; }
npx vitest run > "$LOGS/vitest.log" 2>&1 || { echo "gate: vitest FAILED (see $LOGS/vitest.log)"; grep -E "FAIL|×" "$LOGS/vitest.log" | head -20; exit 1; }
echo "gate: green"; grep -E "Test Files|Tests " "$LOGS/vitest.log" | tail -2
