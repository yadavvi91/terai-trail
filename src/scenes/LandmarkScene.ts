import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES } from '../utils/constants';

export class LandmarkScene extends Scene {
    constructor() { super(SCENES.LANDMARK); }
    create(): void {
        this.cameras.main.setBackgroundColor(COLORS.DARK_BROWN);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Landmark — Coming in Phase 7', { ...TEXT_STYLES.TITLE, fontSize: '32px' }).setOrigin(0.5);
    }
    shutdown(): void { this.input.keyboard?.removeAllListeners(); }
}
