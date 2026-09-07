export const starfieldVertex = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uAppearanceFrom;
  uniform vec3 uAppearanceTo;
  uniform float uLuminous;
  uniform float uAspect;
  uniform float uReferenceDistance;
  uniform float uProjectionScale;
  uniform float uMorph;
  uniform float uTravel;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform vec2 uBurstOrigin;
  uniform float uBurstAge;
  uniform float uInteraction;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aSeed;
  varying float vAlpha;
  varying float vGlow;
  varying float vTint;
  varying float vColorStrength;
  varying float vHalo;

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

  void main() {
    float delay = aSeed.x * 0.18;
    float phase = clamp((uMorph - delay) / (1.0 - delay), 0.0, 1.0);
    float morph = smoothstep(0.0, 1.0, phase);
    vec3 point = mix(aFrom, aTo, morph);
    vec2 journey = aTo.xy - aFrom.xy;
    vec2 arc = vec2(-journey.y, journey.x) * sin(morph * 3.14159) * 0.16;
    point.xy += arc;
    point = mix(position, point, step(0.20, aSeed.z) * (1.0 - uTravel));
    point.xy += vec2(
      sin(uTime * 0.18 + aSeed.x * 6.283),
      cos(uTime * 0.14 + aSeed.z * 6.283)
    ) * 0.6;
    point.z += sin(uTime * 0.12 + aSeed.y * 6.283) * 0.8;
    point.x += sign(point.x) * uTravel * (4.0 + aSeed.z * 7.0);

    vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
    float depth = max(0.01, -viewPosition.z);
    float perspective = uReferenceDistance / depth;
    gl_Position = projectionMatrix * viewPosition;
    if (viewPosition.z < -0.2) {
      vec2 screen = gl_Position.xy / gl_Position.w * vec2(uAspect, 1.0);
      gl_Position.xy = distortPosition(screen) / vec2(uAspect, 1.0) * gl_Position.w;
    }

    vec3 appearance = mix(uAppearanceFrom, uAppearanceTo, morph);
    vGlow = pow(smoothstep(0.90, 1.0, aSeed.y), 2.0);
    float twinkle = 0.64 + 0.36 * (0.5 + 0.5 * sin(
      uTime * (0.8 + aSeed.x * 0.35) + aSeed.z * 6.283
    ));
    float size = mix(1.2, 2.8, aSeed.y * aSeed.y) + vGlow * 16.0;
    size *= appearance.x * mix(0.48, 1.0, uLuminous);
    size *= mix(1.0, 0.86 + twinkle * 0.14, vGlow);
    gl_PointSize = max(1.0, min(size * perspective, 56.0) * uProjectionScale) * uPixelRatio;
    vAlpha = (0.30 + aSeed.y * 0.62) * min(perspective, 1.0) * twinkle
      * smoothstep(1.0, 6.0, depth);
    vTint = 0.5 + 0.5 * sin(uTime * 0.48 + aSeed.x * 6.283);
    vColorStrength = appearance.z * mix(0.28, 1.0, uLuminous);
    vHalo = appearance.y * twinkle * mix(0.04, 0.55, uLuminous);
  }
`;

export const starfieldFragment = `
  uniform vec3 uStarlight;
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform float uLuminous;
  varying float vAlpha;
  varying float vGlow;
  varying float vTint;
  varying float vColorStrength;
  varying float vHalo;

  void main() {
    float radius = length(gl_PointCoord - 0.5);
    float coreRadius = mix(0.30, mix(0.22, 0.135, uLuminous), vGlow);
    float aa = max(fwidth(radius) * 0.5, 0.015);
    float core = 1.0 - smoothstep(coreRadius - aa, coreRadius + aa, radius);
    float halo = exp(-radius * radius * 13.0) * (1.0 - smoothstep(0.4, 0.5, radius));
    float alpha = (core + halo * vGlow * vHalo) * vAlpha;
    vec3 pigment = mix(uAccent, uHighlight, vTint);
    vec3 starlight = mix(uStarlight, pigment, vColorStrength);
    starlight = mix(starlight, uStarlight, vGlow * 0.72 * uLuminous);
    gl_FragColor = vec4(mix(pigment, starlight, core), min(alpha, 1.0));
    #include <colorspace_fragment>
  }
`;
