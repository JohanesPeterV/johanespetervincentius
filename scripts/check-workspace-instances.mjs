import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as three from 'three';
import {
  AnimationClip,
  AnimationMixer,
  BoxGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  VectorKeyframeTrack,
} from 'three';

const module = { exports: {} };
// REASON: test the production batching with Three.js and the existing TS compiler, without a WebGL context or another test dependency.
const compiled = ts.transpileModule(
  readFileSync(
    new URL('../src/components/dive/workspace-instances.ts', import.meta.url),
    'utf8',
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
runInNewContext(`(function(require, module, exports) { ${compiled}\n })`)(
  (name) => (name === 'three' ? three : createRequire(import.meta.url)(name)),
  module,
  module.exports,
);
const { createWorkspaceInstances } = module.exports;

const fixture = (t) => {
  const scene = new Group();
  const geometry = new BoxGeometry();
  const material = new MeshStandardMaterial();
  const keys = [new Mesh(geometry, material), new Mesh(geometry, material)];
  keys.forEach((key, index) => {
    key.name = `key-${index}`;
    key.position.x = index * 2;
    scene.add(key);
  });
  const instances = createWorkspaceInstances(scene);
  t.after(() => {
    instances.dispose();
    geometry.dispose();
    material.dispose();
  });
  return { scene, keys, geometry, material, instances };
};

test('repeated geometry draws together while animation target nodes stay mounted', (t) => {
  const { scene, keys, instances } = fixture(t);
  instances.update();
  const batches = scene.children.filter(
    (child) => child instanceof InstancedMesh,
  );
  assert.equal(batches.length, 1);
  assert.equal(batches[0].count, 2);
  for (const key of keys) {
    assert.equal(scene.getObjectByName(key.name), key);
    assert.equal(key.visible, false);
    assert.equal(batches[0].geometry, key.geometry);
    assert.equal(batches[0].material, key.material);
  }
});

test('typing, parent transforms, and return to rest reach the rendered instances', (t) => {
  const { scene, keys, instances } = fixture(t);
  const parent = new Group();
  parent.position.set(4, -2, 8);
  parent.rotation.set(0.3, -0.7, 0.2);
  parent.scale.setScalar(2);
  parent.add(scene);
  scene.position.set(1, 2, 3);
  const mixer = new AnimationMixer(scene);
  const clip = new AnimationClip('Typing', 2, [
    new VectorKeyframeTrack(
      'key-0.position',
      [0, 1, 2],
      [0, 0, 0, 0, -0.25, 0, 0, 0, 0],
    ),
  ]);
  mixer.clipAction(clip).play();
  t.after(() => {
    mixer.stopAllAction();
    mixer.uncacheRoot(scene);
  });
  for (const time of [0, 0.5, 1, 1.5, 0]) {
    mixer.setTime(time);
    parent.updateMatrixWorld(true);
    instances.update();
    const batch = scene.children.find(
      (child) => child instanceof InstancedMesh,
    );
    keys.forEach((key, index) => {
      const matrix = new Matrix4();
      batch.getMatrixAt(index, matrix);
      matrix.premultiply(scene.matrixWorld);
      matrix.elements.forEach((value, component) => {
        assert.ok(
          Math.abs(value - key.matrixWorld.elements[component]) < 0.000001,
        );
      });
    });
    assert.ok(batch.boundingSphere.radius > 1);
  }
});

test('distinct materials and transparent meshes keep their own draws', (t) => {
  const scene = new Group();
  const geometry = new BoxGeometry();
  const first = new MeshStandardMaterial();
  const second = new MeshStandardMaterial();
  const transparent = new MeshStandardMaterial({ transparent: true });
  const meshes = [first, second, transparent, transparent].map(
    (material) => new Mesh(geometry, material),
  );
  scene.add(...meshes);
  const instances = createWorkspaceInstances(scene);
  t.after(() => {
    instances.dispose();
    geometry.dispose();
    [first, second, transparent].forEach((material) => material.dispose());
  });
  instances.update();
  assert.equal(scene.children.length, 4);
  assert.ok(meshes.every((mesh) => mesh.visible));
});

test('disposing batches releases instance buffers without disposing cached geometry or materials', (t) => {
  const { scene, keys, geometry, material, instances } = fixture(t);
  let batchDisposals = 0;
  let sharedDisposals = 0;
  const batch = scene.children.find((child) => child instanceof InstancedMesh);
  batch.addEventListener('dispose', () => batchDisposals++);
  geometry.addEventListener('dispose', () => sharedDisposals++);
  material.addEventListener('dispose', () => sharedDisposals++);
  instances.dispose();
  assert.equal(batchDisposals, 1);
  assert.equal(sharedDisposals, 0);
  assert.equal(scene.children.length, 2);
  assert.ok(keys.every((key) => key.visible));
});
