# Portfolio Site — Agent Rules

`CLAUDE.md` and `AGENTS.md` must stay identical. If one changes, update the other in the same commit.

## Always

- Strive for lean changes: minimize bloat & noise. Reduce complexity instead of moving it into a helper, hook, or wrapper.
- Preserve externally observable behaviour unless the exact change is authorised by a direct user instruction or a validated queue row.
- Fix root cause. Never suppress errors or weaken ESLint, TypeScript, Next.js, lefthook, or build settings to make a check pass, unless the user explicitly requested that config change. No fake fallbacks and no misleading file or commit splits to satisfy a rule on paper.
- Never stop, restart, or kill a pre-existing process. Use isolated ports and build directories for task-owned work.
- After any executable code change, `npm run build` and `npm run lint` (zero warnings) must pass before committing; run `npm run check:sizes` when adding or growing `.ts`/`.tsx` files. Skip project checks for docs-only or agent-prompt edits.

## Task Routing

Before editing, read `GIT.md` and the matching routes below. For code, also read `CLEAN-CODE.md`.

- Any `.ts`/`.tsx` code — components, pages, hooks, styling, lib, scripts → `FRONTEND-CODE-STANDARDS.md` (owns the hard gates).
- Visual hierarchy, Liquid Glass treatment, theme, or 3D look → `FRONTEND-DESIGN-PRINCIPLES.md`.
- Reviewing committed changes or writing review findings → `REVIEW.md`; `REVIEW_FOCUS.md` when present.
- Queue creation, claims, status changes, recovery, or cleanup → `queue/AGENTS.md`.

## Repo Context

Next.js 15 App Router portfolio: TypeScript, TailwindCSS, shadcn/ui, Jotai, `next-themes`, Three.js, React Three Fiber, Drei, `react-fluid-distortion`. Import from `src/*` via the `@/*` alias.

```bash
npm run dev          # Dev server with Turbopack on port 6767
npm run build        # Production build (pre-push hook runs this as the typecheck)
npm run lint         # ESLint with zero warnings allowed
npm run check:sizes  # File size checks
```

- `src/app/` pages with page-specific components in `_components/`; `src/components/` (`3d/`, `backgrounds/`, `theme-buttons/`, `ui/` = vendored shadcn); `src/hooks/`; `src/lib/`; `src/registry/` theme data.
- Dark/light mode comes from `next-themes`; base colour themes live in `src/registry/registry-base-colors.ts` and persist via Jotai `atomWithStorage`.
- `home-background.tsx` renders the fluid distortion background, tuned by GPU tier detection, coloured from the active base colour.
