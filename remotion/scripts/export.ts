// Exports the narration for the voice step: one entry per paragraph, with the sentence texts.
import {writeFileSync} from 'node:fs';
import {chapters} from '../src/data/script';

const paragraphs = chapters.flatMap((c) =>
  c.paragraphs.map((p) => ({
    id: p.id,
    chapter: c.id,
    sentences: p.sentences.map((s) => ({text: s.text, tts: s.tts ?? s.text})),
    tts: p.sentences.map((s) => s.tts ?? s.text).join(' '),
  })),
);
writeFileSync('../audio/paragraphs.json', JSON.stringify(paragraphs, null, 2));
const words = paragraphs.flatMap((p) => p.sentences.map((s) => s.text)).join(' ').split(/\s+/).filter(Boolean).length;
const sentences = paragraphs.reduce((n, p) => n + p.sentences.length, 0);
console.log({paragraphs: paragraphs.length, sentences, words, minutesAt145wpm: +(words / 145).toFixed(1)});
