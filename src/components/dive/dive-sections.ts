export type SectionHeading = {
  title: string;
  subtitle: string;
};

type ContentChapter = SectionHeading & {
  animation: 'cards' | 'static';
};

export type ContentSectionId = keyof typeof CONTENT_CHAPTERS;
export type DiveSectionId = 'hero' | ContentSectionId;
export type DiveSection = SectionHeading & {
  id: DiveSectionId;
  center: number;
};

export const CONTENT_CHAPTERS = {
  work: {
    title: 'Work & Projects',
    subtitle: 'Professional experience & independent builds',
    animation: 'cards',
  },
  stack: {
    title: 'Stack',
    subtitle: 'What I build with',
    animation: 'static',
  },
} satisfies Record<string, ContentChapter>;

export const CONTENT_ORDER: readonly [ContentSectionId, ...ContentSectionId[]] =
  ['work', 'stack'];

export const HERO_SECTION: DiveSection = {
  id: 'hero',
  title: 'Johanes Peter\nVincentius',
  subtitle: 'Scroll to explore',
  center: 0.95,
};

const ENTRY_GAP = 1;
const CHAPTER_GAP = 0.6;

export const CONTENT_SECTIONS = CONTENT_ORDER.map((id, index) => ({
  id,
  ...CONTENT_CHAPTERS[id],
  center: HERO_SECTION.center + ENTRY_GAP + index * CHAPTER_GAP,
}));

export const ENTRY_SECTION = CONTENT_SECTIONS[0];
export const LAST_SECTION = CONTENT_SECTIONS[CONTENT_SECTIONS.length - 1];
export const DIVE_SECTIONS: readonly DiveSection[] = [
  HERO_SECTION,
  ...CONTENT_SECTIONS,
];

export const DIVE_START = HERO_SECTION.center;
export const DIVE_LENGTH =
  LAST_SECTION.center + ENTRY_SECTION.center - DIVE_START * 2;
