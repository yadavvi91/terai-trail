import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, TEXT_STYLES } from '../utils/constants';

export class RiverCrossingScene extends Scene {
    constructor() { super(SCENES.RIVER_CROSSING); }
    create(): void {
        this.cameras.main.setBackgroundColor(0x2266aa);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'River Crossing — Coming in Phase 5', { ...TEXT_STYLES.TITLE, fontSize: '32px' }).setOrigin(0.5);
    }
    shutdown(): void { this.input.keyboard?.removeAllListeners(); }
}
