export const INTRO_SECONDS = 2.6;
export const CONVERGE_SECONDS = 1.1;

export const easeOutCubic = (value: number): number => {
  return 1 - Math.pow(1 - value, 3);
};

export const getIntroProgress = (time: number): number => {
  return easeOutCubic(Math.min(time / INTRO_SECONDS, 1));
};
