import { describe, it, expect } from 'vitest';
import {
    MemberStatus,
    WorkPace,
    Rations,
    Weather,
    SettlementPhase,
    Season,
    OriginDistrict,
    FamilyRole,
} from '../../src/utils/types';

describe('WP01 — types.ts enums', () => {
    describe('SettlementPhase', () => {
        it('has three settlement phases', () => {
            expect(Object.values(SettlementPhase)).toHaveLength(3);
        });

        it('contains JUNGLE_CLEARING, FIRST_PLANTING, ESTABLISHED_FARM', () => {
            expect(SettlementPhase.JUNGLE_CLEARING).toBeDefined();
            expect(SettlementPhase.FIRST_PLANTING).toBeDefined();
            expect(SettlementPhase.ESTABLISHED_FARM).toBeDefined();
        });
    });

    describe('Season', () => {
        it('has four Indian seasons', () => {
            expect(Object.values(Season)).toHaveLength(4);
        });

        it('contains SPRING, MONSOON, POST_MONSOON, WINTER', () => {
            expect(Season.SPRING).toBeDefined();
            expect(Season.MONSOON).toBeDefined();
            expect(Season.POST_MONSOON).toBeDefined();
            expect(Season.WINTER).toBeDefined();
        });
    });

    describe('Weather', () => {
        it('has Terai-specific weather types', () => {
            const values = Object.values(Weather);
            expect(values).toContain('Clear');
            expect(values).toContain('Humid');
            expect(values).toContain('Monsoon Rain');
            expect(values).toContain('Flooding');
            expect(values).toContain('Dry Heat');
            expect(values).toContain('Fog');
        });

        it('does not contain Oregon Trail weather (Snowy, Rainy, Hot)', () => {
            const values = Object.values(Weather);
            expect(values).not.toContain('Snowy');
            expect(values).not.toContain('Rainy');
            expect(values).not.toContain('Hot');
        });
    });

    describe('WorkPace (replaces Pace)', () => {
        it('has four pace options including RESTING', () => {
            expect(Object.values(WorkPace)).toHaveLength(4);
            expect(WorkPace.RESTING).toBeDefined();
            expect(WorkPace.STEADY).toBeDefined();
            expect(WorkPace.HARD_LABOR).toBeDefined();
            expect(WorkPace.GRUELING).toBeDefined();
        });
    });

    describe('OriginDistrict (replaces Profession)', () => {
        it('has three origin districts', () => {
            expect(Object.values(OriginDistrict)).toHaveLength(3);
            expect(OriginDistrict.LAHORE).toBeDefined();
            expect(OriginDistrict.SIALKOT).toBeDefined();
            expect(OriginDistrict.LYALLPUR).toBeDefined();
        });
    });

    describe('FamilyRole', () => {
        it('has Sardar, Wife, Elder, Child', () => {
            expect(FamilyRole.SARDAR).toBeDefined();
            expect(FamilyRole.WIFE).toBeDefined();
            expect(FamilyRole.ELDER).toBeDefined();
            expect(FamilyRole.CHILD).toBeDefined();
        });
    });

    describe('MemberStatus', () => {
        it('still has HEALTHY, SICK, VERY_SICK, DEAD', () => {
            expect(MemberStatus.HEALTHY).toBe('Healthy');
            expect(MemberStatus.SICK).toBe('Sick');
            expect(MemberStatus.VERY_SICK).toBe('Very Sick');
            expect(MemberStatus.DEAD).toBe('Dead');
        });
    });

    describe('Rations', () => {
        it('still has FILLING, MEAGER, BARE_BONES', () => {
            expect(Rations.FILLING).toBeDefined();
            expect(Rations.MEAGER).toBeDefined();
            expect(Rations.BARE_BONES).toBeDefined();
        });
    });
});

describe('WP01 — types.ts interfaces (compile-time check)', () => {
    it('FamilyMember has name, health, status, role, optional disease', () => {
        // This is a compile-time check — if the interface is wrong, TS won't compile
        const member: import('../../src/utils/types').FamilyMember = {
            name: 'Harjeet Singh',
            health: 100,
            status: MemberStatus.HEALTHY,
            role: FamilyRole.SARDAR,
        };
        expect(member.name).toBe('Harjeet Singh');
        expect(member.role).toBe(FamilyRole.SARDAR);
        expect(member.disease).toBeUndefined();
    });

    it('Supplies has Terai fields, not Oregon Trail fields', () => {
        const supplies: import('../../src/utils/types').Supplies = {
            food: 100,
            bullocks: 2,
            shelterMaterials: 5,
            tools: 3,
            medicine: 2,
            governmentCredits: 500,
        };
        expect(supplies.bullocks).toBe(2);
        expect(supplies.governmentCredits).toBe(500);
        // These Oregon Trail fields should NOT exist:
        expect((supplies as any).oxen).toBeUndefined();
        expect((supplies as any).ammo).toBeUndefined();
        expect((supplies as any).spareParts).toBeUndefined();
        expect((supplies as any).money).toBeUndefined();
        expect((supplies as any).clothing).toBeUndefined();
    });

    it('Milestone has acresRequired and isCelebration', () => {
        const milestone: import('../../src/utils/types').Milestone = {
            name: 'Shelter Built',
            acresRequired: 5,
            description: 'A mud-and-thatch hut.',
            isCelebration: true,
        };
        expect(milestone.acresRequired).toBe(5);
        expect(milestone.isCelebration).toBe(true);
    });

    it('SettlementFlags tracks key settlement booleans', () => {
        const flags: import('../../src/utils/types').SettlementFlags = {
            shelterBuilt: false,
            wellDug: false,
            ddtArrived: false,
            cropsPlanted: false,
            gurdwaraFounded: false,
            schoolBuilt: false,
            canalDug: false,
        };
        expect(flags.shelterBuilt).toBe(false);
        expect(flags.ddtArrived).toBe(false);
    });
});
