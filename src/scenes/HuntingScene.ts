import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES,
    HUNTING_DURATION_MS, MAX_CARRY_FROM_HUNT,
} from '../utils/constants';
import { GameState } from '../game/GameState';
import { drawBuffalo, drawDeer, drawRabbit, drawSquirrel, drawTree, drawMountain, drawHill, drawCloud } from '../ui/DrawUtils';
import { drawIsoTree } from '../ui/IsoDrawUtils';
import { TILE_WIDTH, TILE_HEIGHT, drawIsoTile } from '../utils/isometric';
import { addMuteButton } from '../ui/MuteButton';
import { SoundManager } from '../audio/SoundManager';

interface AnimalDef {
    type: string;
    food: number;
    scale: number;
    speed: number;
    spawnWeight: number;
    hitRadius: number;
}

const ANIMALS: AnimalDef[] = [
    { type: 'Buffalo', food: 100, scale: 1.0,  speed: 80,  spawnWeight: 1, hitRadius: 28 },
    { type: 'Deer',    food: 52,  scale: 0.85, speed: 130, spawnWeight: 3, hitRadius: 20 },
    { type: 'Rabbit',  food: 5,   scale: 0.75, speed: 210, spawnWeight: 5, hitRadius: 12 },
    { type: 'Squirrel',food: 2,   scale: 0.65, speed: 290, spawnWeight: 4, hitRadius: 8  },
];

interface Animal {
    def: AnimalDef;
    g: Phaser.GameObjects.Graphics;
    x: number;
    y: number;
    vx: number;
    vy: number;
    alive: boolean;
    flipped: boolean;
}

export class HuntingScene extends Scene {
    private animals: Animal[] = [];
    private ammoLeft: number = 0;
    private foodHauled: number = 0;
    private timeLeft: number = 0;
    private gameOver: boolean = false;
    private crosshair!: Phaser.GameObjects.Graphics;

    private ammoText!: Phaser.GameObjects.Text;
    private foodText!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private msgText!: Phaser.GameObjects.Text;
    private spawnTimer!: Phaser.Time.TimerEvent;
    private countdownTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super(SCENES.HUNTING);
    }

    create(): void {
        const gs = GameState.getInstance();
        this.ammoLeft = Math.min(gs.supplies.ammo * 20, 99);
        this.foodHauled = 0;
        this.timeLeft = Math.floor(HUNTING_DURATION_MS / 1000);
        this.gameOver = false;
        this.animals = [];

        if (this.ammoLeft === 0) {
            this.showEndScreen('No ammunition! You returned empty-handed.', 0);
            return;
        }

        this.buildBackground();
        this.buildHUD();

        // Start hunting ambience
        SoundManager.getInstance().startHuntingAmbience();

        // Hide default cursor, show crosshair
        this.input.setDefaultCursor('none');
        this.crosshair = this.add.graphics().setDepth(20);

        // Return early button
        const retBtn = this.add.text(GAME_WIDTH - 12, GAME_HEIGHT - 14, '[ Return to Camp ]', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '14px',
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(12);
        retBtn.on('pointerover', () => retBtn.setColor(HEX_COLORS.GOLD));
        retBtn.on('pointerout', () => retBtn.setColor(HEX_COLORS.PARCHMENT));
        retBtn.on('pointerdown', () => this.endHunt());

        this.spawnTimer = this.time.addEvent({
            delay: 1600,
            callback: this.spawnAnimal,
            callbackScope: this,
            loop: true,
        });
        for (let i = 0; i < 4; i++) this.spawnAnimal();

        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.updateHUD();
                if (this.timeLeft <= 0) this.endHunt();
            },
            loop: true,
        });

        this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => this.drawCrosshair(ptr.x, ptr.y));
        this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
            if (!this.gameOver) this.shoot(ptr.x, ptr.y);
        });

        addMuteButton(this);
    }

    private buildBackground(): void {
        // Prairie/forest sky
        this.cameras.main.setBackgroundColor(0x1a5a90);
        for (let i = 0; i < 10; i++) {
            const t = i / 9;
            const r = Math.round(0x1a + t * (0x68 - 0x1a));
            const gv = Math.round(0x5a + t * (0xaa - 0x5a));
            const b = Math.round(0x90 + t * (0xcc - 0x90));
            this.add.rectangle(GAME_WIDTH / 2, 30 + i * 50, GAME_WIDTH, 52, (r << 16) | (gv << 8) | b);
        }
        // Horizon warmth
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 180, GAME_WIDTH, 30, 0xd8c080, 0.15);

        // Distant mountains
        const mtnG = this.add.graphics();
        drawMountain(mtnG, 200, GAME_HEIGHT - 200, 220, 170, 0x4a6888, true);
        drawMountain(mtnG, 500, GAME_HEIGHT - 200, 280, 200, 0x3d5878, true);
        drawMountain(mtnG, 800, GAME_HEIGHT - 200, 240, 180, 0x4a6888, true);

        // Clouds
        const cloudG = this.add.graphics();
        drawCloud(cloudG, 180, 55, 0.7, 0.7);
        drawCloud(cloudG, 600, 38, 0.55, 0.6);

        // Mid hills
        const hillG = this.add.graphics();
        drawHill(hillG, 100,  GAME_HEIGHT - 140, 260, 0x2d6428);
        drawHill(hillG, 400,  GAME_HEIGHT - 140, 300, 0x337030);
        drawHill(hillG, 700,  GAME_HEIGHT - 140, 280, 0x2d6428);
        drawHill(hillG, 980,  GAME_HEIGHT - 140, 260, 0x337030);

        // Isometric ground tiles
        const isoG = this.add.graphics();
        const cols = 18, rows = 6;
        const groundBaseY = GAME_HEIGHT - 100;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const sx = GAME_WIDTH / 2 + (col - row) * (TILE_WIDTH / 2) - (cols * TILE_WIDTH / 4);
                const sy = groundBaseY + (col + row) * (TILE_HEIGHT / 2) - rows * TILE_HEIGHT / 2;
                const gc = [0x2d5c18, 0x2a5414, 0x306020, 0x2d5818][(col * 3 + row * 7) % 4];
                drawIsoTile(isoG, sx, sy, gc);
            }
        }

        // Isometric trees scattered around the hunting ground
        const treeG = this.add.graphics();
        const isoTreeData = [
            [80, GAME_HEIGHT - 160, 75, false], [160, GAME_HEIGHT - 140, 90, false],
            [300, GAME_HEIGHT - 150, 70, true], [450, GAME_HEIGHT - 135, 80, false],
            [600, GAME_HEIGHT - 155, 85, true], [740, GAME_HEIGHT - 140, 75, false],
            [880, GAME_HEIGHT - 150, 90, false], [960, GAME_HEIGHT - 135, 70, true],
        ];
        isoTreeData.forEach(([tx, ty, th, pine]) => {
            drawIsoTree(treeG, tx as number, ty as number, th as number,
                pine ? 0x234d1a : 0x2a5820, pine as unknown as boolean);
        });

        // Isometric bushes
        const bushG = this.add.graphics();
        for (let i = 0; i < 14; i++) {
            const bx = 50 + i * 70;
            const by = GAME_HEIGHT - 70 + (i % 3) * 10;
            bushG.fillStyle(i % 2 === 0 ? 0x2d6a18 : 0x347a20, 0.8);
            // Iso-style bush: diamond shape
            bushG.fillPoints([
                { x: bx, y: by - 8 },
                { x: bx + 18, y: by },
                { x: bx, y: by + 6 },
                { x: bx - 18, y: by },
            ], true);
            bushG.fillStyle(0x3d8a28, 0.5);
            bushG.fillPoints([
                { x: bx - 2, y: by - 6 },
                { x: bx + 10, y: by - 1 },
                { x: bx - 2, y: by + 4 },
                { x: bx - 12, y: by - 1 },
            ], true);
        }
    }

    private buildHUD(): void {
        // HUD bar
        this.add.rectangle(GAME_WIDTH / 2, 24, GAME_WIDTH, 48, 0x000000, 0.75).setDepth(10);

        this.add.text(12, 8, '🦌  HUNTING', {
            ...TEXT_STYLES.HUD,
            fontSize: '15px',
            color: HEX_COLORS.GOLD,
        }).setDepth(11);

        this.ammoText  = this.add.text(210, 8, '', { ...TEXT_STYLES.HUD, fontSize: '13px' }).setDepth(11);
        this.foodText  = this.add.text(420, 8, '', { ...TEXT_STYLES.HUD, fontSize: '13px', color: HEX_COLORS.GOLD }).setDepth(11);
        this.timerText = this.add.text(680, 8, '', { ...TEXT_STYLES.HUD, fontSize: '13px', color: HEX_COLORS.BLOOD_RED }).setDepth(11);
        this.add.text(850, 8, `Carry limit: ${MAX_CARRY_FROM_HUNT} lbs`, {
            ...TEXT_STYLES.HUD, fontSize: '12px', color: HEX_COLORS.TRAIL_BROWN,
        }).setDepth(11);

        this.msgText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '28px',
            color: HEX_COLORS.GOLD,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 6, fill: true },
        }).setOrigin(0.5).setDepth(15);

        this.updateHUD();
    }

    private drawCrosshair(x: number, y: number): void {
        this.crosshair.clear();
        const r = 22;
        const gap = 5; // gap around center dot

        // Outer ring — scope rim
        this.crosshair.lineStyle(3, 0x000000, 0.5);
        this.crosshair.strokeCircle(x, y, r + 2);
        this.crosshair.lineStyle(2, 0xffffff, 0.85);
        this.crosshair.strokeCircle(x, y, r);

        // Crosshairs with center gap
        this.crosshair.lineStyle(1.5, 0xffffff, 0.8);
        // Horizontal
        this.crosshair.beginPath();
        this.crosshair.moveTo(x - r - 8, y);
        this.crosshair.lineTo(x - gap, y);
        this.crosshair.strokePath();
        this.crosshair.beginPath();
        this.crosshair.moveTo(x + gap, y);
        this.crosshair.lineTo(x + r + 8, y);
        this.crosshair.strokePath();
        // Vertical
        this.crosshair.beginPath();
        this.crosshair.moveTo(x, y - r - 8);
        this.crosshair.lineTo(x, y - gap);
        this.crosshair.strokePath();
        this.crosshair.beginPath();
        this.crosshair.moveTo(x, y + gap);
        this.crosshair.lineTo(x, y + r + 8);
        this.crosshair.strokePath();

        // Mil-dot marks on crosshairs
        this.crosshair.fillStyle(0xffffff, 0.7);
        [-14, -10, 10, 14].forEach(d => {
            this.crosshair.fillCircle(x + d, y, 1.2);
            this.crosshair.fillCircle(x, y + d, 1.2);
        });

        // Center red dot
        this.crosshair.fillStyle(0xff2222, 0.95);
        this.crosshair.fillCircle(x, y, 2.5);
    }

    private spawnAnimal(): void {
        if (this.gameOver) return;
        const totalWeight = ANIMALS.reduce((s, a) => s + a.spawnWeight, 0);
        let r = Math.random() * totalWeight;
        let def = ANIMALS[0];
        for (const a of ANIMALS) { r -= a.spawnWeight; if (r <= 0) { def = a; break; } }

        // Spawn from edges — animals move along iso-ish diagonals
        const speed = def.speed * (0.7 + Math.random() * 0.6);
        const spawnSide = Math.floor(Math.random() * 4); // 0=left, 1=right, 2=top, 3=bottom
        let x: number, y: number, vx: number, vy: number;
        if (spawnSide === 0) {
            // From left, move right and slightly down (iso diagonal)
            x = -50; y = Phaser.Math.Between(80, GAME_HEIGHT - 120);
            vx = speed; vy = speed * 0.3;
        } else if (spawnSide === 1) {
            // From right, move left and slightly up
            x = GAME_WIDTH + 50; y = Phaser.Math.Between(80, GAME_HEIGHT - 120);
            vx = -speed; vy = -speed * 0.3;
        } else if (spawnSide === 2) {
            // From top-right, move down-left (iso diagonal)
            x = Phaser.Math.Between(GAME_WIDTH / 2, GAME_WIDTH + 50);
            y = -30;
            vx = -speed * 0.6; vy = speed * 0.8;
        } else {
            // From bottom-left, move up-right (iso diagonal)
            x = Phaser.Math.Between(-50, GAME_WIDTH / 2);
            y = GAME_HEIGHT + 30;
            vx = speed * 0.6; vy = -speed * 0.8;
        }
        const flipped = vx < 0;

        const g = this.add.graphics().setDepth(5);
        this.drawAnimal(g, def.type, 0, 0, def.scale, flipped);

        const animal: Animal = { def, g, x, y, vx, vy, alive: true, flipped };
        this.animals.push(animal);
        g.x = x;
        g.y = y;

        // Hover highlight
        g.setInteractive(new Phaser.Geom.Circle(0, 0, def.hitRadius + 8), Phaser.Geom.Circle.Contains);
        g.on('pointerover', () => {
            if (animal.alive) {
                this.crosshair.setAlpha(0.5);
                g.setAlpha(0.8);
            }
        });
        g.on('pointerout', () => { g.setAlpha(1); this.crosshair.setAlpha(1); });
    }

    private drawAnimal(g: Phaser.GameObjects.Graphics, type: string, x: number, y: number, s: number, flipped: boolean): void {
        g.clear();
        switch (type) {
            case 'Buffalo':  drawBuffalo(g, x, y, s, flipped); break;
            case 'Deer':     drawDeer(g, x, y, s, flipped); break;
            case 'Rabbit':   drawRabbit(g, x, y, s, flipped); break;
            case 'Squirrel': drawSquirrel(g, x, y, s, flipped); break;
        }
    }

    private shoot(px: number, py: number): void {
        if (this.ammoLeft <= 0 || this.gameOver) return;
        this.ammoLeft--;
        SoundManager.getInstance().playGunshot();

        // Muzzle flash
        const flash = this.add.graphics().setDepth(18);
        flash.fillStyle(0xffee44, 0.9);
        flash.fillCircle(px, py, 10);
        this.time.delayedCall(80, () => flash.destroy());

        let hit: Animal | null = null;
        let minDist = Infinity;
        for (const a of this.animals) {
            if (!a.alive) continue;
            const dx = a.x - px, dy = a.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < a.def.hitRadius + 14 && dist < minDist) {
                minDist = dist; hit = a;
            }
        }

        if (hit) this.killAnimal(hit);

        this.updateHUD();
        if (this.ammoLeft <= 0) this.time.delayedCall(500, () => this.endHunt());
    }

    private killAnimal(animal: Animal): void {
        animal.alive = false;
        const added = Math.min(animal.def.food, MAX_CARRY_FROM_HUNT - this.foodHauled);
        this.foodHauled += added;

        // Death animation — spin and fade
        this.tweens.add({
            targets: animal.g,
            alpha: 0,
            angle: 180,
            scaleX: 1.4,
            scaleY: 1.4,
            duration: 350,
            ease: 'Power2',
            onComplete: () => animal.g.destroy(),
        });

        // Floating +N text
        const popup = this.add.text(animal.x, animal.y - 20, `+${added} lbs`, {
            ...TEXT_STYLES.HUD,
            fontSize: '18px',
            color: HEX_COLORS.GOLD,
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 4, fill: true },
        }).setOrigin(0.5).setDepth(16);
        this.tweens.add({
            targets: popup,
            y: animal.y - 60,
            alpha: 0,
            duration: 900,
            onComplete: () => popup.destroy(),
        });

        this.updateHUD();
        if (this.foodHauled >= MAX_CARRY_FROM_HUNT) {
            this.time.delayedCall(400, () => this.endHunt());
        }
    }

    update(_time: number, delta: number): void {
        if (this.gameOver) return;
        const dt = delta / 1000;

        for (const animal of this.animals) {
            if (!animal.alive) continue;
            animal.x += animal.vx * dt;
            animal.y += animal.vy * dt;
            animal.g.x = animal.x;
            animal.g.y = animal.y;

            if (animal.y < 55 || animal.y > GAME_HEIGHT - 55) animal.vy = -animal.vy;
            if (animal.x < -80 || animal.x > GAME_WIDTH + 80) {
                animal.g.destroy();
                animal.alive = false;
            }
        }
        this.animals = this.animals.filter(a => a.alive);
    }

    private endHunt(): void {
        if (this.gameOver) return;
        this.gameOver = true;
        this.spawnTimer?.remove();
        this.countdownTimer?.remove();
        this.input.setDefaultCursor('default');

        const msg = this.foodHauled > 0
            ? `You return with ${this.foodHauled} lbs of meat!`
            : 'You return empty-handed.';
        this.showEndScreen(msg, this.foodHauled);
    }

    private showEndScreen(msg: string, food: number): void {
        const gs = GameState.getInstance();
        gs.supplies.food += food;
        const shotsUsed = (gs.supplies.ammo * 20) - this.ammoLeft;
        gs.supplies.ammo = Math.max(0, gs.supplies.ammo - Math.ceil(shotsUsed / 20));

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 520, 200, 0x1a1208, 0.94).setDepth(20);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 516, 196, COLORS.TRAIL_BROWN, 0.0)
            .setStrokeStyle(2, COLORS.TRAIL_BROWN).setDepth(20);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, msg, {
            ...TEXT_STYLES.BODY,
            fontSize: '20px',
            color: HEX_COLORS.PARCHMENT,
            wordWrap: { width: 480 },
            align: 'center',
        }).setOrigin(0.5).setDepth(21);

        const btn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, '[ Return to Trail ]', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.GOLD,
            fontSize: '22px',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(21);
        btn.on('pointerover', () => btn.setColor(HEX_COLORS.PARCHMENT));
        btn.on('pointerout', () => btn.setColor(HEX_COLORS.GOLD));
        btn.on('pointerdown', () => {
            this.input.setDefaultCursor('default');
            // Resume travel BEFORE stopping this scene — stopping invalidates scene manager refs
            this.scene.resume(SCENES.TRAVEL);
            this.scene.stop();
        });
    }

    private updateHUD(): void {
        this.ammoText?.setText(`🔫  ${this.ammoLeft} shots left`);
        this.foodText?.setText(`🥩  ${this.foodHauled} / ${MAX_CARRY_FROM_HUNT} lbs hauled`);
        this.timerText?.setText(`⏱  ${this.timeLeft}s`);
    }

    shutdown(): void {
        SoundManager.getInstance().stopTrailMusic(); // stops hunting ambience (same mechanism)
        this.input.keyboard?.removeAllListeners();
        this.input.off('pointerdown');
        this.input.off('pointermove');
        this.input.setDefaultCursor('default');
    }
}
