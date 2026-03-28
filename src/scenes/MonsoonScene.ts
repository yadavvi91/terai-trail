/**
 * WP15 — Monsoon Scene: Survival challenge during monsoon season.
 * Replaces RiverCrossingScene.
 */
import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS } from '../utils/constants';
import { MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';
import { TeraiSoundManager } from '../audio/TeraiSoundManager';

export class MonsoonScene extends Scene {
    private rainParticles: { x: number; y: number; speed: number }[] = [];
    private rainG!: Phaser.GameObjects.Graphics;

    constructor() {
        super(SCENES.MONSOON);
    }

    create(): void {
        const gs = GameState.getInstance();
        TeraiSoundManager.getInstance().playMonsoonThunder();

        // Dark stormy sky
        this.cameras.main.setBackgroundColor(0x1a2030);

        // Ground (muddy)
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH, 120, 0x3a3020);

        // Water level (rising)
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 30, GAME_WIDTH, 40, COLORS.MONSOON_GREY, 0.6);

        // Rain
        this.rainG = this.add.graphics();
        this.rainParticles = [];
        for (let i = 0; i < 150; i++) {
            this.rainParticles.push({
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                speed: 3 + Math.random() * 3,
            });
        }

        // Lightning flash
        this.time.addEvent({
            delay: 4000 + Math.random() * 3000,
            callback: () => {
                this.cameras.main.flash(100, 255, 255, 255);
            },
            loop: true,
        });

        // Title
        this.add.text(GAME_WIDTH / 2, 60, 'MONSOON FLOOD!', {
            ...TEXT_STYLES.TITLE,
            fontSize: '40px',
            color: HEX_COLORS.WHITE,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 110, 'Heavy rains are flooding the settlement. What will you do?', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            wordWrap: { width: 600 },
            align: 'center',
        }).setOrigin(0.5);

        // Choice buttons
        const choices = [
            {
                text: 'Reinforce Shelter',
                desc: `Uses ${Math.min(2, gs.supplies.shelterMaterials)} shelter materials. Low risk.`,
                action: () => this.reinforce(gs),
            },
            {
                text: 'Move to High Ground',
                desc: 'Lose 2 days of work. Family stays safe.',
                action: () => this.highGround(gs),
            },
            {
                text: 'Wait It Out',
                desc: 'No cost. High risk of damage.',
                action: () => this.waitItOut(gs),
            },
        ];

        choices.forEach((choice, i) => {
            const y = 220 + i * 100;

            const btn = this.add.rectangle(GAME_WIDTH / 2, y, 500, 70, COLORS.DARK_BROWN)
                .setStrokeStyle(2, COLORS.PARCHMENT)
                .setInteractive({ useHandCursor: true });

            this.add.text(GAME_WIDTH / 2, y - 12, choice.text, {
                ...TEXT_STYLES.BODY,
                fontSize: '18px',
                color: HEX_COLORS.GOLD,
            }).setOrigin(0.5);

            this.add.text(GAME_WIDTH / 2, y + 14, choice.desc, {
                ...TEXT_STYLES.HUD,
                fontSize: '12px',
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                choice.action();
            });
        });
    }

    update(_time: number, delta: number): void {
        // Animate rain
        this.rainG.clear();
        this.rainG.lineStyle(1, 0x8888cc, 0.5);
        this.rainParticles.forEach(p => {
            p.y += p.speed * delta * 0.1;
            p.x -= delta * 0.02; // wind
            if (p.y > GAME_HEIGHT) { p.y = -10; p.x = Math.random() * GAME_WIDTH; }
            this.rainG.beginPath();
            this.rainG.moveTo(p.x, p.y);
            this.rainG.lineTo(p.x + 2, p.y + 8);
            this.rainG.strokePath();
        });
    }

    private reinforce(gs: GameState): void {
        const materialsUsed = Math.min(2, gs.supplies.shelterMaterials);
        gs.supplies.shelterMaterials -= materialsUsed;
        gs.advanceDay();

        // Minor health impact
        gs.family.forEach(m => {
            if (m.status !== MemberStatus.DEAD) {
                m.health = Math.max(0, m.health - 3);
            }
        });

        this.showResult('You reinforced the shelter. Minor dampness, but everyone is safe.', gs);
    }

    private highGround(gs: GameState): void {
        gs.advanceDay();
        gs.advanceDay();
        this.showResult('You moved to high ground. Two days lost, but the family is unharmed.', gs);
    }

    private waitItOut(gs: GameState): void {
        gs.advanceDay();
        if (Math.random() < 0.5) {
            // Lucky — survived fine
            this.showResult('The rain eased. Your shelter held. A close call.', gs);
        } else {
            // Damage
            gs.supplies.food = Math.max(0, gs.supplies.food - 30);
            gs.supplies.shelterMaterials = Math.max(0, gs.supplies.shelterMaterials - 2);
            gs.family.forEach(m => {
                if (m.status !== MemberStatus.DEAD) {
                    m.health = Math.max(0, m.health - 15);
                    if (m.health <= 0) { m.status = MemberStatus.DEAD; m.health = 0; }
                }
            });
            this.showResult('The flood damaged your shelter and swept away supplies. Some family members fell ill.', gs);
        }
    }

    private showResult(message: string, _gs: GameState): void {
        // Clear choices
        this.children.removeAll(true);

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 600, 200, 0x000000, 0.9);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, message, {
            ...TEXT_STYLES.BODY,
            wordWrap: { width: 500 },
            align: 'center',
        }).setOrigin(0.5);

        const continueBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Continue', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        continueBtn.on('pointerdown', () => this.scene.start(SCENES.SETTLEMENT));
    }

    shutdown(): void {
        this.input.removeAllListeners();
    }
}
