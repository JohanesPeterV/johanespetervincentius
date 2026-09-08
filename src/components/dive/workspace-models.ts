import {
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  FrontSide,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { printInkGlsl } from './celestial-shader';

type WorkspaceSource = {
  scene: Group;
  animations: AnimationClip[];
};

export const createWorkspaceModels = (
  sources: WorkspaceSource[],
  renderer: WebGLRenderer,
) => {
  const room = new RoomEnvironment();
  const generator = new PMREMGenerator(renderer);
  const environment = generator.fromScene(room, 0.04);
  room.dispose();
  generator.dispose();
  const materials = new Map<Material, Material>();
  const uniforms = {
    uLuminous: { value: 1 },
    uSunlight: { value: new Color() },
    uLitInk: { value: new Color() },
    uShadowInk: { value: new Color() },
  };

  const cloneMaterial = (source: Material): Material => {
    const existing = materials.get(source);
    if (existing) {
      return existing;
    }
    const material = source.clone();
    if (material instanceof MeshStandardMaterial) {
      material.envMap = environment.texture;
      material.envMapIntensity = 1.4;
    }
    // REASON: the LCD overlays a solid panel by only 0.1 mm. At starfield
    // distances they share a depth value; bias the front-facing screen layer.
    if (material.name === 'LCD • powered-off glass') {
      material.side = FrontSide;
      material.polygonOffset = true;
      material.polygonOffsetUnits = -2;
    }
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.fragmentShader =
        `${printInkGlsl}\n${shader.fragmentShader}`.replace(
          '#include <colorspace_fragment>',
          'gl_FragColor.rgb = printInk(gl_FragColor.rgb);\n#include <colorspace_fragment>',
        );
    };
    material.customProgramCacheKey = () => 'workspace-print-ink';
    materials.set(source, material);
    return material;
  };

  const models = sources.map(({ scene: source, animations }) => {
    const scene = source.clone(true);
    const bounds = new Box3().setFromObject(scene);
    const width = bounds.getSize(new Vector3()).x;
    if (width <= 0) {
      throw new Error(`Workspace model ${source.name} has no visible width.`);
    }
    scene.position.sub(bounds.getCenter(new Vector3()));
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.material = Array.isArray(object.material)
          ? object.material.map(cloneMaterial)
          : cloneMaterial(object.material);
      }
    });
    const normalized = new Group();
    normalized.scale.setScalar(1 / width);
    normalized.add(scene);
    const object = new Group();
    object.add(normalized);
    const mixer = new AnimationMixer(scene);
    for (const clip of animations) {
      mixer.clipAction(clip).play();
    }
    return { object, mixer, scene };
  });

  return {
    models,
    uniforms,
    dispose: () => {
      for (const model of models) {
        model.mixer.stopAllAction();
        model.mixer.uncacheRoot(model.scene);
      }
      for (const material of materials.values()) {
        material.dispose();
      }
      environment.dispose();
    },
  };
};
