# Dive scene

`DiveScene` composes navigation, the canvas, the loader, and the HTML overlay.
High-frequency motion stays in refs; content components do not own camera state.

## Change chapters

- Edit titles in `dive-sections.ts` under `CONTENT_CHAPTERS`.
- Reorder or omit content chapters in `CONTENT_ORDER`. Keep at least one content
  chapter; Hero anchors the two-world crossing.
- To add a chapter, add its metadata and stable ID to `CONTENT_CHAPTERS`, place
  that ID in `CONTENT_ORDER`, and register its component in `SECTION_CONTENT`
  in `dive-overlay.tsx`. TypeScript requires a renderer for every content ID.
- Use `animation: 'cards'` for chapters whose cards need overlay updates while
  the camera rests; use `'static'` for ordinary content.

The overlay owns the shared scrollable region, accessibility state, spacing, and
chapter buttons. Content components receive only their title and subtitle.
Positions, chapter numbers, the entry chapter, and the return interval follow
chapter order. DOM refs use IDs, so capture and animation never infer identity
from an array slot, a coordinate, or an object reference.

This config arranges HTML chapters in the existing scene. New 3D artwork or
camera choreography still belongs to the authored world and camera timeline;
preview those when extending the journey beyond its current length.

## Behaviour owners

| Concern                                            | Owner                                       |
| -------------------------------------------------- | ------------------------------------------- |
| Chapter identity, order, spacing                   | `dive-sections.ts`                          |
| Wheel, drag, keyboard, and nested reading gestures | `dive-navigation.tsx`                       |
| Gesture classification and scroll boundaries       | `dive-input.ts`                             |
| Chapter commands and damped drive movement         | `camera-motion.ts`                          |
| Camera timeline, looping, and chapter motion maths | `descent.ts`, `descent-keys.ts`             |
| Frame scheduling, camera, and overlay updates      | `camera-rig.tsx`                            |
| DOM visibility, focus availability, and scatter    | `dive-overlay-motion.ts`                    |
| Hero/entry snapshot lifecycle                      | `use-hero-handoff.ts`                       |
| Two-world crossing state and compositing           | `hero-handoff.ts`, `hero-handoff-effect.ts` |

Keep the frame ordering intact: camera/journey at priority -2, world updates,
then the HTML overlay and compositor. The journey position can differ from the
rendered camera position while a crossing holds an endpoint.

## Verification

Run `npm run test:dive` for chapter stepping, repeated laps, direct navigation,
slow frames, gesture direction, and crossing/reduced-motion regression checks.
It uses the existing TypeScript compiler and Node test runner.

Also run the build, lint, and file-size checks. In the browser, check chapter
buttons, both loop directions, scrolling within a chapter, card dialogs,
project preview controls, and a narrow viewport with reduced motion.
