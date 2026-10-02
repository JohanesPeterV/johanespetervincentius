import assert from 'node:assert/strict';
import test from 'node:test';

import type { MeibelAnimation } from '../src/app/_components/meibel/meibel-engine';

import {
  lookDirection,
  MeibelEngine,
  MEIBEL_CLIPS,
} from '../src/app/_components/meibel/meibel-engine';

test('every standard animation can play every populated cell', () => {
  const cases: { animation: MeibelAnimation; row: number; frames: number }[] = [
    { animation: 'idle', row: 0, frames: 6 },
    { animation: 'running-right', row: 1, frames: 8 },
    { animation: 'running-left', row: 2, frames: 8 },
    { animation: 'waving', row: 3, frames: 4 },
    { animation: 'jumping', row: 4, frames: 5 },
    { animation: 'failed', row: 5, frames: 8 },
    { animation: 'waiting', row: 6, frames: 6 },
    { animation: 'running', row: 7, frames: 6 },
    { animation: 'review', row: 8, frames: 6 },
  ];
  for (const { animation, row, frames } of cases) {
    const engine = new MeibelEngine();
    engine.play(animation);
    const columns = new Set<number>();
    const duration = MEIBEL_CLIPS[animation].durations.reduce(
      (sum, value) => sum + value,
      0,
    );
    let previousOffset = 0;
    for (let time = 0; time < duration; time += 5) {
      const frame = engine.frame();
      assert.equal(frame.row, row);
      assert.ok(frame.column >= 0 && frame.column < frames);
      assert.ok(Math.abs(frame.offsetX - previousOffset) < 0.2);
      previousOffset = frame.offsetX;
      columns.add(frame.column);
      engine.advance(5);
    }
    assert.equal(columns.size, frames);
  }
});

test('ambient behavior stays still with an occasional glance and long lounge', () => {
  const engine = new MeibelEngine();
  let idleSamples = 0;
  for (let time = 0; time < 200000; time += 100) {
    const frame = engine.frame();
    assert.ok(['idle', 'review', 'lounging'].includes(frame.animation));
    assert.equal(frame.offsetX, 0);
    if (time < 60000) {
      assert.equal(frame.animation, 'idle');
    }
    if (frame.animation !== 'review') {
      idleSamples += 1;
    }
    engine.advance(100);
  }
  assert.ok(idleSamples / 2000 > 0.99);
});

test('all sixteen clockwise gaze directions map to the final two atlas rows', () => {
  for (let direction = 0; direction < 16; direction += 1) {
    const angle = (direction * Math.PI) / 8;
    const x = Math.sin(angle) * 100;
    const y = -Math.cos(angle) * 100;
    assert.equal(lookDirection(x, y), direction);
    const engine = new MeibelEngine();
    engine.advance(2000);
    engine.lookAt(x, y);
    const frame = engine.frame();
    assert.equal(frame.animation, 'look');
    assert.equal(frame.row, 9 + Math.floor(direction / 8));
    assert.equal(frame.column, direction % 8);
    engine.advance(1800);
    assert.equal(engine.frame().animation, 'idle');
  }
  assert.equal(lookDirection(0, 0), null);
});

test('a jump completes despite hover, focus, and repeated taps', () => {
  const engine = new MeibelEngine();
  engine.play('jumping');
  engine.advance(350);
  engine.play('waving');
  engine.play('jumping');
  assert.equal(engine.frame().animation, 'jumping');
  assert.equal(engine.frame().column, 2);
  engine.advance(550);
  assert.equal(engine.frame().animation, 'idle');
});

test('reduced motion holds a still pose, accepts gaze, and clears it on exit', () => {
  const engine = new MeibelEngine();
  engine.advance(39000);
  engine.setMotion('reduced');
  engine.play('jumping');
  assert.deepEqual(engine.frame(), {
    animation: 'idle',
    row: 0,
    column: 0,
    offsetX: 0,
    offsetY: 0,
  });
  engine.lookAt(-100, 0);
  assert.equal(engine.frame().row, 10);
  assert.equal(engine.frame().column, 4);
  engine.clearGaze();
  assert.equal(engine.frame().animation, 'idle');
});

test('petting closes her eyes without jumping or moving', () => {
  const engine = new MeibelEngine();
  engine.play('petting');
  engine.advance(150);
  assert.equal(engine.frame().animation, 'petting');
  assert.equal(engine.frame().row, 0);
  assert.equal(engine.frame().column, 3);
  engine.play('waving');
  engine.play('petting');
  engine.advance(600);
  assert.equal(engine.frame().column, 3);
  assert.equal(engine.frame().offsetX, 0);
  assert.equal(engine.frame().offsetY, 0);
  engine.advance(170);
  assert.equal(engine.frame().animation, 'idle');
});

const advanceFor = (engine: MeibelEngine, duration: number): void => {
  for (let time = 0; time < duration; time += 16) {
    engine.advance(Math.min(16, duration - time));
  }
};

test('following automatically approaches with animated poses and bounded body movement', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-400, -200);
  const cells = new Set<number>();
  const rotations = new Set<number>();
  let previous = engine.frame();
  for (let time = 0; time < 1600; time += 16) {
    engine.advance(16);
    const frame = engine.frame();
    assert.equal(frame.animation, 'running-left');
    assert.equal(frame.facing, 'left');
    assert.ok(
      Math.hypot(
        frame.offsetX - previous.offsetX,
        frame.offsetY - previous.offsetY,
      ) < 4,
    );
    cells.add(frame.column);
    rotations.add(Math.round(frame.rotation ?? 0));
    previous = frame;
  }
  assert.equal(cells.size, 8);
  assert.ok(rotations.size >= 5);
  assert.ok(Math.hypot(previous.offsetX, previous.offsetY) <= 291);
});

test('a held cursor produces repeated reaches, opposite sides, arcs, and quiet pauses', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-160, -100);
  let reachStarts = 0;
  let previousAnimation = '';
  let quietDuration = 0;
  let longestQuiet = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const reachFacings = new Set<string>();
  let previous = engine.frame();
  for (let time = 0; time < 12000; time += 16) {
    engine.advance(16);
    const frame = engine.frame();
    assert.ok(
      Math.hypot(
        frame.offsetX - previous.offsetX,
        frame.offsetY - previous.offsetY,
      ) < 4.1,
    );
    if (frame.animation === 'swatting') {
      reachFacings.add(frame.facing ?? '');
      if (previousAnimation !== 'swatting') {
        reachStarts += 1;
      }
    }
    if (
      frame.animation === 'idle' &&
      Math.abs(frame.offsetX - previous.offsetX) < 0.01 &&
      Math.abs(frame.offsetY - previous.offsetY) < 0.01
    ) {
      quietDuration += 16;
      longestQuiet = Math.max(longestQuiet, quietDuration);
    } else {
      quietDuration = 0;
    }
    if (time > 2000) {
      minX = Math.min(minX, frame.offsetX);
      maxX = Math.max(maxX, frame.offsetX);
      minY = Math.min(minY, frame.offsetY);
      maxY = Math.max(maxY, frame.offsetY);
    }
    previous = frame;
    previousAnimation = frame.animation;
  }
  assert.ok(reachStarts >= 3);
  assert.deepEqual([...reachFacings].sort(), ['left', 'right']);
  assert.ok(maxX - minX >= 75);
  assert.ok(maxY - minY >= 35);
  assert.ok(longestQuiet >= 864);
});

test('reach uses all real-photo cells and moves her body toward the cursor', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-40, 0);
  engine.advance(16);
  assert.equal(engine.frame().animation, 'swatting');
  assert.equal(engine.frame().facing, 'left');
  const cells = new Set<string>();
  let highestReach = 0;
  let furthestReach = 0;
  for (let time = 0; time < 1480; time += 20) {
    const frame = engine.frame();
    assert.equal(frame.animation, 'swatting');
    assert.equal(frame.facing, 'left');
    assert.ok(frame.offsetY >= -8 && frame.offsetY <= 0);
    assert.ok(frame.offsetX >= -6 && frame.offsetX <= 0);
    highestReach = Math.min(highestReach, frame.offsetY);
    furthestReach = Math.min(furthestReach, frame.offsetX);
    cells.add(`${frame.row}:${frame.column}`);
    engine.advance(20);
  }
  assert.equal(cells.size, 8);
  assert.ok(highestReach < -7.9);
  assert.ok(furthestReach < -5.9);
  assert.equal(engine.frame().animation, 'idle');
  assert.equal(engine.frame().offsetX, 0);
  assert.equal(engine.frame().offsetY, 0);
});

test('moving the cursor retargets a reach into a chase without teleporting', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-40, 0);
  advanceFor(engine, 400);
  const before = engine.frame();
  engine.followTo(200, -50);
  const retargeted = engine.frame();
  assert.notEqual(retargeted.animation, 'swatting');
  assert.ok(
    Math.hypot(
      retargeted.offsetX - before.offsetX,
      retargeted.offsetY - before.offsetY,
    ) <= 10,
  );
  advanceFor(engine, 100);
  assert.equal(engine.frame().animation, 'running-right');
  assert.ok(engine.frame().offsetX > retargeted.offsetX);
});

test('leaving pauses recurring play and returning resumes it', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-40, 0);
  advanceFor(engine, 400);
  engine.pausePursuit();
  const paused = engine.frame();
  advanceFor(engine, 6000);
  assert.equal(engine.frame().offsetX, paused.offsetX);
  assert.equal(engine.frame().offsetY, paused.offsetY);
  assert.equal(engine.frame().animation, 'idle');
  engine.followTo(-40, 0);
  engine.advance(16);
  assert.equal(engine.frame().animation, 'swatting');
});

test('petting pauses a chase before it continues to the latest cursor target', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-300, -400);
  advanceFor(engine, 100);
  engine.play('petting');
  const before = engine.frame();
  engine.followTo(-500, -400);
  advanceFor(engine, 500);
  assert.equal(engine.frame().animation, 'petting');
  assert.equal(engine.frame().offsetX, before.offsetX);
  assert.equal(engine.frame().offsetY, before.offsetY);
  advanceFor(engine, 520);
  assert.equal(engine.frame().animation, 'running-left');
  assert.ok(engine.frame().offsetX < before.offsetX);
});

test('Stop cancels play and returns home even after the pointer leaves', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-160, -100);
  advanceFor(engine, 3000);
  engine.setFollowMode('resting');
  engine.pausePursuit();
  engine.followTo(-500, -300);
  let previous = engine.frame();
  for (let time = 0; time < 2500; time += 16) {
    engine.advance(16);
    const frame = engine.frame();
    const maximumStep =
      frame.offsetX === 0 && frame.offsetY === 0 ? 3.57 : 2.57;
    assert.ok(
      Math.hypot(
        frame.offsetX - previous.offsetX,
        frame.offsetY - previous.offsetY,
      ) <= maximumStep,
    );
    if (frame.animation === 'running-right') {
      assert.equal(frame.facing, 'right');
    }
    previous = frame;
  }
  assert.equal(engine.followMode, 'resting');
  assert.equal(engine.frame().offsetX, 0);
  assert.equal(engine.frame().offsetY, 0);
  assert.equal(engine.frame().animation, 'idle');
});

test('reduced motion cancels following and prevents new play requests', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-300, -400);
  advanceFor(engine, 500);
  engine.setMotion('reduced');
  engine.setFollowMode('following');
  engine.followTo(-300, -400);
  engine.advance(10000);
  assert.equal(engine.followMode, 'resting');
  assert.equal(engine.frame().animation, 'idle');
  assert.equal(engine.frame().offsetX, 0);
  assert.equal(engine.frame().offsetY, 0);
});

test('resting and invalid coordinates never start cursor pursuit', () => {
  const engine = new MeibelEngine();
  engine.followTo(-300, -400);
  advanceFor(engine, 1000);
  assert.equal(engine.frame().offsetX, 0);
  engine.setFollowMode('following');
  engine.followTo(Infinity, 0);
  engine.followTo(0, NaN);
  advanceFor(engine, 1000);
  assert.equal(engine.frame().offsetX, 0);
  assert.equal(engine.frame().offsetY, 0);
});

test('manual and ambient lounging ignore gaze and hover', () => {
  for (const trigger of ['manual', 'ambient']) {
    const engine = new MeibelEngine();
    if (trigger === 'manual') {
      engine.play('lounging');
    } else {
      engine.advance(181500);
    }
    engine.lookAt(-100, 0);
    engine.play('waving');
    engine.advance(12000);
    assert.equal(engine.frame().animation, 'lounging');
    assert.equal(engine.frame().column, 1);
    engine.advance(1800);
    assert.equal(engine.frame().column, 2);
    engine.advance(300);
    assert.equal(engine.frame().column, 3);
    engine.advance(15900);
    assert.equal(engine.frame().animation, 'idle');
  }
});

test('lounging stops play and petting or Follow can interrupt it', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-120, 0);
  advanceFor(engine, 300);
  const before = engine.frame();
  engine.play('lounging');
  assert.equal(engine.followMode, 'resting');
  assert.equal(engine.frame().offsetX, before.offsetX);
  assert.equal(engine.frame().offsetY, before.offsetY);
  engine.play('petting');
  assert.equal(engine.frame().animation, 'petting');
  engine.play('lounging');
  engine.setFollowMode('following');
  engine.followTo(-300, 0);
  advanceFor(engine, 100);
  assert.equal(engine.frame().animation, 'running-left');
});
