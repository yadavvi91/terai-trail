/**
 * WP12 — Supply Depot Scene: Government Relief Camp where settlers buy supplies.
 */
import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS, DEPOT_PRICES } from '../utils/constants';
import { GameState } from '../game/GameState';

interface SupplyItem {
    key: keyof typeof DEPOT_PRICES;
    label: string;
    field: 'food' | 'bullocks' | 'shelterMaterials' | 'tools' | 'medicine';
    unit: string;
}

const ITEMS: SupplyItem[] = [
    { key: 'FOOD', label: 'Food Rations', field: 'food', unit: 'lbs' },
    { key: 'BULLOCKS', label: 'Bullocks', field: 'bullocks', unit: '' },
    { key: 'SHELTER_MATERIALS', label: 'Shelter Materials', field: 'shelterMaterials', unit: 'units' },
    { key: 'TOOLS', label: 'Tools (Axes, Plows)', field: 'tools', unit: 'units' },
    { key: 'MEDICINE', label: 'Medicine (Quinine)', field: 'medicine', unit: 'units' },
];

export class SupplyDepotScene extends Scene {
    private quantities: number[] = [0, 0, 0, 0, 0];
    private creditsText!: Phaser.GameObjects.Text;
    private qtyTexts: Phaser.GameObjects.Text[] = [];

    constructor() {
        super(SCENES.SUPPLY_DEPOT);
    }

    create(): void {
        this.quantities = [200, 2, 5, 3, 2]; // sensible defaults
        this.qtyTexts = [];

        this.cameras.main.setBackgroundColor(COLORS.DARK_BROWN);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.DARK_BROWN, 0.95);

        // Title
        this.add.text(GAME_WIDTH / 2, 30, 'Government Relief Depot', {
            ...TEXT_STYLES.TITLE,
            fontSize: '32px',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 70, 'Purchase supplies for your settlement with government credits', {
            ...TEXT_STYLES.BODY,
            fontSize: '14px',
            color: HEX_COLORS.CROP_GOLD,
        }).setOrigin(0.5);

        // Credits display
        this.creditsText = this.add.text(GAME_WIDTH / 2, 100, '', {
            ...TEXT_STYLES.SUBTITLE,
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5);

        // Item rows
        const startY = 150;
        ITEMS.forEach((item, i) => {
            const y = startY + i * 70;
            const price = DEPOT_PRICES[item.key];

            // Label
            this.add.text(100, y, item.label, {
                ...TEXT_STYLES.BODY,
                fontSize: '16px',
            }).setOrigin(0, 0.5);

            // Price
            this.add.text(380, y, `${price} credits/${item.unit || 'each'}`, {
                ...TEXT_STYLES.BODY,
                fontSize: '14px',
                color: HEX_COLORS.CROP_GOLD,
            }).setOrigin(0, 0.5);

            // Decrease button
            const decBtn = this.add.text(560, y, ' - ', {
                ...TEXT_STYLES.BODY,
                fontSize: '22px',
                backgroundColor: '#4a3728',
                padding: { x: 8, y: 2 },
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            decBtn.on('pointerdown', () => this.adjustQty(i, -this.getStep(item)));

            // Quantity
            const qtyText = this.add.text(630, y, '', {
                ...TEXT_STYLES.BODY,
                fontSize: '18px',
            }).setOrigin(0.5);
            this.qtyTexts.push(qtyText);

            // Increase button
            const incBtn = this.add.text(700, y, ' + ', {
                ...TEXT_STYLES.BODY,
                fontSize: '22px',
                backgroundColor: '#4a3728',
                padding: { x: 8, y: 2 },
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            incBtn.on('pointerdown', () => this.adjustQty(i, this.getStep(item)));
        });

        // Continue button
        const continueBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Begin Settlement', {
            ...TEXT_STYLES.BODY,
            fontSize: '22px',
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        continueBtn.on('pointerover', () => continueBtn.setColor(HEX_COLORS.WHITE));
        continueBtn.on('pointerout', () => continueBtn.setColor(HEX_COLORS.GOLD));
        continueBtn.on('pointerdown', () => this.purchaseAndStart());

        this.updateDisplay();
    }

    private getStep(item: SupplyItem): number {
        return item.key === 'FOOD' ? 10 : 1;
    }

    private adjustQty(index: number, delta: number): void {
        this.quantities[index] = Math.max(0, this.quantities[index] + delta);
        this.updateDisplay();
    }

    private getTotalCost(): number {
        return ITEMS.reduce((sum, item, i) => {
            return sum + this.quantities[i] * DEPOT_PRICES[item.key];
        }, 0);
    }

    private updateDisplay(): void {
        const gs = GameState.getInstance();
        const spent = this.getTotalCost();
        const remaining = gs.supplies.governmentCredits - spent;
        this.creditsText.setText(`Credits: ${remaining.toFixed(0)} / ${gs.supplies.governmentCredits}`);
        this.creditsText.setColor(remaining < 0 ? HEX_COLORS.BLOOD_RED : HEX_COLORS.GOLD);

        this.qtyTexts.forEach((txt, i) => {
            txt.setText(`${this.quantities[i]}`);
        });
    }

    private purchaseAndStart(): void {
        const gs = GameState.getInstance();
        const cost = this.getTotalCost();
        if (cost > gs.supplies.governmentCredits) return; // can't overspend

        gs.supplies.governmentCredits -= cost;
        ITEMS.forEach((item, i) => {
            (gs.supplies as any)[item.field] += this.quantities[i];
        });

        this.scene.start(SCENES.SETTLEMENT);
    }

    shutdown(): void {
        this.input.removeAllListeners();
        this.qtyTexts = [];
    }
}
