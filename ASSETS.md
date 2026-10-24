# Ringwarden asset provenance

## Gameplay reference and derived asset list

The approved active-defense rebuild follows the four generated design references in `docs/rebuild/mockups/`: `00-actionable-opening.png`, `01-first-gesture.png`, `02-live-defense.png` and `03-leak-recovery.png`. These are **design targets**, not screenshots of software. Exact prompts and selected-image hashes are beside them. Earlier `docs/visual-targets/` images belong to the rejected v1 direction.

The two normal Tripo tasks below were submitted before the image-first follow-up, then inspected for compatible silhouette/material language and reused. No additional Tripo generation or credit spend occurred for the rebuild.

| Reference feature | Active scene asset | Rule boundary |
|---|---|---|
| Low ochre thorn crown, fern stem, cream planter | Existing game-specific Chrome Tripo Thorn Crown GLB, grounded to 1.08 m visual height | Decorative; no mesh-derived radius, stock cost or damage |
| Low ink-blue beetle, six legs | Existing game-specific Chrome Tripo ink beetle GLB, grounded to 0.34 m visual height | Whole-object route motion/recoil; HP and hits come from the simulator |
| Exact luminous circle and gold grip | Procedural calibrated disk/ring, screen-aware grip and radial cue | Analytic x,z distance; 44 CSS-pixel hit area does not change reach |
| Limestone terrace, below-deck arches | Original procedural meshes and deterministic paving texture | Full allowed disks remain supported; no priced shape is clipped |
| Cypress, ivy, flowers and lilies | Original batched procedural decorative meshes | Periphery/below tactical ground; never authoritative shot blockers |
| Tall ivory-gold seed-heart | Original procedural lathed bud, petals and stone pedestal | Distinct from low defenses; health from state |
| HP pips, bolts, bloom, leak ghost | Original procedural feedback | Exact numeric HP; four pips for eight HP; bolts are cosmetic |
| Sparse Hebrew HUD and contextual drag costs | DOM UI owned by gameplay lead | Real state, isolated LTR quantities, independent length/area stocks |

`src/live-scene.ts` uses a fixed orthographic high oblique camera. Landscape camera position is `(-2.5,11.6,14.6 + focusZ)`, looking at `(0.55,0.45,focusZ)`; horizontal framing is 11 m for the opening and 13 m for the second approach. Portrait turns along the route at `(14,12,2.4 + focusZ)` and uses 5.8 m / 8.6 m horizontal framing, so the encounter uses the screen's height. `focusZ` is zero initially and 0.9 m when the second plant appears. Camera adaptation preserves game state. There is no avatar, orbit prerequisite, numbered site tray or form. Screen framing is checked against actual browser captures; a generated image is not usability evidence.

The core is a separate procedural sculpture, scaled to 0.9 for headroom below the HUD. The exact planar range disks remain independent of that decoration. Route strips and directional inlays are nonblocking indicators below the ward fill. A pointer may grab the 44-pixel grip, any ring edge or the plant body; all use the same analytic ground-distance resize callback. Shrinking/growing transactions and attack eligibility are owned by the independent game simulator.

## Chrome / Tripo tasks

Generated through the user's existing Chrome session at `https://studio.tripo3d.ai/workspace/generate/`, using the normal text-to-model interface, H3.1 Geometry & Texture, normal 45-credit generation. No provider API, token, purchase, upgrade, alternate generator or new plan. Displayed global balances are not attributed spend because other crews share the account. Displayed cost was **45 credits per task**, **90 credits total authorized tasks**. Initial budget of two generations is exhausted; no further generation is requested or performed.

### Thorn Crown

- Task ID: `81f33621-1221-49c4-914b-d1341f4d7b1a`
- Task page: <https://studio.tripo3d.ai/workspace/generate/81f33621-1221-49c4-914b-d1341f4d7b1a>
- Observed generation button: `Generate 45`.
- Exact prompt:

> A single botanical tower defense Thorn Crown plant turret, stylized illustrated strategy game asset. Broad ochre golden thorn flower crown pointing upward, stout twisted dark fern green stem, several spear leaves, cream carved stone planter base. Friendly ancient garden stronghold, sculptural chunky silhouette readable from high oblique camera. Hand painted matte materials, botanical shapes, no face, no character, no text, no platform or background. Low polygon game ready prop, approximately one metre tall.

### Ink beetle

- Task ID: `dc99b20c-ae25-49ff-8092-3a33bf806575`
- Task page: <https://studio.tripo3d.ai/workspace/generate/dc99b20c-ae25-49ff-8092-3a33bf806575>
- Observed generation button: `Generate 45`.
- Completed task UI showed 968,810 faces / 504,186 vertices before local processing.
- Exact prompt:

> A single stylized ink-blue garden beetle enemy for an illustrated botanical tower defense strategy game. Chunky oval midnight navy shell with subtle blue indigo bands, six short articulated legs and two tiny curved antennae, small ochre eyes. Robust low silhouette readable from a high oblique camera, hand painted matte materials with gentle shell highlights. No human features, no face expression, no text, no base or background, no extra objects. Low polygon game ready creature, body about half a metre long.

## Export, local processing and integration

Both completed tasks were downloaded through Chrome's normal **Export → GLB → 1k texture** UI. Temporary debugger detachment was recovered through native `cua_repl` Chrome controls in a new owned window. No API, token, signed download URL or alternate generator was used. Original exports remain local in ignored `output/asset-source/`; runtime GLBs are bundled in `public/assets/`.

| Asset | Original SHA-256 | Runtime SHA-256 |
|---|---|---|
| Thorn Crown | `3d2d23679d82f6841ca7dcaaeb86f99dfaf7d30e2616140ceda7d5c07b0252b2` | `1f13d1a3b7fe0fb030d109e187ce626977dedaecc81265bf078b12db96590fb7` |
| Ink beetle | `12a938296b499010601f21a4652a18c146429096d7009efa6a07c59c7e812a2c` | `f55376a3987a3099fb0164c5f1ef2539505ff01571372667d8e94e077a719fe5` |

The resolved processor was glTF Transform CLI 4.5.1 (meshoptimizer 1.2.0). Exact accepted processing sequence:

```sh
npx --yes @gltf-transform/cli weld output/asset-source/thorn-crown-original.glb output/asset-source/thorn-crown-weld.glb
npx --yes @gltf-transform/cli simplify output/asset-source/thorn-crown-weld.glb public/assets/thorn-crown.glb --ratio 0.018 --error 0.025
npx --yes @gltf-transform/cli weld output/asset-source/ink-beetle-original.glb output/asset-source/ink-beetle-weld.glb
npx --yes @gltf-transform/cli simplify output/asset-source/ink-beetle-weld.glb public/assets/ink-beetle.glb --ratio 0.016 --error 0.025
```

An initial lower-error simplification and one supported `Prune`-flag attempt did not overcome the attribute-seam floor. The prune outputs were not copied into runtime. No further decimation or new generation was performed for the rebuild.

| Runtime file | Bytes | Triangles |
|---|---:|---:|
| `public/assets/thorn-crown.glb` | 4,052,040 | 83,669 |
| `public/assets/ink-beetle.glb` | 3,872,276 | 88,482 |

The loader records real load status, source bounds, visual height and triangle count in renderer diagnostics. Geometry and materials are shared between model instances. Bounds are centered in x,z, grounded at minimum y and uniformly scaled. The static combined meshes have no animation clips or rig; aiming and recoil animate the whole object. Height adds no hidden stock term. Enemy contact shadows avoid multiplying high-detail beetle geometry through the directional shadow pass.

Procedural blockouts remain an error/loading fallback, not a substitute claimed as final Tripo integration. Development-browser checks observed both local models loaded and grounded, corrected the beetle facing direction, and exercised desktop/portrait ring drags through a visible 6/8 HP hit. Foliage geometry was normalized to non-indexed attributes after a merge error was caught and corrected. Production behavior and full-flow results are reported separately by the crew; no human fun or learning claim follows from these checks.

No credentials, signed download URLs or browser state belong in this repository.

## License notes

Models were generated for this project using the user's existing Tripo account under the displayed Sharing Only setting. The contributor has not accepted new terms or changed plan settings. Asset provenance does not assert a separate model copyright or licensing guarantee; Tripo account/plan terms apply. Original procedural scene geometry and indicators are authored in this repository.

## Historical v1 replanning freeze audit

The owner stopped v1 implementation for a gameflow redesign before final production verification. Both normal Chrome GLB exports are preserved for potential reuse. No further generation is authorized by this audit. The earlier in-progress wording above is historical; exports did complete. Final local runtime files at the stop:

|File|Bytes|Triangles|SHA-256|
|---|---:|---:|---|
|`public/assets/thorn-crown.glb`|4052040|83669|`1f13d1a3b7fe0fb030d109e187ce626977dedaecc81265bf078b12db96590fb7`|
|`public/assets/ink-beetle.glb`|3872276|88482|`f55376a3987a3099fb0164c5f1ef2539505ff01571372667d8e94e077a719fe5`|

Contributor reported local glTF Transform CLI4.5.1 weld, then simplify with error0.025 and ratio0.018(thorn)/0.016(beetle). Attribute seams limited further reduction; no unsupported decimator was used. At the v1 stop, its camera was `(4.1,8.6,9.8)`, with responsive FOV39–75. That pre-rebuild close-camera/beetle gameplay was not verified; the earlier v1 normal-camera check observed the real thorn grounded with shadow. This paragraph is historical preservation evidence for rejected v1, not the current live scene or its integration acceptance. Current camera, reuse and development checks are described above.
