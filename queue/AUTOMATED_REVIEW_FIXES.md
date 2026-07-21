# Automated Review Fixes

## Context

Validated findings from committed source review. Implement one row at a time.

## How To Use This Queue

Follow `queue/AGENTS.md`, claim one pending row, complete its proof, commit it as done, and clean up the file after the final row.

## Items

- [v] REV-52dfad5-01 — Conceal the full `/igloo-preview` overlay reset behind the closing loop veil.
  - Start: `src/app/igloo-preview/dive-overlay.tsx` and `src/app/igloo-preview/dive-overlay-motion.ts`; inspect the veil's stacking relative to the finale section, rail, and rise meter.
  - Done: The opaque W6-to-W1 veil hides every overlay value that resets at the `5 → 0` wrap, without obscuring usable controls or regressing the W1 reveal, T seam, or W6 finale.
  - Verify: Run `npm run build`, `npm run lint`, `git diff --check`, and `npm run check:sizes` if a `.ts` or `.tsx` file grows; exercise a complete forward loop at desktop and mobile widths and confirm finale copy, rail state, and rise count never hard-reset above the opaque veil.
