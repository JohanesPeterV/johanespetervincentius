import assert from 'node:assert/strict';
import test from 'node:test';

import {
  advanceDrive,
  createDrive,
  scrollDriveBy,
  settleDriveToSection,
  stepDriveToSection,
} from '../src/components/dive/camera-motion';
import {
  journeyDeltaForScroll,
  normalizeWheelDelta,
  scrollSectionBy,
} from '../src/components/dive/dive-input';
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

test('a held gesture stays proportional and snaps only when it ends', () => {
  const drive = createDrive(route);
  for (let frame = 0; frame < 60; frame++) {
    scrollDriveBy(drive, 0.012);
    advanceDrive(drive, 1 / 60);
  }
  assert.ok(drive.current < route.entry.center);
  const stoppedTarget = drive.target;
  for (let frame = 0; frame < 600; frame++) {
    advanceDrive(drive, 1 / 60);
  }
  assert.equal(drive.target, stoppedTarget);
  assert.equal(drive.current, stoppedTarget);
  settleDriveToSection(drive);
  for (let frame = 0; frame < 180; frame++) {
    advanceDrive(drive, 1 / 60);
  }
  assert.ok(Math.abs(drive.current - route.entry.center) < 1e-9);
});

test('idle snap reaches the nearest screen in both directions across repeated loops', () => {
  for (const lap of [-3, 0, 3]) {
    for (const section of route.sections) {
      for (const offset of [-0.2, 0.2]) {
        const drive = createDrive(route);
        const center = section.center + lap * route.length;
        drive.current = center + offset;
        drive.target = drive.current;
        settleDriveToSection(drive);
        for (let frame = 0; frame < 180; frame++) {
          advanceDrive(drive, 1 / 60);
        }
        assert.ok(Math.abs(drive.current - center) < 1e-9);
        assert.equal(drive.settling, false);
      }
    }
  }
});

test('new scrolling interrupts a snap from its visible position', () => {
  const drive = createDrive(route);
  drive.current = route.entry.center - 0.2;
  drive.target = drive.current;
  settleDriveToSection(drive);
  advanceDrive(drive, 1 / 60);
  const visible = drive.current;
  scrollDriveBy(drive, -0.03);
  advanceDrive(drive, 1 / 60);
  assert.ok(drive.current < visible);
  assert.equal(drive.target, visible - 0.03);
});

test('reading a tall section keeps its screen and scroll position after snapping', () => {
  const drive = createDrive(route);
  drive.current = route.entry.center - 0.2;
  drive.target = drive.current;
  settleDriveToSection(drive);
  for (let frame = 0; frame < 180; frame++) {
    advanceDrive(drive, 1 / 60);
  }
  const panel = { scrollTop: 0, scrollHeight: 2400, clientHeight: 800 };
  for (const delta of [400, 500, -200, 700]) {
    const remaining = scrollSectionBy(panel, delta);
    assert.equal(remaining, 0);
    scrollDriveBy(drive, remaining);
    settleDriveToSection(drive);
    for (let frame = 0; frame < 180; frame++) {
      advanceDrive(drive, 1 / 60);
    }
    assert.ok(Math.abs(drive.current - route.entry.center) < 1e-9);
  }
  assert.equal(panel.scrollTop, 1400);
  const overflow = scrollSectionBy(panel, 650);
  assert.equal(overflow, 450);
  assert.equal(panel.scrollTop, 1600);
  scrollDriveBy(drive, journeyDeltaForScroll(overflow, 800));
  settleDriveToSection(drive);
  for (let frame = 0; frame < 180; frame++) {
    advanceDrive(drive, 1 / 60);
  }
  assert.ok(Math.abs(drive.current - route.sections[2].center) < 1e-9);
});

test('wheel pixel, line and page units retain proportional distance', () => {
  assert.equal(normalizeWheelDelta({ deltaY: 40, deltaMode: 0 }, 800), 40);
  assert.equal(normalizeWheelDelta({ deltaY: -3, deltaMode: 1 }, 800), -48);
  assert.equal(normalizeWheelDelta({ deltaY: 1, deltaMode: 2 }, 800), 800);
});

test('reading consumes only the distance remaining before the panel edge', () => {
  const panel = { scrollTop: 590, scrollHeight: 1400, clientHeight: 800 };
  assert.equal(scrollSectionBy(panel, 40), 30);
  assert.equal(panel.scrollTop, 600);
  assert.equal(scrollSectionBy(panel, 40), 40);
  assert.equal(scrollSectionBy(panel, -40), 0);
  assert.equal(panel.scrollTop, 560);
});

test('the top edge transfers upward scroll without swallowing or doubling it', () => {
  const panel = { scrollTop: 10, scrollHeight: 1400, clientHeight: 800 };
  assert.equal(scrollSectionBy(panel, -40), -30);
  assert.equal(panel.scrollTop, 0);
  assert.equal(scrollSectionBy(panel, -40), -40);
  assert.equal(scrollSectionBy(null, 40), 40);
});

test('browser pixel rounding does not leak reading input into the journey', () => {
  let top = 0;
  const panel = {
    scrollHeight: 1400,
    clientHeight: 800,
    get scrollTop() {
      return top;
    },
    set scrollTop(value: number) {
      top = Math.round(value);
    },
  };
  assert.equal(scrollSectionBy(panel, 0.4), 0);
  assert.equal(panel.scrollTop, 0);
});

test('overflow continues toward Stack within the same reading gesture', () => {
  const panel = { scrollTop: 590, scrollHeight: 1400, clientHeight: 800 };
  const drive = createDrive(route);
  drive.current = route.entry.center;
  drive.target = drive.current;
  for (let input = 0; input < 12; input++) {
    const remaining = scrollSectionBy(panel, 40);
    scrollDriveBy(drive, journeyDeltaForScroll(remaining, 800));
    advanceDrive(drive, 1 / 60);
  }
  assert.ok(drive.target > (route.entry.center + route.sections[2].center) / 2);
  assert.ok(drive.target < route.sections[2].center);
});

test('the reading-to-journey handoff preserves the remaining wheel distance', () => {
  const panel = { scrollTop: 590, scrollHeight: 1400, clientHeight: 800 };
  const drive = createDrive(route);
  drive.current = route.entry.center;
  drive.target = drive.current;

  const remaining = scrollSectionBy(panel, 40);
  scrollDriveBy(drive, journeyDeltaForScroll(remaining, 800));
  advanceDrive(drive, 1 / 60);

  assert.equal(panel.scrollTop, 600);
  assert.equal(remaining, 30);
  assert.ok(Math.abs(drive.current - route.entry.center - 0.0225) < 1e-9);
});
