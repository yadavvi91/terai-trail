import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES,
    MILES_PER_DAY, FOOD_PER_PERSON_PER_DAY, TOTAL_TRAIL_MILES,
} from '../utils/constants';
import { Pace, Rations, Weather, MemberStatus } from '../utils/types';
import { GameState } from '../game/GameState';
import { getNextLandmark } from '../game/TrailData';

// Parallax layers scroll at different speeds
const PARALLAX = { SKY: 0, MOUNTAINS: 0.02, HILLS: 0.06, GROUND: 0.14 };
const TICK_MS = 1200; // ms between daily ticks (1 day of travel)
const GROUND_Y = GAME_HEIGHT - 80;

export class TravelScene extends Scene {
    // Parallax objects
    private mountains: Phaser.GameObjects.Graphics[] = [];
    private hills: Phaser.GameObjects.Graphics[] = [];
    private groundTiles: Phaser.GameObjects.Rectangle[] = [];
    private trailTiles: Phaser.GameObjects.Rectangle[] = [];
    private clouds: Phaser.GameObjects.Ellipse[] = [];

    // Wagon
    private wagonBody!: Phaser.GameObjects.Rectangle;
    private wagonCover!: Phaser.GameObjects.Rectangle;
    private wheelL!: Phaser.GameObjects.Arc;
    private wheelR!: Phaser.GameObjects.Arc;
    private oxen!: Phaser.GameObjects.Rectangle[];

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
    private paused: boolean = false;

    // Tick timer
    private tickTimer!: Phaser.Time.TimerEvent;
    private scrollOffset: number = 0;

    constructor() {
        super(SCENES.TRAVEL);
    }

    create(): void {
        this.paused = false;
        this.scrollOffset = 0;

        this.buildBackground();
        this.buildWagon();
        this.buildHUD();
        this.buildControls();

        this.tickTimer = this.time.addEvent({
            delay: TICK_MS,
            callback: this.dailyTick,
            callbackScope: this,
            loop: true,
        });

        this.updateHUD();
    }

    // ─── Background ───────────────────────────────────────────────────────────

    private buildBackground(): void {
        // Sky
        this.cameras.main.setBackgroundColor(COLORS.SKY_BLUE);

        // Clouds (2)
        for (let i = 0; i < 4; i++) {
            const cloud = this.add.ellipse(
                Phaser.Math.Between(0, GAME_WIDTH),
                Phaser.Math.Between(40, 160),
                Phaser.Math.Between(100, 200),
                Phaser.Math.Between(30, 60),
                0xffffff, 0.8
            );
            this.clouds.push(cloud);
        }

        // Far mountains (2 peaks, repeating)
        for (let x = -100; x < GAME_WIDTH + 300; x += 300) {
            this.mountains.push(this.drawMountain(x, GROUND_Y - 100, 150, 0x8b9dc3));
            this.mountains.push(this.drawMountain(x + 160, GROUND_Y - 140, 180, 0x7a8db5));
        }

        // Near hills
        for (let x = -80; x < GAME_WIDTH + 200; x += 200) {
            this.hills.push(this.drawHill(x, GROUND_Y - 20, 120, 0x5a9e50));
        }

        // Ground strip
        for (let x = 0; x < GAME_WIDTH + 200; x += 200) {
            const g = this.add.rectangle(x + 100, GROUND_Y + 40, 202, 80, COLORS.GRASS_GREEN);
            this.groundTiles.push(g);
        }

        // Trail
        for (let x = 0; x < GAME_WIDTH + 200; x += 200) {
            const t = this.add.rectangle(x + 100, GROUND_Y + 12, 202, 18, COLORS.TRAIL_BROWN);
            this.trailTiles.push(t);
        }
    }

    private drawMountain(x: number, baseY: number, width: number, color: number): Phaser.GameObjects.Graphics {
        const g = this.add.graphics();
        g.fillStyle(color, 1);
        g.fillTriangle(x, baseY, x + width / 2, baseY - width * 0.8, x + width, baseY);
        return g;
    }

    private drawHill(x: number, baseY: number, width: number, color: number): Phaser.GameObjects.Graphics {
        const g = this.add.graphics();
        g.fillStyle(color, 1);
        g.fillEllipse(x + width / 2, baseY, width, width * 0.5);
        return g;
    }

    // ─── Wagon ─────────────────────────────────────────────────────────────────

    private buildWagon(): void {
        const wx = 280;
        const wy = GROUND_Y - 18;

        // Oxen
        this.oxen = [];
        for (let i = 0; i < 2; i++) {
            const ox = this.add.rectangle(wx - 80 - i * 40, wy + 4, 32, 18, 0x8b6914);
            this.oxen.push(ox);
        }

        this.wagonBody = this.add.rectangle(wx, wy, 80, 30, COLORS.DARK_BROWN);
        this.wagonCover = this.add.rectangle(wx, wy - 22, 64, 22, COLORS.PARCHMENT);

        const wheelY = wy + 12;
        this.wheelL = this.add.arc(wx - 28, wheelY, 13, 0, 360, false, 0x4a3728);
        this.wheelR = this.add.arc(wx + 28, wheelY, 13, 0, 360, false, 0x4a3728);

        // Spokes (decorative inner circles)
        this.add.arc(wx - 28, wheelY, 5, 0, 360, false, 0x8b6914);
        this.add.arc(wx + 28, wheelY, 5, 0, 360, false, 0x8b6914);
    }

    // ─── HUD ───────────────────────────────────────────────────────────────────

    private buildHUD(): void {
        // Top bar background
        this.add.rectangle(GAME_WIDTH / 2, 22, GAME_WIDTH, 44, 0x000000, 0.65);

        const hudStyle = { ...TEXT_STYLES.HUD, fontSize: '13px' };

        this.dateText    = this.add.text(10, 8,  '', hudStyle);
        this.milesText   = this.add.text(200, 8, '', hudStyle);
        this.nextText    = this.add.text(400, 8, '', hudStyle);
        this.weatherText = this.add.text(680, 8, '', hudStyle);
        this.healthText  = this.add.text(820, 8, '', hudStyle);
        this.foodText    = this.add.text(940, 8, '', { ...hudStyle, color: HEX_COLORS.GOLD });

        // Bottom control bar
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 28, GAME_WIDTH, 56, 0x000000, 0.7);

        this.add.text(10, GAME_HEIGHT - 48, 'PACE:', hudStyle);
        this.paceText = this.add.text(70, GAME_HEIGHT - 48, '', { ...hudStyle, color: HEX_COLORS.GOLD });

        this.add.text(10, GAME_HEIGHT - 28, 'RATIONS:', hudStyle);
        this.rationsText = this.add.text(80, GAME_HEIGHT - 28, '', { ...hudStyle, color: HEX_COLORS.GOLD });

        this.statusMsg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 38, '', {
            ...hudStyle,
            fontSize: '14px',
            color: HEX_COLORS.PARCHMENT,
        }).setOrigin(0.5);
    }

    private buildControls(): void {
        const btnStyle = { ...TEXT_STYLES.HUD, fontSize: '13px', color: HEX_COLORS.PARCHMENT };

        // Pace buttons
        const paceOptions: Pace[] = [Pace.STEADY, Pace.STRENUOUS, Pace.GRUELING];
        paceOptions.forEach((pace, i) => {
            const btn = this.add.text(GAME_WIDTH - 480 + i * 110, GAME_HEIGHT - 48, `[${pace}]`, btnStyle)
                .setInteractive({ useHandCursor: true });
            btn.on('pointerover', () => btn.setColor(HEX_COLORS.GOLD));
            btn.on('pointerout', () => btn.setColor(HEX_COLORS.PARCHMENT));
            btn.on('pointerdown', () => {
                GameState.getInstance().pace = pace;
                this.updateHUD();
            });
        });

        // Rations buttons
        const rationOptions: Rations[] = [Rations.FILLING, Rations.MEAGER, Rations.BARE_BONES];
        rationOptions.forEach((rations, i) => {
            const btn = this.add.text(GAME_WIDTH - 480 + i * 130, GAME_HEIGHT - 28, `[${rations}]`, btnStyle)
                .setInteractive({ useHandCursor: true });
            btn.on('pointerover', () => btn.setColor(HEX_COLORS.GOLD));
            btn.on('pointerout', () => btn.setColor(HEX_COLORS.PARCHMENT));
            btn.on('pointerdown', () => {
                GameState.getInstance().rations = rations;
                this.updateHUD();
            });
        });

        // Hunt button
        const huntBtn = this.add.text(GAME_WIDTH - 100, GAME_HEIGHT - 48, '[HUNT]', {
            ...btnStyle,
            color: HEX_COLORS.GREEN,
        }).setInteractive({ useHandCursor: true });
        huntBtn.on('pointerover', () => huntBtn.setColor(HEX_COLORS.GOLD));
        huntBtn.on('pointerout', () => huntBtn.setColor(HEX_COLORS.GREEN));
        huntBtn.on('pointerdown', () => {
            this.tickTimer.paused = true;
            this.scene.launch(SCENES.HUNTING);
            this.scene.pause();
        });

        // Rest button
        const restBtn = this.add.text(GAME_WIDTH - 100, GAME_HEIGHT - 28, '[REST]', btnStyle)
            .setInteractive({ useHandCursor: true });
        restBtn.on('pointerover', () => restBtn.setColor(HEX_COLORS.GOLD));
        restBtn.on('pointerout', () => restBtn.setColor(HEX_COLORS.PARCHMENT));
        restBtn.on('pointerdown', () => {
            const gs = GameState.getInstance();
            gs.pace = Pace.STOPPED;
            this.updateHUD();
            this.showStatus('Your party is resting...');
        });

        // Keyboard shortcuts
        this.input.keyboard?.on('keydown-ONE', () => {
            GameState.getInstance().pace = Pace.STEADY; this.updateHUD();
        });
        this.input.keyboard?.on('keydown-TWO', () => {
            GameState.getInstance().pace = Pace.STRENUOUS; this.updateHUD();
        });
        this.input.keyboard?.on('keydown-THREE', () => {
            GameState.getInstance().pace = Pace.GRUELING; this.updateHUD();
        });
    }

    // ─── Daily Tick ────────────────────────────────────────────────────────────

    private dailyTick(): void {
        if (this.paused) return;
        const gs = GameState.getInstance();

        // Advance date
        gs.advanceDay();

        // Miles traveled
        const paceKey = gs.pace.toUpperCase().replace(' ', '_') as keyof typeof MILES_PER_DAY;
        const milesKey = gs.pace === Pace.STOPPED ? 'STOPPED' :
                         gs.pace === Pace.STEADY ? 'STEADY' :
                         gs.pace === Pace.STRENUOUS ? 'STRENUOUS' : 'GRUELING';
        const miles = MILES_PER_DAY[milesKey];
        gs.milesTraveled = Math.min(TOTAL_TRAIL_MILES, gs.milesTraveled + miles);

        // Consume food
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD).length;
        const rationKey = gs.rations === Rations.FILLING ? 'FILLING' :
                          gs.rations === Rations.MEAGER ? 'MEAGER' : 'BARE_BONES';
        const foodNeeded = alive * FOOD_PER_PERSON_PER_DAY[rationKey];
        const foodActual = Math.min(gs.supplies.food, foodNeeded);
        gs.supplies.food = Math.max(0, gs.supplies.food - foodActual);

        // Health effects from starvation
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

        // Occasional weather change
        if (Math.random() < 0.08) {
            const weathers = [Weather.CLEAR, Weather.CLEAR, Weather.RAINY, Weather.HOT, Weather.SNOWY];
            gs.weather = weathers[Math.floor(Math.random() * weathers.length)];
        }

        // Scroll parallax
        this.scrollOffset += miles * 0.4;
        this.scrollParallax();
        this.bobWagon(miles > 0);

        // Check for landmark
        const next = getNextLandmark(gs.milesTraveled - miles);
        const reached = getNextLandmark(gs.milesTraveled - miles - 1);
        if (next && gs.milesTraveled >= next.miles) {
            this.onLandmarkReached(next);
            return;
        }

        // Random event check
        if (Math.random() < 0.12 && gs.pace !== Pace.STOPPED) {
            this.tickTimer.paused = true;
            this.scene.launch(SCENES.EVENT);
            this.scene.pause();
            return;
        }

        // Check victory
        if (gs.milesTraveled >= TOTAL_TRAIL_MILES) {
            this.tickTimer.remove();
            this.time.delayedCall(800, () => this.scene.start(SCENES.GAME_OVER));
            return;
        }

        // Check game over
        if (gs.isGameOver()) {
            this.tickTimer.remove();
            this.time.delayedCall(800, () => this.scene.start(SCENES.GAME_OVER));
            return;
        }

        this.updateHUD();
    }

    private onLandmarkReached(landmark: { isRiver: boolean; isFort: boolean; name: string }): void {
        this.tickTimer.paused = true;
        if (landmark.isRiver) {
            this.scene.launch(SCENES.RIVER_CROSSING);
        } else if (landmark.isFort) {
            this.scene.launch(SCENES.LANDMARK);
        } else {
            this.scene.launch(SCENES.LANDMARK);
        }
        this.scene.pause();
    }

    // ─── Parallax scroll ───────────────────────────────────────────────────────

    private scrollParallax(): void {
        const o = this.scrollOffset;

        this.clouds.forEach((c, i) => {
            c.x = ((c.x - 0.3 + GAME_WIDTH) % (GAME_WIDTH + 200));
        });

        this.mountains.forEach(m => {
            m.x = ((m.x - PARALLAX.MOUNTAINS * 60 + GAME_WIDTH + 300) % (GAME_WIDTH + 400)) - 100;
        });

        this.hills.forEach(h => {
            h.x = ((h.x - PARALLAX.HILLS * 60 + GAME_WIDTH + 200) % (GAME_WIDTH + 280)) - 80;
        });

        this.groundTiles.forEach(g => {
            g.x = ((g.x - PARALLAX.GROUND * 60 + GAME_WIDTH + 200) % (GAME_WIDTH + 200));
        });

        this.trailTiles.forEach(t => {
            t.x = ((t.x - PARALLAX.GROUND * 60 + GAME_WIDTH + 200) % (GAME_WIDTH + 200));
        });
    }

    private bobWagon(moving: boolean): void {
        if (!moving) return;
        this.tweens.add({
            targets: [this.wagonBody, this.wagonCover],
            y: '-=2',
            duration: 80,
            yoyo: true,
            ease: 'Sine.easeInOut',
        });
        // Spin wheels
        this.tweens.add({
            targets: [this.wheelL, this.wheelR],
            angle: '+=30',
            duration: TICK_MS * 0.8,
        });
    }

    // ─── HUD update ────────────────────────────────────────────────────────────

    private updateHUD(): void {
        const gs = GameState.getInstance();
        const next = getNextLandmark(gs.milesTraveled);
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD);
        const avgHealth = alive.length > 0
            ? Math.round(alive.reduce((s, m) => s + m.health, 0) / alive.length)
            : 0;

        this.dateText.setText(`Date: ${gs.getFormattedDate()}`);
        this.milesText.setText(`Miles: ${Math.round(gs.milesTraveled)} / ${TOTAL_TRAIL_MILES}`);
        this.nextText.setText(next ? `Next: ${next.name} (${next.miles - Math.round(gs.milesTraveled)} mi)` : 'Almost there!');
        this.weatherText.setText(`☁ ${gs.weather}`);
        this.healthText.setText(`♥ ${avgHealth}%`);
        this.foodText.setText(`Food: ${Math.round(gs.supplies.food)} lbs`);
        this.paceText.setText(gs.pace);
        this.rationsText.setText(gs.rations);

        // Sky tint for weather
        const skyColors: Record<Weather, number> = {
            [Weather.CLEAR]: COLORS.SKY_BLUE,
            [Weather.RAINY]: 0x6b7f9e,
            [Weather.HOT]: 0xe8a44a,
            [Weather.SNOWY]: 0xc0d0e0,
        };
        this.cameras.main.setBackgroundColor(skyColors[gs.weather]);
    }

    private showStatus(msg: string): void {
        this.statusMsg.setText(msg);
        this.time.delayedCall(3000, () => this.statusMsg.setText(''));
    }

    // ─── Resume from sub-scenes ────────────────────────────────────────────────

    resume(): void {
        const gs = GameState.getInstance();
        if (gs.isGameOver()) {
            this.tickTimer.remove();
            this.scene.start(SCENES.GAME_OVER);
            return;
        }
        if (gs.milesTraveled >= TOTAL_TRAIL_MILES) {
            this.tickTimer.remove();
            this.scene.start(SCENES.GAME_OVER);
            return;
        }
        this.tickTimer.paused = false;
        this.updateHUD();
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
        if (this.tickTimer) this.tickTimer.remove();
    }
}
