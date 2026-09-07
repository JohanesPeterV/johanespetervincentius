# Lunar surface textures

## Ground material

`lunar-regolith.jpg` is an AI-generated, tileable close-up soil material, created with the built-in imagegen tool on September 8, 2026. It is artwork, not a NASA photograph or scientific surface dataset. The 1254 × 1254 output was exported as JPEG at quality 90; the original generated PNG is retained outside the repository. SHA-256: `76cf2e2bda292ab6047c800fdd52254161d1dab7d3f563f6e8517adf1319fe50`.

The material is projected along all three axes onto the displaced terrain and rocks. Its fine variation also perturbs surface normals. Geometry and sunlight visibility are authored in `src/components/dive/lunar-terrain.ts`; the shader follows the site's shared light and two-ink theme system.

Generation prompt:

> Use case: photorealistic-natural. Asset type: seamless PBR base-color texture for a real-time 3D lunar landscape. Generate one square 2048x2048 texture of authentic lunar regolith viewed exactly orthographically from straight above, covering about 3 metres of ground. Extremely fine sharp angular mineral grains, compact dusty basaltic soil, many tiny irregular impact pocks, sparse angular dark basalt gravel and small stone fragments embedded flush with the dust, naturally uneven density and subtle disturbed shallow relief. Apollo lunar close-up photography material fidelity. Neutral charcoal and cool ash-grey only, no brown or sepia. Flat diffuse shadowless illumination suitable for albedo, with fine material occlusion but absolutely no directional cast shadows, no gradients, no vignette, no perspective, no horizon, no large mountains or giant craters, no astronauts, no tracks, no text, no labels, no border. All four edges must tile seamlessly. The whole image is crisp tactile dusty stone texture edge to edge. It must look like natural lunar ground, not snow, sand dunes, smooth clay, terrazzo, concrete or shiny material.

## Original globe maps

These NASA maps were used by the earlier floating Moon. They are retained as source assets; the surface viewpoint uses the ground material above.

Credit: **NASA's Scientific Visualization Studio**. Visualizer: Ernie Wright (USRA). Scientist: Noah Petro (NASA/GSFC). Source data: Lunar Reconnaissance Orbiter's LROC WAC camera and LOLA laser altimeter.

The images are unmodified JPEGs from the [NASA SVS CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), renamed locally. NASA SVS [permits use and redistribution of its public-domain content unless otherwise noted](https://svs.gsfc.nasa.gov/help/); the kit lists no separate restriction. No NASA endorsement is implied. The color image is intended for visualization, and the 8-bit height image supplies qualitative surface relief.

| Local file         | Original NASA file                                                                           | Dimensions  | Bytes   | SHA-256                                                            |
| ------------------ | -------------------------------------------------------------------------------------------- | ----------- | ------- | ------------------------------------------------------------------ |
| `lunar-albedo.jpg` | [lroc_color_2k.jpg](https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg) | 2048 × 1024 | 457,942 | `f7130a1822681fa7512d7dcfd40db8c10b9ba4f06777910348698260ed7a2170` |
| `lunar-height.jpg` | [ldem_3_8bit.jpg](https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_3_8bit.jpg)     | 1024 × 512  | 111,552 | `6d93f887e7d8bedfe35ab89ba785e5e3ca12381bd092a5e6abe2c707dda8bb98` |

Downloaded September 7, 2026 through documented mirrors because the NASA download host timed out from this network:

- Color: `lroc_color_2k.jpg` inside [Jack Yarndley's NASA LRO texture archive](https://gist.githubusercontent.com/jackyarndley/d6a815743b30ea1b001a2ed351e5c6e5/raw/17af7ee27c3766723bcd13a310a0c436fe877945/moon_lroc_color_2k.tar.gz), with [source attribution](https://gist.github.com/jackyarndley/d6a815743b30ea1b001a2ed351e5c6e5).
- Height: [int64ago/vistep's unmodified copy](https://raw.githubusercontent.com/int64ago/vistep/85fe817e35bec3421e78f9748f5c15fcbd22926a/public/textures/moon/lola-height-1k.jpg).

Both downloaded checksums match the independent [vistep provenance record](https://github.com/int64ago/vistep/blob/85fe817e35bec3421e78f9748f5c15fcbd22926a/THIRD_PARTY_NOTICES.md#lunar-surface-textures). JPEG decoding and final copied-file hashes were verified locally.
