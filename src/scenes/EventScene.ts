/**
 * Event Scene: Displays random events with choices.
 * Shared between Oregon Trail and Terai Trail — works with GameEvent interface.
 */
import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES } from '../utils/constants';
import { GameEvent } from '../utils/types';
import { drawSalTree, drawElephantGrass } from '../ui/TeraDrawUtils';
import { TeraiSoundManager } from '../audio/TeraiSoundManager';

export class EventScene extends Scene {
    constructor() {
        super(SCENES.EVENT);
    }

    create(data: { event: GameEvent }): void {
        const event = data?.event;
        if (!event) {
            this.scene.start(SCENES.SETTLEMENT);
            return;
        }

        // Play event-specific SFX
        const sound = TeraiSoundManager.getInstance();
        if (event.id === 'malaria') sound.playMosquitoBuzz();
        else if (event.id === 'snake_bite') sound.playSnakeHiss();
        else if (event.id === 'tiger_attack') sound.playTigerGrowl();
        else if (event.id === 'flood' || event.id === 'monsoon_damage') sound.playMonsoonThunder();
        else if (event.id === 'elephant_raid') sound.playBullockMoo();

        // Background
        this.cameras.main.setBackgroundColor(COLORS.JUNGLE_DARK);
        const bg = this.add.graphics();

        // Jungle setting
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH, 120, COLORS.CLEARED_DIRT);
        for (let i = 0; i < 8; i++) {
            drawSalTree(bg, 60 + i * 130, GAME_HEIGHT - 120, 0.5);
        }
        drawElephantGrass(bg, 100, GAME_HEIGHT - 100, 0.4);
        drawElephantGrass(bg, GAME_WIDTH - 100, GAME_HEIGHT - 100, 0.4);

        // Event panel
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 650, 350, 0x000000, 0.85);

        // Title
        this.add.text(GAME_WIDTH / 2, 120, event.title, {
            ...TEXT_STYLES.TITLE,
            fontSize: '32px',
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5);

        // Description
        this.add.text(GAME_WIDTH / 2, 200, event.description, {
            ...TEXT_STYLES.BODY,
            fontSize: '15px',
            wordWrap: { width: 560 },
            align: 'center',
        }).setOrigin(0.5);

        // Choice buttons
        const choices = event.choices ?? [{ text: 'Continue', outcome: () => {} }];
        choices.forEach((choice, i) => {
            const y = 300 + i * 50;
            const btn = this.add.text(GAME_WIDTH / 2, y, choice.text, {
                ...TEXT_STYLES.BODY,
                fontSize: '16px',
                color: HEX_COLORS.PARCHMENT,
                backgroundColor: '#4a3728',
                padding: { x: 14, y: 6 },
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor(HEX_COLORS.GOLD));
            btn.on('pointerout', () => btn.setColor(HEX_COLORS.PARCHMENT));
            btn.on('pointerdown', () => {
                choice.outcome();
                this.scene.start(SCENES.SETTLEMENT);
            });
        });
    }

    shutdown(): void {
        this.input.removeAllListeners();
    }
}
