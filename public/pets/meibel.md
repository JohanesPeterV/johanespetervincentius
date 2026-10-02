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

`src/app/_components/meibel/meibel-engine.ts` implements the State pattern. `IdleState` accepts gaze and action events. `LookingState` returns to idle when gaze expires or the pointer leaves. `ActionState` owns clip timing and action priority; petting and jumping finish even if hover or repeated taps arrive. `FollowingState` owns movement, `MousePlayState` owns the chase and catch timing, `PawSwipeState` owns the short reach, and `LoungingState` holds her photographed resting pose. All states implement the same frame/event interface.

`meibel-runtime.ts` connects the engine to the sprite element. It uses one animation clock, renders without React updates per frame, pauses outside the viewport or a visible browser tab, and removes listeners on unmount. Reduced motion holds a still pose and allows direct gaze changes. The React component owns the accessible play button, native popover, and visible loading errors. The home page mounts her at the bottom-right of the screen, above navigation and the device safe area, so she stays with the visitor across chapters.

Meibel normally sits and blinks about once every eight seconds. She gives a brief curious glance after a minute, rests for two minutes, then lounges for thirty seconds. Hover or focus to wave, with a fifteen-second cooldown; click, tap, Enter, or Space to pet her and reveal her frameless text actions. Cursor movement controls all sixteen gaze poses during idle. The original nine atlas clips remain available through `MeibelEngine.play`; running, jumping, busy paws, waiting, and disappointment do not run automatically.

Petting reuses the idle row’s closed-eye pose with a slight lean; it does not jump. No new photo or sprite asset is needed. The follow toggle makes her walk toward the mouse at 160 pixels per second, with space below the pointer so she does not cover its target. `MeibelEngine` owns movement and sprite state; the runtime owns viewport bounds and mouse coordinates. Opening her controls or leaving the browser pauses pursuit. Turning following off walks her back to her original spot. Following is unavailable on touch-only devices and with reduced motion; changing to reduced motion cancels movement. Escape or an outside click dismisses the native popover.

Run `npm run test:meibel` to verify frame coverage, gaze mapping, action priority, pointer pursuit, stopping, petting, and reduced motion.

## Photo states

Choose **Play with mouse** to start an optional chase at 120 pixels per second. She waits for the cursor to settle for 300ms before a 1.48-second reach, with a gentle eight-pixel lift. Holding the mouse still produces one attempt; move it at least 24 pixels to invite another, after a 1.8-second rest. Opening controls, leaving the document, or pointing beyond her reachable viewport pauses pursuit. Her entire dock passes mouse clicks through while playing. **Stop playing** or Escape returns her to her corner. Reduced motion and touch-only devices disable cursor play.

Choose **Lounge** to hold the four actual photographed poses for 12s, 1.8s, 0.3s, and 15.9s. Gaze and hover do not interrupt her; petting or selecting a movement mode can. This also appears occasionally in her quiet ambient schedule.

- `meibel-play.png`: 768 × 416 RGBA, four columns and two rows, 192 × 208 cells. Two genuine full-body photos from September 30, 2026 (`20260930_103851.jpg` and `20260930_103852.jpg`) repeat in sequence 0, 0, 1, 1, 1, 0, 0, 0. These are two photographic poses, not eight invented limb positions. Play mode uses these cutouts throughout pursuit and reaching.
- `meibel-lounging.png`: 768 × 208 RGBA, four columns. The user's supplied neutral, tilted, open-mouth, and neutral photographs preserve her real face, body, and fur. The open-mouth pose is brief rather than repeatedly looping.

Both sheets retain original photograph RGB pixels. Built-in imagegen supplied foreground masks only; masks become alpha before ordinary downsampling into sprite cells. No generated cat texture or anatomy is used in these two sheets.

### Play foreground-mask prompt

Use case: background-extraction. EDIT TARGET is a two-panel contact sheet of two real photographs of the SAME cat, Meibel. Output only an accurately registered black-and-white foreground segmentation mask, EXACT same 2048x1024 canvas and same two equal 1024x1024 panels. In EACH panel cat pixels solid white, every background pixel solid black. Preserve EXACT silhouette placement, size, proportions, paws, full tail, head/ears and body of original cat in each panel independently. Do not center, rescale, redraw pose or invent anatomy. Cat is dark gray furry subject in eachpanel; exclude ALL wood door, white floor, cat shadow and colored rug, including gaps between paws and hindlegs/tail. Grayscale fine fur boundary permitted. Fullbody/tail included but no originalcat texture or colors needed: output ONLY white silhouette on black. Very accurate photo segmentation mask, not artistic rendition. No margins or panel labels, no text. Mask must overlay the input pixel for pixel.
