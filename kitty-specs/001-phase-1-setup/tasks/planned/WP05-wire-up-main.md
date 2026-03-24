---
id: WP05
title: Wire up main.ts and verify
lane: "done"
depends_on: [WP04]
reviewed_by: "Vishal Yadav"
review_status: "approved"
---

Update the main entry point and verify everything works end-to-end.

## Steps
1. Rewrite `src/main.ts` with Phaser config (1024x768, all scenes registered)
2. Update `index.html` title to "The Oregon Trail — Caulk the Wagon"
3. Update `package.json` name and description
4. Create placeholder scene stubs for future phases (PartyCreation, Store, Travel, Hunting, RiverCrossing, Event, Landmark, GameOver)
5. Run `npm run dev` and verify title screen displays
6. Run TypeScript check — no errors

## Acceptance
- `npm run dev` shows the title screen
- All scene files exist (even if stubs)
- TypeScript compiles cleanly
- `npm run build` succeeds

## Activity Log

- 2026-03-24T21:02:34Z – unknown – lane=doing – Moved to doing
- 2026-03-24T21:07:51Z – unknown – lane=done – Moved to done
