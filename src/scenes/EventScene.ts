import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES } from '../utils/constants';
import { GameEvent } from '../utils/types';
import { generateRandomEvent } from '../game/EventManager';

// Icon map for event types
const EVENT_ICONS: Record<string, string> = {
    disease:     '🤒',
    injury:      '🦴',
    breakdown:   '🔧',
    theft:       '🌙',
    wild_fruit:  '🍇',
    snake_bite:  '🐍',
    travelers:   '🤝',
    bad_water:   '💧',
    lost_oxen:   '🐂',
    good_weather:'☀️',
    hail_storm:  '⛈️',
    found_cache: '📦',
};

export class EventScene extends Scene {
    private event!: GameEvent;

    constructor() {
        super(SCENES.EVENT);
    }

    create(): void {
        this.event = generateRandomEvent();
        const panelW = 680;
        const panelH = 420;
        const panelX = GAME_WIDTH / 2;
        const panelY = GAME_HEIGHT / 2;

        // Backdrop
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78);

        // Panel shadow
        this.add.rectangle(panelX + 4, panelY + 4, panelW, panelH, 0x000000, 0.4);

        // Panel body (parchment)
        this.add.rectangle(panelX, panelY, panelW, panelH, 0xf0ddb8);
        this.add.rectangle(panelX, panelY, panelW, panelH).setStrokeStyle(3, 0x8b6914);

        // Inner border
        this.add.rectangle(panelX, panelY, panelW - 14, panelH - 14).setStrokeStyle(1, 0xb89050, 0.5);

        // Header bar
        const isGood = ['wild_fruit', 'good_weather', 'found_cache', 'travelers'].includes(this.event.id);
        const headerColor = isGood ? 0x3d7830 : 0x8b2222;
        this.add.rectangle(panelX, panelY - panelH / 2 + 32, panelW, 64, headerColor);

        // Icon
        const icon = EVENT_ICONS[this.event.id] ?? '❗';
        this.add.text(panelX - panelW / 2 + 44, panelY - panelH / 2 + 32, icon, {
            fontSize: '28px',
        }).setOrigin(0.5);

        // Title
        this.add.text(panelX + 10, panelY - panelH / 2 + 32, this.event.title, {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '22px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        // Description
        this.add.text(panelX, panelY - 80, this.event.description, {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '16px',
            wordWrap: { width: panelW - 60 },
            align: 'center',
            lineSpacing: 6,
        }).setOrigin(0.5);

        // Divider
        this.add.rectangle(panelX, panelY - 10, panelW - 60, 1, 0xb89050, 0.6);

        // Choice buttons
        const choices = this.event.choices ?? [{ text: 'Continue', outcome: () => {} }];
        const btnH = 54;
        const btnW = panelW - 60;
        const btnStartY = panelY + 20;
        const btnSpacing = btnH + 10;

        choices.forEach((choice, i) => {
            const y = btnStartY + i * btnSpacing;
            const btn = this.add.rectangle(panelX, y, btnW, btnH, 0x4a3728)
                .setInteractive({ useHandCursor: true });
            btn.setStrokeStyle(1, 0x8b6914, 0.8);

            // Choice letter badge
            this.add.rectangle(panelX - btnW / 2 + 22, y, 30, 30, 0x8b6914);
            this.add.text(panelX - btnW / 2 + 22, y, String.fromCharCode(65 + i), {
                ...TEXT_STYLES.HUD,
                fontSize: '14px',
                color: HEX_COLORS.PARCHMENT,
            }).setOrigin(0.5);

            this.add.text(panelX + 10, y, choice.text, {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '15px',
                wordWrap: { width: btnW - 60 },
                align: 'center',
            }).setOrigin(0.5);

            btn.on('pointerover', () => btn.setFillStyle(0x6a4a38));
            btn.on('pointerout', () => btn.setFillStyle(0x4a3728));
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
