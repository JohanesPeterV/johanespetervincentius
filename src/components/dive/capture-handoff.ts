import { getFontEmbedCSS } from 'html-to-image';
import { captureSection } from './capture-section';
import type { HandoffSnapshotPair } from './handoff-snapshots';

export const createHandoffCapture = (
  hero: HTMLDivElement,
  entry: HTMLDivElement,
): ((signal: AbortSignal) => Promise<HandoffSnapshotPair>) => {
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
      return { hero: heroTexture, entry: entryTexture };
    } catch (cause) {
      heroTexture.dispose();
      throw cause;
    }
  };
};
