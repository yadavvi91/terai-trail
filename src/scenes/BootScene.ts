import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS } from '../utils/constants';

export class BootScene extends Scene {
    constructor() {
        super(SCENES.BOOT);
    }

    preload(): void {
        const barWidth = 400;
        const barY = GAME_HEIGHT / 2;

        const progressBox = this.add.rectangle(
            GAME_WIDTH / 2, barY, barWidth + 4, 34
        ).setStrokeStyle(2, COLORS.PARCHMENT);

        const progressBar = this.add.rectangle(
            GAME_WIDTH / 2 - barWidth / 2 + 2, barY, 0, 28, COLORS.PARCHMENT
        ).setOrigin(0, 0.5);

        const loadingText = this.add.text(GAME_WIDTH / 2, barY - 40, 'Loading...', {
            fontFamily: '"Courier New", monospace',
            fontSize: '20px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        this.load.on('progress', (value: number) => {
            progressBar.width = (barWidth - 4) * value;
        });

        this.load.on('complete', () => {
            progressBox.destroy();
            progressBar.destroy();
            loadingText.destroy();
        });
    }

    create(): void {
        this.generatePlaceholderAssets();
        this.scene.start(SCENES.TITLE);
    }

    private generatePlaceholderAssets(): void {
        // Wagon silhouette
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
