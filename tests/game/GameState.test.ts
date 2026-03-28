import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/game/GameState';
import { OriginDistrict, WorkPace, Weather, Rations, MemberStatus } from '../../src/utils/types';
import { ORIGIN_DISTRICT_DATA, TOTAL_ACRES } from '../../src/utils/constants';

describe('WP02 — GameState.ts', () => {
    let gs: GameState;

    beforeEach(() => {
        // Reset singleton between tests
        (GameState as any).instance = null;
        gs = GameState.getInstance();
    });

    describe('singleton', () => {
        it('returns the same instance', () => {
            expect(GameState.getInstance()).toBe(gs);
        });
    });

    describe('startGame()', () => {
        it('initializes with 0 acres cleared', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            expect(gs.acresCleared).toBe(0);
        });

        it('sets origin district instead of profession', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.SIALKOT);
            expect(gs.originDistrict).toBe(OriginDistrict.SIALKOT);
        });

        it('creates 5 family members with correct roles', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            expect(gs.family).toHaveLength(5);
            expect(gs.family[0].name).toBe('Harjeet');
        });

        it('starts in 1952', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            expect(gs.currentDate.getFullYear()).toBe(1952);
        });

        it('sets starting credits based on origin district', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            expect(gs.supplies.governmentCredits).toBe(ORIGIN_DISTRICT_DATA[OriginDistrict.LAHORE].startingCredits);
        });

        it('Sialkot gets bonus tools', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.SIALKOT);
            expect(gs.supplies.tools).toBe(ORIGIN_DISTRICT_DATA[OriginDistrict.SIALKOT].bonusTools);
        });

        it('initializes all settlement flags to false', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            expect(gs.flags.shelterBuilt).toBe(false);
            expect(gs.flags.wellDug).toBe(false);
            expect(gs.flags.ddtArrived).toBe(false);
            expect(gs.flags.cropsPlanted).toBe(false);
            expect(gs.flags.gurdwaraFounded).toBe(false);
        });

        it('does not have Oregon Trail properties', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            expect((gs as any).milesTraveled).toBeUndefined();
            expect((gs as any).profession).toBeUndefined();
            expect((gs as any).nextLandmarkIndex).toBeUndefined();
        });
    });

    describe('clearAcres()', () => {
        beforeEach(() => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
        });

        it('adds acres to acresCleared', () => {
            gs.clearAcres(5);
            expect(gs.acresCleared).toBe(5);
        });

        it('does not exceed TOTAL_ACRES', () => {
            gs.clearAcres(200);
            expect(gs.acresCleared).toBe(TOTAL_ACRES);
        });
    });

    describe('consumeFood()', () => {
        beforeEach(() => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            gs.supplies.food = 100;
        });

        it('reduces food supply', () => {
            gs.consumeFood(15);
            expect(gs.supplies.food).toBe(85);
        });

        it('food does not go below 0', () => {
            gs.consumeFood(200);
            expect(gs.supplies.food).toBe(0);
        });
    });

    describe('spendCredits()', () => {
        beforeEach(() => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
        });

        it('deducts credits and returns true if sufficient', () => {
            const result = gs.spendCredits(100);
            expect(result).toBe(true);
            expect(gs.supplies.governmentCredits).toBe(400);
        });

        it('returns false if insufficient credits', () => {
            const result = gs.spendCredits(10000);
            expect(result).toBe(false);
            expect(gs.supplies.governmentCredits).toBe(500); // unchanged
        });
    });

    describe('getAliveMemberCount()', () => {
        it('returns count of alive family members', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            expect(gs.getAliveMemberCount()).toBe(5);
        });

        it('decreases when a member dies', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            gs.family[0].status = MemberStatus.DEAD;
            expect(gs.getAliveMemberCount()).toBe(4);
        });
    });

    describe('isGameOver()', () => {
        it('returns true when all members are dead', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            gs.family.forEach(m => m.status = MemberStatus.DEAD);
            expect(gs.isGameOver()).toBe(true);
        });

        it('returns false when at least one member alive', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            expect(gs.isGameOver()).toBe(false);
        });
    });

    describe('isVictory()', () => {
        it('returns true when 100 acres cleared with alive members', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            gs.acresCleared = TOTAL_ACRES;
            expect(gs.isVictory()).toBe(true);
        });

        it('returns false when 100 acres but everyone dead', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            gs.acresCleared = TOTAL_ACRES;
            gs.family.forEach(m => m.status = MemberStatus.DEAD);
            expect(gs.isVictory()).toBe(false);
        });

        it('returns false when not enough acres', () => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
            gs.acresCleared = 50;
            expect(gs.isVictory()).toBe(false);
        });
    });

    describe('date management', () => {
        beforeEach(() => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
        });

        it('advanceDay moves date forward by 1 day', () => {
            const before = gs.currentDate.getDate();
            gs.advanceDay();
            expect(gs.currentDate.getDate()).toBe(before + 1);
        });

        it('getFormattedDate returns readable format', () => {
            const formatted = gs.getFormattedDate();
            expect(formatted).toMatch(/Mar 1, 1952/);
        });
    });

    describe('speed multiplier', () => {
        beforeEach(() => {
            gs.startGame(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet'], OriginDistrict.LAHORE);
        });

        it('starts at 1x', () => {
            expect(gs.speedMultiplier).toBe(1);
        });

        it('cycles through speed options', () => {
            gs.cycleSpeed();
            expect(gs.speedMultiplier).toBe(2);
            gs.cycleSpeed();
            expect(gs.speedMultiplier).toBe(4);
        });

        it('resetSpeed returns to 1x', () => {
            gs.cycleSpeed();
            gs.resetSpeed();
            expect(gs.speedMultiplier).toBe(1);
        });
    });
});
