---
work_package_id: "WP20"
title: "Visual Polish and Consistency"
lane: "planned"
depends_on:
  - "WP10"
  - "WP11"
  - "WP12"
  - "WP13"
  - "WP14"
  - "WP15"
  - "WP16"
  - "WP17"
  - "WP18"
phase: "Phase 4 - Polish"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP20 — Visual Polish and Consistency

## Objective

Unify the visual presentation across all scenes with a consistent Terai color palette, seasonal transitions, UI consistency, and performance optimization.

## Deliverables

### Unified Terai Color Palette

- Audit all scenes for color consistency
- Apply single palette source from constants.ts across every scene
- Ensure jungle greens, earth tones, and sky colors are uniform

### Seasonal Transitions

| Season | Visual Character |
|--------|-----------------|
| Monsoon (Jun-Sep) | Lush greens, heavy rain, dark sky |
| Autumn (Oct-Nov) | Drying greens, golden edges |
| Winter (Dec-Feb) | Fog, muted colors, bare branches |
| Spring (Mar-May) | Fresh greens, flowers, clear sky |
| Summer (May-Jun) | Golden/dusty, heat haze |

- Smooth color transitions between seasons
- Ambient particle changes (rain -> dust -> fog)

### UI Consistency

- Button styles unified across all scenes
- Panel/dialog box styles consistent
- Text sizes and fonts standardized
- HUD layout consistent between Settlement, Foraging, Monsoon scenes

### Performance Optimization

- Texture atlas for repeated sprites
- Object pooling for particles
- Draw call optimization
- Target: 60fps on mid-range hardware
- Memory leak audit (scene shutdown cleanup)

## Acceptance Criteria

- All scenes use the same color palette
- Seasonal transitions are visually smooth
- UI elements look consistent across all scenes
- Game runs at 60fps without frame drops
- No memory leaks across scene transitions
