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

test('mouse play approaches gently and waits for the cursor to settle before swiping', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('playing');
  engine.followTo(-120, 0);
  engine.advance(500);
  assert.equal(engine.frame().offsetX, -60);
  assert.equal(engine.frame().animation, 'running-left');
  engine.advance(500);
  engine.followTo(-120, 0);
  engine.advance(16);
  assert.equal(engine.frame().animation, 'swatting');
  assert.equal(engine.frame().offsetX, -120);
  const cells = new Set<string>();
  let highestReach = 0;
  let lastOffsetY = 0;
  for (let time = 0; time < 1480; time += 20) {
    const frame = engine.frame();
    assert.equal(frame.animation, 'swatting');
    assert.equal(frame.offsetX, -120);
    assert.ok(frame.offsetY >= -8 && frame.offsetY <= 0);
    highestReach = Math.min(highestReach, frame.offsetY);
    lastOffsetY = frame.offsetY;
    cells.add(`${frame.row}:${frame.column}`);
    engine.advance(20);
  }
  assert.equal(cells.size, 8);
  assert.ok(highestReach < -7);
  assert.equal(lastOffsetY, 0);
  assert.equal(engine.frame().animation, 'idle');
  assert.equal(engine.frame().offsetY, 0);
});

test('a stationary cursor is swiped once and moving it rearms play after a rest', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('playing');
  engine.followTo(0, 0);
  engine.advance(300);
  assert.equal(engine.frame().animation, 'swatting');
  engine.advance(1480);
  engine.followTo(30, 0);
  engine.advance(300);
  engine.advance(16);
  assert.notEqual(engine.frame().animation, 'swatting');
  engine.advance(1500);
  assert.equal(engine.frame().animation, 'swatting');
  engine.advance(1480);
  engine.advance(20000);
  assert.equal(engine.frame().animation, 'idle');
  engine.followTo(32, 0);
  engine.advance(1000);
  engine.advance(16);
  assert.notEqual(engine.frame().animation, 'swatting');
});

test('the short reach is local to her chase position and petting settles it', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('playing');
  engine.followTo(-30, -40);
  engine.advance(500);
  engine.advance(360);
  assert.equal(engine.frame().animation, 'swatting');
  assert.equal(engine.frame().offsetX, -30);
  assert.ok(engine.frame().offsetY < -40 && engine.frame().offsetY >= -48);
  engine.play('petting');
  assert.equal(engine.frame().offsetY, -40);
});

test('leaving or opening controls cancels a swipe and pauses pursuit', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('playing');
  engine.followTo(0, 0);
  engine.advance(300);
  assert.equal(engine.frame().animation, 'swatting');
  engine.pausePursuit();
  engine.advance(10000);
  assert.equal(engine.frame().animation, 'idle');
  assert.equal(engine.frame().offsetX, 0);
});

test('stopping play cancels the swipe and reduced motion prevents cursor play', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('playing');
  engine.followTo(-60, 0);
  engine.advance(500);
  engine.advance(16);
  assert.equal(engine.frame().animation, 'swatting');
  engine.setFollowMode('resting');
  engine.advance(500);
  engine.advance(16);
  assert.equal(engine.frame().animation, 'idle');
  assert.equal(engine.frame().offsetX, 0);
  engine.setMotion('reduced');
  engine.setFollowMode('playing');
  engine.followTo(-60, 0);
  engine.advance(10000);
  assert.equal(engine.followMode, 'resting');
  assert.equal(engine.frame().animation, 'idle');
  assert.equal(engine.frame().offsetX, 0);
});

test('leaving after Stop preserves the return home', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('playing');
  engine.followTo(-120, -160);
  engine.advance(500);
  engine.setFollowMode('resting');
  engine.advance(100);
  engine.pausePursuit();
  engine.advance(1000);
  assert.equal(engine.frame().offsetX, 0);
  assert.equal(engine.frame().offsetY, 0);
  assert.equal(engine.frame().animation, 'idle');
});

test('play waits for movement to settle and stays within the diagonal speed limit', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('playing');
  engine.followTo(-300, -400);
  engine.advance(1000);
  assert.equal(Math.hypot(engine.frame().offsetX, engine.frame().offsetY), 120);
  engine.followTo(-72, -96);
  engine.advance(100);
  assert.notEqual(engine.frame().animation, 'swatting');
  engine.followTo(-66, -96);
  engine.advance(100);
  assert.notEqual(engine.frame().animation, 'swatting');
  engine.advance(200);
  assert.equal(engine.frame().animation, 'swatting');
});

test('petting interrupts a swipe and preserves the play position and rearm rules', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('playing');
  engine.followTo(0, 0);
  engine.advance(300);
  engine.play('petting');
  engine.advance(500);
  assert.equal(engine.frame().animation, 'petting');
  engine.followTo(-120, 0);
  assert.equal(engine.frame().offsetX, 0);
  engine.advance(420);
  assert.equal(engine.frame().offsetX, 0);
  engine.advance(100);
  assert.equal(engine.frame().animation, 'running-left');
  assert.equal(engine.frame().offsetX, -12);
});

test('lounging stops pursuit and holds through gaze and hover for thirty seconds', () => {
  const engine = new MeibelEngine();
  engine.setFollowMode('playing');
  engine.followTo(-120, 0);
  engine.advance(500);
  engine.play('lounging');
  assert.equal(engine.followMode, 'resting');
  engine.lookAt(-100, 0);
  engine.play('waving');
  engine.followTo(-400, 0);
  engine.advance(12000);
  assert.equal(engine.frame().animation, 'lounging');
  assert.equal(engine.frame().column, 1);
  assert.equal(engine.frame().offsetX, -60);
  engine.advance(1800);
  assert.equal(engine.frame().column, 2);
  engine.advance(300);
  assert.equal(engine.frame().column, 3);
  engine.advance(15899);
  assert.equal(engine.frame().animation, 'lounging');
  engine.advance(1);
  assert.equal(engine.frame().animation, 'idle');
});

test('petting and selecting a movement mode can interrupt lounging', () => {
  const engine = new MeibelEngine();
  engine.play('lounging');
  engine.play('petting');
  assert.equal(engine.frame().animation, 'petting');
  engine.play('lounging');
  engine.setFollowMode('following');
  engine.followTo(-100, 0);
  engine.advance(100);
  assert.equal(engine.frame().animation, 'running-left');
  engine.play('lounging');
  engine.setFollowMode('playing');
  engine.followTo(-100, 0);
  engine.advance(100);
  assert.equal(engine.frame().animation, 'running-left');
});
