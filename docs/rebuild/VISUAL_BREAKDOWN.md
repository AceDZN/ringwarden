# Rebuild visual and interaction breakdown

Planning review, 24 October 2026. Reviewed `PLAN.md`, `mockups/README.md` and all three selected PNGs with `view_image`. These are generated design references. Game source, assets and tests remain frozen; this document does not accept the direction or establish usability or fun.

## Verdict

The first-gesture and leak-recovery images materially clarify the proposed loop. An existing plant, one conspicuous grip, an immediate hit and one rewind remove the old site's number → form → commit → start sequence. This is a meaningful interaction change, not only a prettier v1.

The two-plant image is less resolved. Its flowing particles suggest dragging resources directly between plants, while the plan describes shrinking one ring and then enlarging another. Those are different controls. With zero conduit left, the pictured upper grip cannot enlarge its ring until conduit is recovered. The next useful gesture must be clear before implementation. More horticultural detail will not resolve this ambiguity.

## What each frame still needs to establish

| Frame | Useful change | Unresolved interaction or visual issue |
|---|---|---|
| 01 first gesture | One large grip, plant and nearby beetle; costs attach to the action. | The picture already shows radius 2 and both stocks at zero. It is an **after-drag** frame, not an actionable opening. The curved arrow suggests rotating around the ring; use a short straight radial arrow. Repeated leaf symbols should read as decoration, not eight competing handles. |
| 02 live defense | Both defenses and incoming pressure share one view; no permanent inspector. | Decide whether the player shrinks then grows, or transfers through another explicitly designed gesture. Show both usable grips and the selected plant clearly. Golden particles between plants must not imply exchanging length for area or an unimplemented resource-drag mechanic. |
| 03 leak recovery | A route points toward the damaged core and the single rewind dominates. | Show a frozen recovery moment, or clearly state whether enemies keep moving. Retain the gap marker on the relevant uncovered segment. The blue ghost should be visibly different from a living enemy. Rewind must restore a declared checkpoint, not merely remove damage. |

A useful paired opening reference would show the same camera **before** and **after** the first drag. For example, with total stocks `4π m` and `4π m²`, an already-paid radius-1 ward leaves `2π m` and `3π m²`; growing to radius 2 leaves zero of both. The opening must explain that the initial ward is part of the allocation. This is a proposed state for review, not an implemented witness.

The first hit should visibly change HP from 8 to 6; it must not imply an instant kill. With two HP per pip, that means exactly four total pips and three remaining. Numeric HP remains authoritative. Keep larger radius tied to reach only.

## Achievable browser camera and composition

- Start with one fixed, high oblique camera at roughly 36–42° elevation. Orthographic projection is a reasonable candidate for a stable ground-plane drag and predictable touch sizing; a restrained perspective camera also works. Choose one through a small interaction test, not a camera-control panel.
- Give the first ward about 40–50% of the useful scene width, with its plant below center, the entrance at the left edge and the core in the right third. Keep the full maximum foundation and drag grip supported and visible. The active ring, enemy and core have priority over architecture.
- This close composition cannot show the entire old 19 × 14 m board at its old coordinate scale. A compact first encounter, approximately 8–10 m of visible width, can support the pictured radius-2 prominence. The route/core coordinates and combat timing need independent math review before they change. Do not shrink the visual disk independently of the simulator to force a match.
- Reveal the second plant with one deliberate wider framing, approximately 12–14 m of visible width, after the first success. Preserve orientation so the player recognizes the original plant. Reduced-motion users get an immediate camera change. Optional orbit comes later; it is never needed to reach a grip.
- Mobile needs its own composition: a compact top HUD, two vertically separated plants when relevant, and no bottom inspector covering the ground. A minimum 44 CSS-pixel grip hit area is a screen-space interaction target; it does not change the world-space radius. Put the drag readout above the finger.

The current frozen source camera `(4.1, 8.6, 9.8)` is a record of v1 work, not a camera decision for the rebuild.

## HUD and feedback that can be built directly

| Element | Browser implementation and limit |
|---|---|
| Core health and progress | A small top strip; a distinct seed icon and exact health. Use the actual health scale, not an invented image value. |
| Two independent stocks | Spool/line symbol with metres; tile/disk symbol with square metres. Different shapes and labels, not color alone. Remaining amounts can update in place. |
| Active drag | One gold grip with a grab state; attach `r`, `C` and `A` to its plant only during interaction. Hebrew layout with isolated LTR quantities. Do not move the label through the finger or enemy. |
| Budget limit | Stop the disk at the affordable radius, give a brief tactile/visual boundary response and identify which stock binds. Avoid a detached error message requiring the player to look away. |
| Range and shot | One exact translucent disk with a clear green rim. Instant authoritative damage; a short cosmetic bolt and localized recoil show the effect. No outside-range target is permitted. |
| Leak | One ghost route, one gap marker and a core damage response. A large rewind replaces other momentary actions during recovery. |
| Rewind | Restore the reviewed checkpoint including enemies, time, HP, radius stocks and cooldowns. Preserve retry/help evidence separately. Its exact anchor still needs a design decision. |
| Pause/mute and keyboard | Small secondary controls. Keyboard selects a plant and changes its radius without returning a permanent form to the primary flow. |

Ring resizing can preserve turret cooldowns, as the plan requires. It will still let players move scarce reach between attacks; that behavior should be tested as the intended decision, not accidentally treated as a cooldown reset exploit. The browser must distinguish a resource-limited drag from an unresponsive control.

## Asset plan: reuse the two paid models

| Asset | Existing source / achievable treatment |
|---|---|
| Thorn defense | Reuse `public/assets/thorn-crown.glb`. It has an ochre floral crown, fern stem and cream base, but is not the exact luminous bud sculpture in the new images. A small original emissive accent and whole-object aiming/recoil are feasible. Do not claim a skeletal rig. |
| Invader | Reuse `public/assets/ink-beetle.glb`. Use whole-object route motion and a brief hit reaction. Accurate HP indicators and a restrained death effect matter more than additional creature models. |
| Core | A separate original procedural seed/petal sculpture, larger and brighter than a turret. Its silhouette must remain distinct without depending on gold color. No new Tripo task is needed. |
| Foundations and ward | Original procedural stone paving, an analytic ground disk, a calibrated ring and a single handle. Fully support every allowed radius. Background concentric paving must not look like another active reach boundary. |
| Garden enclosure | A few limestone facade/arch pieces below and outside the tactical plane, plus instanced cypress, ivy, flower and lily meshes. Place silhouette detail at the edges; keep the central action plane calm. |
| Feedback and HUD | Original procedural bolts, ghost route, grip halo, pips, stock symbols and DOM typography. Use real UI state; no mockup bitmap can stand in for the scene. |

No new model generation is proposed. The frozen GLBs are approximately 4.05 MB / 83,669 triangles for the plant and 3.87 MB / 88,482 triangles for the beetle. The attempted topology-preserving simplification reached an attribute-seam floor. Their cost must be measured in the actual small encounter. Share geometry/materials between instances; batch static foliage; use one modest shadow map and simple enemy contact shadows where needed. Avoid cinematic depth of field, dense particles or full-screen bloom that soften the ring or grip. The reference's horticultural richness is a direction, not a promise of identical browser detail.

## Image errors and decisions not to inherit

- Never copy the second image's out-of-range upper shot, extra beetles, arbitrary HP segmentation or perspective-derived radius ratios.
- Use deterministic authored routes/spawns and exact `Math.PI` transactions. The second frame's proposed radii `1.25 + 0.75` consume `4π m` and `2.125π m²`, leaving `0 m` and `1.875π m² ≈ 5.89 m²` from the stated budget. This arithmetic does not prove that the combat scenario works.
- A warm gold beam between defenses is not a new currency, range link, resource conversion or attack unless the design explicitly adopts it.
- Dense foliage and carved backgrounds cannot compensate for an unclear next action. First establish the usable before-drag state, the two-plant redistribution gesture and the rewind checkpoint.

A fresh human first-minute observation is still needed after those decisions and a small rebuilt interaction. Static approval, model loading and automation cannot demonstrate that the game is intuitive or enjoyable.
