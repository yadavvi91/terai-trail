# Phase 2: Game State & Party Creation

## Summary
Implement the core data model and party creation flow. Players name their party, choose a profession, then buy supplies before starting the trail.

## Scope
- `GameState.ts` — singleton managing all game state (party, resources, date, miles, pace, rations)
- `Party.ts` — party member model (names, health, status)
- `PartyCreationScene.ts` — text input for 5 names, profession picker
- `StoreScene.ts` — buy food, ammo, clothing, oxen, spare parts with starting money

## Acceptance Criteria
- GameState singleton accessible from any scene
- Party of 5 members with names, health (0–100), and status (alive/sick/dead)
- Professions: Banker ($1600), Carpenter ($800), Farmer ($400)
- Store sells: food (lbs), ammo (boxes), clothing (sets), oxen (yokes), spare parts (sets)
- State persists when transitioning between scenes
- TypeScript compiles cleanly, `npm run build` passes

## Dependencies
- Phase 1 complete (WP01-WP05 done)
