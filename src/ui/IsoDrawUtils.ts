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
    g.fillEllipse(sx + 1 * s, sy + 2 * s, 12 * s, 6 * s);

    // Legs
    g.fillStyle(0x4a3020);
    g.fillRect(sx - 3 * s, sy - 4 * s, 3 * s, 8 * s);
    g.fillRect(sx + 1 * s, sy - 4 * s, 3 * s, 8 * s);

    // Body
    g.fillStyle(clothColor);
    g.fillEllipse(sx, sy - 12 * s, 10 * s, 14 * s);

    // Head
    g.fillStyle(0xd4956a);
    g.fillCircle(sx, sy - 22 * s, 5 * s);

    // Hat
    g.fillStyle(0x3a2510);
    g.fillEllipse(sx, sy - 26 * s, 12 * s, 6 * s);
    g.fillEllipse(sx, sy - 28 * s, 8 * s, 5 * s);
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

    // Main mountain body — iso diamond pyramid
    g.fillStyle(color);
    g.fillPoints([
        { x: sx - hw, y: sy },           // left
        { x: sx,      y: sy - height },  // top (peak)
        { x: sx + hw, y: sy },           // right
        { x: sx,      y: sy + hw * 0.3 }, // bottom
    ], true);

    // Right shadow face
    g.fillStyle(0x000000, 0.2);
    g.fillPoints([
        { x: sx,      y: sy - height },
        { x: sx + hw, y: sy },
        { x: sx,      y: sy + hw * 0.3 },
    ], true);

    // Left highlight face
    g.fillStyle(color + 0x101010, 0.3);
    g.fillPoints([
        { x: sx - hw, y: sy },
        { x: sx,      y: sy - height },
        { x: sx,      y: sy + hw * 0.3 },
    ], true);

    // Rock stratification
    g.lineStyle(1, 0x000000, 0.15);
    for (let i = 1; i <= 3; i++) {
        const t = i * 0.22;
        const lw = hw * (1 - t);
        const ly = sy - height * (1 - t);
        g.beginPath();
        g.moveTo(sx - lw, ly + lw * 0.15);
        g.lineTo(sx + lw, ly + lw * 0.15);
        g.strokePath();
    }

    if (snowCap) {
        g.fillStyle(0xedf4ff, 0.9);
        g.fillPoints([
            { x: sx - hw * 0.25, y: sy - height * 0.72 },
            { x: sx,             y: sy - height },
            { x: sx + hw * 0.2,  y: sy - height * 0.72 },
        ], true);
        // Snow shadow
        g.fillStyle(0xb8d0f0, 0.4);
        g.fillPoints([
            { x: sx,             y: sy - height },
            { x: sx + hw * 0.2,  y: sy - height * 0.72 },
            { x: sx + hw * 0.08, y: sy - height * 0.72 },
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
