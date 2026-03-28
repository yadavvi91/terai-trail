/**
 * WP14 — Foraging Scene: Jungle food gathering with predator encounters.
 * Replaces HuntingScene.
 */
import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS,
    MAX_CARRY_FROM_FORAGE, FORAGING_DURATION_MS,
} from '../utils/constants';
import { GameState } from '../game/GameState';
import {
    drawSalTree, drawElephantGrass,
    drawWildBoar, drawPeacock, drawTiger,
    drawIsoSikhPerson,
} from '../ui/TeraDrawUtils';

interface ForageTarget {
    type: 'boar' | 'deer' | 'peacock' | 'fish';
    x: number;
    y: number;
    speed: number;
    food: number;
    alive: boolean;
}

export class ForagingScene extends Scene {
    private targets: ForageTarget[] = [];
    private foodCollected: number = 0;
    private timeRemaining: number = FORAGING_DURATION_MS;
    private timerText!: Phaser.GameObjects.Text;
    private foodText!: Phaser.GameObjects.Text;
    private sceneG!: Phaser.GameObjects.Graphics;
    private animalG!: Phaser.GameObjects.Graphics;
    private dangerActive: boolean = false;

    constructor() {
        super(SCENES.FORAGING);
    }

    create(): void {
        this.foodCollected = 0;
        this.timeRemaining = FORAGING_DURATION_MS;
        this.targets = [];
        this.dangerActive = false;

        // Background — jungle clearing
        this.cameras.main.setBackgroundColor(COLORS.JUNGLE_DARK);
        this.sceneG = this.add.graphics();

        // Ground
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH, 120, COLORS.CLEARED_DIRT);

        // Forest border
        for (let i = 0; i < 15; i++) {
            drawSalTree(this.sceneG, i * 70 + 20, GAME_HEIGHT - 120, 0.5);
        }
        for (let i = 0; i < 10; i++) {
            drawElephantGrass(this.sceneG, i * 110 + 30, GAME_HEIGHT - 110, 0.4);
        }

        // River section (right side)
        this.add.rectangle(GAME_WIDTH - 80, GAME_HEIGHT - 80, 120, 80, COLORS.RIVER_BLUE, 0.6);
        this.add.text(GAME_WIDTH - 80, GAME_HEIGHT - 100, 'River', {
            ...TEXT_STYLES.HUD, fontSize: '11px',
        }).setOrigin(0.5);

        // Forager figure
        drawIsoSikhPerson(this.sceneG, 100, GAME_HEIGHT - 140, 0.8, { type: 'man' });

        // Animal graphics layer
        this.animalG = this.add.graphics();

        // HUD
        this.timerText = this.add.text(GAME_WIDTH / 2, 20, '', { ...TEXT_STYLES.SUBTITLE }).setOrigin(0.5);
        this.foodText = this.add.text(GAME_WIDTH / 2, 50, '', { ...TEXT_STYLES.HUD, fontSize: '16px' }).setOrigin(0.5);

        // Return button
        const returnBtn = this.add.text(GAME_WIDTH - 80, 20, 'Return', {
            ...TEXT_STYLES.HUD,
            fontSize: '14px',
            backgroundColor: '#4a3728',
            padding: { x: 10, y: 4 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        returnBtn.on('pointerdown', () => this.returnToSettlement());

        // Spawn initial animals
        this.spawnAnimal('boar');
        this.spawnAnimal('peacock');
        this.spawnAnimal('deer');

        // Click handler
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.checkAnimalClick(pointer.x, pointer.y);

            // Fish from river
            if (pointer.x > GAME_WIDTH - 140 && pointer.y > GAME_HEIGHT - 120) {
                this.collectFood(8, 'Caught fish!');
            }
        });
    }

    private spawnAnimal(type: ForageTarget['type']): void {
        const food = type === 'boar' ? 100 : type === 'deer' ? 50 : type === 'peacock' ? 10 : 8;
        const speed = type === 'boar' ? 0.3 : type === 'deer' ? 0.8 : type === 'peacock' ? 1.2 : 0;
        this.targets.push({
            type,
            x: GAME_WIDTH + 50,
            y: GAME_HEIGHT - 160 + Math.random() * 60,
            speed,
            food,
            alive: true,
        });
    }

    private checkAnimalClick(px: number, py: number): void {
        for (const t of this.targets) {
            if (!t.alive) continue;
            const dx = px - t.x, dy = py - t.y;
            if (dx * dx + dy * dy < 900) { // 30px radius
                t.alive = false;
                this.collectFood(t.food, `Caught ${t.type}! +${t.food} lbs`);
                // Respawn a new animal after delay
                this.time.delayedCall(3000, () => {
                    const types: ForageTarget['type'][] = ['boar', 'deer', 'peacock'];
                    this.spawnAnimal(types[Math.floor(Math.random() * types.length)]);
                });
                return;
            }
        }
    }

    private collectFood(amount: number, message: string): void {
        const canCarry = MAX_CARRY_FROM_FORAGE - this.foodCollected;
        const collected = Math.min(amount, canCarry);
        this.foodCollected += collected;

        // Flash message
        const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
            ...TEXT_STYLES.SUBTITLE,
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5);
        this.tweens.add({ targets: msg, alpha: 0, y: GAME_HEIGHT / 2 - 40, duration: 1500, onComplete: () => msg.destroy() });
    }

    update(_time: number, delta: number): void {
        this.timeRemaining -= delta;

        if (this.timeRemaining <= 0) {
            this.returnToSettlement();
            return;
        }

        // Update timer display
        const secs = Math.ceil(this.timeRemaining / 1000);
        this.timerText.setText(`Time: ${secs}s`);
        this.foodText.setText(`Food: ${this.foodCollected} / ${MAX_CARRY_FROM_FORAGE} lbs`);

        // Move animals
        this.animalG.clear();
        this.targets.forEach(t => {
            if (!t.alive) return;
            t.x -= t.speed * delta * 0.05;
            if (t.x < -50) t.x = GAME_WIDTH + 50;

            if (t.type === 'boar') drawWildBoar(this.animalG, t.x, t.y, 0.6);
            else if (t.type === 'peacock') drawPeacock(this.animalG, t.x, t.y, 0.5);
            // deer uses a simplified ellipse
            else if (t.type === 'deer') {
                this.animalG.fillStyle(0x8a6a40);
                this.animalG.fillEllipse(t.x, t.y - 6, 20, 12);
                this.animalG.fillStyle(0x6a5030);
                this.animalG.fillEllipse(t.x + 10, t.y - 10, 8, 8);
            }
        });

        // Tiger danger — 5% chance after half time
        if (!this.dangerActive && this.timeRemaining < FORAGING_DURATION_MS * 0.5 && Math.random() < 0.001) {
            this.triggerTigerDanger();
        }
    }

    private triggerTigerDanger(): void {
        this.dangerActive = true;

        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 600, 200, 0x000000, 0.85).setInteractive();
        const tigerG = this.add.graphics();
        drawTiger(tigerG, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 1.2);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'A tiger appears! What do you do?', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.BLOOD_RED,
        }).setOrigin(0.5);

        const fleeBtn = this.add.text(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 80, 'Flee (safe)', {
            ...TEXT_STYLES.HUD, backgroundColor: '#4a3728', padding: { x: 10, y: 4 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const fightBtn = this.add.text(GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 80, 'Fight (risky)', {
            ...TEXT_STYLES.HUD, backgroundColor: '#cc3333', padding: { x: 10, y: 4 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        fleeBtn.on('pointerdown', () => this.returnToSettlement());
        fightBtn.on('pointerdown', () => {
            const gs = GameState.getInstance();
            if (Math.random() < 0.4) {
                // Tiger driven off, bonus food
                this.collectFood(20, 'Tiger driven away!');
            } else {
                // Injured
                const alive = gs.family.filter(m => m.status !== 'Dead');
                if (alive.length > 0) {
                    const target = alive[Math.floor(Math.random() * alive.length)];
                    target.health = Math.max(0, target.health - 30);
                    if (target.health <= 0) target.status = 'Dead' as any;
                }
            }
            bg.destroy(); tigerG.destroy();
            this.dangerActive = false;
        });
    }

    private returnToSettlement(): void {
        const gs = GameState.getInstance();
        gs.supplies.food += this.foodCollected;
        this.scene.start(SCENES.SETTLEMENT);
    }

    shutdown(): void {
        this.input.removeAllListeners();
    }
}
