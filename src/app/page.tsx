import LinktreeSection, { type CardType } from '@/app/_components/linktree';
import DiveExperience from '@/components/dive/dive-experience';
import type { DiveAppearance } from '@/components/dive/dive-palette';

type HomeParams = {
  searchParams: Promise<{
    card_type?: string | string[];
    world?: string | string[];
  }>;
};

const getCardType = (value: string | string[] | undefined): CardType => {
  const selectedValue = Array.isArray(value) ? value[0] : value;
  if (selectedValue === '2') {
    return 2;
  }
  return 1;
};

const getDiveAppearance = (
  value: string | string[] | undefined,
): DiveAppearance => {
  const selectedValue = Array.isArray(value) ? value[0] : value;
  if (selectedValue === 'space' || selectedValue === 'igloo') {
    return selectedValue;
  }
  return 'coffee';
};

export default async function Home({ searchParams }: HomeParams) {
  const query = await searchParams;
  const cardType = getCardType(query.card_type);
  const appearance = getDiveAppearance(query.world);

  return (
    <main className="group relative h-screen w-full overflow-hidden [&_[data-visible]:first-child]:!invisible">
      <DiveExperience initialAppearance={appearance} />
      <div className="pointer-events-none fixed inset-0 z-20 flex translate-y-6 scale-[0.97] items-center justify-center opacity-0 transition-[opacity,transform] duration-1000 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] group-has-[[data-visible=true]:first-child]:translate-y-0 group-has-[[data-visible=true]:first-child]:scale-100 group-has-[[data-visible=true]:first-child]:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <LinktreeSection cardType={cardType} />
      </div>
    </main>
  );
}
