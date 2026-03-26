import { Biome, Season, Weather } from './types';

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

// Biome and seasonal color palettes
export const BIOME_COLORS = {
    // Hill color pairs [primary, secondary] per biome
    HILL_COLORS: {
        [Biome.PRAIRIE]:   [0x3a8028, 0x2d7020] as [number, number],
        [Biome.MOUNTAINS]: [0x2d6428, 0x337030] as [number, number],
        [Biome.OREGON]:    [0x1e4a1a, 0x234520] as [number, number],
    },
    // Mountain back layer colors per biome (3 mountains)
    MOUNTAIN_BACK: {
        [Biome.PRAIRIE]:   [0x6a7ea8, 0x5a7098, 0x607898] as [number, number, number],
        [Biome.MOUNTAINS]: [0x6a7ea8, 0x5a7098, 0x607898] as [number, number, number],
        [Biome.OREGON]:    [0x2d5a27, 0x1e4a1a, 0x2a5225] as [number, number, number],
    },
    // Mountain front layer colors per biome (4 mountains)
    MOUNTAIN_FRONT: {
        [Biome.PRAIRIE]:   [0x4a6080, 0x506a88, 0x4a6080, 0x506a88] as [number, number, number, number],
        [Biome.MOUNTAINS]: [0x4a6080, 0x506a88, 0x4a6080, 0x506a88] as [number, number, number, number],
        [Biome.OREGON]:    [0x1a3a18, 0x223a20, 0x1a3a18, 0x223a20] as [number, number, number, number],
    },
    // Seasonal grass color for isometric ground tiles
    SEASON_GRASS: {
        [Season.SPRING]:       0x3a8028,
        [Season.EARLY_SUMMER]: 0x6a8028,
        [Season.LATE_SUMMER]:  0x8a7028,
        [Season.FALL]:         0x7a5020,
    },
    // Seasonal grass color variations (for tile variety)
    SEASON_GRASS_ALT: {
        [Season.SPRING]:       [0x3a8028, 0x2d7020, 0x347530, 0x3a8028] as number[],
        [Season.EARLY_SUMMER]: [0x6a8028, 0x5a7020, 0x648028, 0x6a8028] as number[],
        [Season.LATE_SUMMER]:  [0x8a7028, 0x7a6020, 0x847028, 0x8a7028] as number[],
        [Season.FALL]:         [0x7a5020, 0x6a4018, 0x745020, 0x7a5020] as number[],
    },
} as const;

// Sky gradients per weather type (top → bottom hex colors)
export const SKY_GRADIENTS: Record<Weather, { top: number; bottom: number }> = {
    [Weather.CLEAR]: { top: 0x0d3a6e, bottom: 0x70b4d8 },  // deep blue
    [Weather.RAINY]: { top: 0x1a2030, bottom: 0x4a5a6e },  // dark grey-blue
    [Weather.HOT]:   { top: 0x1a3a5e, bottom: 0xd0a870 },  // pale blue → warm horizon
    [Weather.SNOWY]: { top: 0x7090a8, bottom: 0xc8d8e0 },  // white-grey
};

// Oregon biome: semi-transparent grey-green overlay applied on top of the sky gradient
export const OREGON_SKY_OVERLAY = { color: 0x4a6040, alpha: 0.35 } as const;

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
