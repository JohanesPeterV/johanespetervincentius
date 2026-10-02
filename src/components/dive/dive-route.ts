export type DiveChapter = {
  id: string;
  title: string;
};

export type DiveSection = DiveChapter & { center: number };

export const DIVE_START = 0.95;
export const ENTRY_CENTER = DIVE_START + 1;
export const CHAPTER_GAP = 0.6;
export const LOOP_END = DIVE_START - 0.1;
export const READING_RANGE = 0.05;

export const chapterScroll = (progress: number, center: number): number => {
  // REASON: chapter centres are float sums; a resting neighbour must sit
  // exactly one viewport away, or it counts as visible off-screen.
  const scroll = Math.round(((progress - center) / CHAPTER_GAP) * 1e6) / 1e6;
  return Math.min(1, Math.max(-1, scroll));
};

export class DiveRoute {
  readonly sections: readonly DiveSection[];
  readonly entry: DiveSection;
  readonly last: DiveSection;
  readonly length: number;
  readonly loopStart: number;

  constructor(heroTitle: string, chapters: readonly DiveChapter[]) {
    if (chapters.length === 0) {
      throw new Error('A dive needs at least one content chapter.');
    }
    const ids = new Set(['hero']);
    const content = chapters.map((chapter, index) => {
      if (!chapter.id.trim() || ids.has(chapter.id)) {
        throw new Error(
          `Chapter IDs must be nonempty and unique: "${chapter.id}".`,
        );
      }
      ids.add(chapter.id);
      return {
        id: chapter.id,
        title: chapter.title,
        center: ENTRY_CENTER + index * CHAPTER_GAP,
      };
    });
    this.sections = [
      { id: 'hero', title: heroTitle, center: DIVE_START },
      ...content,
    ];
    this.entry = content[0];
    this.last = content[content.length - 1];
    this.length = this.last.center + ENTRY_CENTER - DIVE_START * 2;
    this.loopStart = this.last.center + 0.35;
  }

  wrapDistance(value: number): number {
    const wrapped = ((value % this.length) + this.length) % this.length;
    // REASON: complete laps can round just below the seam instead of zero.
    return wrapped < 1e-9 || this.length - wrapped < 1e-9 ? 0 : wrapped;
  }

  wrap(value: number): number {
    return LOOP_END + this.wrapDistance(value - LOOP_END);
  }

  jumpDelta(progress: number, center: number): number {
    return (
      this.wrapDistance(center - progress + this.length / 2) - this.length / 2
    );
  }

  stepDelta(progress: number, direction: 1 | -1): number {
    const wrapped = this.wrapDistance(progress);
    let nearest = this.length;
    for (const section of this.sections) {
      const distance = this.wrapDistance(
        (section.center - wrapped) * direction,
      );
      if (distance > 0.05 && distance < nearest) {
        nearest = distance;
      }
    }
    return direction * nearest;
  }

  travel(progress: number): number {
    let travel = 1;
    for (const section of this.sections) {
      const distance = Math.abs(this.jumpDelta(progress, section.center));
      const t = Math.min(1, Math.max(0, (distance - 0.08) / 0.22));
      travel = Math.min(travel, t * t * t * (t * (t * 6 - 15) + 10));
    }
    return travel;
  }

  sceneProgress(progress: number): number {
    const wrapped = this.wrap(progress);
    if (wrapped <= ENTRY_CENTER) {
      return wrapped;
    }
    // REASON: repeat the authored orbital camera excursion between chapters;
    // move the finale after the last chapter without stretching the artwork.
    if (wrapped >= this.last.center) {
      return ENTRY_CENTER + CHAPTER_GAP + wrapped - this.last.center;
    }
    return ENTRY_CENTER + ((wrapped - ENTRY_CENTER) % CHAPTER_GAP);
  }
}
