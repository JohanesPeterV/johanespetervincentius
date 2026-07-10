# Igloo Preview — Concept Spec

This is the canonical concept for `src/app/igloo-preview/`. Read it **before** touching any
file in that folder. When a request about the preview is ambiguous, this doc wins over your
own intuition. `igloo.inc` is a **look-and-feel reference only** — never a thing to clone.
This file is where the concept lives; the preview is where we build it.

Its whole reason to exist: stop the back-and-forth. The concept below has been misread the
same way many times and wasted many tokens. If you catch yourself building something that
contradicts the **Mental Model** or the **Banned Misreads**, stop — you have the concept wrong.

**If you were handed only this file:** the reference site is **igloo.inc**. Open it first (§0),
then build or iterate on the `/igloo-preview` page following the concept in this doc. That is
the whole job — nothing here requires any context beyond this file plus the live reference.

---

## 0. The Reference Site — open it first

**URL: https://igloo.inc** — actually open it and scroll through it before you write any code.
You (the AI) can browse it; do so. Absorb how it feels; do not read its source to copy it.

What it is: **igloo.inc**, Awwwards **Site of the Year 2024** (built by studio Abeto with
Bureaux). It is a near-100% WebGL scroll experience — an icy, crystalline world where
**scrolling drives a choreographed 3D journey** through distinct scenes joined by signature
glitch/aberration transitions. It is widely treated as a **craft benchmark**: the kind of site
that makes people's jaw drop. That craft bar is why we reference it.

What we **borrow** from it:

- The **mood** and the **level of craft** — playful yet stunning, obsessively polished (§5).
- The **core idea** that scrolling drives a choreographed 3D world with world-to-world
  transitions (§6, §7).

What we do **NOT** take:

- Its content, layout, copy, fonts, or assets. This is a portfolio, not a clone.
- Its exact camera behaviour. **igloo.inc is not our spec — §1 is.** On igloo.inc the camera
  moves through scenes; **our** concept is deliberately different: scroll down → the world
  **rises up** past a **near-fixed** camera. When igloo's behaviour and §1 disagree, §1 wins.

Bottom line: use igloo.inc to calibrate the **feeling and the quality bar**, then greybox
**our** concept (§1–§7). Reference for mood, never a target to reproduce.

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
- ❌ **"Clone igloo.inc."** It is a mood and craft-bar reference, not a spec to reproduce.

---

## 3. Your Job: Concept & Blockout, NOT Art

Your role is to be a **greybox level designer** for the experience:

- **Place placeholder objects, choreograph the beats, and nail the timing / motion / transitions.**
- Placeholders are **bare primitives** — boxes, spheres, rough rock/crystal shapes. No labels,
  no textures, no sourced meshes. Position, scale, and motion are what matter.
- **Real 3D models come from the user, later.** After the _concept_ reads right, the user swaps
  the primitives for finished assets. Do not block on art; do not go looking for it.
- Get the **shape of the experience** right. Think choreography, not decoration.

Rule of thumb: if you're tempted to download, generate, or lovingly model a mesh, stop —
drop a primitive in the right place with the right motion and move on.

---

## 4. Content Comes Later

This will eventually be a portfolio (about, work, projects, contact). **Ignore that for now.**
The first and only current goal is: **make the 3D concept and its transitions read correctly.**
Once the 3D beats feel right, content chips in on top. Do not let content requirements shape
the 3D concept today.

---

## 5. Feeling Target

- **Primary:** playful curiosity — inviting, a little toy-like, "what happens if I scroll?"
- **Held to the standard of:** jaw-dropping craft. The bar is "makes people's jaw drop in awe."
  Playful, but _stunningly_ executed.
- Both at once: approachable on the surface, breathtaking in the polish.

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

| Beat   | Name              | What happens                                                                | Protected? |
| ------ | ----------------- | --------------------------------------------------------------------------- | ---------- |
| **W1** | **First reveal**  | Preloader dissolves; the natural-ice world snaps into being. First breath.  | 🛡️ **YES** |
| **T**  | **The seam**      | World A shreds/glitches open into World B; palette flips natural → crystal. | 🛡️ **YES** |
| **W2** | Rising stones     | Crystal-world stones/shapes rise past the near-fixed camera.                |            |
| **W3** | Rising stones     | More shapes rise — build rhythm and scale.                                  |            |
| **W4** | Rising stones     | The rise continues; sense of weight and craft.                              |            |
| **W5** | _(open)_          | Not yet defined. Leave a clean seam to slot a beat here.                    |            |
| **W6** | Camera transition | A single great camera move that resolves the sequence.                      |            |

**🛡️ Protected moments** = the two we defend at all costs and never regress:

1. **W1 — the first reveal.**
2. **T — the seam transition** between the two worlds.

Everything W2–W4 is fundamentally "**stones going up**." W6 is a "**great camera transition**"
(the one place a deliberate camera move is the point). W5 is intentionally open.

---

## 8. How It Maps to the Code

Progress runs on a **clamped `0 → 5` scroll scale** (`DIVE_LENGTH = 5`, `clampProgress`).
It **does not loop** and must stay clamped. Scroll drives progress; progress drives everything.

Approximate current mapping (see `descent.ts` keyframes):

- **~0 – 2.0** → W1, natural-ice surface + hero reveal (hero headline centered near `0.95`).
  During the reveal the camera settles from `y≈6.6` to its parked spot `y≈3.5` while
  `worldARise` lifts World A into place.
- **~2.05 – 2.6** → **T**, the seam (`SEAM_CENTER = 2.3`); palette flips, veil/glitch peak.
  `worldARise` sweeps World A up and out of frame; `worldBRise` starts lifting World B in
  from below.
- **~2.6 – 4.55** → W2–W4, crystal world; the rising-stone field and crystals keep climbing
  (`worldBRise`) and `SECTION_ROCKS` rise past the parked camera (`ROCK_RISE_RATE`,
  `ROCK_SPIN_RATE`).
- **~4.55 – 5** → W6, the single resolve move: the parked camera finally lifts and tilts up
  as the glow swells.

Key files (`src/app/igloo-preview/`):

- `descent.ts` — the scroll→scene mapping: keyframes, seam, section rocks, clamp. **The spine.**
- `world-layout.ts` — placeholder geometry (dome blocks, rising stones, crystals, section rocks, snow).
- `dive-scene.tsx` / `dive-world.tsx` — R3F scene assembly.
- `camera-rig.tsx` — camera behaviour.
- `dive-transition-effect.ts` — the seam shred/glitch effect.
- `snow-gpu.tsx` / `snow-simulation.ts` — GPGPU snow.
- `ice-crystals.tsx` — transmission crystal material.
- `dive-overlay.tsx` / `dive-loader.tsx` — headlines, preloader.
- `wind-audio.ts` — ambient wind.

**Camera contract:** the camera is parked at `y≈3.5, z=16` for the whole run, apart from a
small settle during the W1 reveal and the single W6 resolve move at the tail. Scroll never
translates the camera through the world; it drives `worldARise` / `worldBRise` in
`descent.ts`, which lift the two world groups past the lens. Keep it that way.

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
- [ ] The two protected moments (W1 reveal, T seam) still land and were not regressed.
- [ ] Progress stays **clamped `0–5`** and does not loop.
- [ ] The composer subtree does not re-render.
- [ ] Verified in the running app, not just build/lint (per repo verify practice).

---

## 10. Glossary

- **Beat / World** — one stretch of the scroll experience (W1…W6).
- **Seam (T)** — the single transition between World A (ice) and World B (crystal).
- **Rise** — objects moving upward through the frame as the user scrolls down. The core motion.
- **Blockout / greybox** — rough placeholder geometry standing in for future real assets.
- **Progress** — the clamped `0–5` scroll value that drives the whole scene.

---

_If reality and this doc disagree, update this doc in the same change — it must stay the single
source of truth for the preview's concept._
