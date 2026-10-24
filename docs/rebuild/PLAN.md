# Ringwarden rebuild — flow before features

24 October 2026. The owner rejected the first prototype's gameflow and controls: confusing, unintuitive, boring, and difficult because of interaction rather than mathematics. The old five-wave simulator checks do not contradict that experience. Implementation and production QA of v1 stopped immediately. This is a new working design, not an accepted or tested fun claim.

## First-minute goal

The player sees a beetle, a living defense and the seed-heart immediately. Within five seconds, one obvious, affordable drag grows a ward until the plant can hit. Opening state is radius 1 with 2π m conduit and 3π m² floor remaining from 4π/4π stocks, so radius 2 is affordable. No form, site index, separate commit or start-wave ceremony. The player should be able to explain the cause of the hit and a leak without reading help.

Approved direction: lively active plant defense. The owner said “ok. proceed” after reviewing the proposed loop and generated gameplay mockups. The short first-minute proof loop is implemented. Rule, desktop and touch verification are recorded in PLAYTEST.md; the human first-minute acceptance below remains open.

## One gesture, one consequence

- Start with an existing plant and a beetle approaching it. One large, inviting rim grip is the first affordance. Show one short contextual cue.
- Drag the glowing boundary to grow or shrink its true horizontal disk. Radius and both stocks update together. No separate radius/diameter fields, slider, confirm button or numbered site tray in the main flow.
- Growth is live during combat; shrinking returns exact materials. Preserve cooldowns when resizing so oscillating a ring cannot create free shots. Stocks remain independent, using `Math.PI` and exact C/A transactions.
- Plants attack automatically. The player's activity is redistributing reach as the pressure shifts, rather than waiting through a locked editor/battle cycle. Introduce a second plant only after the first visible success. The second encounter grants enough stock to grow both defenses; no donor-shrink prerequisite is hidden in the opening.
- Keep the initial camera fixed and correctly framed. Orbit is optional later, not a prerequisite or a row of first-screen controls. Touch uses the same drag. Provide clear keyboard equivalents after the basic loop works.
- A leak leaves a ghost route that points to the coverage gap. Offer one immediate rewind; do not make the player repeat setup. Keep help/retry evidence separate.

## Sequence to prototype

| Seconds | Action and consequence |
|---|---|
|0–5|Already in the garden. One beetle approaches one plant. The rim grip and a short cue indicate the only new action.|
|5–15|Player grows reach. A thorn visibly hits the beetle; HP pips disappear, the beetle recoils. Costs stay near the active gesture.|
|15–25|Plant blooms after the kill. A new approach becomes visible, and a second defense becomes relevant.|
|25–40|Grow a second defense against the new approach, with enough materials for both. Boundary length and floor area drain at different rates; scarcity/redistribution comes only after the player knows the gesture.|
|40–50|An optional mistaken allocation produces a visible leak, a ghost path and one rewind action.|
|50–60|Revise the same encounter and see the changed outcome. Then take a breath before the next short skirmish.|

This sequence describes a testable experience, not a countdown the player must obey. Tuning waits for an actual human first-minute playtest. Do not expand another five-wave campaign until the basic interaction is understandable and engaging.

## HUD and feedback budget

Keep only seed-heart health, the two distinctly shaped material gauges, progress, pause/mute. During a drag, show reach and the two exact costs at the plant. Formula/detail explanation is contextual, not a permanent inspector. The garden, attacks and enemies dominate. Use clear enemy entrances, a conspicuous core, plant growth, hit recoil, readable HP and satisfying kill/bloom effects. No extra ability bar or currency is introduced to cover weak flow.

## Images before implementation

Generate separate gameplay references for the active first gesture, the two-ward resource fight, and a leak/rewind. They must be achievable Three.js scenes and functional UI, not cinematic posters. Preserve their exact prompts and label them generated design targets. Compare the rebuilt browser at the same state/viewport and record deviations. Existing paid Tripo plant/beetle work may be reused if it fits; no more model submissions during replanning.

## Acceptance before content expansion

A fresh human player should discover the first useful action without instruction from the developer, see a hit within seconds, understand a leak, and recover through one obvious action. Watch where they hesitate. Ask whether they want another skirmish. Automation can verify rules, inputs and recovery; it cannot establish that these goals have been met or that the game is fun.

## Crew review correction

Independent visual and QA review found that the first proposed frames invited growth with empty conduit and obscured a donor-shrink prerequisite. The actionable opening is now a separate pre-growth frame with nonzero sufficient stocks and a straight radial arrow. The first two-plant encounter also has sufficient material. Direct particle bridges suggesting a separate transfer gesture are removed. Tight resource allocation is deferred beyond the first-minute control test. See QA_REVIEW.md and VISUAL_BREAKDOWN.md for the independent critiques; their findings are not implementation acceptance.
