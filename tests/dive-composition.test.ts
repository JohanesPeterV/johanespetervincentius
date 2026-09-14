import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import DiveOverlay from '../src/components/dive/dive-overlay';
import { DiveRoute } from '../src/components/dive/dive-route';

for (const ids of [
  ['stack'],
  ['stack', 'work'],
  ['notes', 'stack', 'work', 'contact'],
]) {
  test(`${ids.join(', ')}: the overlay renders only the supplied content in its declared order`, () => {
    const chapters = ids.map((id) => ({
      id,
      title: `Chapter ${id}`,
      content: createElement('h2', null, `Content ${id}`),
    }));
    const route = new DiveRoute('Profile', chapters);
    const html = renderToStaticMarkup(
      createElement(DiveOverlay, {
        hero: createElement('h1', null, 'Profile content'),
        chapters,
        route,
        overlayRef: {
          current: {
            chapters: new Map(),
            sections: new Map(),
            root: null,
            veil: null,
          },
        },
        onNavigate: () => {},
      }),
    );
    assert.deepEqual(
      [...html.matchAll(/data-dive-section="([^"]+)"/g)].map(
        (match) => match[1],
      ),
      ['hero', ...ids],
    );
    assert.deepEqual(
      [...html.matchAll(/aria-label="Go to ([^"]+)"/g)].map(
        (match) => match[1],
      ),
      ['Profile', ...chapters.map(({ title }) => title)],
    );
    for (const id of ids) {
      assert.ok(html.includes(`<h2>Content ${id}</h2>`));
      assert.ok(html.includes(`role="region" aria-label="Chapter ${id}"`));
    }
    assert.equal((html.match(/data-section-scroll/g) ?? []).length, ids.length);
  });
}
