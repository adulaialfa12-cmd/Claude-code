// Renders review stills: every 2 s and at every shot (sentence) start, for one chapter or all.
// Usage: npx tsx scripts/stills.ts <outDir> [chapterId]
// Then build contact sheets with scripts/contact_sheets.py
import path from 'node:path';
import {mkdirSync, writeFileSync} from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {sentences, chapterRanges, FPS} from '../src/engine/timeline';

const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const outDir = process.argv[2];
const only = process.argv[3];

(async () => {
  mkdirSync(outDir, {recursive: true});
  const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
  const comp = await selectComposition({serveUrl, id: 'Full', inputProps: {from: 0, audio: false}, browserExecutable: BROWSER});
  const list: {t: number; why: string; ch: string}[] = [];
  for (const c of chapterRanges) {
    if (only && c.id !== only) continue;
    for (let t = c.s; t < c.e; t += 2) list.push({t, why: 'every 2s', ch: c.id});
    for (const s of sentences) if (s.chapter === c.id) list.push({t: s.s + 0.9, why: `shot ${s.i + 1}`, ch: c.id});
  }
  list.sort((a, b) => a.t - b.t);
  const index: {file: string; t: number; why: string; ch: string}[] = [];
  let n = 0;
  for (const it of list) {
    const frame = Math.min(comp.durationInFrames - 1, Math.round(it.t * FPS));
    const file = `${it.ch}_${String(frame).padStart(6, '0')}.jpg`;
    await renderStill({composition: comp, serveUrl, output: path.join(outDir, file), frame, imageFormat: 'jpeg', jpegQuality: 70, browserExecutable: BROWSER, inputProps: {from: 0, audio: false}});
    index.push({file, ...it});
    if (++n % 25 === 0) console.log(n, '/', list.length);
  }
  writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 1));
  console.log('done', index.length);
})();
