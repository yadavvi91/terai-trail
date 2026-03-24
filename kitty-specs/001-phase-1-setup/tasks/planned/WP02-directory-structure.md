---
id: WP02
title: Create directory structure & constants
lane: "done"
depends_on: [WP01]
reviewed_by: "Vishal Yadav"
review_status: "approved"
---

Create the Oregon Trail directory structure and foundational files.

## Steps
1. Create directories: `src/scenes/`, `src/game/`, `src/ui/`, `src/utils/`
2. Create `src/utils/constants.ts` with:
   - Game dimensions (1024x768)
   - Color palette (sky blue, grass green, trail brown, parchment, etc.)
   - Text styles (title, subtitle, body, HUD)
   - Scene key constants
   - Profession enum and data
   - Store prices
   - Travel speed constants
3. Create `src/utils/types.ts` with interfaces:
   - PartyMember, Supplies, Landmark, GameEvent
   - Enums: MemberStatus, Pace, Rations, Weather

## Acceptance
- All directories exist
- constants.ts and types.ts compile cleanly

## Activity Log

- 2026-03-24T20:59:17Z – unknown – lane=doing – Moved to doing
- 2026-03-24T21:00:35Z – unknown – lane=done – Moved to done
