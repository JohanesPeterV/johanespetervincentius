# Automated Review Fixes

## Context

Validated findings from committed source review. Implement one row at a time.

## How To Use This Queue

Follow `queue/AGENTS.md`, claim one pending row, complete its proof, commit it as done, and clean up the file after the final row.

## Items

- [ ] REV-52dfad5-02 — Preserve the full normalized wheel gesture while keeping `/igloo-preview` playback calmly speed-bounded.
  - Start: `src/app/igloo-preview/dive-scene.tsx` wheel delta normalization and the downstream drive smoothing in `src/app/igloo-preview/camera-motion.ts`.
  - Done: Pixel-, line-, and page-mode wheel input adds its complete normalized magnitude to the unbounded target; large gestures queue proportionally more choreography than small gestures, while `advanceDrive` still limits playback speed and the accepted world-rise pacing remains readable.
  - Verify: Run `npm run build`, `npm run lint`, `npm run check:sizes` if a TypeScript file grows, and `git diff --check`; in `/igloo-preview`, compare 120px and 1200px wheel gestures plus representative line- and page-mode input, confirm the larger normalized gesture queues proportionally more travel without a speed spike or skipped beats, and recheck the `IGLOO-PREVIEW.md` Definition of Done.
