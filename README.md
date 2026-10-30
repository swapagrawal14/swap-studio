<div align="center">

# 🌷 Swap Studio

**A cloud video studio for explainer reels, in any style.**
Frame-perfect [SwapDraws](https://github.com/swapagrawal14/swap-draws) rendering + a Remotion brand kit with animated titles, karaoke captions and end cards, skinnable with **style packs**.

![License: MIT](https://img.shields.io/badge/license-MIT-F0509A?style=for-the-badge)
![Remotion](https://img.shields.io/badge/Remotion-4-FFD94A?style=for-the-badge&labelColor=111)
![Runs on Instabox](https://img.shields.io/badge/runs%20on-Instabox-111?style=for-the-badge)

<img src="docs/edu-demo.gif" width="300" alt="Edu Made Fun brand kit demo" />

</div>

---

## 🤖 Using it with an AI
Give any AI (ChatGPT, Gemini, Claude, Codex, LM Arena…) this repo's link plus your topic. It should read [`AGENTS.md`](AGENTS.md), which explains the whole pipeline, the brand rules and how to deliver.

> *"Read AGENTS.md in github.com/swapagrawal14/swap-studio and make me a 60-second Edu Made Fun reel on dry socket."*
>
> *"Read AGENTS.md in github.com/swapagrawal14/swap-studio and make me a 45-second reel on how vaccines work in the chalkboard style."*

Not Swapnil? The AI will ask which style you want (a preset, or a custom pack built from your description) and put your name on the end card.

## 🎨 Style packs

<img src="docs/style-packs.png" alt="All 7 style packs: swap-edu, swap-ai, chalkboard, minimal-mono, anime-pastel, newspaper-retro, neon-tech" />

Every colour, font, accent, decoration, voice, caption and end card comes from a **style pack**: one `style.json` in [`brand-kit/styles/`](brand-kit/styles).

| Pack | Vibe |
|---|---|
| `chalkboard` | dark green board, chalk white + yellow, sketchy handwriting |
| `minimal-mono` | white, black, one blue accent, Inter, clean lines |
| `anime-pastel` | pastel pink / lavender / sky, rounded font, sparkles |
| `newspaper-retro` | cream newsprint, bold serif, brick-red accent |
| `neon-tech` | dark navy, cyan + magenta glow, monospace |
| `swap-edu` · `swap-ai` | Swapnil's own brand (Edu Made Fun / Swap's AI World): please don't reuse |

**Pick one:** add `"style": "neon-tech"` to your props JSON. Tweak one without a new pack: `"style": {"extends": "minimal-mono", "colors": {"accent": "#FF5A1F"}, "endCard": {"name": "Priya", "handle": "@priyacodes"}}`.
**Make your own:** copy [`brand-kit/styles/_template`](brand-kit/styles/_template) and follow its 8-step guide: colours, any Google font (or your own woff2), `rough` / `clean` / `none` accents, an `imageStylePrompt` so the AI's illustrations match, your voice, avatar and handle. Full field list: [`brand-kit/styles/README.md`](brand-kit/styles/README.md) (+ JSON Schema).

## ✨ What's inside

| Folder | What it does |
|---|---|
| [`swapdraws-renderer/`](swapdraws-renderer) | Turns a SwapDraws storyboard JSON into an MP4, drawing **every frame** with the app's own engine. No dropped frames, voiceover in sync. |
| [`brand-kit/`](brand-kit) | Remotion components (titles, captions, accents, end cards) skinned by **style packs** in [`brand-kit/styles/`](brand-kit/styles): Swapnil's pink-and-yellow tulip brand plus 5 neutral presets anyone can use. |
| [`docs/instabox-setup.md`](docs/instabox-setup.md) | How the cloud machine is set up and controlled. |

### Brand kit components
- **TitleCard**: the title writes itself in word by word, with a marker swipe, the pack's decorations and sparkles
- **WordCaptions**: karaoke captions where each word pops in the pack's highlight colour as it's spoken (free edge-tts voice + word timings)
- **HighlightSwipe · WobblyUnderline · ArrowCircle**: hand-drawn (`rough`) or straight (`clean`) accents, seeded so every render matches
- **LowerThird**: name strip with an optional decoration
- **EndCard**: avatar (or initials), name, handle and Follow button, all from the pack
- **SwapDrawsClip**: wraps any SwapDraws MP4 with a branded intro and outro, using a brush-stroke wipe
- Every component works in both **9:16** (reels / Shorts) and **16:9** (YouTube)

<p>
<img src="docs/edu-title.png" width="200" />
<img src="docs/edu-endcard.png" width="200" />
<img src="docs/ai-endcard.png" width="360" />
</p>

## 🚀 Quick start

```bash
# Brand kit
cd brand-kit && npm install
./render.sh BrandShowcase demo/edu_showcase.json out/edu.mp4
./render.sh IntroOutro    demo/ai_intro.json     out/ai.mp4
./render.sh IntroOutro    demo/styles/chalkboard.json out/chalk.mp4   # any pack
./render.sh --styles                                             # list packs

# SwapDraws renderer (needs Chromium + ffmpeg)
cd swapdraws-renderer
./render.sh my-story.swapdraws.json out.mp4 --fps 30 --size 1080x1920
```

Props JSON picks the look: `"style": "<pack>"` (or `"channel": "edu" | "ai"`, the old alias for Swapnil's two packs) and `"format": "9:16" | "16:9"`. Add `"voiceText"` and the voiceover (in the pack's voice) plus caption timings are made for you.

## ☁️ Why a cloud machine?

Rendering video takes a real browser and lots of CPU. Swap Studio runs on a free [Instabox](https://instabox.sh) machine (4 vCPU / 8 GB). It wakes up to render and pauses when it's idle. A 64-second reel renders in about **54 s**, and a 12-second branded clip in about **33 s**.

## 📜 License

The Swap Studio code and the neutral style packs are MIT. The `swap-edu` / `swap-ai` packs, avatar, tulip art and brand assets belong to Swapnil Agrawal; please don't reuse them as your own brand. Bundled fonts are from Google Fonts under the SIL Open Font License.
[Remotion](https://remotion.dev/license) has its own license: it's free for individuals and teams of up to 3.

<div align="center">
Made with 🤍🥀 by <b>Dr. Swapnil Agrawal</b>, dentist, author and AI creator
</div>
