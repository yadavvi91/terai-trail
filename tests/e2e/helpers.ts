/**
 * E2E test helpers for Playwright visual tests.
 * Scaffolded in WP04, implemented in WP19.
 */

export const BASE_URL = 'http://localhost:8080';

/**
 * Navigate to the game and wait for Phaser to initialize.
 */
export async function waitForGameReady(page: any): Promise<void> {
    await page.goto(BASE_URL);
    // Wait for the Phaser canvas to appear
    await page.waitForSelector('canvas', { timeout: 10000 });
    // Give Phaser a moment to render the first frame
    await page.waitForTimeout(1000);
}

/**
 * Check browser console for errors during a test.
 */
export function collectConsoleErrors(page: any): string[] {
    const errors: string[] = [];
    page.on('console', (msg: any) => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    return errors;
}

/**
 * Click at a specific canvas position (for Phaser interaction).
 */
export async function clickCanvas(page: any, x: number, y: number): Promise<void> {
    const canvas = await page.$('canvas');
    if (!canvas) throw new Error('Canvas not found');
    await canvas.click({ position: { x, y } });
}
