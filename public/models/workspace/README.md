# Floating workspace assets

Small hero-scene variants of the owner's models, imported from Downloads on 2026-09-08. Original Blender masters and source GLBs are unchanged. These are reference-based exterior reconstructions, not manufacturer CAD.

## Sources

Paths below are relative to `~/Downloads/`.

| Output         | Source                                                                      |
| -------------- | --------------------------------------------------------------------------- |
| `macbook.glb`  | `MacBook_Pro_16_M4_Max_Space_Black/MacBook_Pro_16_M4_Max_Space_Black.blend` |
| `trackpad.glb` | `Magic Trackpad Black/Magic_Trackpad_USB-C_Black.glb`                       |
| `monitor.glb`  | `Xiaomi A27Ui 3D Model/xiaomi-a27ui.glb`                                    |
| `keyboard.glb` | `SPACE65-PYGA-Black/space65-typing.glb`                                     |

MacBook export uses Blender 5.2.1 LTS: the evaluated product assembly at frame 136, with the lid open. Studio objects, cameras, lights, and the lid-opening animation are excluded. Its packed wallpaper is reduced to 1024 px and exported as JPEG. The other three models retain their embedded textures; the keyboard retains its `Typing` clip and physical transmission, volume, clearcoat, specular, and emissive material extensions.

## Web preparation

Temporary tooling: glTF Transform 4.5.0 and Meshoptimizer 1.2.0. Compatible static meshes were deduplicated, flattened and joined; animated nodes remain separate. Geometry was welded and simplified with bounded error, then quantized (14-bit positions, 10-bit normals, 12-bit UVs where supported) and encoded with required `EXT_meshopt_compression`. MacBook simplification used ratio 0.045/error 0.0007; the other models used ratio 0.35/error 0.0005. Error bounds limit the achieved reduction. The Trackpad's empty secondary scene was removed.

| Asset    |     Bytes | Scene triangles | Draw primitives |
| -------- | --------: | --------------: | --------------: |
| MacBook  | 3,567,636 |         332,093 |              21 |
| Trackpad |   220,744 |          21,386 |              13 |
| Monitor  | 1,857,052 |         116,334 |              17 |
| Keyboard | 1,402,832 |         171,652 |             116 |

All four outputs were decoded again and passed Khronos glTF Validator with zero errors and warnings. The runtime uses Drei's bundled Meshopt decoder, normalizes each model by visible width, and provides a shared reflection environment. Dark mode preserves product colours; light mode remaps shading through the scene's existing two-ink shader. Only instance-owned materials, reflection resources, and mixers are disposed. Loader geometry and textures stay cached.

## Attribution

Apple product design, branding, and the supplied MacBook wallpaper remain attributable to Apple. The monitor's screen artwork comes from Xiaomi's official hero imagery, as documented in the source `MODEL_NOTES.md`; rights remain with Xiaomi or the respective owners.

The SPACE65 exterior is an unofficial reconstruction of Graystudio's industrial design. Cherry-profile keycap geometry is by Santiago Castelo / endeavoursc, copyright 2020, MIT. The original notice is retained in GLB metadata and in [the existing license file](../space65-LICENSE.txt), verified byte-identical to the source notice. This variant is separate from the older full-detail asset documented in [Space65 provenance](../space65-provenance.md).

## SHA-256

| Asset    | Source                                                             | Output                                                             |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| MacBook  | `d1545a6ce69d1599f99ed62be9e78993b8e2caee1bdc05f8b7de8192fcc28ec7` | `409734732a5ecd1d0288f1a0cf3c983b3a21ba3e4001d5fa417e8c5d17388563` |
| Trackpad | `d5f2dc9030130499ad19058e0a0f418cc2d41170ad841735b7feeb241d5d6ef8` | `9836958d895a8545795fb668d10dfa7c8328416ecd55f56e3d8060a207bc6861` |
| Monitor  | `3b63aa96edc14f21eeded6d0a2dc28a917ac4d0ef4a37ac9d3605f9dccea1252` | `7c1570dca6927c84bf7e98e9a00a21abe026cb3840699b9e076b323b6e700589` |
| Keyboard | `73dc0e6190b9fd559d140f7670d29a9f59374a81221a6a594df208e037220917` | `323d35f47f401b3c1bc6c001a5754575035e4623e05200c1d5e13a582ec426af` |
