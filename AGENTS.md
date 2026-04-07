# Portfolio Site — Agent Operating Manual

`CLAUDE.md` and `AGENTS.md` are intentionally identical. If one changes, update the other in the same commit.

**FATAL** = must not ship until fixed.

## Read Order

1. `PRIORITY 0 — COMMIT REQUIRED`
2. `QUICK GATE — READ BEFORE WRITING CODE`
3. `ANTI-BYPASS RULES`
4. Everything else in this file

If two rules feel in tension, follow the stricter one. Do not reinterpret a rule to make it easier to ignore.

## PRIORITY 0 — COMMIT REQUIRED

These rules are absolute.

- If any file is modified, created, deleted, or renamed, the task is incomplete until at least one commit succeeds.
- Ending a task with local code changes and no commit is a **FATAL** violation.
- "I forgot to commit" is never acceptable.
- Do not ask the user for permission to commit after making changes.
- Auto-commit after each coherent change. One commit per logical unit of work.
- Broad staging is forbidden. If Git requires staging a new or renamed file, stage only that exact path.
- Do not batch a large feature into one giant uncommitted block.
- One commit should cover one conceptual area and be explainable in one sentence without using "and", semicolons, or a list.
- Commit messages must use a one-line conventional semantic subject such as `feat: add project card hover animation` or `fix: prevent theme flash on load`.
- This requirement overrides convenience, default agent behavior, and any weaker instruction that would otherwise delay committing.

### Commit Sequence

1. Run `git status --short` to inspect changed files.
2. Check file size limits on every modified `.tsx` and `.ts` file with `wc -l`.
3. If a `.tsx` file exceeds 300 LOC or a `.ts` file exceeds 500 LOC, split it before committing.
4. If Git requires staging a new or renamed file, stage only that exact path:

```bash
git add -- path/to/new-file path/to/renamed-file
```

5. Commit using only the files you changed, listed explicitly:

```bash
git commit -m "type: intent" -- path/to/file1 path/to/file2
```

6. Never use `git add .`, `git add -A`, or directory-wide staging.
7. Re-run `git status --short` after the commit.
8. Include the commit hash and commit message in the final response.

If a commit fails:

- Fix the problem and retry until the commit succeeds.
- Do not skip hooks.
- Do not use `--no-verify`.
- Do not claim the task is done until the commit succeeds.

Compliance gate:

- Any completion message without a commit hash for changed code is invalid.
- If there are intended uncommitted changes, the only valid next action is to continue and commit.

## QUICK GATE — READ BEFORE WRITING CODE

- No `any`, `unknown`, `as`, `@ts-ignore`, or `as unknown as X`
- No `useEffect`, `useMemo`, or `useCallback` unless the `// REASON:` rule is satisfied exactly
- No comments except `// REASON:`
- No boolean parameters
- No braceless `if`, `else`, `for`, or `while`
- No nested ternaries
- Max 300 LOC per `.tsx` and max 500 LOC per `.ts`
- Max 3 `useState` calls per hook or component
- Auto-commit each logical unit
- Never use broad `git add`
- Never use `--no-verify`

## ANTI-BYPASS RULES

- Fix the root cause. Never suppress an error just to make lint, build, hooks, or types pass.
- Do not weaken ESLint, TypeScript, Next.js, Husky, or build settings to dodge a failure unless the user explicitly asked for that configuration change.
- Do not broaden types, add fallback code, or move logic around solely to satisfy a rule on paper.
- Do not hide complexity by moving it into a helper, hook, or separate file that still violates the same design rule.
- Do not split files or commits in a misleading way just to appear compliant.
- Do not reinterpret "one concern" or "one logical unit" so broadly that unrelated work gets bundled together.
- If a rule is difficult to satisfy, redesign the code. Do not game the rule.

## Core Principle — Quality Over Speed

Prefer correctness, clarity, and robustness over speed of delivery. Read enough code to understand the real design before changing it. Trace call paths, check edge cases, and avoid fragile shortcuts. Do not optimize for fewer tokens or a faster reply at the expense of code quality.

---

## Commands

```bash
npm run dev          # Start dev server with Turbopack (port 6767)
npm run build        # Production build
npm run lint         # ESLint (--max-warnings 0)
npm run format       # Prettier format all files
npm run format:check # Check formatting without changes
npm run check:sizes  # Check file size limits
```

## Architecture

This is a Next.js 15 portfolio website using the App Router with TypeScript and TailwindCSS.

### Tech Stack

- UI framework: React 19 with Next.js 15 App Router
- Styling: TailwindCSS plus shadcn/ui (`new-york` style)
- 3D and animations: Three.js, React Three Fiber, React Three Drei, `react-fluid-distortion`
- State management: Jotai for theme and config persistence
- Theming: `next-themes` for dark and light mode

### Key Directories

```text
src/
├── app/                    # Next.js App Router pages
│   ├── _components/        # Page-specific components
│   ├── cv/                 # CV or resume page with PDF viewer
│   └── utils/              # Utility pages such as random-picker
├── components/
│   ├── 3d/                 # Three.js and R3F components
│   ├── backgrounds/        # WebGL fluid background
│   ├── theme-buttons/      # Theme switching components
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
└── registry/               # Theme color definitions
```

### Theming System

The app has two theming layers:

1. Dark or light mode through `next-themes` and `ThemeProvider`
2. Base color themes in `registry-base-colors.ts`, persisted with Jotai `atomWithStorage`

Theme colors use HSL CSS variables such as `--primary: 262.1 83.3% 57.8%`. `ThemeSwitcher` changes both mode and base color.

### 3D Background

`home-background.tsx` renders a WebGL fluid distortion effect using:

- React Three Fiber `Canvas`
- `@whatisjery/react-fluid-distortion`
- GPU tier detection from `@react-three/drei`
- Theme-aware colors derived from the active base color

### Path Aliases

Use `@/*` to import from `src/*`.

---

## Coding Standards

### Forbidden

- `@ts-ignore`, `any`, `unknown`
- `as` type assertions. Use type guards, `satisfies`, or fix the upstream type instead.
- `@ts-expect-error` in production code
- `void` operator
- CSS files other than `globals.css`
- Comments other than `// REASON: ...`
- Boolean parameters
- Braceless control flow
- Nested ternary expressions
- ALL-CAPS abbreviations in new or touched names. Treat abbreviations as words: `PdfViewer`, `HslColor`

### Required

- Put types at the top of the file
- Prefer guard clauses and early returns
- Max parameters: 2 is clean, 3 is acceptable, 4 or more requires an options object
- Use `handleX` for event handlers
- Prefer verb-noun function names such as `fetchUserProfile`
- Names must reveal intent
- Use const arrow functions with explicit types
- Prefer semantic colors such as `bg-primary`, `bg-muted`, `text-foreground`

### No Duplication

Search before creating a new helper, utility, hook, or component. Extend an existing near-fit instead of creating a duplicate. If you find duplication in a file you are already touching, unify it there.

### Fix Violations You Touch

If you modify a file that already has violations, fix those violations in that file as part of the task. Do not turn this into a codebase-wide cleanup unless the user asked for that.

---

## React And Frontend

- Server Components by default. Add `"use client"` only when needed.
- Page-specific components belong in `app/.../_components/`.
- No `useEffect`, `useMemo`, or `useCallback` unless all conditions below are true.

`// REASON:` is required directly above any allowed `useEffect`, `useMemo`, or `useCallback`, and it must name the rejected alternative and why it failed.

Valid examples:

- `// REASON: useState only captures initial value — sync when URL changes via back/forward`
- `// REASON: plain const recalculates 10k-row filter on every keystroke, causing 200ms frame drops`

Invalid examples:

- `// REASON: memoize for performance`
- `// REASON: prevents unnecessary re-renders`
- `// REASON: value depends on state`

The bar is strict:

- Name the specific problem the hook solves.
- Name the simpler alternative you tried or considered.
- Explain why that simpler alternative failed.
- If the app is not broken or visibly janky without the hook, do not use it.

### No God Hooks Or God Components

A page that hides complexity inside one giant hook is still a god hook.

Symptoms:

- 4 or more `useState` calls in one hook or component
- A returned bag of 5 or more state fields and 5 or more handlers
- Two or more unrelated concerns living together

Rules:

- One hook or component must own one concern.
- Max 3 `useState` calls per hook or component.
- Components must accept only the props they use.
- Pure derived computation belongs in plain utilities, not hooks.

---

## Component Design

- Consumer first: APIs should read cleanly from the caller side.
- Self-contained: components own their loading, error, and data-fetching states when appropriate.
- Extract by identity, not by file length.
- Do not generalize before the third real use case.
- Prefer pure functions over hooks for pure computation.

---

## File Size Limits

### `.tsx`

| LOC       | Rule                                                  |
| --------- | ----------------------------------------------------- |
| `< 150`   | Good                                                  |
| `150–299` | Acceptable only when the length comes from JSX markup |
| `300–399` | Must refactor                                         |
| `>= 400`  | **FATAL**                                             |

### `.ts`

| LOC       | Rule       |
| --------- | ---------- |
| `< 300`   | Good       |
| `300–499` | Acceptable |
| `>= 500`  | Must split |

Data-only files such as `registry-base-colors.ts` are exempt.

A long file should be long because of markup, not because of sprawling logic.

---

## Liquid Glass Design

UI is inspired by Apple's Liquid Glass design language.

### Core Pattern

```ts
className =
  'bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/20 shadow-2xl ring-1 ring-black/5';
```

### Good Uses

- Dropdown menus
- Modal dialogs
- Sheets
- Floating cards
- Popovers
- Tooltips
- Navigation overlays
- Sidebars

### Avoid Using It For

- Main content areas
- Inline form inputs
- Tables
- Static page sections

---

## Exemptions

- `src/components/ui/` is vendored shadcn code and is exempt from these rules.
- `src/registry/registry-base-colors.ts` is data-only and exempt from file size limits.
- `src/components/3d/macbook-showcase.tsx` may keep `as THREE.Mesh` assertions required by `useGLTF` node typing.

---

## Git Discipline

- Auto-commit after each coherent change. See `PRIORITY 0 — COMMIT REQUIRED`.
- Conventional commit types: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`.
- Never use broad staging. `git add` is allowed only for exact-path adds of new or renamed files when Git requires it.
- Never use `Co-Authored-By`.
- Do not push unless the user explicitly asks.
- Do not run destructive commands such as `git revert`, `git cherry-pick`, `git reset`, `git checkout .`, `git restore .`, `git stash`, or `git clean` without explicit user approval.

### Concurrent Agent Discipline

Multiple agents may work in this repo at the same time. Isolation comes from explicit-file commits.

Core rules:

1. Always commit with explicit file paths.
2. If a new or renamed file must be staged, stage only that exact path.
3. Never touch files you did not edit for your task.
4. Re-read a file before editing if time has passed or a command failed.

If something goes wrong:

- Unexpected files in `git status` mean another agent owns them. Leave them alone.
- If a commit is rejected by hooks, fix the problem, re-read affected files, and retry.
- If a file changed since you last read it, re-read it before editing.

---

## Verification

After every change, run:

```bash
npm run build
npm run lint
```

Both must pass before committing.
