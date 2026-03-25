import { Scene } from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES } from '../utils/constants';
import { GameEvent } from '../utils/types';
import { generateRandomEvent } from '../game/EventManager';
import { drawMountain, drawHill, drawTree, drawCloud, drawSun } from '../ui/DrawUtils';
import { drawIsoWagon, drawIsoOx, drawIsoTree } from '../ui/IsoDrawUtils';
import { TILE_WIDTH, TILE_HEIGHT, drawIsoTile } from '../utils/isometric';
import { addMuteButton } from '../ui/MuteButton';
import { SoundManager } from '../audio/SoundManager';

// Icon map for event types
const EVENT_ICONS: Record<string, string> = {
    disease:     '🤒',
    injury:      '🦴',
    breakdown:   '🔧',
    theft:       '🌙',
    wild_fruit:  '🍇',
    snake_bite:  '🐍',
    travelers:   '🤝',
    bad_water:   '💧',
    lost_oxen:   '🐂',
    good_weather:'☀️',
    hail_storm:  '⛈️',
    found_cache: '📦',
};

// Background mood per event type
const EVENT_MOODS: Record<string, 'danger' | 'good' | 'storm' | 'night'> = {
    disease: 'danger', injury: 'danger', breakdown: 'danger',
    theft: 'night', snake_bite: 'danger', bad_water: 'danger',
    lost_oxen: 'danger',
    wild_fruit: 'good', good_weather: 'good', travelers: 'good', found_cache: 'good',
    hail_storm: 'storm',
};

export class EventScene extends Scene {
    private event!: GameEvent;

    constructor() {
        super(SCENES.EVENT);
    }

    create(): void {
        this.event = generateRandomEvent();
        const mood = EVENT_MOODS[this.event.id] ?? 'danger';

        this.buildBackground(mood);
        this.buildEventPanel();

        // Play sound sting based on event type
        const isGood = ['wild_fruit', 'good_weather', 'found_cache', 'travelers'].includes(this.event.id);
        const sm = SoundManager.getInstance();
        if (isGood) {
            sm.playGoodEvent();
        } else {
            sm.playBadEvent();
        }

        addMuteButton(this);
    }

    private buildBackground(mood: 'danger' | 'good' | 'storm' | 'night'): void {
        const groundY = GAME_HEIGHT - 80;

        // Sky gradient based on mood
        if (mood === 'good') {
            // Bright, warm sky
            for (let i = 0; i < 12; i++) {
                const t = i / 11;
                const r = Math.round(0x18 + t * (0x70 - 0x18));
                const g = Math.round(0x50 + t * (0xb8 - 0x50));
                const b = Math.round(0x80 + t * (0xd8 - 0x80));
                this.add.rectangle(GAME_WIDTH / 2, (i + 0.5) * (groundY / 12), GAME_WIDTH, groundY / 12 + 2, (r << 16) | (g << 8) | b);
            }
            this.add.rectangle(GAME_WIDTH / 2, groundY - 10, GAME_WIDTH, 24, 0xf0c880, 0.2);
            const skyG = this.add.graphics();
            drawSun(skyG, GAME_WIDTH - 140, 80, 38);
            drawCloud(skyG, 200, 50, 0.7);
            drawCloud(skyG, 650, 35, 0.55);
        } else if (mood === 'storm') {
            // Dark stormy sky
            for (let i = 0; i < 12; i++) {
                const t = i / 11;
                const c = Math.round(0x18 + t * (0x3a - 0x18));
                this.add.rectangle(GAME_WIDTH / 2, (i + 0.5) * (groundY / 12), GAME_WIDTH, groundY / 12 + 2,
                    (c << 16) | ((c + 4) << 8) | (c + 12));
            }
            const stormG = this.add.graphics();
            stormG.fillStyle(0x2a2430, 0.7);
            stormG.fillEllipse(250, 65, 300, 90);
            stormG.fillEllipse(600, 50, 340, 100);
            stormG.fillEllipse(880, 70, 260, 80);
            // Rain streaks
            stormG.lineStyle(1, 0x8090b0, 0.3);
            for (let i = 0; i < 40; i++) {
                const rx = Phaser.Math.Between(0, GAME_WIDTH);
                const ry = Phaser.Math.Between(0, groundY);
                stormG.beginPath();
                stormG.moveTo(rx, ry);
                stormG.lineTo(rx - 4, ry + 18);
                stormG.strokePath();
            }
        } else if (mood === 'night') {
            // Dark night sky
            for (let i = 0; i < 12; i++) {
                const t = i / 11;
                const r = Math.round(0x08 + t * (0x14 - 0x08));
                const g = Math.round(0x0a + t * (0x18 - 0x0a));
                const b = Math.round(0x1a + t * (0x30 - 0x1a));
                this.add.rectangle(GAME_WIDTH / 2, (i + 0.5) * (groundY / 12), GAME_WIDTH, groundY / 12 + 2, (r << 16) | (g << 8) | b);
            }
            // Moon
            const moonG = this.add.graphics();
            moonG.fillStyle(0xe8e0c8, 0.9);
            moonG.fillCircle(GAME_WIDTH - 150, 80, 30);
            moonG.fillStyle(0x0a0e1a); // dark bite for crescent
            moonG.fillCircle(GAME_WIDTH - 140, 74, 26);
            // Stars
            moonG.fillStyle(0xffffff, 0.7);
            [[120, 40], [300, 60], [480, 30], [620, 55], [780, 25], [900, 50],
             [160, 90], [400, 80], [550, 100], [700, 70], [850, 95]].forEach(([sx, sy]) => {
                moonG.fillCircle(sx, sy, Phaser.Math.Between(1, 2));
            });
        } else {
            // Danger — muted reddish-brown sky (dusk/ominous)
            for (let i = 0; i < 12; i++) {
                const t = i / 11;
                const r = Math.round(0x2a + t * (0x6a - 0x2a));
                const g = Math.round(0x20 + t * (0x50 - 0x20));
                const b = Math.round(0x18 + t * (0x40 - 0x18));
                this.add.rectangle(GAME_WIDTH / 2, (i + 0.5) * (groundY / 12), GAME_WIDTH, groundY / 12 + 2, (r << 16) | (g << 8) | b);
            }
            this.add.rectangle(GAME_WIDTH / 2, groundY - 8, GAME_WIDTH, 20, 0xc08040, 0.15);
            const dangerSky = this.add.graphics();
            drawCloud(dangerSky, 200, 50, 0.8, 0.45);
            drawCloud(dangerSky, 700, 40, 0.65, 0.4);
        }

        // Terrain — mountains, hills, trees (dimmed by overlay later)
        const terrG = this.add.graphics();
        const mtnColor = mood === 'night' ? 0x1a2030 : mood === 'storm' ? 0x3a4858 : mood === 'danger' ? 0x4a4040 : 0x5a7098;
        drawMountain(terrG, 150,  groundY + 5, 220, 170, mtnColor, mood === 'good');
        drawMountain(terrG, 420,  groundY + 5, 280, 200, mtnColor === 0x5a7098 ? 0x4d6890 : mtnColor, mood === 'good');
        drawMountain(terrG, 700,  groundY + 5, 240, 180, mtnColor, mood === 'good');
        drawMountain(terrG, 950,  groundY + 5, 200, 160, mtnColor === 0x5a7098 ? 0x4d6890 : mtnColor, mood === 'good');

        const hillColor = mood === 'night' ? 0x0e1a10 : mood === 'storm' ? 0x1e3820 : mood === 'danger' ? 0x2a4020 : 0x2d6428;
        const hillG = this.add.graphics();
        drawHill(hillG, 100,  groundY + 8, 220, hillColor);
        drawHill(hillG, 380,  groundY + 8, 260, hillColor);
        drawHill(hillG, 650,  groundY + 8, 200, hillColor);
        drawHill(hillG, 900,  groundY + 8, 240, hillColor);

        const treeColor = mood === 'night' ? 0x0a1208 : mood === 'storm' ? 0x14280e : 0x234d1a;
        const treeG = this.add.graphics();
        drawTree(treeG, 60,  groundY + 2, 55, treeColor, false);
        drawTree(treeG, 920, groundY - 4, 65, treeColor, true);
        drawTree(treeG, 960, groundY + 2, 55, treeColor, false);

        // Isometric ground tiles
        const groundColor = mood === 'night' ? 0x0e1408 : mood === 'storm' ? 0x1e3018 : mood === 'danger' ? 0x2a4018 : 0x3a7d30;
        const trailColor = mood === 'night' ? 0x2a1e10 : 0x9e7b3a;
        const isoG = this.add.graphics();
        const cols = 16, rows = 5;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const sx = GAME_WIDTH / 2 + (col - row) * (TILE_WIDTH / 2) - (cols * TILE_WIDTH / 4);
                const sy = groundY + 10 + (col + row) * (TILE_HEIGHT / 2) - rows * TILE_HEIGHT / 2;
                const isTrail = Math.abs(col - row - 1) <= 1;
                drawIsoTile(isoG, sx, sy, isTrail ? trailColor : groundColor);
            }
        }

        // Wagon + oxen on the trail (isometric, stopped)
        const wG = this.add.graphics();
        drawIsoOx(wG, 200, groundY + 18, 0.75);
        drawIsoOx(wG, 186, groundY + 26, 0.75);
        drawIsoWagon(wG, 150, groundY + 10, 0.8);

        // Semi-transparent overlay to push background back and focus on panel
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45);
    }

    private buildEventPanel(): void {
        const panelW = 680;
        const panelH = 420;
        const panelX = GAME_WIDTH / 2;
        const panelY = GAME_HEIGHT / 2;

        const isGood = ['wild_fruit', 'good_weather', 'found_cache', 'travelers'].includes(this.event.id);

        // Panel shadow (double for depth)
        this.add.rectangle(panelX + 6, panelY + 6, panelW, panelH, 0x000000, 0.5);
        this.add.rectangle(panelX + 2, panelY + 2, panelW, panelH, 0x000000, 0.25);

        // Panel body (parchment)
        this.add.rectangle(panelX, panelY, panelW, panelH, 0xf0ddb8);
        this.add.rectangle(panelX, panelY, panelW, panelH).setStrokeStyle(3, 0x8b6914);

        // Inner decorative border
        this.add.rectangle(panelX, panelY, panelW - 14, panelH - 14).setStrokeStyle(1, 0xb89050, 0.5);

        // Decorative corner flourishes
        const cornerG = this.add.graphics();
        cornerG.lineStyle(2, 0xb89050, 0.6);
        const corners = [
            [panelX - panelW / 2 + 14, panelY - panelH / 2 + 14],
            [panelX + panelW / 2 - 14, panelY - panelH / 2 + 14],
            [panelX - panelW / 2 + 14, panelY + panelH / 2 - 14],
            [panelX + panelW / 2 - 14, panelY + panelH / 2 - 14],
        ];
        corners.forEach(([ccx, ccy]) => {
            const dx = ccx < panelX ? 1 : -1;
            const dy = ccy < panelY ? 1 : -1;
            cornerG.beginPath();
            cornerG.moveTo(ccx + dx * 18, ccy);
            cornerG.lineTo(ccx, ccy);
            cornerG.lineTo(ccx, ccy + dy * 18);
            cornerG.strokePath();
        });

        // Header bar with gradient
        const headerColor = isGood ? 0x3d7830 : 0x8b2222;
        this.add.rectangle(panelX, panelY - panelH / 2 + 32, panelW, 64, headerColor);
        // Header highlight
        this.add.rectangle(panelX, panelY - panelH / 2 + 12, panelW - 6, 8, 0xffffff, 0.08);

        // Event type indicator strip (colored bar at very top of header)
        const stripColor = isGood ? 0x5aaa44 : 0xcc4444;
        this.add.rectangle(panelX, panelY - panelH / 2 + 3, panelW, 6, stripColor);

        // Icon with background circle
        const iconBg = isGood ? 0x2a5a20 : 0x6a1818;
        this.add.circle(panelX - panelW / 2 + 44, panelY - panelH / 2 + 32, 22, iconBg);
        this.add.circle(panelX - panelW / 2 + 44, panelY - panelH / 2 + 32, 22).setStrokeStyle(2, 0xffffff, 0.3);
        const icon = EVENT_ICONS[this.event.id] ?? '❗';
        this.add.text(panelX - panelW / 2 + 44, panelY - panelH / 2 + 32, icon, {
            fontSize: '26px',
        }).setOrigin(0.5);

        // Title
        this.add.text(panelX + 10, panelY - panelH / 2 + 32, this.event.title, {
            ...TEXT_STYLES.SUBTITLE,
            fontSize: '22px',
            color: HEX_COLORS.PARCHMENT,
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 4, fill: true },
        }).setOrigin(0.5);

        // Decorative divider below header
        this.add.rectangle(panelX, panelY - panelH / 2 + 66, panelW - 40, 2, 0xb89050, 0.4);
        this.add.rectangle(panelX, panelY - panelH / 2 + 68, panelW - 60, 1, 0xb89050, 0.2);

        // Description
        this.add.text(panelX, panelY - 80, this.event.description, {
            ...TEXT_STYLES.BODY,
            color: HEX_COLORS.DARK_BROWN,
            fontSize: '16px',
            wordWrap: { width: panelW - 60 },
            align: 'center',
            lineSpacing: 6,
        }).setOrigin(0.5);

        // Divider before choices
        this.add.rectangle(panelX, panelY - 10, panelW - 60, 1, 0xb89050, 0.6);

        // Choice buttons
        const choices = this.event.choices ?? [{ text: 'Continue', outcome: () => {} }];
        const btnH = 54;
        const btnW = panelW - 60;
        const btnStartY = panelY + 20;
        const btnSpacing = btnH + 10;

        choices.forEach((choice, i) => {
            const y = btnStartY + i * btnSpacing;

            // Button shadow
            this.add.rectangle(panelX + 2, y + 2, btnW, btnH, 0x000000, 0.2);

            const btn = this.add.rectangle(panelX, y, btnW, btnH, 0x4a3728)
                .setInteractive({ useHandCursor: true });
            btn.setStrokeStyle(1, 0x8b6914, 0.8);

            // Choice letter badge (rounded)
            this.add.circle(panelX - btnW / 2 + 22, y, 16, 0x8b6914);
            this.add.text(panelX - btnW / 2 + 22, y, String.fromCharCode(65 + i), {
                ...TEXT_STYLES.HUD,
                fontSize: '14px',
                color: HEX_COLORS.PARCHMENT,
            }).setOrigin(0.5);

            this.add.text(panelX + 10, y, choice.text, {
                ...TEXT_STYLES.BODY,
                color: HEX_COLORS.PARCHMENT,
                fontSize: '15px',
                wordWrap: { width: btnW - 60 },
                align: 'center',
            }).setOrigin(0.5);

            btn.on('pointerover', () => {
                btn.setFillStyle(0x6a4a38);
                btn.setStrokeStyle(2, COLORS.GOLD, 0.9);
            });
            btn.on('pointerout', () => {
                btn.setFillStyle(0x4a3728);
                btn.setStrokeStyle(1, 0x8b6914, 0.8);
            });
            btn.on('pointerdown', () => this.resolveChoice(i));
        });
    }

    private resolveChoice(index: number): void {
        const choices = this.event.choices ?? [{ text: 'Continue', outcome: () => {} }];
        choices[index]?.outcome();
        this.scene.resume(SCENES.TRAVEL);
        this.scene.stop();
    }

    shutdown(): void {
        this.input.keyboard?.removeAllListeners();
    }
}
