#!/usr/bin/env bash
# Downloads every generated picture listed in images/urls.json into images/raw/, then cuts them out.
# Run from the repo root: bash scripts/fetch_images.sh
set -euo pipefail
mkdir -p images/raw
python3 - <<'PY'
import json, subprocess
for k, u in json.load(open('images/urls.json')).items():
    r = subprocess.run(['curl', '-sS', '-f', '-o', f'images/raw/{k}.png', u])
    print(k, 'ok' if r.returncode == 0 else 'FAILED')
PY
python3 scripts/prepare_images.py
