# Ringwarden asset provenance

## Gameplay reference and derived asset list

The canonical image is `docs/visual-targets/gameplay-v1.png`; it is an imagegen **design target**, not a screenshot of software. The visual contributor inspected both the preliminary image and final target on 24 October 2026. The saved prompt and manifest are beside the image. The two normal Tripo tasks below were submitted before the user's image-first follow-up arrived; their silhouettes and materials are compatible with the final reference and are being reused within the initial two-task allowance.

| Reference feature | Implementation asset | Rule boundary |
|---|---|---|
| Ochre thorn crown on twisted fern stalk, cream planter | Game-specific Chrome Tripo Thorn Crown GLB | Decorative; no mesh-derived radius, cost, collider or damage |
| Low ink-blue beetle, six legs | Game-specific Chrome Tripo ink beetle GLB | Whole-object animation; position/HP/range from simulator |
| Fully supported luminous green circle | Procedural calibrated disk/ring/radius handle | `r` metres in x,z; analytic range from game state |
| Limestone terraces and arched edge supports | Original procedural meshes | Entire playable foundation remains intact; arches below it |
| Cypress trees, flowering ivy, lilies and lower water | Original batched procedural decorative meshes | Outside/under tactical ground; not shot occluders |
| Seed-heart garden core | Original procedural luminous seed and leaf sculpture | Core health from state; visible damage pulse |
| Cream path, circular site markers, shots, health and leak marks | Original procedural indicators | Cosmetic paths/bolts; authoritative simulation supplies outcomes |
| Compact dark upper-right Hebrew HUD | DOM interface owned by gameplay lead | Real controls, LTR formulas, independent stocks |

Camera: perspective 39° high oblique strategic view, orbit/zoom/reset; initial position `(9.5,18.5,20)`, target `(0,0,0)`. No avatar. Scene uses warm directional shadows, cream limestone, fern green, ochre and ink blue. The target has denser high-detail horticulture than the browser slice; visual review records the actual remaining differences.

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

## Export and processing status

Both completed tasks were observed in the user's Tripo asset list (`botanical turret 3d model`, `stylized beetle 3d model`). Normal GLB export is in progress. Chrome's extension connection temporarily timed out and reported a detached debugger; the contributor is recovering via the normal Chrome UI in a new owned window, without touching other crews' tabs. This paragraph is provisional and will be replaced with original/processed hashes and exact processing commands after verified download.

Runtime loader paths are `public/assets/thorn-crown.glb` and `public/assets/ink-beetle.glb`. Until the exports exist, procedural blockouts are an explicitly temporary fallback and model diagnostics report `unavailable`; this is not claimed as completed Tripo integration.

No credentials, signed download URLs or browser state belong in this repository. Static combined GLBs will be animated as whole objects; no rig is claimed. Normalization only centers x,z and grounds the minimum y, then scales Thorn Crown to 1.35 world metres and beetle to 0.4 world metres. Decorative height never changes circle stocks.

## License notes

Models were generated for this project using the user's existing Tripo account under the displayed Sharing Only setting. The contributor has not accepted new terms or changed plan settings. Asset provenance does not assert a separate model copyright or licensing guarantee; Tripo account/plan terms apply. Original procedural scene geometry and indicators are authored in this repository.

## Replanning freeze audit

The owner stopped v1 implementation for a gameflow redesign before final production verification. Both normal Chrome GLB exports are preserved for potential reuse. No further generation is authorized by this audit. The earlier in-progress wording above is historical; exports did complete. Final local runtime files at the stop:

|File|Bytes|Triangles|SHA-256|
|---|---:|---:|---|
|`public/assets/thorn-crown.glb`|4052040|83669|`1f13d1a3b7fe0fb030d109e187ce626977dedaecc81265bf078b12db96590fb7`|
|`public/assets/ink-beetle.glb`|3872276|88482|`f55376a3987a3099fb0164c5f1ef2539505ff01571372667d8e94e077a719fe5`|

Contributor reported local glTF Transform CLI4.5.1 weld, then simplify with error0.025 and ratio0.018(thorn)/0.016(beetle). Attribute seams limited further reduction; no unsupported decimator was used. The latest scene camera is `(4.1,8.6,9.8)`, with responsive FOV39–75. Final close-camera/beetle gameplay remains unverified; the earlier normal-camera check observed the real thorn grounded with shadow. This is preservation evidence, not final integration acceptance.
