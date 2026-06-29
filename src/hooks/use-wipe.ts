import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import type { UIEvent } from 'react';

const wipeProgressAtom = atom(0);

// REASON: the world-two canvas runs MeshTransmissionMaterial plus an HDR environment, so it must stay paused while the intro hides it and only resume once the scroll wipe starts revealing it
const worldTwoActiveAtom = atom((get) => get(wipeProgressAtom) > 0.001);

// REASON: the live fog filter is heavy, so it only runs across the reveal band and switches off once world two has fully arrived
const worldTwoTransitioningAtom = atom((get) => {
  const wipe = get(wipeProgressAtom);
  return wipe > 0.001 && wipe < 0.92;
});

export function useSetWipeProgress() {
  return useSetAtom(wipeProgressAtom);
}

export function useWorldTwoActive() {
  return useAtomValue(worldTwoActiveAtom);
}

export function useWorldTwoTransitioning() {
  return useAtomValue(worldTwoTransitioningAtom);
}

const WIPE_SMOOTHING_SECONDS = 0.12;
const WIPE_SETTLE_EPSILON = 0.0005;
const MAX_FRAME_SECONDS = 0.05;

// REASON: scroll only sets a target; the wipe value eases toward it each frame so the world seam keeps gliding after the scroll stops (the heavy-inertia feel), which discrete onScroll updates cannot produce
export function useInertialWipe(): (event: UIEvent<HTMLDivElement>) => void {
  const setWipeProgress = useSetWipeProgress();
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const applyWipe = (value: number): void => {
    document.documentElement.style.setProperty('--wipe', String(value));
    setWipeProgress(value);
  };

  const tick = (time: number): void => {
    const last = lastTimeRef.current ?? time;
    lastTimeRef.current = time;
    const deltaSeconds = Math.min(MAX_FRAME_SECONDS, (time - last) / 1000);
    const smoothing = 1 - Math.exp(-deltaSeconds / WIPE_SMOOTHING_SECONDS);
    const next =
      currentRef.current + (targetRef.current - currentRef.current) * smoothing;
    if (Math.abs(targetRef.current - next) < WIPE_SETTLE_EPSILON) {
      currentRef.current = targetRef.current;
      applyWipe(targetRef.current);
      frameRef.current = null;
      lastTimeRef.current = null;
      return;
    }
    currentRef.current = next;
    applyWipe(next);
    frameRef.current = requestAnimationFrame(tick);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    const element = event.currentTarget;
    const scrollable = element.scrollHeight - element.clientHeight;
    if (scrollable <= 0) {
      return;
    }
    const target = Math.min(1, Math.max(0, element.scrollTop / scrollable));
    targetRef.current = target;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) {
      currentRef.current = target;
      applyWipe(target);
      return;
    }
    if (frameRef.current === null) {
      lastTimeRef.current = null;
      frameRef.current = requestAnimationFrame(tick);
    }
  };

  // REASON: the eased wipe runs an imperative requestAnimationFrame loop; without unmount cleanup a queued frame fires after teardown and calls the wipe setter on an unmounted tree
  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return handleScroll;
}
