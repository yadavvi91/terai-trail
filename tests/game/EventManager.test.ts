import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettlementPhase, Season, GameEvent } from '../../src/utils/types';
import { GameState } from '../../src/game/GameState';
import { OriginDistrict } from '../../src/utils/types';

// We'll import from the new EventManager once it exists
import {
    getWeights,
    rollEvent,
    EVENT_IDS,
} from '../../src/game/EventManager';

describe('WP03 — EventManager.ts', () => {
    let gs: GameState;

    beforeEach(() => {
        (GameState as any).instance = null;
        gs = GameState.getInstance();
        gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
    });

    describe('EVENT_IDS', () => {
        it('contains Terai-specific threat events', () => {
            expect(EVENT_IDS).toContain('malaria');
            expect(EVENT_IDS).toContain('tiger_attack');
            expect(EVENT_IDS).toContain('snake_bite');
            expect(EVENT_IDS).toContain('flood');
            expect(EVENT_IDS).toContain('monsoon_damage');
            expect(EVENT_IDS).toContain('elephant_raid');
            expect(EVENT_IDS).toContain('wild_boar');
        });

        it('contains positive events', () => {
            expect(EVENT_IDS).toContain('ddt_team');
            expect(EVENT_IDS).toContain('tharu_help');
            expect(EVENT_IDS).toContain('government_relief');
            expect(EVENT_IDS).toContain('good_harvest');
        });

        it('does not contain Oregon Trail events', () => {
            expect(EVENT_IDS).not.toContain('breakdown');
            expect(EVENT_IDS).not.toContain('theft');
            expect(EVENT_IDS).not.toContain('lost_oxen');
            expect(EVENT_IDS).not.toContain('hail_storm');
            expect(EVENT_IDS).not.toContain('travelers');
            expect(EVENT_IDS).not.toContain('found_cache');
        });
    });

    describe('getWeights(phase, season, flags)', () => {
        it('returns an array of weighted events', () => {
            const weights = getWeights(
                SettlementPhase.JUNGLE_CLEARING,
                Season.MONSOON,
                gs.flags,
            );
            expect(weights.length).toBeGreaterThan(0);
            weights.forEach(w => {
                expect(w).toHaveProperty('id');
                expect(w).toHaveProperty('weight');
                expect(w.weight).toBeGreaterThanOrEqual(0);
            });
        });

        it('malaria has the highest base weight among threats', () => {
            const weights = getWeights(
                SettlementPhase.JUNGLE_CLEARING,
                Season.SPRING,
                gs.flags,
            );
            const malaria = weights.find(w => w.id === 'malaria');
            const otherThreats = weights.filter(w =>
                w.id !== 'malaria' && !['ddt_team', 'tharu_help', 'government_relief', 'good_harvest', 'refugee_joins'].includes(w.id)
            );
            otherThreats.forEach(t => {
                expect(malaria!.weight).toBeGreaterThanOrEqual(t.weight);
            });
        });

        it('malaria weight increases during monsoon', () => {
            const springWeights = getWeights(SettlementPhase.JUNGLE_CLEARING, Season.SPRING, gs.flags);
            const monsoonWeights = getWeights(SettlementPhase.JUNGLE_CLEARING, Season.MONSOON, gs.flags);
            const springMalaria = springWeights.find(w => w.id === 'malaria')!.weight;
            const monsoonMalaria = monsoonWeights.find(w => w.id === 'malaria')!.weight;
            expect(monsoonMalaria).toBeGreaterThan(springMalaria);
        });

        it('flood weight increases during monsoon', () => {
            const springWeights = getWeights(SettlementPhase.JUNGLE_CLEARING, Season.SPRING, gs.flags);
            const monsoonWeights = getWeights(SettlementPhase.JUNGLE_CLEARING, Season.MONSOON, gs.flags);
            const springFlood = springWeights.find(w => w.id === 'flood')!.weight;
            const monsoonFlood = monsoonWeights.find(w => w.id === 'flood')!.weight;
            expect(monsoonFlood).toBeGreaterThan(springFlood);
        });

        it('tiger attacks more likely in jungle clearing phase', () => {
            const jungleWeights = getWeights(SettlementPhase.JUNGLE_CLEARING, Season.SPRING, gs.flags);
            const farmWeights = getWeights(SettlementPhase.ESTABLISHED_FARM, Season.SPRING, gs.flags);
            const jungleTiger = jungleWeights.find(w => w.id === 'tiger_attack')!.weight;
            const farmTiger = farmWeights.find(w => w.id === 'tiger_attack')!.weight;
            expect(jungleTiger).toBeGreaterThan(farmTiger);
        });

        it('DDT event has 0 weight when ddtArrived flag is true', () => {
            gs.flags.ddtArrived = true;
            const weights = getWeights(SettlementPhase.JUNGLE_CLEARING, Season.SPRING, gs.flags);
            const ddt = weights.find(w => w.id === 'ddt_team');
            expect(ddt!.weight).toBe(0);
        });

        it('good_harvest only available in FIRST_PLANTING or ESTABLISHED_FARM', () => {
            const jungleWeights = getWeights(SettlementPhase.JUNGLE_CLEARING, Season.SPRING, gs.flags);
            const farmWeights = getWeights(SettlementPhase.FIRST_PLANTING, Season.SPRING, gs.flags);
            const jungleHarvest = jungleWeights.find(w => w.id === 'good_harvest')!.weight;
            const farmHarvest = farmWeights.find(w => w.id === 'good_harvest')!.weight;
            expect(jungleHarvest).toBe(0);
            expect(farmHarvest).toBeGreaterThan(0);
        });
    });

    describe('rollEvent()', () => {
        it('returns a GameEvent with id, title, description', () => {
            // Seed Math.random for determinism
            vi.spyOn(Math, 'random').mockReturnValue(0.05);
            const event = rollEvent(
                SettlementPhase.JUNGLE_CLEARING,
                Season.MONSOON,
                gs.flags,
            );
            expect(event).toHaveProperty('id');
            expect(event).toHaveProperty('title');
            expect(event).toHaveProperty('description');
            expect(event!.title.length).toBeGreaterThan(0);
            vi.restoreAllMocks();
        });

        it('events have at least one choice', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.05);
            const event = rollEvent(
                SettlementPhase.JUNGLE_CLEARING,
                Season.SPRING,
                gs.flags,
            );
            expect(event!.choices).toBeDefined();
            expect(event!.choices!.length).toBeGreaterThanOrEqual(1);
            vi.restoreAllMocks();
        });

        it('event descriptions do not mention Oregon Trail concepts', () => {
            // Test several rolls
            for (let i = 0; i < 10; i++) {
                vi.spyOn(Math, 'random').mockReturnValue(i / 10);
                const event = rollEvent(
                    SettlementPhase.JUNGLE_CLEARING,
                    Season.SPRING,
                    gs.flags,
                );
                if (event) {
                    expect(event.description).not.toMatch(/wagon|oxen|frontier|prairie|oregon/i);
                }
                vi.restoreAllMocks();
            }
        });
    });
});
