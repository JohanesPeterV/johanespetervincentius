import { buildStarfield, createSeededRandom } from './world-layout';
import type { StarfieldReality } from './world-layout';

export const STARFIELD_REFERENCE_DISTANCE = 64;

const NEAR_DISTANCE = 12;
const FAR_DISTANCE = 160;
const VIEW_TANGENT = Math.tan((58 * Math.PI) / 360);

const distanceAt = (fraction: number): number =>
  NEAR_DISTANCE * Math.pow(FAR_DISTANCE / NEAR_DISTANCE, fraction);

export const buildSpatialStarfield = (
  reality: StarfieldReality,
  count: number,
  aspect: number,
): ReturnType<typeof buildStarfield> => {
  const layout = buildStarfield(reality, count, aspect);
  const random = createSeededRandom(reality === 'watchers' ? 719 : 1739);

  for (let star = 0; star < count; star += 1) {
    const offset = star * 3;
    const height = random() * 2 - 1;
    const azimuth = random() * Math.PI * 2;
    const radius = distanceAt(random());
    const ringRadius = Math.sqrt(1 - height * height) * radius;
    layout.scatter.set(
      [
        Math.cos(azimuth) * ringRadius,
        height * radius,
        Math.sin(azimuth) * ringRadius,
      ],
      offset,
    );
    layout.frames.forEach(({ positions }) => {
      const distance = distanceAt((positions[offset + 2] + 0.5) / 1.5);
      // REASON: back-project authored silhouettes into depth so every formation remains readable from the observer's origin.
      positions[offset] *= VIEW_TANGENT * distance;
      positions[offset + 1] *= VIEW_TANGENT * distance;
      positions[offset + 2] = -distance;
    });
  }

  return layout;
};
