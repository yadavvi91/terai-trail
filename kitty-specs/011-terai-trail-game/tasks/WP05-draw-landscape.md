---
work_package_id: "WP05"
title: "Draw Landscape Elements"
lane: "planned"
depends_on: []
phase: "Phase 2 - Drawing"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP05 — Draw Landscape Elements

## Objective

Create new DrawUtils functions for Terai-specific landscape elements: sal trees, elephant grass, bamboo, Shivalik hills, and rolling Terai terrain.

## Deliverables

### New DrawUtils Functions

- **`drawSalTree(graphics, x, y, scale)`** — Tall straight trunk with dome-shaped canopy. Characteristic of the Terai sal forest.
- **`drawElephantGrass(graphics, x, y, scale)`** — Tall swaying grass clumps (6-8 feet). Used in jungle borders and uncleaned areas.
- **`drawBambooClump(graphics, x, y, scale)`** — Dense bamboo cluster with arching stems.

### Adapted Functions

- **`drawMountain` adapted for Shivalik hills** — Blue-green haze, lower profile, rolling silhouette (not sharp peaks). Used as distant background.
- **`drawHill` adapted for Terai terrain** — Gentle rolling terrain, lush green, used for mid-ground.

### Terai Color Palette Integration

- Jungle greens: deep emerald, moss, olive
- Earth tones: laterite red, mud brown
- Sky: humid haze, monsoon grey
- Water: murky green-brown (not clear blue)

## Acceptance Criteria

- All draw functions render without errors
- Landscape reads as "subtropical jungle" not "American prairie"
- Scale parameter works correctly for foreground/background placement
- Color palette is consistent across all landscape elements
