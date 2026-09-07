import { STARFIELD_REFERENCE_DISTANCE } from './starfield-space';

export const starfieldVertex = `
  uniform float uTime;
  uniform vec3 uAppearanceFrom;
  uniform vec3 uAppearanceTo;
  uniform float uLuminous;
  uniform float uAspect;
  uniform float uWorldScale;
  uniform float uMorph;
  uniform float uTravel;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform vec2 uBurstOrigin;
  uniform float uBurstAge;
  uniform float uInteraction;
  attribute vec3 aScatter;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aSeed;
  varying float vAlpha;
  varying float vGlow;
  varying float vTint;
  varying float vColorStrength;
  varying float vHalo;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec2 distortPosition(vec2 point) {
    vec2 pointerDelta = point - vec2(uPointer.x * uAspect, uPointer.y);
    float pointerDistance = length(pointerDelta);
    vec2 pointerDirection = pointerDelta / max(pointerDistance, 0.025);
    float influence = exp(-pow(pointerDistance / 0.24, 2.0));
    vec2 curl = vec2(-pointerDirection.y, pointerDirection.x);
    point += (pointerDirection * 0.12 + curl * 0.085)
      * influence * uPointerStrength * uInteraction;

    vec2 burstDelta = point - vec2(uBurstOrigin.x * uAspect, uBurstOrigin.y);
    float burstDistance = length(burstDelta);
    vec2 burstDirection = burstDelta / max(burstDistance, 0.025);
    float waveDistance = burstDistance - uBurstAge * 0.75;
    float wave = exp(-pow(waveDistance / 0.12, 2.0)) * exp(-uBurstAge * 0.7);
    point += burstDirection * wave * 0.30 * uInteraction;
    return point;
  }

  mat3 starRotation() {
    vec3 angle = vec3(
      0.45 + sin(uTime * 0.27 + aSeed.x * 6.283) * 0.5,
      0.45 + cos(uTime * 0.23 + aSeed.z * 6.283) * 0.5,
      aSeed.x * 6.283 + uTime * (0.12 + aSeed.z * 0.12)
    );
    vec3 c = cos(angle);
    vec3 s = sin(angle);
    return mat3(c.z,-s.z,0, s.z,c.z,0, 0,0,1)
      * mat3(c.y,0,s.y, 0,1,0, -s.y,0,c.y)
      * mat3(1,0,0, 0,c.x,-s.x, 0,s.x,c.x);
  }

  void main() {
    #ifdef STAR_HALO
      if (aSeed.y < 0.90) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        return;
      }
    #endif
    float delay = aSeed.x * 0.18;
    float phase = clamp((uMorph - delay) / (1.0 - delay), 0.0, 1.0);
    float morph = smoothstep(0.0, 1.0, phase);
    vec3 point = mix(aFrom, aTo, morph);
    vec2 journey = aTo.xy - aFrom.xy;
    point.xy += vec2(-journey.y, journey.x) * sin(morph * 3.14159) * 0.16;
    point = mix(aScatter, point, step(0.20, aSeed.z) * (1.0 - uTravel));
    point.xy += vec2(
      sin(uTime * 0.18 + aSeed.x * 6.283),
      cos(uTime * 0.14 + aSeed.z * 6.283)
    ) * 0.6;
    point.z += sin(uTime * 0.12 + aSeed.y * 6.283) * 0.8;
    point.x += sign(point.x) * uTravel * (4.0 + aSeed.z * 7.0);

    vec3 appearance = mix(uAppearanceFrom, uAppearanceTo, morph);
    vGlow = pow(smoothstep(0.90, 1.0, aSeed.y), 2.0);
    float twinkle = 0.64 + 0.36 * (0.5 + 0.5 * sin(
      uTime * (0.8 + aSeed.x * 0.35) + aSeed.z * 6.283
    ));
    float diameter = (0.04 + aSeed.y * aSeed.y * 0.065 + vGlow * 0.32)
      * appearance.x * uWorldScale * mix(0.75, 1.0, uLuminous);
    vec4 center = modelViewMatrix * vec4(point, 1.0);
    float depth = max(0.01, -center.z);
    float nearFade = smoothstep(1.0, 6.0, depth);
    diameter *= nearFade;
    mat3 rotation = starRotation();
    vec3 local = rotation * position * diameter;
    vNormal = normalize(normalMatrix * rotation * normal);
    #ifdef STAR_HALO
      local = position * diameter * 2.4;
      vNormal = normalize(normalMatrix * normal);
    #endif
    vec4 viewPosition = center + modelViewMatrix * vec4(local, 0.0);
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
    if (center.z < -0.2) {
      vec4 projectedCenter = projectionMatrix * center;
      vec2 screen = projectedCenter.xy / projectedCenter.w * vec2(uAspect, 1.0);
      gl_Position.xy += (distortPosition(screen) - screen)
        / vec2(uAspect, 1.0) * gl_Position.w;
    }
    vAlpha = (0.30 + aSeed.y * 0.62) * min(${STARFIELD_REFERENCE_DISTANCE.toFixed(1)} / depth, 1.0) * twinkle
      * nearFade;
    vTint = 0.5 + 0.5 * sin(uTime * 0.48 + aSeed.x * 6.283);
    vColorStrength = appearance.z * mix(0.28, 1.0, uLuminous);
    vHalo = appearance.y * twinkle;
  }
`;

export const starfieldFragment = `
  uniform vec3 uStarlight;
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uBackground;
  uniform float uLuminous;
  varying float vAlpha;
  varying float vGlow;
  varying float vTint;
  varying float vColorStrength;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 light = normalize(vec3(-0.6, 0.8, 1.0));
    float diffuse = max(dot(normal, light), 0.0);
    float specular = pow(max(dot(reflect(-light, normal), normalize(-vViewPosition)), 0.0), 24.0);
    vec3 pigment = mix(uAccent, uHighlight, vTint);
    vec3 color = mix(uStarlight, pigment, vColorStrength);
    color *= 0.28 + diffuse * 0.62 + uLuminous * 0.1;
    color += uStarlight * specular * vGlow * uLuminous * 0.3;
    gl_FragColor = vec4(mix(uBackground, color, vAlpha), 1.0);
    #include <colorspace_fragment>
  }
`;

export const starfieldHaloFragment = `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  varying float vAlpha;
  varying float vGlow;
  varying float vTint;
  varying float vHalo;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(-vViewPosition)));
    float alpha = pow(facing, 5.0) * vGlow * vHalo * vAlpha * 0.32;
    gl_FragColor = vec4(mix(uAccent, uHighlight, vTint), alpha);
    #include <colorspace_fragment>
  }
`;
