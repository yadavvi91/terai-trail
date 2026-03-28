---
work_package_id: "WP15"
title: "Monsoon Scene"
lane: "planned"
depends_on:
  - "WP01"
  - "WP05"
phase: "Phase 3 - Scenes"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP15 — Monsoon Scene

## Objective

Rewrite RiverCrossingScene as MonsoonScene. Triggered during monsoon season (June-September), this is a survival challenge where the family must protect their settlement from flooding.

## Deliverables

### Trigger

- Fires during monsoon months (June-September)
- Probability increases with rainfall intensity
- Can trigger multiple times per monsoon season

### Player Choices

| Choice | Cost | Risk |
|--------|------|------|
| Reinforce shelter | Uses shelter materials | Low damage, materials consumed |
| Move to high ground | Lose 1-2 days of work | No material cost, lose progress time |
| Wait it out | Nothing | High risk of damage to shelter/crops/supplies |

### Visual Effects

- Heavy rain particle system (dense, angled)
- Rising water level animation
- Swaying sal trees in wind
- Lightning flashes
- Darkened sky
- Shelter taking damage (visual cracks/collapse if wait fails)

### Outcomes

- Reinforce: small material cost, shelter survives, minor health impact
- High ground: lose days, but family and supplies safe
- Wait: dice roll — could survive fine or lose supplies/shelter/health

## Acceptance Criteria

- Scene triggers only during monsoon months
- All 3 choices lead to distinct outcomes
- Visual rain/flood effects are dramatic
- Results update GameState correctly (materials, health, days)
- Returns to SettlementScene after resolution
- No references to river fording, ferry, or caulking the wagon
