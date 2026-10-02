import {
  MeibelEngine,
  MEIBEL_SHEET,
  type MeibelFollowMode,
} from './meibel-engine';

type MeibelControls = {
  pet: () => void;
  setFollowMode: (mode: MeibelFollowMode) => void;
  dispose: () => void;
};

export const mountMeibel = (
  button: HTMLButtonElement,
  reportError: (message: string) => void,
  reportFollowMode: (mode: MeibelFollowMode) => void,
): MeibelControls => {
  const dock = button.parentElement;
  const sprite = button.querySelector<HTMLElement>('.meibel-sprite');
  const panel = dock?.querySelector<HTMLElement>('[popover]');
  if (!dock || !sprite || !panel) {
    throw new Error('Meibel’s sprite or controls are missing.');
  }
  const engine = new MeibelEngine();
  const image = new Image();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ready = false;
  let visible = false;
  let request = 0;
  let previousTime: number | null = null;
  let lastFrame = '';
  let lastWaveAt = -Infinity;
  let pointer: { x: number; y: number } | null = null;
  let renderedX = 0;
  let renderedY = 0;
  let origin = { x: 0, y: 0, width: 96, height: 104 };

  const updateBounds = (): void => {
    const rect = dock.getBoundingClientRect();
    origin = {
      x: rect.left - renderedX,
      y: rect.top - renderedY,
      width: rect.width,
      height: rect.height,
    };
  };
  updateBounds();

  const boundPosition = (x: number, y: number): { x: number; y: number } => ({
    x: Math.max(
      12 - origin.x,
      Math.min(window.innerWidth - origin.x - origin.width - 12, x),
    ),
    y: Math.max(12 - origin.y, Math.min(0, y)),
  });

  const followPointer = (): void => {
    if (panel.matches(':popover-open')) {
      const frame = engine.frame();
      engine.followTo(frame.offsetX, frame.offsetY);
      return;
    }
    if (pointer) {
      const target = boundPosition(
        pointer.x - origin.x - origin.width / 2,
        pointer.y + 28 - origin.y,
      );
      engine.followTo(target.x, target.y);
    }
  };

  const render = (): void => {
    const frame = engine.frame();
    const identity = `${frame.row}:${frame.column}`;
    if (identity !== lastFrame) {
      sprite.style.backgroundPosition = `${(-frame.column * MEIBEL_SHEET.cellWidth) / 2}px ${(-frame.row * MEIBEL_SHEET.cellHeight) / 2}px`;
      button.dataset.frame = identity;
      lastFrame = identity;
    }
    button.dataset.animation = frame.animation;
    const position = boundPosition(frame.offsetX, frame.offsetY);
    renderedX = position.x;
    renderedY = position.y;
    dock.style.transform = `translate(${renderedX}px, ${renderedY}px)`;
    const left = origin.x + renderedX;
    const actionsX = left >= 180 ? left - 168 : left + origin.width + 4;
    dock.style.setProperty(
      '--meibel-actions-x',
      `${Math.max(12, Math.min(window.innerWidth - 172, actionsX))}px`,
    );
    dock.style.setProperty(
      '--meibel-actions-y',
      `${Math.max(12, origin.y + renderedY + 16)}px`,
    );
  };

  const tick = (now: number): void => {
    if (previousTime !== null) {
      engine.advance(Math.min(now - previousTime, 100));
    }
    previousTime = now;
    render();
    request = requestAnimationFrame(tick);
  };

  const syncPlayback = (): void => {
    cancelAnimationFrame(request);
    previousTime = null;
    const previousMode = engine.followMode;
    engine.setMotion(reducedMotion.matches ? 'reduced' : 'full');
    if (engine.followMode !== previousMode) {
      reportFollowMode(engine.followMode);
    }
    if (!ready) {
      return;
    }
    render();
    if (
      visible &&
      document.visibilityState === 'visible' &&
      !reducedMotion.matches
    ) {
      request = requestAnimationFrame(tick);
    }
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  });
  observer.observe(button);

  image.onload = () => {
    if (
      image.naturalWidth !== MEIBEL_SHEET.width ||
      image.naturalHeight !== MEIBEL_SHEET.height
    ) {
      reportError('Meibel’s sprite sheet has an unsupported size.');
      return;
    }
    ready = true;
    syncPlayback();
  };
  image.onerror = () =>
    reportError('Meibel could not load. Please refresh to try again.');
  image.src = MEIBEL_SHEET.source;

  const handlePointerMove = (event: PointerEvent): void => {
    if (!ready || !visible || event.pointerType !== 'mouse') {
      return;
    }
    pointer = { x: event.clientX, y: event.clientY };
    if (engine.followMode === 'following') {
      followPointer();
    }
    const rect = button.getBoundingClientRect();
    engine.lookAt(
      event.clientX - rect.left - rect.width / 2,
      event.clientY - rect.top - rect.height * 0.35,
    );
    if (reducedMotion.matches) {
      render();
    }
  };
  const handlePointerLeave = (): void => {
    pointer = null;
    const frame = engine.frame();
    engine.followTo(frame.offsetX, frame.offsetY);
    engine.clearGaze();
    render();
  };
  const handleWave = (): void => {
    const now = performance.now();
    if (engine.followMode === 'following' || now - lastWaveAt < 15000) {
      return;
    }
    lastWaveAt = now;
    engine.play('waving');
  };
  const pet = (): void => {
    engine.play('petting');
    render();
  };
  const handleResize = (): void => {
    updateBounds();
    followPointer();
    render();
  };

  document.addEventListener('pointermove', handlePointerMove, {
    passive: true,
  });
  document.documentElement.addEventListener('pointerleave', handlePointerLeave);
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', syncPlayback);
  window.addEventListener('resize', handleResize);
  panel.addEventListener('toggle', followPointer);
  button.addEventListener('pointerenter', handleWave);
  button.addEventListener('focus', handleWave);
  button.addEventListener('click', pet);

  return {
    pet,
    setFollowMode: (mode) => {
      if (!ready || reducedMotion.matches) {
        return;
      }
      engine.setFollowMode(mode);
      reportFollowMode(engine.followMode);
      followPointer();
    },
    dispose: () => {
      cancelAnimationFrame(request);
      observer.disconnect();
      image.onload = null;
      image.onerror = null;
      document.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener(
        'pointerleave',
        handlePointerLeave,
      );
      document.removeEventListener('visibilitychange', syncPlayback);
      reducedMotion.removeEventListener('change', syncPlayback);
      window.removeEventListener('resize', handleResize);
      panel.removeEventListener('toggle', followPointer);
      button.removeEventListener('pointerenter', handleWave);
      button.removeEventListener('focus', handleWave);
      button.removeEventListener('click', pet);
    },
  };
};
