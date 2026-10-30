# Instabox: swap-studio (SwapDraws renderer)

- Machine: **swap-studio**, id `<machine-id>`, template agent-browser, free plan (4 vCPU / 8 GiB, /data 20 GiB persistent). Left **stopped** after setup (start it before use; idle pause after 30 min, max run 480 min).
- API: https://api.instabox.sh/v1 (key injected for service "instabox"). Lifecycle calls need an `Idempotency-Key` header. Exec: `POST /v1/machines/{id}/exec` `{"cmd": "..."}`. Upload: `PUT /v1/machines/{id}/files?path=/abs/path&parents=true` (raw body). Download: `GET /v1/machines/{id}/files/content?path=...`.
  - Start: `curl -X POST https://api.instabox.sh/v1/machines/<machine-id>/start -H "X-API-Key: $INSTABOX_API_KEY" -H "Idempotency-Key: $(uuidgen)"`; stop is the same with `/stop`.

## Paths on the machine
- `/data/home/swap-draws` — read-only clone of github.com/swapagrawal14/swap-draws (never pushed/modified)
- `/data/home/render/render.sh` + `render.mjs` — the renderer (puppeteer-core 23 in `/data/home/render/node_modules`, system Chromium `/usr/bin/chromium`, ffmpeg via apt)
- `/data/home/in/` — uploaded storyboards; `/data/home/out/` — rendered MP4s; `/data/home/render/tmp/` — per-job PNG frames (deleted after encode unless `--keep-frames`)
- Local copies of the scripts: /workspace/instabox/render.sh, /workspace/instabox/render.mjs

## Run
```
/data/home/render/render.sh <storyboard.json> <out.mp4> [--fps 30] [--size 1080x1920] [--workers 3] [--crf 18] [--preset slow] [--keep-frames]
```
For long jobs run it with nohup and poll the log (exec calls should stay short):
`cd /data/home/render && nohup ./render.sh /data/home/in/X.swapdraws.json /data/home/out/X.mp4 > render.log 2>&1 &`

## How it works
Serves the app on 127.0.0.1, opens it in headless Chromium (one browser per worker — tabs sharing a browser get background-throttled and stall), imports the JSON via `#impJsonInput`, waits for fonts and warms every scene, then renders frame f at t = f/fps with `SD.engine.renderProjectFrame(project, t, ctx, {showHand:true, forExport:true})` onto a WxH canvas, saved as lossless PNG. Frame count = round(SD.engine.projectDuration × fps); script aborts if any frame is missing. ffmpeg: libx264 preset slow, CRF 18, yuv420p, +faststart; audio = voiceover + per-scene audio layers pulled from the app's asset store and placed with adelay at their exact offsets (AAC 192k), trimmed/padded to video length.

Known gap: the app's live pencil-scratch SFX (layers with `sfx: true`) is synthesized in WebAudio and is not included.

## Test (2026-10-30)
cavity-stephan-curve: 1912 frames, 30 fps, 63.733 s, 1080x1920, AAC audio present; total render 53.8 s (31 s frames + 23 s encode). Output pulled to /workspace/swapdraws-videos/cavity-stephan-curve/instabox-test.mp4.

## Brand kit (Remotion 4.0.539), added 2026-10-30
- Path on machine: `/data/home/brand-kit` (node_modules installed there: remotion, @remotion/cli/renderer/bundler, react 18, roughjs; edge-tts 7.3.1 via pip). It uses system Chromium `/usr/bin/chromium` (chromeMode chrome-for-testing). The SwapDraws renderer in `/data/home/render` is untouched.
- Source copy without node_modules: /workspace/brand-kit/src (see its README.md for every prop). Edit it there, upload (tar plus `PUT /files`), and extract over `/data/home/brand-kit`.
- Render: `cd /data/home/brand-kit && nohup ./render.sh <Composition> <props.json> out/<name>.mp4 --stills 60,200 > out/x.log 2>&1 &`, then poll the log. The exec call times out at about 60 s, so always use nohup.
- Compositions: TitleCard, EndCard, LowerThird, WordCaptions, BrandShowcase, IntroOutro, SwapDrawsClip. Props `"channel": "edu"|"ai"` and `"format": "9:16"|"16:9"`.
- Voiceover: put `"voiceText"` (plus optional `"voiceRate": "+12%"`) in the props. render.mjs runs tools/tts_words.py (edge-tts en-IN-NeerjaNeural, word boundaries) and fills in audio, words and contentSec.
- SwapDraws wrapper: `{"video": "/data/home/out/X.mp4", "title": ..., "highlight": ...}`. The length is read with ffprobe, and the clip's own audio is kept.
- Bundle is cached in `.cache/` (it rebuilds when src/ or public/ changes, about 6 s). Per-job assets go in `.jobs/`, and the out/ files stay until you delete them.
- Test render times (4 vCPU, concurrency 3): edu BrandShowcase 9:16, 380 f (12.7 s): 33 s render, 38 s total with TTS. ai IntroOutro 16:9, 240 f (8 s): 21 s. SwapDrawsClip 9:16 with a 4 s clip, 315 f: 30 s.
