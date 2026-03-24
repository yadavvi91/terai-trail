import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES } from '../utils/constants';

export class TravelScene extends Scene {
    constructor() { super(SCENES.TRAVEL); }
    create(): void {
        this.cameras.main.setBackgroundColor(COLORS.DARK_BROWN);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Travel — Coming in Phase 3', { ...TEXT_STYLES.TITLE, fontSize: '32px' }).setOrigin(0.5);
    }
    shutdown(): void { this.input.keyboard?.removeAllListeners(); }
}
