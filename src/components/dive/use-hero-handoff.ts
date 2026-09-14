'use client';

import { getFontEmbedCSS, toCanvas } from 'html-to-image';
import { RefObject, useEffect, useRef, useState } from 'react';
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

import type { DiveRoute } from './dive-route';
import type { OverlayNodes } from './dive-overlay-motion';
import { createHeroHandoff } from './hero-handoff';

// REASON: html-to-image deep-clones <svg> without inlining its descendants'
// computed styles, so strokes and fills that come from stylesheets vanish
// from the snapshot (the profile avatar frame). Read them off the staged
// clone, whose root is forced visible, never off the live section, which is
// hidden while the opening still runs.
const inlineSvgStyles = (staged: HTMLElement): void => {
  const styles: { node: SVGElement; cssText: string }[] = [];
  staged.querySelectorAll('svg *').forEach((node) => {
    if (!(node instanceof SVGElement)) {
      return;
    }
    const computed = getComputedStyle(node);
    styles.push({
      node,
      cssText: Array.from(
        computed,
        (name) => `${name}: ${computed.getPropertyValue(name)};`,
      ).join(''),
    });
  });
  // REASON: computed styles are live; interleaving reads and writes forces
  // another style calculation for every property of every SVG descendant.
  for (const { node, cssText } of styles) {
    node.style.cssText = cssText;
  }
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
  // REASON: closed dialogs have no pixels in the crossing. Their interactive
  // content stays in the live DOM, outside this temporary snapshot clone.
  clone.querySelectorAll('dialog').forEach((dialog) => {
    dialog.remove();
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
      // REASON: Next.js image URLs identify each source in query parameters.
      includeQueryParams: true,
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

export const useHeroHandoff = (
  overlayRef: RefObject<OverlayNodes>,
  route: DiveRoute,
) => {
  const handoffRef = useRef(createHeroHandoff(route));
  handoffRef.current.route = route;
  const entryId = route.entry.id;
  const [error, setError] = useState<string | null>(null);

  // REASON: the shader needs cached pixels of the actual DOM, including the
  // profile card, the chapter and web fonts. Capture on content/size changes,
  // never in the render loop; keep the real DOM for reading and interaction.
  useEffect(() => {
    const handoff = handoffRef.current;
    const hero = overlayRef.current.sections.get('hero');
    const entry = overlayRef.current.sections.get(entryId);
    if (!hero || !entry) {
      return;
    }
    let disposed = false;
    let revision = 0;
    let timer = 0;
    let fontCss: Promise<string> | null = null;
    let capturing = false;
    const capture = async (): Promise<void> => {
      if (disposed || capturing) {
        return;
      }
      capturing = true;
      const request = revision;
      const prepared: CanvasTexture[] = [];
      try {
        await document.fonts.ready;
        fontCss ??= getFontEmbedCSS(hero, { preferredFontFormat: 'woff2' });
        const css = await fontCss;
        for (const section of [hero, entry]) {
          if (disposed || request !== revision) {
            break;
          }
          prepared.push(await captureSection(section, css));
        }
        if (disposed || request !== revision) {
          prepared.forEach((texture) => texture.dispose());
          return;
        }
        handoff.hero?.dispose();
        handoff.entry?.dispose();
        [handoff.hero, handoff.entry] = prepared;
        setError(null);
      } catch (cause) {
        prepared.forEach((texture) => texture.dispose());
        if (!disposed && request === revision) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      } finally {
        capturing = false;
        // REASON: rapid theme/size changes must not rasterize overlapping
        // snapshots. Finish the in-flight section, then capture the latest state.
        if (!disposed && request !== revision) {
          window.clearTimeout(timer);
          timer = window.setTimeout(capture, 60);
        }
      }
    };
    const schedule = (): void => {
      revision++;
      window.clearTimeout(timer);
      timer = window.setTimeout(capture, 60);
    };
    // REASON: only theme, size and carousel changes alter the chapter snapshot.
    // Dialogs are excluded from it, so opening a card must not recapture it.
    const observer = new MutationObserver(schedule);
    observer.observe(entry, {
      attributes: true,
      attributeFilter: ['data-active'],
      subtree: true,
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    const resizeObserver = new ResizeObserver(schedule);
    // REASON: flinging cards can toggle a scrollbar without resizing the
    // section. Only its outer size invalidates the cached transition; the
    // observer's initial delivery also schedules the first capture once.
    resizeObserver.observe(hero, { box: 'border-box' });
    resizeObserver.observe(entry, { box: 'border-box' });
    return () => {
      disposed = true;
      observer.disconnect();
      resizeObserver.disconnect();
      window.clearTimeout(timer);
      handoff.hero?.dispose();
      handoff.entry?.dispose();
      handoff.hero = null;
      handoff.entry = null;
    };
  }, [overlayRef, entryId]);

  return { handoffRef, error };
};
