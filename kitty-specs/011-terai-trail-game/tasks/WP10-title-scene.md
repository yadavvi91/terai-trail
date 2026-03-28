---
work_package_id: "WP10"
title: "Title Scene"
lane: "planned"
depends_on:
  - "WP05"
  - "WP08"
phase: "Phase 3 - Scenes"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP10 — Title Scene

## Objective

Rewrite TitleScene with Terai jungle setting, animated bullock cart arrival, and historically contextualized menu.

## Deliverables

### Visual Elements

- Dense sal forest background filling the screen
- Shivalik hills visible in the far distance (blue-green haze)
- Narrow jungle path cutting through the forest
- Animated bullock cart arriving through the path (uses WP08 iso sprites)
- Ambient: birds, insects, swaying grass

### Title Text

- "THE TERAI TRAIL" — large, prominent
- "Settlers of Pilibhit" — subtitle
- "~ 1952 ~" — date marker

### Menu Options

1. **Begin Settlement** — starts new game flow (PartyCreation)
2. **About the Terai** — opens info panel

### About Panel

- Brief historical context: Partition of 1947, Sikh refugees, government settlement program in the Terai jungle
- Closes with any key or click

## Acceptance Criteria

- Title screen loads without errors
- Cart animation plays smoothly
- Menu options are responsive and navigate correctly
- About panel displays and dismisses properly
- No references to Oregon, America, or the western frontier
