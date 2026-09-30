import { MathUtils } from 'three';

// REASON: the opening is timed from the frame the scene goes live, not from
// page load, so it never runs against a black canvas that is still fetching.
export const ARRIVAL_DURATION = 3.2;
export const ARRIVAL_DOLLY = 42;
export const ARRIVAL_RISE = 40;

export const arrivalApproach = (arrival: number): number =>
  1 - MathUtils.smootherstep(arrival, 0, 1);

export const arrivalLids = (arrival: number): number =>
  1 - MathUtils.smoothstep(arrival, 0.3, 0.7);

export const arrivalCard = (arrival: number): number =>
  MathUtils.smoothstep(arrival, 0.68, 0.96);
