'use client';

import { AI_USAGE_TOOLS } from '@/app/_components/stack';
import { useAiUsage } from '@/hooks/use-ai-usage';
import { formatCost, formatTokens, totalAiUsageCost } from '@/lib/ai-usage';

export default function AiUsageLine() {
  const { usage } = useAiUsage();

  return (
    <div
      title="Estimated at API prices"
      className="type-meta flex flex-col items-center gap-1 text-muted-foreground"
    >
      <p>
        <span className="tabular-nums text-foreground">
          {formatCost(totalAiUsageCost(usage))}
        </span>{' '}
        AI usage · last 30 days
      </p>
      <ul className="flex gap-4">
        {AI_USAGE_TOOLS.map(({ provider, name, icon: Icon, color }) => (
          <li key={provider} className="flex items-center gap-1.5">
            <Icon role="img" aria-label={name} className={`size-3 ${color}`} />
            <span>
              <span className="tabular-nums text-foreground">
                {formatTokens(usage.providers[provider].tokens)}
              </span>{' '}
              tokens
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
