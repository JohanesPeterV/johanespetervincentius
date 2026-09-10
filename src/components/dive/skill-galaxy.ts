import { Camera, Euler, MathUtils, Quaternion, Vector2, Vector3 } from 'three';

import { TECHNOLOGIES } from '@/app/_components/technologies/technologies';

import { TECH_STONE, narrativeStoneY } from './descent';
import type { MotionMode } from './descent';
import { cullGalaxyLabels } from './galaxy-labels';

export type GalaxyNode = {
  label: string;
  link: string | null;
  category: number;
  kind: 'hub' | 'skill';
  angle: number;
  position: Vector3;
};

export type GalaxyRing = {
  radius: number;
  tilt: Euler;
  speed: number;
};

type GalaxyMotion = {
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
  orbit: number;
};

type GalaxyPlacement = {
  scale: number;
  x: number;
  y: number;
};

type GalaxyScreenWrite = {
  alphas: Float32Array;
  camera: Camera;
  height: number;
  progress: number;
  scales: Float32Array;
  screens: Vector2[];
  width: number;
};

const RING_INNER_RADIUS = 1.35;
const RING_STEP = 0.72;
// REASON: every ring leans the same way so the stack reads as one inclined
// system like the planet's orbits; the small per-ring wobble keeps the
// satellites from lining up into flat concentric circles
const RING_LEAN = -1.0;
const RING_WOBBLE = [
  [0.08, -0.2],
  [-0.06, 0.14],
  [0.1, -0.05],
  [-0.04, 0.22],
];
const INNER_RING_SPEED = 0.14;
// REASON: hubs lead their rings from staggered angles so the four category
// markers fan around the core instead of stacking at one edge
const HUB_ANGLE = -Math.PI / 2;
const HUB_STAGGER = 0.85;

export const GALAXY_RINGS: GalaxyRing[] = TECHNOLOGIES.map((_, index) => {
  const [wobbleX, wobbleZ] = RING_WOBBLE[index % RING_WOBBLE.length];
  return {
    radius: RING_INNER_RADIUS + index * RING_STEP,
    tilt: new Euler(RING_LEAN + wobbleX, 0, wobbleZ),
    speed: INNER_RING_SPEED / (1 + index * 0.55),
  };
});

const RING_OUTER_RADIUS = GALAXY_RINGS[GALAXY_RINGS.length - 1].radius;

export const GALAXY_CATEGORIES: string[] = TECHNOLOGIES.map(
  (technology) => technology.category,
);

export const GALAXY_NODES: GalaxyNode[] = TECHNOLOGIES.flatMap(
  (technology, categoryIndex) => {
    const slots = technology.contents.length + 1;
    const hubAngle = HUB_ANGLE + categoryIndex * HUB_STAGGER;
    const hub: GalaxyNode = {
      label: technology.category,
      link: null,
      category: categoryIndex,
      kind: 'hub',
      angle: hubAngle,
      position: new Vector3(),
    };
    const skills = technology.contents.map(
      (content, skillIndex): GalaxyNode => ({
        label: content.name,
        link: content.link,
        category: categoryIndex,
        kind: 'skill',
        angle: hubAngle + (Math.PI * 2 * (skillIndex + 1)) / slots,
        position: new Vector3(),
      }),
    );
    return [hub, ...skills];
  },
);

const writeOrbitPositions = (orbit: number): void => {
  GALAXY_NODES.forEach((node) => {
    const ring = GALAXY_RINGS[node.category];
    const angle = node.angle + orbit * ring.speed;
    node.position
      .set(Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, 0)
      .applyEuler(ring.tilt);
  });
};

writeOrbitPositions(0);

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
  orbit: 0,
};

const ORBIT_RATE = 0.0052;
const INERTIA_KICK = 16;
const VELOCITY_DAMPING = 2.4;
const ZOOM_DAMPING = 5;
const FOCUS_DAMPING = 3.4;
const PITCH_LIMIT = 1.1;
const MIN_ZOOM = 0.65;
const MAX_ZOOM = 3;
const FOCUS_ZOOM = 1.35;
const FOCUS_PITCH = 0.3;
const WHEEL_ZOOM_RATE = 0.0016;

const galaxyOrbit = (deltaX: number, deltaY: number): void => {
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

const galaxyPinchBy = (distanceRatio: number): void => {
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
  pinchDistance = activePointers.size >= 2 ? pointerGap() : null;
};

// REASON: motion and pointer tracking are module state so they survive React
// remounts - a fresh DiveScene must not inherit a zoomed galaxy or orphaned
// pointers from a previous visit
export const resetGalaxy = (): void => {
  Object.assign(GALAXY_MOTION, {
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
  });
  activePointers.clear();
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

export const advanceGalaxy = (delta: number, motionMode: MotionMode): void => {
  const motion = GALAXY_MOTION;
  if (motionMode === 'reduced') {
    motion.yawVelocity = 0;
    motion.pitchVelocity = 0;
    motion.zoom = motion.zoomTarget;
    motion.focusBlend = motion.focus === null ? 0 : 1;
    if (motion.focus !== null) {
      motion.pitch = FOCUS_PITCH;
    }
    return;
  }
  motion.orbit += delta;
  writeOrbitPositions(motion.orbit);
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
    motion.pitch = MathUtils.damp(
      motion.pitch,
      FOCUS_PITCH,
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
const galaxyPlacement = (aspect: number): GalaxyPlacement => {
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
  quaternion.setFromEuler(POSE_EULER.set(motion.pitch, motion.yaw, 0, 'YXZ'));
  position.set(
    placement.x,
    narrativeStoneY(progress, TECH_STONE.center) + placement.y,
    TECH_STONE.z,
  );
  return placement.scale * motion.zoom;
};

const HUB_ALPHA = 0.95;
const SKILL_BASE_ALPHA = 0.55;
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
  const zoomBoost = MathUtils.clamp((motion.zoom - 1) * 0.5, 0, 0.45);
  const centerDistance = write.camera.position.distanceTo(POSE_POSITION);
  const depthSpan = Math.max(1, RING_OUTER_RADIUS * scale * 2);
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
    const front = MathUtils.clamp(
      (centerDistance - distance) / depthSpan + 0.5,
      0,
      1,
    );
    let alpha = node.kind === 'hub' ? HUB_ALPHA : SKILL_BASE_ALPHA + zoomBoost;
    if (motion.focus !== null) {
      alpha = node.category === motion.focus ? 1 : DIM_ALPHA;
    }
    // REASON: rear labels at full strength flatten the system into noise -
    // depth attenuation keeps the near face readable and the far face quiet
    const attenuation =
      node.kind === 'hub' || node.category === motion.focus
        ? 0.7 + 0.3 * front
        : 0.4 + 0.6 * front;
    alpha *= attenuation;
    if (motion.hovered === index) {
      alpha = 1;
    }
    if (
      write.width < 768 &&
      node.kind === 'skill' &&
      node.category !== motion.focus &&
      motion.hovered !== index
    ) {
      alpha = 0;
    }
    write.alphas[index] = alpha;
  });
  cullGalaxyLabels(GALAXY_NODES, write);
};
