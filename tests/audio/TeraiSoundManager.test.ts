/**
 * WP18 — TeraiSoundManager tests
 * Tests the singleton, mute control, and method existence.
 * Web Audio API is not available in Node, so we verify structure and logic.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        clear: () => { store = {}; },
    };
})();
vi.stubGlobal('localStorage', localStorageMock);

// We need to reset the singleton between tests
let TeraiSoundManager: any;

async function freshImport() {
    // Force re-import by clearing module cache
    vi.resetModules();
    const mod = await import('../../src/audio/TeraiSoundManager');
    return mod.TeraiSoundManager;
}

describe('TeraiSoundManager', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.resetModules();
    });

    describe('Singleton pattern', () => {
        it('should export TeraiSoundManager class', async () => {
            const TSM = await freshImport();
            expect(TSM).toBeDefined();
            expect(typeof TSM.getInstance).toBe('function');
        });

        it('should return same instance on multiple getInstance calls', async () => {
            const TSM = await freshImport();
            const a = TSM.getInstance();
            const b = TSM.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('Mute control', () => {
        it('should start unmuted by default', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(mgr.isMuted()).toBe(false);
        });

        it('should read muted state from localStorage', async () => {
            localStorageMock.setItem('terai_muted', 'true');
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(mgr.isMuted()).toBe(true);
        });

        it('toggleMute should flip muted state', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(mgr.isMuted()).toBe(false);
            mgr.toggleMute();
            expect(mgr.isMuted()).toBe(true);
            mgr.toggleMute();
            expect(mgr.isMuted()).toBe(false);
        });

        it('setMuted should persist to localStorage', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            mgr.setMuted(true);
            expect(localStorageMock.setItem).toHaveBeenCalledWith('terai_muted', 'true');
            mgr.setMuted(false);
            expect(localStorageMock.setItem).toHaveBeenCalledWith('terai_muted', 'false');
        });
    });

    describe('Public API methods exist', () => {
        it('should have init()', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(typeof mgr.init).toBe('function');
        });

        it('should have music methods', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(typeof mgr.startSettlementMusic).toBe('function');
            expect(typeof mgr.startVictoryMusic).toBe('function');
            expect(typeof mgr.startFuneralMusic).toBe('function');
            expect(typeof mgr.stopMusic).toBe('function');
        });

        it('should have ambience methods', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(typeof mgr.startJungleAmbience).toBe('function');
            expect(typeof mgr.stopAmbience).toBe('function');
        });

        it('should have SFX methods', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            const sfxMethods = [
                'playAxeChop', 'playMosquitoBuzz', 'playTigerGrowl',
                'playMonsoonThunder', 'playSnakeHiss', 'playBullockMoo',
                'playHammerBuild', 'playCelebration',
            ];
            sfxMethods.forEach(method => {
                expect(typeof (mgr as any)[method]).toBe('function');
            });
        });

        it('should have destroy()', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(typeof mgr.destroy).toBe('function');
        });
    });

    describe('Safe without AudioContext', () => {
        it('init() should not throw when AudioContext is unavailable', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            // No window.AudioContext in Node
            expect(() => mgr.init()).not.toThrow();
        });

        it('SFX methods should not throw without init', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(() => mgr.playAxeChop()).not.toThrow();
            expect(() => mgr.playMosquitoBuzz()).not.toThrow();
            expect(() => mgr.playTigerGrowl()).not.toThrow();
            expect(() => mgr.playMonsoonThunder()).not.toThrow();
            expect(() => mgr.playSnakeHiss()).not.toThrow();
            expect(() => mgr.playBullockMoo()).not.toThrow();
            expect(() => mgr.playHammerBuild()).not.toThrow();
            expect(() => mgr.playCelebration()).not.toThrow();
        });

        it('music methods should not throw without init', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(() => mgr.startSettlementMusic()).not.toThrow();
            expect(() => mgr.startVictoryMusic()).not.toThrow();
            expect(() => mgr.startFuneralMusic()).not.toThrow();
            expect(() => mgr.stopMusic()).not.toThrow();
        });

        it('ambience methods should not throw without init', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(() => mgr.startJungleAmbience()).not.toThrow();
            expect(() => mgr.stopAmbience()).not.toThrow();
        });

        it('destroy should not throw without init', async () => {
            const TSM = await freshImport();
            const mgr = TSM.getInstance();
            expect(() => mgr.destroy()).not.toThrow();
        });
    });
});
