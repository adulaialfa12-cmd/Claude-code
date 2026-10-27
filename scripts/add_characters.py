"""One-off pass: give every sentence a relevant on-screen character (host or a person the line mentions).
Adds elements to sentences in remotion/src/data/script.ts and swaps a few generic figures for specific ones.
Run once from the repo root: python3 scripts/add_characters.py"""
import re, sys
P = 'remotion/src/data/script.ts'
s = open(P).read()

def sentence_span(prefix):
    pats = [f"s('{prefix}", f's("{prefix}', f"s(`{prefix}"]
    hits = [s.find(p) for p in pats if s.find(p) >= 0]
    if len(hits) != 1:
        sys.exit(f'sentence not found uniquely: {prefix!r} {hits}')
    a = hits[0]
    b = s.find('\n          s(', a + 5)
    b2 = s.find('\n        ],', a + 5)  # end of paragraph
    b = min(x for x in (b, b2) if x > 0)
    return a, b

def add(prefix, *els):
    global s
    a, b = sentence_span(prefix)
    block = s[a:b]
    code = ', '.join(els)
    if 'els: [' in block:
        i = a + block.index('els: [') + len('els: [')
        s = s[:i] + code + ', ' + s[i:]
    else:
        m = re.search(r'cam: \[[^\]]*\]', block)
        if not m:
            sys.exit(f'no cam/els in {prefix!r}')
        i = a + m.end()
        s = s[:i] + f', els: [{code}]' + s[i:]

def rep(old, new):
    global s
    if s.count(old) != 1:
        sys.exit(f'replace target not unique ({s.count(old)}): {old[:70]!r}')
    s = s.replace(old, new)

H = lambda pose, x, y, h, **o: "I('host_%s', %d, %d, %d, {%s})" % (pose, x, y, h, ', '.join(f"{k}: {v}" for k, v in {'anim': "'rise'", **o}.items()))
CH = lambda iid, x, y, h, **o: "I('%s', %d, %d, %d, {%s})" % (iid, x, y, h, ', '.join(f"{k}: {v}" for k, v in {'anim': "'rise'", **o}.items()))

# ---- hook ----
add('That means for more than ninety-eight percent', H('surprised', 200, 830, 340, at="'ninety-eight'", out="'next'"))
add('No coins.', H('shrug', 200, 830, 340, at='0'))
# ---- ch1 ----
add("Let's start with the timeline.", H('point', 1700, 860, 340, at="'timeline'", out="'next'"))
add('The oldest known fossils', CH('char_archaeologist', 760, 470, 300, at="'fossils'"))
add("They're about three hundred thousand years old.", H('count', 1700, 860, 340, at="'three'", out="'next'"))
add("Now let's look for money.", H('point', 1700, 860, 340, at="'money'"))
add("Knock out another man's tooth", CH('char_meso_tooth', 230, 620, 360, at="'tooth'"), CH('char_meso_payer', 1050, 640, 340, at="'owed'"))
add('Real coins came much later.', H('point', 1680, 860, 300, at="'coins'", out="'next'"))
add('They appeared in Lydia', CH('char_lydian', 380, 620, 420, at="'Lydia'"))
rep("T('electrum = gold + silver', 420, 520, {at: 'electrum', size: 48, maxW: 420})", "T('electrum = gold + silver', 960, 975, {at: 'electrum', size: 44})")
add('Now, squeeze all of human history', H('point', 1720, 820, 360, at="'squeeze'", out="'next'"))
add('Silver prices show up', H('count', 1720, 820, 360, at="'twenty'", out="'next'"))
add('Coins show up about twelve', H('surprised', 1720, 820, 360, at="'twelve'", out="'next'"))
add('Everything else, the whole long day', H('point', 1720, 820, 360, at="'Everything'"))
# ---- ch2 ----
add("Here's the story from the textbooks.", H('point', 960, 640, 500, at='0.2', out="'next'"))
add('The problem is, nobody has ever found', H('shrug', 960, 560, 460, at="'nobody'"))
# ---- ch3 ----
add("Here's the tricky part.", H('point', 1500, 640, 460, at='0.1', out="'nobody'"))
add('For almost all of this time, nobody wrote', H('shrug', 1500, 640, 460, at="'nobody'"))
add('So scientists use two kinds of clues.', H('count', 1440, 600, 400, at="'two'", out="'second'"))
add('The first is what people left behind', CH('char_archaeologist', 830, 600, 240, at="'left'"))
rep("I('char_bow', 760, 640, 520, {at: 'Men', drift: [18, 0], anim: 'rise', out: 'People'})", "I('char_bow', 760, 640, 520, {at: 'Men', drift: [18, 0], anim: 'rise', out: 'whistle'})")
add('Hadza hunters whistle to it', CH('char_whistle', 900, 640, 480, at="'whistle'", out="'people'"))
add('Researchers who followed Hadza kids', CH('char_researcher', 400, 700, 380, at="'Researchers'"))
# ---- ch4 ----
add('That idea became famous.', H('point', 960, 640, 420, at="'famous'", out="'debated'"))
add("It's also debated.", H('shrug', 960, 640, 420, at="'debated'", out="'When'"))
add('A newer study helps.', CH('char_researcher', 960, 640, 460, at="'study'", out="'next'"))
rep("I('char_walk', 620, 760, 340, {at: 'Agta', anim: 'rise'})", "I('char_agta_forager', 620, 760, 340, {at: 'Agta', anim: 'rise'})")
rep("I('char_dig', 960, 780, 300, {at: 'Agta', anim: 'rise'})", "I('char_agta_farmer', 960, 780, 300, {at: 'Agta', anim: 'rise'})")
rep("I('char_child', 1300, 790, 260, {at: 'through', anim: 'rise'})", "I('char_researcher', 1300, 760, 320, {at: 'researchers', anim: 'rise'})")
rep("I('char_bow', 280, 420, 220, {at: 'foraged'})", "I('char_agta_forager', 280, 420, 220, {at: 'foraged'})")
rep("I('char_farmer', 280, 660, 220, {at: 'farmed'})", "I('char_agta_farmer', 280, 660, 220, {at: 'farmed'})")
add('The line between work and the rest of life', H('shrug', 960, 860, 300, at="'blurry'"))
rep("T('what filled the other hours?', 960, 860, {at: 'filled', size: 52})", "T('what filled the other hours?', 960, 160, {at: 'filled', size: 52})")
# ---- ch5 ----
add('Among the Hadza, researchers saw infants', CH('char_grandmother', 360, 560, 380, at="'grandmothers'"), CH('char_sister', 1560, 560, 380, at="'siblings'"))
rep("I('char_carry', 1420, 620, 440, {at: 'sharing', anim: 'rise'})", "I('char_stingy', 1420, 620, 440, {at: 'sharing', anim: 'rise'})")
rep("I('char_stand', 480, 640, 480, {anim: 'rise'}), I('char_think', 1440, 640, 480, {anim: 'rise', flip: true})", "I('char_stand', 480, 640, 480, {anim: 'rise', out: 'hear'}), I('char_think', 1440, 640, 480, {anim: 'rise', flip: true})")
rep("I('char_carry', 960, 600, 400, {at: 'stingy', anim: 'rise'})", "I('char_stingy', 960, 600, 400, {at: 'stingy', anim: 'rise'}), I('char_complain', 480, 640, 480, {at: 'hear', anim: 'rise'})")
add('But something changed when the sun went down.', CH('char_story', 600, 640, 460, at="'changed'"))
# ---- ch6 ----
add("We're about halfway now.", H('wave', 200, 880, 300, at='0.1'))
add('Still to come:', H('point', 1790, 900, 260, at="'Still'"))
add('More than eighty percent of the night', CH('char_story', 1700, 760, 360, at="'stories'"))
rep("I('char_child', 1480, 720, 300, {at: 'dancing', anim: 'rise'})", "I('char_dance', 1480, 720, 330, {at: 'dancing', anim: 'rise'})")
add('A study of three groups', CH('char_researcher', 1650, 760, 320, at="'study'"))
add('Fire made all of this possible.', CH('char_archaeologist', 1550, 760, 300, at="'Archaeologists'"))
# ---- ch7 ----
add('At a site in Kenya called Olorgesailie', CH('char_archaeologist', 420, 640, 380, at="'archaeologists'"))
rep("C(300000, 960, 880, {at: 'three', size: 60, suffix: ' years old', dur: 1.6})", "C(300000, 960, 800, {at: 'three', size: 60, suffix: ' years old', dur: 1.6})")
add('And the obsidian came from at least', H('point', 1700, 820, 320, at="'kilometers'", out="'sure'"))
add("We can't be sure.", H('shrug', 1700, 820, 320, at="'sure'", out="'next'"))
add('But either way, people were reaching', H('point', 1700, 820, 320, at='0.1'))
add('Hxaro partners could live as far as', CH('char_walk', 700, 780, 300, at="'partners'", drift='[60, 0]'))
add("The gift wasn't really about the necklace.", CH('char_gift', 420, 600, 460, at="'gift'"))
add('Researchers have described this as a kind of insurance', CH('char_scholars', 1550, 700, 380, at="'Researchers'"))
# ---- ch8 ----
add('Beads are some of the oldest signs', H('point', 380, 760, 340, at="'oldest'", out="'archaeologists'"))
add('In Bizmoune Cave in Morocco', CH('char_archaeologist', 380, 760, 340, at="'archaeologists'"))
add('A whole necklace means many', CH('char_bead', 1620, 700, 380, at="'careful'"))
add('Between about fifty thousand and thirty-three', H('count', 150, 900, 240, at="'fifty'", out="'debated'"))
add('Whether the beads themselves traveled', H('shrug', 150, 900, 240, at="'debated'"))
add('People also made music.', CH('char_dance', 1650, 760, 360, at="'music'"))
add('Flutes carved from bird bone', CH('char_archaeologist', 300, 760, 340, at="'found'"))
# ---- ch9 ----
add('Big food was rarely private.', CH('char_bow', 700, 640, 480, at="'food'", out="'next'"))
add('Even good hunters often come home', CH('char_tired_hunter', 600, 860, 300, at="'hunters'", drift='[20, 0]'))
add("That's the answer to our opening question.", H('point', 960, 560, 420, at="'answer'", out="'next'"))
add('Before money, people did save.', H('count', 960, 560, 420, at="'save'", out="'favors'"))
# ---- ch10 ----
add('Stored grain can be counted', CH('char_farmer', 1600, 700, 420, at="'guarded'"))
add('Villages grew into towns', CH('char_farmer', 250, 820, 300, at="'Villages'"), CH('char_meso_worker', 1650, 820, 300, at="'cities'", drift='[-20, 0]'))
rep("I('char_stand', 1400, 640, 480, {flip: true, at: 'people', anim: 'rise'})", "I('char_meso_merchant', 1400, 640, 480, {flip: true, at: 'people', anim: 'rise'})")
rep("I('char_stand', 1320, 900, 150, {at: 'workers'})", "I('char_meso_worker', 1320, 880, 170, {at: 'workers'})")
add('Exactly how it happened is still debated by historians', CH('char_scholars', 260, 560, 300, at="'historians'"))
add("So let's go back to our one-day clock.", H('point', 1700, 860, 300, at="'clock'", out="'whole'"))
add('In a way, we still do.', H('wave', 960, 520, 300, at="'way'"))
open(P, 'w').write(s)
print('ok')
