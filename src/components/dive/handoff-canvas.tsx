'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';

export const HandoffCanvas = () => {
  const { gl, scene, camera } = useThree();

  // REASON: WebGL clears its drawing buffer after presentation. The DOM
  // capture requests a synchronous render before copying pixels, avoiding
  // preserveDrawingBuffer and continuous offscreen renders.
  useEffect(() => {
    const render = () => gl.render(scene, camera);
    gl.domElement.addEventListener('dive-canvas-capture', render);
    return () =>
      gl.domElement.removeEventListener('dive-canvas-capture', render);
  }, [gl, scene, camera]);

  useFrame(() => {
    gl.domElement.dispatchEvent(
      new Event('dive-canvas-change', { bubbles: true }),
    );
  });

  return null;
};
