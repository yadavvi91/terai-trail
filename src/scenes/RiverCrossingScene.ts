import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES } from '../utils/constants';
import { MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';
import { getNextLandmark } from '../game/TrailData';
import { drawWagon, drawOx } from '../ui/DrawUtils';

type CrossingMethod = 'ford' | 'caulk' | 'ferry' | 'wait';

interface MethodDef {
    id: CrossingMethod;
    label: string;
    desc: string;
    cost: number;
    risk: number;
}

const FERRY_COST = 5;

export class RiverCrossingScene extends Scene {
    private riverName: string = 'River';
    private resultText!: Phaser.GameObjects.Text;
    private resultBg!: Phaser.GameObjects.Rectangle;
    private resolved: boolean = false;

    constructor() {
        super(SCENES.RIVER_CROSSING);
    }

    create(): void {
        this.resolved = false;
        const gs = GameState.getInstance();

        const landmark = getNextLandmark(gs.milesTraveled - 1);
        this.riverName = landmark?.name ?? 'River Crossing';
        const depth = this.getRiverDepth();

        this.buildRiverScene(depth);
        this.buildUI(depth, gs);
    }

    private buildRiverScene(depth: number): void {
        // Sky
        this.cameras.main.setBackgroundColor(0x5a8ab0);
        for (let i = 0; i < 8; i++) {
            const t = i / 7;
            const r = Math.round(0x5a + t * (0x87 - 0x5a));
            const g2 = Math.round(0x8a + t * (0xce - 0x8a));
            const b = Math.round(0xb0 + t * (0xe8 - 0xb0));
            this.add.rectangle(GAME_WIDTH / 2, 30 + i * 32, GAME_WIDTH, 34, (r << 16) | (g2 << 8) | b);
        }

        // Far bank (trees silhouette)
        const farBankG = this.add.graphics();
        farBankG.fillStyle(0x2a5a1a);
        farBankG.fillRect(0, 240, GAME_WIDTH, 28);
        // Tree line
        farBankG.fillStyle(0x1e4010);
        for (let i = 0; i < 22; i++) {
            const tx = i * 50 - 10;
            const th = Phaser.Math.Between(35, 65);
            farBankG.fillTriangle(tx, 240, tx + 18, 240 - th, tx + 36, 240);
        }

        // River water
        const riverG = this.add.graphics();
        // Base river color (darker if deep)
        const waterColor = depth > 4 ? 0x1a4a7a : depth > 2 ? 0x2262a0 : 0x3a80c8;
        riverG.fillStyle(waterColor);
        riverG.fillRect(0, 268, GAME_WIDTH, 200);

        // Water ripples / current lines
        riverG.lineStyle(1.5, 0x5aaad8, 0.4);
        for (let row = 0; row < 5; row++) {
            for (let i = 0; i < 8; i++) {
                const rx = i * 140 + (row % 2) * 70 + Phaser.Math.Between(-10, 10);
                const ry = 290 + row * 36;
                riverG.beginPath();
                (riverG as any).moveTo(rx, ry);
                (riverG as any).bezierCurveTo(rx + 20, ry - 5, rx + 40, ry + 5, rx + 60, ry);
                riverG.strokePath();
            }
        }

        // Near bank
        const nearBankG = this.add.graphics();
        nearBankG.fillStyle(0x9e7b3a);
        nearBankG.fillRect(0, 468, GAME_WIDTH, GAME_HEIGHT - 468);
        nearBankG.fillStyle(0x3d8b37);
        nearBankG.fillRect(0, GAME_HEIGHT - 80, GAME_WIDTH, 80);

        // Wagon waiting on bank
        const wG = this.add.graphics();
        drawOx(wG, GAME_WIDTH - 200, GAME_HEIGHT - 108, 0.65);
        drawOx(wG, GAME_WIDTH - 170, GAME_HEIGHT - 108, 0.65);
        drawWagon(wG, GAME_WIDTH - 130, GAME_HEIGHT - 108, 0.65);

        // Depth indicator post
        const postG = this.add.graphics();
        postG.fillStyle(0x8b6914);
        postG.fillRect(GAME_WIDTH / 2 - 3, 265, 6, 200);
        // Depth marks
        for (let d = 1; d <= 6; d++) {
            const markY = 265 + d * 30;
            postG.fillStyle(d <= depth ? 0x3a80c8 : 0xf5e6c8);
            postG.fillRect(GAME_WIDTH / 2 - 12, markY - 2, 24, 4);
        }
        this.add.text(GAME_WIDTH / 2 + 18, 265 + depth * 30, `${depth} ft`, {
            ...TEXT_STYLES.HUD,
            fontSize: '12px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0, 0.5);
    }

    private buildUI(depth: number, gs: GameState): void {
        // Title bar
        this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH, 60, 0x000000, 0.72);
        this.add.text(GAME_WIDTH / 2, 18, this.riverName, {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '24px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        const depthDesc = depth < 2 ? 'Very Shallow' : depth < 3 ? 'Shallow' : depth < 4 ? 'Moderate' : depth < 5 ? 'Deep' : 'Very Deep';
        const currentStr = depth < 3 ? 'Calm' : depth < 5 ? 'Swift' : 'Dangerous';
        this.add.text(GAME_WIDTH / 2, 44, `Depth: ${depthDesc} (${depth} ft)  •  Current: ${currentStr}`, {
            ...TEXT_STYLES.HUD,
            fontSize: '13px',
            color: HEX_COLORS.TRAIL_BROWN,
        }).setOrigin(0.5);

        // Choice panel
        const panelX = 380;
        const panelY = GAME_HEIGHT / 2 - 20;
        const panelW = 660;
        const panelH = 360;
        this.add.rectangle(panelX, panelY, panelW, panelH, 0x1a1208, 0.88);
        this.add.rectangle(panelX, panelY, panelW, panelH).setStrokeStyle(2, COLORS.TRAIL_BROWN);

        this.add.text(panelX, panelY - panelH / 2 + 22, 'How will you cross?', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '17px',
        }).setOrigin(0.5);

        const methods = this.getMethods(depth, gs.supplies.money);
        const btnW = panelW - 40;
        const btnH = 62;
        const btnStartY = panelY - panelH / 2 + 58;

        methods.forEach((method, i) => {
            const y = btnStartY + i * (btnH + 6);
            const canAfford = method.cost === 0 || gs.supplies.money >= method.cost;
            const baseColor = canAfford ? 0x3d2a14 : 0x1e1a14;

            const btn = this.add.rectangle(panelX, y, btnW, btnH, baseColor);
            btn.setStrokeStyle(1, canAfford ? 0x8b6914 : 0x555555, 0.8);

            if (canAfford) {
                btn.setInteractive({ useHandCursor: true });
                btn.on('pointerover', () => btn.setFillStyle(0x6a4a22));
                btn.on('pointerout', () => btn.setFillStyle(baseColor));
                btn.on('pointerdown', () => this.cross(method));
            }

            // Method icon
            const icons: Record<string, string> = { ford: '🚶', caulk: '🛶', ferry: '⛵', wait: '⏳' };
            this.add.text(panelX - btnW / 2 + 24, y, icons[method.id] ?? '▶', { fontSize: '22px' }).setOrigin(0.5);

            this.add.text(panelX - btnW / 2 + 58, y - 11, method.label, {
                ...TEXT_STYLES.BODY,
                color: canAfford ? HEX_COLORS.PARCHMENT : '#666666',
                fontSize: '16px',
            });
            this.add.text(panelX - btnW / 2 + 58, y + 9, method.desc, {
                ...TEXT_STYLES.HUD,
                color: canAfford ? HEX_COLORS.TRAIL_BROWN : '#555555',
                fontSize: '12px',
            });

            if (method.cost > 0) {
                this.add.text(panelX + btnW / 2 - 80, y - 10, `$${method.cost}`, {
                    ...TEXT_STYLES.BODY,
                    color: canAfford ? HEX_COLORS.GOLD : '#666666',
                    fontSize: '16px',
                }).setOrigin(0.5);
            }

            const riskColor = method.risk < 0.15 ? HEX_COLORS.GREEN :
                              method.risk < 0.4  ? HEX_COLORS.GOLD  : HEX_COLORS.BLOOD_RED;
            const riskLabel = method.risk < 0.05 ? '✓ Safe' :
                              method.risk < 0.2  ? '▲ Low risk' :
                              method.risk < 0.5  ? '⚠ Moderate' : '✖ High risk';
            this.add.text(panelX + btnW / 2 - 80, y + 10, riskLabel, {
                ...TEXT_STYLES.HUD,
                color: canAfford ? riskColor : '#555555',
                fontSize: '12px',
            }).setOrigin(0.5);
        });

        // Result display area
        this.resultBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 40, GAME_WIDTH, 50, 0x000000, 0.75);
        this.resultBg.setVisible(false);
        this.resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, '', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '16px',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 60 },
        }).setOrigin(0.5);
    }

    private getMethods(depth: number, money: number): MethodDef[] {
        return [
            { id: 'ford',  label: 'Ford the River',            desc: 'Wade across. Fast but risky if water is deep.',        cost: 0,          risk: depth < 3 ? 0.1 : depth < 5 ? 0.38 : 0.65 },
            { id: 'caulk', label: 'Caulk the Wagon and Float', desc: 'Seal the wagon and float it across.',                   cost: 0,          risk: depth < 4 ? 0.15 : 0.32 },
            { id: 'ferry', label: 'Take the Ferry',            desc: 'Pay the ferryman for a safe crossing.',                cost: FERRY_COST, risk: 0.02 },
            { id: 'wait',  label: 'Wait for Lower Water',      desc: 'Camp 3 days until conditions improve.',                cost: 0,          risk: 0.0 },
        ];
    }

    private getRiverDepth(): number {
        return Math.floor(Math.random() * 5) + 2;
    }

    private cross(method: MethodDef): void {
        if (this.resolved) return;
        this.resolved = true;
        const gs = GameState.getInstance();

        if (method.id === 'wait') {
            gs.advanceDay(); gs.advanceDay(); gs.advanceDay();
            this.showOutcome('You waited 3 days. The waters receded and you crossed safely.', true);
            return;
        }
        if (method.cost > 0) gs.supplies.money = Math.max(0, gs.supplies.money - method.cost);

        if (Math.random() >= method.risk) {
            const msgs: Record<string, string> = {
                ford:  'Your wagon fords the river! The wheels barely cleared the riverbed.',
                caulk: 'Your wagon floats across safely. Minor water seepage — nothing serious.',
                ferry: 'The ferryman carries your wagon across on a broad flat-boat.',
            };
            this.showOutcome(msgs[method.id] ?? 'You crossed safely!', true);
        } else {
            const roll = Math.random();
            let outcome = '';
            if (roll < 0.38) {
                const lost = Math.floor(Math.random() * 60) + 20;
                gs.supplies.food = Math.max(0, gs.supplies.food - lost);
                outcome = `The wagon tipped in the current! ${lost} lbs of food were swept away.`;
            } else if (roll < 0.68) {
                gs.supplies.spareParts = Math.max(0, gs.supplies.spareParts - 1);
                outcome = 'The crossing was rough — a wagon part was lost in the river.';
            } else {
                const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD);
                if (alive.length > 0) {
                    const victim = alive[Math.floor(Math.random() * alive.length)];
                    victim.health = Math.max(0, victim.health - 35);
                    if (victim.health <= 0) victim.status = MemberStatus.DEAD;
                    outcome = `${victim.name} was caught by the current and badly injured!`;
                } else {
                    outcome = 'The crossing was treacherous, but your party survived.';
                }
            }
            this.showOutcome(outcome, false);
        }
    }

    private showOutcome(msg: string, good: boolean): void {
        this.resultBg.setVisible(true);
        this.resultText.setText(msg);
        this.resultText.setColor(good ? HEX_COLORS.GREEN : HEX_COLORS.BLOOD_RED);
        this.time.delayedCall(2800, () => {
            this.scene.stop();
            this.scene.resume(SCENES.TRAVEL);
        });
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
