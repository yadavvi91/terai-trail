# Feature Specification: Terai Trail — Settlement Survival Game

**Feature Branch**: `011-terai-trail-game`
**Created**: 2026-03-28
**Status**: Draft
**Input**: Adapt the Oregon Trail engine into a settlement survival game about post-Partition Sikh refugees clearing Terai forests in Pilibhit, UP, India (1952-1965).

## Historical Context

After the Partition of India in 1947, Sikh refugee farmers from West Punjab (Lahore, Sialkot, Lyallpur) lost their ancestral lands. The Indian government resettled many in the Terai belt of Pilibhit district, UP — dense sal forests on the Nepal border. Starting in the early 1950s, these settlers cleared jungle, drained swamps, and battled malaria, tiger attacks, snake bites, flash floods, and disease to transform wilderness into productive farmland. By the 1970s, they had created a "Little Punjab" in the Terai.

## Core Design Shift

| Oregon Trail | Terai Trail |
|-------------|-------------|
| Traveling 2000 miles | Settling 100 acres |
| Journey (wagon moves) | Settlement (land transforms) |
| Geographic biomes | Seasonal cycles |
| Western frontier | Indian Terai forest |
| Covered wagon | Bullock cart |
| Pioneer family | Sikh refugee family |
| Forts (resupply) | Government relief / Tharu villages |
| River crossings | Monsoon survival |
| Hunting game | Foraging / wildlife defense |

---

## User Scenarios & Testing

### User Story 1 — Start a New Settlement (Priority: P1)

The player opens the game, sees a dense jungle title screen with "THE TERAI TRAIL" title, creates a Sikh refugee family (naming 5 members with roles), selects an origin district that affects starting resources, purchases supplies at a government relief depot, and enters the main settlement scene.

**Why this priority**: Without this flow, there is no game. This is the entry point.

**Independent Test**: Player can click through Title → PartyCreation → Depot → Settlement without errors.

**Acceptance Scenarios**:
1. **Given** the game loads, **When** the title scene appears, **Then** "THE TERAI TRAIL" is displayed with a dense jungle background and animated bullock cart
2. **Given** the player clicks "Begin Settlement", **When** PartyCreation loads, **Then** 5 family member slots appear with roles (Sardar, Wife, Elder, Child 1, Child 2) and 3 origin district cards (Lahore, Sialkot, Lyallpur)
3. **Given** the player names their family and selects Lyallpur, **When** they proceed to the depot, **Then** starting credits reflect the Lyallpur bonus and items include Bullocks, Food, Shelter Materials, Tools, Medicine
4. **Given** the player purchases supplies, **When** they click "Begin Settlement", **Then** the Settlement scene loads with the family visible in a small clearing surrounded by dense forest

---

### User Story 2 — Survive and Clear Land (Priority: P1)

The player manages their family's daily survival: setting work pace, allocating rations, and watching acres get cleared over time. The jungle visually recedes as cleared area grows. Seasons cycle (Spring → Monsoon → Post-Monsoon → Winter), each with different dangers and visual changes.

**Why this priority**: This is the core gameplay loop — the equivalent of traveling the trail.

**Independent Test**: Player can clear at least 10 acres over multiple in-game months with visible tile changes.

**Acceptance Scenarios**:
1. **Given** the settlement scene is active, **When** the daily tick fires, **Then** acresCleared increases based on work pace, and food is consumed per person per day
2. **Given** 5 acres have been cleared, **When** the player looks at the isometric grid, **Then** approximately 5% of jungle tiles have visually changed to cleared/dirt tiles
3. **Given** the season changes from Spring to Monsoon, **When** the sky and weather update, **Then** the sky turns grey, rain particles appear, and clearing rate decreases
4. **Given** food reaches 0, **When** the daily tick fires, **Then** each family member loses 3 health per day (starvation)
5. **Given** a family member's health reaches 0, **When** the tick processes, **Then** that member is marked Dead and cannot be revived

---

### User Story 3 — Face Random Events (Priority: P1)

Random events interrupt gameplay: malaria outbreaks, tiger attacks, snake bites, flash floods, and positive events like DDT spraying or Tharu neighbors helping. Each event presents choices with tradeoffs.

**Why this priority**: Events create narrative tension and historical authenticity.

**Independent Test**: After 10+ ticks, at least one event should trigger with a choice panel.

**Acceptance Scenarios**:
1. **Given** the player has been settling for 10+ ticks, **When** a malaria event triggers, **Then** a panel appears with the event description and choices (use medicine / rest / push through)
2. **Given** a tiger attack event fires, **When** the player chooses "Defend with tools", **Then** there is a probability-based outcome (success: tiger driven off; failure: family member injured)
3. **Given** the DDT team event fires, **When** the player accepts DDT spraying, **Then** future malaria event probability permanently decreases
4. **Given** Monsoon season, **When** events roll, **Then** flood/monsoon events have higher weight than during dry season

---

### User Story 4 — Reach Milestones (Priority: P2)

As the player clears acres, they reach settlement milestones: Shelter Built (5 acres), Well Dug (10), First Harvest (30), Gurdwara Built (50), Little Punjab (100). Each milestone triggers a celebration scene with rest and story text.

**Why this priority**: Milestones provide narrative pacing and reward the player's persistence.

**Independent Test**: Clearing 5 acres triggers the Shelter Built milestone scene.

**Acceptance Scenarios**:
1. **Given** the player clears 5 acres, **When** the milestone check fires, **Then** the Milestone scene launches showing "Shelter Built" with description and rest option
2. **Given** the player reaches 100 acres, **When** the milestone check fires, **Then** the Victory scene launches with "Little Punjab Established!"
3. **Given** all family members die before 100 acres, **When** the game over check fires, **Then** the Death scene shows with tombstone and "In Memoriam" listing

---

### User Story 5 — Forage and Defend Against Wildlife (Priority: P2)

The player can choose to forage for food (hunt wild boar, deer, catch fish) or defend the settlement against predators (tigers at night, cobras in grass). Uses a click-to-interact mechanic similar to the hunting mini-game.

**Why this priority**: Provides food gathering alternative and active gameplay beyond passive tick management.

**Independent Test**: Player can enter foraging scene, catch an animal, and return with food added.

**Acceptance Scenarios**:
1. **Given** the player clicks "Forage", **When** the ForagingScene loads, **Then** animals spawn from edges and a crosshair appears
2. **Given** the player clicks on a wild boar, **When** the hit registers, **Then** "+100 lbs" floats up and food count increases
3. **Given** a tiger appears in defense mode, **When** the player clicks to scare it, **Then** the tiger is driven off (with tools) or attacks (without tools)

---

### User Story 6 — Survive Monsoon Season (Priority: P2)

During monsoon months (June-September), a special Monsoon Survival scene can trigger. The player must choose how to protect their family and settlement from flooding.

**Why this priority**: Monsoons are the Terai's defining weather feature and a major threat.

**Independent Test**: During monsoon season, the monsoon scene triggers with choice panel.

**Acceptance Scenarios**:
1. **Given** the season is Monsoon, **When** a flooding event triggers, **Then** the MonsoonScene launches with choices: Reinforce shelter / Move to high ground / Wait it out
2. **Given** the player has shelter materials, **When** they choose "Reinforce shelter", **Then** shelter materials are consumed and risk is reduced
3. **Given** the player has no shelter materials, **When** they choose "Wait it out", **Then** high probability of supply loss or family member illness

---

### User Story 7 — Audio Experience (Priority: P3)

All audio is procedurally synthesized: Punjabi-influenced settlement music, jungle ambience (insects, birds), monsoon thunder, tiger growls, and celebration dhol beats.

**Why this priority**: Audio enhances immersion but the game is playable without it.

**Independent Test**: Music plays on the settlement scene; SFX trigger on events.

**Acceptance Scenarios**:
1. **Given** the settlement scene is active, **When** music starts, **Then** a Punjabi-influenced melody loop plays
2. **Given** a tiger attack event fires, **When** the event panel appears, **Then** a tiger growl SFX plays
3. **Given** the player wins, **When** the victory scene loads, **Then** a dhol celebration beat plays

---

### Edge Cases

- What happens when all bullocks die? (Cannot clear land — must trade for new ones at milestone/relief events)
- What happens during monsoon with 0 shelter materials? (Maximum damage, high injury/death risk)
- What happens if DDT event fires twice? (Should only fire once — flag in GameState)
- What happens if food is negative? (Clamp to 0, starvation kicks in)
- What happens at 100 acres if only 1 family member alive? (Still victory, but lower score)

---

## Requirements

### Functional Requirements

- **FR-001**: Game MUST support 5 family members with roles: Sardar, Wife, Elder, Child 1, Child 2
- **FR-002**: Game MUST track: acresCleared (0-100), food, bullocks, shelterMaterials, tools, medicine, governmentCredits
- **FR-003**: Origin district selection MUST affect starting resources (Lahore: more credits, Sialkot: more tools, Lyallpur: better clearing rate)
- **FR-004**: Daily tick MUST advance date, clear land (pace-dependent), consume food, check health, roll for events
- **FR-005**: Seasons MUST cycle: Spring (Mar-May), Monsoon (Jun-Sep), Post-Monsoon (Oct-Nov), Winter (Dec-Feb)
- **FR-006**: Weather MUST change per season: CLEAR, HUMID, MONSOON_RAIN, FLOODING, DRY_HEAT, FOG
- **FR-007**: Settlement phases MUST progress: JUNGLE_CLEARING (0-33 acres), FIRST_PLANTING (34-66), ESTABLISHED_FARM (67-100)
- **FR-008**: Malaria MUST be the highest-weight event (~20%) during JUNGLE_CLEARING, decreasing after DDT milestone
- **FR-009**: All visuals MUST be procedurally drawn (no sprite sheets / image assets)
- **FR-010**: All audio MUST be synthesized via Web Audio API (no audio files)
- **FR-011**: 11 milestones MUST exist from First Acre (1) to Little Punjab (100)
- **FR-012**: Victory condition: reach 100 acres with at least 1 family member alive
- **FR-013**: Defeat condition: all family members dead
- **FR-014**: Game MUST have visual regression tests (Playwright) preventing layout regressions
- **FR-015**: Game MUST have unit tests (Vitest) for GameState, EventManager, MilestoneData

### Key Entities

- **FamilyMember**: name, health (0-100), status (Healthy/Sick/VerySick/Dead), role (sardar/wife/elder/child), disease
- **Supplies**: food (lbs), bullocks (count), shelterMaterials (units), tools (units), medicine (units), governmentCredits (rupees)
- **Milestone**: name, acresRequired, description, isCelebration flag
- **GameEvent**: id, title, description, choices (text + outcome callback)
- **Settlement**: acresCleared, currentDate, season, weather, phase, originDistrict, flags (shelterBuilt, wellDug, ddtArrived, cropsPlanted)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Player can complete a full game (title → settlement → victory/defeat) in ~30-60 minutes
- **SC-002**: All 10 scenes load without console errors (verified by Playwright)
- **SC-003**: Unit test suite passes with >90% coverage on GameState, EventManager, MilestoneData
- **SC-004**: Visual regression tests catch isometric tile/layer ordering bugs (the "mountains below carpet" class)
- **SC-005**: Malaria events fire at historically appropriate frequency (~20% in Phase 1, decreasing after DDT)
- **SC-006**: Seasonal visual transitions are visible (green monsoon → golden harvest → dusty dry season)
- **SC-007**: All 11 milestones are reachable and trigger appropriate scenes
- **SC-008**: `npm run build` produces a deployable bundle with zero external asset dependencies
