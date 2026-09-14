import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createDrive,
  advanceDrive,
  stepDriveToSection,
} from '../src/components/dive/camera-motion';
import {
  DiveRoute,
  DIVE_START,
  ENTRY_CENTER,
  LOOP_END,
} from '../src/components/dive/dive-route';
import {
  createDescentFrame,
  writeDescentFrame,
} from '../src/components/dive/descent';
import {
  createHeroHandoff,
  sampleHeroHandoff,
} from '../src/components/dive/hero-handoff';

const near = (actual: number, expected: number): void => {
  assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
};

for (const ids of [
  ['stack'],
  ['stack', 'work'],
  ['stack', 'notes', 'work', 'contact'],
]) {
  test(`${ids.join(', ')}: supplied order controls stepping, entry and return crossing`, () => {
    const route = new DiveRoute(
      'Hero',
      ids.map((id) => ({ id, title: id })),
    );
    assert.deepEqual(
      route.sections.map(({ id }) => id),
      ['hero', ...ids],
    );
    assert.equal(route.entry.id, ids[0]);
    assert.equal(route.last.id, ids[ids.length - 1]);
    near(DIVE_START + route.length - route.last.center, 1);
    for (const direction of [-1, 1] as const) {
      const drive = createDrive(route);
      for (let step = 1; step <= route.sections.length * 3; step++) {
        const previous = drive.target;
        stepDriveToSection(drive, direction);
        assert.equal(Math.sign(drive.target - previous), direction);
        for (let frame = 0; frame < 240; frame++) {
          advanceDrive(drive, 1 / 60);
        }
        const index =
          (((step * direction) % route.sections.length) +
            route.sections.length) %
          route.sections.length;
        near(route.jumpDelta(drive.current, route.sections[index].center), 0);
      }
    }
    const handoff = createHeroHandoff(route);
    handoff.journey = route.wrap(
      (route.loopStart + route.length + LOOP_END) / 2,
    );
    const camera = sampleHeroHandoff(handoff, 'reduced');
    assert.equal(handoff.crossing, 'loop');
    assert.ok(camera === route.loopStart || camera === LOOP_END);
  });

  test(`${ids.join(', ')}: camera repeats chapter excursions and the finale follows the last chapter`, () => {
    const route = new DiveRoute(
      'Hero',
      ids.map((id) => ({ id, title: id })),
    );
    const expectedPose = writeDescentFrame(createDescentFrame(), ENTRY_CENTER);
    for (const section of route.sections.slice(1)) {
      const frame = writeDescentFrame(
        createDescentFrame(),
        route.sceneProgress(section.center),
      );
      frame.position.forEach((value, index) =>
        near(value, expectedPose.position[index]),
      );
      frame.look.forEach((value, index) =>
        near(value, expectedPose.look[index]),
      );
      for (const offset of [-1e-6, 1e-6]) {
        const adjacent = writeDescentFrame(
          createDescentFrame(),
          route.sceneProgress(section.center + offset),
        );
        frame.position.forEach((value, index) =>
          near(adjacent.position[index], value),
        );
      }
    }
    for (const section of route.sections.slice(1, -1)) {
      near(route.sceneProgress(section.center + 0.3), 2.25);
    }
    near(route.sceneProgress(route.last.center + 0.3), 2.85);
    near(route.sceneProgress(route.loopStart), 2.9);
  });
}

test('invalid chapter identities fail before navigation or rendering', () => {
  assert.throws(() => new DiveRoute('Hero', []), /at least one/);
  for (const ids of [['hero'], [''], [' '], ['work', 'work']]) {
    assert.throws(
      () =>
        new DiveRoute(
          'Hero',
          ids.map((id) => ({ id, title: id })),
        ),
      /nonempty and unique/,
    );
  }
});
