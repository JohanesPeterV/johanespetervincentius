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

test('ambient behavior stays still apart from an occasional curious glance', () => {
  const engine = new MeibelEngine();
  let idleSamples = 0;
  for (let time = 0; time < 200000; time += 100) {
    const frame = engine.frame();
    assert.ok(frame.animation === 'idle' || frame.animation === 'review');
    assert.equal(frame.offsetX, 0);
    if (time < 60000) {
      assert.equal(frame.animation, 'idle');
    }
    if (frame.animation === 'idle') {
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

test('following approaches the pointer at a bounded speed and changes direction', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-300, -400);
  engine.advance(1000);
  const frame = engine.frame();
  assert.equal(frame.animation, 'running-left');
  assert.equal(frame.offsetX, -96);
  assert.equal(frame.offsetY, -128);
  assert.equal(Math.hypot(frame.offsetX, frame.offsetY), 160);
  engine.followTo(100, -128);
  engine.advance(500);
  assert.equal(engine.frame().animation, 'running-right');
  assert.equal(engine.frame().offsetX, -16);
  assert.equal(engine.frame().offsetY, -128);
});

test('following settles without overshooting and stopping returns her home', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-30, -40);
  engine.advance(1000);
  engine.advance(16);
  assert.equal(engine.frame().offsetX, -30);
  assert.equal(engine.frame().offsetY, -40);
  assert.equal(engine.frame().animation, 'idle');
  engine.setFollowMode('resting');
  engine.followTo(-300, -400);
  engine.advance(1000);
  engine.advance(16);
  assert.equal(engine.frame().offsetX, 0);
  assert.equal(engine.frame().offsetY, 0);
  assert.equal(engine.frame().animation, 'idle');
});

test('petting pauses following, then resumes the latest target', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-300, -400);
  engine.advance(100);
  const before = engine.frame();
  engine.play('petting');
  engine.advance(500);
  assert.equal(engine.frame().animation, 'petting');
  assert.equal(engine.frame().offsetX, before.offsetX);
  assert.equal(engine.frame().offsetY, before.offsetY);
  engine.advance(420);
  assert.equal(engine.frame().offsetX, before.offsetX);
  engine.advance(16);
  assert.equal(engine.frame().animation, 'running-left');
  assert.ok(engine.frame().offsetX < before.offsetX);
});

test('reduced motion cancels following and ignores new movement requests', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('following');
  engine.followTo(-300, -400);
  engine.advance(500);
  engine.setMotion('reduced');
  engine.setFollowMode('following');
  engine.followTo(-300, -400);
  engine.advance(10000);
  assert.equal(engine.frame().animation, 'idle');
  assert.equal(engine.frame().offsetX, 0);
  assert.equal(engine.frame().offsetY, 0);
});

test('resting or invalid pointer coordinates cannot move her', () => {
  const engine = new MeibelEngine();
  engine.followTo(-300, -400);
  engine.advance(1000);
  assert.equal(engine.frame().offsetX, 0);
  engine.setFollowMode('following');
  engine.followTo(Infinity, 0);
  engine.followTo(0, NaN);
  engine.advance(1000);
  assert.equal(engine.frame().offsetX, 0);
  assert.equal(engine.frame().offsetY, 0);
});
