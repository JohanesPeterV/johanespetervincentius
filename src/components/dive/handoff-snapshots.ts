import type { CanvasTexture } from 'three';
import type { HeroHandoff } from './hero-handoff';

export type HandoffSnapshotPair = {
  hero: CanvasTexture;
  entry: CanvasTexture;
};

type CapturePair = (signal: AbortSignal) => Promise<HandoffSnapshotPair>;
type SnapshotTarget = Pick<HeroHandoff, 'hero' | 'entry'>;

const CAPTURE_DELAY = 60;

const disposePair = (pair: SnapshotTarget): void => {
  pair.hero?.dispose();
  pair.entry?.dispose();
};

export class HandoffSnapshots {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private request: AbortController | null = null;
  private running = false;
  private disposed = false;

  constructor(
    private readonly target: SnapshotTarget,
    private readonly capturePair: CapturePair,
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
    disposePair(this.target);
    this.target.hero = null;
    this.target.entry = null;
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
      const pair = await this.capturePair(request.signal);
      if (request.signal.aborted) {
        disposePair(pair);
        return;
      }
      // REASON: both worlds must switch snapshots together; a partial result
      // would mix the previous theme or viewport with the incoming one.
      disposePair(this.target);
      this.target.hero = pair.hero;
      this.target.entry = pair.entry;
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
