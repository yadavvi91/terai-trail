---
work_package_id: "WP06"
title: "Draw Animal Sprites"
lane: "planned"
depends_on: []
phase: "Phase 2 - Drawing"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP06 — Draw Animal Sprites

## Objective

Create new DrawUtils functions for Terai wildlife used in foraging, events, and ambient scene decoration.

## Deliverables

### New DrawUtils Functions

- **`drawTiger(graphics, x, y, scale)`** — Stalking side view, orange with black stripes. Used in tiger attack events and defense mode in foraging.
- **`drawCobra(graphics, x, y, scale)`** — Raised hood, dark body. Used in snake bite events.
- **`drawWildBoar(graphics, x, y, scale)`** — Tusks visible, bristled back. Foraging target (100 lbs, slow).
- **`drawPeacock(graphics, x, y, scale)`** — Tail display fan, iridescent blue-green. Foraging target (10 lbs, fast).
- **`drawElephant(graphics, x, y, scale)`** — Indian elephant (smaller ears than African). Used in elephant raid events.
- **`drawMonkey(graphics, x, y, scale)`** — Langur monkey, grey body with dark face. Ambient/event decoration.
- **`drawMosquito(graphics, x, y, scale)`** — Stylized mosquito icon. Used as malaria event indicator.

### Each function supports:

- `scale` parameter for size variation
- Consistent art style with existing DrawUtils
- Facing direction (left/right) where applicable

## Acceptance Criteria

- All 7 animal functions render recognizable animals
- Each animal is visually distinct at game scale
- Scale parameter works correctly
- Art style is consistent (procedural vector, not pixel art)
