import { toCanvas } from 'html-to-image';
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

import { handoffPixelRatio } from './hero-handoff';

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

export const captureSection = async (
  element: HTMLDivElement,
  fontEmbedCSS: string,
  scrollOffset = 0,
): Promise<CanvasTexture> => {
  const clone = element.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    throw new Error('Scene content could not be prepared for the transition.');
  }
  // REASON: cloneNode copies canvas elements but not their rendered pixels.
  // Copy each live frame before html-to-image rasterizes the staged chapter.
  const canvases = element.querySelectorAll('canvas');
  clone.querySelectorAll('canvas').forEach((canvas, index) => {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error(
        'The 3D canvas could not be captured for the transition.',
      );
    }
    const source = canvases[index];
    source.dispatchEvent(new Event('dive-canvas-capture'));
    context.drawImage(source, 0, 0);
  });
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
  // REASON: the return crossing cuts the final chapter where the reader left
  // it; translate its contents because DOM rasterization ignores scrollTop.
  for (const child of clone.children) {
    if (child instanceof HTMLElement && scrollOffset !== 0) {
      child.style.translate = `0 ${-scrollOffset}px`;
    }
  }
  // REASON: closed dialogs have no pixels in the crossing. Their interactive
  // content stays in the live DOM, outside this temporary snapshot clone.
  clone.querySelectorAll('dialog').forEach((dialog) => {
    dialog.remove();
  });
  // REASON: the crossing captures the carousel at rest on its active pane.
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
      pixelRatio: handoffPixelRatio(),
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
