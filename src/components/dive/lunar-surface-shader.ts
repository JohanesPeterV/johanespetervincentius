import { printInkGlsl } from './celestial-shader';
import { SPACE_KEY_LIGHT_GLSL } from './space-lighting';

export const lunarSurfaceVertex = `
  attribute float aSunVisibility;
  varying float vSunVisibility;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vSurfaceNormal;
  varying vec3 vViewPosition;
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vSurfaceNormal = normal;
    vSunVisibility = aSunVisibility;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const lunarSurfaceFragment = `
  uniform sampler2D uRegolith;
  uniform vec3 uAccent;
  varying float vSunVisibility;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vSurfaceNormal;
  varying vec3 vViewPosition;
  ${printInkGlsl}
  #define USE_BUMPMAP
  #define vBumpMapUv (vPosition.xz * 0.26)
  #include <bumpmap_pars_fragment>
  vec3 surfaceTexture(vec3 point) {
    vec3 weights = pow(abs(normalize(vSurfaceNormal)), vec3(4.0));
    weights /= weights.x + weights.y + weights.z;
    return texture2D(uRegolith, point.zy, 1.2).rgb * weights.x
      + texture2D(uRegolith, point.xz, 1.2).rgb * weights.y
      + texture2D(uRegolith, point.xy, 1.2).rgb * weights.z;
  }
  void main() {
    vec3 regolith = surfaceTexture(vPosition * 0.26);
    float detail = dot(regolith, vec3(0.3333)) * 0.012;
    vec3 normal = perturbNormalArb(-vViewPosition, normalize(vNormal),
      vec2(dFdx(detail), dFdy(detail)), 1.0);
    float sunlight = max(dot(normal, ${SPACE_KEY_LIGHT_GLSL}), 0.0);
    regolith = mix(vec3(0.13), regolith, 0.3);
    vec3 color = regolith * (0.055 + sunlight * vSunVisibility * 1.65);
    color += uAccent * regolith * (1.0 - sunlight) * 0.025;
    gl_FragColor = vec4(printInk(color), 1.0);
    #include <colorspace_fragment>
  }
`;
