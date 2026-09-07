import { useAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

import {
  BaseColor,
  baseColors,
  DEFAULT_BASE_COLOR,
} from '@/registry/registry-base-colors';

type Config = {
  theme: BaseColor['name'];
};

export const pickRandomColorway = (current?: BaseColor['name']): Config => {
  const choices = baseColors.filter(({ name }) => name !== current);
  return { theme: choices[Math.floor(Math.random() * choices.length)].name };
};

const configStorage = createJSONStorage<Config>();

const configAtom = atomWithStorage<Config>(
  'config',
  { theme: DEFAULT_BASE_COLOR.name },
  {
    ...configStorage,
    // REASON: storage is read on client mount, so SSR stays deterministic.
    // Persist the first random pick here, before any consumer can pick again.
    getItem: (key, initialValue) => {
      const saved = configStorage.getItem(key, initialValue);
      if (
        saved !== initialValue &&
        baseColors.some(({ name }) => name === saved?.theme)
      ) {
        return saved;
      }

      const config = pickRandomColorway();
      configStorage.setItem(key, config);
      return config;
    },
  },
);

export function useConfig() {
  return useAtom(configAtom);
}
