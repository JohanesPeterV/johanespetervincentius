# Frontend Design Principles

`FRONTEND-CODE-STANDARDS.md` owns implementation rules. This file owns product and visual design taste for the portfolio.

The portfolio has a bold, graphic space identity: black voids, stars with crisp luminous cores, saturated electric accents, and weightless objects. The reference image sets the visual direction; its eye motif is a rare accent, not a repeated theme. Prioritize visual character and contrast over soft, comfortable dashboard styling. Content remains readable and interactive within that world.

The hero and the later chapters inhabit two distinct realities, owned by separate scene groups in `SpaceWorld`:

- World 1: open black space, scattered white and subtly tinted stars, with only a few small eye glyphs at the periphery. Coloured disks emerge from the centre, expand outward, and continuously recycle inside a fixed pointed almond. Use flat disk colours without glossy catchlights, blinking lids, or character-like gaze; keep the space dominant.
- World 2: a large cropped ringed planet, inclined orbital paths, faceted satellites, and a dense diagonal belt of coloured stellar dust. Eye glyphs belong exclusively to world 1.

Preserve the etched crossing in both directions, including the return loop. The reveal must expose a different composition, not carry the same decoration across a content change.

Use the [Higgsfield Astra starfield](https://higgsfield.ai/gpt-astra) as a reference for the hierarchy of light: many dim pinpoints, fewer visible dots, and bright stars with larger cores and clearly visible circular halos. Colour, size, and glow change with the particle formations and independent twinkling. Each formation defines its appearance alongside its geometry; the shared renderer interpolates both through any number of shapes. Keep halos local to stars and the surrounding void black.

Light mode presents the two realities as an astronomical illustration with suspended miniature objects: neutral white space, graphite particles and orbit lines, and saturated painted accents. World 1 has a sparse hanging moon and planet; world 2 keeps its ringed planet and orbital composition, with selected objects suspended on thin visible strings. Strings attach to the objects and sway around fixed anchors. Use matte directional shading and crisp silhouettes, with subtle grain on the painted surfaces. Preserve the same particle choreography and distortion; light-mode particles read as printed marks rather than luminous bloom.

## Reuse The System

- Start from existing patterns and `src/components/ui` before inventing a new one.
- Reuse semantic colour tokens — `bg-primary`, `bg-muted`, `text-foreground` — and existing component variants before adding page-specific visuals.
- Do not create per-page design systems through local colours, borders, or shadows. Hardcoded interface colours are drift.
- Colours derive from the active base color theme in `src/registry/registry-base-colors.ts` and from `next-themes` light/dark mode. Anything you style must survive a theme switch and a base-color switch.

## Colour Roles

- Compose with our fashion-derived colourways: use colour theory and relevant fashion references to guide proportion and placement. Either colour may lead the artwork; account for hue relationships, lightness, saturation and surrounding neutrals when deciding visual weight. Judge the pair in the rendered composition ([Albers, _Interaction of Color_](https://www.albersfoundation.org/alberses/teaching/interaction-of-color)).
- Author only two colours per colourway: primary and secondary. `src/lib/theme-colors.ts` derives readable text and neutral surfaces for both modes.
- Reserve solid primary fills for the main action, paired with `primary-foreground`. Selected settings and navigation use a neutral surface with a `primary-text` label and outline. Selection needs a visible shape cue without taking the same visual weight as a call to action.
- Keep peer destinations and contact icons neutral at rest; primary text and edges provide their hover and focus cues. Use `primary-text` for coloured text or icons on neutral surfaces; its contrast adjustment must not alter the paint colour.
- Use secondary as a small identity marker beside section labels and as the monogram fill, paired with `secondary-foreground`. Keep label text neutral and readable. Judge the area occupied by each colour across artwork and UI together; do not add a coloured badge wherever colour is available.
- Dark mode is the default: space stays black, stars stay sharp, and the authored colour pair gives objects their electric accents. Avoid diffuse atmospheric gradients, pastel lighting, and large frosted hero panels. Light mode remains available with the same crisp graphic silhouettes on a light neutral ground.

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
- Reuse the repo's motion stack: R3F `useFrame` for render-loop and input-driven 3D state, CSS transitions for simple DOM motion, shader effects (`@funtech-inc/use-shader-fx`, `react-fluid-distortion`) for backgrounds, and Embla for carousels. Do not add overlapping animation libraries.

## Responsive Behaviour

- Mobile must still expose the primary action and current state.
- Collapse secondary controls before removing context.
- Prefer responsive composition over separate desktop and mobile implementations.
