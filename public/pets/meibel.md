# Meibel

Meibel is Peter's gray cat. This transparent sprite sheet was generated from her photo, preserving her amber eyes and dark gray-pink paw pads.

The atlas is 1536 × 2288 pixels: eight columns, eleven rows, and 192 × 208 pixel cells. Unused cells are transparent.

| Row  | Animation           | Frames |
| ---- | ------------------- | ------ |
| 0    | Idle / blinking     | 6      |
| 1    | Run right           | 8      |
| 2    | Run left            | 8      |
| 3    | Wave                | 4      |
| 4    | Jump                | 5      |
| 5    | Disappointed        | 8      |
| 6    | Waiting             | 6      |
| 7    | Busy paws           | 6      |
| 8    | Curious / reviewing | 6      |
| 9–10 | Look directions     | 16     |

Look poses run clockwise in viewer coordinates: up is index 0, right 4, down 8, and left 12. They are poses, rather than a looping animation.

## Playback

`src/app/_components/linktree/meibel-engine.ts` implements the State pattern. `IdleState` accepts gaze and action events. `LookingState` returns to idle when gaze expires or the pointer leaves. `PlayingState` owns clip timing and action priority; a jump finishes even if hover or repeated taps arrive. All states implement the same frame/event interface. The engine advances the clock and resumes the ambient behavior schedule when a state expires.

`meibel-runtime.ts` connects the engine to the sprite element. It uses one animation clock, renders without React updates per frame, pauses outside the visible hero or browser tab, and removes listeners on unmount. Reduced motion holds a still pose and allows direct gaze changes. The React component owns the accessible play button and visible loading errors.

Hover or focus to wave; click, tap, Enter, or Space to jump. Cursor movement controls all sixteen gaze poses during idle. The ambient cycle uses every standard animation; the short right/left walk returns to its starting position.

Run `npm run test:meibel` to verify frame coverage, gaze mapping, action priority, and reduced motion.
