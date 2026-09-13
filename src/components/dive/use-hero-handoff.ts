'use client';

import { getFontEmbedCSS, toCanvas } from 'html-to-image';
import { RefObject, useEffect, useRef, useState } from 'react';
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

import type { OverlayNodes } from './dive-overlay-motion';
import { createHeroHandoff } from './hero-handoff';

// REASON: html-to-image deep-clones <svg> without inlining its descendants'
// computed styles, so strokes and fills that come from stylesheets vanish
// from the snapshot (the profile avatar frame). Read them off the staged
// clone, whose root is forced visible, never off the live section, which is
// hidden while the opening still runs.
const inlineSvgStyles = (staged: HTMLElement): void => {
  staged.querySelectorAll('svg *').forEach((node) => {
    if (!(node instanceof SVGElement)) {
      return;
    }
    const computed = getComputedStyle(node);
    for (const name of computed) {
      node.style.setProperty(name, computed.getPropertyValue(name));
    }
  });
};

const captureSection = async (
  element: HTMLDivElement,
  fontEmbedCSS: string,
): Promise<CanvasTexture> => {
  const clone = element.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    throw new Error('Scene content could not be prepared for the transition.');
  }
  const style = getComputedStyle(element);
  Object.assign(clone.style, {
    position: 'relative',
    inset: 'auto',
    width: `${element.clientWidth}px`,
    height: `${element.clientHeight}px`,
    overflow: 'hidden',
    transform: 'none',
    translate: 'none',
    opacity: '1',
    visibility: 'visible',
    fontFamily: style.fontFamily,
    color: style.color,
  });
  // REASON: the crossing captures the chapter at rest from its top: cards in
  // their slots, the carousel on its active pane, native dialogs closed.
  clone.style.setProperty('--scatter', '0');
  clone.querySelectorAll('dialog').forEach((dialog) => {
    dialog.removeAttribute('open');
  });
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
    inlineSvgStyles(clone);
    const canvas = await toCanvas(clone, {
      fontEmbedCSS,
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    });
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  } finally {
    stage.remove();
  }
};

export const useHeroHandoff = (overlayRef: RefObject<OverlayNodes>) => {
  const handoffRef = useRef(createHeroHandoff());
  const [error, setError] = useState<string | null>(null);

  // REASON: the shader needs cached pixels of the actual DOM, including the
  // profile card, the chapter and web fonts. Capture on content/size changes,
  // never in the render loop; keep the real DOM for reading and interaction.
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
      const request = ++revision;
      const prepared: CanvasTexture[] = [];
      try {
        await document.fonts.ready;
        fontCss ??= getFontEmbedCSS(hero, { preferredFontFormat: 'woff2' });
        const css = await fontCss;
        prepared.push(await captureSection(hero, css));
        prepared.push(await captureSection(work, css));
        if (disposed || request !== revision) {
          prepared.forEach((texture) => texture.dispose());
          return;
        }
        handoff.hero?.dispose();
        handoff.work?.dispose();
        [handoff.hero, handoff.work] = prepared;
        setError(null);
      } catch (cause) {
        prepared.forEach((texture) => texture.dispose());
        if (!disposed && request === revision) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      }
    };
    const schedule = (): void => {
      revision++;
      window.clearTimeout(timer);
      timer = window.setTimeout(capture, 60);
    };
    // REASON: recapture settled content changes (theme, size, the chapter's
    // carousel and dialogs), never the styles the scene writes every frame.
    const observer = new MutationObserver(schedule);
    observer.observe(work, {
      attributes: true,
      attributeFilter: ['data-active', 'open'],
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
      handoff.hero?.dispose();
      handoff.work?.dispose();
      handoff.hero = null;
      handoff.work = null;
    };
  }, [overlayRef]);

  return { handoffRef, error };
};
