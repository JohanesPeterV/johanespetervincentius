'use client';

import { getFontEmbedCSS, toCanvas } from 'html-to-image';
import { RefObject, useEffect, useRef, useState } from 'react';
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

import type { OverlayNodes } from './dive-overlay-motion';
import { createHeroHandoff } from './hero-handoff';
import type { SectionSnapshot } from './hero-handoff';

const captureSection = async (
  element: HTMLDivElement,
  fontEmbedCSS: string,
): Promise<SectionSnapshot> => {
  const clone = element.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    throw new Error('Scene content could not be prepared for the transition.');
  }
  const style = getComputedStyle(element);
  const width = element.clientWidth;
  const height = element.clientHeight;
  Object.assign(clone.style, {
    position: 'relative',
    inset: 'auto',
    width: `${width}px`,
    height: `${height}px`,
    transform: 'none',
    translate: 'none',
    opacity: '1',
    visibility: 'visible',
    fontFamily: style.fontFamily,
    color: style.color,
  });
  clone.style.setProperty('--reveal', '1');
  clone.querySelectorAll<HTMLElement>('[data-active]').forEach((panel) => {
    panel.style.translate = 'none';
    panel.style.transition = 'none';
  });
  const stage = document.createElement('div');
  stage.inert = true;
  stage.setAttribute('aria-hidden', 'true');
  stage.style.cssText =
    'position:fixed;left:-20000px;top:0;pointer-events:none';
  stage.append(clone);
  document.body.append(stage);
  try {
    const canvas = await toCanvas(clone, {
      fontEmbedCSS,
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    });
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    return { texture, width, height };
  } finally {
    stage.remove();
  }
};

export const useHeroHandoff = (overlayRef: RefObject<OverlayNodes>) => {
  const handoffRef = useRef(createHeroHandoff());
  const [error, setError] = useState<string | null>(null);

  // REASON: the shader needs cached pixels of the actual DOM, including the
  // profile card and web fonts. Capture on content/size changes, never
  // in the render loop; keep the real DOM for reading and interaction at rest.
  useEffect(() => {
    const handoff = handoffRef.current;
    const hero = overlayRef.current.sections[0];
    const work = overlayRef.current.sections[1];
    if (!hero || !work) {
      return;
    }
    let disposed = false;
    let revision = 0;
    let timer = 0;
    let fontCss: Promise<string> | null = null;
    const capture = async (): Promise<void> => {
      if (work.dataset.snapshotReady === 'false') {
        return;
      }
      const request = ++revision;
      const prepared: SectionSnapshot[] = [];
      try {
        await document.fonts.ready;
        fontCss ??= getFontEmbedCSS(hero, { preferredFontFormat: 'woff2' });
        const css = await fontCss;
        prepared.push(await captureSection(hero, css));
        prepared.push(await captureSection(work, css));
        if (disposed || request !== revision) {
          prepared.forEach((snapshot) => snapshot.texture.dispose());
          return;
        }
        handoff.hero?.texture.dispose();
        handoff.work?.texture.dispose();
        [handoff.hero, handoff.work] = prepared;
        setError(null);
      } catch (cause) {
        prepared.forEach((snapshot) => snapshot.texture.dispose());
        if (!disposed && request === revision) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      }
    };
    const schedule = (): void => {
      revision++;
      window.clearTimeout(timer);
      if (work.dataset.snapshotReady === 'false') {
        handoff.work?.texture.dispose();
        handoff.work = null;
      }
      timer = window.setTimeout(capture, 60);
    };
    const observer = new MutationObserver(schedule);
    // REASON: Embla mutates transforms every animation frame. Its settled
    // content signal avoids both stale-card textures and per-frame captures.
    observer.observe(work, {
      attributes: true,
      attributeFilter: ['data-active', 'data-snapshot-ready', 'open'],
      subtree: true,
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(hero);
    resizeObserver.observe(work);
    capture();
    return () => {
      disposed = true;
      observer.disconnect();
      resizeObserver.disconnect();
      window.clearTimeout(timer);
      handoff.hero?.texture.dispose();
      handoff.work?.texture.dispose();
      handoff.hero = null;
      handoff.work = null;
    };
  }, [overlayRef]);

  return { handoffRef, error };
};
