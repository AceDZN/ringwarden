# Independent rebuild mockup review

24 October 2026. Reviewed the three selected PNGs with `view_image`, their exact prompts, README/manifest, and `PLAN.md`. This is a static design review, not a player observation or a claim of fun. Implementation remains frozen. No game code, tests, browser actions, models, or Git changes were made for this review.

## What reads immediately

| Mockup | Independent reading |
|---|---|
| 01 — first gesture | The gold grip and hand identify an interaction; the plant-to-beetle shot and HP label identify a hit. Removing the inspector and setup ceremony is a substantial improvement. The curved arrow follows the ring, however, and can suggest rotation rather than radial growth. A still image shows the successful result, not yet the action that caused it. |
| 02 — live defense | Two defended approaches, a kill, incoming pressure and shared resources read clearly. The material motes suggest a relationship between plants. The actual transfer operation does not read: which ring must change first, and what happens when the selected ward cannot grow? |
| 03 — recovery | Strongest one-glance story: uncovered route, damaged core, and one dominant rewind action. Keep this hierarchy. The post-rewind state still needs a clear contract: return the same encounter immediately, provide time to adjust, and require no repeated setup or confirmation. |

The plant and core share a luminous gold flower silhouette. Make the shooting plant a distinctly low, thorny form and the protected seed-heart a distinctly tall core. Keep foliage outside the path/handle silhouettes. Use a radial gesture arrow aligned from plant center through grip; avoid adding more competing arrows or controls.

## Two currently unavailable actions

**01 invites “drag to expand” with `0 m / 0 m²` remaining.** That is a correct *after* state for a radius-2 ward, but a dead end as the first interactive frame. Specify a separate before state with spare materials and an enemy outside the initial ring. After the useful drag and hit, remove the expansion cue. The first action must actually be affordable.

**02 invites growing the upper ward with zero conduit remaining.** Under the plan, the player must shrink the other ring first, then grow this one. The image emphasizes only the receiver's grip. This recreates a hidden prerequisite beneath a simpler-looking UI. Decide and depict the contract before rebuilding: either explicitly teach the two-step shrink/grow operation with both handles visible, or design one direct transfer gesture with exact C/A consequences. Material motes alone do not explain an interaction.

The known generated range, HP-pip and enemy-count errors are already documented in the mockup README and must not become rules. They do not resolve the interaction gaps above.

## Does live resizing change the game?

It can make allocation tactile and consequential, but real-time editing alone can retain the same allocation puzzle. If one balanced static layout wins, the player still configures once and watches. If threats demand continual tiny corrections, the result can become repetitive ring maintenance.

Instant full refunds also allow lending maximum reach to each ready plant for a shot, then immediately shrinking it. Preserving cooldown prevents extra shots; it does not prevent this resource-sharing tactic. Decide whether that is intended skillful play or an exploit. Do not silently add firing delays to suppress it: that would weaken the promised immediate consequence.

## Smallest useful 60-second prototype

Use one fixed camera, one clear lane initially, two existing plants at most, one beetle type, four legible HP pips, the two material gauges, pause and rewind. Keep formulas available contextually; the first gesture should emphasize reach and the hit.

- **0–15 s:** An affordable radius drag changes an enemy from outside to inside range; one hit visibly removes one pip. No setup button or developer explanation.
- **15–35 s:** Reveal the second approach and demonstrate the chosen transfer operation once. Announce approaching pressure early enough for a deliberate drag.
- **35–50 s:** Shift pressure between approaches. Observe whether the player changes coverage for a visible reason, leaves a successful static compromise, or discovers instantaneous reach lending.
- **50–60 s:** If a leak occurs, offer rewind and the same decision immediately. Do not force an otherwise successful player to fail to satisfy the storyboard.

Observe first useful action/time, wrong gestures, resource-zero stalls, whether the hit and leak are explained correctly, and whether recovery needs developer help. Ask whether the player wants another skirmish. Compare a static compromise and rapid reach lending with ordinary play before expanding content. The hypothesis to test is **“moving reach in response to a threat feels clear and worth doing,”** not merely “the radius control works.”
