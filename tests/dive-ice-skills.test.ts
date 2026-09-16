import assert from 'node:assert/strict';
import test from 'node:test';

import { iceSkillIndex } from '../src/components/dive/ice-skill-index';

test('the ice keeps the main stack throughout its central reading position', () => {
  for (const progress of [0.35, 0.4, 0.5, 0.6, 0.65]) {
    assert.equal(iceSkillIndex(progress, 8), 0);
  }
});

test('one ice cycles through the remaining groups on entry and exit', () => {
  const positions = [0, 0.12, 0.24, 0.5, 0.66, 0.75, 0.84, 1];
  assert.deepEqual(
    positions.map((value) => iceSkillIndex(value, 8)),
    [1, 2, 3, 0, 4, 5, 6, 7],
  );
  assert.deepEqual(
    positions.toReversed().map((value) => iceSkillIndex(value, 8)),
    [7, 6, 5, 4, 0, 3, 2, 1],
  );
});
