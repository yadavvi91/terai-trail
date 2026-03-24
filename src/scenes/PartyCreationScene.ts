import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS,
    Profession, PROFESSION_DATA,
} from '../utils/constants';
import { GameState } from '../game/GameState';

const MEMBER_LABELS = ['Trail Leader', 'Companion 2', 'Companion 3', 'Companion 4', 'Companion 5'];

export class PartyCreationScene extends Scene {
    private selectedProfession: Profession = Profession.BANKER;
    private nameInputs: HTMLInputElement[] = [];
    private professionBtns: Phaser.GameObjects.Rectangle[] = [];
    private professionLabels: Phaser.GameObjects.Text[] = [];
    private moneyText!: Phaser.GameObjects.Text;
    private errorText!: Phaser.GameObjects.Text;

    constructor() {
        super(SCENES.PARTY_CREATION);
    }

    create(): void {
        this.selectedProfession = Profession.BANKER;
        this.nameInputs = [];
        this.professionBtns = [];
        this.professionLabels = [];

        this.cameras.main.setBackgroundColor(COLORS.DARK_BROWN);

        // Parchment panel
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 80, GAME_HEIGHT - 60, COLORS.PARCHMENT);

        // Title
        this.add.text(GAME_WIDTH / 2, 48, 'Before you set off on the trail...', {
            ...TEXT_STYLES.SUBTITLE,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '22px',
        }).setOrigin(0.5);

        // --- Profession picker ---
        this.add.text(GAME_WIDTH / 2, 88, 'Choose your profession:', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
        }).setOrigin(0.5);

        const professions = [Profession.BANKER, Profession.CARPENTER, Profession.FARMER];
        const cardW = 240, cardH = 80, cardY = 145;
        const cardSpacing = 270;
        const cardStartX = GAME_WIDTH / 2 - cardSpacing;

        professions.forEach((prof, i) => {
            const x = cardStartX + i * cardSpacing;
            const data = PROFESSION_DATA[prof];

            const card = this.add.rectangle(x, cardY, cardW, cardH, COLORS.TRAIL_BROWN)
                .setInteractive({ useHandCursor: true });
            this.professionBtns.push(card);

            const label = this.add.text(x, cardY - 16, prof, {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '20px',
            }).setOrigin(0.5);

            this.add.text(x, cardY + 8, `$${data.startingMoney.toLocaleString()}`, {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.GOLD,
                fontSize: '16px',
            }).setOrigin(0.5);

            this.add.text(x, cardY + 28, data.bonus, {
                ...TEXT_STYLES.HUD,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '13px',
            }).setOrigin(0.5);

            this.professionLabels.push(label);

            card.on('pointerdown', () => this.selectProfession(prof));
            card.on('pointerover', () => { if (this.selectedProfession !== prof) card.setFillStyle(COLORS.GRASS_GREEN); });
            card.on('pointerout', () => { if (this.selectedProfession !== prof) card.setFillStyle(COLORS.TRAIL_BROWN); });
        });

        // Highlight default
        this.selectProfession(Profession.BANKER, false);

        // Money display
        this.moneyText = this.add.text(GAME_WIDTH / 2, 200, '', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
        }).setOrigin(0.5);
        this.updateMoneyText();

        // --- Name inputs via DOM ---
        this.add.text(GAME_WIDTH / 2, 228, 'Name your party members:', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
        }).setOrigin(0.5);

        const inputStartY = 260;
        const inputSpacing = 58;
        const labelX = 160;
        const inputX = GAME_WIDTH / 2;

        for (let i = 0; i < 5; i++) {
            const y = inputStartY + i * inputSpacing;

            this.add.text(labelX, y, MEMBER_LABELS[i] + ':', {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.DARK_BROWN,
                fontSize: '17px',
            }).setOrigin(0, 0.5);

            const inputEl = document.createElement('input');
            inputEl.type = 'text';
            inputEl.maxLength = 20;
            inputEl.placeholder = i === 0 ? 'Your name' : `Companion ${i + 1}`;
            inputEl.style.cssText = [
                'width: 260px',
                'height: 32px',
                'font-family: "Courier New", monospace',
                'font-size: 16px',
                'background: #f5e6c8',
                'color: #4a3728',
                'border: 2px solid #8b6914',
                'border-radius: 3px',
                'padding: 0 8px',
                'outline: none',
                'box-sizing: border-box',
            ].join(';');

            const domEl = this.add.dom(inputX + 40, y).setElement(inputEl);
            domEl.setOrigin(0.5, 0.5);
            this.nameInputs.push(inputEl);
        }

        // Error message
        this.errorText = this.add.text(GAME_WIDTH / 2, 565, '', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.BLOOD_RED,
            fontSize: '16px',
        }).setOrigin(0.5);

        // Continue button
        const btnY = 600;
        const btn = this.add.rectangle(GAME_WIDTH / 2, btnY, 300, 50, COLORS.TRAIL_BROWN)
            .setInteractive({ useHandCursor: true });
        this.add.text(GAME_WIDTH / 2, btnY, 'Set Out on the Trail →', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '20px',
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(COLORS.GRASS_GREEN));
        btn.on('pointerout', () => btn.setFillStyle(COLORS.TRAIL_BROWN));
        btn.on('pointerdown', () => this.handleContinue());

        this.input.keyboard?.on('keydown-ENTER', () => this.handleContinue());
    }

    private selectProfession(prof: Profession, updateMoney: boolean = true): void {
        this.selectedProfession = prof;
        const professions = [Profession.BANKER, Profession.CARPENTER, Profession.FARMER];
        professions.forEach((p, i) => {
            this.professionBtns[i]?.setFillStyle(p === prof ? COLORS.SKY_BLUE : COLORS.TRAIL_BROWN);
        });
        if (updateMoney) this.updateMoneyText();
    }

    private updateMoneyText(): void {
        const money = PROFESSION_DATA[this.selectedProfession].startingMoney;
        this.moneyText?.setText(`Starting money: $${money.toLocaleString()}`);
    }

    private handleContinue(): void {
        const names = this.nameInputs.map(inp => inp.value.trim());
        if (!names[0]) {
            this.errorText.setText('Please enter a name for your Trail Leader.');
            return;
        }
        // Fill unnamed companions with defaults
        for (let i = 1; i < 5; i++) {
            if (!names[i]) names[i] = `Companion ${i + 1}`;
        }

        GameState.getInstance().startGame(names, this.selectedProfession);
        this.scene.start(SCENES.STORE);
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
        // Remove DOM inputs
        this.nameInputs.forEach(inp => inp.remove());
        this.nameInputs = [];
    }
}
