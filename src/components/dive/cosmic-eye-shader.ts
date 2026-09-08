import {
  COSMIC_EYE_CLOSED_RATIO,
  COSMIC_EYE_OPENING_RADIUS,
} from './cosmic-eye-geometry';

export const cosmicEyeVertex = `
  attribute float aInterior;
  attribute vec3 aClosedPosition;
  attribute vec3 aClosedNormal;
  uniform float uBlink;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vInterior;
  void main() {
    vec3 posedPosition = mix(position, aClosedPosition, uBlink);
    vec3 posedNormal = normalize(mix(normal, aClosedNormal, uBlink));
    vPosition = posedPosition;
    vNormal = normalize(normalMatrix * posedNormal);
    vInterior = aInterior;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(posedPosition, 1.0);
  }
`;

export const cosmicEyeFragment = `
  uniform vec3 uOutline;
  uniform vec3 uColor;
  uniform vec3 uLight;
  uniform vec3 uDark;
  uniform float uCycle;
  uniform float uBlink;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vInterior;

  vec3 cycleColor(float band) {
    float color = mod(band, 3.0);
    if (color < 1.0) {
      return uDark;
    }
    if (color < 2.0) {
      return uColor;
    }
    return uLight;
  }

  void main() {
    float pupilRadius = 0.16;
    float pupilRim = 0.02;
    float pupilDistance = length(vPosition.xy);
    float cycle = uCycle - max(pupilDistance - pupilRadius - pupilRim, 0.0) / 0.44;
    float band = floor(cycle);
    float blend = smoothstep(0.0, max(fwidth(cycle), 0.001), fract(cycle));
    vec3 inside = mix(cycleColor(band - 1.0), cycleColor(band), blend);
    float pupilFeather = max(fwidth(pupilDistance) * 0.5, 0.001);
    float pupil = 1.0 - smoothstep(pupilRadius - pupilFeather, pupilRadius + pupilFeather, pupilDistance);
    float pupilOutline = 1.0 - smoothstep(pupilRadius + pupilRim - pupilFeather, pupilRadius + pupilRim + pupilFeather, pupilDistance);
    inside = mix(inside, uLight, pupilOutline);
    inside = mix(inside, uDark, pupil);
    float radius = ${COSMIC_EYE_OPENING_RADIUS};
    float aperture = mix(1.0, ${COSMIC_EYE_CLOSED_RATIO}, uBlink);
    float edge = radius * 0.48 * (1.0 - pow(min(abs(vPosition.x) / radius, 1.0), 1.35)) * aperture;
    float feather = max(fwidth(vPosition.y), 0.001);
    float opening = 1.0 - smoothstep(edge - feather, edge + feather, abs(vPosition.y));
    float interior = smoothstep(0.25, 0.75, vInterior) * opening;
    interior *= 1.0 - smoothstep(0.92, 1.0, uBlink);
    vec3 pigment = mix(uOutline, inside, interior);
    float crease = (1.0 - smoothstep(0.004, 0.018, abs(vPosition.y))) * smoothstep(0.8, 1.0, uBlink);
    crease *= 1.0 - smoothstep(radius * 0.8, radius, abs(vPosition.x));
    pigment = mix(pigment, uDark, crease * 0.8);
    vec3 normal = normalize(vNormal);
    float light = max(dot(normal, normalize(vec3(-0.6, 0.7, 0.8))), 0.0);
    float bevel = smoothstep(0.06, 0.2, vPosition.z);
    vec3 body = mix(uDark, pigment, 0.18 + light * 0.82);
    body = mix(body, uLight, pow(light, 10.0) * bevel * 0.28);
    vec3 face = pigment * (0.94 + light * 0.06);
    gl_FragColor = vec4(mix(body, face, interior), 1.0);
    #include <colorspace_fragment>
  }
`;
