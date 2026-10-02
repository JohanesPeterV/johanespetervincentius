const MONTHLY_USAGE = [
  { tool: 'Codex / GPT', tokens: '9.90B', sessions: '1,056' },
  { tool: 'Claude Code', tokens: '12.1B', sessions: '1,333' },
];

export const AiConsumption = () => (
  <section aria-label="My AI consumption" className="mt-6 grid gap-4">
    <p className="type-meta text-muted-foreground">
      My AI consumption · 30 days · 4 Sep–3 Oct 2026
    </p>
    <dl className="grid grid-cols-2 gap-4">
      {MONTHLY_USAGE.map(({ tool, tokens, sessions }) => (
        <div key={tool} className="work-metric">
          <dt className="type-label">{tool}</dt>
          <dd className="work-section-title font-display">{tokens}</dd>
          <dd className="type-meta text-muted-foreground">
            tokens · {sessions} sessions
          </dd>
        </div>
      ))}
    </dl>
    <p className="type-meta text-muted-foreground">
      Input + output, including cached context. Across all projects.
    </p>
    <p className="type-meta text-muted-foreground">
      Codex profile: 59B lifetime tokens · snapshot 3 Oct 2026
    </p>
  </section>
);
