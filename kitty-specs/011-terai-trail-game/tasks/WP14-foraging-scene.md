---
work_package_id: "WP14"
title: "Foraging Scene"
lane: "planned"
depends_on:
  - "WP06"
  - "WP08"
phase: "Phase 3 - Scenes"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP14 — Foraging Scene

## Objective

Rewrite HuntingScene as ForagingScene. Players gather food from the jungle through hunting and fishing, with danger from predators.

## Deliverables

### Foraging Targets

| Animal | Food (lbs) | Speed | Difficulty |
|--------|-----------|-------|------------|
| Wild boar | 100 | Slow | Easy |
| Chital (spotted deer) | 50 | Medium | Medium |
| Peafowl | 10 | Fast | Hard |
| Fish | Passive gather | N/A | Click on river |

### Danger Encounters

- **Tiger at night**: appears if foraging continues past dusk. Must defend or flee.
- **Snake encounter**: random cobra appearance. Quick-time dodge or take damage.

### Mechanics

- Same click-to-interact mechanic as original hunting
- Animals move across jungle clearing scene
- Time limit (daylight hours)
- Carry limit based on family strength
- Food added to GameState supplies on return

### Visual

- Jungle clearing with dense forest edges
- Animals enter from forest edges
- River section for fishing
- Day/night cycle during foraging session
- Family member figure with axe/spear

## Acceptance Criteria

- All 4 food sources are interactive
- Tiger and snake encounters trigger correctly
- Food collected updates GameState
- Cannot carry more than carry limit
- Scene returns to SettlementScene
- No references to hunting with rifles on the prairie
