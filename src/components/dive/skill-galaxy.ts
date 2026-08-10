import { Camera, Euler, MathUtils, Quaternion, Vector2, Vector3 } from 'three';

import { TECHNOLOGIES } from '@/app/_components/technologies/technologies';

import { TECH_STONE, narrativeStoneY } from './descent';

export type GalaxyNode = {
  label: string;
  link: string | null;
  category: number;
  kind: 'hub' | 'skill';
  position: Vector3;
};

export type GalaxyCategory = {
  name: string;
  count: number;
  yaw: number;
  pitch: number;
};

export type GalaxyMotion = {
  yaw: number;
  pitch: number;
  yawVelocity: number;
  pitchVelocity: number;
  zoom: number;
  zoomTarget: number;
  focus: number | null;
  focusBlend: number;
  hovered: number | null;
  exploring: boolean;
};

export type GalaxyPlacement = {
  scale: number;
  x: number;
  y: number;
};

export type GalaxyScreenWrite = {
  alphas: Float32Array;
  camera: Camera;
  height: number;
  progress: number;
  scales: Float32Array;
  screens: Vector2[];
  width: number;
};

const HUB_RADIUS = 2.1;
const SKILL_RADIUS = 0.95;
const HUB_AZIMUTHS = [0.5, 1.76, 3.02, 4.27, 5.53];
const HUB_ELEVATIONS = [0.42, -0.3, 0.24, -0.46, 0.1];
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const hubDirection = (index: number, target: Vector3): Vector3 => {
  const azimuth = HUB_AZIMUTHS[index % HUB_AZIMUTHS.length];
  const elevation = HUB_ELEVATIONS[index % HUB_ELEVATIONS.length];
  return target.set(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    Math.cos(azimuth) * Math.cos(elevation),
  );
};

const buildGalaxy = (): {
  nodes: GalaxyNode[];
  categories: GalaxyCategory[];
} => {
  const nodes: GalaxyNode[] = [];
  const categories: GalaxyCategory[] = [];
  const direction = new Vector3();
  TECHNOLOGIES.forEach((technology, categoryIndex) => {
    hubDirection(categoryIndex, direction);
    const hub = direction.clone().multiplyScalar(HUB_RADIUS);
    categories.push({
      name: technology.category,
      count: technology.contents.length,
      yaw: -HUB_AZIMUTHS[categoryIndex % HUB_AZIMUTHS.length],
      pitch: HUB_ELEVATIONS[categoryIndex % HUB_ELEVATIONS.length],
    });
    nodes.push({
      label: technology.category,
      link: null,
      category: categoryIndex,
      kind: 'hub',
      position: hub,
    });
    technology.contents.forEach((content, skillIndex) => {
      // REASON: a fibonacci sphere spreads satellites evenly around the hub
      // with no seeded randomness, so the layout is stable across renders
      const t = (skillIndex + 0.5) / technology.contents.length;
      const polar = Math.acos(1 - 2 * t);
      const azimuth = skillIndex * GOLDEN_ANGLE;
      nodes.push({
        label: content.name,
        link: content.link,
        category: categoryIndex,
        kind: 'skill',
        position: new Vector3(
          Math.sin(polar) * Math.cos(azimuth),
          Math.cos(polar),
          Math.sin(polar) * Math.sin(azimuth),
        )
          .multiplyScalar(SKILL_RADIUS)
          .add(hub),
      });
    });
  });
  return { nodes, categories };
};

const GALAXY = buildGalaxy();

export const GALAXY_NODES = GALAXY.nodes;
export const GALAXY_CATEGORIES = GALAXY.categories;

export const GALAXY_LINKS: Float32Array = (() => {
  const positions: number[] = [];
  let hub: Vector3 | null = null;
  GALAXY_NODES.forEach((node) => {
    if (node.kind === 'hub') {
      hub = node.position;
      positions.push(0, 0, 0, hub.x, hub.y, hub.z);
      return;
    }
    if (hub) {
      positions.push(hub.x, hub.y, hub.z);
      positions.push(node.position.x, node.position.y, node.position.z);
    }
  });
  return new Float32Array(positions);
})();

export const GALAXY_MOTION: GalaxyMotion = {
  yaw: 0,
  pitch: 0,
  yawVelocity: 0,
  pitchVelocity: 0,
  zoom: 1,
  zoomTarget: 1,
  focus: null,
  focusBlend: 0,
  hovered: null,
  exploring: false,
};

const IDLE_SPIN_RATE = 0.1;
const ORBIT_RATE = 0.0052;
const INERTIA_KICK = 16;
const VELOCITY_DAMPING = 2.4;
const ZOOM_DAMPING = 5;
const FOCUS_DAMPING = 3.4;
const PITCH_LIMIT = 1.1;
const MIN_ZOOM = 0.65;
const MAX_ZOOM = 3;
const FOCUS_ZOOM = 2;
const WHEEL_ZOOM_RATE = 0.0016;

export const galaxyOrbit = (deltaX: number, deltaY: number): void => {
  const motion = GALAXY_MOTION;
  motion.yaw += deltaX * ORBIT_RATE;
  motion.pitch = MathUtils.clamp(
    motion.pitch + deltaY * ORBIT_RATE,
    -PITCH_LIMIT,
    PITCH_LIMIT,
  );
  motion.yawVelocity = deltaX * ORBIT_RATE * INERTIA_KICK;
  motion.pitchVelocity = deltaY * ORBIT_RATE * INERTIA_KICK;
  motion.focus = null;
};

export const galaxyZoomBy = (wheelPixels: number): void => {
  GALAXY_MOTION.zoomTarget = MathUtils.clamp(
    GALAXY_MOTION.zoomTarget * Math.exp(-wheelPixels * WHEEL_ZOOM_RATE),
    MIN_ZOOM,
    MAX_ZOOM,
  );
};

export const galaxyPinchBy = (distanceRatio: number): void => {
  GALAXY_MOTION.zoomTarget = MathUtils.clamp(
    GALAXY_MOTION.zoomTarget * distanceRatio,
    MIN_ZOOM,
    MAX_ZOOM,
  );
};

type TrackedPointer = {
  x: number;
  y: number;
};

const activePointers = new Map<number, TrackedPointer>();
let pinchDistance: number | null = null;

const pointerGap = (): number => {
  const [first, second] = [...activePointers.values()];
  return Math.hypot(first.x - second.x, first.y - second.y);
};

export const galaxyPointerDown = (id: number, x: number, y: number): void => {
  activePointers.set(id, { x, y });
  if (activePointers.size === 2) {
    pinchDistance = pointerGap();
  }
};

export const galaxyPointerMove = (id: number, x: number, y: number): void => {
  const pointer = activePointers.get(id);
  if (!pointer) {
    return;
  }
  if (activePointers.size >= 2) {
    pointer.x = x;
    pointer.y = y;
    const gap = pointerGap();
    if (pinchDistance !== null && pinchDistance > 0) {
      galaxyPinchBy(gap / pinchDistance);
    }
    pinchDistance = gap;
    return;
  }
  galaxyOrbit(x - pointer.x, y - pointer.y);
  pointer.x = x;
  pointer.y = y;
};

export const galaxyPointerUp = (id: number): void => {
  activePointers.delete(id);
  pinchDistance = null;
};

export const galaxyEngage = (category: number | null): void => {
  const motion = GALAXY_MOTION;
  motion.exploring = true;
  motion.focus = category;
  if (category !== null) {
    motion.zoomTarget = FOCUS_ZOOM;
  }
};

export const galaxyRelease = (): void => {
  const motion = GALAXY_MOTION;
  motion.exploring = false;
  motion.focus = null;
  motion.zoomTarget = 1;
};

export const advanceGalaxy = (delta: number): void => {
  const motion = GALAXY_MOTION;
  if (!motion.exploring) {
    motion.yaw += IDLE_SPIN_RATE * delta;
  }
  motion.yaw += motion.yawVelocity * delta;
  motion.pitch = MathUtils.clamp(
    motion.pitch + motion.pitchVelocity * delta,
    -PITCH_LIMIT,
    PITCH_LIMIT,
  );
  motion.yawVelocity = MathUtils.damp(
    motion.yawVelocity,
    0,
    VELOCITY_DAMPING,
    delta,
  );
  motion.pitchVelocity = MathUtils.damp(
    motion.pitchVelocity,
    0,
    VELOCITY_DAMPING,
    delta,
  );
  motion.zoom = MathUtils.damp(
    motion.zoom,
    motion.zoomTarget,
    ZOOM_DAMPING,
    delta,
  );
  motion.focusBlend = MathUtils.damp(
    motion.focusBlend,
    motion.focus === null ? 0 : 1,
    FOCUS_DAMPING,
    delta,
  );
  if (motion.focus !== null) {
    const target = GALAXY_CATEGORIES[motion.focus];
    motion.yaw = MathUtils.damp(motion.yaw, target.yaw, FOCUS_DAMPING, delta);
    motion.pitch = MathUtils.damp(
      motion.pitch,
      target.pitch,
      FOCUS_DAMPING,
      delta,
    );
  }
};

const MIN_GALAXY_SCALE = 0.52;
const GALAXY_SCALE_PER_ASPECT = 0.72;
const PORTRAIT_BLEND_START = 0.7;
const PORTRAIT_BLEND_SPAN = 0.5;
const PORTRAIT_CENTER_X = 0.1;
const PORTRAIT_DROP_Y = -2.6;
const DESKTOP_CENTER_X = 0.35;
const DESKTOP_DROP_Y = -0.5;

// REASON: the headline is pinned as a top-left hud for this section, so the
// galaxy claims the screen centre on landscape and drops below it on portrait
export const galaxyPlacement = (aspect: number): GalaxyPlacement => {
  const blend = MathUtils.clamp(
    (aspect - PORTRAIT_BLEND_START) / PORTRAIT_BLEND_SPAN,
    0,
    1,
  );
  return {
    scale: MathUtils.clamp(
      aspect * GALAXY_SCALE_PER_ASPECT,
      MIN_GALAXY_SCALE,
      1,
    ),
    x: DESKTOP_CENTER_X * blend + PORTRAIT_CENTER_X * (1 - blend),
    y: DESKTOP_DROP_Y * blend + PORTRAIT_DROP_Y * (1 - blend),
  };
};

const rotation = new Quaternion();
const focusShift = new Vector3();
const pose = new Vector3();
const POSE_EULER = new Euler();
const POSE_POSITION = new Vector3();

export const writeGalaxyPose = (
  progress: number,
  aspect: number,
  position: Vector3,
  quaternion: Quaternion,
): number => {
  const motion = GALAXY_MOTION;
  const placement = galaxyPlacement(aspect);
  const scale = placement.scale * motion.zoom;
  quaternion.setFromEuler(POSE_EULER.set(motion.pitch, motion.yaw, 0, 'YXZ'));
  position.set(
    placement.x,
    narrativeStoneY(progress, TECH_STONE.center) + placement.y,
    TECH_STONE.z,
  );
  if (motion.focus !== null || motion.focusBlend > 0.001) {
    const hub = GALAXY_NODES.find(
      (node) => node.kind === 'hub' && node.category === motion.focus,
    );
    if (hub) {
      focusShift
        .copy(hub.position)
        .applyQuaternion(quaternion)
        .multiplyScalar(scale * motion.focusBlend);
      position.sub(focusShift);
    }
  }
  return scale;
};

const HUB_ALPHA = 0.95;
const SKILL_BASE_ALPHA = 0.42;
const DIM_ALPHA = 0.12;
const LABEL_REFERENCE_DISTANCE = 8;

export const writeGalaxyScreens = (write: GalaxyScreenWrite): void => {
  const motion = GALAXY_MOTION;
  const scale = writeGalaxyPose(
    write.progress,
    write.width / write.height,
    POSE_POSITION,
    rotation,
  );
  const zoomBoost = MathUtils.clamp((motion.zoom - 1) * 0.5, 0, 0.55);
  GALAXY_NODES.forEach((node, index) => {
    pose
      .copy(node.position)
      .applyQuaternion(rotation)
      .multiplyScalar(scale)
      .add(POSE_POSITION);
    const distance = write.camera.position.distanceTo(pose);
    pose.project(write.camera);
    write.screens[index].set(
      ((pose.x + 1) * write.width) / 2,
      ((1 - pose.y) * write.height) / 2,
    );
    write.scales[index] = MathUtils.clamp(
      (LABEL_REFERENCE_DISTANCE / distance) * (0.7 + motion.zoom * 0.3),
      0.6,
      2.4,
    );
    let alpha = node.kind === 'hub' ? HUB_ALPHA : SKILL_BASE_ALPHA + zoomBoost;
    if (motion.focus !== null) {
      alpha = node.category === motion.focus ? 1 : DIM_ALPHA;
    }
    if (motion.hovered === index) {
      alpha = 1;
    }
    write.alphas[index] = alpha;
  });
};
