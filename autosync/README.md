# autosync — images + MP3 voiceover -> finished video

1. Put images in `input/images/` and your narration at `input/voiceover.mp3`.
2. Give each image its start time, either way:
   - `input/timestamps.csv`, one line per image: `001.png,0:00` / `002.png,0:07.5` (mm:ss, h:mm:ss or seconds)
   - or put the time in the file name: `001_00-12.png`, `scene_01m05s.jpg`
   No timestamps? Images are spaced automatically on natural pauses in the voice.
3. Run: `python3 make_video.py` -> `output/final_video.mp4`
   (`--plan-only` writes `output/timeline.json` for checking; edit it, then `--render-only`.)
Needs ffmpeg + Pillow.
