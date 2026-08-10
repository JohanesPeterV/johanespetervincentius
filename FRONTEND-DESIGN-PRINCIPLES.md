# Frontend Design Principles

`FRONTEND-CODE-STANDARDS.md` owns implementation rules. This file owns product and visual design taste for the portfolio.

Design should make the work feel intentional and effortless to read, not decorated. Avoid novelty that slows down or obscures the content.

## Reuse The System

- Start from existing patterns and `src/components/ui` before inventing a new one.
- Reuse semantic colour tokens — `bg-primary`, `bg-muted`, `text-foreground` — and existing component variants before adding page-specific visuals.
- Do not create per-page design systems through local colours, borders, or shadows. Hardcoded interface colours are drift.
- Colours derive from the active base color theme in `src/registry/registry-base-colors.ts` and from `next-themes` light/dark mode. Anything you style must survive a theme switch and a base-color switch.

## Visual Hierarchy

- Primary actions should be visually obvious and placed where the flow naturally ends.
- Secondary actions stay available but quieter than the primary path.
- Empty states should explain what is missing and offer the next useful action when one exists.
- Loading states should preserve page structure so the viewer understands what is loading.

## Liquid Glass

Floating UI takes cues from Apple's Liquid Glass design language: translucent material, refracted backdrop, subtle specular edges, and layered depth.

- Use it for floating or overlay surfaces above page content: dropdowns, dialogs, sheets, popovers, tooltips, command menus, and navigation overlays.
- Do not use it for main content areas, static sections, inline inputs, tables, or dense content.
- Glass needs translucency, backdrop blur, a subtle border highlight, and a ring or shadow for depth.

Reference pattern:

```ts
className =
  'bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/20 shadow-2xl ring-1 ring-black/5';
```

Review checklist:

- Floating surfaces use the shared glass treatment, not scattered one-off utilities.
- Backdrop blur is paired with enough opacity and contrast for readable content.
- Edges have subtle highlights without overpowering surrounding UI.
- Main content, inputs, and static sections stay clear and functional rather than glassy.

## Motion And 3D

- The fluid-distortion background and Three.js / R3F scenes are decoration; they must never block reading content or interaction.
- Respect GPU tier detection — heavier effects should degrade gracefully on weaker hardware.
- Reuse the repo's motion stack: R3F `useFrame` for render-loop and input-driven 3D state, Anime.js for authored DOM, JavaScript-object, and Three.js transitions, shader effects (`@funtech-inc/use-shader-fx`, `react-fluid-distortion`) for backgrounds, and Embla for carousels. Do not add overlapping animation libraries.

## Responsive Behaviour

- Mobile must still expose the primary action and current state.
- Collapse secondary controls before removing context.
- Prefer responsive composition over separate desktop and mobile implementations.
