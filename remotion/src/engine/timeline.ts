// Turns the script + narration timings into: scenes placed on one big page, element in/out times,
// and a single camera path. Everything the renderer needs is precomputed here once.
import {chapters} from '../data/script';
import timingsJson from '../data/timings.json';
import type {At, Bg, Cam, El, Timings} from './types';

export const W = 1920;
export const H = 1080;
export const FPS = 60;
// Panels sit on a large "page" with gaps between them, so the camera can glide from one to the next.
const PANEL_STEP_X = W + 420;
const PANEL_STEP_Y = H + 380;

const timings = timingsJson as Timings;

export interface TimedEl {
  el: El;
  tIn: number;
  tOut: number; // Infinity = stays until the scene is left
  key: string;
  sub: number[]; // resolved times of bar items / clock marks
}
export interface Scene {
  id: string;
  bg: Bg;
  index: number;
  chapter: string;
  x: number; // world position of the panel's top-left corner
  y: number;
  start: number;
  end: number;
  els: TimedEl[];
}
export interface FlatSentence {
  i: number;
  text: string;
  chapter: string;
  scene: number;
  s: number;
  e: number;
  words: {w: string; s: number; e: number}[];
  cam: Cam;
  explicitCam: boolean;
}

const norm = (w: string) =>
  w
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/[^a-z0-9' -]/g, ' ')
    .replace(/-/g, ' ')
    .trim()
    .split(/\s+/)
    .map((x) => x.replace(/^'+|'+$/g, ''))
    .filter(Boolean);

// Seconds (absolute) for an `at` value inside a sentence.
function resolveAt(sn: FlatSentence, displayText: string, at: At | undefined): number {
  if (at === undefined) return sn.s;
  if (typeof at === 'number') return sn.s + at;
  const [word, nth] = at.split('#');
  const want = norm(word)[0];
  const n = nth ? parseInt(nth, 10) : 1;
  let seen = 0;
  for (const w of sn.words) {
    if (w.w.startsWith(want)) {
      seen++;
      if (seen === n) return w.s;
    }
  }
  // Word was respelled for the voice (e.g. a name): map its position in the display text onto the spoken words.
  const disp = norm(displayText);
  let k = -1;
  seen = 0;
  for (let j = 0; j < disp.length; j++) {
    if (disp[j].startsWith(want)) {
      seen++;
      if (seen === n) {
        k = j;
        break;
      }
    }
  }
  if (k >= 0 && sn.words.length) {
    const idx = Math.min(sn.words.length - 1, Math.round((k / Math.max(1, disp.length - 1)) * (sn.words.length - 1)));
    return sn.words[idx].s;
  }
  throw new Error(`Word "${at}" not found in sentence: ${displayText}`);
}

let allSentences: FlatSentence[] = [];
let displayTexts: string[] = [];
// like resolveAt, but if the word is not in this sentence, look in the following sentences of the same scene
function findAt(at: At, sn: FlatSentence, display: string): number {
  try {
    return resolveAt(sn, display, at);
  } catch (e) {
    for (let k = sn.i + 1; k < allSentences.length && allSentences[k].scene === sn.scene; k++) {
      try {
        return resolveAt(allSentences[k], displayTexts[k], at);
      } catch {
        /* keep looking */
      }
    }
    throw e;
  }
}

function build() {
  const sentences: FlatSentence[] = [];
  const scenes: Scene[] = [];
  let i = 0;
  let col = 0;
  let row = 0;
  let dir = 1;
  let prevChapter = '';
  let cam: Cam = [1, W / 2, H / 2];
  const pending: {sceneIdx: number; el: El; sn: FlatSentence; display: string; ord: number}[] = [];
  const sentenceStarts: number[] = [];

  for (const ch of chapters) {
    for (const p of ch.paragraphs) {
      for (const sd of p.sentences) {
        const t = timings.sentences[i];
        if (!t) throw new Error(`No timing for sentence ${i}: ${sd.text}`);
        if (sd.scene || scenes.length === 0) {
          if (scenes.length > 0) {
            if (ch.id !== prevChapter) {
              row++;
              dir = -dir;
            } else col += dir;
          }
          scenes.push({
            id: sd.scene?.id ?? `scene-${scenes.length}`,
            bg: sd.scene?.bg ?? 'paper',
            index: scenes.length,
            chapter: ch.id,
            x: col * PANEL_STEP_X,
            y: row * PANEL_STEP_Y,
            start: t.s,
            end: Infinity,
            els: [],
          });
          cam = [1, W / 2, H / 2];
        }
        prevChapter = ch.id;
        const explicit = !!sd.cam;
        if (sd.cam) cam = sd.cam;
        const sn: FlatSentence = {
          i,
          text: sd.text,
          chapter: ch.id,
          scene: scenes.length - 1,
          s: t.s,
          e: t.e,
          words: t.words,
          cam,
          explicitCam: explicit,
        };
        sentences.push(sn);
        sentenceStarts.push(t.s);
        (sd.els ?? []).forEach((el, ord) => pending.push({sceneIdx: scenes.length - 1, el, sn, display: sd.text, ord}));
        i++;
      }
    }
  }
  allSentences = sentences;
  displayTexts = sentences.map((x) => x.text);
  if (i !== timings.sentences.length) throw new Error(`Script has ${i} sentences but timings have ${timings.sentences.length}`);
  for (let k = 0; k < scenes.length - 1; k++) scenes[k].end = scenes[k + 1].start;
  scenes[scenes.length - 1].end = timings.total;

  for (const pd of pending) {
    const scene = scenes[pd.sceneIdx];
    let tIn = resolveAt(pd.sn, pd.display, pd.el.at);
    // the first elements of a new panel wait until the camera has mostly arrived
    if (pd.el.at === undefined && pd.sn.s === scene.start && pd.sceneIdx > 0) tIn += 0.35;
    let tOut = Infinity;
    if (pd.el.out === 'next') {
      const nx = sentences[pd.sn.i + 1];
      tOut = nx ? nx.s - 0.1 : Infinity;
    } else if (pd.el.out !== undefined) {
      tOut = findAt(pd.el.out, pd.sn, pd.display);
    }
    const subAts = pd.el.t === 'bars' ? pd.el.items.map((it) => it.at) : pd.el.t === 'clock' ? pd.el.marks.map((m) => m.at) : [];
    const sub = subAts.map((a) => (a === undefined ? tIn : findAt(a, pd.sn, pd.display)));
    scene.els.push({el: pd.el, tIn, tOut, key: `${scene.id}-${pd.sn.i}-${pd.ord}`, sub});
  }
  return {sentences, scenes};
}

export const {sentences, scenes} = build();
export const total = timings.total;
export const chapterRanges = timings.chapters;

// ---------------- camera ----------------
export const easeInOut = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

interface Key {
  t: number;
  d: number;
  x: number;
  y: number;
  z: number;
  dip: number; // how far the camera pulls back mid-move (0 = straight move)
}

// keep the frame inside the panel while the camera is "on" a scene (the page only shows during scene moves)
function fit(sc: Scene, x: number, y: number, z: number) {
  const zz = Math.min(1.6, Math.max(1.03, z));
  const hw = W / 2 / zz + 24;
  const hh = H / 2 / zz + 18;
  return {
    x: Math.min(sc.x + W - hw, Math.max(sc.x + hw, sc.x + x)),
    y: Math.min(sc.y + H - hh, Math.max(sc.y + hh, sc.y + y)),
    z: zz,
  };
}

function buildCameraKeys(): Key[] {
  const keys: Key[] = [];
  const first = scenes[0];
  const s0 = sentences[0];
  const f0 = fit(first, s0.cam[1], s0.cam[2], s0.cam[0]);
  keys.push({t: 0, d: 0.01, ...f0, dip: 0});
  let lastZ = s0.cam[0];
  for (let k = 0; k < sentences.length; k++) {
    const sn = sentences[k];
    const sc = scenes[sn.scene];
    const prev = sentences[k - 1];
    const sceneChange = prev && prev.scene !== sn.scene;
    const dur = sn.e - sn.s;
    if (sceneChange) {
      // glide to the new panel: start in the pause before the sentence, pull back a little on the way
      const start = Math.max(prev.e + 0.05, sn.s - 1.1);
      const chapterChange = prev.chapter !== sn.chapter;
      const f = fit(sc, sn.cam[1], sn.cam[2], sn.cam[0]);
      keys.push({t: start, d: chapterChange ? 2.3 : 1.8, ...f, dip: chapterChange ? 0.42 : 0.3});
      lastZ = f.z;
    } else if (sn.explicitCam) {
      const f = fit(sc, sn.cam[1], sn.cam[2], sn.cam[0]);
      keys.push({t: sn.s - 0.15, d: Math.min(1.6, Math.max(1.0, dur * 0.6)), ...f, dip: 0});
      lastZ = f.z;
    } else {
      // no new framing asked for: keep a slow push-in going so the frame never sits still
      const f = fit(sc, sn.cam[1], sn.cam[2], Math.min(1.45, lastZ * 1.035));
      keys.push({t: sn.s - 0.1, d: Math.max(1.2, dur + 0.3), ...f, dip: 0});
      lastZ = f.z;
    }
  }
  return keys;
}

const camKeys = buildCameraKeys();
// value of the camera at the start of each key, so overlapping moves blend from wherever the camera actually is
const keyStarts: {x: number; y: number; z: number}[] = [];
function evalUpTo(t: number, upto: number) {
  let v = {x: camKeys[0].x, y: camKeys[0].y, z: camKeys[0].z};
  for (let k = 1; k <= upto && k < camKeys.length; k++) {
    const key = camKeys[k];
    if (t < key.t) break;
    const from = keyStarts[k];
    const p = easeInOut((t - key.t) / key.d);
    const zLin = from.z + (key.z - from.z) * p;
    const dip = key.dip * Math.sin(Math.PI * p);
    v = {x: from.x + (key.x - from.x) * p, y: from.y + (key.y - from.y) * p, z: zLin * (1 - dip)};
  }
  return v;
}
for (let k = 0; k < camKeys.length; k++) keyStarts[k] = k === 0 ? {x: camKeys[0].x, y: camKeys[0].y, z: camKeys[0].z} : evalUpTo(camKeys[k].t, k - 1);

export function cameraAt(t: number) {
  // binary search the last key that has started
  let lo = 0;
  let hi = camKeys.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (camKeys[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  let v: {x: number; y: number; z: number};
  if (lo === 0) v = {x: camKeys[0].x, y: camKeys[0].y, z: camKeys[0].z};
  else {
    const key = camKeys[lo];
    const from = keyStarts[lo];
    const p = easeInOut((t - key.t) / key.d);
    const dip = key.dip * Math.sin(Math.PI * p);
    v = {x: from.x + (key.x - from.x) * p, y: from.y + (key.y - from.y) * p, z: (from.z + (key.z - from.z) * p) * (1 - dip)};
  }
  // a gentle hand-held drift on top, so the frame is never perfectly still
  return {
    x: v.x + 9 * Math.sin(t * 0.23) + 5 * Math.sin(t * 0.61 + 1.3),
    y: v.y + 7 * Math.sin(t * 0.19 + 0.7) + 4 * Math.sin(t * 0.53 + 2.1),
    z: v.z * (1 + 0.004 * (1 + Math.sin(t * 0.17 + 0.4))),
  };
}

export const cameraKeyTimes = camKeys.map((k) => k.t);
