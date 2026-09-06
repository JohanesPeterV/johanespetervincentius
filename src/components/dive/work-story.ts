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

export const getWorkLayout = (width: number, height: number): WorkLayout => {
  if (width < 768) {
    const top = Math.max(196, height * 0.28);
    return {
      left: 24,
      top,
      width: width - 48,
      height: height - top - 88,
      modelX: width * 0.5,
      modelY: Math.min(128, height * 0.18),
      modelWidth: Math.min(width * 0.65, 300),
    };
  }
  const panelHeight = Math.min(608, height - 160);
  return {
    left: width * 0.54,
    top: Math.max(80, (height - panelHeight) / 2),
    width: Math.min(width * 0.4, 560),
    height: panelHeight,
    modelX: width * 0.275,
    modelY: height * 0.46,
    modelWidth: Math.min(width * 0.4, 650),
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
