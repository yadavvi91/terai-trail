---
work_package_id: "WP11"
title: "Party Creation Scene"
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

# WP11 — Party Creation Scene

## Objective

Rewrite PartyCreationScene for a Sikh refugee family settling in the Terai, with origin district selection and family naming.

## Deliverables

### Family Roles

| Slot | Role | Notes |
|------|------|-------|
| 1 | Sardar (head of family) | Always male, turbaned |
| 2 | Wife | |
| 3 | Elder Parent | Mother or father-in-law |
| 4 | Child 1 | |
| 5 | Child 2 | |

- Each member has a name input field
- Default names provided (Punjabi names)

### Origin District Selection

Three cards, each with different starting bonuses:

| District | Bonus |
|----------|-------|
| Lahore | More government credits |
| Sialkot | More tools (axes, plows) |
| Lyallpur (Faisalabad) | Better clearing rate |

- Visual card layout with district description
- Selected card highlighted

### Background

- Terai jungle scene behind the UI panels
- Consistent with title scene aesthetic

## Acceptance Criteria

- All 5 family members can be named
- Origin district selection affects starting GameState
- Scene transitions correctly to Supply Depot
- No references to banker/carpenter/farmer professions
