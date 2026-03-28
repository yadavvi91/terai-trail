import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, HEX_COLORS, TEXT_STYLES } from '../utils/constants';

export class BootScene extends Scene {
    constructor() {
        super(SCENES.BOOT);
    }

    preload(): void {
        // Dark jungle background
        this.cameras.main.setBackgroundColor(0x0a1008);

        // Decorative border
        const borderG = this.add.graphics();
        borderG.lineStyle(2, 0x2d6b30, 0.4);
        borderG.strokeRect(20, 20, GAME_WIDTH - 40, GAME_HEIGHT - 40);
        borderG.lineStyle(1, 0x2d6b30, 0.2);
        borderG.strokeRect(28, 28, GAME_WIDTH - 56, GAME_HEIGHT - 56);

        // Title
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, 'THE TERAI TRAIL', {
            ...TEXT_STYLES.TITLE,
            fontSize: '42px',
            color: HEX_COLORS.GOLD,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true },
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 72, 'Settlers of Pilibhit', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '18px',
            color: HEX_COLORS.SAL_GREEN,
            fontStyle: 'italic',
        }).setOrigin(0.5);

        // Decorative divider
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 46, 300, 2, 0x2d6b30, 0.5);

        // Progress bar
        const barWidth = 420;
        const barY = GAME_HEIGHT / 2;

        this.add.rectangle(GAME_WIDTH / 2, barY, barWidth + 8, 28, 0x0a0804, 0.6);
        const progressBox = this.add.rectangle(
            GAME_WIDTH / 2, barY, barWidth + 4, 24
        ).setStrokeStyle(2, 0x2d6b30, 0.7);

        const progressBar = this.add.rectangle(
            GAME_WIDTH / 2 - barWidth / 2 + 2, barY, 0, 20, 0x2d6b30
        ).setOrigin(0, 0.5);

        const progressHighlight = this.add.rectangle(
            GAME_WIDTH / 2 - barWidth / 2 + 2, barY - 4, 0, 6, 0xffffff, 0.15
        ).setOrigin(0, 0.5);

        const loadingText = this.add.text(GAME_WIDTH / 2, barY - 28, 'Preparing for the Terai...', {
            ...TEXT_STYLES.HUD,
            fontSize: '14px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, barY + 50, '~ Pilibhit, Uttar Pradesh • 1952 ~', {
            ...TEXT_STYLES.HUD,
            fontSize: '13px',
            color: HEX_COLORS.SAL_GREEN,
        }).setOrigin(0.5);

        this.load.on('progress', (value: number) => {
            progressBar.width = (barWidth - 4) * value;
            progressHighlight.width = (barWidth - 4) * value;
        });

        this.load.on('complete', () => {
            progressBox.destroy();
            progressBar.destroy();
            progressHighlight.destroy();
            loadingText.destroy();
        });
    }

    create(): void {
        this.scene.start(SCENES.TITLE);
    }
}
