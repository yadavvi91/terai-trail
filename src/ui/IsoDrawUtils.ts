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

    // Covered wagon — isometric box body, rounded canvas bonnet, 4 visible wheels.
    const bodyW = 52 * s;   // diamond width (along isometric axis)
    const bodyH = 26 * s;   // diamond height
    const bodyD = 16 * s;   // vertical height of wooden box

    // ─── Shadow ───
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(sx, sy + 8 * s, bodyW * 1.2, bodyH * 0.5);

    // ─── Wheel helper ───
    const drawWheel = (wx: number, wy: number, big: boolean) => {
        const wh = big ? 18 * s : 14 * s;
        const ww = big ? 5 * s : 4 * s;
        // Iron rim
        g.fillStyle(0x3a3a3a);
        g.fillEllipse(wx, wy, ww + 2, wh + 2);
        // Wood
        g.fillStyle(0x5c3516);
        g.fillEllipse(wx, wy, ww, wh);
        // Spokes
        g.lineStyle(1, 0x8b6914, 0.8);
        const n = big ? 8 : 6;
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            g.beginPath();
            g.moveTo(wx, wy);
            g.lineTo(wx + Math.cos(a) * ww / 2, wy + Math.sin(a) * wh / 2);
            g.strokePath();
        }
        // Hub
        g.fillStyle(0x8b6914);
        g.fillCircle(wx, wy, 2 * s);
        g.fillStyle(0x2a1208);
        g.fillCircle(wx, wy, 1 * s);
    };

    // ─── Far-side wheels (behind body, mostly hidden — just tops peeking) ───
    drawWheel(sx - bodyW * 0.3,  sy - bodyD - bodyH * 0.1, true);
    drawWheel(sx + bodyW * 0.05, sy - bodyD - bodyH * 0.3, false);

    // ─── Wagon body — isometric box ───
    // Top face
    g.fillStyle(0x6b3a18);
    g.fillPoints([
        { x: sx - bodyW / 2, y: sy - bodyD },
        { x: sx,             y: sy - bodyH / 2 - bodyD },
        { x: sx + bodyW / 2, y: sy - bodyD },
        { x: sx,             y: sy + bodyH / 2 - bodyD },
    ], true);

    // Left face (near-side, lit)
    g.fillStyle(0x7a4420);
    g.fillPoints([
        { x: sx - bodyW / 2, y: sy - bodyD },
        { x: sx,             y: sy + bodyH / 2 - bodyD },
        { x: sx,             y: sy + bodyH / 2 },
        { x: sx - bodyW / 2, y: sy },
    ], true);

    // Right face (near-side, shadow)
    g.fillStyle(0x4a2208);
    g.fillPoints([
        { x: sx + bodyW / 2, y: sy - bodyD },
        { x: sx + bodyW / 2, y: sy },
        { x: sx,             y: sy + bodyH / 2 },
        { x: sx,             y: sy + bodyH / 2 - bodyD },
    ], true);

    // Plank lines on left face
    g.lineStyle(1, 0x3a1a06, 0.25);
    for (let i = 1; i <= 3; i++) {
        const t = i / 4;
        g.beginPath();
        g.moveTo(sx - bodyW / 2, sy - bodyD + bodyD * t);
        g.lineTo(sx, sy + bodyH / 2 - bodyD + bodyD * t);
        g.strokePath();
    }
    // Plank lines on right face
    for (let i = 1; i <= 3; i++) {
        const t = i / 4;
        g.beginPath();
        g.moveTo(sx + bodyW / 2, sy - bodyD + bodyD * t);
        g.lineTo(sx, sy + bodyH / 2 - bodyD + bodyD * t);
        g.strokePath();
    }

    // ─── Canvas bonnet — simple rounded dome over the wagon ───
    const bonnetH = 22 * s;

    // Bonnet left face (canvas, lit)
    g.fillStyle(0xf0e2c0);
    g.fillPoints([
        { x: sx - bodyW / 2 + 6 * s, y: sy - bodyD },
        { x: sx,                      y: sy + bodyH / 2 - bodyD },
        { x: sx,                      y: sy + bodyH / 2 - bodyD - bonnetH },
        { x: sx - bodyW / 2 + 6 * s,  y: sy - bodyD - bonnetH },
    ], true);

    // Bonnet right face (canvas, shadow)
    g.fillStyle(0xd8cca8);
    g.fillPoints([
        { x: sx + bodyW / 2 - 6 * s, y: sy - bodyD },
        { x: sx,                      y: sy + bodyH / 2 - bodyD },
        { x: sx,                      y: sy + bodyH / 2 - bodyD - bonnetH },
        { x: sx + bodyW / 2 - 6 * s,  y: sy - bodyD - bonnetH },
    ], true);

    // Bonnet top (bright)
    g.fillStyle(0xfaf0e0);
    g.fillPoints([
        { x: sx - bodyW / 2 + 6 * s, y: sy - bodyD - bonnetH },
        { x: sx,                      y: sy - bodyH / 2 - bodyD - bonnetH },
        { x: sx + bodyW / 2 - 6 * s,  y: sy - bodyD - bonnetH },
        { x: sx,                      y: sy + bodyH / 2 - bodyD - bonnetH },
    ], true);

    // Rounded top — ellipse to soften the top edge
    g.fillStyle(0xfaf0e0, 0.7);
    g.fillEllipse(sx, sy - bodyD - bonnetH + 2 * s, bodyW * 0.55, bodyH * 0.4);

    // Wooden hoops (3 visible ribs across the canvas)
    g.lineStyle(1.5 * s, 0x8b7040, 0.6);
    for (let i = 0; i < 3; i++) {
        const t = (i + 1) / 4;
        const hx = (sx - bodyW / 2 + 6 * s) + t * (bodyW / 2 - 6 * s);
        const hy = sy - bodyD + t * (bodyH / 2);
        g.beginPath();
        g.moveTo(hx, hy);
        g.lineTo(hx, hy - bonnetH);
        g.strokePath();
    }

    // Open back — dark interior
    g.fillStyle(0x1a0e04, 0.5);
    g.fillPoints([
        { x: sx - bodyW / 2 + 6 * s, y: sy - bodyD },
        { x: sx - bodyW / 2 + 6 * s, y: sy - bodyD - bonnetH },
        { x: sx - bodyW / 2 + 10 * s, y: sy - bodyD - bonnetH + 3 * s },
        { x: sx - bodyW / 2 + 10 * s, y: sy - bodyD + 2 * s },
    ], true);

    // ─── Near-side wheels — along the left face (viewer-facing side) ───
    const lf0x = sx - bodyW / 2, lf0y = sy;
    const lf1x = sx,             lf1y = sy + bodyH / 2;
    const rearT = 0.25, frontT = 0.70;
    drawWheel(lf0x + rearT * (lf1x - lf0x),  lf0y + rearT * (lf1y - lf0y) + 2 * s, true);
    drawWheel(lf0x + frontT * (lf1x - lf0x), lf0y + frontT * (lf1y - lf0y) + 2 * s, false);

    // ─── Tongue / yoke ─── from front of wagon toward oxen (upper-right)
    g.lineStyle(2.5 * s, 0x5c3516);
    g.beginPath();
    g.moveTo(sx + bodyW / 2, sy - bodyD / 2);
    g.lineTo(sx + bodyW / 2 + 22 * s, sy - bodyD - 10 * s);
    g.strokePath();
    // Yoke crossbar — sits across ox necks, perpendicular to trail
    g.lineStyle(2 * s, 0x4a2e10);
    const ykx = sx + bodyW / 2 + 22 * s;
    const yky = sy - bodyD - 10 * s;
    g.beginPath();
    g.moveTo(ykx - 7 * s, yky - 3 * s);
    g.lineTo(ykx + 7 * s, yky + 3 * s);
    g.strokePath();
}

// ─── Isometric Ox ────────────────────────────────────────────────────────────

export function drawIsoOx(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    scale: number = 1,
    animFrame: number = 0,  // 0-1 walk cycle phase
): void {
    const s = scale;

    // Ox oriented along the isometric trail (upper-right direction).
    const bodyLen = 9 * s;   // half-length (shorter, stockier ox)
    const bodyWid = 6 * s;

    const headX = sx + bodyLen;
    const headY = sy - bodyLen * 0.5;
    const rumpX = sx - bodyLen;
    const rumpY = sy + bodyLen * 0.5;

    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(sx + 2 * s, sy + 5 * s, bodyLen * 2.2, bodyWid * 1.2);

    // Legs — animated walk cycle (front and rear pairs alternate)
    const legW = 2.5 * s;
    const legH = 7 * s;
    const swing = Math.sin(animFrame * Math.PI * 2) * 3 * s; // leg swing amount
    g.fillStyle(0x3d2a08);
    // Rear near leg — at rump, tucked under body edge
    const rnx = rumpX + 2 * s, rny = rumpY + bodyWid * 0.1;
    g.fillRect(rnx + swing * 0.5, rny, legW, legH);
    // Rear far leg (opposite phase, slightly behind)
    g.fillRect(rnx + 5 * s - swing * 0.5, rny - 2.5 * s, legW, legH);
    // Front near leg — at head end
    const fnx = headX - 5 * s, fny = headY + bodyWid * 0.1;
    g.fillRect(fnx - swing * 0.5, fny, legW, legH);
    // Front far leg (opposite phase)
    g.fillRect(fnx + 5 * s + swing * 0.5, fny - 2.5 * s, legW, legH);
    // Hooves
    g.fillStyle(0x1a0e04);
    g.fillRect(rnx + swing * 0.5, rny + legH, legW, 2 * s);
    g.fillRect(rnx + 5 * s - swing * 0.5, rny - 2.5 * s + legH, legW, 2 * s);
    g.fillRect(fnx - swing * 0.5, fny + legH, legW, 2 * s);
    g.fillRect(fnx + 5 * s + swing * 0.5, fny - 2.5 * s + legH, legW, 2 * s);

    // Body — tapered: wider at rump, narrower at neck/head
    const rumpWid = bodyWid * 1.3;  // back is broader
    const neckWid = bodyWid * 0.8;  // neck area is narrower
    g.fillStyle(0x6b4c20);
    g.fillPoints([
        { x: rumpX,     y: rumpY - rumpWid },      // rump top
        { x: headX,     y: headY - neckWid },       // head top
        { x: headX,     y: headY + neckWid * 0.3 }, // head bottom
        { x: rumpX,     y: rumpY + rumpWid * 0.3 }, // rump bottom
    ], true);

    // Body highlight (top surface, lit from above)
    g.fillStyle(0x7a5c30, 0.5);
    g.fillPoints([
        { x: rumpX + 2 * s, y: rumpY - rumpWid + 1 * s },
        { x: headX - 2 * s, y: headY - neckWid + 1 * s },
        { x: headX - 2 * s, y: headY - neckWid * 0.3 },
        { x: rumpX + 2 * s, y: rumpY - rumpWid * 0.3 },
    ], true);

    // Hump (near shoulders/neck — shifted toward head end)
    const humpX = sx + bodyLen * 0.5;
    const humpY = sy - bodyLen * 0.25 - bodyWid - 2 * s;
    g.fillStyle(0x7a5c30);
    g.fillEllipse(humpX, humpY, 9 * s, 5 * s);

    // Head — at the head end, angled forward-up
    g.fillStyle(0x6b4c20);
    g.fillEllipse(headX + 4 * s, headY - 4 * s, 10 * s, 8 * s);

    // Horns
    g.fillStyle(0xe8d080);
    g.fillTriangle(
        headX + 2 * s,  headY - 8 * s,
        headX - 1 * s,  headY - 14 * s,
        headX + 6 * s,  headY - 10 * s,
    );

    // Eye
    g.fillStyle(0x1a0e04);
    g.fillCircle(headX + 6 * s, headY - 5 * s, 1.5 * s);

    // Tail — at rump end
    g.lineStyle(1.5 * s, 0x4a3010);
    g.beginPath();
    g.moveTo(rumpX, rumpY);
    g.lineTo(rumpX - 6 * s, rumpY + 4 * s);
    g.strokePath();
    // Tail tuft
    g.fillStyle(0x3d2a08);
    g.fillCircle(rumpX - 6 * s, rumpY + 4 * s, 2 * s);
}

// ─── Isometric Person ────────────────────────────────────────────────────────

/** Pioneer role for visual differentiation */
export type PioneerRole = 'father' | 'mother' | 'child';

/**
 * Draw an isometric pioneer.  Role determines hat style, proportions, clothing:
 *  - father: wide-brim frontier hat, suspenders, taller
 *  - mother: bonnet, long dress/skirt
 *  - child:  smaller, simple cap or bare-headed
 */
export function drawIsoPerson(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    scale: number = 1,
    clothColor: number = 0x7a5a38,
    walkPhase: number = -1,
    facingAway: boolean = false,
    role: PioneerRole = 'father',
): void {
    const isChild = role === 'child';
    const s = scale * (isChild ? 0.7 : 1); // children are smaller
    const walking = walkPhase >= 0;
    const legSwing = walking ? Math.sin(walkPhase * Math.PI * 2) * 4 * s : 0;
    const armSwing = walking ? Math.sin(walkPhase * Math.PI * 2) * 3 * s : 0;
    const bob = walking ? Math.abs(Math.sin(walkPhase * Math.PI * 2)) * 1.5 * s : 0;
    const bodyY = sy - bob;

    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(sx + 1 * s, bodyY + 4 * s, 14 * s, 7 * s);

    if (role === 'mother') {
        // --- MOTHER: long skirt instead of separate legs ---
        const sway = walking ? Math.sin(walkPhase * Math.PI * 2) * 2 * s : 0;
        g.fillStyle(0x5a3a28);
        g.fillPoints([
            { x: sx - 6 * s, y: bodyY - 8 * s },
            { x: sx + 6 * s, y: bodyY - 8 * s },
            { x: sx + 8 * s + sway, y: bodyY + 3 * s },
            { x: sx - 8 * s - sway, y: bodyY + 3 * s },
        ], true);
        // Feet peeking
        g.fillStyle(0x2a1808);
        g.fillEllipse(sx - 3 * s, bodyY + 3 * s, 4 * s, 3 * s);
        g.fillEllipse(sx + 3 * s, bodyY + 3 * s, 4 * s, 3 * s);
    } else {
        // --- FATHER / CHILD: trousers + boots ---
        g.fillStyle(0x2a1808);
        g.fillEllipse(sx - 3 * s - legSwing * 0.5, bodyY + 2 * s, 5 * s, 4 * s);
        g.fillStyle(0x3a2818);
        g.fillRect(sx - 5 * s - legSwing * 0.5, bodyY - 8 * s, 4 * s, 11 * s);
        g.fillStyle(0x2a1808);
        g.fillEllipse(sx + 3 * s + legSwing * 0.5, bodyY + 2 * s, 5 * s, 4 * s);
        g.fillStyle(0x4a3828);
        g.fillRect(sx + 1 * s + legSwing * 0.5, bodyY - 8 * s, 4 * s, 11 * s);
    }

    // Torso
    g.fillStyle(clothColor);
    g.fillPoints([
        { x: sx - 6 * s, y: bodyY - 8 * s },
        { x: sx - 7 * s, y: bodyY - 20 * s },
        { x: sx + 7 * s, y: bodyY - 20 * s },
        { x: sx + 6 * s, y: bodyY - 8 * s },
    ], true);

    if (role === 'father') {
        // Suspenders
        g.fillStyle(0x3a2010, 0.7);
        g.fillRect(sx - 4 * s, bodyY - 20 * s, 2 * s, 12 * s);
        g.fillRect(sx + 2 * s, bodyY - 20 * s, 2 * s, 12 * s);
    } else if (role === 'mother') {
        // Collar / shawl
        g.fillStyle(0xf0e0c0, 0.5);
        g.fillEllipse(sx, bodyY - 20 * s, 10 * s, 4 * s);
    }

    // Belt (not on children)
    if (!isChild) {
        g.fillStyle(0x2a1808);
        g.fillRect(sx - 6 * s, bodyY - 9 * s, 12 * s, 2 * s);
        if (!facingAway) {
            g.fillStyle(0xc8a040);
            g.fillRect(sx - 1 * s, bodyY - 10 * s, 2 * s, 3 * s);
        }
    }

    // Arms
    const darkerCloth = clothColor - 0x101010;
    g.fillStyle(darkerCloth > 0 ? darkerCloth : clothColor);
    g.fillPoints([
        { x: sx - 7 * s, y: bodyY - 19 * s },
        { x: sx - 10 * s + armSwing, y: bodyY - 10 * s },
        { x: sx - 7 * s, y: bodyY - 10 * s },
    ], true);
    g.fillPoints([
        { x: sx + 7 * s, y: bodyY - 19 * s },
        { x: sx + 10 * s - armSwing, y: bodyY - 10 * s },
        { x: sx + 7 * s, y: bodyY - 10 * s },
    ], true);

    // Hands
    g.fillStyle(0xd4956a);
    g.fillCircle(sx - 9 * s + armSwing, bodyY - 9 * s, 2 * s);
    g.fillCircle(sx + 9 * s - armSwing, bodyY - 9 * s, 2 * s);

    // Neck
    g.fillStyle(facingAway ? 0xc08050 : 0xd4956a);
    g.fillRect(sx - 2 * s, bodyY - 23 * s, 4 * s, 4 * s);

    // Head
    g.fillStyle(facingAway ? 0xc08050 : 0xd4956a);
    g.fillCircle(sx, bodyY - 27 * s, 6 * s);

    if (facingAway) {
        g.fillStyle(0x3a2210);
        g.fillCircle(sx, bodyY - 27 * s, 5.5 * s);
    } else {
        g.fillStyle(0x1a0e04);
        g.fillCircle(sx - 2 * s, bodyY - 28 * s, 1 * s);
        g.fillCircle(sx + 2 * s, bodyY - 28 * s, 1 * s);
    }

    // --- Hat / headwear by role ---
    if (role === 'father') {
        g.fillStyle(0x3a2510);
        g.fillEllipse(sx, bodyY - 32 * s, 16 * s, 5 * s);
        g.fillStyle(0x4a3218);
        g.fillPoints([
            { x: sx - 5 * s, y: bodyY - 32 * s },
            { x: sx - 4 * s, y: bodyY - 35 * s },
            { x: sx + 4 * s, y: bodyY - 35 * s },
            { x: sx + 5 * s, y: bodyY - 32 * s },
        ], true);
        g.fillStyle(0xc8a040);
        g.fillRect(sx - 5 * s, bodyY - 33 * s, 10 * s, 1.5 * s);
    } else if (role === 'mother') {
        g.fillStyle(0xf0e0c0);
        g.fillEllipse(sx, bodyY - 31 * s, 14 * s, 10 * s);
        g.fillStyle(0xe0d0b0);
        g.fillEllipse(sx + 3 * s, bodyY - 28 * s, 6 * s, 5 * s);
        g.fillStyle(clothColor);
        g.fillRect(sx + 5 * s, bodyY - 26 * s, 1.5 * s, 6 * s);
    } else {
        if (facingAway) {
            g.fillStyle(0x5a3a20);
            g.fillEllipse(sx, bodyY - 30 * s, 10 * s, 5 * s);
        } else {
            g.fillStyle(0x5a3a20);
            g.fillEllipse(sx, bodyY - 31 * s, 10 * s, 5 * s);
        }
    }
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
