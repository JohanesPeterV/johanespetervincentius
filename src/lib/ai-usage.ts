import type { IconType } from 'react-icons';
import { SiClaude, SiOpenai } from 'react-icons/si';

import snapshot from '@/data/ai-usage.json';

export type AiUsage = typeof snapshot;
export type AiUsageProvider = keyof AiUsage['providers'];

export const INITIAL_AI_USAGE: AiUsage = snapshot;
export const AI_USAGE_TOOLS: {
  provider: AiUsageProvider;
  name: string;
  icon: IconType;
  color: string;
}[] = [
  {
    provider: 'claude',
    name: 'Claude Code',
    icon: SiClaude,
    color: 'text-primary',
  },
  { provider: 'codex', name: 'Codex', icon: SiOpenai, color: 'text-secondary' },
];
export const AI_USAGE_URL =
  'https://gist.githubusercontent.com/JohanesPeterV/39230a0a9b68ec5f7d218c1a704d93b0/raw/ai-usage.json';

const tokenFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const costFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const formatTokens = (tokens: number): string =>
  tokenFormat.format(tokens);

export const formatCost = (cost: number): string => costFormat.format(cost);

export const totalAiUsageCost = (usage: AiUsage): number =>
  AI_USAGE_TOOLS.reduce(
    (sum, { provider }) => sum + usage.providers[provider].cost,
    0,
  );

const isCount = (value: number): boolean =>
  Number.isSafeInteger(value) && value >= 0;

const isAmount = (value: number): boolean =>
  Number.isFinite(value) && value >= 0;

const isProviderUsage = (value: AiUsage['providers']['codex']): boolean =>
  value !== null &&
  typeof value === 'object' &&
  isCount(value.tokens) &&
  isCount(value.sessions) &&
  isAmount(value.cost);

const isDailyCost = (dailyCost: AiUsage['dailyCost']): boolean =>
  Array.isArray(dailyCost) &&
  dailyCost.length > 1 &&
  dailyCost.every(
    (day) =>
      day !== null &&
      typeof day === 'object' &&
      /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
      isAmount(day.codex) &&
      isAmount(day.claude),
  );

export const fetchAiUsage = async (): Promise<AiUsage> => {
  const response = await fetch(
    `${AI_USAGE_URL}?t=${Math.floor(Date.now() / 900000)}`,
  );
  if (!response.ok) {
    throw new Error('Usage update unavailable.');
  }
  const usage: AiUsage = await response.json();
  if (
    usage === null ||
    typeof usage !== 'object' ||
    usage.version !== 2 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(usage.windowStart) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(usage.windowEnd) ||
    usage.windowStart > usage.windowEnd ||
    !Number.isFinite(Date.parse(usage.updatedAt)) ||
    !Number.isFinite(Date.parse(usage.sourceUpdatedAt)) ||
    !usage.providers ||
    !isProviderUsage(usage.providers.codex) ||
    !isProviderUsage(usage.providers.claude) ||
    !isDailyCost(usage.dailyCost)
  ) {
    throw new Error('Usage update has an invalid format.');
  }
  return usage;
};
