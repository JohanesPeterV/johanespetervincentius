import assert from 'node:assert/strict';
import test from 'node:test';
import { CanvasTexture } from 'three';

import { createDrive } from '../src/components/dive/camera-motion';
import {
  createDiveFrame,
  writeDiveFrame,
} from '../src/components/dive/dive-frame';
import type { DivePalette } from '../src/components/dive/dive-palette';
import { DiveRoute, LOOP_END } from '../src/components/dive/dive-route';
import {
  createDiveTimeline,
  advanceDiveTimeline,
} from '../src/components/dive/dive-timeline';
import { createHeroHandoff } from '../src/components/dive/hero-handoff';

const palette: DivePalette = {
  mode: 'dark',
  accent: '#00ffff',
  background: '#000000',
  backgroundRgb: [0, 0, 0],
  exposure: 0.9,
  foreground: '#ffffff',
  fogDensity: 0,
  glow: '#8844ff',
  highlight: '#8844ff',
  litInk: '#ffffff',
  metal: '#cccccc',
  shadowInk: '#000000',
  sunlight: '#ffffff',
  surface: '#111111',
};

const route = new DiveRoute(
  'Hero',
  ['work', 'stack', 'notes'].map((id) => ({ id, title: id })),
);

test('publishing a frame leaves journey advancement to the timeline', () => {
  const drive = createDrive(route);
  drive.target = route.entry.center;
  const handoff = createHeroHandoff(route);
  const timeline = createDiveTimeline(drive, handoff);
  const frame = createDiveFrame();
  advanceDiveTimeline(timeline, {
    delta: 1 / 60,
    stage: 'live',
    motionMode: 'full',
  });
  const before = {
    drive: { ...drive },
    handoff: { ...handoff },
    timeline: { ...timeline },
  };
  writeDiveFrame(frame, { timeline, palette, motionMode: 'full' });
  assert.deepEqual(drive, before.drive);
  assert.deepEqual(handoff, before.handoff);
  assert.deepEqual(timeline, before.timeline);
  assert.equal(frame.delta, timeline.delta);
  assert.equal(frame.velocity, timeline.velocity);
  assert.equal(frame.world, 'hero');
});

test('a frame reuses its geometry and restores full camera motion after reduced mode', () => {
  const timeline = createDiveTimeline(
    createDrive(route),
    createHeroHandoff(route),
  );
  timeline.renderProgress = route.entry.center + 0.3;
  timeline.handoff.arrival = 1;
  const frame = createDiveFrame();
  const descent = frame.descent;
  const position = descent.position;
  writeDiveFrame(frame, { timeline, palette, motionMode: 'reduced' });
  assert.deepEqual(position, [0, 3.5, 16]);
  assert.equal(frame.cameraTravel, 0);
  writeDiveFrame(frame, { timeline, palette, motionMode: 'full' });
  assert.equal(frame.descent, descent);
  assert.equal(frame.descent.position, position);
  assert.ok(Math.abs(position[0] + 0.8) < 1e-9);
  assert.equal(frame.cameraTravel, frame.travel);
  assert.ok(frame.cameraTravel > 0.99);
  assert.equal(frame.world, 'orbital');
  writeDiveFrame(frame, {
    timeline,
    palette: { ...palette, backgroundRgb: [0.2, 0.3, 0.4] },
    motionMode: 'full',
  });
  assert.deepEqual(descent.fogColor, [0.2, 0.3, 0.4]);
});

for (const sourceWorld of ['hero', 'orbital'] as const) {
  test(`${sourceWorld} return crossing: renderers see the held world while HTML keeps the live journey`, () => {
    const drive = createDrive(route);
    drive.current = drive.target =
      (route.loopStart + route.length + LOOP_END) / 2;
    const handoff = createHeroHandoff(route);
    handoff.hero = new CanvasTexture(new EventTarget());
    handoff.last = new CanvasTexture(new EventTarget());
    handoff.sourceWorld = sourceWorld;
    const timeline = createDiveTimeline(drive, handoff);
    advanceDiveTimeline(timeline, {
      delta: 0,
      stage: 'live',
      motionMode: 'full',
    });
    const journey = handoff.journey;
    const frame = createDiveFrame();
    writeDiveFrame(frame, { timeline, palette, motionMode: 'full' });
    assert.equal(handoff.compositing, true);
    assert.equal(frame.world, sourceWorld === 'hero' ? 'orbital' : 'hero');
    assert.equal(frame.cameraTravel, 0);
    assert.equal(handoff.journey, journey);
    assert.notEqual(timeline.renderProgress, handoff.journey);
    handoff.hero.dispose();
    handoff.last.dispose();
  });
}
