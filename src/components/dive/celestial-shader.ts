import { celestialNoise } from './celestial-noise';
import { SPACE_KEY_LIGHT_GLSL } from './space-lighting';

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

export const paintedPlanetFragment = `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uForeground;
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 surface = normalize(vPosition);
    float latitude = surface.y + 0.045 * sin(surface.x * 13.0);
    float bands = smoothstep(0.69, 0.71, fract(latitude * 3.0));
    vec3 pigment = mix(uAccent, uHighlight, bands);
    float stripe = 1.0 - smoothstep(0.012, 0.023, abs(latitude + 0.11));
    pigment = mix(pigment, uForeground, stripe * 0.65);
    float light = dot(normal, normalize(vec3(-0.65, 0.68, 0.5)));
    float shadow = 1.0 - smoothstep(-0.1, 0.15, light);
    vec3 color = mix(pigment * (0.65 + max(light, 0.0) * 0.35), uForeground, shadow * 0.73);
    float grain = sin(surface.x * 173.0) * sin(surface.y * 137.0) * 0.018;
    gl_FragColor = vec4(color * (1.0 + grain), 1.0);
    #include <colorspace_fragment>
  }
`;

export const moonFragment = `
  uniform sampler2D uAlbedo;
  uniform vec3 uAccent;
  uniform vec3 uBackground;
  uniform vec3 uForeground;
  uniform float uMatte;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  #define USE_BUMPMAP
  #define vBumpMapUv vUv
  #include <bumpmap_pars_fragment>
  void main() {
    vec3 normal = perturbNormalArb(-vViewPosition, normalize(vNormal), dHdxy_fwd(), 1.0);
    vec3 albedo = texture2D(uAlbedo, vUv).rgb;
    float sunlight = max(dot(normal, ${SPACE_KEY_LIGHT_GLSL}), 0.0);
    vec3 color = albedo * (0.012 + pow(sunlight, 0.8) * 1.65);
    color += albedo * uAccent * (1.0 - sunlight) * 0.012;
    if (uMatte > 0.5) {
      float light = dot(normal, normalize(vec3(-0.65, 0.68, 0.5)));
      float shadow = 1.0 - smoothstep(-0.12, 0.25, light);
      float graphite = 0.045 + (1.0 - albedo.r) * 0.22 + shadow * 0.44;
      color = mix(uBackground, uForeground, graphite);
    }
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const frontierPlanetFragment = `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uForeground;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  ${celestialNoise}
  float terrain(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 6; octave++) {
      value += noise(p) * amplitude;
      p = p * 2.07 + vec3(11.7, 4.3, 8.1);
      amplitude *= 0.49;
    }
    return value;
  }
  void main() {
    vec3 surface = normalize(vPosition);
    vec3 normal = normalize(vNormal);
    vec3 view = normalize(vViewPosition);
    vec3 light = ${SPACE_KEY_LIGHT_GLSL};
    float elevation = terrain(surface * 3.7 + terrain(surface * 7.0) * 1.8);
    float land = smoothstep(0.46, 0.51, elevation);
    vec3 ocean = uAccent * (0.08 + terrain(surface * 22.0) * 0.12);
    vec3 rock = mix(uHighlight * 0.22, uForeground * 0.32, smoothstep(0.5, 0.72, elevation));
    vec3 pigment = mix(ocean, rock, land);
    vec3 flow = surface * vec3(8.0, 18.0, 8.0);
    float clouds = terrain(flow + vec3(terrain(surface * 5.0) * 4.0));
    float cloudCover = smoothstep(0.49, 0.72, clouds);
    pigment = mix(pigment, uForeground * 0.74, cloudCover);
    float sunlight = max(dot(normal, light), 0.0);
    vec3 color = pigment * (0.008 + pow(sunlight, 0.85) * 1.8);
    float glint = pow(max(dot(normal, normalize(light + view)), 0.0), 80.0);
    color += uForeground * glint * (1.0 - land) * (1.0 - cloudCover) * 0.22;
    float horizon = pow(1.0 - max(dot(normal, view), 0.0), 4.0);
    color += mix(uAccent, uForeground, 0.3) * horizon * smoothstep(-0.12, 0.45, dot(normal, light)) * 0.55;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;
