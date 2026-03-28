---
work_package_id: "WP09"
title: "Isometric Structure Sprites"
lane: "planned"
depends_on:
  - "WP07"
phase: "Phase 2 - Drawing"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP09 — Isometric Structure Sprites

## Objective

Create isometric versions of settlement structures that appear on the tile grid as milestones are reached. Built on top of the 2D structure designs from WP07.

## Deliverables

### New IsoDrawUtils Functions

- **`drawIsoSalTree(graphics, x, y, scale)`** — Tall sal tree with dome canopy, isometric perspective. Used to fill unjungle tiles.
- **`drawIsoHut(graphics, x, y, scale)`** — Thatch/bamboo hut in isometric view. Rectangular base, sloped roof. Appears at shelter milestone.
- **`drawIsoField(graphics, x, y, scale, cropType)`** — Crop rows on isometric tiles. Supports sugarcane and wheat variants. Color shifts by season.
- **`drawIsoWell(graphics, x, y, scale)`** — Circular stone well with rope, isometric view. Appears at 10-acre milestone.
- **`drawIsoGurdwara(graphics, x, y, scale)`** — Gurdwara with dome and nishan sahib flag in isometric perspective. The landmark structure at 50 acres.

### Tile Grid Integration

- Each structure fits within the isometric tile grid
- Z-ordering support (structures behind render first)
- Tile states: jungle, cleared, plowed, planted, structure

## Acceptance Criteria

- All iso structures are visually consistent with each other
- Structures fit cleanly on the isometric tile grid
- Gurdwara is the most visually prominent structure
- Seasonal color variants work for crop fields
