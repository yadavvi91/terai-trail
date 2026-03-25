import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS } from '../utils/constants';
import { drawWagon, drawOx, drawPerson, drawWoman, drawChild, drawPig, drawTree, drawMountain, drawHill, drawCloud, drawSun } from '../ui/DrawUtils';
import { addMuteButton } from '../ui/MuteButton';
import { SoundManager } from '../audio/SoundManager';

export class TitleScene extends Scene {
    private wagonG!: Phaser.GameObjects.Graphics;
    private wagonX: number = -120;
    private dustParticles: { x: number; y: number; alpha: number; r: number }[] = [];
    private dustG!: Phaser.GameObjects.Graphics;
    private walkFrame: number = 0;
    private walkTimer: number = 0;

    constructor() {
        super(SCENES.TITLE);
    }

    create(): void {
        this.wagonX = -120;
        this.dustParticles = [];
        this.walkFrame = 0;
        this.walkTimer = 0;

        const groundY = GAME_HEIGHT - 90;

        // ── Sky gradient — deep blue at top, warm amber at horizon ──
        this.cameras.main.setBackgroundColor(0x0d3a6e);
        const skySteps = 16;
        for (let i = 0; i < skySteps; i++) {
            const t = i / (skySteps - 1);
            // Top = deep blue, horizon = warm sky blue with amber tint
            const r = Math.round(0x0d + t * (0x72 - 0x0d));
            const gv = Math.round(0x3a + t * (0xb8 - 0x3a));
            const b = Math.round(0x6e + t * (0xd8 - 0x6e));
            const color = (r << 16) | (gv << 8) | b;
            this.add.rectangle(GAME_WIDTH / 2, (i + 0.5) * (groundY / skySteps), GAME_WIDTH, groundY / skySteps + 2, color);
        }
        // Horizon warm glow
        this.add.rectangle(GAME_WIDTH / 2, groundY - 12, GAME_WIDTH, 30, 0xf0c890, 0.22);
        this.add.rectangle(GAME_WIDTH / 2, groundY - 4,  GAME_WIDTH, 16, 0xf0b060, 0.18);

        // ── Sun ──
        const bg = this.add.graphics();
        drawSun(bg, GAME_WIDTH - 140, 90, 48);

        // ── Far mountains (distant, desaturated/hazy) ──
        const farMtns = this.add.graphics();
        drawMountain(farMtns, 80,   groundY - 5, 200, 160, 0x8090a8, true);
        drawMountain(farMtns, 280,  groundY - 5, 260, 200, 0x7888a0, true);
        drawMountain(farMtns, 520,  groundY - 5, 220, 185, 0x8898b0, true);
        drawMountain(farMtns, 760,  groundY - 5, 280, 215, 0x6878a0, true);
        drawMountain(farMtns, 980,  groundY - 5, 200, 170, 0x7890a8, true);

        // ── Mid mountains (closer, more saturated) ──
        const midMtns = this.add.graphics();
        drawMountain(midMtns, 200, groundY, 180, 165, 0x5a7098, true);
        drawMountain(midMtns, 430, groundY, 220, 195, 0x4d6890, true);
        drawMountain(midMtns, 680, groundY, 190, 175, 0x607898, true);
        drawMountain(midMtns, 880, groundY, 240, 180, 0x546c90, true);

        // ── Near hills ──
        const hills = this.add.graphics();
        drawHill(hills, 100,  groundY + 8, 240, 0x2d6428);
        drawHill(hills, 340,  groundY + 8, 200, 0x337030);
        drawHill(hills, 580,  groundY + 8, 220, 0x2d6428);
        drawHill(hills, 800,  groundY + 8, 210, 0x337030);
        drawHill(hills, 1010, groundY + 8, 190, 0x2d6428);

        // ── Trees on distant hilltops ──
        const treeG = this.add.graphics();
        drawTree(treeG, 60,  groundY + 2, 55, 0x2a5820, false);
        drawTree(treeG, 100, groundY - 5, 65, 0x234d1a, false);
        drawTree(treeG, 135, groundY - 2, 48, 0x2a5820, false);
        drawTree(treeG, 880, groundY - 3, 58, 0x234d1a, false);
        drawTree(treeG, 920, groundY + 2, 62, 0x2a5820, false);
        drawTree(treeG, 960, groundY - 6, 72, 0x234d1a, true); // pine
        drawTree(treeG, 990, groundY - 2, 55, 0x234d1a, true);

        // ── Ground ──
        this.add.rectangle(GAME_WIDTH / 2, groundY + 40, GAME_WIDTH, 100, 0x3a7d30);
        // Lighter ground strip near horizon
        this.add.rectangle(GAME_WIDTH / 2, groundY + 6, GAME_WIDTH, 16, 0x4a9038, 0.6);
        // Trail dirt path
        this.add.rectangle(GAME_WIDTH / 2, groundY + 14, GAME_WIDTH, 24, 0x9e7b3a);
        // Trail ruts
        this.add.rectangle(GAME_WIDTH / 2, groundY + 8,  GAME_WIDTH, 3, 0x6a4e1e);
        this.add.rectangle(GAME_WIDTH / 2, groundY + 20, GAME_WIDTH, 3, 0x6a4e1e);
        // Wildflowers alongside trail
        const flowerG = this.add.graphics();
        [[120, 0xffdd44], [210, 0xff8844], [350, 0xffdd44], [490, 0xff6644],
         [610, 0xffdd44], [730, 0xff8844], [850, 0xffdd44], [950, 0xff6644]].forEach(([fx, fc]) => {
            flowerG.fillStyle(fc as number, 0.8);
            flowerG.fillCircle(fx as number, groundY + 28, 3);
            flowerG.fillCircle((fx as number) + 12, groundY + 32, 2.5);
        });
        // Prairie grass tufts
        const grassG = this.add.graphics();
        for (let i = 0; i < 28; i++) {
            const gx = (i / 28) * GAME_WIDTH + 10;
            const gy = groundY + 24 + (i % 3) * 8;
            grassG.fillStyle(i % 2 === 0 ? 0x2d6a22 : 0x3a7828, 0.75);
            grassG.fillRect(gx, gy, 2.5, 10 + (i % 4) * 3);
            grassG.fillRect(gx + 5, gy + 2, 2, 8 + (i % 3) * 2);
        }

        // ── Clouds ──
        const cloudG = this.add.graphics();
        drawCloud(cloudG, 150, 55, 1.1);
        drawCloud(cloudG, 420, 32, 0.75);
        drawCloud(cloudG, 680, 65, 0.9);
        drawCloud(cloudG, 900, 40, 0.6);

        // ── Birds (V-shapes soaring near sun) ──
        const birdG = this.add.graphics();
        birdG.lineStyle(2, 0x1a3a6e, 0.65);
        [[640, 60], [672, 50], [696, 68], [720, 44], [740, 58]].forEach(([bx, by]) => {
            birdG.beginPath();
            birdG.moveTo((bx as number) - 9, by as number);
            birdG.lineTo(bx as number, (by as number) - 6);
            birdG.lineTo((bx as number) + 9, by as number);
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

        const sm = SoundManager.getInstance();
        const travelBtn = this.createMenuButton(GAME_WIDTH / 2, 345, '1.  Travel the Trail');
        travelBtn.on('pointerdown', () => { sm.init(); sm.playClick(); this.scene.start(SCENES.PARTY_CREATION); });

        const learnBtn = this.createMenuButton(GAME_WIDTH / 2, 395, '2.  About the Trail');
        learnBtn.on('pointerdown', () => { sm.init(); sm.playClick(); this.showTrailInfo(); });

        this.input.keyboard?.on('keydown-ONE', () => { sm.init(); sm.playClick(); this.scene.start(SCENES.PARTY_CREATION); });
        this.input.keyboard?.on('keydown-TWO', () => { sm.init(); sm.playClick(); this.showTrailInfo(); });

        // Mute button
        addMuteButton(this);

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

        // Walking animation frame
        this.walkTimer += dt;
        if (this.walkTimer > 280) {
            this.walkFrame = this.walkFrame === 0 ? 1 : 0;
            this.walkTimer = 0;
        }

        this.wagonG.clear();
        const wx = this.wagonX;
        const wy = groundY - 2;

        // Oxen pulling the wagon
        drawOx(this.wagonG, wx - 100, wy, 1.0);
        drawOx(this.wagonG, wx - 62, wy, 1.0);

        // Wagon
        drawWagon(this.wagonG, wx, wy, 1.0);

        // People walking alongside
        const wf = this.walkFrame;
        const wf1 = wf === 0 ? 1 : 0;
        drawPerson(this.wagonG, wx + 55,  wy + 2, 0.9, false, wf);   // man
        drawWoman(this.wagonG,  wx + 82,  wy + 2, 0.88, false, wf1); // woman
        drawPerson(this.wagonG, wx + 110, wy + 2, 0.85, false, wf);  // man
        drawChild(this.wagonG,  wx + 132, wy + 4, 0.75, wf1);        // child
        drawChild(this.wagonG,  wx + 150, wy + 4, 0.65, wf);         // smaller child
        // Pig trotting alongside
        drawPig(this.wagonG, wx - 130, wy + 4, 0.75);
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
            this.scene.restart();
        });
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
