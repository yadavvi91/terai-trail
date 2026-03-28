import { describe, it, expect } from 'vitest';
import { Party } from '../../src/game/Party';
import { MemberStatus, FamilyRole } from '../../src/utils/types';

describe('Party.ts (Terai)', () => {
    describe('constructor', () => {
        it('creates family members with FamilyRole assignments', () => {
            const party = new Party(['Harjeet', 'Kamal', 'Baba Ji', 'Preet', 'Geet']);
            expect(party.members).toHaveLength(5);
            expect(party.members[0].role).toBe(FamilyRole.SARDAR);
            expect(party.members[1].role).toBe(FamilyRole.WIFE);
            expect(party.members[2].role).toBe(FamilyRole.ELDER);
            expect(party.members[3].role).toBe(FamilyRole.CHILD);
            expect(party.members[4].role).toBe(FamilyRole.CHILD);
        });

        it('all members start with 100 health and HEALTHY status', () => {
            const party = new Party(['A', 'B', 'C', 'D', 'E']);
            party.members.forEach(m => {
                expect(m.health).toBe(100);
                expect(m.status).toBe(MemberStatus.HEALTHY);
            });
        });

        it('caps at 5 members', () => {
            const party = new Party(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
            expect(party.members).toHaveLength(5);
        });

        it('trims names and defaults empty to Unknown', () => {
            const party = new Party(['  Harjeet  ', '', 'Baba Ji', 'Preet', 'Geet']);
            expect(party.members[0].name).toBe('Harjeet');
            expect(party.members[1].name).toBe('Unknown');
        });
    });

    describe('getAlive()', () => {
        it('returns only alive members', () => {
            const party = new Party(['A', 'B', 'C', 'D', 'E']);
            party.members[0].status = MemberStatus.DEAD;
            expect(party.getAlive()).toHaveLength(4);
        });
    });

    describe('isWiped()', () => {
        it('returns true when all dead', () => {
            const party = new Party(['A', 'B', 'C', 'D', 'E']);
            party.members.forEach(m => m.status = MemberStatus.DEAD);
            expect(party.isWiped()).toBe(true);
        });

        it('returns false when someone alive', () => {
            const party = new Party(['A', 'B', 'C', 'D', 'E']);
            expect(party.isWiped()).toBe(false);
        });
    });

    describe('getAverageHealth()', () => {
        it('returns average of alive members', () => {
            const party = new Party(['A', 'B']);
            party.members[0].health = 80;
            party.members[1].health = 60;
            expect(party.getAverageHealth()).toBe(70);
        });

        it('returns 0 when all dead', () => {
            const party = new Party(['A']);
            party.members[0].status = MemberStatus.DEAD;
            expect(party.getAverageHealth()).toBe(0);
        });
    });

    describe('applyDailyHealthEffects()', () => {
        it('starvation reduces health when no food', () => {
            const party = new Party(['A', 'B', 'C', 'D', 'E']);
            party.applyDailyHealthEffects(0);
            party.members.forEach(m => {
                expect(m.health).toBeLessThan(100);
            });
        });

        it('returns total food consumed', () => {
            const party = new Party(['A', 'B', 'C', 'D', 'E']);
            const consumed = party.applyDailyHealthEffects(3);
            expect(consumed).toBe(15); // 3 per person × 5
        });

        it('member dies when health reaches 0', () => {
            const party = new Party(['A']);
            party.members[0].health = 1;
            party.applyDailyHealthEffects(0); // starvation
            expect(party.members[0].status).toBe(MemberStatus.DEAD);
            expect(party.members[0].health).toBe(0);
        });
    });
});
