import ClassicCard from './classic-card';
import LinktreeCard from './linktree-card';
import MinimalCard from './minimal-card';

export type CardType = 1 | 2 | 3;

type LinktreeSectionParams = {
  cardType: CardType;
};

const CARDS = {
  1: LinktreeCard,
  2: ClassicCard,
  3: MinimalCard,
};

export default function LinktreeSection({ cardType }: LinktreeSectionParams) {
  const Card = CARDS[cardType];

  return (
    <section
      aria-label="Profile card"
      className="pointer-events-none flex max-h-[calc(100svh-10rem)] w-full flex-col"
    >
      <div
        data-section-scroll
        className="pointer-events-none flex min-h-0 w-full select-none items-start justify-center overflow-y-auto overscroll-contain px-4 scrollbar-thin sm:px-8"
      >
        <Card />
      </div>
    </section>
  );
}
