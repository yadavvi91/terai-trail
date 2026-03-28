---
work_package_id: "WP02"
title: "GameState and Milestones Rewrite"
lane: "planned"
depends_on:
  - "WP01"
phase: "Phase 1 - Foundation"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP02 — GameState and Milestones Rewrite

## Objective

Rewrite GameState.ts to track settlement progress (acres cleared, not miles traveled) and create MilestoneData.ts with the 11 settlement milestones.

## Deliverables

### GameState.ts

- Track `acresCleared` instead of `milesTraveled`
- `originDistrict` instead of `profession`
- Settlement flags: `shelterBuilt`, `wellDug`, `ddtArrived`, `cropsPlanted`
- Start date: 1952
- Methods: `clearAcres()`, `consumeFood()`, `checkMilestone()`, `updateHealth()`
- Singleton pattern preserved

### MilestoneData.ts (was TrailData.ts)

11 milestones in order:

| Acres | Milestone |
|-------|-----------|
| 1 | First Acre Cleared |
| 5 | Shelter Built |
| 10 | Well Dug |
| 20 | DDT Team Arrives |
| 30 | First Harvest |
| 40 | Tharu Alliance |
| 50 | Gurdwara Founded |
| 65 | School Built |
| 80 | Canal Dug |
| 90 | Market Road |
| 100 | Little Punjab Established |

- `getMilestone(acres: number): Milestone | null`
- `getNextMilestone(acres: number): Milestone`
- `getAllMilestones(): Milestone[]`

## Acceptance Criteria

- GameState initializes with 0 acres, 1952 date, all flags false
- Milestone lookup returns correct milestone at each threshold
- No references to miles, trail, or forts remain
