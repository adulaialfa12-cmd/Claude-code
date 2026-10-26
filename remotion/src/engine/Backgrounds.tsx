// Flat, hand-drawn style backdrops drawn in code (same palette as the pictures).
import React from 'react';
import type {Bg} from './types';
import {W, H} from './timeline';

const HORIZON = 700;

const palettes: Record<Bg, {sky: string; ground: string; line: string; tuft: string}> = {
  savanna: {sky: '#cfe2ea', ground: '#d9bb8c', line: '#3a2c1e', tuft: '#8b6d3f'},
  dawn: {sky: '#f2dcc0', ground: '#d3b385', line: '#3a2c1e', tuft: '#8b6d3f'},
  dusk: {sky: '#e6b28c', ground: '#b98f63', line: '#3a2c1e', tuft: '#6f5332'},
  night: {sky: '#1f2a44', ground: '#3b3226', line: '#0f0c08', tuft: '#5a4a35'},
  paper: {sky: '#f4ecdc', ground: '#f4ecdc', line: '#d9cbb0', tuft: '#d9cbb0'},
  dry: {sky: '#ecdfc4', ground: '#d8b47c', line: '#3a2c1e', tuft: '#9a7a45'},
  fields: {sky: '#cfe2ea', ground: '#cdb76c', line: '#3a2c1e', tuft: '#7f8a3e'},
};

// hand-wobbly horizon
const horizonPath = (seed: number) => {
  let d = `M -20 ${HORIZON}`;
  for (let x = 0; x <= W + 40; x += 80) {
    const y = HORIZON + Math.sin(x * 0.011 + seed) * 4 + Math.sin(x * 0.031 + seed * 2) * 2;
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d;
};

const Tuft: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <path
    d={`M ${x - 18 * s} ${y} q ${6 * s} ${-26 * s} ${10 * s} ${-34 * s} M ${x} ${y} q 0 ${-30 * s} ${2 * s} ${-44 * s} M ${x + 18 * s} ${y} q ${-6 * s} ${-24 * s} ${-12 * s} ${-32 * s}`}
    stroke={c}
    strokeWidth={4 * s}
    fill="none"
    strokeLinecap="round"
  />
);

export const Background: React.FC<{bg: Bg; seed: number}> = ({bg, seed}) => {
  const p = palettes[bg];
  if (bg === 'paper') {
    return (
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <rect width={W} height={H} fill={p.sky} />
        {/* faint ruled texture like an old notebook page */}
        {Array.from({length: 12}).map((_, k) => (
          <line key={k} x1={0} x2={W} y1={90 * k + 40} y2={90 * k + 40} stroke="#eadfc8" strokeWidth={2} />
        ))}
      </svg>
    );
  }
  const tufts = Array.from({length: 9}).map((_, k) => {
    const r = Math.abs(Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1;
    return {x: 80 + k * 220 + r * 90, y: HORIZON + 60 + ((r * 7) % 1) * 280, s: 0.7 + r * 0.6};
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <rect width={W} height={HORIZON + 10} fill={p.sky} />
      <rect y={HORIZON} width={W} height={H - HORIZON} fill={p.ground} />
      {bg === 'night' &&
        Array.from({length: 40}).map((_, k) => {
          const r1 = Math.abs(Math.sin(k * 91.7 + seed) * 1000) % 1;
          const r2 = Math.abs(Math.sin(k * 37.3 + seed * 3) * 1000) % 1;
          return <circle key={k} cx={r1 * W} cy={r2 * (HORIZON - 120)} r={1.5 + (k % 3)} fill="#f3e7cf" opacity={0.7} />;
        })}
      {bg === 'fields' &&
        Array.from({length: 7}).map((_, k) => (
          <path key={k} d={`M ${-40} ${HORIZON + 40 + k * 55} Q ${W / 2} ${HORIZON + 20 + k * 58} ${W + 40} ${HORIZON + 40 + k * 55}`} stroke="#b19c52" strokeWidth={4} fill="none" />
        ))}
      <path d={horizonPath(seed)} stroke={p.line} strokeWidth={5} fill="none" strokeLinecap="round" />
      {bg !== 'fields' && tufts.map((t, k) => <Tuft key={k} x={t.x} y={t.y} s={t.s} c={p.tuft} />)}
    </svg>
  );
};

export const PAGE_COLOR = '#e6dcc8';
