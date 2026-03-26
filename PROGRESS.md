# Caulk the Wagon — Progress Report

**Last updated**: 2026-03-26
**Repo**: yadavvi91/caulk-the-wagon
**Stack**: Phaser 3.90 + TypeScript 5.7 + Vite 6.3
**Total**: 63 commits, 138 files, ~20,800 lines

---

## Phase 1: Project Setup & Scaffold `phase-1`
- Scaffolded from `phaserjs/template-vite-ts`
- Directory structure: `src/scenes/`, `src/game/`, `src/ui/`, `src/utils/`
- BootScene with loading bar, TitleScene with menu
- CLAUDE.md, PLAN.md, project-workflow.md

## Phase 2: Game State & Party Creation `phase-2-game-state`
- **GameState.ts** — singleton managing all game state (party, supplies, date, miles, pace, rations)
- **Party.ts** — party member model with health, status, daily effects
- **PartyCreationScene** — profession picker (Banker $1600 / Carpenter $800 / Farmer $400), name inputs for 5 members
- **StoreScene** — buy oxen, food, clothing, ammo, spare parts with starting money

## Phase 3: Travel Loop `phase-3-travel-loop`
- **TrailData.ts** — 13 landmarks from Independence to Willamette Valley (2,000 miles)
- **TravelScene** — main gameplay loop with parallax scrolling, HUD, daily tick
- Pace controls (Steady/Strenuous/Grueling), ration controls (Filling/Meager/Bare Bones)
- Food consumption, health effects, starvation damage

## Phase 4: Random Events `phase-4-events`
- **EventManager.ts** — 13 event types with probability table
- Events: disease, injury, breakdown, theft, wild fruit, snake bite, travelers, bad water, lost oxen, good weather, hail storm, found cache
- **EventScene** — choice-based event dialog with outcomes

## Phase 5: River Crossings `phase-5-river-crossings`
- **RiverCrossingScene** — ford, caulk & float, hire ferry, or wait
- Depth-based risk calculation, supply loss on failed crossings
- Depth gauge post with colored marks

## Phase 6: Hunting Mini-Game `phase-6-hunting`
- **HuntingScene** — click-to-shoot with custom crosshair
- 4 animal types: buffalo (100 lbs), deer (52 lbs), rabbit (5 lbs), squirrel (2 lbs)
- Ammo consumption, carry limit (200 lbs max), timed rounds
- Kill animation with floating "+N lbs" popup

## Phase 7: Landmarks & Trading `phase-7-landmarks`
- **LandmarkScene** — rest, trade, or continue at each landmark
- Fort trading posts with price multipliers (1.5x–2.5x above Independence)
- Party health display per member

## Phase 8: Game Over & Victory `phase-8-game-over`
- **GameOverScene** — victory at 2,000 miles, death if all perish
- Victory: score calculation (survivors × 500 + health + food + money × profession multiplier)
- Death: tombstone with party memorial

## Phase 9: Visual Overhaul `phase-9-visual-overhaul` → `visual-overhaul-complete`
**The biggest phase — 15 commits, +3,759/−844 lines.**

### DrawUtils.ts (1,057 lines)
Shared procedural art library using only Phaser 3 Graphics API:
- `drawWagon` — canvas bonnet arch (bezier polygon), plank grain, axle, wheels with spokes
- `drawOx` — hump, dewlap, horns, hooves, eye highlight, tail tuft
- `drawPerson` — rounded limbs, belt buckle, hat, walking animation, eyes, hands
- `drawWoman` — bonnet, flowing dress with apron, collar detail
- `drawChild` — proportionally larger head, hair fringe
- `drawPig` — farm animal with curly tail
- `drawTree` — deciduous (organic overlapping canopy) + pine variants
- `drawMountain` — jagged fillPoints silhouette, sub-peaks, rock stratification, atmospheric haze, snow
- `drawHill` — noise-based organic outline with grass tufts
- `drawCloud` — multi-layer billowy puffs with shadow + sunlit highlight
- `drawSun` — warm diffuse glow halo, alternating ray lengths, gradient core
- `drawBuffalo`, `drawDeer`, `drawRabbit`, `drawSquirrel` — hunting animals

### Scene improvements
| Scene | Highlights |
|---|---|
| BootScene | Themed loading screen with gold title, decorative border |
| TitleScene | Deep sky gradient, 2-layer mountains, trees, wildflowers, animated wagon train |
| PartyCreationScene | Scenic background, horizon glow, trees on hillsides |
| StoreScene | Realistic woodgrain planks with knots, circular ±buttons, nail details |
| TravelScene | Leather-textured HUD, progress bar with landmarks, walking party |
| HuntingScene | Full landscape, rifle scope crosshair with mil-dots |
| RiverCrossingScene | Mountains behind far bank, tree line, water gradient with shimmer |
| EventScene | 4 mood-based backgrounds (good/danger/storm/night), stopped wagon |
| LandmarkScene | Detailed fort (log walls, towers, gate, flag), realistic rock with moss |
| GameOverScene | Victory: Oregon valley celebration. Death: storm clouds, dead trees |

### Bug fixes during visual overhaul
- `bezierCurveTo` crash — replaced with manual bezier polygon computation via `fillPoints`
- Added `Phaser.Scale.FIT` + `CENTER_BOTH` for responsive screen sizing

## Phase 10: Deployment Setup `phase-10-deploy`
- `gh-pages` package added, deploy script in package.json
- `vite/config.prod.mjs` base set to `/caulk-the-wagon/`
- **Currently unpublished** — user requested no GitHub Pages deploys without permission

## Spec 009: UX Overhaul — Sound, Speed, Isometric

### WP01: Sound System ✅
- **SoundManager.ts** — Web Audio API singleton with procedural sounds
  - Click, gunshot, water splash, wagon roll, good/bad event stings
- **MuteButton.ts** — reusable mute toggle (emoji icon + circle)
- Mute state persists via localStorage
- Sound effects in all 10 scenes (gunshot on hunt, splash on river, stings on events, etc.)

### WP02: Speed Controls ✅
- Speed multiplier in GameState: 1x, 2x, 4x, 8x
- ⏩ toggle button in TravelScene bottom bar
- Tick timer delay and scroll speed scale with multiplier
- Auto-reset to 1x when entering sub-scenes

### WP03: Mountain Realism ⏭️ (skipped — already improved in Phase 9)

### WP04: Isometric Foundation ✅
- **isometric.ts** — `worldToScreen()`, `screenToWorld()`, `isoDepth()`, `drawIsoTile()`, `drawIsoBlock()`
- **IsoDrawUtils.ts** — isometric wagon, ox, person, tree, mountain, building
- TravelScene ground converted to isometric diamond tile grid

### WP05: Isometric Entities ✅
- All 10 scenes have isometric diamond tile ground
- Wagon, oxen, people rendered with IsoDrawUtils in all applicable scenes
- Fort landmarks use `drawIsoBuilding()`

### Bug Fixes
- **Miles not updating after sub-scenes** — root cause: Phaser 3 does NOT auto-call `resume()` on Scene classes. Fixed by registering `this.events.on('resume', this.onResume, this)` explicitly.
- **scene.stop() before scene.resume()** — swapped order in all 4 sub-scenes (HuntingScene, EventScene, LandmarkScene, RiverCrossingScene)

---

## Isometric Diagonal Movement Rework *(uncommitted — 2026-03-26)*

The isometric ground tiles were in place but all movement was still horizontal — the game looked like a checkerboard wallpaper behind a side-scroller. This rework made movement truly isometric.

### Trail direction fix (all scenes)
- **Old**: trail followed `col ≈ row` (rendered as a vertical stripe on screen)
- **New**: trail follows `row ≈ middleRow` (horizontal band in world coords → **diagonal down-right on screen**)
- Updated in: TravelScene, TitleScene, EventScene, RiverCrossingScene, LandmarkScene, GameOverScene

### TravelScene — diagonal ground scrolling
- Ground tiles now scroll **diagonally** at 2:1 iso ratio (`baseX += dx`, `baseY += dx * 0.5`)
- Ground moves **down-right toward the viewer**, so the wagon appears to travel **up-left into the distance**
- Two-copy wrapping handles diagonal offset seamlessly along the iso axis
- Hill parallax: added subtle vertical drift alongside horizontal scroll for depth
- Mountains: horizontal-only parallax (correct for distant objects)

### Wagon positioning
- Oxen positioned **ahead** of wagon (up-left = into the distance)
- Party members walk **behind** wagon (down-right = toward viewer)
- Dust particles spawn behind wagon and drift down-right

### TitleScene
- Wagon animates from lower-right to upper-left (traveling away from viewer)
- Dust trail behind wagon drifts down-right
- Oxen ahead (up-left), people behind (down-right)

### HuntingScene
- Animals now spawn from **all 4 screen edges** and move along iso-aligned diagonals
- Old: horizontal-only movement. New: down-right, up-left, down-left, up-right paths

### Playwright MCP config fix
- Fixed `.claude/mcp.json`: package was `@anthropic-ai/mcp-server-playwright` (doesn't exist) → `@playwright/mcp@latest`

---

## Known Issues / Next Steps

### Future work
- Background music track (asset-based, currently only procedural SFX)
- More detailed isometric entity art (wagon/ox/person could face the travel direction more clearly)
- Mobile touch controls
- Save/load game state

---

## Architecture

```
src/
├── main.ts                      # Phaser config + scene list
├── audio/
│   └── SoundManager.ts          # Web Audio procedural SFX singleton
├── scenes/
│   ├── BootScene.ts             # Loading screen
│   ├── TitleScene.ts            # Main menu with animated wagon
│   ├── PartyCreationScene.ts    # Name party + pick profession
│   ├── StoreScene.ts            # Buy supplies
│   ├── TravelScene.ts           # Main gameplay loop
│   ├── HuntingScene.ts          # Click-to-shoot mini-game
│   ├── RiverCrossingScene.ts    # Ford/caulk/ferry/wait
│   ├── EventScene.ts            # Random event dialog
│   ├── LandmarkScene.ts         # Fort/landmark stops + trading
│   └── GameOverScene.ts         # Victory or death
├── game/
│   ├── GameState.ts             # Central state singleton
│   ├── EventManager.ts          # Random event logic
│   ├── TrailData.ts             # 13 landmarks, distances
│   └── Party.ts                 # Party member model
├── ui/
│   ├── DrawUtils.ts             # Procedural art (1,057 lines)
│   ├── IsoDrawUtils.ts          # Isometric entity drawing
│   └── MuteButton.ts            # Reusable mute toggle
└── utils/
    ├── constants.ts             # Game constants, enums, text styles
    ├── types.ts                 # TypeScript interfaces
    └── isometric.ts             # Iso coordinate transforms + tile drawing
```

## Git Tags
| Tag | Description |
|---|---|
| `phase-1` | Project scaffold complete |
| `phase-2-game-state` | GameState + PartyCreation + Store |
| `phase-3-travel-loop` | TravelScene with parallax + HUD |
| `phase-4-events` | EventManager + EventScene |
| `phase-5-river-crossings` | RiverCrossingScene |
| `phase-6-hunting` | HuntingScene mini-game |
| `phase-7-landmarks` | LandmarkScene + trading |
| `phase-8-game-over` | GameOverScene — complete game loop |
| `phase-9-visual-overhaul` | Major art overhaul begins |
| `visual-overhaul-complete` | All 10 scenes production-quality art |
| `phase-10-deploy` | GitHub Pages deployment configured |
