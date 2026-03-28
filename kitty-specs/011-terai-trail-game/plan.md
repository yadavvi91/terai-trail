# Implementation Plan: Terai Trail Game

**Branch**: `011-terai-trail-game` | **Date**: 2026-03-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/kitty-specs/011-terai-trail-game/spec.md`

## Summary

Adapt the existing Oregon Trail engine (Phaser 3 + TypeScript + Vite) into "Terai Trail" — a settlement survival game about post-Partition Sikh refugees clearing Terai forests in Pilibhit, UP, India (1952). The core shift is from **journey** (miles traveled) to **settlement** (acres cleared). All visuals remain procedural (no sprites), all audio remains synthesized (no audio files).

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Phaser 3 (2D game framework), Vite (bundler)
**Storage**: In-memory singleton (GameState) — no persistence
**Testing**: Vitest (unit tests), Playwright (visual regression + E2E)
**Target Platform**: Browser (desktop, 1024x768 viewport)
**Performance Goals**: 60fps, all drawing procedural via Canvas/Graphics
**Constraints**: Zero external assets (no image files, no audio files)
**Scale/Scope**: 10 scenes, ~20 drawing functions, ~15 event types, 11 milestones

## Architecture Decisions

### Decision 1: Fork Strategy — Clone + Replace
The terai-trail repo starts as a clone of caulk-the-wagon. We systematically replace Oregon Trail content with Terai Trail content, one WP at a time. This preserves the proven engine (Phaser config, isometric math, parallax system, Web Audio plumbing) while replacing all game-specific content.

**Reuse as-is:** `isometric.ts` (coord transforms), `main.ts` (Phaser config), `MuteButton.ts`, `BootScene.ts` (loading screen), Vite/TS config
**Rewrite data model:** `types.ts`, `constants.ts`, `biome.ts→phase.ts`, `GameState.ts`, `TrailData.ts→MilestoneData.ts`, `EventManager.ts`
**Rewrite scenes:** All 10 scenes get themed rewrites (some light, some heavy)
**Rewrite drawing:** New flora/fauna/structures in DrawUtils + IsoDrawUtils
**Rewrite audio:** New melodies, SFX, ambience in SoundManager

### Decision 2: Core Gameplay Shift — Static Camera, Evolving Tiles
Oregon Trail scrolls the world past a moving wagon. Terai Trail keeps the camera mostly **static** and evolves the isometric tile grid over time — jungle tiles flip to cleared → plowed → planted → harvested. The parallax system shows seasonal changes instead of geographic movement.

**Implication for TravelScene→SettlementScene:** The largest rewrite. The scroll offset becomes a time/progress offset. Ground tiles change type based on `acresCleared / totalTiles` ratio.

### Decision 3: Test-First Approach
Unit tests (Vitest) for all game logic BEFORE implementation. Visual regression tests (Playwright) capture baseline screenshots at each scene to prevent the "mountains below carpet" class of bugs. Tests are WP04 and must complete before scene implementation begins.

## Project Structure

### Documentation (this feature)
```
kitty-specs/011-terai-trail-game/
├── spec.md          # Feature specification (done)
├── plan.md          # This file (done)
└── tasks/           # Work package kanban (next step)
    ├── README.md
    └── WP01-WP20.md # Individual work package prompts
```

### Source Code (repository root)
```
src/
├── main.ts                    # Phaser config (update scene list)
├── scenes/
│   ├── BootScene.ts           # Minor text changes
│   ├── TitleScene.ts          # Full rewrite — jungle background
│   ├── PartyCreationScene.ts  # Rewrite — Sikh family, origin districts
│   ├── StoreScene.ts          # Rewrite → DepotScene — govt relief camp
│   ├── TravelScene.ts         # Full rewrite → SettlementScene
│   ├── HuntingScene.ts        # Rewrite → ForagingScene
│   ├── RiverCrossingScene.ts  # Rewrite → MonsoonScene
│   ├── EventScene.ts          # Moderate rewrite — Terai events/moods
│   ├── LandmarkScene.ts       # Rewrite → MilestoneScene
│   └── GameOverScene.ts       # Moderate rewrite — victory/defeat theming
├── game/
│   ├── GameState.ts           # Rewrite — acres, phases, settlement flags
│   ├── EventManager.ts        # Full rewrite — Terai event table
│   ├── TrailData.ts           # Rewrite → MilestoneData.ts
│   └── Party.ts               # Minor — add role field
├── audio/
│   └── SoundManager.ts        # Moderate — Punjabi melody, jungle SFX
├── ui/
│   ├── DrawUtils.ts           # Heavy additions — Terai flora/fauna/structures
│   ├── IsoDrawUtils.ts        # Heavy additions — bullock cart, Sikh person, buildings
│   └── MuteButton.ts          # No change
└── utils/
    ├── constants.ts            # Full rewrite — Terai palette, prices, rates
    ├── types.ts                # Full rewrite — settlement enums/interfaces
    ├── biome.ts → phase.ts     # Rewrite — phases, Indian seasons
    └── isometric.ts            # No change

tests/
├── unit/
│   ├── GameState.test.ts      # Acres, starvation, milestones
│   ├── EventManager.test.ts   # Event weights, phase filtering
│   ├── MilestoneData.test.ts  # Milestone lookup, ordering
│   └── phase.test.ts          # Season/phase detection
├── visual/
│   ├── scene-loads.test.ts    # All scenes load without errors
│   └── baselines/             # Screenshot baselines for regression
└── e2e/
    └── full-game.test.ts      # Title → Settlement → GameOver flow
```

## Dependency Graph

```
WP01 (types/constants/phase) ─┬── WP02 (GameState/Milestones) ── WP03 (EventManager)
                               ├── WP04 (Test Infrastructure)
                               ├── WP11 (PartyCreation)
                               └── WP12 (SupplyDepot)

WP05 (landscape drawing) ─┬── WP10 (TitleScene)
WP06 (animal drawing)     ├── WP13 (SettlementScene) ← depends on WP01-WP09
WP07 (structure drawing)  ├── WP14 (ForagingScene)
WP08 (iso cart/person)    ├── WP15 (MonsoonScene)
WP09 (iso structures)     ├── WP16 (MilestoneScene)
                           └── WP17 (GameOverScene)

WP18 (Audio) ── independent, can parallelize
WP19 (E2E tests) ── depends on all
WP20 (Visual polish) ── depends on all
```

**Parallelizable groups:**
- **Group A** (data): WP01 → WP02 → WP03 (sequential)
- **Group B** (drawing): WP05, WP06, WP07, WP08 (all independent, can run in parallel)
- **Group C** (tests): WP04 (after WP01)
- **Group D** (scenes): WP10-WP17 (after Groups A+B complete)
- **Group E** (audio): WP18 (independent, anytime)
- **Group F** (polish): WP19, WP20 (last)

## Data Model Changes

### Enums
| Oregon Trail | Terai Trail | Values |
|-------------|-------------|--------|
| `Pace` | `WorkPace` | RESTING, STEADY, HARD_LABOR, GRUELING |
| `Weather` | `Weather` | CLEAR, HUMID, MONSOON_RAIN, FLOODING, DRY_HEAT, FOG |
| `Biome` | `SettlementPhase` | JUNGLE_CLEARING, FIRST_PLANTING, ESTABLISHED_FARM |
| `Season` | `Season` | SPRING, MONSOON, POST_MONSOON, WINTER |
| `Profession` (implicit) | `OriginDistrict` | LAHORE, SIALKOT, LYALLPUR |

### Interfaces
| Oregon Trail | Terai Trail |
|-------------|-------------|
| `Supplies { food, oxen, clothing, ammo, spareParts, money }` | `Supplies { food, bullocks, shelterMaterials, tools, medicine, governmentCredits }` |
| `Landmark { name, miles, isRiver, isFort, description }` | `Milestone { name, acresRequired, description, isCelebration }` |
| `PartyMember { name, health, status, disease }` | `FamilyMember { name, health, status, role, disease }` |

### Constants
| Oregon Trail | Terai Trail |
|-------------|-------------|
| TOTAL_TRAIL_MILES = 2000 | TOTAL_ACRES = 100 |
| Start date: Apr 1, 1848 | Start date: Mar 1, 1952 |
| MILES_PER_DAY: 10/20/30 | ACRES_PER_DAY: 0.3/0.5/0.8 |
| FOOD_PER_PERSON: 1/3/5 | FOOD_PER_PERSON: 1/3/5 (same pattern) |

## Verification Plan

1. **Unit tests pass** after each WP merge (`npm run test:unit`)
2. **Visual regression tests** capture baselines and detect layout regressions (`npm run test:visual`)
3. **E2E flow test** verifies Title → PartyCreation → Depot → Settlement → GameOver (`npm run test:e2e`)
4. **`npm run build`** passes at every merge point
5. **Playwright MCP** smoke-test in real browser for each scene implementation
