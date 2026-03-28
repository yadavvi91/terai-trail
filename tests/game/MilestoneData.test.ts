import { describe, it, expect } from 'vitest';
import {
    MILESTONES,
    getMilestone,
    getNextMilestone,
    getCurrentMilestone,
    getAllMilestones,
} from '../../src/game/MilestoneData';

describe('WP02 — MilestoneData.ts', () => {
    describe('MILESTONES array', () => {
        it('has 11 milestones', () => {
            expect(MILESTONES).toHaveLength(11);
        });

        it('starts at 1 acre and ends at 100 acres', () => {
            expect(MILESTONES[0].acresRequired).toBe(1);
            expect(MILESTONES[MILESTONES.length - 1].acresRequired).toBe(100);
        });

        it('is sorted in ascending order of acresRequired', () => {
            for (let i = 1; i < MILESTONES.length; i++) {
                expect(MILESTONES[i].acresRequired).toBeGreaterThan(MILESTONES[i - 1].acresRequired);
            }
        });

        it('includes key milestones: Shelter Built, First Harvest, Gurdwara, Little Punjab', () => {
            const names = MILESTONES.map(m => m.name);
            expect(names).toContain('Shelter Built');
            expect(names).toContain('First Harvest');
            expect(names).toContain('Gurdwara Founded');
            expect(names).toContain('Little Punjab Established');
        });

        it('Shelter Built is at 5 acres', () => {
            const shelter = MILESTONES.find(m => m.name === 'Shelter Built');
            expect(shelter?.acresRequired).toBe(5);
        });

        it('DDT Team Arrives is at 20 acres', () => {
            const ddt = MILESTONES.find(m => m.name === 'DDT Team Arrives');
            expect(ddt?.acresRequired).toBe(20);
        });

        it('every milestone has a non-empty description', () => {
            MILESTONES.forEach(m => {
                expect(m.description.length).toBeGreaterThan(0);
            });
        });

        it('does not reference Oregon Trail landmarks', () => {
            const allText = MILESTONES.map(m => m.name + m.description).join(' ');
            expect(allText).not.toContain('Chimney Rock');
            expect(allText).not.toContain('Fort Laramie');
            expect(allText).not.toContain('Willamette');
            expect(allText).not.toContain('Independence, MO');
        });
    });

    describe('getMilestone(acresCleared)', () => {
        it('returns null when no milestone matches exactly', () => {
            expect(getMilestone(2)).toBeNull();
            expect(getMilestone(99)).toBeNull();
        });

        it('returns the milestone at exact threshold', () => {
            expect(getMilestone(1)?.name).toBe('First Acre Cleared');
            expect(getMilestone(5)?.name).toBe('Shelter Built');
            expect(getMilestone(100)?.name).toBe('Little Punjab Established');
        });
    });

    describe('getNextMilestone(acresCleared)', () => {
        it('returns First Acre Cleared when at 0 acres', () => {
            expect(getNextMilestone(0)?.name).toBe('First Acre Cleared');
        });

        it('returns Shelter Built when at 1 acre', () => {
            expect(getNextMilestone(1)?.name).toBe('Shelter Built');
        });

        it('returns null when at 100 acres (all milestones achieved)', () => {
            expect(getNextMilestone(100)).toBeNull();
        });
    });

    describe('getCurrentMilestone(acresCleared)', () => {
        it('returns null when no milestones achieved', () => {
            expect(getCurrentMilestone(0)).toBeNull();
        });

        it('returns First Acre Cleared at 3 acres', () => {
            expect(getCurrentMilestone(3)?.name).toBe('First Acre Cleared');
        });

        it('returns Shelter Built at 7 acres', () => {
            expect(getCurrentMilestone(7)?.name).toBe('Shelter Built');
        });

        it('returns Little Punjab at 100 acres', () => {
            expect(getCurrentMilestone(100)?.name).toBe('Little Punjab Established');
        });
    });

    describe('getAllMilestones()', () => {
        it('returns all 11 milestones', () => {
            expect(getAllMilestones()).toHaveLength(11);
        });
    });
});
