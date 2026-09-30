import { MathUtils } from 'three';

// REASON: the opening is timed from the frame the scene goes live, not from
// page load, so it never runs against a black canvas that is still fetching.
export const ARRIVAL_DURATION = 2.8;
export const ARRIVAL_DOLLY = 6;
export const ARRIVAL_LENS = 10;
export const ARRIVAL_ABERRATION = 0.0011;
export const ARRIVAL_RISE = 40;

export const arrivalApproach = (arrival: number): number =>
  1 - MathUtils.smootherstep(arrival, 0, 1);

export const arrivalLids = (arrival: number): number =>
  1 - MathUtils.smoothstep(arrival, 0.3, 0.7);

export const arrivalCard = (arrival: number): number =>
  MathUtils.smoothstep(arrival, 0.55, 0.95);

export const arrivalLoader = (arrival: number): number =>
  MathUtils.smoothstep(arrival, 0.06, 0.82);
