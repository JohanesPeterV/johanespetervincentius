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

export type MeibelFollowMode = 'resting' | 'following' | 'playing';
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

const actionState = (animation: MeibelAnimation, time: number): MeibelState => {
  if (animation === 'swatting') {
    return new PawSwipeState(time);
  }
  if (animation === 'lounging') {
    return new LoungingState(time, time + clipDuration(animation));
  }
  return new ActionState(
    { animation, duration: clipDuration(animation) },
    time,
    animation === 'jumping' || animation === 'petting' ? 2 : 1,
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
      const requested = actionState(event.animation, time);
      if (requested.priority > this.priority) {
        return requested;
      }
    }
    return this;
  }
}

class PawSwipeState extends ActionState {
  constructor(time: number) {
    const duration = clipDuration('swatting');
    super({ animation: 'swatting', duration }, time, 1);
  }

  frame(time: number): MeibelFrame {
    const frame = super.frame(time);
    return {
      ...frame,
      row: Math.floor(frame.column / MEIBEL_PLAY_SHEET.columns),
      column: frame.column % MEIBEL_PLAY_SHEET.columns,
      offsetY:
        frame.column === 7 ? 0 : -8 * Math.sin((Math.PI * frame.column) / 7),
    };
  }
}

class LoungingState extends ActionState {
  constructor(time: number, endsAt: number) {
    super({ animation: 'lounging', duration: endsAt - time }, time, 0);
  }

  handle(event: MeibelEvent, time: number): MeibelState {
    if (event.type === 'play' && event.animation === 'waving') {
      return this;
    }
    return super.handle(event, time);
  }
}

class FollowingState implements MeibelState {
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
      this.walking = null;
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
    const frame = this.walking
      ? clipFrame(this.walking, time)
      : this.action.frame(time);
    frame.offsetX += this.x;
    frame.offsetY += this.y;
    return frame;
  }

  handle(event: MeibelEvent, time: number): MeibelState {
    this.action = this.action.handle(event, time);
    if (this.action.priority > 0) {
      this.walking = null;
    }
    return this;
  }
}

class MousePlayState extends FollowingState {
  protected speed = 0.12;
  private pointerActive = false;
  private movedAt = 0;
  private nextSwipeAt = 0;
  private swipedTarget: { x: number; y: number } | null = null;

  followTo(x: number, y: number): void {
    if (
      !this.pointerActive ||
      Math.hypot(x - this.target.x, y - this.target.y) > 4
    ) {
      this.movedAt = this.clock;
    }
    this.pointerActive = true;
    super.followTo(x, y);
  }

  pause(): void {
    this.pointerActive = false;
    super.pause();
  }

  advance(time: number): void {
    super.advance(time);
    if (
      !this.settled ||
      this.action.priority > 0 ||
      !this.pointerActive ||
      time < this.nextSwipeAt ||
      time - this.movedAt < 300
    ) {
      return;
    }
    if (
      this.swipedTarget &&
      Math.hypot(this.x - this.swipedTarget.x, this.y - this.swipedTarget.y) <
        24
    ) {
      return;
    }
    this.walking = null;
    this.action = new PawSwipeState(time);
    this.nextSwipeAt = this.action.endsAt + 1800;
    this.swipedTarget = { x: this.x, y: this.y };
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
      if (behavior.animation === 'lounging') {
        return new LoungingState(startsAt, endsAt);
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
  private offsetX = 0;
  private offsetY = 0;
  private mode: MeibelFollowMode = 'resting';
  private motion: 'full' | 'reduced' = 'full';

  setMotion(motion: 'full' | 'reduced'): void {
    if (motion === this.motion) {
      return;
    }
    this.motion = motion;
    this.offsetX = 0;
    this.offsetY = 0;
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
    if (this.state instanceof FollowingState) {
      this.state.advance(this.elapsed);
      if (this.mode === 'resting' && this.state.settled) {
        this.offsetX = 0;
        this.offsetY = 0;
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
      this.offsetX = frame.offsetX;
      this.offsetY = frame.offsetY;
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
      mode === 'playing'
        ? new MousePlayState(this.elapsed, frame.offsetX, frame.offsetY)
        : new FollowingState(this.elapsed, frame.offsetX, frame.offsetY);
    if (mode === 'resting') {
      pursuit.followTo(0, 0);
    }
    this.state = pursuit;
  }

  followTo(x: number, y: number): void {
    if (this.mode === 'resting' || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    if (this.state instanceof FollowingState) {
      this.state.followTo(x, y);
    }
  }

  pausePursuit(): void {
    if (this.mode !== 'resting' && this.state instanceof FollowingState) {
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
    if (this.state instanceof FollowingState) {
      return frame;
    }
    return { ...frame, offsetX: this.offsetX, offsetY: this.offsetY };
  }
}
