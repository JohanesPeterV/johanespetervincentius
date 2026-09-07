export const heroHandoffFragment = `
uniform sampler2D uHeroScene;
uniform sampler2D uHeroContent;
uniform sampler2D uWorkContent;
uniform vec4 uWorkRect;
uniform float uProgress;
uniform float uLoopClosure;
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

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uActive < 0.5 && uLoopClosure <= 0.0) {
    outputColor = inputColor;
    return;
  }

  bool looping = uActive < 0.5;
  float progress = looping ? uLoopClosure : uProgress;
  vec3 luminance = vec3(0.2126, 0.7152, 0.0722);
  bool lightSurface = dot(uPaper, luminance) > dot(uInk, luminance);
  // REASON: both modes share the same etched field, zoom, and reveal timing.
  // Only the material changes with the theme, so scroll and reversal stay identical.
  vec2 p = uv * vec2(uAspect, 1.0);
  float broad = handoffNoise(p * 4.6 + 3.2);
  float medium = handoffNoise(p * 21.0 + broad * 2.8);
  float fine = handoffNoise(p * 110.0 + medium * 3.0);
  float field = uv.y + (broad - 0.5) * 0.22 + (medium - 0.5) * 0.075
              + (fine - 0.5) * 0.018 + sin(uv.x * 5.0) * 0.055;
  float edge = progress * 1.5 - 0.25 - field;
  float proximity = 1.0 - smoothstep(0.0, 0.2, abs(edge));
  float envelope = smoothstep(0.0, 0.06, progress) * (1.0 - smoothstep(0.94, 1.0, progress));
  vec2 refraction = vec2(medium - 0.5, fine - 0.5) * proximity * 0.0025 * envelope;
  vec2 fromUv = (uv - 0.5) / (1.0 + progress * 0.045) + 0.5 + refraction;
  vec2 toUv = (uv - 0.5) / (1.0 + (1.0 - progress) * 0.055) + 0.5 - refraction;
  vec3 from = looping ? texture2D(inputBuffer, fromUv).rgb : handoffFrom(fromUv);
  vec3 next = looping ? uPaper : handoffTo(toUv);

  float luma = dot(from, luminance);
  float lines = clamp(length(vec2(dFdx(luma), dFdy(luma))) * 16.0, 0.0, 1.8);
  vec3 etched = from * 0.045 + uInk * lines;
  if (lightSurface) {
    vec3 engraving = mix(uInk, uPrism, 0.7);
    etched = mix(mix(from, uPaper, 0.94), engraving, min(lines * 0.75, 0.88));
  }
  from = mix(from, etched, proximity * envelope * 0.95);

  float aa = max(fwidth(edge) * 1.5, 0.0006);
  float reveal = smoothstep(-aa, aa, edge);
  float rim = 1.0 - smoothstep(aa, aa + 0.001, abs(edge));
  float glow = exp(-abs(edge) * 150.0) * 0.08 + exp(-abs(edge) * 48.0) * 0.018;
  vec3 color = mix(from, next, reveal);
  if (lightSurface) {
    float fringe = exp(-abs(edge + 0.012) * 240.0);
    float sheen = exp(-abs(edge) * 65.0);
    float glint = pow(0.5 + 0.5 * sin(uv.x * 13.0 + medium * 2.0 - progress * 8.0), 8.0);
    vec3 edgeColor = mix(uPrism, uPaper, 0.3 + medium * 0.25);
    color = mix(color, edgeColor, (rim * 0.55 + fringe * 0.18 + sheen * 0.12) * envelope);
    color += uPaper * (rim * 0.22 + fringe * 0.06 + sheen * glint * 0.28) * envelope;
  } else {
    color += uInk * (rim * (0.16 + clamp(luma * 3.0 + lines, 0.0, 1.0)) + glow) * envelope;
  }
  outputColor = vec4(max(color, 0.0), 1.0);
}
`;
