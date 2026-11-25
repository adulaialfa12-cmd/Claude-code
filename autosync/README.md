# autosync - images + voiceover -> finished video

1. Put your images in `input/images/` and your narration at `input/voiceover.mp3`.
2. Tell it WHEN each image appears (pick one):
   - `input/timestamps.csv`  (see `timestamps.example.csv`; times like `0:12`, `1:02.5`, `75`, `2m03s`)
   - or put the time in the file name: `scene_00-12.png`, `intro_1:05.png`
   - or nothing: it cuts at natural pauses in the voice, in file-name order.
3. Run:  `python3 make_video.py`
4. Result: `output/final_video.mp4` (1080p, 30 fps). The plan is in `output/timeline.json`.
   Edit that file and run `python3 make_video.py --render-only` to adjust timings.

Needs: ffmpeg, Python 3 with Pillow (`pip install pillow`).
Each image stays on screen until the next image's timestamp. The first image covers the start of the video.
