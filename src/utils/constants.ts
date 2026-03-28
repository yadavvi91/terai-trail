// ── Terai Trail — Constants ──

import { SettlementPhase, Season, Weather, OriginDistrict, WorkPace, Rations } from './types';

// Game dimensions
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

// ── Color Palette (Terai forest / Indian earth tones) ──
export const COLORS = {
    SKY_BLUE: 0x5a9fd4,
    SKY_MONSOON: 0x4a5a6e,
    SKY_WINTER: 0x8aaccc,
    SAL_GREEN: 0x2d6b30,
    JUNGLE_DARK: 0x1a4a1e,
    ELEPHANT_GRASS: 0x8a9a3a,
    CLEARED_DIRT: 0x9a7a50,
    PLOWED_EARTH: 0x6a5030,
    CROP_GOLD: 0xd4a830,
    CROP_GREEN: 0x4a8a28,
    MUD_WALL: 0xa08050,
    THATCH: 0xc4a050,
    BRICK: 0x8a4a2a,
    WHITEWASH: 0xf0e8d0,
    RIVER_BLUE: 0x3a7aaa,
    MONSOON_GREY: 0x5a6a7a,
    SWAMP_GREEN: 0x3a5a30,
    PARCHMENT: 0xf5e6c8,
    DARK_BROWN: 0x4a3728,
    BLOOD_RED: 0xcc3333,
    WHITE: 0xffffff,
    BLACK: 0x000000,
    GOLD: 0xffd700,
    SAFFRON: 0xff9933,
    NAVY: 0x000080,
} as const;

// Hex color strings for text
export const HEX_COLORS = {
    PARCHMENT: '#f5e6c8',
    WHITE: '#ffffff',
    BLACK: '#000000',
    DARK_BROWN: '#4a3728',
    BLOOD_RED: '#cc3333',
    GOLD: '#ffd700',
    SAFFRON: '#ff9933',
    SAL_GREEN: '#2d6b30',
    CROP_GOLD: '#d4a830',
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

// ── Origin Districts (replaces Professions) ──
export const ORIGIN_DISTRICT_DATA = {
    [OriginDistrict.LAHORE]: {
        startingCredits: 500,
        bonusTools: 0,
        clearingRateBonus: 0,
        description: 'Lahore — City folk. More government credits, but less farming experience.',
    },
    [OriginDistrict.SIALKOT]: {
        startingCredits: 350,
        bonusTools: 3,
        clearingRateBonus: 0,
        description: 'Sialkot — Craftsmen. Fewer credits, but extra tools from metalworking tradition.',
    },
    [OriginDistrict.LYALLPUR]: {
        startingCredits: 300,
        bonusTools: 0,
        clearingRateBonus: 0.15,
        description: 'Lyallpur — Farming families. Least credits, but clear land 15% faster.',
    },
} as const;

// ── Supply Depot Prices (Government Relief Camp) ──
export const DEPOT_PRICES = {
    FOOD: 0.50,
    BULLOCKS: 80,
    SHELTER_MATERIALS: 15,
    TOOLS: 12,
    MEDICINE: 20,
} as const;

// ── Settlement Rates ──
export const TOTAL_ACRES = 100;
export const START_DATE = new Date(1952, 2, 1); // March 1, 1952
export const PARTY_SIZE = 5;

export const ACRES_PER_DAY = {
    [WorkPace.RESTING]: 0,
    [WorkPace.STEADY]: 0.3,
    [WorkPace.HARD_LABOR]: 0.5,
    [WorkPace.GRUELING]: 0.8,
} as const;

export const FOOD_PER_PERSON_PER_DAY = {
    [Rations.FILLING]: 3,
    [Rations.MEAGER]: 2,
    [Rations.BARE_BONES]: 1,
} as const;

// ── Health Effects ──
export const HEALTH = {
    STARVATION_DAMAGE: 3,
    GRUELING_DAMAGE: 2,
    REST_HEALING: 3,
    MONSOON_SICKNESS_CHANCE: 0.15,
    MAX_HEALTH: 100,
} as const;

// ── Phase Colors (replaces Biome Colors) ──
export const PHASE_COLORS = {
    GROUND: {
        [SettlementPhase.JUNGLE_CLEARING]: 0x1a4a1e,
        [SettlementPhase.FIRST_PLANTING]: 0x6a5030,
        [SettlementPhase.ESTABLISHED_FARM]: 0x4a8a28,
    },
    GROUND_ALT: {
        [SettlementPhase.JUNGLE_CLEARING]: [0x1a4a1e, 0x1e5522, 0x224a28, 0x1a4a1e] as number[],
        [SettlementPhase.FIRST_PLANTING]: [0x6a5030, 0x7a5a38, 0x6a5030, 0x5a4828] as number[],
        [SettlementPhase.ESTABLISHED_FARM]: [0x4a8a28, 0x3a7a20, 0x4a8a28, 0x5a9a30] as number[],
    },
    HILL_COLORS: {
        [SettlementPhase.JUNGLE_CLEARING]: [0x1a4a1e, 0x1e5522] as [number, number],
        [SettlementPhase.FIRST_PLANTING]: [0x2d6b30, 0x337030] as [number, number],
        [SettlementPhase.ESTABLISHED_FARM]: [0x3a8028, 0x2d7020] as [number, number],
    },
} as const;

// ── Season Colors ──
export const SEASON_COLORS = {
    GRASS: {
        [Season.SPRING]: 0x3a8028,
        [Season.MONSOON]: 0x2a7020,
        [Season.POST_MONSOON]: 0x6a8028,
        [Season.WINTER]: 0x7a7038,
    },
    GRASS_ALT: {
        [Season.SPRING]: [0x3a8028, 0x2d7020, 0x347530, 0x3a8028] as number[],
        [Season.MONSOON]: [0x2a7020, 0x1e6018, 0x2a6828, 0x2a7020] as number[],
        [Season.POST_MONSOON]: [0x6a8028, 0x5a7020, 0x648028, 0x6a8028] as number[],
        [Season.WINTER]: [0x7a7038, 0x6a6030, 0x747038, 0x7a7038] as number[],
    },
} as const;

// ── Sky Gradients per Weather ──
export const SKY_GRADIENTS: Record<Weather, { top: number; bottom: number }> = {
    [Weather.CLEAR]: { top: 0x0d3a6e, bottom: 0x70b4d8 },
    [Weather.HUMID]: { top: 0x1a3a5e, bottom: 0xb0c4aa },
    [Weather.MONSOON_RAIN]: { top: 0x1a2030, bottom: 0x4a5a6e },
    [Weather.FLOODING]: { top: 0x0a1520, bottom: 0x3a4a5e },
    [Weather.DRY_HEAT]: { top: 0x1a3a5e, bottom: 0xd0a870 },
    [Weather.FOG]: { top: 0x7a8a8a, bottom: 0xa0b0a8 },
};

// ── Shivalik Hills backdrop ──
export const SHIVALIK_COLORS = {
    BACK: [0x5a7a5a, 0x4a6a4a, 0x507050] as [number, number, number],
    FRONT: [0x3a5a3a, 0x405a40, 0x3a5a3a, 0x405a40] as [number, number, number, number],
} as const;

// ── Foraging (replaces Hunting) ──
export const MAX_CARRY_FROM_FORAGE = 100;
export const FORAGING_DURATION_MS = 60000;

// ── Scene Keys ──
export const SCENES = {
    BOOT: 'BootScene',
    TITLE: 'TitleScene',
    PARTY_CREATION: 'PartyCreationScene',
    SUPPLY_DEPOT: 'SupplyDepotScene',
    SETTLEMENT: 'SettlementScene',
    FORAGING: 'ForagingScene',
    MONSOON: 'MonsoonScene',
    EVENT: 'EventScene',
    MILESTONE: 'MilestoneScene',
    GAME_OVER: 'GameOverScene',
} as const;
