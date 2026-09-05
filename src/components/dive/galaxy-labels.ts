import type { Vector2 } from 'three';

import type { GalaxyNode } from './skill-galaxy';

type LabelFrame = {
  alphas: Float32Array;
  scales: Float32Array;
  screens: Vector2[];
  width: number;
  height: number;
};

type LabelBounds = { x: number; y: number; width: number; height: number };

export const cullGalaxyLabels = (
  nodes: Pick<GalaxyNode, 'kind' | 'label'>[],
  frame: LabelFrame,
): void => {
  const visible: LabelBounds[] = [];
  // REASON: the hovered label and category hubs win collisions before ambient
  // tool names; estimating mono text bounds avoids layout reads in the GL loop.
  for (let priority = 0; priority < 3; priority++) {
    nodes.forEach((node, index) => {
      const alpha = frame.alphas[index];
      let rank = node.kind === 'hub' ? 1 : 2;
      if (alpha === 1) {
        rank = 0;
      }
      if (alpha === 0 || rank !== priority) {
        return;
      }
      const scale = frame.scales[index];
      const width =
        (node.label.length * (node.kind === 'hub' ? 9 : 7) + 8) * scale;
      const bounds = {
        x: frame.screens[index].x - width / 2,
        y: frame.screens[index].y - 18 * scale,
        width,
        height: 18 * scale,
      };
      const outside =
        bounds.x < 12 ||
        bounds.x + width > frame.width - 12 ||
        bounds.y < 12 ||
        bounds.y + bounds.height > frame.height - 100;
      const overlaps = visible.some(
        (other) =>
          bounds.x < other.x + other.width + 6 &&
          bounds.x + width + 6 > other.x &&
          bounds.y < other.y + other.height + 4 &&
          bounds.y + bounds.height + 4 > other.y,
      );
      if (outside || overlaps) {
        frame.alphas[index] = 0;
      } else {
        visible.push(bounds);
      }
    });
  }
};
