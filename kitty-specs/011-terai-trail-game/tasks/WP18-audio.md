---
work_package_id: "WP18"
title: "Audio and Sound Manager"
lane: "planned"
depends_on: []
phase: "Phase 4 - Polish"
history:
  - timestamp: "2026-03-28T07:30:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via /spec-kitty.tasks"
---

# WP18 — Audio and Sound Manager

## Objective

Rewrite SoundManager with Punjabi-influenced melodies, Terai jungle ambience, and culturally appropriate sound effects.

## Deliverables

### Music

- **Settlement theme**: Punjabi-influenced melody using pentatonic scale with dhol-style rhythm pattern. Looping, not intrusive.
- **Jungle ambience**: Layered insects (crickets, cicadas), bird calls, distant animal sounds. Plays under settlement theme.
- **Funeral music**: Harmonium and bansuri (bamboo flute) — somber, devotional tone.
- **Victory music**: Dhol celebration beat with bhangra energy.

### Sound Effects

| SFX | Replaces | Usage |
|-----|----------|-------|
| Axe chop | Gunshot | Clearing trees, foraging |
| Mosquito buzz | — | Malaria event |
| Tiger growl | — | Tiger attack event |
| Monsoon thunder | — | Monsoon scene |
| Snake hiss | — | Snake bite event |
| Bullock moo | Ox sound | Cart/settlement ambient |
| Hammer/build | — | Structure milestone |

### Implementation

- Web Audio API synthesis (no external audio files)
- Volume controls: music, SFX, ambience (separate channels)
- Smooth crossfades between scenes
- Mute toggle

## Acceptance Criteria

- Settlement music has recognizable Punjabi flavor
- Jungle ambience creates immersive atmosphere
- All SFX trigger at correct game events
- No Oregon Trail SFX remain (no banjo, no gunshots)
- Audio does not cause performance issues
