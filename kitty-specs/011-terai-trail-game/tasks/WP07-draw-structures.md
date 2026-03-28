---
work_package_id: "WP07"
title: "Draw Structure Sprites"
lane: "planned"
depends_on: []
phase: "Phase 2 - Drawing"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP07 — Draw Structure Sprites

## Objective

Create new DrawUtils functions for Terai settlement structures that appear as milestones are reached.

## Deliverables

### New DrawUtils Functions

- **`drawThatchHut(graphics, x, y, scale)`** — Rectangular base with sloped thatch roof. Bamboo/mud walls. The primary shelter structure.
- **`drawWell(graphics, x, y, scale)`** — Stone or brick circular well with rope and bucket mechanism. Appears at 10-acre milestone.
- **`drawGurdwara(graphics, x, y, scale)`** — Sikh temple with characteristic dome (gumbad) and nishan sahib flag (triangular saffron flag on tall pole). Appears at 50-acre milestone.
- **`drawCropField(graphics, x, y, scale)`** — Rows of sugarcane or wheat. Alternating green/golden rows depending on season. Appears at farming phase.

### Each function supports:

- `scale` parameter for size variation
- Consistent art style with DrawUtils
- Seasonal color variants where applicable (crop field)

## Acceptance Criteria

- All 4 structure functions render recognizable buildings/features
- Gurdwara is visually distinct with dome and nishan sahib flag
- Crop field supports seasonal color switching
- Art style matches landscape and animal drawing functions
