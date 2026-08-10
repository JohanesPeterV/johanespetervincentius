# Review Rules

Use this file for automated and explicit reviews. `AGENTS.md` owns the hard gates, optional `REVIEW_FOCUS.md` supplies current priority, and relevant feature documents own local intent.

## Candidate Scope

- Review committed source on `dev` only. Never include uncommitted files in the review range.
- Walk first-parent commits after the automation-memory watermark in chronological order. Select one coherent range that represents one route, feature, or implementation concern.
- Ignore commits containing only queue files, agent rules, review policy, documentation, formatting, generated files, or automation memory. Review a mixed commit when it also contains substantive source or build-configuration changes.
- Defer a candidate without advancing its watermark when its source paths are dirty or owned by an active task.
- Establish intent from commit messages, changed callers, relevant feature documents, and `REVIEW_FOCUS.md` when present. If intent remains ambiguous, do not queue a guess.

## Default Focus

When `REVIEW_FOCUS.md` is absent, review the selected committed range for evidence-backed optimisation and refactoring opportunities:

- Remove clear duplication, dead work, avoidable renders, allocation churn, or unnecessary runtime cost.
- Reuse an existing helper, component, hook, or pattern when the reviewed change introduced a parallel implementation.
- Simplify component, hook, state, and module boundaries when current code creates concrete maintenance or correctness risk.
- Preserve behaviour and visual intent. Do not invent features, redesign working UI, introduce speculative abstractions, or queue micro-optimisations without a reproducible cost.

The default focus is a prioritisation lane, not permission for repo-wide cleanup. An empty review remains valid.

## Reviewer Wave

Run exactly two independent, read-only reviewers in parallel. Give both the exact commit range, owned files, intent, relevant rulebooks, and known unrelated failures. Each reviewer gets one turn, must not delegate, and must not edit files.

### Runtime Experience

Inspect behaviour, edge cases, keyboard and pointer interaction, accessibility, responsive behaviour, browser console failures, animation continuity, WebGL lifecycle, frame stability, and weaker-hardware degradation. Check security only when the change introduces user input, external URLs, browser trust boundaries, or side effects.

### Design And Code Shape

Inspect feature-spec compliance, visual hierarchy, component and hook boundaries, state ownership, naming, semantic colours, reuse, abstraction cost, call-site readability, file-size limits, and whether complexity was removed rather than moved.

## Finding Bar

A finding survives only when all of these are true:

- The reviewed change introduced it or made it materially worse.
- It still exists in current committed code.
- The exact affected scenario, route, input, viewport, or runtime condition is identified.
- It meaningfully affects correctness, accessibility, performance, security, visual intent, or maintainability.
- The author would reasonably fix it after seeing the evidence.

Do not report formatting trivia, personal taste, speculative concerns, pre-existing issues, or extraction based on line count alone. An empty review is valid.

## Consolidation

- Wait for both reviewers, then independently validate every finding against current code and matching rulebooks.
- Reproduce browser or runtime claims when practical.
- Remove duplicates and search `queue/AUTOMATED_REVIEW_FIXES.md`, automation memory, and recent queue history for equivalent work.
- Set queue capacity to the number of active queue-worker automations targeting this repository. Count `[ ]` and `[-]` rows as outstanding work; `[v]` rows wait for cleanup and do not create new capacity.
- Add no more rows than available capacity. With the current single worker automation, create at most one outstanding row and never append while its queue still exists.
- When multiple findings survive, queue the highest-impact cohesive concern and keep the rest deferred in automation memory. Revalidate deferred findings after capacity reopens before reviewing a new range.
- Every row must identify where to start, the concrete end state, and how completion is proved.

The reviewer automation may create queue work but must never edit source code. Source implementation belongs only to the queue worker.
