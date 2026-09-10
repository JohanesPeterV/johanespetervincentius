export const heroHandoffFragment = `
uniform sampler2D uSavedScene;
uniform sampler2D uHeroContent;
uniform sampler2D uWorkContent;
uniform vec4 uWorkRect;
uniform float uProgress;
uniform float uReturning;
uniform float uSourceIsHero;
uniform float uActive;
uniform float uAspect;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uEtch;
uniform vec3 uSunlight;

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

vec3 handoffHero(vec2 uv) {
  vec3 scene = uSourceIsHero > 0.5 ? texture2D(uSavedScene, uv).rgb : texture2D(inputBuffer, uv).rgb;
  return handoffOver(scene, texture2D(uHeroContent, uv));
}

vec3 handoffOrbital(vec2 uv) {
  vec3 scene = uSourceIsHero > 0.5 ? texture2D(inputBuffer, uv).rgb : texture2D(uSavedScene, uv).rgb;
  if (uReturning > 0.5) {
    return scene;
  }
  vec2 contentUv = (uv - uWorkRect.xy) / uWorkRect.zw;
  vec4 content = texture2D(uWorkContent, clamp(contentUv, 0.0, 1.0));
  float inside = step(0.0, contentUv.x) * step(contentUv.x, 1.0)
               * step(0.0, contentUv.y) * step(contentUv.y, 1.0);
  content.a *= inside;
  return handoffOver(scene, content);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uActive < 0.5) {
    outputColor = inputColor;
    return;
  }

  float progress = uProgress;
  vec3 luminance = vec3(0.2126, 0.7152, 0.0722);
  // REASON: one recipe for both themes. The wash and engraving run on the
  // background and foreground; only the highlight colour follows the theme.
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
  vec3 from = uReturning > 0.5 ? handoffOrbital(fromUv) : handoffHero(fromUv);
  vec3 next = uReturning > 0.5 ? handoffHero(toUv) : handoffOrbital(toUv);

  float luma = dot(from, luminance);
  float lines = clamp(length(vec2(dFdx(luma), dFdy(luma))) * 16.0, 0.0, 1.8);
  vec3 engraving = mix(uInk, uEtch, 0.7);
  vec3 etched = mix(mix(from, uPaper, 0.94), engraving, min(lines * 0.75, 0.88));
  from = mix(from, etched, proximity * envelope * 0.95);

  float aa = max(fwidth(edge) * 1.5, 0.0006);
  float reveal = smoothstep(-aa, aa, edge);
  float rim = 1.0 - smoothstep(aa, aa + 0.001, abs(edge));
  float fringe = exp(-abs(edge + 0.012) * 240.0);
  float sheen = exp(-abs(edge) * 65.0);
  float glint = pow(0.5 + 0.5 * sin(uv.x * 13.0 + medium * 2.0 - progress * 8.0), 8.0);
  vec3 edgeColor = mix(uEtch, uSunlight, 0.3 + medium * 0.25);
  vec3 color = mix(from, next, reveal);
  color = mix(color, edgeColor, (rim * 0.55 + fringe * 0.18 + sheen * 0.12) * envelope);
  color += uSunlight * (rim * 0.22 + fringe * 0.06 + sheen * glint * 0.28) * envelope;
  outputColor = vec4(max(color, 0.0), 1.0);
}
`;
