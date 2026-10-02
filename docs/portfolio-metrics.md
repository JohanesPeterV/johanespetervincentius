# Portfolio metric sources

This broad first pass uses the research in T3 thread
`be12264d-c712-49b9-996a-cb664bdcbc86` and its retained evidence under
`/Users/peter/Projects/smilie/raise-review-2026/`.

The displayed content lives in
`src/app/_components/work-experience/work-experiences.ts`. These notes preserve
the meaning and source of the figures for later editing.

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

`evidence/total-token-scope.md` establishes 30,787,011,023 retained Smilie input-plus-
output tokens and 118,646,249 output tokens for January–September 2026. Cached
context is included in input; reasoning is included in output; retention is partial.
The separately verified Codex profile counter is 56.4B lifetime tokens across
projects. These overlapping activity scopes do not establish productivity or savings.
