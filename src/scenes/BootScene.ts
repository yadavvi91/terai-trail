import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES } from '../utils/constants';

export class BootScene extends Scene {
    constructor() {
        super(SCENES.BOOT);
    }

    preload(): void {
        // Dark parchment background
        this.cameras.main.setBackgroundColor(0x1a1008);

        // Decorative border
        const borderG = this.add.graphics();
        borderG.lineStyle(2, 0x8b6914, 0.4);
        borderG.strokeRect(20, 20, GAME_WIDTH - 40, GAME_HEIGHT - 40);
        borderG.lineStyle(1, 0x8b6914, 0.2);
        borderG.strokeRect(28, 28, GAME_WIDTH - 56, GAME_HEIGHT - 56);

        // Title
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, 'THE OREGON TRAIL', {
            ...TEXT_STYLES.TITLE,
            fontSize: '42px',
            color: HEX_COLORS.GOLD,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true },
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 72, 'Caulk the Wagon Edition', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '18px',
            color: HEX_COLORS.TRAIL_BROWN,
            fontStyle: 'italic',
        }).setOrigin(0.5);

        // Decorative divider
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 46, 300, 2, 0x8b6914, 0.5);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 44, 200, 1, 0x8b6914, 0.3);

        // Progress bar
        const barWidth = 420;
        const barY = GAME_HEIGHT / 2;

        // Bar background with inset shadow
        this.add.rectangle(GAME_WIDTH / 2, barY, barWidth + 8, 28, 0x0a0804, 0.6);
        const progressBox = this.add.rectangle(
            GAME_WIDTH / 2, barY, barWidth + 4, 24
        ).setStrokeStyle(2, 0x8b6914, 0.7);

        const progressBar = this.add.rectangle(
            GAME_WIDTH / 2 - barWidth / 2 + 2, barY, 0, 20, 0xc8a040
        ).setOrigin(0, 0.5);

        // Progress bar highlight
        const progressHighlight = this.add.rectangle(
            GAME_WIDTH / 2 - barWidth / 2 + 2, barY - 4, 0, 6, 0xffffff, 0.15
        ).setOrigin(0, 0.5);

        const loadingText = this.add.text(GAME_WIDTH / 2, barY - 28, 'Preparing your supplies...', {
            ...TEXT_STYLES.HUD,
            fontSize: '14px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        // Year text
        this.add.text(GAME_WIDTH / 2, barY + 50, '~ Independence, Missouri • 1848 ~', {
            ...TEXT_STYLES.HUD,
            fontSize: '13px',
            color: HEX_COLORS.TRAIL_BROWN,
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
        this.generatePlaceholderAssets();
        this.scene.start(SCENES.TITLE);
    }

    private generatePlaceholderAssets(): void {
        // Wagon silhouette texture (used as fallback)
        const wagonGfx = this.add.graphics();
        wagonGfx.fillStyle(COLORS.DARK_BROWN);
        wagonGfx.fillRect(0, 20, 80, 35);
        wagonGfx.fillStyle(COLORS.PARCHMENT);
        wagonGfx.fillRect(5, 0, 70, 25);
        wagonGfx.fillStyle(COLORS.TRAIL_BROWN);
        wagonGfx.fillCircle(15, 60, 10);
        wagonGfx.fillCircle(65, 60, 10);
        wagonGfx.generateTexture('wagon', 80, 70);
        wagonGfx.destroy();
    }
}
