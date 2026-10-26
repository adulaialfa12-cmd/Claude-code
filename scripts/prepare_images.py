"""Cut out the generated pictures and register them for the animation.

images/raw/<id>.png (white background)  ->  images/<id>.png (transparent, cropped)
                                         ->  remotion/public/images/<id>.png
                                         ->  remotion/src/data/images.json  ({id: {w, h}})
Background removal: flood fill of near-white pixels connected to the border, so white areas
*inside* a drawing (faces, eggshell beads) are kept. Edges get a 1-2 px soft falloff.
Also reports pictures whose drawing touches the frame (cut-off risk).

Run from the repo root:  python3 scripts/prepare_images.py
"""
import json, os
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'images/raw')
OUT = os.path.join(ROOT, 'images')
PUB = os.path.join(ROOT, 'remotion/public/images')
MAX_SIDE = 1400  # plenty for 1080p with camera push-ins


def background_mask(rgb: np.ndarray, thresh: int = 232) -> np.ndarray:
    h, w, _ = rgb.shape
    light = (rgb.min(axis=2) >= thresh) & ((rgb.max(axis=2).astype(int) - rgb.min(axis=2)) < 22)
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if light[y, x] and not bg[y, x]:
                bg[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if light[y, x] and not bg[y, x]:
                bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and light[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True; q.append((ny, nx))
    return bg


def process(path: str, iid: str):
    im = Image.open(path).convert('RGB')
    if max(im.size) > 2048:
        im.thumbnail((2048, 2048), Image.LANCZOS)
    rgb = np.asarray(im)
    bg = background_mask(rgb)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # soften the cut edge slightly (anti-aliasing), but never eat into the drawing
    a = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(1.0))
    alpha = np.maximum(np.asarray(a), np.where(bg, 0, 255)).astype(np.uint8)
    alpha = np.where(bg & (np.asarray(a) < 128), np.asarray(a) // 2, alpha).astype(np.uint8)
    fg = alpha > 20
    ys, xs = np.where(fg)
    if len(xs) == 0:
        return None, ['empty picture']
    h, w = fg.shape
    issues = []
    margin = 4
    if xs.min() <= margin or ys.min() <= margin or xs.max() >= w - 1 - margin or ys.max() >= h - 1 - margin:
        issues.append('drawing touches the frame edge (possible cut-off)')
    pad = 12
    x0, y0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
    x1, y1 = min(w, xs.max() + pad + 1), min(h, ys.max() + pad + 1)
    rgba = np.dstack([rgb, alpha])[y0:y1, x0:x1]
    out = Image.fromarray(rgba, 'RGBA')
    if max(out.size) > MAX_SIDE:
        out.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    coverage = fg.mean()
    if coverage > 0.75:
        issues.append(f'background barely removed ({coverage:.0%} kept) - check for a coloured backdrop')
    return out, issues


def main():
    os.makedirs(PUB, exist_ok=True)
    manifest = {}
    report = {}
    for f in sorted(os.listdir(RAW)):
        if not f.endswith('.png'):
            continue
        iid = f[:-4]
        out, issues = process(os.path.join(RAW, f), iid)
        if out is None:
            report[iid] = issues; continue
        out.save(os.path.join(OUT, f), optimize=True)
        out.save(os.path.join(PUB, f), optimize=True)
        manifest[iid] = {'w': out.size[0], 'h': out.size[1]}
        if issues:
            report[iid] = issues
    json.dump(manifest, open(os.path.join(ROOT, 'remotion/src/data/images.json'), 'w'), indent=1)
    print(f'{len(manifest)} pictures prepared')
    for k, v in report.items():
        print(' !', k, '-', '; '.join(v))


if __name__ == '__main__':
    main()
