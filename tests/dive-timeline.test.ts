import assert from 'node:assert/strict';
import test from 'node:test';
import { CanvasTexture } from 'three';

import { ARRIVAL_DURATION } from '../src/components/dive/arrival';
import type { DriveMotion } from '../src/components/dive/camera-motion';
import { createDescentFrame } from '../src/components/dive/descent';
import {
  CHAPTER_GAP,
  DIVE_START,
  DiveRoute,
} from '../src/components/dive/dive-route';
import {
  advanceDiveTimeline,
  createDiveTimeline,
} from '../src/components/dive/dive-timeline';
import {
  createOverlayMotion,
  overlayNeedsUpdate,
  updateOverlay,
} from '../src/components/dive/dive-overlay-motion';
import type { OverlayFrame } from '../src/components/dive/dive-overlay-motion';
import {
  createHeroHandoff,
  HANDOFF_START,
  HANDOFF_END,
} from '../src/components/dive/hero-handoff';

const route = new DiveRoute('Hero', [
  { id: 'work', title: 'Work' },
  { id: 'stack', title: 'Stack' },
]);

const createDrive = (): DriveMotion => ({
  route,
  current: DIVE_START,
  target: DIVE_START,
  expectedTarget: Number.NaN,
  idleTime: 0,
});

const near = (actual: number, expected: number): void => {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} != ${expected}`);
};

test('loading preserves queued navigation until the scene is live', () => {
  const drive = createDrive();
  const handoff = createHeroHandoff(route);
  const timeline = createDiveTimeline(drive, handoff);
  drive.target = route.entry.center;
  const queued = { ...drive };
  for (let index = 0; index < 60; index++) {
    advanceDiveTimeline(timeline, {
      delta: 1 / 60,
      stage: 'loading',
      motionMode: 'full',
    });
  }
  assert.deepEqual(drive, queued);
  assert.equal(handoff.arrival, 0);
  assert.equal(timeline.step, 0);
  assert.equal(timeline.velocity, 0);
  near(timeline.renderProgress, DIVE_START);
  advanceDiveTimeline(timeline, {
    delta: 1 / 60,
    stage: 'live',
    motionMode: 'full',
  });
  assert.ok(drive.current > DIVE_START);
  assert.ok(handoff.arrival > 0);
  assert.equal(timeline.drive, drive);
  assert.equal(timeline.handoff, handoff);
});

test('long frames cap movement and arrival together; zero time has finite velocity', () => {
  const drive = createDrive();
  drive.target = route.entry.center;
  const handoff = createHeroHandoff(route);
  const timeline = createDiveTimeline(drive, handoff);
  advanceDiveTimeline(timeline, {
    delta: 30,
    stage: 'live',
    motionMode: 'full',
  });
  assert.equal(timeline.delta, 0.1);
  near(handoff.arrival, 0.1 / ARRIVAL_DURATION);
  assert.ok(timeline.step > 0 && timeline.step <= 0.45);
  const current = drive.current;
  const arrival = handoff.arrival;
  advanceDiveTimeline(timeline, {
    delta: 0,
    stage: 'live',
    motionMode: 'full',
  });
  near(drive.current, current);
  assert.equal(handoff.arrival, arrival);
  assert.equal(timeline.velocity, 0);
});

test('the opening advances by elapsed live time and remains complete', () => {
  const handoff = createHeroHandoff(route);
  const timeline = createDiveTimeline(createDrive(), handoff);
  for (let index = 0; index < 168; index++) {
    advanceDiveTimeline(timeline, {
      delta: 1 / 60,
      stage: 'live',
      motionMode: 'full',
    });
  }
  near(handoff.arrival, 1);
  advanceDiveTimeline(timeline, {
    delta: 1,
    stage: 'live',
    motionMode: 'full',
  });
  assert.equal(handoff.arrival, 1);
});

test('reduced motion still waits for loading, then settles the current command', () => {
  const drive = createDrive();
  drive.target = route.last.center;
  const handoff = createHeroHandoff(route);
  const timeline = createDiveTimeline(drive, handoff);
  advanceDiveTimeline(timeline, {
    delta: 1 / 60,
    stage: 'loading',
    motionMode: 'reduced',
  });
  assert.equal(drive.current, DIVE_START);
  assert.equal(handoff.arrival, 0);
  advanceDiveTimeline(timeline, {
    delta: 1 / 60,
    stage: 'live',
    motionMode: 'reduced',
  });
  assert.equal(drive.current, drive.target);
  assert.equal(handoff.arrival, 1);
  drive.target = route.entry.center;
  advanceDiveTimeline(timeline, {
    delta: 1 / 60,
    stage: 'live',
    motionMode: 'full',
  });
  assert.ok(drive.current > drive.target);
  assert.equal(handoff.arrival, 1);
});

test('a composited crossing keeps camera progress separate from the live journey', () => {
  const drive = createDrive();
  drive.current = drive.target = (HANDOFF_START + HANDOFF_END) / 2;
  const handoff = createHeroHandoff(route);
  handoff.hero = new CanvasTexture(new EventTarget());
  handoff.entry = new CanvasTexture(new EventTarget());
  handoff.sourceWorld = 'hero';
  const timeline = createDiveTimeline(drive, handoff);
  advanceDiveTimeline(timeline, {
    delta: 0,
    stage: 'live',
    motionMode: 'full',
  });
  assert.equal(handoff.compositing, true);
  near(handoff.journey, drive.current);
  assert.equal(timeline.renderProgress, HANDOFF_END);
  assert.notEqual(timeline.renderProgress, handoff.journey);
  advanceDiveTimeline(timeline, {
    delta: 0,
    stage: 'live',
    motionMode: 'reduced',
  });
  assert.equal(handoff.compositing, false);
  near(timeline.renderProgress, handoff.journey);
  handoff.hero.dispose();
  handoff.entry.dispose();
});

test('overlay refreshes first paint, arrival, journey, and motion-mode changes', () => {
  const motion = createOverlayMotion({
    chapters: new Map(),
    sections: new Map(),
    root: null,
    veil: null,
  });
  const frame: OverlayFrame = {
    descent: createDescentFrame(),
    handoff: createHeroHandoff(route),
    motionMode: 'full',
  };
  assert.equal(overlayNeedsUpdate(motion, frame), true);
  updateOverlay(motion, frame);
  assert.equal(overlayNeedsUpdate(motion, frame), false);
  frame.handoff.arrival = 0.5;
  assert.equal(overlayNeedsUpdate(motion, frame), true);
  updateOverlay(motion, frame);
  assert.equal(overlayNeedsUpdate(motion, frame), false);
  frame.motionMode = 'reduced';
  assert.equal(overlayNeedsUpdate(motion, frame), true);
  updateOverlay(motion, frame);
  frame.handoff.journey = route.last.center;
  assert.equal(overlayNeedsUpdate(motion, frame), true);
});

test('active crossings keep updating; resting chapters do not', () => {
  const motion = createOverlayMotion({
    chapters: new Map(),
    sections: new Map(),
    root: null,
    veil: null,
  });
  const frame: OverlayFrame = {
    descent: createDescentFrame(),
    handoff: createHeroHandoff(route),
    motionMode: 'full',
  };
  frame.handoff.arrival = 1;
  frame.handoff.journey = route.entry.center;
  updateOverlay(motion, frame);
  assert.equal(overlayNeedsUpdate(motion, frame), false);
  frame.handoff.progress = 0.5;
  assert.equal(overlayNeedsUpdate(motion, frame), true);
  updateOverlay(motion, frame);
  assert.equal(overlayNeedsUpdate(motion, frame), true);
  frame.handoff.progress = 1;
  assert.equal(overlayNeedsUpdate(motion, frame), false);
});

const createPanel = () => ({
  dataset: {},
  inert: false,
  scrollHeight: 2400,
  scrollTop: 600,
  style: { opacity: '', transform: '', visibility: '' },
});

const panelOffset = (panel: ReturnType<typeof createPanel>): number =>
  Number.parseFloat(panel.style.transform.slice('translate3d(0, '.length));

test('neighbouring chapters scroll past each other instead of fading', () => {
  const work = createPanel();
  const stack = createPanel();
  const motion = createOverlayMotion({
    chapters: new Map(),
    sections: new Map([
      ['work', work as unknown as HTMLDivElement],
      ['stack', stack as unknown as HTMLDivElement],
    ]),
    root: null,
    veil: null,
  });
  const frame: OverlayFrame = {
    descent: createDescentFrame(),
    handoff: createHeroHandoff(route),
    motionMode: 'full',
  };
  frame.handoff.arrival = 1;
  frame.handoff.journey = route.entry.center;
  updateOverlay(motion, frame);
  assert.equal(stack.style.opacity, '0');
  frame.handoff.journey = route.entry.center + CHAPTER_GAP / 2;
  updateOverlay(motion, frame);
  assert.deepEqual([work.style.opacity, stack.style.opacity], ['1', '1']);
  near(panelOffset(work), -50);
  near(panelOffset(stack), 50);
  assert.deepEqual([work.scrollTop, stack.scrollTop], [work.scrollHeight, 0]);
  frame.handoff.journey = HANDOFF_END + 0.02;
  updateOverlay(motion, frame);
  near(panelOffset(work), 0);
  assert.equal(work.scrollTop, 0);
});
