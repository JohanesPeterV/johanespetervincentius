'use client';

import { useSyncExternalStore } from 'react';
import { fetchAiUsage, INITIAL_AI_USAGE, type AiUsage } from '@/lib/ai-usage';

type AiUsageState = {
  usage: AiUsage;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
};

const initialState: AiUsageState = {
  usage: INITIAL_AI_USAGE,
  status: 'loading',
  error: null,
};
let state = initialState;
let refresh: ReturnType<typeof setInterval> | null = null;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

const refreshUsage = (): Promise<void> => {
  if (pending) {
    return pending;
  }
  pending = fetchAiUsage()
    .then((usage) => {
      state = { usage, status: 'ready', error: null };
    })
    .catch((error: Error) => {
      state = { ...state, status: 'error', error: error.message };
    })
    .finally(() => {
      pending = null;
      for (const listener of listeners) {
        listener();
      }
    });
  return pending;
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    refreshUsage();
    refresh = setInterval(refreshUsage, 900000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && refresh) {
      clearInterval(refresh);
      refresh = null;
    }
  };
};

export const useAiUsage = (): AiUsageState =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => initialState,
  );
