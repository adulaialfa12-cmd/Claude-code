// Every kind of on-screen element. All entrances/exits are eased fades or draws — nothing pops.
import React, {useMemo} from 'react';
import {Img, staticFile} from 'remotion';
import type {BarsEl, ClockEl, CountEl, DrawEl, El, GlowEl, ImgEl, PieEl, TextEl} from './types';
import {easeInOut} from './timeline';
import manifestJson from '../data/images.json';

const manifest = manifestJson as Record<string, {w: number; h: number}>;
export const INK = '#3a2c1e';
export const GLOW = '#ffd36b';
export const FONT = "'Patrick Hand', 'Comic Sans MS', sans-serif";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
// fade in over `d` seconds after tIn, fade out over 0.5 s after tOut
export const visibility = (t: number, tIn: number, tOut: number, d = 0.7) =>
  easeInOut((t - tIn) / d) * (1 - easeInOut((t - tOut) / 0.5));

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 1000) / 1000;
};

// ---------- picture ----------
export const ImgView: React.FC<{el: ImgEl; t: number; tIn: number; tOut: number; id: string}> = ({el, t, tIn, tOut, id}) => {
  const a = visibility(t, tIn, tOut, 0.8);
  if (a <= 0.001) return null;
  const m = manifest[el.src];
  const aspect = m ? m.w / m.h : 1;
  const h = el.h ?? (el.w ?? 300) / aspect;
  const w = el.w ?? h * aspect;
  const p = easeInOut((t - tIn) / 0.8);
  const ph = hash(id);
  const since = Math.max(0, t - tIn);
  let dx = 0;
  let dy = 0;
  let sc = 1 + 0.008 * Math.sin(t * 1.1 + ph * 6); // idle breathing
  if (el.anim === 'rise') dy += (1 - p) * 46;
  if (el.anim === 'grow') sc *= 0.86 + 0.14 * p;
  if (el.drift) {
    dx += el.drift[0] * since;
    dy += el.drift[1] * since;
  }
  if (el.float) dy += 10 * Math.sin(t * 2.2 + ph * 6);
  const style: React.CSSProperties = {
    position: 'absolute',
    left: el.x - w / 2 + dx,
    top: el.y - h / 2 + dy,
    width: w,
    height: h,
    opacity: a * (el.op ?? 1),
    transform: `scale(${sc}) scaleX(${el.flip ? -1 : 1})`,
  };
  if (!m) {
    // picture not delivered yet: visible placeholder so a missing file can never slip into a final render unnoticed
    return (
      <div style={{...style, border: '6px dashed #b5562c', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 34, color: '#b5562c', background: 'rgba(255,255,255,0.4)'}}>
        <span style={{transform: `scaleX(${el.flip ? -1 : 1})`}}>{el.src}</span>
      </div>
    );
  }
  return <Img src={staticFile(`images/${el.src}.png`)} style={style} />;
};

// ---------- label ----------
export const TextView: React.FC<{el: TextEl; t: number; tIn: number; tOut: number}> = ({el, t, tIn, tOut}) => {
  const a = visibility(t, tIn, tOut, 0.6);
  if (a <= 0.001) return null;
  const p = easeInOut((t - tIn) / 0.6);
  const size = el.size ?? 52;
  return (
    <div
      style={{
        position: 'absolute',
        left: el.x - (el.maxW ?? 1600) / 2,
        top: el.y - size * 0.62 + (1 - p) * 18,
        width: el.maxW ?? 1600,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: size,
        lineHeight: 1.1,
        color: el.color ?? INK,
        opacity: a,
        transform: `rotate(${el.rot ?? 0}deg)`,
        whiteSpace: el.maxW ? 'normal' : 'nowrap',
      }}
    >
      {el.text}
    </div>
  );
};

// ---------- number that counts up ----------
export const CountView: React.FC<{el: CountEl; t: number; tIn: number; tOut: number}> = ({el, t, tIn, tOut}) => {
  const a = visibility(t, tIn, tOut, 0.5);
  if (a <= 0.001) return null;
  const dur = el.dur ?? 1.5;
  const p = clamp((t - tIn) / dur);
  const eased = 1 - Math.pow(1 - p, 3);
  const v = Math.round(el.from + (el.to - el.from) * eased);
  const size = el.size ?? 72;
  return (
    <div style={{position: 'absolute', left: el.x - 900, top: el.y - size * 0.62, width: 1800, textAlign: 'center', fontFamily: FONT, fontSize: size, color: el.color ?? INK, opacity: a}}>
      {(el.prefix ?? '') + v.toLocaleString('en-US') + (el.suffix ?? '')}
    </div>
  );
};

// ---------- line that draws itself ----------
export const DrawView: React.FC<{el: DrawEl; t: number; tIn: number; tOut: number; id: string}> = ({el, t, tIn, tOut, id}) => {
  const fade = 1 - easeInOut((t - tOut) / 0.5);
  if (t < tIn || fade <= 0.001) return null;
  const p = easeInOut((t - tIn) / (el.dur ?? 1.2));
  const stroke = el.stroke ?? INK;
  const width = el.width ?? 6;
  const maskId = `m-${id}`;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: fade}}>
      {el.dash ? (
        <>
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000}>
              <path d={el.d} pathLength={1} stroke="white" strokeWidth={width + 6} fill="none" strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinecap="round" />
            </mask>
          </defs>
          <path d={el.d} stroke={stroke} strokeWidth={width} fill="none" strokeDasharray={`${width * 3} ${width * 2.5}`} strokeLinecap="round" mask={`url(#${maskId})`} />
        </>
      ) : (
        <path d={el.d} pathLength={1} stroke={stroke} strokeWidth={width} fill="none" strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
};

// sample points along an SVG path using the browser's own geometry
let sampler: SVGPathElement | null = null;
const samplePath = (d: string, n: number) => {
  if (typeof document === 'undefined') return [] as {x: number; y: number}[];
  if (!sampler) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    sampler = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svg.appendChild(sampler);
    document.body.appendChild(svg);
  }
  sampler.setAttribute('d', d);
  const L = sampler.getTotalLength();
  return Array.from({length: n + 1}, (_, k) => {
    const pt = sampler!.getPointAtLength((L * k) / n);
    return {x: pt.x, y: pt.y};
  });
};

// ---------- soft light travelling along a path ----------
export const GlowView: React.FC<{el: GlowEl; t: number; tIn: number; tOut: number; id: string}> = ({el, t, tIn, tOut, id}) => {
  const pts = useMemo(() => samplePath(el.d, 240), [el.d]);
  const dur = el.dur ?? 2;
  const fadeOut = el.loop ? 1 - easeInOut((t - tOut) / 0.6) : 1 - easeInOut((t - (tIn + dur + 0.3)) / 0.8);
  if (t < tIn || fadeOut <= 0.001 || pts.length === 0) return null;
  const raw = (t - tIn) / dur;
  const p = el.loop ? raw % 1 : easeInOut(raw);
  const color = el.color ?? GLOW;
  const head = Math.min(pts.length - 1, Math.floor(p * (pts.length - 1)));
  const tail = Array.from({length: 14}, (_, k) => pts[Math.max(0, head - k * 3)]);
  const fadeIn = easeInOut((t - tIn) / 0.4);
  const traced = pts.slice(0, head + 1);
  const gid = `g-${id}`;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: fadeIn * fadeOut}}>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0%" stopColor="#fffbe8" stopOpacity={1} />
          <stop offset="35%" stopColor={color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <filter id={`${gid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>
      {(el.trail ?? true) && traced.length > 1 && (
        <polyline points={traced.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke={color} strokeWidth={6} strokeOpacity={0.45} strokeLinecap="round" filter={`url(#${gid}-blur)`} />
      )}
      {tail.map((q, k) => (
        <circle key={k} cx={q.x} cy={q.y} r={30 - k * 1.6} fill={`url(#${gid})`} opacity={(1 - k / 14) * 0.85} />
      ))}
      <circle cx={pts[head].x} cy={pts[head].y} r={44} fill={`url(#${gid})`} />
    </svg>
  );
};

// ---------- bar comparison ----------
export const BarsView: React.FC<{el: BarsEl; t: number; tIn: number; tOut: number; sub: number[]}> = ({el, t, tIn, tOut, sub}) => {
  const rowH = el.rowH ?? 120;
  const fade = 1 - easeInOut((t - tOut) / 0.5);
  return (
    <div style={{position: 'absolute', left: el.x, top: el.y, opacity: fade}}>
      {el.items.map((it, k) => {
        const tin = sub[k] ?? tIn;
        const a = easeInOut((t - tin) / 0.5);
        if (a <= 0.001) return null;
        const p = easeInOut((t - tin) / 1.3);
        const full = (el.w * it.value) / el.max;
        const low = it.low !== undefined ? (el.w * it.low) / el.max : full;
        const color = it.color ?? '#d9a441';
        return (
          <div key={k} style={{position: 'absolute', top: k * rowH, left: 0, opacity: a}}>
            <div style={{fontFamily: FONT, fontSize: 40, color: INK, marginBottom: 6, whiteSpace: 'nowrap'}}>{it.label}</div>
            <div style={{position: 'relative', height: 44, width: el.w}}>
              <div style={{position: 'absolute', left: 0, top: 0, height: 44, width: el.w, borderRadius: 22, border: `3px solid ${INK}`, opacity: 0.18}} />
              <div style={{position: 'absolute', left: 0, top: 0, height: 44, width: full * p, borderRadius: 22, background: color, opacity: 0.45, border: `3px solid ${INK}`}} />
              <div style={{position: 'absolute', left: 0, top: 0, height: 44, width: low * p, borderRadius: 22, background: color, border: `3px solid ${INK}`}} />
              <div style={{position: 'absolute', left: full * p + 18, top: -4, fontFamily: FONT, fontSize: 44, color: INK, whiteSpace: 'nowrap', opacity: easeInOut((t - tin - 0.8) / 0.5)}}>
                {it.valueLabel}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- pie / share ----------
const arc = (cx: number, cy: number, r: number, frac: number) => {
  if (frac >= 0.9999) return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  const a = frac * Math.PI * 2 - Math.PI / 2;
  const x = cx + r * Math.cos(a);
  const y = cy + r * Math.sin(a);
  return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x} ${y} Z`;
};
export const PieView: React.FC<{el: PieEl; t: number; tIn: number; tOut: number; dark: boolean}> = ({el, t, tIn, tOut, dark}) => {
  const a = visibility(t, tIn, tOut, 0.5);
  if (a <= 0.001) return null;
  const p = easeInOut((t - tIn - 0.2) / 1.4);
  const ink = dark ? '#f3e7cf' : INK;
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: a}}>
        <circle cx={el.x} cy={el.y} r={el.r} fill={dark ? '#2c3550' : '#efe4cf'} stroke={ink} strokeWidth={5} />
        {p > 0.001 && <path d={arc(el.x, el.y, el.r, el.value * p)} fill={el.color ?? '#d9a441'} stroke={ink} strokeWidth={5} strokeLinejoin="round" />}
      </svg>
      {el.label && (
        <div style={{position: 'absolute', left: el.x - 500, top: el.y + el.r + 24, width: 1000, textAlign: 'center', fontFamily: FONT, fontSize: 46, color: ink, opacity: a * easeInOut((t - tIn - 0.6) / 0.6)}}>
          {el.label}
        </div>
      )}
    </>
  );
};

// ---------- one-day clock ----------
export const ClockView: React.FC<{el: ClockEl; t: number; tIn: number; tOut: number; sub: number[]}> = ({el, t, tIn, tOut, sub}) => {
  const a = visibility(t, tIn, tOut, 0.5);
  if (a <= 0.001) return null;
  const p = easeInOut((t - tIn) / 1.6);
  const {x, y, r} = el;
  const pt = (minBefore: number, rr: number) => {
    const ang = -Math.PI / 2 - (minBefore / 1440) * Math.PI * 2;
    return {x: x + rr * Math.cos(ang), y: y + rr * Math.sin(ang)};
  };
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a}}>
        <circle cx={x} cy={y} r={r} fill="#fbf6ec" stroke={INK} strokeWidth={7} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} transform={`rotate(-90 ${x} ${y})`} />
        {Array.from({length: 24}).map((_, h) => {
          const ang = (h / 24) * Math.PI * 2 - Math.PI / 2;
          const o = easeInOut((t - tIn - 0.4 - h * 0.03) / 0.4);
          return <line key={h} x1={x + (r - 10) * Math.cos(ang)} y1={y + (r - 10) * Math.sin(ang)} x2={x + (r - (h % 6 === 0 ? 46 : 26)) * Math.cos(ang)} y2={y + (r - (h % 6 === 0 ? 46 : 26)) * Math.sin(ang)} stroke={INK} strokeWidth={h % 6 === 0 ? 6 : 3} opacity={o} />;
        })}
        {el.marks.map((m, k) => {
          const tm = sub[k] ?? tIn;
          const q = easeInOut((t - tm) / 0.9);
          if (q <= 0.001) return null;
          const a0 = -Math.PI / 2 - (m.min / 1440) * Math.PI * 2;
          const tip = pt(m.min, r - 4);
          const lx = x - r - 60;
          return (
            <g key={k} opacity={q}>
              <path d={`M ${x} ${y} L ${x + (r - 4) * Math.cos(a0)} ${y + (r - 4) * Math.sin(a0)} A ${r - 4} ${r - 4} 0 0 1 ${x} ${y - r + 4} Z`} fill="#d4a017" stroke="#9b3b2a" strokeWidth={3} />
              <polyline points={`${tip.x},${tip.y} ${tip.x - 40},${m.ly} ${lx},${m.ly}`} fill="none" stroke="#9b3b2a" strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} />
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: x - 200, top: y - r - 84, width: 400, textAlign: 'center', fontFamily: FONT, fontSize: 40, color: INK, opacity: a * p}}>midnight</div>
      {el.marks.map((m, k) => {
        const q = easeInOut((t - (sub[k] ?? tIn) - 0.3) / 0.6);
        if (q <= 0.001) return null;
        return (
          <div key={k} style={{position: 'absolute', left: x - r - 60 - 760, top: m.ly - 30, width: 740, textAlign: 'right', fontFamily: FONT, fontSize: 44, color: '#9b3b2a', opacity: q * a}}>
            {m.label}
          </div>
        );
      })}
    </>
  );
};

export type AnyEl = El;
