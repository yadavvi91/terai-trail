# Caulk the Wagon — Oregon Trail Game

## Key Documents
- **[PLAN.md](PLAN.md)** — Full implementation plan (10 phases). Read this at the start of every session.
- **[project-workflow.md](project-workflow.md)** — Commit hygiene, triple-tracker workflow, deployment conventions.

## Stack
- **Phaser 3** — 2D game framework
- **TypeScript** — type safety
- **Vite** — build tool + dev server
- Scaffolded from `phaserjs/template-vite-ts`

## Architecture
- `src/main.ts` — entry point, Phaser game config
- `src/scenes/` — one file per game screen (Boot, Title, PartyCreation, Store, Travel, Hunting, RiverCrossing, Event, Landmark, GameOver)
- `src/game/` — core logic (GameState singleton, EventManager, TrailData, Party)
- `src/ui/` — reusable UI components (StatusBar, DialogBox, Button)
- `src/utils/` — constants, types

## Rules
- GameState.ts is the single source of truth for all game state
- Never mutate game state directly from scenes — use GameState methods
- Every scene must clean up its listeners in shutdown()
- Assets loaded only in BootScene
- All magic numbers go in constants.ts

## Testing — Playwright MCP
- **Playwright MCP** is configured in `.claude/mcp.json` for browser automation
- Use Playwright MCP tools to smoke-test the game in a real browser (title loads, can start game, travel screen works)
- Useful for verifying visual scenes, UI interactions, and end-to-end gameplay flows
- Run `npm run dev` first, then use Playwright MCP to navigate to `http://localhost:8080`

## Workflow — Commits & Checkpoints
- ALWAYS commit after completing each phase or significant milestone
- Create git tags for major phase completions (e.g., phase-1, phase-2)
- Never accumulate multiple phases of work without committing
- Stage specific files per commit — no blanket `git add .`
- Push to remote after each phase commit
- See project-workflow.md for full triple-tracker workflow
