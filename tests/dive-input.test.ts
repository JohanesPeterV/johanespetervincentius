import assert from 'node:assert/strict';
import test from 'node:test';

import {
  advanceDrive,
  createDrive,
  scrollDriveBy,
  stepDriveToSection,
} from '../src/components/dive/camera-motion';
import { normalizeWheelDelta } from '../src/components/dive/dive-input';
import { DiveRoute } from '../src/components/dive/dive-route';

const route = new DiveRoute('Hero', [
  { id: 'work', title: 'Work' },
  { id: 'stack', title: 'Stack' },
  { id: 'ice', title: 'Frozen in time' },
]);

test('successive scroll deltas scrub the journey and reverse within a gesture', () => {
  const drive = createDrive(route);
  const start = drive.target;
  scrollDriveBy(drive, 0.02);
  assert.ok(Math.abs(drive.target - start - 0.02) < 1e-9);
  scrollDriveBy(drive, 0.04);
  assert.ok(Math.abs(drive.target - start - 0.06) < 1e-9);
  scrollDriveBy(drive, -0.03);
  assert.ok(Math.abs(drive.target - start - 0.03) < 1e-9);
  assert.ok(drive.target < route.entry.center);
});

test('continuous slow scrolling crosses every chapter and loop without snapping back', () => {
  for (const direction of [-1, 1]) {
    const drive = createDrive(route);
    const start = drive.current;
    for (let frame = 0; frame < 2400; frame++) {
      const previous = drive.current;
      scrollDriveBy(drive, direction * 0.005);
      advanceDrive(drive, 1 / 60);
      assert.ok((drive.current - previous) * direction >= 0);
    }
    assert.ok((drive.current - start) * direction > route.length * 3);
  }
});

test('large scroll bursts stay bounded and do not reverse a chapter command', () => {
  const drive = createDrive(route);
  scrollDriveBy(drive, 10);
  assert.ok(drive.target - drive.current <= 0.85);
  drive.target = drive.current;
  stepDriveToSection(drive, 1);
  const destination = drive.target;
  scrollDriveBy(drive, 0.01);
  assert.equal(drive.target, destination);
});

test('idle scrolling settles at the nearest chapter after input ends', () => {
  const drive = createDrive(route);
  for (let frame = 0; frame < 60; frame++) {
    scrollDriveBy(drive, 0.012);
    advanceDrive(drive, 1 / 60);
  }
  assert.ok(drive.current < route.entry.center);
  for (let frame = 0; frame < 600; frame++) {
    advanceDrive(drive, 1 / 60);
  }
  assert.ok(Math.abs(drive.current - route.entry.center) < 1e-6);
});

test('wheel pixel, line and page units retain proportional distance', () => {
  assert.equal(normalizeWheelDelta({ deltaY: 40, deltaMode: 0 }, 800), 40);
  assert.equal(normalizeWheelDelta({ deltaY: -3, deltaMode: 1 }, 800), -48);
  assert.equal(normalizeWheelDelta({ deltaY: 1, deltaMode: 2 }, 800), 800);
});
