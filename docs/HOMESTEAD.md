# Surface architecture

- `homestead.js`: versioned local persistence, isolated vault/expedition escrow, idempotent settlement, atomic blueprint costs, wood cooldown by descent, season progression.
- `surface.js`: same canvas/pixel heroine as the cave; layered seasonal scenery and shared fauna controller. Surface interaction is paused by dialogs. Summer audio is procedurally synthesized and opt-in.
- Items append stable IDs 26–31: rhodochrosite, manganese, alloy, quicklime, aggregate, cement. Old item IDs and discovered specimens remain compatible.
- Each successful pickup/consumption synchronizes remaining bag contents into escrow. Death/return/reload settles it once. A new expedition bag receives at most two explicitly selected functional items; other warehouse materials remain available only for ground recipes and house costs.
- A fixed five-stage house changes the physical illustration while the remainder stays dashed. No freeform placing is implemented in this first version.
- Mining changes solid tiles directly, never applies gravity to rocks, and applies gravity only to detached ore/mushrooms/bouncers. Route overlays are invalidated and optionally replaced by worker-verified post-edit paths. Water fields are recomputed against the edited rock.
- Regression coverage: `verify-homestead.cjs`, existing collision/certificate, crafting, geode mining and worker/startup suites.

## Independent animated wildlife

`animals.js` owns six separately painted pixel atlases (rabbit, swallow, frog, squirrel, sheep, penguin), with eight cached frames per action. Each has an independent silhouette, palette and painter inspired by `raw_asset/` references; no species uses another species’ texture. Rabbit ears/feet, swallow wings/forked tail, frog breathing/leaps, squirrel curled tail/nibbling, sheep walking/grazing, and penguin flippers/waddle/blinks animate separately. Pixel primitives and atlas caching are drawing infrastructure only. Shared roaming AI handles idle/wander, boundaries and gravity, with per-species motion profiles. Feet are anchored to species-specific baselines and facing matches travel. No additional images or network requests are required at runtime.


## Chemistry and expedition loadout

Two individual functional items may be moved atomically from the warehouse into a new run; duplicate items occupy duplicate slots and arsenic remains capped at one. Remaining carried items settle back exactly once. Version 1 completed roofs/windows are grandfathered into version 2 six-stage progress; new construction follows foundation → frame → walls (20 timber) → gypsum wallboard → roof (30 timber) → glass. Rhodochrosite is concentrated in hydrothermal mineralization; hematite is widespread. High-furnace recipes support explicit coal input and retained hematite catalysts. Both fluorite variants yield HF and gypsum. HF removes one tile column for up to 20 rows, stops before any liquid or unloaded chunk, destroys affected props/ores without duplicate drops and invalidates route overlays. These are simplified game recipes.
