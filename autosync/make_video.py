#!/usr/bin/env python3
"""
autosync/make_video.py
Turn a folder of images + one MP3 voiceover into a finished MP4,
with every image shown at the right moment of the narration.

Usage (run from the autosync/ folder):
    python3 make_video.py                 # full run: plan + render
    python3 make_video.py --plan-only     # only write output/timeline.json
    python3 make_video.py --render-only   # render from an existing/edited timeline.json

Folders:
    input/images/*.jpg|png|webp   your images (sorted by file name = story order)
    input/voiceover.mp3           your narration
    input/timestamps.csv          (optional) one line per image: image,start   e.g.  001.png,0:00
                                  or  intro.png,00:12.5  - or put the time in the file name (scene_01-05.png)
                                  If missing, scenes are cut at natural pauses in the voice.
    output/timeline.json          the plan (image, start, end) - you may edit it
    output/final_video.mp4        the result
"""
import argparse, json, re, subprocess, sys, shutil
from pathlib import Path
from PIL import Image, ImageFilter

HERE = Path(__file__).parent
IMG_DIR = HERE / "input" / "images"
AUDIO = HERE / "input" / "voiceover.mp3"
OUT = HERE / "output"
W, H, FPS = 1920, 1080, 30
MIN_SCENE = 1.5  # seconds


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, text=True, capture_output=True, **kw)


def natural_key(p):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", p.name)]


def list_images():
    exts = {".jpg", ".jpeg", ".png", ".webp"}
    imgs = sorted([p for p in IMG_DIR.iterdir() if p.suffix.lower() in exts], key=natural_key)
    if not imgs:
        sys.exit(f"No images found in {IMG_DIR}")
    return imgs


def audio_duration():
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(AUDIO)])
    return float(r.stdout.strip())


def find_pauses(duration):
    """Return list of (pause_mid_time, pause_length) using ffmpeg silencedetect."""
    for noise, dur in (("-35dB", 0.25), ("-30dB", 0.15), ("-25dB", 0.10)):
        r = subprocess.run(
            ["ffmpeg", "-hide_banner", "-i", str(AUDIO), "-af",
             f"silencedetect=noise={noise}:d={dur}", "-f", "null", "-"],
            text=True, capture_output=True)
        starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
        ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
        pauses = [((s + e) / 2, e - s) for s, e in zip(starts, ends) if 0.3 < (s + e) / 2 < duration - 0.3]
        if len(pauses) >= 5:
            return pauses
    return []



def parse_time(txt):
    """'83.5', '1:23', '01:23.5', '1:02:03', '00-12', '0m12s' -> seconds (float) or None."""
    t = txt.strip().lower().replace(",", ".")
    m = re.fullmatch(r"(?:(\d+)h)?(?:(\d+)m)?(\d+(?:\.\d+)?)s", t)
    if m:
        return int(m.group(1) or 0) * 3600 + int(m.group(2) or 0) * 60 + float(m.group(3))
    parts = re.split(r"[:\-_]", t) if re.fullmatch(r"\d+(?:[:\-_]\d+){1,2}(?:\.\d+)?", t) else [t]
    try:
        vals = [float(x) for x in parts]
    except ValueError:
        return None
    sec = 0.0
    for v in vals:
        sec = sec * 60 + v
    return sec


def load_timestamps(images):
    """Return {image_name: start_seconds} from input/timestamps.(csv|txt|json) or from file names."""
    names = {p.name: p.name for p in images}
    stems = {p.stem: p.name for p in images}
    found = {}
    for f in (HERE / "input" / n for n in ("timestamps.csv", "timestamps.txt", "timestamps.json")):
        if not f.exists():
            continue
        if f.suffix == ".json":
            data = json.loads(f.read_text())
            rows = data.items() if isinstance(data, dict) else [(d["image"], d["start"]) for d in data]
        else:
            rows = []
            for line in f.read_text().splitlines():
                line = line.strip()
                if not line or line.startswith("#") or line.lower().startswith(("image", "file")):
                    continue
                bits = [b.strip() for b in re.split(r"[,\t;]| - | = ", line, maxsplit=1)]
                if len(bits) == 2:
                    # accept "image,time" or "time,image"
                    a, b = bits
                    rows.append((a, b) if (a in names or a in stems) else (b, a))
        for img, t in rows:
            key = names.get(str(img).strip()) or stems.get(str(img).strip())
            sec = t if isinstance(t, (int, float)) else parse_time(str(t))
            if key and sec is not None:
                found[key] = float(sec)
        if found:
            print(f"Using timestamps from {f.name} ({len(found)} images)")
            return found
    # fall back: a timestamp inside the file name, e.g. 001_00-12.png, scene_01m05s.jpg, 0:12.png
    for p in images:
        m = re.search(r"(\d+(?:[:\-_]\d+){1,2}(?:\.\d+)?|\d+h?\d*m\d+(?:\.\d+)?s|\d+(?:\.\d+)?s)(?!.*\d)", p.stem)
        t = parse_time(m.group(1)) if m else None
        if t is not None:
            found[p.name] = t
    if len(found) == len(images):
        print("Using timestamps found in the image file names")
        return found
    return {}


def timeline_from_timestamps(images, stamps, duration):
    missing = [p.name for p in images if p.name not in stamps]
    if missing:
        sys.exit("These images have no timestamp: " + ", ".join(missing[:10]))
    rows = sorted(((stamps[p.name], p.name) for p in images))
    tl = []
    for i, (t, name) in enumerate(rows):
        start = 0.0 if i == 0 else t          # first image covers the opening
        end = rows[i + 1][0] if i + 1 < len(rows) else duration
        if start >= duration:
            print(f"  WARNING: {name} starts at {t:.1f}s, after the audio ends ({duration:.1f}s) - skipped")
            continue
        if end - start < 0.1:
            print(f"  WARNING: {name} lasts under 0.1s (same timestamp as the next image) - skipped")
            continue
        tl.append({"image": name, "start": round(start, 3), "end": round(min(end, duration), 3)})
    return tl


def plan_timeline(images, duration):
    """Cut the narration into len(images) scenes, preferring natural pauses."""
    n = len(images)
    min_scene = min(MIN_SCENE, duration / n)
    pauses = find_pauses(duration)
    cuts, prev = [0.0], 0.0
    for i in range(1, n):
        ideal = duration * i / n
        lo, hi = max(prev + min_scene, ideal - 0.45 * duration / n), ideal + 0.45 * duration / n
        # leave room so the remaining scenes can still reach the minimum length
        hi = min(hi, duration - (n - i) * min_scene)
        cands = [(t, l) for t, l in pauses if lo <= t <= hi]
        if cands:  # best = long pause, close to ideal position
            t = max(cands, key=lambda c: c[1] - 0.15 * abs(c[0] - ideal))[0]
        else:
            t = min(max(ideal, lo), max(lo, hi))
        cuts.append(t)
        prev = t
    cuts.append(duration)
    return [{"image": images[i].name, "start": round(cuts[i], 3), "end": round(cuts[i + 1], 3)}
            for i in range(n)]


def compose_frame(src, dst):
    """Fit image into 16:9 (no stretching) over a blurred copy of itself, 10% oversize for zoom."""
    fw, fh = int(W * 1.1), int(H * 1.1)
    im = Image.open(src).convert("RGB")
    bg = im.copy()
    scale = max(fw / bg.width, fh / bg.height)
    bg = bg.resize((int(bg.width * scale) + 1, int(bg.height * scale) + 1))
    l, t = (bg.width - fw) // 2, (bg.height - fh) // 2
    bg = bg.crop((l, t, l + fw, t + fh)).filter(ImageFilter.GaussianBlur(40))
    scale = min(fw / im.width, fh / im.height)
    fg = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))))
    bg.paste(fg, ((fw - fg.width) // 2, (fh - fg.height) // 2))
    bg.save(dst, quality=95)


def render_clip(frame, dur, idx, dst):
    frames = max(2, round(dur * FPS))
    # alternate: zoom in / zoom out / pan left / pan right
    mode = idx % 4
    z_in = "min(1.0+0.10*on/{f},1.10)".format(f=frames)
    z_out = "max(1.10-0.10*on/{f},1.0)".format(f=frames)
    if mode == 0:   z, x, y = z_in, "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    elif mode == 1: z, x, y = z_out, "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    elif mode == 2: z, x, y = "1.08", f"(iw-iw/zoom)*(1-on/{frames})", "ih/2-(ih/zoom/2)"
    else:           z, x, y = "1.08", f"(iw-iw/zoom)*on/{frames}", "ih/2-(ih/zoom/2)"
    vf = f"zoompan=z='{z}':x='{x}':y='{y}':d={frames}:s={W}x{H}:fps={FPS},format=yuv420p"
    run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(frame), "-vf", vf,
         "-frames:v", str(frames), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", str(dst)])


def render(timeline, duration):
    tmp = OUT / "_tmp"
    shutil.rmtree(tmp, ignore_errors=True)
    tmp.mkdir(parents=True)
    clips = []
    for i, sc in enumerate(timeline):
        dur = sc["end"] - sc["start"]
        frame, clip = tmp / f"f{i:04d}.jpg", tmp / f"c{i:04d}.mp4"
        compose_frame(IMG_DIR / sc["image"], frame)
        render_clip(frame, dur, i, clip)
        frame.unlink()
        clips.append(clip)
        print(f"  clip {i + 1}/{len(timeline)}  {sc['image']}  {dur:.2f}s", flush=True)
    lst = tmp / "list.txt"
    lst.write_text("".join(f"file '{c.name}'\n" for c in clips))
    silent = tmp / "silent.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
         "-c", "copy", str(silent)])
    final = OUT / "final_video.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(silent), "-i", str(AUDIO),
         "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
         "-t", f"{duration:.3f}", "-movflags", "+faststart", str(final)])
    shutil.rmtree(tmp, ignore_errors=True)
    return final


def check(final, duration):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(final)])
    vd = float(r.stdout.strip())
    diff = abs(vd - duration)
    print(f"Audio {duration:.2f}s | video {vd:.2f}s | difference {diff:.2f}s "
          f"{'OK' if diff <= 0.15 else 'CHECK!'}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plan-only", action="store_true")
    ap.add_argument("--render-only", action="store_true")
    a = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    if not AUDIO.exists():
        sys.exit(f"Missing {AUDIO}")
    duration = audio_duration()
    tl_path = OUT / "timeline.json"
    if a.render_only:
        timeline = json.loads(tl_path.read_text())
    else:
        images = list_images()
        stamps = load_timestamps(images)
        if stamps:
            timeline = timeline_from_timestamps(images, stamps, duration)
        else:
            print("No timestamps found - cutting at natural pauses in the voiceover")
            timeline = plan_timeline(images, duration)
        tl_path.write_text(json.dumps(timeline, indent=2))
        print(f"{len(images)} images, {duration:.1f}s of audio -> {tl_path}")
    if a.plan_only:
        return
    final = render(timeline, duration)
    check(final, duration)
    print(f"Done: {final}")


if __name__ == "__main__":
    main()
