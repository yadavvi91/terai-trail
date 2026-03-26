---
work_package_id: WP04
title: Weather Particle System (Rain, Snow, Heat Shimmer)
lane: "for_review"
dependencies: [WP01]
base_branch: 010-biome-weather-terrain-WP01
base_commit: 590e56f99d77c0cc6ef92e72ca9cdff7f8d281b4
created_at: '2026-03-26T20:44:57.306251+00:00'
subtasks:
- T016
- T017
- T018
- T019
- T020
phase: Phase 2 - Core Rendering
assignee: ''
agent: "claude"
shell_pid: "5795"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-03-26T19:48:26Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
requirement_refs:
- FR-05
---

# Work Package Prompt: WP04 – Weather Particle System (Rain, Snow, Heat Shimmer)

## ⚠️ IMPORTANT: Review Feedback Status

Check `review_status` in frontmatter. If `has_feedback`, address Review Feedback section first.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

### Requirement Refs
- FR-05

## Objectives & Success Criteria

Add animated weather particle effects to the travel scene:
- **Rain**: Diagonal streaks visible during RAINY weather (up to 150 particles)
- **Snow**: Gentle drifting snowflakes during SNOWY weather (up to 100 particles)
- **Heat shimmer**: Flickering bands near ground horizon during HOT weather (no pool)
- **Clear**: No particles, Graphics cleared each frame

Particles run whether the wagon is moving or stopped. Performance must remain at 60fps.

## Context & Constraints

**Implement with**: `spec-kitty implement WP04 --base WP01`

This WP is independent of WP02 and WP03 — it only touches the `update()` loop and `create()`
setup. Safe to implement in parallel with WP02/WP03 if branches are managed.

**Template to follow**: The existing `dustG` / `dustParticles` pattern in TravelScene.ts
(around line 616–650) is the exact architectural pattern to replicate. Study it first.

**Depth ordering**: `weatherParticleG` must be created AFTER `buildParallax()` and BEFORE
`buildHUD()`. Phaser renders GameObjects in creation order (same depth = first created renders
first). This ensures particles appear above mountains/hills but below HUD text.

**Weather enum values** (from `src/utils/types.ts`):
- `Weather.CLEAR`, `Weather.RAINY`, `Weather.HOT`, `Weather.SNOWY`

---

## Subtasks & Detailed Guidance

### Subtask T016 – Add `WeatherParticle` interface, `weatherParticleG` and `weatherParticles[]`

**Purpose**: Define the data structure and Graphics object for weather effects.

**Steps**:
1. At the top of `TravelScene.ts` (module level, before the class), add the interface:
```typescript
interface WeatherParticle {
    x: number;
    y: number;
    vx: number;   // horizontal velocity px/sec
    vy: number;   // vertical velocity px/sec
    alpha: number;
    length: number;  // streak length for rain; 0 for snow
    type: 'rain' | 'snow';
}
```
Note: Heat shimmer doesn't use the particle pool — it draws directly. No 'heat' type needed.

2. Add class properties (near `dustG` / `dustParticles`):
```typescript
private weatherParticleG!: Phaser.GameObjects.Graphics;
private weatherParticles: WeatherParticle[] = [];
```

3. Create the Graphics object in `create()` — AFTER `buildParallax()` call, BEFORE `buildHUD()`:
```typescript
this.weatherParticleG = this.add.graphics();
```

4. Initialise the array in `create()` after all `build*()` calls:
```typescript
this.weatherParticles = [];
```

5. Ensure `weatherParticles` is reset in `create()` (alongside other resets like `this.dustParticles = []`).

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T017 – Implement rain particle spawning and streak drawing

**Purpose**: Animate rain streaks during RAINY weather.

**Steps**:
In `update(time, delta)`, add a weather particle block AFTER the dust particle block
(unconditional — not inside the `if (moving)` check):

```typescript
// ─── Weather particles ───────────────────────────────────────────────────────
const weather = gs.weather;
this.weatherParticleG.clear();

if (weather === Weather.RAINY) {
    // Spawn new rain streaks
    if (this.weatherParticles.length < 150) {
        for (let i = 0; i < 4; i++) {
            this.weatherParticles.push({
                x: Math.random() * GAME_WIDTH,
                y: -10,
                vx: -15 + Math.random() * 5,  // slight leftward drift
                vy: 400 + Math.random() * 200, // fast downward
                alpha: 0.35 + Math.random() * 0.3,
                length: 8 + Math.random() * 12,
                type: 'rain',
            });
        }
    }

    // Update and draw rain
    this.weatherParticles = this.weatherParticles.filter(p => p.y < GAME_HEIGHT + 20);
    this.weatherParticles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        this.weatherParticleG.lineStyle(1, 0x8aaabf, p.alpha);
        this.weatherParticleG.beginPath();
        this.weatherParticleG.moveTo(p.x, p.y);
        this.weatherParticleG.lineTo(p.x + p.vx * 0.025, p.y + p.length);
        this.weatherParticleG.strokePath();
    });
}
```

**Files**: `src/scenes/TravelScene.ts`
**Visual target**: Thin blue-grey diagonal streaks, slightly angled left, falling fast.

---

### Subtask T018 – Implement snow particle spawning and snowflake drawing

**Purpose**: Animate gentle drifting snowflakes during SNOWY weather.

**Steps**:
Continue the weather block from T017 — add `else if` for snow:

```typescript
else if (weather === Weather.SNOWY) {
    // Spawn new snowflakes (slower rate than rain)
    if (this.weatherParticles.length < 100) {
        const t = Date.now() * 0.001;
        this.weatherParticles.push({
            x: Math.random() * GAME_WIDTH,
            y: -5,
            vx: Math.sin(t + Math.random() * 6) * 12, // sinusoidal drift
            vy: 35 + Math.random() * 30,               // slow fall
            alpha: 0.6 + Math.random() * 0.4,
            length: 0,
            type: 'snow',
        });
    }

    // Update and draw snowflakes
    this.weatherParticles = this.weatherParticles.filter(p => p.y < GAME_HEIGHT + 10);
    this.weatherParticles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Gentle horizontal drift evolution
        p.vx += Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.5 * dt;
        this.weatherParticleG.fillStyle(0xffffff, p.alpha);
        this.weatherParticleG.fillCircle(p.x, p.y, 1.5 + Math.random() * 0.5);
    });
}
```

**Files**: `src/scenes/TravelScene.ts`
**Visual target**: Small white circles drifting gently, slightly swaying side-to-side.

---

### Subtask T019 – Implement heat shimmer band drawing

**Purpose**: Animate heat shimmer bands near the ground horizon during HOT weather.
No particle pool — drawn directly each frame.

**Steps**:
Continue the weather block — add `else if` for heat:

```typescript
else if (weather === Weather.HOT) {
    // Heat shimmer: 4 flickering transparent horizontal bands near ground
    for (let i = 0; i < 4; i++) {
        const shimmerAlpha = 0.03 + Math.random() * 0.04;
        const shimmerY = GROUND_Y - 25 + i * 9 + (Math.random() - 0.5) * 3;
        this.weatherParticleG.fillStyle(0xffd080, shimmerAlpha);
        this.weatherParticleG.fillRect(0, shimmerY, GAME_WIDTH, 3 + Math.random() * 2);
    }
    // Clear the particle pool (in case weather switched from rain/snow)
    this.weatherParticles = this.weatherParticles.filter(p => p.y < GAME_HEIGHT + 20);
}
```

**Files**: `src/scenes/TravelScene.ts`
**Visual target**: Faint warm golden bands shimmering near the ground — barely visible but
perceptible on close inspection.

---

### Subtask T020 – Flush weather particles when weather changes in `dailyTick()`

**Purpose**: When weather changes, immediately stop spawning the old weather's particles.
Old particles drain naturally (they fall off-screen within 1–2 seconds).

**Steps**:
1. In `dailyTick()`, in the weather randomization block (where `gs.weather` is set):
```typescript
const oldWeather = gs.weather;
// ... existing weather randomization code ...
if (gs.weather !== oldWeather) {
    this.weatherParticles = [];  // flush immediately on weather change
}
```

2. Also ensure `this.weatherParticles = []` is reset in `create()` initialisation (alongside other resets).

**Files**: `src/scenes/TravelScene.ts`
**Note**: For the CLEAR case, `weatherParticleG.clear()` in `update()` handles it each frame
since neither rain nor snow spawning runs. The `else` block after the three weather cases
handles this implicitly — `weatherParticleG.clear()` is called unconditionally at the start
of the weather block, so CLEAR weather shows nothing.

---

## Risks & Mitigations

- **Particle pool uncapped**: Pool cap must be checked BEFORE spawning (not after). The
  `if (this.weatherParticles.length < 150)` condition enforces this.
- **`weatherParticleG` creation order**: If created after HUD, particles render above HUD text.
  Create it after `buildParallax()` but before `buildHUD()`.
- **Particles persist after weather change**: The `dailyTick()` flush handles this. The
  natural drain (particles fall off-screen) takes ~1–2 seconds for rain, ~10 seconds for snow.
  Flushing immediately on weather change is the cleaner approach.
- **`dt` availability**: The `update(time, delta)` signature provides `delta` in ms. `dt = delta / 1000`
  (already computed at top of update). Use `dt` for velocity calculations, not raw `delta`.
- **Performance at 8x speed**: `dailyTick` fires every 150ms at 8x. Particle spawning in `update()`
  runs at 60fps regardless of game speed. Pool caps prevent accumulation.

## Review Guidance

1. `npx tsc --noEmit` — zero errors.
2. Browser: `GameState.getInstance().weather = 'RAINY'` → streaks appear within 2 seconds.
3. Switch to `'SNOWY'` → streaks drain, snowflakes appear.
4. Switch to `'HOT'` → snowflakes drain, shimmer bands visible at horizon.
5. Switch to `'CLEAR'` → all particles gone (pool flushed by dailyTick, weatherParticleG cleared each frame).
6. Verify no HUD text is obscured by particles.
7. Check at 8x game speed — particles don't accumulate beyond caps.

## Activity Log

- 2026-03-26T19:48:26Z – system – lane=planned – Prompt created.
- 2026-03-26T20:44:58Z – claude – shell_pid=5795 – lane=doing – Assigned agent via workflow command
- 2026-03-26T20:47:00Z – claude – shell_pid=5795 – lane=for_review – Ready for review: WeatherParticle interface, rain/snow/heat shimmer, pool caps enforced, dailyTick flush.
