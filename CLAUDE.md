# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Gate

Before submitting any change, verify every item:

- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] No `as` type assertions added (unless exempted below)
- [ ] No new `useEffect`/`useMemo`/`useCallback` without `// REASON:` comment
- [ ] No file exceeds its size limit (tsx: 300, ts: 500 lines — data-only files exempt)
- [ ] No function has more than 3 positional parameters
- [ ] No component has more than 3 `useState` calls

## Quality Over Speed

Correct, clean, and maintainable code is always more important than shipping fast. If you are unsure, stop and ask — never guess.

## Commands

```bash
npm run dev          # Start dev server with Turbopack (port 6767)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier format all files
npm run format:check # Check formatting without changes
```

## Architecture

This is a **Next.js 15 portfolio website** using the App Router with TypeScript and TailwindCSS.

### Tech Stack
- **UI Framework**: React 19 with Next.js 15 (App Router)
- **Styling**: TailwindCSS + shadcn/ui (new-york style)
- **3D/Animations**: Three.js, React Three Fiber, React Three Drei, react-fluid-distortion
- **State Management**: Jotai (for theme/config persistence)
- **Theming**: next-themes for dark/light mode

### Key Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── _components/        # Page-specific components (profile, projects, technologies, work-experience)
│   ├── cv/                 # CV/Resume page with PDF viewer
│   └── utils/              # Utility pages (random-picker)
├── components/
│   ├── 3d/                 # Three.js/R3F components (macbook-showcase, model)
│   ├── backgrounds/        # WebGL fluid background (home-background.tsx)
│   ├── theme-buttons/      # Theme switching components
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom hooks (use-config, use-media-query)
├── lib/                    # Utilities (cn(), HSL color conversions)
└── registry/               # Theme color definitions (registry-base-colors.ts)
```

### Theming System

The app has a **dual-layer theming system**:
1. **Dark/Light mode**: Managed by `next-themes` via `ThemeProvider`
2. **Color themes**: Multiple base colors (red, rose, orange, green, blue, yellow, violet) defined in `registry-base-colors.ts`, persisted via Jotai's `atomWithStorage`

Theme colors use CSS variables defined with HSL values (e.g., `--primary: 262.1 83.3% 57.8%`). The `ThemeSwitcher` component allows users to change both modes.

### 3D Background

`home-background.tsx` renders a WebGL fluid distortion effect using:
- React Three Fiber Canvas
- `@whatisjery/react-fluid-distortion` for the fluid simulation
- GPU tier detection via `@react-three/drei` for performance adaptation
- Theme-aware colors derived from the active base color

### Path Aliases

Use `@/*` to import from `src/*` (configured in tsconfig.json).

## Code Disciplines

- **No comments** - Code must be self-documenting through clear naming; no inline comments, no JSDoc, no TODOs. The only exception is `// REASON:` comments required for bare React hooks (see React Rules below)
- **Extract logic into named functions** - Instead of inline logic, extract into descriptive function names (e.g., `getThemeAdjustedColors()`, `setupEventSourceAndHardwareAcceleration()`)
- **Early returns** - Use guard clauses at the top of functions to reduce nesting
- **Types at top** - Define type definitions at the top of the file before implementation
- **Compact components** - Keep components focused and minimal; no bloat
- **Tailwind only** - Use Tailwind classes for all styling; avoid CSS files except globals.css
- **Const arrow functions** - Use `const` with arrow functions and define types
- **Handle prefix** - Event handlers use "handle" prefix (e.g., `handleKeyDown`, `handleClick`)
- **Accessibility** - Include aria-label, role, tabindex, and keyboard handlers where appropriate

### Forbidden

- No `@ts-ignore`, `@ts-expect-error`, `any`, `unknown`
- No `void` operator - use `async/await` properly
- No `as` type assertions — narrow with conditionals, type guards, or generics instead
- No boolean function parameters — split into separate functions or use an options object
- No braceless control flow — always use braces for `if`, `else`, `for`, `while`
- No nested ternaries — use `if`/`else` blocks or early returns
- No ALL-CAPS abbreviations in identifiers — use PascalCase (e.g., `PdfViewer` not `PDFViewer`, `HslColor` not `HSLColor`). Existing names are grandfathered until touched.

### React Rules

- No bare `useEffect`, `useMemo`, or `useCallback` — every call must have a `// REASON:` comment on the line above explaining **why** it needs to be a hook (e.g., DOM side-effect, browser API, hydration mismatch). This is the **one exception** to the "no comments" rule.
- Maximum 3 `useState` calls per component — consolidate into a state object or extract a custom hook if you need more
- No god hooks — a custom hook that does more than one thing must be split

### File Size Limits

- `.tsx` files: 300 lines max
- `.ts` files: 500 lines max
- Data-only files (e.g., `registry-base-colors.ts`) are exempt

### Max Parameters

- 2 parameters: clean
- 3 parameters: acceptable
- 4+ parameters: must use an options object

### Component Design Principles

- **Consumer First** — design the API from the caller's perspective
- **Self-Contained** — a component owns its data fetching, error states, and loading states
- **Extract by Identity** — only extract a component when it has a clear name and responsibility, not just to reduce line count
- **Abstraction Restraint** — three similar lines of code are better than a premature abstraction

### No Duplication

If you see the same logic in two or more places, extract it. But do not extract logic that only appears once.

### Fix Violations You Touch

When editing a file, fix any violations of these rules in code you touch. Do not leave broken windows.

### Exemptions

- `src/components/ui/` — vendored shadcn components, exempt from all rules above
- `src/registry/registry-base-colors.ts` — data-only file, exempt from file size limits
- `src/components/3d/macbook-showcase.tsx` — `as THREE.Mesh` assertions on drei `useGLTF` nodes are acceptable (nodes typed as `Record<string, THREE.Object3D>` by the library)

### Components

- Server Components by default, `"use client"` only when needed
- Page-specific components in `_components/` folder inside the page directory

### Styling

- Prefer semantic colors (`bg-primary`, `bg-muted`, `text-foreground`) over hardcoded colors

## Liquid Glass Design

UI inspired by Apple's Liquid Glass design language (WWDC 2025, iOS 26).

### Core Pattern

```typescript
className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/20 shadow-2xl ring-1 ring-black/5"
```

### When to Use

- Dropdown menus, modal dialogs, sheets
- Floating cards, popovers, tooltips
- Navigation overlays, sidebars

### When NOT to Use

- Main content areas, inline form inputs
- Tables, static page sections

## Git

- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
- Never use `--no-verify` or `--force` flags
- Never force push
- Do not push unless explicitly asked

## Verification

After every change, run:

```bash
npm run build   # Must pass with zero errors
npm run lint    # Must pass with zero warnings
```

If either fails, fix before committing.
