import { celestialNoise } from './celestial-noise';

const ORBITAL_LIGHT = 'normalize(vec3(-0.62, 0.42, 0.67))';

export const gasGiantFragment = `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uForeground;
  uniform float uTime;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  ${celestialNoise}
  float storm(vec2 point, vec2 centre, vec2 extent) {
    vec2 local = (point - centre) / extent;
    float radius = dot(local, local);
    float angle = atan(local.y, local.x) + exp(-radius * 0.5) * 5.0;
    return sin(angle) * exp(-radius * 0.7) * 0.065;
  }
  void main() {
    vec3 surface = normalize(vPosition);
    vec3 normal = normalize(vNormal);
    float drift = uTime * 0.012;
    float turbulence = noise(surface * 7.0 + vec3(drift, 0.0, 0.0));
    turbulence += noise(surface * 21.0) * 0.3;
    float latitude = surface.y + (turbulence - 0.65) * 0.028;
    latitude += storm(surface.xy, vec2(-0.24, -0.21), vec2(0.36, 0.13));
    latitude += storm(surface.xy, vec2(0.45, 0.34), vec2(0.2, 0.075));
    float broad = smoothstep(0.18, 0.82, noise(vec3(latitude * 11.0, 2.7, 8.3)));
    float ribbons = noise(vec3(latitude * 67.0, turbulence * 0.5, 3.1));
    float fine = sin(latitude * 310.0 + noise(surface * 48.0) * 6.0);
    fine *= 1.0 - smoothstep(0.25, 0.9, fwidth(latitude) * 310.0);
    vec3 pigment = mix(uAccent, uHighlight, broad * 0.7 + ribbons * 0.22);
    pigment = mix(pigment, uForeground, 0.09 + ribbons * 0.15);
    pigment *= 0.5 + broad * 0.22 + ribbons * 0.22 + fine * 0.065;
    float incidence = dot(normal, ${ORBITAL_LIGHT});
    float day = smoothstep(-0.055, 0.12, incidence);
    float diffuse = pow(max(incidence, 0.0), 0.68);
    vec3 color = pigment * (0.009 + day * (0.12 + diffuse * 0.62));
    float atmosphere = pow(1.0 - max(dot(normal, normalize(vViewPosition)), 0.0), 4.5);
    color += mix(uAccent, uForeground, 0.42) * atmosphere * day * 0.085;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const orbitalRingVertex = `
  uniform mat4 uRingToPlanet;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vPlanetPosition;
  varying vec3 vPlanetLight;
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec3 light = ${ORBITAL_LIGHT};
    vec3 localLight = vec3(dot(normalMatrix[0], light), dot(normalMatrix[1], light), dot(normalMatrix[2], light));
    vPlanetPosition = (uRingToPlanet * vec4(position, 1.0)).xyz;
    vPlanetLight = mat3(uRingToPlanet) * localLight;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const particulateRingFragment = `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uForeground;
  uniform float uMatte;
  uniform float uPlanetRadius;
  uniform vec2 uRingBounds;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vPlanetPosition;
  varying vec3 vPlanetLight;
  ${celestialNoise}
  void main() {
    float radius = (length(vPosition.xy) - uRingBounds.x) / (uRingBounds.y - uRingBounds.x);
    float edge = smoothstep(0.0, 0.025, radius) * (1.0 - smoothstep(0.975, 1.0, radius));
    float cassini = smoothstep(0.43, 0.442, radius) * (1.0 - smoothstep(0.475, 0.488, radius));
    float gap = smoothstep(0.79, 0.795, radius) * (1.0 - smoothstep(0.807, 0.816, radius));
    float broad = noise(vec3(radius * 16.0, 2.7, 4.1));
    float fine = 0.5 + 0.5 * sin(radius * 660.0 + sin(radius * 91.0) * 3.0);
    fine = mix(fine, 0.5, smoothstep(0.8, 2.0, fwidth(radius) * 660.0));
    float dust = noise(vPlanetPosition * 290.0);
    float density = (0.13 + broad * 0.66 + fine * 0.2) * edge;
    density *= (1.0 - cassini * 0.98) * (1.0 - gap * 0.88);
    vec3 light = normalize(vPlanetLight);
    float alongRay = max(dot(-vPlanetPosition, light), 0.0);
    float clearance = length(vPlanetPosition + light * alongRay);
    float shadow = 1.0 - smoothstep(uPlanetRadius - 0.012, uPlanetRadius + 0.018, clearance);
    float incidence = abs(dot(normalize(vNormal), ${ORBITAL_LIGHT}));
    vec3 pigment = mix(uAccent, uHighlight, broad * 0.68 + radius * 0.23);
    pigment = mix(pigment, uForeground, 0.24 + fine * 0.12);
    vec3 color = pigment * (0.28 + incidence * 0.5) * (0.88 + dust * 0.12);
    color *= 1.0 - shadow * mix(0.92, 0.32, uMatte);
    float viewingAngle = abs(dot(normalize(vNormal), normalize(vViewPosition)));
    float opticalDepth = density / max(viewingAngle, 0.3);
    float alpha = 1.0 - exp(-opticalDepth * 1.6);
    alpha = mix(alpha, edge * (1.0 - cassini * 0.85) * (1.0 - gap * 0.6), uMatte);
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;
