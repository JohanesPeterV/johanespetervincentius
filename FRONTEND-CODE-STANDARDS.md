# Frontend Code Standards

`CLAUDE.md` / `AGENTS.md` is the hard-gate summary; this file is the source of truth for React, route pages, component APIs, hooks, local file organisation, and how design tokens are applied in code.

The goal is not smaller code for its own sake. The goal is frontend code a reviewer can scan, trust, and safely change without reconstructing hidden state.

## Core Taste

- A route reads as page composition before it reads as workflow implementation.
- A component API reads as UI structure, not a switchboard of flags.
- A hook owns one React concern, not an entire feature.
- Prefer specific local code over generic abstractions until the third real use case proves reuse.
- Extract by concept ownership, not by line count alone.
- Helpers, hooks, and wrappers must make the usage site easier to scan, not merely move complexity out of sight.

## Hard Gates

- No `useEffect`, `useMemo`, or `useCallback` unless this file's hook exception is met.
- Max `300` LOC per `.tsx` file and max `500` LOC per `.ts` file.
- Max `3 useState` calls per component or hook.
- No bag props such as `{ model, actions }` or large options objects that hide what is actually used.
- Errors must be visible in the UI, not swallowed.

When a hard gate is hit, fix the boundary. Do not split mechanically just to satisfy a number.

## Route Pages And Components

- Server Components by default. Add `"use client"` only for browser APIs, client state, event handlers, R3F or Three.js canvases, or client-owned data freshness.
- Treat `page.tsx` as the Next.js route shell: it owns `metadata`, route config, `params`, `searchParams`, and passing the minimum state onward.
- Page-specific components belong in `app/.../_components/`.
- The primary page implementation should expose the page shape — header, sections, actions — not inline a hidden state machine.
- A long file should be long because of markup, not sprawling logic.

Smells:

- 4 or more derived booleans before the main JSX.
- A return block you cannot scan to name the visible sections.

## Hooks

Do not use `useEffect`, `useMemo`, or `useCallback` unless all of these are true:

1. The problem is specific and real — you can name the exact bug or measured performance problem.
2. A plain variable, plain function, or restructured component was considered and rejected for a concrete reason.
3. A `// REASON:` comment sits directly above the hook explaining why it is necessary.

Allowed `// REASON:` examples:

- `// REASON: useState only captures initial value - sync when URL changes via back/forward`
- `// REASON: plain const recalculates 10k-row filter on every keystroke, causing 200ms frame drops`
- `// REASON: bridge to imperative Three.js / GSAP API that cannot be expressed through React props`

Not allowed:

- `// REASON: memoize for performance`
- `// REASON: prevents unnecessary re-renders`
- `// REASON: value depends on state`

If the app is not broken or visibly janky without the hook, do not use the hook. Pure computation belongs in a plain function; a custom hook with no React state, context, or lifecycle need is a utility function.

## Component APIs

- Write the usage site first when building 3 or more related components.
- Prefer declarative composition over toggle-heavy props.
- Keep props narrow and pass only what the child actually uses. Do not pass full hook returns into children that need a few fields.
- Boolean-heavy component APIs are a smell. Replace them with named variants, separate components, or composition.
- Keep to 2 parameters when practical; 4 or more requires an options object.

## No God Hooks Or God Components

Splitting code into a large hook does not make it simpler.

Bad signs:

- 4 or more `useState` calls in one component or hook.
- 5 or more returned state fields and 5 or more handlers from one hook.
- Two unrelated concerns living in the same component or hook.

Required response: one component or hook owns one concern; components accept only the props they use; pure derived computation stays in plain utilities.

## Naming And Shape

- Put types at the top of the file.
- Prefer guard clauses and early returns.
- Prefer const arrow functions with explicit types.
- Use `handleX` for event handlers and verb-noun names such as `fetchUserProfile`.
- Treat abbreviations as words in new or touched names: `PdfViewer`, `HslColor`.
- Names must reveal intent: read the name, predict what it does, read the implementation. A function named for its call site or its file cannot be moved or reused.

## Styling And Tokens

- No CSS files other than `globals.css`.
- Use semantic colours such as `bg-primary`, `bg-muted`, and `text-foreground`. Do not hardcode interface colours.
- `className` may arrange layout: display, grid, flex, width, alignment, gap, truncation, overflow, and responsive visibility.
- Do not restyle design tokens — colour, typography, border, radius, shadow, surface, hover, focus, selected, disabled — with one-off utilities when a token or a `src/components/ui` variant already exists.
- Floating-surface glass treatment direction lives in `FRONTEND-DESIGN-PRINCIPLES.md`.

## File Organisation

- Search before creating a new helper, hook, utility, or component; extend an existing near-fit before duplicating.
- If you find duplication in a file you are already touching, remove it there.
- Prefer extraction by identity, not by file length.
- Keep files used only inside one concern inside that concern.

## Exemptions

- `src/components/ui/` is vendored shadcn code and is exempt from these rules.
- `src/registry/registry-base-colors.ts` is data-only and exempt from file size limits.
- `src/components/3d/macbook-showcase.tsx` may keep `as THREE.Mesh` assertions required by `useGLTF` node typing.
