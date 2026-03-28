/**
 * WP17 — Game Over Scene: Victory (Little Punjab) and Defeat variants.
 */
import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS, TOTAL_ACRES } from '../utils/constants';
import { MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';
import { drawGurdwara, drawCropField, drawSalTree, drawThatchHut } from '../ui/TeraDrawUtils';
import { getAllMilestones } from '../game/MilestoneData';

export class GameOverScene extends Scene {
    constructor() {
        super(SCENES.GAME_OVER);
    }

    create(data: { victory: boolean }): void {
        const gs = GameState.getInstance();
        const victory = data?.victory ?? false;

        if (victory) {
            this.showVictory(gs);
        } else {
            this.showDefeat(gs);
        }
    }

    private showVictory(gs: GameState): void {
        // Golden sky
        this.cameras.main.setBackgroundColor(0xd4a830);
        for (let i = 0; i < 8; i++) {
            const t = i / 7;
            const r = Math.round(0x80 + t * (0xff - 0x80));
            const g = Math.round(0x60 + t * (0xd0 - 0x60));
            const b = Math.round(0x10 + t * (0x30 - 0x10));
            this.add.rectangle(GAME_WIDTH / 2, i * 80 + 40, GAME_WIDTH, 82, (r << 16) | (g << 8) | b);
        }

        // Golden wheat fields
        const fieldG = this.add.graphics();
        for (let i = 0; i < 8; i++) {
            drawCropField(fieldG, 60 + i * 120, GAME_HEIGHT - 100, 1.5, COLORS.CROP_GOLD);
        }

        // Gurdwara
        const structG = this.add.graphics();
        drawGurdwara(structG, GAME_WIDTH / 2, GAME_HEIGHT - 200, 2.0);

        // Huts
        drawThatchHut(structG, 150, GAME_HEIGHT - 160, 1.0);
        drawThatchHut(structG, GAME_WIDTH - 150, GAME_HEIGHT - 160, 1.0);

        // Title
        this.add.text(GAME_WIDTH / 2, 60, 'LITTLE PUNJAB ESTABLISHED!', {
            ...TEXT_STYLES.TITLE,
            fontSize: '36px',
            color: HEX_COLORS.WHITE,
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 110, `Completed: ${gs.getFormattedDate()}`, {
            ...TEXT_STYLES.SUBTITLE,
            color: HEX_COLORS.WHITE,
        }).setOrigin(0.5);

        this.showScore(gs, true);
    }

    private showDefeat(gs: GameState): void {
        // Dark, somber
        this.cameras.main.setBackgroundColor(0x1a2018);

        // Jungle reclaiming
        const bg = this.add.graphics();
        for (let i = 0; i < 16; i++) {
            drawSalTree(bg, i * 65 + 20, GAME_HEIGHT - 100, 0.7);
        }

        // Ground
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 50, GAME_WIDTH, 80, COLORS.JUNGLE_DARK);

        // Somber text
        this.add.text(GAME_WIDTH / 2, 80, 'The Jungle Reclaims', {
            ...TEXT_STYLES.TITLE,
            fontSize: '36px',
            color: HEX_COLORS.BLOOD_RED,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 130, [
            'Your family could not survive the Terai.',
            'The jungle slowly swallows what you built.',
            `Date: ${gs.getFormattedDate()}`,
        ].join('\n'), {
            ...TEXT_STYLES.BODY,
            fontSize: '16px',
            align: 'center',
        }).setOrigin(0.5);

        this.showScore(gs, false);
    }

    private showScore(gs: GameState, victory: boolean): void {
        const survivors = gs.family.filter(m => m.status !== MemberStatus.DEAD).length;
        const milestonesReached = getAllMilestones().filter(m => m.acresRequired <= gs.acresCleared).length;

        const scoreY = victory ? 180 : 230;
        const lines = [
            `Acres Cleared: ${gs.acresCleared.toFixed(0)} / ${TOTAL_ACRES}`,
            `Survivors: ${survivors} / 5`,
            `Milestones: ${milestonesReached} / 11`,
            `Origin: ${gs.originDistrict}`,
        ];

        lines.forEach((line, i) => {
            this.add.text(GAME_WIDTH / 2, scoreY + i * 28, line, {
                ...TEXT_STYLES.BODY,
                fontSize: '16px',
                color: HEX_COLORS.PARCHMENT,
            }).setOrigin(0.5);
        });

        // Play Again button
        const playAgain = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'Play Again', {
            ...TEXT_STYLES.BODY,
            fontSize: '22px',
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        playAgain.on('pointerover', () => playAgain.setColor(HEX_COLORS.WHITE));
        playAgain.on('pointerout', () => playAgain.setColor(HEX_COLORS.GOLD));
        playAgain.on('pointerdown', () => {
            // Reset GameState
            (GameState as any).instance = null;
            this.scene.start(SCENES.TITLE);
        });
    }

    shutdown(): void {
        this.input.removeAllListeners();
    }
}
