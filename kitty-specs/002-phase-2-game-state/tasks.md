# Phase 2: Game State & Party Creation — Tasks

## Kanban

| Planned | Doing | For Review | Done |
|---------|-------|------------|------|
| | | | WP01 |
| | | | WP02 |
| | | | WP03 |
| | | | WP04 |

## Work Packages

### WP01: Implement GameState singleton & Party model
- [ ] Create `src/game/GameState.ts` with singleton pattern
- [ ] Create `src/game/Party.ts` with member model
- [ ] Update `src/utils/types.ts` with all interfaces
- [ ] Update `src/utils/constants.ts` with store prices, game config

### WP02: Implement PartyCreationScene
- [ ] Create `src/scenes/PartyCreationScene.ts`
- [ ] Text input fields for leader name + 4 companion names
- [ ] Profession picker (Banker/Carpenter/Farmer) with money display
- [ ] Validation: all names required, profession selected
- [ ] Transitions to StoreScene on confirm

### WP03: Implement StoreScene
- [ ] Create `src/scenes/StoreScene.ts`
- [ ] Display starting money and current cart total
- [ ] Buy/sell controls for each supply category
- [ ] Prevent spending more than available money
- [ ] "Begin Journey" button transitions to TravelScene stub

### WP04: Wire PartyCreation into game flow & verify
- [ ] Update TitleScene "Travel the trail" to go to PartyCreationScene
- [ ] Verify GameState persists across scene transitions
- [ ] `npm run build` passes cleanly
