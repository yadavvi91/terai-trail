---
work_package_id: "WP17"
title: "Game Over Scene"
lane: "planned"
depends_on:
  - "WP05"
  - "WP07"
phase: "Phase 3 - Scenes"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP17 — Game Over Scene

## Objective

Rewrite GameOverScene with victory and defeat variants reflecting the Terai settlement narrative.

## Deliverables

### Victory Scene (100 acres cleared)

- Golden wheat fields stretching across the screen
- Gurdwara with nishan sahib flag flying prominently
- Family figures standing together
- "Little Punjab Established!" headline
- Settlement name displayed
- Year completed

### Defeat Scene (all family dead or starvation)

- Jungle reclaiming the cleared land (vines, grass overtaking)
- Tombstones / memorial markers in the clearing
- Sal trees encroaching from edges
- Somber tone

### Score Display

| Category | Points |
|----------|--------|
| Acres cleared | X / 100 |
| Survivors | X / 5 family members |
| Milestones reached | X / 11 |
| Crops harvested | Total food produced |
| Time taken | Months from start |

### Controls

- "Play Again" button (restart from Title)
- "View Settlement" button (optional: final state summary)

## Acceptance Criteria

- Victory and defeat scenes are visually distinct
- Score tallied correctly from GameState
- Play Again restarts cleanly (GameState reset)
- No references to Oregon, Willamette Valley, or pioneer legacy
