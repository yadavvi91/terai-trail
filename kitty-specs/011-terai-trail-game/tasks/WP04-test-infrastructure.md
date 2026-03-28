---
work_package_id: "WP04"
title: "Test Infrastructure"
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

# WP04 — Test Infrastructure

## Objective

Install and configure Vitest for unit testing and scaffold Playwright visual tests. Ensure all foundation modules have test coverage.

## Deliverables

### Setup

- Install Vitest as dev dependency
- Add `test` and `test:watch` scripts to package.json
- Configure vitest.config.ts with TypeScript support

### Unit Tests

**GameState tests:**
- Initialization: 0 acres, 1952 date, all flags false
- Acre clearing: increments correctly per work pace
- Food consumption: daily rate by family size
- Starvation: health declines when food is 0
- Milestone detection: triggers at correct acre thresholds

**EventManager tests:**
- Weight calculation for different phase/season combos
- Phase filtering: harvest events only in farming phase
- DDT flag: event fires once, then excluded from pool
- Malaria weight increases in monsoon

**MilestoneData tests:**
- Lookup returns correct milestone at each threshold
- Returns null between milestones
- Ordering is correct (1, 5, 10, 20, ... 100)

**phase.ts tests:**
- Season detection from month
- Phase detection from acres cleared
- Danger level calculation

### Playwright Visual Test Scaffolding

- Each scene loads without console errors
- Baseline screenshot capture for regression testing
- Test helpers for common navigation flows

## Acceptance Criteria

- `npm test` runs and passes all unit tests
- Playwright test scaffolding exists (can run once scenes are built)
- Code coverage report available
