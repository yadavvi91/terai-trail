import { describe, it, expect } from 'vitest';
import * as TDU from '../../src/ui/TeraDrawUtils';

describe('WP05-09 — TeraDrawUtils exports', () => {
    describe('WP05 — Landscape functions', () => {
        it('exports drawSalTree', () => {
            expect(typeof TDU.drawSalTree).toBe('function');
        });
        it('exports drawElephantGrass', () => {
            expect(typeof TDU.drawElephantGrass).toBe('function');
        });
        it('exports drawBambooClump', () => {
            expect(typeof TDU.drawBambooClump).toBe('function');
        });
        it('exports drawShivalikHills', () => {
            expect(typeof TDU.drawShivalikHills).toBe('function');
        });
    });

    describe('WP06 — Animal functions', () => {
        it('exports drawTiger', () => {
            expect(typeof TDU.drawTiger).toBe('function');
        });
        it('exports drawCobra', () => {
            expect(typeof TDU.drawCobra).toBe('function');
        });
        it('exports drawWildBoar', () => {
            expect(typeof TDU.drawWildBoar).toBe('function');
        });
        it('exports drawPeacock', () => {
            expect(typeof TDU.drawPeacock).toBe('function');
        });
        it('exports drawElephant', () => {
            expect(typeof TDU.drawElephant).toBe('function');
        });
        it('exports drawMonkey', () => {
            expect(typeof TDU.drawMonkey).toBe('function');
        });
        it('exports drawMosquito', () => {
            expect(typeof TDU.drawMosquito).toBe('function');
        });
    });

    describe('WP07 — Structure functions', () => {
        it('exports drawThatchHut', () => {
            expect(typeof TDU.drawThatchHut).toBe('function');
        });
        it('exports drawWell', () => {
            expect(typeof TDU.drawWell).toBe('function');
        });
        it('exports drawGurdwara', () => {
            expect(typeof TDU.drawGurdwara).toBe('function');
        });
        it('exports drawCropField', () => {
            expect(typeof TDU.drawCropField).toBe('function');
        });
    });

    describe('WP08 — Isometric cart and person', () => {
        it('exports drawIsoBullockCart', () => {
            expect(typeof TDU.drawIsoBullockCart).toBe('function');
        });
        it('exports drawIsoBullock', () => {
            expect(typeof TDU.drawIsoBullock).toBe('function');
        });
        it('exports drawIsoSikhPerson', () => {
            expect(typeof TDU.drawIsoSikhPerson).toBe('function');
        });
    });

    describe('WP09 — Isometric structures', () => {
        it('exports drawIsoSalTree', () => {
            expect(typeof TDU.drawIsoSalTree).toBe('function');
        });
        it('exports drawIsoHut', () => {
            expect(typeof TDU.drawIsoHut).toBe('function');
        });
        it('exports drawIsoField', () => {
            expect(typeof TDU.drawIsoField).toBe('function');
        });
        it('exports drawIsoWell', () => {
            expect(typeof TDU.drawIsoWell).toBe('function');
        });
        it('exports drawIsoGurdwara', () => {
            expect(typeof TDU.drawIsoGurdwara).toBe('function');
        });
    });

    describe('No Oregon Trail drawing functions', () => {
        it('does not export drawWagon', () => {
            expect((TDU as any).drawWagon).toBeUndefined();
        });
        it('does not export drawOx', () => {
            expect((TDU as any).drawOx).toBeUndefined();
        });
    });
});
