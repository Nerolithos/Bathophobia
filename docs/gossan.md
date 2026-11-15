# 铁帽型铅锌氧化带 / Gossan Pb–Zn oxidation zone

- 深度 / Depth: 1120–1219 m, then every 500 m; measured from the expedition origin. Does not overlap the lava bands.
- Geometry: existing four–five cellular automaton and BFS/A* route certification. The biome changes material IDs only; it never fills air or adds flat platforms.
- Material 7: fine orange clay → item 48. Material 8: gently dipping, correlated horizontal hematite bands → existing hematite item 32. Materials 9/10 are a correlated 1–2-tile ochre-to-red clay staining halo on both sides; they still yield clay, and do not change collision. Global row coordinates keep both materials continuous across chunk boundaries.
- Water: no local springs; incoming streams terminate at the dry band, and reservoir writes reject all cells in it. Geodes, hydrothermal mineralization and carbonate stalactite generation are excluded there.
- Exclusive surface specimens: apatite (49), calcite (24), wulfenite (50), gypsum (35), cuprian adamite (51). All use supported dry ledges, contact pickup, the existing inventory, discovered silhouettes, storage and specimen cabinet paths.
- Per eligible ledge: 19% placement chance. Within those placements: 22% apatite, 40% calcite, 33.2% gypsum, 4% wulfenite, 0.8% cuprian adamite. These are gameplay frequencies, not geological abundance measurements. Cuprian adamite per-ledge rarity matches the existing peridot → demantoid replacement approximately.
- Existing IDs remain unchanged, including reserved architectural ID 47. Older 48-slot saves extend to 52 slots with zeros.

## Mineral terminology / 矿物资料

Apatite is a group name, represented by a yellow fluorapatite-like habit. Wulfenite is PbMoO₄, tetragonal, Mohs 2.75–3, and is a secondary mineral of oxidized lead deposits. Cuproadamite / cuprian adamite is a copper-bearing adamite variety, not an independent mineral species; it must not be conflated with zincolivenite. Its idealized composition is (Zn,Cu)₂(AsO₄)(OH).

The deep recurring biome is a game abstraction; the depth schedule is not an assertion about real modern oxidation profiles. Clay is a mixture with no unique mineral formula.

References:

- [Handbook of Mineralogy — Wulfenite](https://handbookofmineralogy.org/pdfs/wulfenite.pdf)
- [Handbook of Mineralogy — Fluorapatite](https://handbookofmineralogy.org/pdfs/fluorapatite.pdf)
- [Mindat — Copper-bearing Adamite](https://www.mindat.org/min-1174.html)

## Validation

`verify-gossan.cjs` covers repeat spacing, seed determinism, dry chunk seams and upstream inflow, preserved collision tiles, exclusive supported loot, real clay/hematite mining yields, relative rarity and old-save migration. `verify.cjs` replays certified multi-chunk descents through the first band for three seeds. `verify-geodes-mining.cjs` exercises the actual new-resource pickup, discovered catalogue and persistence entry points.

Developer art inspection: `/assets/mineral-studies/gossan-preview.html` (development server only). It renders the actual seeded terrain and generated surface mineral distribution; the specimen panels are enlarged art previews, not extra spawns.
