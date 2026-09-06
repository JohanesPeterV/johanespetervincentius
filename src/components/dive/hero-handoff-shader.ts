export const heroHandoffFragment = `
uniform sampler2D uHeroScene;
uniform sampler2D uHeroContent;
uniform sampler2D uWorkContent;
uniform vec4 uWorkRect;
uniform float uProgress;
uniform float uActive;
uniform float uAspect;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uPrism;

float handoffHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float handoffNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(handoffHash(cell), handoffHash(cell + vec2(1.0, 0.0)), f.x),
             mix(handoffHash(cell + vec2(0.0, 1.0)), handoffHash(cell + 1.0), f.x), f.y);
}

vec3 handoffOver(vec3 background, vec4 content) {
  if (content.a <= 0.0) {
    return max(background, 0.0);
  }
  // REASON: match browser DOM alpha compositing in display space so the text
  // does not change brightness when the snapshot hands back to live HTML.
  vec3 displayBackground = sRGBTransferOETF(vec4(clamp(background, 0.0, 1.0), 1.0)).rgb;
  vec3 displayContent = sRGBTransferOETF(content).rgb;
  return sRGBToLinear(vec4(mix(displayBackground, displayContent, content.a), 1.0)).rgb;
}

vec3 handoffFrom(vec2 uv) {
  return handoffOver(texture2D(uHeroScene, uv).rgb, texture2D(uHeroContent, uv));
}

vec3 handoffTo(vec2 uv) {
  vec2 contentUv = (uv - uWorkRect.xy) / uWorkRect.zw;
  vec4 content = texture2D(uWorkContent, clamp(contentUv, 0.0, 1.0));
  float inside = step(0.0, contentUv.x) * step(contentUv.x, 1.0)
               * step(0.0, contentUv.y) * step(contentUv.y, 1.0);
  content.a *= inside;
  return handoffOver(texture2D(inputBuffer, uv).rgb, content);
}

vec3 handoffPrism(vec2 uv) {
  vec2 aspect = vec2(uAspect, 1.0);
  vec2 center = vec2(0.52, 0.5);
  vec2 position = (uv - center) * aspect;
  float distance = length(position);
  vec2 direction = position / max(distance, 0.0001) / aspect;
  float angle = atan(position.y, position.x);
  float reach = length(max(center, 1.0 - center) * aspect);
  float radius = mix(-0.1, reach + 0.12, uProgress);
  float edge = radius - distance;
  float envelope = smoothstep(0.0, 0.12, uProgress)
                 * (1.0 - smoothstep(0.84, 1.0, uProgress));
  float lens = exp(-pow(edge / 0.045, 2.0));
  vec2 refraction = direction * lens * envelope * 0.018;
  vec2 fromUv = (uv - 0.5) / (1.0 + uProgress * 0.035) + 0.5 + refraction;
  vec2 toUv = (uv - 0.5) / (1.0 + (1.0 - uProgress) * 0.025) + 0.5 - refraction * 0.5;
  vec3 from = handoffFrom(fromUv);
  vec3 next = handoffTo(toUv);

  // REASON: dispersion belongs to the moving lens only; the rest of the card
  // keeps its actual colours, and quiet pixels avoid extra texture reads.
  if (lens > 0.005) {
    vec2 dispersion = direction * lens * envelope * 0.006;
    from.r = handoffFrom(fromUv + dispersion).r;
    from.b = handoffFrom(fromUv - dispersion).b;
  }

  float reveal = smoothstep(-0.012, 0.018, edge);
  vec3 color = mix(from, next, reveal);
  vec3 film = mix(uPaper, uPrism, 0.28 + 0.12 * sin(angle * 2.0 - uProgress * 6.0));
  color = mix(color, film, lens * envelope * 0.42);

  float shadow = exp(-pow((edge + 0.022) / 0.018, 2.0)) * 0.065;
  color = mix(color, uInk, shadow * envelope);
  float rim = exp(-pow(edge / 0.0025, 2.0));
  float orbit = exp(-pow((edge - 0.028) / 0.0018, 2.0))
              * pow(0.5 + 0.5 * cos(angle * 2.0 - uProgress * 5.0), 3.0);
  float glint = pow(max(0.0, cos(angle - 0.65 - uProgress * 1.8)), 36.0)
              + pow(max(0.0, cos(angle + 2.2 - uProgress * 1.8)), 48.0) * 0.45;
  glint *= exp(-abs(edge) * 24.0);
  color = mix(color, uPrism, (rim * 0.18 + orbit * 0.12) * envelope);
  color += uPaper * (rim * 0.48 + orbit * 0.16 + glint * 0.65) * envelope;
  return max(color, 0.0);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uActive < 0.5) {
    outputColor = inputColor;
    return;
  }

  vec3 luminance = vec3(0.2126, 0.7152, 0.0722);
  if (dot(uPaper, luminance) > dot(uInk, luminance)) {
    outputColor = vec4(handoffPrism(uv), 1.0);
    return;
  }
  vec2 p = uv * vec2(uAspect, 1.0);
  float broad = handoffNoise(p * 4.6 + 3.2);
  float medium = handoffNoise(p * 21.0 + broad * 2.8);
  float fine = handoffNoise(p * 110.0 + medium * 3.0);
  float field = uv.y + (broad - 0.5) * 0.22 + (medium - 0.5) * 0.075
              + (fine - 0.5) * 0.018 + sin(uv.x * 5.0) * 0.055;
  float edge = uProgress * 1.5 - 0.25 - field;
  float proximity = 1.0 - smoothstep(0.0, 0.2, abs(edge));
  float envelope = smoothstep(0.0, 0.06, uProgress) * (1.0 - smoothstep(0.94, 1.0, uProgress));
  vec2 refraction = vec2(medium - 0.5, fine - 0.5) * proximity * 0.0025 * envelope;
  vec2 fromUv = (uv - 0.5) / (1.0 + uProgress * 0.045) + 0.5 + refraction;
  vec2 toUv = (uv - 0.5) / (1.0 + (1.0 - uProgress) * 0.055) + 0.5 - refraction;
  vec3 from = handoffFrom(fromUv);
  vec3 next = handoffTo(toUv);

  float luma = dot(from, luminance);
  float lines = clamp(length(vec2(dFdx(luma), dFdy(luma))) * 16.0, 0.0, 1.8);
  vec3 etched = from * 0.045 + uInk * lines;
  from = mix(from, etched, proximity * envelope * 0.95);

  float aa = max(fwidth(edge) * 1.5, 0.0006);
  float reveal = smoothstep(-aa, aa, edge);
  float rim = 1.0 - smoothstep(aa, aa + 0.001, abs(edge));
  float glow = exp(-abs(edge) * 150.0) * 0.08 + exp(-abs(edge) * 48.0) * 0.018;
  vec3 color = mix(from, next, reveal);
  color += uInk * (rim * (0.16 + clamp(luma * 3.0 + lines, 0.0, 1.0)) + glow) * envelope;
  outputColor = vec4(max(color, 0.0), 1.0);
}
`;
