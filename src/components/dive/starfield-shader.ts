export const starfieldVertex = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPointScale;
  uniform float uAspect;
  uniform float uViewHeight;
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
    ) * 0.022;
    point.x += sign(point.x) * uTravel * (0.12 + aSeed.z * 0.20) * uAspect;

    float depth = 64.0 + point.z * 18.0;
    float perspective = 64.0 / depth;
    vec2 screen = distortPosition(point.xy * perspective);
    gl_Position = projectionMatrix * vec4(screen * uViewHeight / perspective, -depth, 1.0);

    vGlow = pow(aSeed.y, 14.0);
    float size = mix(1.65, 10.8, vGlow) * uPointScale;
    gl_PointSize = max(1.0, size * perspective) * uPixelRatio;
    float twinkle = 0.88 + 0.12 * sin(uTime * (0.4 + aSeed.x * 0.6) + aSeed.x * 40.0);
    vAlpha = (0.18 + aSeed.y * 0.62) * min(perspective, 1.0) * twinkle;
    vTint = aSeed.x;
  }
`;

export const starfieldFragment = `
  uniform vec3 uStarlight;
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform float uTintStrength;
  varying float vAlpha;
  varying float vGlow;
  varying float vTint;

  void main() {
    float radius = length(gl_PointCoord - 0.5);
    float coreRadius = mix(0.24, 0.105, vGlow);
    float aa = max(fwidth(radius) * 0.5, 0.015);
    float core = 1.0 - smoothstep(coreRadius - aa, coreRadius + aa, radius);
    float halo = exp(-radius * radius * 22.0) * (1.0 - smoothstep(0.35, 0.5, radius));
    float alpha = (core + halo * vGlow * 0.38) * vAlpha;
    vec3 dust = mix(uAccent, uHighlight, step(0.5, vTint));
    vec3 starlight = mix(uStarlight, dust, 0.12 + vTint * 0.18);
    gl_FragColor = vec4(mix(starlight, dust, uTintStrength), min(alpha, 1.0));
    #include <colorspace_fragment>
  }
`;
