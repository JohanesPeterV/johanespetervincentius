import { getFontEmbedCSS } from 'html-to-image';
import { captureSection } from './capture-section';
import type { HandoffSnapshotSet } from './handoff-snapshots';

export const createHandoffCapture = (
  hero: HTMLDivElement,
  entry: HTMLDivElement,
  last: HTMLDivElement,
): ((signal: AbortSignal) => Promise<HandoffSnapshotSet>) => {
  let fontCss: Promise<string> | null = null;
  return async (signal) => {
    await document.fonts.ready;
    signal.throwIfAborted();
    fontCss ??= getFontEmbedCSS(hero, { preferredFontFormat: 'woff2' }).catch(
      (cause) => {
        fontCss = null;
        throw cause;
      },
    );
    const css = await fontCss;
    signal.throwIfAborted();
    const heroTexture = await captureSection(hero, css);
    try {
      signal.throwIfAborted();
      const entryTexture = await captureSection(entry, css);
      try {
        signal.throwIfAborted();
        const lastTexture = await captureSection(last, css, last.scrollTop);
        return { hero: heroTexture, entry: entryTexture, last: lastTexture };
      } catch (cause) {
        entryTexture.dispose();
        throw cause;
      }
    } catch (cause) {
      heroTexture.dispose();
      throw cause;
    }
  };
};
