/**
 * WP13 — Settlement Scene: Core gameplay. Static camera, evolving tiles.
 * Replaces TravelScene — no scrolling, settlement grows in place.
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
    drawSalTree, drawShivalikHills,
    drawIsoSalTree, drawIsoHut, drawIsoField, drawIsoWell, drawIsoGurdwara,
    drawIsoSikhPerson,
} from '../ui/TeraDrawUtils';

export class SettlementScene extends Scene {
    private tickTimer: number = 0;
    private isPaused: boolean = false;
    private lastAcresChecked: number = 0;

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

    // Landscape graphics
    private landscapeG!: Phaser.GameObjects.Graphics;
    private tileG!: Phaser.GameObjects.Graphics;

    constructor() {
        super(SCENES.SETTLEMENT);
    }

    create(): void {
        const gs = GameState.getInstance();
        this.tickTimer = 0;
        this.isPaused = false;
        this.lastAcresChecked = Math.floor(gs.acresCleared);

        this.drawBackground();
        this.createHUD();
        this.createControls();
        this.drawSettlement();
        this.updateHUD();
    }

    private drawBackground(): void {
        const groundY = GAME_HEIGHT - 160;

        // Sky
        this.cameras.main.setBackgroundColor(COLORS.SKY_BLUE);

        // Shivalik hills
        const hillsG = this.add.graphics();
        drawShivalikHills(hillsG, groundY - 80, GAME_WIDTH, [0x5a7a5a, 0x4a6a4a, 0x507050], 0.5);

        // Jungle border (sal trees along edges)
        this.landscapeG = this.add.graphics();
        for (let i = 0; i < 6; i++) {
            drawSalTree(this.landscapeG, 20 + i * 30, groundY - 10, 0.6);
            drawSalTree(this.landscapeG, GAME_WIDTH - 20 - i * 30, groundY - 10, 0.6);
        }

        // Ground plane
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 80, GAME_WIDTH, 160, COLORS.CLEARED_DIRT);

        // Tile area for evolving settlement
        this.tileG = this.add.graphics();
    }

    drawSettlement(): void {
        const gs = GameState.getInstance();
        const phase = getPhase(gs.acresCleared);
        this.tileG.clear();

        const gridX = 200, gridY = GAME_HEIGHT - 200;
        const cols = 10, rows = 5;
        const clearedTiles = Math.floor(gs.acresCleared / (TOTAL_ACRES / (cols * rows)));

        // Draw tile grid
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const tileIndex = r * cols + c;
                const tx = gridX + c * 60;
                const ty = gridY + r * 30;

                if (tileIndex < clearedTiles) {
                    // Cleared tile
                    const groundColor = PHASE_COLORS.GROUND[phase];
                    this.tileG.fillStyle(groundColor, 0.8);
                    this.tileG.fillRect(tx, ty, 56, 26);

                    // Add structures at milestones
                    if (gs.acresCleared >= 5 && tileIndex === 5) {
                        drawIsoHut(this.tileG, tx + 28, ty + 13, 0.4);
                    }
                    if (gs.acresCleared >= 10 && tileIndex === 10) {
                        drawIsoWell(this.tileG, tx + 28, ty + 13, 0.4);
                    }
                    if (gs.acresCleared >= 50 && tileIndex === 25) {
                        drawIsoGurdwara(this.tileG, tx + 28, ty + 13, 0.3);
                    }
                    if (gs.acresCleared >= 30 && tileIndex > 15 && tileIndex < 25) {
                        drawIsoField(this.tileG, tx + 28, ty + 13, 0.4, COLORS.CROP_GOLD);
                    }
                } else {
                    // Jungle tile
                    this.tileG.fillStyle(COLORS.JUNGLE_DARK, 0.6);
                    this.tileG.fillRect(tx, ty, 56, 26);
                    if (tileIndex % 3 === 0) {
                        drawIsoSalTree(this.tileG, tx + 28, ty + 13, 0.25);
                    }
                }
            }
        }

        // Family figures
        const aliveCount = gs.getAliveMemberCount();
        for (let i = 0; i < Math.min(aliveCount, 3); i++) {
            const fx = 340 + i * 40;
            const fy = GAME_HEIGHT - 180;
            const type = i === 0 ? 'man' as const : i === 1 ? 'woman' as const : 'child' as const;
            drawIsoSikhPerson(this.tileG, fx, fy, 0.6, { type });
        }
    }

    private createHUD(): void {
        const hudY = 10;
        const col1 = 15, col2 = 200, col3 = 400, col4 = 600;

        this.dateText = this.add.text(col1, hudY, '', { ...TEXT_STYLES.HUD });
        this.seasonText = this.add.text(col1, hudY + 18, '', { ...TEXT_STYLES.HUD });
        this.phaseText = this.add.text(col2, hudY, '', { ...TEXT_STYLES.HUD });
        this.acresText = this.add.text(col2, hudY + 18, '', { ...TEXT_STYLES.HUD });
        this.foodText = this.add.text(col3, hudY, '', { ...TEXT_STYLES.HUD });
        this.toolsText = this.add.text(col3, hudY + 18, '', { ...TEXT_STYLES.HUD });
        this.medicineText = this.add.text(col4, hudY, '', { ...TEXT_STYLES.HUD });
        this.healthText = this.add.text(col4, hudY + 18, '', { ...TEXT_STYLES.HUD });

        // Progress bar
        this.progressBar = this.add.graphics();

        // Pace display
        this.paceText = this.add.text(GAME_WIDTH / 2, 55, '', {
            ...TEXT_STYLES.HUD,
            fontSize: '12px',
        }).setOrigin(0.5);
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
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

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
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        forageBtn.on('pointerdown', () => this.scene.start(SCENES.FORAGING));

        // Speed button
        const speedBtn = this.add.text(750, btnY, '1x', {
            ...TEXT_STYLES.HUD,
            fontSize: '13px',
            backgroundColor: '#4a3728',
            padding: { x: 10, y: 4 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
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
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
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

        // Random events (~15% chance per day)
        if (Math.random() < 0.15) {
            const event = rollEvent(phase, season, gs.flags);
            if (event) {
                this.isPaused = true;
                gs.resetSpeed();
                this.scene.start(SCENES.EVENT, { event });
                return;
            }
        }

        // Monsoon challenge (~10% chance during monsoon days)
        if (season === 'MONSOON' && Math.random() < 0.02) {
            this.isPaused = true;
            gs.resetSpeed();
            this.scene.start(SCENES.MONSOON);
            return;
        }

        // Update visuals
        this.drawSettlement();
        this.updateHUD();
    }

    shutdown(): void {
        this.input.removeAllListeners();
    }
}
