import { describe, it, expect } from 'vitest';
import { getPhase, getSeason, getDangerLevel, getHillsAlpha } from '../../src/utils/phase';
import { SettlementPhase, Season } from '../../src/utils/types';

describe('WP01 — phase.ts (replaces biome.ts)', () => {
    describe('getPhase(acresCleared)', () => {
        it('returns JUNGLE_CLEARING for 0–33 acres', () => {
            expect(getPhase(0)).toBe(SettlementPhase.JUNGLE_CLEARING);
            expect(getPhase(10)).toBe(SettlementPhase.JUNGLE_CLEARING);
            expect(getPhase(33)).toBe(SettlementPhase.JUNGLE_CLEARING);
        });

        it('returns FIRST_PLANTING for 34–66 acres', () => {
            expect(getPhase(34)).toBe(SettlementPhase.FIRST_PLANTING);
            expect(getPhase(50)).toBe(SettlementPhase.FIRST_PLANTING);
            expect(getPhase(66)).toBe(SettlementPhase.FIRST_PLANTING);
        });

        it('returns ESTABLISHED_FARM for 67–100 acres', () => {
            expect(getPhase(67)).toBe(SettlementPhase.ESTABLISHED_FARM);
            expect(getPhase(80)).toBe(SettlementPhase.ESTABLISHED_FARM);
            expect(getPhase(100)).toBe(SettlementPhase.ESTABLISHED_FARM);
        });
    });

    describe('getSeason(month)', () => {
        it('returns SPRING for Mar(2), Apr(3), May(4)', () => {
            expect(getSeason(2)).toBe(Season.SPRING);
            expect(getSeason(3)).toBe(Season.SPRING);
            expect(getSeason(4)).toBe(Season.SPRING);
        });

        it('returns MONSOON for Jun(5), Jul(6), Aug(7), Sep(8)', () => {
            expect(getSeason(5)).toBe(Season.MONSOON);
            expect(getSeason(6)).toBe(Season.MONSOON);
            expect(getSeason(7)).toBe(Season.MONSOON);
            expect(getSeason(8)).toBe(Season.MONSOON);
        });

        it('returns POST_MONSOON for Oct(9), Nov(10)', () => {
            expect(getSeason(9)).toBe(Season.POST_MONSOON);
            expect(getSeason(10)).toBe(Season.POST_MONSOON);
        });

        it('returns WINTER for Dec(11), Jan(0), Feb(1)', () => {
            expect(getSeason(11)).toBe(Season.WINTER);
            expect(getSeason(0)).toBe(Season.WINTER);
            expect(getSeason(1)).toBe(Season.WINTER);
        });
    });

    describe('getDangerLevel(phase, season)', () => {
        it('jungle clearing + monsoon is the most dangerous', () => {
            const danger = getDangerLevel(SettlementPhase.JUNGLE_CLEARING, Season.MONSOON);
            expect(danger).toBeGreaterThanOrEqual(0.7);
        });

        it('established farm + winter is the least dangerous', () => {
            const danger = getDangerLevel(SettlementPhase.ESTABLISHED_FARM, Season.WINTER);
            expect(danger).toBeLessThanOrEqual(0.3);
        });

        it('danger is always between 0 and 1', () => {
            const phases = Object.values(SettlementPhase);
            const seasons = Object.values(Season);
            for (const phase of phases) {
                for (const season of seasons) {
                    const d = getDangerLevel(phase, season);
                    expect(d).toBeGreaterThanOrEqual(0);
                    expect(d).toBeLessThanOrEqual(1);
                }
            }
        });

        it('danger decreases as farm becomes established', () => {
            const s = Season.SPRING;
            expect(getDangerLevel(SettlementPhase.JUNGLE_CLEARING, s))
                .toBeGreaterThan(getDangerLevel(SettlementPhase.FIRST_PLANTING, s));
            expect(getDangerLevel(SettlementPhase.FIRST_PLANTING, s))
                .toBeGreaterThan(getDangerLevel(SettlementPhase.ESTABLISHED_FARM, s));
        });
    });

    describe('getHillsAlpha(acresCleared)', () => {
        it('returns low alpha when jungle is dense (early clearing)', () => {
            expect(getHillsAlpha(0)).toBeLessThanOrEqual(0.5);
        });

        it('returns higher alpha as more is cleared', () => {
            expect(getHillsAlpha(50)).toBeGreaterThan(getHillsAlpha(0));
        });

        it('returns highest alpha when fully cleared', () => {
            expect(getHillsAlpha(100)).toBeGreaterThanOrEqual(0.7);
        });
    });
});
