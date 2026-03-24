import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES } from '../utils/constants';

export class GameOverScene extends Scene {
    constructor() { super(SCENES.GAME_OVER); }
    create(): void {
        this.cameras.main.setBackgroundColor(COLORS.BLACK);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Game Over — Coming in Phase 8', { ...TEXT_STYLES.TITLE, fontSize: '32px' }).setOrigin(0.5);
    }
    shutdown(): void { this.input.keyboard?.removeAllListeners(); }
}
