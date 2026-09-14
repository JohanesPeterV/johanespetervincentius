import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { CanvasTexture } from 'three';

import { HandoffSnapshots } from '../src/components/dive/handoff-snapshots';
import type { HandoffSnapshotSet } from '../src/components/dive/handoff-snapshots';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (cause: Error) => void;
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
};

const resourcePair = () => {
  const pair = {
    hero: new CanvasTexture(new EventTarget()),
    entry: new CanvasTexture(new EventTarget()),
    last: new CanvasTexture(new EventTarget()),
  };
  const disposed = { hero: 0, entry: 0, last: 0 };
  pair.hero.addEventListener('dispose', () => disposed.hero++);
  pair.entry.addEventListener('dispose', () => disposed.entry++);
  pair.last.addEventListener('dispose', () => disposed.last++);
  return { pair, disposed };
};

const emptyTarget = (): {
  hero: CanvasTexture | null;
  entry: CanvasTexture | null;
  last: CanvasTexture | null;
} => ({ hero: null, entry: null, last: null });

test('repeated invalidations debounce one atomic pair replacement', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const old = resourcePair();
  const next = resourcePair();
  const target = { ...old.pair };
  const errors: (string | null)[] = [];
  let captures = 0;
  const snapshots = new HandoffSnapshots(
    target,
    async () => {
      captures++;
      return next.pair;
    },
    (message) => errors.push(message),
  );
  t.after(() => snapshots.dispose());
  for (let i = 0; i < 5; i++) {
    snapshots.invalidate();
  }
  t.mock.timers.tick(59);
  assert.equal(captures, 0);
  t.mock.timers.tick(1);
  await setImmediate();
  assert.equal(captures, 1);
  assert.deepEqual(target, next.pair);
  assert.deepEqual(old.disposed, { hero: 1, entry: 1, last: 1 });
  assert.deepEqual(errors, [null]);
  snapshots.dispose();
  snapshots.dispose();
  assert.deepEqual(next.disposed, { hero: 1, entry: 1, last: 1 });
  assert.deepEqual(target, emptyTarget());
});

test('in-flight captures never overlap; stale results are released before the latest retry', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const first = deferred<HandoffSnapshotSet>();
  const second = deferred<HandoffSnapshotSet>();
  const stale = resourcePair();
  const fresh = resourcePair();
  const target = emptyTarget();
  const signals: AbortSignal[] = [];
  const snapshots = new HandoffSnapshots(
    target,
    (signal) => {
      signals.push(signal);
      return signals.length === 1 ? first.promise : second.promise;
    },
    () => {},
  );
  t.after(() => snapshots.dispose());
  snapshots.invalidate();
  t.mock.timers.tick(60);
  snapshots.invalidate();
  snapshots.invalidate();
  assert.equal(signals[0].aborted, true);
  t.mock.timers.tick(60);
  assert.equal(signals.length, 1);
  first.resolve(stale.pair);
  await setImmediate();
  assert.deepEqual(stale.disposed, { hero: 1, entry: 1, last: 1 });
  assert.deepEqual(target, emptyTarget());
  t.mock.timers.tick(60);
  assert.equal(signals.length, 2);
  second.resolve(fresh.pair);
  await setImmediate();
  assert.deepEqual(target, fresh.pair);
  assert.deepEqual(fresh.disposed, { hero: 0, entry: 0, last: 0 });
});

test('capture failures preserve the last complete pair and clear on successful retry', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const old = resourcePair();
  const fresh = resourcePair();
  const target = { ...old.pair };
  const errors: (string | null)[] = [];
  let attempts = 0;
  const snapshots = new HandoffSnapshots(
    target,
    async () => {
      if (attempts++ === 0) {
        throw new Error('font unavailable');
      }
      return fresh.pair;
    },
    (message) => errors.push(message),
  );
  t.after(() => snapshots.dispose());
  snapshots.invalidate();
  t.mock.timers.tick(60);
  await setImmediate();
  assert.deepEqual(errors, ['font unavailable']);
  assert.deepEqual(target, old.pair);
  assert.deepEqual(old.disposed, { hero: 0, entry: 0, last: 0 });
  snapshots.invalidate();
  t.mock.timers.tick(60);
  await setImmediate();
  assert.deepEqual(errors, ['font unavailable', null]);
  assert.deepEqual(target, fresh.pair);
  assert.deepEqual(old.disposed, { hero: 1, entry: 1, last: 1 });
});

test("disposed sessions cannot publish late results or release a newer session's textures", async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = deferred<HandoffSnapshotSet>();
  const stale = resourcePair();
  const fresh = resourcePair();
  const target = emptyTarget();
  const oldErrors: (string | null)[] = [];
  let captures = 0;
  const old = new HandoffSnapshots(
    target,
    () => {
      captures++;
      return pending.promise;
    },
    (message) => oldErrors.push(message),
  );
  old.invalidate();
  t.mock.timers.tick(60);
  old.dispose();
  const next = new HandoffSnapshots(
    target,
    async () => fresh.pair,
    () => {},
  );
  t.after(() => next.dispose());
  next.invalidate();
  t.mock.timers.tick(60);
  await setImmediate();
  pending.resolve(stale.pair);
  await setImmediate();
  old.dispose();
  old.invalidate();
  t.mock.timers.tick(60);
  assert.equal(captures, 1);
  assert.deepEqual(target, fresh.pair);
  assert.deepEqual(stale.disposed, { hero: 1, entry: 1, last: 1 });
  assert.deepEqual(fresh.disposed, { hero: 0, entry: 0, last: 0 });
  assert.deepEqual(oldErrors, []);
});

test('a cancelled capture failure does not report an obsolete error', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = deferred<HandoffSnapshotSet>();
  const errors: (string | null)[] = [];
  const snapshots = new HandoffSnapshots(
    emptyTarget(),
    () => pending.promise,
    (message) => errors.push(message),
  );
  snapshots.invalidate();
  t.mock.timers.tick(60);
  snapshots.dispose();
  pending.reject(new Error('obsolete capture'));
  await setImmediate();
  assert.deepEqual(errors, []);
});
