---
work_package_id: "WP01"
title: "Data Model Rewrite"
lane: "planned"
depends_on: []
phase: "Phase 1 - Foundation"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP01 — Data Model Rewrite

## Objective

Rewrite the core data model types and constants to reflect the Terai Trail settlement theme, replacing all Oregon Trail abstractions.

## Deliverables

### types.ts

- **Enums:**
  - `SettlementPhase` — Early Jungle, Clearing, Building, Farming, Established
  - `Season` — Spring, Summer, Monsoon, Autumn, Winter
  - `Weather` — Clear, Humid, Rain, HeavyRain, Storm, Fog
  - `WorkPace` — Steady, Strenuous, Grueling

- **Interfaces:**
  - `FamilyMember` — name, role (Sardar/Wife/Elder/Child), health, alive
  - `Supplies` — food, tools, medicine, shelterMaterials, bullocks, credits
  - `Milestone` — id, name, acresRequired, description, choices?

### constants.ts

- Terai color palette (jungle greens, earth tones, golden harvest)
- Government depot prices for all supply items
- Clearing rates per work pace
- `TOTAL_ACRES = 100`
- `START_YEAR = 1952`
- Season date ranges

### phase.ts (was biome.ts)

- `getPhase(acresCleared: number): SettlementPhase`
- `getSeason(month: number): Season`
- `getDangerLevel(phase: SettlementPhase, season: Season): number`

## Acceptance Criteria

- All enums and interfaces compile without errors
- No references to Oregon Trail concepts (miles, profession, biome) remain in these files
- Constants are used by downstream consumers (GameState, EventManager)
