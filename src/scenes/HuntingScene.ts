import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES,
    HUNTING_DURATION_MS, MAX_CARRY_FROM_HUNT,
} from '../utils/constants';
import { GameState } from '../game/GameState';

interface AnimalDef {
    type: string;
    food: number;       // lbs
    size: number;       // radius px
    speed: number;      // px/sec
    color: number;
    spawnWeight: number;
}

const ANIMALS: AnimalDef[] = [
    { type: 'Buffalo', food: 100, size: 24, speed: 90,  color: 0x5c3d1e, spawnWeight: 1 },
    { type: 'Deer',    food: 52,  size: 16, speed: 140, color: 0xa07040, spawnWeight: 3 },
    { type: 'Rabbit',  food: 5,   size: 9,  speed: 220, color: 0xb0a090, spawnWeight: 5 },
    { type: 'Squirrel',food: 2,   size: 6,  speed: 300, color: 0x8b7355, spawnWeight: 4 },
];

interface Animal {
    def: AnimalDef;
    circle: Phaser.GameObjects.Arc;
    label: Phaser.GameObjects.Text;
    vx: number;
    vy: number;
    alive: boolean;
}

export class HuntingScene extends Scene {
    private animals: Animal[] = [];
    private ammoLeft: number = 0;
    private foodHauled: number = 0;
    private timeLeft: number = 0;
    private gameOver: boolean = false;

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
        this.ammoLeft = Math.min(gs.supplies.ammo * 20, 99); // 20 shots per box
        this.foodHauled = 0;
        this.timeLeft = Math.floor(HUNTING_DURATION_MS / 1000);
        this.gameOver = false;
        this.animals = [];

        if (this.ammoLeft === 0) {
            // No ammo — immediately return
            this.showEndScreen('No ammunition! You returned empty-handed.', 0);
            return;
        }

        // Background
        this.cameras.main.setBackgroundColor(0x4a7a30);
        // Ground
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 30, GAME_WIDTH, 60, 0x3a6a20);
        // Trees / bushes (decorative)
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(20, GAME_WIDTH - 20);
            const y = Phaser.Math.Between(60, GAME_HEIGHT - 80);
            this.add.circle(x, y, Phaser.Math.Between(18, 36), 0x2d5e18, 0.7);
        }

        // HUD bar
        this.add.rectangle(GAME_WIDTH / 2, 24, GAME_WIDTH, 48, 0x000000, 0.7);
        this.add.text(10, 8, 'HUNTING', { ...TEXT_STYLES.HUD, fontSize: '16px', color: HEX_COLORS.GOLD });

        this.ammoText  = this.add.text(200, 8, '', { ...TEXT_STYLES.HUD, fontSize: '14px' });
        this.foodText  = this.add.text(430, 8, '', { ...TEXT_STYLES.HUD, fontSize: '14px', color: HEX_COLORS.GOLD });
        this.timerText = this.add.text(700, 8, '', { ...TEXT_STYLES.HUD, fontSize: '14px', color: HEX_COLORS.BLOOD_RED });

        this.add.text(870, 8, `Carry limit: ${MAX_CARRY_FROM_HUNT} lbs`, {
            ...TEXT_STYLES.HUD,
            fontSize: '12px',
            color: HEX_COLORS.TRAIL_BROWN,
        });

        this.msgText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '22px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5).setDepth(10);

        // Return early button
        const retBtn = this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 12, '[Return to camp]', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(5);
        retBtn.on('pointerover', () => retBtn.setColor(HEX_COLORS.GOLD));
        retBtn.on('pointerout', () => retBtn.setColor(HEX_COLORS.PARCHMENT));
        retBtn.on('pointerdown', () => this.endHunt());

        this.updateHUD();

        // Spawn animals periodically
        this.spawnTimer = this.time.addEvent({
            delay: 1800,
            callback: this.spawnAnimal,
            callbackScope: this,
            loop: true,
        });
        // Spawn some immediately
        for (let i = 0; i < 3; i++) this.spawnAnimal();

        // Countdown
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: this.onSecondTick,
            callbackScope: this,
            loop: true,
        });

        // Click to shoot
        this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
            if (!this.gameOver) this.shoot(ptr.x, ptr.y);
        });
    }

    // ─── Spawning ──────────────────────────────────────────────────────────────

    private spawnAnimal(): void {
        if (this.gameOver) return;

        // Weighted random pick
        const totalWeight = ANIMALS.reduce((s, a) => s + a.spawnWeight, 0);
        let r = Math.random() * totalWeight;
        let def = ANIMALS[0];
        for (const a of ANIMALS) {
            r -= a.spawnWeight;
            if (r <= 0) { def = a; break; }
        }

        const fromLeft = Math.random() < 0.5;
        const x = fromLeft ? -def.size : GAME_WIDTH + def.size;
        const y = Phaser.Math.Between(60, GAME_HEIGHT - 60);
        const speed = def.speed * (0.7 + Math.random() * 0.6);
        const vx = fromLeft ? speed : -speed;
        const vy = (Math.random() - 0.5) * speed * 0.3;

        const circle = this.add.arc(x, y, def.size, 0, 360, false, def.color)
            .setInteractive({ useHandCursor: true });
        const label = this.add.text(x, y - def.size - 4, def.type, {
            ...TEXT_STYLES.HUD,
            fontSize: '11px',
        }).setOrigin(0.5, 1);

        const animal: Animal = { def, circle, label, vx, vy, alive: true };
        this.animals.push(animal);

        circle.on('pointerover', () => { if (animal.alive) circle.setStrokeStyle(2, 0xffffff); });
        circle.on('pointerout',  () => { if (animal.alive) circle.setStrokeStyle(0); });
    }

    // ─── Shooting ─────────────────────────────────────────────────────────────

    private shoot(px: number, py: number): void {
        if (this.ammoLeft <= 0 || this.gameOver) return;
        this.ammoLeft--;

        // Check if any animal is hit (nearest within hit radius)
        let hit: Animal | null = null;
        let minDist = Infinity;
        for (const animal of this.animals) {
            if (!animal.alive) continue;
            const dx = animal.circle.x - px;
            const dy = animal.circle.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < animal.def.size + 12 && dist < minDist) {
                minDist = dist;
                hit = animal;
            }
        }

        if (hit) {
            this.killAnimal(hit);
        } else {
            // Miss flash
            const flash = this.add.circle(px, py, 6, 0xffff00, 0.8);
            this.time.delayedCall(120, () => flash.destroy());
        }

        this.updateHUD();
        if (this.ammoLeft <= 0) {
            this.time.delayedCall(600, () => this.endHunt());
        }
    }

    private killAnimal(animal: Animal): void {
        animal.alive = false;
        const added = Math.min(animal.def.food, MAX_CARRY_FROM_HUNT - this.foodHauled);
        this.foodHauled += added;

        // Death flash
        this.tweens.add({
            targets: animal.circle,
            alpha: 0,
            scaleX: 1.6,
            scaleY: 1.6,
            duration: 300,
            onComplete: () => { animal.circle.destroy(); animal.label.destroy(); },
        });

        this.showMsg(`+${added} lbs`);
        this.updateHUD();

        if (this.foodHauled >= MAX_CARRY_FROM_HUNT) {
            this.time.delayedCall(400, () => this.endHunt());
        }
    }

    // ─── Update loop ───────────────────────────────────────────────────────────

    update(_time: number, delta: number): void {
        if (this.gameOver) return;
        const dt = delta / 1000;

        this.animals = this.animals.filter(a => a.alive);
        for (const animal of this.animals) {
            animal.circle.x += animal.vx * dt;
            animal.circle.y += animal.vy * dt;
            animal.label.x = animal.circle.x;
            animal.label.y = animal.circle.y - animal.def.size - 4;

            // Bounce off vertical edges
            if (animal.circle.y < 55 || animal.circle.y > GAME_HEIGHT - 55) {
                animal.vy = -animal.vy;
            }

            // Despawn when off-screen horizontally
            if (animal.circle.x < -60 || animal.circle.x > GAME_WIDTH + 60) {
                animal.circle.destroy();
                animal.label.destroy();
                animal.alive = false;
            }
        }
    }

    // ─── Timer ─────────────────────────────────────────────────────────────────

    private onSecondTick(): void {
        this.timeLeft--;
        this.updateHUD();
        if (this.timeLeft <= 0) this.endHunt();
    }

    // ─── End ───────────────────────────────────────────────────────────────────

    private endHunt(): void {
        if (this.gameOver) return;
        this.gameOver = true;
        this.spawnTimer.remove();
        this.countdownTimer.remove();

        const msg = this.foodHauled > 0
            ? `You return with ${this.foodHauled} lbs of meat.`
            : 'You return empty-handed.';
        this.showEndScreen(msg, this.foodHauled);
    }

    private showEndScreen(msg: string, food: number): void {
        const gs = GameState.getInstance();
        gs.supplies.food += food;

        // Deduct ammo used
        const boxesUsed = Math.ceil((GameState.getInstance().supplies.ammo * 20 - this.ammoLeft) / 20);
        gs.supplies.ammo = Math.max(0, gs.supplies.ammo - boxesUsed);

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 500, 180, 0x000000, 0.88);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, msg, {
            ...TEXT_STYLES.BODY,
            fontSize: '18px',
            color: HEX_COLORS.PARCHMENT,
            wordWrap: { width: 460 },
            align: 'center',
        }).setOrigin(0.5);

        const doneBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, '[ Return to Trail ]', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.GOLD,
            fontSize: '20px',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        doneBtn.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume(SCENES.TRAVEL);
        });
    }

    private updateHUD(): void {
        this.ammoText.setText(`Ammo: ${this.ammoLeft} shots`);
        this.foodText.setText(`Hauled: ${this.foodHauled} / ${MAX_CARRY_FROM_HUNT} lbs`);
        this.timerText.setText(`Time: ${this.timeLeft}s`);
    }

    private showMsg(text: string): void {
        this.msgText.setText(text);
        this.time.delayedCall(700, () => this.msgText.setText(''));
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
        this.input.off('pointerdown');
    }
}
