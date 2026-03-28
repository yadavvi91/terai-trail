---
work_package_id: "WP08"
title: "Isometric Cart and Person Sprites"
lane: "planned"
depends_on: []
phase: "Phase 2 - Drawing"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP08 — Isometric Cart and Person Sprites

## Objective

Create isometric drawing functions for the bullock cart (replaces covered wagon), bullocks (replaces oxen), and Sikh settler figures (replaces pioneer sprites). These are the primary animated characters.

## Deliverables

### New IsoDrawUtils Functions

- **`drawIsoBullockCart(graphics, x, y, scale)`** — Open wooden cart (no bonnet/cover, unlike the covered wagon). Two large wooden wheels. Loaded with supplies. Isometric perspective.
- **`drawIsoBullock(graphics, x, y, scale)`** — Grey/brown water buffalo or white bullock. Yoked to cart. Walking animation frames. Replaces ox sprites.
- **`drawIsoSikhPerson(graphics, x, y, scale, options)`** — Options for:
  - Men: turban/dastar, beard, kurta
  - Women: dupatta, salwar kameez
  - Children: smaller scale, simplified features
  - Walking animation support (2-3 frame cycle)

### Animation Support

- Walk cycle frames for bullock (leg movement)
- Walk cycle frames for person (arm/leg swing)
- Cart wheel rotation tied to movement
- Idle poses for settlement view

## Acceptance Criteria

- Cart is clearly an open bullock cart, not a covered wagon
- Sikh identity is visible (turban for men, dupatta for women)
- Children are visibly smaller than adults
- Walk animations are smooth at game frame rate
- Isometric angle is consistent with other iso elements
