// One camera filming one big page. Each scene is a panel on that page; the camera glides between them.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background, PAGE_COLOR} from './Backgrounds';
import {BarsView, ClockView, CountView, DrawView, GlowView, ImgView, PieView, TextView, INK} from './Elements';
import {cameraAt, easeInOut, H, scenes, W, type Scene, type TimedEl} from './timeline';
import type {MagEl} from './types';

const ElementView: React.FC<{te: TimedEl; t: number; dark: boolean; scene: Scene; cam: {x: number; y: number}}> = ({te, t, dark, scene, cam}) => {
  const {el, tIn, tOut, key, sub} = te;
  let node: React.ReactNode = null;
  switch (el.t) {
    case 'img':
      node = <ImgView el={el} t={t} tIn={tIn} tOut={tOut} id={key} />;
      break;
    case 'text':
      node = <TextView el={dark && !el.color ? {...el, color: '#f3e7cf'} : el} t={t} tIn={tIn} tOut={tOut} />;
      break;
    case 'count':
      node = <CountView el={dark && !el.color ? {...el, color: '#f3e7cf'} : el} t={t} tIn={tIn} tOut={tOut} />;
      break;
    case 'draw':
      node = <DrawView el={dark && !el.stroke ? {...el, stroke: '#f3e7cf'} : el} t={t} tIn={tIn} tOut={tOut} id={key} />;
      break;
    case 'glow':
      node = <GlowView el={el} t={t} tIn={tIn} tOut={tOut} id={key} />;
      break;
    case 'bars':
      node = <BarsView el={el} t={t} tIn={tIn} tOut={tOut} sub={sub} />;
      break;
    case 'pie':
      node = <PieView el={el} t={t} tIn={tIn} tOut={tOut} dark={dark} />;
      break;
    case 'clock':
      node = <ClockView el={el} t={t} tIn={tIn} tOut={tOut} sub={sub} />;
      break;
    default:
      return null;
  }
  const depth = el.depth ?? 1;
  if (depth === 1) return <>{node}</>;
  // parallax: things further away move less as the camera moves
  const ox = (cam.x - (scene.x + W / 2)) * (1 - depth) * 0.5;
  const oy = (cam.y - (scene.y + H / 2)) * (1 - depth) * 0.5;
  return <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${ox}px, ${oy}px)`}}>{node}</div>;
};

// the panel's content (background + elements), optionally without magnifiers (used inside a magnifier)
const PanelContent: React.FC<{scene: Scene; t: number; cam: {x: number; y: number}; withMag: boolean}> = ({scene, t, cam, withMag}) => {
  const dark = scene.bg === 'night';
  return (
    <>
      <Background bg={scene.bg} seed={scene.index * 1.7} />
      {scene.els
        .filter((te) => te.el.t !== 'mag' && t >= te.tIn - 0.05)
        .map((te) => (
          <ElementView key={te.key} te={te} t={t} dark={dark} scene={scene} cam={cam} />
        ))}
      {withMag &&
        scene.els
          .filter((te) => te.el.t === 'mag' && t >= te.tIn)
          .map((te) => <Magnifier key={te.key} te={te} t={t} scene={scene} cam={cam} />)}
    </>
  );
};

// circle that grows out of a detail, joined to it by two thin lines, showing that detail enlarged
const Magnifier: React.FC<{te: TimedEl; t: number; scene: Scene; cam: {x: number; y: number}}> = ({te, t, scene, cam}) => {
  const el = te.el as MagEl;
  const out = te.tOut === Infinity ? 1 : 1 - easeInOut((t - te.tOut) / 0.5);
  const p = easeInOut((t - te.tIn) / 1.1);
  if (p <= 0.001 || out <= 0.001) return null;
  const r1 = Math.max(26, el.r / el.zoom);
  const cx = el.sx + (el.cx - el.sx) * p;
  const cy = el.sy + (el.cy - el.sy) * p;
  const r2 = r1 + (el.r - r1) * p;
  const dx = cx - el.sx;
  const dy = cy - el.sy;
  const d = Math.hypot(dx, dy);
  const lines: [number, number, number, number][] = [];
  if (d > Math.abs(r2 - r1) + 1) {
    const th = Math.atan2(dy, dx);
    for (const sgn of [1, -1]) {
      const phi = th + sgn * Math.acos((r1 - r2) / d);
      lines.push([el.sx + r1 * Math.cos(phi), el.sy + r1 * Math.sin(phi), cx + r2 * Math.cos(phi), cy + r2 * Math.sin(phi)]);
    }
  }
  const zoom = 1 + (el.zoom - 1) * p;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: out}}>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <circle cx={el.sx} cy={el.sy} r={r1} fill="none" stroke={INK} strokeWidth={4} />
        {lines.map((l, k) => (
          <line key={k} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke={INK} strokeWidth={3} />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: cx - r2,
          top: cy - r2,
          width: r2 * 2,
          height: r2 * 2,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `6px solid ${INK}`,
          boxShadow: '0 0 0 8px rgba(255,255,255,0.85), 0 10px 30px rgba(0,0,0,0.18)',
          background: '#fff',
        }}
      >
        <div style={{position: 'absolute', left: r2 - el.sx * zoom, top: r2 - el.sy * zoom, width: W, height: H, transform: `scale(${zoom})`, transformOrigin: '0 0'}}>
          <PanelContent scene={scene} t={t} cam={cam} withMag={false} />
        </div>
      </div>
    </div>
  );
};

export const World: React.FC<{t: number}> = ({t}) => {
  const cam = cameraAt(t);
  // only draw panels that the camera can currently see
  const halfW = W / 2 / cam.z + 200;
  const halfH = H / 2 / cam.z + 200;
  const visible = scenes.filter((s) => s.x < cam.x + halfW && s.x + W > cam.x - halfW && s.y < cam.y + halfH && s.y + H > cam.y - halfH);
  return (
    <AbsoluteFill style={{backgroundColor: PAGE_COLOR, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H / 2}px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`}}>
        {visible.map((s) => (
          <div key={s.id} style={{position: 'absolute', left: s.x, top: s.y, width: W, height: H, overflow: 'hidden', borderRadius: 18, boxShadow: '0 12px 40px rgba(60,40,20,0.18)'}}>
            <PanelContent scene={s} t={t} cam={cam} withMag />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
