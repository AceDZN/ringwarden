# Curriculum scope and mathematical model

Ringwarden uses circle circumference and disk area as two independent construction costs. These are **Grade 7 prerequisites**, applied in a strategic 3D garden. The current slice does not assess complete cylinder surface area or volume.

The crew read the frozen Workbook snapshots supplied with the 24 October 2026 handoff. Runtime play needs no Workbook connection. No current live-page content is inferred from the snapshots.

| Frozen snapshot | Workbook source | Relevant content |
|---|---|---|
| `circle-circumference.json` | [Grade 7: היקף מעגל והמספר פאי](https://math.workbook.co.il/grade-7/chapter-8/circle-circumference) | Radius, diameter, `d = 2r`; circumference as length; `C = πd = 2πr`; π as an irrational constant. |
| `circle-area.json` | [Grade 7: שטח עיגול](https://math.workbook.co.il/grade-7/chapter-8/circle-area) | `A = πr²`; area differs from boundary length; square units. |
| `cylinder-definition-net.json` | [Grade 8: גליל ישר ופריסה](https://math.workbook.co.il/grade-8/chapter-9/cylinder-definition-net) | A disk is one circular base; a cylinder's side unfolds to a `2πr × h` rectangle. Context only. |
| `cylinder-surface-area.json` | [Grade 8: שטח מעטפת ושטח פנים של גליל](https://math.workbook.co.il/grade-8/chapter-9/cylinder-surface-area) | Side area `2πrh`, closed surface `2πrh + 2πr²`; count the physical surfaces. Context only. |

Snapshot location (read only): `/Users/acedzn/idea-plotter/reports/math-games-2026-10-24/curriculum/`.

SHA-256 provenance:

```text
circle-circumference.json   c2ab654b94b86ddc094c88403eb20e8943822cf2cbc880d1c87cf62570d98351
circle-area.json            284885971a60caf5a516bd524c03d8928342f2676002b736b6f715e357aa5a60
cylinder-definition-net.json 3430a7cecc656fda20365606a085757c90c65132ae46cec1977ef49026c2d395
cylinder-surface-area.json  18b50acbded1efc877451bfd2dbe6fae67695b44430c22fc1013114ad056e3cd
```

## What the game measures

- One horizontal world unit is one metre. A ward reaches a ground-plane disk in `x,z`; tower height is decorative and adds no budget term.
- A committed disk consumes conduit length `2πr` metres and floor material `πr²` square metres. These stocks cannot replace each other.
- Doubling radius doubles conduit and quadruples floor cost. A diameter control must describe that same disk through `d = 2r`.
- Each overlapping ward pays for its own complete foundation. Added foundation area is not the union of covered ground.
- Occlusion affects which targets a plant can shoot; it does not reduce the full circular construction price. The conduit boundary does not block beetles.
- Analytic distances and `Math.PI` define the rules. Perspective, mesh bounds, polygon perimeter, and rounded display values do not define measurements.
- The snapshots sometimes use `π ≈ 3.14` for exercises. The simulator uses `Math.PI`, retaining precision until display. The game must never label `3.14` or `22/7` as exactly π.

The two construction materials are deliberately **length and disk area**, not the lateral and total surface areas of a cylinder. Their different units remain visible. Plant height is not a disguised cylinder exercise.

## Decisions and evidence

The opening has equal-conduit alternatives: one radius-2 ward costs `4π m` and `4π m²`; two radius-1 wards cost `4π m` and `2π m²`. Their combat outcomes depend on placement, coverage duration, cooldown, and target distribution as well as cost.

Later waves change routes, sight lines, enemy timing, and available stocks. Construction, battle, leak inspection, full refunds between waves, and retry allow the player to revise a plan through visible consequences. A changed-layout rematch tests whether the previous arrangement transfers.

Capture committed sites/radii/types, both costs, actual leaks, help use, and retries. Preserve the first rematch attempt separately from later attempts. Automated success establishes that a rule path works; it does not establish enjoyment, mathematical understanding, or learning gains. A hinted or repeated win must not be reported as first-attempt unaided success.
