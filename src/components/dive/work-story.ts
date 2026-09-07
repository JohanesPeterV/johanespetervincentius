import { atom } from 'jotai';

export type WorkGesture = {
  distance: number;
  lastAt: number;
  consumed: boolean;
};

type WorkLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  modelX: number;
  modelY: number;
  modelWidth: number;
};

export const workChapterAtom = atom(0);
export const workStoryPosition = { current: 0 };

export const getWorkLayout = (width: number, height: number): WorkLayout => {
  if (width < 768 && height >= width) {
    const top = Math.max(160, height * 0.28);
    return {
      left: 24,
      top,
      width: width - 48,
      height: height - top - 88,
      modelX: width * 0.5,
      modelY: Math.min(128, height * 0.17),
      modelWidth: Math.min(width * 0.65, 300),
    };
  }
  const topInset = height < 500 ? 64 : 80;
  const availableHeight = height - topInset - 80;
  const panelHeight = Math.min(608, availableHeight);
  return {
    left: width * 0.5,
    top: topInset + (availableHeight - panelHeight) / 2,
    width: Math.min(width * 0.5 - 24, 760),
    height: panelHeight,
    modelX: width * 0.26,
    modelY: height * 0.46,
    modelWidth: Math.min(width * 0.39, 680),
  };
};

export const advanceWorkGesture = (
  gesture: WorkGesture,
  input: { delta: number; now: number },
): number => {
  if (input.now - gesture.lastAt > 180) {
    gesture.distance = 0;
    gesture.consumed = false;
  }
  gesture.lastAt = input.now;
  if (gesture.consumed) {
    return 0;
  }
  gesture.distance += input.delta;
  if (Math.abs(gesture.distance) < 48) {
    return 0;
  }
  // REASON: consume the complete trackpad gesture, including momentum, so
  // choosing one chapter never becomes an accidental tour of all employers.
  gesture.consumed = true;
  return Math.sign(gesture.distance);
};
