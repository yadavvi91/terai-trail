import { describe, it, expect } from 'vitest';
import {
    TOTAL_ACRES,
    PARTY_SIZE,
    DEPOT_PRICES,
    ORIGIN_DISTRICT_DATA,
    ACRES_PER_DAY,
    FOOD_PER_PERSON_PER_DAY,
    HEALTH,
    COLORS,
    SCENES,
    PHASE_COLORS,
    SEASON_COLORS,
    SKY_GRADIENTS,
} from '../../src/utils/constants';
import { OriginDistrict, WorkPace, Rations, Weather, SettlementPhase, Season } from '../../src/utils/types';

describe('WP01 — constants.ts', () => {
    describe('core game constants', () => {
        it('TOTAL_ACRES is 100 (not 2000 miles)', () => {
            expect(TOTAL_ACRES).toBe(100);
        });

        it('PARTY_SIZE is 5', () => {
            expect(PARTY_SIZE).toBe(5);
        });

        it('does not export TOTAL_TRAIL_MILES', async () => {
            // Dynamic import to check nothing Oregon-Trail-specific leaks
            const constants = await import('../../src/utils/constants') as any;
            expect(constants.TOTAL_TRAIL_MILES).toBeUndefined();
            expect(constants.MILES_PER_DAY).toBeUndefined();
            expect(constants.STORE_PRICES).toBeUndefined();
            expect(constants.PROFESSION_DATA).toBeUndefined();
        });
    });

    describe('ORIGIN_DISTRICT_DATA', () => {
        it('has Lahore, Sialkot, Lyallpur', () => {
            expect(ORIGIN_DISTRICT_DATA[OriginDistrict.LAHORE]).toBeDefined();
            expect(ORIGIN_DISTRICT_DATA[OriginDistrict.SIALKOT]).toBeDefined();
            expect(ORIGIN_DISTRICT_DATA[OriginDistrict.LYALLPUR]).toBeDefined();
        });

        it('Lahore has the most starting credits', () => {
            const lahore = ORIGIN_DISTRICT_DATA[OriginDistrict.LAHORE].startingCredits;
            const sialkot = ORIGIN_DISTRICT_DATA[OriginDistrict.SIALKOT].startingCredits;
            const lyallpur = ORIGIN_DISTRICT_DATA[OriginDistrict.LYALLPUR].startingCredits;
            expect(lahore).toBeGreaterThan(sialkot);
            expect(lahore).toBeGreaterThan(lyallpur);
        });

        it('Sialkot gets bonus tools', () => {
            expect(ORIGIN_DISTRICT_DATA[OriginDistrict.SIALKOT].bonusTools).toBeGreaterThan(0);
        });

        it('Lyallpur gets clearing rate bonus', () => {
            expect(ORIGIN_DISTRICT_DATA[OriginDistrict.LYALLPUR].clearingRateBonus).toBeGreaterThan(0);
        });
    });

    describe('DEPOT_PRICES', () => {
        it('has prices for Terai supplies', () => {
            expect(DEPOT_PRICES.FOOD).toBeDefined();
            expect(DEPOT_PRICES.BULLOCKS).toBeDefined();
            expect(DEPOT_PRICES.SHELTER_MATERIALS).toBeDefined();
            expect(DEPOT_PRICES.TOOLS).toBeDefined();
            expect(DEPOT_PRICES.MEDICINE).toBeDefined();
        });

        it('all prices are positive numbers', () => {
            Object.values(DEPOT_PRICES).forEach(price => {
                expect(price).toBeGreaterThan(0);
            });
        });
    });

    describe('ACRES_PER_DAY', () => {
        it('maps each WorkPace to a clearing rate', () => {
            expect(ACRES_PER_DAY[WorkPace.RESTING]).toBe(0);
            expect(ACRES_PER_DAY[WorkPace.STEADY]).toBeGreaterThan(0);
            expect(ACRES_PER_DAY[WorkPace.HARD_LABOR]).toBeGreaterThan(ACRES_PER_DAY[WorkPace.STEADY]);
            expect(ACRES_PER_DAY[WorkPace.GRUELING]).toBeGreaterThan(ACRES_PER_DAY[WorkPace.HARD_LABOR]);
        });
    });

    describe('FOOD_PER_PERSON_PER_DAY', () => {
        it('maps each Rations level', () => {
            expect(FOOD_PER_PERSON_PER_DAY[Rations.FILLING]).toBe(3);
            expect(FOOD_PER_PERSON_PER_DAY[Rations.MEAGER]).toBe(2);
            expect(FOOD_PER_PERSON_PER_DAY[Rations.BARE_BONES]).toBe(1);
        });
    });

    describe('HEALTH constants', () => {
        it('defines damage and healing values', () => {
            expect(HEALTH.STARVATION_DAMAGE).toBeGreaterThan(0);
            expect(HEALTH.GRUELING_DAMAGE).toBeGreaterThan(0);
            expect(HEALTH.REST_HEALING).toBeGreaterThan(0);
            expect(HEALTH.MAX_HEALTH).toBe(100);
        });
    });

    describe('COLORS palette', () => {
        it('has Terai-specific colors', () => {
            expect(COLORS.SAL_GREEN).toBeDefined();
            expect(COLORS.JUNGLE_DARK).toBeDefined();
            expect(COLORS.MUD_WALL).toBeDefined();
            expect(COLORS.SAFFRON).toBeDefined();
        });

        it('does not have Oregon Trail colors', () => {
            expect((COLORS as any).GRASS_GREEN).toBeUndefined();
            expect((COLORS as any).TRAIL_BROWN).toBeUndefined();
        });
    });

    describe('SCENES', () => {
        it('has Terai scene keys', () => {
            expect(SCENES.SETTLEMENT).toBe('SettlementScene');
            expect(SCENES.SUPPLY_DEPOT).toBe('SupplyDepotScene');
            expect(SCENES.FORAGING).toBe('ForagingScene');
            expect(SCENES.MONSOON).toBe('MonsoonScene');
            expect(SCENES.MILESTONE).toBe('MilestoneScene');
        });

        it('does not have Oregon Trail scene keys', () => {
            expect((SCENES as any).TRAVEL).toBeUndefined();
            expect((SCENES as any).STORE).toBeUndefined();
            expect((SCENES as any).HUNTING).toBeUndefined();
            expect((SCENES as any).RIVER_CROSSING).toBeUndefined();
            expect((SCENES as any).LANDMARK).toBeUndefined();
        });
    });

    describe('PHASE_COLORS', () => {
        it('has ground colors for each settlement phase', () => {
            expect(PHASE_COLORS.GROUND[SettlementPhase.JUNGLE_CLEARING]).toBeDefined();
            expect(PHASE_COLORS.GROUND[SettlementPhase.FIRST_PLANTING]).toBeDefined();
            expect(PHASE_COLORS.GROUND[SettlementPhase.ESTABLISHED_FARM]).toBeDefined();
        });
    });

    describe('SKY_GRADIENTS', () => {
        it('has gradients for all Terai weather types', () => {
            expect(SKY_GRADIENTS[Weather.CLEAR]).toBeDefined();
            expect(SKY_GRADIENTS[Weather.HUMID]).toBeDefined();
            expect(SKY_GRADIENTS[Weather.MONSOON_RAIN]).toBeDefined();
            expect(SKY_GRADIENTS[Weather.FLOODING]).toBeDefined();
            expect(SKY_GRADIENTS[Weather.DRY_HEAT]).toBeDefined();
            expect(SKY_GRADIENTS[Weather.FOG]).toBeDefined();
        });

        it('each gradient has top and bottom', () => {
            Object.values(SKY_GRADIENTS).forEach(grad => {
                expect(grad.top).toEqual(expect.any(Number));
                expect(grad.bottom).toEqual(expect.any(Number));
            });
        });
    });
});
