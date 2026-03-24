import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES } from '../utils/constants';

export class HuntingScene extends Scene {
    constructor() { super(SCENES.HUNTING); }
    create(): void {
        this.cameras.main.setBackgroundColor(COLORS.GRASS_GREEN);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Hunting — Coming in Phase 6', { ...TEXT_STYLES.TITLE, fontSize: '32px' }).setOrigin(0.5);
    }
    shutdown(): void { this.input.keyboard?.removeAllListeners(); }
}
