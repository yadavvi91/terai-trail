# UX Overhaul: Sound, Speed Controls, Realistic Mountains, Isometric View

## Overview
Major UX enhancement covering four areas: audio system with mute/unmute, game speed controls, improved mountain rendering, and isometric 2.5D visual transformation.

## Functional Requirements

### FR1: Sound System (Hybrid)
- Procedural SFX via Web Audio API: wagon rolling, gunshots, water, UI clicks
- Asset-based background music: looping trail theme
- Persistent mute/unmute toggle button visible in all scenes
- Sound state persists across scene transitions

### FR2: Speed Controls
- Speed multiplier: 1x, 2x, 4x, 8x in TravelScene HUD
- Multiplier affects: tick interval, scroll speed, animation rates
- Auto-reset to 1x on sub-scene entry

### FR3: Mountain Rendering Improvements
- Noise-based silhouette generation
- Multi-layer depth with atmospheric color shifting
- Rock texture detail, varied snow patterns

### FR4: Isometric 2.5D View
- Isometric coordinate transforms (cartesian to iso)
- Tile-based terrain for TravelScene
- Isometric versions of DrawUtils entities
- Depth sorting for proper overlap

## Success Criteria
- Audio plays with mute toggle working in all scenes
- 8x speed allows fast gameplay testing
- Mountains look organic, not geometric
- Game renders in isometric perspective with depth sorting
