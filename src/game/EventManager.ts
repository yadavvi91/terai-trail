// ── Terai Trail — Event Manager ──
// Weighted random events, modulated by settlement phase, season, and flags

import { GameEvent, SettlementPhase, Season, SettlementFlags, MemberStatus } from '../utils/types';
import { GameState } from './GameState';

export interface WeightedEvent {
    id: string;
    weight: number;
}

// All event IDs in the game
export const EVENT_IDS = [
    // Threats
    'malaria',
    'tiger_attack',
    'snake_bite',
    'flood',
    'smallpox',
    'dysentery',
    'elephant_raid',
    'monsoon_damage',
    'wild_boar',
    // Positive
    'ddt_team',
    'tharu_help',
    'refugee_joins',
    'good_harvest',
    'government_relief',
];

// ── Base weights ──
const BASE_WEIGHTS: Record<string, number> = {
    malaria: 20,
    tiger_attack: 8,
    snake_bite: 8,
    flood: 6,
    smallpox: 5,
    dysentery: 5,
    elephant_raid: 5,
    monsoon_damage: 4,
    wild_boar: 4,
    ddt_team: 6,
    tharu_help: 6,
    refugee_joins: 6,
    good_harvest: 5,
    government_relief: 5,
};

/**
 * Compute dynamic weights based on phase, season, and settlement flags.
 */
export function getWeights(
    phase: SettlementPhase,
    season: Season,
    flags: SettlementFlags,
): WeightedEvent[] {
    return EVENT_IDS.map(id => {
        let weight = BASE_WEIGHTS[id] ?? 0;

        // ── Season modifiers ──
        if (season === Season.MONSOON) {
            if (id === 'malaria') weight *= 1.5;
            if (id === 'flood') weight *= 2.0;
            if (id === 'monsoon_damage') weight *= 2.0;
        }

        if (season === Season.WINTER) {
            if (id === 'malaria') weight *= 0.5;
            if (id === 'snake_bite') weight *= 0.5;
        }

        // ── Phase modifiers ──
        if (id === 'tiger_attack') {
            if (phase === SettlementPhase.FIRST_PLANTING) weight *= 0.6;
            if (phase === SettlementPhase.ESTABLISHED_FARM) weight *= 0.3;
        }

        if (id === 'elephant_raid') {
            if (phase === SettlementPhase.ESTABLISHED_FARM) weight *= 0.4;
        }

        // Good harvest only after planting
        if (id === 'good_harvest') {
            if (phase === SettlementPhase.JUNGLE_CLEARING) weight = 0;
        }

        // ── Flag modifiers ──

        // DDT event fires only once
        if (id === 'ddt_team' && flags.ddtArrived) {
            weight = 0;
        }

        // After DDT, malaria drops
        if (id === 'malaria' && flags.ddtArrived) {
            weight *= 0.4;
        }

        // After shelter, monsoon damage less severe
        if (id === 'monsoon_damage' && flags.shelterBuilt) {
            weight *= 0.6;
        }

        return { id, weight };
    });
}

// ── Helper: pick random alive family member ──
function randomMember(): import('../utils/types').FamilyMember | null {
    const gs = GameState.getInstance();
    const alive = gs.family.filter(m => m.status !== MemberStatus.DEAD);
    if (alive.length === 0) return null;
    return alive[Math.floor(Math.random() * alive.length)];
}

function dmgMember(amount: number): string {
    const m = randomMember();
    if (!m) return 'your family';
    m.health = Math.max(0, m.health - amount);
    if (m.health <= 0) m.status = MemberStatus.DEAD;
    return m.name;
}

// ── Event definitions ──
function buildEvent(id: string): GameEvent {
    const gs = GameState.getInstance();
    const memberName = randomMember()?.name ?? 'A family member';

    switch (id) {
        case 'malaria':
            return {
                id, title: 'Malaria Strikes!',
                description: `${memberName} is burning with fever. The mosquitoes in the Terai carry malaria — it is the greatest killer in the jungle.`,
                choices: [
                    {
                        text: 'Use medicine (costs 1 unit)',
                        outcome: () => {
                            if (gs.supplies.medicine > 0) {
                                gs.supplies.medicine--;
                                const m = randomMember(); if (m) m.health = Math.min(100, m.health + 15);
                            } else { dmgMember(25); }
                        },
                    },
                    {
                        text: 'Rest and pray (lose 2 days)',
                        outcome: () => { gs.advanceDay(); gs.advanceDay(); dmgMember(15); },
                    },
                ],
            };

        case 'tiger_attack':
            return {
                id, title: 'Tiger Attack!',
                description: 'A Royal Bengal tiger has been spotted near the settlement. The children must stay inside. The men prepare to defend the camp.',
                choices: [
                    {
                        text: 'Build fires and make noise (lose 1 day)',
                        outcome: () => { gs.advanceDay(); },
                    },
                    {
                        text: 'Try to drive it away (risky)',
                        outcome: () => {
                            if (Math.random() < 0.4) { /* success, no damage */ }
                            else { dmgMember(30); }
                        },
                    },
                ],
            };

        case 'snake_bite':
            return {
                id, title: 'Snake Bite!',
                description: `${memberName} was bitten by a krait while clearing undergrowth!`,
                choices: [
                    {
                        text: 'Use medicine immediately (costs 1 unit)',
                        outcome: () => {
                            if (gs.supplies.medicine > 0) { gs.supplies.medicine--; }
                            else { dmgMember(25); }
                        },
                    },
                    {
                        text: 'Apply traditional remedy (rest 1 day)',
                        outcome: () => { gs.advanceDay(); dmgMember(10); },
                    },
                ],
            };

        case 'flood':
            return {
                id, title: 'Flash Flood!',
                description: 'The river has burst its banks! Water is rushing through the settlement. Supplies are at risk.',
                choices: [
                    {
                        text: 'Move to high ground (lose supplies)',
                        outcome: () => { gs.supplies.food = Math.max(0, gs.supplies.food - 30); },
                    },
                    {
                        text: 'Try to save everything (risky)',
                        outcome: () => {
                            if (Math.random() < 0.5) { gs.supplies.food = Math.max(0, gs.supplies.food - 10); }
                            else { dmgMember(20); gs.supplies.food = Math.max(0, gs.supplies.food - 50); }
                        },
                    },
                ],
            };

        case 'smallpox':
            return {
                id, title: 'Smallpox Outbreak!',
                description: `${memberName} has developed a high fever and rash. Smallpox is spreading through the settlement.`,
                choices: [
                    {
                        text: 'Quarantine and rest (lose 3 days)',
                        outcome: () => { gs.advanceDay(); gs.advanceDay(); gs.advanceDay(); },
                    },
                    {
                        text: 'Use medicine (costs 1 unit)',
                        outcome: () => {
                            if (gs.supplies.medicine > 0) { gs.supplies.medicine--; }
                            else { dmgMember(30); }
                        },
                    },
                ],
            };

        case 'dysentery':
            return {
                id, title: 'Dysentery!',
                description: `${memberName} has fallen ill with dysentery from contaminated water.`,
                choices: [
                    {
                        text: 'Rest for two days',
                        outcome: () => { gs.advanceDay(); gs.advanceDay(); dmgMember(10); },
                    },
                    {
                        text: 'Press on (serious risk)',
                        outcome: () => { dmgMember(25); },
                    },
                ],
            };

        case 'elephant_raid':
            return {
                id, title: 'Elephant Raid!',
                description: 'A herd of wild elephants has trampled through your fields, destroying crops and shelter materials.',
                choices: [
                    {
                        text: 'Retreat and wait (lose 1 day + supplies)',
                        outcome: () => {
                            gs.advanceDay();
                            gs.supplies.shelterMaterials = Math.max(0, gs.supplies.shelterMaterials - 2);
                        },
                    },
                    {
                        text: 'Try to scare them off with fire (risky)',
                        outcome: () => {
                            if (Math.random() < 0.3) { /* success */ }
                            else { dmgMember(20); gs.supplies.shelterMaterials = Math.max(0, gs.supplies.shelterMaterials - 3); }
                        },
                    },
                ],
            };

        case 'monsoon_damage':
            return {
                id, title: 'Monsoon Damage!',
                description: 'Heavy rains have weakened the shelter walls. Water is leaking in. Tools are rusting.',
                choices: [
                    {
                        text: 'Repair immediately (costs 1 tool + 1 day)',
                        outcome: () => {
                            gs.advanceDay();
                            gs.supplies.tools = Math.max(0, gs.supplies.tools - 1);
                        },
                    },
                    {
                        text: 'Wait for rain to stop (lose 2 days)',
                        outcome: () => { gs.advanceDay(); gs.advanceDay(); },
                    },
                ],
            };

        case 'wild_boar':
            return {
                id, title: 'Wild Boar in the Fields!',
                description: 'Wild boar have been digging up your cleared land. You must chase them off before they destroy more.',
                choices: [
                    {
                        text: 'Hunt the boar (gain food, lose 1 day)',
                        outcome: () => { gs.advanceDay(); gs.supplies.food += 25; },
                    },
                    {
                        text: 'Build a fence (costs 1 tool)',
                        outcome: () => { gs.supplies.tools = Math.max(0, gs.supplies.tools - 1); },
                    },
                ],
            };

        case 'ddt_team':
            return {
                id, title: 'Government DDT Team!',
                description: 'A government malaria eradication team has arrived! They will spray the surrounding jungle. Mosquito-borne illness should decrease.',
                choices: [
                    {
                        text: 'Welcome them gratefully',
                        outcome: () => { gs.flags.ddtArrived = true; },
                    },
                ],
            };

        case 'tharu_help':
            return {
                id, title: 'Tharu Villagers Help!',
                description: 'The local Tharu people bring medicinal herbs and share their knowledge of the forest. They show which plants cure fever.',
                choices: [
                    {
                        text: 'Accept their help (gain 2 medicine)',
                        outcome: () => { gs.supplies.medicine += 2; },
                    },
                    {
                        text: 'Share food in return (give 20 lbs, gain 1 medicine)',
                        outcome: () => {
                            gs.supplies.food = Math.max(0, gs.supplies.food - 20);
                            gs.supplies.medicine += 1;
                        },
                    },
                ],
            };

        case 'refugee_joins':
            return {
                id, title: 'Refugee Family Arrives!',
                description: 'Another Sikh family from Punjab has heard about your settlement and wants to join. More hands to clear the land.',
                choices: [
                    {
                        text: 'Welcome them (bonus clearing for 3 days)',
                        outcome: () => { gs.clearAcres(1.5); },
                    },
                    {
                        text: 'Share food to help them settle (give 30 lbs)',
                        outcome: () => { gs.supplies.food = Math.max(0, gs.supplies.food - 30); gs.clearAcres(2); },
                    },
                ],
            };

        case 'good_harvest':
            return {
                id, title: 'Bountiful Harvest!',
                description: 'The monsoon rains were kind this year. The wheat crop is magnificent — golden stalks heavy with grain. The family celebrates.',
                choices: [
                    {
                        text: 'Store the grain (gain 50 lbs food)',
                        outcome: () => { gs.supplies.food += 50; },
                    },
                    {
                        text: 'Sell some at market (gain 30 credits)',
                        outcome: () => {
                            gs.supplies.governmentCredits += 30;
                            gs.supplies.food += 20;
                        },
                    },
                ],
            };

        case 'government_relief':
            return {
                id, title: 'Government Relief Supplies!',
                description: 'A government supply caravan has arrived with rations, tools, and medicine for the settlers.',
                choices: [
                    {
                        text: 'Accept the supplies gratefully',
                        outcome: () => {
                            gs.supplies.food += 30;
                            gs.supplies.medicine += 1;
                            gs.supplies.tools += 1;
                        },
                    },
                ],
            };

        default:
            return {
                id: 'unknown', title: 'A Quiet Day',
                description: 'The jungle hums with insects. Nothing eventful happens today.',
                choices: [{ text: 'Continue working', outcome: () => {} }],
            };
    }
}

/**
 * Roll a random event based on weighted probabilities.
 */
export function rollEvent(
    phase: SettlementPhase,
    season: Season,
    flags: SettlementFlags,
): GameEvent | null {
    const weights = getWeights(phase, season, flags);
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    if (totalWeight === 0) return null;

    let roll = Math.random() * totalWeight;
    for (const w of weights) {
        roll -= w.weight;
        if (roll <= 0) {
            return buildEvent(w.id);
        }
    }

    // Fallback (shouldn't happen)
    return buildEvent(weights[weights.length - 1].id);
}
