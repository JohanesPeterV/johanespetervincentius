import type { MotionMode } from './descent';
import { drawLoadingStar } from './loading-star';
import type { LoadingFrame } from './loading-star';

export type LoadingStarMessage = {
  canvas?: OffscreenCanvas;
  frame: Omit<LoadingFrame, 'time'>;
  dpr: number;
  motionMode: MotionMode;
  exiting: boolean;
};

let canvas: OffscreenCanvas | undefined;
let context: OffscreenCanvasRenderingContext2D | null = null;
let state: LoadingStarMessage;
let animation = 0;
const started = performance.now();

const render = (now: number): void => {
  if (!context) {
    return;
  }
  drawLoadingStar(context, {
    ...state.frame,
    time: state.motionMode === 'reduced' ? 0 : (now - started) / 1000,
  });
  if (state.motionMode === 'full' && !state.exiting) {
    animation = requestAnimationFrame(render);
  }
};

self.onmessage = ({ data }: MessageEvent<LoadingStarMessage>): void => {
  state = data;
  if (data.canvas) {
    canvas = data.canvas;
    context = canvas.getContext('2d');
    if (!context) {
      throw new Error('The loading scene could not create its canvas.');
    }
  }
  if (!canvas || !context) {
    throw new Error('The loading scene received an update before its canvas.');
  }
  const width = Math.round(data.frame.width * data.dpr);
  const height = Math.round(data.frame.height * data.dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    context.setTransform(data.dpr, 0, 0, data.dpr, 0, 0);
  }
  if (data.exiting) {
    cancelAnimationFrame(animation);
    return;
  }
  // REASON: full motion keeps its own loop alive, so only the arriving canvas
  // starts it; reduced motion instead draws one frame per update.
  if (data.canvas || data.motionMode === 'reduced') {
    cancelAnimationFrame(animation);
    animation = requestAnimationFrame(render);
  }
};
