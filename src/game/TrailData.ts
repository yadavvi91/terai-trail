import { Landmark } from '../utils/types';

export const TRAIL_LANDMARKS: Landmark[] = [
    {
        name: 'Independence, MO',
        miles: 0,
        isRiver: false,
        isFort: false,
        description: 'Your journey begins in Independence, Missouri — the gateway to the West. Thousands of settlers have set off from here. May fortune smile on your party.',
    },
    {
        name: 'Kansas River Crossing',
        miles: 102,
        isRiver: true,
        isFort: false,
        description: 'The Kansas River crossing is your first real test. The current is strong and the water deep. Choose your crossing method wisely.',
    },
    {
        name: 'Fort Kearney',
        miles: 304,
        isRiver: false,
        isFort: true,
        description: 'Fort Kearney offers the last reliable resupply on the eastern plains. The soldiers here can offer advice on what lies ahead.',
    },
    {
        name: 'Chimney Rock',
        miles: 554,
        isRiver: false,
        isFort: false,
        description: 'Chimney Rock rises 300 feet above the prairie — a remarkable landmark that every emigrant writes home about. You are making good progress.',
    },
    {
        name: 'Fort Laramie',
        miles: 640,
        isRiver: false,
        isFort: true,
        description: 'Fort Laramie is a major resupply point in Wyoming Territory. Repair your wagon, rest your oxen, and stock up before the mountains ahead.',
    },
    {
        name: 'Independence Rock',
        miles: 830,
        isRiver: false,
        isFort: false,
        description: 'Independence Rock, the "Great Register of the Desert." Emigrants carve their names in this massive granite dome. To reach it before July 4th is a good omen.',
    },
    {
        name: 'South Pass',
        miles: 932,
        isRiver: false,
        isFort: false,
        description: 'South Pass crosses the Continental Divide at 7,412 feet. The broad, gentle pass is deceptively easy — but you are now in the true West.',
    },
    {
        name: 'Fort Bridger',
        miles: 1000,
        isRiver: false,
        isFort: true,
        description: 'Fort Bridger, built by fur trader Jim Bridger, offers supplies at steep prices. This is one of the last resupply points before the hardest stretches.',
    },
    {
        name: 'Snake River Crossing',
        miles: 1400,
        isRiver: true,
        isFort: false,
        description: 'The Snake River is wide, swift, and treacherous. Many wagons have been lost here. The ferryman charges $5 per wagon — a price that may be worth paying.',
    },
    {
        name: 'Fort Boise',
        miles: 1500,
        isRiver: false,
        isFort: true,
        description: 'Fort Boise offers a final chance to resupply before the Blue Mountains. The terrain ahead will be the most punishing of the entire journey.',
    },
    {
        name: 'Blue Mountains',
        miles: 1700,
        isRiver: false,
        isFort: false,
        description: 'The Blue Mountains loom ahead — steep, forested, and grueling. Oxen strain on the grades. With luck and strong animals, you will make it through.',
    },
    {
        name: 'The Dalles',
        miles: 1800,
        isRiver: false,
        isFort: false,
        description: 'The Dalles on the Columbia River. From here you can raft down the river or take the treacherous Barlow Road over Mount Hood. The end is near.',
    },
    {
        name: "Willamette Valley",
        miles: 2000,
        isRiver: false,
        isFort: false,
        description: "You have reached the Willamette Valley in Oregon Territory! After 2,000 miles you have fulfilled your destiny. The rich farmland stretches before you — a new life begins.",
    },
];

export function getNextLandmark(milesTraveled: number): Landmark | null {
    return TRAIL_LANDMARKS.find(l => l.miles > milesTraveled) ?? null;
}

export function getCurrentLandmark(milesTraveled: number): Landmark | null {
    return [...TRAIL_LANDMARKS].reverse().find(l => l.miles <= milesTraveled) ?? null;
}
