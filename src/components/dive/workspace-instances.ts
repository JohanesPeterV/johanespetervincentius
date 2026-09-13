import {
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  SkinnedMesh,
} from 'three';

export const createWorkspaceInstances = (scene: Group) => {
  const groups: Mesh[][] = [];
  scene.traverse((object) => {
    if (
      !(object instanceof Mesh) ||
      object instanceof SkinnedMesh ||
      object.morphTargetInfluences ||
      object.children.length > 0 ||
      !object.visible ||
      Array.isArray(object.material) ||
      object.material.transparent
    ) {
      return;
    }
    const group = groups.find(
      ([first]) =>
        first.geometry === object.geometry &&
        first.material === object.material,
    );
    if (group) {
      group.push(object);
    } else {
      groups.push([object]);
    }
  });
  const batches = groups
    .filter((sources) => sources.length > 1)
    .map((sources) => {
      const first = sources[0];
      const mesh = new InstancedMesh(
        first.geometry,
        first.material,
        sources.length,
      );
      mesh.name = `${first.name} instances`;
      mesh.instanceMatrix.setUsage(DynamicDrawUsage);
      scene.add(mesh);
      for (const source of sources) {
        // REASON: keep the original nodes for animation bindings; their
        // identical geometry is drawn by the shared instance mesh instead.
        source.visible = false;
      }
      return { mesh, sources };
    });
  const inverse = new Matrix4();
  const transform = new Matrix4();

  return {
    update: () => {
      if (batches.length === 0) {
        return;
      }
      scene.updateMatrixWorld(true);
      inverse.copy(scene.matrixWorld).invert();
      for (const { mesh, sources } of batches) {
        sources.forEach((source, index) => {
          transform.multiplyMatrices(inverse, source.matrixWorld);
          mesh.setMatrixAt(index, transform);
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      }
    },
    dispose: () => {
      for (const { mesh, sources } of batches) {
        scene.remove(mesh);
        mesh.dispose();
        for (const source of sources) {
          source.visible = true;
        }
      }
    },
  };
};
