# Ringwarden — build handoff

Read `CREW_COMMON.md` first, including the exact human authorization. Build in **/Users/acedzn/dev/AceDZN-exp/ringwarden**, prepared public repo **AceDZN/ringwarden**, branch **main**. Dev **5184**, preview **4184**, strict ports. Reuse that repository; do not restart withdrawn games. Delegate actual visual/Chrome-Tripo and independent QA work as required by the common brief; the lead integrates and serializes regular main commits/pushes. Prepare a tested static Vercel-ready build; deployment is a later user decision.

## Identity and first minute

**High-strategy-camera 3D tower defense in an illustrated botanical stronghold.** Core actions: place, resize, commit, defend, inspect leaks, replant. Allocate independent boundary and floor stocks to circular wards; living defenses fight real enemy waves. No avatar, courier, walking robot, harbor, restoration station, quiz key or reusable five-mission template.

Visual thesis: cream stone terraces, fern floors, ochre thorn towers, luminous green conduits and ink-blue invading beetles. The garden dominates; high oblique camera, legible enemy silhouettes and restrained painterly lighting. Motion: circles visibly grow, plants turn/fire, beetles react. A compact HUD shows wave/core health, two stocks and selection; no dashboard.

First minute: select a site, resize its circular preview, compare conduit metres against floor square metres, commit a real plant and deliberately start a short wave. Watch enemies enter coverage and lose health. A leak remains visible; retry freely or revise between waves. No reading countdown or arithmetic input unlocks shooting.

Deliver one finite **five-wave defended garden**, about 5–10 minutes, plus a changed-layout rematch. Build phases are untimed; combat can pause. Win only after all scheduled enemies are resolved and the seed-heart survives.

## Authoritative math and construction

- One world unit = one metre. Ward reach is a horizontal `x,z` ground disk, not a sphere. `y` supplies visible depth/terrain; help explains the planar range model.
- Positive radius `r`, diameter `d=2r`; **C=2πr metres; A=πr² square metres**. Each ward atomically consumes C conduit and A floor. Doubling radius doubles boundary but quadruples area. Stocks never substitute for one another.
- Use calibrated procedural circles and analytic distance tests. Tripo bounds, polygon chord lengths, perspective and pixels never define measurements. Sites have explicit maximum radii; reject unsupported/clipped foundations rather than charging a full disk for another shape.
- Compute with `Math.PI`; round display only. Show symbolic/approximate costs and units. Declare a small world-unit numeric epsilon; never round each stock update. Radius/diameter controls must describe the same geometry.
- Preview/cancel/invalid placement costs nothing. Commit charges once. Selling/resizing is allowed only between waves with complete material recovery. Pause does not enable construction. Restart restores the wave-start snapshot; retain retry/hint evidence separately.
- Overlapping wards each pay their own full foundation costs; do not call summed areas unique union coverage. Conduit is a nonblocking boundary, not an invisible path wall.
- Terrain matters through sites, forks and explicitly shown shot occluders. An occluded part can be hatched without changing the priced full disk. Introduce unobstructed range before independent line-of-sight constraints.

## Combat and authored decisions

**Thorn Crown** attacks one visible in-range enemy at a declared damage/cooldown, targeting furthest route progress then stable ID. **Resin Bloom** temporarily slows enemies, with explicit expiry/capped stacking; it deals no damage. An all-slow garden cannot defeat a wave. Larger radius changes reach, not hidden damage.

Enemies have actual positions, speed, HP, route progress, death and core-arrival states. Author walkers, fast swarms and a tough slow beetle. Later forks use a deterministic announced route rule, not surprise randomness. Death/core damage/refunds occur once.

Wave progression: clear single lane; split approach; boundary-limited versus floor-limited rebuilding; swarm plus obvious occlusion; mixed final flank. Limit active plants/sites explicitly. Include multiple winning placements, an advertised failure and a rematch where repeating the old layout fails. Revisions must concern coverage, resources and combat, not a highlighted “correct” radius.

Intro witness seed: lane `(-6,0)` to `(6,0)`; sites `(0,0),(-1,0),(1,0)`; stocks `4π m`, `4π m²`. Thorn shots do 2 damage every second, initially ready; authoritative hits are instant, bolts cosmetic. Three walkers: 8 HP, 0.8 m/s, six-second spawn spacing. Center radius 2 gives five seconds of coverage, enough for four hits. Two radius-1 wards offer another damage handoff with equal conduit/lower floor cost; one radius-1 ward gives only 2.5 seconds and insufficient hits. Verify these traces in the implemented simulator before claiming feasibility. Every later wave needs independently checked success and failure witnesses, never injected victory.

## Curriculum and evidence

Read frozen snapshots at `/Users/acedzn/idea-plotter/reports/math-games-2026-10-24/curriculum/`:

- **Grade 7 prerequisites:** `circle-circumference.json` and `circle-area.json`, actual routes `https://math.workbook.co.il/grade-7/chapter-8/circle-circumference` and `https://math.workbook.co.il/grade-7/chapter-8/circle-area`.
- **Grade 8 applications:** `cylinder-definition-net.json` and `cylinder-surface-area.json`, actual routes `https://math.workbook.co.il/grade-8/chapter-9/cylinder-definition-net` and `https://math.workbook.co.il/grade-8/chapter-9/cylinder-surface-area`.

Label prerequisites honestly. This slice assesses circles, not complete cylinder surface area. Conduit is length, not wall area; floor is one disk, not a closed cylinder. π is not exactly 3.14 or 22/7; do not mix approximation conventions. Decorative tower height adds no hidden budget term.

Record committed centers/radii, both costs, leaks, help and first unaided rematch separately from retries. Changed binding resources must require a new plan. Kills alone do not prove understanding.

## Controls and completion

Pointer select/place, separate camera drag, radius handle; equivalent keyboard select/adjust/confirm/cancel and touch controls. Stable strategic camera, orbit/zoom/reset; selection never resets it. Circles, paths and core remain readable. Hebrew RTL UI; formulas/numbers/units isolated LTR. No color-only distinction between stocks.

Test circle costs/doubling, budget exhaustion, refunds, overlaps, range versus occlusion, cooldown/slow, enemy routes, pause/restart, every wave witness and transfer. Browser-check normal build→wave→leak→revise→win with real Chrome-Tripo plant art, enemies, input/camera/resize and production preview. Follow CREW_COMMON for assets, mandatory crew, screenshots, public main commits and deliverables. Finish a playable defended scenario, not a garden editor.
