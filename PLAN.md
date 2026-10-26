# PLAN — "What Did Ancient Humans Do All Day Before Money Existed?"

Target: ~15 min, ~2,200 words, one calm narrator, 1920x1080 @ 60 fps.

## Checklist (tick as you go — resume from the first unticked box)

### Step 1 — plan and script
- [x] Check repo for an earlier template / images (none: repo was empty, so a new reusable template was built in `remotion/`)
- [x] Study reference channel for style only (notes below)
- [x] Describe reference image → one style line
- [x] Research facts, save with sources in `facts.md`
- [x] Write script (hook, 10 chapters, midpoint line, ending that returns to the opening)
- [x] Shot list for every sentence (in `remotion/src/data/script.ts`, exported to `script.md`)
- [x] Picture list (38 single-object pictures) in `images/prompts.json` and `script.md`

### Step 2 — pictures
- [x] Generate hero character (reference for the others) — job `07cfc939-…`
- [x] Generate the remaining pictures (38/38 done; job IDs in `images/jobs.json`, links in `images/urls.json`)
- [ ] **BLOCKED — download.** The environment's network policy refuses `d8j0ntlcm91z4.cloudfront.net` (Higgsfield's image host). Allow it, then run `bash scripts/fetch_images.sh` (downloads + cuts out + writes `remotion/src/data/images.json`).
- [ ] Check each picture (text, colour, cut-off edges, style) and remake failures (max 2 remakes each)

### Step 3 — voice
- [x] Generate narration one paragraph at a time (28 takes, same voice, model and settings)
- [x] Join paragraphs with natural pauses → `audio/narration.wav` (15:10, rebuild with `python3 scripts/build_audio.py`)
- [x] Word-level timings → `remotion/src/data/timings.json` (offline forced alignment, pocketsphinx; all 2,187 words)

### Step 4 — animation
- [x] Remotion engine: one world, one camera, eased moves, magnifier, glow paths, counters, self-drawing diagrams, parallax
- [x] Every shot tied to its spoken word (`at:` cues resolved from the word timings)
- [x] One composition per chapter (`ch-intro` … `ch-ch10`) + `Full`
- [x] "Something new every 5 s" check: longest gap 4.6 s (`script.md` footer)

### Step 5 — check and render
- [x] Layout pass on hook + chapter 1 with placeholders (fixed: camera showing page edge, header clipped on a push-in)
- [ ] Stills every 2 s and at every shot change, per chapter, **with the real pictures**; review and fix — `npx tsx scripts/stills.ts <dir> <chapter>` then `python3 ../scripts/contact_sheets.py <dir> <sheets>`
- [ ] Render `out/full-video.mp4` with voice (≈1 hour at ~15 fps): see "Render" below
- [x] Write `youtube.md` (title + 2 alternatives, description with timestamps, sources, thumbnail idea, AI-disclosure note)

### Render (from `remotion/`)
```
npx remotion render src/index.ts Full ../out/full-video.mp4 --concurrency=4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```
Missing pictures render as orange dashed boxes labelled with their id, so a render can never silently ship without them.

## Budget log
| Item | Limit | Used | Notes |
|---|---|---|---|
| Image generations | 120 | 38 | Higgsfield `gpt_image_2_5` (GPT Image 2.5), quality high. 2K for 18 characters, 1K for 20 props. ~80 credits spent; 102.5 credits left for remakes |
| Full voice passes | 3 | 1 | 28 paragraph takes, no re-takes needed. ElevenLabs flow `LkHJzJz0Zh1qYv9nvh8L` |

## What I learned from the reference channel (style only)
YouTube itself was not reachable from the build machine, so these notes come from the channel screenshot supplied with the brief (six recent uploads), not from watching full videos.
- **Format:** 9–15 minute explainers (9:07 to 14:48 in the screenshot) about everyday life of early humans, told through one recurring cartoon character.
- **Titles:** a plain, curious question about ordinary life ("What did they actually do…?", "Why were they…?"). The top performer is the most everyday question, not the most dramatic one. Our title follows that pattern and must actually answer itself.
- **Thumbnails:** one large character, one big 2–3 word question in yellow block letters, simple bright background. (We won't copy the look; we'll do our own thumbnail idea in `youtube.md`.)
- **Visual style:** flat hand-drawn cartoon, thick black outlines, round white heads with dot eyes, earthy colors, light humour in the poses.
- **Pacing (inferred from the format):** short narration beats with a new drawing or pose every few seconds; chapters framed as small questions about daily life.
- **Hook pattern (inferred):** start with a surprising idea about ordinary life, then promise what the viewer will understand by the end.
- What we take: question-led chapters, frequent visual changes, a warm, light tone. What we don't take: any of their scripts, facts lists, pictures, characters, titles, thumbnails, logo or branding.

## Style line (from the reference image)
Reference image: flat hand-drawn cartoon, thick wobbly black marker outlines, flat sandy-tan / pale-blue / orange fills with no shading, round white-faced stick figure, calm and lightly comic.

Style line used word-for-word in every picture prompt:
> Hand-drawn 2D explainer cartoon, thick slightly wobbly black marker outlines, flat fills in muted earthy colors (sandy tan, warm brown, pale sky blue, soft orange), no gradients and no shading, round white-faced stick-figure people with simple dot eyes, light and friendly mood

Our own character (original, not the reference's): short dark-brown hair, tan hide wrap, and a single **red ochre bead on a cord** — the bead ties into the story (gifts, hxaro, beads as wealth).

## Voice (reuse for future videos)
- Narrator: **"BALDE 1"** from the user's ElevenLabs workspace (user's request), voice ID `sp0M69jsB2DII2YW0cWt`.
  - Note: the workspace also has a lowercase **"balde 1"** (`CupAGF51i4wviewHhSGh`) with the same description. We used the exact-case "BALDE 1".
- Model: `eleven_multilingual_v2` (steadiest for long narration).
- Settings: the voice's saved defaults (the connector does not set stability/similarity per call), one take per paragraph.
- The voice reads ~165 wpm; to keep it calm, `scripts/build_audio.py` adds 0.35 s between sentences, 0.6 s between paragraphs, 1.0 s between chapters (no time-stretching).
- Hard names are respelled for the voice only (`tts:` field): Ju/'hoansi → "Zhu-twa-see", hxaro → "hah-roh", Olorgesailie → "Oh-lor-geh-sigh-lee", Bizmoune → "Biz-moon", Geissenklösterle → "Geissen-klers-ter-leh".

## Production notes / decisions
- Images: single cut-outs on white → background removed locally (white flood-fill from the edges + soft edge), so line art inside the drawing is not damaged.
- Backgrounds (sky, ground, night, paper) are drawn in code in the same flat style, so the cut-outs can be placed on them.
- Labels, numbers and diagrams are drawn by the animation (never baked into pictures).
- Font: Patrick Hand (SIL Open Font License), via `@fontsource/patrick-hand`.
- No music (nothing royalty-free was added).
