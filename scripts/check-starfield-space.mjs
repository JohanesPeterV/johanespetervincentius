import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { PerspectiveCamera, Vector3 } from 'three';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map();

// REASON: execute the production TypeScript with the existing compiler without another bundler or test dependency.
const load = (filename) => {
  if (modules.has(filename)) {
    return modules.get(filename);
  }
  const module = { exports: {} };
  modules.set(filename, module.exports);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const localRequire = (name) =>
    name.startsWith('.')
      ? load(resolve(dirname(filename), `${name}.ts`))
      : require(name);
  runInNewContext(`(function(require, module, exports) { ${source}\n })`)(
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
};

const { buildSpatialStarfield } = load(
  resolve(root, 'src/components/dive/starfield-space.ts'),
);
const { buildStarfield } = load(
  resolve(root, 'src/components/dive/world-layout.ts'),
);

for (const reality of ['watchers', 'orbital']) {
  test(`${reality}: scatter surrounds the origin with near and far stars`, () => {
    const { scatter } = buildSpatialStarfield(reality, 1200, 1.6);
    const octants = new Set();
    const radii = [];
    for (let offset = 0; offset < scatter.length; offset += 3) {
      const [x, y, z] = scatter.slice(offset, offset + 3);
      assert.ok([x, y, z].every(Number.isFinite));
      octants.add(`${x > 0},${y > 0},${z > 0}`);
      radii.push(Math.hypot(x, y, z));
    }
    assert.equal(octants.size, 8);
    assert.ok(Math.min(...radii) >= 12 && Math.min(...radii) < 13);
    assert.ok(Math.max(...radii) > 150 && Math.max(...radii) <= 160);
  });

  test(`${reality}: GPU tiers keep identical star identities and XYZ prefixes`, () => {
    const full = buildSpatialStarfield(reality, 1200, 1.6);
    const reduced = buildSpatialStarfield(reality, 600, 1.6);
    for (const stream of ['scatter', 'seeds']) {
      assert.deepEqual(full[stream].slice(0, 1800), reduced[stream]);
    }
    full.frames.forEach((frame, index) => {
      assert.deepEqual(
        frame.positions.slice(0, 1800),
        reduced.frames[index].positions,
      );
    });
  });

  test(`${reality}: every formation preserves its authored view and metadata`, () => {
    for (const aspect of [0.45, 1.6, 2.4]) {
      const authored = buildStarfield(reality, 300, aspect);
      const spatial = buildSpatialStarfield(reality, 300, aspect);
      const camera = new PerspectiveCamera(58, aspect, 0.2, 240);
      const projected = new Vector3();
      assert.equal(spatial.frames.length, authored.frames.length);
      assert.deepEqual(spatial.seeds, authored.seeds);
      spatial.frames.forEach((frame, index) => {
        const source = authored.frames[index];
        for (const key of ['id', 'hold', 'duration', 'appearance']) {
          assert.deepEqual(frame[key], source[key]);
        }
        for (let offset = 0; offset < frame.positions.length; offset += 3) {
          projected.fromArray(frame.positions, offset).project(camera);
          assert.ok(
            Math.abs(projected.x - source.positions[offset] / aspect) < 1e-6,
          );
          assert.ok(
            Math.abs(projected.y - source.positions[offset + 1]) < 1e-6,
          );
          assert.ok(projected.z > -1 && projected.z < 1);
        }
      });
    }
  });

  test(`${reality}: camera translation produces stronger parallax for near stars`, () => {
    const { positions } = buildSpatialStarfield(reality, 1200, 1.6).frames[0];
    const stars = [];
    for (let offset = 0; offset < positions.length; offset += 3) {
      stars.push(new Vector3().fromArray(positions, offset));
    }
    stars.sort((left, right) => right.z - left.z);
    const near = stars[0];
    const far = stars.at(-1);
    const camera = new PerspectiveCamera(58, 1.6, 0.2, 240);
    const before = [
      near.clone().project(camera).x,
      far.clone().project(camera).x,
    ];
    camera.position.x = 1;
    camera.updateMatrixWorld();
    const nearShift = Math.abs(near.clone().project(camera).x - before[0]);
    const farShift = Math.abs(far.clone().project(camera).x - before[1]);
    assert.ok(nearShift > farShift * 10);
  });
}

for (const [name, file, factory] of [
  ['star', 'starfield-geometry', 'createStarGeometry'],
  ['eye', 'cosmic-eye-geometry', 'createCosmicEyeGeometry'],
]) {
  test(`${name}: body is a closed solid with depth and outward winding`, () => {
    const geometry = load(resolve(root, `src/components/dive/${file}.ts`))[
      factory
    ]();
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const indices = geometry.getIndex();
    const edges = new Map();
    const vertices = [];
    let volume = 0;
    geometry.computeBoundingBox();
    assert.ok(geometry.boundingBox.max.z - geometry.boundingBox.min.z > 0.2);
    for (let index = 0; index < positions.count; index += 1) {
      const vertex = new Vector3().fromBufferAttribute(positions, index);
      assert.ok(vertex.toArray().every(Number.isFinite));
      const normal = new Vector3().fromBufferAttribute(normals, index);
      assert.ok(Math.abs(normal.length() - 1) < 1e-5);
      vertices.push(vertex);
    }
    const count = indices?.count ?? positions.count;
    for (let offset = 0; offset < count; offset += 3) {
      const triangle = [0, 1, 2].map(
        (corner) => vertices[indices?.getX(offset + corner) ?? offset + corner],
      );
      const [a, b, c] = triangle;
      assert.ok(b.clone().sub(a).cross(c.clone().sub(a)).length() > 1e-9);
      volume += a.dot(b.clone().cross(c)) / 6;
      const keys = triangle.map((v) =>
        v
          .toArray()
          .map((n) => n.toFixed(6))
          .join(','),
      );
      keys.forEach((from, corner) => {
        const to = keys[(corner + 1) % 3];
        const edge = [from, to].sort().join(':');
        const entry = edges.get(edge) ?? { count: 0, winding: 0 };
        entry.count += 1;
        entry.winding += from < to ? 1 : -1;
        edges.set(edge, entry);
      });
    }
    assert.ok(volume > 0.01);
    for (const edge of edges.values()) {
      assert.equal(edge.count, 2);
      assert.equal(edge.winding, 0);
    }
    geometry.dispose();
  });
}
