// The whole video in one place: narration (one paragraph = one voice take) and the shot list.
// Each sentence = one shot-list row. `at` ties an element to the word that brings it on screen.
// Panel coordinates are 1920x1080. Savanna horizon sits at y=700.
import type {Chapter, El, Sentence, SceneDef, Cam, Bg, ClockMark, BarItem} from '../engine/types';

// ---- small helpers to keep the shot list readable ----
const I = (src: string, x: number, y: number, h: number, o: Partial<El> = {}): El => ({t: 'img', src, x, y, h, ...o} as El);
const IW = (src: string, x: number, y: number, w: number, o: Partial<El> = {}): El => ({t: 'img', src, x, y, w, ...o} as El);
const T = (text: string, x: number, y: number, o: Partial<El> = {}): El => ({t: 'text', text, x, y, ...o} as El);
const C = (to: number, x: number, y: number, o: Partial<El> = {}): El => ({t: 'count', from: 0, to, x, y, ...o} as El);
const D = (d: string, o: Partial<El> = {}): El => ({t: 'draw', d, ...o} as El);
const G = (d: string, o: Partial<El> = {}): El => ({t: 'glow', d, ...o} as El);
const M = (sx: number, sy: number, cx: number, cy: number, r: number, zoom: number, o: Partial<El> = {}): El =>
  ({t: 'mag', sx, sy, cx, cy, r, zoom, ...o} as El);
const P = (x: number, y: number, r: number, value: number, label: string, o: Partial<El> = {}): El =>
  ({t: 'pie', x, y, r, value, label, ...o} as El);
const B = (x: number, y: number, w: number, max: number, items: BarItem[], o: Partial<El> = {}): El =>
  ({t: 'bars', x, y, w, max, items, ...o} as El);
const K = (x: number, y: number, r: number, marks: ClockMark[], o: Partial<El> = {}): El =>
  ({t: 'clock', x, y, r, marks, ...o} as El);
const sc = (id: string, bg: Bg): SceneDef => ({id, bg});
const s = (text: string, o: {scene?: SceneDef; cam?: Cam; els?: El[]; tts?: string} = {}): Sentence => ({text, ...o});
const header = (n: number, q: string): El => T(`${n} · ${q}`, 960, 92, {size: 54, color: '#5b4632', out: 'next'});

// circle path helper for glows
const ring = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy}`;

const JU = 'Zhu-twa-see'; // how the voice should say Ju/'hoansi
const HX = 'hah-roh'; // hxaro

export const chapters: Chapter[] = [
  {
    id: 'intro',
    title: 'Intro',
    paragraphs: [
      {
        id: 'p01',
        sentences: [
          s('Our species is about three hundred thousand years old.', {
            scene: sc('intro-a', 'savanna'),
            cam: [1.12, 960, 520],
            els: [I('char_stand', 960, 640, 540, {anim: 'rise'}), C(300000, 960, 190, {at: 'three', size: 104, suffix: ' years', dur: 2.2})],
          }),
          s("Money, even if we're generous, is about five thousand.", {
            cam: [1.0, 1150, 540],
            els: [I('obj_coin', 1560, 540, 190, {at: 'Money', anim: 'grow'}), C(5000, 1560, 360, {at: 'five', size: 78, suffix: ' years', dur: 1.4})],
          }),
          s('That means for more than ninety-eight percent of human history, nobody had any money at all.', {
            scene: sc('intro-b', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              D('M 160 540 L 1760 540', {width: 26, stroke: '#c9b48f', dur: 1.6}),
              D('M 1733 540 L 1760 540', {at: 'percent', width: 26, stroke: '#d4a017', dur: 0.4}),
              T('300,000 years ago', 260, 620, {size: 40, color: '#5b4632'}),
              T('today', 1740, 620, {size: 40, color: '#5b4632'}),
              T('98% of our story: no money at all', 860, 420, {at: 'ninety-eight', size: 62}),
              M(1748, 540, 1480, 260, 150, 7, {at: 'nobody'}),
            ],
          }),
          s('No coins.', {
            cam: [1.08, 960, 720],
            els: [I('obj_coin', 560, 820, 170, {at: 0}), T('no coins', 560, 960, {at: 0.2, size: 48})],
          }),
          s('No wages.', {els: [I('obj_tablet', 960, 820, 180, {at: 0}), T('no wages', 960, 960, {at: 0.2, size: 48})]}),
          s('No prices.', {els: [I('obj_scale', 1360, 820, 190, {at: 0}), T('no prices', 1360, 960, {at: 0.2, size: 48})]}),
          s('And yet, every single morning, people woke up and filled their day with something.', {
            scene: sc('intro-c', 'dawn'),
            cam: [1.12, 1100, 600],
            els: [
              I('obj_hut', 480, 590, 300, {depth: 0.92}),
              G('M 120 760 Q 420 220 900 170', {at: 'morning', dur: 3, color: '#ffd36b'}),
              I('obj_fire', 960, 800, 200, {at: 'morning'}),
              I('char_stand', 1380, 650, 520, {at: 'woke', anim: 'rise'}),
            ],
          }),
        ],
      },
      {
        id: 'p02',
        sentences: [
          s('So what were they doing?', {
            scene: sc('intro-d', 'savanna'),
            cam: [1.35, 960, 520],
            els: [I('char_think', 960, 760, 440, {anim: 'rise'})],
          }),
          s("By the end of this video, you'll know how they spent their hours, how they traded without money, and what they saved up instead of cash.", {
            cam: [0.97, 960, 540],
            els: [
              I('obj_fire', 400, 300, 170, {at: 'hours'}),
              T('how they spent their hours', 400, 440, {at: 'hours', size: 40, maxW: 420}),
              I('obj_necklace', 960, 230, 170, {at: 'traded'}),
              T('how they traded', 960, 360, {at: 'traded', size: 40}),
              I('obj_honeycomb', 1520, 300, 170, {at: 'saved'}),
              T('what they saved', 1520, 440, {at: 'saved', size: 40}),
            ],
          }),
        ],
      },
    ],
  },
  {
    id: 'ch1',
    title: 'How long did we live without money?',
    paragraphs: [
      {
        id: 'p03',
        sentences: [
          s("Let's start with the timeline.", {
            scene: sc('ch1-a', 'paper'),
            cam: [1.0, 960, 540],
            els: [header(1, 'How long did we live without money?'), D('M 200 640 L 1720 640', {width: 10, stroke: '#3a2c1e', dur: 1.8, at: 'timeline'})],
          }),
          s('The oldest known fossils of our species come from a site in Morocco called Jebel Irhoud.', {
            cam: [1.3, 520, 480],
            els: [I('obj_skull', 420, 440, 260, {at: 'fossils', anim: 'grow'}), T('Jebel Irhoud, Morocco', 420, 270, {at: 'Jebel', size: 46})],
          }),
          s("They're about three hundred thousand years old.", {
            cam: [1.04, 820, 580],
            els: [C(300000, 420, 730, {at: 'three', size: 56, suffix: ' years ago', dur: 1.6}), G('M 200 640 L 1720 640', {at: 'three', dur: 2.6, trail: false})],
          }),
          s("Now let's look for money.", {cam: [1.25, 1450, 600], els: [M(1700, 640, 1420, 360, 160, 8, {at: 'money'})]}),
          s('About four thousand one hundred years ago, in Mesopotamia, a law code was already setting fines in silver.', {
            scene: sc('ch1-b', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              T('Mesopotamia · about 4,100 years ago', 960, 150, {at: 'four', size: 56}),
              I('obj_scale', 680, 540, 380, {at: 'Mesopotamia', anim: 'grow'}),
              I('char_scribe', 1350, 590, 440, {at: 'law', anim: 'rise'}),
            ],
          }),
          s("Knock out another man's tooth, and you owed two shekels of silver.", {
            cam: [1.22, 760, 600],
            els: [T('a knocked-out tooth = 2 shekels of silver', 760, 860, {at: 'two', size: 50})],
          }),
          s('But a shekel back then was a weight, not a coin.', {
            cam: [1.0, 1100, 560],
            els: [
              I('obj_coin', 1560, 860, 140, {at: 'coin'}),
              D('M 1490 800 L 1630 920 M 1630 800 L 1490 920', {at: 'not', width: 8, stroke: '#9b3b2a', dur: 0.6}),
              T('a weight, not a coin', 1560, 980, {at: 'weight', size: 42}),
            ],
          }),
          s('You paid with measured lumps of metal.', {
            cam: [1.4, 680, 600],
            els: [G('M 520 640 Q 680 720 840 640', {at: 'measured', dur: 1.6, loop: true}), M(560, 640, 300, 300, 120, 2.6, {at: 'lumps'})],
          }),
        ],
      },
      {
        id: 'p04',
        sentences: [
          s('Real coins came much later.', {
            scene: sc('ch1-c', 'paper'),
            cam: [1.0, 960, 540],
            els: [I('obj_coin', 960, 520, 400, {anim: 'grow', at: 'coins'})],
          }),
          s('They appeared in Lydia, in what is now western Turkey, about two thousand six hundred years ago.', {
            cam: [1.08, 960, 560],
            els: [T('Lydia (western Turkey)', 960, 150, {at: 'Lydia', size: 58}), C(2600, 960, 860, {at: 'two', size: 64, suffix: ' years ago', dur: 1.5})],
          }),
          s("They were small lumps of electrum, a natural mix of gold and silver, stamped with a lion's head.", {
            cam: [1.0, 1100, 520],
            els: [T('electrum = gold + silver', 420, 520, {at: 'electrum', size: 48, maxW: 420}), M(960, 500, 1520, 400, 210, 2.0, {at: 'stamped'})],
          }),
          s('Now, squeeze all of human history into one day.', {
            scene: sc('ch1-d', 'paper'),
            cam: [0.96, 960, 560],
            els: [
              T('300,000 years squeezed into 1 day', 960, 110, {at: 'squeeze', size: 54}),
              K(1150, 590, 380, [
                {min: 20, label: 'silver prices: 20 min to midnight', at: 'twenty', ly: 300},
                {min: 12, label: 'coins: 12 min to midnight', at: 'twelve', ly: 200},
              ], {at: 'day'}),
            ],
          }),
          s('Silver prices show up about twenty minutes before midnight.', {cam: [1.25, 900, 360]}),
          s('Coins show up about twelve minutes before midnight.', {cam: [1.35, 980, 300]}),
          s('Everything else, the whole long day, happened without a single price tag.', {
            cam: [0.96, 960, 560],
            els: [G(ring(1150, 590, 380, 380), {at: 'Everything', dur: 4, trail: true})],
          }),
          s('So how did people get what they needed?', {
            scene: sc('ch1-e', 'savanna'),
            cam: [1.3, 960, 470],
            els: [I('char_think', 960, 650, 540, {anim: 'rise'})],
          }),
          s('Most of us learned the answer in school.', {cam: [1.05, 960, 480], els: [T('the school answer...', 960, 150, {at: 'school', size: 56})]}),
          s("It's called barter.", {els: [T('barter', 960, 260, {at: 'barter', size: 120, color: '#b5562c'})]}),
          s('But is it true?', {cam: [1.45, 960, 300], els: [T('?', 1210, 250, {at: 'true', size: 130, color: '#b5562c'})]}),
        ],
      },
    ],
  },
  {
    id: 'ch2',
    title: 'Did they really barter?',
    paragraphs: [
      {
        id: 'p05',
        sentences: [
          s("Here's the story from the textbooks.", {scene: sc('ch2-a', 'savanna'), cam: [1.0, 960, 540], els: [header(2, 'Did they really barter?')]}),
          s('One person has extra grain.', {
            cam: [1.15, 640, 580],
            els: [I('char_farmer', 480, 640, 540, {at: 'One', anim: 'rise'}), I('obj_grainjar', 780, 810, 200, {at: 'grain'})],
          }),
          s('Another has extra meat.', {cam: [1.15, 1300, 580], els: [I('char_carry', 1440, 640, 540, {at: 'Another', flip: true, anim: 'rise'})]}),
          s('They swap.', {
            cam: [1.0, 960, 540],
            els: [G('M 800 700 Q 980 420 1240 560', {at: 'swap', dur: 1.2}), G('M 1240 620 Q 1000 880 800 760', {at: 0.5, dur: 1.2})],
          }),
          s('Swapping is clumsy, so someday someone invents money to make it easier.', {
            cam: [0.98, 960, 520],
            els: [I('obj_coin', 960, 300, 170, {at: 'money', anim: 'grow'})],
          }),
          s("It's a neat story.", {cam: [1.18, 960, 420], els: [T('a neat story...', 960, 120, {at: 'neat', size: 56})]}),
          s('The problem is, nobody has ever found a society that actually worked this way.', {
            scene: sc('ch2-b', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              G('M 200 300 L 600 700 L 1000 300 L 1400 700 L 1750 300', {at: 'found', dur: 2.6, trail: true}),
              T('no society found that ran on barter', 960, 880, {at: 'nobody', size: 58}),
            ],
          }),
          s('In 1985, the Cambridge anthropologist Caroline Humphrey looked at the evidence.', {
            scene: sc('ch2-c', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              T('1985 · Caroline Humphrey, Cambridge', 960, 140, {at: '1985', size: 54}),
              D('M 1120 260 L 1520 260 L 1520 820 L 1120 820 Z', {at: 'looked', width: 6, dur: 1.2}),
              D('M 1170 360 L 1470 360 M 1170 440 L 1470 440 M 1170 520 L 1420 520 M 1170 600 L 1470 600 M 1170 680 L 1380 680', {at: 'evidence', width: 4, stroke: '#8a7660', dur: 1.2}),
              I('char_think', 620, 620, 440, {at: 'anthropologist'}),
            ],
          }),
          s('She wrote that no example of a pure barter economy had ever been described.', {
            cam: [1.25, 1250, 560],
            els: [T('no pure barter economy ever described', 1320, 930, {at: 'no', size: 46, maxW: 760})],
          }),
          s("Where barter does show up, it's usually between strangers, or between people who already know what money is.", {
            scene: sc('ch2-d', 'savanna'),
            cam: [1.0, 960, 540],
            els: [
              I('char_walk', 560, 640, 520, {at: 'strangers', anim: 'rise'}),
              I('char_bow', 1380, 640, 520, {at: 'strangers', flip: true, anim: 'rise'}),
              T('strangers', 960, 180, {at: 'strangers', size: 54}),
              I('obj_coin', 960, 380, 130, {at: 'money', anim: 'grow'}),
            ],
          }),
        ],
      },
      {
        id: 'p06',
        sentences: [
          s('Inside a small group, people did something different.', {
            scene: sc('ch2-e', 'savanna'),
            cam: [1.0, 960, 560],
            els: [I('obj_hut', 330, 560, 270, {depth: 0.92}), I('obj_fire', 960, 830, 170), I('char_laugh', 1520, 720, 400, {at: 'group'})],
          }),
          s('They gave.', {cam: [1.25, 800, 560], els: [I('char_gift', 760, 640, 520, {at: 'gave', anim: 'rise'})]}),
          s("If I find honey today, I share it, and I don't ask for anything back.", {
            cam: [1.0, 1100, 520],
            els: [I('obj_honeycomb', 1150, 300, 140, {at: 'honey', anim: 'grow'}), G('M 880 500 Q 1150 260 1450 560', {at: 'share', dur: 1.6, trail: true})],
          }),
          s('But everyone remembers.', {cam: [0.98, 960, 540], els: [T('everyone remembers', 960, 130, {at: 'remembers', size: 54})]}),
          s("This kept everyone fed even when one person's luck ran out.", {
            cam: [1.05, 1100, 560],
            els: [G(ring(960, 600, 520, 240), {at: 'fed', dur: 2.6, loop: true})],
          }),
          s('Next week, when you bring home meat, you share with me.', {
            scene: sc('ch2-f', 'savanna'),
            cam: [1.0, 960, 540],
            els: [
              T('next week...', 960, 130, {at: 'Next', size: 54}),
              I('char_gift', 520, 640, 520),
              I('char_carry', 1380, 640, 520, {at: 'meat', flip: true, anim: 'rise'}),
              G('M 1260 470 Q 950 240 640 470', {at: 'share', dur: 1.6, trail: true}),
            ],
          }),
          s('Anthropologists call this delayed reciprocity.', {
            scene: sc('ch2-g', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              T('delayed reciprocity', 960, 140, {at: 'delayed', size: 78}),
              I('char_gift', 480, 600, 380),
              I('char_carry', 1440, 600, 380, {flip: true}),
              D('M 640 440 Q 960 260 1280 440', {at: 'delayed', width: 6, dur: 1}),
              T('give now', 960, 300, {at: 'delayed', size: 40}),
              D('M 1280 760 Q 960 940 640 760', {at: 'reciprocity', width: 6, dur: 1, dash: true}),
              T('give back later', 960, 900, {at: 'reciprocity', size: 40}),
            ],
          }),
          s("It's less like a bill and more like a long, friendly memory.", {
            cam: [1.1, 960, 560],
            els: [G(ring(960, 600, 330, 220), {at: 'friendly', dur: 3, loop: true})],
          }),
          s('Exactly how money first appeared is still debated.', {
            cam: [0.97, 960, 560],
            els: [T('how money first appeared: still debated', 960, 1010, {at: 'debated', size: 40, color: '#7a6a58'})],
          }),
          s("But the picture of our ancestors haggling all day, one swap at a time, doesn't match what researchers have found.", {
            scene: sc('ch2-h', 'savanna'),
            cam: [1.0, 960, 540],
            els: [
              I('char_farmer', 620, 640, 500, {anim: 'rise'}),
              I('char_carry', 1300, 640, 500, {flip: true, anim: 'rise'}),
              T('haggling all day?', 960, 140, {at: 'haggling', size: 56}),
              D('M 360 330 L 1560 950 M 1560 330 L 360 950', {at: "doesn't", width: 10, stroke: '#9b3b2a', dur: 1}),
            ],
          }),
          s("So if they weren't trading all day, what did a normal day look like?", {
            cam: [0.9, 1100, 540],
            els: [T('so what did a normal day look like?', 960, 1010, {at: 'normal', size: 46})],
          }),
        ],
      },
    ],
  },
  {
    id: 'ch3',
    title: 'What did a normal day look like?',
    paragraphs: [
      {
        id: 'p07',
        sentences: [
          s("Here's the tricky part.", {scene: sc('ch3-a', 'paper'), cam: [1.0, 960, 540], els: [header(3, 'What did a normal day look like?')]}),
          s('For almost all of this time, nobody wrote anything down.', {
            cam: [1.15, 960, 540],
            els: [D('M 800 300 L 1120 300 L 1120 760 L 800 760 Z', {at: 'wrote', width: 6, dur: 1}), T('no diaries', 960, 860, {at: 'nobody', size: 52})],
          }),
          s('So scientists use two kinds of clues.', {
            scene: sc('ch3-b', 'paper'),
            cam: [1.0, 960, 540],
            els: [D('M 960 200 L 960 980', {at: 'two', width: 4, stroke: '#8a7660', dur: 1}), T('clue 1: what they left', 500, 180, {at: 'two', size: 46}), T('clue 2: living foragers', 1420, 180, {at: 'clues', size: 46})],
          }),
          s('The first is what people left behind, like tools, bones, hearths and beads.', {
            cam: [1.25, 520, 620],
            els: [
              I('obj_obsidian', 370, 480, 160, {at: 'tools', anim: 'grow'}),
              I('obj_skull', 650, 480, 170, {at: 'bones', anim: 'grow'}),
              I('obj_fire', 370, 760, 170, {at: 'hearths', anim: 'grow'}),
              I('obj_necklace', 650, 760, 170, {at: 'beads', anim: 'grow'}),
            ],
          }),
          s(`The second is careful study of people who lived mostly by foraging in the last hundred years, like the Hadza in Tanzania and the Ju/'hoansi in the Kalahari.`, {
            tts: `The second is careful study of people who lived mostly by foraging in the last hundred years, like the Hadza in Tanzania and the ${JU} in the Kalahari.`,
            cam: [1.25, 1400, 600],
            els: [
              I('char_dig', 1240, 560, 360, {at: 'foraging', anim: 'rise'}),
              I('char_bow', 1600, 560, 360, {at: 'Hadza', anim: 'rise'}),
              T('Hadza · Tanzania', 1420, 820, {at: 'Hadza', size: 42}),
              T("Ju/'hoansi · Kalahari", 1420, 890, {at: 'Kalahari', size: 42}),
            ],
          }),
          s('These people are not frozen in the past.', {cam: [1.0, 960, 560], els: [T('not frozen in the past', 1420, 970, {at: 'frozen', size: 42, color: '#b5562c'})]}),
          s('They have their own long histories.', {cam: [1.1, 1300, 620], els: [G('M 1020 1030 C 1250 940 1500 1060 1880 960', {at: 'long', dur: 2.2, trail: true})]}),
          s('But they show us what a day can look like with no money, no shops and no fields.', {
            scene: sc('ch3-c', 'savanna'),
            cam: [1.0, 960, 540],
            els: [
              I('obj_tree', 1520, 470, 520, {depth: 0.9}),
              I('obj_hut', 420, 580, 280, {depth: 0.95}),
              I('char_stand', 920, 650, 500, {anim: 'rise'}),
              T('no money', 520, 140, {at: 'money', size: 50}),
              T('no shops', 960, 140, {at: 'shops', size: 50}),
              T('no fields', 1400, 140, {at: 'fields', size: 50}),
            ],
          }),
        ],
      },
      {
        id: 'p08',
        sentences: [
          s('A day often started slowly, around the fire.', {
            scene: sc('ch3-d', 'dawn'),
            cam: [1.18, 960, 660],
            els: [
              G('M 100 760 Q 300 400 640 260', {at: 'started', dur: 3, color: '#ffd36b'}),
              I('obj_fire', 960, 820, 220, {at: 'fire'}),
              I('char_laugh', 600, 730, 380),
              I('char_baby', 1340, 650, 500, {at: 'slowly'}),
            ],
          }),
          s('A Hadza camp is small, usually around thirty people, living in simple grass huts.', {
            cam: [1.0, 960, 600],
            els: [I('obj_hut', 1560, 600, 220, {at: 'grass', anim: 'grow', depth: 0.94}), C(30, 960, 160, {at: 'thirty', size: 66, prefix: '≈ ', suffix: ' people', dur: 1})],
          }),
          s('Then small groups headed out.', {
            scene: sc('ch3-e', 'savanna'),
            cam: [1.0, 960, 560],
            els: [I('char_walk', 520, 640, 470, {drift: [26, 0], anim: 'rise'}), I('char_dig', 900, 660, 420, {at: 'groups', drift: [22, 0]})],
          }),
          s('Among the Hadza, women often went out together with their children to dig up tubers, pick berries and collect baobab fruit.', {
            scene: sc('ch3-f', 'savanna'),
            cam: [1.0, 960, 560],
            els: [
              I('obj_tree', 1560, 450, 520, {depth: 0.9}),
              I('char_dig', 700, 660, 480, {at: 'women', anim: 'rise'}),
              I('char_child', 1060, 700, 320, {at: 'children', anim: 'rise'}),
              I('obj_tubers', 400, 870, 150, {at: 'tubers', anim: 'grow'}),
              I('obj_baobab', 1440, 840, 160, {at: 'baobab', anim: 'grow'}),
            ],
          }),
          s('Men more often went alone or in pairs, carrying bows.', {
            scene: sc('ch3-g', 'savanna'),
            cam: [1.0, 900, 560],
            els: [
              I('obj_tree', 1680, 470, 560, {depth: 0.9}),
              I('char_bow', 760, 640, 520, {at: 'Men', drift: [18, 0], anim: 'rise', out: 'People'}),
              I('obj_bow', 1280, 830, 180, {at: 'bows', anim: 'grow', out: 'next'}),
            ],
          }),
          s('Some followed a small bird called the honeyguide.', {
            cam: [1.25, 1150, 420],
            els: [I('obj_honeyguide', 1220, 300, 150, {at: 'bird', float: true, anim: 'grow'})],
          }),
          s("Hadza hunters whistle to it, and the bird leads them to a wild bees' nest.", {
            cam: [1.05, 1350, 420],
            els: [G('M 1220 300 C 1400 180 1560 420 1700 330', {at: 'leads', dur: 2, trail: true}), I('obj_honeycomb', 1690, 330, 110, {at: 'nest', anim: 'grow'})],
          }),
          s('The people get the honey, and the bird gets the wax.', {
            cam: [1.0, 960, 540],
            els: [I('char_honey', 900, 640, 520, {at: 'people', anim: 'rise'}), T('honey for people · wax for the bird', 960, 130, {at: 'wax', size: 48})],
          }),
          s('Children joined in early.', {
            scene: sc('ch3-h', 'savanna'),
            cam: [1.2, 900, 600],
            els: [I('char_child', 800, 700, 360, {drift: [10, 0], anim: 'rise'}), I('obj_hut', 1620, 600, 200, {depth: 0.9})],
          }),
          s('Researchers who followed Hadza kids found that some gathered more food in a day than an adult needs, mostly fruit near camp.', {
            cam: [1.0, 960, 560],
            els: [
              I('obj_baobab', 1150, 840, 140, {at: 'gathered', anim: 'grow'}),
              I('obj_baobab', 1280, 860, 140, {at: 'more', anim: 'grow'}),
              I('obj_baobab', 1215, 760, 140, {at: 'day', anim: 'grow'}),
              T('sometimes more than an adult needs in a day', 960, 140, {at: 'adult', size: 48}),
              G('M 900 820 Q 1250 700 1560 640', {at: 'camp', dur: 1.6}),
            ],
          }),
          s('So how many hours did all of this actually take?', {
            cam: [0.95, 960, 520],
            els: [D('M 160 700 Q 960 -120 1760 700', {at: 'hours', width: 5, stroke: '#d4a017', dash: true, dur: 1.4}), T('how many hours?', 960, 330, {at: 'hours', size: 60})],
          }),
        ],
      },
    ],
  },
  {
    id: 'ch4',
    title: 'How many hours did they work?',
    paragraphs: [
      {
        id: 'p09',
        sentences: [
          s(`In the 1960s, the anthropologist Richard Lee measured how long Ju/'hoansi adults spent getting food.`, {
            tts: `In the nineteen sixties, the anthropologist Richard Lee measured how long ${JU} adults spent getting food.`,
            scene: sc('ch4-a', 'paper'),
            cam: [1.0, 960, 540],
            els: [header(4, 'How many hours did they work?'), T('1960s · Richard Lee', 520, 240, {at: 'Lee', size: 50}), I('char_dig', 520, 600, 420, {at: 'measured', anim: 'rise'}), I('obj_tubers', 800, 800, 140, {at: 'food', anim: 'grow'})],
          }),
          s('His answer was about twelve to nineteen hours a week.', {
            cam: [1.1, 1300, 520],
            els: [B(1020, 440, 700, 50, [{label: 'getting food', low: 12, value: 19, valueLabel: '12–19 h / week', at: 'twelve', color: '#d9a441'}])],
          }),
          s('Another anthropologist, Marshall Sahlins, used numbers like these to call foragers the original affluent society.', {
            cam: [1.0, 960, 560],
            els: [T('Marshall Sahlins', 1370, 700, {at: 'Sahlins', size: 46}), T('"the original affluent society"', 960, 900, {at: 'original', size: 64})],
          }),
          s('Rich, not because they had a lot, but because they needed little and had time to spare.', {
            scene: sc('ch4-b', 'savanna'),
            cam: [1.15, 960, 600],
            els: [I('char_laugh', 960, 730, 420, {anim: 'rise'}), I('obj_bow', 1340, 860, 130, {at: 'little'}), T('needed little · had time', 960, 150, {at: 'time', size: 54})],
          }),
        ],
      },
      {
        id: 'p10',
        sentences: [
          s('That idea became famous.', {
            scene: sc('ch4-c', 'paper'),
            cam: [1.0, 960, 540],
            els: [T('the original affluent society', 960, 170, {size: 60}), G('M 560 230 L 1360 230', {at: 'famous', dur: 1.2, trail: true})],
          }),
          s("It's also debated.", {els: [T('debated', 1560, 280, {at: 'debated', size: 56, rot: -8, color: '#9b3b2a'})]}),
          s('When Lee later counted the other work too, like making tools, cracking nuts and keeping camp, the total rose to about forty to forty-four hours a week.', {
            cam: [1.0, 960, 580],
            els: [
              I('obj_obsidian', 230, 480, 110, {at: 'tools', anim: 'grow'}),
              I('obj_hut', 230, 680, 130, {at: 'camp', anim: 'grow'}),
              B(420, 440, 1180, 50, [
                {label: 'food only', low: 12, value: 19, valueLabel: '12–19 h', at: 'counted', color: '#d9a441'},
                {label: 'all work counted', low: 40, value: 44, valueLabel: '40–44 h', at: 'forty', color: '#b5562c'},
              ]),
            ],
          }),
          s("That's close to a modern full-time job.", {
            cam: [1.12, 1100, 620],
            els: [B(420, 680, 1180, 50, [{label: 'modern full-time job', value: 40, valueLabel: '≈40 h', at: 'modern', color: '#8a9fb3'}])],
          }),
          s('Part of the gap is about definitions: is cracking nuts work, or is it sitting with friends?', {
            cam: [1.0, 960, 560],
            els: [T('what counts as work?', 960, 980, {at: 'definitions', size: 46, color: '#7a6a58'})],
          }),
          s('So which is it?', {cam: [0.95, 960, 560], els: [I('char_think', 1700, 830, 300, {at: 'which', anim: 'rise'})]}),
          s('A newer study helps.', {scene: sc('ch4-d', 'paper'), cam: [1.0, 960, 540], els: [T('a newer study', 960, 160, {at: 'newer', size: 58})]}),
          s('In the Philippines, researchers followed three hundred and fifty-nine Agta people through the day.', {
            cam: [1.05, 960, 560],
            els: [
              T('Agta · the Philippines', 960, 250, {at: 'Philippines', size: 50}),
              C(359, 960, 420, {at: 'three', size: 96, suffix: ' people', dur: 1.4}),
              I('char_walk', 620, 760, 340, {at: 'Agta', anim: 'rise'}),
              I('char_dig', 960, 780, 300, {at: 'Agta', anim: 'rise'}),
              I('char_child', 1300, 790, 260, {at: 'through', anim: 'rise'}),
            ],
          }),
          s('Agta who mostly foraged did about twenty hours of work outside camp each week.', {
            scene: sc('ch4-e', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              T('work outside camp, hours per week', 960, 160, {size: 48}),
              I('char_bow', 280, 420, 220, {at: 'foraged'}),
              B(440, 420, 1180, 40, [{label: 'mostly foraging', value: 20, valueLabel: '≈20 h', at: 'twenty', color: '#d9a441'}]),
            ],
          }),
          s('Agta who mostly farmed did about thirty.', {
            cam: [1.1, 1000, 560],
            els: [I('char_farmer', 280, 660, 220, {at: 'farmed'}), B(440, 660, 1180, 40, [{label: 'mostly farming', value: 30, valueLabel: '≈30 h', at: 'thirty', color: '#7f9a5a'}])],
          }),
        ],
      },
      {
        id: 'p11',
        sentences: [
          s("So here's the honest answer.", {scene: sc('ch4-f', 'savanna'), cam: [1.25, 960, 520], els: [I('char_stand', 960, 640, 520, {anim: 'rise', out: 'next'})]}),
          s('Foragers did work, and some of it was hard and dangerous.', {
            cam: [1.0, 960, 560],
            els: [I('char_bow', 560, 640, 500, {at: 'work', anim: 'rise', out: 'next'}), I('obj_antelope', 1420, 660, 260, {at: 'dangerous', anim: 'grow', out: 'next'})],
          }),
          s('But it came in bursts, and it was mixed in with talking, resting and being with family.', {
            els: [
              I('char_laugh', 520, 730, 400, {at: 'talking', anim: 'rise'}),
              I('char_sleep', 1000, 880, 200, {at: 'resting', anim: 'rise'}),
              I('char_baby', 1450, 650, 500, {at: 'family', anim: 'rise'}),
            ],
          }),
          s('Some days were long and hard, like a hunt that went on until dark. Other days were quiet.', {
            cam: [1.12, 1000, 620],
            els: [G('M 140 300 Q 960 -40 1780 300', {at: 'long', dur: 2.6, color: '#ffb35b'})],
          }),
          s('The line between work and the rest of life was blurry.', {
            scene: sc('ch4-g', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              T('work', 420, 540, {at: 'work', size: 70}),
              T('life', 1500, 540, {at: 'life', size: 70}),
              G('M 560 540 C 760 380 900 700 1060 540 S 1300 380 1400 540', {at: 'blurry', dur: 2.4, trail: true}),
            ],
          }),
          s('So what filled all those other hours?', {cam: [0.94, 960, 560], els: [T('what filled the other hours?', 960, 860, {at: 'filled', size: 52})]}),
        ],
      },
    ],
  },
  {
    id: 'ch5',
    title: 'What filled the rest of the day?',
    paragraphs: [
      {
        id: 'p12',
        sentences: [
          s("A lot of it looked like what we'd call hanging out.", {
            scene: sc('ch5-a', 'savanna'),
            cam: [1.0, 960, 540],
            els: [header(5, 'What filled the rest of the day?'), I('obj_tree', 1500, 460, 560, {depth: 0.9}), I('obj_hut', 380, 580, 260, {depth: 0.94}), I('char_laugh', 1450, 740, 380, {at: 'hanging', anim: 'rise'})],
          }),
          s('People sat in the shade and fixed things.', {cam: [1.18, 1080, 650], els: [I('char_hide', 820, 740, 360, {at: 'fixed', anim: 'rise'})]}),
          s('They straightened arrows, scraped hides, and rolled plant fibers into string.', {
            scene: sc('ch5-b', 'savanna'),
            cam: [1.0, 960, 560],
            els: [
              I('obj_bow', 400, 780, 200, {at: 'arrows', anim: 'grow'}),
              I('char_hide', 960, 720, 400, {at: 'scraped', anim: 'rise'}),
              I('char_string', 1500, 720, 400, {at: 'rolled', anim: 'rise'}),
              M(1500, 760, 1500, 300, 150, 2.2, {at: 'string'}),
            ],
          }),
          s('Babies were rarely alone.', {scene: sc('ch5-c', 'savanna'), cam: [1.3, 960, 520], els: [I('char_baby', 960, 650, 540, {anim: 'rise'})]}),
          s('Among the Hadza, researchers saw infants being held by grandmothers, older siblings and neighbors, not just by their mothers.', {
            cam: [1.0, 960, 560],
            els: [
              G(ring(960, 560, 640, 380), {at: 'held', dur: 4, loop: true}),
              T('grandmothers', 360, 250, {at: 'grandmothers', size: 48}),
              T('older siblings', 1560, 250, {at: 'siblings', size: 48}),
              T('neighbors', 1560, 880, {at: 'neighbors', size: 48}),
              T('mothers', 360, 880, {at: 'mothers', size: 48}),
            ],
          }),
          s('Kids played in mixed-age groups, and a lot of that play copied adult work.', {
            scene: sc('ch5-d', 'savanna'),
            cam: [1.0, 960, 560],
            els: [
              I('char_child', 760, 720, 360, {at: 'Kids', drift: [6, 0], anim: 'rise'}),
              I('char_child', 1120, 750, 280, {at: 'mixed', flip: true, anim: 'rise'}),
              I('char_bow', 1620, 640, 460, {at: 'adult', anim: 'rise', depth: 0.95}),
            ],
          }),
          s('Tiny bows.', {cam: [1.3, 760, 640], els: [M(820, 690, 380, 340, 150, 2.4, {at: 0, out: 'next'})]}),
          s('Little digging sticks.', {cam: [1.1, 600, 700], els: [I('char_dig', 330, 800, 300, {at: 0.1, anim: 'rise'})]}),
          s('Pretend hunts.', {
            cam: [1.0, 1100, 640],
            els: [I('obj_antelope', 1500, 860, 140, {at: 0, anim: 'grow'}), G('M 860 650 Q 1150 520 1450 820', {at: 'hunts', dur: 1.2})],
          }),
        ],
      },
      {
        id: 'p13',
        sentences: [
          s('And people talked.', {
            scene: sc('ch5-e', 'savanna'),
            cam: [1.0, 960, 560],
            els: [I('char_story', 700, 640, 520, {anim: 'rise'}), I('char_laugh', 1260, 730, 380, {at: 'talked', anim: 'rise'})],
          }),
          s('A lot.', {cam: [1.25, 760, 420], els: [D('M 860 330 q 30 -30 60 0 q 30 30 60 0 M 880 400 q 30 -30 60 0 q 30 30 60 0', {at: 0, width: 5, dur: 0.8, stroke: '#d4a017'})]}),
          s(`The anthropologist Polly Wiessner took notes on Ju/'hoansi conversations in the 1970s.`, {
            tts: `The anthropologist Polly Wiessner took notes on ${JU} conversations in the nineteen seventies.`,
            scene: sc('ch5-f', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              T('Polly Wiessner · 1970s', 760, 170, {at: 'Polly', size: 54}),
              D('M 520 280 L 1000 280 L 1000 900 L 520 900 Z', {at: 'notes', width: 6, dur: 1}),
              D('M 570 380 L 950 380 M 570 460 L 950 460 M 570 540 L 900 540 M 570 620 L 950 620 M 570 700 L 860 700 M 570 780 L 930 780', {at: 'conversations', width: 4, stroke: '#8a7660', dur: 1.4}),
              I('char_story', 1440, 620, 440, {at: 'conversations', anim: 'rise'}),
            ],
          }),
          s("During the day, about a third of the talk was complaints and criticism, often about someone who wasn't sharing or who was acting too proud.", {
            scene: sc('ch5-g', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              T('daytime talk', 640, 180, {size: 52}),
              P(640, 560, 250, 0.34, 'complaints & criticism · 34%', {at: 'third', color: '#b5562c'}),
              I('char_carry', 1420, 620, 440, {at: 'sharing', anim: 'rise'}),
              T('not sharing?', 1420, 300, {at: 'sharing', size: 46}),
              T('too proud?', 1420, 940, {at: 'proud', size: 46}),
            ],
          }),
          s('Joking was common too, about one in six daytime conversations.', {
            cam: [1.05, 900, 560],
            els: [P(640, 560, 250, 0.16, 'joking · 16%', {at: 'Joking', color: '#d9a441', out: 'next'})],
          }),
          s('In a group with no police and no boss, that talk did a job.', {
            scene: sc('ch5-h', 'savanna'),
            cam: [1.0, 960, 560],
            els: [I('obj_fire', 960, 830, 170), I('char_stand', 480, 640, 480, {anim: 'rise'}), I('char_think', 1440, 640, 480, {anim: 'rise', flip: true}), T('no police · no boss', 960, 140, {at: 'police', size: 54})],
          }),
          s('If you were stingy, everyone would hear about it by evening.', {
            cam: [1.05, 960, 560],
            els: [I('char_carry', 960, 600, 400, {at: 'stingy', anim: 'rise'}), G('M 600 420 Q 760 300 880 400', {at: 'hear', dur: 1}), G('M 1320 420 Q 1160 300 1040 400', {at: 'hear', dur: 1})],
          }),
          s('So daytime talk was about keeping the rules.', {cam: [0.96, 960, 540], els: [T('daytime talk = keeping the rules', 960, 1000, {at: 'rules', size: 48})]}),
          s('But something changed when the sun went down.', {
            scene: sc('ch5-i', 'dusk'),
            cam: [1.05, 960, 600],
            els: [G('M 1300 220 Q 1600 360 1760 720', {at: 'sun', dur: 2.6, color: '#ffb35b'}), I('obj_fire', 960, 820, 220, {at: 'changed'})],
          }),
        ],
      },
    ],
  },
  {
    id: 'ch6',
    title: 'What happened by the fire at night?',
    paragraphs: [
      {
        id: 'p14',
        sentences: [
          s("We're about halfway now.", {
            scene: sc('ch6-a', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              D('M 140 560 C 400 360 600 760 960 560 S 1520 360 1780 560', {width: 6, stroke: '#8a7660', dur: 1.4}),
              G('M 140 560 C 400 360 600 760 960 560', {at: 'halfway', dur: 2, trail: true}),
              T('halfway', 960, 660, {at: 'halfway', size: 52, color: '#b5562c'}),
            ],
          }),
          s("We've seen how long people lived without money, why barter is mostly a myth, and how the daylight hours went.", {
            cam: [1.15, 560, 540],
            els: [
              T('98% without money', 260, 380, {at: 'money', size: 38}),
              T('barter: mostly a myth', 520, 760, {at: 'barter', size: 38}),
              T('the daylight hours', 800, 380, {at: 'daylight', size: 38}),
            ],
          }),
          s('Still to come: what happened after dark, how people traded across huge distances, and what they saved instead of money.', {
            cam: [1.15, 1380, 540],
            els: [
              T('after dark', 1120, 760, {at: 'dark', size: 38}),
              T('trading far away', 1420, 380, {at: 'distances', size: 38}),
              T('what they saved', 1700, 700, {at: 'saved', size: 38}),
            ],
          }),
        ],
      },
      {
        id: 'p15',
        sentences: [
          s('After dark, Wiessner found, the talk around the fire changed.', {
            scene: sc('ch6-b', 'night'),
            cam: [1.0, 960, 580],
            els: [header(6, 'What happened by the fire at night?'), I('obj_fire', 960, 810, 240), I('char_story', 640, 640, 500, {at: 'talk', anim: 'rise'}), I('char_laugh', 1300, 730, 380, {at: 'fire', anim: 'rise'})],
          }),
          s('More than eighty percent of the night conversations she noted were stories.', {
            scene: sc('ch6-c', 'night'),
            cam: [1.0, 960, 540],
            els: [T('night talk', 640, 190, {size: 52, color: '#f3e7cf'}), P(640, 560, 250, 0.81, 'stories · 81%', {at: 'eighty', color: '#e0a64a'})],
          }),
          s('In daylight, stories made up only about six percent.', {
            els: [T('day talk', 1300, 190, {size: 52, color: '#f3e7cf', at: 'daylight'}), P(1300, 560, 250, 0.06, 'stories · 6%', {at: 'six', color: '#e0a64a'})],
          }),
          s('People told stories about hunts, about relatives in faraway camps, and about the spirit world.', {
            scene: sc('ch6-d', 'night'),
            cam: [1.0, 960, 560],
            els: [
              I('obj_fire', 960, 860, 170),
              I('char_story', 960, 620, 480, {anim: 'rise'}),
              I('obj_antelope', 420, 330, 180, {at: 'hunts', anim: 'grow', op: 0.9}),
              I('obj_hut', 1500, 320, 170, {at: 'relatives', anim: 'grow', op: 0.9}),
              G('M 960 260 C 1060 160 1160 260 1060 320 C 960 380 900 260 1000 200', {at: 'spirit', dur: 2.2, loop: true, color: '#c9d7ff'}),
            ],
          }),
          s('Firelight talk, Wiessner argued, helped people keep a picture of the wider world in their heads: who was related to whom, and who lived where.', {
            tts: 'Firelight talk, Wiessner argued, helped people keep a picture of the wider world in their heads. Who was related to whom, and who lived where.',
            cam: [0.98, 960, 520],
            els: [
              G('M 420 330 Q 700 160 960 220 Q 1240 160 1500 320', {at: 'picture', dur: 2.4, trail: true}),
              T('who is related to whom · who lives where', 960, 120, {at: 'related', size: 44, color: '#f3e7cf'}),
            ],
          }),
          s('There was singing and dancing too.', {
            cam: [1.12, 960, 560],
            els: [
              D('M 600 420 q 25 -40 50 0 t 50 0 t 50 0 M 1260 400 q 25 -40 50 0 t 50 0 t 50 0', {at: 'singing', width: 5, stroke: '#e0a64a', dur: 1}),
              I('char_child', 1480, 720, 300, {at: 'dancing', anim: 'rise'}),
            ],
          }),
          s('And the complaints of the day mostly faded away.', {
            cam: [0.96, 960, 560],
            els: [T('complaints', 960, 160, {at: 'complaints', out: 'faded', size: 50, color: '#f3e7cf'})],
          }),
        ],
      },
      {
        id: 'p16',
        sentences: [
          s("People didn't go to sleep at sunset, either.", {
            scene: sc('ch6-e', 'night'),
            cam: [1.0, 960, 560],
            els: [I('obj_hut', 460, 590, 280, {depth: 0.94}), I('obj_fire', 1120, 830, 180), I('char_laugh', 1480, 730, 360, {at: 'sleep', anim: 'rise'})],
          }),
          s('A study of three groups, including the Hadza and the San, found that people stayed up about three hours after dark.', {
            cam: [1.0, 960, 480],
            els: [
              D('M 300 240 L 1620 240', {at: 'study', width: 6, stroke: '#f3e7cf', dur: 1}),
              T('sunset', 300, 180, {at: 'study', size: 40, color: '#f3e7cf'}),
              G('M 300 240 L 900 240', {at: 'stayed', dur: 2, trail: true}),
              T('≈ 3 hours awake after dark', 900, 320, {at: 'three#2', size: 44, color: '#f3e7cf'}),
            ],
          }),
          s('They slept around six to seven hours a night, not much different from many of us.', {
            cam: [1.1, 1000, 640],
            els: [I('char_sleep', 1000, 900, 180, {at: 'slept', anim: 'rise'}), T('6–7 hours of sleep', 1300, 320, {at: 'six', size: 44, color: '#f3e7cf'})],
          }),
          s('Fire made all of this possible. Archaeologists see regular use of fire from at least about four hundred thousand years ago, and the earliest dates are still debated.', {
            scene: sc('ch6-f0', 'night'),
            cam: [1.15, 960, 640],
            els: [
              I('obj_fire', 960, 700, 380, {anim: 'grow'}),
              C(400000, 960, 180, {at: 'four', size: 64, suffix: '+ years of regular fire use', dur: 1.6}),
              T('earliest dates: still debated', 960, 1000, {at: 'debated', size: 40, color: '#f3e7cf'}),
            ],
          }),
          s('Those evening hours by the fire were when the group was bound together.', {
            scene: sc('ch6-f', 'night'),
            cam: [1.05, 960, 600],
            els: [
              I('obj_fire', 960, 830, 200),
              I('char_story', 560, 640, 460),
              I('char_laugh', 1360, 730, 360),
              I('char_baby', 960, 560, 360, {depth: 0.95}),
              G(ring(960, 680, 560, 260), {at: 'bound', dur: 3, loop: true}),
            ],
          }),
          s("But stories didn't only travel around one fire.", {
            cam: [1.0, 1150, 600],
            els: [I('obj_fire', 1780, 700, 90, {at: 'one', depth: 0.85}), G('M 1080 760 Q 1450 560 1760 690', {at: 'travel', dur: 1.8, trail: true})],
          }),
          s('Some things traveled a very long way.', {cam: [0.9, 1300, 560], els: [G('M 1080 820 Q 1500 980 1960 700', {at: 'long', dur: 2})]}),
          s('How?', {cam: [1.3, 1700, 640]}),
        ],
      },
    ],
  },
  {
    id: 'ch7',
    title: 'How did they trade with people far away?',
    paragraphs: [
      {
        id: 'p17',
        sentences: [
          s('At a site in Kenya called Olorgesailie, archaeologists found small, sharp tools made of obsidian, a black volcanic glass.', {
            tts: 'At a site in Kenya called Oh-lor-geh-sigh-lee, archaeologists found small, sharp tools made of obsidian, a black volcanic glass.',
            scene: sc('ch7-a', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              header(7, 'How did they trade with people far away?'),
              T('Olorgesailie, Kenya', 960, 210, {at: 'Kenya', size: 54}),
              I('obj_obsidian', 960, 560, 340, {at: 'tools', anim: 'grow'}),
              M(990, 470, 1500, 380, 170, 2.2, {at: 'volcanic'}),
            ],
          }),
          s('The tools are around three hundred thousand years old.', {cam: [1.05, 960, 640], els: [C(300000, 960, 880, {at: 'three', size: 60, suffix: ' years old', dur: 1.6})]}),
          s('And the obsidian came from at least twenty-five to fifty kilometers away.', {
            scene: sc('ch7-b', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              I('obj_hut', 480, 640, 150),
              T('the site', 480, 760, {size: 40}),
              I('obj_obsidian', 1460, 420, 120, {at: 'came', anim: 'grow'}),
              T('obsidian source', 1460, 520, {at: 'came', size: 40}),
              D('M 560 610 Q 1000 380 1400 440', {at: 'came', width: 5, dash: true, dur: 1.2}),
              G('M 1400 440 Q 1000 380 560 610', {at: 'kilometers', dur: 2}),
              T('25–50 km', 980, 360, {at: 'twenty-five', size: 64}),
            ],
          }),
          s('Did people walk that far to get it?', {cam: [1.15, 900, 640], els: [I('char_walk', 700, 760, 340, {at: 'walk', drift: [30, -8], anim: 'rise', out: 'next'})]}),
          s('Or did it pass from hand to hand between groups?', {
            cam: [1.0, 960, 600],
            els: [
              I('obj_hut', 780, 820, 100, {at: 'hand'}),
              I('obj_hut', 1040, 700, 100, {at: 'hand#2'}),
              I('obj_hut', 1280, 600, 100, {at: 'groups'}),
              G('M 1400 460 Q 1340 520 1280 600 Q 1160 640 1040 700 Q 900 760 780 820 Q 680 720 560 640', {at: 'pass', dur: 2.4}),
            ],
          }),
          s("We can't be sure.", {els: [T("we can't be sure", 960, 980, {at: 'sure', size: 48, color: '#7a6a58'})]}),
          s('But either way, people were reaching far beyond their own camp.', {cam: [0.86, 960, 560]}),
        ],
      },
      {
        id: 'p18',
        sentences: [
          s(`Among the Ju/'hoansi, we can see one way this works.`, {
            tts: `Among the ${JU}, we can see one way this works.`,
            scene: sc('ch7-c', 'savanna'),
            cam: [1.0, 960, 560],
            els: [I('char_gift', 640, 640, 520, {anim: 'rise'})],
          }),
          s('They had a custom called hxaro.', {tts: `They had a custom called ${HX}.`, cam: [1.05, 960, 480], els: [T('hxaro', 960, 170, {at: 'hxaro', size: 110, color: '#b5562c'})]}),
          s('You give someone a gift, like a bead necklace or an arrow.', {
            els: [I('char_stand', 1340, 640, 520, {at: 'someone', flip: true, anim: 'rise'}), I('obj_necklace', 990, 420, 140, {at: 'necklace', anim: 'grow'}), I('obj_bow', 990, 640, 120, {at: 'arrow', anim: 'grow'})],
          }),
          s('Later, they give you one back.', {cam: [1.0, 960, 560], els: [G('M 1260 470 Q 960 300 720 470', {at: 'back', dur: 1.4, trail: true})]}),
          s('Not right away, and never exactly equal.', {els: [T('not right away · never exactly equal', 960, 980, {at: 'never', size: 46})]}),
          s('Hxaro partners could live as far as two hundred kilometers apart.', {
            tts: `Hah-roh partners could live as far as two hundred kilometers apart.`,
            scene: sc('ch7-d', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              I('obj_hut', 360, 640, 170),
              I('obj_hut', 1560, 640, 170, {at: 'partners'}),
              D('M 470 600 Q 960 360 1450 600', {at: 'live', width: 5, dash: true, dur: 1.4}),
              T('up to about 200 km', 960, 380, {at: 'two', size: 60}),
              G('M 470 600 Q 960 360 1450 600', {at: 'apart', dur: 2}),
            ],
          }),
          s('In 1974, Wiessner found that about sixty-nine percent of the things people owned had come to them as hxaro gifts.', {
            tts: `In nineteen seventy-four, Wiessner found that about sixty-nine percent of the things people owned had come to them as ${HX} gifts.`,
            scene: sc('ch7-e', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              T('1974', 640, 170, {at: 'nineteen', size: 54}),
              P(640, 560, 250, 0.69, 'received as gifts · 69%', {at: 'sixty-nine', color: '#d9a441'}),
              I('obj_necklace', 1360, 360, 160, {at: 'things', anim: 'grow'}),
              I('obj_bow', 1360, 580, 150, {at: 'owned', anim: 'grow'}),
              I('obj_obsidian', 1360, 790, 110, {at: 'gifts', anim: 'grow'}),
            ],
          }),
        ],
      },
      {
        id: 'p19',
        sentences: [
          s("Here's why it mattered.", {scene: sc('ch7-f', 'dry'), cam: [1.1, 900, 560], els: [I('obj_tree', 1480, 480, 500, {depth: 0.9}), I('char_think', 760, 640, 500, {anim: 'rise', out: 'next'})]}),
          s('If the rain failed where you lived, you could go and stay with your hxaro partners for months.', {
            tts: `If the rain failed where you lived, you could go and stay with your ${HX} partners for months.`,
            cam: [1.0, 960, 560],
            els: [
              T('the rain failed', 760, 150, {at: 'rain', size: 50}),
              I('char_walk', 520, 650, 460, {at: 'go', drift: [38, 0], anim: 'rise'}),
              I('obj_hut', 1640, 600, 240, {at: 'partners', anim: 'grow'}),
              T('for months', 1640, 380, {at: 'months', size: 48}),
            ],
          }),
          s("The gift wasn't really about the necklace.", {scene: sc('ch7-g', 'paper'), cam: [1.15, 960, 540], els: [I('obj_necklace', 960, 520, 360, {at: 'gift', anim: 'grow'})]}),
          s('It was a promise that someone, somewhere, would take you in.', {
            cam: [1.0, 960, 540],
            els: [G(ring(960, 520, 270, 270), {at: 'promise', dur: 3, loop: true}), T('a promise', 960, 880, {at: 'promise', size: 60})],
          }),
          s('Researchers have described this as a kind of insurance, spread across a whole region.', {
            cam: [0.95, 960, 540],
            els: [T('a kind of insurance', 960, 140, {at: 'insurance', size: 56})],
          }),
          s('So why were beads so often the thing people gave?', {cam: [1.3, 1100, 520], els: [M(1050, 600, 1500, 300, 160, 2.4, {at: 'beads'})]}),
        ],
      },
    ],
  },
  {
    id: 'ch8',
    title: 'Why spend hours on beads, art and music?',
    paragraphs: [
      {
        id: 'p20',
        sentences: [
          s('Beads are some of the oldest signs of this kind of behavior.', {
            scene: sc('ch8-a', 'paper'),
            cam: [1.0, 960, 540],
            els: [header(8, 'Why spend hours on beads, art and music?'), I('obj_shellbead', 960, 540, 300, {at: 'Beads', anim: 'grow'})],
          }),
          s('In Bizmoune Cave in Morocco, archaeologists found shell beads that are at least one hundred and forty-two thousand years old, the oldest known.', {
            tts: 'In Biz-moon Cave in Morocco, archaeologists found shell beads that are at least one hundred and forty-two thousand years old, the oldest known.',
            cam: [1.04, 960, 580],
            els: [T('Bizmoune Cave, Morocco', 960, 200, {at: 'Cave', size: 54}), C(142000, 960, 860, {at: 'hundred', size: 60, suffix: '+ years old', dur: 1.8})],
          }),
          s('Some still had traces of red ochre.', {
            cam: [1.0, 1100, 540],
            els: [I('obj_ochre', 1500, 600, 170, {at: 'ochre', anim: 'grow'}), M(960, 560, 480, 360, 160, 2.4, {at: 'traces'})],
          }),
          s('People at Olorgesailie were already carrying red pigment, too.', {
            tts: 'People at Oh-lor-geh-sigh-lee were already carrying red pigment, too.',
            cam: [1.2, 1350, 600],
            els: [T('pigment at Olorgesailie too', 1450, 820, {at: 'pigment', size: 42})],
          }),
          s('Making beads takes time.', {scene: sc('ch8-b', 'savanna'), cam: [1.2, 960, 620], els: [I('char_bead', 960, 720, 480, {anim: 'rise'})]}),
          s('For an ostrich eggshell bead, you break off a small piece of shell, drill a hole with a stone point, then string it and grind the edges round.', {
            cam: [0.97, 960, 540],
            els: [
              I('obj_eggshell', 340, 220, 150, {at: 'break', anim: 'grow'}),
              T('1 · break', 340, 340, {at: 'break', size: 40}),
              M(960, 690, 760, 230, 110, 2.6, {at: 'drill'}),
              T('2 · drill', 760, 380, {at: 'drill', size: 40}),
              I('obj_necklace', 1180, 220, 140, {at: 'string', anim: 'grow'}),
              T('3 · string', 1180, 340, {at: 'string', size: 40}),
              I('obj_shellbead', 1580, 220, 120, {at: 'grind', anim: 'grow'}),
              T('4 · grind', 1580, 340, {at: 'grind', size: 40}),
            ],
          }),
          s('A whole necklace means many, many hours of careful work.', {
            scene: sc('ch8-c', 'paper'),
            cam: [1.05, 960, 540],
            els: [I('obj_necklace', 960, 520, 420, {anim: 'grow'}), G(ring(960, 520, 230, 230), {at: 'many', dur: 3, loop: true}), T('many hours of work', 960, 880, {at: 'hours', size: 56})],
          }),
        ],
      },
      {
        id: 'p21',
        sentences: [
          s('In 2022, two researchers compared more than fifteen hundred ostrich eggshell beads from across eastern and southern Africa.', {
            tts: 'In twenty twenty-two, two researchers compared more than fifteen hundred ostrich eggshell beads from across eastern and southern Africa.',
            scene: sc('ch8-d', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              T('a 2022 study', 520, 170, {at: 'twenty', size: 52}),
              C(1500, 520, 300, {at: 'fifteen', size: 60, suffix: '+ beads', dur: 1.4}),
              // simplified outline of Africa (east + south)
              D('M 980 140 C 1120 150 1230 210 1300 300 C 1380 330 1460 360 1500 420 C 1430 520 1380 600 1350 700 C 1320 800 1270 890 1190 960 C 1120 1010 1050 1000 1020 940 C 990 860 1000 780 960 700 C 920 620 870 580 820 520 C 760 470 700 420 720 340 C 760 240 860 160 980 140 Z', {at: 'Africa', width: 6, dur: 2, stroke: '#7a6a58'}),
            ],
          }),
          s('Between about fifty thousand and thirty-three thousand years ago, beads made three thousand kilometers apart were almost the same size and shape.', {
            cam: [1.1, 1120, 600],
            els: [
              T('50,000–33,000 years ago', 520, 440, {at: 'fifty', size: 46}),
              I('obj_necklace', 1330, 470, 110, {at: 'beads', anim: 'grow'}),
              I('obj_necklace', 1120, 900, 110, {at: 'beads', anim: 'grow'}),
              D('M 1320 520 Q 1300 720 1130 860', {at: 'three', width: 5, dash: true, dur: 1.2}),
              T('≈ 3,000 km', 1520, 720, {at: 'kilometers', size: 48}),
              T('almost identical', 520, 560, {at: 'same', size: 46}),
            ],
          }),
          s('They argue this points to a social network stretching across that distance.', {
            cam: [1.0, 960, 560],
            els: [G('M 1320 520 Q 1300 720 1130 860', {at: 'network', dur: 1.6, loop: true}), T('a social network', 520, 680, {at: 'social', size: 50})],
          }),
          s('Whether the beads themselves traveled, or only the know-how, is still debated.', {
            cam: [0.96, 960, 560],
            els: [T('beads or know-how? still debated', 520, 820, {at: 'debated', size: 42, color: '#7a6a58'})],
          }),
        ],
      },
      {
        id: 'p22',
        sentences: [
          s('People also made music.', {scene: sc('ch8-e', 'paper'), cam: [1.0, 960, 540], els: [IW('obj_flute', 960, 520, 900, {anim: 'grow'})]}),
          s('Flutes carved from bird bone and mammoth ivory, found in a German cave called Geissenklösterle, are around forty-two thousand years old.', {
            tts: 'Flutes carved from bird bone and mammoth ivory, found in a German cave called Geissen-klers-ter-leh, are around forty-two thousand years old.',
            cam: [1.04, 960, 560],
            els: [
              M(900, 520, 1500, 250, 150, 2.4, {at: 'carved'}),
              T('Geissenklösterle, Germany', 760, 200, {at: 'German', size: 52}),
              C(42000, 960, 860, {at: 'forty-two', size: 60, suffix: ' years old', dur: 1.4}),
            ],
          }),
          s("Beads, songs and stories don't fill your stomach.", {
            scene: sc('ch8-f', 'dusk'),
            cam: [1.0, 960, 560],
            els: [
              I('obj_necklace', 420, 360, 170, {at: 'Beads', anim: 'grow'}),
              D('M 860 320 q 25 -40 50 0 t 50 0 t 50 0 t 50 0', {at: 'songs', width: 6, stroke: '#e0a64a', dur: 1}),
              I('char_story', 1460, 640, 480, {at: 'stories', anim: 'rise'}),
            ],
          }),
          s('But they show who you are, and who you belong to.', {
            els: [
              I('char_stand', 960, 680, 420, {at: 'who', anim: 'rise'}),
              G('M 480 420 Q 700 520 880 560', {at: 'belong', dur: 1.2}),
              G('M 1360 520 Q 1200 560 1040 580', {at: 'belong', dur: 1.2}),
            ],
          }),
          s('In a world without money, that was a kind of wealth.', {cam: [1.08, 960, 520], els: [T('a kind of wealth', 960, 140, {at: 'wealth', size: 60})]}),
          s('So what did people actually own?', {cam: [1.35, 960, 520]}),
        ],
      },
    ],
  },
  {
    id: 'ch9',
    title: 'What did they own and save?',
    paragraphs: [
      {
        id: 'p23',
        sentences: [
          s('Not much.', {scene: sc('ch9-a', 'paper'), cam: [1.1, 960, 560], els: [header(9, 'What did they own and save?'), I('char_walk', 960, 620, 500, {anim: 'rise'})]}),
          s('People who move camp often can only own what they can carry.', {
            cam: [1.0, 960, 560],
            els: [G('M 300 930 Q 960 820 1620 930', {at: 'move', dur: 2, trail: true}), T('only what you can carry', 960, 1000, {at: 'carry', size: 48})],
          }),
          s('A bow, a digging stick, a bag, a few tools, and some ornaments.', {
            els: [
              I('obj_bow', 400, 300, 170, {at: 'bow', anim: 'grow'}),
              T('digging stick', 400, 560, {at: 'digging', size: 42}),
              M(900, 600, 1500, 300, 140, 2.2, {at: 'bag'}),
              I('obj_obsidian', 400, 780, 120, {at: 'tools', anim: 'grow'}),
              I('obj_necklace', 1520, 760, 150, {at: 'ornaments', anim: 'grow'}),
            ],
          }),
          s('And even what they owned was often given away again, passed along as gifts.', {
            cam: [1.0, 960, 560],
            els: [G('M 1520 760 Q 1700 520 1880 600', {at: 'given', dur: 1.4})],
          }),
          s('Big food was rarely private.', {scene: sc('ch9-b', 'savanna'), cam: [1.15, 960, 600], els: [I('obj_antelope', 1300, 650, 280, {at: 'Big', anim: 'grow', out: 'next'})]}),
          s("Among the Hadza, when a hunter brings home a large animal, he doesn't get to control who gets the meat.", {
            cam: [1.0, 960, 560],
            els: [I('char_carry', 760, 640, 520, {at: 'hunter', anim: 'rise'}), T("the hunter doesn't decide who gets it", 960, 140, {at: 'control', size: 50})],
          }),
          s("It's shared widely around camp.", {
            scene: sc('ch9-c', 'savanna'),
            cam: [1.0, 960, 580],
            els: [
              I('obj_fire', 960, 820, 180),
              I('char_carry', 960, 600, 360),
              I('char_laugh', 420, 740, 320, {anim: 'rise'}),
              I('char_baby', 1500, 650, 420, {anim: 'rise'}),
              I('char_child', 700, 830, 220, {anim: 'rise'}),
              I('char_stand', 1260, 780, 300, {anim: 'rise'}),
              G('M 960 600 Q 700 520 470 660', {at: 'shared', dur: 1.2}),
              G('M 960 600 Q 1200 500 1460 560', {at: 'shared', dur: 1.2}),
              G('M 960 640 Q 820 720 720 780', {at: 'widely', dur: 1.2}),
              G('M 960 640 Q 1120 700 1240 720', {at: 'widely', dur: 1.2}),
            ],
          }),
          s("And if you have more than you need and someone asks, you're expected to give.", {
            cam: [1.06, 960, 560],
            els: [T('if someone asks, you give', 960, 140, {at: 'expected', size: 52})],
          }),
        ],
      },
      {
        id: 'p24',
        sentences: [
          s('Why would anyone go along with this?', {scene: sc('ch9-d', 'savanna'), cam: [1.25, 960, 520], els: [I('char_think', 960, 640, 520, {anim: 'rise', out: 'next'})]}),
          s("Think about a hunter's luck.", {cam: [1.05, 960, 540], els: [I('char_bow', 960, 640, 520, {at: 'hunter', anim: 'rise'})]}),
          s('Even good hunters often come home with nothing for days.', {
            scene: sc('ch9-e', 'paper'),
            cam: [1.0, 960, 540],
            els: [
              D('M 180 400 L 380 400 L 380 640 L 180 640 Z M 410 400 L 610 400 L 610 640 L 410 640 Z M 640 400 L 840 400 L 840 640 L 640 640 Z M 870 400 L 1070 400 L 1070 640 L 870 640 Z M 1100 400 L 1300 400 L 1300 640 L 1100 640 Z M 1330 400 L 1530 400 L 1530 640 L 1330 640 Z M 1560 400 L 1760 400 L 1760 640 L 1560 640 Z', {at: 'Even', width: 5, dur: 1.6}),
              T('day after day...', 960, 300, {at: 'nothing', size: 50}),
              D('M 240 520 L 320 520 M 470 520 L 550 520 M 700 520 L 780 520 M 930 520 L 1010 520 M 1160 520 L 1240 520', {at: 'nothing', width: 6, stroke: '#9b3b2a', dur: 1.4}),
              I('obj_antelope', 1430, 520, 130, {at: 'days', anim: 'grow'}),
              T('(an illustration, not data)', 960, 760, {at: 'days', size: 32, color: '#8a7660'}),
            ],
          }),
          s('And without a fridge, a big animal spoils fast.', {
            cam: [1.15, 1300, 560],
            els: [T('no fridge', 1430, 860, {at: 'fridge', size: 52}), G('M 1350 420 q 30 -60 60 0 t 60 0', {at: 'spoils', dur: 1.4, color: '#9fb36b'})],
          }),
          s('So the safest place to keep extra meat was in your neighbors.', {
            scene: sc('ch9-f', 'savanna'),
            cam: [1.0, 960, 560],
            els: [
              I('char_carry', 960, 620, 460, {anim: 'rise'}),
              I('char_laugh', 420, 740, 340, {at: 'place'}),
              I('char_baby', 1500, 650, 440, {at: 'place'}),
              G('M 900 460 Q 640 380 470 600', {at: 'neighbors', dur: 1.2}),
              G('M 1020 460 Q 1280 380 1460 520', {at: 'neighbors', dur: 1.2}),
            ],
          }),
          s("Next time, they'd feed you.", {
            cam: [1.08, 960, 560],
            els: [G('M 470 600 Q 640 760 900 700', {at: 'feed', dur: 1.2}), G('M 1460 600 Q 1280 760 1020 700', {at: 'feed', dur: 1.2})],
          }),
          s("That's the answer to our opening question.", {
            scene: sc('ch9-g', 'paper'),
            cam: [1.0, 960, 540],
            els: [T('what did they save instead of money?', 960, 200, {at: 'answer', size: 56})],
          }),
          s('Before money, people did save.', {cam: [1.05, 960, 560]}),
          s('They saved favors, friendships and trust.', {
            els: [
              I('obj_honeycomb', 460, 520, 170, {at: 'favors', anim: 'grow'}),
              T('favors', 460, 680, {at: 'favors', size: 50}),
              I('obj_necklace', 960, 520, 170, {at: 'friendships', anim: 'grow'}),
              T('friendships', 960, 680, {at: 'friendships', size: 50}),
              I('char_gift', 1460, 500, 260, {at: 'trust', anim: 'grow'}),
              T('trust', 1460, 680, {at: 'trust', size: 50}),
            ],
          }),
          s('A good name was the closest thing to a bank account.', {cam: [1.0, 960, 600], els: [T('a good name ≈ a bank account', 960, 880, {at: 'bank', size: 58, color: '#b5562c'})]}),
        ],
      },
      {
        id: 'p25',
        sentences: [
          s("It wasn't a paradise.", {scene: sc('ch9-h', 'dry'), cam: [1.2, 960, 540], els: [I('char_think', 960, 640, 520, {anim: 'rise', out: 'next'})]}),
          s('Everyone knew your business, and the pressure to share could feel heavy.', {
            cam: [1.0, 960, 560],
            els: [
              I('char_carry', 960, 620, 460, {anim: 'rise'}),
              G('M 300 300 Q 600 360 840 480', {at: 'business', dur: 1}),
              G('M 1620 300 Q 1320 360 1080 480', {at: 'business', dur: 1}),
              T('pressure to share', 960, 140, {at: 'pressure', size: 52}),
            ],
          }),
          s('Life was risky too.', {cam: [1.0, 960, 560], els: [I('char_baby', 560, 650, 500, {at: 'Life', anim: 'rise'})]}),
          s('Studies of foraging groups suggest that close to half of all children died before they grew up.', {
            cam: [1.0, 1000, 560],
            els: [P(1350, 520, 220, 0.48, 'close to half of children died young', {at: 'half', color: '#8a7660'})],
          }),
          s('So if this system worked for so long, why did money take over?', {
            cam: [0.95, 960, 540],
            els: [I('obj_coin', 960, 220, 140, {at: 'money', anim: 'grow'})],
          }),
        ],
      },
    ],
  },
  {
    id: 'ch10',
    title: 'Why did money appear at all?',
    paragraphs: [
      {
        id: 'p26',
        sentences: [
          s('Things started to change when people began farming, about eleven thousand five hundred years ago in the Middle East, and later in other places.', {
            scene: sc('ch10-a', 'fields'),
            cam: [1.0, 960, 540],
            els: [
              header(10, 'Why did money appear at all?'),
              I('char_farmer', 640, 640, 520, {at: 'farming', anim: 'rise'}),
              C(11500, 1340, 300, {at: 'eleven', size: 66, suffix: ' years ago', dur: 1.6}),
              T('the Middle East first', 1340, 400, {at: 'Middle', size: 44}),
            ],
          }),
          s('Farming meant staying put and storing food.', {
            cam: [1.05, 1100, 620],
            els: [I('obj_hut', 1360, 620, 240, {at: 'staying', anim: 'grow'}), I('obj_grainjar', 1060, 820, 180, {at: 'storing', anim: 'grow'})],
          }),
          s('Stored grain can be counted, guarded and owed.', {
            scene: sc('ch10-b', 'paper'),
            cam: [1.0, 960, 540],
            els: [I('obj_grainjar', 960, 560, 380, {anim: 'grow'}), T('counted', 480, 360, {at: 'counted', size: 56}), T('guarded', 1440, 360, {at: 'guarded', size: 56}), T('owed', 960, 900, {at: 'owed', size: 56})],
          }),
          s('Villages grew into towns, and towns into cities.', {
            scene: sc('ch10-c', 'paper'),
            cam: [1.0, 960, 560],
            els: [
              I('obj_hut', 860, 640, 130, {at: 'Villages'}),
              I('obj_hut', 1000, 660, 130, {at: 'Villages'}),
              I('obj_hut', 930, 560, 110, {at: 'grew'}),
              I('obj_hut', 700, 620, 110, {at: 'towns'}),
              I('obj_hut', 1160, 620, 110, {at: 'towns'}),
              I('obj_hut', 780, 520, 100, {at: 'towns#2'}),
              I('obj_hut', 1080, 520, 100, {at: 'towns#2'}),
              I('obj_hut', 560, 560, 100, {at: 'cities'}),
              I('obj_hut', 1320, 560, 100, {at: 'cities'}),
              I('obj_hut', 640, 720, 110, {at: 'cities'}),
              I('obj_hut', 1250, 720, 110, {at: 'cities'}),
              I('obj_hut', 960, 460, 90, {at: 'cities'}),
            ],
          }),
          s('Soon you were dealing with people you might never see again.', {
            scene: sc('ch10-d', 'savanna'),
            cam: [1.0, 960, 560],
            els: [I('char_walk', 520, 640, 480, {drift: [20, 0], anim: 'rise'}), I('char_stand', 1400, 640, 480, {flip: true, at: 'people', anim: 'rise'}), T('strangers', 960, 150, {at: 'never', size: 56})],
          }),
          s("A favor only works if you'll meet that person again.", {cam: [1.05, 960, 520], els: [G(ring(960, 440, 520, 140), {at: 'favor', dur: 2.4, loop: true})]}),
          s('With strangers, you need something that keeps score on its own.', {cam: [1.15, 960, 440], els: [I('obj_coin', 960, 380, 190, {at: 'something', anim: 'grow'})]}),
        ],
      },
      {
        id: 'p27',
        sentences: [
          s("Coins made that easier still. A stamped coin carries a promise about its weight, so you don't need a scale every time you pay.", {
            cam: [1.0, 960, 520],
            els: [I('obj_scale', 1460, 560, 260, {at: 'weight', anim: 'grow', op: 0.85}), M(960, 380, 520, 360, 150, 2.2, {at: 'stamped'})],
          }),
          s('In Mesopotamia, some of the earliest writing we have, from about five thousand years ago, is mostly bookkeeping.', {
            scene: sc('ch10-e', 'paper'),
            cam: [1.0, 960, 540],
            els: [I('char_scribe', 1460, 620, 400, {at: 'Mesopotamia', anim: 'rise'}), I('obj_tablet', 820, 500, 360, {at: 'writing', anim: 'grow'}), T('Uruk, Mesopotamia · about 5,000 years ago', 960, 120, {at: 'five', size: 48}), T('mostly bookkeeping', 820, 760, {at: 'bookkeeping', size: 50})],
          }),
          s('Lists of grain, beer, animals and workers.', {
            cam: [1.05, 960, 640],
            els: [
              M(820, 500, 1460, 280, 140, 2.4, {at: 'Lists', out: 'next'}),
              I('obj_grainjar', 420, 900, 120, {at: 'grain'}),
              T('beer', 720, 900, {at: 'beer', size: 46}),
              I('obj_antelope', 1020, 900, 120, {at: 'animals'}),
              I('char_stand', 1320, 900, 150, {at: 'workers'}),
            ],
          }),
          s('Money grew up inside that world of records, debts and cities.', {
            cam: [1.0, 960, 540],
            els: [I('obj_coin', 1460, 300, 150, {at: 'Money', anim: 'grow'}), G('M 960 420 Q 1200 260 1400 300', {at: 'records', dur: 1.4})],
          }),
          s('Exactly how it happened is still debated by historians and economists.', {els: [T('how exactly? still debated', 960, 1010, {at: 'debated', size: 42, color: '#7a6a58'})]}),
        ],
      },
      {
        id: 'p28',
        sentences: [
          s("So let's go back to our one-day clock.", {
            scene: sc('ch10-f', 'paper'),
            cam: [1.0, 960, 540],
            els: [K(960, 560, 300, [{min: 20, label: 'money: the last few minutes', at: 'last', ly: 170}], {at: 'clock'})],
          }),
          s("For almost the whole day, people woke up, looked for food, fixed their tools, held each other's babies, complained about the neighbor who didn't share, and told stories by the fire.", {
            cam: [0.95, 960, 560],
            els: [
              G(ring(960, 560, 300, 300), {at: 'whole', dur: 5, trail: true}),
              I('char_stand', 420, 300, 220, {at: 'woke', anim: 'grow'}),
              I('char_dig', 360, 620, 220, {at: 'food', anim: 'grow'}),
              I('char_hide', 520, 900, 200, {at: 'fixed', anim: 'grow'}),
              I('char_baby', 1400, 900, 240, {at: 'babies', anim: 'grow'}),
              I('char_think', 1560, 620, 220, {at: 'complained', anim: 'grow'}),
              I('char_story', 1500, 300, 220, {at: 'stories', anim: 'grow'}),
            ],
          }),
          s('Their wealth was each other.', {
            els: [G('M 420 300 L 360 620 L 520 900 L 1400 900 L 1560 620 L 1500 300 Z', {at: 'wealth', dur: 3, trail: true})],
          }),
          s('Money only shows up in the last few minutes.', {cam: [1.3, 940, 360], els: [M(940, 262, 1420, 340, 160, 5, {at: 'minutes'})]}),
          s("That's what ancient humans did all day before money existed.", {
            scene: sc('ch10-g', 'dusk'),
            cam: [1.12, 960, 600],
            els: [I('obj_fire', 960, 820, 210), I('char_story', 600, 640, 480), I('char_laugh', 1330, 730, 360), I('char_baby', 1640, 650, 440, {depth: 0.95}), I('char_child', 280, 740, 280, {depth: 0.95})],
          }),
          s('They lived inside a web of people.', {
            cam: [1.0, 960, 580],
            els: [
              G('M 280 600 L 600 460 L 1330 560 L 1640 460', {at: 'web', dur: 2, trail: true}),
              G('M 600 460 L 960 700 L 1330 560', {at: 'people', dur: 1.6, trail: true}),
            ],
          }),
          s('In a way, we still do.', {cam: [0.9, 960, 560]}),
          s('Money just changed how we keep score.', {
            cam: [0.84, 960, 540],
            els: [I('obj_coin', 960, 250, 110, {at: 'Money', anim: 'grow'})],
          }),
        ],
      },
    ],
  },
];

// The fixed list of pictures used above (single cut-outs in /images).
export const imageIds = Array.from(
  new Set(
    chapters.flatMap((c) =>
      c.paragraphs.flatMap((p) => p.sentences.flatMap((sn) => (sn.els ?? []).filter((e) => e.t === 'img').map((e) => (e as {src: string}).src))),
    ),
  ),
);
