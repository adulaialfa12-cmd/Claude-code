"""Join the per-paragraph narration into one track with natural pauses, and write word timings.

Inputs : audio/raw/pXX.mp3 (one ElevenLabs take per paragraph), audio/paragraphs.json (from remotion/scripts/export.ts)
Outputs: audio/narration.wav (48 kHz mono, loudness-normalised)
         remotion/public/narration.wav (copy used by the render)
         remotion/src/data/timings.json (sentence + word times in the final track)

Run from the repo root:  python3 scripts/build_audio.py
"""
import json, os, subprocess, sys
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from align import align, norm_words  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
GAP_SENTENCE = 0.35   # extra silence added between sentences
GAP_PARAGRAPH = 0.60  # extra silence added between paragraphs
GAP_CHAPTER = 1.00    # extra silence when a new chapter starts
LEAD_IN = 0.6         # quiet before the first word
TAIL = 2.5            # room at the end for the last camera move

def decode(path, sr):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()

def main():
    paras = json.load(open(os.path.join(ROOT, 'audio/paragraphs.json')))
    ov_path = os.path.join(ROOT, 'audio/align_overrides.json')
    overrides = json.load(open(ov_path)) if os.path.exists(ov_path) else {}
    tmp = os.path.join(ROOT, 'audio/.work'); os.makedirs(tmp, exist_ok=True)
    out = [np.zeros(int(LEAD_IN * SR), np.float32)]
    t = LEAD_IN
    sentences, chapters = [], []
    prev_chapter = None
    report = []
    for pi, p in enumerate(paras):
        mp3 = os.path.join(ROOT, f"audio/raw/{p['id']}.mp3")
        wav16 = os.path.join(tmp, f"{p['id']}_16k.wav")
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ar', '16000', '-ac', '1', '-sample_fmt', 's16', wav16], check=True)
        sent_tokens = [norm_words(s['tts']) for s in p['sentences']]
        if p['id'] in overrides:
            words = align_chunks(wav16, [s['tts'] for s in p['sentences']], overrides[p['id']], tmp)
        else:
            words = align(wav16, p['tts'])
        expected = sum(len(x) for x in sent_tokens)
        if len(words) != expected:
            raise SystemExit(f"{p['id']}: aligner returned {len(words)} words, expected {expected}")
        audio = decode(mp3, SR)
        # chapter break
        if prev_chapter is not None and p['chapter'] != prev_chapter:
            pad = GAP_CHAPTER - GAP_PARAGRAPH
            out.append(np.zeros(int(pad * SR), np.float32)); t += pad
        if p['chapter'] != prev_chapter:
            chapters.append({'id': p['chapter'], 's': round(t, 3)})
            prev_chapter = p['chapter']
        # split this paragraph at the middle of each gap between sentences
        idx = 0
        bounds = []  # (start_sec, end_sec) of each sentence slice inside the clip
        spans = []
        for toks in sent_tokens:
            ws = words[idx: idx + len(toks)]; idx += len(toks)
            spans.append(ws)
        cuts = [0.0]
        for a, b in zip(spans[:-1], spans[1:]):
            cuts.append((a[-1]['e'] + b[0]['s']) / 2)
        cuts.append(len(audio) / SR)
        for si, ws in enumerate(spans):
            c0, c1 = cuts[si], cuts[si + 1]
            seg = audio[int(c0 * SR): int(c1 * SR)]
            # short fades at the cut points so joins are click-free
            n = min(len(seg) // 4, int(0.01 * SR))
            if n > 0:
                seg[:n] *= np.linspace(0, 1, n, dtype=np.float32); seg[-n:] *= np.linspace(1, 0, n, dtype=np.float32)
            offset = t - c0
            sentences.append({
                'p': p['id'], 'text': p['sentences'][si]['text'],
                's': round(ws[0]['s'] + offset, 3), 'e': round(ws[-1]['e'] + offset, 3),
                'words': [{'w': re_clean(w['w']), 's': round(w['s'] + offset, 3), 'e': round(w['e'] + offset, 3)} for w in ws],
            })
            out.append(seg); t += len(seg) / SR
            if si < len(spans) - 1:
                out.append(np.zeros(int(GAP_SENTENCE * SR), np.float32)); t += GAP_SENTENCE
        if pi < len(paras) - 1:
            out.append(np.zeros(int(GAP_PARAGRAPH * SR), np.float32)); t += GAP_PARAGRAPH
        report.append(f"{p['id']}: {len(words)} words aligned, clip {len(audio)/SR:.2f}s")
    out.append(np.zeros(int(TAIL * SR), np.float32)); t += TAIL
    track = np.concatenate(out)
    raw_path = os.path.join(tmp, 'narration_raw.f32')
    track.astype(np.float32).tofile(raw_path)
    final = os.path.join(ROOT, 'audio/narration.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', raw_path,
                    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', str(SR), '-c:a', 'pcm_s16le', final], check=True)
    os.makedirs(os.path.join(ROOT, 'remotion/public'), exist_ok=True)
    subprocess.run(['cp', final, os.path.join(ROOT, 'remotion/public/narration.wav')], check=True)
    for i, c in enumerate(chapters):
        c['e'] = chapters[i + 1]['s'] if i + 1 < len(chapters) else round(t, 3)
    timings = {'fps': 60, 'total': round(t, 3), 'sentences': [
        {'s': s['s'], 'e': s['e'], 'words': s['words']} for s in sentences], 'chapters': chapters}
    json.dump(timings, open(os.path.join(ROOT, 'remotion/src/data/timings.json'), 'w'))
    json.dump(sentences, open(os.path.join(ROOT, 'audio/word_timings.json'), 'w'), indent=1)
    print('\n'.join(report))
    print(f"total {t:.2f}s = {t/60:.2f} min, {len(sentences)} sentences, chapters:",
          ', '.join(f"{c['id']}@{c['s']:.1f}" for c in chapters))

def align_chunks(wav16, sentence_texts, cut_points, tmp):
    # For clips the aligner can't do in one go: cut at known pauses (one per sentence boundary)
    # and align each sentence on its own, then shift the times back.
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav16],
                               capture_output=True, text=True, check=True).stdout)
    edges = [0.0] + list(cut_points) + [dur]
    words = []
    for i, text in enumerate(sentence_texts):
        part = os.path.join(tmp, f'chunk_{i}.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav16, '-ss', str(edges[i]), '-to', str(edges[i + 1]), part], check=True)
        for w in align(part, text):
            words.append({'w': w['w'], 's': w['s'] + edges[i], 'e': w['e'] + edges[i]})
    return words

def re_clean(w):
    # pocketsphinx marks alternate pronunciations like "our(3)"
    return w.split('(')[0]

if __name__ == '__main__':
    main()
