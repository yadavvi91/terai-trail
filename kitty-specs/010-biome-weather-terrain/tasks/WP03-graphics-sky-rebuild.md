---
work_package_id: WP03
title: Graphics-Based Sky Rebuild with Weather-Reactive Gradients
lane: planned
dependencies: [WP01]
subtasks:
- T011
- T012
- T013
- T014
- T015
phase: Phase 2 - Core Rendering
assignee: ''
agent: ''
shell_pid: ''
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-03-26T19:48:26Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
requirement_refs:
- FR-04
---

# Work Package Prompt: WP03 – Graphics-Based Sky Rebuild with Weather-Reactive Gradients

## ⚠️ IMPORTANT: Review Feedback Status

Check `review_status` in frontmatter. If `has_feedback`, address Review Feedback section first.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

### Requirement Refs
- FR-04

## Objectives & Success Criteria

Replace the static `add.rectangle()` sky in `TravelScene.buildSky()` with a dynamic
`Phaser.GameObjects.Graphics` sky that redraws on weather or biome changes. Sun appears/hides
and changes size based on weather.

- Every weather type produces a visually distinct sky gradient
- Sun is visible (standard size) in CLEAR, larger in HOT, hidden in RAINY and SNOWY
- Oregon biome applies a grey-green overlay on the sky
- Sky updates within the same game day that weather changes
- `cameras.main.setBackgroundColor()` weather hack removed from `updateHUD()`

## Context & Constraints

**Implement with**: `spec-kitty implement WP03 --base WP01`

This WP is independent of WP02 — both modify `TravelScene.ts` but in different methods.
If implementing in parallel with WP02, be careful about merge conflicts in the class
property declarations section.

**Imports needed**:
```typescript
import { Weather } from '../utils/types';  // already exists
import { Biome } from '../utils/types';    // from WP01
import { SKY_GRADIENTS, OREGON_SKY_OVERLAY } from '../utils/constants';  // from WP01
```

**Existing sky code** (what we're replacing in `buildSky()`):
- 14 horizontal `this.add.rectangle(...)` calls building a gradient — REPLACE with Graphics
- `this.sunG = this.add.graphics()` + `drawSun(...)` — KEEP sunG, reuse it
- Cloud Graphics objects in `cloudLayers[]` — UNCHANGED
- `this.cameras.main.setBackgroundColor(0x0d3a6e)` — replace with `0x0d1a2e` dark fallback

**Existing weather hack to remove** (in `updateHUD()`):
```typescript
// DELETE THIS BLOCK from updateHUD():
const skyColors: Record<Weather, number> = {
    [Weather.CLEAR]: 0x0d3a6e, [Weather.RAINY]: 0x334455,
    [Weather.HOT]: 0x3a6090, [Weather.SNOWY]: 0x889aaa,
};
this.cameras.main.setBackgroundColor(skyColors[gs.weather]);
```

---

## Subtasks & Detailed Guidance

### Subtask T011 – Add `skyG: Phaser.GameObjects.Graphics` property

**Purpose**: Class-level Graphics object for the dynamic sky gradient, replacing static rectangles.

**Steps**:
1. In TravelScene class properties (near `sunG`), add:
```typescript
private skyG!: Phaser.GameObjects.Graphics;
```
2. Also track last weather for change detection in `dailyTick()`:
```typescript
private currentWeather: Weather = Weather.CLEAR;
```

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T012 – Replace `buildSky()` static rectangles with `skyG`

**Purpose**: Switch from static `add.rectangle()` strips to a single Graphics object.

**Steps**:
1. In `buildSky()`, BEFORE the loop that calls `this.add.rectangle(...)`:
   - Add: `this.skyG = this.add.graphics();`
2. DELETE the entire `for (let i = 0; i < skySteps; i++) { this.add.rectangle(...) }` loop.
3. DELETE the two horizon glow `this.add.rectangle(...)` lines.
4. After creating `this.skyG`, call `this.drawSkyGradient(gs.weather, this.currentBiome)`.
5. Keep `this.sunG = this.add.graphics(); drawSun(this.sunG, ...)` — UNCHANGED.
6. Keep the cloud Graphics objects — UNCHANGED.
7. In `create()`, change `this.cameras.main.setBackgroundColor(...)` to `0x0d1a2e` (safe dark fallback).

**Important**: `this.skyG` must be created FIRST in `buildSky()` so it renders below all other
layers (Phaser renders in creation order by default depth 0).

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T013 – Implement `drawSkyGradient(weather, biome)`

**Purpose**: Draw the 14-band sky gradient + Oregon overlay into `this.skyG`.

**Steps**:
1. Add private method:
```typescript
private drawSkyGradient(weather: Weather, biome: Biome): void {
    const gradient = SKY_GRADIENTS[weather];
    const topR = (gradient.top >> 16) & 0xff;
    const topG = (gradient.top >> 8) & 0xff;
    const topB = gradient.top & 0xff;
    const botR = (gradient.bottom >> 16) & 0xff;
    const botG = (gradient.bottom >> 8) & 0xff;
    const botB = gradient.bottom & 0xff;

    const skySteps = 14;
    const stripH = GROUND_Y / skySteps;

    for (let i = 0; i < skySteps; i++) {
        const t = i / (skySteps - 1);
        const r = Math.round(topR + t * (botR - topR));
        const gv = Math.round(topG + t * (botG - topG));
        const b = Math.round(topB + t * (botB - topB));
        this.skyG.fillStyle((r << 16) | (gv << 8) | b);
        this.skyG.fillRect(0, i * stripH, GAME_WIDTH, stripH + 2);
    }

    // Horizon glow (keep for Clear and Hot; skip for Rainy/Snowy)
    if (weather === Weather.CLEAR || weather === Weather.HOT) {
        this.skyG.fillStyle(0xf0c890, 0.18);
        this.skyG.fillRect(0, GROUND_Y - 12, GAME_WIDTH, 28);
        this.skyG.fillStyle(0xf0b060, 0.14);
        this.skyG.fillRect(0, GROUND_Y - 2, GAME_WIDTH, 14);
    }

    // Oregon biome: grey-green overlay on top of the weather gradient
    if (biome === Biome.OREGON) {
        this.skyG.fillStyle(OREGON_SKY_OVERLAY.color, OREGON_SKY_OVERLAY.alpha);
        this.skyG.fillRect(0, 0, GAME_WIDTH, GROUND_Y);
    }
}
```

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T014 – Implement `redrawSky()`

**Purpose**: Clear and redraw the sky graphics + update sun visibility and size.

**Steps**:
1. Add private method:
```typescript
private redrawSky(): void {
    const gs = GameState.getInstance();

    // Redraw sky gradient
    this.skyG.clear();
    this.drawSkyGradient(gs.weather, this.currentBiome);

    // Sun: visible for CLEAR and HOT; bigger for HOT
    const showSun = gs.weather === Weather.CLEAR || gs.weather === Weather.HOT;
    this.sunG.setVisible(showSun);
    if (showSun) {
        this.sunG.clear();
        const sunRadius = gs.weather === Weather.HOT ? 52 : 42;
        drawSun(this.sunG, GAME_WIDTH - 110, 80, sunRadius);
    }
}
```

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T015 – Hook `redrawSky()` into `dailyTick()` and remove weather hack from `updateHUD()`

**Purpose**: Sky updates when weather or biome changes. Stale camera bg hack removed.

**Steps**:
1. In `create()` after `buildSky()`, initialise `this.currentWeather`:
```typescript
this.currentWeather = GameState.getInstance().weather;
```
2. In `dailyTick()`, after the weather randomization block, add:
```typescript
const newWeather = gs.weather;
const newBiome = getBiome(gs.milesTraveled);  // reuse if WP02 already tracks this
if (newWeather !== this.currentWeather || newBiome !== this.currentBiome) {
    this.currentWeather = newWeather;
    // currentBiome updated by WP02's dailyTick hook (or update here if WP02 not merged yet)
    this.redrawSky();
}
```
**Note**: If WP02 and WP03 are implemented together, consolidate the biome/weather change
detection into a single block to avoid redundant `getBiome()` calls.

3. In `updateHUD()`, find and DELETE the `skyColors` block:
```typescript
// DELETE: const skyColors = { ... }; this.cameras.main.setBackgroundColor(skyColors[gs.weather]);
```

4. Ensure `this.cameras.main.setBackgroundColor(0x0d1a2e)` is set once in `create()` (dark fallback).

**Files**: `src/scenes/TravelScene.ts`

---

## Risks & Mitigations

- **Sky gradient visible gap**: If `skyG` doesn't cover full GROUND_Y, camera bg shows through.
  Solution: ensure `stripH + 2` overlap ensures no gap between strips.
- **`updateHUD()` still has sky hack**: TypeScript won't catch this — manually verify removal.
- **Sun redrawn when not needed**: `redrawSky()` redraws sun every time weather changes.
  Acceptable — weather changes only once per day tick.
- **Oregon overlay stacking**: If `redrawSky()` is called multiple times rapidly (shouldn't happen
  but test at 8x speed), Oregon overlay stacks. The `skyG.clear()` at start of `redrawSky()` prevents this.

## Review Guidance

1. `npx tsc --noEmit` — zero errors.
2. Browser console: `GameState.getInstance().weather = 'RAINY'` → dark grey sky, no sun.
3. `GameState.getInstance().weather = 'HOT'` → pale blue-warm sky, larger sun.
4. `GameState.getInstance().weather = 'SNOWY'` → white-grey sky, no sun.
5. `GameState.getInstance().weather = 'CLEAR'` → deep blue, sun visible at standard size.
6. Set miles to 1600 → green Oregon overlay visible on sky.
7. Confirm no `setBackgroundColor` call in `updateHUD()`.

## Activity Log

- 2026-03-26T19:48:26Z – system – lane=planned – Prompt created.
