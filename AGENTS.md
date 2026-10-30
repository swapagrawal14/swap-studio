# AGENTS.md: read this first (for any AI agent or LLM)

Swap Studio was built by **Dr. Swapnil Agrawal** (dentist, author, AI creator, Udaipur, India) to make **high-quality animated explainer videos**, and anyone can use it in any visual style via **style packs**. Quality over quantity: one great video beats ten cheap ones.

## Who is this video for? (decide first)
- **The user is Swapnil, or asks for Edu Made Fun / Swap's AI World** → use pack `swap-edu` (Edu Made Fun) or `swap-ai` (Swap's AI World) and follow *Channels and credit* + *Swapnil's brand style* below.
- **Anyone else** → ask which style they want before you script. Offer the presets: `chalkboard` (dark green board, chalk), `minimal-mono` (white/black/blue, clean), `anime-pastel` (pastel, cute, sparkles), `newspaper-retro` (cream paper, serif, red), `neon-tech` (dark navy, cyan/magenta, mono), **or** build a custom pack from their description (copy `brand-kit/styles/_template`, see its README). Also ask for their name, handle and channel for the end card (or override via `"style": {"extends": "<pack>", "endCard": {...}}`). Never put Swapnil's name, avatar or tulips on someone else's video, and never use `swap-*` packs for them.

## The system (two repos)
| Repo | Role |
|---|---|
| https://github.com/swapagrawal14/swap-draws | **SwapDraws**: browser whiteboard-animation app (live: https://swap-draws.vercel.app). Videos are written as a **SwapDraws JSON storyboard**. The full storyboard spec and director prompt are in its `AI-STORYBOARD-PROMPT.md`; read and follow it. |
| https://github.com/swapagrawal14/swap-studio (this repo) | **Swap Studio**: frame-perfect renderer for SwapDraws JSON (`swapdraws-renderer/`) plus a **Remotion brand kit** (`brand-kit/`) for title cards, word-by-word captions, accents and end cards. |

## Channels and credit (Swapnil's videos)
- **Edu Made Fun** (`@edumadefun`), dental education for BDS and NEET MDS students. End card and description must credit **"Dr. Swapnil Agrawal"**.
- **Swap's AI World**, beginner-friendly AI content. Credit **"Swapnil Agrawal"**.
- Tone: fun, warm, simple, and **100% accurate**. Check facts against textbooks or guidelines and never invent numbers.

## Style packs (every video)
- Packs live in `brand-kit/styles/<name>/style.json` (fields: `brand-kit/styles/README.md`, schema `style.schema.json`). They set colours, fonts, accents (`rough`/`clean`/`none`), decorations, `imageStylePrompt`, edge-tts voice, end card and captions.
- **Illustrations:** append the chosen pack's `imageStylePrompt` to **every** image-model prompt so all images match the pack.
- **SwapDraws storyboards must match the pack:** use its `colors` (bg/paper/ink/accent/accent2) for backgrounds, text and accent layers, and its `fonts.title/body` families for text layers (load the same Google font in SwapDraws if it isn't built in; otherwise the closest available).
- **Voice:** use the pack's `voice` (name + rate) for the voiceover unless the user asks otherwise.
- **Remotion props:** `"style": "<pack>"` (or an inline / `extends` object). `"channel": "edu"|"ai"` is a legacy alias for `swap-edu`/`swap-ai`.

## Swapnil's brand style (`swap-edu` / `swap-ai` only)
- Colors: hot pink `#F0509A`, sunny yellow `#FFD94A`, black ink, white or cream paper. Pastel palettes are off-brand.
- Fonts: Caveat, Permanent Marker, Patrick Hand (in `brand-kit/public/fonts`).
- Signature: tulip doodles (`brand-kit/public/img/tulip_*.png`) and her avatar (`avatar.jpg`). If a person appears, it must be **her own cartoon character**, never a different girl.
- Her illustrations: bold cartoon, thick black outlines, flat bright colors (her packs' `imageStylePrompt`).

## Illustration rules (every pack, always)
- **Illustrations must come from an image model**, in the pack's `imageStylePrompt` style. **Never hand-code SVG illustrations** of characters or scenes; they look like nonsense. Simple accents (underlines, arrows, highlighter swipes, sparkles) are fine.
- The image model must not draw text. Add all words as SwapDraws text layers or Remotion text, so spelling stays perfect.

## Pipeline (do it in this order)
1. **Clarify** if missing: topic, **style pack** (Swapnil: channel → `swap-edu`/`swap-ai`; others: ask, see above), length (default 60 s), format (default 9:16, 1080x1920), language (default English).
2. **Script**: 5–7 scenes, a hook in the first 3 s, one idea per scene, then a call to action to follow.
3. **Images**: generate the illustrations with the pack's `imageStylePrompt` appended, under 300 KB each (JPEG/PNG data URLs).
4. **Voiceover**: free `edge-tts` with the pack's `voice` (Swapnil's packs: `en-IN-NeerjaNeural`, rate about +10%). Time each scene to its measured line plus padding.
5. **Storyboard**: SwapDraws JSON `swapdraws: 1`, in the pack's colours and fonts, whole file ideally under 5 MB. **Exactly one audio source** (a full voiceover track OR per-scene audio, never both). Never set `w`/`h` on text layers. Follow every hard rule in `AI-STORYBOARD-PROMPT.md`.
6. **Render**: `swapdraws-renderer/render.sh story.swapdraws.json out.mp4 --fps 30 --size 1080x1920`. It draws every frame with the app's engine. The in-app export can drop frames when headless, so prefer this script.
7. **Brand wrap (optional)**: `brand-kit/render.sh SwapDrawsClip props.json final.mp4` adds the styled intro, captions and end card. Props: `style: "<pack>"` (or legacy `channel: "edu"|"ai"`), `format: "9:16"|"16:9"`, `voiceText` for automatic captions.
8. **QA before delivering**: check duration, fps and audio with `ffprobe`, then look at 3–5 extracted frames. Check that spelling is perfect, nothing is cut off, it matches the chosen pack, and the facts are right. Fix anything wrong, with at most 2 rounds.
9. **Deliver**: the MP4, the storyboard JSON, a 9:16 cover PNG, the narration script and the fact sources.

## If you can't run code (chat-only AI)
Do steps 1–5 and give the user the **SwapDraws JSON** (and the script). They import it at https://swap-draws.vercel.app and export it there.

## Where to run it
Any machine with **Node 18+, Chromium/Chrome and ffmpeg** (and Python for edge-tts): her laptop, GitHub Codespaces, or a cloud VM such as Instabox (see `docs/instabox-setup.md`). Never commit API keys or tokens.
