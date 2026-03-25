import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES,
    MILES_PER_DAY, FOOD_PER_PERSON_PER_DAY, TOTAL_TRAIL_MILES,
} from '../utils/constants';
import { Pace, Rations, Weather, MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';
import { getNextLandmark } from '../game/TrailData';
import { drawWagon, drawOx, drawPerson, drawWoman, drawChild, drawPig, drawTree, drawMountain, drawHill, drawCloud, drawSun } from '../ui/DrawUtils';
import { addMuteButton } from '../ui/MuteButton';
import { SoundManager } from '../audio/SoundManager';

const TICK_MS = 1200;
const GROUND_Y = GAME_HEIGHT - 80;

// Scrollable layer item
interface ScrollLayer {
    g: Phaser.GameObjects.Graphics;
    baseX: number;
    width: number;
    speed: number; // px per scroll unit
}

export class TravelScene extends Scene {
    // Parallax layers
    private mtnLayers: ScrollLayer[] = [];
    private hillLayers: ScrollLayer[] = [];
    private groundLayers: ScrollLayer[] = [];
    private cloudLayers: { g: Phaser.GameObjects.Graphics; x: number; speed: number }[] = [];
    private sunG!: Phaser.GameObjects.Graphics;
    private scrollOffset: number = 0;

    // Wagon graphics (redrawn each tick)
    private wagonG!: Phaser.GameObjects.Graphics;
    private dustG!: Phaser.GameObjects.Graphics;
    private dustParticles: { x: number; y: number; alpha: number; r: number }[] = [];
    private isMoving: boolean = false;
    private walkFrame: number = 0;
    private walkTimer: number = 0;

    // HUD
    private dateText!: Phaser.GameObjects.Text;
    private milesText!: Phaser.GameObjects.Text;
    private nextText!: Phaser.GameObjects.Text;
    private weatherText!: Phaser.GameObjects.Text;
    private healthText!: Phaser.GameObjects.Text;
    private foodText!: Phaser.GameObjects.Text;
    private paceText!: Phaser.GameObjects.Text;
    private rationsText!: Phaser.GameObjects.Text;
    private statusMsg!: Phaser.GameObjects.Text;
    private milesBar!: Phaser.GameObjects.Rectangle;

    private tickTimer!: Phaser.Time.TimerEvent;
    private paused: boolean = false;
    private wagonRollTick: number = 0;
    private speedText!: Phaser.GameObjects.Text;

    constructor() {
        super(SCENES.TRAVEL);
    }

    create(): void {
        this.paused = false;
        this.scrollOffset = 0;
        this.isMoving = false;
        this.dustParticles = [];
        this.mtnLayers = [];
        this.hillLayers = [];
        this.groundLayers = [];
        this.cloudLayers = [];
        this.walkFrame = 0;
        this.walkTimer = 0;

        this.buildSky();
        this.buildParallax();
        this.buildGroundAndTrail();
        this.buildWagon();
        this.buildHUD();
        this.buildControls();

        addMuteButton(this);

        this.tickTimer = this.time.addEvent({
            delay: TICK_MS,
            callback: this.dailyTick,
            callbackScope: this,
            loop: true,
        });
        this.updateHUD();
    }

    // ─── Sky ───────────────────────────────────────────────────────────────────

    private buildSky(): void {
        this.cameras.main.setBackgroundColor(0x0d3a6e);
        const skySteps = 14;
        for (let i = 0; i < skySteps; i++) {
            const t = i / (skySteps - 1);
            const r = Math.round(0x0d + t * (0x70 - 0x0d));
            const gv = Math.round(0x3a + t * (0xb4 - 0x3a));
            const b = Math.round(0x6e + t * (0xd8 - 0x6e));
            this.add.rectangle(GAME_WIDTH / 2, (i + 0.5) * (GROUND_Y / skySteps), GAME_WIDTH, GROUND_Y / skySteps + 2, (r << 16) | (gv << 8) | b);
        }
        // Horizon glow
        this.add.rectangle(GAME_WIDTH / 2, GROUND_Y - 12, GAME_WIDTH, 28, 0xf0c890, 0.18);
        this.add.rectangle(GAME_WIDTH / 2, GROUND_Y - 2, GAME_WIDTH, 14, 0xf0b060, 0.14);

        this.sunG = this.add.graphics();
        drawSun(this.sunG, GAME_WIDTH - 110, 80, 42);

        // Clouds
        const cloudPositions = [
            { x: 150, y: 55, s: 0.85 },
            { x: 480, y: 38, s: 0.7 },
            { x: 780, y: 70, s: 1.0 },
            { x: 1050, y: 45, s: 0.65 },
        ];
        cloudPositions.forEach((pos) => {
            const g = this.add.graphics();
            drawCloud(g, pos.x, pos.y, pos.s);
            this.cloudLayers.push({ g, x: pos.x, speed: 0.008 + Math.random() * 0.006 });
        });
    }

    // ─── Parallax mountains + hills ───────────────────────────────────────────

    private buildParallax(): void {
        // Far mountains — 2 sets side by side so we can scroll endlessly
        for (let pass = 0; pass < 2; pass++) {
            const g = this.add.graphics();
            const baseX = pass * (GAME_WIDTH + 100);
            this.drawMountainLayer(g, baseX);
            this.mtnLayers.push({ g, baseX, width: GAME_WIDTH + 100, speed: 0.18 });
        }

        // Near hills — 2 sets
        for (let pass = 0; pass < 2; pass++) {
            const g = this.add.graphics();
            const baseX = pass * (GAME_WIDTH + 60);
            this.drawHillLayer(g, baseX);
            this.hillLayers.push({ g, baseX, width: GAME_WIDTH + 60, speed: 0.55 });
        }
    }

    private drawMountainLayer(g: Phaser.GameObjects.Graphics, offsetX: number): void {
        drawMountain(g, offsetX + 150, GROUND_Y + 10, 240, 200, 0x6a7fa8, true);
        drawMountain(g, offsetX + 370, GROUND_Y + 10, 200, 180, 0x5a7098, true);
        drawMountain(g, offsetX + 560, GROUND_Y + 10, 280, 220, 0x7a8fb8, true);
        drawMountain(g, offsetX + 780, GROUND_Y + 10, 220, 195, 0x607898, true);
        drawMountain(g, offsetX + 960, GROUND_Y + 10, 260, 205, 0x6a8098, true);
    }

    private drawHillLayer(g: Phaser.GameObjects.Graphics, offsetX: number): void {
        drawHill(g, offsetX + 100,  GROUND_Y + 8, 240, 0x2d6428);
        drawHill(g, offsetX + 330,  GROUND_Y + 8, 200, 0x337030);
        drawHill(g, offsetX + 520,  GROUND_Y + 8, 260, 0x2d6428);
        drawHill(g, offsetX + 740,  GROUND_Y + 8, 220, 0x337030);
        drawHill(g, offsetX + 940,  GROUND_Y + 8, 180, 0x2d6428);
        drawHill(g, offsetX + 1080, GROUND_Y + 8, 200, 0x337030);
        // Trees on hillsides
        drawTree(g, offsetX + 60,  GROUND_Y + 4, 62, 0x234d1a, false);
        drawTree(g, offsetX + 90,  GROUND_Y - 4, 74, 0x2a5820, false);
        drawTree(g, offsetX + 280, GROUND_Y + 2, 55, 0x234d1a, false);
        drawTree(g, offsetX + 480, GROUND_Y - 2, 68, 0x2a5820, false);
        drawTree(g, offsetX + 510, GROUND_Y + 4, 58, 0x234d1a, true);  // pine
        drawTree(g, offsetX + 720, GROUND_Y - 4, 72, 0x2a5820, false);
        drawTree(g, offsetX + 900, GROUND_Y + 2, 60, 0x234d1a, true);
        drawTree(g, offsetX + 930, GROUND_Y - 6, 80, 0x2a5820, false);
    }

    // ─── Ground & trail ────────────────────────────────────────────────────────

    private buildGroundAndTrail(): void {
        // Green ground with subtle gradient
        this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 5, GAME_WIDTH, 14, 0x4a9038, 0.5);
        this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 50, GAME_WIDTH, 100, 0x3a7d30);

        // Dirt trail
        this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 16, GAME_WIDTH, 30, 0x9e7b3a);
        // Trail edge blending
        this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 4, GAME_WIDTH, 4, 0x7a6830, 0.5);
        this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 30, GAME_WIDTH, 4, 0x7a6830, 0.5);

        // Trail ruts (wheel tracks)
        this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 10, GAME_WIDTH, 3, 0x6a4e20);
        this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 24, GAME_WIDTH, 3, 0x6a4e20);

        // Scrolling grass tufts + wildflowers (2 sets for seamless scroll)
        for (let pass = 0; pass < 2; pass++) {
            const g = this.add.graphics();
            const baseX = pass * (GAME_WIDTH + 40);
            for (let i = 0; i < 28; i++) {
                const gx = baseX + (i / 28) * (GAME_WIDTH + 40);
                const gy = GROUND_Y + 32 + (i % 3) * 8;
                g.fillStyle(i % 2 === 0 ? 0x2d6a22 : 0x3a7828, 0.75);
                g.fillRect(gx, gy, 2.5, 8 + (i % 4) * 3);
                g.fillRect(gx + 5, gy + 2, 2, 6 + (i % 3) * 2);
                // Occasional wildflower
                if (i % 5 === 0) {
                    g.fillStyle([0xffdd44, 0xff8844, 0xff6644][i % 3], 0.8);
                    g.fillCircle(gx + 3, gy - 2, 2.5);
                }
            }
            this.groundLayers.push({ g, baseX, width: GAME_WIDTH + 40, speed: 1.0 });
        }
    }

    // ─── Wagon ─────────────────────────────────────────────────────────────────

    private buildWagon(): void {
        this.dustG = this.add.graphics();
        this.wagonG = this.add.graphics();
        this.redrawWagon();
    }

    private redrawWagon(dt: number = 0): void {
        // Walking frame toggle
        this.walkTimer += dt;
        if (this.walkTimer > 280) {
            this.walkFrame = this.walkFrame === 0 ? 1 : 0;
            this.walkTimer = 0;
        }

        this.wagonG.clear();
        const wx = 260;
        const wy = GROUND_Y - 4;

        // Oxen
        drawOx(this.wagonG, wx - 100, wy, 1.0);
        drawOx(this.wagonG, wx - 64, wy, 1.0);

        // Wagon
        drawWagon(this.wagonG, wx, wy, 1.0);

        // Party members walking alongside (mix of men, women, children)
        const gs = GameState.getInstance();
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD).length;
        const wf = this.walkFrame;
        const wf1 = wf === 0 ? 1 : 0;
        if (alive > 0) drawPerson(this.wagonG, wx + 52, wy + 2, 0.88, false, wf);
        if (alive > 1) drawWoman(this.wagonG,  wx + 78, wy + 2, 0.85, false, wf1);
        if (alive > 2) drawChild(this.wagonG,  wx + 100, wy + 4, 0.72, wf);
        if (alive > 3) drawChild(this.wagonG,  wx + 116, wy + 4, 0.65, wf1);
        if (alive > 4) drawPerson(this.wagonG, wx + 134, wy + 2, 0.80, false, wf);
        // Pig trotting alongside
        drawPig(this.wagonG, wx - 130, wy + 4, 0.8);
    }

    // ─── HUD ───────────────────────────────────────────────────────────────────

    private buildHUD(): void {
        // Top bar — leather-textured panel
        this.add.rectangle(GAME_WIDTH / 2, 26, GAME_WIDTH, 52, 0x1a1008, 0.85).setDepth(10);
        this.add.rectangle(GAME_WIDTH / 2, 52, GAME_WIDTH, 2, 0x8b6914, 0.4).setDepth(10); // gold trim at bottom
        // Subtle grain texture on top bar
        const hudGrain = this.add.graphics().setDepth(10);
        hudGrain.fillStyle(0x000000, 0.08);
        for (let i = 0; i < 20; i++) {
            hudGrain.fillRect(i * 52, 0, 50, 52);
        }

        // Progress bar — styled with border and gradient
        this.add.rectangle(GAME_WIDTH / 2, 46, GAME_WIDTH - 160, 10, 0x1a1208).setDepth(10);
        this.add.rectangle(GAME_WIDTH / 2, 46, GAME_WIDTH - 160, 10).setStrokeStyle(1, 0x8b6914, 0.5).setDepth(10);
        this.milesBar = this.add.rectangle(82, 46, 0, 8, COLORS.GRASS_GREEN, 0.9).setOrigin(0, 0.5).setDepth(11);

        // Progress bar landmarks
        const barW = GAME_WIDTH - 164;
        const barStartX = 82;
        const landmarkG = this.add.graphics().setDepth(10);
        landmarkG.fillStyle(0x8b6914, 0.5);
        [0.25, 0.5, 0.75].forEach(pct => {
            landmarkG.fillRect(barStartX + pct * barW - 1, 41, 2, 10);
        });

        const hudStyle = { ...TEXT_STYLES.HUD, fontSize: '13px' };
        const labelStyle = { ...hudStyle, color: HEX_COLORS.TRAIL_BROWN, fontSize: '11px' };

        // Date with label
        this.add.text(10, 4, '📅', { fontSize: '12px' }).setDepth(11);
        this.dateText    = this.add.text(28, 6,  '', hudStyle).setDepth(11);

        // Miles
        this.add.text(200, 4, '🗺️', { fontSize: '12px' }).setDepth(11);
        this.milesText   = this.add.text(220, 6, '', hudStyle).setDepth(11);

        // Next landmark
        this.add.text(420, 4, '📍', { fontSize: '12px' }).setDepth(11);
        this.nextText    = this.add.text(440, 6, '', hudStyle).setDepth(11);

        // Weather
        this.weatherText = this.add.text(720, 6, '', hudStyle).setDepth(11);

        // Health
        this.add.text(840, 4, '❤️', { fontSize: '12px' }).setDepth(11);
        this.healthText  = this.add.text(858, 6, '', hudStyle).setDepth(11);

        // Food
        this.add.text(955, 4, '🍖', { fontSize: '12px' }).setDepth(11);
        this.foodText    = this.add.text(975, 6, '', { ...hudStyle, color: HEX_COLORS.GOLD }).setDepth(11);

        // Bottom control bar — wooden panel
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 28, GAME_WIDTH, 56, 0x1a1208, 0.9).setDepth(10);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 54, GAME_WIDTH, 2, 0x8b6914, 0.4).setDepth(10); // gold trim
        // Bottom bar grain
        const btmGrain = this.add.graphics().setDepth(10);
        btmGrain.fillStyle(0x000000, 0.06);
        for (let i = 0; i < 20; i++) {
            btmGrain.fillRect(i * 52, GAME_HEIGHT - 56, 50, 56);
        }

        this.add.text(12, GAME_HEIGHT - 48, 'PACE:', { ...labelStyle, letterSpacing: 1 }).setDepth(11);
        this.paceText = this.add.text(62, GAME_HEIGHT - 48, '', { ...hudStyle, color: HEX_COLORS.GOLD }).setDepth(11);

        this.add.text(12, GAME_HEIGHT - 28, 'RATIONS:', { ...labelStyle, letterSpacing: 1 }).setDepth(11);
        this.rationsText = this.add.text(78, GAME_HEIGHT - 28, '', { ...hudStyle, color: HEX_COLORS.GOLD }).setDepth(11);

        this.statusMsg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 38, '', {
            ...hudStyle,
            fontSize: '14px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5).setDepth(11);
    }

    private buildControls(): void {
        const btnStyle = { ...TEXT_STYLES.HUD, fontSize: '13px', color: HEX_COLORS.PARCHMENT };
        const depth = 11;

        // Pace buttons
        const paceOptions: [string, Pace][] = [['Steady', Pace.STEADY], ['Strenuous', Pace.STRENUOUS], ['Grueling', Pace.GRUELING]];
        paceOptions.forEach(([label, pace], i) => {
            const btn = this.add.text(GAME_WIDTH - 500 + i * 120, GAME_HEIGHT - 48, `[${label}]`, btnStyle)
                .setInteractive({ useHandCursor: true }).setDepth(depth);
            btn.on('pointerover', () => btn.setColor(HEX_COLORS.GOLD));
            btn.on('pointerout', () => btn.setColor(HEX_COLORS.PARCHMENT));
            btn.on('pointerdown', () => { GameState.getInstance().pace = pace; this.updateHUD(); });
        });

        const rationOptions: [string, Rations][] = [['Filling', Rations.FILLING], ['Meager', Rations.MEAGER], ['Bare Bones', Rations.BARE_BONES]];
        rationOptions.forEach(([label, rations], i) => {
            const btn = this.add.text(GAME_WIDTH - 500 + i * 140, GAME_HEIGHT - 28, `[${label}]`, btnStyle)
                .setInteractive({ useHandCursor: true }).setDepth(depth);
            btn.on('pointerover', () => btn.setColor(HEX_COLORS.GOLD));
            btn.on('pointerout', () => btn.setColor(HEX_COLORS.PARCHMENT));
            btn.on('pointerdown', () => { GameState.getInstance().rations = rations; this.updateHUD(); });
        });

        // Action buttons
        const huntBtn = this.add.text(GAME_WIDTH - 80, GAME_HEIGHT - 48, '[ Hunt ]', {
            ...btnStyle, color: HEX_COLORS.GREEN,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(depth);
        huntBtn.on('pointerover', () => huntBtn.setColor(HEX_COLORS.GOLD));
        huntBtn.on('pointerout', () => huntBtn.setColor(HEX_COLORS.GREEN));
        huntBtn.on('pointerdown', () => {
            this.resetSpeedForSubScene();
            this.tickTimer.paused = true;
            this.scene.launch(SCENES.HUNTING);
            this.scene.pause();
        });

        const restBtn = this.add.text(GAME_WIDTH - 80, GAME_HEIGHT - 28, '[ Rest ]', btnStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(depth);
        restBtn.on('pointerover', () => restBtn.setColor(HEX_COLORS.GOLD));
        restBtn.on('pointerout', () => restBtn.setColor(HEX_COLORS.PARCHMENT));
        restBtn.on('pointerdown', () => {
            GameState.getInstance().pace = Pace.STOPPED;
            this.updateHUD();
            this.showStatus('Your party is resting...');
        });

        // Speed control button
        this.speedText = this.add.text(GAME_WIDTH - 160, GAME_HEIGHT - 38, '⏩ 1x', {
            ...btnStyle, color: HEX_COLORS.GOLD, fontSize: '15px',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(depth);
        this.speedText.on('pointerdown', () => {
            const gs = GameState.getInstance();
            const newSpeed = gs.cycleSpeed();
            this.speedText.setText(`⏩ ${newSpeed}x`);
            // Adjust tick timer delay
            this.tickTimer.delay = TICK_MS / newSpeed;
            SoundManager.getInstance().playClick();
        });
        this.speedText.on('pointerover', () => this.speedText.setColor(HEX_COLORS.PARCHMENT));
        this.speedText.on('pointerout', () => this.speedText.setColor(HEX_COLORS.GOLD));

        this.input.keyboard?.on('keydown-ONE', () => { GameState.getInstance().pace = Pace.STEADY; this.updateHUD(); });
        this.input.keyboard?.on('keydown-TWO', () => { GameState.getInstance().pace = Pace.STRENUOUS; this.updateHUD(); });
        this.input.keyboard?.on('keydown-THREE', () => { GameState.getInstance().pace = Pace.GRUELING; this.updateHUD(); });
    }

    // ─── Update loop ───────────────────────────────────────────────────────────

    update(_time: number, delta: number): void {
        const dt = delta / 1000;
        const gs = GameState.getInstance();
        const moving = gs.pace !== Pace.STOPPED;

        if (moving) {
            const scrollSpeed = 60 * gs.speedMultiplier; // visual scroll px per second (scales with speed)
            this.scrollOffset += scrollSpeed * dt;

            // Scroll mountains
            this.mtnLayers.forEach(layer => {
                const dx = scrollSpeed * layer.speed * dt;
                layer.baseX -= dx;
                if (layer.baseX < -(layer.width)) layer.baseX += layer.width * 2;
                layer.g.setX(layer.baseX);
            });

            // Scroll hills
            this.hillLayers.forEach(layer => {
                const dx = scrollSpeed * layer.speed * dt;
                layer.baseX -= dx;
                if (layer.baseX < -(layer.width)) layer.baseX += layer.width * 2;
                layer.g.setX(layer.baseX);
            });

            // Scroll grass
            this.groundLayers.forEach(layer => {
                const dx = scrollSpeed * layer.speed * dt;
                layer.baseX -= dx;
                if (layer.baseX < -(layer.width)) layer.baseX += layer.width * 2;
                layer.g.setX(layer.baseX);
            });

            // Drift clouds
            this.cloudLayers.forEach(cl => {
                cl.x -= scrollSpeed * cl.speed * dt;
                if (cl.x < -200) cl.x += GAME_WIDTH + 400;
                cl.g.setX(cl.x - (cl.g as any)._baseX || 0);
                cl.g.x = cl.x;
            });

            // Wagon bob
            const wy = GROUND_Y - 4 + Math.sin(this.scrollOffset * 0.05) * 1.5;
            this.wagonG.y = wy - (GROUND_Y - 4);

            // Dust
            if (Math.random() < 0.5) {
                this.dustParticles.push({ x: 130, y: GROUND_Y + 8, alpha: 0.45, r: 3 + Math.random() * 7 });
            }
        }

        // Update dust
        this.dustParticles = this.dustParticles.filter(p => p.alpha > 0.02);
        this.dustParticles.forEach(p => {
            p.x -= 30 * dt;
            p.alpha -= dt * 0.6;
            p.r += dt * 4;
        });
        this.dustG.clear();
        this.dustParticles.forEach(p => {
            this.dustG.fillStyle(0xc8a870, p.alpha);
            this.dustG.fillCircle(p.x, p.y, p.r);
        });

        // Redraw wagon + people with animation
        this.redrawWagon(delta);
    }

    // ─── Daily Tick ────────────────────────────────────────────────────────────

    private dailyTick(): void {
        if (this.paused) return;
        const gs = GameState.getInstance();

        // Play wagon roll sound every 3 ticks while moving
        if (gs.pace !== Pace.STOPPED) {
            this.wagonRollTick++;
            if (this.wagonRollTick % 3 === 0) {
                SoundManager.getInstance().playWagonRoll();
            }
        }

        gs.advanceDay();

        const milesKey = gs.pace === Pace.STOPPED ? 'STOPPED' :
                         gs.pace === Pace.STEADY ? 'STEADY' :
                         gs.pace === Pace.STRENUOUS ? 'STRENUOUS' : 'GRUELING';
        const miles = MILES_PER_DAY[milesKey];
        const prevMiles = gs.milesTraveled;
        gs.milesTraveled = Math.min(TOTAL_TRAIL_MILES, gs.milesTraveled + miles);

        // Food consumption
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD).length;
        const rationKey = gs.rations === Rations.FILLING ? 'FILLING' :
                          gs.rations === Rations.MEAGER ? 'MEAGER' : 'BARE_BONES';
        const foodNeeded = alive * FOOD_PER_PERSON_PER_DAY[rationKey];
        const foodActual = Math.min(gs.supplies.food, foodNeeded);
        gs.supplies.food = Math.max(0, gs.supplies.food - foodActual);

        if (foodActual < foodNeeded) {
            gs.party.forEach(m => {
                if (m.status !== MemberStatus.DEAD) {
                    m.health = Math.max(0, m.health - 7);
                    if (m.health <= 0) {
                        m.status = MemberStatus.DEAD;
                        this.showStatus(`${m.name} has died of starvation.`);
                    }
                }
            });
        }

        // Weather
        if (Math.random() < 0.08) {
            const weathers = [Weather.CLEAR, Weather.CLEAR, Weather.RAINY, Weather.HOT, Weather.SNOWY];
            gs.weather = weathers[Math.floor(Math.random() * weathers.length)];
        }

        // Check landmark
        const next = getNextLandmark(prevMiles);
        if (next && gs.milesTraveled >= next.miles) {
            this.onLandmarkReached(next);
            return;
        }

        // Random event
        if (Math.random() < 0.12 && gs.pace !== Pace.STOPPED) {
            this.resetSpeedForSubScene();
            this.tickTimer.paused = true;
            this.scene.launch(SCENES.EVENT);
            this.scene.pause();
            return;
        }

        if (gs.milesTraveled >= TOTAL_TRAIL_MILES || gs.isGameOver()) {
            this.tickTimer.remove();
            this.time.delayedCall(600, () => this.scene.start(SCENES.GAME_OVER));
            return;
        }

        this.updateHUD();
    }

    private resetSpeedForSubScene(): void {
        GameState.getInstance().resetSpeed();
        this.tickTimer.delay = TICK_MS;
        this.speedText?.setText('⏩ 1x');
    }

    private onLandmarkReached(landmark: { isRiver: boolean; isFort: boolean }): void {
        this.resetSpeedForSubScene();
        this.tickTimer.paused = true;
        this.scene.launch(landmark.isRiver ? SCENES.RIVER_CROSSING : SCENES.LANDMARK);
        this.scene.pause();
    }

    // ─── HUD update ────────────────────────────────────────────────────────────

    private updateHUD(): void {
        const gs = GameState.getInstance();
        const next = getNextLandmark(gs.milesTraveled);
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD);
        const avgHealth = alive.length > 0
            ? Math.round(alive.reduce((s, m) => s + m.health, 0) / alive.length)
            : 0;

        this.dateText.setText(`📅 ${gs.getFormattedDate()}`);
        this.milesText.setText(`🛤  ${Math.round(gs.milesTraveled)} / ${TOTAL_TRAIL_MILES} mi`);
        this.nextText.setText(next ? `⛳ ${next.name}  (${next.miles - Math.round(gs.milesTraveled)} mi)` : '🏁 Almost there!');
        this.weatherText.setText(`☁ ${gs.weather}`);
        this.healthText.setText(`❤ ${avgHealth}%`);
        this.foodText.setText(`🍗 ${Math.round(gs.supplies.food)} lbs`);
        this.paceText.setText(gs.pace);
        this.rationsText.setText(gs.rations);

        // Progress bar
        const pct = gs.milesTraveled / TOTAL_TRAIL_MILES;
        const barW = GAME_WIDTH - 200;
        this.milesBar.setSize(Math.max(4, pct * barW), 6);

        // Sky tint for weather
        const skyColors: Record<Weather, number> = {
            [Weather.CLEAR]: 0x1a6ea8,
            [Weather.RAINY]: 0x4a5a6e,
            [Weather.HOT]:   0xd0883a,
            [Weather.SNOWY]: 0xa0b8c8,
        };
        this.cameras.main.setBackgroundColor(skyColors[gs.weather]);
    }

    private showStatus(msg: string): void {
        this.statusMsg.setText(msg);
        this.time.delayedCall(3000, () => this.statusMsg.setText(''));
    }

    resume(): void {
        const gs = GameState.getInstance();
        if (gs.isGameOver() || gs.milesTraveled >= TOTAL_TRAIL_MILES) {
            this.tickTimer.remove();
            this.scene.start(SCENES.GAME_OVER);
            return;
        }
        // Ensure pace is at least steady after returning from sub-scenes
        if (gs.pace === Pace.STOPPED) {
            gs.pace = Pace.STEADY;
        }
        // Reset speed and restart timer cleanly
        gs.resetSpeed();
        this.tickTimer.delay = TICK_MS;
        this.speedText?.setText('⏩ 1x');
        this.tickTimer.paused = false;
        this.updateHUD();
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
        if (this.tickTimer) this.tickTimer.remove();
    }
}
