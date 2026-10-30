# Swapnil brand kit (Remotion 4)

Lives on Instabox machine swap-studio at /data/home/brand-kit (node_modules there; this folder is the source without them).

    ./render.sh <Composition> <props.json> <out.mp4> [--concurrency 3] [--crf 18] [--preset medium] [--stills 30,200]

Compositions (all take "channel": "edu" | "ai" and "format": "9:16" | "16:9"; 30 fps):
- TitleCard     {title, highlight?, kicker?, subtitle?, durationSec?}
- EndCard       {cta?, durationSec?}  (always credits Dr. Swapnil Agrawal @edumadefun / Swapnil Agrawal @swap_agrawal)
- LowerThird    {title?, subtitle?, durationSec?, background?}
- WordCaptions  {words:[{word,start,end}] | voiceText, audio?}
- BrandShowcase {title, highlight, subtitle, lines:[{at, size?, font?: title|marker|hand, segs:[{text, fx?: highlight|underline|circle, label?, angle?}]}],
                 voiceText? (edge-tts en-IN-NeerjaNeural, word timings -> captions), voice?, voiceRate?, titleSec, contentSec?, endSec, cta?, lowerThird?}
- IntroOutro    {title, highlight, subtitle, titleSec, endSec, cta?}
- SwapDrawsClip {video: /abs/path.mp4, title, highlight, subtitle, introSec, endSec, lowerThird?: bool}

Any absolute file path in props (audio, video) is copied into the bundle for that job.
tools/tts_words.py "<text>" out.mp3 out.json [--voice en-IN-NeerjaNeural] [--rate +10%]  -> {"duration", "words":[{word,start,end}]}
Theme overrides: "theme": {"handle": "@x", "cta": "..."}.
Components (src/components): TitleCard, WriteOnText, HighlightSwipe, WobblyUnderline, ArrowCircle, Sparkle, Tulip, LowerThird, WordCaptions, EndCard, FactBoard/Paper, BrushWipe.
Art: tulip_pink/yellow/bunch.png are image-model doodles; avatar.jpg is her brand avatar. Accents are rough.js (seeded, deterministic).
