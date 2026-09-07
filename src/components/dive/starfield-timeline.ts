type StarfieldTiming = {
  hold: number;
  duration: number;
};

type StarfieldTimeline = {
  frames: readonly StarfieldTiming[];
  duration: number;
  from: number;
  to: number;
  morph: number;
  phase: number;
  offset: number;
  transitioning: boolean;
};

const TIME_EPSILON = 1e-8;

export const createStarfieldTimeline = (
  frames: readonly StarfieldTiming[],
): StarfieldTimeline => {
  if (frames.length === 0) {
    throw new Error('A starfield sequence needs at least one shape.');
  }
  let duration = 0;
  for (const frame of frames) {
    if (
      !Number.isFinite(frame.hold) ||
      frame.hold < 0 ||
      !Number.isFinite(frame.duration) ||
      frame.duration <= 0
    ) {
      throw new Error(
        'Starfield holds must be nonnegative and transitions positive.',
      );
    }
    duration += frame.hold + frame.duration;
  }
  return {
    frames,
    duration,
    from: 0,
    to: 1 % frames.length,
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
  let phase =
    (((elapsed + timeline.offset) % timeline.duration) + timeline.duration) %
    timeline.duration;
  // REASON: manual jumps can land a few floating-point bits before a loop boundary.
  if (timeline.duration - phase < TIME_EPSILON) {
    phase = 0;
  }
  for (let index = 0; index < timeline.frames.length; index += 1) {
    const frame = timeline.frames[index];
    const length = frame.hold + frame.duration;
    if (phase < length - TIME_EPSILON || index === timeline.frames.length - 1) {
      timeline.from = index;
      timeline.to = (index + 1) % timeline.frames.length;
      timeline.phase = Math.max(0, phase);
      timeline.transitioning = phase >= frame.hold - TIME_EPSILON;
      timeline.morph = Math.min(
        1,
        Math.max(0, (phase - frame.hold) / frame.duration),
      );
      return;
    }
    phase -= length;
  }
};

export const advanceStarfieldTimeline = (
  timeline: StarfieldTimeline,
  motion: 'animate' | 'instant',
): void => {
  if (
    timeline.frames.length < 2 ||
    (motion === 'animate' && timeline.transitioning)
  ) {
    return;
  }
  const frame = timeline.frames[timeline.from];
  let destination = frame.hold;
  if (motion === 'instant') {
    destination += frame.duration;
  }
  timeline.offset += destination - timeline.phase;
  timeline.morph = 0;
  timeline.phase = destination;
  timeline.transitioning = true;
  if (motion === 'instant') {
    timeline.from = timeline.to;
    timeline.to = (timeline.from + 1) % timeline.frames.length;
    timeline.phase = 0;
    timeline.transitioning = false;
  }
};
