/**
 * WP11 — Party Creation Scene: Sikh refugee family setup + origin district selection.
 */
import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, TEXT_STYLES, HEX_COLORS, ORIGIN_DISTRICT_DATA } from '../utils/constants';
import { OriginDistrict } from '../utils/types';
import { GameState } from '../game/GameState';

const DEFAULT_NAMES = ['Harjeet Singh', 'Kamal Kaur', 'Baba Karam Singh', 'Preet', 'Geet'];
const ROLE_LABELS = ['Sardar (Head)', 'Wife', 'Elder Parent', 'Child 1', 'Child 2'];

export class PartyCreationScene extends Scene {
    private nameInputs: Phaser.GameObjects.DOMElement[] = [];
    private selectedDistrict: OriginDistrict = OriginDistrict.LAHORE;
    private districtCards: Phaser.GameObjects.Rectangle[] = [];

    constructor() {
        super(SCENES.PARTY_CREATION);
    }

    create(): void {
        this.nameInputs = [];
        this.districtCards = [];
        this.selectedDistrict = OriginDistrict.LAHORE;

        // Background
        this.cameras.main.setBackgroundColor(COLORS.JUNGLE_DARK);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.JUNGLE_DARK, 0.9);

        // Title
        this.add.text(GAME_WIDTH / 2, 30, 'Your Family', {
            ...TEXT_STYLES.TITLE,
            fontSize: '36px',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 68, 'Name the members of your refugee family', {
            ...TEXT_STYLES.BODY,
            fontSize: '14px',
            color: HEX_COLORS.CROP_GOLD,
        }).setOrigin(0.5);

        // Family member name inputs
        const startY = 100;
        for (let i = 0; i < 5; i++) {
            const y = startY + i * 52;

            this.add.text(200, y, ROLE_LABELS[i], {
                ...TEXT_STYLES.BODY,
                fontSize: '16px',
            }).setOrigin(0, 0.5);

            const input = this.add.dom(
                520, y,
                'input',
                'width: 200px; padding: 6px 10px; font-family: "Courier New", monospace; font-size: 14px; border: 1px solid #8a6a40; background: #2a2018; color: #f5e6c8;',
            );
            (input.node as HTMLInputElement).value = DEFAULT_NAMES[i];
            (input.node as HTMLInputElement).placeholder = `Name ${i + 1}`;
            this.nameInputs.push(input);
        }

        // Origin District Selection
        this.add.text(GAME_WIDTH / 2, 380, 'Origin District', {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '22px',
        }).setOrigin(0.5);

        const districts = [OriginDistrict.LAHORE, OriginDistrict.SIALKOT, OriginDistrict.LYALLPUR];
        const cardWidth = 260;
        const cardGap = 20;
        const totalW = districts.length * cardWidth + (districts.length - 1) * cardGap;
        const cardStartX = (GAME_WIDTH - totalW) / 2 + cardWidth / 2;

        districts.forEach((district, i) => {
            const cx = cardStartX + i * (cardWidth + cardGap);
            const cy = 490;
            const data = ORIGIN_DISTRICT_DATA[district];

            const card = this.add.rectangle(cx, cy, cardWidth, 140, COLORS.DARK_BROWN)
                .setStrokeStyle(2, this.selectedDistrict === district ? COLORS.GOLD : COLORS.PARCHMENT)
                .setInteractive({ useHandCursor: true });

            this.districtCards.push(card);

            this.add.text(cx, cy - 40, district, {
                ...TEXT_STYLES.BODY,
                fontSize: '18px',
                color: HEX_COLORS.GOLD,
            }).setOrigin(0.5);

            this.add.text(cx, cy, data.description, {
                ...TEXT_STYLES.BODY,
                fontSize: '11px',
                wordWrap: { width: cardWidth - 20 },
                align: 'center',
            }).setOrigin(0.5);

            card.on('pointerdown', () => {
                this.selectedDistrict = district;
                this.districtCards.forEach((c, j) => {
                    c.setStrokeStyle(2, j === i ? COLORS.GOLD : COLORS.PARCHMENT);
                });
            });
        });

        // Continue Button
        const continueBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'Proceed to Supply Depot', {
            ...TEXT_STYLES.BODY,
            fontSize: '20px',
            color: HEX_COLORS.GOLD,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        continueBtn.on('pointerover', () => continueBtn.setColor(HEX_COLORS.WHITE));
        continueBtn.on('pointerout', () => continueBtn.setColor(HEX_COLORS.GOLD));
        continueBtn.on('pointerdown', () => this.startGame());
    }

    private startGame(): void {
        const names = this.nameInputs.map((input, i) => {
            const val = (input.node as HTMLInputElement).value.trim();
            return val || DEFAULT_NAMES[i];
        });

        const gs = GameState.getInstance();
        gs.startGame(names, this.selectedDistrict);
        this.scene.start(SCENES.SUPPLY_DEPOT);
    }

    shutdown(): void {
        this.input.removeAllListeners();
        this.nameInputs = [];
        this.districtCards = [];
    }
}
