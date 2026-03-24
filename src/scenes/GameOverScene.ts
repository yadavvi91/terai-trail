import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES,
    TOTAL_TRAIL_MILES, PROFESSION_DATA,
} from '../utils/constants';
import { MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';

export class GameOverScene extends Scene {
    constructor() {
        super(SCENES.GAME_OVER);
    }

    create(): void {
        const gs = GameState.getInstance();
        const victory = gs.milesTraveled >= TOTAL_TRAIL_MILES;

        if (victory) {
            this.buildVictoryScreen(gs);
        } else {
            this.buildDeathScreen(gs);
        }
    }

    // ─── Victory ───────────────────────────────────────────────────────────────

    private buildVictoryScreen(gs: GameState): void {
        // Green sky
        this.cameras.main.setBackgroundColor(0x3a9a60);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH, 120, COLORS.GRASS_GREEN);

        // Stars / rays
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, GAME_WIDTH);
            const y = Phaser.Math.Between(0, GAME_HEIGHT - 120);
            this.add.star(x, y, 4, 3, Phaser.Math.Between(6, 14), COLORS.GOLD, 0.6);
        }

        this.add.text(GAME_WIDTH / 2, 80, '🎉 YOU MADE IT! 🎉', {
            ...TEXT_STYLES.TITLE,
            fontSize: '48px',
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 148, "You have reached the Willamette Valley!", {
            ...TEXT_STYLES.SUBTITLE,
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        // Score
        const score = this.calcScore(gs);
        const panel = this.add.rectangle(GAME_WIDTH / 2, 320, 640, 240, COLORS.DARK_BROWN, 0.9);
        panel.setStrokeStyle(3, COLORS.GOLD);

        this.add.text(GAME_WIDTH / 2, 220, 'Final Score', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '22px',
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5);

        const entries = score.breakdown;
        let y = 254;
        entries.forEach(([label, value]) => {
            this.add.text(GAME_WIDTH / 2 - 200, y, label, {
                ...TEXT_STYLES.HUD,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '15px',
            });
            this.add.text(GAME_WIDTH / 2 + 200, y, String(value), {
                ...TEXT_STYLES.HUD,
                color: HEX_COLORS.GOLD,
                fontSize: '15px',
            }).setOrigin(1, 0);
            y += 24;
        });

        this.add.rectangle(GAME_WIDTH / 2, y + 8, 400, 2, COLORS.TRAIL_BROWN);
        this.add.text(GAME_WIDTH / 2 - 200, y + 20, 'TOTAL SCORE', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '18px',
        });
        this.add.text(GAME_WIDTH / 2 + 200, y + 20, String(score.total), {
            ...TEXT_STYLES.SUBTITLE,
            color: HEX_COLORS.GOLD,
            fontSize: '24px',
        }).setOrigin(1, 0);

        // Survivors
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD);
        this.add.text(GAME_WIDTH / 2, y + 60, `Survivors: ${alive.map(m => m.name).join(', ')}`, {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '15px',
        }).setOrigin(0.5);

        this.buildPlayAgainBtn(y + 100);
    }

    private calcScore(gs: GameState): { total: number; breakdown: [string, number][] } {
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD).length;
        const avgHealth = gs.party
            .filter(m => m.status !== MemberStatus.DEAD)
            .reduce((s, m) => s + m.health, 0) / Math.max(alive, 1);

        const mult = PROFESSION_DATA[gs.profession].scoreMultiplier;

        const survivalScore = alive * 500;
        const healthScore = Math.round(avgHealth * 10);
        const foodScore = Math.min(gs.supplies.food, 500);
        const moneyScore = Math.round(gs.supplies.money / 2);
        const professionBonus = (mult - 1) * 1000;

        const base = survivalScore + healthScore + foodScore + moneyScore;
        const total = Math.round(base * mult);

        return {
            total,
            breakdown: [
                [`Survivors (${alive} × 500)`, survivalScore],
                [`Party health (avg ${Math.round(avgHealth)}%)`, healthScore],
                [`Food remaining`, foodScore],
                [`Money remaining`, moneyScore],
                [`${gs.profession} multiplier (×${mult})`, professionBonus > 0 ? `×${mult}` as any : '×1'],
            ],
        };
    }

    // ─── Death ─────────────────────────────────────────────────────────────────

    private buildDeathScreen(gs: GameState): void {
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        // Tombstone
        this.drawTombstone(GAME_WIDTH / 2, 240);

        this.add.text(GAME_WIDTH / 2, 60, 'YOUR PARTY HAS PERISHED', {
            ...TEXT_STYLES.TITLE,
            fontSize: '36px',
            color: HEX_COLORS.BLOOD_RED,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 118, `Miles traveled: ${Math.round(gs.milesTraveled)} of 2,000`, {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '18px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 148, `Date: ${gs.getFormattedDate()}`, {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '16px',
            color: '#888888',
        }).setOrigin(0.5);

        // Death notices
        const dead = gs.party;
        let dy = 370;
        this.add.text(GAME_WIDTH / 2, dy, 'In Memoriam', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '18px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);
        dy += 30;

        dead.forEach(m => {
            const epitaph = `${m.name} — ${m.status === MemberStatus.DEAD ? `died at ${Math.round(gs.milesTraveled)} miles` : 'survived... then perished'}`;
            this.add.text(GAME_WIDTH / 2, dy, epitaph, {
                ...TEXT_STYLES.HUD,
                fontSize: '14px',
                color: '#aaaaaa',
            }).setOrigin(0.5);
            dy += 22;
        });

        this.buildPlayAgainBtn(dy + 30);
    }

    private drawTombstone(cx: number, cy: number): void {
        const g = this.add.graphics();
        g.fillStyle(0x555555);
        // Stone base
        g.fillRect(cx - 45, cy + 20, 90, 20);
        // Stone body
        g.fillRect(cx - 35, cy - 60, 70, 80);
        // Rounded top (arch)
        g.fillEllipse(cx, cy - 60, 70, 50);
        // Engraving lines
        g.fillStyle(0x333333);
        g.fillRect(cx - 20, cy - 52, 40, 3);
        g.fillRect(cx - 15, cy - 42, 30, 3);
        g.fillRect(cx - 15, cy - 32, 30, 3);
        // Cross
        g.fillStyle(0x444444);
        g.fillRect(cx - 3, cy - 58, 6, 30);
        g.fillRect(cx - 12, cy - 52, 24, 6);
    }

    // ─── Shared ────────────────────────────────────────────────────────────────

    private buildPlayAgainBtn(y: number): void {
        const btnY = Math.min(y + 20, GAME_HEIGHT - 50);
        const btn = this.add.rectangle(GAME_WIDTH / 2, btnY, 280, 52, COLORS.TRAIL_BROWN)
            .setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(2, COLORS.GOLD);

        this.add.text(GAME_WIDTH / 2, btnY, '← Play Again', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '22px',
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(COLORS.GRASS_GREEN));
        btn.on('pointerout', () => btn.setFillStyle(COLORS.TRAIL_BROWN));
        btn.on('pointerdown', () => this.scene.start(SCENES.TITLE));

        this.input.keyboard?.on('keydown-ENTER', () => this.scene.start(SCENES.TITLE));
        this.input.keyboard?.on('keydown-SPACE', () => this.scene.start(SCENES.TITLE));
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
