'use client';

import { useAiUsage } from '@/hooks/use-ai-usage';
import { formatTokens } from '@/lib/ai-usage';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Jakarta',
});

export const AiConsumption = () => {
  const { usage, status, error } = useAiUsage();
  const providers = [
    { tool: 'Codex', tokens: usage.providers.codex.tokens },
    { tool: 'Claude', tokens: usage.providers.claude.tokens },
  ];

  return (
    <section
      aria-label="Monthly AI consumption"
      title={`Input + output tokens, including cached context, across all projects. ${usage.windowStart}–${usage.windowEnd}.`}
      className="mt-6 grid gap-4"
    >
      <p className="type-meta text-muted-foreground">Monthly consumption</p>
      <dl className="grid grid-cols-2 gap-4">
        {providers.map(({ tool, tokens }) => (
          <div key={tool} className="work-metric">
            <dt className="type-label">{tool}</dt>
            <dd className="work-section-title font-display">
              {formatTokens(tokens)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="type-meta text-muted-foreground">
        tokens · past 30 days · updated{' '}
        <time dateTime={usage.sourceUpdatedAt}>
          {dateFormat.format(new Date(usage.sourceUpdatedAt))}
        </time>
      </p>
      {status === 'error' ? (
        <p role="status" title={error ?? undefined} className="type-meta">
          Update unavailable. Showing last recorded usage.
        </p>
      ) : null}
    </section>
  );
};
