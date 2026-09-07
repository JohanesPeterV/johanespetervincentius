export const SPACE_KEY_LIGHT: [number, number, number] = [6, 5, -12];

export const SPACE_KEY_LIGHT_GLSL = `normalize((viewMatrix * vec4(${SPACE_KEY_LIGHT.map(
  (value) => value.toFixed(1),
).join(', ')}, 0.0)).xyz)`;
