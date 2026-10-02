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

`src/app/_components/meibel/meibel-engine.ts` implements the State pattern. `IdleState` accepts gaze and action events. `LookingState` returns to idle when gaze expires or the pointer leaves. `PlayingState` owns clip timing and action priority; a jump finishes even if hover or repeated taps arrive. All states implement the same frame/event interface. The engine advances the clock and resumes the ambient behavior schedule when a state expires.

`meibel-runtime.ts` connects the engine to the sprite element. It uses one animation clock, renders without React updates per frame, pauses outside the viewport or a visible browser tab, and removes listeners on unmount. Reduced motion holds a still pose and allows direct gaze changes. The React component owns the accessible play button, native popover, and visible loading errors. The home page mounts her at the bottom-right of the screen, above navigation and the device safe area, so she stays with the visitor across chapters.

Meibel normally sits and blinks about once every eight seconds. She gives a brief curious glance after a minute, then rests for two minutes. Hover or focus to wave, with a fifteen-second cooldown; click, tap, Enter, or Space to jump and open her menu. Cursor movement controls all sixteen gaze poses during idle. All nine clips remain available through `MeibelEngine.play`; running, jumping, busy paws, waiting, and disappointment do not run automatically.

Her play menu offers a pet/jump and a run. `MeibelEngine.run` uses `RunningState` to travel left at 120 pixels per second, turn, and return to the dock without interruption from repeated requests. The runtime limits the excursion to 240 pixels or the available space and keeps the clickable button with the sprite. Reduced motion disables the run; Escape or an outside click dismisses the native popover.

Run `npm run test:meibel` to verify frame coverage, gaze mapping, action priority, round-trip movement, and reduced motion.
