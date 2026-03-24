# Oregon Trail Game — Implementation Plan

## Context
The user wants to build a web-based Oregon Trail game in the repo `caulk-the-wagon`. The name "caulk the wagon" is itself an Oregon Trail reference (river crossing strategy). The game should have real graphics, be playable in a browser, and capture the classic mechanics: party management, resource management, random events, hunting, river crossings, and the journey from Independence, MO to Oregon's Willamette Valley.

## Tech Stack
- **Phaser 3** — 2D game framework (scene management, sprites, input, audio, particles)
- **TypeScript** — type safety for complex game logic
- **Vite** — fast dev server + build
- **Starter**: `npx degit https://github.com/phaserjs/template-vite-ts`

## Architecture
```
src/
├── main.ts                      # Entry point, Phaser config
├── scenes/
│   ├── BootScene.ts             # Asset loading + progress bar
│   ├── TitleScene.ts            # Main menu
│   ├── PartyCreationScene.ts    # Name party, pick profession
│   ├── StoreScene.ts            # Buy supplies
│   ├── TravelScene.ts           # Main gameplay loop
│   ├── HuntingScene.ts          # Hunting mini-game
│   ├── RiverCrossingScene.ts    # Ford/caulk/ferry/wait
│   ├── EventScene.ts            # Random event overlay
│   ├── LandmarkScene.ts         # Fort/landmark stops
│   └── GameOverScene.ts         # Death or victory
├── game/
│   ├── GameState.ts             # Central state singleton
│   ├── EventManager.ts          # Random event logic + probabilities
│   ├── TrailData.ts             # Landmarks, distances, terrain
│   └── Party.ts                 # Party members, health, resources
├── ui/
│   ├── StatusBar.ts             # HUD (date, miles, health, supplies)
│   ├── DialogBox.ts             # Reusable choice/info dialog
│   └── Button.ts                # Styled clickable button
└── utils/
    ├── constants.ts             # Tuning values, enums
    └── types.ts                 # Interfaces
```

---

## Phases

### Phase 1: Project Setup & Scaffold
- Init git repo
- Scaffold from Phaser 3 + Vite + TS template
- Configure project (vite.config, tsconfig, .gitignore)
- Create directory structure
- Wire up BootScene → TitleScene with placeholder text
- Update CLAUDE.md with actual stack/architecture
- **Deliverable**: `npm run dev` shows a title screen

### Phase 2: Game State & Party Creation
- Implement `GameState.ts` — party members, resources, date, miles, pace, rations
- Implement `Party.ts` — member names, health, status (alive/dead/sick)
- Build `PartyCreationScene` — text input for 5 names, profession picker (banker $1600, carpenter $800, farmer $400)
- Build `StoreScene` — buy food, ammo, clothing, oxen, spare parts with starting money
- **Deliverable**: Can create party, buy supplies, state persists between scenes

### Phase 3: Travel Loop (Core Gameplay)
- Build `TravelScene` with:
  - Parallax scrolling background (sky, far mountains, near hills, ground) using Phaser graphics
  - Animated wagon moving across landscape
  - Status bar HUD (date, weather, health, miles, next landmark)
  - Pace control (steady/strenuous/grueling) and ration control (filling/meager/bare bones)
  - Daily tick: advance miles, consume food, update date, check health
- Implement `TrailData.ts` — 10+ landmarks with mile markers
- Day/night tinting cycle
- **Deliverable**: Playable travel loop from Independence to Willamette Valley

### Phase 4: Random Events
- Implement `EventManager.ts` with probability tables
- Events: disease (dysentery, cholera, typhoid, measles), broken wagon parts, bad weather, snake bites, theft, finding wild fruit, meeting travelers
- Build `EventScene` — popup overlay with event description and player choices
- Health effects: disease lowers health over time, death when health reaches 0
- Weather system affecting travel speed
- **Deliverable**: Random events fire during travel, affect party and resources

### Phase 5: River Crossings
- Build `RiverCrossingScene` with:
  - Visual river display
  - 4 options: ford the river, caulk the wagon and float, take a ferry ($), wait for conditions
  - Risk calculations per method (depth, weather, luck)
  - Consequences: lose supplies, lose party members, wagon damage
- Wire river landmarks in TrailData to trigger this scene
- **Deliverable**: River crossings are interactive decision points

### Phase 6: Hunting Mini-Game
- Build `HuntingScene`:
  - Animals spawn and move across screen (deer=large/slow, buffalo=large/medium, rabbit=small/fast, squirrel=tiny/fast)
  - Click to shoot, limited ammo, 60-second timer
  - Different animals = different food yield
  - Carry limit (100 lbs back to wagon)
- Add "hunt" option to travel screen
- **Deliverable**: Functional hunting mini-game

### Phase 7: Landmarks & Trading
- Build `LandmarkScene`:
  - Landmark info/history blurb
  - Options: rest (restore health), trade, talk to people, continue
  - Trading at forts (buy/sell supplies at varying prices)
- Historical landmarks: Fort Kearney, Chimney Rock, Fort Laramie, Independence Rock, South Pass, Fort Bridger, Blue Mountains, The Dalles
- **Deliverable**: Landmark stops with rest and trade

### Phase 8: Game Over & Victory
- Build `GameOverScene`:
  - Death: show tombstone, who died and how, miles traveled
  - Victory: celebration, score calculation (remaining health, supplies, speed, party survivors, profession multiplier)
  - "Play Again" button
- Trigger game over when all 5 party members die
- Trigger victory when reaching Willamette Valley
- **Deliverable**: Complete game loop from start to finish

### Phase 9: Polish & Visual Upgrade
- Pixel art sprites (wagon, animals, characters) — generate or source
- Particle effects (dust behind wagon, rain, snow, campfire)
- Sound effects and music (ambient trail sounds, gunshots for hunting, UI clicks)
- Smooth transitions between scenes
- Responsive layout for different screen sizes
- **Deliverable**: Polished, visually impressive game

### Phase 10: Deployment
- Build optimization
- Deploy to GitHub Pages
- SPA routing fix (404.html)
- Final testing across browsers
- **Deliverable**: Playable at a public URL

---

## Key Game Data

**Trail landmarks (approximate miles from Independence, MO):**
| Landmark | Miles |
|----------|-------|
| Independence, MO | 0 |
| Kansas River | 102 |
| Fort Kearney | 304 |
| Chimney Rock | 554 |
| Fort Laramie | 640 |
| Independence Rock | 830 |
| South Pass | 932 |
| Fort Bridger | 1,000 |
| Snake River | 1,400 |
| Fort Boise | 1,500 |
| Blue Mountains | 1,700 |
| The Dalles | 1,800 |
| Willamette Valley | 2,000 |

**Professions:**
| Profession | Starting $ | Bonus |
|------------|-----------|-------|
| Banker | $1,600 | None |
| Carpenter | $800 | Wagon repair bonus |
| Farmer | $400 | 3x final score multiplier |

## Verification
- `npm run dev` — runs locally, playable end-to-end
- Each phase: manually play through the new feature
- Phase 8+: full playthrough from title to victory/death
- **Playwright MCP** (configured in `.claude/mcp.json`) — use for browser smoke tests:
  - Title screen loads
  - Can create party and start game
  - Travel screen renders with HUD
  - Hunting mini-game is playable
  - River crossing choices work
  - Full playthrough from start to victory/death (Phase 8+)

## Critical Files
- `src/main.ts` — game config and entry
- `src/game/GameState.ts` — central state, most scenes depend on this
- `src/scenes/TravelScene.ts` — largest scene, core gameplay
- `src/game/TrailData.ts` — all landmark/distance data
- `src/game/EventManager.ts` — random event probabilities and effects
