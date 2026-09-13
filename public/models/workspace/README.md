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

MacBook export uses Blender 5.2.1 LTS: the evaluated product assembly at frame 1, with the lid fully closed. The exported product height is 1.684 cm before quantization. Studio objects, cameras, lights, and the lid-opening animation are excluded. Its packed wallpaper is reduced to 1024 px and exported as JPEG. The monitor uses dark, non-emissive LCD glass and an unlit power indicator. Its wallpaper texture is removed; geometry, transforms, and the remaining materials are unchanged. The keyboard retains its embedded textures, `Typing` clip, and physical transmission, volume, clearcoat, specular, and emissive material extensions.

## Web preparation

Temporary tooling: glTF Transform 4.5.0 and Meshoptimizer 1.2.0. Compatible static meshes were deduplicated, flattened and joined; animated nodes remain separate. Geometry was welded and simplified with bounded error, then quantized (14-bit positions, 10-bit normals, 12-bit UVs where supported) and encoded with required `EXT_meshopt_compression`. MacBook simplification used ratio 0.045/error 0.0007; the other models used ratio 0.35/error 0.0005. Error bounds limit the achieved reduction. The Trackpad's empty secondary scene was removed.

| Asset    |     Bytes | Scene triangles | Draw primitives |
| -------- | --------: | --------------: | --------------: |
| MacBook  | 2,017,688 |         168,641 |              21 |
| Trackpad |   168,144 |          14,908 |              13 |
| Monitor  | 1,072,888 |          92,178 |              17 |
| Keyboard | 1,091,628 |         124,228 |             116 |

A second preparation pass on 2026-09-13 reduces the already prepared meshes with `simplify --ratio 0.25 --error 0.001`, then `meshopt --level medium` using the same tooling versions. The error limit is 0.1% of mesh radius, so it stops before the target ratio where needed. Medium encoding keeps 10-bit normals and avoids filtering animation channels again. No scene nodes, mesh primitives, or material bindings were removed; texture bytes and decoded animation curves remain identical. All scene bounds remain within 0.2% of the previous model width. Total scene triangles decrease from 640,458 to 399,955, and the combined files from 6,359,612 to 4,350,348 bytes.

To repeat from the previously prepared GLBs (not these outputs):

```bash
npx --yes @gltf-transform/cli@4.5.0 simplify input.glb simplified.glb --ratio 0.25 --error 0.001
npx --yes @gltf-transform/cli@4.5.0 meshopt simplified.glb output.glb --level medium
```

All four outputs were decoded again and passed Khronos glTF Validator with zero errors and warnings. The runtime uses Drei's bundled Meshopt decoder, normalizes each model by visible width, and provides a shared reflection environment. The monitor's opaque LCD sits about 0.1 mm above its backing panel; its front face receives a two-unit depth bias to prevent z-fighting at starfield scale while retaining its reflections. Devices sample the starfield's live particle buffers and clock for formation changes, drift, pointer/click response, and departure flow. Particle selection considers the authored formations and spacing; small world-space sizes preserve perspective while responsive scaling keeps devices quiet on mobile. Dark mode preserves product colours; light mode remaps shading through the scene's existing two-ink shader. Repeated leaf meshes with identical geometry and materials use shared instance draws. Original nodes remain mounted for the typing clip; instance transforms and bounds update after the animation mixer, including the reduced-motion rest pose. Transparent, skinned, morphing, and non-leaf meshes keep their own draws. Only instance-owned materials, reflection resources, mixers, and instance buffers are disposed. Loader geometry and textures stay cached.

## Attribution

Apple product design, branding, and the supplied MacBook wallpaper remain attributable to Apple. The monitor design remains attributable to Xiaomi. The source model's Xiaomi screen artwork is omitted from this screen-off variant; source references remain documented in its `MODEL_NOTES.md`.

The SPACE65 exterior is an unofficial reconstruction of Graystudio's industrial design. Cherry-profile keycap geometry is by Santiago Castelo / endeavoursc, copyright 2020, MIT. The original notice is retained in GLB metadata and in [the existing license file](../space65-LICENSE.txt), verified byte-identical to the source notice. This variant is separate from the older full-detail asset documented in [Space65 provenance](../space65-provenance.md).

## SHA-256

| Asset    | Source                                                             | Output                                                             |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| MacBook  | `d1545a6ce69d1599f99ed62be9e78993b8e2caee1bdc05f8b7de8192fcc28ec7` | `3ef081d1ea416739a8c4115233ae45159d6d18d1c7a99c7cff06401be4abfbe2` |
| Trackpad | `d5f2dc9030130499ad19058e0a0f418cc2d41170ad841735b7feeb241d5d6ef8` | `4a07ecfa2eaf1ee6a4139e97a3197b1a1b1ada8a9116eac9773a5baaf18ad491` |
| Monitor  | `3b63aa96edc14f21eeded6d0a2dc28a917ac4d0ef4a37ac9d3605f9dccea1252` | `07bc5e521f8a1efc9ed386ab4d2b67a16cb9455fc62951397aa06a6d47db138c` |
| Keyboard | `73dc0e6190b9fd559d140f7670d29a9f59374a81221a6a594df208e037220917` | `54f0be0859a0a3c88cf54f014ec1d9e7d3affc6decab2619e4486913623b52bc` |
