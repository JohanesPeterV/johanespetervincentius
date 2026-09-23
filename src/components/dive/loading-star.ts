import type { DivePalette } from './dive-palette';
import { createStarPositions } from './star-shape';

type Point = { x: number; y: number; z: number };
export type LoadingFrame = {
  width: number;
  height: number;
  time: number;
  progress: number;
  palette: DivePalette;
};

type LoadingContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

const createStarFaces = (): Point[][] => {
  const positions = createStarPositions();
  const faces: Point[][] = [];
  for (let index = 0; index < positions.length; index += 9) {
    faces.push(
      [0, 3, 6].map((corner) => ({
        x: positions[index + corner],
        y: positions[index + corner + 1],
        z: positions[index + corner + 2],
      })),
    );
  }
  return faces;
};

const FACES = createStarFaces();
const FIELD = Array.from({ length: 64 }, (_, index) => {
  const angle = index * 2.399963;
  const radius = 0.82 + (index % 7) * 0.13;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.72,
    z: Math.sin(index * 7.13) * 0.65,
  };
});

const rotate = (point: Point, time: number): Point => {
  const yaw = 0.45 + Math.sin(time * 0.23) * 0.65;
  const roll = -0.28 + Math.sin(time * 0.17) * 0.12;
  const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const depth = point.z * Math.cos(yaw) - point.x * Math.sin(yaw);
  const y = point.y * Math.cos(0.32) - depth * Math.sin(0.32);
  return {
    x: x * Math.cos(roll) - y * Math.sin(roll),
    y: x * Math.sin(roll) + y * Math.cos(roll),
    z: depth * Math.cos(0.32) + point.y * Math.sin(0.32),
  };
};

const traceFace = (context: LoadingContext, points: Point[]): void => {
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.closePath();
};

export const drawLoadingStar = (
  context: LoadingContext,
  frame: LoadingFrame,
): void => {
  const { width, height, time, progress, palette } = frame;
  context.clearRect(0, 0, width, height);
  const size = Math.min(width * 0.52, height * 0.55, 440);
  const assemble = (1 - progress) * 0.46;
  const project = (point: Point): Point => {
    const rotated = rotate(point, time);
    const perspective = 3.2 / (3.2 - rotated.z);
    return {
      x: width / 2 + rotated.x * size * perspective,
      y: height * 0.46 - rotated.y * size * perspective,
      z: rotated.z,
    };
  };
  const nodes = FIELD.map((point, index) =>
    project({
      x: point.x + Math.sin(time * 0.16 + index) * 0.04,
      y: point.y + Math.cos(time * 0.12 + index) * 0.04,
      z: point.z,
    }),
  );

  context.strokeStyle = palette.foreground;
  context.fillStyle = palette.foreground;
  context.lineWidth = 0.6;
  context.font = '9px monospace';
  nodes.forEach((node, index) => {
    context.globalAlpha = 0.13 + (node.z + 1) * 0.1;
    context.fillRect(node.x - 1, node.y - 1, 2, 2);
    if (index % 4 === 0) {
      context.fillText(
        String(index + 1).padStart(2, '0'),
        node.x + 7,
        node.y - 7,
      );
      context.fillRect(node.x - 3, node.y - 0.5, 6, 1);
      context.fillRect(node.x - 0.5, node.y - 3, 1, 6);
    }
    nodes.slice(index + 1).forEach((next) => {
      const distance = Math.hypot(next.x - node.x, next.y - node.y);
      if (distance > size * 0.3 || distance < size * 0.12) {
        return;
      }
      context.globalAlpha = 0.12 * (1 - distance / (size * 0.35));
      context.beginPath();
      context.moveTo(node.x, node.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    });
  });

  const faces = FACES.map((face, index) => {
    const center = face.reduce(
      (sum, point) => ({
        x: sum.x + point.x / 3,
        y: sum.y + point.y / 3,
        z: sum.z + point.z / 3,
      }),
      { x: 0, y: 0, z: 0 },
    );
    const separation = assemble * (1 + Math.sin(index * 12.3) * 0.4);
    const points = face.map((point) =>
      project({
        x: point.x + center.x * separation,
        y: point.y + center.y * separation,
        z: point.z + center.z * separation * 2,
      }),
    );
    return {
      points,
      depth: points.reduce((sum, point) => sum + point.z / 3, 0),
      index,
    };
  }).sort((a, b) => a.depth - b.depth);

  faces.forEach(({ points, depth, index }) => {
    const front = Math.max(0, Math.min(1, depth + 0.5));
    const scan = Math.pow(Math.max(0, Math.sin(time * 1.4 - index * 0.16)), 12);
    traceFace(context, points);
    const ink = index % 5 === 0 ? palette.glow : palette.accent;
    context.fillStyle = ink;
    context.globalAlpha = 0.015 + front * 0.035 + scan * 0.08;
    context.fill();
    context.strokeStyle = palette.foreground;
    context.lineWidth = 0.65;
    context.globalAlpha = 0.2 + front * 0.6;
    context.stroke();
    context.strokeStyle = ink;
    context.globalAlpha = scan * 0.75;
    context.stroke();
    context.fillStyle = palette.foreground;
    context.globalAlpha = 0.25 + front * 0.6;
    points.forEach((point) => context.fillRect(point.x - 1, point.y - 1, 2, 2));
  });
  context.globalAlpha = 1;
};
