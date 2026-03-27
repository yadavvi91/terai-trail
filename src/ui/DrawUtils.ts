/**
 * Shared drawing utilities for procedural art across all scenes.
 * All functions operate on a Phaser.GameObjects.Graphics instance.
 * Uses only supported Phaser 3 Graphics API: fillRect, fillCircle, fillEllipse,
 * fillTriangle, fillPoints, strokePoints, arc, moveTo, lineTo, beginPath/strokePath.
 */

/** Compute points along a cubic bezier curve for use with fillPoints / strokePoints */
function bezierPoints(
    x0: number, y0: number,
    cx1: number, cy1: number,
    cx2: number, cy2: number,
    x1: number, y1: number,
    steps: number = 16,
): Phaser.Types.Math.Vector2Like[] {
    const pts: Phaser.Types.Math.Vector2Like[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        pts.push({
            x: mt * mt * mt * x0 + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * x1,
            y: mt * mt * mt * y0 + 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t * y1,
        });
    }
    return pts;
}

export function drawWagon(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    scale: number = 1,
): void {
    const s = scale;

    // --- Canvas bonnet (arch) — drawn FIRST so body covers the bottom edge ---
    // Arch outline computed from bezier points
    const bonnetPts: Phaser.Types.Math.Vector2Like[] = [
        { x: cx - 32 * s, y: baseY - 18 * s },
        ...bezierPoints(
            cx - 32 * s, baseY - 18 * s,
            cx - 30 * s, baseY - 58 * s,
            cx + 30 * s, baseY - 58 * s,
            cx + 32 * s, baseY - 18 * s,
        ),
    ];
    // Drop shadow for bonnet
    g.fillStyle(0x000000, 0.12);
    const bonnetShadow = bonnetPts.map(p => ({ x: (p.x as number) + 2, y: (p.y as number) + 2 }));
    g.fillPoints(bonnetShadow, true);
    // Main bonnet — cream/canvas color
    g.fillStyle(0xf0e2c0);
    g.fillPoints(bonnetPts, true);
    // Bonnet highlight (top lighter)
    g.fillStyle(0xfaf2e0, 0.5);
    const bonnetHiPts: Phaser.Types.Math.Vector2Like[] = [
        { x: cx - 20 * s, y: baseY - 22 * s },
        ...bezierPoints(
            cx - 20 * s, baseY - 22 * s,
            cx - 18 * s, baseY - 58 * s,
            cx + 4 * s, baseY - 58 * s,
            cx + 6 * s, baseY - 22 * s,
        ),
    ];
    g.fillPoints(bonnetHiPts, true);

    // Bonnet ribs (hoops that hold the canvas)
    g.lineStyle(1.5 * s, 0xd4b890, 0.7);
    for (let i = -1; i <= 1; i++) {
        const ox = i * 14 * s;
        const ribPts = bezierPoints(
            cx + ox, baseY - 18 * s,
            cx + ox - 2 * s, baseY - 52 * s,
            cx + ox + 2 * s, baseY - 52 * s,
            cx + ox, baseY - 18 * s,
        );
        g.strokePoints(ribPts, false);
    }

    // --- Wagon tongue / yoke bar ---
    g.fillStyle(0x4a2e10);
    g.fillRect(cx - 64 * s, baseY - 10 * s, 34 * s, 5 * s);
    // Tongue detail
    g.fillStyle(0x3a2008);
    g.fillRect(cx - 64 * s, baseY - 9 * s, 34 * s, 2 * s);

    // --- Main body (box) ---
    // Shadow/depth on bottom
    g.fillStyle(0x2a1208);
    g.fillRect(cx - 37 * s, baseY - 2 * s, 74 * s, 6 * s);

    // Body panels
    g.fillStyle(0x6b3a18);
    g.fillRect(cx - 36 * s, baseY - 22 * s, 72 * s, 26 * s);

    // Body plank lines
    g.fillStyle(0x3d1a06);
    for (let i = 1; i < 6; i++) {
        g.fillRect(cx - 36 * s + i * 12 * s, baseY - 22 * s, 1.5 * s, 26 * s);
    }
    // Horizontal grain lines
    g.fillStyle(0x3d1a06, 0.3);
    g.fillRect(cx - 36 * s, baseY - 14 * s, 72 * s, 1.5 * s);
    g.fillRect(cx - 36 * s, baseY - 6 * s, 72 * s, 1.5 * s);

    // --- Sideboards (top rails) ---
    g.fillStyle(0x8b5a28);
    g.fillRect(cx - 38 * s, baseY - 26 * s, 76 * s, 5 * s);
    // Sideboard highlight
    g.fillStyle(0xaa7240, 0.5);
    g.fillRect(cx - 38 * s, baseY - 26 * s, 76 * s, 2 * s);

    // --- Wheels ---
    const wheelY = baseY + 4 * s;
    drawWheel(g, cx - 30 * s, wheelY, 16 * s);
    drawWheel(g, cx + 30 * s, wheelY, 16 * s);

    // --- Axle ---
    g.fillStyle(0x2a1208);
    g.fillRect(cx - 34 * s, wheelY - 2 * s, 68 * s, 4 * s);
}

function drawWheel(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number): void {
    // Fill wheel
    g.fillStyle(0x3a2208);
    g.fillCircle(cx, cy, r);

    // Rim
    g.lineStyle(3, 0x2a1a08);
    g.strokeCircle(cx, cy, r);

    // Spokes
    g.lineStyle(2, 0x5c3516);
    const spokeCount = 6;
    for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
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
    const bodyColor = 0x6b4c20;
    const darkColor  = 0x3d2a08;
    const lightColor = 0x9a7040;

    // Belly shadow
    g.fillStyle(darkColor);
    g.fillEllipse(cx, baseY - 5 * s, 42 * s, 18 * s);

    // Main body
    g.fillStyle(bodyColor);
    g.fillEllipse(cx, baseY - 9 * s, 40 * s, 20 * s);

    // Back hump (oxen have a slight hump)
    g.fillStyle(lightColor);
    g.fillEllipse(cx - 6 * s, baseY - 18 * s, 18 * s, 10 * s);

    // Neck
    g.fillStyle(bodyColor);
    g.fillRect(cx + 14 * s, baseY - 16 * s, 12 * s, 14 * s);

    // Dewlap (the chin flap)
    g.fillStyle(darkColor);
    g.fillEllipse(cx + 22 * s, baseY - 4 * s, 8 * s, 14 * s);

    // Head
    g.fillStyle(bodyColor);
    g.fillEllipse(cx + 22 * s, baseY - 13 * s, 18 * s, 14 * s);

    // Muzzle / snout
    g.fillStyle(lightColor);
    g.fillEllipse(cx + 29 * s, baseY - 11 * s, 10 * s, 7 * s);
    // Nostrils
    g.fillStyle(darkColor);
    g.fillCircle(cx + 27 * s, baseY - 10 * s, 1.5 * s);
    g.fillCircle(cx + 31 * s, baseY - 10 * s, 1.5 * s);

    // Eye
    g.fillStyle(0x1a0e04);
    g.fillCircle(cx + 24 * s, baseY - 16 * s, 2 * s);
    g.fillStyle(0xffffff);
    g.fillCircle(cx + 24 * s - 0.5 * s, baseY - 16.5 * s, 0.7 * s);

    // Horns
    g.fillStyle(0xe8d080);
    g.fillTriangle(
        cx + 18 * s, baseY - 20 * s,
        cx + 14 * s, baseY - 30 * s,
        cx + 22 * s, baseY - 20 * s,
    );
    g.fillTriangle(
        cx + 26 * s, baseY - 20 * s,
        cx + 30 * s, baseY - 28 * s,
        cx + 30 * s, baseY - 20 * s,
    );
    // Horn tips (dark)
    g.fillStyle(0x8a7040);
    g.fillCircle(cx + 14 * s, baseY - 30 * s, 1.5 * s);
    g.fillCircle(cx + 30 * s, baseY - 28 * s, 1.5 * s);

    // Ears
    g.fillStyle(lightColor);
    g.fillEllipse(cx + 14 * s, baseY - 19 * s, 6 * s, 10 * s);

    // Legs — back pair
    g.fillStyle(darkColor);
    g.fillRect(cx - 14 * s, baseY - 1 * s, 7 * s, 14 * s);
    g.fillRect(cx - 4 * s,  baseY - 1 * s, 7 * s, 13 * s);
    // Legs — front pair
    g.fillRect(cx + 8 * s,  baseY - 1 * s, 7 * s, 13 * s);
    g.fillRect(cx + 17 * s, baseY - 1 * s, 7 * s, 12 * s);

    // Hooves
    g.fillStyle(0x1a1008);
    g.fillRect(cx - 14 * s, baseY + 10 * s, 7 * s, 4 * s);
    g.fillRect(cx - 4 * s,  baseY + 10 * s, 7 * s, 4 * s);
    g.fillRect(cx + 8 * s,  baseY + 9 * s,  7 * s, 4 * s);
    g.fillRect(cx + 17 * s, baseY + 9 * s,  7 * s, 4 * s);

    // Tail
    g.fillStyle(bodyColor);
    g.fillRect(cx - 22 * s, baseY - 8 * s, 3 * s, 14 * s);
    g.fillStyle(darkColor);
    g.fillEllipse(cx - 22 * s + 1.5 * s, baseY + 7 * s, 6 * s, 10 * s); // tail tuft
}

/** Lighten (positive factor) or darken (negative) a hex color */
function shadeColor(color: number, factor: number): number {
    const r = Math.min(255, Math.max(0, ((color >> 16) & 0xff) + Math.round(255 * factor)));
    const gg = Math.min(255, Math.max(0, ((color >> 8) & 0xff) + Math.round(255 * factor)));
    const b = Math.min(255, Math.max(0, (color & 0xff) + Math.round(255 * factor)));
    return (r << 16) | (gg << 8) | b;
}

/** Deterministic pseudo-random using a seed (no Math.random so the mountains look the same each render) */
function seededNoise(seed: number): number {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
}

/**
 * Draw a realistic mountain with jagged silhouette using fillPoints.
 * Much more detailed than simple triangles.
 */
export function drawMountain(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    width: number,
    height: number,
    color: number,
    snowCap: boolean = true,
): void {
    const seed = cx * 0.01 + width * 0.007; // stable seed from position
    const peakOffset = (seededNoise(seed) - 0.5) * width * 0.12; // slight peak off-center
    const peakX = cx + peakOffset;
    const peakY = baseY - height;

    // ── Build jagged silhouette outline ──────────────────────────────────────
    // We trace from left base → up the left slope (with jagged steps) → peak
    // → down right slope (with jagged steps) → right base
    const steps = 18;
    const leftSlope: Phaser.Types.Math.Vector2Like[] = [];
    const rightSlope: Phaser.Types.Math.Vector2Like[] = [];

    const leftBaseX  = cx - width * 0.5;
    const rightBaseX = cx + width * 0.5;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps; // 0 = base, 1 = peak
        // Jag amplitude — larger for more natural rocky silhouette
        const jagAmp = width * 0.055 * (1 - t * 0.6);
        const jag = (seededNoise(seed + i * 3.7) - 0.5) * 2 * jagAmp;

        // Left slope — x goes from leftBaseX to peakX
        const lx = leftBaseX + (peakX - leftBaseX) * t + jag;
        const ly = baseY - height * t;
        leftSlope.push({ x: lx, y: ly });

        // Right slope — x goes from peakX to rightBaseX
        const rx = peakX + (rightBaseX - peakX) * t + (seededNoise(seed + i * 5.1) - 0.5) * 2 * jagAmp;
        const ry = baseY - height * (1 - t);
        rightSlope.unshift({ x: rx, y: ry });
    }

    const fullOutline: Phaser.Types.Math.Vector2Like[] = [
        { x: leftBaseX, y: baseY },
        ...leftSlope,
        ...rightSlope,
        { x: rightBaseX, y: baseY },
    ];

    // ── Base fill (entire mountain) ───────────────────────────────────────────
    g.fillStyle(shadeColor(color, -0.08));
    g.fillPoints(fullOutline, true);

    // ── Left face (lighter — lit side) ───────────────────────────────────────
    const litFace: Phaser.Types.Math.Vector2Like[] = [
        { x: leftBaseX, y: baseY },
        ...leftSlope,
        { x: leftBaseX + (rightBaseX - leftBaseX) * 0.12, y: baseY },
    ];
    g.fillStyle(shadeColor(color, 0.12));
    g.fillPoints(litFace, true);

    // ── Right face (darker — shadow side) ────────────────────────────────────
    const shadowFace: Phaser.Types.Math.Vector2Like[] = [
        { x: peakX, y: peakY },
        ...rightSlope,
        { x: peakX, y: baseY },
    ];
    g.fillStyle(0x000000, 0.22);
    g.fillPoints(shadowFace, true);

    // ── Secondary sub-peak on left ────────────────────────────────────────────
    const subPeakX = leftBaseX + width * 0.28;
    const subPeakY = baseY - height * 0.58;
    g.fillStyle(shadeColor(color, 0.05));
    const subPeak: Phaser.Types.Math.Vector2Like[] = [
        { x: leftBaseX, y: baseY },
        { x: leftBaseX + width * 0.12, y: baseY - height * 0.28 + (seededNoise(seed + 20) - 0.5) * 12 },
        { x: subPeakX, y: subPeakY },
        { x: subPeakX + width * 0.14, y: baseY - height * 0.36 },
        { x: subPeakX + width * 0.26, y: baseY },
    ];
    g.fillPoints(subPeak, true);

    // ── Horizontal stratification / rock bands ────────────────────────────────
    g.lineStyle(1, shadeColor(color, -0.25), 0.35);
    for (let band = 1; band <= 4; band++) {
        const t = 0.25 + band * 0.15;
        const bw = width * (1 - t) * 0.38;
        const by2 = peakY + height * t;
        g.beginPath();
        g.moveTo(peakX - bw + (seededNoise(seed + band * 7) - 0.5) * 20, by2);
        g.lineTo(peakX + bw * 0.85 + (seededNoise(seed + band * 11) - 0.5) * 20, by2 + (seededNoise(seed + band * 3) - 0.5) * 8);
        g.strokePath();
    }

    // ── Snow cap ──────────────────────────────────────────────────────────────
    if (snowCap) {
        const snowLine = 0.22; // how far down the snow goes (smaller = less snow)

        // Build snow polygon from the jagged left and right silhouettes
        const snowPts: Phaser.Types.Math.Vector2Like[] = [];

        // Trace left slope from peak downward to snow line
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            if (t > snowLine + 0.04) break;
            snowPts.push(leftSlope[i]);
        }
        // Add snow-line crossing on left
        const snowY = peakY + height * snowLine;
        snowPts.push({ x: peakX - width * snowLine * 0.72, y: snowY });
        // Add snow-line crossing on right
        snowPts.push({ x: peakX + width * snowLine * 0.58, y: snowY + seededNoise(seed + 30) * 12 });
        // Trace right slope from snow line up to peak
        for (let i = steps; i >= 0; i--) {
            const t = 1 - i / steps; // t from peak (0) to base (1)
            if (t > snowLine + 0.04) break;
            snowPts.push(rightSlope[steps - i] ?? { x: peakX, y: peakY });
        }

        // Main snow — bright white
        g.fillStyle(0xedf4ff, 0.94);
        g.fillPoints(snowPts, true);

        // Snow shadow (blue tint on right)
        const snowShadow: Phaser.Types.Math.Vector2Like[] = [
            { x: peakX, y: peakY },
            { x: peakX + width * snowLine * 0.58, y: snowY + 10 },
            { x: peakX + width * snowLine * 0.3, y: snowY },
        ];
        g.fillStyle(0xb8d0f0, 0.55);
        g.fillPoints(snowShadow, true);

        // Sub-peak snow patch
        g.fillStyle(0xe8f2ff, 0.7);
        g.fillTriangle(
            subPeakX - 12, subPeakY + 10,
            subPeakX, subPeakY,
            subPeakX + 10, subPeakY + 8,
        );
    }

    // ── Atmospheric haze at mountain base ─────────────────────────────────────
    g.fillStyle(0x8aa8d0, 0.08);
    g.fillRect(cx - width * 0.55, baseY - height * 0.22, width * 1.1, height * 0.22);
}

export function drawHill(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    width: number,
    color: number,
): void {
    const seed = cx * 0.013 + width * 0.009;
    const h = width * 0.38;

    // Isometric hill facing the viewer (southeast / bottom-right).
    // The peak is shifted LEFT so the RIGHT face (facing viewer) is the
    // wider, gentler, visible slope and the LEFT face is steeper (away).
    const peakShift = -0.15; // peak at 35% from left instead of 50%
    const peakX = cx + width * peakShift;
    const leftEdge = cx - width * 0.35;  // steeper left side (shorter run)
    const rightEdge = cx + width * 0.55; // gentler right side (longer run)

    // LEFT face outline — steep, fewer steps
    const leftSteps = 8;
    const leftPts: Phaser.Types.Math.Vector2Like[] = [{ x: leftEdge, y: baseY + 4 }];
    for (let i = 0; i <= leftSteps; i++) {
        const t = i / leftSteps;
        const x = leftEdge + t * (peakX - leftEdge);
        const profile = Math.sin(t * Math.PI * 0.5); // quarter sine — steep climb
        const noise = seededNoise(seed + i * 2.3) * h * 0.08 * profile;
        leftPts.push({ x, y: baseY - h * profile - noise });
    }

    // RIGHT face outline — gentle slope facing viewer
    const rightSteps = 16;
    const rightPts: Phaser.Types.Math.Vector2Like[] = [];
    for (let i = 0; i <= rightSteps; i++) {
        const t = i / rightSteps;
        const x = peakX + t * (rightEdge - peakX);
        const profile = Math.cos(t * Math.PI * 0.5); // quarter cosine — gentle descent
        const noise = seededNoise(seed + i * 3.1) * h * 0.08 * profile;
        rightPts.push({ x, y: baseY - h * profile - noise });
    }
    rightPts.push({ x: rightEdge, y: baseY + 4 });

    // Combine into full outline
    const allPts = [...leftPts, ...rightPts];
    allPts.push({ x: leftEdge, y: baseY + 4 });

    // Base hill fill
    g.fillStyle(color);
    g.fillPoints(allPts, true);

    // RIGHT face highlight — this is the face looking at the viewer, lit by sun
    g.fillStyle(shadeColor(color, 0.15), 0.5);
    const highlightPts: Phaser.Types.Math.Vector2Like[] = [{ x: peakX, y: baseY - h * 0.95 }];
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const x = peakX + t * (rightEdge - peakX);
        const profile = Math.cos(t * Math.PI * 0.5) * h * 0.85;
        highlightPts.push({ x, y: baseY - profile });
    }
    highlightPts.push({ x: peakX, y: baseY + 2 });
    g.fillPoints(highlightPts, true);

    // LEFT face shadow — steep side facing away from viewer
    g.fillStyle(shadeColor(color, -0.18), 0.6);
    const shadowPts: Phaser.Types.Math.Vector2Like[] = [{ x: leftEdge, y: baseY + 4 }];
    for (let i = 0; i <= leftSteps; i++) {
        const t = i / leftSteps;
        const x = leftEdge + t * (peakX - leftEdge);
        const profile = Math.sin(t * Math.PI * 0.5);
        shadowPts.push({ x, y: baseY - h * profile * 0.95 });
    }
    shadowPts.push({ x: peakX, y: baseY + 2 });
    g.fillPoints(shadowPts, true);
}

export function drawCloud(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    scale: number = 1,
    alpha: number = 0.88,
): void {
    const s = scale;

    // Shadow underneath
    g.fillStyle(0x8090a8, alpha * 0.3);
    g.fillEllipse(cx + 4 * s, cy + 12 * s, 84 * s, 26 * s);

    // Base cloud mass
    g.fillStyle(0xe8eef4, alpha * 0.85);
    g.fillEllipse(cx, cy + 4 * s, 90 * s, 32 * s);

    // Main billows
    g.fillStyle(0xffffff, alpha);
    g.fillEllipse(cx - 24 * s, cy + 2 * s, 48 * s, 28 * s);
    g.fillEllipse(cx + 20 * s, cy + 3 * s, 56 * s, 30 * s);
    g.fillEllipse(cx - 6 * s, cy - 4 * s, 60 * s, 32 * s);

    // Top puffs (brightest)
    g.fillStyle(0xffffff, alpha * 0.95);
    g.fillEllipse(cx - 18 * s, cy - 12 * s, 42 * s, 26 * s);
    g.fillEllipse(cx + 14 * s, cy - 8 * s, 48 * s, 28 * s);
    g.fillEllipse(cx - 4 * s, cy - 18 * s, 38 * s, 22 * s);

    // Highlight (sunlit top edge)
    g.fillStyle(0xffffff, alpha * 0.5);
    g.fillEllipse(cx - 10 * s, cy - 20 * s, 30 * s, 14 * s);
}

export function drawSun(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    r: number = 36,
): void {
    // Outer glow halo (warm diffuse light)
    g.fillStyle(0xffd700, 0.06);
    g.fillCircle(cx, cy, r * 3.5);
    g.fillStyle(0xffd700, 0.08);
    g.fillCircle(cx, cy, r * 2.8);
    g.fillStyle(0xffe866, 0.12);
    g.fillCircle(cx, cy, r * 2.2);

    // Rays — alternating long and short
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const inner = r * 1.15;
        const outer = (i % 2 === 0) ? r * 2.1 : r * 1.65;
        const width = (i % 2 === 0) ? 0.1 : 0.08;
        g.fillStyle(0xffe866, (i % 2 === 0) ? 0.35 : 0.25);
        g.fillTriangle(
            cx + Math.cos(angle - width) * inner, cy + Math.sin(angle - width) * inner,
            cx + Math.cos(angle + width) * inner, cy + Math.sin(angle + width) * inner,
            cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer,
        );
    }

    // Core — gradient effect with concentric circles
    g.fillStyle(0xf0a000);
    g.fillCircle(cx, cy, r);
    g.fillStyle(0xffc020);
    g.fillCircle(cx, cy, r * 0.85);
    g.fillStyle(0xffd700);
    g.fillCircle(cx, cy, r * 0.7);

    // Highlight — upper left (lit side)
    g.fillStyle(0xffee99, 0.6);
    g.fillCircle(cx - r * 0.22, cy - r * 0.22, r * 0.42);
    g.fillStyle(0xfffff0, 0.3);
    g.fillCircle(cx - r * 0.3, cy - r * 0.3, r * 0.25);
}

// ─── Tree ────────────────────────────────────────────────────────────────────

/**
 * Draw a deciduous or pine tree silhouette.
 */
export function drawTree(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    height: number,
    color: number = 0x2d6020,
    pine: boolean = false,
): void {
    const tw = height * (pine ? 0.45 : 0.7);

    // Trunk
    g.fillStyle(0x5a3a18);
    g.fillRect(cx - height * 0.06, baseY - height * 0.25, height * 0.12, height * 0.25);

    if (pine) {
        // Pine — stacked triangles
        g.fillStyle(color);
        g.fillTriangle(cx - tw * 0.5, baseY - height * 0.28, cx, baseY - height, cx + tw * 0.5, baseY - height * 0.28);
        g.fillStyle(shadeColor(color, 0.06));
        g.fillTriangle(cx - tw * 0.65, baseY - height * 0.48, cx, baseY - height * 0.62, cx + tw * 0.65, baseY - height * 0.48);
        g.fillStyle(shadeColor(color, 0.1));
        g.fillTriangle(cx - tw * 0.78, baseY - height * 0.65, cx, baseY - height * 0.22, cx + tw * 0.78, baseY - height * 0.65);
        // Shadow
        g.fillStyle(0x000000, 0.2);
        g.fillTriangle(cx, baseY - height, cx + tw * 0.5, baseY - height * 0.28, cx + tw * 0.14, baseY - height * 0.28);
    } else {
        // Deciduous — irregular rounded canopy from overlapping ellipses
        const seed = cx * 0.017 + height * 0.023;
        g.fillStyle(shadeColor(color, -0.1));
        g.fillEllipse(cx, baseY - height * 0.62, tw * 0.9, height * 0.56);
        g.fillStyle(color);
        g.fillEllipse(cx - tw * 0.18, baseY - height * 0.68, tw * 0.72, height * 0.5);
        g.fillEllipse(cx + tw * 0.16, baseY - height * 0.64, tw * 0.68, height * 0.46);
        g.fillStyle(shadeColor(color, 0.12));
        g.fillEllipse(cx - tw * 0.1, baseY - height * 0.8, tw * 0.5, height * 0.36);
        // Highlight
        g.fillStyle(shadeColor(color, 0.2), 0.4);
        g.fillEllipse(cx - tw * 0.14, baseY - height * 0.84, tw * 0.28, height * 0.2);
        // Shadow on right
        g.fillStyle(0x000000, 0.18);
        g.fillEllipse(cx + tw * 0.2, baseY - height * 0.6, tw * 0.42, height * 0.44);
        // Use seed to suppress unused variable warning
        void seed;
    }
}

// ─── Pioneer person ──────────────────────────────────────────────────────────

/**
 * Draw a simple pioneer person silhouette walking (facing right by default).
 * cx/baseY = center-x and foot position.
 */
export function drawPerson(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    scale: number = 1,
    flipped: boolean = false,
    legPhase: number = 0, // 0 or 1 for walking animation
): void {
    const s = scale;
    const d = flipped ? -1 : 1;

    // Legs — rounded with ellipses for thighs + rectangles for lower
    g.fillStyle(0x4a3020);
    const legSwing = legPhase === 0 ? 1 : -1;
    // Back leg
    g.fillEllipse(cx - 2 * s + legSwing * -2 * s, baseY - 14 * s, 7 * s, 22 * s);
    // Front leg
    g.fillEllipse(cx + 2 * s + legSwing * 2 * s, baseY - 16 * s, 7 * s, 26 * s);

    // Boots
    g.fillStyle(0x2a1a08);
    g.fillEllipse(cx - 2 * s + legSwing * -2 * s, baseY - 2 * s, 8 * s, 6 * s);
    g.fillEllipse(cx + 2 * s + legSwing * 2 * s, baseY - 2 * s, 8 * s, 6 * s);

    // Body / torso — rounded
    g.fillStyle(0x7a5a38);
    g.fillEllipse(cx, baseY - 32 * s, 16 * s, 24 * s);
    // Shirt detail — slightly lighter chest area
    g.fillStyle(0x8a6a48, 0.5);
    g.fillEllipse(cx, baseY - 34 * s, 10 * s, 14 * s);

    // Belt
    g.fillStyle(0x3a2010);
    g.fillRect(cx - 8 * s, baseY - 22 * s, 16 * s, 3 * s);
    g.fillStyle(0x8b6914);
    g.fillRect(cx - 2 * s, baseY - 23 * s, 4 * s, 5 * s); // buckle

    // Arms (swinging opposite to legs)
    g.fillStyle(0x7a5a38);
    if (legPhase === 0) {
        g.fillEllipse(cx + 9 * s * d, baseY - 34 * s, 5 * s, 16 * s);
        g.fillEllipse(cx - 9 * s * d, baseY - 30 * s, 5 * s, 14 * s);
    } else {
        g.fillEllipse(cx + 9 * s * d, baseY - 30 * s, 5 * s, 14 * s);
        g.fillEllipse(cx - 9 * s * d, baseY - 34 * s, 5 * s, 16 * s);
    }
    // Hands
    g.fillStyle(0xd4956a);
    g.fillCircle(cx + 9 * s * d, baseY - 25 * s, 3 * s);
    g.fillCircle(cx - 9 * s * d, baseY - 23 * s, 3 * s);

    // Neck
    g.fillStyle(0xd4956a);
    g.fillRect(cx - 3 * s, baseY - 46 * s, 6 * s, 6 * s);

    // Head
    g.fillStyle(0xd4956a);
    g.fillCircle(cx, baseY - 50 * s, 9 * s);

    // Eyes
    g.fillStyle(0x2a1a08);
    g.fillCircle(cx + 3 * s * d, baseY - 52 * s, 1.5 * s);
    g.fillCircle(cx - 3 * s * d, baseY - 52 * s, 1.5 * s);

    // Hat (wide brim pioneer hat)
    g.fillStyle(0x3a2510);
    g.fillEllipse(cx, baseY - 56 * s, 18 * s, 12 * s); // crown
    g.fillRect(cx - 12 * s, baseY - 52 * s, 24 * s, 4 * s);  // brim
    // Hat band
    g.fillStyle(0x8b6914);
    g.fillRect(cx - 9 * s, baseY - 52 * s, 18 * s, 2 * s);
}

/**
 * A woman pioneer — slightly different hat (bonnet) and dress silhouette.
 */
export function drawWoman(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    scale: number = 1,
    flipped: boolean = false,
    legPhase: number = 0,
): void {
    const s = scale;
    const d = flipped ? -1 : 1;

    // Dress / skirt — flowing A-line with sway
    const sway = legPhase === 0 ? 2 : -2;
    g.fillStyle(0x7a5090);
    g.fillTriangle(
        cx - 12 * s, baseY - 16 * s,
        cx + 12 * s, baseY - 16 * s,
        cx + (14 + sway) * s, baseY + 2 * s,
    );
    g.fillTriangle(
        cx - 12 * s, baseY - 16 * s,
        cx - (14 - sway) * s, baseY + 2 * s,
        cx + 12 * s, baseY - 16 * s,
    );
    // Dress detail — apron panel
    g.fillStyle(0x9a70b0, 0.4);
    g.fillTriangle(
        cx - 6 * s, baseY - 16 * s,
        cx + 6 * s, baseY - 16 * s,
        cx + sway * s, baseY + 1 * s,
    );

    // Feet peeking out
    g.fillStyle(0x2a1a08);
    g.fillEllipse(cx - 5 * s, baseY + 1 * s, 6 * s, 4 * s);
    g.fillEllipse(cx + 5 * s, baseY + 1 * s, 6 * s, 4 * s);

    // Bodice — slightly rounded
    g.fillStyle(0x5a3a70);
    g.fillEllipse(cx, baseY - 30 * s, 16 * s, 22 * s);
    // Collar detail
    g.fillStyle(0xf0e0c0, 0.6);
    g.fillEllipse(cx, baseY - 40 * s, 10 * s, 5 * s);

    // Arms
    g.fillStyle(0x5a3a70);
    g.fillEllipse(cx + 8 * s * d, baseY - 32 * s, 5 * s, 14 * s);
    g.fillEllipse(cx - 8 * s * d, baseY - 30 * s, 5 * s, 12 * s);
    // Hands
    g.fillStyle(0xd4956a);
    g.fillCircle(cx + 8 * s * d, baseY - 24 * s, 2.5 * s);
    g.fillCircle(cx - 8 * s * d, baseY - 23 * s, 2.5 * s);

    // Neck
    g.fillStyle(0xd4956a);
    g.fillRect(cx - 2.5 * s, baseY - 44 * s, 5 * s, 5 * s);

    // Head
    g.fillStyle(0xd4956a);
    g.fillCircle(cx, baseY - 48 * s, 8 * s);
    // Eyes
    g.fillStyle(0x2a1a08);
    g.fillCircle(cx + 2.5 * s * d, baseY - 49 * s, 1.2 * s);
    g.fillCircle(cx - 2.5 * s * d, baseY - 49 * s, 1.2 * s);

    // Hair
    g.fillStyle(0x5a2a10);
    g.fillEllipse(cx, baseY - 52 * s, 18 * s, 10 * s);

    // Bonnet
    g.fillStyle(0xf0e0c0);
    g.fillEllipse(cx, baseY - 54 * s, 20 * s, 12 * s);
    g.fillStyle(0xe0d0b0);
    g.fillEllipse(cx + 5 * s * d, baseY - 48 * s, 8 * s, 6 * s); // side brim
    // Bonnet ribbon
    g.fillStyle(0x7a5090);
    g.fillRect(cx + 8 * s * d, baseY - 48 * s, 2 * s, 8 * s);
}

/**
 * A child — smaller, simpler.
 */
export function drawChild(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    scale: number = 1,
    legPhase: number = 0,
): void {
    const s = scale;
    const swing = legPhase === 0 ? 1 : -1;

    // Legs — rounded
    g.fillStyle(0x4a3020);
    g.fillEllipse(cx - 2 * s + swing * -1.5 * s, baseY - 10 * s, 6 * s, 18 * s);
    g.fillEllipse(cx + 2 * s + swing * 1.5 * s, baseY - 12 * s, 6 * s, 20 * s);

    // Shoes
    g.fillStyle(0x2a1a08);
    g.fillEllipse(cx - 2 * s + swing * -1.5 * s, baseY - 1 * s, 7 * s, 4 * s);
    g.fillEllipse(cx + 2 * s + swing * 1.5 * s, baseY - 1 * s, 7 * s, 4 * s);

    // Body — rounded
    g.fillStyle(0x8a6848);
    g.fillEllipse(cx, baseY - 26 * s, 12 * s, 18 * s);

    // Arms
    g.fillStyle(0x8a6848);
    g.fillEllipse(cx + 7 * s, baseY - 24 * s, 4 * s, 12 * s);
    g.fillEllipse(cx - 7 * s, baseY - 22 * s, 4 * s, 10 * s);
    // Hands
    g.fillStyle(0xd4956a);
    g.fillCircle(cx + 7 * s, baseY - 17 * s, 2 * s);
    g.fillCircle(cx - 7 * s, baseY - 16 * s, 2 * s);

    // Head — slightly bigger proportionally (children have larger heads)
    g.fillStyle(0xd4956a);
    g.fillCircle(cx, baseY - 38 * s, 8 * s);

    // Eyes
    g.fillStyle(0x2a1a08);
    g.fillCircle(cx + 2.5 * s, baseY - 39 * s, 1.2 * s);
    g.fillCircle(cx - 2.5 * s, baseY - 39 * s, 1.2 * s);

    // Hair
    g.fillStyle(0x5a3010);
    g.fillEllipse(cx, baseY - 43 * s, 16 * s, 9 * s);
    // Hair fringe
    g.fillStyle(0x4a2008);
    g.fillEllipse(cx + 2 * s, baseY - 44 * s, 12 * s, 5 * s);
}

/**
 * A small pig / farm animal.
 */
export function drawPig(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    baseY: number,
    scale: number = 1,
): void {
    const s = scale;

    // Body
    g.fillStyle(0xe8a0a0);
    g.fillEllipse(cx, baseY - 6 * s, 26 * s, 14 * s);

    // Head
    g.fillEllipse(cx + 14 * s, baseY - 8 * s, 14 * s, 12 * s);

    // Snout
    g.fillStyle(0xdd8888);
    g.fillCircle(cx + 20 * s, baseY - 7 * s, 5 * s);
    g.fillStyle(0xaa5555);
    g.fillCircle(cx + 19 * s, baseY - 8 * s, 1.5 * s);
    g.fillCircle(cx + 21 * s, baseY - 6 * s, 1.5 * s);

    // Ear
    g.fillStyle(0xdd9090);
    g.fillTriangle(cx + 12 * s, baseY - 14 * s, cx + 8 * s, baseY - 14 * s, cx + 10 * s, baseY - 8 * s);

    // Legs
    g.fillStyle(0xe09898);
    [-8, -2, 4, 10].forEach(lx => {
        g.fillRect(cx + lx * s, baseY - 1 * s, 4 * s, 5 * s);
    });

    // Tail — curled circle hint
    g.fillStyle(0xe8a0a0);
    g.fillCircle(cx - 14 * s, baseY - 8 * s, 4 * s);
    g.fillStyle(0xf0b8b8);
    g.fillCircle(cx - 13 * s, baseY - 9 * s, 2 * s);
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

    // Antlers — use lineTo (works in Phaser 3)
    g.lineStyle(2.5 * s, 0x6b4520);
    // Main beam
    g.beginPath();
    g.moveTo(cx + 20 * s * d, cy - 18 * s);
    g.lineTo(cx + 16 * s * d, cy - 34 * s);
    g.strokePath();
    // Tines
    g.beginPath();
    g.moveTo(cx + 16 * s * d, cy - 30 * s);
    g.lineTo(cx + 22 * s * d, cy - 38 * s);
    g.strokePath();
    g.beginPath();
    g.moveTo(cx + 15 * s * d, cy - 26 * s);
    g.lineTo(cx + 10 * s * d, cy - 32 * s);
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

    // Tail — approximate bezier curve with fillPoints
    const tailPts = [
        ...bezierPoints(
            cx - 6 * s * d, cy + 4 * s,
            cx - 22 * s * d, cy,
            cx - 26 * s * d, cy - 20 * s,
            cx - 8 * s * d, cy - 22 * s,
        ),
        ...bezierPoints(
            cx - 8 * s * d, cy - 22 * s,
            cx - 16 * s * d, cy - 18 * s,
            cx - 14 * s * d, cy - 2 * s,
            cx - 4 * s * d, cy,
        ),
    ];
    g.fillStyle(0x8b6030, 0.9);
    g.fillPoints(tailPts, true);

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
