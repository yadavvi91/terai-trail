import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS,
    Profession, PROFESSION_DATA,
} from '../utils/constants';
import { GameState } from '../game/GameState';
import { drawMountain, drawHill, drawTree, drawCloud, drawSun } from '../ui/DrawUtils';

const MEMBER_LABELS = ['Trail Leader', 'Companion 2', 'Companion 3', 'Companion 4', 'Companion 5'];

const PROFESSION_ICONS: Record<Profession, string> = {
    [Profession.BANKER]:    '💰',
    [Profession.CARPENTER]: '🔨',
    [Profession.FARMER]:    '🌾',
};

const PROFESSION_DETAILS: Record<Profession, string[]> = {
    [Profession.BANKER]:    ['$1,600 starting funds', 'Easiest difficulty', 'Score ×1'],
    [Profession.CARPENTER]: ['$800 starting funds', 'Wagon repair bonus', 'Score ×2'],
    [Profession.FARMER]:    ['$400 starting funds', 'Hardest difficulty', 'Score ×3'],
};

export class PartyCreationScene extends Scene {
    private selectedProfession: Profession = Profession.BANKER;
    private nameInputs: HTMLInputElement[] = [];
    private cardBgs: Phaser.GameObjects.Rectangle[] = [];
    private cardBorders: Phaser.GameObjects.Rectangle[] = [];
    private moneyText!: Phaser.GameObjects.Text;
    private errorText!: Phaser.GameObjects.Text;

    constructor() {
        super(SCENES.PARTY_CREATION);
    }

    create(): void {
        this.selectedProfession = Profession.BANKER;
        this.nameInputs = [];
        this.cardBgs = [];
        this.cardBorders = [];

        this.buildBackground();
        this.buildMainPanel();
    }

    private buildBackground(): void {
        const groundY = GAME_HEIGHT - 60;

        // Sky gradient — deeper blue at top
        this.cameras.main.setBackgroundColor(0x0d3a6e);
        for (let i = 0; i < 12; i++) {
            const t = i / 11;
            const r = Math.round(0x0d + t * (0x70 - 0x0d));
            const gv = Math.round(0x3a + t * (0xb4 - 0x3a));
            const b = Math.round(0x6e + t * (0xd8 - 0x6e));
            this.add.rectangle(GAME_WIDTH / 2, 26 + i * 38, GAME_WIDTH, 40, (r << 16) | (gv << 8) | b);
        }
        // Horizon glow
        this.add.rectangle(GAME_WIDTH / 2, groundY - 10, GAME_WIDTH, 25, 0xf0c880, 0.18);

        const sunG = this.add.graphics();
        drawSun(sunG, 110, 78, 36);

        const cloudG = this.add.graphics();
        drawCloud(cloudG, 300, 50, 0.78);
        drawCloud(cloudG, 580, 34, 0.6);
        drawCloud(cloudG, 820, 60, 0.7);

        const mtnG = this.add.graphics();
        drawMountain(mtnG, 80,  groundY + 8, 180, 155, 0x8090a8, true);
        drawMountain(mtnG, 240, groundY + 8, 220, 180, 0x6a7fa8, true);
        drawMountain(mtnG, 460, groundY + 8, 260, 210, 0x5a7098, true);
        drawMountain(mtnG, 700, groundY + 8, 200, 172, 0x7a8fb8, true);
        drawMountain(mtnG, 920, groundY + 8, 240, 195, 0x607898, true);

        const hillG = this.add.graphics();
        drawHill(hillG, 100,  groundY + 8, 200, 0x2d6428);
        drawHill(hillG, 340,  groundY + 8, 190, 0x337030);
        drawHill(hillG, 580,  groundY + 8, 220, 0x2d6428);
        drawHill(hillG, 820,  groundY + 8, 195, 0x337030);
        drawHill(hillG, 1020, groundY + 8, 175, 0x2d6428);

        // Trees silhouetted on hillsides
        const treeG = this.add.graphics();
        drawTree(treeG, 55,  groundY + 2, 58, 0x234d1a, false);
        drawTree(treeG, 88,  groundY - 6, 70, 0x2a5820, false);
        drawTree(treeG, 920, groundY + 2, 62, 0x234d1a, true);
        drawTree(treeG, 956, groundY - 4, 68, 0x2a5820, false);
        drawTree(treeG, 990, groundY - 8, 78, 0x234d1a, false);

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 18, GAME_WIDTH, 80, 0x3a7d30);
        this.add.rectangle(GAME_WIDTH / 2, groundY + 14, GAME_WIDTH, 20, 0x9e7b3a);
    }

    private buildMainPanel(): void {
        // Semi-transparent scroll/parchment panel
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, GAME_WIDTH - 40, GAME_HEIGHT - 30, 0x1a0e06, 0.72);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, GAME_WIDTH - 44, GAME_HEIGHT - 34, 0xf0ddb8, 0.94);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, GAME_WIDTH - 44, GAME_HEIGHT - 34).setStrokeStyle(3, 0x8b6914);
        // Inner decorative border
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, GAME_WIDTH - 58, GAME_HEIGHT - 48).setStrokeStyle(1, 0xb89050, 0.5);

        // Header with ornamental line
        this.add.text(GAME_WIDTH / 2, 36, 'BEFORE YOU SET OFF ON THE TRAIL', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '18px',
            color: HEX_COLORS.DARK_BROWN,
            letterSpacing: 3,
        }).setOrigin(0.5);
        this.add.rectangle(GAME_WIDTH / 2, 58, GAME_WIDTH - 100, 2, 0xb89050);
        this.add.rectangle(GAME_WIDTH / 2, 62, GAME_WIDTH - 120, 1, 0xb89050, 0.4);

        this.buildProfessionCards();
        this.buildNameFields();

        // Error text
        this.errorText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 62, '', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.BLOOD_RED,
            fontSize: '14px',
        }).setOrigin(0.5);

        // Begin button
        this.buildBeginButton();
    }

    private buildProfessionCards(): void {
        this.add.text(GAME_WIDTH / 2, 80, 'Choose your profession:', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '16px',
        }).setOrigin(0.5);

        const professions = [Profession.BANKER, Profession.CARPENTER, Profession.FARMER];
        const cardW = 256, cardH = 120, cardY = 160;
        const spacing = 280;
        const startX = GAME_WIDTH / 2 - spacing;

        professions.forEach((prof, i) => {
            const x = startX + i * spacing;
            const data = PROFESSION_DATA[prof];

            // Card shadow
            this.add.rectangle(x + 4, cardY + 4, cardW, cardH, 0x000000, 0.3);

            // Card background
            const cardBg = this.add.rectangle(x, cardY, cardW, cardH, 0x4a3020)
                .setInteractive({ useHandCursor: true });
            this.cardBgs.push(cardBg);

            // Card border (selection indicator)
            const cardBorder = this.add.rectangle(x, cardY, cardW, cardH).setStrokeStyle(3, 0x8b6914);
            this.cardBorders.push(cardBorder);

            // Top strip (color by profession)
            const stripColors: Record<Profession, number> = {
                [Profession.BANKER]:    0x8b7020,
                [Profession.CARPENTER]: 0x5a3a1a,
                [Profession.FARMER]:    0x3a6a20,
            };
            this.add.rectangle(x, cardY - cardH / 2 + 22, cardW, 44, stripColors[prof]);

            // Icon
            this.add.text(x - cardW / 2 + 30, cardY - cardH / 2 + 22, PROFESSION_ICONS[prof], {
                fontSize: '26px',
            }).setOrigin(0.5);

            // Profession name
            this.add.text(x + 10, cardY - cardH / 2 + 22, prof.toUpperCase(), {
                ...TEXT_STYLES.SUBTITLE,
                fontSize: '17px',
                color: HEX_COLORS.PARCHMENT,
                letterSpacing: 2,
            }).setOrigin(0.5);

            // Money
            this.add.text(x, cardY - 8, `$${data.startingMoney.toLocaleString()}`, {
                ...TEXT_STYLES.BODY,
                fontSize: '22px',
                color: HEX_COLORS.GOLD,
                shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 4, fill: true },
            }).setOrigin(0.5);

            // Details
            PROFESSION_DETAILS[prof].forEach((line, li) => {
                this.add.text(x, cardY + 16 + li * 14, line, {
                    ...TEXT_STYLES.HUD,
                    fontSize: '12px',
                    color: li === 2 ? HEX_COLORS.GOLD : HEX_COLORS.TRAIL_BROWN,
                }).setOrigin(0.5);
            });

            cardBg.on('pointerdown', () => this.selectProfession(prof));
            cardBg.on('pointerover', () => { if (this.selectedProfession !== prof) cardBg.setFillStyle(0x6a4a2a); });
            cardBg.on('pointerout',  () => { if (this.selectedProfession !== prof) cardBg.setFillStyle(0x4a3020); });
        });

        this.moneyText = this.add.text(GAME_WIDTH / 2, 232, '', {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '14px',
        }).setOrigin(0.5);

        this.selectProfession(Profession.BANKER, false);
        this.updateMoneyText();
    }

    private buildNameFields(): void {
        this.add.rectangle(GAME_WIDTH / 2, 256, GAME_WIDTH - 80, 2, 0xb89050, 0.5);

        this.add.text(GAME_WIDTH / 2, 270, 'Name your party members:', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '16px',
        }).setOrigin(0.5);

        // Two-column layout: labels on left, inputs centered
        const col1X = 170;
        const inputX = GAME_WIDTH / 2 + 40;
        const startY = 302;
        const rowH = 58;

        for (let i = 0; i < 5; i++) {
            const y = startY + i * rowH;

            // Row background (alternating)
            if (i % 2 === 0) {
                this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 100, rowH - 6, 0x000000, 0.04);
            }

            // Number badge
            this.add.rectangle(52, y, 28, 28, 0x8b6914);
            this.add.text(52, y, String(i + 1), {
                ...TEXT_STYLES.BODY,
                fontSize: '16px',
                color: HEX_COLORS.PARCHMENT,
            }).setOrigin(0.5);

            // Label
            this.add.text(col1X, y, MEMBER_LABELS[i], {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.DARK_BROWN,
                fontSize: '16px',
            }).setOrigin(0, 0.5);

            // DOM input
            const inputEl = document.createElement('input');
            inputEl.type = 'text';
            inputEl.maxLength = 20;
            inputEl.placeholder = i === 0 ? 'Your name (required)' : `Optional — defaults to "Companion ${i + 1}"`;
            inputEl.style.cssText = [
                'width: 300px',
                'height: 34px',
                'font-family: "Courier New", monospace',
                'font-size: 15px',
                'background: rgba(245,230,200,0.92)',
                'color: #4a3728',
                'border: 2px solid #8b6914',
                'border-radius: 4px',
                'padding: 0 10px',
                'outline: none',
                'box-sizing: border-box',
                'transition: border-color 0.15s',
            ].join(';');

            inputEl.addEventListener('focus', () => { inputEl.style.borderColor = '#c8a040'; });
            inputEl.addEventListener('blur',  () => { inputEl.style.borderColor = '#8b6914'; });

            const dom = this.add.dom(inputX + 50, y).setElement(inputEl);
            dom.setOrigin(0.5, 0.5);
            this.nameInputs.push(inputEl);
        }
    }

    private buildBeginButton(): void {
        const btnY = GAME_HEIGHT - 36;
        const btnW = 320, btnH = 50;

        // Shadow
        this.add.rectangle(GAME_WIDTH / 2 + 3, btnY + 3, btnW, btnH, 0x000000, 0.35);

        const btn = this.add.rectangle(GAME_WIDTH / 2, btnY, btnW, btnH, 0x3d7830)
            .setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(2, COLORS.GOLD);

        const label = this.add.text(GAME_WIDTH / 2, btnY, 'Set Out on the Trail  →', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '20px',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 4, fill: true },
        }).setOrigin(0.5);

        btn.on('pointerover', () => { btn.setFillStyle(0x56a844); label.setColor(HEX_COLORS.GOLD); });
        btn.on('pointerout',  () => { btn.setFillStyle(0x3d7830); label.setColor(HEX_COLORS.PARCHMENT); });
        btn.on('pointerdown', () => this.handleContinue());
        this.input.keyboard?.on('keydown-ENTER', () => this.handleContinue());
    }

    private selectProfession(prof: Profession, animate: boolean = true): void {
        this.selectedProfession = prof;
        const professions = [Profession.BANKER, Profession.CARPENTER, Profession.FARMER];
        professions.forEach((p, i) => {
            const selected = p === prof;
            this.cardBgs[i]?.setFillStyle(selected ? 0x6a4a2a : 0x4a3020);
            this.cardBorders[i]?.setStrokeStyle(selected ? 3 : 2, selected ? COLORS.GOLD : 0x8b6914);
            if (selected && animate) {
                this.tweens.add({ targets: this.cardBgs[i], scaleY: 1.04, duration: 80, yoyo: true });
            }
        });
        this.updateMoneyText();
    }

    private updateMoneyText(): void {
        const money = PROFESSION_DATA[this.selectedProfession].startingMoney;
        this.moneyText?.setText(`Starting money: $${money.toLocaleString()}  •  Profession: ${this.selectedProfession}`);
    }

    private handleContinue(): void {
        const names = this.nameInputs.map(inp => inp.value.trim());
        if (!names[0]) {
            this.errorText.setText('⚠  Please enter a name for your Trail Leader.');
            this.tweens.add({ targets: this.errorText, alpha: 0, duration: 3000, onComplete: () => this.errorText.setAlpha(1) });
            return;
        }
        for (let i = 1; i < 5; i++) {
            if (!names[i]) names[i] = `Companion ${i + 1}`;
        }
        GameState.getInstance().startGame(names, this.selectedProfession);
        this.scene.start(SCENES.STORE);
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
        this.nameInputs.forEach(inp => inp.remove());
        this.nameInputs = [];
    }
}
