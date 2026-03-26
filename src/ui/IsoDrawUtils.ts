/**
 * Isometric drawing utilities — 2.5D versions of entities.
 * These draw objects as if viewed from an isometric camera angle (AoE2-style).
 */

import { TILE_WIDTH, TILE_HEIGHT, drawIsoTile, drawIsoBlock } from '../utils/isometric';

// ─── Isometric Wagon ─────────────────────────────────────────────────────────

export function drawIsoWagon(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    scale: number = 1,
): void {
    const s = scale;

    // Wagon body — isometric box
    const bodyW = 48 * s;
    const bodyH = 24 * s;
    const bodyDepth = 16 * s;

    // Body shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(sx + 4 * s, sy + 12 * s, bodyW * 1.1, bodyH * 0.5);

    // Body — top face
    g.fillStyle(0x6b3a18);
    g.fillPoints([
        { x: sx - bodyW / 2, y: sy - bodyDepth },
        { x: sx,             y: sy - bodyH / 2 - bodyDepth },
        { x: sx + bodyW / 2, y: sy - bodyDepth },
        { x: sx,             y: sy + bodyH / 2 - bodyDepth },
    ], true);

    // Body — left face
    g.fillStyle(0x5c2e10);
    g.fillPoints([
        { x: sx - bodyW / 2, y: sy - bodyDepth },
        { x: sx,             y: sy + bodyH / 2 - bodyDepth },
        { x: sx,             y: sy + bodyH / 2 },
        { x: sx - bodyW / 2, y: sy },
    ], true);

    // Body — right face
    g.fillStyle(0x4a2208);
    g.fillPoints([
        { x: sx + bodyW / 2, y: sy - bodyDepth },
        { x: sx + bodyW / 2, y: sy },
        { x: sx,             y: sy + bodyH / 2 },
        { x: sx,             y: sy + bodyH / 2 - bodyDepth },
    ], true);

    // Plank lines on left face
    g.fillStyle(0x3a1a06, 0.4);
    for (let i = 1; i < 3; i++) {
        const t = i / 3;
        const lx = sx - bodyW / 2 + (bodyW / 2) * t;
        const ly = sy - bodyDepth + bodyDepth * t * 0.3;
        g.fillRect(lx, ly, 1.5, bodyDepth);
    }

    // Canvas bonnet — isometric arch (elongated dome over wagon)
    g.fillStyle(0xf0e2c0);
    g.fillEllipse(sx, sy - bodyDepth - 12 * s, bodyW * 0.7, 28 * s);
    // Bonnet shadow underneath
    g.fillStyle(0xd4c8a0, 0.6);
    g.fillEllipse(sx, sy - bodyDepth - 6 * s, bodyW * 0.65, 18 * s);

    // Bonnet ribs
    g.lineStyle(1.5 * s, 0xc8b890, 0.5);
    for (let i = -1; i <= 1; i++) {
        g.strokeEllipse(sx + i * 8 * s, sy - bodyDepth - 10 * s, 8 * s, 22 * s);
    }

    // Wheels (isometric ellipses)
    const wheelR = 8 * s;
    // Back-left wheel
    g.fillStyle(0x2a1208);
    g.fillEllipse(sx - bodyW / 2 + 4 * s, sy + 2 * s, wheelR * 2, wheelR);
    g.lineStyle(2, 0x4a2e14);
    g.strokeEllipse(sx - bodyW / 2 + 4 * s, sy + 2 * s, wheelR * 2, wheelR);
    // Front-right wheel
    g.fillStyle(0x2a1208);
    g.fillEllipse(sx + bodyW / 2 - 4 * s, sy + 2 * s, wheelR * 2, wheelR);
    g.lineStyle(2, 0x4a2e14);
    g.strokeEllipse(sx + bodyW / 2 - 4 * s, sy + 2 * s, wheelR * 2, wheelR);

    // Tongue / yoke
    g.fillStyle(0x4a2e10);
    g.beginPath();
    g.moveTo(sx, sy + bodyH / 2);
    g.lineTo(sx + 30 * s, sy + bodyH / 2 + 15 * s);
    g.lineTo(sx + 28 * s, sy + bodyH / 2 + 18 * s);
    g.lineTo(sx - 2, sy + bodyH / 2 + 3);
    g.fillPath();
}

// ─── Isometric Ox ────────────────────────────────────────────────────────────

export function drawIsoOx(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    scale: number = 1,
): void {
    const s = scale;

    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(sx + 2 * s, sy + 6 * s, 28 * s, 10 * s);

    // Body — isometric ellipse (viewed from above-side)
    g.fillStyle(0x6b4c20);
    g.fillEllipse(sx, sy - 4 * s, 26 * s, 14 * s);

    // Hump
    g.fillStyle(0x7a5c30);
    g.fillEllipse(sx - 4 * s, sy - 10 * s, 12 * s, 8 * s);

    // Head (angled forward-right in iso)
    g.fillStyle(0x6b4c20);
    g.fillEllipse(sx + 12 * s, sy + 2 * s, 12 * s, 10 * s);

    // Horns
    g.fillStyle(0xe8d080);
    g.fillTriangle(
        sx + 10 * s, sy - 4 * s,
        sx + 7 * s,  sy - 12 * s,
        sx + 14 * s, sy - 4 * s,
    );

    // Eye
    g.fillStyle(0x1a0e04);
    g.fillCircle(sx + 14 * s, sy - 1 * s, 1.5 * s);

    // Legs (visible from iso angle)
    g.fillStyle(0x3d2a08);
    g.fillRect(sx - 8 * s, sy + 2 * s, 4 * s, 8 * s);
    g.fillRect(sx - 2 * s, sy + 2 * s, 4 * s, 7 * s);
    g.fillRect(sx + 4 * s, sy + 3 * s, 4 * s, 7 * s);
    g.fillRect(sx + 10 * s, sy + 4 * s, 4 * s, 6 * s);

    // Tail
    g.fillStyle(0x6b4c20);
    g.fillRect(sx - 14 * s, sy - 2 * s, 2 * s, 8 * s);
}

// ─── Isometric Person ────────────────────────────────────────────────────────

export function drawIsoPerson(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    scale: number = 1,
    clothColor: number = 0x7a5a38,
): void {
    const s = scale;

    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(sx + 1 * s, sy + 4 * s, 14 * s, 7 * s);

    // Boots
    g.fillStyle(0x2a1808);
    g.fillEllipse(sx - 3 * s, sy + 2 * s, 5 * s, 4 * s);
    g.fillEllipse(sx + 3 * s, sy + 2 * s, 5 * s, 4 * s);

    // Legs (trousers)
    g.fillStyle(0x4a3828);
    g.fillRect(sx - 5 * s, sy - 8 * s, 4 * s, 11 * s);
    g.fillRect(sx + 1 * s, sy - 8 * s, 4 * s, 11 * s);

    // Torso
    g.fillStyle(clothColor);
    g.fillPoints([
        { x: sx - 6 * s, y: sy - 8 * s },
        { x: sx - 7 * s, y: sy - 20 * s },
        { x: sx + 7 * s, y: sy - 20 * s },
        { x: sx + 6 * s, y: sy - 8 * s },
    ], true);

    // Belt
    g.fillStyle(0x2a1808);
    g.fillRect(sx - 6 * s, sy - 9 * s, 12 * s, 2 * s);

    // Belt buckle
    g.fillStyle(0xc8a040);
    g.fillRect(sx - 1 * s, sy - 10 * s, 2 * s, 3 * s);

    // Arms
    const darkerCloth = clothColor - 0x101010;
    g.fillStyle(darkerCloth > 0 ? darkerCloth : clothColor);
    // Left arm (angled slightly out)
    g.fillPoints([
        { x: sx - 7 * s, y: sy - 19 * s },
        { x: sx - 10 * s, y: sy - 10 * s },
        { x: sx - 7 * s, y: sy - 10 * s },
    ], true);
    // Right arm
    g.fillPoints([
        { x: sx + 7 * s, y: sy - 19 * s },
        { x: sx + 10 * s, y: sy - 10 * s },
        { x: sx + 7 * s, y: sy - 10 * s },
    ], true);

    // Hands
    g.fillStyle(0xd4956a);
    g.fillCircle(sx - 9 * s, sy - 9 * s, 2 * s);
    g.fillCircle(sx + 9 * s, sy - 9 * s, 2 * s);

    // Neck
    g.fillStyle(0xd4956a);
    g.fillRect(sx - 2 * s, sy - 23 * s, 4 * s, 4 * s);

    // Head
    g.fillStyle(0xd4956a);
    g.fillCircle(sx, sy - 27 * s, 6 * s);

    // Eyes
    g.fillStyle(0x1a0e04);
    g.fillCircle(sx - 2 * s, sy - 28 * s, 1 * s);
    g.fillCircle(sx + 2 * s, sy - 28 * s, 1 * s);

    // Hat brim
    g.fillStyle(0x3a2510);
    g.fillEllipse(sx, sy - 32 * s, 14 * s, 5 * s);
    // Hat crown
    g.fillStyle(0x4a3218);
    g.fillPoints([
        { x: sx - 5 * s, y: sy - 32 * s },
        { x: sx - 4 * s, y: sy - 38 * s },
        { x: sx + 4 * s, y: sy - 38 * s },
        { x: sx + 5 * s, y: sy - 32 * s },
    ], true);
    // Hat band
    g.fillStyle(0xc8a040);
    g.fillRect(sx - 5 * s, sy - 33 * s, 10 * s, 1.5 * s);
}

// ─── Isometric Tree ──────────────────────────────────────────────────────────

export function drawIsoTree(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    height: number = 60,
    color: number = 0x2a5820,
    pine: boolean = false,
): void {
    // Shadow
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(sx + 8, sy + 4, height * 0.5, height * 0.2);

    // Trunk
    g.fillStyle(0x5a3a18);
    g.fillRect(sx - 3, sy - height * 0.25, 6, height * 0.25);

    if (pine) {
        // Pine — stacked iso diamonds getting smaller
        for (let i = 0; i < 3; i++) {
            const t = i / 3;
            const tw = height * (0.4 - t * 0.12);
            const ty = sy - height * (0.2 + t * 0.28);
            g.fillStyle(i === 0 ? color : (i === 1 ? color + 0x0a0a00 : color + 0x141400));
            g.fillPoints([
                { x: sx,      y: ty - tw * 0.5 },
                { x: sx + tw, y: ty },
                { x: sx,      y: ty + tw * 0.3 },
                { x: sx - tw, y: ty },
            ], true);
        }
    } else {
        // Deciduous — overlapping iso ellipses for organic canopy
        const cw = height * 0.45;
        const ch = height * 0.35;
        const cy = sy - height * 0.55;
        g.fillStyle(color - 0x0a0a00);
        g.fillEllipse(sx, cy + 4, cw, ch * 0.9);
        g.fillStyle(color);
        g.fillEllipse(sx - cw * 0.15, cy - 2, cw * 0.8, ch * 0.85);
        g.fillEllipse(sx + cw * 0.12, cy, cw * 0.75, ch * 0.8);
        g.fillStyle(color + 0x101000);
        g.fillEllipse(sx - cw * 0.08, cy - 6, cw * 0.6, ch * 0.6);
        // Highlight
        g.fillStyle(color + 0x202010, 0.4);
        g.fillEllipse(sx - cw * 0.12, cy - 10, cw * 0.3, ch * 0.3);
    }
}

// ─── Isometric Mountain ──────────────────────────────────────────────────────

/** Deterministic noise from seed for consistent mountain shapes */
function mtnNoise(seed: number): number {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
}

export function drawIsoMountain(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    width: number,
    height: number,
    color: number,
    snowCap: boolean = true,
): void {
    const hw = width / 2;
    const seed = sx * 0.013 + width * 0.007;

    // Slight peak offset for natural look
    const peakOff = (mtnNoise(seed) - 0.5) * width * 0.1;
    const peakX = sx + peakOff;
    const peakY = sy - height;
    const bottomY = sy + hw * 0.3;

    // ── Build jagged silhouette (left slope → peak → right slope) ──
    const steps = 14;
    const leftPts: Phaser.Types.Math.Vector2Like[] = [{ x: sx - hw, y: sy }];
    const rightPts: Phaser.Types.Math.Vector2Like[] = [];

    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const jagAmp = width * 0.03 * (1 - t * 0.6);

        // Left slope
        const lJag = (mtnNoise(seed + i * 3.7) - 0.5) * 2 * jagAmp;
        const lx = (sx - hw) + (peakX - (sx - hw)) * t + lJag;
        const ly = sy - height * t;
        leftPts.push({ x: lx, y: ly });

        // Right slope
        const rJag = (mtnNoise(seed + i * 5.1 + 50) - 0.5) * 2 * jagAmp;
        const rx = peakX + ((sx + hw) - peakX) * t + rJag;
        const ry = sy - height * (1 - t);
        rightPts.unshift({ x: rx, y: ry });
    }

    // Add sub-peaks for realism
    const sub1X = sx - hw * 0.45;
    const sub1Y = sy - height * (0.55 + mtnNoise(seed + 20) * 0.15);
    const sub2X = sx + hw * 0.4;
    const sub2Y = sy - height * (0.5 + mtnNoise(seed + 30) * 0.15);

    // Merge into full silhouette: left base → left slope → peak → right slope → right base → bottom
    const outline: Phaser.Types.Math.Vector2Like[] = [
        ...leftPts,
        { x: peakX, y: peakY },
        ...rightPts,
        { x: sx + hw, y: sy },
        { x: sx, y: bottomY },
    ];

    // Main body fill
    g.fillStyle(color);
    g.fillPoints(outline, true);

    // Sub-peak ridges (overlaid for depth)
    g.fillStyle(color - 0x080808);
    g.fillPoints([
        { x: sub1X - hw * 0.25, y: sy },
        { x: sub1X, y: sub1Y },
        { x: sub1X + hw * 0.15, y: sy - height * 0.3 },
        { x: sub1X + hw * 0.2, y: sy },
        { x: sub1X, y: bottomY },
    ], true);

    g.fillStyle(color - 0x060606);
    g.fillPoints([
        { x: sub2X - hw * 0.15, y: sy },
        { x: sub2X, y: sub2Y },
        { x: sub2X + hw * 0.25, y: sy },
        { x: sub2X + hw * 0.05, y: bottomY },
    ], true);

    // Right shadow face (darker)
    g.fillStyle(0x000000, 0.18);
    g.fillPoints([
        { x: peakX, y: peakY },
        { x: sx + hw, y: sy },
        { x: sx, y: bottomY },
    ], true);

    // Left highlight face
    g.fillStyle(0xffffff, 0.06);
    g.fillPoints([
        { x: sx - hw, y: sy },
        { x: peakX, y: peakY },
        { x: sx, y: bottomY },
    ], true);

    // Rock stratification lines
    g.lineStyle(1, 0x000000, 0.12);
    for (let i = 1; i <= 4; i++) {
        const t = i * 0.18;
        const lw = hw * (1 - t) * 0.9;
        const ly = sy - height * (1 - t);
        const jag = (mtnNoise(seed + i * 11) - 0.5) * 8;
        g.beginPath();
        g.moveTo(sx - lw + jag, ly + lw * 0.12);
        g.lineTo(sx + lw + jag, ly + lw * 0.12);
        g.strokePath();
    }

    // Atmospheric haze at base
    g.fillStyle(0x8090b0, 0.08);
    g.fillPoints([
        { x: sx - hw, y: sy },
        { x: sx - hw * 0.3, y: sy - height * 0.15 },
        { x: sx + hw * 0.3, y: sy - height * 0.15 },
        { x: sx + hw, y: sy },
        { x: sx, y: bottomY },
    ], true);

    if (snowCap) {
        // Main snow cap — organic shape with multiple lobes
        const snowLine = 0.84;
        g.fillStyle(0xedf4ff, 0.92);
        g.fillPoints([
            { x: peakX - hw * 0.3, y: sy - height * snowLine },
            { x: peakX - hw * 0.12, y: sy - height * (snowLine + 0.08) },
            { x: peakX, y: peakY },
            { x: peakX + hw * 0.1, y: sy - height * (snowLine + 0.06) },
            { x: peakX + hw * 0.25, y: sy - height * snowLine },
            { x: peakX + hw * 0.15, y: sy - height * (snowLine - 0.04) },
            { x: peakX - hw * 0.18, y: sy - height * (snowLine - 0.03) },
        ], true);

        // Snow on sub-peaks
        if (sub1Y < sy - height * 0.45) {
            g.fillStyle(0xedf4ff, 0.7);
            g.fillPoints([
                { x: sub1X - hw * 0.08, y: sub1Y + height * 0.06 },
                { x: sub1X, y: sub1Y },
                { x: sub1X + hw * 0.06, y: sub1Y + height * 0.06 },
            ], true);
        }

        // Snow shadow
        g.fillStyle(0x8aaad0, 0.25);
        g.fillPoints([
            { x: peakX, y: peakY },
            { x: peakX + hw * 0.25, y: sy - height * snowLine },
            { x: peakX + hw * 0.1, y: sy - height * snowLine },
        ], true);
    }
}

// ─── Isometric Building (Fort) ───────────────────────────────────────────────

export function drawIsoBuilding(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    width: number = 80,
    height: number = 40,
    color: number = 0x5a3a1a,
): void {
    // Building as isometric box
    drawIsoBlock(g, sx, sy, color, height, width, width / 2);

    // Roof — pointed
    const roofColor = 0x8b5a28;
    g.fillStyle(roofColor);
    g.fillPoints([
        { x: sx - width / 2, y: sy - height },
        { x: sx,             y: sy - width / 4 - height },
        { x: sx + width / 2, y: sy - height },
        { x: sx,             y: sy - height - height * 0.6 },
    ], true);

    // Door
    g.fillStyle(0x1a0e04);
    drawIsoTile(g, sx, sy - 2, 0x1a0e04, 1, 16, 8);

    // Windows
    g.fillStyle(0x3a6a90, 0.7);
    g.fillRect(sx - width / 4, sy - height + 10, 8, 8);
    g.fillRect(sx + width / 4 - 8, sy - height + 10, 8, 8);
}
