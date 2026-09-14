import assert from 'node:assert/strict';
import test from 'node:test';
import { CanvasTexture } from 'three';

import {
  advanceDrive,
  jumpDriveToSection,
  stepDriveToSection,
} from '../src/components/dive/camera-motion';
import type { DriveMotion } from '../src/components/dive/camera-motion';
import {
  DIVE_LENGTH,
  DIVE_SECTIONS,
  DIVE_START,
  ENTRY_SECTION,
  LAST_SECTION,
} from '../src/components/dive/dive-sections';
import {
  LOOP_END,
  LOOP_START,
  sectionJumpDelta,
  wrapJourney,
} from '../src/components/dive/descent';
import { dragInputDelta } from '../src/components/dive/dive-input';
import type { PointerDrag } from '../src/components/dive/dive-input';
import {
  createHeroHandoff,
  HANDOFF_END,
  HANDOFF_START,
  sampleHeroHandoff,
} from '../src/components/dive/hero-handoff';

const createDrive = (): DriveMotion => ({
  current: DIVE_START,
  target: DIVE_START,
  expectedTarget: Number.NaN,
  idleTime: 0,
});

const near = (actual: number, expected: number): void => {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} != ${expected}`);
};

test('chapter poses retain the authored spacing and return gap', () => {
  near(DIVE_START, 0.95);
  near(ENTRY_SECTION.center, 1.95);
  for (let index = 2; index < DIVE_SECTIONS.length; index++) {
    near(DIVE_SECTIONS[index].center - DIVE_SECTIONS[index - 1].center, 0.6);
  }
  assert.equal(
    new Set(DIVE_SECTIONS.map(({ id }) => id)).size,
    DIVE_SECTIONS.length,
  );
  const openingGap = ENTRY_SECTION.center - DIVE_START;
  const returnGap = DIVE_START + DIVE_LENGTH - LAST_SECTION.center;
  near(returnGap, openingGap);
  assert.ok(LOOP_START > LAST_SECTION.center);
  assert.ok(LOOP_END + DIVE_LENGTH > LOOP_START);
});

test('chapter steps keep their direction and reach every stop across repeated laps', () => {
  const directions: (1 | -1)[] = [1, -1];
  for (const direction of directions) {
    const drive = createDrive();
    for (let step = 1; step <= DIVE_SECTIONS.length * 6; step++) {
      const previous = drive.target;
      stepDriveToSection(drive, direction);
      assert.equal(Math.sign(drive.target - previous), direction);
      const index =
        (((step * direction) % DIVE_SECTIONS.length) + DIVE_SECTIONS.length) %
        DIVE_SECTIONS.length;
      const destination = DIVE_SECTIONS[index].center;
      near(sectionJumpDelta(drive.target, destination), 0);
      for (let frame = 0; frame < 600; frame++) {
        advanceDrive(drive, 1 / 60);
      }
      near(sectionJumpDelta(drive.current, destination), 0);
    }
  }
});

test('chapter buttons choose the nearest equivalent destination on any lap', () => {
  for (let lap = -5; lap <= 5; lap++) {
    for (const source of DIVE_SECTIONS) {
      for (const destination of DIVE_SECTIONS) {
        const drive = createDrive();
        drive.current = source.center + lap * DIVE_LENGTH;
        drive.target = drive.current;
        jumpDriveToSection(drive, destination.center);
        assert.ok(
          Math.abs(drive.target - drive.current) <= DIVE_LENGTH / 2 + 0.000001,
        );
        near(sectionJumpDelta(drive.target, destination.center), 0);
      }
    }
  }
});

test('a slow frame samples Hero before entering the next crossing', () => {
  const directions: (1 | -1)[] = [1, -1];
  for (const direction of directions) {
    const drive = createDrive();
    drive.current -= direction * 0.01;
    drive.target += direction;
    advanceDrive(drive, 0.1);
    near(drive.current, DIVE_START);
  }
});

test('horizontal card drags and small movements do not navigate the journey', () => {
  const drag: PointerDrag = {
    id: 1,
    x: 100,
    y: 100,
    axis: 'pending',
    scrollTarget: null,
  };
  assert.equal(dragInputDelta(drag, { clientX: 102, clientY: 103 }), 0);
  assert.equal(drag.axis, 'pending');
  assert.equal(dragInputDelta(drag, { clientX: 120, clientY: 105 }), 0);
  assert.equal(drag.axis, 'horizontal');
  assert.equal(dragInputDelta(drag, { clientX: 120, clientY: 160 }), 0);
  drag.axis = 'pending-vertical';
  assert.equal(dragInputDelta(drag, { clientX: 120, clientY: 80 }), 20);
  assert.equal(drag.axis, 'vertical');
});

test('the entry crossing retains its outgoing world when input reverses', () => {
  const handoff = createHeroHandoff();
  handoff.hero = new CanvasTexture(new EventTarget());
  handoff.entry = new CanvasTexture(new EventTarget());
  handoff.sourceWorld = 'hero';
  handoff.journey = HANDOFF_START + (HANDOFF_END - HANDOFF_START) * 0.7;
  near(sampleHeroHandoff(handoff, 'full'), HANDOFF_END);
  assert.equal(handoff.compositing, true);
  handoff.journey = HANDOFF_START + (HANDOFF_END - HANDOFF_START) * 0.3;
  near(sampleHeroHandoff(handoff, 'full'), HANDOFF_END);
  assert.equal(handoff.sourceWorld, 'hero');
  handoff.journey = DIVE_START;
  near(sampleHeroHandoff(handoff, 'full'), DIVE_START);
  assert.equal(handoff.crossing, null);
  assert.equal(handoff.compositing, false);
  handoff.hero.dispose();
  handoff.entry.dispose();
});

test('reduced motion releases the compositor at both crossings on repeated laps', () => {
  const handoff = createHeroHandoff();
  handoff.hero = new CanvasTexture(new EventTarget());
  handoff.entry = new CanvasTexture(new EventTarget());
  handoff.sourceWorld = 'hero';
  for (let lap = -3; lap <= 3; lap++) {
    handoff.journey = wrapJourney(
      (HANDOFF_START + HANDOFF_END) / 2 + lap * DIVE_LENGTH,
    );
    sampleHeroHandoff(handoff, 'reduced');
    assert.equal(handoff.compositing, false);
    handoff.journey = wrapJourney(
      (LOOP_START + LOOP_END + DIVE_LENGTH) / 2 + lap * DIVE_LENGTH,
    );
    const position = sampleHeroHandoff(handoff, 'reduced');
    assert.equal(handoff.crossing, 'loop');
    assert.equal(handoff.compositing, false);
    assert.ok(position === LOOP_START || position === LOOP_END);
  }
  handoff.hero.dispose();
  handoff.entry.dispose();
});
