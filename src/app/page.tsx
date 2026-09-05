import LinktreeSection, { type CardType } from '@/app/_components/linktree';
import DiveScene from '@/components/dive/dive-scene';

type HomeParams = {
  searchParams: Promise<{
    card_type?: string | string[];
  }>;
};

const getCardType = (value: string | string[] | undefined): CardType => {
  const selectedValue = Array.isArray(value) ? value[0] : value;
  if (selectedValue === '2') {
    return 2;
  }
  return 1;
};

export default async function Home({ searchParams }: HomeParams) {
  const query = await searchParams;
  const cardType = getCardType(query.card_type);

  return (
    <main className="relative h-svh w-full overflow-hidden">
      <DiveScene>
        <LinktreeSection cardType={cardType} />
      </DiveScene>
    </main>
  );
}
