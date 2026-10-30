#!/bin/bash
# Swap Studio brand kit: render.sh <composition> <props.json> <out.mp4> [--concurrency 3] [--crf 18] [--preset medium] [--stills 30,200]
# Compositions: TitleCard EndCard LowerThird WordCaptions BrandShowcase IntroOutro SwapDrawsClip
# Style: put "style": "<pack>" (or an inline pack) in props.json; render.sh --styles lists packs.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
if [ "${1:-}" = "--styles" ]; then cd "$DIR"; exec node render.mjs --styles; fi
if [ $# -lt 3 ]; then sed -n 2,4p "$0"; exit 2; fi
COMP="$1"; PROPS="$(realpath "$2")"; OUT="$(realpath -m "$3")"; shift 3
cd "$DIR"
exec node render.mjs "$COMP" "$PROPS" "$OUT" "$@"
