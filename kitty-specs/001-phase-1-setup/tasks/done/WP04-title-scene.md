---
id: WP04
title: Implement TitleScene
lane: "done"
depends_on: [WP03]
reviewed_by: "Vishal Yadav"
review_status: "approved"
---

Create the TitleScene with the Oregon Trail main menu.

## Steps
1. Create `src/scenes/TitleScene.ts`
2. Sky blue background with green ground and brown trail
3. Display "The Oregon Trail" title, "Caulk the Wagon Edition" subtitle, "~ 1848 ~"
4. Animated wagon rectangle moving across the trail
5. Menu options: "1. Travel the trail", "2. Learn about the trail"
6. Keyboard input: 1 starts game, 2 shows trail info overlay
7. Hover effects on menu buttons (gold highlight)
8. Info overlay with trail description and profession info

## Acceptance
- Title screen renders with all elements
- Menu buttons are interactive (click + keyboard)
- Info overlay shows/hides correctly
- Scene cleans up listeners in shutdown()

## Activity Log

- 2026-03-24T21:01:32Z – unknown – lane=doing – Moved to doing
- 2026-03-24T21:02:26Z – unknown – lane=done – Moved to done
