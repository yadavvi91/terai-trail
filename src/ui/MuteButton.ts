import { Scene } from 'phaser';
import { GAME_WIDTH } from '../utils/constants';
import { SoundManager } from '../audio/SoundManager';

/**
 * Adds a mute/unmute toggle to the top-right corner of any scene.
 * Call addMuteButton(scene) in each scene's create().
 */
export function addMuteButton(scene: Scene, depth: number = 50): void {
    const sm = SoundManager.getInstance();
    const x = GAME_WIDTH - 30;
    const y = 30;

    // Background circle
    const bg = scene.add.circle(x, y, 18, 0x000000, 0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(depth);
    scene.add.circle(x, y, 18).setStrokeStyle(1.5, 0x8b6914, 0.6).setDepth(depth);

    // Icon text (speaker emoji)
    const icon = scene.add.text(x, y, sm.isMuted ? '🔇' : '🔊', {
        fontSize: '18px',
    }).setOrigin(0.5).setDepth(depth + 1);

    bg.on('pointerdown', () => {
        sm.init(); // ensure AudioContext is initialized on user gesture
        const muted = sm.toggleMute();
        icon.setText(muted ? '🔇' : '🔊');
        if (!muted) sm.playClick();
    });

    bg.on('pointerover', () => bg.setFillStyle(0x333333, 0.7));
    bg.on('pointerout', () => bg.setFillStyle(0x000000, 0.5));
}
