// Review stills at the moments named people are mentioned. Usage: npx tsx scripts/people-stills.ts <outDir>
import path from 'node:path';
import {mkdirSync, writeFileSync} from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {sentences, FPS} from '../src/engine/timeline';
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const out = process.argv[2];
(async () => {
  mkdirSync(out, {recursive: true});
  const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
  const comp = await selectComposition({serveUrl, id: 'Full', inputProps: {from: 0, audio: false}, browserExecutable: BROWSER});
  const keys = ['humphrey', 'lee', 'sahlins', 'wiessner', 'researchers'];
  const idx: any[] = [];
  for (const s of sentences) {
    const w = s.words.find((x) => keys.some((k) => x.w.startsWith(k)));
    if (!w) continue;
    for (const dt of [1.5, (s.e - w.s) - 0.2]) {
      const t = w.s + dt; const frame = Math.round(t * FPS);
      const file = `p_${frame}.jpg`;
      await renderStill({composition: comp, serveUrl, output: path.join(out, file), frame, imageFormat: 'jpeg', jpegQuality: 70, browserExecutable: BROWSER, inputProps: {from: 0, audio: false}});
      idx.push({file, t, why: `#${s.i + 1} ${w.w}`, ch: s.chapter});
    }
  }
  writeFileSync(path.join(out, 'index.json'), JSON.stringify(idx));
  console.log(idx.length);
})();
