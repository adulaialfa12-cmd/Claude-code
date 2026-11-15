// Renders the storyboard scenes for video 01 as 1920x1080 ink-on-paper PNG stills.
// Run from anywhere:  node scenes.mjs   → writes ./frames/sNN.png
// Uses the pre-installed Playwright + Chromium (require('playwright')).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'frames');
mkdirSync(out, { recursive: true });

// ---------- palette & drawing helpers ----------
const INK = '#1d1b18', ACC = '#d4612a', SOFT = '#8a8174';
const S = (w = 5) => `fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const F = (c = INK) => `fill="${c}" stroke="none"`;

const person = (x, y, s = 1, pose = 'stand') => {
  const arms = pose === 'sit'
    ? `M${-28} ${-40} Q0 -20 28 -40`
    : pose === 'reach' ? `M-30 -70 L0 -55 L40 -110` : `M-32 -20 L0 -60 L32 -20`;
  const legs = pose === 'sit' ? `M0 0 L-35 10 L-40 40 M0 0 L35 10 L40 40` : `M0 0 L-25 70 M0 0 L25 70`;
  return `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">
    <circle cx="0" cy="-95" r="22" ${S(5)}/>
    <path d="M0 -72 L0 0 ${arms} ${legs}" ${S(6)}/></g>`;
};
const sun = (x, y, r = 70, rays = true) => `<g filter="url(#rough)">
  <circle cx="${x}" cy="${y}" r="${r}" fill="${ACC}" opacity=".9"/>
  ${rays ? Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2, r1 = r + 18, r2 = r + 50;
    return `<line x1="${x + Math.cos(a) * r1}" y1="${y + Math.sin(a) * r1}" x2="${x + Math.cos(a) * r2}" y2="${y + Math.sin(a) * r2}" stroke="${ACC}" stroke-width="6" stroke-linecap="round"/>`;
  }).join('') : ''}</g>`;
const moon = (x, y, r, phase) => { // phase 0..1 (0 new, .5 full)
  const k = Math.cos(phase * 2 * Math.PI); // 1 → new, -1 → full
  const sweep = phase < .5 ? 1 : 0;
  return `<g filter="url(#rough)"><circle cx="${x}" cy="${y}" r="${r}" ${S(3)}/>
    <path d="M${x} ${y - r} A${r} ${r} 0 0 ${sweep} ${x} ${y + r} A${Math.abs(k) * r} ${r} 0 0 ${k > 0 ? sweep : 1 - sweep} ${x} ${y - r}Z" fill="${INK}" opacity=".85"/></g>`;
};
const hills = (y = 820) => `<path d="M0 ${y} Q300 ${y - 70} 620 ${y - 20} T1300 ${y - 30} T1920 ${y - 10}" ${S(5)} filter="url(#rough)"/>`;
const ground = (y = 860) => `<path d="M60 ${y} L1860 ${y}" ${S(4)} filter="url(#rough)"/>`;
const label = (text, x = 960, y = 980, size = 54) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="Liberation Serif, DejaVu Serif, serif" font-size="${size}" fill="${INK}" font-weight="700">${text}</text>`;
const sub = (text, x = 960, y = 1040, size = 34) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="Liberation Serif, DejaVu Serif, serif" font-size="${size}" fill="${SOFT}" font-style="italic">${text}</text>`;
const badge = (text, x, y) => `<g transform="rotate(-6 ${x} ${y})"><rect x="${x - 150}" y="${y - 45}" width="300" height="80" rx="10" fill="none" stroke="${ACC}" stroke-width="6"/>
  <text x="${x}" y="${y + 14}" text-anchor="middle" font-family="Liberation Serif, serif" font-size="44" font-weight="700" fill="${ACC}">${text}</text></g>`;
const fire = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">
  <path d="M-50 0 L50 0 M-40 0 L30 -15 M40 0 L-30 -15" ${S(7)}/>
  <path d="M0 -20 C-40 -60 -10 -110 0 -150 C15 -110 45 -70 0 -20Z" fill="${ACC}"/>
  <path d="M0 -30 C-15 -55 -5 -80 0 -95 C8 -75 18 -55 0 -30Z" fill="#f2b04a"/></g>`;
const bone = (x, y, w, notches, groups) => {
  let marks = '';
  const n = notches, step = (w - 160) / n;
  for (let i = 0; i < n; i++) {
    const gx = x - w / 2 + 80 + i * step + (groups ? Math.floor(i / groups) * 6 : 0);
    marks += `<line x1="${gx}" y1="${y - 26}" x2="${gx + 4}" y2="${y + 26}" stroke="${i % 5 === 4 ? ACC : INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  return `<g filter="url(#rough)"><path d="M${x - w / 2 + 40} ${y - 40} Q${x} ${y - 55} ${x + w / 2 - 40} ${y - 40}
    C${x + w / 2 + 30} ${y - 90} ${x + w / 2 + 60} ${y + 10} ${x + w / 2 - 40} ${y + 40}
    Q${x} ${y + 55} ${x - w / 2 + 40} ${y + 40} C${x - w / 2 - 60} ${y + 10} ${x - w / 2 - 30} ${y - 90} ${x - w / 2 + 40} ${y - 40}Z"
    fill="#efe3c8" ${S(5).replace('fill="none" ', '')}/>${marks}</g>`;
};
const trilithon = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">
  <rect x="-110" y="-260" width="70" height="260" fill="#cfc5b0" ${S(5).replace('fill="none" ', '')}/>
  <rect x="40" y="-260" width="70" height="260" fill="#cfc5b0" ${S(5).replace('fill="none" ', '')}/>
  <rect x="-130" y="-300" width="260" height="45" fill="#cfc5b0" ${S(5).replace('fill="none" ', '')}/></g>`;
const star = (x, y, r = 10, c = INK) => `<path d="M${x} ${y - r} L${x + r * .3} ${y - r * .3} L${x + r} ${y} L${x + r * .3} ${y + r * .3} L${x} ${y + r} L${x - r * .3} ${y + r * .3} L${x - r} ${y} L${x - r * .3} ${y - r * .3}Z" fill="${c}"/>`;
const gear = (x, y, r, teeth = 12) => {
  let d = '';
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r : r + 18;
    d += `${i ? 'L' : 'M'}${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr} `;
  }
  return `<g filter="url(#rough)"><path d="${d}Z" ${S(5)}/><circle cx="${x}" cy="${y}" r="${r * .3}" ${S(5)}/></g>`;
};
const cow = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">
  <path d="M-80 -60 Q0 -80 70 -60 L80 -20 Q0 -5 -80 -20Z" fill="#efe3c8" ${S(5).replace('fill="none" ', '')}/>
  <path d="M-70 -20 L-70 30 M-40 -15 L-40 30 M40 -15 L40 30 M65 -20 L65 30" ${S(6)}/>
  <path d="M70 -60 L110 -70 L120 -40 L85 -30" ${S(5)}/><path d="M105 -72 Q100 -110 70 -115 M112 -70 Q140 -105 165 -100" ${S(4)}/></g>`;
const clockface = (x, y, r, h = 10, m = 10, minuteHand = true) => {
  const ha = ((h % 12) / 12 + m / 720) * Math.PI * 2 - Math.PI / 2, ma = (m / 60) * Math.PI * 2 - Math.PI / 2;
  const ticks = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2;
    return `<line x1="${x + Math.cos(a) * r * .82}" y1="${y + Math.sin(a) * r * .82}" x2="${x + Math.cos(a) * r * .95}" y2="${y + Math.sin(a) * r * .95}" stroke="${INK}" stroke-width="5"/>`; }).join('');
  return `<g filter="url(#rough)"><circle cx="${x}" cy="${y}" r="${r}" fill="#f6eedb" ${S(6).replace('fill="none" ', '')}/>${ticks}
    <line x1="${x}" y1="${y}" x2="${x + Math.cos(ha) * r * .5}" y2="${y + Math.sin(ha) * r * .5}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    ${minuteHand ? `<line x1="${x}" y1="${y}" x2="${x + Math.cos(ma) * r * .75}" y2="${y + Math.sin(ma) * r * .75}" stroke="${ACC}" stroke-width="6" stroke-linecap="round"/>` : ''}
    <circle cx="${x}" cy="${y}" r="9" fill="${INK}"/></g>`;
};
const bell = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">
  <path d="M-60 40 Q-55 -50 0 -60 Q55 -50 60 40 L75 55 L-75 55Z" fill="${ACC}" ${S(5).replace('fill="none" ', '')}/>
  <circle cx="0" cy="68" r="12" fill="${INK}"/><path d="M0 -60 L0 -85" ${S(6)}/></g>`;
const rings = (x, y, n = 3) => Array.from({ length: n }, (_, i) =>
  `<path d="M${x - 120 - i * 70} ${y - 40 - i * 30} Q${x} ${y - 140 - i * 60} ${x + 120 + i * 70} ${y - 40 - i * 30}" ${S(4)} opacity="${0.8 - i * 0.2}" filter="url(#rough)"/>`).join('');

// ---------- the 22 storyboard scenes ----------
const scenes = [
  // 1 phone → no time
  () => `<g filter="url(#rough)"><rect x="760" y="140" width="400" height="720" rx="50" fill="#26231f" ${S(6).replace('fill="none" ', '')}/>
     <rect x="790" y="200" width="340" height="600" rx="20" fill="#3b3631"/></g>
     <text x="960" y="470" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="130" fill="#f6eedb" font-weight="700">07:59</text>
     <text x="960" y="540" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="34" fill="#cfc5b0">Monday · You are late</text>
     ${label('Your day runs on a number')}`,
  // 2 dawn, no hours
  () => `${sun(960, 700, 110)}${hills(760)}${person(560, 760, 1.2, 'stand')}${person(700, 760, 1, 'sit')}${person(1360, 760, 1.1, 'reach')}
     <rect x="0" y="770" width="1920" height="310" fill="#f3ead6"/>${ground(770)}
     ${label('No hours. No minutes.', 960, 930, 70)}${sub('For almost all of human history', 960, 1000)}`,
  // 3 circadian
  () => `<g filter="url(#rough)"><circle cx="960" cy="470" r="290" ${S(6)}/></g>
     ${sun(960, 180, 50, false)}${moon(960, 760, 45, .5)}
     ${Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return `<line x1="${960 + Math.cos(a) * 270}" y1="${470 + Math.sin(a) * 270}" x2="${960 + Math.cos(a) * 310}" y2="${470 + Math.sin(a) * 310}" stroke="${INK}" stroke-width="${i % 6 ? 3 : 7}"/>`; }).join('')}
     ${person(960, 560, 1.4, 'stand')}
     <path d="M1000 380 Q1150 300 1210 200" ${S(4)} stroke-dasharray="14 14"/>
     ${label('The circadian rhythm ≈ 24 hours', 960, 990)}${sub('Your body is the first clock', 960, 1045)}`,
  // 4 day as events
  () => { const ev = [['Dawn', 300], ['Midday heat', 720], ['Long shadows', 1160], ['The fire', 1600]];
     return `<path d="M120 640 Q960 120 1800 640" ${S(5)} stroke-dasharray="4 18" filter="url(#rough)"/>
     ${sun(300, 560, 45, false)}${sun(720, 330, 55)}${sun(1160, 360, 45, false)}${fire(1600, 640, .9)}
     ${person(1160, 760, .9)}<path d="M1185 830 L1500 860" stroke="${SOFT}" stroke-width="22" opacity=".5" stroke-linecap="round"/>
     ${ev.map(([t, x]) => label(t, x, 900, 44)).join('')}${label('Time was a list of events', 960, 1010, 56)}`; },
  // 5 Lebombo bone
  () => `${bone(960, 470, 1300, 29, 0)}
     <text x="960" y="330" text-anchor="middle" font-family="Liberation Serif, serif" font-size="150" font-weight="700" fill="${ACC}">29</text>
     ${label('The Lebombo bone', 960, 700, 70)}${sub('~43,000 years old · 29 carved notches', 960, 770, 44)}
     ${label('Lunar month ≈ 29.5 days', 960, 960, 52)}`,
  // 6 debated
  () => `<line x1="960" y1="120" x2="960" y2="880" ${S(4)} stroke-dasharray="12 16"/>
     ${[0, .12, .25, .37, .5, .62, .75, .87].map((p, i) => moon(220 + i * 90, 360, 34, p)).join('')}
     ${label('A moon calendar?', 480, 600, 60)}
     ${Array.from({ length: 6 }, (_, g) => `<g transform="translate(${1120 + g * 110} 300)"><path d="M0 0 L0 120 M22 0 L22 120 M44 0 L44 120 M66 0 L66 120 M-10 100 L80 20" ${S(6)} filter="url(#rough)"/></g>`).join('')}
     ${label('Or just a tally?', 1440, 600, 60)}${badge('DEBATED', 960, 800)}
     ${sub('We can’t ask the person who made it', 960, 1000, 44)}`,
  // 7 Ishango
  () => `${bone(960, 430, 1100, 36, 6)}${label('The Ishango bone', 960, 650, 70)}
     ${sub('~20,000 years old · near the source of the Nile', 960, 720, 44)}
     ${badge('DEBATED', 960, 880)}${sub('A six-month moon calendar? Arithmetic? Decoration?', 960, 1010, 40)}`,
  // 8 Warren Field
  () => `${[0, .08, .17, .25, .33, .42, .5, .58, .67, .75, .83, .92].map((p, i) => moon(260 + i * 128, 260, 40, p)).join('')}
     ${Array.from({ length: 12 }, (_, i) => `<ellipse cx="${260 + i * 128}" cy="${560 + Math.sin(i * .6) * 25}" rx="${40 + (i % 4) * 6}" ry="28" fill="#5a4f42" opacity=".85" filter="url(#rough)"/>`).join('')}
     <path d="M200 700 L1800 700" ${S(4)} stroke-dasharray="10 14"/>${sun(1840, 700, 40, false)}
     ${sub('points to the midwinter sunrise →', 1460, 770, 36)}
     ${label('Warren Field, Scotland · ~10,000 years ago', 960, 920, 56)}${sub('Twelve pits that may follow the moon', 960, 990, 40)}`,
  // 9 drift
  () => `<g filter="url(#rough)"><circle cx="660" cy="470" r="300" ${S(6)}/><circle cx="1260" cy="470" r="300" ${S(6)} stroke-dasharray="20 14"/></g>
     ${['Spring', 'Summer', 'Autumn', 'Winter'].map((t, i) => { const a = (i / 4) * Math.PI * 2 - Math.PI / 2; return label(t, 660 + Math.cos(a) * 200, 485 + Math.sin(a) * 200, 40); }).join('')}
     ${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; return moon(1260 + Math.cos(a) * 230, 470 + Math.sin(a) * 230, 26, i / 12); }).join('')}
     ${label('365 days', 660, 880, 54)}${label('12 moons ≈ 354 days', 1260, 880, 54)}
     ${sub('Count only moons and the seasons slowly drift — 11 days a year', 960, 1000, 42)}`,
  // 10 Stonehenge
  () => `<rect width="1920" height="1080" fill="#f0d9b8" opacity=".55"/>${sun(960, 600, 90, true)}
     ${trilithon(560, 780, 1.1)}${trilithon(960, 780, 1.25)}${trilithon(1360, 780, 1.1)}
     <rect x="0" y="780" width="1920" height="300" fill="#f3ead6"/>${ground(780)}
     ${label('Stonehenge · the midwinter sunset', 960, 920, 60)}${sub('A calendar you could not lose — because it weighed tonnes', 960, 990, 42)}`,
  // 11 decans
  () => `<rect width="1920" height="1080" fill="#22201c"/>
     ${Array.from({ length: 60 }, (_, i) => star((i * 331) % 1900, (i * 197) % 700 + 40, 4 + (i % 3) * 2, '#cfc5b0')).join('')}
     ${Array.from({ length: 12 }, (_, i) => `${star(180 + i * 140, 620 - Math.sin((i / 11) * Math.PI) * 360, 16, ACC)}<text x="${180 + i * 140}" y="${690 - Math.sin((i / 11) * Math.PI) * 360}" text-anchor="middle" font-family="Liberation Serif" font-size="34" fill="#f6eedb">${i + 1}</text>`).join('')}
     <path d="M0 860 Q960 820 1920 860 L1920 1080 L0 1080Z" fill="#14120f"/>
     <text x="960" y="960" text-anchor="middle" font-family="Liberation Serif, serif" font-size="60" font-weight="700" fill="#f6eedb">Egypt: 12 night hours, marked by rising stars</text>
     <text x="960" y="1030" text-anchor="middle" font-family="Liberation Serif, serif" font-size="40" font-style="italic" fill="#cfc5b0">12 + 12 = the 24-hour day</text>`,
  // 12 unequal hours
  () => `${label('Summer daylight', 420, 250, 48)}${Array.from({ length: 12 }, (_, i) => `<rect x="${720 + i * 92}" y="200" width="86" height="70" fill="${i % 2 ? ACC : '#f2b04a'}" opacity=".9" filter="url(#rough)"/>`).join('')}
     ${label('Winter daylight', 420, 480, 48)}${Array.from({ length: 12 }, (_, i) => `<rect x="${720 + i * 62}" y="430" width="56" height="70" fill="${i % 2 ? INK : SOFT}" opacity=".9" filter="url(#rough)"/>`).join('')}
     <text x="1500" y="580" font-family="Liberation Serif" font-size="40" fill="${SOFT}" font-style="italic">shorter hours</text>
     ${label('An “hour” stretched and shrank with the seasons', 960, 780, 62)}${sub('Daylight was always split into twelve', 960, 860, 44)}`,
  // 13 water clock
  () => `<g filter="url(#rough)"><path d="M620 260 L1300 260 L1180 760 L740 760Z" fill="#cfc5b0" ${S(7).replace('fill="none" ', '')}/>
     <path d="M660 420 L1260 420" stroke="#4a7fa0" stroke-width="10"/><path d="M670 420 L1250 420 L1180 755 L742 755Z" fill="#7aa6c2" opacity=".5"/>
     ${Array.from({ length: 6 }, (_, i) => `<line x1="${690 + i * 18}" y1="${320 + i * 80}" x2="${740 + i * 18}" y2="${320 + i * 80}" stroke="${INK}" stroke-width="5"/>`).join('')}
     <circle cx="960" cy="790" r="9" fill="#4a7fa0"/><circle cx="960" cy="840" r="7" fill="#4a7fa0"/><circle cx="960" cy="880" r="5" fill="#4a7fa0"/></g>
     ${label('A water clock from Karnak, Egypt · ~1400 BC', 960, 980, 54)}${sub('As water dripped out, the falling level told the hour of the night', 960, 1040, 38)}`,
  // 14 base 60
  () => `<g filter="url(#rough)"><rect x="300" y="250" width="520" height="420" rx="60" fill="#d8c3a0" ${S(6).replace('fill="none" ', '')}/></g>
     ${Array.from({ length: 6 }, (_, i) => `<path d="M${380 + i * 70} 360 l25 0 l-12 30z M${380 + i * 70} 460 l25 0 l-12 30z" fill="${INK}"/>`).join('')}
     <text x="560" y="610" text-anchor="middle" font-family="Liberation Serif" font-size="80" font-weight="700" fill="${INK}">60</text>
     <path d="M880 460 L1080 460 M1050 430 L1085 460 L1050 490" ${S(8)}/>
     ${clockface(1400, 460, 240, 10, 10, true)}
     ${label('Babylon counted in sixties', 960, 860, 62)}${sub('60 minutes in an hour · 60 seconds in a minute', 960, 935, 44)}`,
  // 15 monastery bell
  () => `<rect width="1920" height="1080" fill="#2a2621" opacity=".12"/>${moon(1650, 180, 60, .5)}
     <g filter="url(#rough)"><path d="M760 860 L760 420 L960 260 L1160 420 L1160 860Z" fill="#e7dcc4" ${S(6).replace('fill="none" ', '')}/>
     <path d="M900 860 L900 720 Q960 660 1020 720 L1020 860" ${S(6)}/><path d="M860 470 L1060 470" ${S(5)}/></g>
     ${bell(960, 380, .9)}${rings(960, 300, 3)}${hills(870)}${ground(870)}
     ${label('Monastery bells: the canonical hours', 960, 960, 58)}${sub('Time became public — everyone heard the same hour', 960, 1030, 42)}`,
  // 16 tower clock
  () => `${gear(700, 470, 150, 14)}${gear(960, 330, 90, 10)}${gear(1180, 520, 120, 12)}
     <g filter="url(#rough)"><path d="M1460 880 L1460 250 L1620 160 L1780 250 L1780 880Z" fill="#e7dcc4" ${S(6).replace('fill="none" ', '')}/></g>
     ${clockface(1620, 380, 110, 3, 0, false)}${ground(880)}
     ${label('Late 1200s: the first mechanical clocks', 960, 970, 58)}${sub('Most had only an hour hand — minutes mattered only after 1656', 960, 1035, 40)}`,
  // 17 factory
  () => `<g filter="url(#rough)"><path d="M300 860 L300 520 L520 400 L520 520 L740 400 L740 520 L960 400 L960 860Z" fill="#d9cdb4" ${S(6).replace('fill="none" ', '')}/>
     <rect x="1040" y="250" width="90" height="610" fill="#bfb29a" ${S(6).replace('fill="none" ', '')}/>
     <path d="M1085 240 C1040 180 1140 150 1090 90 C1060 50 1150 30 1180 0" stroke="${SOFT}" stroke-width="30" fill="none" opacity=".5"/></g>
     ${clockface(630, 300, 70, 7, 0, true)}
     ${[1250, 1350, 1450, 1550, 1650].map((x, i) => person(x, 860 - (i % 2) * 8, .75)).join('')}
     <path d="M1220 900 L980 900 M1010 880 L975 900 L1010 920" ${S(6)}/>${ground(860)}
     ${label('Task time → clock time', 960, 970, 64)}${sub('Workers were paid for hours, not for jobs', 960, 1035, 42)}`,
  // 18 knocker-upper
  () => `<rect width="1920" height="1080" fill="#2a2621" opacity=".15"/>
     <g filter="url(#rough)"><path d="M300 880 L300 300 L900 300 L900 880Z" fill="#e1d5bd" ${S(6).replace('fill="none" ', '')}/>
     <rect x="380" y="380" width="160" height="180" fill="#f2b04a" ${S(5).replace('fill="none" ', '')}/><rect x="660" y="380" width="160" height="180" fill="#5a4f42" ${S(5).replace('fill="none" ', '')}/>
     <path d="M1300 640 L760 420" stroke="${INK}" stroke-width="8" stroke-linecap="round"/></g>
     ${person(1330, 820, 1.4, 'reach')}${moon(1650, 200, 55, .62)}${ground(880)}
     <text x="720" y="360" font-family="Liberation Serif" font-size="48" fill="${ACC}" font-weight="700">tap tap tap</text>
     ${label('“Knocker-uppers” woke workers before dawn', 960, 975, 58)}${sub('Britain, 1800s–1900s', 960, 1035, 40)}`,
  // 19 railway time
  () => `<g filter="url(#rough)"><path d="M260 330 Q500 250 820 270 Q1150 230 1500 280 Q1680 320 1700 420 Q1660 560 1560 640 Q1300 760 1000 720 Q700 760 450 690 Q280 600 260 450Z" fill="#efe3c8" ${S(6).replace('fill="none" ', '')}/></g>
     ${[540, 860, 1180, 1460].map((x, i) => `<line x1="${x}" y1="230" x2="${x - 30}" y2="780" stroke="${i % 2 ? ACC : INK}" stroke-width="5" stroke-dasharray="16 12"/>`).join('')}
     ${[[400, 'Pacific'], [700, 'Mountain'], [1020, 'Central'], [1330, 'Eastern']].map(([x, t]) => sub(t, x, 820, 36)).join('')}
     ${[[400, 8], [700, 9], [1020, 10], [1330, 11]].map(([x, h]) => clockface(x, 480, 70, h, 0, true)).join('')}
     ${label('18 November 1883 · “The day of two noons”', 960, 940, 58)}${sub('North American railroads switch to standard time zones', 960, 1010, 42)}`,
  // 20 cattle clock
  () => `${sun(1600, 220, 60)}${hills(800)}${cow(560, 780, 1.4)}${cow(980, 800, 1.2)}${person(1300, 800, 1.15, 'stand')}
     <path d="M1330 720 L1400 560" ${S(6)}/>${ground(830)}
     ${label('The “cattle clock” of the Nuer, South Sudan', 960, 950, 58)}${sub('Milking time · pasture time · homecoming', 960, 1020, 42)}`,
  // 21 resolution
  () => `${sun(960, 560, 120)}${hills(700)}
     <g filter="url(#rough)"><rect x="830" y="140" width="260" height="440" rx="34" fill="#26231f" opacity=".18" ${S(4).replace('fill="none" ', '')}/></g>
     <text x="960" y="380" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="80" fill="${INK}" opacity=".25" font-weight="700">07:59</text>
     <rect x="0" y="720" width="1920" height="360" fill="#f3ead6"/>${ground(720)}
     ${label('For most of history, nobody was ever late.', 960, 880, 66)}${sub('There was nothing to be late for.', 960, 960, 48)}`,
  // 22 end card
  () => `${clockface(960, 380, 200, 9, 0, true)}
     ${label('WHY WE WORK', 960, 720, 96)}${sub('Every video asks one question: why do we work the way we do?', 960, 800, 42)}
     <g filter="url(#rough)"><rect x="700" y="860" width="520" height="110" rx="55" fill="${ACC}"/></g>
     <text x="960" y="933" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="52" font-weight="700" fill="#fff8ec">SUBSCRIBE</text>`,
];

const page = (svgBody) => `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#f4ead6}
</style></head><body>
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
  <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .10 0"/></filter>
  <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a2a14" stop-opacity=".28"/></radialGradient>
 </defs>
 <rect width="1920" height="1080" fill="#f4ead6"/>
 ${svgBody}
 <rect width="1920" height="1080" filter="url(#paper)"/>
 <rect width="1920" height="1080" fill="url(#vig)"/>
</svg></body></html>`;

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
for (let i = 0; i < scenes.length; i++) {
  await p.setContent(page(scenes[i]()));
  await p.screenshot({ path: join(out, `s${String(i + 1).padStart(2, '0')}.png`) });
}
await browser.close();
console.log(`rendered ${scenes.length} scenes → ${out}`);
