import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { BaseColor, DEFAULT_BASE_COLOR } from '@/registry/registry-base-colors';

type Config = {
  theme: BaseColor['name'];
};

const configAtom = atomWithStorage<Config>('config', {
  theme: DEFAULT_BASE_COLOR.name,
});

export function useConfig() {
  return useAtom(configAtom);
}
