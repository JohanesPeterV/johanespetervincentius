import dynamic from 'next/dynamic';

import DiveScene from './dive-scene';

const DiveDebugPanel = dynamic(() => import('./dive-debug'));

type IglooPreviewPageParams = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const parseTierOverride = (
  value: string | string[] | undefined,
): number | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const tier = Number(value);
  if (!Number.isInteger(tier) || tier < 0 || tier > 3) {
    return null;
  }
  return tier;
};

export default async function IglooPreviewPage({
  searchParams,
}: IglooPreviewPageParams) {
  const params = await searchParams;
  return (
    <>
      <DiveScene tierOverride={parseTierOverride(params.tier)} />
      {'debug' in params ? <DiveDebugPanel /> : null}
    </>
  );
}
