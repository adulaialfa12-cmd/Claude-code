"""Assemble video 01: scene stills + narration → final MP4 and SRT subtitles.

Run from the video folder:
    python3 build/build.py
Needs: ffmpeg/ffprobe, build/frames/sNN.png (from scenes.mjs), audio/chNN.mp3, narration/NN.txt
Output: output/how-ancient-humans-told-time.mp4 and output/how-ancient-humans-told-time.srt
"""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRAMES, AUDIO, TEXT = ROOT / "build/frames", ROOT / "audio", ROOT / "narration"
WORK, OUT = ROOT / "build/work", ROOT / "output"
WORK.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
FPS, PAPER = 30, "0xf4ead6"

# chapter → list of (scene number, narration paragraph indexes shown during that scene)
PLAN = {
    1: [(1, [0]), (2, [1, 2, 3])],
    2: [(3, [0, 1]), (4, [2, 3])],
    3: [(5, [0, 1]), (6, [2]), (7, [3, 4, 5])],
    4: [(8, [0]), (9, [1]), (10, [2, 3, 4])],
    5: [(11, [0, 1]), (12, [2]), (13, [3, 4]), (14, [5])],
    6: [(15, [0, 1]), (16, [2, 3])],
    7: [(17, [0, 1]), (18, [2]), (19, [3, 4])],
    8: [(20, [0]), (21, [1, 2]), (22, [3])],
}


def run(cmd):
    subprocess.run(cmd, check=True)


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def paragraphs(ch):
    raw = (TEXT / f"{ch:02d}.txt").read_text()
    return [" ".join(p.split()) for p in re.split(r"\n\s*\n", raw) if p.strip()]


def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


clips, cues, t0, n = [], [], 0.0, 0
for ch, scenes in PLAN.items():
    paras = paragraphs(ch)
    total = duration(AUDIO / f"ch{ch:02d}.mp3")
    chars = sum(len(p) for p in paras)
    # subtitle cues: sentences timed by their share of the chapter's characters
    pos = 0.0
    for p in paras:
        for s in re.split(r"(?<=[.!?…])\s+", p):
            if not s:
                continue
            d = total * len(s) / chars
            cues.append((t0 + pos, t0 + pos + d, s))
            pos += d
    # scene clips: each scene lasts as long as its paragraphs take to read
    used = 0.0
    for i, (scene, idx) in enumerate(scenes):
        d = total - used if i == len(scenes) - 1 else total * sum(len(paras[k]) for k in idx) / chars
        used += d
        frames = max(1, round(d * FPS))
        z_in = (scene % 2 == 1)  # alternate slow push-in and pull-out
        zoom = f"1+0.06*on/{frames}" if z_in else f"1.06-0.06*on/{frames}"
        clip = WORK / f"clip{scene:02d}.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", str(FRAMES / f"s{scene:02d}.png"),
             "-vf", f"scale=2880:1620,zoompan=z='{zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
                    f":d={frames}:s=1920x1080:fps={FPS},"
                    f"fade=t=in:st=0:d=0.4:color={PAPER},fade=t=out:st={max(0, frames / FPS - 0.4):.3f}:d=0.4:color={PAPER},format=yuv420p",
             "-frames:v", str(frames), "-c:v", "libx264", "-preset", "medium", "-crf", "20", str(clip)])
        clips.append(clip)
        n += 1
        print(f"scene {scene:02d}: {d:6.2f}s")
    t0 += total

(WORK / "clips.txt").write_text("".join(f"file '{c}'\n" for c in clips))
(WORK / "audio.txt").write_text("".join(f"file '{AUDIO / f'ch{c:02d}.mp3'}'\n" for c in PLAN))
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(WORK / "clips.txt"), "-c", "copy", str(WORK / "video.mp4")])
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(WORK / "audio.txt"),
     "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", str(WORK / "voice.m4a")])
final = OUT / "how-ancient-humans-told-time.mp4"
run(["ffmpeg", "-v", "error", "-y", "-i", str(WORK / "video.mp4"), "-i", str(WORK / "voice.m4a"),
     "-c:v", "copy", "-c:a", "copy", "-shortest", "-movflags", "+faststart", str(final)])
(OUT / "how-ancient-humans-told-time.srt").write_text(
    "".join(f"{i}\n{srt_time(a)} --> {srt_time(b)}\n{s}\n\n" for i, (a, b, s) in enumerate(cues, 1)))
print(f"done: {final} ({duration(final):.1f}s, {n} scenes, {len(cues)} subtitle lines)")
