# Actual gameplay captures

These PNGs are unedited screenshots of the production build at `http://localhost:4184/?test`, using local 3D models and the normal simulator. They are separate from the generated design references in `../mockups/`. Each PNG has a matching JSON state. Deterministic time stepping advances normal combat; no health, kills or victory state is injected.

| Capture | Input and state | Viewport |
|---|---|---|
| `00-actionable-opening` | Already planted radius 1, affordable stocks, 8/8 HP beetle | 1672×940 |
| `01-affordable-drag-first-hit` | Real pointer drag to radius 2; held contextual costs; first 6/8 HP hit at 2.65 s | 1672×940 |
| `04-second-approach-live` | Original radius 2 retained; keyboard grows new plant to 1.25; rounded cost correctly marked ≈ | 1672×940 |
| `08-two-approaches-defended` | Genuine leak, live correction, one retained-plan retry, then thirteen total kills | 1672×940 |
| `09-opening-leak` | Unchanged radius 1 leaks with 2 HP remaining; core 2/3; frozen recovery | 1672×940 |
| `11-touch-first-hit` | Real CDP touch start/move, radius 2, first 6/8 HP hit; release and pause checked afterward | 390×844 |
| `action-client-first-hit` | Installed develop-web-game action client; keyboard equivalent of opening growth | 1280×720 |

The touch gesture passed independently and in the final full runner, which uses a fresh temporary browser for mobile. The full desktop-and-touch run passed with twelve captures and no console/page/external-request errors; `browser-report.json` is its aggregate result. Details are in `../PLAYTEST.md`. `native-chrome-observation.json` records the lead's separate real-time native-pointer play and a short desktop frame sample from before the final peripheral-tree/text-only changes. That run did not use manual time.

No screenshot is proof of human enjoyment, intuitive first use or mathematical learning. See `../VISUAL_REVIEW.md` for comparison with the design targets and remaining differences.
