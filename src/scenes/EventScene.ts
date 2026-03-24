import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES } from '../utils/constants';

export class EventScene extends Scene {
    constructor() { super(SCENES.EVENT); }
    create(): void {
        this.cameras.main.setBackgroundColor(COLORS.BLACK);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Random Event — Coming in Phase 4', { ...TEXT_STYLES.TITLE, fontSize: '32px' }).setOrigin(0.5);
    }
    shutdown(): void { this.input.keyboard?.removeAllListeners(); }
}
