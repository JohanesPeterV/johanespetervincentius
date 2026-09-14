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
const last = { scrollTop: 120 } as HTMLDivElement;

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
  const capture = createHandoffCapture(hero, entry, last);
  await assert.rejects(
    capture(new AbortController().signal),
    /temporary font failure/,
  );
  for (let i = 0; i < 2; i++) {
    const pair = await capture(new AbortController().signal);
    pair.hero.dispose();
    pair.entry.dispose();
    pair.last.dispose();
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
    createHandoffCapture(hero, entry, last)(new AbortController().signal),
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
  await assert.rejects(
    createHandoffCapture(hero, entry, last)(request.signal),
    {
      name: 'AbortError',
    },
  );
  assert.equal(captures, 1);
  assert.equal(disposed, 1);
});

test('final chapter capture includes its own content and releases both earlier textures on failure', async (t) => {
  readyDocument(t);
  t.mock.method(htmlToImage, 'getFontEmbedCSS', async () => 'fonts');
  const captured: HTMLDivElement[] = [];
  let disposed = 0;
  t.mock.method(
    rasterizer,
    'captureSection',
    async (element: HTMLDivElement) => {
      captured.push(element);
      if (element === last) {
        throw new Error('final canvas failed');
      }
      const texture = new CanvasTexture(new EventTarget());
      texture.addEventListener('dispose', () => disposed++);
      return texture;
    },
  );
  await assert.rejects(
    createHandoffCapture(hero, entry, last)(new AbortController().signal),
    /final canvas failed/,
  );
  assert.deepEqual(captured, [hero, entry, last]);
  assert.equal(disposed, 2);
});

test('the final chapter captures its current scroll position while entry retains its reading pose', async (t) => {
  readyDocument(t);
  t.mock.method(htmlToImage, 'getFontEmbedCSS', async () => 'fonts');
  const offsets: (number | undefined)[] = [];
  t.mock.method(
    rasterizer,
    'captureSection',
    async (_element: HTMLDivElement, _css: string, offset?: number) => {
      offsets.push(offset);
      return new CanvasTexture(new EventTarget());
    },
  );
  const captured = await createHandoffCapture(
    hero,
    entry,
    last,
  )(new AbortController().signal);
  assert.deepEqual(offsets, [undefined, undefined, 120]);
  captured.hero.dispose();
  captured.entry.dispose();
  captured.last.dispose();
});
