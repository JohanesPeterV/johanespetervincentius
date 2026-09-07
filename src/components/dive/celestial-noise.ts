export const celestialNoise = `
  float hash(vec3 point) {
    point = fract(point * 0.3183099 + vec3(0.13, 0.37, 0.71));
    point *= 17.0;
    return fract(point.x * point.y * point.z * (point.x + point.y + point.z));
  }
  float noise(vec3 point) {
    vec3 cell = floor(point);
    vec3 blend = fract(point);
    blend = blend * blend * (3.0 - 2.0 * blend);
    return mix(
      mix(mix(hash(cell), hash(cell + vec3(1, 0, 0)), blend.x),
          mix(hash(cell + vec3(0, 1, 0)), hash(cell + vec3(1, 1, 0)), blend.x), blend.y),
      mix(mix(hash(cell + vec3(0, 0, 1)), hash(cell + vec3(1, 0, 1)), blend.x),
          mix(hash(cell + vec3(0, 1, 1)), hash(cell + vec3(1, 1, 1)), blend.x), blend.y), blend.z
    );
  }
`;
