export type MeibelAnimation =
  | 'idle'
  | 'running-right'
  | 'running-left'
  | 'waving'
  | 'jumping'
  | 'failed'
  | 'waiting'
  | 'running'
  | 'review'
  | 'petting';

type SpriteClip = {
  row: number;
  durations: readonly number[];
  columns?: readonly number[];
};

export type MeibelFollowMode = 'resting' | 'following';
type Behavior = { animation: MeibelAnimation; duration: number };
type MeibelEvent =
  | { type: 'play'; animation: MeibelAnimation }
  | { type: 'look'; x: number; y: number }
  | { type: 'leave' };
export type MeibelFrame = {
  animation: MeibelAnimation | 'look';
  row: number;
  column: number;
  offsetX: number;
  offsetY: number;
};

interface MeibelState {
  readonly endsAt: number;
  readonly priority: number;
  frame(time: number): MeibelFrame;
  handle(event: MeibelEvent, time: number): MeibelState;
}

export const MEIBEL_SHEET = {
  source: '/pets/meibel.png',
  width: 1536,
  height: 2288,
  cellWidth: 192,
  cellHeight: 208,
  columns: 8,
};

export const MEIBEL_CLIPS: Record<MeibelAnimation, SpriteClip> = {
  idle: { row: 0, durations: [3200, 140, 90, 90, 140, 4500] },
  'running-right': { row: 1, durations: Array(8).fill(90) },
  'running-left': { row: 2, durations: Array(8).fill(90) },
  waving: { row: 3, durations: [200, 180, 200, 260] },
  jumping: { row: 4, durations: [180, 120, 240, 140, 220] },
  failed: { row: 5, durations: Array(8).fill(180) },
  waiting: { row: 6, durations: Array(6).fill(220) },
  running: { row: 7, durations: Array(6).fill(150) },
  review: { row: 8, durations: Array(6).fill(250) },
  petting: {
    row: 0,
    columns: [2, 3, 3, 3, 4],
    durations: [100, 180, 240, 240, 160],
  },
};

const BEHAVIORS: readonly Behavior[] = [
  { animation: 'idle', duration: 60000 },
  { animation: 'review', duration: 1500 },
  { animation: 'idle', duration: 120000 },
];
const CYCLE_DURATION = BEHAVIORS.reduce(
  (sum, behavior) => sum + behavior.duration,
  0,
);

const clipDuration = (animation: MeibelAnimation): number =>
  MEIBEL_CLIPS[animation].durations.reduce(
    (sum, duration) => sum + duration,
    0,
  );

const clipFrame = (
  animation: MeibelAnimation,
  elapsed: number,
): MeibelFrame => {
  let time = Math.max(0, elapsed) % clipDuration(animation);
  const clip = MEIBEL_CLIPS[animation];
  let column = 0;
  for (let index = 0; index < clip.durations.length; index += 1) {
    if (time < clip.durations[index]) {
      column = clip.columns?.[index] ?? index;
      break;
    }
    time -= clip.durations[index];
  }
  return { animation, row: clip.row, column, offsetX: 0, offsetY: 0 };
};

export const lookDirection = (x: number, y: number): number | null => {
  if (Math.hypot(x, y) < 12) {
    return null;
  }
  return (Math.round(Math.atan2(x, -y) / (Math.PI / 8)) + 16) % 16;
};

const actionState = (animation: MeibelAnimation, time: number): PlayingState =>
  new PlayingState(
    { animation, duration: clipDuration(animation) },
    time,
    animation === 'jumping' || animation === 'petting' ? 2 : 1,
  );

class IdleState implements MeibelState {
  readonly priority = 0;

  constructor(
    readonly startedAt: number,
    readonly endsAt: number,
  ) {}

  frame(time: number): MeibelFrame {
    return clipFrame('idle', time - this.startedAt);
  }

  handle(event: MeibelEvent, time: number): MeibelState {
    if (event.type === 'play') {
      return actionState(event.animation, time);
    }
    if (event.type === 'look') {
      const direction = lookDirection(event.x, event.y);
      if (direction !== null) {
        return new LookingState(
          this,
          direction,
          Math.min(this.endsAt, time + 1800),
        );
      }
    }
    return this;
  }
}

class LookingState implements MeibelState {
  readonly priority = 0;

  constructor(
    private readonly idle: IdleState,
    private readonly direction: number,
    readonly endsAt: number,
  ) {}

  frame(): MeibelFrame {
    return {
      animation: 'look',
      row: 9 + Math.floor(this.direction / MEIBEL_SHEET.columns),
      column: this.direction % MEIBEL_SHEET.columns,
      offsetX: 0,
      offsetY: 0,
    };
  }

  handle(event: MeibelEvent, time: number): MeibelState {
    return this.idle.handle(event, time);
  }
}

class PlayingState implements MeibelState {
  readonly endsAt: number;

  constructor(
    private readonly behavior: Behavior,
    private readonly startedAt: number,
    readonly priority: number,
  ) {
    this.endsAt = startedAt + behavior.duration;
  }

  frame(time: number): MeibelFrame {
    return clipFrame(this.behavior.animation, time - this.startedAt);
  }

  handle(event: MeibelEvent, time: number): MeibelState {
    if (event.type === 'play') {
      const requested = actionState(event.animation, time);
      if (requested.priority > this.priority) {
        return requested;
      }
    }
    return this;
  }
}

const ambientState = (elapsed: number): MeibelState => {
  let startsAt = elapsed - (elapsed % CYCLE_DURATION);
  for (const behavior of BEHAVIORS) {
    const endsAt = startsAt + behavior.duration;
    if (elapsed < endsAt) {
      if (behavior.animation === 'idle') {
        return new IdleState(startsAt, endsAt);
      }
      return new PlayingState(behavior, startsAt, 0);
    }
    startsAt = endsAt;
  }
  throw new Error('Meibel behavior timeline has no active state.');
};

export class MeibelEngine {
  private elapsed = 0;
  private state: MeibelState = ambientState(0);
  private offsetX = 0;
  private offsetY = 0;
  private targetX = 0;
  private targetY = 0;
  private mode: MeibelFollowMode = 'resting';
  private walking: MeibelAnimation | null = null;
  private motion: 'full' | 'reduced' = 'full';

  setMotion(motion: 'full' | 'reduced'): void {
    if (motion === this.motion) {
      return;
    }
    this.motion = motion;
    this.offsetX = 0;
    this.offsetY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.mode = 'resting';
    this.walking = null;
    this.state =
      motion === 'reduced'
        ? new IdleState(this.elapsed, Infinity)
        : ambientState(this.elapsed);
  }

  advance(delta: number): void {
    if (this.motion === 'reduced') {
      return;
    }
    const step = Math.max(0, delta);
    const petEndsAt =
      this.state.frame(this.elapsed).animation === 'petting'
        ? this.state.endsAt
        : this.elapsed;
    this.elapsed += step;
    if (this.elapsed >= this.state.endsAt) {
      this.state = ambientState(this.elapsed);
    }
    if (this.state.frame(this.elapsed).animation === 'petting') {
      this.walking = null;
      return;
    }
    const x = this.targetX - this.offsetX;
    const y = this.targetY - this.offsetY;
    const distance = Math.hypot(x, y);
    if (distance <= 1) {
      this.offsetX = this.targetX;
      this.offsetY = this.targetY;
      this.walking = null;
      return;
    }
    const travel = Math.min(
      distance,
      Math.max(0, this.elapsed - petEndsAt) * 0.16,
    );
    this.offsetX += (x / distance) * travel;
    this.offsetY += (y / distance) * travel;
    this.walking = x < 0 ? 'running-left' : 'running-right';
  }

  play(animation: MeibelAnimation): void {
    if (this.motion === 'reduced') {
      return;
    }
    this.state = this.state.handle({ type: 'play', animation }, this.elapsed);
    if (this.state.frame(this.elapsed).animation === 'petting') {
      this.walking = null;
    }
  }

  get followMode(): MeibelFollowMode {
    return this.mode;
  }

  setFollowMode(mode: MeibelFollowMode): void {
    if (this.motion === 'reduced') {
      return;
    }
    this.mode = mode;
    if (mode === 'resting') {
      this.targetX = 0;
      this.targetY = 0;
    }
  }

  followTo(x: number, y: number): void {
    if (
      this.mode !== 'following' ||
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {
      return;
    }
    this.targetX = x;
    this.targetY = y;
  }

  lookAt(x: number, y: number): void {
    this.state = this.state.handle({ type: 'look', x, y }, this.elapsed);
  }

  clearGaze(): void {
    this.state = this.state.handle({ type: 'leave' }, this.elapsed);
  }

  frame(): MeibelFrame {
    const frame = this.walking
      ? clipFrame(this.walking, this.elapsed)
      : this.state.frame(this.elapsed);
    return { ...frame, offsetX: this.offsetX, offsetY: this.offsetY };
  }
}
