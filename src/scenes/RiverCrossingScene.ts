import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES } from '../utils/constants';
import { MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';
import { getNextLandmark } from '../game/TrailData';

type CrossingMethod = 'ford' | 'caulk' | 'ferry' | 'wait';

interface MethodDef {
    id: CrossingMethod;
    label: string;
    desc: string;
    cost: number; // money cost
    risk: number; // 0-1 probability of bad outcome
}

const FERRY_COST = 5;

export class RiverCrossingScene extends Scene {
    private riverName: string = 'River';
    private resultText!: Phaser.GameObjects.Text;
    private resolved: boolean = false;

    constructor() {
        super(SCENES.RIVER_CROSSING);
    }

    create(): void {
        this.resolved = false;
        const gs = GameState.getInstance();

        // Find which river we're at
        const landmark = getNextLandmark(gs.milesTraveled - 1);
        this.riverName = landmark?.name ?? 'River';
        const depth = this.getRiverDepth();

        // Background — river scene
        this.cameras.main.setBackgroundColor(0x2266aa);
        // Sky
        this.add.rectangle(GAME_WIDTH / 2, 130, GAME_WIDTH, 260, 0x4a90d9);
        // River
        this.add.rectangle(GAME_WIDTH / 2, 380, GAME_WIDTH, 200, 0x1a5580);
        // River shimmer lines
        for (let i = 0; i < 6; i++) {
            this.add.rectangle(
                Phaser.Math.Between(50, GAME_WIDTH - 50),
                Phaser.Math.Between(310, 460),
                Phaser.Math.Between(60, 200), 3, 0x4499cc, 0.5
            );
        }
        // Near bank (bottom)
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 40, GAME_WIDTH, 80, COLORS.TRAIL_BROWN);
        // Far bank (top of river)
        this.add.rectangle(GAME_WIDTH / 2, 280, GAME_WIDTH, 20, COLORS.TRAIL_BROWN);

        // Title
        this.add.rectangle(GAME_WIDTH / 2, 36, GAME_WIDTH, 60, 0x000000, 0.7);
        this.add.text(GAME_WIDTH / 2, 36, this.riverName, {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '26px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);

        // Depth info
        const depthDesc = depth < 2 ? 'Shallow' : depth < 4 ? 'Moderate' : depth < 6 ? 'Deep' : 'Very Deep';
        this.add.text(GAME_WIDTH / 2, 62, `Depth: ${depthDesc} (${depth} ft) • Current: ${this.getCurrentStr(depth)}`, {
            ...TEXT_STYLES.HUD,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '13px',
        }).setOrigin(0.5);

        // Instruction
        this.add.text(GAME_WIDTH / 2, 100, 'How will you cross?', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '18px',
        }).setOrigin(0.5);

        // Choice buttons
        const methods = this.getMethods(depth, gs.supplies.money);
        const btnW = 420, btnH = 70, startY = 160, spacing = 88;

        methods.forEach((method, i) => {
            const y = startY + i * spacing;
            const canAfford = method.cost === 0 || gs.supplies.money >= method.cost;
            const color = canAfford ? COLORS.DARK_BROWN : 0x555555;

            const btn = this.add.rectangle(GAME_WIDTH / 2, y, btnW, btnH, color);
            if (canAfford) {
                btn.setInteractive({ useHandCursor: true });
                btn.on('pointerover', () => btn.setFillStyle(COLORS.TRAIL_BROWN));
                btn.on('pointerout', () => btn.setFillStyle(COLORS.DARK_BROWN));
                btn.on('pointerdown', () => this.cross(method));
            }
            btn.setStrokeStyle(2, COLORS.TRAIL_BROWN);

            // Label row
            this.add.text(GAME_WIDTH / 2 - btnW / 2 + 16, y - 14, method.label, {
                ...TEXT_STYLES.BODY,
                color: canAfford ? HEX_COLORS.PARCHMENT : '#888888',
                fontSize: '17px',
            });
            this.add.text(GAME_WIDTH / 2 - btnW / 2 + 16, y + 8, method.desc, {
                ...TEXT_STYLES.HUD,
                color: canAfford ? HEX_COLORS.TRAIL_BROWN : '#666666',
                fontSize: '13px',
            });

            if (method.cost > 0) {
                this.add.text(GAME_WIDTH / 2 + btnW / 2 - 12, y, `$${method.cost}`, {
                    ...TEXT_STYLES.BODY,
                    color: canAfford ? HEX_COLORS.GOLD : '#888888',
                    fontSize: '16px',
                }).setOrigin(1, 0.5);
            }

            // Risk indicator
            const riskColor = method.risk < 0.2 ? HEX_COLORS.GREEN :
                              method.risk < 0.5 ? HEX_COLORS.GOLD : HEX_COLORS.BLOOD_RED;
            const riskLabel = method.risk < 0.1 ? 'Safe' :
                              method.risk < 0.3 ? 'Low risk' :
                              method.risk < 0.55 ? 'Moderate risk' : 'High risk';
            this.add.text(GAME_WIDTH / 2 + btnW / 2 - 12, y + 14, riskLabel, {
                ...TEXT_STYLES.HUD,
                color: riskColor,
                fontSize: '12px',
            }).setOrigin(1, 0.5);
        });

        // Result text (shows after crossing)
        this.resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '', {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.PARCHMENT,
            fontSize: '16px',
            wordWrap: { width: GAME_WIDTH - 80 },
            align: 'center',
        }).setOrigin(0.5);
    }

    private getMethods(depth: number, money: number): MethodDef[] {
        return [
            {
                id: 'ford',
                label: 'Ford the River',
                desc: 'Wade across with your wagon. Fast but risky in deep water.',
                cost: 0,
                risk: depth < 3 ? 0.1 : depth < 5 ? 0.35 : 0.65,
            },
            {
                id: 'caulk',
                label: 'Caulk the Wagon and Float',
                desc: 'Seal your wagon and float it across. Steady but supplies may get wet.',
                cost: 0,
                risk: depth < 4 ? 0.15 : 0.30,
            },
            {
                id: 'ferry',
                label: 'Take the Ferry',
                desc: `Pay the ferryman to carry your wagon across safely.`,
                cost: FERRY_COST,
                risk: 0.02,
            },
            {
                id: 'wait',
                label: 'Wait for Lower Water',
                desc: 'Camp here and wait for conditions to improve. Costs 3 days.',
                cost: 0,
                risk: 0.0,
            },
        ];
    }

    private getRiverDepth(): number {
        // Rivers vary by location; inject some randomness
        return Math.floor(Math.random() * 5) + 2; // 2–6 ft
    }

    private getCurrentStr(depth: number): string {
        if (depth < 3) return 'Calm';
        if (depth < 5) return 'Swift';
        return 'Dangerous';
    }

    private cross(method: MethodDef): void {
        if (this.resolved) return;
        this.resolved = true;
        const gs = GameState.getInstance();
        let outcome = '';

        if (method.id === 'wait') {
            gs.advanceDay(); gs.advanceDay(); gs.advanceDay();
            outcome = 'You waited 3 days. The river has calmed and you cross safely.';
            this.showOutcome(outcome, true);
            return;
        }

        if (method.cost > 0) {
            gs.supplies.money = Math.max(0, gs.supplies.money - method.cost);
        }

        const bad = Math.random() < method.risk;
        if (!bad) {
            outcome = method.id === 'ford'
                ? 'Your wagon fords the river without incident!'
                : method.id === 'caulk'
                ? 'Your wagon floats across safely. Some minor water damage, nothing serious.'
                : 'The ferryman carries your wagon safely to the other side.';
            this.showOutcome(outcome, true);
        } else {
            // Bad outcome
            const roll2 = Math.random();
            if (roll2 < 0.4) {
                // Lose food
                const lost = Math.floor(Math.random() * 60) + 20;
                gs.supplies.food = Math.max(0, gs.supplies.food - lost);
                outcome = `The wagon tipped in the current! You lost ${lost} lbs of food.`;
            } else if (roll2 < 0.7) {
                // Lose spare parts / wagon damage
                gs.supplies.spareParts = Math.max(0, gs.supplies.spareParts - 1);
                outcome = 'The crossing was rough — a wagon part was lost in the river.';
            } else {
                // Party member injured
                const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD);
                if (alive.length > 0) {
                    const victim = alive[Math.floor(Math.random() * alive.length)];
                    victim.health = Math.max(0, victim.health - 35);
                    if (victim.health <= 0) victim.status = MemberStatus.DEAD;
                    outcome = `${victim.name} was swept by the current and seriously injured!`;
                } else {
                    outcome = 'The crossing was treacherous but your party survived.';
                }
            }
            this.showOutcome(outcome, false);
        }
    }

    private showOutcome(msg: string, good: boolean): void {
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
