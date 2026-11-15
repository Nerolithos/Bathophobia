# 茶庭 / Tea garden

Walk past the left edge of the homestead to enter; walk past the garden’s right edge to return. Seasons, nighttime and surface storage are shared. Enter the completed tea house with E near its recessed door; the room starts empty. Tea-service furniture and harvesting are deferred.

The tea house, terraces and paths occupy 68% of their original design footprint and cluster on the left. The player keeps the normal surface sprite size. Door interaction and the interior walking range follow the compact footprint. The right side remains open for future structures. The construction group is rendered to a source pixel canvas and downscaled once with nearest-neighbour filtering; physics does not use the art canvas.

## Processing

Existing furnace fuel rules still apply: each heated operation consumes one coal or sulfur.

| Recipe | Inputs | Outputs | Station |
| --- | --- | --- | --- |
| Apatite acid processing | Apatite ×2 + sulfuric acid ×7 | HF ×2 + phosphate fertilizer ×3 + gypsum ×7 | High furnace |
| Roof tile | Orange clay ×2 + quartz ×1 | Roof tile ×1 | Furnace / high furnace |

New append-only IDs: 53 phosphate fertilizer, 54 roof tile. Fertilizer is depicted as white material in a sprout-labelled sack; tiles are rough grey U-shaped ceramic sheets.

## Tea-house construction

1. Foundation: cement ×10 + alloy frame material ×6.
2. Timber frame: timber ×20.
3. Cement walls: cement ×30.
4. Gypsum lining: gypsum wallboard ×30.
5. Timber roof: planks ×12.
6. Tile covering: roof tiles ×30.

Tea terraces: aggregate ×10 + phosphate fertilizer ×12. The terraces have connected hedge crowns, staggered stone retaining walls, moss, a clear stair and a separate foreground walking lane. The simple drying rack holds empty woven trays, not tea-service furnishings.

All completed construction expands to show every stage’s recipe without build buttons. Incomplete projects show only their current buildable stage, with completed steps available in a separate folded history.

## Existing base quantities

Materials and stage order are retained. Updated quantities: cement foundation ×10; load-bearing alloy ×8; walls/floors cement ×30 + treated planks ×20; lining wallboard ×30; roof treated planks ×24 + alloy ×2 + hematite ×5 + orpiment ×5; windows glass ×8. Existing completed stages remain completed and are not charged retroactively.

Save fields: `teaVisited`, `teaProgress` (0–6), `teaField`. Old saves default to an undiscovered, unbuilt garden. The full-build admin registry includes both the tea house and terraces; its garden button is isolated from normal saves.

Validation: `verify-tea.cjs` exercises recipe quantities, thermal gates, construction order and atomic costs, region crossings, no accidental cave entry, season/night preservation, compact door/room bounds and save migration. The UI regression verifies completed tea-house recipes remain readable without reconstruction controls.
