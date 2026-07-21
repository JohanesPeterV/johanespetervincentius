# World Rise Preview — Concept Spec

This is the canonical concept for `src/app/igloo-preview/`. Read it **before** touching any
file in that folder. When a request about the preview is ambiguous, this doc wins over your
own intuition. The route name is historical; this file is where the accepted concept lives,
and the preview is where we refine it.

The reference-discovery stage is over. Do **not** reopen, study, or chase parity with
`igloo.inc` unless the user explicitly asks for a new comparison. Its useful limit is already
understood, and the current preview is an accepted foundation.

The purpose of this preview is now narrow: preserve the scroll-led transition language and the
near-fixed camera model, then make both feel as smooth, legible, and expensive as possible.
Timing, restraint, and frame stability matter more than adding spectacle.

---

## 0. Scope Is Locked

`/igloo-preview` is no longer a reference-matching exercise. Future work starts from the live
preview and this document, not from another site.

Keep:

- Scroll input driving a choreographed world-to-world transition.
- A camera that stays nearly fixed while the world rises, except for the protected finale move.
- A deliberate, readable pace that lets the viewer see the transition happen.
- A premium finish: continuous motion, quiet camera behaviour, stable frame time, and restrained
  postprocessing.

Do not:

- Compare the page against `igloo.inc` by default or spend time closing visual-parity gaps.
- Reintroduce an igloo shelter, logo, or other literal reference object. The former block-built
  shelter was removed because it dominated the composition and looked unfinished.
- Add frantic glitch, sharp FOV punches, abrupt camera keyframes, or noise that makes the work
  feel faster or cheaper.
- Add assets merely to make the blockout busier.

Historical route and file names may remain for continuity; they do not define the visual content.

---

## 1. The Mental Model (the one non-negotiable)

> **The user scrolls DOWN. In response, the 3D world rises UP past a nearly-fixed camera.**

- "Down" is the **scroll direction and the felt direction**, nothing more. We are **not
  travelling to a place.** There is no destination, no tunnel, no plunge into anything.
- The signature motion the visitor sees is **objects rising** — stones, crystals, shapes
  drifting upward through the frame as they scroll. The rise _is_ the show.
- The camera stays **essentially still.** It may ease a little and re-settle, but it does not
  fly through a scene. If the camera is doing the travelling, the concept is wrong.

If you can only keep one sentence: **scroll down → stuff goes up → camera barely moves.**

---

## 2. Banned Misreads (these have each cost real tokens)

- ❌ **"Fly forward through a scene."** No forward travel. No dolly-through. No corridor.
- ❌ **"Descend / plunge / dive into a place."** There is no place. Nothing is at the bottom
  (yet). It is a conceptual direction, not a journey to a location. (The folder is named
  "dive" for historical reasons — ignore the word; obey this doc.)
- ❌ **"Go source / generate / hand-craft 3D models."** Not your job. See §3.
- ❌ **"Add the portfolio content / sections now."** Not yet. See §4.
- ❌ **"Make it closer to igloo.inc."** That comparison stage is complete unless explicitly
  reopened by the user.

---

## 3. Your Job: Choreography & Blockout, NOT Reference Matching

Your role is to be a **greybox level designer** for the experience:

- **Place placeholder objects, choreograph the beats, and nail the timing / motion / transitions.**
- Placeholders are **bare primitives** — boxes, spheres, rough rock/crystal shapes. No labels,
  no textures, no sourced meshes. Position, scale, and motion are what matter.
- Placeholder does not mean careless. Silhouette, spacing, lighting, easing, and restraint must
  still feel intentional and presentation-ready.
- **Real 3D models come from the user, later.** After the _concept_ reads right, the user swaps
  the primitives for finished assets. Do not block on art; do not go looking for it.
- Get the **shape of the experience** right. Think choreography, not decoration.

Rule of thumb: if you're tempted to download, generate, or lovingly model a mesh, stop —
drop a primitive in the right place with the right motion and move on.

---

## 4. Content Follows The Object

The temporary portfolio copy exists to prove the choreography, not to drive it. W2–W4 use
three intentional stones: one for Work Experience, one for Selected Projects, and one for Tech
Stack. Each stone rises on the same clean vertical path, becomes the single dominant object for
its section, and carries its copy beside it. The copy must never become an independent centered
slideshow, and the three stones must never read as randomly scattered meshes.

---

## 5. Feeling Target

- **Primary:** premium curiosity — inviting enough to encourage the first scroll, composed enough
  to reward watching every transition.
- **Pace:** unhurried and legible. Input should feel responsive, but no beat should rush past before
  its motion can be understood.
- **Camera:** quiet, weighted, and continuous. World motion does the storytelling; FOV, roll, and
  pointer parallax stay restrained.
- **Effects:** refined rather than loud. No low-frame-rate glitch stepping, persistent flicker,
  excessive chromatic split, heavy grain, or effect added only to signal speed.
- **Performance:** smoothness is part of the visual design. During motion, protect frame time first;
  restore maximum clarity once the scene settles.

---

## 6. The Two Worlds

The experience crosses **one seam** between two palettes / regimes:

|         | World A (above the seam)                        | World B (below the seam)                             |
| ------- | ----------------------------------------------- | ---------------------------------------------------- |
| Nature  | Natural ice & snow — organic, soft, atmospheric | Crystal / data — engineered, faceted, almost digital |
| Palette | Bright, pale, cold-white                        | Deep, darker, luminous crystalline                   |

The **seam** is the moment World A tears open into World B (currently a glitch/shred
transition). It is one of the two protected jaw-drop moments (§7).

---

## 7. The Beat Skeleton (6 beats — for now, growable)

The experience is a sequence of **beats**. Six today; the structure should make it cheap to
add, remove, or reorder a beat. Each beat is a stretch of scroll progress (§8 explains the
`0–5` scale). Treat the ranges as approximate choreography, not hard law.

| Beat   | Name             | What happens                                                                                                    | Protected? |
| ------ | ---------------- | --------------------------------------------------------------------------------------------------------------- | ---------- |
| **W1** | **First reveal** | Preloader dissolves completely; the natural-ice world settles into being. First breath.                         | 🛡️ **YES** |
| **T**  | **The seam**     | World A opens through a smooth crystalline shred into World B; palette flips natural → crystal.                 | 🛡️ **YES** |
| **W2** | First stone      | The Work Experience stone rises into view with its copy attached beside it.                                     |            |
| **W3** | Second stone     | The Projects stone follows on the same path with its own attached copy.                                         |            |
| **W4** | Third stone      | The Tech Stack stone continues the sequence with its own attached copy.                                         |            |
| **W5** | _(open)_         | Not yet defined. Leave a clean seam to slot a beat here.                                                        |            |
| **W6** | The finale flash | A bright counter-seam: a white-ice flash hides the one great camera launch; it clears looking up into sun glow. |            |

Transitions are **only** at T and W6. W2–W4 is one continuous world — scrolling through it
must stay clean; the shred/glitch never fires there.

**🛡️ Protected moments** = the two we defend at all costs and never regress:

1. **W1 — the first reveal.**
2. **T — the seam transition** between the two worlds.

Everything W2–W4 is fundamentally "**one active stone going up at a time, three stones total**."
W6 is a "**great camera transition**" (the one place a deliberate camera move is the point).
W5 is intentionally open.

---

## 8. How It Maps to the Code

Progress is sampled on a **circular `0 ≤ progress < 5` scroll scale** (`DIVE_LENGTH = 5`,
`wrapProgress`). Scroll intent remains unbounded, and the sampled scene progress wraps from the
end of W6 directly back to the start of W1. The user can keep scrolling in the same direction
forever; the implementation must never clamp at either edge or damp backward through the beats.
Scroll drives progress; progress drives everything.

Approximate current mapping (see `descent.ts` keyframes):

- **~0 – 2.0** → W1, natural-ice surface + hero reveal (hero headline centered near `0.95`).
  During the reveal the camera settles from `y≈6.6` to its parked spot `y≈3.5` while
  `worldARise` lifts World A into place.
- **~2.05 – 2.6** → **T**, the seam (`SEAM_CENTER = 2.3`); palette flips, veil/glitch peak.
  `worldARise` sweeps World A up and out of frame; `worldBRise` starts lifting World B in
  from below.
- **~2.6 – 4.35** → W2–W4, crystal world; the peripheral field and crystals keep climbing
  (`worldBRise`) while three `NarrativeStones` follow one deliberate vertical path. Each content
  panel projects from its own stone and crossfades without blur, FOV rush, or aberration.
  The peripheral field lives in **two side curtains** (`sampleFieldSlot` in `world-layout.ts`):
  a bounded azimuth band left and right of the view axis, sized by distance. The central view
  column belongs to the narrative stones alone — nothing peripheral may cross or crowd it, and
  the stone rise rate spaces stones farther apart than the camera's visible height so only the
  active stone is ever in frame.
- **~4.35 – 4.8** → W6, the finale flash (`FINALE_CENTER = 4.58`): a bright veil
  (`#dfeefb` → `#eaf4fd`, the counter-image of the dark seam veil) bursts up and hides the
  one great camera launch; behind it the sun mesh sweeps overhead (`finaleSunLift`).
- **~4.8 – <5** → the flash clears; the camera settles looking up into the sun's god-ray glow
  with dark stones silhouetted against the sky, and the last section lands. Continued downward
  scroll wraps to `0`, where W1's opening veil hides the world reset and starts the next cycle.

The shred impulse is progress-driven, velocity-accented, and **zone-gated**: it is multiplied by
`seamBoost + finaleBoost`, so it only ever appears around T (`SEAM_CENTER = 2.3`) and W6
(`FINALE_CENTER = 4.58`). Its noise moves continuously with progress and freezes cleanly when
input stops. Everywhere else, scroll is clean.

Key files (`src/app/igloo-preview/`):

- `descent.ts` — the scroll→scene mapping: keyframes, seam, narrative stones, clamp. **The spine.**
- `world-layout.ts` — placeholder geometry (peripheral stones, crystals, snow).
- `dive-scene.tsx` / `dive-world.tsx` — R3F scene assembly.
- `camera-rig.tsx` — camera behaviour.
- `dive-transition-effect.ts` — the seam shred/glitch effect.
- `snow-gpu.tsx` / `snow-simulation.ts` — GPGPU snow.
- `ice-crystals.tsx` — transmission crystal material.
- `dive-overlay.tsx` / `dive-overlay-motion.ts` — headlines and hero-stone attachment.
- `dive-loader.tsx` — preloader.
- `wind-audio.ts` — ambient wind.

**Camera contract:** the camera is parked at `y≈3.5, z=16` for the whole run, apart from a
small settle during the W1 reveal and the single continuous W6 launch at the tail (which begins
behind the finale flash and settles as it clears, `~4.48 – 4.96`). Scroll never translates the
camera through the world; it drives `worldARise` / `worldBRise` in `descent.ts`, which lift the
two world groups past the lens. Keep it that way.

**Color-space contract:** the keyframe hex colors in `descent.ts` are sRGB. On the DOM veil
they are written as CSS `rgb()` directly; on the WebGL side (`scene.fog` / `scene.background`)
they must be written with `setRGB(..., SRGBColorSpace)` — plain `setRGB` reads the fractions
as linear and washes every authored color several stops lighter.

**Composer invariant (do not break):** the postprocessing composer subtree must never
re-render. Pass a stable `sun` prop to GodRays and never feed `wrapEffect` a value that
`JSON.stringify` chokes on — a circular structure there crashes the app.

---

## 9. Definition of Done — self-check before you say "ready"

Before claiming a preview change is done, confirm **all** of these:

- [ ] Scrolling **down** makes 3D objects go **up**; the camera is not flying forward or through.
- [ ] No forward travel, no plunge-into-a-place, no destination was introduced.
- [ ] You placed **primitives**, not sourced/generated art (unless the user handed you assets).
- [ ] You did **not** add portfolio content to drive the 3D (unless explicitly asked).
- [ ] W2–W4 use three intentional stones, and each content panel stays attached to its stone.
- [ ] The two protected moments (W1 reveal, T seam) still land and were not regressed.
- [ ] The loader clears before W1 camera motion begins; input during loading cannot skip the reveal.
- [ ] Wheel, keyboard, and drag input keep the beats slow enough to read without feeling laggy.
- [ ] T and W6 move continuously without stepped noise, abrupt camera stops, or gratuitous lens
      distortion.
- [ ] Moving frames may trade a little resolution for stability, then recover full clarity at rest.
- [ ] Progress wraps on **`0 ≤ progress < 5`** and continuous input has no scroll endpoint.
- [ ] The composer subtree does not re-render.
- [ ] Verified in the running app, not just build/lint (per repo verify practice).

---

## 10. Glossary

- **Beat / World** — one stretch of the scroll experience (W1…W6).
- **Seam (T)** — the single transition between World A (ice) and World B (crystal).
- **Rise** — objects moving upward through the frame as the user scrolls down. The core motion.
- **Blockout / greybox** — rough placeholder geometry standing in for future real assets.
- **Progress** — the circular `0 ≤ progress < 5` sampled value that drives the whole scene.

---

_If reality and this doc disagree, update this doc in the same change — it must stay the single
source of truth for the preview's concept._
