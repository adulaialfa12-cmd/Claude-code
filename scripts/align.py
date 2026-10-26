"""Force-align a narration clip to its known text with pocketsphinx (offline).
Usage: python3 scripts/align.py audio.wav "text..."  -> prints JSON list of {w,s,e}
Words the dictionary does not know are spelled out by grapheme guess, so names still align."""
import json, re, sys, wave
from pocketsphinx import Decoder, get_model_path
import os

NUMBERS = {'1985': 'nineteen eighty five'}

# pronunciations for names and words missing from the CMU dictionary
EXTRA = {
    'jebel': 'JH EH B AH L', 'irhoud': 'IH R HH UW D', 'electrum': 'IH L EH K T R AH M',
    'twa': 'T W AA', 'hadza': 'HH AA D Z AH', 'kalahari': 'K AA L AH HH AA R IY',
    'honeyguide': 'HH AH N IY G AY D', 'baobab': 'B EY OW B AE B', 'sahlins': 'S AA L IH N Z',
    'foragers': 'F AO R IH JH ER Z', 'agta': 'AA G T AH', 'foraged': 'F AO R IH JH D',
    'firelight': 'F AY ER L AY T', 'geh': 'G EH', 'geissen': 'G AY S AH N', 'klers': 'K L ER S',
}

def norm_words(text):
    t = text.lower().replace("’", "'")
    for k, v in NUMBERS.items():
        t = t.replace(k, v)
    t = re.sub(r"[^a-z0-9' -]", " ", t).replace("-", " ")
    return [w.strip("'") for w in t.split() if w.strip("'")]

def align(wav_path, text):
    # long clips sometimes fall outside the default search beam; widen it and retry
    for beams in ({}, {'beam': 1e-80, 'wbeam': 1e-60, 'pbeam': 1e-80}, {'beam': 1e-120, 'wbeam': 1e-100, 'pbeam': 1e-120}):
        try:
            return _align(wav_path, text, beams)
        except RuntimeError:
            continue
    raise RuntimeError(f'alignment failed for {wav_path}')

def _align(wav_path, text, beams):
    mp = get_model_path()
    words = norm_words(text)
    dec = Decoder(hmm=os.path.join(mp, 'en-us', 'en-us'), dict=os.path.join(mp, 'en-us', 'cmudict-en-us.dict'), loglevel='FATAL', **beams)
    # add unknown words with a crude letter-to-phone guess so alignment can proceed
    for w in set(words):
        if dec.lookup_word(w) is None:
            dec.add_word(w, guess_phones(w), True)
    dec.set_align_text(" ".join(words))
    with wave.open(wav_path, 'rb') as wf:
        data = wf.readframes(wf.getnframes())
    dec.start_utt(); dec.process_raw(data, full_utt=True); dec.end_utt()
    # first pass: word-level segmentation of the known text
    first = [{'w': sg.word, 's': sg.start_frame / 100.0, 'e': (sg.end_frame + 1) / 100.0}
             for sg in dec.seg() if sg.word not in ('<sil>', '<s>', '</s>', '[NOISE]') and not sg.word.startswith('+')]
    try:
        dec.set_alignment(); dec.start_utt(); dec.process_raw(data, full_utt=True); dec.end_utt()
    except RuntimeError:
        if len(first) == len(words):
            return first
        raise
    out = []
    for seg in dec.get_alignment():
        if seg.name in ('<sil>', '<s>', '</s>') or seg.name.startswith('+'):
            continue
        out.append({'w': seg.name, 's': seg.start / 100.0, 'e': (seg.start + seg.duration) / 100.0})
    return out

L2P = {'a':'AE','b':'B','c':'K','d':'D','e':'EH','f':'F','g':'G','h':'HH','i':'IH','j':'JH','k':'K','l':'L','m':'M','n':'N','o':'AA','p':'P','q':'K','r':'R','s':'S','t':'T','u':'AH','v':'V','w':'W','x':'K S','y':'Y','z':'Z',"'":''}
def guess_phones(w):
    if w in EXTRA:
        return EXTRA[w]
    if w.isdigit():
        return 'N AH M B ER'
    ph = [L2P.get(c, '') for c in w]
    return ' '.join(p for p in ph if p) or 'AH'

if __name__ == '__main__':
    print(json.dumps(align(sys.argv[1], sys.argv[2])))
