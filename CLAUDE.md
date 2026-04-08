# Portfolio Site - Agent Operating Manual

`CLAUDE.md` and `AGENTS.md` must stay identical. If one changes, update the other in the same commit.

## Rule Priority

Read and follow sections in this order:

1. `Execution Contract`
2. `Commit Protocol`
3. `Code Gate`
4. `Anti-Bypass Rules`
5. Everything else in this file

If two instructions conflict, use the stricter reading. If a rule can be interpreted loosely or strictly, use the strict interpretation.

## Execution Contract

These rules are non-negotiable.

- If you modify, create, delete, or rename any file, the task is not complete until a commit succeeds.
- Do not end a task with intended local changes left uncommitted.
- Do not ask the user for permission to commit after making changes.
- Commit after each coherent change. One logical unit per commit.
- Do not bundle unrelated work into one commit.
- A valid commit should describe one conceptual area in one short sentence.
- Use a one-line conventional commit subject such as `feat: add project card hover animation` or `fix: prevent theme flash on load`.
- This file is meant to block bypass behavior. Follow both the letter and the intent.

Completion test:

- At least one commit covering your changes exists.
- Any required verification has passed.
- Your final response includes the commit hash and commit message.

## Commit Protocol

Follow this sequence every time you change files:

1. Run `git status --short`.
2. Run `wc -l` on every modified `.tsx` and `.ts` file.
3. If a touched `.tsx` file is over 300 lines or a touched `.ts` file is over 500 lines, split it before committing.
4. If Git requires staging a new or renamed file, stage only that exact path:

```bash
git add -- path/to/new-file path/to/renamed-file
```

5. Commit only the files you changed, listed explicitly:

```bash
git commit -m "type: intent" -- path/to/file1 path/to/file2
```

6. Re-run `git status --short`.
7. Include the commit hash and commit message in the final response.

Hard Git rules:

- Never use `git add .`, `git add -A`, or directory-wide staging.
- Never skip hooks.
- Never use `--no-verify`.
- Never amend unless the user explicitly asks for an amend.
- Never push unless the user explicitly asks.

If a commit fails:

- Fix the actual problem.
- Re-read affected files if time has passed or a hook changed files.
- Retry until the commit succeeds.
- Do not claim the task is done before the commit succeeds.

## Code Gate

Apply these rules before writing code.

### Never Do These

- No `any`, `unknown`, `as`, `@ts-ignore`, or `as unknown as X`
- No `@ts-expect-error` in production code
- No `void` operator
- No boolean parameters
- No braceless `if`, `else`, `for`, or `while`
- No nested ternaries
- No comments except `// REASON:`
- No CSS files other than `globals.css`
- No broad `git add`

### Required Shape

- Put types at the top of the file
- Prefer guard clauses and early returns
- Prefer const arrow functions with explicit types
- Use `handleX` for event handlers
- Prefer verb-noun function names such as `fetchUserProfile`
- Use semantic colors such as `bg-primary`, `bg-muted`, and `text-foreground`
- Keep to 2 parameters when practical; 4 or more requires an options object
- Treat abbreviations as words in new or touched names: `PdfViewer`, `HslColor`

### File And State Limits

- Max 300 lines per `.tsx`
- Max 500 lines per `.ts`
- Max 3 `useState` calls per component or hook
- Data-only files such as `src/registry/registry-base-colors.ts` are exempt from file size limits

If you touch a file that already breaks these rules, fix that file as part of your change unless the user explicitly scoped it out.

## Anti-Bypass Rules

These rules exist because agents often try to satisfy the checker instead of solving the problem.

- Fix root cause. Do not suppress errors just to make lint, typecheck, hooks, or build pass.
- Do not weaken ESLint, TypeScript, Next.js, Husky, or build settings unless the user explicitly requested that config change.
- Do not broaden types, add fake fallback code, or move logic around only to appear compliant.
- Do not hide a bad design inside a helper, hook, or new file.
- Do not split files or commits in a misleading way just to satisfy a rule on paper.
- Do not reinterpret `one concern` or `one logical unit` so broadly that unrelated work slips through.
- If the rule is hard to satisfy, redesign the code instead of gaming the rule.

## Repo Context

### Commands

```bash
npm run dev          # Start dev server with Turbopack on port 6767
npm run build        # Production build
npm run lint         # ESLint with zero warnings allowed
npm run format       # Prettier format all files
npm run format:check # Prettier check only
npm run check:sizes  # File size checks
```

### Architecture

This repo is a Next.js 15 portfolio site using the App Router, TypeScript, TailwindCSS, shadcn/ui, Jotai, `next-themes`, Three.js, React Three Fiber, React Three Drei, and `react-fluid-distortion`.

Key paths:

```text
src/
├── app/                    # App Router pages
│   ├── _components/        # Page-specific components
│   ├── cv/                 # Resume page
│   └── utils/              # Utility pages such as random-picker
├── components/
│   ├── 3d/                 # Three.js and R3F components
│   ├── backgrounds/        # WebGL background
│   ├── theme-buttons/      # Theme switching UI
│   └── ui/                 # Vendored shadcn/ui components
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
└── registry/               # Theme data
```

Path alias: use `@/*` for `src/*` imports.

Theme model:

- Dark and light mode come from `next-themes`
- Base color themes come from `src/registry/registry-base-colors.ts`
- Theme choice is persisted with Jotai `atomWithStorage`

Background model:

- `home-background.tsx` renders the fluid distortion background
- GPU tier detection is used to adjust rendering behavior
- Colors are derived from the active base color

## React And Frontend

- Default to Server Components. Add `"use client"` only when required.
- Page-specific components belong in `app/.../_components/`.
- Prefer plain functions for pure computation. Hooks are for React integration only.
- Do not generalize before the third real use case.
- Design APIs from the caller side first.

### `useEffect`, `useMemo`, `useCallback`

Do not use these by default.

They are allowed only when all of the following are true:

1. The problem is specific and real.
2. A simpler alternative was considered.
3. The simpler alternative failed for a concrete reason.
4. A `// REASON:` comment is placed directly above the hook.

Allowed `// REASON:` examples:

- `// REASON: useState only captures initial value - sync when URL changes via back/forward`
- `// REASON: plain const recalculates 10k-row filter on every keystroke, causing 200ms frame drops`

Not allowed:

- `// REASON: memoize for performance`
- `// REASON: prevents unnecessary re-renders`
- `// REASON: value depends on state`

If the app is not broken or visibly janky without the hook, do not use the hook.

### No God Hooks Or God Components

Splitting code into a large hook does not make it simpler.

Bad signs:

- 4 or more `useState` calls in one component or hook
- 5 or more returned state fields and 5 or more handlers from one hook
- Two unrelated concerns living in the same component or hook

Required response:

- One component or hook owns one concern.
- Components accept only the props they use.
- Pure derived computation stays in plain utilities.

## Design Guidance

- Prefer extraction by identity, not by file length.
- A long file should be long because of markup, not sprawling logic.
- Search before creating a new helper, hook, utility, or component.
- Extend an existing near-fit before creating a duplicate.
- If you find duplication in a file you are already touching, remove it there.

## Liquid Glass Guidance

Use liquid-glass styling for floating surfaces such as dropdowns, dialogs, sheets, popovers, tooltips, and navigation overlays.

Avoid it for main content areas, inline inputs, tables, and static content sections.

Reference pattern:

```ts
className =
  'bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/20 shadow-2xl ring-1 ring-black/5';
```

## Exemptions

- `src/components/ui/` is vendored shadcn code and is exempt from these rules
- `src/registry/registry-base-colors.ts` is data-only and exempt from file size limits
- `src/components/3d/macbook-showcase.tsx` may keep `as THREE.Mesh` assertions required by `useGLTF` node typing

## Concurrent Agent Discipline

Other agents may be working in this repo at the same time.

- Commit with explicit file paths.
- Stage only exact new or renamed paths when required.
- Do not touch files you did not edit for your task.
- If `git status` shows unexpected files, leave them alone.
- If a command fails or time has passed, re-read the file before editing.

Do not run destructive commands such as `git revert`, `git cherry-pick`, `git reset`, `git checkout .`, `git restore .`, `git stash`, or `git clean` without explicit user approval.

## Verification

After every change, run:

```bash
npm run build
npm run lint
```

Both must pass before committing.
