---
work_package_id: "WP13"
title: "Settlement Scene (Core Gameplay)"
lane: "planned"
depends_on:
  - "WP01"
  - "WP02"
  - "WP03"
  - "WP04"
  - "WP05"
  - "WP06"
  - "WP07"
  - "WP08"
  - "WP09"
phase: "Phase 3 - Scenes"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP13 — Settlement Scene (Core Gameplay)

## Objective

THE BIG ONE. Rewrite TravelScene as SettlementScene — the primary gameplay screen. Instead of a scrolling trail, the player watches a static settlement evolve as jungle is cleared acre by acre.

## Deliverables

### Core View

- **Static camera** (no horizontal scrolling — settlement grows in place)
- **Evolving tile grid**: tiles transition from jungle to cleared to plowed to planted
- **Parallax background layers**:
  1. Far: Shivalik hills (slow drift)
  2. Mid: Sal forest wall (dense jungle border)
  3. Near: Settlement clearing (active area)

### Animated Elements

- Family figures chopping trees / plowing fields (uses WP08 iso sprites)
- Structures appear at milestone thresholds (uses WP09 iso structures)
- Weather particles: rain, fog, dust depending on season

### Daily Tick System

```
acresCleared += baseRate * seasonModifier * toolBonus * workPaceMultiplier
```

- Season modifier: monsoon slows clearing, dry season faster
- Tool bonus: axes/plows increase rate
- Work pace: steady/strenuous/grueling (affects health)

### HUD Elements

| Element | Display |
|---------|---------|
| Date | Month, Year (e.g., "March 1952") |
| Season | Current season name |
| Phase | Settlement phase |
| Progress | "XX / 100 acres" with progress bar |
| Food | Quantity + days remaining estimate |
| Tools | Quantity |
| Medicine | Quantity |
| Health | Family health status (color-coded) |

### Controls

- Work pace selector (Steady / Strenuous / Grueling)
- Forage button (goes to ForagingScene)
- Rest button (skip day, recover health)
- Status button (detailed family view)

### Event Integration

- Random events trigger from EventManager (WP03)
- Events pause the daily tick and show dialog
- Milestone events transition to MilestoneScene

## Acceptance Criteria

- Settlement visually evolves as acres increase
- Daily tick advances date and clears acres
- Events fire at appropriate rates
- Milestones trigger scene transitions
- HUD displays all required information
- Game over triggers when all family members die or food runs out completely
- No scrolling trail or wagon movement
