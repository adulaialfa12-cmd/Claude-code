// Writes ../script.md: narration by chapter, a shot-list row for every sentence, and the picture list.
// The shot list is generated from the same data the animation uses, so the two can't drift apart.
import {readFileSync, writeFileSync} from 'node:fs';
import {chapters} from '../src/data/script';
import {sentences, scenes, cameraKeyTimes} from '../src/engine/timeline';
import type {El} from '../src/engine/types';

const names: Record<string, string> = {
  char_stand: 'forager standing', char_think: 'forager scratching head', char_bead: 'forager drilling a bead', char_dig: 'woman digging tubers',
  char_bow: 'hunter with bow', char_honey: 'forager holding honeycomb', char_child: 'child with toy bow', char_laugh: 'forager laughing',
  char_story: 'storyteller, arms wide', char_baby: 'woman holding baby', char_hide: 'forager scraping a hide', char_walk: 'traveller with bag and stick',
  char_gift: 'woman offering necklace', char_sleep: 'forager asleep', char_string: 'woman rolling string', char_carry: 'hunter carrying meat',
  char_farmer: 'farmer with wheat and sickle', char_scribe: 'Mesopotamian scribe', obj_fire: 'campfire', obj_obsidian: 'obsidian blade',
  obj_necklace: 'eggshell-bead necklace', obj_shellbead: 'shell bead', obj_eggshell: 'ostrich egg', obj_flute: 'bone flute', obj_honeycomb: 'honeycomb',
  obj_honeyguide: 'honeyguide bird', obj_tubers: 'tubers', obj_bow: 'bow and arrows', obj_baobab: 'baobab fruit', obj_coin: 'Lydian coin',
  obj_tablet: 'clay tablet', obj_scale: 'balance scale', obj_hut: 'grass hut', obj_grainjar: 'grain jar', obj_antelope: 'antelope', obj_tree: 'acacia tree',
  obj_skull: 'fossil skull', obj_ochre: 'red ochre',
  person_humphrey: 'Caroline Humphrey (1985, at her desk)', person_lee: 'Richard Lee (1960s fieldwork, notebook)', person_sahlins: 'Marshall Sahlins (1960s, typewriter)',
  person_wiessner: 'Polly Wiessner (1970s fieldwork, notebook)', person_miller: 'Jennifer Miller (2022 bead study)', person_wang: 'Yiming Wang (2022 bead study)',
  host_wave: 'host waves', host_point: 'host points and explains', host_count: 'host counts on fingers', host_surprised: 'host looks surprised', host_shrug: 'host shrugs (uncertain/debated)',
  char_archaeologist: 'archaeologist brushing a find', char_researcher: 'field researcher with clipboard and watch', char_lydian: 'Lydian craftsman stamping a coin',
  char_meso_tooth: 'Mesopotamian man holding his sore jaw', char_meso_payer: 'Mesopotamian man paying 2 lumps of silver', char_meso_worker: 'Mesopotamian worker carrying barley',
  char_meso_merchant: 'Mesopotamian merchant with donkey', char_scholars: 'historian/economist making a point', char_agta_forager: 'Agta spear-fisher (Philippines)',
  char_agta_farmer: 'Agta farmer with hoe (Philippines)', char_grandmother: 'grandmother holding baby', char_sister: 'older sister carrying baby',
  char_whistle: 'honey hunter whistling to the bird', char_tired_hunter: 'tired hunter, empty-handed', char_stingy: 'stingy forager hiding meat',
  char_complain: 'neighbour complaining, arms crossed', char_dance: 'forager dancing',
};
const bgName: Record<string, string> = {savanna: 'savanna, daytime', dawn: 'savanna at dawn', dusk: 'savanna at dusk', night: 'camp at night', paper: 'paper page', dry: 'dry season', fields: 'early fields'};

const describe = (e: El): string => {
  switch (e.t) {
    case 'img': return `${names[e.src] ?? e.src} ${e.anim === 'rise' ? 'rises in' : e.anim === 'grow' ? 'grows in' : 'fades in'}${e.drift ? ' and walks' : ''}${e.float ? ' (floating)' : ''}`;
    case 'text': return `label "${e.text}" fades in`;
    case 'count': return `number counts up to ${(e.prefix ?? '') + e.to.toLocaleString('en-US') + (e.suffix ?? '')}`;
    case 'draw': return `line draws itself${e.dash ? ' (dashed)' : ''}`;
    case 'glow': return `soft light travels along a path${e.loop ? ' (loops)' : ''}`;
    case 'mag': return `magnifying circle grows out of a detail (x${e.zoom})`;
    case 'bars': return `bar comparison: ${e.items.map((i) => `${i.label} ${i.valueLabel ?? i.value}`).join(' / ')}`;
    case 'pie': return `share chart fills to ${Math.round(e.value * 100)}%`;
    case 'clock': return `one-day clock draws itself`;
  }
};
const ts = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

let md = `# Script and shot list — "What Did Ancient Humans Do All Day Before Money Existed?"\n\n`;
md += `Narrator: one calm voice (ElevenLabs "BALDE 1"). Runtime ${ts(sentences[sentences.length - 1].e)} · ${sentences.length} sentences · ${scenes.length} panels.\n`;
md += `Generated from \`remotion/src/data/script.ts\` by \`remotion/scripts/script-md.ts\` — edit the data file, not this page. Times are from the final narration.\n\n`;
md += `Camera rule for every row: one camera films one big page. Moves ease in and out; between panels it glides (with a slight pull-back); within a panel it slowly pushes in or re-frames; a gentle drift never stops.\n\n`;

md += `## Narration\n\n`;
let k = 0;
for (const ch of chapters) {
  md += `### ${ch.id === 'intro' ? 'Hook' : `${ch.id.replace('ch', 'Chapter ')} — ${ch.title}`}\n\n`;
  for (const p of ch.paragraphs) {
    md += p.sentences.map((s) => s.text).join(' ') + '\n\n';
    k += p.sentences.length;
  }
}

md += `## Shot list (one row per sentence)\n\n`;
k = 0;
for (const ch of chapters) {
  md += `### ${ch.id === 'intro' ? 'Hook' : `${ch.id.replace('ch', 'Chapter ')} — ${ch.title}`}\n\n| # | Time | Line | On screen | Camera |\n|---|---|---|---|---|\n`;
  for (const p of ch.paragraphs) {
    for (const sd of p.sentences) {
      const sn = sentences[k];
      const sc = scenes[sn.scene];
      const isNew = !!sd.scene;
      const parts: string[] = [];
      if (isNew) parts.push(`**New panel: ${bgName[sc.bg]}**`);
      for (const e of sd.els ?? []) parts.push(describe(e) + (e.at !== undefined ? ` on "${e.at}"` : ''));
      if (!parts.length) parts.push('same panel, earlier elements stay');
      const prev = sentences[k - 1];
      let camTxt = isNew ? (prev && prev.chapter !== sn.chapter ? 'long glide down to the next row of the page (chapter change), settles' : 'glides across the page to this panel, settles') : '';
      if (!isNew) camTxt = sd.cam ? (prev && sd.cam[0] > prev.cam[0] + 0.05 ? 'pushes in' : prev && sd.cam[0] < prev.cam[0] - 0.05 ? 'pulls back' : 're-frames') + ` to ${sd.cam[0].toFixed(2)}x` : 'slow push-in continues';
      md += `| ${k + 1} | ${ts(sn.s)} | ${sd.text.replace(/\|/g, '/')} | ${parts.join('; ')} | ${camTxt} |\n`;
      k++;
    }
  }
  md += '\n';
}

const prompts = JSON.parse(readFileSync('../images/prompts.json', 'utf8'));
md += `## Pictures (${prompts.images.length}, each a single cut-out)\n\nStyle line (used word for word in every prompt):\n> ${prompts.style_line}\n\n| id | What | Resolution |\n|---|---|---|\n`;
for (const im of prompts.images) md += `| ${im.id} | ${names[im.id] ?? im.id} | ${im.resolution} |\n`;
md += `\nFull prompts: \`images/prompts.json\`.\n`;

// longest gap between "something new" (element entrance or camera move)
const events = [...scenes.flatMap((s) => s.els.map((e) => e.tIn)), ...cameraKeyTimes].sort((a, b) => a - b);
let worst = 0, at = 0;
for (let i = 1; i < events.length; i++) if (events[i] - events[i - 1] > worst) { worst = events[i] - events[i - 1]; at = events[i - 1]; }
md += `\nCheck: longest stretch without a new element or camera move = ${worst.toFixed(1)} s (at ${ts(at)}).\n`;
writeFileSync('../script.md', md);
console.log('script.md written; longest gap', worst.toFixed(2), 's at', ts(at));
