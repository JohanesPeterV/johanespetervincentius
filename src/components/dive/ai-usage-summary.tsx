'use client';

import { useAiUsage } from '@/hooks/use-ai-usage';
import {
  AI_USAGE_TOOLS,
  formatCost,
  formatTokens,
  totalAiUsageCost,
} from '@/lib/ai-usage';

const countFormat = new Intl.NumberFormat('en');
const shareFormat = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export const AiUsageSummary = () => {
  const { usage } = useAiUsage();
  const tools = AI_USAGE_TOOLS.map((tool) => ({
    ...tool,
    ...usage.providers[tool.provider],
  }));
  const totalCost = totalAiUsageCost(usage);
  const totalSessions = tools.reduce((sum, { sessions }) => sum + sessions, 0);
  const shareOf = (cost: number): string =>
    shareFormat.format(totalCost > 0 ? cost / totalCost : 0);

  return (
    <div className="grid gap-8">
      <div>
        <p className="identity-tag type-meta">AI usage · last 30 days</p>
        <p className="work-section-title font-display tabular-nums">
          {formatCost(totalCost)}
        </p>
        <p className="type-meta mt-2 text-muted-foreground">
          {countFormat.format(totalSessions)} sessions · estimated at API prices
        </p>
      </div>
      <dl className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {tools.map(
          ({ provider, name, icon: Icon, color, cost, sessions, tokens }) => (
            <div
              key={provider}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2.5 gap-y-1"
            >
              <Icon aria-hidden className={`size-4 ${color}`} />
              <dt className="stack-technology">{name}</dt>
              <dd className="stack-technology tabular-nums">
                {formatCost(cost)}
              </dd>
              <dd className="type-meta col-start-2 col-end-4 text-muted-foreground">
                {`${countFormat.format(sessions)} sessions · ${formatTokens(tokens)} tokens · ${shareOf(cost)} of cost`}
              </dd>
            </div>
          ),
        )}
      </dl>
    </div>
  );
};
