# Phase 1: Project Setup & Scaffold

## Overview
Set up the Phaser 3 + TypeScript + Vite project scaffold for the Oregon Trail game "Caulk the Wagon". Create the directory structure, core configuration, and wire up BootScene → TitleScene with placeholder text.

## Acceptance Criteria
- [ ] Project scaffolded from `phaserjs/template-vite-ts` template
- [ ] Directory structure: `src/scenes/`, `src/game/`, `src/ui/`, `src/utils/`
- [ ] Vite config, tsconfig, and .gitignore configured
- [ ] BootScene loads assets with a progress bar
- [ ] TitleScene shows game title, subtitle, and a "Travel the trail" menu option
- [ ] `npm run dev` starts the dev server and shows the title screen
- [ ] CLAUDE.md updated with actual stack/architecture
- [ ] All code committed and pushed

## Tech Stack
- Phaser 3 — 2D game framework
- TypeScript — type safety
- Vite — build tool + dev server
- Template: `phaserjs/template-vite-ts`

## Key Files to Create
- `src/main.ts` — entry point, Phaser game config
- `src/scenes/BootScene.ts` — asset loading + progress bar
- `src/scenes/TitleScene.ts` — main menu
- `src/utils/constants.ts` — game dimensions, colors, scene keys
- `src/utils/types.ts` — TypeScript interfaces