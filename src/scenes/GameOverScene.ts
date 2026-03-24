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
        victory ? this.buildVictoryScreen(gs) : this.buildDeathScreen(gs);
    }

    // ─── Victory ───────────────────────────────────────────────────────────────

    private buildVictoryScreen(gs: GameState): void {
        // Sky gradient — warm golden
        for (let i = 0; i < 10; i++) {
            const t = i / 9;
            const r = Math.round(0x30 + t * (0x8a - 0x30));
            const g2 = Math.round(0x90 + t * (0xd0 - 0x90));
            const b = Math.round(0x20 + t * (0x60 - 0x20));
            this.add.rectangle(GAME_WIDTH / 2, 30 + i * 60, GAME_WIDTH, 62, (r << 16) | (g2 << 8) | b);
        }
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 50, GAME_WIDTH, 100, 0x3d8b37);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 95, GAME_WIDTH, 20, 0x9e7b3a);

        // Sun rays
        const sunG = this.add.graphics();
        sunG.fillStyle(0xffd700, 0.25);
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            sunG.fillTriangle(
                GAME_WIDTH / 2, 0,
                GAME_WIDTH / 2 + Math.cos(angle - 0.15) * GAME_WIDTH,
                Math.sin(angle - 0.15) * GAME_WIDTH,
                GAME_WIDTH / 2 + Math.cos(angle + 0.15) * GAME_WIDTH,
                Math.sin(angle + 0.15) * GAME_WIDTH,
            );
        }

        // Mountains in background
        const mG = this.add.graphics();
        mG.fillStyle(0x3a6a40);
        mG.fillTriangle(100, GAME_HEIGHT - 100, 260, GAME_HEIGHT - 300, 420, GAME_HEIGHT - 100);
        mG.fillTriangle(280, GAME_HEIGHT - 100, 480, GAME_HEIGHT - 340, 680, GAME_HEIGHT - 100);
        mG.fillTriangle(580, GAME_HEIGHT - 100, 760, GAME_HEIGHT - 280, 940, GAME_HEIGHT - 100);
        mG.fillTriangle(820, GAME_HEIGHT - 100, 980, GAME_HEIGHT - 320, GAME_WIDTH + 20, GAME_HEIGHT - 100);
        // Snow
        mG.fillStyle(0xf0f4f8, 0.7);
        mG.fillTriangle(260, GAME_HEIGHT - 300, 240, GAME_HEIGHT - 260, 280, GAME_HEIGHT - 260);
        mG.fillTriangle(480, GAME_HEIGHT - 340, 456, GAME_HEIGHT - 290, 504, GAME_HEIGHT - 290);
        mG.fillTriangle(760, GAME_HEIGHT - 280, 740, GAME_HEIGHT - 240, 780, GAME_HEIGHT - 240);
        mG.fillTriangle(980, GAME_HEIGHT - 320, 958, GAME_HEIGHT - 272, 1002, GAME_HEIGHT - 272);

        // Title
        this.add.text(GAME_WIDTH / 2, 60, '🎉  YOU MADE IT!  🎉', {
            ...TEXT_STYLES.TITLE,
            fontSize: '46px',
            color: HEX_COLORS.GOLD,
            shadow: { offsetX: 3, offsetY: 3, color: '#3a2000', blur: 10, fill: true },
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 128, "You have reached Oregon's Willamette Valley!", {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '20px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        // Score panel
        const score = this.calcScore(gs);
        const panelW = 620, panelH = 310;
        const panelY = 330;

        this.add.rectangle(GAME_WIDTH / 2, panelY, panelW + 6, panelH + 6, 0x8b6914, 0.6);
        this.add.rectangle(GAME_WIDTH / 2, panelY, panelW, panelH, 0xf0ddb8, 0.96);

        this.add.text(GAME_WIDTH / 2, panelY - panelH / 2 + 22, '── Final Score ──', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '20px',
            color: HEX_COLORS.DARK_BROWN,
        }).setOrigin(0.5);

        let y = panelY - panelH / 2 + 52;
        score.breakdown.forEach(([label, value]) => {
            this.add.text(GAME_WIDTH / 2 - 240, y, label as string, {
                ...TEXT_STYLES.HUD,
                color: HEX_COLORS.DARK_BROWN,
                fontSize: '15px',
            });
            this.add.text(GAME_WIDTH / 2 + 240, y, String(value), {
                ...TEXT_STYLES.HUD,
                color: HEX_COLORS.TRAIL_BROWN,
                fontSize: '15px',
            }).setOrigin(1, 0);
            y += 26;
        });

        this.add.rectangle(GAME_WIDTH / 2, y + 6, panelW - 40, 1, 0xb89050);
        this.add.text(GAME_WIDTH / 2 - 240, y + 18, 'TOTAL', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '18px',
        });
        this.add.text(GAME_WIDTH / 2 + 240, y + 18, String(score.total), {
            ...TEXT_STYLES.SUBTITLE,
            color: HEX_COLORS.TRAIL_BROWN,
            fontSize: '26px',
        }).setOrigin(1, 0);

        // Survivors
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD);
        this.add.text(GAME_WIDTH / 2, y + 55, `Survivors: ${alive.map(m => m.name).join('  •  ')}`, {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '14px',
        }).setOrigin(0.5);

        this.buildPlayAgainBtn(GAME_HEIGHT - 55);
    }

    private calcScore(gs: GameState): { total: number; breakdown: [string, number | string][] } {
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD).length;
        const avgHealth = gs.party
            .filter(m => m.status !== MemberStatus.DEAD)
            .reduce((s, m) => s + m.health, 0) / Math.max(alive, 1);
        const mult = PROFESSION_DATA[gs.profession].scoreMultiplier;

        const survivalScore = alive * 500;
        const healthScore = Math.round(avgHealth * 10);
        const foodScore = Math.min(Math.round(gs.supplies.food), 500);
        const moneyScore = Math.round(gs.supplies.money / 2);
        const base = survivalScore + healthScore + foodScore + moneyScore;

        return {
            total: Math.round(base * mult),
            breakdown: [
                [`Survivors (${alive} × 500)`, survivalScore],
                [`Party health (avg ${Math.round(avgHealth)}%)`, healthScore],
                [`Food remaining`, foodScore],
                [`Money remaining`, moneyScore],
                [`${gs.profession} multiplier`, `× ${mult}`],
            ],
        };
    }

    // ─── Death ─────────────────────────────────────────────────────────────────

    private buildDeathScreen(gs: GameState): void {
        // Dark stormy sky
        this.cameras.main.setBackgroundColor(0x0e0e1a);
        for (let i = 0; i < 8; i++) {
            const t = i / 7;
            const c = Math.round(0x0e + t * (0x2a - 0x0e));
            this.add.rectangle(GAME_WIDTH / 2, 40 + i * 70, GAME_WIDTH, 72, (c << 16) | (c << 8) | c);
        }

        // Ground
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 40, GAME_WIDTH, 80, 0x1a1408);

        // Title
        this.add.text(GAME_WIDTH / 2, 50, 'YOUR PARTY HAS PERISHED', {
            ...TEXT_STYLES.TITLE,
            fontSize: '38px',
            color: HEX_COLORS.BLOOD_RED,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 12, fill: true },
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 112, `${Math.round(gs.milesTraveled)} miles of 2,000 traveled  •  ${gs.getFormattedDate()}`, {
            ...TEXT_STYLES.HUD,
            fontSize: '15px',
            color: '#888888',
        }).setOrigin(0.5);

        // Tombstone
        this.drawTombstone(GAME_WIDTH / 2, 300);

        // In Memoriam panel
        const panelW = 500, panelH = 200;
        const panelY = 540;
        this.add.rectangle(GAME_WIDTH / 2, panelY, panelW, panelH, 0x1a1208, 0.9);
        this.add.rectangle(GAME_WIDTH / 2, panelY, panelW, panelH).setStrokeStyle(1, 0x555533, 0.7);

        this.add.text(GAME_WIDTH / 2, panelY - panelH / 2 + 22, '— In Memoriam —', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '16px',
            color: '#aaaaaa',
        }).setOrigin(0.5);

        let dy = panelY - panelH / 2 + 50;
        gs.party.forEach(m => {
            this.add.text(GAME_WIDTH / 2, dy, `${m.name}  —  perished at ${Math.round(gs.milesTraveled)} miles`, {
                ...TEXT_STYLES.HUD,
                fontSize: '13px',
                color: '#888877',
            }).setOrigin(0.5);
            dy += 22;
        });

        this.buildPlayAgainBtn(GAME_HEIGHT - 44);
    }

    private drawTombstone(cx: number, cy: number): void {
        const g = this.add.graphics();
        // Shadow
        g.fillStyle(0x000000, 0.4);
        g.fillEllipse(cx + 6, cy + 70, 100, 20);
        // Base slab
        g.fillStyle(0x5a5a5a);
        g.fillRect(cx - 55, cy + 50, 110, 22);
        // Main stone
        g.fillStyle(0x4a4a4a);
        g.fillRect(cx - 44, cy - 60, 88, 110);
        // Arch top
        g.fillStyle(0x4a4a4a);
        g.fillEllipse(cx, cy - 60, 88, 60);
        // Stone texture lines
        g.fillStyle(0x000000, 0.1);
        g.fillRect(cx - 44, cy - 10, 88, 2);
        g.fillRect(cx - 44, cy + 20, 88, 1);
        // Cross
        g.fillStyle(0x6a6a6a);
        g.fillRect(cx - 5, cy - 80, 10, 48);
        g.fillRect(cx - 18, cy - 68, 36, 10);
        // Highlight edge
        g.lineStyle(1, 0x888888, 0.4);
        g.strokeRect(cx - 44, cy - 60, 88, 110);
        g.strokeEllipse(cx, cy - 60, 88, 60);
        // RIP text (embedded in stone appearance)
        this.add.text(cx, cy + 10, 'R.I.P.', {
            fontFamily: '"Courier New", monospace',
            fontSize: '18px',
            color: '#8a8a7a',
        }).setOrigin(0.5);
    }

    private buildPlayAgainBtn(y: number): void {
        const btn = this.add.rectangle(GAME_WIDTH / 2, y, 300, 52, COLORS.TRAIL_BROWN)
            .setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(2, COLORS.GOLD);

        const label = this.add.text(GAME_WIDTH / 2, y, '← Play Again', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '22px',
        }).setOrigin(0.5);

        btn.on('pointerover', () => { btn.setFillStyle(COLORS.GRASS_GREEN); label.setColor(HEX_COLORS.GOLD); });
        btn.on('pointerout',  () => { btn.setFillStyle(COLORS.TRAIL_BROWN); label.setColor(HEX_COLORS.PARCHMENT); });
        btn.on('pointerdown', () => this.scene.start(SCENES.TITLE));

        this.input.keyboard?.on('keydown-ENTER', () => this.scene.start(SCENES.TITLE));
        this.input.keyboard?.on('keydown-SPACE', () => this.scene.start(SCENES.TITLE));
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
