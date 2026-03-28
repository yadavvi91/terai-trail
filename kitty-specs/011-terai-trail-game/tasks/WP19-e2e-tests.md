---
work_package_id: "WP19"
title: "End-to-End Test Suite"
lane: "planned"
depends_on:
  - "WP10"
  - "WP11"
  - "WP12"
  - "WP13"
  - "WP14"
  - "WP15"
  - "WP16"
  - "WP17"
phase: "Phase 4 - Polish"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP19 — End-to-End Test Suite

## Objective

Full Playwright E2E test suite covering the complete game flow, event interactions, milestone triggers, and visual regression baselines.

## Deliverables

### Scene Flow Tests

- Boot -> Title -> PartyCreation -> Depot -> Settlement -> GameOver
- Complete happy path: start game, clear 100 acres, victory
- Defeat path: run out of food, family dies
- Navigation: all scene transitions work correctly

### Event Interaction Tests

- Random events fire and display dialog
- Event choices update GameState correctly
- Malaria event frequency during monsoon
- DDT event fires only once

### Milestone Trigger Tests

- Each milestone triggers at correct acre count
- Choice milestones (DDT, Tharu) present options
- Victory milestone transitions to GameOver

### Visual Regression

- Baseline screenshots for every scene
- Title scene with animation
- Settlement scene at different phases (jungle, clearing, farming)
- Monsoon scene with rain effects
- Victory and defeat scenes

### Console Error Monitoring

- No console errors during complete playthrough
- No unhandled promise rejections
- No Phaser warnings

## Acceptance Criteria

- Full E2E suite passes on CI
- Visual baselines captured for all scenes
- Zero console errors during test runs
- Test suite completes in under 2 minutes
