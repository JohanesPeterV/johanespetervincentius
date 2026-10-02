import assert from 'node:assert/strict';
import test from 'node:test';

import {
  lookDirection,
  MeibelEngine,
  MEIBEL_CLIPS,
} from '../src/app/_components/linktree/meibel-engine';

test('a complete behavior cycle uses every populated standard cell and walks home', () => {
  const engine = new MeibelEngine();
  const cells = new Set<string>();
  let previousOffset = 0;
  for (let time = 0; time < 43000; time += 10) {
    const frame = engine.frame();
    assert.ok(frame.row < 9);
    assert.ok(frame.column >= 0 && frame.column < 8);
    assert.ok(Math.abs(frame.offsetX - previousOffset) < 0.2);
    previousOffset = frame.offsetX;
    cells.add(`${frame.row}:${frame.column}`);
    engine.advance(10);
  }
  for (const clip of Object.values(MEIBEL_CLIPS)) {
    for (let column = 0; column < clip.durations.length; column += 1) {
      assert.ok(
        cells.has(`${clip.row}:${column}`),
        `missing ${clip.row}:${column}`,
      );
    }
  }
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
  assert.equal(engine.frame().animation, 'waving');
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
  });
  engine.lookAt(-100, 0);
  assert.equal(engine.frame().row, 10);
  assert.equal(engine.frame().column, 4);
  engine.clearGaze();
  assert.equal(engine.frame().animation, 'idle');
});
