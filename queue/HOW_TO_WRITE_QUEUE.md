# How To Write The Automated Review Queue

`queue/AUTOMATED_REVIEW_FIXES.md` is a temporary executable specification, not a backlog or run log. A fresh worker must be able to execute each row without asking what the finding meant.

## Queue Shape

```md
# Automated Review Fixes

## Context

Validated findings from committed source review. Implement one row at a time.

## How To Use This Queue

Follow `queue/AGENTS.md`, claim one pending row, complete its proof, commit it as done, and clean up the file after the final row.

## Items

- [ ] REV-abcdef0-01 — Direct action with a concrete outcome.
  - Start: Exact route, file, or concern.
  - Done: Observable end state and invariant.
  - Verify: Commands and runtime behaviour that prove completion.
```

## Item Standard

- Use one stable ID derived from the reviewed source SHA and row number.
- Make one row one cohesive implementation concern, not a mechanical step or a collection of unrelated fixes.
- State where to start, what done means, and how to verify it.
- Preserve implementation freedom. Specify the invariant and outcome, not unnecessary mechanics.
- Queue only validated findings that satisfy `REVIEW.md`. A focus file or the default optimise-and-refactor lane alone is not evidence.
- Add no more rows than the number of active queue-worker automations minus current `[ ]` and `[-]` rows. With the current single worker automation, the generated queue contains at most one outstanding row.
- When more findings survive than capacity permits, queue the highest-impact cohesive concern and defer the rest in automation memory for revalidation after capacity reopens.
- Never add reviewer transcripts, screenshots, command output, progress notes, investigation diaries, or stale blocker history.
- Keep completion as `[v]` with the original item text. Put detailed proof in the implementation commit or automation memory.

## Verification

Every executable row requires:

- `npm run build`.
- `npm run lint` with zero warnings.
- `npm run check:sizes` when a `.ts` or `.tsx` file is added or grows.
- `git diff --check`.
- Browser verification for visible UI, motion, responsive, accessibility, or 3D behaviour.
- The matching feature Definition of Done when one exists.

Do not invent a test command while the repository has no test runner. If a future change adds a real test harness, update the repository rules before requiring it here.

## Lifecycle

Create the queue only with validated pending work. Claims, releases, implementation completion, stale-lease recovery, and final deletion follow `queue/AGENTS.md`. There is no priority index while this is the repository's only queue producer.
