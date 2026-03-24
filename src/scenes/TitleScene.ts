import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS } from '../utils/constants';

export class TitleScene extends Scene {
    constructor() {
        super(SCENES.TITLE);
    }

    create(): void {
        // Background
        this.cameras.main.setBackgroundColor(COLORS.SKY_BLUE);

        // Ground
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 80, GAME_WIDTH, 160, COLORS.GRASS_GREEN);

        // Trail
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 80, GAME_WIDTH, 20, COLORS.TRAIL_BROWN);

        // Title text
        this.add.text(GAME_WIDTH / 2, 180, 'The Oregon Trail', {
            ...TEXT_STYLES.TITLE,
            fontSize: '56px',
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(GAME_WIDTH / 2, 250, 'Caulk the Wagon Edition', {
            ...TEXT_STYLES.SUBTITLE,
            fontStyle: 'italic',
        }).setOrigin(0.5);

        // Year
        this.add.text(GAME_WIDTH / 2, 300, '~ 1848 ~', TEXT_STYLES.SUBTITLE).setOrigin(0.5);

        // Animated wagon crossing
        const wagon = this.add.rectangle(-80, GAME_HEIGHT - 90, 60, 30, COLORS.DARK_BROWN);
        const wagonCover = this.add.rectangle(-80, GAME_HEIGHT - 115, 50, 20, COLORS.PARCHMENT);

        this.tweens.add({
            targets: [wagon, wagonCover],
            x: GAME_WIDTH + 80,
            duration: 8000,
            repeat: -1,
            delay: 500,
        });

        // Menu options
        const menuY = 420;

        const travelBtn = this.createMenuButton(GAME_WIDTH / 2, menuY, '1. Travel the trail');
        travelBtn.on('pointerdown', () => this.scene.start(SCENES.PARTY_CREATION));

        const learnBtn = this.createMenuButton(GAME_WIDTH / 2, menuY + 60, '2. Learn about the trail');
        learnBtn.on('pointerdown', () => this.showTrailInfo());

        // Keyboard
        this.input.keyboard?.on('keydown-ONE', () => this.scene.start(SCENES.PARTY_CREATION));
        this.input.keyboard?.on('keydown-TWO', () => this.showTrailInfo());

        // Footer hint
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'Press 1 to start your journey', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);
    }

    private createMenuButton(x: number, y: number, label: string): Phaser.GameObjects.Text {
        const text = this.add.text(x, y, label, {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '28px',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        text.on('pointerover', () => text.setColor(HEX_COLORS.GOLD));
        text.on('pointerout', () => text.setColor(HEX_COLORS.PARCHMENT));

        return text;
    }

    private showTrailInfo(): void {
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 100, GAME_HEIGHT - 100,
            COLORS.BLACK, 0.9
        ).setInteractive();

        const info = this.add.text(GAME_WIDTH / 2, 100, [
            'The Oregon Trail',
            '',
            'In 1848, thousands of Americans set out on a',
            '2,000-mile journey from Independence, Missouri',
            "to Oregon's Willamette Valley.",
            '',
            'You will lead a party of five across prairies,',
            'rivers, and mountains. Manage your supplies,',
            'hunt for food, and make life-or-death decisions.',
            '',
            'Choose your profession wisely:',
            '  Banker    — $1,600 starting money',
            '  Carpenter — $800 + wagon repair bonus',
            '  Farmer    — $400 + 3x final score',
            '',
            'Click anywhere to return...',
        ].join('\n'), {
            ...TEXT_STYLES.BODY,
            lineSpacing: 8,
        }).setOrigin(0.5, 0);

        overlay.on('pointerdown', () => {
            overlay.destroy();
            info.destroy();
        });
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
