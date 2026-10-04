'use client';

import { useAiUsage } from '@/hooks/use-ai-usage';
import { formatTokens, type AiUsageProvider } from '@/lib/ai-usage';

type AiUsageBadgeProps = {
  provider: AiUsageProvider;
};

export const AiUsageBadge = ({ provider }: AiUsageBadgeProps) => {
  const { usage } = useAiUsage();
  const tokens = formatTokens(usage.providers[provider].tokens);

  return (
    <span
      title={`${tokens} tokens in the past 30 days`}
      className="type-meta shrink-0 rounded-full border border-border px-2 text-muted-foreground"
    >
      {tokens}/month
    </span>
  );
};
