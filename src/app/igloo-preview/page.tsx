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
  return (
    <>
      <DiveScene />
      {'debug' in params ? <DiveDebugPanel /> : null}
    </>
  );
}
