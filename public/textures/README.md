# Lunar surface textures

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
