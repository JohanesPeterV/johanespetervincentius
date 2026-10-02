import { MeibelEngine, MEIBEL_SHEET } from './meibel-engine';

export const mountMeibel = (
  button: HTMLButtonElement,
  reportError: (message: string) => void,
): (() => void) => {
  const sprite = button.querySelector<HTMLElement>('.meibel-sprite');
  if (!sprite) {
    throw new Error('Meibel sprite element is missing.');
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

  const render = (): void => {
    const frame = engine.frame();
    const identity = `${frame.row}:${frame.column}`;
    if (identity !== lastFrame) {
      sprite.style.backgroundPosition = `${(-frame.column * MEIBEL_SHEET.cellWidth) / 2}px ${(-frame.row * MEIBEL_SHEET.cellHeight) / 2}px`;
      button.dataset.animation = frame.animation;
      button.dataset.frame = identity;
      lastFrame = identity;
    }
    sprite.style.transform = `translateX(${frame.offsetX}px)`;
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
    engine.setMotion(reducedMotion.matches ? 'reduced' : 'full');
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
    if (!ready || !visible || event.pointerType === 'touch') {
      return;
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
    engine.clearGaze();
    render();
  };
  const handleWave = (): void => {
    const now = performance.now();
    if (now - lastWaveAt < 15000) {
      return;
    }
    lastWaveAt = now;
    engine.play('waving');
  };
  const handleJump = (): void => {
    engine.play('jumping');
  };

  document.addEventListener('pointermove', handlePointerMove, {
    passive: true,
  });
  document.documentElement.addEventListener('pointerleave', handlePointerLeave);
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', syncPlayback);
  button.addEventListener('pointerenter', handleWave);
  button.addEventListener('focus', handleWave);
  button.addEventListener('click', handleJump);

  return () => {
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
    button.removeEventListener('pointerenter', handleWave);
    button.removeEventListener('focus', handleWave);
    button.removeEventListener('click', handleJump);
  };
};
