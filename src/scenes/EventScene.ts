import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES } from '../utils/constants';
import { GameEvent } from '../utils/types';
import { generateRandomEvent } from '../game/EventManager';

export class EventScene extends Scene {
    private event!: GameEvent;

    constructor() {
        super(SCENES.EVENT);
    }

    create(): void {
        this.event = generateRandomEvent();

        // Dark overlay
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.82);

        // Panel
        const panelW = GAME_WIDTH - 160;
        const panelH = GAME_HEIGHT - 160;
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, panelW, panelH, COLORS.PARCHMENT);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, panelW, panelH)
            .setStrokeStyle(3, COLORS.TRAIL_BROWN);

        // Title bar
        this.add.rectangle(GAME_WIDTH / 2, 120, panelW, 50, COLORS.TRAIL_BROWN);
        this.add.text(GAME_WIDTH / 2, 120, '⚠ ' + this.event.title, {
            ...TEXT_STYLES.SUBTITLE,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '22px',
        }).setOrigin(0.5);

        // Description
        this.add.text(GAME_WIDTH / 2, 210, this.event.description, {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '17px',
            wordWrap: { width: panelW - 60 },
            align: 'center',
        }).setOrigin(0.5);

        // Choices
        const choices = this.event.choices ?? [{ text: 'Continue', outcome: () => {} }];
        const choiceStartY = 320;
        const choiceSpacing = 70;

        choices.forEach((choice, i) => {
            const y = choiceStartY + i * choiceSpacing;
            const btn = this.add.rectangle(GAME_WIDTH / 2, y, panelW - 80, 52, COLORS.DARK_BROWN)
                .setInteractive({ useHandCursor: true });

            this.add.text(GAME_WIDTH / 2, y, choice.text, {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '16px',
                wordWrap: { width: panelW - 120 },
                align: 'center',
            }).setOrigin(0.5);

            btn.on('pointerover', () => btn.setFillStyle(COLORS.TRAIL_BROWN));
            btn.on('pointerout', () => btn.setFillStyle(COLORS.DARK_BROWN));
            btn.on('pointerdown', () => this.resolveChoice(i));
        });
    }

    private resolveChoice(index: number): void {
        const choices = this.event.choices ?? [{ text: 'Continue', outcome: () => {} }];
        choices[index]?.outcome();
        this.scene.stop();
        this.scene.resume(SCENES.TRAVEL);
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
