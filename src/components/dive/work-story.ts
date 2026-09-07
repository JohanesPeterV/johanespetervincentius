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
  artWidth: number;
  artHeight: number;
  previewX: number;
};

type WorkArtifactPose = {
  visible: boolean;
  scale: number;
  rotationY: number;
  rotationZ: number;
};

export const workChapterAtom = atom(0);
export const workStoryPosition = { current: 0 };

export const getWorkLayout = (width: number, height: number): WorkLayout => {
  const panelWidth = Math.min(1440, width - 48);
  const left = (width - panelWidth) / 2;
  const topInset = height < 500 ? 64 : 80;
  const availableHeight = height - topInset - 88;
  const panelHeight = Math.min(760, availableHeight);
  const top = topInset + (availableHeight - panelHeight) / 2;
  if (width < 768 && height >= width) {
    const artHeight = Math.min(200, panelHeight * 0.32);
    return {
      left,
      top,
      width: panelWidth,
      height: panelHeight,
      modelX: left + panelWidth * 0.4,
      modelY: top + 36 + artHeight * 0.5,
      modelWidth: Math.min(panelWidth * 0.56, artHeight * 1.05),
      artWidth: 0,
      artHeight,
      previewX: left + panelWidth - 48,
    };
  }
  const artWidth = panelWidth * 0.43;
  return {
    left,
    top,
    width: panelWidth,
    height: panelHeight,
    modelX: left + artWidth * 0.46,
    modelY: top + 36 + (panelHeight - 96) * 0.5,
    modelWidth: Math.min(380, artWidth * 0.8, (panelHeight - 96) * 0.9),
    artWidth,
    artHeight: 0,
    previewX: left + panelWidth - 48,
  };
};

export const getWorkArtifactPose = (offset: number): WorkArtifactPose => ({
  visible: Math.abs(offset) < 1.1,
  scale: 1 / (1 + Math.abs(offset) * 2.5),
  rotationY: -0.3 - offset * 0.7,
  rotationZ: -offset * 0.1,
});

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
