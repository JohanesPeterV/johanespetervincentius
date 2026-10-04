import assert from 'node:assert/strict';
import test from 'node:test';

import { mountMeibel } from '../src/app/_components/meibel/meibel-runtime';

test('rendered walking, petting, swatting, and return-home keep their own atlases', () => {
  let now = 0;
  let nextFrame: FrameRequestCallback | null = null;
  const sprite = {
    style: {
      backgroundImage: '',
      backgroundPosition: '',
      transform: '',
      filter: '',
    },
  };
  const panel = Object.assign(new EventTarget(), {
    matches: () => false,
    offsetHeight: 100,
    style: { pointerEvents: '' },
  });
  const dock = {
    style: { transform: '', pointerEvents: '', setProperty: () => {} },
    getBoundingClientRect: () => ({
      left: 600,
      top: 500,
      width: 96,
      height: 104,
    }),
    querySelector: () => panel,
  };
  const button = Object.assign(new EventTarget(), {
    parentElement: dock,
    querySelector: () => sprite,
    getBoundingClientRect: dock.getBoundingClientRect,
    dataset: { animation: '', frame: '' },
  });
  const document = Object.assign(new EventTarget(), {
    documentElement: new EventTarget(),
    visibilityState: 'visible',
  });
  const window = Object.assign(new EventTarget(), {
    innerWidth: 1400,
    innerHeight: 900,
    matchMedia: () => Object.assign(new EventTarget(), { matches: false }),
  });
  class LoadedImage {
    naturalWidth = 0;
    naturalHeight = 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    set src(source: string) {
      this.naturalWidth = source === '/pets/meibel.png' ? 1536 : 768;
      this.naturalHeight =
        source === '/pets/meibel.png'
          ? 2288
          : source === '/pets/meibel-play.png'
            ? 416
            : 208;
      this.onload?.();
    }
  }
  class VisibleObserver {
    constructor(
      private notify: (entries: { isIntersecting: boolean }[]) => void,
    ) {}
    observe() {
      this.notify([{ isIntersecting: true }]);
    }
    disconnect() {}
  }
  const globals = {
    window,
    document,
    Image: LoadedImage,
    IntersectionObserver: VisibleObserver,
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      nextFrame = callback;
      return 1;
    },
    cancelAnimationFrame: () => {
      nextFrame = null;
    },
  };
  const descriptors = Object.keys(globals).map((name) => ({
    name,
    descriptor: Object.getOwnPropertyDescriptor(globalThis, name),
  }));
  Object.assign(globalThis, globals);
  const controls = mountMeibel(
    button as unknown as HTMLButtonElement,
    assert.fail,
    () => {},
  );
  const advance = (duration: number): void => {
    for (let elapsed = 0; elapsed < duration; elapsed += 16) {
      now += 16;
      const callback = nextFrame;
      assert.ok(callback);
      callback(now);
    }
  };
  const moveMouse = (x: number, y: number): void => {
    document.dispatchEvent(
      Object.assign(new Event('pointermove'), {
        pointerType: 'mouse',
        clientX: x,
        clientY: y,
      }),
    );
  };
  try {
    controls.setFollowMode('following');
    moveMouse(100, 200);
    advance(500);
    assert.equal(button.dataset.animation, 'running-left');
    assert.equal(sprite.style.backgroundImage, "url('/pets/meibel.png')");
    assert.equal(button.dataset.frame.split(':')[0], '2');
    assert.equal(sprite.style.transform, '');
    assert.equal(sprite.style.filter, '');

    moveMouse(1200, 200);
    advance(500);
    assert.equal(button.dataset.animation, 'running-right');
    assert.equal(sprite.style.backgroundImage, "url('/pets/meibel.png')");
    assert.equal(button.dataset.frame.split(':')[0], '1');
    assert.equal(sprite.style.transform, '');

    controls.pet();
    advance(200);
    assert.equal(button.dataset.animation, 'petting');
    assert.equal(sprite.style.backgroundImage, "url('/pets/meibel.png')");
    assert.equal(button.dataset.frame.split(':')[0], '0');

    advance(750);
    for (
      let elapsed = 0;
      button.dataset.animation !== 'swatting' && elapsed < 6000;
      elapsed += 16
    ) {
      advance(16);
    }
    assert.equal(button.dataset.animation, 'swatting');
    assert.equal(sprite.style.backgroundImage, "url('/pets/meibel-play.png')");
    assert.equal(sprite.style.transform, 'scaleX(-1)');
    assert.equal(sprite.style.filter, 'brightness(1.8)');
    const cells = new Set<string>();
    while (button.dataset.animation === 'swatting') {
      cells.add(button.dataset.frame);
      advance(16);
    }
    assert.equal(cells.size, 8);

    controls.setFollowMode('resting');
    advance(32);
    assert.equal(sprite.style.backgroundImage, "url('/pets/meibel.png')");
    assert.equal(sprite.style.transform, '');
    assert.equal(sprite.style.filter, '');
    advance(6000);
    assert.equal(dock.style.transform, 'translate(0px, 0px)');
    assert.equal(button.dataset.animation, 'idle');
  } finally {
    controls.dispose();
    for (const { name, descriptor } of descriptors) {
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
      } else {
        Reflect.deleteProperty(globalThis, name);
      }
    }
  }
});
