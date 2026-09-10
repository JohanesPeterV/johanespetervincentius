export type StarfieldReality = 'watchers' | 'orbital';

type StarfieldAppearance = {
  size: number;
  glow: number;
};

type ShapeGenerator = (
  index: number,
  random: () => number,
  aspect: number,
) => [x: number, y: number, depth?: number];

export type StarfieldShape = {
  id: string;
  generate: ShapeGenerator;
  appearance?: Partial<StarfieldAppearance>;
};

type StarfieldFrame = {
  id: string;
  positions: Float32Array;
  appearance: StarfieldAppearance;
};

type StarfieldLayout = {
  frames: StarfieldFrame[];
  seeds: Float32Array;
  scatter: Float32Array;
};

export const createSeededRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const scatterStars: ShapeGenerator = (_index, random, aspect) => [
  (random() - 0.5) * 2.7 * aspect,
  (random() - 0.5) * 2.5,
];

const formOrbitalWave: ShapeGenerator = (index, random, aspect) => {
  const side = index % 2 === 0 ? -1 : 1;
  const x = (random() - 0.5) * 2.7;
  const compact = aspect < 0.95;
  const height = compact ? 0.72 : 0.56;
  const amplitude = compact ? 0.08 : 0.18;
  return [
    x * aspect,
    side * height + Math.sin(x * 4.5) * amplitude + (random() - 0.5) * 0.08,
  ];
};

type Point = [x: number, y: number];

type Stroke = {
  weight: number;
  width: number;
  point: (t: number) => Point;
};

const line = (from: Point, to: Point, width: number): Stroke => ({
  weight: Math.hypot(to[0] - from[0], to[1] - from[1]) * width,
  width,
  point: (t) => [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
  ],
});

const ring = (radius: number, width: number): Stroke => ({
  weight: Math.PI * 2 * radius * width,
  width,
  point: (t) => [
    Math.cos(t * Math.PI * 2) * radius,
    Math.sin(t * Math.PI * 2) * radius,
  ],
});

const bowl = (centre: Point, radius: number, width: number): Stroke => ({
  weight: Math.PI * radius * width,
  width,
  point: (t) => [
    centre[0] + Math.cos(Math.PI / 2 - t * Math.PI) * radius,
    centre[1] + Math.sin(Math.PI / 2 - t * Math.PI) * radius,
  ],
});

const GLYPH_WIDTH = 0.12;
const BITCOIN_GLYPH: readonly Stroke[] = [
  line([-0.32, -0.64], [-0.32, 0.64], GLYPH_WIDTH),
  line([-0.32, 0.64], [0.04, 0.64], GLYPH_WIDTH),
  line([-0.32, 0], [0.08, 0], GLYPH_WIDTH),
  line([-0.32, -0.64], [0.08, -0.64], GLYPH_WIDTH),
  bowl([0.04, 0.32], 0.32, GLYPH_WIDTH),
  bowl([0.08, -0.32], 0.32, GLYPH_WIDTH),
  line([-0.14, 0.64], [-0.14, 0.82], 0.11),
  line([0.06, 0.64], [0.06, 0.82], 0.11),
  line([-0.14, -0.64], [-0.14, -0.82], 0.11),
  line([0.06, -0.64], [0.06, -0.82], 0.11),
];
const BITCOIN_EMBLEM: readonly Stroke[] = [ring(1, 0.07), ...BITCOIN_GLYPH];

const sampleStrokes = (
  strokes: readonly Stroke[],
  fraction: number,
  random: () => number,
): Point => {
  const total = strokes.reduce((sum, stroke) => sum + stroke.weight, 0);
  let remaining = fraction * total;
  let stroke = strokes[strokes.length - 1];
  for (const candidate of strokes) {
    if (remaining <= candidate.weight) {
      stroke = candidate;
      break;
    }
    remaining -= candidate.weight;
  }
  const [x, y] = stroke.point(remaining / stroke.weight);
  return [
    x + (random() - 0.5) * stroke.width,
    y + (random() - 0.5) * stroke.width,
  ];
};

const formBitcoin: ShapeGenerator = (index, random, aspect) => {
  const compact = aspect < 0.95;
  // REASON: portrait drops the ring so the glyph keeps enough stars to stay solid.
  const strokes = compact ? BITCOIN_GLYPH : BITCOIN_EMBLEM;
  // REASON: golden-ratio spacing fills every stroke evenly at any star count.
  const [x, y] = sampleStrokes(strokes, (index * 0.61803398875) % 1, random);
  const scale = compact
    ? Math.min(0.19, aspect * 0.52)
    : Math.min(0.36, aspect * 0.23);
  const centreX = compact ? 0 : aspect * 0.64;
  const centreY = compact ? 0.78 : 0.12;
  const tilt = -Math.PI / 13;
  // REASON: one depth plane prevents perspective spread from separating the emblem's strokes.
  return [
    centreX + (x * Math.cos(tilt) - y * Math.sin(tilt)) * scale,
    centreY + (x * Math.sin(tilt) + y * Math.cos(tilt)) * scale,
    0,
  ];
};

const formDustBelt: ShapeGenerator = (_index, random, aspect) => {
  const x = (random() - 0.5) * 2.7;
  return [x * aspect, x * 0.46 + (random() - 0.5) * 0.6];
};

const formTiltedRing: ShapeGenerator = (_index, random, aspect) => {
  const angle = random() * Math.PI * 2;
  const radius = 0.8 + random() * 0.25;
  const x = Math.cos(angle) * radius * aspect * 1.02;
  const y = Math.sin(angle) * radius * 0.62;
  return [
    x * Math.cos(-0.22) - y * Math.sin(-0.22),
    x * Math.sin(-0.22) + y * Math.cos(-0.22),
  ];
};

const formDoubleStream: ShapeGenerator = (index, random, aspect) => {
  const side = index % 2 === 0 ? -1 : 1;
  const x = (random() - 0.5) * 2.7;
  return [
    x * aspect,
    x * 0.3 + side * 0.32 + Math.sin(x * 3) * 0.07 + (random() - 0.5) * 0.06,
  ];
};

export const STARFIELD_SHAPES: Readonly<
  Record<StarfieldReality, readonly StarfieldShape[]>
> = {
  watchers: [
    {
      id: 'scatter',
      generate: scatterStars,
      appearance: { size: 0.9, glow: 0.7 },
    },
    {
      id: 'orbital-wave',
      generate: formOrbitalWave,
      appearance: { size: 1, glow: 1 },
    },
    {
      id: 'bitcoin',
      generate: formBitcoin,
      appearance: { size: 1, glow: 0.12 },
    },
  ],
  orbital: [
    {
      id: 'dust-belt',
      generate: formDustBelt,
      appearance: { size: 0.8, glow: 0.8 },
    },
    {
      id: 'tilted-ring',
      generate: formTiltedRing,
      appearance: { size: 1.1, glow: 1.3 },
    },
    {
      id: 'double-stream',
      generate: formDoubleStream,
      appearance: { size: 0.95, glow: 1 },
    },
  ],
};

export const buildStarfield = (
  reality: StarfieldReality,
  count: number,
  aspect: number,
): StarfieldLayout => {
  const seed = reality === 'watchers' ? 71 : 173;
  const random = createSeededRandom(seed);
  const shapes = STARFIELD_SHAPES[reality];
  const frames = shapes.map(({ id, appearance }) => ({
    id,
    appearance: { size: 1, glow: 1, ...appearance },
    positions: new Float32Array(count * 3),
  }));
  const seeds = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const scatterGenerator = reality === 'watchers' ? scatterStars : formDustBelt;

  for (let star = 0; star < count; star += 1) {
    const offset = star * 3;
    const [x, y] = scatterGenerator(star, random, aspect);
    const depth = random() * 1.5 - 0.5;
    scatter.set([x, y, depth], offset);
    seeds.set([random(), random(), random()], offset);
    shapes.forEach((shape, frame) => {
      const shapeRandom = createSeededRandom(seed + star * 37);
      const [shapeX, shapeY, shapeDepth = depth] = shape.generate(
        star,
        shapeRandom,
        aspect,
      );
      frames[frame].positions.set([shapeX, shapeY, shapeDepth], offset);
    });
  }

  return { frames, seeds, scatter };
};
