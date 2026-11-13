# Surface architecture

- `homestead.js`: versioned local persistence, isolated vault/expedition escrow, idempotent settlement, atomic blueprint costs, wood cooldown by descent, season progression.
- `surface.js`: same canvas/pixel heroine as the cave; layered seasonal scenery and shared fauna controller. Surface interaction is paused by dialogs. Summer audio is procedurally synthesized and opt-in.
- Items append stable IDs 26–31: rhodochrosite, manganese, alloy, quicklime, aggregate, cement. Old item IDs and discovered specimens remain compatible.
- Each successful pickup/consumption synchronizes remaining bag contents into escrow. Death/return/reload settles it once. The cave always receives a new empty bag; the vault is only exposed to ground recipes and house costs.
- A fixed five-stage house changes the physical illustration while the remainder stays dashed. No freeform placing is implemented in this first version.
- Mining changes solid tiles directly, never applies gravity to rocks, and applies gravity only to detached ore/mushrooms/bouncers. Route overlays are invalidated and optionally replaced by worker-verified post-edit paths. Water fields are recomputed against the edited rock.
- Regression coverage: `verify-homestead.cjs`, existing collision/certificate, crafting, geode mining and worker/startup suites.

## Independent animated wildlife

`animals.js` owns six separately painted pixel atlases (rabbit, swallow, frog, squirrel, sheep, penguin), with eight cached frames per action. Each has an independent silhouette, palette and painter inspired by `raw_asset/` references; no species uses another species’ texture. Rabbit ears/feet, swallow wings/forked tail, frog breathing/leaps, squirrel curled tail/nibbling, sheep walking/grazing, and penguin flippers/waddle/blinks animate separately. Pixel primitives and atlas caching are drawing infrastructure only. Shared roaming AI handles idle/wander, boundaries and gravity, with per-species motion profiles. Feet are anchored to species-specific baselines and facing matches travel. No additional images or network requests are required at runtime.
