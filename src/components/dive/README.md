# Dive scene

The page owns the content. `src/app/page.tsx` supplies Hero and an ordered list
of chapters to `DiveScene`; each chapter declares its ID, navigation title,
content element, and optional card animation. There is no renderer registry or
second chapter list inside the animation engine.

## Change content

Edit the content component directly. Add, remove, or reorder chapters in the
page's `chapters` array. Keep at least one chapter and use unique, nonempty IDs;
`hero` is reserved. Choose `animation: 'cards'` for content with scatter motion.
Ordinary content needs no animation setting or camera props.

The overlay owns the scrollable region, spacing, accessibility state, and
chapter buttons. `DiveRoute` derives positions, navigation stops, entry capture,
and the return interval from the same supplied order. Each scene has its own
route; there is no global portfolio layout in the motion functions.

## Change motion

| Concern                                                 | Owner                                       |
| ------------------------------------------------------- | ------------------------------------------- |
| Page content and chapter order                          | `src/app/page.tsx`                          |
| Chapter spacing, navigation maths, mapping to the scene | `dive-route.ts`                             |
| Wheel, drag, keyboard, and nested reading gestures      | `dive-navigation.tsx`, `dive-input.ts`      |
| Chapter commands and damped movement                    | `camera-motion.ts`                          |
| Loading, arrival, and journey advancement               | `dive-timeline.ts`                          |
| Authored camera poses and interpolation                 | `descent-keys.ts`, `descent.ts`             |
| Frame scheduling and HTML synchronization               | `dive-director.tsx`                         |
| Shared render frame and world selection                 | `dive-frame.ts`                             |
| Camera, lighting, and optics                            | `camera-rig.tsx`                            |
| HTML visibility, focus, scatter, and refresh policy     | `dive-overlay-motion.ts`                    |
| Hero/entry snapshot lifecycle                           | `use-hero-handoff.ts`                       |
| Two-world crossing state and compositing                | `hero-handoff.ts`, `hero-handoff-effect.ts` |

The route repeats the authored orbital camera excursion between content
chapters and places the finale after the last one. Adding a chapter therefore
reuses existing choreography; bespoke 3D artwork still belongs to the world
components and camera keys.

Keep three positions distinct: the drive can accumulate multiple laps, the
handoff journey wraps into the current route, and the rendered position may
hold a crossing endpoint. `sceneProgress` maps that rendered position onto
the authored camera keys. HTML visibility follows the handoff journey.

`DiveCanvas` owns one stable render frame. `DiveDirector` advances the timeline
and writes that frame at priority -3. Camera rendering reads it at -2, world
updates at -1, and the director updates HTML at 0 before compositing. Loading
pauses drive movement and arrival so the existing opening stays synchronized.

The camera never advances navigation or writes HTML. It reads the sampled
pose, timing, arrival, and travel from the frame. World visibility and atmosphere
read that same frame, so they do not keep a separate progress ref or resample
the route. Sampling mutates the existing frame and its tuples; it does not
advance the timeline or allocate replacement geometry per tick.

## Verification

Run `npm run test:dive`. The test config inherits the application types and
aliases, then compiles and runs every `tests/dive*.test.ts`,
including the rendering regressions formerly in `check-handoff-rendering.mjs`.
The suite covers reordered, single, and extended chapter lists, camera poses,
repeated laps, gesture direction, loading, overlay refreshes, crossing reversal,
and reduced motion. Rendering checks exercise the compositor with a controlled
renderer; they do not replace a real browser check.

Also run build, lint, and file-size checks. In the browser, check chapter
buttons, both loop directions, nested scrolling, card dialogs, project controls,
and a narrow viewport with reduced motion.
