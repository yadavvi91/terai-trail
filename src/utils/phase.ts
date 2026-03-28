// ── Terai Trail — Settlement Phases & Indian Seasons ──
// (replaces biome.ts — geographic biomes → temporal phases)

import { SettlementPhase, Season } from './types';

/**
 * Returns the settlement phase based on acres cleared.
 * Jungle Clearing: 0–33 | First Planting: 34–66 | Established Farm: 67–100
 */
export function getPhase(acresCleared: number): SettlementPhase {
    if (acresCleared < 34) return SettlementPhase.JUNGLE_CLEARING;
    if (acresCleared < 67) return SettlementPhase.FIRST_PLANTING;
    return SettlementPhase.ESTABLISHED_FARM;
}

/**
 * Returns the Indian season for a given month (0-indexed, JS Date.getMonth()).
 * Spring: Mar(2)–May(4) | Monsoon: Jun(5)–Sep(8) | Post-Monsoon: Oct(9)–Nov(10) | Winter: Dec(11)–Feb(1)
 */
export function getSeason(month: number): Season {
    if (month >= 2 && month <= 4) return Season.SPRING;
    if (month >= 5 && month <= 8) return Season.MONSOON;
    if (month >= 9 && month <= 10) return Season.POST_MONSOON;
    return Season.WINTER;
}

/**
 * Returns a danger level (0–1) based on phase and season.
 * Higher in jungle clearing + monsoon, lower in established farm + winter.
 */
export function getDangerLevel(phase: SettlementPhase, season: Season): number {
    let base = 0;

    switch (phase) {
        case SettlementPhase.JUNGLE_CLEARING:
            base = 0.6;
            break;
        case SettlementPhase.FIRST_PLANTING:
            base = 0.4;
            break;
        case SettlementPhase.ESTABLISHED_FARM:
            base = 0.2;
            break;
    }

    switch (season) {
        case Season.MONSOON:
            base += 0.2;
            break;
        case Season.SPRING:
            base += 0.05;
            break;
        case Season.POST_MONSOON:
            base += 0.0;
            break;
        case Season.WINTER:
            base -= 0.05;
            break;
    }

    return Math.max(0, Math.min(1, base));
}

/**
 * Returns the Shivalik hills alpha (backdrop visibility).
 * Clearer as jungle is removed, revealing more of the hills behind.
 */
export function getHillsAlpha(acresCleared: number): number {
    if (acresCleared < 10) return 0.4;
    if (acresCleared < 50) return 0.6;
    return 0.8;
}
