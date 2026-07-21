# Portfolio Site — Agent Rules

`CLAUDE.md` and `AGENTS.md` must stay identical. If one changes, update the other in the same commit. This file is the canonical ruleset; if any other instruction conflicts with it, follow this file. If a rule can be read loosely or strictly, use the strict reading.

Clearer does not mean weaker. These rules are strict; the levels below only separate invariants, blockers, and defaults so agents execute them without guessing priority.

## Rule Levels

- **FATAL**: invariant. If violated, stop and fix before continuing.
- **BLOCKER**: required prerequisite. Work cannot start or be considered done until the blocker is cleared.
- **DEFAULT**: normal repo behaviour. Follow it unless a more specific rule says otherwise.

## Fatal Invariants

### Code Shape

- **FATAL**: No `any`, `unknown`, `as`, `@ts-ignore`, `@ts-expect-error`, or `as unknown as X` in production code. See `Exemptions`.
- **FATAL**: No `void` operator and no boolean parameters.
- **FATAL**: No braceless `if`, `else`, `for`, or `while`, and no nested ternaries.
- **FATAL**: No comments except `// REASON:` explaining a non-obvious decision.
- **FATAL**: No CSS files other than `globals.css`.
- **FATAL**: No `useEffect`, `useMemo`, or `useCallback` unless `FRONTEND-CODE-STANDARDS.md`'s hook exception is met and a `// REASON:` comment sits directly above the hook.
- **FATAL**: Max `300` LOC per `.tsx` file and max `500` LOC per `.ts` file. Data-only files such as `src/registry/registry-base-colors.ts` are exempt.
- **FATAL**: Max `3 useState` calls per component or hook.

### Git and Ownership

- **FATAL**: If you modify, create, delete, or rename any file, the task is not done until the owned files are committed successfully.
- **FATAL**: Treat uncommitted work as disposable. Forgetting to commit your own changes means the work is lost.
- **FATAL**: Never use `git add .`, `git add -A`, or directory-wide staging. Stage exact paths only.
- **FATAL**: Never skip hooks. Use `--no-verify` only when the user explicitly requests bypassing hooks for the current commit.
- **FATAL**: Never amend, push, or run destructive Git commands unless the user explicitly asks. Follow `GIT.md`.

### Anti-Bypass

- **FATAL**: Fix root cause. Do not suppress errors just to make lint, typecheck, hooks, or build pass.
- **FATAL**: Do not weaken ESLint, TypeScript, Next.js, lefthook, or build settings unless the user explicitly requested that config change.
- **FATAL**: Do not broaden types, add fake fallbacks, hide a bad design inside a helper or hook or file, or split files or commits in a misleading way just to satisfy a rule on paper. If a rule is hard to satisfy, redesign the code.

## Required Reading

Read files before editing them. Read only the rulebooks that match the owned change; if multiple rows match, read all matching rulebooks before editing.

| Trigger                                                          | Required before editing                     |
| ---------------------------------------------------------------- | ------------------------------------------- |
| Any repo task                                                    | `CLAUDE.md` / `AGENTS.md`                   |
| React components, pages, hooks, styling, or UI composition       | `FRONTEND-CODE-STANDARDS.md`                |
| Visual hierarchy, Liquid Glass treatment, theme or 3D look       | `FRONTEND-DESIGN-PRINCIPLES.md`             |
| Reviewing committed changes or writing review findings           | `REVIEW.md`; `REVIEW_FOCUS.md` when present |
| Queue creation, claims, status changes, recovery, or cleanup     | `queue/AGENTS.md`                           |
| Committing or dirty-worktree handling                            | `GIT.md`                                    |
| Implementation tradeoffs are unclear or no other rulebook covers | `CLEAN-CODE.md`                             |

## Operating Defaults

- **DEFAULT**: Prefer the smallest correct change that fits the existing architecture.
- **DEFAULT**: Reduce complexity instead of moving it into a helper, hook, or wrapper.
- **DEFAULT**: Search for an existing helper, hook, utility, or component before creating one; extend a near-fit before duplicating.
- **DEFAULT**: Fix rule violations in files you touch when they are part of the same concern.
- **DEFAULT**: Do not generalise before the third real use case.
- **DEFAULT**: Default to Server Components; add `"use client"` only when required.
- **DEFAULT**: Use semantic colours such as `bg-primary`, `bg-muted`, and `text-foreground`. Do not hardcode interface colours.
- **DEFAULT**: Treat abbreviations as words in new or touched names: `PdfViewer`, `HslColor`.

## Automated Review Queue

- **BLOCKER**: When present, `REVIEW_FOCUS.md` prioritises review scope but never creates a finding by itself. When absent, use the evidence-bound optimise-and-refactor default in `REVIEW.md`.
- **BLOCKER**: The reviewer automation may create or update only `queue/AUTOMATED_REVIEW_FIXES.md`; it must never implement source fixes.
- **BLOCKER**: The queue worker may implement only one validated row at a time and must never invent work when no pending row exists.
- **BLOCKER**: Outstanding queue rows (`[ ]` plus `[-]`) must never exceed the number of active queue-worker automations targeting this repository. With the current single worker automation, queue capacity is one row.
- **BLOCKER**: Treat queue-only, agent-rule-only, review-policy-only, and automation-memory-only commits as administrative changes, not new source-review candidates. Mixed commits containing source changes remain reviewable.
- **BLOCKER**: Follow `queue/AGENTS.md` for committed claims, lease recovery, releases, and final queue cleanup.

## Verification

- **BLOCKER**: After any executable code change, run `npm run build` and `npm run lint` (zero warnings allowed). Both must pass before committing.
- **BLOCKER**: Run `npm run check:sizes` when you add or grow `.tsx` or `.ts` files.
- Do not run project checks for text-only docs or agent-prompt edits; rely on the commit hooks for formatting.

## Commit Protocol

Follow `GIT.md`. Summary:

1. Run `git status --short`.
2. Run `wc -l` on every modified `.tsx` and `.ts` file; split before committing if a `.tsx` is over 300 lines or a `.ts` is over 500 lines.
3. Stage only exact new or renamed paths when Git requires it: `git add -- path/to/file`.
4. Commit only files you changed, listed explicitly:

```bash
git commit -m "type: intent" -- path/to/file1 path/to/file2
```

5. Re-run `git status --short`.
6. Include the commit hash and commit message in the final response.

Completion test: at least one commit covers your changes, any required verification passed, and your final response includes the commit hash and commit message.

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

Git hooks run through lefthook: pre-commit lints, checks Prettier formatting, and checks file sizes on staged files; pre-push runs a typecheck via `next build`.

### Architecture

Next.js 15 portfolio site using the App Router, TypeScript, TailwindCSS, shadcn/ui, Jotai, `next-themes`, Three.js, React Three Fiber, React Three Drei, and `react-fluid-distortion`.

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

- Dark and light mode come from `next-themes`.
- Base color themes come from `src/registry/registry-base-colors.ts`.
- Theme choice is persisted with Jotai `atomWithStorage`.

Background model:

- `home-background.tsx` renders the fluid distortion background.
- GPU tier detection is used to adjust rendering behaviour.
- Colors are derived from the active base color.

## Exemptions

- `src/components/ui/` is vendored shadcn code and is exempt from these rules.
- `src/registry/registry-base-colors.ts` is data-only and exempt from file size limits.
- `src/components/3d/macbook-showcase.tsx` may keep `as THREE.Mesh` assertions required by `useGLTF` node typing.
