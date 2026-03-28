---
work_package_id: "WP16"
title: "Milestone Scene"
lane: "planned"
depends_on:
  - "WP02"
  - "WP07"
phase: "Phase 3 - Scenes"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP16 — Milestone Scene

## Objective

Rewrite LandmarkScene as MilestoneScene. Celebrates settlement progress at key acre thresholds, some offering choices, others providing rest and supplies.

## Deliverables

### Milestone Events

| Acres | Event | Type |
|-------|-------|------|
| 1 | First Acre Cleared | Celebration |
| 5 | Shelter Built | Celebration + health boost |
| 10 | Well Dug | Celebration + permanent health bonus |
| 20 | DDT Team Arrives | Choice: accept/decline DDT spraying |
| 30 | First Harvest | Celebration + large food bonus |
| 40 | Tharu Alliance | Choice: trade or alliance terms |
| 50 | Gurdwara Founded | Celebration + morale/health recovery |
| 65 | School Built | Celebration |
| 80 | Canal Dug | Permanent farming bonus |
| 90 | Market Road | Trade access, supply prices drop |
| 100 | Little Punjab Established | Victory transition |

### Choice Milestones

- **DDT (20 acres)**: Accept = malaria rate drops dramatically, Decline = malaria remains high (historical accuracy note)
- **Tharu Alliance (40 acres)**: Different trade terms affect supply costs

### Visual

- Community gathering scene
- Structure being built/inaugurated (uses WP07 draw functions)
- Family and community figures celebrating
- Milestone-specific decorations

### Rest & Recovery

- Health recovery for family members
- Optional: receive government relief supplies at certain milestones

## Acceptance Criteria

- Each of the 11 milestones has unique content
- Choice milestones record decisions in GameState
- DDT choice affects malaria event weight
- Health recovery applies correctly
- Victory milestone (100 acres) transitions to GameOver victory
- No references to forts, rivers, or trail landmarks
