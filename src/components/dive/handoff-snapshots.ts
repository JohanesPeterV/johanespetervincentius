import type { CanvasTexture } from 'three';
import type { HeroHandoff } from './hero-handoff';

export type HandoffSnapshotSet = {
  hero: CanvasTexture;
  entry: CanvasTexture;
  last: CanvasTexture;
};

type CaptureSet = (signal: AbortSignal) => Promise<HandoffSnapshotSet>;
type SnapshotTarget = Pick<HeroHandoff, 'hero' | 'entry' | 'last'>;

const CAPTURE_DELAY = 60;

const disposeSet = (snapshots: SnapshotTarget): void => {
  snapshots.hero?.dispose();
  snapshots.entry?.dispose();
  snapshots.last?.dispose();
};

export class HandoffSnapshots {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private request: AbortController | null = null;
  private running = false;
  private disposed = false;

  constructor(
    private readonly target: SnapshotTarget,
    private readonly captureSet: CaptureSet,
    private readonly onError: (message: string | null) => void,
  ) {}

  invalidate = (): void => {
    if (this.disposed) {
      return;
    }
    this.request?.abort();
    this.request = new AbortController();
    this.schedule();
  };

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.request?.abort();
    this.clearTimer();
    disposeSet(this.target);
    this.target.hero = null;
    this.target.entry = null;
    this.target.last = null;
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private schedule(): void {
    this.clearTimer();
    this.timer = setTimeout(this.refresh, CAPTURE_DELAY);
  }

  private refresh = async (): Promise<void> => {
    const request = this.request;
    if (this.disposed || this.running || request === null) {
      return;
    }
    this.running = true;
    try {
      const snapshots = await this.captureSet(request.signal);
      if (request.signal.aborted) {
        disposeSet(snapshots);
        return;
      }
      // REASON: both worlds must switch snapshots together; a partial result
      // would mix the previous theme or viewport with the incoming one.
      disposeSet(this.target);
      this.target.hero = snapshots.hero;
      this.target.entry = snapshots.entry;
      this.target.last = snapshots.last;
      this.onError(null);
    } catch (cause) {
      if (!request.signal.aborted) {
        this.onError(cause instanceof Error ? cause.message : String(cause));
      }
    } finally {
      this.running = false;
      // REASON: html-to-image cannot abort an in-flight rasterization. Wait
      // for it to finish before starting the latest requested capture.
      if (!this.disposed && request !== this.request) {
        this.schedule();
      }
    }
  };
}
