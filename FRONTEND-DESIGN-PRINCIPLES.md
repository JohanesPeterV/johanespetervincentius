# Frontend Design Principles

`FRONTEND-CODE-STANDARDS.md` owns implementation rules. This file owns product and visual design taste for the portfolio.

The portfolio has a bold, graphic space identity: black voids, stars with crisp luminous cores, saturated electric accents, and weightless objects. The reference image sets the visual direction; its eye motif is a rare accent, not a repeated theme. Prioritize visual character and contrast over soft, comfortable dashboard styling. Content remains readable and interactive within that world.

The hero and the later chapters inhabit two distinct realities, owned by separate scene groups in `SpaceWorld`:

- World 1: the observer floats among scattered stars in open black space. Keep the central reading area clear and only a few small sculpted eyes at the periphery, facing the viewer. Coloured disks emerge from the centre, expand outward, and continuously recycle inside a fixed pointed almond. Use flat disk colours without glossy catchlights; keep the space dominant. Each eye blinks briefly on its own schedule, with the lids closing over the cycling face. The owner's MacBook Pro, Magic Trackpad, Xiaomi A27Ui monitor, and SPACE65 keyboard travel among the stars at a similar visual scale. They follow live star particles through the same formations, drift, pointer response and departure flow, with slow three-dimensional rotation. Keep the MacBook lid closed, angled to reveal its top, and the monitor screen off with dark reflective glass. Use the supplied product models with tactile materials. Select well-spaced particles across the authored formations and reduce device scale on mobile to keep the reading area clear. Preserve the keyboard's typing animation; reduced motion holds the devices still with the keys at rest.
- World 2: a large cropped ringed planet, inclined orbital paths, an asteroid arc around the lower-left edge, and faceted satellites, with no stars or stellar dust in either theme. Stars, eyes, and workspace devices belong exclusively to world 1.

Preserve the etched crossing in both directions, including the return loop. The reveal must expose a different composition, not carry the same decoration across a content change.

Use the [Higgsfield Astra starfield](https://higgsfield.ai/gpt-astra) as a reference for the hierarchy of light: many dim pinpoints, fewer visible dots, and rare bright stars with larger cores and compact circular halos. In dark mode, tint star bodies with primary and secondary according to each formation, independently of their glow. Keep the compact halos secondary to the coloured bodies. Colour, size, and glow change with the particle formations and independent twinkling. Each formation defines its appearance alongside its geometry; the shared renderer interpolates both through any number of shapes. Lengthen the pause between formations while retaining the original transition speed. Clicking an eye skips that pause; it waits for the current transition to finish before accepting another request. Reduced motion keeps automatic movement paused and changes formation instantly on request. Keep halos local to stars and the surrounding void black. Pointer movement gently distorts the starfield; clicking creates no pulse or shockwave.

Stars and eyes have actual closed 3D bodies with depth, surface normals, and visible sides. Stars are instanced beveled four-point solids distributed around the observer; their rotation reveals their facets. Their glow uses a surrounding spherical mesh. Keep exactly six eyes on desktop and mobile, with one main accent, two medium companions, and three smaller distant eyes. Eyes have a curved inset face, raised bevel, and darker solid sidewall. Their positions stay in the world while their faces turn toward the camera with slight individual angles that expose the rim's depth. Each eye keeps one fixed dark pupil at its centre, with no border or outline. Coloured disks expand outward from behind the pupil at a constant speed, with equal timing for every colour and no pauses or acceleration. The pupil stays the same size throughout the pulse and is covered by the closing lids. Blinking moves the front geometry into closed lids, with an occasional independent double blink, preserving the body's depth and the outward colour cycle; reduced motion leaves the eyes open. Keep formation choreography independent of mesh shape, and scale bodies for narrow screens so foreground stars do not obscure text.

Use [Igloo Inc.](https://www.igloo.inc/) as the standard for environmental depth, tactile materials, and controlled directional lighting. Keep the animated stars and eyes. The hero stays open and black, without lunar terrain, Earth, a nebula, cloud ceiling, or fog wash.

Stars retain their spatial formation and facets but render at sky depth, behind foreground objects. World 2 uses irregular gas bands and translucent particulate rings with a shadow cast by its globe. Keep celestial geometry at full depth; do not squash its Z scale to imitate a flat illustration. Small asteroid clusters remain secondary accents at the edges. Mobile compositions reposition landmarks and reduce debris count.

Typography and navigation belong inside this environment. The hero uses a strong title and open destination rows with restrained rules, continuous with the later chapters' typographic controls. Keep the reading area dark enough for neutral text; opaque cards must not cut rectangular holes through the scene.

Light mode is the same space as a two-colour print on near-white paper. Both realities keep their dark-mode compositions and physically lit materials, but a print has no grey: every lit surface remaps its shading to the colourway, with the lighter authored colour as the lit ink, the darker one as the shadow ink, and paper for highlights. Planets, rings, asteroids, and satellites therefore read as vivid printed objects, never as grey rocks or dark silhouettes. Stars print in full ink colour with the same size hierarchy, and the brightest stars carry a thin coloured ring where the dark theme has a glow. Eyes and orbit lines stay in both modes; orbit lines print with more coverage because pigment lines cannot glow. No strings, no stripes, no pastel wash, and no tinted dashboard grey.

## Reuse The System

- Start from existing patterns and `src/components/ui` before inventing a new one.
- Reuse semantic colour tokens — `bg-primary`, `bg-muted`, `text-foreground` — and existing component variants before adding page-specific visuals.
- Do not create per-page design systems through local colours, borders, or shadows. Hardcoded interface colours are drift.
- Colours derive from the active base color theme in `src/registry/registry-base-colors.ts` and from `next-themes` light/dark mode. Anything you style must survive a theme switch and a base-color switch.

## Colour Roles

- Compose with our fashion-derived colourways: use colour theory and relevant fashion references to guide proportion and placement. Either colour may lead the artwork; account for hue relationships, lightness, saturation and surrounding neutrals when deciding visual weight. Judge the pair in the rendered composition ([Albers, _Interaction of Color_](https://www.albersfoundation.org/alberses/teaching/interaction-of-color)).
- Author only two colours per colourway: primary and secondary. `src/lib/theme-colors.ts` derives readable text and neutral surfaces for both modes.
- A new visitor receives one random colourway, saved in the existing preference store. Keep it stable across reloads and navigation; manual selection and Shuffle replace that saved choice. The main colour control shuffles to a different pair in one click. A separate settings control opens manual colour selection and Light, Dark, and System, which remain independent of colourway selection.
- Reserve solid primary fills for the main action, paired with `primary-foreground`. Selected settings and navigation use a neutral surface with a `primary-text` label and outline. Selection needs a visible shape cue without taking the same visual weight as a call to action.
- Keep peer destinations and contact icons neutral at rest; primary text and edges provide their hover and focus cues. Use `primary-text` for coloured text or icons on neutral surfaces; its contrast adjustment must not alter the paint colour.
- Use secondary as a small identity marker beside section labels. Keep label text neutral and readable. Judge the area occupied by each colour across artwork and UI together; do not add a coloured badge wherever colour is available.
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
