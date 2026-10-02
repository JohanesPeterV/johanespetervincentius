# Portfolio metric sources

This broad first pass uses the research in T3 thread
`be12264d-c712-49b9-996a-cb664bdcbc86` and its retained evidence under
`/Users/peter/Projects/smilie/raise-review-2026/`.

The displayed content lives in
`src/app/_components/work-experience/work-experiences.ts`. These notes preserve
the meaning and source of the figures for later editing.

## Commercial value

Sources: `analysis-data.json`, `methodology.md`, and
`evidence/neon-financials.md` in the evidence directory above.

- Calendar January–September 2026, Singapore time; snapshot 1 October 2026.
- S$569,373.46 combines S$287,775.63 of paid gift charges and S$281,597.83 of
  invoiced merchandise value. There are 544 paid gift orders and 100 invoiced
  merchandise jobs in those cohorts.
- Q1/Q2/Q3 totals are S$111,701.69 / S$76,040.85 / S$381,630.92. Q3 includes
  S$140,431.70 of imported Mooncake paid charges.
- Records are grouped by order creation, using status at the snapshot. This is
  gross commercial value supported by the platform, not personal incremental
  sales, profit, payment-date cash collection, or tax-stripped accounting revenue.
- Q4 2025–Q3 2026 recorded value is S$645,456.96 and includes the nine-month total.
  Retained Neon orders begin in November 2025.
- The earlier GMS dashboard revenue headline includes unpaid gift orders and is
  superseded by the narrower paid/invoiced measure on the portfolio.

## Gifting and courier scale

The September 2026 live GMS snapshot from this portfolio thread supplies
9,032 delivery order records, 8,707 gift sets ordered, 232 company accounts, and
305 campaigns. These are all-time records with different lifecycle stages.

`methodology.md` and `evidence/neon-financials.md` supply 5,879 noncancelled SPX
bookings created in January–September 2026, with 5,752 marked delivered at the
October snapshot.

## IG rewards

Sources: `evidence/convex-career.md`, `evidence/convex-verified-gift-points.json`,
and `evidence/convex-voucher-quality-aggregates.json`.

- Calendar January–September 2026 gift purchases total 100,003,900 points;
  refunds total 760,500 points; net gift points are 99,243,400. Lucky-draw points
  are excluded.
- At the supplied 6,500 points per S$5 reference, net gift points correspond to
  S$76,341.08 of voucher-equivalent budget. Physical gift pricing differs and a
  digital pricing exception exists; this is not actual fulfilled reward value.
- There are 4,527 successful digital activations worth S$43,145 in face value,
  grouped by provider activation time, with unique provider order IDs.
- Fifteen cards with recorded retries later activated, totaling S$75 face value.
- Activation establishes provider issuance, not subsequent retailer spending.
  Points, equivalent budget, and activated face value overlap and must not be added.
- These production aggregates supersede the earlier June/August export lower bound.

## Capacity and subscription reductions

Sources: `methodology.md`, `evidence/email-ownership-and-costs.md`, and
`evidence/thread-savings-audit.md`.

The capacity scenario is 208.47 hours / S$4,169.33: two net minutes per booking,
15 minutes per invoiced-job document task, 50% document adoption, and S$20/hour.
Timings and adoption are assumed. This is modeled capacity, with payroll cash
savings and incremental running costs unquantified.

Vercel seats changed from three to two, supporting US$240 in annual savings.
Peter confirmed on 3 October 2026 that the Clerk reduction is US$35/month,
or US$420 annually, superseding the earlier US$25/month candidate. The portfolio
shows both figures annually and emphasises deliberately keeping the stack and
operations simple to minimise recurring costs. Historical company-quarter cash
savings remain unreconciled; these annual figures are not paid-quarter totals.

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
