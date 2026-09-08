export type StarfieldReality = 'watchers' | 'orbital';

type StarfieldAppearance = {
  size: number;
  glow: number;
  tint: number;
};

type ShapeGenerator = (
  index: number,
  random: () => number,
  aspect: number,
) => [x: number, y: number, depth?: number];

export type StarfieldShape = {
  id: string;
  generate: ShapeGenerator;
  hold: number;
  duration: number;
  appearance?: Partial<StarfieldAppearance>;
};

type StarfieldFrame = {
  id: string;
  positions: Float32Array;
  hold: number;
  duration: number;
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

const formTwinSpirals: ShapeGenerator = (index, random, aspect) => {
  const side = index % 2 === 0 ? -1 : 1;
  const compact = aspect < 0.95;
  const radius = Math.pow(random(), 0.58);
  const arm = (index % 3) * ((Math.PI * 2) / 3);
  const angle = arm + radius * 5.8 + (random() - 0.5) * 0.36;
  const scale = 0.45 * Math.min(1, aspect * 0.95);
  const centreY = compact ? side * 0.64 : side * -0.3;
  return [
    side * aspect * 0.72 + Math.cos(angle) * radius * scale,
    centreY + Math.sin(angle) * radius * scale * 0.7,
  ];
};

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

const formBitcoin: ShapeGenerator = (index, random, aspect) => {
  const compact = aspect < 0.95;
  // REASON: portrait prioritizes the larger glyph; interleaving keeps reduced GPU tiers complete.
  const part = compact ? 5 + (index % 15) : index % 20;
  const t = (index * 0.61803398875) % 1;
  let x = 0;
  let y = 0;
  if (part < 5) {
    const angle = t * Math.PI * 2;
    x = Math.cos(angle);
    y = Math.sin(angle);
  } else if (part < 7) {
    x = -0.42;
    y = (t - 0.5) * 1.04;
  } else if (part < 13) {
    const side = part % 2 === 0 ? 1 : -1;
    x = 0.14 + Math.sin(t * Math.PI) * (side === 1 ? 0.4 : 0.46);
    y = side * 0.26 + Math.cos(t * Math.PI) * 0.26;
  } else if (part < 16) {
    x = -0.5 + t * 0.64;
    y = (part - 14) * 0.52;
  } else {
    const side = part < 18 ? -1 : 1;
    x = part % 2 === 0 ? -0.32 : 0.14;
    y = side * (0.52 + t * 0.32);
  }
  x += (random() - 0.5) * 0.025;
  y += (random() - 0.5) * 0.025;
  const scale = compact
    ? Math.min(0.19, aspect * 0.52)
    : Math.min(0.36, aspect * 0.23);
  const centreX = compact ? 0 : aspect * 0.64;
  const centreY = compact ? 0.78 : 0.12;
  const tilt = -Math.PI / 12;
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
      hold: 1.4,
      duration: 2.4,
      appearance: { size: 0.9, glow: 0.7, tint: 0.16 },
    },
    {
      id: 'twin-spirals',
      generate: formTwinSpirals,
      hold: 1.4,
      duration: 2.4,
      appearance: { size: 1.15, glow: 1.25, tint: 0.94 },
    },
    {
      id: 'orbital-wave',
      generate: formOrbitalWave,
      hold: 1.4,
      duration: 2.4,
      appearance: { size: 1, glow: 1, tint: 0.65 },
    },
    {
      id: 'bitcoin',
      generate: formBitcoin,
      hold: 2.2,
      duration: 2.4,
      appearance: { size: 1, glow: 0.12, tint: 0.72 },
    },
  ],
  orbital: [
    {
      id: 'dust-belt',
      generate: formDustBelt,
      hold: 1.4,
      duration: 2.4,
      appearance: { size: 0.8, glow: 0.8, tint: 0.95 },
    },
    {
      id: 'tilted-ring',
      generate: formTiltedRing,
      hold: 1.4,
      duration: 2.4,
      appearance: { size: 1.1, glow: 1.3, tint: 0.45 },
    },
    {
      id: 'double-stream',
      generate: formDoubleStream,
      hold: 1.4,
      duration: 2.4,
      appearance: { size: 0.95, glow: 1, tint: 0.82 },
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
  const frames = shapes.map(({ id, hold, duration, appearance }) => ({
    id,
    hold,
    duration,
    appearance: { size: 1, glow: 1, tint: 0.5, ...appearance },
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
