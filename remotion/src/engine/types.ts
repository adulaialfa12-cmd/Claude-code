// Shared types for the explainer engine.
// A video is chapters -> paragraphs (one voice take each) -> sentences (one shot-list row each).

// When an element appears: a word in the sentence ("honey", "three#2" = 2nd match)
// or a number of seconds after the sentence starts.
export type At = string | number;

export type Bg = 'savanna' | 'dawn' | 'dusk' | 'night' | 'paper' | 'dry' | 'fields';

interface Base {
  at?: At;
  // Fade out: at a word / seconds in this sentence, or 'next' = when the next sentence starts.
  out?: At | 'next';
  // Parallax depth: 1 = on the page, <1 further away, >1 closer to camera.
  depth?: number;
}

export interface ImgEl extends Base {
  t: 'img';
  src: string;
  x: number;
  y: number;
  h?: number;
  w?: number;
  flip?: boolean;
  op?: number;
  anim?: 'fade' | 'rise' | 'grow';
  // Slow travel in px per second while on screen (walking, flying).
  drift?: [number, number];
  float?: boolean;
}
export interface TextEl extends Base {
  t: 'text';
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  rot?: number;
  maxW?: number;
}
export interface CountEl extends Base {
  t: 'count';
  from: number;
  to: number;
  x: number;
  y: number;
  size?: number;
  prefix?: string;
  suffix?: string;
  dur?: number;
  color?: string;
}
export interface DrawEl extends Base {
  t: 'draw';
  d: string;
  stroke?: string;
  width?: number;
  dash?: boolean;
  dur?: number;
}
export interface GlowEl extends Base {
  t: 'glow';
  d: string;
  dur?: number;
  color?: string;
  loop?: boolean;
  trail?: boolean; // also leave a faint traced line behind the light
}
export interface MagEl extends Base {
  t: 'mag';
  sx: number;
  sy: number; // the detail being magnified
  cx: number;
  cy: number; // where the circle sits
  r: number;
  zoom: number;
}
export interface BarItem {
  label: string;
  value: number;
  low?: number; // show a range low..value
  color?: string;
  valueLabel?: string;
  at?: At;
}
export interface BarsEl extends Base {
  t: 'bars';
  x: number;
  y: number;
  w: number;
  rowH?: number;
  max: number;
  items: BarItem[];
}
export interface PieEl extends Base {
  t: 'pie';
  x: number;
  y: number;
  r: number;
  value: number;
  color?: string;
  label?: string;
}
export interface ClockMark {
  min: number; // minutes before midnight
  label: string;
  at?: At;
  ly: number; // label y position (labels sit left of the clock with a leader line)
}
export interface ClockEl extends Base {
  t: 'clock';
  x: number;
  y: number;
  r: number;
  marks: ClockMark[];
}

export type El = ImgEl | TextEl | CountEl | DrawEl | GlowEl | MagEl | BarsEl | PieEl | ClockEl;

// Camera target in panel coordinates: [zoom, focusX, focusY].
export type Cam = [number, number, number];

export interface SceneDef {
  id: string;
  bg: Bg;
}

export interface Sentence {
  text: string;
  tts?: string; // spelling for the voice when it differs from the display text
  scene?: SceneDef; // starts a new panel
  cam?: Cam;
  els?: El[];
}

export interface Paragraph {
  id: string;
  sentences: Sentence[];
}

export interface Chapter {
  id: string;
  title: string; // the question this chapter answers
  paragraphs: Paragraph[];
}

// Timings produced from the narration (scripts/build_timings.py)
export interface WordTiming {
  w: string;
  s: number;
  e: number;
}
export interface SentenceTiming {
  s: number;
  e: number;
  words: WordTiming[];
}
export interface Timings {
  fps: number;
  total: number;
  sentences: SentenceTiming[];
  chapters: { id: string; s: number; e: number }[];
}
