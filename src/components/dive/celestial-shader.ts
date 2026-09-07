import { SPACE_KEY_LIGHT_GLSL } from './space-lighting';

export const celestialVertex = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const orbitalPlanetFragment = `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uBackground;
  uniform vec3 uForeground;
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    vec3 normal = normalize(vNormal);
    float latitude = vPosition.y + 0.045 * sin(vPosition.x * 12.0);
    float band = step(0.76, fract(latitude * 4.0));
    vec3 color = mix(uHighlight, uAccent, band);
    float stripe = 1.0 - step(0.012, abs(latitude + 0.06));
    color = mix(color, uForeground, stripe * 0.9);
    float light = dot(normal, normalize(vec3(-0.72, 0.48, 0.5)));
    float shadow = 1.0 - smoothstep(-0.07, -0.035, light);
    color = mix(color, mix(uBackground, uHighlight, 0.08), shadow);
    float rim = 1.0 - smoothstep(0.04, 0.095, normal.z);
    color = mix(color, uHighlight, rim);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const orbitalRingFragment = `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uForeground;
  uniform float uMatte;
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    float radius = length(vPosition.xy);
    float gap = step(0.713, radius) * (1.0 - step(0.737, radius));
    if (gap > 0.5) {
      discard;
    }
    float bands = step(0.76, fract(radius * 18.0));
    vec3 color = mix(uHighlight, uAccent, bands);
    color = mix(color, uForeground, step(0.869, radius) * 0.82);
    float light = abs(dot(normalize(vNormal), normalize(vec3(-0.65, 0.68, 0.5))));
    color *= mix(1.0, 0.65 + light * 0.35, uMatte);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
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
  uniform vec3 uAccent;
  uniform vec3 uBackground;
  uniform vec3 uForeground;
  uniform float uMatte;
  varying vec3 vPosition;
  varying vec3 vNormal;
  float crater(vec2 point, vec2 centre, float radius) {
    float distance = length(point - centre) / radius;
    float cavity = 1.0 - smoothstep(0.68, 0.94, distance);
    float rim = smoothstep(0.78, 0.95, distance) * (1.0 - smoothstep(0.98, 1.14, distance));
    return cavity * 0.13 - rim * 0.07;
  }
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 surface = normalize(vPosition);
    float craters = crater(surface.xy, vec2(-0.3, 0.27), 0.24);
    craters += crater(surface.xy, vec2(0.38, -0.23), 0.18);
    craters += crater(surface.xy, vec2(-0.17, -0.49), 0.13);
    craters += crater(surface.xy, vec2(0.32, 0.51), 0.11);
    craters += crater(surface.xy, vec2(-0.66, -0.14), 0.1);
    craters += crater(surface.xy, vec2(0.66, 0.22), 0.15);
    craters += crater(surface.xy, vec2(0.61, -0.48), 0.09);
    float light = dot(normal, normalize(vec3(-0.65, 0.68, 0.5)));
    float shadow = 1.0 - smoothstep(-0.13, 0.12, light);
    float pigment = 0.16 + craters + (1.0 - max(light, 0.0)) * 0.14;
    vec3 color = mix(uBackground, uForeground, pigment + shadow * 0.48);
    if (uMatte < 0.5) {
      light = dot(normal, ${SPACE_KEY_LIGHT_GLSL});
      float daylight = smoothstep(-0.18, 0.8, light);
      float grain = sin(surface.x * 93.0) * sin(surface.y * 117.0) * sin(surface.z * 71.0);
      vec3 rock = mix(uForeground, uAccent, 0.18) * (0.52 - craters * 1.5 + grain * 0.035);
      color = rock * (0.015 + daylight * 0.6);
      float rim = pow(1.0 - max(normal.z, 0.0), 4.0) * smoothstep(-0.3, 0.15, light);
      color += uAccent * rim * 0.22;
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
  void main() {
    vec3 surface = normalize(vPosition);
    vec3 normal = normalize(vNormal);
    float continents = sin(surface.x * 3.7 + surface.z * 2.4 + sin(surface.y * 4.2)) * 0.6
      + sin(surface.z * 7.1 - surface.y * 5.3 + sin(surface.x * 5.7)) * 0.28
      + sin(dot(surface, vec3(11.3, 9.7, 8.1))) * 0.12;
    float land = smoothstep(0.02, 0.12, continents);
    vec3 pigment = mix(uAccent, uHighlight, land);
    float coast = smoothstep(-0.02, 0.03, continents) * (1.0 - smoothstep(0.03, 0.08, continents));
    pigment = mix(pigment, uForeground, coast * 0.18);
    float light = dot(normal, ${SPACE_KEY_LIGHT_GLSL});
    float day = pow(max(light, 0.0), 1.15);
    vec3 color = pigment * (0.015 + day * 0.70);
    float rim = pow(1.0 - max(normal.z, 0.0), 6.0) * smoothstep(0.0, 0.3, light);
    color += uAccent * rim * 0.22;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;
