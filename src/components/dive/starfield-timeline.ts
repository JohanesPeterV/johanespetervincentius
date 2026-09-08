type StarfieldTiming = {
  hold: number;
  morph: number;
};

type StarfieldTimeline = {
  frameCount: number;
  timing: StarfieldTiming;
  from: number;
  to: number;
  morph: number;
  phase: number;
  offset: number;
  transitioning: boolean;
};

const TIME_EPSILON = 1e-8;

export const createStarfieldTimeline = (
  frameCount: number,
  timing: StarfieldTiming,
): StarfieldTimeline => {
  if (frameCount === 0) {
    throw new Error('A starfield sequence needs at least one shape.');
  }
  if (
    !Number.isFinite(timing.hold) ||
    timing.hold < 0 ||
    !Number.isFinite(timing.morph) ||
    timing.morph <= 0
  ) {
    throw new Error('Starfield hold must be nonnegative and morph positive.');
  }
  return {
    frameCount,
    timing,
    from: 0,
    to: 1 % frameCount,
    morph: 0,
    phase: 0,
    offset: 0,
    transitioning: false,
  };
};

export const sampleStarfieldTimeline = (
  timeline: StarfieldTimeline,
  elapsed: number,
): void => {
  const { hold, morph } = timeline.timing;
  const period = hold + morph;
  const cycle = period * timeline.frameCount;
  let time = (((elapsed + timeline.offset) % cycle) + cycle) % cycle;
  // REASON: manual jumps can land a few floating-point bits before a frame boundary.
  if (cycle - time < TIME_EPSILON) {
    time = 0;
  }
  const index = Math.floor((time + TIME_EPSILON) / period);
  const phase = Math.max(0, time - index * period);
  timeline.from = index;
  timeline.to = (index + 1) % timeline.frameCount;
  timeline.phase = phase;
  timeline.transitioning = phase >= hold - TIME_EPSILON;
  timeline.morph = Math.min(1, Math.max(0, (phase - hold) / morph));
};

export const advanceStarfieldTimeline = (
  timeline: StarfieldTimeline,
  motion: 'animate' | 'instant',
): void => {
  if (
    timeline.frameCount < 2 ||
    (motion === 'animate' && timeline.transitioning)
  ) {
    return;
  }
  const { hold, morph } = timeline.timing;
  const destination = motion === 'instant' ? hold + morph : hold;
  timeline.offset += destination - timeline.phase;
  timeline.morph = 0;
  timeline.phase = destination;
  timeline.transitioning = true;
  if (motion === 'instant') {
    timeline.from = timeline.to;
    timeline.to = (timeline.from + 1) % timeline.frameCount;
    timeline.phase = 0;
    timeline.transitioning = false;
  }
};
