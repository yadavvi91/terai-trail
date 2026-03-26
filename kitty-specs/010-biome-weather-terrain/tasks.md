# Work Packages: Biome-Based Scenery & Weather Terrain

**Inputs**: `kitty-specs/010-biome-weather-terrain/`
**Prerequisites**: spec.md (user stories & requirements)

**Organization**: Fine-grained subtasks (`Txxx`) roll up into work packages (`WPxx`).
Each work package is independently deliverable. One commit per WP.

**Prompt Files**: Each WP references a matching prompt in `/tasks/`.

---

## Subtasks

| ID   | Description | WP | Parallel? |
|------|-------------|-----|-----------|
| T001 | Add `Biome` and `Season` enums to `src/utils/types.ts` | WP01 | Yes |
| T002 | Add `BIOME_COLORS` and `SKY_GRADIENTS` constants to `src/utils/constants.ts` | WP01 | Yes |
| T003 | Create `src/utils/biome.ts` with `getBiome()`, `getSeason()`, `getMountainAlpha()` | WP01 | No |
| T004 | Add `currentBiome` and `currentSeason` properties to TravelScene | WP02 | No |
| T005 | Add `drawMountainLayerForBiome(g, offsetX, biome)` replacing `drawMountainLayer()` | WP02 | No |
| T006 | Add optional `snowCap = true` param to `drawSoftMountain()` | WP02 | No |
| T007 | Add `drawHillLayerForBiome(g, offsetX, biome, season)` replacing `drawHillLayer()` | WP02 | No |
| T008 | Add `refreshParallaxLayers()` to clear+redraw all mtn/hill Graphics | WP02 | No |
| T009 | Hook biome/season change detection into `dailyTick()`, call `refreshParallaxLayers()` | WP02 | No |
| T010 | Add per-frame mountain alpha fade-in via `getMountainAlpha()` in `update()` | WP02 | No |
| T011 | Add `skyG: Phaser.GameObjects.Graphics` property to TravelScene | WP03 | No |
| T012 | Replace `buildSky()` static rectangles with `skyG` Graphics + `drawSkyGradient()` | WP03 | No |
| T013 | Implement `drawSkyGradient(weather, biome)` — 14-band gradient + Oregon overlay | WP03 | No |
| T014 | Implement `redrawSky()` — clear + redraw + sun visibility/size logic | WP03 | No |
| T015 | Hook `redrawSky()` into `dailyTick()` on weather/biome change; remove camera bg hack | WP03 | No |
| T016 | Add `WeatherParticle` interface, `weatherParticleG` Graphics, `weatherParticles[]` | WP04 | No |
| T017 | Implement rain particle spawning and streak drawing in `update()` | WP04 | No |
| T018 | Implement snow particle spawning and snowflake drawing in `update()` | WP04 | No |
| T019 | Implement heat shimmer band drawing in `update()` | WP04 | No |
| T020 | Flush weather particles when weather changes in `dailyTick()` | WP04 | No |
| T021 | Extract `drawGroundTiles(g, season)` from `buildGroundAndTrail()` | WP05 | No |
| T022 | Add `refreshGroundLayers()` to clear+redraw ground Graphics with season colors | WP05 | No |
| T023 | Hook season change into `dailyTick()` to trigger `refreshGroundLayers()` | WP05 | No |

---

## Work Package WP01: Biome/Season Enums, Pure Functions & Color Palettes (Priority: P0)

**Goal**: Establish all data types, pure utility functions, and color constants that every
other WP depends on. No TravelScene changes — pure utilities only.
**Independent Test**: `npx tsc --noEmit` passes. Functions return correct values:
`getBiome(0)=PRAIRIE`, `getBiome(700)=MOUNTAINS`, `getBiome(1500)=OREGON`,
`getMountainAlpha(200)=0`, `getMountainAlpha(470)≈0.5`, `getMountainAlpha(700)=1`.
**Prompt**: `/tasks/WP01-biome-season-functions.md`
**Estimated size**: ~280 lines

### Included Subtasks
- [x] T001 [P] Add `Biome` and `Season` enums to `src/utils/types.ts`
- [x] T002 [P] Add `BIOME_COLORS` and `SKY_GRADIENTS` constants to `src/utils/constants.ts`
- [x] T003 Create `src/utils/biome.ts` with `getBiome()`, `getSeason()`, `getMountainAlpha()`

**Requirements Refs**: FR-01, FR-02, FR-03, FR-06

### Implementation Notes
- T001 and T002 can be done in parallel (different files).
- T003 depends on T001 (imports Biome and Season enums).
- All magic numbers and color hex values MUST go in constants.ts per project rules.
- `biome.ts` must have zero Phaser dependency — pure TypeScript functions only.

### Dependencies
- None (foundation package).

### Risks & Mitigations
- Enum/constant values imported incorrectly → TypeScript will catch at compile time.

---

## Work Package WP02: Zone-Reactive Mountain & Hill Parallax Layers (Priority: P1)

**Goal**: Mountains and hills change color/style by biome zone. Mountain alpha fades in
across the prairie zone. The parallax system continues to scroll correctly after a redraw.
**Independent Test**: JS injection `GameState.getInstance().milesTraveled = 0` → no mountains visible.
Mile 400 → faint silhouettes. Mile 700 → full grey-blue peaks. Mile 1600 → green ridges, no snow.
**Prompt**: `/tasks/WP02-zone-mountain-hill-layers.md`
**Estimated size**: ~460 lines

### Included Subtasks
- [x] T004 Add `currentBiome` and `currentSeason` properties to TravelScene
- [x] T005 Add `drawMountainLayerForBiome(g, offsetX, biome)` replacing `drawMountainLayer()`
- [x] T006 Add optional `snowCap = true` param to `drawSoftMountain()`
- [x] T007 Add `drawHillLayerForBiome(g, offsetX, biome, season)` replacing `drawHillLayer()`
- [x] T008 Add `refreshParallaxLayers()` to clear+redraw all mtn/hill Graphics
- [x] T009 Hook biome/season change detection into `dailyTick()`
- [x] T010 Add per-frame mountain alpha fade-in in `update()`

**Requirements Refs**: FR-01, FR-02, FR-03, FR-07

### Implementation Notes
- Depends on WP01 for `Biome`, `Season`, `getBiome()`, `getSeason()`, `getMountainAlpha()`, `BIOME_COLORS`.
- CRITICAL: `refreshParallaxLayers()` calls `g.clear()` then redraws at local coords.
  Scroll position is preserved because `setPosition(baseX, baseY)` is a Graphics transform,
  not baked into the draw commands. Do NOT reset baseX/baseY during refresh.
- Mountain alpha is set per-frame in `update()` via `layer.g.setAlpha(getMountainAlpha(miles))`.
- `buildParallax()` must be updated to call `drawMountainLayerForBiome` and `drawHillLayerForBiome`.
- Do NOT change layer speeds, wrap logic, or baseX/baseY scroll math.

### Dependencies
- Depends on WP01.

### Risks & Mitigations
- Clear+redraw during active scroll could cause single-frame pop → test at 8x speed.
- Forgetting to reset baseX/baseY when refreshing → explicitly documented: do NOT reset.

---

## Work Package WP03: Graphics-Based Sky Rebuild (Priority: P1)

**Goal**: Replace the static `add.rectangle()` sky with a dynamic `Graphics`-based sky that
changes color per weather type and biome. Sun appears/hides and changes size per weather.
**Independent Test**: In browser console: `GameState.getInstance().weather = Weather.RAINY` →
dark grey sky, no sun visible. `Weather.HOT` → pale sky, larger sun. `Weather.SNOWY` →
white-grey sky, no sun. Oregon zone → grey-green overlay on base gradient.
**Prompt**: `/tasks/WP03-graphics-sky-rebuild.md`
**Estimated size**: ~350 lines

### Included Subtasks
- [x] T011 Add `skyG: Phaser.GameObjects.Graphics` property to TravelScene
- [x] T012 Replace `buildSky()` static rectangles with `skyG` Graphics + `drawSkyGradient()`
- [x] T013 Implement `drawSkyGradient(weather, biome)` — 14-band gradient + Oregon overlay
- [x] T014 Implement `redrawSky()` — clear + redraw + sun visibility/size logic
- [x] T015 Hook `redrawSky()` into `dailyTick()`; remove `cameras.main.setBackgroundColor` weather hack

**Requirements Refs**: FR-04

### Implementation Notes
- Depends on WP01 for `SKY_GRADIENTS` and `Biome` enum.
- `buildSky()` currently calls `this.cameras.main.setBackgroundColor(0x0d3a6e)` once,
  AND `updateHUD()` calls `this.cameras.main.setBackgroundColor(skyColors[gs.weather])`.
  The `updateHUD()` call must be removed; the camera bg is set once to `0x0d1a2e` in `create()`.
- `sunG` already exists as a class property. Reuse it — just call `sunG.setVisible()` and
  `sunG.clear()` + redraw `drawSun()` with the correct radius.
- `redrawSky()` is called from `dailyTick()` when weather OR biome changes (two triggers).
- Oregon overlay: a semi-transparent rect `fillStyle(0x4a6040, 0.35)` drawn after the gradient.

### Dependencies
- Depends on WP01. Independent of WP02 (different TravelScene methods).

### Risks & Mitigations
- Camera background fallback visible if skyG has gap → set camera bg once to safe dark color.
- `updateHUD()` skyColors map removal → ensure no other code references that map.

---

## Work Package WP04: Weather Particle System (Priority: P2)

**Goal**: Animated rain streaks, snowflakes, and heat shimmer appear during matching weather.
Particles drain naturally when weather changes. No impact on game performance at 60fps.
**Independent Test**: Set `GameState.getInstance().weather = Weather.RAINY` in console →
streaks appear within 1–2 seconds. Switch to `Weather.SNOWY` → rain stops (drains),
snowflakes appear. `Weather.HOT` → shimmer bands ripple at horizon. `Weather.CLEAR` → nothing.
**Prompt**: `/tasks/WP04-weather-particles.md`
**Estimated size**: ~380 lines

### Included Subtasks
- [x] T016 Add `WeatherParticle` interface, `weatherParticleG` Graphics, `weatherParticles[]`
- [x] T017 Implement rain particle spawning (4/frame, cap 150) and streak drawing
- [x] T018 Implement snow particle spawning (1/frame, cap 100) and snowflake drawing
- [x] T019 Implement heat shimmer band drawing (no pool, 4 rects per frame)
- [x] T020 Flush `weatherParticles = []` in `dailyTick()` when weather changes

**Requirements Refs**: FR-05

### Implementation Notes
- `weatherParticleG` is created AFTER `buildParallax()` in `create()` so it renders above
  sky and parallax layers but below the HUD. Creation order = render order in Phaser.
- Particle update logic runs unconditionally in `update()` (not just when `moving`).
  Rain and snow fall whether the wagon is moving or stopped.
- Use the existing `dustG` / `dustParticles` pattern as a template (see ~line 616 in TravelScene).
- Rain streaks: `lineStyle(1, 0x8aaabf, alpha)`, draw from (x,y) to (x+vx*0.02, y+length).
- Snow circles: `fillStyle(0xffffff, alpha)`, `fillCircle(x, y, 2)`.
- Heat shimmer: `fillStyle(0xffd080, 0.04 + rand*0.03)`, 4 horizontal rects near `GROUND_Y - 20`.
- Pool cap is enforced BEFORE spawning: `if (weatherParticles.length < 150) spawn`.

### Dependencies
- Depends on WP01 for `Weather` enum (already exists — no new import needed).
  Independent of WP02 and WP03.

### Risks & Mitigations
- Particles accumulate at high game speeds → pool caps enforced strictly.
- `weatherParticleG` depth order wrong → create it after parallax, before HUD.

---

## Work Package WP05: Seasonal Ground Tile Colors (Priority: P2)

**Goal**: Isometric ground tiles shift through spring-green → summer-gold → autumn-brown
as the in-game calendar advances. Ground layer wrapping and scroll behavior unchanged.
**Independent Test**: JS injection `gs.currentDate = new Date(1848, 7, 1)` (August) →
next daily tick makes ground tiles noticeably more golden/dry vs spring green.
**Prompt**: `/tasks/WP05-seasonal-ground-tiles.md`
**Estimated size**: ~260 lines

### Included Subtasks
- [x] T021 Extract `drawGroundTiles(g: Graphics, season: Season): void` from `buildGroundAndTrail()`
- [x] T022 Add `refreshGroundLayers()` to clear+redraw each ground Graphics with current season
- [x] T023 Hook season change detection into `dailyTick()` to call `refreshGroundLayers()`

**Requirements Refs**: FR-06, FR-07

### Implementation Notes
- Depends on WP01 for `Season` and `BIOME_COLORS.SEASON_GRASS`.
- Depends on WP02 for `currentSeason` property already tracked on TravelScene.
  (WP05 READS `this.currentSeason` — WP02 WRITES it. WP05 must come after WP02.)
- CRITICAL: Ground layer Graphics use `setPosition(baseX, baseY)` as a transform.
  `clear()` + redraw draws in local space — the scroll transform is unaffected. Do NOT reset
  `baseX`/`baseY` during refresh.
- `buildGroundAndTrail()` calls `drawGroundTiles(g, this.currentSeason)` instead of inlining.
- The `grassColors` array (currently hardcoded) is replaced by:
  `const baseGrass = BIOME_COLORS.SEASON_GRASS[season]` with slight variations.
- Trail brown and trail-edge colors do NOT change seasonally (they're dirt, not grass).

### Dependencies
- Depends on WP01, WP02.

### Risks & Mitigations
- Clear+redraw mid-scroll causes visual pop → same risk as WP02, same mitigation
  (dailyTick is infrequent, Phaser batches per frame).

---

## Dependency & Execution Summary

```
WP01 (enums, constants, pure functions)
  └─► WP02 (biome mountain/hill rendering)
  └─► WP03 (sky rebuild)              ← can run in parallel with WP02
  └─► WP04 (weather particles)        ← can run in parallel with WP02, WP03
        WP02
          └─► WP05 (seasonal ground)  ← needs currentSeason from WP02
```

**Parallelization**: After WP01: WP02, WP03, WP04 can run in parallel.
WP05 must wait for WP02.

**MVP Scope**: WP01 + WP02 + WP03 deliver the most impactful visual changes
(zone terrain + weather sky). WP04 (particles) and WP05 (seasonal ground) are
enhancement layers.

---

## Subtask Index

| ID   | Description | WP | P? |
|------|-------------|----|----|
| T001 | Add Biome + Season enums to types.ts | WP01 | Yes |
| T002 | Add BIOME_COLORS + SKY_GRADIENTS to constants.ts | WP01 | Yes |
| T003 | Create biome.ts pure functions | WP01 | No |
| T004 | Add currentBiome/currentSeason properties | WP02 | No |
| T005 | drawMountainLayerForBiome() | WP02 | No |
| T006 | drawSoftMountain() snowCap param | WP02 | No |
| T007 | drawHillLayerForBiome() | WP02 | No |
| T008 | refreshParallaxLayers() | WP02 | No |
| T009 | biome/season change hook in dailyTick() | WP02 | No |
| T010 | mountain alpha fade-in in update() | WP02 | No |
| T011 | skyG Graphics property | WP03 | No |
| T012 | Replace buildSky() with Graphics | WP03 | No |
| T013 | drawSkyGradient() method | WP03 | No |
| T014 | redrawSky() method | WP03 | No |
| T015 | Hook redrawSky() into dailyTick() | WP03 | No |
| T016 | WeatherParticle interface + weatherParticleG | WP04 | No |
| T017 | Rain particle spawn + draw | WP04 | No |
| T018 | Snow particle spawn + draw | WP04 | No |
| T019 | Heat shimmer draw | WP04 | No |
| T020 | Flush particles on weather change | WP04 | No |
| T021 | Extract drawGroundTiles() | WP05 | No |
| T022 | refreshGroundLayers() | WP05 | No |
| T023 | Hook season change in dailyTick() | WP05 | No |
