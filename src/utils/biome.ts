import { Biome, Season } from './types';

/**
 * Returns the biome zone for a given mile marker on the trail.
 * Boundaries: Prairie 0–639, Mountains 640–1399, Oregon 1400–2000.
 */
export function getBiome(milesTraveled: number): Biome {
    if (milesTraveled < 640) return Biome.PRAIRIE;
    if (milesTraveled < 1400) return Biome.MOUNTAINS;
    return Biome.OREGON;
}

/**
 * Returns the season for a given calendar month (0-indexed, JS Date.getMonth()).
 * Game starts April 1 (month 3). Fall covers month 8 (September) through year end.
 */
export function getSeason(month: number): Season {
    if (month <= 4) return Season.SPRING;        // Apr (3) – May (4)
    if (month <= 6) return Season.EARLY_SUMMER;  // Jun (5) – Jul (6)
    if (month === 7) return Season.LATE_SUMMER;  // Aug (7)
    return Season.FALL;                          // Sep (8) +
}

/**
 * Returns mountain layer alpha (0–1) based on miles traveled.
 * Mountains fade in from mile 300 to 640 (prairie fade-in zone).
 * Before 300: invisible. After 640: fully visible.
 */
export function getMountainAlpha(milesTraveled: number): number {
    if (milesTraveled < 300) return 0;
    if (milesTraveled >= 640) return 1;
    return (milesTraveled - 300) / (640 - 300);
}
