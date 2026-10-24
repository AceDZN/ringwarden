# Rebuild reference versus actual gameplay

24 October 2026. The four [generated mockups](mockups/README.md) were created and reviewed before the approved rebuild. They are design targets. The files in `captures/` are actual browser output with corresponding simulator state, never generated replacements for gameplay.

[Actual capture index](captures/README.md).

## State comparison

The supplemental browser captures use 1672 × 940, the same landscape aspect and almost the exact 1672 × 941 reference viewport. The installed action-client capture uses 1280 × 720. Portrait control evidence uses 390 × 844.

| Target | Actual state to compare | Result |
|---|---|---|
| 00: actionable opening | One paid radius-1 plant, one 8/8 HP beetle, core 3/3; conduit 6.28 m and floor 9.42 m² remain | No placement form, commit or start-wave action. A radial gold cue and grip show the first gesture. |
| 01: first useful growth | Radius 2, both stocks zero; first shot leaves 6/8 HP at 2.65 s | The screenshot shows the bolt and target inside the true ground disk. Pointer-held costs are contextual; release hides them. |
| 02: second approach | Original plant retained at (0,0), radius 2; new plant at (0,2.2), grown to 1.25 | Remaining stocks 1.5π m / 2.4375π m², displayed 4.71 m / 7.66 m². Both can reach radius 2 without a hidden donor action. |
| 03: leak/recovery | Unchanged opening radius 1 leaks with 2 HP remaining; core 2/3 | Combat freezes, a blue ghost route shows the breach, and one recovery action retains the currently paid radii. |

Rounded radius/cost coefficients use “≈”; exactly represented values keep “=”. Material values and their units stay on one line in portrait.

The reference's imperfect pip segments and decorative enemy counts were not copied. Actual eight-HP enemies have four two-HP pips and a numeric HP label. The range is an analytic x,z disk; model bounds, projected pixels and reference proportions never define it.

## Problems found and corrected

The first production capture exposed incompatible indexed foliage batches, a faint ring and a cropped core. It was recorded as a failed snapshot. The final scene normalizes batched geometry, strengthens ring/grip contrast and gives the core headroom. Darker path strips and directional inlays make the approaches explicit. The beetle faces its route. A foreground cypress was moved outward after it briefly obscured the second entrance.

The grip, any rim edge and the plant body use the same resize gesture. The authoritative simulator clamps a raw radius request and provides a limit message. Resizing works during the leak freeze, matching the recovery copy. The second encounter retains the original plant's position and chosen radius instead of undoing the first success.

## Deliberate visual differences

The runtime garden uses broad limestone tiles and simpler procedural peripheral foliage. It does not reproduce the reference's dense sculpted architecture, painterly flowers, neon bloom or exact fantasy plant. The actual Thorn Crown and ink beetle are the two previously generated Chrome Tripo models, locally bundled and animated as whole objects. No extra generation was used to chase the reference.

The fixed camera prioritizes the full allowed disk, both approaches, the core and usable grips. Portrait turns along the route to use screen height. There is no camera-control prerequisite. Costs move above the active grip to keep the finger clear, rather than matching the reference's illustrative hand/label placement.

## Verification and limits

The installed action-client screenshot was opened and inspected, not merely saved. Native Chrome real-time pointer play also completed both encounters: opening clear, second-front leak, retained-plan recovery and thirteen total kills. A short native desktop frame sample during two live beetles observed a median 8.3 ms and p95 9.5 ms interval; this is not a mobile performance benchmark. See `captures/native-chrome-observation.json` and [the independent playtest record](PLAYTEST.md).

This is the approved short controls prototype. Two maximum-radius plants can hold the entire second encounter without further adjustment. Scarcity and continuing redistribution decisions are intentionally deferred. Automation cannot establish that the controls are intuitive to a fresh player, that the loop is fun or that it teaches the math. A fresh first-minute human playtest is the next content gate.
