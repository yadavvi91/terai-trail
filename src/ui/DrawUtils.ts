/**
 * Shared drawing utilities for procedural art across all scenes.
 * All functions operate on a Phaser.GameObjects.Graphics instance.
 */

export function drawWagon(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    scale: number = 1,
): void {
    const s = scale;

    // --- Wagon tongue / yoke bar ---
    g.fillStyle(0x5a3a1a);
    g.fillRect(cx - 62 * s, baseY - 8 * s, 32 * s, 5 * s);

    // --- Body ---
    g.fillStyle(0x5c3516);
    g.fillRect(cx - 36 * s, baseY - 20 * s, 72 * s, 24 * s);

    // Body planks (darker lines)
    g.fillStyle(0x3d1f08, 0.5);
    for (let i = 1; i < 5; i++) {
        g.fillRect(cx - 36 * s + i * 14 * s, baseY - 20 * s, 2 * s, 24 * s);
    }

    // --- Canvas bonnet (arch) ---
    g.fillStyle(0xf5e6c8);
    g.beginPath();
    (g as any).moveTo(cx - 30 * s, baseY - 20 * s);
    (g as any).bezierCurveTo(
        cx - 28 * s, baseY - 52 * s,
        cx + 28 * s, baseY - 52 * s,
        cx + 30 * s, baseY - 20 * s,
    );
    g.closePath();
    g.fillPath();

    // Bonnet ribs
    g.lineStyle(1.5 * s, 0xc8b89a, 0.6);
    for (let i = -1; i <= 1; i++) {
        g.beginPath();
        (g as any).moveTo(cx + i * 14 * s, baseY - 20 * s);
        (g as any).bezierCurveTo(
            cx + i * 14 * s - 4 * s, baseY - 46 * s,
            cx + i * 14 * s + 4 * s, baseY - 46 * s,
            cx + i * 14 * s, baseY - 20 * s,
        );
        g.strokePath();
    }

    // --- Wheels ---
    const wheelY = baseY + 2 * s;
    drawWheel(g, cx - 28 * s, wheelY, 14 * s);
    drawWheel(g, cx + 28 * s, wheelY, 14 * s);

    // --- Sideboards ---
    g.fillStyle(0x7a4a22);
    g.fillRect(cx - 38 * s, baseY - 24 * s, 76 * s, 4 * s);
}

function drawWheel(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number): void {
    // Rim
    g.lineStyle(3, 0x2a1a08);
    g.strokeCircle(cx, cy, r);

    // Spokes
    g.lineStyle(2, 0x5c3516);
    const spokeCount = 6;
    for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2;
        g.beginPath();
        (g as any).moveTo(cx, cy);
        (g as any).lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        g.strokePath();
    }

    // Hub
    g.fillStyle(0x8b6914);
    g.fillCircle(cx, cy, r * 0.25);
    g.fillStyle(0x2a1a08);
    g.fillCircle(cx, cy, r * 0.1);
}

export function drawOx(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    scale: number = 1,
): void {
    const s = scale;
    const bodyColor = 0x8b6914;
    const shadowColor = 0x5c4010;

    // Body
    g.fillStyle(bodyColor);
    g.fillEllipse(cx, baseY - 8 * s, 34 * s, 16 * s);

    // Head
    g.fillStyle(bodyColor);
    g.fillEllipse(cx + 18 * s, baseY - 10 * s, 14 * s, 11 * s);

    // Snout
    g.fillStyle(shadowColor);
    g.fillEllipse(cx + 24 * s, baseY - 8 * s, 7 * s, 5 * s);

    // Legs
    g.fillStyle(shadowColor);
    for (let i = -1; i <= 1; i += 2) {
        g.fillRect(cx + i * 10 * s - 3 * s, baseY, 6 * s, 10 * s);
    }
    // Front legs
    for (let i = -1; i <= 1; i += 2) {
        g.fillRect(cx + 14 * s + i * 4 * s - 3 * s, baseY, 5 * s, 9 * s);
    }

    // Horn
    g.fillStyle(0xd4b870);
    g.fillTriangle(
        cx + 20 * s, baseY - 16 * s,
        cx + 14 * s, baseY - 13 * s,
        cx + 22 * s, baseY - 12 * s,
    );
}

export function drawMountain(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    width: number,
    height: number,
    color: number,
    snowCap: boolean = true,
): void {
    // Main body — slightly irregular triangle using 5 points
    g.fillStyle(color);
    g.fillTriangle(
        cx - width / 2, baseY,
        cx - width * 0.08, baseY - height,
        cx + width / 2, baseY,
    );
    // Second subtriangle to widen the base slightly
    g.fillTriangle(
        cx - width * 0.4, baseY,
        cx + width * 0.05, baseY - height * 0.92,
        cx + width * 0.55, baseY,
    );

    if (snowCap) {
        // Snow cap
        g.fillStyle(0xeef2f8, 0.85);
        g.fillTriangle(
            cx - width * 0.18, baseY - height * 0.72,
            cx - width * 0.02, baseY - height,
            cx + width * 0.12, baseY - height * 0.72,
        );
    }

    // Shadow side
    g.fillStyle(0x000000, 0.12);
    g.fillTriangle(
        cx + width * 0.05, baseY - height * 0.92,
        cx + width * 0.55, baseY,
        cx - width * 0.01, baseY,
    );
}

export function drawHill(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    width: number,
    color: number,
): void {
    g.fillStyle(color);
    // Main mound — use overlapping ellipses for an irregular silhouette
    g.fillEllipse(cx, baseY, width, width * 0.45);
    g.fillEllipse(cx - width * 0.2, baseY + 4, width * 0.7, width * 0.35);
    g.fillEllipse(cx + width * 0.22, baseY + 2, width * 0.65, width * 0.3);
}

export function drawCloud(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    scale: number = 1,
    alpha: number = 0.88,
): void {
    const s = scale;
    g.fillStyle(0xffffff, alpha);
    g.fillEllipse(cx, cy, 80 * s, 34 * s);
    g.fillEllipse(cx - 28 * s, cy + 6 * s, 52 * s, 28 * s);
    g.fillEllipse(cx + 26 * s, cy + 4 * s, 60 * s, 30 * s);
    g.fillEllipse(cx - 8 * s, cy - 16 * s, 56 * s, 32 * s);
}

export function drawSun(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    r: number = 36,
): void {
    // Rays
    g.fillStyle(0xffe866, 0.4);
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const inner = r * 1.2;
        const outer = r * 1.9;
        g.fillTriangle(
            cx + Math.cos(angle - 0.12) * inner, cy + Math.sin(angle - 0.12) * inner,
            cx + Math.cos(angle + 0.12) * inner, cy + Math.sin(angle + 0.12) * inner,
            cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer,
        );
    }
    // Core
    g.fillStyle(0xffd700);
    g.fillCircle(cx, cy, r);
    // Highlight
    g.fillStyle(0xffee99, 0.5);
    g.fillCircle(cx - r * 0.25, cy - r * 0.25, r * 0.45);
}

// ─── Animal silhouettes for HuntingScene ─────────────────────────────────────

export function drawBuffalo(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    s: number = 1,
    flipped: boolean = false,
): void {
    const d = flipped ? -1 : 1;
    g.fillStyle(0x4a2e0e);

    // Body — wide with hump
    g.fillEllipse(cx, cy, 54 * s, 32 * s);

    // Hump
    g.fillEllipse(cx - 10 * s * d, cy - 18 * s, 30 * s, 20 * s);

    // Head — lower and forward
    g.fillEllipse(cx + 24 * s * d, cy + 4 * s, 22 * s, 18 * s);

    // Beard/chin tuft
    g.fillStyle(0x2d1a06);
    g.fillEllipse(cx + 26 * s * d, cy + 14 * s, 12 * s, 10 * s);

    // Horn
    g.fillStyle(0x8b7045);
    g.fillTriangle(
        cx + 18 * s * d, cy - 8 * s,
        cx + 14 * s * d, cy - 18 * s,
        cx + 24 * s * d, cy - 6 * s,
    );

    // Eye
    g.fillStyle(0x111111);
    g.fillCircle(cx + 28 * s * d, cy + 1 * s, 2 * s);

    // Legs
    g.fillStyle(0x2d1a06);
    const legPositions = [-16, -6, 6, 16];
    legPositions.forEach(lx => {
        g.fillRect(cx + lx * s - 3 * s, cy + 14 * s, 6 * s, 14 * s);
    });

    // Tail
    g.fillStyle(0x4a2e0e);
    g.fillTriangle(
        cx - 28 * s * d, cy - 4 * s,
        cx - 30 * s * d, cy + 4 * s,
        cx - 20 * s * d, cy,
    );
}

export function drawDeer(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    s: number = 1,
    flipped: boolean = false,
): void {
    const d = flipped ? -1 : 1;

    // Body
    g.fillStyle(0xb07840);
    g.fillEllipse(cx, cy + 4 * s, 42 * s, 22 * s);

    // Neck
    g.fillStyle(0xb07840);
    g.fillRect(cx + 14 * s * d, cy - 8 * s, 10 * s, 18 * s);

    // Head
    g.fillEllipse(cx + 22 * s * d, cy - 12 * s, 16 * s, 12 * s);

    // Snout
    g.fillStyle(0x8a5c28);
    g.fillEllipse(cx + 28 * s * d, cy - 10 * s, 8 * s, 6 * s);

    // Eye
    g.fillStyle(0x111111);
    g.fillCircle(cx + 24 * s * d, cy - 14 * s, 2 * s);

    // Ear
    g.fillStyle(0xd09050);
    g.fillEllipse(cx + 18 * s * d, cy - 20 * s, 7 * s, 11 * s);

    // Antlers
    g.lineStyle(2.5 * s, 0x6b4520);
    // Main beam
    g.beginPath();
    (g as any).moveTo(cx + 20 * s * d, cy - 18 * s);
    (g as any).lineTo(cx + 16 * s * d, cy - 34 * s);
    g.strokePath();
    // Tines
    g.beginPath();
    (g as any).moveTo(cx + 16 * s * d, cy - 30 * s);
    (g as any).lineTo(cx + 22 * s * d, cy - 38 * s);
    g.strokePath();
    g.beginPath();
    (g as any).moveTo(cx + 15 * s * d, cy - 26 * s);
    (g as any).lineTo(cx + 10 * s * d, cy - 32 * s);
    g.strokePath();

    // Legs
    g.fillStyle(0x8a5c28);
    const legX = [-14, -5, 5, 14];
    legX.forEach(lx => {
        g.fillRect(cx + lx * s - 2.5 * s, cy + 14 * s, 5 * s, 18 * s);
    });

    // White tail
    g.fillStyle(0xf0e8d8);
    g.fillCircle(cx - 20 * s * d, cy, 5 * s);
}

export function drawRabbit(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    s: number = 1,
    flipped: boolean = false,
): void {
    const d = flipped ? -1 : 1;

    // Body
    g.fillStyle(0xc8b8a0);
    g.fillEllipse(cx, cy + 4 * s, 22 * s, 18 * s);

    // Head
    g.fillEllipse(cx + 8 * s * d, cy - 6 * s, 14 * s, 12 * s);

    // Ears (tall)
    g.fillStyle(0xc8b8a0);
    g.fillEllipse(cx + 6 * s * d, cy - 22 * s, 6 * s, 18 * s);
    g.fillEllipse(cx + 12 * s * d, cy - 20 * s, 5 * s, 16 * s);
    // Inner ear
    g.fillStyle(0xffb0b0, 0.7);
    g.fillEllipse(cx + 6 * s * d, cy - 22 * s, 3 * s, 12 * s);
    g.fillEllipse(cx + 12 * s * d, cy - 20 * s, 2.5 * s, 10 * s);

    // Eye
    g.fillStyle(0xff3333);
    g.fillCircle(cx + 13 * s * d, cy - 8 * s, 2 * s);

    // Nose
    g.fillStyle(0xff9999);
    g.fillCircle(cx + 16 * s * d, cy - 5 * s, 1.5 * s);

    // Tail
    g.fillStyle(0xffffff);
    g.fillCircle(cx - 10 * s * d, cy + 4 * s, 4 * s);

    // Legs
    g.fillStyle(0xb0a090);
    g.fillEllipse(cx - 6 * s, cy + 12 * s, 10 * s, 6 * s);
    g.fillEllipse(cx + 4 * s, cy + 12 * s, 10 * s, 6 * s);
}

export function drawSquirrel(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    s: number = 1,
    flipped: boolean = false,
): void {
    const d = flipped ? -1 : 1;

    // Tail (behind body)
    g.fillStyle(0x8b6030, 0.9);
    g.beginPath();
    (g as any).moveTo(cx - 6 * s * d, cy + 4 * s);
    (g as any).bezierCurveTo(
        cx - 22 * s * d, cy,
        cx - 26 * s * d, cy - 20 * s,
        cx - 8 * s * d, cy - 22 * s,
    );
    (g as any).bezierCurveTo(
        cx - 16 * s * d, cy - 18 * s,
        cx - 14 * s * d, cy - 2 * s,
        cx - 4 * s * d, cy,
    );
    g.fillPath();

    // Body
    g.fillStyle(0xa07040);
    g.fillEllipse(cx, cy, 14 * s, 10 * s);

    // Head
    g.fillEllipse(cx + 6 * s * d, cy - 7 * s, 10 * s, 9 * s);

    // Ear tufts
    g.fillStyle(0xa07040);
    g.fillTriangle(
        cx + 4 * s * d, cy - 12 * s,
        cx + 7 * s * d, cy - 18 * s,
        cx + 10 * s * d, cy - 12 * s,
    );

    // Eye
    g.fillStyle(0x111111);
    g.fillCircle(cx + 9 * s * d, cy - 8 * s, 1.5 * s);

    // Nose
    g.fillStyle(0xff9999);
    g.fillCircle(cx + 12 * s * d, cy - 6 * s, 1 * s);
}
