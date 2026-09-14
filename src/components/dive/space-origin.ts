import { PerspectiveCamera } from 'three';

import { DIVE_START } from './dive-sections';
import { createDescentFrame, writeDescentFrame } from './descent';

export const createSpaceOrigin = (): PerspectiveCamera => {
  const frame = writeDescentFrame(createDescentFrame(), DIVE_START);
  const origin = new PerspectiveCamera();
  origin.position.fromArray(frame.position);
  origin.lookAt(...frame.look);
  return origin;
};
