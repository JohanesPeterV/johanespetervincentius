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
};

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
  return { frames, duration, from: 0, to: 1 % frames.length, morph: 0 };
};

export const sampleStarfieldTimeline = (
  timeline: StarfieldTimeline,
  elapsed: number,
): void => {
  let phase =
    ((elapsed % timeline.duration) + timeline.duration) % timeline.duration;
  for (let index = 0; index < timeline.frames.length; index += 1) {
    const frame = timeline.frames[index];
    const length = frame.hold + frame.duration;
    if (phase < length || index === timeline.frames.length - 1) {
      timeline.from = index;
      timeline.to = (index + 1) % timeline.frames.length;
      timeline.morph = Math.min(
        1,
        Math.max(0, (phase - frame.hold) / frame.duration),
      );
      return;
    }
    phase -= length;
  }
};
