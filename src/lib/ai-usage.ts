import snapshot from '@/data/ai-usage.json';

export type AiUsage = typeof snapshot;

export const INITIAL_AI_USAGE: AiUsage = snapshot;
export const AI_USAGE_URL =
  'https://gist.githubusercontent.com/JohanesPeterV/39230a0a9b68ec5f7d218c1a704d93b0/raw/ai-usage.json';

const tokenFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatTokens = (tokens: number): string =>
  tokenFormat.format(tokens);

const isCount = (value: number): boolean =>
  Number.isSafeInteger(value) && value >= 0;

const isProviderUsage = (value: AiUsage['providers']['codex']): boolean =>
  value !== null &&
  typeof value === 'object' &&
  isCount(value.tokens) &&
  isCount(value.sessions);

const isDailyUsage = (daily: AiUsage['daily']): boolean =>
  Array.isArray(daily) &&
  daily.length > 1 &&
  daily.every(
    (day) =>
      day !== null &&
      typeof day === 'object' &&
      /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
      isCount(day.codex) &&
      isCount(day.claude),
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
    usage.version !== 1 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(usage.windowStart) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(usage.windowEnd) ||
    usage.windowStart > usage.windowEnd ||
    !Number.isFinite(Date.parse(usage.updatedAt)) ||
    !Number.isFinite(Date.parse(usage.sourceUpdatedAt)) ||
    !usage.providers ||
    !isProviderUsage(usage.providers.codex) ||
    !isProviderUsage(usage.providers.claude) ||
    !isDailyUsage(usage.daily)
  ) {
    throw new Error('Usage update has an invalid format.');
  }
  return usage;
};
