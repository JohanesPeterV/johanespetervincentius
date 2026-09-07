export const printInkGlsl = `
  uniform float uLuminous;
  uniform vec3 uSunlight;
  uniform vec3 uLitInk;
  uniform vec3 uShadowInk;
  // REASON: a print has no grey. Shading becomes the two inks with paper highlights.
  vec3 printInk(vec3 color) {
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    vec3 ink = mix(uShadowInk, uLitInk, smoothstep(0.0, 0.35, luma));
    ink = mix(ink, uSunlight, smoothstep(0.6, 1.4, luma));
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
