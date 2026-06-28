// REASON: a one-value channel between the DOM scroll listener and the R3F frame loop, written and read every frame without triggering React re-renders
const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const state = { target: 0, eased: 0 };

export const setScrollTarget = (value: number): void => {
  state.target = clamp01(value);
};

export const getScrollTarget = (): number => state.target;

export const setScrollEased = (value: number): void => {
  state.eased = value;
};

export const getScrollEased = (): number => state.eased;
