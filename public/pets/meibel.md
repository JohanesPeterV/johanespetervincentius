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

`src/app/_components/meibel/meibel-engine.ts` implements the State pattern. `IdleState` accepts gaze and action events. `LookingState` returns to idle when gaze expires or the pointer leaves. `ActionState` owns clip timing and action priority; petting and jumping finish even if hover or repeated taps arrive. `MovingState` owns bounded travel and returning home; `MousePlayState` owns pursuit, paw reaching, short rests, and circling the cursor. `ActionState` also holds lounging poses through gaze and hover. All states implement the same frame/event interface.

`meibel-runtime.ts` connects the engine to the sprite element. Each engine frame carries its atlas; the runtime renders that atlas directly. Walking always uses the original directional rows at 90 milliseconds per cell. Only photographic play poses are mirrored; the original atlas already contains both walk directions. The runtime uses one animation clock, renders without React updates per frame, pauses outside the viewport or a visible browser tab, and removes listeners on unmount. Reduced motion holds a still pose and allows direct gaze changes. The React component owns the accessible play button, native popover, and visible loading errors. The home page mounts her at the bottom-right of the screen, above navigation and the device safe area, so she stays with the visitor across chapters.

Meibel normally sits and blinks about once every eight seconds. She gives a brief curious glance after a minute, rests for two minutes, then lounges for thirty seconds. Hover or focus to wave, with a fifteen-second cooldown; click, tap, Enter, or Space to pet her and reveal her frameless text actions. Cursor movement controls all sixteen gaze poses during idle. The original nine atlas clips remain available through `MeibelEngine.play`; running, jumping, busy paws, waiting, and disappointment do not run automatically.

Petting reuses the idle row’s closed-eye pose with a slight lean. `MeibelEngine` owns sprite selection, play timing, movement, and facing; the runtime owns the viewport bounds and mouse coordinates. Opening her controls or leaving the browser pauses pursuit. Turning following off walks her home at 160 pixels per second. Following is unavailable on touch-only devices and with reduced motion; changing to reduced motion cancels movement. Escape or an outside click dismisses the native popover.

Run `npm run test:meibel` to verify frame coverage, gaze mapping, action priority, pointer pursuit, stopping, petting, and reduced motion.

## Photo states

Choose **Follow mouse** to follow and play in one interaction. She approaches at up to 180 pixels per second using her original walking animation. When close, she lies beside the cursor and bats it with her real photographed paw for 1.02 seconds, holds that pose for 0.9 seconds, then walks around the cursor in a 1.4-second arc and tries from the opposite side. Her body remains planted during the paw action. A held cursor keeps this play loop alive; moving it redirects her walking pursuit. The strike uses a 40-pixel lateral stand-off and a dock origin 78 pixels above the cursor so the extended paw meets it. Opening controls, leaving the document, or pointing beyond her reachable viewport pauses pursuit. Her entire dock passes mouse clicks through during following. **Stop following** or Escape walks her home with the original gait. Her normal resting schedule stays quiet.

Choose **Lounge** to hold the four actual photographed poses for 12s, 1.8s, 0.3s, and 15.9s. Gaze and hover do not interrupt her; petting or selecting a movement mode can. This also appears occasionally in her quiet ambient schedule.

- `meibel-play.png`: 768 × 416 RGBA, four columns and two rows, 192 × 208 cells. One intact photographed head, body, hind legs, and tail stay fixed; only the actual forepaw patches change across eight cells. The lying photograph is rotated horizontally with a common 178-pixel width and maximum baseline of 178 pixels. Head and rear-body rectangles are pixel-identical across poses. These frames run only during swatting and its brief lying rest. Walking, circling, petting, and returning home use the original atlas. The source is dim with closed eyes; the pose is relaxed lying play, and its photographic lighting differs from the original walking atlas.
- `meibel-lounging.png`: 768 × 208 RGBA, four columns. The user's supplied neutral, tilted, open-mouth, and neutral photographs preserve her real face, body, and fur. The open-mouth pose is brief rather than repeatedly looping.

Both sheets retain original photograph RGB pixels. Built-in imagegen supplied foreground masks only; masks become alpha before ordinary downsampling into sprite cells. No generated cat texture or anatomy is used in these two sheets.

### Play foreground-mask prompt

Use case: background-extraction. Input is an EDIT TARGET, not a style reference. Produce only a precisely source-aligned foreground segmentation MASK, square. All visible cat pixels = pure white, all floor, cat shadow, door, wall, marble seams = pure black. Slight gray edge antialiasing allowed. IMPORTANT the photograph CROPS the cat at the right/bottom edge: leave this exact crop and mask only visible pixels. Do NOT complete the missing body, do NOT invent limbs, do NOT recenter, do NOT resize subject, do NOT change head/paw positions. Preserve the precise actual silhouette of ears, head, chest fur, both frontpaws including raised/extended paw and visible torso, at exact original locations. Entire cat including dark nose, face and eyes must be solid WHITE, no internal holes. No photo, no rendering, no fur shading, no checkerboard or text. Return exact white-on-black segmentation of originalvisiblecat at originalpixelpositions.
