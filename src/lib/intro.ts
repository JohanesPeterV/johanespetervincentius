export const INTRO_SECONDS = 2.6;
export const CONVERGE_SECONDS = 1.1;
export const CARD_DELAY = 0.9;
export const CARD_DURATION = 1.2;

export const easeOutCubic = (value: number): number => {
  return 1 - Math.pow(1 - value, 3);
};

export const easeOutBack = (value: number): number => {
  const overshoot = 1.70158;
  const scaled = overshoot + 1;
  return (
    1 + scaled * Math.pow(value - 1, 3) + overshoot * Math.pow(value - 1, 2)
  );
};

export const getIntroProgress = (time: number): number => {
  return easeOutCubic(Math.min(time / INTRO_SECONDS, 1));
};

export const getCardScale = (time: number): number => {
  if (time < CARD_DELAY) {
    return 0;
  }

  const phase = Math.min((time - CARD_DELAY) / CARD_DURATION, 1);
  return easeOutBack(phase);
};
