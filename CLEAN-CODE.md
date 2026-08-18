# Clean Code Defaults

Hard constraints live in `FRONTEND-CODE-STANDARDS.md` and `GIT.md`. This file is not a hard gate — it answers a different question: when multiple valid solutions exist, which one fits this codebase best?

Rules produce correct code. The concepts below produce composed, plug-and-play code that the next engineer can scan and trust in 10 seconds.

## Core Principle

- Make the smallest correct change that fits the existing architecture.
- Prefer obvious, local, boring code over clever, generic, or reusable-by-default code.
- Reduce complexity. Do not merely move complexity into a helper, hook, or wrapper.
- Preserve existing patterns when they are already clean enough.

## Design The Consumer First

For any system with 3 or more related components, write the usage site (page or parent) before building internals. The page should read like config, not implementation.

If the parent needs to know a section's internals to wire it up, the boundary is wrong. Fix the boundary, not the wiring.

Each section component should work independently: manage its own sub-components, be added, removed, or reordered in the parent without touching internals, and be understood by reading only that component. If a parent looks clean only because a child hook owns all the state and actions, complexity was hidden, not reduced.

## Extract By Identity, Not By Size

Do not extract just because a file is long. Extract when a piece has its own conceptual identity — a name, a purpose, and a reason to exist apart from its current caller.

- ✅ Extract `buildThemeColors` — has a name, a clear purpose, testable alone.
- ✅ Extract `ThemeSwitcherDialog` — a distinct user action with its own UI flow.
- ❌ Do not extract a 20-line JSX fragment used once that needs 5 props passed to it.

A new helper, hook, or component must make the usage site simpler — not just shorten the current file. Moving 30 lines into a helper that now needs a 6-field options object is not a win.

## Abstraction Restraint

Do not build generic or reusable versions preemptively. Build the specific thing first. Generalise only when a third use case appears, or when the abstraction clearly matches a concept that already exists. Three similar code blocks are better than a premature abstraction. If a name requires a comment to explain its purpose, the naming or the boundary is wrong.

## Product-Informed Boundaries

Component boundaries should mirror user actions, not technical categories. If you can describe what a component does in one sentence from the user's perspective, the boundary is right. If you have to say "it handles the top part of the page" or "it owns the middle section", the boundary is wrong — split by what the user is doing.

## Helpers: Pure Functions Over Hooks

When logic is pure computation — no side effects, no state, no React — it belongs in a plain function.

- ✅ `pickRandomItem(items)` — plain function in `lib/` or a local `utils.ts`.
- ❌ `usePickRandomItem()` that internally reads state just to transform data.

Hooks are for React integration: state, context, lifecycle. Business logic that transforms data should be a pure function — testable, portable, and free of React dependency. A hook that could have been a function will resist testing and drag React into every caller.

## Naming Clarity

Names must reveal intent. Read the name, predict what it does, read the implementation. If there is a mismatch, the name is wrong.

- ❌ `handleSearchSubmit` — describes the event, not the effect.
- ✅ `resetToFirstPage` — describes what happens.

Apply the same rule to files, folders, components, and variables. A function named for its call site or its file cannot be moved, reused, or understood out of context.

## State And Boundaries

- One unit owns one concern.
- Keep pure computation in plain functions, not hooks.
- Keep component props narrow and explicit — prefer a narrow signature over a broad options object until the parameter count forces a redesign.
- Split by user action or concern, not by arbitrary file slices.
- Prefer composing a few focused units over one configurable mega-unit.
- If two concerns do not share state, they usually should not live in the same hook or component.

## Data And Behavior

- Fail loudly instead of silently dropping data.
- Handle empty arrays, nullable values, and not-found paths explicitly.
- Prefer the source-of-truth type or enum over recreating local variants.
- Validate at boundaries — user input, external API responses. Trust internal code within the same area.

## Default Biases

- Extend an existing helper before creating a near-duplicate.
- Keep single-use logic inline when extraction would add indirection without improving readability.
- Prefer explicit branching over compact but harder-to-scan expressions.
- Start from the usage site. If it reads like machinery, fix the API, not the caller.

## Review Questions

Ask these before declaring a change done:

- Did this change become simpler, or did the complexity only move somewhere harder to see?
- Does the usage site read like config, or like wiring?
- Did I add an abstraction without enough real callers?
- Did I create a helper that duplicates an existing pattern in the repo?
- Would a senior engineer describe this solution as boring in a good way?
- If this component were dropped into a different page, would it still work without its current parent?
