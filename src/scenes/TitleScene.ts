import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS } from '../utils/constants';
import { drawWagon, drawOx, drawMountain, drawHill, drawCloud, drawSun } from '../ui/DrawUtils';

export class TitleScene extends Scene {
    private wagonG!: Phaser.GameObjects.Graphics;
    private wagonX: number = -120;
    private dustParticles: { x: number; y: number; alpha: number; r: number }[] = [];
    private dustG!: Phaser.GameObjects.Graphics;

    constructor() {
        super(SCENES.TITLE);
    }

    create(): void {
        this.wagonX = -120;
        this.dustParticles = [];

        const groundY = GAME_HEIGHT - 90;

        // ── Sky gradient (simulate with layered rects) ──
        this.cameras.main.setBackgroundColor(0x1a6ea8);
        for (let i = 0; i < 12; i++) {
            const t = i / 11;
            const r = Math.round(0x1a + t * (0x87 - 0x1a));
            const g = Math.round(0x6e + t * (0xce - 0x6e));
            const b = Math.round(0xa8 + t * (0xe8 - 0xa8));
            const color = (r << 16) | (g << 8) | b;
            this.add.rectangle(GAME_WIDTH / 2, (i + 0.5) * ((groundY) / 12), GAME_WIDTH, (groundY) / 12 + 1, color);
        }

        // ── Sun ──
        const bg = this.add.graphics();
        drawSun(bg, GAME_WIDTH - 130, 100, 44);

        // ── Distant mountains ──
        const mtns = this.add.graphics();
        drawMountain(mtns, 180,  groundY - 10, 220, 190, 0x6a7fa8, true);
        drawMountain(mtns, 420,  groundY - 10, 260, 220, 0x5a7098, true);
        drawMountain(mtns, 660,  groundY - 10, 200, 170, 0x7a8fb8, true);
        drawMountain(mtns, 850,  groundY - 10, 240, 200, 0x607898, true);
        drawMountain(mtns, 1020, groundY - 10, 180, 150, 0x6a8098, true);

        // ── Near hills ──
        const hills = this.add.graphics();
        drawHill(hills, 100,  groundY + 5, 220, 0x3a7830);
        drawHill(hills, 340,  groundY + 5, 180, 0x3d8a33);
        drawHill(hills, 580,  groundY + 5, 200, 0x347030);
        drawHill(hills, 800,  groundY + 5, 190, 0x3a7830);
        drawHill(hills, 980,  groundY + 5, 160, 0x3d8a33);

        // ── Ground ──
        this.add.rectangle(GAME_WIDTH / 2, groundY + 40, GAME_WIDTH, 100, 0x3d8b37);
        // Trail dirt path
        this.add.rectangle(GAME_WIDTH / 2, groundY + 14, GAME_WIDTH, 22, 0x9e7b3a);
        // Trail ruts
        this.add.rectangle(GAME_WIDTH / 2, groundY + 10, GAME_WIDTH, 3, 0x7a5a1e);
        this.add.rectangle(GAME_WIDTH / 2, groundY + 18, GAME_WIDTH, 3, 0x7a5a1e);
        // Prairie grass tufts
        for (let i = 0; i < 18; i++) {
            const gx = (i / 18) * GAME_WIDTH + 20;
            const gy = groundY + Phaser.Math.Between(22, 38);
            this.add.rectangle(gx, gy, 3, Phaser.Math.Between(6, 14), 0x2d6a22);
        }

        // ── Clouds ──
        const cloudG = this.add.graphics();
        drawCloud(cloudG, 200, 60, 0.9);
        drawCloud(cloudG, 550, 40, 0.7);
        drawCloud(cloudG, 820, 80, 1.1);

        // ── Birds (simple v-shapes) ──
        const birdG = this.add.graphics();
        birdG.lineStyle(2, 0x1a3a5c, 0.7);
        [[680, 55], [710, 48], [730, 60], [760, 44]].forEach(([bx, by]) => {
            birdG.beginPath();
            (birdG as any).moveTo(bx - 8, by);
            (birdG as any).lineTo(bx, by - 5);
            (birdG as any).lineTo(bx + 8, by);
            birdG.strokePath();
        });

        // ── Title text (parchment card) ──
        this.add.rectangle(GAME_WIDTH / 2, 210, 700, 130, 0x000000, 0.35);
        this.add.rectangle(GAME_WIDTH / 2, 210, 696, 126, 0xf5e6c8, 0.12);

        this.add.text(GAME_WIDTH / 2, 175, 'THE OREGON TRAIL', {
            ...TEXT_STYLES.TITLE,
            fontSize: '52px',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 8, fill: true },
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 236, 'Caulk the Wagon Edition', {
            ...TEXT_STYLES.SUBTITLE,
            fontStyle: 'italic',
            fontSize: '22px',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 264, '~ 1848 ~', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.GOLD,
            fontSize: '16px',
        }).setOrigin(0.5);

        // ── Menu card ──
        this.add.rectangle(GAME_WIDTH / 2, 370, 380, 120, 0x000000, 0.55);
        this.add.rectangle(GAME_WIDTH / 2, 370, 376, 116, COLORS.PARCHMENT, 0.08);

        const travelBtn = this.createMenuButton(GAME_WIDTH / 2, 345, '1.  Travel the Trail');
        travelBtn.on('pointerdown', () => this.scene.start(SCENES.PARTY_CREATION));

        const learnBtn = this.createMenuButton(GAME_WIDTH / 2, 395, '2.  About the Trail');
        learnBtn.on('pointerdown', () => this.showTrailInfo());

        this.input.keyboard?.on('keydown-ONE', () => this.scene.start(SCENES.PARTY_CREATION));
        this.input.keyboard?.on('keydown-TWO', () => this.showTrailInfo());

        // ── Footer ──
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 16, 'Press 1 to begin your journey west', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '13px',
        }).setOrigin(0.5);

        // ── Animated wagon graphics ──
        this.dustG = this.add.graphics();
        this.wagonG = this.add.graphics();

        // Decorative border
        const border = this.add.graphics();
        border.lineStyle(3, 0xf5e6c8, 0.3);
        border.strokeRect(8, 8, GAME_WIDTH - 16, GAME_HEIGHT - 16);
        border.lineStyle(1, 0xf5e6c8, 0.15);
        border.strokeRect(14, 14, GAME_WIDTH - 28, GAME_HEIGHT - 28);
    }

    update(_t: number, dt: number): void {
        const groundY = GAME_HEIGHT - 90;
        const speed = 120;
        this.wagonX += (speed * dt) / 1000;
        if (this.wagonX > GAME_WIDTH + 140) this.wagonX = -140;

        // Dust
        if (Math.random() < 0.4 && this.wagonX > 0 && this.wagonX < GAME_WIDTH) {
            this.dustParticles.push({
                x: this.wagonX - 90,
                y: groundY + 4 + Math.random() * 8,
                alpha: 0.5,
                r: 4 + Math.random() * 8,
            });
        }
        this.dustParticles = this.dustParticles.filter(p => p.alpha > 0.02);
        this.dustParticles.forEach(p => {
            p.x -= (speed * dt) / 1000 * 0.3;
            p.alpha -= dt / 1800;
            p.r += dt / 400;
        });

        this.dustG.clear();
        this.dustParticles.forEach(p => {
            this.dustG.fillStyle(0xc8a870, p.alpha);
            this.dustG.fillCircle(p.x, p.y, p.r);
        });

        this.wagonG.clear();
        const wx = this.wagonX;
        const wy = groundY - 2;
        // Oxen
        drawOx(this.wagonG, wx - 88, wy, 0.75);
        drawOx(this.wagonG, wx - 56, wy, 0.75);
        drawWagon(this.wagonG, wx, wy, 0.9);
    }

    private createMenuButton(x: number, y: number, label: string): Phaser.GameObjects.Text {
        const text = this.add.text(x, y, label, {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '26px',
            color: HEX_COLORS.PARCHMENT,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        text.on('pointerover', () => {
            text.setColor(HEX_COLORS.GOLD);
            this.tweens.add({ targets: text, scaleX: 1.05, scaleY: 1.05, duration: 120 });
        });
        text.on('pointerout', () => {
            text.setColor(HEX_COLORS.PARCHMENT);
            this.tweens.add({ targets: text, scaleX: 1, scaleY: 1, duration: 120 });
        });
        return text;
    }

    private showTrailInfo(): void {
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.88,
        ).setInteractive();

        const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 100, GAME_HEIGHT - 80, COLORS.PARCHMENT, 0.97);
        panel.setStrokeStyle(3, COLORS.TRAIL_BROWN);

        // Title bar
        this.add.rectangle(GAME_WIDTH / 2, 84, GAME_WIDTH - 100, 52, COLORS.TRAIL_BROWN);
        this.add.text(GAME_WIDTH / 2, 84, 'About the Oregon Trail', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '22px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        const lines = [
            'In 1848, thousands of Americans set out on a 2,000-mile',
            'journey from Independence, Missouri to the Willamette Valley.',
            '',
            'You will lead a party of five across prairies, mountains,',
            'and rivers — managing supplies, hunting for food, and',
            'making life-or-death decisions along the way.',
            '',
            'Choose your profession wisely:',
            '  ◆  Banker     — $1,600 to start, easiest difficulty',
            '  ◆  Carpenter  — $800 + wagon repair bonus',
            '  ◆  Farmer     — $400 + 3× final score multiplier',
            '',
            'Click anywhere to return.',
        ];

        this.add.text(GAME_WIDTH / 2, 128, lines.join('\n'), {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '16px',
            lineSpacing: 8,
            align: 'center',
        }).setOrigin(0.5, 0);

        overlay.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            this.children.list
                .filter(c => c.depth === 0 && c !== overlay && c !== panel)
                .forEach(c => { /* selective cleanup not needed here */ });
            this.scene.restart();
        });
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
