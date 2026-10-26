"""Pack review stills into labelled contact sheets (5 x 4 per sheet).
Usage: python3 scripts/contact_sheets.py <stillsDir> <sheetsDir>"""
import json, os, sys
from PIL import Image, ImageDraw
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
idx = json.load(open(os.path.join(src, 'index.json')))
TW, TH, COLS, ROWS = 480, 270, 5, 4
per = COLS * ROWS
for si in range(0, len(idx), per):
    sheet = Image.new('RGB', (COLS * TW, ROWS * (TH + 28)), 'white')
    d = ImageDraw.Draw(sheet)
    for k, it in enumerate(idx[si:si + per]):
        im = Image.open(os.path.join(src, it['file'])).resize((TW, TH))
        x, y = (k % COLS) * TW, (k // COLS) * (TH + 28)
        sheet.paste(im, (x, y + 28))
        m, s = divmod(it['t'], 60)
        d.text((x + 6, y + 6), f"{it['ch']} {int(m)}:{s:05.2f}  {it['why']}", fill='black')
    sheet.save(os.path.join(dst, f'sheet_{si // per:03d}.jpg'), quality=80)
print('sheets:', (len(idx) + per - 1) // per)
