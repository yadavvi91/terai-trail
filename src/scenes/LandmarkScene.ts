import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES,
    STORE_PRICES,
} from '../utils/constants';
import { MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';
import { getCurrentLandmark } from '../game/TrailData';
import { drawMountain, drawHill, drawTree, drawCloud, drawSun } from '../ui/DrawUtils';

// Fort price multipliers (forts charge more than Independence prices)
const FORT_MULTIPLIERS: Record<string, number> = {
    'Fort Kearney':   1.5,
    'Fort Laramie':   1.8,
    'Fort Bridger':   2.2,
    'Fort Boise':     2.5,
};

export class LandmarkScene extends Scene {
    private landmark!: { name: string; description: string; isFort: boolean; miles: number };
    private activePanel: 'main' | 'trade' | 'rest' = 'main';
    private panelContainer!: Phaser.GameObjects.Container;
    private tradeQtys: number[] = [0, 0, 0, 0, 0];
    private tradeQtyTexts: Phaser.GameObjects.Text[] = [];
    private tradeCostTexts: Phaser.GameObjects.Text[] = [];
    private tradeRemainingText!: Phaser.GameObjects.Text;

    constructor() {
        super(SCENES.LANDMARK);
    }

    create(): void {
        this.activePanel = 'main';
        const gs = GameState.getInstance();

        // Find current landmark
        const lm = getCurrentLandmark(gs.milesTraveled);
        this.landmark = lm ?? { name: 'Landmark', description: 'A notable stop on the trail.', isFort: false, miles: 0 };

        // Background — scenic sky + terrain
        this.cameras.main.setBackgroundColor(0x2a6ea8);
        for (let i = 0; i < 10; i++) {
            const t = i / 9;
            const r = Math.round(0x2a + t * (0x7a - 0x2a));
            const gv = Math.round(0x6e + t * (0xb8 - 0x6e));
            const b = Math.round(0xa8 + t * (0xd8 - 0xa8));
            this.add.rectangle(GAME_WIDTH / 2, 30 + i * 50, GAME_WIDTH, 52, (r << 16) | (gv << 8) | b);
        }
        const skyG = this.add.graphics();
        drawSun(skyG, GAME_WIDTH - 120, 80, 38);
        drawCloud(skyG, 200, 50, 0.8);
        drawCloud(skyG, 600, 35, 0.65);

        const terrG = this.add.graphics();
        drawMountain(terrG, 150,  GAME_HEIGHT - 130, 200, 160, 0x5a7098, true);
        drawMountain(terrG, 350,  GAME_HEIGHT - 130, 240, 190, 0x4d6890, true);
        drawMountain(terrG, 800,  GAME_HEIGHT - 130, 220, 175, 0x607898, true);
        drawMountain(terrG, 980,  GAME_HEIGHT - 130, 180, 155, 0x546c90, true);
        drawHill(terrG, 80,   GAME_HEIGHT - 110, 200, 0x2d6428);
        drawHill(terrG, 920,  GAME_HEIGHT - 110, 220, 0x337030);
        drawTree(terrG, 40,   GAME_HEIGHT - 112, 60, 0x234d1a, false);
        drawTree(terrG, 70,   GAME_HEIGHT - 120, 72, 0x2a5820, true);
        drawTree(terrG, 950,  GAME_HEIGHT - 118, 65, 0x234d1a, false);
        drawTree(terrG, 985,  GAME_HEIGHT - 124, 75, 0x2a5820, false);

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 55, GAME_WIDTH, 110, 0x3a7d30);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 102, GAME_WIDTH, 22, 0x9e7b3a);

        // Landmark visual — simple building silhouette for forts, rock for others
        if (this.landmark.isFort) {
            this.drawFort(GAME_WIDTH / 2, GAME_HEIGHT - 120);
        } else {
            this.drawRock(GAME_WIDTH / 2, GAME_HEIGHT - 140);
        }

        // Info panel
        this.add.rectangle(GAME_WIDTH / 2, 180, GAME_WIDTH - 80, 260, COLORS.PARCHMENT, 0.95);

        this.add.text(GAME_WIDTH / 2, 68, this.landmark.name, {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '26px',
            color: HEX_COLORS.DARK_BROWN,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 104, `Mile ${this.landmark.miles} of 2,000`, {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.TRAIL_BROWN,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 160, this.landmark.description, {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '15px',
            wordWrap: { width: GAME_WIDTH - 140 },
            align: 'center',
        }).setOrigin(0.5);

        // Party status strip
        const pY = 290;
        this.add.text(80, pY, 'Party:', { ...TEXT_STYLES.HUD, color: HEX_COLORS.DARK_BROWN });
        gs.party.forEach((m, i) => {
            const col = m.status === MemberStatus.DEAD ? '#888888' :
                        m.health > 60 ? HEX_COLORS.GREEN :
                        m.health > 30 ? HEX_COLORS.GOLD : HEX_COLORS.BLOOD_RED;
            this.add.text(80 + i * 185, pY + 20, `${m.name}${m.status === MemberStatus.DEAD ? ' (†)' : ` ♥${m.health}%`}`, {
                ...TEXT_STYLES.HUD,
                fontSize: '13px',
                color: col,
            });
        });

        // Action buttons
        this.buildActionButtons();
    }

    private buildActionButtons(): void {
        const btnY = 360;
        const btnW = 200, btnH = 52;
        const gs = GameState.getInstance();

        const actions = [
            { label: 'Rest (1 day)', y: btnY,       action: () => this.doRest() },
            { label: 'Continue',     y: btnY + 70,  action: () => this.continueTrail() },
        ];

        if (this.landmark.isFort) {
            actions.splice(1, 0, { label: 'Trade at Fort', y: btnY + 70, action: () => this.openTrade() });
            actions[2].y = btnY + 140;
        }

        actions.forEach(({ label, y, action }) => {
            const btn = this.add.rectangle(GAME_WIDTH / 2, y, btnW, btnH, COLORS.DARK_BROWN)
                .setInteractive({ useHandCursor: true });
            btn.setStrokeStyle(2, COLORS.TRAIL_BROWN);
            this.add.text(GAME_WIDTH / 2, y, label, {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '18px',
            }).setOrigin(0.5);
            btn.on('pointerover', () => btn.setFillStyle(COLORS.TRAIL_BROWN));
            btn.on('pointerout', () => btn.setFillStyle(COLORS.DARK_BROWN));
            btn.on('pointerdown', action);
        });
    }

    // ─── Rest ──────────────────────────────────────────────────────────────────

    private doRest(): void {
        const gs = GameState.getInstance();
        gs.advanceDay();
        // Restore health for alive members
        let restored = 0;
        gs.party.forEach(m => {
            if (m.status !== MemberStatus.DEAD) {
                const gain = 20;
                m.health = Math.min(100, m.health + gain);
                restored += gain;
            }
        });
        // Show result overlay
        this.showMsg(`Your party rests for a day. Health restored! (+20 to each member)`);
    }

    // ─── Trade ─────────────────────────────────────────────────────────────────

    private openTrade(): void {
        this.tradeQtys = [0, 0, 0, 0, 0];
        this.tradeQtyTexts = [];
        this.tradeCostTexts = [];

        const mult = FORT_MULTIPLIERS[this.landmark.name] ?? 2.0;
        const gs = GameState.getInstance();

        const panel = this.add.container(0, 0);
        this.panelContainer = panel;

        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 80, GAME_HEIGHT - 80, COLORS.PARCHMENT, 0.97);
        panel.add(bg);

        const title = this.add.text(GAME_WIDTH / 2, 52, `${this.landmark.name} — Trading Post`, {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '20px',
        }).setOrigin(0.5);
        panel.add(title);

        const subtitle = this.add.text(GAME_WIDTH / 2, 78, `Prices are ${((mult - 1) * 100).toFixed(0)}% above Independence rates.`, {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.TRAIL_BROWN,
        }).setOrigin(0.5);
        panel.add(subtitle);

        const items = [
            { label: 'Oxen',        basePrice: STORE_PRICES.OXEN,        supplyKey: 'oxen' as const,        max: 6 },
            { label: 'Food (50 lb)',basePrice: STORE_PRICES.FOOD * 50,   supplyKey: 'food' as const,        max: 20 },
            { label: 'Clothing',    basePrice: STORE_PRICES.CLOTHING,    supplyKey: 'clothing' as const,    max: 10 },
            { label: 'Ammunition',  basePrice: STORE_PRICES.AMMO,        supplyKey: 'ammo' as const,        max: 20 },
            { label: 'Spare Parts', basePrice: STORE_PRICES.SPARE_PARTS, supplyKey: 'spareParts' as const,  max: 10 },
        ];

        const rowY = 120;
        const rowH = 56;

        items.forEach((item, i) => {
            const y = rowY + i * rowH;
            const price = +(item.basePrice * mult).toFixed(2);

            const lbl = this.add.text(100, y, item.label, { ...TEXT_STYLES.BODY, color: HEX_COLORS.DARK_BROWN, fontSize: '16px' });
            const priceLbl = this.add.text(310, y, `$${price}/unit`, { ...TEXT_STYLES.HUD, color: HEX_COLORS.TRAIL_BROWN, fontSize: '13px' });

            const minusBtn = this.add.rectangle(460, y + 10, 36, 36, COLORS.TRAIL_BROWN)
                .setInteractive({ useHandCursor: true });
            const minusTxt = this.add.text(460, y + 10, '−', { ...TEXT_STYLES.SUBTITLE, color: HEX_COLORS.PARCHMENT, fontSize: '22px' }).setOrigin(0.5);
            minusBtn.on('pointerdown', () => this.adjustTradeQty(i, -1, price, item.max));

            const qtyTxt = this.add.text(530, y + 10, '0', { ...TEXT_STYLES.BODY, color: HEX_COLORS.DARK_BROWN, fontSize: '18px' }).setOrigin(0.5);
            this.tradeQtyTexts.push(qtyTxt);

            const plusBtn = this.add.rectangle(600, y + 10, 36, 36, COLORS.TRAIL_BROWN)
                .setInteractive({ useHandCursor: true });
            const plusTxt = this.add.text(600, y + 10, '+', { ...TEXT_STYLES.SUBTITLE, color: HEX_COLORS.PARCHMENT, fontSize: '22px' }).setOrigin(0.5);
            plusBtn.on('pointerdown', () => this.adjustTradeQty(i, 1, price, item.max));

            const costTxt = this.add.text(700, y + 10, '$0', { ...TEXT_STYLES.BODY, color: HEX_COLORS.DARK_BROWN, fontSize: '16px' }).setOrigin(0.5);
            this.tradeCostTexts.push(costTxt);

            panel.add([lbl, priceLbl, minusBtn, minusTxt, qtyTxt, plusBtn, plusTxt, costTxt]);
        });

        const totalsY = rowY + items.length * rowH + 10;
        this.add.text(80, totalsY, 'Money:', { ...TEXT_STYLES.BODY, color: HEX_COLORS.DARK_BROWN, fontSize: '16px' });
        this.tradeRemainingText = this.add.text(200, totalsY, `$${gs.supplies.money}`, {
            ...TEXT_STYLES.BODY, color: HEX_COLORS.GREEN, fontSize: '16px',
        });

        const buyBtn = this.add.rectangle(GAME_WIDTH / 2 - 100, totalsY + 50, 180, 48, COLORS.GRASS_GREEN)
            .setInteractive({ useHandCursor: true });
        this.add.text(GAME_WIDTH / 2 - 100, totalsY + 50, 'Purchase', {
            ...TEXT_STYLES.BODY, color: HEX_COLORS.PARCHMENT, fontSize: '18px',
        }).setOrigin(0.5);
        buyBtn.on('pointerdown', () => this.completeTrade(items, FORT_MULTIPLIERS[this.landmark.name] ?? 2.0));

        const cancelBtn = this.add.rectangle(GAME_WIDTH / 2 + 100, totalsY + 50, 180, 48, COLORS.TRAIL_BROWN)
            .setInteractive({ useHandCursor: true });
        this.add.text(GAME_WIDTH / 2 + 100, totalsY + 50, 'Cancel', {
            ...TEXT_STYLES.BODY, color: HEX_COLORS.PARCHMENT, fontSize: '18px',
        }).setOrigin(0.5);
        cancelBtn.on('pointerdown', () => {
            panel.destroy(true);
            this.tradeRemainingText?.destroy();
            buyBtn.destroy(); cancelBtn.destroy();
        });
    }

    private adjustTradeQty(i: number, delta: number, price: number, max: number): void {
        const gs = GameState.getInstance();
        const newQty = Math.max(0, Math.min(max, this.tradeQtys[i] + delta));
        const oldCost = this.tradeQtys[i] * price;
        const newCost = newQty * price;
        if (newCost > oldCost && gs.supplies.money < this.getTradeTotalCost() - oldCost + newCost) return;
        this.tradeQtys[i] = newQty;
        this.tradeQtyTexts[i].setText(String(newQty));
        this.tradeCostTexts[i].setText(`$${(newQty * price).toFixed(newQty * price % 1 === 0 ? 0 : 2)}`);
        const gs2 = GameState.getInstance();
        const remaining = gs2.supplies.money - this.getTradeTotalCost();
        this.tradeRemainingText.setText(`$${remaining.toFixed(remaining % 1 === 0 ? 0 : 2)}`);
    }

    private getTradeTotalCost(): number {
        const mult = FORT_MULTIPLIERS[this.landmark.name] ?? 2.0;
        const prices = [
            STORE_PRICES.OXEN, STORE_PRICES.FOOD * 50, STORE_PRICES.CLOTHING,
            STORE_PRICES.AMMO, STORE_PRICES.SPARE_PARTS,
        ];
        return this.tradeQtys.reduce((s, q, i) => s + q * prices[i] * mult, 0);
    }

    private completeTrade(items: { supplyKey: 'oxen' | 'food' | 'clothing' | 'ammo' | 'spareParts'; label: string }[], mult: number): void {
        const gs = GameState.getInstance();
        const prices = [
            STORE_PRICES.OXEN, STORE_PRICES.FOOD * 50, STORE_PRICES.CLOTHING,
            STORE_PRICES.AMMO, STORE_PRICES.SPARE_PARTS,
        ];
        const total = this.getTradeTotalCost();
        if (gs.supplies.money < total) return;
        gs.supplies.money -= total;
        this.tradeQtys.forEach((qty, i) => {
            if (items[i].supplyKey === 'food') {
                gs.supplies.food += qty * 50;
            } else {
                (gs.supplies as any)[items[i].supplyKey] += qty;
            }
        });
        this.panelContainer?.destroy(true);
        this.showMsg(`Purchased for $${total.toFixed(total % 1 === 0 ? 0 : 2)}. Money remaining: $${gs.supplies.money}`);
    }

    // ─── Continue ──────────────────────────────────────────────────────────────

    private continueTrail(): void {
        this.scene.stop();
        this.scene.resume(SCENES.TRAVEL);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private showMsg(text: string): void {
        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 90, GAME_WIDTH - 80, 50, 0x000000, 0.8);
        const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 90, text, {
            ...TEXT_STYLES.HUD,
            fontSize: '14px',
            color: HEX_COLORS.PARCHMENT,
            wordWrap: { width: GAME_WIDTH - 100 },
            align: 'center',
        }).setOrigin(0.5);
        this.time.delayedCall(3000, () => { bg.destroy(); msg.destroy(); });
    }

    private drawFort(cx: number, baseY: number): void {
        const g = this.add.graphics();

        // Fort wall — log cabin style
        g.fillStyle(0x5a3a1a);
        g.fillRect(cx - 80, baseY - 55, 160, 55);
        // Log texture
        for (let i = 0; i < 8; i++) {
            g.fillStyle(i % 2 === 0 ? 0x4a2e14 : 0x5c3818, 0.8);
            g.fillRect(cx - 80, baseY - 55 + i * 7, 160, 6);
        }

        // Gate — arched doorway
        g.fillStyle(0x1a0e04);
        g.fillRect(cx - 18, baseY - 38, 36, 38);
        g.fillEllipse(cx, baseY - 38, 36, 20);
        // Gate planks
        g.fillStyle(0x3a2010, 0.5);
        g.fillRect(cx - 1, baseY - 38, 2, 38);

        // Left tower
        g.fillStyle(0x5a3a1a);
        g.fillRect(cx - 90, baseY - 80, 28, 80);
        g.fillStyle(0x4a2e14);
        g.fillRect(cx - 90, baseY - 80, 28, 4); // cap
        // Tower window
        g.fillStyle(0x1a0e04);
        g.fillRect(cx - 82, baseY - 60, 12, 14);
        g.fillStyle(0x3a6a90, 0.5); // blue glass hint
        g.fillRect(cx - 80, baseY - 58, 8, 10);

        // Right tower
        g.fillStyle(0x5a3a1a);
        g.fillRect(cx + 62, baseY - 80, 28, 80);
        g.fillStyle(0x4a2e14);
        g.fillRect(cx + 62, baseY - 80, 28, 4);
        g.fillStyle(0x1a0e04);
        g.fillRect(cx + 70, baseY - 60, 12, 14);
        g.fillStyle(0x3a6a90, 0.5);
        g.fillRect(cx + 72, baseY - 58, 8, 10);

        // Pointed tower roofs
        g.fillStyle(0x8b5a28);
        g.fillTriangle(cx - 96, baseY - 80, cx - 76, baseY - 100, cx - 56, baseY - 80);
        g.fillTriangle(cx + 56, baseY - 80, cx + 76, baseY - 100, cx + 96, baseY - 80);

        // Flag on right tower
        g.fillStyle(0x5a3a1a);
        g.fillRect(cx + 75, baseY - 100, 3, 30);
        g.fillStyle(0xcc3333);
        g.fillTriangle(cx + 78, baseY - 100, cx + 78, baseY - 82, cx + 96, baseY - 91);

        // Stockade fence extending from towers
        g.fillStyle(0x4a2e14);
        for (let i = 0; i < 4; i++) {
            g.fillRect(cx - 118 + i * 8, baseY - 44, 6, 44);
            g.fillTriangle(cx - 118 + i * 8, baseY - 44, cx - 115 + i * 8, baseY - 50, cx - 112 + i * 8, baseY - 44);
        }
        for (let i = 0; i < 4; i++) {
            g.fillRect(cx + 92 + i * 8, baseY - 44, 6, 44);
            g.fillTriangle(cx + 92 + i * 8, baseY - 44, cx + 95 + i * 8, baseY - 50, cx + 98 + i * 8, baseY - 44);
        }
    }

    private drawRock(cx: number, baseY: number): void {
        const g = this.add.graphics();

        // Shadow
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(cx + 5, baseY + 10, 140, 30);

        // Main rock mass — multiple overlapping irregular shapes
        g.fillStyle(0x7a7a7a);
        g.fillEllipse(cx, baseY - 5, 130, 85);
        g.fillStyle(0x8a8a8a);
        g.fillEllipse(cx - 25, baseY - 20, 80, 60);
        g.fillStyle(0x6a6a6a);
        g.fillEllipse(cx + 20, baseY + 5, 90, 55);

        // Top boulder
        g.fillStyle(0x9a9a9a);
        g.fillEllipse(cx - 10, baseY - 40, 60, 45);

        // Highlight (sunlit edge)
        g.fillStyle(0xb0b0a0, 0.4);
        g.fillEllipse(cx - 30, baseY - 40, 35, 30);

        // Cracks / detail lines
        g.lineStyle(1.5, 0x5a5a5a, 0.6);
        g.beginPath();
        g.moveTo(cx - 20, baseY - 40);
        g.lineTo(cx + 10, baseY - 10);
        g.lineTo(cx + 25, baseY + 10);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx - 40, baseY - 10);
        g.lineTo(cx - 15, baseY + 5);
        g.strokePath();

        // Moss patches
        g.fillStyle(0x4a6a30, 0.5);
        g.fillEllipse(cx + 30, baseY - 15, 20, 12);
        g.fillEllipse(cx - 35, baseY + 5, 18, 10);
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
