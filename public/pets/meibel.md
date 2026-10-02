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

`src/app/_components/meibel/meibel-engine.ts` implements the State pattern. `IdleState` accepts gaze and action events. `LookingState` returns to idle when gaze expires or the pointer leaves. `PlayingState` owns clip timing and action priority; petting and jumping finish even if hover or repeated taps arrive. All states implement the same frame/event interface. The engine advances the clock and resumes the ambient behavior schedule when a state expires.

`meibel-runtime.ts` connects the engine to the sprite element. It uses one animation clock, renders without React updates per frame, pauses outside the viewport or a visible browser tab, and removes listeners on unmount. Reduced motion holds a still pose and allows direct gaze changes. The React component owns the accessible play button, native popover, and visible loading errors. The home page mounts her at the bottom-right of the screen, above navigation and the device safe area, so she stays with the visitor across chapters.

Meibel normally sits and blinks about once every eight seconds. She gives a brief curious glance after a minute, then rests for two minutes. Hover or focus to wave, with a fifteen-second cooldown; click, tap, Enter, or Space to pet her and reveal the two frameless text actions. Cursor movement controls all sixteen gaze poses during idle. The original nine atlas clips remain available through `MeibelEngine.play`; running, jumping, busy paws, waiting, and disappointment do not run automatically.

Petting reuses the idle row’s closed-eye pose, with a slight lean and a small heart; it does not jump. No new photo or sprite asset is needed. The follow toggle makes her walk toward the mouse at 160 pixels per second, with space below the pointer so she does not cover its target. `MeibelEngine` owns movement and sprite state; the runtime owns viewport bounds and mouse coordinates. Opening her controls or leaving the browser pauses pursuit. Turning following off walks her back to her original spot. Following is unavailable on touch-only devices and with reduced motion; changing to reduced motion cancels movement. Escape or an outside click dismisses the native popover.

Run `npm run test:meibel` to verify frame coverage, gaze mapping, action priority, pointer pursuit, stopping, petting, and reduced motion.
