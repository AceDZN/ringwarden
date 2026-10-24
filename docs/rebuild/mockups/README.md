# Rebuild gameplay mockups

Built-in image_gen, 24 October 2026. These are proposed **generated design references**, not actual software screenshots, tested controls or proof of fun. No rebuild implementation was changed while they were generated. Exact prompts are linked below; selected-image hashes are in [manifest.json](manifest.json). `-draft` files are superseded history.

|Selected frame|Experience|Exact prompt|
|---|---|---|
|[00 Actionable opening](00-actionable-opening.png)|One obvious grip, radius 1, approaching enemy outside reach, enough stock to grow.|[Opening prompt](00-actionable-opening.prompt.txt)|
|[01 First successful gesture](01-first-gesture.png)|Radius 2 after growth, visible hit, sparse HUD, contextual costs; both stocks now 0.|[Original](01-first-gesture.prompt.txt),[geometry correction](01-first-gesture-correction.prompt.txt)|
|[02 Live defense](02-live-defense.png)|A second approach and enough resources to grow both defenses; no hidden donor-shrink prerequisite.|[Original](02-live-defense.prompt.txt),[affordability/flow correction](02-live-defense-correction.prompt.txt)|
|[03 Leak and recovery](03-leak-recovery.png)|Ghost trail explains the coverage gap; core 2/3; one rewind action.|[Recovery prompt](03-leak-recovery.prompt.txt)|

## Authoritative intended state

- **00:** initial 4π m/4π m², one radius 1 ward spends 2π m/π m², leaving approximately 6.28 m/9.42 m². Radius 2 is affordable.
- **01:** that ward has grown to radius 2, spending 4π m/4π m² in total; remainder 0/0. This is an outcome frame, not the actionable opening.
- **02:** new encounter budget 8π m/8π m²; wards radius 2 and 1.25 spend 6.5π m/5.5625π m². Remainder 1.5π≈4.71 m and 2.4375π≈7.66 m². Enough remains to grow the second ward to 2.
- **03:** one radius 1 ward under 4π/4π budget, one leak, core 2/3. Recovery restarts the encounter and retains the current paid radii.

## Crew review and response

[Independent QA](../QA_REVIEW.md) and [visual feasibility review](../VISUAL_BREAKDOWN.md) challenged the initial three frames. They correctly found the empty-gauge invitation, hidden donor-shrink prerequisite, ambiguous curved arrow and particle bridge. The lead added frame 00 and revised 02 to provide sufficient resources and remove transfer particles. Scarcity and live redistribution are deferred until the gesture is familiar. The original reviews predate these corrections; they do not certify the revisions or fun.

## Illustrated details that must not define the rules

The first draft shot outside its ring and drew a misleading previous-radius circle. Its selected correction moved the target inside and removed the dashed ring. The second draft also had an outside target, invented enemies and an unexplained transfer bridge; it is superseded.

Generated HP pip segmentation and projected circle proportions remain imperfect. Numeric states and actual analytic world geometry are authoritative. Frame 00's arrow is straight but not correctly radial; an actual drag affordance must stretch radially rather than imply rotation. Frame 02 drops material text labels during editing; actual HUD must include them, not rely on icon/color alone. Never copy an out-of-range hit or use a picture as a ruler. Decorative enemy counts are not spawn specifications.

Dense horticulture is art direction. The browser must prioritize readable attacks, useful controls and responsive frames; the existing GLBs are reusable but do not already match every sculptural detail. The player’s next action, response to a hit, understanding of a leak and wish for another skirmish require real observation. Static images do not establish gameplay quality.

See [the rebuild plan](../PLAN.md). The owner approved this direction with “ok. proceed”. The short two-approach prototype is implemented; actual browser captures and comparison are in [the visual review](../VISUAL_REVIEW.md). The generated references remain separate from gameplay evidence.
