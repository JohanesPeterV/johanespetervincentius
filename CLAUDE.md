# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- **No comments** - Code must be self-documenting through clear naming; no inline comments, no JSDoc, no TODOs
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
