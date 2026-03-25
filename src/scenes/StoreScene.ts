import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS,
    STORE_PRICES,
} from '../utils/constants';
import { GameState } from '../game/GameState';

const ITEM_ICONS: Record<string, string> = {
    OXEN:        '🐂',
    FOOD:        '🥩',
    CLOTHING:    '🧥',
    AMMO:        '🔫',
    SPARE_PARTS: '⚙️',
};

interface StoreItem {
    key: keyof typeof STORE_PRICES;
    label: string;
    unit: string;
    price: number;
    min: number;
    max: number;
    step: number;
    supplyKey: 'food' | 'oxen' | 'clothing' | 'ammo' | 'spareParts';
}

const STORE_ITEMS: StoreItem[] = [
    { key: 'OXEN',        label: 'Oxen',        unit: 'yokes',  price: STORE_PRICES.OXEN,        min: 0, max: 9,    step: 1,  supplyKey: 'oxen' },
    { key: 'FOOD',        label: 'Food',        unit: 'lbs',    price: STORE_PRICES.FOOD,        min: 0, max: 2000, step: 50, supplyKey: 'food' },
    { key: 'CLOTHING',    label: 'Clothing',    unit: 'sets',   price: STORE_PRICES.CLOTHING,    min: 0, max: 20,   step: 1,  supplyKey: 'clothing' },
    { key: 'AMMO',        label: 'Ammunition',  unit: 'boxes',  price: STORE_PRICES.AMMO,        min: 0, max: 99,   step: 1,  supplyKey: 'ammo' },
    { key: 'SPARE_PARTS', label: 'Spare Parts', unit: 'sets',   price: STORE_PRICES.SPARE_PARTS, min: 0, max: 20,   step: 1,  supplyKey: 'spareParts' },
];

export class StoreScene extends Scene {
    private quantities: number[] = [2, 200, 3, 10, 3];
    private qtyTexts: Phaser.GameObjects.Text[] = [];
    private costTexts: Phaser.GameObjects.Text[] = [];
    private spentText!: Phaser.GameObjects.Text;
    private remainingText!: Phaser.GameObjects.Text;
    private startBtn!: Phaser.GameObjects.Rectangle;
    private startBtnText!: Phaser.GameObjects.Text;

    constructor() {
        super(SCENES.STORE);
    }

    create(): void {
        this.quantities = [2, 200, 3, 10, 3];
        this.qtyTexts = [];
        this.costTexts = [];

        const gs = GameState.getInstance();

        // Woodgrain store background — more realistic planks
        this.cameras.main.setBackgroundColor(0x1a0e04);
        const woodG = this.add.graphics();
        for (let i = 0; i < 22; i++) {
            const px = i * 50 - 10;
            const baseColor = [0x3a2214, 0x2e1c0c, 0x342010, 0x2a1808][i % 4];
            woodG.fillStyle(baseColor);
            woodG.fillRect(px, 0, 48, GAME_HEIGHT);
            // Plank edge (light line on left, dark on right)
            woodG.fillStyle(0x4a3020, 0.3);
            woodG.fillRect(px, 0, 2, GAME_HEIGHT);
            woodG.fillStyle(0x0a0604, 0.4);
            woodG.fillRect(px + 46, 0, 2, GAME_HEIGHT);
            // Grain lines — horizontal wood texture
            woodG.fillStyle(0x1a0e06, 0.25);
            for (let j = 0; j < 12; j++) {
                const gy = j * 68 + (i % 3) * 20;
                woodG.fillRect(px + 2, gy, 44, 1.5);
            }
            // Knot (occasional)
            if (i % 5 === 2) {
                woodG.fillStyle(0x1a0e06, 0.5);
                woodG.fillEllipse(px + 24, 200 + i * 30, 16, 10);
                woodG.fillStyle(0x2a1a0a, 0.3);
                woodG.fillEllipse(px + 24, 200 + i * 30, 10, 6);
            }
        }
        // Shelf shadows at top and bottom
        woodG.fillStyle(0x000000, 0.25);
        woodG.fillRect(0, 0, GAME_WIDTH, 12);
        woodG.fillRect(0, GAME_HEIGHT - 8, GAME_WIDTH, 8);

        // Shadow + parchment panel — double shadow for depth
        this.add.rectangle(GAME_WIDTH / 2 + 6, GAME_HEIGHT / 2 + 6, GAME_WIDTH - 52, GAME_HEIGHT - 32, 0x000000, 0.5);
        this.add.rectangle(GAME_WIDTH / 2 + 2, GAME_HEIGHT / 2 + 2, GAME_WIDTH - 56, GAME_HEIGHT - 36, 0x000000, 0.25);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 56, GAME_HEIGHT - 36, 0xf0ddb8, 0.97);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 56, GAME_HEIGHT - 36).setStrokeStyle(3, 0x8b6914);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 70, GAME_HEIGHT - 50).setStrokeStyle(1, 0xb89050, 0.4);

        // Store sign header bar
        this.add.rectangle(GAME_WIDTH / 2, 44, GAME_WIDTH - 60, 68, 0x4a2e0e);
        this.add.rectangle(GAME_WIDTH / 2, 44, GAME_WIDTH - 60, 68).setStrokeStyle(2, 0x8b6914);

        this.add.text(GAME_WIDTH / 2, 30, "🏪  Haman's General Store  —  Independence, Missouri", {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '19px',
            color: HEX_COLORS.PARCHMENT,
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 4, fill: true },
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 58, '1848  •  "Outfitting the brave since 1836"  •  All prices in US Dollars', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.TRAIL_BROWN,
            fontSize: '13px',
        }).setOrigin(0.5);

        // Column headers
        const col = { item: 140, price: 370, minus: 535, qty: 590, plus: 648, cost: 760 };
        const headerY = 100;
        this.add.rectangle(GAME_WIDTH / 2, headerY, GAME_WIDTH - 100, 28, 0x3a2510, 0.5);
        const headerStyle = { ...TEXT_STYLES.HUD, color: HEX_COLORS.TRAIL_BROWN, fontSize: '13px', letterSpacing: 1 };
        [['ITEM', col.item], ['UNIT PRICE', col.price], ['QTY', col.qty], ['SUBTOTAL', col.cost]].forEach(([label, x]) => {
            this.add.text(x as number, headerY, label as string, headerStyle).setOrigin(0.5);
        });
        this.add.rectangle(GAME_WIDTH / 2, 114, GAME_WIDTH - 100, 2, 0xb89050, 0.7);

        // Store rows
        const rowStartY = 128;
        const rowH = 70;

        STORE_ITEMS.forEach((item, i) => {
            const y = rowStartY + i * rowH;

            // Alternating row tint
            if (i % 2 === 1) {
                this.add.rectangle(GAME_WIDTH / 2, y + rowH / 2, GAME_WIDTH - 100, rowH, 0x000000, 0.04);
            }

            if (i > 0) {
                this.add.rectangle(GAME_WIDTH / 2, y + 2, GAME_WIDTH - 140, 1, 0xc8b48a, 0.5);
            }

            // Icon
            this.add.text(52, y + rowH / 2, ITEM_ICONS[item.key] ?? '▪', { fontSize: '22px' }).setOrigin(0.5);

            // Item label
            this.add.text(col.item, y + rowH / 2 - 8, item.label, {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.DARK_BROWN,
                fontSize: '17px',
            }).setOrigin(0.5);
            this.add.text(col.item, y + rowH / 2 + 10, item.unit, {
                ...TEXT_STYLES.HUD,
                color: HEX_COLORS.TRAIL_BROWN,
                fontSize: '12px',
            }).setOrigin(0.5);

            // Price
            const priceStr = item.price >= 1
                ? `$${item.price} / ${item.unit.replace(/s$/, '')}`
                : `$${item.price.toFixed(2)} / lb`;
            this.add.text(col.price, y + rowH / 2, priceStr, {
                ...TEXT_STYLES.HUD,
                color: HEX_COLORS.TRAIL_BROWN,
                fontSize: '14px',
            }).setOrigin(0.5);

            // Minus button — circle style
            const minusBtn = this.add.rectangle(col.minus, y + rowH / 2, 34, 34, 0x6a3a18)
                .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x8b5a30);
            this.add.text(col.minus, y + rowH / 2 - 1, '−', {
                ...TEXT_STYLES.SUBTITLE,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '22px',
            }).setOrigin(0.5);
            minusBtn.on('pointerdown', () => this.adjustQty(i, -item.step));
            minusBtn.on('pointerover', () => minusBtn.setFillStyle(0x9a5a28));
            minusBtn.on('pointerout',  () => minusBtn.setFillStyle(0x6a3a18));

            // Qty display with background box
            this.add.rectangle(col.qty, y + rowH / 2, 52, 32, 0xf5e6c8).setStrokeStyle(1, 0xb89050);
            const qtyText = this.add.text(col.qty, y + rowH / 2, String(this.quantities[i]), {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.DARK_BROWN,
                fontSize: '18px',
            }).setOrigin(0.5);
            this.qtyTexts.push(qtyText);

            // Plus button — circle style
            const plusBtn = this.add.rectangle(col.plus, y + rowH / 2, 34, 34, 0x3a6a1a)
                .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x5a9a30);
            this.add.text(col.plus, y + rowH / 2 - 1, '+', {
                ...TEXT_STYLES.SUBTITLE,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '22px',
            }).setOrigin(0.5);
            plusBtn.on('pointerdown', () => this.adjustQty(i, item.step));
            plusBtn.on('pointerover', () => plusBtn.setFillStyle(0x5a9a28));
            plusBtn.on('pointerout',  () => plusBtn.setFillStyle(0x3a6a1a));

            // Cost display
            const costText = this.add.text(col.cost, y + rowH / 2, this.formatCost(i), {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.DARK_BROWN,
                fontSize: '17px',
            }).setOrigin(0.5);
            this.costTexts.push(costText);
        });

        // Divider before totals
        this.add.rectangle(GAME_WIDTH / 2, rowStartY + STORE_ITEMS.length * rowH, GAME_WIDTH - 100, 2, 0xb89050);

        const totalsY = rowStartY + STORE_ITEMS.length * rowH + 22;
        this.add.text(80, totalsY, 'Spent:', { ...TEXT_STYLES.BODY, color: HEX_COLORS.DARK_BROWN, fontSize: '18px' });
        this.spentText = this.add.text(200, totalsY, '', { ...TEXT_STYLES.BODY, color: HEX_COLORS.BLOOD_RED, fontSize: '18px' });
        this.add.text(400, totalsY, 'Starting money:', { ...TEXT_STYLES.BODY, color: HEX_COLORS.DARK_BROWN, fontSize: '18px' });
        this.add.text(620, totalsY, `$${gs.supplies.money.toLocaleString()}`, { ...TEXT_STYLES.BODY, color: HEX_COLORS.DARK_BROWN, fontSize: '18px' });
        this.add.text(750, totalsY, 'Remaining:', { ...TEXT_STYLES.BODY, color: HEX_COLORS.DARK_BROWN, fontSize: '18px' });
        this.remainingText = this.add.text(880, totalsY, '', { ...TEXT_STYLES.BODY, color: HEX_COLORS.GREEN, fontSize: '18px' });

        this.updateTotals();

        // Supplies advice
        this.add.text(GAME_WIDTH / 2, totalsY + 36, 'Tip: Bring at least 2 yokes of oxen and 200 lbs of food per person.', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.TRAIL_BROWN,
            fontSize: '13px',
        }).setOrigin(0.5);

        // Begin Journey button
        const btnY = GAME_HEIGHT - 36;
        this.add.rectangle(GAME_WIDTH / 2 + 3, btnY + 3, 340, 52, 0x000000, 0.35);
        this.startBtn = this.add.rectangle(GAME_WIDTH / 2, btnY, 340, 52, 0x3d7830)
            .setInteractive({ useHandCursor: true });
        this.startBtn.setStrokeStyle(2, COLORS.GOLD);
        this.startBtnText = this.add.text(GAME_WIDTH / 2, btnY, 'Begin Journey  →', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '22px',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 4, fill: true },
        }).setOrigin(0.5);

        this.startBtn.on('pointerover', () => { this.startBtn.setFillStyle(0x56a844); this.startBtnText.setColor(HEX_COLORS.GOLD); });
        this.startBtn.on('pointerout',  () => { this.startBtn.setFillStyle(0x3d7830); this.startBtnText.setColor(HEX_COLORS.PARCHMENT); });
        this.startBtn.on('pointerdown', () => this.beginJourney());

        this.input.keyboard?.on('keydown-ENTER', () => this.beginJourney());
    }

    private adjustQty(index: number, delta: number): void {
        const item = STORE_ITEMS[index];
        const gs = GameState.getInstance();
        const newQty = Math.max(item.min, this.quantities[index] + delta);

        // Check if we can afford the change
        const oldCost = this.quantities[index] * item.price;
        const newCost = newQty * item.price;
        const costDelta = newCost - oldCost;
        const spent = this.getTotalSpent();
        const budget = gs.supplies.money;

        if (costDelta > 0 && spent + costDelta > budget) return; // can't afford

        this.quantities[index] = Math.min(item.max, newQty);
        this.qtyTexts[index].setText(String(this.quantities[index]));
        this.costTexts[index].setText(this.formatCost(index));
        this.updateTotals();
    }

    private formatCost(index: number): string {
        const cost = this.quantities[index] * STORE_ITEMS[index].price;
        return `$${cost.toFixed(cost % 1 === 0 ? 0 : 2)}`;
    }

    private getTotalSpent(): number {
        return STORE_ITEMS.reduce((sum, item, i) => sum + this.quantities[i] * item.price, 0);
    }

    private updateTotals(): void {
        const gs = GameState.getInstance();
        const spent = this.getTotalSpent();
        const remaining = gs.supplies.money - spent;
        this.spentText.setText(`$${spent.toFixed(spent % 1 === 0 ? 0 : 2)}`);
        this.remainingText.setText(`$${remaining.toFixed(remaining % 1 === 0 ? 0 : 2)}`);
        this.remainingText.setColor(remaining < 0 ? HEX_COLORS.BLOOD_RED : HEX_COLORS.GREEN);
    }

    private beginJourney(): void {
        const gs = GameState.getInstance();
        STORE_ITEMS.forEach((item, i) => {
            (gs.supplies as any)[item.supplyKey] = this.quantities[i];
        });
        gs.supplies.money -= this.getTotalSpent();
        this.scene.start(SCENES.TRAVEL);
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
