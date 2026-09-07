export const cosmicEyeVertex = `
  attribute float aInterior;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vInterior;
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vInterior = aInterior;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const cosmicEyeFragment = `
  uniform vec3 uOutline;
  uniform vec3 uColor;
  uniform vec3 uLight;
  uniform vec3 uDark;
  uniform float uCycle;
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
    float cycle = uCycle - length(vPosition.xy) / 0.44;
    float band = floor(cycle);
    float blend = smoothstep(0.0, max(fwidth(cycle), 0.001), fract(cycle));
    vec3 inside = mix(cycleColor(band - 1.0), cycleColor(band), blend);
    float interior = smoothstep(0.25, 0.75, vInterior);
    vec3 pigment = mix(uOutline, inside, interior);
    float light = max(dot(normalize(vNormal), normalize(vec3(-0.6, 0.7, 0.8))), 0.0);
    float shade = mix(0.24 + light * 0.76, 0.76 + light * 0.24, interior);
    gl_FragColor = vec4(pigment * shade, 1.0);
    #include <colorspace_fragment>
  }
`;
