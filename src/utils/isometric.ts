/**
 * Isometric coordinate utilities.
 * Standard 2:1 isometric projection (like Age of Empires 2).
 *
 * World coordinates: (wx, wy) — flat grid where x goes right, y goes down
 * Screen coordinates: (sx, sy) — what Phaser renders on the canvas
 */

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

/** Convert world (grid) coordinates to screen (pixel) coordinates */
export function worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
        x: (wx - wy) * (TILE_WIDTH / 2),
        y: (wx + wy) * (TILE_HEIGHT / 2),
    };
}

/** Convert screen (pixel) coordinates to world (grid) coordinates */
export function screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
        x: (sx / (TILE_WIDTH / 2) + sy / (TILE_HEIGHT / 2)) / 2,
        y: (sy / (TILE_HEIGHT / 2) - sx / (TILE_WIDTH / 2)) / 2,
    };
}

/** Get the depth sort value for an object at world position (wx, wy) */
export function isoDepth(wx: number, wy: number): number {
    return wx + wy;
}

/**
 * Draw a flat isometric diamond tile at screen position.
 * Used for ground tiles, water, paths, etc.
 */
export function drawIsoTile(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    color: number,
    alpha: number = 1,
    w: number = TILE_WIDTH,
    h: number = TILE_HEIGHT,
): void {
    g.fillStyle(color, alpha);
    g.fillPoints([
        { x: sx,         y: sy - h / 2 },  // top
        { x: sx + w / 2, y: sy },            // right
        { x: sx,         y: sy + h / 2 },   // bottom
        { x: sx - w / 2, y: sy },            // left
    ], true);
}

/**
 * Draw an isometric tile with a left and right face for "raised" blocks.
 * Creates a cube/block effect.
 */
export function drawIsoBlock(
    g: Phaser.GameObjects.Graphics,
    sx: number,
    sy: number,
    color: number,
    blockHeight: number = 8,
    w: number = TILE_WIDTH,
    h: number = TILE_HEIGHT,
): void {
    // Top face
    drawIsoTile(g, sx, sy - blockHeight, color, 1, w, h);

    // Left face (darker)
    const lr = Math.max(0, ((color >> 16) & 0xff) - 40);
    const lg = Math.max(0, ((color >> 8) & 0xff) - 40);
    const lb = Math.max(0, (color & 0xff) - 40);
    const leftColor = (lr << 16) | (lg << 8) | lb;
    g.fillStyle(leftColor);
    g.fillPoints([
        { x: sx - w / 2, y: sy - blockHeight },  // top-left
        { x: sx,         y: sy + h / 2 - blockHeight }, // top-right (bottom of top face)
        { x: sx,         y: sy + h / 2 },          // bottom-right
        { x: sx - w / 2, y: sy },                   // bottom-left
    ], true);

    // Right face (slightly darker)
    const rr = Math.max(0, ((color >> 16) & 0xff) - 25);
    const rg = Math.max(0, ((color >> 8) & 0xff) - 25);
    const rb = Math.max(0, (color & 0xff) - 25);
    const rightColor = (rr << 16) | (rg << 8) | rb;
    g.fillStyle(rightColor);
    g.fillPoints([
        { x: sx + w / 2, y: sy - blockHeight },   // top-right
        { x: sx + w / 2, y: sy },                   // bottom-right
        { x: sx,         y: sy + h / 2 },           // bottom
        { x: sx,         y: sy + h / 2 - blockHeight }, // top (bottom of top face)
    ], true);
}

/**
 * Draw a grid of isometric ground tiles.
 * Returns the graphics object for scrolling.
 */
export function drawIsoGround(
    g: Phaser.GameObjects.Graphics,
    offsetX: number,
    offsetY: number,
    cols: number,
    rows: number,
    getTileColor: (col: number, row: number) => number,
): void {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const { x, y } = worldToScreen(col, row);
            const color = getTileColor(col, row);
            drawIsoTile(g, offsetX + x, offsetY + y, color);
        }
    }
}

/**
 * Draw an isometric trail/path on the ground.
 * The trail runs diagonally across the tile grid.
 */
export function drawIsoTrail(
    g: Phaser.GameObjects.Graphics,
    offsetX: number,
    offsetY: number,
    cols: number,
    trailColor: number = 0x9e7b3a,
): void {
    // Trail runs along the diagonal (where col ≈ row)
    for (let i = 0; i < cols; i++) {
        const { x, y } = worldToScreen(i, i);
        drawIsoTile(g, offsetX + x, offsetY + y, trailColor, 0.9);
        // Rut marks
        drawIsoTile(g, offsetX + x, offsetY + y, 0x6a4e20, 0.3, TILE_WIDTH * 0.6, TILE_HEIGHT * 0.6);
    }
}
