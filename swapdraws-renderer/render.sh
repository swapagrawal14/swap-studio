#!/bin/bash
# SwapDraws renderer: render.sh <storyboard.json> <out.mp4> [--fps 30] [--size 1080x1920] [--workers 3] [--crf 18] [--preset slow] [--keep-frames]
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$DIR/render.mjs" "$@"
