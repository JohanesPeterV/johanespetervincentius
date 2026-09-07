export const galacticCloudVertex = `
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const galacticCloudFragment = `
  uniform vec3 uCameraLocal;
  uniform sampler3D uNoise;
  uniform float uNoiseScale;
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uForeground;
  uniform float uLuminous;
  uniform float uTime;
  uniform float uStrength;
  uniform int uSteps;
  varying vec3 vPosition;

  float hash(vec3 point) {
    point = fract(point * vec3(0.1031, 0.1030, 0.0973));
    point += dot(point, point.yxz + 33.33);
    return fract((point.x + point.y) * point.z);
  }

  float noise(vec3 point) {
    vec3 cell = floor(point);
    vec3 f = fract(point);
    f = f * f * (3.0 - 2.0 * f);
    return texture(uNoise, (cell + f + 0.5) * uNoiseScale).r;
  }

  float cloudNoise(vec3 point) {
    return noise(point) * 0.49
      + noise(point * 2.03 + 11.7) * 0.28
      + noise(point * 4.11 + 29.3) * 0.16
      + noise(point * 8.37 + 41.1) * 0.07;
  }

  vec2 cloudDensity(vec3 point) {
    vec3 wind = vec3(uTime * 0.008, 0.0, uTime * 0.004);
    vec2 offset = (point.xy - vec2(0.54, 0.64)) * vec2(1.05, 1.3);
    float radius = length(offset);
    float angle = atan(offset.y, offset.x) + radius * 0.8;
    vec3 swirl = vec3(cos(angle) * radius, sin(angle) * radius, point.z);
    float turbulence = cloudNoise(swirl * vec3(10.0, 10.0, 5.0) + wind);
    float rim = exp(-pow((radius - 0.51) / 0.28, 2.0));
    float trail = point.y - 0.58 - sin(point.x * 3.4) * 0.08;
    float canopy = exp(-pow(trail / 0.25, 2.0));
    canopy *= 1.0 - smoothstep(0.1, 0.6, point.x);
    float envelope = max(rim, canopy * 0.7) * exp(-point.z * point.z * 3.0);
    envelope *= 1.0 - smoothstep(0.68, 1.0, abs(point.x));
    envelope *= 1.0 - smoothstep(0.72, 1.0, abs(point.y));
    envelope *= 1.0 - smoothstep(0.72, 1.0, abs(point.z));
    envelope *= smoothstep(-0.16, 0.24, point.y);
    float cavity = radius + (turbulence - 0.5) * 0.18 + point.z * 0.08;
    float opening = smoothstep(0.19, 0.31, cavity);
    float ridge = max(0.0, turbulence - 0.43) * 5.0;
    float erosion = noise(point * vec3(12.0, 14.0, 0.7) + 8.7);
    float density = pow(ridge, 2.5) * envelope * opening;
    density *= smoothstep(0.24, 0.66, erosion);
    density += exp(-radius * radius * 28.0 - point.z * point.z * 5.0) * 0.07;
    return vec2(density, turbulence);
  }

  void main() {
    vec3 ray = normalize(vPosition - uCameraLocal);
    vec3 raySign = mix(vec3(-1.0), vec3(1.0), step(vec3(0.0), ray));
    vec3 inverseRay = raySign / max(abs(ray), vec3(0.00001));
    vec3 nearPlanes = (vec3(-1.0, -0.16, -1.0) - uCameraLocal) * inverseRay;
    vec3 farPlanes = (vec3(1.0) - uCameraLocal) * inverseRay;
    vec3 nearBounds = min(nearPlanes, farPlanes);
    vec3 farBounds = max(nearPlanes, farPlanes);
    float entry = max(0.0, max(max(nearBounds.x, nearBounds.y), nearBounds.z));
    float exitPoint = min(min(farBounds.x, farBounds.y), farBounds.z);
    if (exitPoint <= entry) {
      discard;
    }
    float stepLength = (exitPoint - entry) / float(uSteps);
    float jitter = hash(floor(vPosition * 460.0));
    vec3 point = uCameraLocal + ray * (entry + stepLength * jitter);
    vec3 radiance = vec3(0.0);
    float opacity = 0.0;
    for (int index = 0; index < 32; index++) {
      if (index >= uSteps || opacity > 0.92) {
        break;
      }
      vec2 cloud = cloudDensity(point);
      float density = cloud.x;
      float radius = length((point.xy - vec2(0.54, 0.64)) * vec2(1.05, 1.3));
      float illumination = exp(-pow(radius / 0.4, 2.0));
      float hue = smoothstep(0.22, 0.85, radius + point.z * 0.3);
      vec3 pigment = mix(uAccent, uHighlight, hue);
      float knot = pow(max(0.0, cloud.y - 0.51) * 4.0, 2.0);
      vec3 emission = pigment * (0.035 + illumination * 1.1 + knot * 0.2);
      emission += uForeground * illumination * 0.025;
      vec3 ink = mix(uForeground, pigment, 0.3);
      vec3 light = mix(ink, emission, uLuminous);
      float absorption = 1.0 - exp(-density * stepLength * 5.5);
      radiance += (1.0 - opacity) * absorption * light;
      opacity += (1.0 - opacity) * absorption;
      point += ray * stepLength;
    }
    float alpha = opacity * uStrength * mix(0.24, 0.92, uLuminous);
    if (alpha < 0.003) {
      discard;
    }
    gl_FragColor = vec4(radiance / max(opacity, 0.0001), alpha);
    #include <colorspace_fragment>
  }
`;
