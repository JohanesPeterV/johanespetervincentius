import { PerspectiveCamera } from 'three';

import { createDescentFrame, DIVE_START, writeDescentFrame } from './descent';

export const createSpaceOrigin = (): PerspectiveCamera => {
  const frame = writeDescentFrame(createDescentFrame(), DIVE_START);
  const origin = new PerspectiveCamera();
  origin.position.fromArray(frame.position);
  origin.lookAt(...frame.look);
  return origin;
};
