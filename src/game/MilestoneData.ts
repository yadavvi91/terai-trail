// ── Terai Trail — Settlement Milestones ──
// (replaces TrailData.ts — geographic landmarks → acre-based milestones)

import { Milestone } from '../utils/types';

export const MILESTONES: Milestone[] = [
    {
        name: 'First Acre Cleared',
        acresRequired: 1,
        description: 'The first acre of sal forest has been felled. It took days of backbreaking work, but you can see the sky now. A small clearing in an ocean of jungle.',
        isCelebration: false,
    },
    {
        name: 'Shelter Built',
        acresRequired: 5,
        description: 'With five acres clear, you have built a proper mud-and-thatch hut. No more sleeping under the bullock cart. The family has a roof over their heads for the first time since leaving Punjab.',
        isCelebration: true,
    },
    {
        name: 'Well Dug',
        acresRequired: 10,
        description: 'Ten acres cleared and a well dug. Clean water at last — no more drinking from the swampy streams. The children are healthier already.',
        isCelebration: true,
    },
    {
        name: 'DDT Team Arrives',
        acresRequired: 20,
        description: 'A government DDT spraying team has reached your settlement! They spray the surrounding jungle and stagnant water. The mosquitoes retreat. Malaria cases should drop.',
        isCelebration: true,
    },
    {
        name: 'First Harvest',
        acresRequired: 30,
        description: 'Thirty acres of golden wheat sway in the breeze. Your first harvest in the Terai! The family gathers grain with tears in their eyes — it reminds them of the fields they left behind in Punjab.',
        isCelebration: true,
    },
    {
        name: 'Tharu Alliance',
        acresRequired: 40,
        description: 'The local Tharu people, who have lived in this jungle for generations, have accepted you as neighbors. They share their knowledge of the forest — which plants heal, which streams flood, where the tigers roam.',
        isCelebration: true,
    },
    {
        name: 'Gurdwara Founded',
        acresRequired: 50,
        description: 'Fifty acres! The community has pooled resources to build a small gurdwara. The Guru Granth Sahib has a proper home. On Sundays, the sound of kirtan carries across the cleared fields.',
        isCelebration: true,
    },
    {
        name: 'School Built',
        acresRequired: 65,
        description: 'A one-room school stands near the gurdwara. The children will learn to read and write — in Gurmukhi and Hindi both. This settlement is becoming a village.',
        isCelebration: true,
    },
    {
        name: 'Canal Dug',
        acresRequired: 80,
        description: 'Eighty acres cleared and an irrigation canal connects your fields to the Sharda Canal system. Reliable water for crops means the days of depending on monsoon rains are over.',
        isCelebration: true,
    },
    {
        name: 'Market Road',
        acresRequired: 90,
        description: 'A proper road now connects your settlement to Pilibhit town. Bullock carts carry grain to market and return with supplies. You are no longer isolated in the jungle.',
        isCelebration: true,
    },
    {
        name: 'Little Punjab Established',
        acresRequired: 100,
        description: 'One hundred acres of productive farmland where impenetrable jungle once stood. A gurdwara, a school, a market road, irrigation canals — this is home now. The neighbors call it "Chhota Punjab." You have built a new Punjab in the Terai.',
        isCelebration: true,
    },
];

export function getMilestone(acresCleared: number): Milestone | null {
    return MILESTONES.find(m => m.acresRequired === Math.floor(acresCleared)) ?? null;
}

export function getNextMilestone(acresCleared: number): Milestone | null {
    return MILESTONES.find(m => m.acresRequired > acresCleared) ?? null;
}

export function getCurrentMilestone(acresCleared: number): Milestone | null {
    return [...MILESTONES].reverse().find(m => m.acresRequired <= acresCleared) ?? null;
}

export function getAllMilestones(): Milestone[] {
    return MILESTONES;
}
