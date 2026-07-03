import dynamic from 'next/dynamic';

import DiveScene from './dive-scene';

const DiveDebugPanel = dynamic(() => import('./dive-debug'));

type IglooPreviewPageParams = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function IglooPreviewPage({
  searchParams,
}: IglooPreviewPageParams) {
  const params = await searchParams;
  const parsedTier =
    typeof params.tier === 'string'
      ? Number.parseInt(params.tier, 10)
      : Number.NaN;
  return (
    <>
      <DiveScene tierOverride={Number.isNaN(parsedTier) ? null : parsedTier} />
      {'debug' in params ? <DiveDebugPanel /> : null}
    </>
  );
}
