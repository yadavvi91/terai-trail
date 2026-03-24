import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS,
    STORE_PRICES,
} from '../utils/constants';
import { GameState } from '../game/GameState';

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
        this.cameras.main.setBackgroundColor(COLORS.DARK_BROWN);

        // Parchment background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 60, GAME_HEIGHT - 40, COLORS.PARCHMENT);

        // Header
        this.add.text(GAME_WIDTH / 2, 36, "Haman's General Store — Independence, Missouri", {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '18px',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 62, '1848 — Prices are high this season. Stock up wisely.', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.TRAIL_BROWN,
            fontSize: '14px',
        }).setOrigin(0.5);

        // Column headers
        const col = { item: 120, price: 360, minus: 530, qty: 590, plus: 650, cost: 750 };
        const headerY = 95;
        const headerStyle = { ...TEXT_STYLES.BODY, color: HEX_COLORS.DARK_BROWN, fontSize: '15px' };
        [['ITEM', col.item], ['PRICE', col.price], ['QTY', col.qty], ['TOTAL', col.cost]].forEach(([label, x]) => {
            this.add.text(x as number, headerY, label as string, headerStyle).setOrigin(0.5);
        });
        this.add.rectangle(GAME_WIDTH / 2, 108, GAME_WIDTH - 100, 2, COLORS.TRAIL_BROWN);

        // Store rows
        const rowStartY = 135;
        const rowH = 72;

        STORE_ITEMS.forEach((item, i) => {
            const y = rowStartY + i * rowH;

            // Divider
            if (i > 0) {
                this.add.rectangle(GAME_WIDTH / 2, y - 8, GAME_WIDTH - 140, 1, 0xd4c4a0);
            }

            // Item label
            this.add.text(col.item, y + 16, item.label, {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.DARK_BROWN,
                fontSize: '18px',
            }).setOrigin(0.5);

            // Price
            const priceStr = item.price >= 1
                ? `$${item.price}/${item.unit.replace(/s$/, '')}`
                : `$${item.price.toFixed(2)}/lb`;
            this.add.text(col.price, y + 16, priceStr, {
                ...TEXT_STYLES.HUD,
                color: HEX_COLORS.TRAIL_BROWN,
                fontSize: '14px',
            }).setOrigin(0.5);

            // Minus button
            const minusBtn = this.add.rectangle(col.minus, y + 16, 36, 36, COLORS.TRAIL_BROWN)
                .setInteractive({ useHandCursor: true });
            this.add.text(col.minus, y + 16, '−', {
                ...TEXT_STYLES.SUBTITLE,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '24px',
            }).setOrigin(0.5);
            minusBtn.on('pointerdown', () => this.adjustQty(i, -item.step));
            minusBtn.on('pointerover', () => minusBtn.setFillStyle(COLORS.SKY_BLUE));
            minusBtn.on('pointerout', () => minusBtn.setFillStyle(COLORS.TRAIL_BROWN));

            // Qty display
            const qtyText = this.add.text(col.qty, y + 16, String(this.quantities[i]), {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.DARK_BROWN,
                fontSize: '20px',
            }).setOrigin(0.5);
            this.qtyTexts.push(qtyText);

            // Plus button
            const plusBtn = this.add.rectangle(col.plus, y + 16, 36, 36, COLORS.TRAIL_BROWN)
                .setInteractive({ useHandCursor: true });
            this.add.text(col.plus, y + 16, '+', {
                ...TEXT_STYLES.SUBTITLE,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '24px',
            }).setOrigin(0.5);
            plusBtn.on('pointerdown', () => this.adjustQty(i, item.step));
            plusBtn.on('pointerover', () => plusBtn.setFillStyle(COLORS.SKY_BLUE));
            plusBtn.on('pointerout', () => plusBtn.setFillStyle(COLORS.TRAIL_BROWN));

            // Cost display
            const costText = this.add.text(col.cost, y + 16, this.formatCost(i), {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.DARK_BROWN,
                fontSize: '18px',
            }).setOrigin(0.5);
            this.costTexts.push(costText);
        });

        // Divider before totals
        this.add.rectangle(GAME_WIDTH / 2, rowStartY + STORE_ITEMS.length * rowH, GAME_WIDTH - 100, 2, COLORS.TRAIL_BROWN);

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
        const btnY = GAME_HEIGHT - 50;
        this.startBtn = this.add.rectangle(GAME_WIDTH / 2, btnY, 340, 52, COLORS.GRASS_GREEN)
            .setInteractive({ useHandCursor: true });
        this.startBtnText = this.add.text(GAME_WIDTH / 2, btnY, 'Begin Journey →', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '22px',
        }).setOrigin(0.5);

        this.startBtn.on('pointerover', () => this.startBtn.setFillStyle(COLORS.SKY_BLUE));
        this.startBtn.on('pointerout', () => this.startBtn.setFillStyle(COLORS.GRASS_GREEN));
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
