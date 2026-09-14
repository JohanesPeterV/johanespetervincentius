import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { CanvasTexture } from 'three';
import * as htmlToImage from 'html-to-image';

import { createHandoffCapture } from '../src/components/dive/capture-handoff';
import * as rasterizer from '../src/components/dive/capture-section';

const readyDocument = (t: TestContext): void => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { fonts: { ready: Promise.resolve() } },
  });
  t.after(() => {
    if (original) {
      Object.defineProperty(globalThis, 'document', original);
    } else {
      Reflect.deleteProperty(globalThis, 'document');
    }
  });
};

const hero = {} as HTMLDivElement;
const entry = {} as HTMLDivElement;

test('a failed font request can recover on the next capture', async (t) => {
  readyDocument(t);
  let fontAttempts = 0;
  t.mock.method(htmlToImage, 'getFontEmbedCSS', async () => {
    if (fontAttempts++ === 0) {
      throw new Error('temporary font failure');
    }
    return 'embedded fonts';
  });
  t.mock.method(
    rasterizer,
    'captureSection',
    async () => new CanvasTexture(new EventTarget()),
  );
  const capture = createHandoffCapture(hero, entry);
  await assert.rejects(
    capture(new AbortController().signal),
    /temporary font failure/,
  );
  for (let i = 0; i < 2; i++) {
    const pair = await capture(new AbortController().signal);
    pair.hero.dispose();
    pair.entry.dispose();
  }
  assert.equal(fontAttempts, 2);
});

test('entry capture failure disposes the already captured Hero texture', async (t) => {
  readyDocument(t);
  t.mock.method(htmlToImage, 'getFontEmbedCSS', async () => 'fonts');
  const texture = new CanvasTexture(new EventTarget());
  let disposed = 0;
  texture.addEventListener('dispose', () => disposed++);
  t.mock.method(
    rasterizer,
    'captureSection',
    async (element: HTMLDivElement) => {
      if (element === entry) {
        throw new Error('entry failed');
      }
      return texture;
    },
  );
  await assert.rejects(
    createHandoffCapture(hero, entry)(new AbortController().signal),
    /entry failed/,
  );
  assert.equal(disposed, 1);
});

test('cancellation between sections releases Hero and skips entry rasterization', async (t) => {
  readyDocument(t);
  t.mock.method(htmlToImage, 'getFontEmbedCSS', async () => 'fonts');
  const request = new AbortController();
  const texture = new CanvasTexture(new EventTarget());
  let disposed = 0;
  let captures = 0;
  texture.addEventListener('dispose', () => disposed++);
  t.mock.method(rasterizer, 'captureSection', async () => {
    captures++;
    request.abort();
    return texture;
  });
  await assert.rejects(createHandoffCapture(hero, entry)(request.signal), {
    name: 'AbortError',
  });
  assert.equal(captures, 1);
  assert.equal(disposed, 1);
});
