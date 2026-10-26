import React, {useEffect, useState} from 'react';
import {Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {World} from './engine/World';
import {FPS} from './engine/timeline';

// Patrick Hand (SIL Open Font License) is bundled locally so renders never depend on the network.
const useFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const f = new FontFace('Patrick Hand', `url(${staticFile('fonts/PatrickHand.woff2')})`);
    f.load()
      .then((loaded) => {
        document.fonts.add(loaded);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const Main: React.FC<{from: number; audio: boolean}> = ({from, audio}) => {
  useFont();
  const frame = useCurrentFrame();
  const t = from + frame / FPS;
  return (
    <>
      <World t={t} />
      {audio && <Audio src={staticFile('narration.wav')} startFrom={Math.round(from * FPS)} />}
    </>
  );
};
