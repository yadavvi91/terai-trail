---
id: WP03
title: Implement BootScene
lane: planned
depends_on: [WP02]
---

Create the BootScene that handles asset loading with a progress bar.

## Steps
1. Create `src/scenes/BootScene.ts`
2. Show a loading progress bar during preload
3. Generate placeholder textures programmatically (wagon shape, etc.)
4. Transition to TitleScene on completion

## Acceptance
- BootScene displays progress bar while loading
- Generates placeholder assets
- Transitions to TitleScene
