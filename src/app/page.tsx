import { AiUsageBackground } from '@/app/_components/ai-usage-background';
import LinktreeSection, { type CardType } from '@/app/_components/linktree';
import Meibel from '@/app/_components/meibel/meibel';
import DiveScene from '@/components/dive/dive-scene';
import { DiveWork } from '@/components/dive/dive-work';
import { DiveProjects } from '@/components/dive/dive-projects';
import { DiveStack } from '@/components/dive/dive-stack';
import { DiveSkills } from '@/components/dive/dive-skills';

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
  if (selectedValue === '3') {
    return 3;
  }
  return 1;
};

export default async function Home({ searchParams }: HomeParams) {
  const query = await searchParams;
  const cardType = getCardType(query.card_type);

  return (
    <main className="relative h-svh w-full overflow-hidden">
      <DiveScene
        hero={
          <>
            <AiUsageBackground />
            <LinktreeSection cardType={cardType} />
          </>
        }
        heroTitle={'Johanes Peter\nVincentius'}
        chapters={[
          { id: 'work', title: 'Work', content: <DiveWork /> },
          { id: 'projects', title: 'Projects', content: <DiveProjects /> },
          { id: 'skills', title: 'Skills', content: <DiveSkills /> },
          { id: 'stack', title: 'Stack', content: <DiveStack /> },
        ]}
      />
      <Meibel />
    </main>
  );
}
