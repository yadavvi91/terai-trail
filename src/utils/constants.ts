// Game dimensions
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

// Colors
export const COLORS = {
    SKY_BLUE: 0x4a90d9,
    GRASS_GREEN: 0x3d8b37,
    TRAIL_BROWN: 0x8b6914,
    DARK_BROWN: 0x4a3728,
    PARCHMENT: 0xf5e6c8,
    BLOOD_RED: 0xcc3333,
    WHITE: 0xffffff,
    BLACK: 0x000000,
    GOLD: 0xffd700,
} as const;

// Hex color strings for text
export const HEX_COLORS = {
    PARCHMENT: '#f5e6c8',
    WHITE: '#ffffff',
    BLACK: '#000000',
    DARK_BROWN: '#4a3728',
    TRAIL_BROWN: '#8b6914',
    BLOOD_RED: '#cc3333',
    GOLD: '#ffd700',
    GREEN: '#3d8b37',
} as const;

// Text styles
export const TEXT_STYLES = {
    TITLE: {
        fontFamily: '"Courier New", monospace',
        fontSize: '48px',
        color: HEX_COLORS.PARCHMENT,
        stroke: HEX_COLORS.DARK_BROWN,
        strokeThickness: 6,
        align: 'center' as const,
    },
    SUBTITLE: {
        fontFamily: '"Courier New", monospace',
        fontSize: '24px',
        color: HEX_COLORS.PARCHMENT,
        align: 'center' as const,
    },
    BODY: {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: HEX_COLORS.PARCHMENT,
        align: 'left' as const,
    },
    HUD: {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: HEX_COLORS.WHITE,
        align: 'left' as const,
    },
} as const;

// Professions
export enum Profession {
    BANKER = 'Banker',
    CARPENTER = 'Carpenter',
    FARMER = 'Farmer',
}

export const PROFESSION_DATA = {
    [Profession.BANKER]: { startingMoney: 1600, bonus: 'None', scoreMultiplier: 1 },
    [Profession.CARPENTER]: { startingMoney: 800, bonus: 'Wagon repair', scoreMultiplier: 2 },
    [Profession.FARMER]: { startingMoney: 400, bonus: '3x score', scoreMultiplier: 3 },
} as const;

// Store prices
export const STORE_PRICES = {
    OXEN: 40,
    FOOD: 0.20,
    CLOTHING: 10,
    AMMO: 2,
    SPARE_PARTS: 10,
} as const;

// Travel
export const MILES_PER_DAY = {
    STOPPED: 0,
    STEADY: 12,
    STRENUOUS: 16,
    GRUELING: 20,
} as const;

export const FOOD_PER_PERSON_PER_DAY = {
    FILLING: 3,
    MEAGER: 2,
    BARE_BONES: 1,
} as const;

export const TOTAL_TRAIL_MILES = 2000;
export const PARTY_SIZE = 5;
export const MAX_CARRY_FROM_HUNT = 100;
export const HUNTING_DURATION_MS = 60000;

// Scene keys
export const SCENES = {
    BOOT: 'BootScene',
    TITLE: 'TitleScene',
    PARTY_CREATION: 'PartyCreationScene',
    STORE: 'StoreScene',
    TRAVEL: 'TravelScene',
    HUNTING: 'HuntingScene',
    RIVER_CROSSING: 'RiverCrossingScene',
    EVENT: 'EventScene',
    LANDMARK: 'LandmarkScene',
    GAME_OVER: 'GameOverScene',
} as const;
