"""Import pictures that were uploaded into this session (when the image host can't be reached directly).

Accepts the files exactly as Higgsfield names them (hf_<date>_<time>_<job-id>.png) or renamed to <id>.png,
loose or inside .zip files. Each file is matched to a picture id via images/jobs.json, checked to be a real
image, and copied to images/raw/<id>.png. Then run scripts/prepare_images.py.

Usage (repo root):  python3 -I scripts/import_uploads.py <uploads_dir>
"""
import json, os, sys, tempfile, zipfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
jobs = json.load(open(os.path.join(ROOT, 'images/jobs.json')))
by_job = {v: k for k, v in jobs.items()}
ids = set(jobs)
src = sys.argv[1]
raw = os.path.join(ROOT, 'images/raw')
os.makedirs(raw, exist_ok=True)


def match(name):
    base = os.path.splitext(os.path.basename(name))[0]
    if base in ids:
        return base
    for job, iid in by_job.items():
        if job in base:
            return iid
    return None


def take(path, name, found):
    iid = match(name)
    if not iid:
        return
    try:
        with Image.open(path) as im:
            im.verify()
        with Image.open(path) as im:
            im.convert('RGB').save(os.path.join(raw, f'{iid}.png'))
        found[iid] = name
    except Exception as e:  # not a usable image
        print('skip', name, e)


found = {}
with tempfile.TemporaryDirectory() as tmp:
    for f in sorted(os.listdir(src)):
        p = os.path.join(src, f)
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            take(p, f, found)
        elif f.lower().endswith('.zip'):
            with zipfile.ZipFile(p) as z:
                for m in z.infolist():
                    if m.is_dir() or not m.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                        continue
                    out = os.path.join(tmp, f'{len(found)}_{os.path.basename(m.filename)}')
                    with z.open(m) as r, open(out, 'wb') as w:
                        w.write(r.read(50_000_000))
                    take(out, m.filename, found)
print(f'imported {len(found)} of {len(ids)} pictures')
missing = sorted(ids - set(found) - {f[:-4] for f in os.listdir(raw) if f.endswith('.png')})
print('still missing:', ', '.join(missing) if missing else 'none')
