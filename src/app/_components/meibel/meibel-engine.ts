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
  | 'petting'
  | 'swatting'
  | 'lounging';

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
  rotation?: number;
  facing?: 'left' | 'right';
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

export const MEIBEL_PLAY_SHEET = {
  ...MEIBEL_SHEET,
  source: '/pets/meibel-play.png',
  width: 768,
  height: 416,
  columns: 4,
};

export const MEIBEL_LOUNGE_SHEET = {
  ...MEIBEL_SHEET,
  source: '/pets/meibel-lounging.png',
  width: 768,
  height: 208,
  columns: 4,
};

export const MEIBEL_CLIPS: Record<MeibelAnimation, SpriteClip> = {
  idle: { row: 0, durations: [3200, 140, 90, 90, 140, 4500] },
  'running-right': { row: 1, durations: Array(8).fill(150) },
  'running-left': { row: 2, durations: Array(8).fill(150) },
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
  swatting: { row: 0, durations: [180, 180, 160, 180, 120, 180, 180, 300] },
  lounging: { row: 0, durations: [12000, 1800, 300, 15900] },
};

const BEHAVIORS: readonly Behavior[] = [
  { animation: 'idle', duration: 60000 },
  { animation: 'review', duration: 1500 },
  { animation: 'idle', duration: 120000 },
  { animation: 'lounging', duration: 30000 },
];
const CYCLE_DURATION = BEHAVIORS.reduce((sum, pose) => sum + pose.duration, 0);

const clipDuration = (animation: MeibelAnimation): number => {
  const { durations } = MEIBEL_CLIPS[animation];
  return durations.reduce((sum, duration) => sum + duration, 0);
};

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
  const columns =
    animation === 'swatting' ? MEIBEL_PLAY_SHEET.columns : MEIBEL_SHEET.columns;
  return {
    animation,
    row: clip.row + Math.floor(column / columns),
    column: column % columns,
    offsetX: 0,
    offsetY: 0,
  };
};

export const lookDirection = (x: number, y: number): number | null => {
  if (Math.hypot(x, y) < 12) {
    return null;
  }
  return (Math.round(Math.atan2(x, -y) / (Math.PI / 8)) + 16) % 16;
};

const actionState = (animation: MeibelAnimation, time: number): MeibelState => {
  const priority = animation === 'lounging' ? 0 : 1;
  return new ActionState(
    { animation, duration: clipDuration(animation) },
    time,
    animation === 'jumping' || animation === 'petting' ? 2 : priority,
  );
};

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

class ActionState implements MeibelState {
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
      const lounging = this.behavior.animation === 'lounging';
      if (lounging && event.animation === 'waving') {
        return this;
      }
      const requested = actionState(event.animation, time);
      if (requested.priority > this.priority) {
        return requested;
      }
    }
    return this;
  }
}

class MovingState implements MeibelState {
  readonly endsAt = Infinity;
  readonly priority = 0;
  protected speed = 0.16;
  protected target: { x: number; y: number };
  protected walking: MeibelAnimation | null = null;
  protected action: MeibelState;

  constructor(
    protected clock: number,
    protected x: number,
    protected y: number,
  ) {
    this.target = { x, y };
    this.action = new IdleState(clock, Infinity);
  }

  get settled(): boolean {
    return Math.hypot(this.target.x - this.x, this.target.y - this.y) <= 1;
  }

  followTo(x: number, y: number): void {
    this.target = { x, y };
  }

  pause(): void {
    this.target = { x: this.x, y: this.y };
    this.walking = null;
    if (this.action.frame(this.clock).animation === 'swatting') {
      this.action = new IdleState(this.clock, Infinity);
    }
  }

  advance(time: number): void {
    const blockedUntil =
      this.action.priority > 0 ? this.action.endsAt : this.clock;
    const travel = Math.max(0, time - blockedUntil) * this.speed;
    this.clock = time;
    if (time >= this.action.endsAt) {
      this.action = new IdleState(time, Infinity);
    }
    if (this.action.priority > 0) {
      return;
    }
    const x = this.target.x - this.x;
    const y = this.target.y - this.y;
    const distance = Math.hypot(x, y);
    if (distance <= 1) {
      this.x = this.target.x;
      this.y = this.target.y;
      this.walking = null;
      return;
    }
    const movement = Math.min(distance, travel);
    this.x += (x / distance) * movement;
    this.y += (y / distance) * movement;
    this.walking = x < 0 ? 'running-left' : 'running-right';
  }

  frame(time: number): MeibelFrame {
    const frame =
      this.walking && this.action.priority === 0
        ? clipFrame(this.walking, time)
        : this.action.frame(time);
    frame.offsetX += this.x;
    frame.offsetY += this.y;
    frame.facing = this.walking === 'running-right' ? 'right' : 'left';
    return frame;
  }

  handle(event: MeibelEvent, time: number): MeibelState {
    this.action = this.action.handle(event, time);
    return this;
  }
}

class MousePlayState extends MovingState {
  protected speed = 0.18;
  private cursor: { x: number; y: number } | null = null;
  private phase: 'chasing' | 'resting' | 'circling' = 'chasing';
  private phaseStarted = 0;
  private side = 1;

  followTo(x: number, y: number): void {
    if (!this.cursor || Math.hypot(x - this.cursor.x, y - this.cursor.y) > 8) {
      this.phase = 'chasing';
      this.side = Math.sign(this.x - x) || this.side;
      if (this.action.priority < 2) {
        this.action = new IdleState(this.clock, Infinity);
      }
    }
    this.cursor = { x, y };
    if (this.phase === 'chasing') {
      super.followTo(x + this.side * 40, y);
    }
  }

  pause(): void {
    this.cursor = null;
    super.pause();
  }

  advance(time: number): void {
    const reaching = this.action.frame(this.clock).animation === 'swatting';
    if (this.phase === 'circling' && this.cursor) {
      const angle = Math.PI * Math.min(1, (time - this.phaseStarted) / 1400);
      super.followTo(
        this.cursor.x + this.side * 40 * Math.cos(angle),
        this.cursor.y - 40 * Math.sin(angle),
      );
    }
    super.advance(time);
    if (!this.cursor || this.action.priority > 0) {
      return;
    }
    if (reaching) {
      this.phase = 'resting';
      this.phaseStarted = time;
    }
    const phaseTime = time - this.phaseStarted;
    if (this.phase === 'chasing' && this.settled) {
      this.action = actionState('swatting', time);
      this.phaseStarted = time;
    } else if (this.phase === 'resting' && phaseTime >= 900) {
      this.phase = 'circling';
      this.phaseStarted = time;
    } else if (this.phase === 'circling' && phaseTime >= 1400) {
      this.phase = 'chasing';
      this.side *= -1;
      super.followTo(this.cursor.x + this.side * 40, this.cursor.y);
    }
  }

  frame(time: number): MeibelFrame {
    const frame = super.frame(time);
    const sign = Math.sign((this.cursor?.x ?? this.x) - this.x) || -this.side;
    frame.facing = sign > 0 ? 'right' : 'left';
    if (frame.animation === 'swatting') {
      const reach = Math.sin(
        (Math.PI * (time - this.phaseStarted)) / clipDuration('swatting'),
      );
      frame.offsetX += sign * 6 * reach;
      frame.offsetY -= 8 * reach;
      frame.rotation = sign * 6 * reach;
    } else if (frame.animation.startsWith('running-')) {
      const stride = Math.sin((time - this.phaseStarted) / 90);
      frame.offsetY -= 3 * Math.abs(stride);
      frame.rotation = sign * 4 * stride;
    }
    return frame;
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
      return new ActionState(behavior, startsAt, 0);
    }
    startsAt = endsAt;
  }
  throw new Error('Meibel behavior timeline has no active state.');
};

export class MeibelEngine {
  private elapsed = 0;
  private state: MeibelState = ambientState(0);
  private position = { x: 0, y: 0 };
  private mode: MeibelFollowMode = 'resting';
  private motion: 'full' | 'reduced' = 'full';

  setMotion(motion: 'full' | 'reduced'): void {
    if (motion === this.motion) {
      return;
    }
    this.motion = motion;
    this.position = { x: 0, y: 0 };
    this.mode = 'resting';
    this.state =
      motion === 'reduced'
        ? new IdleState(this.elapsed, Infinity)
        : ambientState(this.elapsed);
  }

  advance(delta: number): void {
    if (this.motion === 'reduced') {
      return;
    }
    this.elapsed += Math.max(0, delta);
    if (this.state instanceof MovingState) {
      this.state.advance(this.elapsed);
      if (this.mode === 'resting' && this.state.settled) {
        this.position = { x: 0, y: 0 };
        this.state = ambientState(this.elapsed);
      }
      return;
    }
    if (this.elapsed >= this.state.endsAt) {
      this.state = ambientState(this.elapsed);
    }
  }

  play(animation: MeibelAnimation): void {
    if (this.motion === 'reduced') {
      return;
    }
    if (animation === 'lounging') {
      const frame = this.frame();
      this.position = { x: frame.offsetX, y: frame.offsetY };
      this.mode = 'resting';
      this.state = actionState(animation, this.elapsed);
      return;
    }
    this.state = this.state.handle({ type: 'play', animation }, this.elapsed);
  }

  get followMode(): MeibelFollowMode {
    return this.mode;
  }

  setFollowMode(mode: MeibelFollowMode): void {
    if (this.motion === 'reduced') {
      return;
    }
    const frame = this.frame();
    this.mode = mode;
    const pursuit =
      mode === 'following'
        ? new MousePlayState(this.elapsed, frame.offsetX, frame.offsetY)
        : new MovingState(this.elapsed, frame.offsetX, frame.offsetY);
    if (mode === 'resting') {
      pursuit.followTo(0, 0);
    }
    this.state = pursuit;
  }

  followTo(x: number, y: number): void {
    if (this.mode === 'resting' || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    if (this.state instanceof MovingState) {
      this.state.followTo(x, y);
    }
  }

  pausePursuit(): void {
    if (this.mode !== 'resting' && this.state instanceof MovingState) {
      this.state.pause();
    }
  }

  lookAt(x: number, y: number): void {
    this.state = this.state.handle({ type: 'look', x, y }, this.elapsed);
  }

  clearGaze(): void {
    this.state = this.state.handle({ type: 'leave' }, this.elapsed);
  }

  frame(): MeibelFrame {
    const frame = this.state.frame(this.elapsed);
    if (this.state instanceof MovingState) {
      return frame;
    }
    frame.offsetX += this.position.x;
    frame.offsetY += this.position.y;
    return frame;
  }
}
