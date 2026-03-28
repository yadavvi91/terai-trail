/**
 * WP13 — Settlement Scene: Core gameplay. Isometric diamond grid, animated figures.
 * Static camera, evolving tiles — settlement grows as jungle is cleared.
 */
import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS,
    ACRES_PER_DAY, FOOD_PER_PERSON_PER_DAY, HEALTH, TOTAL_ACRES,
    ORIGIN_DISTRICT_DATA, PHASE_COLORS,
} from '../utils/constants';
import { WorkPace, Rations, MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';
import { getPhase, getSeason } from '../utils/phase';
import { rollEvent } from '../game/EventManager';
import { getMilestone, getNextMilestone } from '../game/MilestoneData';
import {
    drawSalTree, drawShivalikHills, drawElephantGrass,
    drawIsoDiamondTile3D, drawIsoSalTree, drawIsoHut,
    drawIsoField, drawIsoWell, drawIsoGurdwara,
    drawIsoSikhPerson,
} from '../ui/TeraDrawUtils';

// ── Iso grid constants ──
const TILE_W = 96;
const TILE_H = 48;
const GRID_COLS = 8;
const GRID_ROWS = 4;
const GRID_TOTAL = GRID_COLS * GRID_ROWS;
const GRID_ORIGIN_X = GAME_WIDTH / 2;
const GRID_ORIGIN_Y = 340;
const TILE_DEPTH = 6;

/** Convert grid (col, row) to screen (x, y) center of the diamond tile. */
function isoToScreen(col: number, row: number): { x: number; y: number } {
    return {
        x: GRID_ORIGIN_X + (col - row) * (TILE_W / 2),
        y: GRID_ORIGIN_Y + (col + row) * (TILE_H / 2),
    };
}

export class SettlementScene extends Scene {
    private tickTimer: number = 0;
    private isPaused: boolean = false;
    private lastAcresChecked: number = 0;

    // Event pacing
    private daysSinceStart: number = 0;
    private daysSinceLastEvent: number = 99; // allow first event after grace period

    // HUD texts
    private dateText!: Phaser.GameObjects.Text;
    private seasonText!: Phaser.GameObjects.Text;
    private phaseText!: Phaser.GameObjects.Text;
    private acresText!: Phaser.GameObjects.Text;
    private foodText!: Phaser.GameObjects.Text;
    private toolsText!: Phaser.GameObjects.Text;
    private medicineText!: Phaser.GameObjects.Text;
    private healthText!: Phaser.GameObjects.Text;
    private paceText!: Phaser.GameObjects.Text;
    private progressBar!: Phaser.GameObjects.Graphics;

    // Landscape & tile graphics
    private tileG!: Phaser.GameObjects.Graphics;

    // Animated figures
    private figureGraphics: Phaser.GameObjects.Graphics[] = [];
    private lastAliveCount: number = -1;
    private lastClearedTiles: number = -1;

    constructor() {
        super(SCENES.SETTLEMENT);
    }

    create(): void {
        const gs = GameState.getInstance();
        this.tickTimer = 0;
        this.isPaused = false;
        this.lastAcresChecked = Math.floor(gs.acresCleared);
        this.daysSinceStart = 0;
        this.daysSinceLastEvent = 99;
        this.lastAliveCount = -1;
        this.lastClearedTiles = -1;
        this.figureGraphics = [];

        this.drawBackground();
        this.createHUD();
        this.createControls();

        // Tile layer (on top of background)
        this.tileG = this.add.graphics();

        this.drawSettlement();
        this.updateHUD();
    }

    private drawBackground(): void {
        // Sky
        this.cameras.main.setBackgroundColor(COLORS.SKY_BLUE);

        // Shivalik hills — distant backdrop
        const hillsG = this.add.graphics();
        drawShivalikHills(hillsG, 160, GAME_WIDTH, [0x5a7a5a, 0x4a6a4a, 0x507050], 0.5);

        // Jungle border — sal trees along left and right edges
        const borderG = this.add.graphics();
        for (let i = 0; i < 4; i++) {
            drawSalTree(borderG, 30 + i * 35, 320 + i * 20, 0.7 - i * 0.05);
            drawSalTree(borderG, GAME_WIDTH - 30 - i * 35, 320 + i * 20, 0.7 - i * 0.05);
        }
        // Elephant grass along borders
        for (let i = 0; i < 6; i++) {
            drawElephantGrass(borderG, 20 + i * 40, 380 + i * 15, 0.5);
            drawElephantGrass(borderG, GAME_WIDTH - 20 - i * 40, 380 + i * 15, 0.5);
        }

        // Ground plane below the iso grid
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH, 180, COLORS.CLEARED_DIRT);
    }

    drawSettlement(): void {
        const gs = GameState.getInstance();
        const phase = getPhase(gs.acresCleared);
        this.tileG.clear();

        const clearedTiles = Math.min(GRID_TOTAL, Math.floor(gs.acresCleared / (TOTAL_ACRES / GRID_TOTAL)));

        // Draw tile grid in back-to-front order for proper overlap
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                const tileIndex = r * GRID_COLS + c;
                const { x: tx, y: ty } = isoToScreen(c, r);

                if (tileIndex < clearedTiles) {
                    // ── Cleared tile ──
                    const groundColors = PHASE_COLORS.GROUND_ALT[phase];
                    const topColor = groundColors[(r + c) % groundColors.length];
                    const leftColor = 0x5a4428;
                    const rightColor = 0x4a3820;

                    drawIsoDiamondTile3D(this.tileG, tx, ty, TILE_W, TILE_H,
                        topColor, leftColor, rightColor, TILE_DEPTH, 0.9);

                    // Structures at milestone tiles
                    if (gs.acresCleared >= 5 && tileIndex === 3) {
                        drawIsoHut(this.tileG, tx, ty - TILE_DEPTH, 0.8);
                    }
                    if (gs.acresCleared >= 10 && tileIndex === 7) {
                        drawIsoWell(this.tileG, tx, ty - TILE_DEPTH, 0.7);
                    }
                    if (gs.acresCleared >= 50 && tileIndex === 16) {
                        drawIsoGurdwara(this.tileG, tx, ty - TILE_DEPTH, 0.5);
                    }
                    if (gs.acresCleared >= 30 && tileIndex >= 10 && tileIndex <= 15) {
                        drawIsoField(this.tileG, tx, ty - TILE_DEPTH, 0.7, COLORS.CROP_GOLD);
                    }
                } else {
                    // ── Jungle tile ──
                    drawIsoDiamondTile3D(this.tileG, tx, ty, TILE_W, TILE_H,
                        COLORS.JUNGLE_DARK, 0x0a3010, 0x0a2a0e, TILE_DEPTH, 0.7);

                    // Sal trees on jungle tiles (alternating)
                    if ((r + c) % 2 === 0) {
                        drawIsoSalTree(this.tileG, tx, ty - TILE_DEPTH - 4, 0.55);
                    }
                }
            }
        }

        // ── Animated family figures ──
        this.updateFigures(gs, clearedTiles);
    }

    private updateFigures(gs: GameState, clearedTiles: number): void {
        const aliveCount = gs.getAliveMemberCount();

        // Only rebuild figures when count changes
        if (aliveCount !== this.lastAliveCount) {
            // Destroy old figure graphics + tweens
            this.figureGraphics.forEach(fg => {
                this.tweens.killTweensOf(fg);
                fg.destroy();
            });
            this.figureGraphics = [];
            this.lastAliveCount = aliveCount;

            // Create new figure graphics
            const types: ('man' | 'woman' | 'child')[] = ['man', 'woman', 'child', 'child', 'child'];
            for (let i = 0; i < Math.min(aliveCount, 5); i++) {
                const fg = this.add.graphics();
                fg.setDepth(10 + i);
                const type = types[i] ?? 'child';
                drawIsoSikhPerson(fg, 0, 0, 0.9, { type });
                this.figureGraphics.push(fg);
            }
        }

        // Position figures on cleared tiles near the frontier
        if (clearedTiles !== this.lastClearedTiles || aliveCount !== this.lastAliveCount) {
            this.lastClearedTiles = clearedTiles;

            this.figureGraphics.forEach((fg, i) => {
                // Place near the frontier of clearing
                const tileIdx = Math.max(0, Math.min(clearedTiles - 1, clearedTiles - 1 - i));
                const row = Math.floor(tileIdx / GRID_COLS);
                const col = tileIdx % GRID_COLS;
                const { x: tx, y: ty } = isoToScreen(col, row);

                // Offset each figure slightly so they don't stack
                const offsetX = (i - 1) * 20;
                const offsetY = -TILE_DEPTH - 5;

                fg.setPosition(tx + offsetX, ty + offsetY);

                // Restart tweens
                this.tweens.killTweensOf(fg);

                // Bob animation
                this.tweens.add({
                    targets: fg,
                    y: ty + offsetY - 4,
                    duration: 500 + i * 120,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });

                // Gentle side-to-side sway (simulates working)
                if (gs.workPace !== WorkPace.RESTING) {
                    this.tweens.add({
                        targets: fg,
                        x: tx + offsetX + 8,
                        duration: 800 + i * 150,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut',
                    });
                }
            });
        }
    }

    private createHUD(): void {
        const hudY = 10;
        const col1 = 15, col2 = 200, col3 = 400, col4 = 600;

        this.dateText = this.add.text(col1, hudY, '', { ...TEXT_STYLES.HUD }).setDepth(20);
        this.seasonText = this.add.text(col1, hudY + 18, '', { ...TEXT_STYLES.HUD }).setDepth(20);
        this.phaseText = this.add.text(col2, hudY, '', { ...TEXT_STYLES.HUD }).setDepth(20);
        this.acresText = this.add.text(col2, hudY + 18, '', { ...TEXT_STYLES.HUD }).setDepth(20);
        this.foodText = this.add.text(col3, hudY, '', { ...TEXT_STYLES.HUD }).setDepth(20);
        this.toolsText = this.add.text(col3, hudY + 18, '', { ...TEXT_STYLES.HUD }).setDepth(20);
        this.medicineText = this.add.text(col4, hudY, '', { ...TEXT_STYLES.HUD }).setDepth(20);
        this.healthText = this.add.text(col4, hudY + 18, '', { ...TEXT_STYLES.HUD }).setDepth(20);

        // Progress bar
        this.progressBar = this.add.graphics().setDepth(20);

        // Pace display
        this.paceText = this.add.text(GAME_WIDTH / 2, 55, '', {
            ...TEXT_STYLES.HUD,
            fontSize: '12px',
        }).setOrigin(0.5).setDepth(20);
    }

    private updateHUD(): void {
        const gs = GameState.getInstance();
        const season = getSeason(gs.currentDate.getMonth());
        const phase = getPhase(gs.acresCleared);
        const next = getNextMilestone(gs.acresCleared);

        this.dateText.setText(`Date: ${gs.getFormattedDate()}`);
        this.seasonText.setText(`Season: ${season}`);
        this.phaseText.setText(`Phase: ${phase.replace(/_/g, ' ')}`);
        this.acresText.setText(`Acres: ${gs.acresCleared.toFixed(1)} / ${TOTAL_ACRES}`);
        this.foodText.setText(`Food: ${gs.supplies.food.toFixed(0)} lbs`);
        this.toolsText.setText(`Tools: ${gs.supplies.tools}`);
        this.medicineText.setText(`Medicine: ${gs.supplies.medicine}`);

        // Health (color-coded)
        const avgHealth = gs.family.filter(m => m.status !== MemberStatus.DEAD)
            .reduce((s, m) => s + m.health, 0) / Math.max(1, gs.getAliveMemberCount());
        const healthColor = avgHealth > 60 ? HEX_COLORS.SAL_GREEN : avgHealth > 30 ? HEX_COLORS.GOLD : HEX_COLORS.BLOOD_RED;
        this.healthText.setText(`Health: ${Math.round(avgHealth)}%`).setColor(healthColor);

        this.paceText.setText(`Work: ${gs.workPace} | Rations: ${gs.rations} | Next: ${next?.name ?? 'DONE'} (${next?.acresRequired ?? 100} acres)`);

        // Progress bar
        this.progressBar.clear();
        const barX = 15, barY = 42, barW = GAME_WIDTH - 30, barH = 8;
        this.progressBar.fillStyle(0x1a1a18);
        this.progressBar.fillRect(barX, barY, barW, barH);
        const progress = Math.min(1, gs.acresCleared / TOTAL_ACRES);
        this.progressBar.fillStyle(progress > 0.8 ? 0xd4a830 : 0x2d6b30);
        this.progressBar.fillRect(barX, barY, barW * progress, barH);
    }

    private createControls(): void {
        const gs = GameState.getInstance();
        const btnY = GAME_HEIGHT - 35;

        // Work pace buttons
        const paces = [WorkPace.RESTING, WorkPace.STEADY, WorkPace.HARD_LABOR, WorkPace.GRUELING];
        paces.forEach((pace, i) => {
            const btn = this.add.text(80 + i * 130, btnY, pace, {
                ...TEXT_STYLES.HUD,
                fontSize: '13px',
                backgroundColor: '#4a3728',
                padding: { x: 8, y: 4 },
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);

            btn.on('pointerdown', () => {
                gs.workPace = pace;
                this.updateHUD();
            });
        });

        // Forage button
        const forageBtn = this.add.text(650, btnY, 'Forage', {
            ...TEXT_STYLES.HUD,
            fontSize: '13px',
            backgroundColor: '#2d6b30',
            padding: { x: 10, y: 4 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
        forageBtn.on('pointerdown', () => this.scene.start(SCENES.FORAGING));

        // Speed button
        const speedBtn = this.add.text(750, btnY, '1x', {
            ...TEXT_STYLES.HUD,
            fontSize: '13px',
            backgroundColor: '#4a3728',
            padding: { x: 10, y: 4 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
        speedBtn.on('pointerdown', () => {
            const spd = gs.cycleSpeed();
            speedBtn.setText(`${spd}x`);
        });

        // Ration cycling
        const rationBtn = this.add.text(870, btnY, gs.rations, {
            ...TEXT_STYLES.HUD,
            fontSize: '13px',
            backgroundColor: '#4a3728',
            padding: { x: 8, y: 4 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
        rationBtn.on('pointerdown', () => {
            const rations = [Rations.FILLING, Rations.MEAGER, Rations.BARE_BONES];
            const idx = rations.indexOf(gs.rations);
            gs.rations = rations[(idx + 1) % rations.length];
            rationBtn.setText(gs.rations);
            this.updateHUD();
        });
    }

    update(_time: number, delta: number): void {
        if (this.isPaused) return;
        const gs = GameState.getInstance();

        this.tickTimer += delta * gs.speedMultiplier;
        const tickInterval = 1000; // 1 second = 1 day

        while (this.tickTimer >= tickInterval) {
            this.tickTimer -= tickInterval;
            this.processDailyTick();

            if (gs.isGameOver()) {
                this.scene.start(SCENES.GAME_OVER, { victory: false });
                return;
            }
            if (gs.isVictory()) {
                this.scene.start(SCENES.MILESTONE, { acres: TOTAL_ACRES });
                return;
            }
        }
    }

    private processDailyTick(): void {
        const gs = GameState.getInstance();
        gs.advanceDay();
        this.daysSinceStart++;
        this.daysSinceLastEvent++;

        const season = getSeason(gs.currentDate.getMonth());
        const phase = getPhase(gs.acresCleared);
        const districtData = ORIGIN_DISTRICT_DATA[gs.originDistrict];

        // Clear acres
        let baseRate = ACRES_PER_DAY[gs.workPace];
        let seasonMod = 1;
        if (season === 'MONSOON') seasonMod = 0.5;
        if (season === 'WINTER') seasonMod = 0.8;
        const toolBonus = gs.supplies.tools > 0 ? 1.2 : 1;
        const districtBonus = 1 + districtData.clearingRateBonus;
        const acresCleared = baseRate * seasonMod * toolBonus * districtBonus;
        gs.clearAcres(acresCleared);

        // Consume food
        const aliveCount = gs.getAliveMemberCount();
        const foodPerPerson = FOOD_PER_PERSON_PER_DAY[gs.rations];
        const foodNeeded = foodPerPerson * aliveCount;
        gs.consumeFood(foodNeeded);

        // Health effects
        if (gs.supplies.food <= 0) {
            gs.family.forEach(m => {
                if (m.status !== MemberStatus.DEAD) {
                    m.health = Math.max(0, m.health - HEALTH.STARVATION_DAMAGE);
                    if (m.health <= 0) { m.status = MemberStatus.DEAD; m.health = 0; }
                }
            });
        }

        if (gs.workPace === WorkPace.GRUELING) {
            gs.family.forEach(m => {
                if (m.status !== MemberStatus.DEAD) {
                    m.health = Math.max(0, m.health - HEALTH.GRUELING_DAMAGE);
                    if (m.health <= 0) { m.status = MemberStatus.DEAD; m.health = 0; }
                }
            });
        }

        if (gs.workPace === WorkPace.RESTING) {
            gs.family.forEach(m => {
                if (m.status !== MemberStatus.DEAD) {
                    m.health = Math.min(HEALTH.MAX_HEALTH, m.health + HEALTH.REST_HEALING);
                }
            });
        }

        // Check milestones
        const currentAcres = Math.floor(gs.acresCleared);
        if (currentAcres > this.lastAcresChecked) {
            for (let a = this.lastAcresChecked + 1; a <= currentAcres; a++) {
                const milestone = getMilestone(a);
                if (milestone) {
                    this.lastAcresChecked = currentAcres;
                    this.isPaused = true;
                    gs.resetSpeed();
                    this.scene.start(SCENES.MILESTONE, { acres: a });
                    return;
                }
            }
            this.lastAcresChecked = currentAcres;
        }

        // Random events — with grace period and cooldown
        // Grace: no events for first 10 days
        // Cooldown: at least 5 days between events
        // Frequency: 8% per day (down from 15%)
        if (this.daysSinceStart > 10 && this.daysSinceLastEvent >= 5 && Math.random() < 0.08) {
            const event = rollEvent(phase, season, gs.flags);
            if (event) {
                this.isPaused = true;
                this.daysSinceLastEvent = 0;
                gs.resetSpeed();
                this.scene.start(SCENES.EVENT, { event });
                return;
            }
        }

        // Monsoon challenge (~2% chance during monsoon, with cooldown)
        if (season === 'MONSOON' && this.daysSinceLastEvent >= 5 && Math.random() < 0.02) {
            this.isPaused = true;
            this.daysSinceLastEvent = 0;
            gs.resetSpeed();
            this.scene.start(SCENES.MONSOON);
            return;
        }

        // Update visuals
        this.drawSettlement();
        this.updateHUD();
    }

    shutdown(): void {
        // Clean up figure graphics and tweens
        this.figureGraphics.forEach(fg => {
            this.tweens.killTweensOf(fg);
            fg.destroy();
        });
        this.figureGraphics = [];
        this.input.removeAllListeners();
    }
}
