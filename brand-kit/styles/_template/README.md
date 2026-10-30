# Make your own style pack (5 minutes)

1. **Copy** this folder: `cp -r styles/_template styles/my-style` and set `"name": "my-style"` in `style.json`.
2. **Colours**: fill the five core colours (`bg`, `paper`, `ink`, `accent`, `accent2`). Check contrast: `ink` must read on `paper`, `textOnBg` on `bg`. If your accent is dark, add `"highlightText": "#FFFFFF"` and `"tagText": "#FFFFFF"`.
3. **Fonts**: put any Google Fonts names in `fonts.title / body / caption` (needs internet while rendering), or drop `.woff2` files into the folder and use `{"family": "My Font", "weight": 700, "src": "./MyFont-700.woff2"}`. Wide fonts: set `"scale": 0.6`ish so titles fit.
4. **Accents**: `"rough"` for doodle / handmade, `"clean"` for modern / corporate, `"none"` for ultra-minimal.
5. **Images**: write `imageStylePrompt`, one paragraph describing the illustration medium, line style, palette (hex codes), mood and background, ending with *"no text, no letters, no watermark"*. Every illustration for this style gets it appended. Optional: generate 2–3 transparent decoration PNGs with an image model, save them in the folder and list them in `decorations` (`"./star.png"`).
6. **End card**: your name, handle, channel, CTA and `"avatar": "./me.jpg"` (square photo or cartoon). No avatar = initials.
7. **Voice**: any edge-tts voice (`edge-tts --list-voices`), e.g. `en-GB-SoniaNeural`, rate `+5%`.
8. **Test**: `./render.sh IntroOutro demo/styles/minimal-mono.json out/test.mp4 --stills 90,172` with `"style": "my-style"` in the props, look at the two PNG stills, tweak `scale` / colours, repeat.

Tip: to only tweak an existing pack, use `"extends": "chalkboard"` and set just the fields you change.

(Packs whose folder starts with `_` are ignored by `render.sh --styles`.)
