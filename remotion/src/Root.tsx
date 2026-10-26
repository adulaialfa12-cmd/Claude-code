import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {chapterRanges, FPS, H, total, W} from './engine/timeline';

// "Full" is the finished video. Each chapter also has its own composition (same world, same camera)
// so a chapter can be previewed or re-rendered on its own.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Full" component={Main} durationInFrames={Math.ceil(total * FPS)} fps={FPS} width={W} height={H} defaultProps={{from: 0, audio: true}} />
    {chapterRanges.map((c) => (
      <Composition
        key={c.id}
        id={`ch-${c.id}`}
        component={Main}
        durationInFrames={Math.ceil((c.e - c.s) * FPS)}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{from: c.s, audio: true}}
      />
    ))}
  </>
);
