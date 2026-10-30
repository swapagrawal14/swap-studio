#!/usr/bin/env python3
"""edge-tts voiceover + word timings for WordCaptions.
usage: tts_words.py "<text>" out.mp3 out.json [--voice en-IN-NeerjaNeural] [--rate +0%]
out.json = {"duration": sec, "words": [{"word","start","end"}]}  (seconds; punctuation restored from the script)
"""
import argparse, asyncio, json, re, subprocess
import edge_tts

ap = argparse.ArgumentParser()
ap.add_argument('text'); ap.add_argument('mp3'); ap.add_argument('json')
ap.add_argument('--voice', default='en-IN-NeerjaNeural'); ap.add_argument('--rate', default='+0%')
a = ap.parse_args()

async def main():
    c = edge_tts.Communicate(a.text, a.voice, rate=a.rate, boundary='WordBoundary')
    bounds = []
    with open(a.mp3, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio':
                f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                bounds.append((ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7, ch['text']))
    return bounds

bounds = asyncio.run(main())
norm = lambda s: re.sub(r'[^\w]', '', s.lower())
tokens = a.text.split()
words, ti = [], 0
for st, en, txt in bounds:
    out = txt
    # map back to the original token (keeps punctuation / casing / numbers like 5.5)
    for j in range(ti, min(ti + 4, len(tokens))):
        nt, nb = norm(tokens[j]), norm(txt)
        if nt and nb and (nt == nb or nt.startswith(nb) or nb.startswith(nt)):
            out, ti = tokens[j], j + 1
            break
    if words and words[-1]['word'] == out and ti and out == tokens[ti - 1] and abs(words[-1]['end'] - st) < 0.05 and norm(txt) != norm(out):
        words[-1]['end'] = round(en, 3)  # same token split into several boundaries (e.g. 5.5)
        continue
    words.append({'word': out, 'start': round(st, 3), 'end': round(en, 3)})
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.mp3]).decode().strip())
json.dump({'duration': dur, 'voice': a.voice, 'words': words}, open(a.json, 'w'), indent=1)
print(f'{len(words)} words, {dur:.2f}s')
