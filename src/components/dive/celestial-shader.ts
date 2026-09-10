export const printInkGlsl = `
  uniform float uLuminous;
  uniform vec3 uSunlight;
  uniform vec3 uLitInk;
  uniform vec3 uShadowInk;
  // REASON: a riso mid-tone is a dot screen, each ink printed on its own angle.
  float inkScreen(float coverage, float angle) {
    vec2 cell = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * gl_FragCoord.xy / 6.0;
    float dotRadius = length(fract(cell) - 0.5) * 1.41421;
    return smoothstep(coverage + 0.08, coverage - 0.08, dotRadius);
  }
  // REASON: a print has no grey. Shading becomes the two inks with paper highlights.
  vec3 printInk(vec3 color) {
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float lit = inkScreen(1.0 - smoothstep(0.6, 1.4, luma), 1.31);
    float shadow = inkScreen(1.0 - smoothstep(0.0, 0.35, luma), 0.26);
    vec3 ink = mix(mix(uSunlight, uLitInk, lit), uShadowInk, shadow);
    return mix(ink, color, uLuminous);
  }
`;

export const celestialVertex = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;
