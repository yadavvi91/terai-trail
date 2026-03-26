---
work_package_id: WP01
title: Biome/Season Enums, Pure Functions & Color Palettes
lane: "doing"
dependencies: []
base_branch: main
base_commit: d1fd696ea21c01bb8622b675099fda290bcd656d
created_at: '2026-03-26T20:10:31.842115+00:00'
subtasks:
- T001
- T002
- T003
phase: Phase 1 - Foundation
assignee: ''
agent: "claude"
shell_pid: "50469"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-03-26T19:48:26Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
requirement_refs:
- FR-01
- FR-02
- FR-03
- FR-06
---

# Work Package Prompt: WP01 – Biome/Season Enums, Pure Functions & Color Palettes

## ⚠️ IMPORTANT: Review Feedback Status

Check `review_status` in frontmatter. If `has_feedback`, address the Review Feedback section below first.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

### Requirement Refs
- FR-01, FR-02, FR-03, FR-06

## Objectives & Success Criteria

Create all foundational data types, pure utility functions, and color constants for the
biome/weather/seasonal terrain system. No TravelScene changes in this WP.

- `Biome` and `Season` enums added to `src/utils/types.ts`
- `BIOME_COLORS` and `SKY_GRADIENTS` objects added to `src/utils/constants.ts`
- New file `src/utils/biome.ts` with three pure functions: `getBiome()`, `getSeason()`, `getMountainAlpha()`
- `npx tsc --noEmit` passes with zero errors
- Function return values are correct for boundary inputs

## Context & Constraints

**Implement with**: `spec-kitty implement WP01`

**Key files**:
- `src/utils/types.ts` — existing enums (`Weather`, `Pace`, `Rations`, `MemberStatus`). Add alongside.
- `src/utils/constants.ts` — existing constants (`COLORS`, `HEX_COLORS`, `GAME_WIDTH`, etc.). Add alongside.
- `src/utils/biome.ts` — **new file**. Zero Phaser dependency. Pure TypeScript only.

**Project rule**: All magic numbers and hex color values MUST go in `constants.ts`. The `biome.ts` file may only import from `types.ts` and `constants.ts`.

**Trail mile boundaries** (from `src/game/TrailData.ts`):
- 0 → 640 mi: Prairie (through Fort Laramie at 640)
- 640 → 1400 mi: Mountains (through Snake River Crossing)
- 1400 → 2000 mi: Oregon (Fort Boise through Willamette Valley)

**Season calendar** (game starts April 1, 1848):
- Month 3–4 (April–May): Spring
- Month 5–6 (June–July): Early Summer
- Month 7 (August): Late Summer
- Month 8+ (September+): Fall

---

## Subtasks & Detailed Guidance

### Subtask T001 – Add `Biome` and `Season` enums to `src/utils/types.ts`

**Purpose**: Provide typed biome and season identifiers for the whole codebase.

**Steps**:
1. Open `src/utils/types.ts`. Find the end of the existing enum block.
2. Add after the existing enums:

```typescript
export enum Biome {
    PRAIRIE   = 'PRAIRIE',
    MOUNTAINS = 'MOUNTAINS',
    OREGON    = 'OREGON',
}

export enum Season {
    SPRING       = 'SPRING',
    EARLY_SUMMER = 'EARLY_SUMMER',
    LATE_SUMMER  = 'LATE_SUMMER',
    FALL         = 'FALL',
}
```

**Files**: `src/utils/types.ts`
**Parallel?**: Yes — different file from T002.
**Validation**: TypeScript enum syntax. No imports needed (enums are self-contained).

---

### Subtask T002 – Add `BIOME_COLORS` and `SKY_GRADIENTS` to `src/utils/constants.ts`

**Purpose**: Centralise all biome/weather color values. Per project rules, no magic hex values in scene code.

**Steps**:
1. Open `src/utils/constants.ts`. Add after the existing `COLORS` and `HEX_COLORS` blocks.
2. Add `BIOME_COLORS` (import `Biome` and `Season` from types):

```typescript
import { Biome, Season } from './types';  // add to top of file if not present

export const BIOME_COLORS = {
    // Hill color pairs [primary, secondary] per biome
    HILL_COLORS: {
        [Biome.PRAIRIE]:   [0x3a8028, 0x2d7020] as [number, number],
        [Biome.MOUNTAINS]: [0x2d6428, 0x337030] as [number, number],
        [Biome.OREGON]:    [0x1e4a1a, 0x234520] as [number, number],
    },
    // Mountain back layer colors per biome (3 mountains)
    MOUNTAIN_BACK: {
        [Biome.PRAIRIE]:   [0x6a7ea8, 0x5a7098, 0x607898] as [number, number, number],
        [Biome.MOUNTAINS]: [0x6a7ea8, 0x5a7098, 0x607898] as [number, number, number],
        [Biome.OREGON]:    [0x2d5a27, 0x1e4a1a, 0x2a5225] as [number, number, number],
    },
    // Mountain front layer colors per biome (4 mountains)
    MOUNTAIN_FRONT: {
        [Biome.PRAIRIE]:   [0x4a6080, 0x506a88, 0x4a6080, 0x506a88] as [number, number, number, number],
        [Biome.MOUNTAINS]: [0x4a6080, 0x506a88, 0x4a6080, 0x506a88] as [number, number, number, number],
        [Biome.OREGON]:    [0x1a3a18, 0x223a20, 0x1a3a18, 0x223a20] as [number, number, number, number],
    },
    // Seasonal grass color for isometric ground tiles
    SEASON_GRASS: {
        [Season.SPRING]:       0x3a8028,
        [Season.EARLY_SUMMER]: 0x6a8028,
        [Season.LATE_SUMMER]:  0x8a7028,
        [Season.FALL]:         0x7a5020,
    },
    // Seasonal grass variations (for tile variation)
    SEASON_GRASS_ALT: {
        [Season.SPRING]:       [0x3a8028, 0x2d7020, 0x347530, 0x3a8028] as number[],
        [Season.EARLY_SUMMER]: [0x6a8028, 0x5a7020, 0x648028, 0x6a8028] as number[],
        [Season.LATE_SUMMER]:  [0x8a7028, 0x7a6020, 0x847028, 0x8a7028] as number[],
        [Season.FALL]:         [0x7a5020, 0x6a4018, 0x745020, 0x7a5020] as number[],
    },
} as const;
```

3. Add `SKY_GRADIENTS` (import `Weather` from types — already imported if it exists):

```typescript
import { Weather } from './types';  // already in types.ts

export const SKY_GRADIENTS: Record<Weather, { top: number; bottom: number }> = {
    [Weather.CLEAR]: { top: 0x0d3a6e, bottom: 0x70b4d8 },  // deep blue (current)
    [Weather.RAINY]: { top: 0x1a2030, bottom: 0x4a5a6e },  // dark grey-blue
    [Weather.HOT]:   { top: 0x1a3a5e, bottom: 0xd0a870 },  // pale blue → warm horizon
    [Weather.SNOWY]: { top: 0x7090a8, bottom: 0xc8d8e0 },  // white-grey
};

// Oregon biome sky overlay (applied on top of weather gradient)
export const OREGON_SKY_OVERLAY = { color: 0x4a6040, alpha: 0.35 } as const;
```

**Files**: `src/utils/constants.ts`
**Parallel?**: Yes — different file from T001.
**Validation**: TypeScript must compile. No `[BIOME.MOUNTAINS]` vs `['MOUNTAINS']` mismatch — use enum values as keys.

---

### Subtask T003 – Create `src/utils/biome.ts` with pure functions

**Purpose**: Provide `getBiome()`, `getSeason()`, and `getMountainAlpha()` as pure, Phaser-free functions. Any scene can import and call them.

**Steps**:
1. Create `src/utils/biome.ts`:

```typescript
import { Biome, Season } from './types';

/**
 * Returns the biome zone for a given mile marker on the trail.
 * Boundaries: Prairie 0–639, Mountains 640–1399, Oregon 1400–2000.
 */
export function getBiome(milesTraveled: number): Biome {
    if (milesTraveled < 640) return Biome.PRAIRIE;
    if (milesTraveled < 1400) return Biome.MOUNTAINS;
    return Biome.OREGON;
}

/**
 * Returns the season for a given calendar month (0-indexed, JS Date.getMonth()).
 * Game starts April 1 (month 3). Fall covers month 8 (September) through year end.
 */
export function getSeason(month: number): Season {
    if (month <= 4) return Season.SPRING;        // Apr (3) – May (4)
    if (month <= 6) return Season.EARLY_SUMMER;  // Jun (5) – Jul (6)
    if (month === 7) return Season.LATE_SUMMER;  // Aug (7)
    return Season.FALL;                          // Sep (8) +
}

/**
 * Returns mountain layer alpha (0–1) based on miles traveled.
 * Mountains fade in from mile 300 to 640 (prairie fade-in zone).
 * Before 300: invisible. After 640: fully visible.
 */
export function getMountainAlpha(milesTraveled: number): number {
    if (milesTraveled < 300) return 0;
    if (milesTraveled >= 640) return 1;
    return (milesTraveled - 300) / (640 - 300);
}
```

**Files**: `src/utils/biome.ts` (new file)
**Parallel?**: No — depends on T001 for enum imports.
**Validation**:
- `getBiome(0)` → `Biome.PRAIRIE`
- `getBiome(639)` → `Biome.PRAIRIE`
- `getBiome(640)` → `Biome.MOUNTAINS`
- `getBiome(1399)` → `Biome.MOUNTAINS`
- `getBiome(1400)` → `Biome.OREGON`
- `getMountainAlpha(0)` → `0`
- `getMountainAlpha(300)` → `0`
- `getMountainAlpha(470)` → `≈ 0.5` (within 0.01)
- `getMountainAlpha(640)` → `1`
- `getMountainAlpha(1000)` → `1`
- `getSeason(3)` → `Season.SPRING` (April)
- `getSeason(7)` → `Season.LATE_SUMMER` (August)
- `getSeason(9)` → `Season.FALL` (October)

---

## Risks & Mitigations

- **Enum key mismatch**: Using `[Biome.MOUNTAINS]` as object key requires the enum value
  (string `'MOUNTAINS'`) to match. TypeScript `Record<Biome, ...>` enforces exhaustive coverage.
- **Import cycle**: `biome.ts` imports from `types.ts`. `constants.ts` also imports from `types.ts`.
  No cycle since neither `types.ts` nor `constants.ts` import from `biome.ts`.

## Review Guidance

1. Run `npx tsc --noEmit` — zero errors required.
2. Manually verify boundary return values for `getBiome`, `getSeason`, `getMountainAlpha`.
3. Check that no hex values appear in `biome.ts` — all colors must be in `constants.ts`.
4. Check that `BIOME_COLORS` covers all `Biome` enum values (no missing key).
5. Check that `SKY_GRADIENTS` covers all `Weather` enum values.

## Activity Log

- 2026-03-26T19:48:26Z – system – lane=planned – Prompt created.
- 2026-03-26T20:10:35Z – claude – shell_pid=50469 – lane=doing – Assigned agent via workflow command
