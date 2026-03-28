---
work_package_id: "WP12"
title: "Supply Depot Scene"
lane: "planned"
depends_on:
  - "WP01"
phase: "Phase 3 - Scenes"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP12 — Supply Depot Scene

## Objective

Rewrite StoreScene as a Government Relief Camp where settlers receive supplies using government credits.

## Deliverables

### Supply Items

| Item | Description | Price (credits) |
|------|-------------|-----------------|
| Bullocks | Draft animals for clearing/plowing | From constants.ts |
| Food Rations | Rice, dal, flour | From constants.ts |
| Shelter Materials | Bamboo, thatch, rope | From constants.ts |
| Tools | Axes, plows, machetes | From constants.ts |
| Medicine | Quinine (anti-malaria), basic medical | From constants.ts |

### Visual Design

- Military-style tent/camp setting
- Government officer NPC (optional visual)
- Supply crates and sacks
- Inventory display with quantities and running credit total

### Interaction

- Increase/decrease quantity for each item
- Running total of credits spent
- Remaining credits displayed prominently
- Confirm purchase button

## Acceptance Criteria

- All 5 supply categories purchasable
- Credits deducted correctly from GameState
- Cannot overspend credits
- Scene transitions to SettlementScene
- No references to Matt's General Store or frontier trading posts
