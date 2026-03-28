/**
 * Terai Trail — Drawing utilities for landscape, wildlife, and structures.
 * All procedural vector art via Phaser.GameObjects.Graphics.
 *
 * WP05: Landscape (sal tree, elephant grass, bamboo, Shivalik hills)
 * WP06: Animals (tiger, cobra, boar, peacock, elephant, monkey, mosquito)
 * WP07: Structures (hut, well, gurdwara, crop field)
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function shadeColor(color: number, factor: number): number {
    const r = Math.min(255, Math.max(0, ((color >> 16) & 0xff) + Math.round(255 * factor)));
    const g = Math.min(255, Math.max(0, ((color >> 8) & 0xff) + Math.round(255 * factor)));
    const b = Math.min(255, Math.max(0, (color & 0xff) + Math.round(255 * factor)));
    return (r << 16) | (g << 8) | b;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WP05 — LANDSCAPE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sal tree — tall straight trunk with dome canopy.
 * The dominant tree of the Terai forests.
 */
export function drawSalTree(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Shadow
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(x + 4 * s, y + 2 * s, 30 * s, 8 * s);

    // Trunk
    g.fillStyle(0x4a3020);
    g.fillRect(x - 3 * s, y - 50 * s, 6 * s, 52 * s);
    // Bark detail
    g.fillStyle(0x3a2418, 0.5);
    g.fillRect(x - 2 * s, y - 40 * s, 1.5 * s, 12 * s);
    g.fillRect(x + 1 * s, y - 28 * s, 1.5 * s, 10 * s);

    // Canopy — dome shape using ellipses
    g.fillStyle(0x1a5a1e);
    g.fillEllipse(x, y - 60 * s, 32 * s, 26 * s);
    // Lighter top
    g.fillStyle(0x2d7030, 0.7);
    g.fillEllipse(x - 2 * s, y - 64 * s, 24 * s, 18 * s);
    // Highlight
    g.fillStyle(0x3a8a38, 0.4);
    g.fillEllipse(x - 4 * s, y - 66 * s, 14 * s, 10 * s);
}

/**
 * Elephant grass — tall swaying clumps, 6-8 feet tall.
 */
export function drawElephantGrass(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;
    const blades = 7;
    for (let i = 0; i < blades; i++) {
        const bx = x + (i - blades / 2) * 4 * s;
        const sway = Math.sin(i * 1.3) * 6 * s;
        const h = (35 + i * 3) * s;
        const green = i % 2 === 0 ? 0x6a8a30 : 0x7a9a3a;
        g.fillStyle(green);
        g.fillTriangle(
            bx - 2 * s, y,
            bx + sway, y - h,
            bx + 2 * s, y,
        );
    }
}

/**
 * Bamboo clump — dense cluster with arching stems.
 */
export function drawBambooClump(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;
    const stems = 5;
    for (let i = 0; i < stems; i++) {
        const sx = x + (i - stems / 2) * 5 * s;
        const lean = (i - stems / 2) * 3 * s;
        const h = (45 + i * 4) * s;

        // Stem
        g.fillStyle(i % 2 === 0 ? 0x5a8a30 : 0x4a7a28);
        g.fillRect(sx - 1.5 * s, y - h, 3 * s, h);

        // Nodes
        g.fillStyle(0x4a6a20);
        for (let n = 1; n < 4; n++) {
            g.fillRect(sx - 2 * s, y - h * n / 4, 4 * s, 2 * s);
        }

        // Leaves at top
        g.fillStyle(0x3a7a20);
        g.fillEllipse(sx + lean, y - h - 5 * s, 12 * s, 8 * s);
    }
}

/**
 * Shivalik hills — low rolling blue-green hills as distant backdrop.
 */
export function drawShivalikHills(
    g: Phaser.GameObjects.Graphics,
    baseY: number,
    screenWidth: number,
    colors: number[],
    alpha: number = 0.6,
): void {
    // 3 rolling layers of hills
    const layers = [
        { yOff: 0, height: 60, color: colors[0] ?? 0x5a7a5a },
        { yOff: 15, height: 50, color: colors[1] ?? 0x4a6a4a },
        { yOff: 30, height: 40, color: colors[2] ?? 0x507050 },
    ];

    layers.forEach(layer => {
        g.fillStyle(layer.color, alpha);
        // Gentle sinusoidal rolling hills
        const pts: Phaser.Types.Math.Vector2Like[] = [];
        pts.push({ x: 0, y: baseY + layer.yOff });
        for (let px = 0; px <= screenWidth; px += 8) {
            const hill = Math.sin(px * 0.005 + layer.yOff * 0.1) * layer.height * 0.5
                       + Math.sin(px * 0.012 + layer.yOff * 0.2) * layer.height * 0.3;
            pts.push({ x: px, y: baseY + layer.yOff - layer.height + hill });
        }
        pts.push({ x: screenWidth, y: baseY + layer.yOff });
        g.fillPoints(pts, true);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// WP06 — ANIMALS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Royal Bengal Tiger — stalking side view, orange with black stripes.
 */
export function drawTiger(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
    facingRight: boolean = true,
): void {
    const s = scale;
    const dir = facingRight ? 1 : -1;

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(x, y + 2 * s, 50 * s, 8 * s);

    // Body
    g.fillStyle(0xd48020);
    g.fillEllipse(x, y - 10 * s, 44 * s, 18 * s);

    // Belly (lighter)
    g.fillStyle(0xf0c070);
    g.fillEllipse(x, y - 6 * s, 36 * s, 10 * s);

    // Stripes
    g.fillStyle(0x1a0a00);
    for (let i = -3; i <= 3; i++) {
        g.fillRect(x + i * 6 * s * dir, y - 18 * s, 2 * s, 14 * s);
    }

    // Head
    g.fillStyle(0xd48020);
    g.fillEllipse(x + 24 * s * dir, y - 14 * s, 16 * s, 14 * s);

    // Ears
    g.fillStyle(0xd48020);
    g.fillCircle(x + 20 * s * dir, y - 22 * s, 4 * s);
    g.fillCircle(x + 28 * s * dir, y - 22 * s, 4 * s);
    g.fillStyle(0xf0c070);
    g.fillCircle(x + 20 * s * dir, y - 22 * s, 2 * s);
    g.fillCircle(x + 28 * s * dir, y - 22 * s, 2 * s);

    // Eyes
    g.fillStyle(0x00aa00);
    g.fillCircle(x + 22 * s * dir, y - 16 * s, 2 * s);
    g.fillStyle(0x000000);
    g.fillCircle(x + 22 * s * dir, y - 16 * s, 1 * s);

    // Nose
    g.fillStyle(0x804020);
    g.fillCircle(x + 30 * s * dir, y - 12 * s, 2 * s);

    // Legs
    g.fillStyle(0xc07018);
    g.fillRect(x - 12 * s, y - 2 * s, 5 * s, 12 * s);
    g.fillRect(x - 2 * s, y - 2 * s, 5 * s, 12 * s);
    g.fillRect(x + 8 * s, y - 2 * s, 5 * s, 12 * s);
    g.fillRect(x + 16 * s, y - 2 * s, 5 * s, 12 * s);

    // Tail
    g.fillStyle(0xd48020);
    g.fillRect(x - 22 * s * dir, y - 14 * s, 3 * s, 16 * s);
    // Tail stripes
    g.fillStyle(0x1a0a00);
    g.fillRect(x - 22 * s * dir, y - 10 * s, 3 * s, 3 * s);
    g.fillRect(x - 22 * s * dir, y - 4 * s, 3 * s, 3 * s);
}

/**
 * Indian Cobra — raised hood, dark body.
 */
export function drawCobra(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Coiled body
    g.fillStyle(0x2a2a20);
    g.fillEllipse(x, y, 16 * s, 10 * s);

    // Upright body
    g.fillStyle(0x3a3a30);
    g.fillRect(x - 2 * s, y - 24 * s, 4 * s, 24 * s);

    // Hood (spread)
    g.fillStyle(0x4a4a38);
    g.fillEllipse(x, y - 26 * s, 16 * s, 12 * s);
    // Hood markings
    g.fillStyle(0x2a2a20);
    g.fillEllipse(x, y - 28 * s, 6 * s, 4 * s);

    // Eyes
    g.fillStyle(0xffaa00);
    g.fillCircle(x - 3 * s, y - 28 * s, 1.5 * s);
    g.fillCircle(x + 3 * s, y - 28 * s, 1.5 * s);

    // Tongue
    g.fillStyle(0xcc2222);
    g.fillRect(x - 0.5 * s, y - 22 * s, 1 * s, 4 * s);
}

/**
 * Wild Boar — tusks visible, bristled back.
 */
export function drawWildBoar(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(x, y + 2 * s, 30 * s, 6 * s);

    // Body
    g.fillStyle(0x3a3028);
    g.fillEllipse(x, y - 8 * s, 30 * s, 16 * s);

    // Bristle ridge
    g.fillStyle(0x2a2018);
    for (let i = -4; i <= 2; i++) {
        g.fillTriangle(
            x + i * 4 * s, y - 16 * s,
            x + i * 4 * s - 2 * s, y - 12 * s,
            x + i * 4 * s + 2 * s, y - 12 * s,
        );
    }

    // Head
    g.fillStyle(0x4a3828);
    g.fillEllipse(x + 16 * s, y - 8 * s, 12 * s, 10 * s);

    // Snout
    g.fillStyle(0x6a5038);
    g.fillEllipse(x + 22 * s, y - 6 * s, 8 * s, 6 * s);

    // Tusks
    g.fillStyle(0xe0d8c0);
    g.fillTriangle(x + 20 * s, y - 8 * s, x + 24 * s, y - 14 * s, x + 22 * s, y - 6 * s);

    // Eye
    g.fillStyle(0x1a0a00);
    g.fillCircle(x + 14 * s, y - 10 * s, 1.5 * s);

    // Legs
    g.fillStyle(0x2a2018);
    g.fillRect(x - 8 * s, y - 1 * s, 4 * s, 8 * s);
    g.fillRect(x + 2 * s, y - 1 * s, 4 * s, 8 * s);
    g.fillRect(x + 8 * s, y - 1 * s, 4 * s, 7 * s);
}

/**
 * Indian Peacock — tail display fan with iridescent blue-green.
 */
export function drawPeacock(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Tail fan — arc of iridescent feathers
    const featherCount = 11;
    for (let i = 0; i < featherCount; i++) {
        const angle = (i / (featherCount - 1)) * Math.PI - Math.PI / 2;
        const fx = x + Math.cos(angle) * 25 * s;
        const fy = y - 20 * s + Math.sin(angle) * 20 * s;
        const color = i % 3 === 0 ? 0x1a6a4a : i % 3 === 1 ? 0x2a8a5a : 0x107050;
        g.fillStyle(color);
        g.fillEllipse(fx, fy, 6 * s, 14 * s);
        // Eye spot
        g.fillStyle(0x3030aa);
        g.fillCircle(fx, fy - 3 * s, 2 * s);
        g.fillStyle(0x00ccaa);
        g.fillCircle(fx, fy - 3 * s, 1 * s);
    }

    // Body
    g.fillStyle(0x1a4a8a);
    g.fillEllipse(x, y - 6 * s, 14 * s, 12 * s);

    // Neck
    g.fillStyle(0x1a4a8a);
    g.fillRect(x - 2 * s, y - 18 * s, 4 * s, 14 * s);

    // Head
    g.fillStyle(0x1a4a8a);
    g.fillCircle(x, y - 20 * s, 4 * s);

    // Crown feathers
    g.fillStyle(0x2a6aaa);
    for (let i = -1; i <= 1; i++) {
        g.fillRect(x + i * 2 * s, y - 28 * s, 1 * s, 8 * s);
        g.fillCircle(x + i * 2 * s, y - 28 * s, 1.5 * s);
    }

    // Beak
    g.fillStyle(0x8a6a30);
    g.fillTriangle(x + 4 * s, y - 21 * s, x + 8 * s, y - 20 * s, x + 4 * s, y - 19 * s);

    // Eye
    g.fillStyle(0x1a0a00);
    g.fillCircle(x + 2 * s, y - 21 * s, 1 * s);
}

/**
 * Indian Elephant — smaller ears than African.
 */
export function drawElephant(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(x, y + 4 * s, 60 * s, 12 * s);

    // Body
    g.fillStyle(0x6a6a60);
    g.fillEllipse(x, y - 14 * s, 50 * s, 28 * s);

    // Head
    g.fillStyle(0x7a7a70);
    g.fillEllipse(x + 28 * s, y - 18 * s, 20 * s, 22 * s);

    // Ear (smaller — Indian elephant)
    g.fillStyle(0x8a6a6a);
    g.fillEllipse(x + 20 * s, y - 16 * s, 10 * s, 14 * s);

    // Trunk
    g.fillStyle(0x7a7a70);
    g.fillRect(x + 32 * s, y - 14 * s, 5 * s, 26 * s);
    // Trunk curl
    g.fillStyle(0x8a8a80);
    g.fillCircle(x + 36 * s, y + 12 * s, 4 * s);

    // Tusks
    g.fillStyle(0xf0e8d0);
    g.fillRect(x + 28 * s, y - 4 * s, 3 * s, 14 * s);
    // Tusk tip
    g.fillStyle(0xe0d8c0);
    g.fillCircle(x + 29.5 * s, y + 10 * s, 2 * s);

    // Eye
    g.fillStyle(0x1a1a10);
    g.fillCircle(x + 32 * s, y - 22 * s, 2 * s);

    // Legs
    g.fillStyle(0x5a5a50);
    g.fillRect(x - 16 * s, y - 2 * s, 8 * s, 18 * s);
    g.fillRect(x - 4 * s, y - 2 * s, 8 * s, 18 * s);
    g.fillRect(x + 10 * s, y - 2 * s, 8 * s, 17 * s);
    g.fillRect(x + 22 * s, y - 2 * s, 8 * s, 16 * s);

    // Tail
    g.fillStyle(0x5a5a50);
    g.fillRect(x - 26 * s, y - 14 * s, 2 * s, 16 * s);
}

/**
 * Langur Monkey — grey body with dark face.
 */
export function drawMonkey(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Tail (long, curved)
    g.fillStyle(0x8a8a80);
    g.fillRect(x - 14 * s, y - 8 * s, 2 * s, 20 * s);
    g.fillCircle(x - 14 * s, y + 12 * s, 2 * s);

    // Body
    g.fillStyle(0x9a9a90);
    g.fillEllipse(x, y - 6 * s, 14 * s, 16 * s);

    // Head
    g.fillStyle(0x9a9a90);
    g.fillCircle(x + 2 * s, y - 16 * s, 6 * s);

    // Dark face
    g.fillStyle(0x2a2a28);
    g.fillCircle(x + 3 * s, y - 16 * s, 4 * s);

    // Eyes
    g.fillStyle(0xffffff);
    g.fillCircle(x + 1 * s, y - 17 * s, 1.5 * s);
    g.fillCircle(x + 5 * s, y - 17 * s, 1.5 * s);
    g.fillStyle(0x1a1a10);
    g.fillCircle(x + 1 * s, y - 17 * s, 0.7 * s);
    g.fillCircle(x + 5 * s, y - 17 * s, 0.7 * s);

    // Arms
    g.fillStyle(0x8a8a80);
    g.fillRect(x - 6 * s, y - 8 * s, 3 * s, 12 * s);
    g.fillRect(x + 5 * s, y - 8 * s, 3 * s, 12 * s);

    // Legs
    g.fillRect(x - 4 * s, y + 2 * s, 3 * s, 8 * s);
    g.fillRect(x + 2 * s, y + 2 * s, 3 * s, 8 * s);
}

/**
 * Stylized mosquito icon — for malaria event indicator.
 */
export function drawMosquito(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Wings
    g.fillStyle(0xaaaacc, 0.5);
    g.fillEllipse(x - 5 * s, y - 4 * s, 8 * s, 4 * s);
    g.fillEllipse(x + 5 * s, y - 4 * s, 8 * s, 4 * s);

    // Body
    g.fillStyle(0x2a2a28);
    g.fillEllipse(x, y, 4 * s, 10 * s);

    // Head
    g.fillCircle(x, y - 6 * s, 2 * s);

    // Proboscis (needle)
    g.lineStyle(1 * s, 0x2a2a28);
    g.beginPath();
    g.moveTo(x, y - 8 * s);
    g.lineTo(x, y - 14 * s);
    g.strokePath();

    // Legs (3 pairs)
    g.lineStyle(0.5 * s, 0x2a2a28);
    for (let i = -1; i <= 1; i++) {
        g.beginPath();
        g.moveTo(x - 2 * s, y + i * 3 * s);
        g.lineTo(x - 8 * s, y + i * 3 * s + 4 * s);
        g.strokePath();
        g.beginPath();
        g.moveTo(x + 2 * s, y + i * 3 * s);
        g.lineTo(x + 8 * s, y + i * 3 * s + 4 * s);
        g.strokePath();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WP07 — STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Thatch Hut — rectangular base with sloped thatch roof, bamboo/mud walls.
 */
export function drawThatchHut(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(x, y + 4 * s, 44 * s, 10 * s);

    // Mud walls
    g.fillStyle(0xa08050);
    g.fillRect(x - 18 * s, y - 20 * s, 36 * s, 22 * s);
    // Wall texture
    g.fillStyle(0x8a6a40, 0.4);
    g.fillRect(x - 16 * s, y - 18 * s, 14 * s, 8 * s);
    g.fillRect(x + 2 * s, y - 18 * s, 14 * s, 8 * s);

    // Door
    g.fillStyle(0x3a2a18);
    g.fillRect(x - 4 * s, y - 14 * s, 8 * s, 16 * s);

    // Thatch roof
    g.fillStyle(0xc4a050);
    g.fillTriangle(
        x - 22 * s, y - 20 * s,
        x, y - 40 * s,
        x + 22 * s, y - 20 * s,
    );
    // Roof texture (straw lines)
    g.fillStyle(0xb09040, 0.6);
    for (let i = -2; i <= 2; i++) {
        g.fillRect(x + i * 6 * s, y - 35 * s + Math.abs(i) * 5 * s, 1 * s, 16 * s);
    }
}

/**
 * Well — stone/brick circular well with rope and bucket.
 */
export function drawWell(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Stone base (ellipse for perspective)
    g.fillStyle(0x7a7a70);
    g.fillEllipse(x, y, 20 * s, 12 * s);
    // Inner hole (dark)
    g.fillStyle(0x1a1a18);
    g.fillEllipse(x, y - 2 * s, 14 * s, 8 * s);

    // Stone wall rim
    g.fillStyle(0x8a8a80);
    g.fillEllipse(x, y - 4 * s, 22 * s, 10 * s);

    // Support posts
    g.fillStyle(0x4a3020);
    g.fillRect(x - 10 * s, y - 24 * s, 3 * s, 22 * s);
    g.fillRect(x + 7 * s, y - 24 * s, 3 * s, 22 * s);

    // Crossbar
    g.fillRect(x - 10 * s, y - 26 * s, 20 * s, 3 * s);

    // Rope
    g.lineStyle(1 * s, 0x8a7a50);
    g.beginPath();
    g.moveTo(x, y - 24 * s);
    g.lineTo(x, y - 8 * s);
    g.strokePath();

    // Bucket
    g.fillStyle(0x5a4a30);
    g.fillRect(x - 3 * s, y - 10 * s, 6 * s, 6 * s);
}

/**
 * Gurdwara — Sikh temple with dome (gumbad) and nishan sahib flag.
 */
export function drawGurdwara(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
): void {
    const s = scale;

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(x, y + 4 * s, 56 * s, 12 * s);

    // Base building — white-washed walls
    g.fillStyle(0xf0e8d0);
    g.fillRect(x - 22 * s, y - 30 * s, 44 * s, 32 * s);

    // Entrance arch
    g.fillStyle(0xd0c0a0);
    g.fillEllipse(x, y - 14 * s, 14 * s, 18 * s);
    g.fillStyle(0x3a2a18);
    g.fillRect(x - 5 * s, y - 14 * s, 10 * s, 16 * s);

    // Dome (gumbad) — gold/white
    g.fillStyle(0xe0d080);
    g.fillEllipse(x, y - 42 * s, 24 * s, 20 * s);
    // Dome highlight
    g.fillStyle(0xf0e8c0, 0.5);
    g.fillEllipse(x - 3 * s, y - 44 * s, 14 * s, 12 * s);

    // Dome finial (kalash)
    g.fillStyle(0xd4a830);
    g.fillRect(x - 1.5 * s, y - 54 * s, 3 * s, 12 * s);
    g.fillCircle(x, y - 56 * s, 3 * s);

    // Nishan Sahib (saffron triangular flag on tall pole) — to the right
    const flagX = x + 30 * s;
    // Pole
    g.fillStyle(0x3a3a38);
    g.fillRect(flagX - 1 * s, y - 60 * s, 2 * s, 62 * s);
    // Saffron flag (triangular)
    g.fillStyle(0xff9933);
    g.fillTriangle(
        flagX + 1 * s, y - 58 * s,
        flagX + 18 * s, y - 52 * s,
        flagX + 1 * s, y - 46 * s,
    );
    // Khanda symbol (simplified circle)
    g.fillStyle(0x000080);
    g.fillCircle(flagX + 8 * s, y - 52 * s, 3 * s);

    // Steps
    g.fillStyle(0xd0c8b0);
    g.fillRect(x - 14 * s, y, 28 * s, 4 * s);
    g.fillRect(x - 18 * s, y + 4 * s, 36 * s, 3 * s);
}

/**
 * Crop field — rows of wheat/sugarcane. Color shifts by season.
 */
export function drawCropField(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    scale: number = 1,
    seasonColor: number = 0xd4a830, // default golden
): void {
    const s = scale;
    const rows = 6;
    const colsPerRow = 8;

    // Plowed earth base
    g.fillStyle(0x6a5030);
    g.fillRect(x - 24 * s, y - 8 * s, 48 * s, 18 * s);

    // Crop rows
    for (let r = 0; r < rows; r++) {
        const ry = y - 6 * s + r * 3 * s;
        for (let c = 0; c < colsPerRow; c++) {
            const cx = x - 22 * s + c * 6 * s;
            const shade = (r + c) % 2 === 0 ? seasonColor : shadeColor(seasonColor, -0.05);
            g.fillStyle(shade);
            g.fillRect(cx, ry, 3 * s, 2 * s);
        }
    }
}

/**
 * Isometric diamond tile — the building block for the settlement grid.
 * 2:1 width:height ratio diamond.
 */
export function drawIsoDiamondTile(
    g: Phaser.GameObjects.Graphics,
    cx: number, cy: number,
    tileW: number, tileH: number,
    color: number, alpha: number = 1,
): void {
    g.fillStyle(color, alpha);
    g.fillPoints([
        { x: cx, y: cy - tileH / 2 },       // top
        { x: cx + tileW / 2, y: cy },         // right
        { x: cx, y: cy + tileH / 2 },         // bottom
        { x: cx - tileW / 2, y: cy },         // left
    ], true);
}

/**
 * Isometric diamond tile with a raised "side" to give 3D depth.
 */
export function drawIsoDiamondTile3D(
    g: Phaser.GameObjects.Graphics,
    cx: number, cy: number,
    tileW: number, tileH: number,
    topColor: number, leftColor: number, rightColor: number,
    depth: number = 4, alpha: number = 1,
): void {
    // Left side face
    g.fillStyle(leftColor, alpha);
    g.fillPoints([
        { x: cx - tileW / 2, y: cy },
        { x: cx, y: cy + tileH / 2 },
        { x: cx, y: cy + tileH / 2 + depth },
        { x: cx - tileW / 2, y: cy + depth },
    ], true);

    // Right side face
    g.fillStyle(rightColor, alpha);
    g.fillPoints([
        { x: cx + tileW / 2, y: cy },
        { x: cx, y: cy + tileH / 2 },
        { x: cx, y: cy + tileH / 2 + depth },
        { x: cx + tileW / 2, y: cy + depth },
    ], true);

    // Top face
    g.fillStyle(topColor, alpha);
    g.fillPoints([
        { x: cx, y: cy - tileH / 2 },
        { x: cx + tileW / 2, y: cy },
        { x: cx, y: cy + tileH / 2 },
        { x: cx - tileW / 2, y: cy },
    ], true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// WP08/09 — ISOMETRIC VERSIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Isometric Bullock Cart — open wooden cart, two large wheels, loaded with supplies.
 */
export function drawIsoBullockCart(
    g: Phaser.GameObjects.Graphics,
    sx: number, sy: number,
    scale: number = 1,
): void {
    const s = scale;
    const bodyW = 48 * s;
    const bodyH = 24 * s;
    const bodyD = 12 * s;

    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(sx, sy + 6 * s, bodyW * 1.1, bodyH * 0.5);

    // Wheels (2 large wooden wheels)
    const drawCartWheel = (wx: number, wy: number) => {
        const wh = 16 * s;
        const ww = 4 * s;
        g.fillStyle(0x3a3a3a);
        g.fillEllipse(wx, wy, ww + 2, wh + 2);
        g.fillStyle(0x5c3516);
        g.fillEllipse(wx, wy, ww, wh);
        // Spokes
        g.lineStyle(1, 0x8b6914, 0.8);
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            g.beginPath();
            g.moveTo(wx, wy);
            g.lineTo(wx + Math.cos(a) * ww / 2, wy + Math.sin(a) * wh / 2);
            g.strokePath();
        }
        g.fillStyle(0x8b6914);
        g.fillCircle(wx, wy, 2 * s);
    };

    // Far wheel
    drawCartWheel(sx - bodyW * 0.2, sy - bodyD - bodyH * 0.1);

    // Cart body — isometric box (OPEN top, no bonnet)
    // Left face
    g.fillStyle(0x7a4420);
    g.fillPoints([
        { x: sx - bodyW / 2, y: sy - bodyD },
        { x: sx, y: sy + bodyH / 2 - bodyD },
        { x: sx, y: sy + bodyH / 2 },
        { x: sx - bodyW / 2, y: sy },
    ], true);

    // Right face
    g.fillStyle(0x5a3010);
    g.fillPoints([
        { x: sx + bodyW / 2, y: sy - bodyD },
        { x: sx, y: sy + bodyH / 2 - bodyD },
        { x: sx, y: sy + bodyH / 2 },
        { x: sx + bodyW / 2, y: sy },
    ], true);

    // Top face (open — show supplies inside)
    g.fillStyle(0x6b3a18);
    g.fillPoints([
        { x: sx - bodyW / 2, y: sy - bodyD },
        { x: sx, y: sy - bodyH / 2 - bodyD },
        { x: sx + bodyW / 2, y: sy - bodyD },
        { x: sx, y: sy + bodyH / 2 - bodyD },
    ], true);

    // Supplies inside (sacks)
    g.fillStyle(0xc4a050);
    g.fillEllipse(sx - 6 * s, sy - bodyD - 4 * s, 12 * s, 6 * s);
    g.fillEllipse(sx + 6 * s, sy - bodyD - 3 * s, 10 * s, 5 * s);

    // Yoke bar
    g.fillStyle(0x4a2e10);
    g.fillRect(sx - bodyW / 2 - 16 * s, sy - bodyD + 2 * s, 20 * s, 3 * s);

    // Near wheel
    drawCartWheel(sx + bodyW * 0.2, sy - bodyH * 0.1);
}

/**
 * Isometric Bullock — grey/brown water buffalo or white bullock.
 */
export function drawIsoBullock(
    g: Phaser.GameObjects.Graphics,
    sx: number, sy: number,
    scale: number = 1,
): void {
    const s = scale;

    // Shadow
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(sx, sy + 4 * s, 36 * s, 10 * s);

    // Body
    g.fillStyle(0x8a8a80);
    g.fillEllipse(sx, sy - 6 * s, 32 * s, 16 * s);

    // Hump
    g.fillStyle(0x9a9a90);
    g.fillEllipse(sx - 4 * s, sy - 14 * s, 14 * s, 8 * s);

    // Head
    g.fillStyle(0x8a8a80);
    g.fillEllipse(sx + 18 * s, sy - 10 * s, 12 * s, 10 * s);

    // Horns (curved, like water buffalo)
    g.fillStyle(0x3a3a30);
    g.fillTriangle(
        sx + 14 * s, sy - 16 * s,
        sx + 10 * s, sy - 24 * s,
        sx + 18 * s, sy - 16 * s,
    );
    g.fillTriangle(
        sx + 22 * s, sy - 16 * s,
        sx + 26 * s, sy - 24 * s,
        sx + 24 * s, sy - 16 * s,
    );

    // Eye
    g.fillStyle(0x1a1a10);
    g.fillCircle(sx + 20 * s, sy - 12 * s, 1.5 * s);

    // Legs
    g.fillStyle(0x6a6a60);
    g.fillRect(sx - 10 * s, sy - 1 * s, 5 * s, 10 * s);
    g.fillRect(sx - 2 * s, sy - 1 * s, 5 * s, 10 * s);
    g.fillRect(sx + 6 * s, sy - 1 * s, 5 * s, 9 * s);
    g.fillRect(sx + 14 * s, sy - 1 * s, 5 * s, 9 * s);
}

/**
 * Isometric Sikh Person.
 */
export function drawIsoSikhPerson(
    g: Phaser.GameObjects.Graphics,
    sx: number, sy: number,
    scale: number = 1,
    options: { type: 'man' | 'woman' | 'child' } = { type: 'man' },
): void {
    const s = scale * (options.type === 'child' ? 0.7 : 1);

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(sx, sy + 2 * s, 10 * s, 4 * s);

    if (options.type === 'woman') {
        // Salwar kameez (long tunic + pants)
        g.fillStyle(0xcc3366); // deep pink
        g.fillRect(sx - 4 * s, sy - 16 * s, 8 * s, 18 * s);

        // Dupatta (draped cloth over head/shoulder)
        g.fillStyle(0xff6688, 0.7);
        g.fillEllipse(sx, sy - 20 * s, 12 * s, 8 * s);
        g.fillRect(sx + 3 * s, sy - 18 * s, 4 * s, 12 * s);

        // Head
        g.fillStyle(0x8a6a4a);
        g.fillCircle(sx, sy - 20 * s, 4 * s);
    } else {
        // Kurta (tunic)
        g.fillStyle(0xf0e8d0);
        g.fillRect(sx - 4 * s, sy - 16 * s, 8 * s, 14 * s);

        // Legs / pajama
        g.fillStyle(0xe0d8c0);
        g.fillRect(sx - 3 * s, sy - 2 * s, 3 * s, 8 * s);
        g.fillRect(sx + 1 * s, sy - 2 * s, 3 * s, 8 * s);

        // Head
        g.fillStyle(0x8a6a4a);
        g.fillCircle(sx, sy - 20 * s, 4 * s);

        // Turban / Dastar
        g.fillStyle(0x000080); // navy blue
        g.fillEllipse(sx, sy - 23 * s, 10 * s, 7 * s);
        // Turban peak
        g.fillCircle(sx, sy - 26 * s, 3 * s);
    }

    // Arms
    g.fillStyle(0x8a6a4a);
    g.fillRect(sx - 6 * s, sy - 14 * s, 2 * s, 10 * s);
    g.fillRect(sx + 4 * s, sy - 14 * s, 2 * s, 10 * s);
}

/**
 * Isometric Sal Tree — tall tree on isometric tile.
 */
export function drawIsoSalTree(
    g: Phaser.GameObjects.Graphics,
    sx: number, sy: number,
    scale: number = 1,
): void {
    const s = scale;

    // Shadow on ground plane
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(sx + 6 * s, sy + 4 * s, 20 * s, 8 * s);

    // Trunk
    g.fillStyle(0x4a3020);
    g.fillRect(sx - 2 * s, sy - 40 * s, 4 * s, 42 * s);

    // Canopy
    g.fillStyle(0x1a5a1e);
    g.fillEllipse(sx, sy - 48 * s, 24 * s, 20 * s);
    g.fillStyle(0x2d7030, 0.6);
    g.fillEllipse(sx - 2 * s, sy - 50 * s, 16 * s, 14 * s);
}

/**
 * Isometric Thatch Hut on tile.
 */
export function drawIsoHut(
    g: Phaser.GameObjects.Graphics,
    sx: number, sy: number,
    scale: number = 1,
): void {
    const s = scale;
    const w = 28 * s, h = 14 * s, d = 16 * s;

    // Floor
    g.fillStyle(0x6a5030);
    g.fillPoints([
        { x: sx - w / 2, y: sy },
        { x: sx, y: sy - h / 2 },
        { x: sx + w / 2, y: sy },
        { x: sx, y: sy + h / 2 },
    ], true);

    // Left wall
    g.fillStyle(0xa08050);
    g.fillPoints([
        { x: sx - w / 2, y: sy },
        { x: sx, y: sy + h / 2 },
        { x: sx, y: sy + h / 2 - d },
        { x: sx - w / 2, y: sy - d },
    ], true);

    // Right wall
    g.fillStyle(0x8a6a40);
    g.fillPoints([
        { x: sx + w / 2, y: sy },
        { x: sx, y: sy + h / 2 },
        { x: sx, y: sy + h / 2 - d },
        { x: sx + w / 2, y: sy - d },
    ], true);

    // Thatch roof
    g.fillStyle(0xc4a050);
    g.fillTriangle(sx, sy - d - 10 * s, sx - w / 2 - 4 * s, sy - d, sx + w / 2 + 4 * s, sy - d);
    // Roof front face
    g.fillStyle(0xb09040);
    g.fillTriangle(sx, sy - d - 10 * s, sx + w / 2 + 4 * s, sy - d, sx, sy + h / 2 - d);
}

/**
 * Isometric crop field tile.
 */
export function drawIsoField(
    g: Phaser.GameObjects.Graphics,
    sx: number, sy: number,
    scale: number = 1,
    cropColor: number = 0xd4a830,
): void {
    const s = scale;
    const w = 32 * s, h = 16 * s;

    // Plowed earth diamond
    g.fillStyle(0x6a5030);
    g.fillPoints([
        { x: sx - w / 2, y: sy },
        { x: sx, y: sy - h / 2 },
        { x: sx + w / 2, y: sy },
        { x: sx, y: sy + h / 2 },
    ], true);

    // Crop rows
    for (let i = -2; i <= 2; i++) {
        g.fillStyle(i % 2 === 0 ? cropColor : shadeColor(cropColor, -0.05));
        g.fillRect(sx - 10 * s + i * 2 * s, sy + i * 2 * s - 2 * s, 20 * s, 2 * s);
    }
}

/**
 * Isometric Well on tile.
 */
export function drawIsoWell(
    g: Phaser.GameObjects.Graphics,
    sx: number, sy: number,
    scale: number = 1,
): void {
    const s = scale;

    // Stone rim
    g.fillStyle(0x8a8a80);
    g.fillEllipse(sx, sy - 4 * s, 16 * s, 8 * s);
    // Dark hole
    g.fillStyle(0x1a1a18);
    g.fillEllipse(sx, sy - 5 * s, 10 * s, 5 * s);

    // Support posts
    g.fillStyle(0x4a3020);
    g.fillRect(sx - 7 * s, sy - 20 * s, 2 * s, 18 * s);
    g.fillRect(sx + 5 * s, sy - 20 * s, 2 * s, 18 * s);
    // Crossbar
    g.fillRect(sx - 7 * s, sy - 22 * s, 14 * s, 2 * s);

    // Rope + bucket
    g.lineStyle(1 * s, 0x8a7a50);
    g.beginPath();
    g.moveTo(sx, sy - 20 * s);
    g.lineTo(sx, sy - 8 * s);
    g.strokePath();
    g.fillStyle(0x5a4a30);
    g.fillRect(sx - 2 * s, sy - 10 * s, 4 * s, 4 * s);
}

/**
 * Isometric Gurdwara on tile — the landmark structure.
 */
export function drawIsoGurdwara(
    g: Phaser.GameObjects.Graphics,
    sx: number, sy: number,
    scale: number = 1,
): void {
    const s = scale;
    const w = 40 * s, h = 20 * s, d = 28 * s;

    // Base diamond
    g.fillStyle(0xd0c8b0);
    g.fillPoints([
        { x: sx - w / 2, y: sy },
        { x: sx, y: sy - h / 2 },
        { x: sx + w / 2, y: sy },
        { x: sx, y: sy + h / 2 },
    ], true);

    // Left wall (whitewash)
    g.fillStyle(0xf0e8d0);
    g.fillPoints([
        { x: sx - w / 2, y: sy },
        { x: sx, y: sy + h / 2 },
        { x: sx, y: sy + h / 2 - d },
        { x: sx - w / 2, y: sy - d },
    ], true);

    // Right wall
    g.fillStyle(0xe0d8c0);
    g.fillPoints([
        { x: sx + w / 2, y: sy },
        { x: sx, y: sy + h / 2 },
        { x: sx, y: sy + h / 2 - d },
        { x: sx + w / 2, y: sy - d },
    ], true);

    // Dome
    g.fillStyle(0xe0d080);
    g.fillEllipse(sx, sy - d - 6 * s, 20 * s, 16 * s);
    g.fillStyle(0xf0e8c0, 0.5);
    g.fillEllipse(sx - 2 * s, sy - d - 8 * s, 12 * s, 10 * s);

    // Finial
    g.fillStyle(0xd4a830);
    g.fillRect(sx - 1 * s, sy - d - 18 * s, 2 * s, 10 * s);
    g.fillCircle(sx, sy - d - 20 * s, 2 * s);

    // Nishan Sahib flag
    const fx = sx + w / 2 + 4 * s;
    g.fillStyle(0x3a3a38);
    g.fillRect(fx - 1 * s, sy - d - 24 * s, 2 * s, d + 26 * s);
    g.fillStyle(0xff9933);
    g.fillTriangle(
        fx + 1 * s, sy - d - 22 * s,
        fx + 14 * s, sy - d - 18 * s,
        fx + 1 * s, sy - d - 14 * s,
    );
}
