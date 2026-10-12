# Portfolio metric sources

This broad first pass uses the research in T3 thread
`be12264d-c712-49b9-996a-cb664bdcbc86` and its retained evidence under
`/Users/peter/Projects/smilie/raise-review-2026/`.

Work content lives in `src/app/_components/work-experience/work-experiences.ts`.
Personal AI consumption appears as `AiUsageBadge` totals on Claude Code and Codex
in Main stack, with `AiUsageSummary` and the daily cost `AiUsageChart` under them
in the Skills exhibit. The API-estimated cost is personal tool usage, not a
company financial amount.
These notes preserve the meaning and source
of the figures for later editing.

## Publication scope

Company financial amounts are excluded from the portfolio and these notes:
revenue, billing totals, quarterly sales, reward values, points balances and
currency conversions, staff-cost assumptions, and subscription savings.
Describe engineering responsibilities and system capabilities without those amounts.

## Order counts

Sources: `analysis-data.json` and `methodology.md` in the evidence directory above.

- Calendar January–September 2026, Singapore time; snapshot 1 October 2026.
- There are 544 paid gift orders and 100 invoiced merchandise jobs.
- Records are grouped by order creation, using status at the snapshot.

## Gifting and courier scale

The September 2026 live GMS snapshot from this portfolio thread supplies
9,032 delivery order records, 8,707 gift sets ordered, 232 company accounts, and
305 campaigns. These are all-time records with different lifecycle stages.

`methodology.md` and `evidence/neon-financials.md` supply 5,879 noncancelled SPX
bookings created in January–September 2026, with 5,752 marked delivered at the
October snapshot.

## IG rewards

Sources: `evidence/convex-career.md` and
`evidence/convex-voucher-quality-aggregates.json`.

- There are 4,527 successful digital activations in January–September 2026,
  grouped by provider activation time, with unique provider order IDs.
- Fifteen cards with recorded retries later activated.
- Activation establishes provider issuance, not subsequent retailer spending.
- These production aggregates supersede the earlier June/August export lower bound.

## Operational and technology decisions

The portfolio describes courier and document automation, a simple technology
stack, and subscriptions matched to team needs. It publishes no modeled capacity
valuation, staff-cost assumptions, or monetary savings.

## Architecture and AI activity

`evidence/inherited-debt-delivery.md` establishes two duplicated form submission
owners consolidated into one shared owner while retaining application differences,
and webhook, customer-return, and reconciliation paths using one settlement owner.
These mechanisms do not establish a measured developer-time improvement.

Personal consumption is presented with T3 Code, Claude Code, and Codex in Main
stack, rather than as company impact. Two screenshots supplied by Peter on
3 October 2026 establish:

- T3 Usage, All environments, 30 days: 4 September–3 October 2026.
- Codex: 9.90B processed tokens across 1,056 sessions.
- Claude Code: 12.1B processed tokens across 1,333 sessions.
- Codex profile: 59B lifetime tokens across projects, superseding 56.4B.

The monthly counters now refresh from a public aggregate feed backed by a
scheduled local usage collector. See [automatic updates](ai-usage-sync.md).
The screenshots above preserve the initial reference; the visible totals roll
forward with the latest 30 days of retained usage, following T3's counting rules.

The presentation is deliberately quiet: Main stack lists the AI tools beside the
rest of the stack, and Codex and Claude Code each carry a small "tokens/mo"
badge. Session counts and the lifetime profile counter are not displayed.

Processed tokens include input, output, and cached context. The profile lifetime
counter has a different scope from the monthly retained usage. These activity
measures do not establish productivity or savings. The screenshots also show
monetary API estimates; these are not published.
