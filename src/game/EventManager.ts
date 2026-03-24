import { GameEvent } from '../utils/types';
import { MemberStatus } from '../utils/types';
import { GameState } from './GameState';
import { Pace } from '../utils/types';

function randomMember() {
    const gs = GameState.getInstance();
    const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD);
    if (alive.length === 0) return null;
    return alive[Math.floor(Math.random() * alive.length)];
}

function dmgMember(amount: number): string {
    const m = randomMember();
    if (!m) return 'your party';
    m.health = Math.max(0, m.health - amount);
    if (m.health <= 0) m.status = MemberStatus.DEAD;
    return m.name;
}

export function generateRandomEvent(): GameEvent {
    const gs = GameState.getInstance();
    const roll = Math.random();

    // Illness events — ~30% of all events
    if (roll < 0.12) {
        const diseases = ['dysentery', 'typhoid fever', 'cholera', 'measles'];
        const disease = diseases[Math.floor(Math.random() * diseases.length)];
        return {
            id: 'disease',
            title: 'Illness Strikes!',
            description: `${randomMember()?.name ?? 'A party member'} has come down with ${disease}. Their health is declining.`,
            choices: [
                {
                    text: 'Rest for a day (lose 1 day, regain some health)',
                    outcome: () => {
                        gs.advanceDay();
                        const m = randomMember();
                        if (m) m.health = Math.min(100, m.health + 20);
                    },
                },
                {
                    text: 'Press on (save time, risk worsening)',
                    outcome: () => {
                        dmgMember(20);
                    },
                },
            ],
        };
    }

    if (roll < 0.20) {
        return {
            id: 'injury',
            title: 'Injury!',
            description: `${randomMember()?.name ?? 'A party member'} twisted their ankle on the rocky trail. They are slowed down.`,
            choices: [
                {
                    text: 'Rest for a day',
                    outcome: () => {
                        gs.advanceDay();
                        const m = randomMember();
                        if (m) m.health = Math.min(100, m.health + 15);
                    },
                },
                { text: 'Continue travelling', outcome: () => { dmgMember(10); } },
            ],
        };
    }

    if (roll < 0.28) {
        const part = ['wagon wheel', 'wagon axle', 'wagon tongue'][Math.floor(Math.random() * 3)];
        const hasParts = gs.supplies.spareParts > 0;
        return {
            id: 'breakdown',
            title: 'Wagon Breakdown!',
            description: `Your ${part} has broken. ${hasParts ? 'You have spare parts to fix it.' : 'You have no spare parts!'}`,
            choices: hasParts
                ? [
                    {
                        text: 'Repair with spare parts (costs 1 set)',
                        outcome: () => { gs.supplies.spareParts = Math.max(0, gs.supplies.spareParts - 1); },
                    },
                    {
                        text: 'Abandon the wagon part (lose speed for a day)',
                        outcome: () => { gs.advanceDay(); },
                    },
                ]
                : [
                    {
                        text: 'Spend a day trying to fix it (lose 1 day)',
                        outcome: () => { gs.advanceDay(); },
                    },
                    {
                        text: 'Press on as best you can',
                        outcome: () => { dmgMember(5); },
                    },
                ],
        };
    }

    if (roll < 0.34) {
        return {
            id: 'theft',
            title: 'Theft in the Night!',
            description: 'Bandits raided your camp while you slept. You lost some supplies.',
            choices: [
                {
                    text: 'Accept the loss and move on',
                    outcome: () => {
                        gs.supplies.food = Math.max(0, gs.supplies.food - 50);
                        gs.supplies.ammo = Math.max(0, gs.supplies.ammo - 2);
                    },
                },
                {
                    text: 'Chase them! (risky)',
                    outcome: () => {
                        if (Math.random() < 0.4) {
                            gs.supplies.food = Math.max(0, gs.supplies.food - 20);
                        } else {
                            dmgMember(15);
                            gs.supplies.food = Math.max(0, gs.supplies.food - 50);
                        }
                    },
                },
            ],
        };
    }

    if (roll < 0.40) {
        const amount = Math.floor(Math.random() * 30) + 10;
        return {
            id: 'wild_fruit',
            title: 'Wild Berries Found!',
            description: `Your party found ${amount} lbs of wild berries and edible roots. A welcome addition to your stores!`,
            choices: [
                {
                    text: 'Gather them (add to food supply)',
                    outcome: () => { gs.supplies.food += amount; },
                },
                {
                    text: 'Leave them (uncertain if safe)',
                    outcome: () => {},
                },
            ],
        };
    }

    if (roll < 0.46) {
        return {
            id: 'snake_bite',
            title: 'Snake Bite!',
            description: `${randomMember()?.name ?? 'A party member'} was bitten by a rattlesnake while gathering firewood!`,
            choices: [
                {
                    text: 'Treat the wound immediately (rest 1 day)',
                    outcome: () => {
                        gs.advanceDay();
                        const m = randomMember();
                        if (m) m.health = Math.min(100, m.health + 5);
                    },
                },
                {
                    text: 'Keep moving (serious risk)',
                    outcome: () => { dmgMember(30); },
                },
            ],
        };
    }

    if (roll < 0.52) {
        return {
            id: 'travelers',
            title: 'Fellow Travelers',
            description: 'You meet another wagon train heading West. They offer to trade some supplies.',
            choices: [
                {
                    text: 'Trade food for ammo (give 30 lbs, get 3 boxes)',
                    outcome: () => {
                        if (gs.supplies.food >= 30) {
                            gs.supplies.food -= 30;
                            gs.supplies.ammo += 3;
                        }
                    },
                },
                {
                    text: 'Trade ammo for food (give 3 boxes, get 40 lbs)',
                    outcome: () => {
                        if (gs.supplies.ammo >= 3) {
                            gs.supplies.ammo -= 3;
                            gs.supplies.food += 40;
                        }
                    },
                },
                {
                    text: 'Wish them luck and move on',
                    outcome: () => {},
                },
            ],
        };
    }

    if (roll < 0.58) {
        return {
            id: 'bad_water',
            title: 'Contaminated Water!',
            description: 'The water source ahead is muddy and foul. Your party must drink it or suffer thirst.',
            choices: [
                {
                    text: 'Drink carefully (mild health risk)',
                    outcome: () => {
                        gs.party.forEach(m => {
                            if (m.status !== MemberStatus.DEAD && Math.random() < 0.4) {
                                m.health = Math.max(0, m.health - 10);
                            }
                        });
                    },
                },
                {
                    text: 'Wait and search for better water (lose half a day)',
                    outcome: () => { gs.milesTraveled = Math.max(0, gs.milesTraveled - 6); },
                },
            ],
        };
    }

    if (roll < 0.64) {
        return {
            id: 'lost_oxen',
            title: 'Oxen Wandered Off!',
            description: 'One of your oxen broke free in the night and wandered off. You spent hours searching.',
            choices: [
                {
                    text: 'Search all day (lose 1 day, recover ox)',
                    outcome: () => { gs.advanceDay(); },
                },
                {
                    text: 'Move on without searching (lose 1 ox)',
                    outcome: () => { gs.supplies.oxen = Math.max(1, gs.supplies.oxen - 1); },
                },
            ],
        };
    }

    if (roll < 0.70) {
        return {
            id: 'good_weather',
            title: 'Excellent Weather!',
            description: 'Clear skies and a cool breeze make for ideal travelling conditions. Your party is in high spirits!',
            choices: [
                {
                    text: 'Push the pace (travel extra miles)',
                    outcome: () => { gs.milesTraveled += 20; },
                },
                {
                    text: 'Enjoy the day at normal pace',
                    outcome: () => {
                        gs.party.forEach(m => {
                            if (m.status !== MemberStatus.DEAD) {
                                m.health = Math.min(100, m.health + 5);
                            }
                        });
                    },
                },
            ],
        };
    }

    if (roll < 0.76) {
        return {
            id: 'hail_storm',
            title: 'Hail Storm!',
            description: 'A sudden violent hail storm batters your wagon. You are forced to stop and take shelter.',
            choices: [
                {
                    text: 'Shelter in place (lose 1 day)',
                    outcome: () => { gs.advanceDay(); },
                },
                {
                    text: 'Push through the storm (risk injury)',
                    outcome: () => {
                        if (Math.random() < 0.5) dmgMember(15);
                        gs.supplies.spareParts = Math.max(0, gs.supplies.spareParts - 1);
                    },
                },
            ],
        };
    }

    // Default — good event
    const bonus = Math.floor(Math.random() * 20) + 10;
    return {
        id: 'found_cache',
        title: 'Abandoned Cache Found!',
        description: `You discover an abandoned wagon with usable supplies — ${bonus} lbs of food and some ammunition.`,
        choices: [
            {
                text: 'Take the supplies',
                outcome: () => {
                    gs.supplies.food += bonus;
                    gs.supplies.ammo += 2;
                },
            },
            {
                text: 'Leave it (honor the memory of past travelers)',
                outcome: () => {},
            },
        ],
    };
}
