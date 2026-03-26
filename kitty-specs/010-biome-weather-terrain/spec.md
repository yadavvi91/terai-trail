# Feature Specification: Biome-Based Scenery & Weather Terrain

**Feature**: 010-biome-weather-terrain
**Mission**: software-dev
**Status**: Ready for planning

---

## Summary

The Oregon Trail travel scene currently renders identical snowy Rocky Mountain peaks and a
static blue sky for the entire 2000-mile journey. A player traveling through the Kansas
prairie sees the same alpine scenery as a player crossing into Oregon. Weather conditions
(clear, rain, heat, snow) exist in the game state but have no visual effect whatsoever.

This feature introduces three distinct geographic biome zones, weather-reactive sky with
animated atmospheric effects, a gradual mountain fade-in as the player approaches the
Rockies, and subtle seasonal terrain color shifts tied to the in-game calendar.

---

## Problem Statement

Players have no visual sense of geographic progression. The scenery never changes, making
the trail feel like a treadmill rather than a cross-continental journey. Weather changes
are invisible — rain, snow, and heat waves look identical to a clear day. This undermines
immersion and removes the emotional weight of reaching the Rocky Mountains or descending
into the Oregon wilderness.

---

## Goals

1. Communicate geographic progress through changing scenery across three distinct regions.
2. Make weather conditions visually tangible — players should see and feel rain, snow, and heat.
3. Create a sense of anticipation as distant mountains slowly appear on the horizon during the prairie stretch.
4. Reflect the seasonal passage of time through subtle terrain color shifts.

---

## Biome Zones

| Zone | Miles | Character |
|---|---|---|
| **Prairie** | 0 – 640 mi | Flat/open horizon; mountains invisible then slowly fading in from mile 300 |
| **Mountains** | 640 – 1,400 mi | Full grey-blue snowy Rocky Mountain peaks; deep blue sky |
| **Oregon** | 1,400 – 2,000 mi | Dark green forested ridges, no snow caps; grey-green overcast sky |

---

## Functional Requirements

### FR-01: Prairie Biome (0–640 mi)
- Mountains must be invisible (alpha = 0) at the start of the journey (mile 0–300).
- From mile 300 to 640, mountains fade in linearly from invisible to fully visible.
- Hill colors use warm green tones appropriate to Great Plains prairie.
- Sky uses the standard clear-day blue gradient (or weather variant — see FR-04).

### FR-02: Mountains Biome (640–1,400 mi)
- Full grey-blue snowy peaks rendered at full visibility.
- Snow caps present on tall peaks.
- Deep blue sky gradient as currently rendered.
- Hill colors use the existing forest-green palette.

### FR-03: Oregon Biome (1,400–2,000 mi)
- Mountain silhouettes replaced with dark green forested ridges (no snow caps).
- Sky base gradient shifts to grey-green overcast tones.
- Hill and ground colors shift to deeper green / moss tones.
- Tree density appears higher (via hill layer redraw).

### FR-04: Weather-Reactive Sky
Each weather condition must produce a distinct sky gradient and sun state:

| Weather | Sky | Sun |
|---|---|---|
| **Clear** | Deep blue gradient (current) | Visible, standard size |
| **Rainy** | Dark grey-blue gradient | Hidden |
| **Hot** | Pale washed-out blue-to-warm gradient | Visible, larger/brighter |
| **Snowy** | White-grey gradient | Hidden |

Sky must update visually within the same game day that weather changes.

### FR-05: Weather Particle Effects
- **Rain**: Animated diagonal streaks falling from top of screen. Up to 150 particles active.
- **Snow**: Animated gentle drifting snowflakes. Up to 100 particles active.
- **Heat**: Subtle shimmer bands near the ground horizon, redrawn each frame.
- **Clear**: No particles.
Particles must stop accumulating immediately when weather changes.

### FR-06: Seasonal Terrain Colors
Ground tile and hill colors shift based on the in-game calendar month:

| Months | Season | Grass Tone |
|---|---|---|
| April – May | Spring | Fresh green |
| June – July | Early Summer | Golden green |
| August | Late Summer | Dry gold |
| September+ | Fall | Brown-red |

Color transitions happen at the next daily game tick after the month changes.

### FR-07: Biome + Season Independence
Biome zone and season operate independently and combine:
- A Prairie biome in August shows dry-gold grasses with open horizon.
- An Oregon biome in September shows brown-tinged forest terrain with misty ridges.

---

## User Scenarios

### Scenario A: Starting the Journey (Prairie, Spring)
Player begins in April. The sky is clear blue. The horizon is flat — no mountains visible.
As days pass, distant grey shapes begin to appear faintly around mile 300. By Fort Laramie
(mile 640), mountains are fully visible.

### Scenario B: Crossing the Rockies (Mountains, Summer)
Player is in July. Snowy alpine peaks dominate the background. A rain event triggers —
sky shifts to dark grey, rain streaks appear, sun disappears. The next clear day restores
the blue sky and sun.

### Scenario C: Descending into Oregon (Oregon, Fall)
Player arrives in September. Mountains are replaced by dark green forested ridges with no
snow. Sky has a grey-green overcast tone. Grass and hills are brownish-red. A snow event
produces white-grey sky and drifting snowflakes over the dark green backdrop.

### Scenario D: Heat Wave on the Prairie
Player is in August, mile 200. Sky washes out to pale blue-warm gradient. Sun grows
larger and brighter. Shimmering heat bands ripple near the ground horizon.

---

## Out of Scope

- RiverCrossingScene, HuntingScene, EventScene scenery changes.
- Landmark-specific scenery (Chimney Rock silhouette, etc.).
- Animated cloud behavior changes per weather.
- Audio changes per biome (handled elsewhere).

---

## Success Criteria

1. A player traveling from mile 0 to 2000 sees three visually distinct geographic regions.
2. Mountains are not visible at mile 0 and are fully visible by mile 640.
3. Every weather state produces a visually distinct sky (verified by screenshot).
4. Rain and snow produce visible animated particles within the same game day.
5. Ground tile color is noticeably different between April and August in the prairie zone.
6. Build completes with zero type errors after all work packages are complete.

---

## Assumptions

- Isometric ground scroll system, parallax speeds, and wrap logic remain unchanged.
- Wagon and character drawing code is not modified.
- Weather randomization logic in GameState is not modified.
- Game starts April 1, 1848 — seasonal shifts occur naturally as the player travels.

---

## Dependencies

- `src/scenes/TravelScene.ts` — primary file for all visual rendering
- `src/game/GameState.ts` — source of milesTraveled, weather, currentDate
- `src/utils/types.ts` — Weather enum (already exists)
- `src/ui/DrawUtils.ts` — existing drawing helpers
