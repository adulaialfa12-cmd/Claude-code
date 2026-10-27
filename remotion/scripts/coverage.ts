// Lists every sentence and the characters (char_*/person_*/host_*) visible while it is spoken.
// Usage: npx tsx scripts/coverage.ts [--missing]
import {sentences, scenes} from '../src/engine/timeline';
const onlyMissing = process.argv.includes('--missing');
let missing = 0;
for (const s of sentences) {
  const sc = scenes[s.scene];
  const who = sc.els
    .filter((e) => e.el.t === 'img' && /^(char|person|host)_/.test((e.el as {src: string}).src))
    .filter((e) => e.tIn <= s.e - 0.3 && e.tOut > s.s + 0.3)
    .map((e) => (e.el as {src: string}).src);
  if (!who.length) missing++;
  if (!onlyMissing || !who.length) console.log(`#${s.i + 1} [${sc.id}] ${who.length ? who.join(',') : '— NO CHARACTER —'} | ${s.text.slice(0, 80)}`);
}
console.log(`${missing} of ${sentences.length} sentences have no character on screen`);
