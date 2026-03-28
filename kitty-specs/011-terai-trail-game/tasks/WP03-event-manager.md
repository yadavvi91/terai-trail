---
work_package_id: "WP03"
title: "Event Manager Rewrite"
lane: "planned"
depends_on:
  - "WP01"
  - "WP02"
phase: "Phase 1 - Foundation"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP03 — Event Manager Rewrite

## Objective

Complete rewrite of EventManager.ts with Terai-specific threats and positive events, dynamic weighting by phase and season, and one-time event support.

## Deliverables

### EventManager.ts

**Threat Events (base weights):**

| Event | Base Weight |
|-------|-------------|
| Malaria | ~20% |
| Tiger attack | ~8% |
| Snake bite | ~8% |
| Flood | ~6% |
| Smallpox | ~5% |
| Dysentery | ~5% |
| Elephant raid | ~5% |
| Monsoon damage | ~4% |
| Wild boar | ~4% |

**Positive Events (base weights):**

| Event | Base Weight |
|-------|-------------|
| DDT team visit | ~6% |
| Tharu help | ~6% |
| Refugee family joins | ~6% |
| Good harvest | ~5% |
| Government relief | ~5% |

**Dynamic weight modifiers:**
- Malaria weight increases during monsoon season
- Flood weight increases during monsoon season
- Tiger attacks more likely in early jungle phase
- Good harvest only in farming phase
- DDT event fires once only (uses `ddtArrived` flag from GameState)

**Methods:**
- `rollEvent(phase, season, flags): GameEvent | null`
- `getWeights(phase, season, flags): WeightedEvent[]`
- `applyEvent(event, gameState): EventResult`

## Acceptance Criteria

- Malaria is the most common threat
- DDT event never fires twice
- Weights shift correctly by phase and season
- All Oregon Trail events (broken axle, thief, etc.) are removed
