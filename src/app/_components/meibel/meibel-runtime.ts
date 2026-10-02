import {
  MeibelEngine,
  MEIBEL_SHEET,
  MEIBEL_PLAY_SHEET,
  MEIBEL_LOUNGE_SHEET,
  type MeibelFollowMode,
} from './meibel-engine';

type MeibelControls = {
  pet: () => void;
  lounge: () => void;
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
  const sheets = [MEIBEL_SHEET, MEIBEL_PLAY_SHEET, MEIBEL_LOUNGE_SHEET];
  const images = sheets.map(() => new Image());
  let loadedImages = 0;
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
      engine.pausePursuit();
      return;
    }
    if (pointer) {
      const x = pointer.x - origin.x - origin.width / 2;
      const y = pointer.y - origin.y - 52;
      const target = boundPosition(x, y);
      if (
        engine.followMode === 'following' &&
        Math.hypot(target.x - x, target.y - y) > 24
      ) {
        engine.pausePursuit();
        return;
      }
      engine.followTo(target.x, target.y);
    }
  };

  const render = (): void => {
    const frame = engine.frame();
    let sheet = MEIBEL_SHEET;
    let row = frame.row;
    let column = frame.column;
    if (frame.animation === 'lounging') {
      sheet = MEIBEL_LOUNGE_SHEET;
    } else if (
      frame.animation === 'swatting' ||
      frame.animation.startsWith('running-') ||
      engine.followMode === 'following'
    ) {
      sheet = MEIBEL_PLAY_SHEET;
      if (frame.animation !== 'swatting') {
        const moving = frame.animation.startsWith('running-');
        row = moving ? Math.floor(column / 4) : 0;
        column = moving ? column % 4 : 0;
      }
    }
    const identity = `${sheet.source}:${row}:${column}`;
    if (identity !== lastFrame) {
      sprite.style.backgroundImage = `url('${sheet.source}')`;
      sprite.style.backgroundSize = `${sheet.width / 2}px ${sheet.height / 2}px`;
      sprite.style.backgroundPosition = `${(-column * sheet.cellWidth) / 2}px ${(-row * sheet.cellHeight) / 2}px`;
      button.dataset.frame = `${row}:${column}`;
      lastFrame = identity;
    }
    sprite.style.transform = `rotate(${frame.rotation ?? 0}deg) scaleX(${frame.facing === 'right' ? -1 : 1})`;
    button.dataset.animation = frame.animation;
    dock.style.pointerEvents = engine.followMode === 'following' ? 'none' : '';
    panel.style.pointerEvents = 'auto';
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
      `${Math.max(12, Math.min(window.innerHeight - panel.offsetHeight - 80, origin.y + renderedY + 16))}px`,
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

  images.forEach((image, index) => {
    const sheet = sheets[index];
    image.onload = () => {
      if (
        image.naturalWidth !== sheet.width ||
        image.naturalHeight !== sheet.height
      ) {
        reportError('Meibel’s sprite sheet has an unsupported size.');
        return;
      }
      loadedImages += 1;
      ready = loadedImages === images.length;
      syncPlayback();
    };
    image.onerror = () =>
      reportError('Meibel could not load. Please refresh to try again.');
    image.src = sheet.source;
  });

  const handlePointerMove = (event: PointerEvent): void => {
    if (!ready || !visible || event.pointerType !== 'mouse') {
      return;
    }
    pointer = { x: event.clientX, y: event.clientY };
    if (engine.followMode !== 'resting') {
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
    engine.pausePursuit();
    engine.clearGaze();
    render();
  };
  const handleWave = (): void => {
    const now = performance.now();
    if (engine.followMode !== 'resting' || now - lastWaveAt < 15000) {
      return;
    }
    lastWaveAt = now;
    engine.play('waving');
  };
  const pet = (): void => {
    engine.play('petting');
    render();
  };
  const lounge = (): void => {
    if (!ready || reducedMotion.matches) {
      return;
    }
    engine.play('lounging');
    reportFollowMode(engine.followMode);
    render();
  };
  const handleResize = (): void => {
    updateBounds();
    followPointer();
    render();
  };
  const setFollowMode = (mode: MeibelFollowMode): void => {
    if (!ready || reducedMotion.matches) {
      return;
    }
    engine.setFollowMode(mode);
    reportFollowMode(engine.followMode);
    followPointer();
    render();
  };
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && engine.followMode === 'following') {
      setFollowMode('resting');
    }
  };

  document.addEventListener('pointermove', handlePointerMove, {
    passive: true,
  });
  document.documentElement.addEventListener('pointerleave', handlePointerLeave);
  document.addEventListener('visibilitychange', syncPlayback);
  document.addEventListener('keydown', handleKeyDown);
  reducedMotion.addEventListener('change', syncPlayback);
  window.addEventListener('resize', handleResize);
  panel.addEventListener('toggle', followPointer);
  button.addEventListener('pointerenter', handleWave);
  button.addEventListener('focus', handleWave);
  button.addEventListener('click', pet);

  return {
    pet,
    lounge,
    setFollowMode,
    dispose: () => {
      cancelAnimationFrame(request);
      observer.disconnect();
      images.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
      document.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener(
        'pointerleave',
        handlePointerLeave,
      );
      document.removeEventListener('visibilitychange', syncPlayback);
      document.removeEventListener('keydown', handleKeyDown);
      reducedMotion.removeEventListener('change', syncPlayback);
      window.removeEventListener('resize', handleResize);
      panel.removeEventListener('toggle', followPointer);
      button.removeEventListener('pointerenter', handleWave);
      button.removeEventListener('focus', handleWave);
      button.removeEventListener('click', pet);
    },
  };
};
