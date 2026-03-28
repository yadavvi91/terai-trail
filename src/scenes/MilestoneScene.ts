/**
 * WP16 — Milestone Scene: Celebrates settlement progress at key acre thresholds.
 * Replaces LandmarkScene.
 */
import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS, TOTAL_ACRES, HEALTH } from '../utils/constants';
import { MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';
import { getMilestone } from '../game/MilestoneData';
import { drawThatchHut, drawWell, drawGurdwara, drawCropField } from '../ui/TeraDrawUtils';
import { TeraiSoundManager } from '../audio/TeraiSoundManager';

export class MilestoneScene extends Scene {
    constructor() {
        super(SCENES.MILESTONE);
    }

    create(data: { acres: number }): void {
        TeraiSoundManager.getInstance().playCelebration();

        const gs = GameState.getInstance();
        const acres = data?.acres ?? Math.floor(gs.acresCleared);
        const milestone = getMilestone(acres);

        if (!milestone) {
            this.scene.start(SCENES.SETTLEMENT);
            return;
        }

        // Victory check
        if (acres >= TOTAL_ACRES) {
            this.scene.start(SCENES.GAME_OVER, { victory: true });
            return;
        }

        // Background
        this.cameras.main.setBackgroundColor(COLORS.SAL_GREEN);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.SAL_GREEN, 0.3);

        // Ground
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH, 120, COLORS.CLEARED_DIRT);

        // Draw relevant structure
        const structG = this.add.graphics();
        if (acres >= 50) drawGurdwara(structG, GAME_WIDTH / 2, GAME_HEIGHT - 160, 1.5);
        else if (acres >= 10) drawWell(structG, GAME_WIDTH / 2, GAME_HEIGHT - 140, 1.5);
        else if (acres >= 5) drawThatchHut(structG, GAME_WIDTH / 2, GAME_HEIGHT - 140, 1.5);
        else if (acres >= 30) drawCropField(structG, GAME_WIDTH / 2, GAME_HEIGHT - 130, 2.0);

        // Celebration text
        this.add.text(GAME_WIDTH / 2, 60, milestone.name, {
            ...TEXT_STYLES.TITLE,
            fontSize: '36px',
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 100, `${acres} acres cleared`, {
            ...TEXT_STYLES.SUBTITLE,
            color: HEX_COLORS.CROP_GOLD,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, milestone.description, {
            ...TEXT_STYLES.BODY,
            fontSize: '15px',
            wordWrap: { width: 600 },
            align: 'center',
        }).setOrigin(0.5);

        // Apply milestone effects
        this.applyMilestoneEffects(gs, acres);

        // Choice milestones
        if (acres === 20) {
            this.showDDTChoice(gs);
        } else if (acres === 40) {
            this.showTharuChoice(gs);
        } else {
            // Simple continue
            const continueBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'Continue', {
                ...TEXT_STYLES.BODY,
                fontSize: '20px',
                color: HEX_COLORS.GOLD,
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            continueBtn.on('pointerdown', () => this.scene.start(SCENES.SETTLEMENT));
        }
    }

    private applyMilestoneEffects(gs: GameState, acres: number): void {
        // Health recovery at celebrations
        gs.family.forEach(m => {
            if (m.status !== MemberStatus.DEAD) {
                m.health = Math.min(HEALTH.MAX_HEALTH, m.health + 10);
            }
        });

        // Specific effects
        if (acres === 5) gs.flags.shelterBuilt = true;
        if (acres === 10) gs.flags.wellDug = true;
        if (acres === 30) { gs.flags.cropsPlanted = true; gs.supplies.food += 50; }
        if (acres === 50) gs.flags.gurdwaraFounded = true;
        if (acres === 65) gs.flags.schoolBuilt = true;
        if (acres === 80) gs.flags.canalDug = true;
    }

    private showDDTChoice(gs: GameState): void {
        const y = GAME_HEIGHT - 100;
        const acceptBtn = this.add.text(GAME_WIDTH / 2 - 120, y, 'Accept DDT spraying', {
            ...TEXT_STYLES.BODY,
            fontSize: '16px',
            color: HEX_COLORS.GOLD,
            backgroundColor: '#2d6b30',
            padding: { x: 10, y: 6 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const declineBtn = this.add.text(GAME_WIDTH / 2 + 120, y, 'Decline', {
            ...TEXT_STYLES.BODY,
            fontSize: '16px',
            color: HEX_COLORS.PARCHMENT,
            backgroundColor: '#4a3728',
            padding: { x: 10, y: 6 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        acceptBtn.on('pointerdown', () => {
            gs.flags.ddtArrived = true;
            this.scene.start(SCENES.SETTLEMENT);
        });
        declineBtn.on('pointerdown', () => {
            // DDT not accepted — malaria stays high
            this.scene.start(SCENES.SETTLEMENT);
        });
    }

    private showTharuChoice(gs: GameState): void {
        const y = GAME_HEIGHT - 100;
        const allyBtn = this.add.text(GAME_WIDTH / 2 - 120, y, 'Form alliance (gain medicine)', {
            ...TEXT_STYLES.BODY,
            fontSize: '14px',
            color: HEX_COLORS.GOLD,
            backgroundColor: '#2d6b30',
            padding: { x: 10, y: 6 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const tradeBtn = this.add.text(GAME_WIDTH / 2 + 140, y, 'Trade (give food, get tools)', {
            ...TEXT_STYLES.BODY,
            fontSize: '14px',
            color: HEX_COLORS.PARCHMENT,
            backgroundColor: '#4a3728',
            padding: { x: 10, y: 6 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        allyBtn.on('pointerdown', () => {
            gs.supplies.medicine += 3;
            this.scene.start(SCENES.SETTLEMENT);
        });
        tradeBtn.on('pointerdown', () => {
            gs.supplies.food = Math.max(0, gs.supplies.food - 30);
            gs.supplies.tools += 2;
            this.scene.start(SCENES.SETTLEMENT);
        });
    }

    shutdown(): void {
        this.input.removeAllListeners();
    }
}
