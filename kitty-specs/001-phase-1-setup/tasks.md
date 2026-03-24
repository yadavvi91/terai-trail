# Phase 1: Project Setup & Scaffold — Tasks

## Kanban

| Planned | Doing | For Review | Done |
|---------|-------|------------|------|
| | | | WP01 |
| | | | WP02 |
| | | | WP03 |
| | | | WP04 |
| | | | WP05 |

## Work Packages

### WP01: Scaffold Phaser 3 + Vite + TS template
- [ ] Run `npx degit phaserjs/template-vite-ts`
- [ ] Install dependencies with `npm install`
- [ ] Verify `npm run dev` works with template

### WP02: Create directory structure & constants
- [ ] Create `src/scenes/`, `src/game/`, `src/ui/`, `src/utils/`
- [ ] Create `src/utils/constants.ts` (dimensions, colors, scene keys)
- [ ] Create `src/utils/types.ts` (interfaces for game entities)

### WP03: Implement BootScene
- [ ] Create `src/scenes/BootScene.ts`
- [ ] Loading progress bar
- [ ] Generate placeholder assets
- [ ] Transition to TitleScene

### WP04: Implement TitleScene
- [ ] Create `src/scenes/TitleScene.ts`
- [ ] Game title and subtitle display
- [ ] Animated wagon crossing the screen
- [ ] "Travel the trail" and "Learn about the trail" menu options
- [ ] Keyboard input (1, 2) for menu selection

### WP05: Wire up main.ts and verify
- [ ] Update `src/main.ts` with Phaser config and all scene imports
- [ ] Update `index.html` and `package.json` metadata
- [ ] Verify `npm run dev` shows title screen
- [ ] Verify TypeScript compiles cleanly
