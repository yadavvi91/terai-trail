/**
 * WP10 — Title Scene: Terai jungle setting with bullock cart arrival.
 */
import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS } from '../utils/constants';
import { drawSalTree, drawElephantGrass, drawShivalikHills, drawIsoBullockCart, drawIsoBullock } from '../ui/TeraDrawUtils';
import { TeraiSoundManager } from '../audio/TeraiSoundManager';

export class TeraiTitleScene extends Scene {
    private cartX: number = -100;
    private cartG!: Phaser.GameObjects.Graphics;

    constructor() {
        super(SCENES.TITLE);
    }

    create(): void {
        // Initialize audio on first user-triggered scene
        const sound = TeraiSoundManager.getInstance();
        sound.init();
        sound.startSettlementMusic();
        sound.startJungleAmbience();

        this.cartX = -100;
        const groundY = GAME_HEIGHT - 90;

        // ── Sky gradient — humid tropical ──
        this.cameras.main.setBackgroundColor(COLORS.SKY_BLUE);
        const skySteps = 12;
        for (let i = 0; i < skySteps; i++) {
            const t = i / (skySteps - 1);
            const r = Math.round(0x2a + t * (0x80 - 0x2a));
            const gv = Math.round(0x5a + t * (0xc0 - 0x5a));
            const b = Math.round(0x3a + t * (0x60 - 0x3a));
            const color = (r << 16) | (gv << 8) | b;
            this.add.rectangle(GAME_WIDTH / 2, (i + 0.5) * (groundY / skySteps), GAME_WIDTH, groundY / skySteps + 2, color);
        }

        // ── Shivalik Hills backdrop ──
        const hillsG = this.add.graphics();
        drawShivalikHills(hillsG, groundY - 60, GAME_WIDTH, [0x5a7a5a, 0x4a6a4a, 0x507050], 0.6);

        // ── Dense sal forest filling background ──
        const forestG = this.add.graphics();
        for (let i = 0; i < 20; i++) {
            const tx = i * 55 + 20;
            const ty = groundY - 10 + (i % 3) * 8;
            drawSalTree(forestG, tx, ty, 0.8 + (i % 3) * 0.15);
        }

        // ── Ground ──
        this.add.rectangle(GAME_WIDTH / 2, groundY + 35, GAME_WIDTH, 100, COLORS.JUNGLE_DARK);

        // ── Elephant grass borders ──
        const grassG = this.add.graphics();
        for (let i = 0; i < 12; i++) {
            drawElephantGrass(grassG, i * 90 + 30, groundY + 5, 0.6);
        }

        // ── Jungle path ──
        const pathG = this.add.graphics();
        pathG.fillStyle(COLORS.CLEARED_DIRT, 0.7);
        pathG.fillRect(0, groundY - 8, GAME_WIDTH, 20);

        // ── Animated bullock cart ──
        this.cartG = this.add.graphics();

        // ── Title text ──
        this.add.text(GAME_WIDTH / 2, 120, 'THE TERAI TRAIL', {
            ...TEXT_STYLES.TITLE,
            fontSize: '52px',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 175, 'Settlers of Pilibhit', {
            ...TEXT_STYLES.SUBTITLE,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 210, '~ 1952 ~', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '20px',
            color: HEX_COLORS.CROP_GOLD,
        }).setOrigin(0.5);

        // ── Menu ──
        const menuY = GAME_HEIGHT - 200;

        const beginBtn = this.add.text(GAME_WIDTH / 2, menuY, '▶  Begin Settlement', {
            ...TEXT_STYLES.BODY,
            fontSize: '22px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        beginBtn.on('pointerover', () => beginBtn.setColor(HEX_COLORS.GOLD));
        beginBtn.on('pointerout', () => beginBtn.setColor(HEX_COLORS.PARCHMENT));
        beginBtn.on('pointerdown', () => {
            this.scene.start(SCENES.PARTY_CREATION);
        });

        const aboutBtn = this.add.text(GAME_WIDTH / 2, menuY + 40, '?  About the Terai', {
            ...TEXT_STYLES.BODY,
            fontSize: '18px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        aboutBtn.on('pointerover', () => aboutBtn.setColor(HEX_COLORS.GOLD));
        aboutBtn.on('pointerout', () => aboutBtn.setColor(HEX_COLORS.PARCHMENT));
        aboutBtn.on('pointerdown', () => this.showAboutPanel());
    }

    update(_time: number, delta: number): void {
        // Animate cart rolling in
        if (this.cartX < GAME_WIDTH / 2 - 60) {
            this.cartX += delta * 0.05;
            this.cartG.clear();
            const groundY = GAME_HEIGHT - 90;
            drawIsoBullock(this.cartG, this.cartX - 50, groundY - 14, 0.7);
            drawIsoBullockCart(this.cartG, this.cartX, groundY - 14, 0.7);
        }
    }

    private showAboutPanel(): void {
        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 700, 400, 0x000000, 0.85)
            .setInteractive();
        const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, [
            'THE TERAI — Historical Context',
            '',
            'In 1947, the Partition of India displaced millions.',
            'Sikh families from West Punjab were among those who',
            'lost everything — land, homes, and livelihoods.',
            '',
            'In 1952, the Indian government offered refugees',
            'plots of jungle land in the Terai region of Pilibhit.',
            'The Terai was dense sal forest, infested with malaria-',
            'carrying mosquitoes and prowled by tigers.',
            '',
            'These settlers cleared the jungle acre by acre,',
            'building a new Punjab in the wilderness.',
            '',
            '[ Click anywhere to close ]',
        ].join('\n'), {
            ...TEXT_STYLES.BODY,
            fontSize: '16px',
            align: 'center',
        }).setOrigin(0.5);

        bg.on('pointerdown', () => { bg.destroy(); text.destroy(); });
        this.input.keyboard?.once('keydown', () => { bg.destroy(); text.destroy(); });
    }

    shutdown(): void {
        this.input.removeAllListeners();
    }
}
