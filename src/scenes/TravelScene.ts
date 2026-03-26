import { Scene } from 'phaser';
import {
    SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, HEX_COLORS, TEXT_STYLES,
    MILES_PER_DAY, FOOD_PER_PERSON_PER_DAY, TOTAL_TRAIL_MILES, BIOME_COLORS,
    SKY_GRADIENTS, OREGON_SKY_OVERLAY,
} from '../utils/constants';
import { Pace, Rations, Weather, MemberStatus, Biome, Season } from '../utils/types';
import { getBiome, getSeason, getMountainAlpha } from '../utils/biome';
import { GameState } from '../game/GameState';
import { getNextLandmark } from '../game/TrailData';
import { drawTree, drawHill, drawCloud, drawSun } from '../ui/DrawUtils';
import { drawIsoWagon, drawIsoOx, drawIsoPerson, drawIsoTree } from '../ui/IsoDrawUtils';
import { TILE_WIDTH, TILE_HEIGHT, drawIsoTile } from '../utils/isometric';
import { addMuteButton } from '../ui/MuteButton';
import { SoundManager } from '../audio/SoundManager';

const TICK_MS = 1200;
const GROUND_Y = GAME_HEIGHT - 80;

interface WeatherParticle {
    x: number;
    y: number;
    vx: number;     // horizontal velocity px/sec
    vy: number;     // vertical velocity px/sec
    alpha: number;
    length: number; // streak length for rain; 0 for snow
    type: 'rain' | 'snow';
}

// Scrollable layer item
interface ScrollLayer {
    g: Phaser.GameObjects.Graphics;
    baseX: number;
    baseY: number;
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
    private skyG!: Phaser.GameObjects.Graphics;
    private scrollOffset: number = 0;

    // Biome/season/weather change tracking
    private currentBiome: Biome = Biome.PRAIRIE;
    private currentSeason: Season = Season.SPRING;
    private currentWeather: Weather = Weather.CLEAR;

    // Wagon graphics (redrawn each tick)
    private wagonG!: Phaser.GameObjects.Graphics;
    private dustG!: Phaser.GameObjects.Graphics;
    private dustParticles: { x: number; y: number; alpha: number; r: number }[] = [];
    private weatherParticleG!: Phaser.GameObjects.Graphics;
    private weatherParticles: WeatherParticle[] = [];
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
    private eventCooldown: number = 0;
    private speedText!: Phaser.GameObjects.Text;

    constructor() {
        super(SCENES.TRAVEL);
    }

    create(): void {
        this.paused = false;
        this.scrollOffset = 0;
        this.isMoving = false;
        this.dustParticles = [];
        this.weatherParticles = [];
        this.mtnLayers = [];
        this.hillLayers = [];
        this.groundLayers = [];
        this.cloudLayers = [];
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.eventCooldown = 8; // no events for first 8 ticks (~10 days of travel)

        const gs0 = GameState.getInstance();
        this.currentBiome = getBiome(gs0.milesTraveled);
        this.currentSeason = getSeason(gs0.currentDate.getMonth());
        this.currentWeather = gs0.weather;
        this.cameras.main.setBackgroundColor(0x0d1a2e);  // safe dark fallback

        this.buildSky();
        this.buildParallax();
        this.buildGroundAndTrail();
        this.buildWagon();
        this.weatherParticleG = this.add.graphics();  // above parallax, below HUD
        this.buildHUD();
        this.buildControls();

        addMuteButton(this);

        // Start trail music
        SoundManager.getInstance().startTrailMusic();

        // CRITICAL: Phaser does NOT auto-call resume() — must register explicitly
        this.events.on('resume', this.onResume, this);

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
        // Dynamic sky gradient via Graphics (replaces static add.rectangle() strips)
        this.skyG = this.add.graphics();
        this.drawSkyGradient(this.currentWeather, this.currentBiome);

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

    private drawSkyGradient(weather: Weather, biome: Biome): void {
        const gradient = SKY_GRADIENTS[weather];
        const topR = (gradient.top >> 16) & 0xff;
        const topG = (gradient.top >> 8) & 0xff;
        const topB = gradient.top & 0xff;
        const botR = (gradient.bottom >> 16) & 0xff;
        const botG = (gradient.bottom >> 8) & 0xff;
        const botB = gradient.bottom & 0xff;

        const skySteps = 14;
        const stripH = GROUND_Y / skySteps;

        for (let i = 0; i < skySteps; i++) {
            const t = i / (skySteps - 1);
            const r = Math.round(topR + t * (botR - topR));
            const gv = Math.round(topG + t * (botG - topG));
            const b = Math.round(topB + t * (botB - topB));
            this.skyG.fillStyle((r << 16) | (gv << 8) | b);
            this.skyG.fillRect(0, i * stripH, GAME_WIDTH, stripH + 2);
        }

        // Horizon glow (Clear and Hot only)
        if (weather === Weather.CLEAR || weather === Weather.HOT) {
            this.skyG.fillStyle(0xf0c890, 0.18);
            this.skyG.fillRect(0, GROUND_Y - 12, GAME_WIDTH, 28);
            this.skyG.fillStyle(0xf0b060, 0.14);
            this.skyG.fillRect(0, GROUND_Y - 2, GAME_WIDTH, 14);
        }

        // Oregon biome: grey-green overlay on top of weather gradient
        if (biome === Biome.OREGON) {
            this.skyG.fillStyle(OREGON_SKY_OVERLAY.color, OREGON_SKY_OVERLAY.alpha);
            this.skyG.fillRect(0, 0, GAME_WIDTH, GROUND_Y);
        }
    }

    private redrawSky(): void {
        const gs = GameState.getInstance();

        this.skyG.clear();
        this.drawSkyGradient(gs.weather, this.currentBiome);

        // Sun: visible for CLEAR and HOT; bigger for HOT
        const showSun = gs.weather === Weather.CLEAR || gs.weather === Weather.HOT;
        this.sunG.setVisible(showSun);
        if (showSun) {
            this.sunG.clear();
            const sunRadius = gs.weather === Weather.HOT ? 52 : 42;
            drawSun(this.sunG, GAME_WIDTH - 110, 80, sunRadius);
        }
    }

    // ─── Parallax mountains + hills ───────────────────────────────────────────

    // Vertical-to-horizontal scroll ratios for parallax layers
    // Smaller than ground's 0.5 to keep distant layers visually stable
    private static readonly MTN_Y_RATIO = 0.06;
    private static readonly HILL_Y_RATIO = 0.15;

    private buildParallax(): void {
        // Far mountains — 2 sets tiled diagonally for seamless isometric scroll
        const mtnW = GAME_WIDTH + 100;
        for (let pass = 0; pass < 2; pass++) {
            const g = this.add.graphics();
            const baseX = pass * mtnW;
            const baseY = -pass * mtnW * TravelScene.MTN_Y_RATIO;
            this.drawMountainLayerForBiome(g, baseX, this.currentBiome);
            this.mtnLayers.push({ g, baseX, baseY, width: mtnW, speed: 0.18 });
        }

        // Near hills — 2 sets tiled diagonally
        const hillW = GAME_WIDTH + 60;
        for (let pass = 0; pass < 2; pass++) {
            const g = this.add.graphics();
            const baseX = pass * hillW;
            const baseY = -pass * hillW * TravelScene.HILL_Y_RATIO;
            this.drawHillLayerForBiome(g, baseX, this.currentBiome, this.currentSeason);
            this.hillLayers.push({ g, baseX, baseY, width: hillW, speed: 0.55 });
        }
    }

    private drawMountainLayerForBiome(g: Phaser.GameObjects.Graphics, offsetX: number, biome: Biome): void {
        const back = BIOME_COLORS.MOUNTAIN_BACK[biome];
        const front = BIOME_COLORS.MOUNTAIN_FRONT[biome];
        const snowCap = biome !== Biome.OREGON;

        // Back layer (farthest, tallest)
        this.drawSoftMountain(g, offsetX + 200, GROUND_Y - 10, 320, 160, back[0], snowCap);
        this.drawSoftMountain(g, offsetX + 500, GROUND_Y - 10, 360, 180, back[1], snowCap);
        this.drawSoftMountain(g, offsetX + 850, GROUND_Y - 10, 300, 150, back[2], snowCap);
        // Front layer (closer, shorter, overlapping)
        this.drawSoftMountain(g, offsetX + 100, GROUND_Y - 5, 260, 110, front[0], snowCap);
        this.drawSoftMountain(g, offsetX + 380, GROUND_Y - 5, 280, 120, front[1], snowCap);
        this.drawSoftMountain(g, offsetX + 650, GROUND_Y - 5, 240, 100, front[2], snowCap);
        this.drawSoftMountain(g, offsetX + 950, GROUND_Y - 5, 270, 115, front[3], snowCap);
    }

    /** Draw a single soft, isometric-style mountain (asymmetric — gentle left, steep right) */
    private drawSoftMountain(
        g: Phaser.GameObjects.Graphics, cx: number, baseY: number,
        width: number, height: number, color: number, snowCap = true,
    ): void {
        const hw = width / 2;
        // Peak shifted right for isometric 3/4 perspective
        const peakShift = hw * 0.2;

        // Main body — asymmetric arc (gentle left slope, steeper right slope)
        g.fillStyle(color);
        g.beginPath();
        g.moveTo(cx - hw, baseY);
        const segments = 24;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = cx - hw + width * t;
            // Asymmetric profile: peak at ~0.6 instead of 0.5
            const peakT = 0.6;
            const profile = t < peakT
                ? Math.sin((t / peakT) * Math.PI * 0.5)        // gentle rise
                : Math.sin(0.5 * Math.PI + ((t - peakT) / (1 - peakT)) * Math.PI * 0.5); // steeper fall
            const jitter = Math.sin(t * 17.3) * height * 0.03;
            const y = baseY - height * profile + jitter;
            g.lineTo(x, y);
        }
        g.lineTo(cx + hw, baseY);
        g.closePath();
        g.fillPath();

        // Lit face (left slope — facing the "sun" from upper-left)
        g.fillStyle(0xffffff, 0.06);
        g.beginPath();
        g.moveTo(cx - hw, baseY);
        for (let i = 0; i <= 14; i++) {
            const t = i / 14;
            const x = cx - hw + width * 0.6 * t;
            const profile = Math.sin((t) * Math.PI * 0.5);
            const y = baseY - height * profile + Math.sin(t * 17.3) * height * 0.03;
            g.lineTo(x, y);
        }
        g.lineTo(cx + peakShift, baseY);
        g.closePath();
        g.fillPath();

        // Shadow face (right slope — steeper, darker)
        g.fillStyle(0x000000, 0.08);
        g.beginPath();
        g.moveTo(cx + peakShift, baseY - height);
        for (let i = 0; i <= 10; i++) {
            const t = i / 10;
            const x = cx + peakShift + (hw - peakShift) * t;
            const profile = Math.cos(t * Math.PI * 0.5);
            const y = baseY - height * profile;
            g.lineTo(x, y);
        }
        g.lineTo(cx + hw, baseY);
        g.lineTo(cx + peakShift, baseY);
        g.closePath();
        g.fillPath();

        // Atmospheric haze at base
        g.fillStyle(0x6a8ab0, 0.15);
        g.fillRect(cx - hw, baseY - height * 0.2, width, height * 0.2);

        // Snow dusting on peaks (subtle, shifted to match asymmetric peak)
        if (height > 100 && snowCap) {
            g.fillStyle(0xdce8f4, 0.3);
            g.beginPath();
            const snowL = cx + peakShift - hw * 0.3;
            const snowR = cx + peakShift + hw * 0.15;
            g.moveTo(snowL, baseY - height * 0.85);
            for (let i = 0; i <= 10; i++) {
                const t = i / 10;
                const x = snowL + (snowR - snowL) * t;
                const profile = Math.sin(t * Math.PI);
                const y = baseY - height * (0.85 + 0.15 * profile) + Math.sin(t * 13) * 3;
                g.lineTo(x, y);
            }
            g.lineTo(snowR, baseY - height * 0.85);
            g.closePath();
            g.fillPath();
        }
    }

    private drawHillLayerForBiome(g: Phaser.GameObjects.Graphics, offsetX: number, biome: Biome, _season: Season): void {
        const [c1, c2] = BIOME_COLORS.HILL_COLORS[biome];

        drawHill(g, offsetX + 100,  GROUND_Y + 8, 240, c1);
        drawHill(g, offsetX + 330,  GROUND_Y + 8, 200, c2);
        drawHill(g, offsetX + 520,  GROUND_Y + 8, 260, c1);
        drawHill(g, offsetX + 740,  GROUND_Y + 8, 220, c2);
        drawHill(g, offsetX + 940,  GROUND_Y + 8, 180, c1);
        drawHill(g, offsetX + 1080, GROUND_Y + 8, 200, c2);

        // Trees alongside trail — biome-appropriate colors
        const treeC1 = biome === Biome.OREGON ? 0x1a3a18 : 0x234d1a;
        const treeC2 = biome === Biome.OREGON ? 0x223a20 : 0x2a5820;
        drawTree(g, offsetX + 60,  GROUND_Y + 4, 62, treeC1, false);
        drawTree(g, offsetX + 90,  GROUND_Y - 4, 74, treeC2, false);
        drawTree(g, offsetX + 280, GROUND_Y + 2, 55, treeC1, false);
        drawTree(g, offsetX + 480, GROUND_Y - 2, 68, treeC2, false);
        drawTree(g, offsetX + 510, GROUND_Y + 4, 58, treeC1, true);   // pine
        drawTree(g, offsetX + 720, GROUND_Y - 4, 72, treeC2, false);
        drawTree(g, offsetX + 900, GROUND_Y + 2, 60, treeC1, true);
        drawTree(g, offsetX + 930, GROUND_Y - 6, 80, treeC2, false);
    }

    private refreshParallaxLayers(): void {
        const mtnW = GAME_WIDTH + 100;
        this.mtnLayers.forEach((layer, pass) => {
            layer.g.clear();
            layer.g.setPosition(0, 0);
            this.drawMountainLayerForBiome(layer.g, pass * mtnW, this.currentBiome);
            layer.baseX = pass * mtnW;
            layer.baseY = -pass * mtnW * TravelScene.MTN_Y_RATIO;
            layer.g.setPosition(layer.baseX, layer.baseY);
        });

        const hillW = GAME_WIDTH + 60;
        this.hillLayers.forEach((layer, pass) => {
            layer.g.clear();
            layer.g.setPosition(0, 0);
            this.drawHillLayerForBiome(layer.g, pass * hillW, this.currentBiome, this.currentSeason);
            layer.baseX = pass * hillW;
            layer.baseY = -pass * hillW * TravelScene.HILL_Y_RATIO;
            layer.g.setPosition(layer.baseX, layer.baseY);
        });
    }

    // ─── Ground & trail ────────────────────────────────────────────────────────

    private buildGroundAndTrail(): void {
        // Isometric tile ground — scrolling diamond grid
        // Trail runs along row ≈ middleRow; formula flipped so trail goes BL → TR on screen
        const cols = 28;
        const tileH = TILE_HEIGHT;
        const middleRow = Math.floor(10 / 2);

        // Wrap distance: one full copy's width along the iso diagonal
        const wrapDX = cols * TILE_WIDTH / 2;   // screen-X span of one copy
        const wrapDY = cols * tileH / 2;        // corresponding screen-Y span

        // Origin: position tile grid so the trail center is roughly at screen center
        const originX = GAME_WIDTH / 2 + 100;
        const originY = GROUND_Y - middleRow * tileH - 60;

        for (let pass = 0; pass < 2; pass++) {
            const g = this.add.graphics();
            this.drawGroundTiles(g, this.currentSeason);

            // Position each copy: offset diagonally along the flipped iso axis
            const bx = originX - pass * wrapDX;
            const by = originY + pass * wrapDY;
            g.setPosition(bx, by);

            this.groundLayers.push({ g, baseX: bx, baseY: by, width: wrapDX, speed: 1.0 });
        }
    }

    private drawGroundTiles(g: Phaser.GameObjects.Graphics, season: Season): void {
        const cols = 28;
        const rows = 10;
        const tileW = TILE_WIDTH;
        const tileH = TILE_HEIGHT;
        const middleRow = Math.floor(rows / 2);

        const grassColors = BIOME_COLORS.SEASON_GRASS_ALT[season];
        const flowerColors = [0xffdd44, 0xff8844, 0xff6644];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const sx = (row - col) * (tileW / 2);
                const sy = (col + row) * (tileH / 2);

                const isTrail = Math.abs(row - middleRow) <= 1;
                const isTrailEdge = Math.abs(row - middleRow) === 2;

                if (isTrail) {
                    drawIsoTile(g, sx, sy, 0x9e7b3a);  // UNCHANGED — dirt
                    if (row === middleRow) {
                        drawIsoTile(g, sx, sy, 0x6a4e20, 0.4, tileW * 0.5, tileH * 0.5);
                    }
                } else if (isTrailEdge) {
                    drawIsoTile(g, sx, sy, 0x4a8030);   // UNCHANGED — trail edge
                    drawIsoTile(g, sx, sy, 0x7a6830, 0.3, tileW * 0.7, tileH * 0.7);
                } else {
                    const ci = (col * 7 + row * 13) % grassColors.length;
                    drawIsoTile(g, sx, sy, grassColors[ci]);
                    if ((col * 3 + row * 7) % 11 === 0) {
                        g.fillStyle(flowerColors[(col + row) % 3], 0.8);
                        g.fillCircle(sx, sy - 2, 2.5);
                    }
                }
            }
        }

        // Trees alongside the trail (keep existing positions and logic unchanged)
        const treeOffsets = [
            [3, 0], [7, 0], [12, 0], [18, 0], [24, 0],
            [3, rows - 1], [8, rows - 1], [14, rows - 1], [20, rows - 1], [25, rows - 1],
            [5, 1], [10, 1], [16, 1], [22, 1],
            [6, rows - 2], [11, rows - 2], [17, rows - 2], [23, rows - 2],
        ];
        treeOffsets.forEach(([col, row]) => {
            const tsx = (row - col) * (tileW / 2);
            const tsy = (col + row) * (tileH / 2);
            const isPine = ((col + row) % 3 === 0);
            drawIsoTree(g, tsx, tsy - 4, 45 + (col * 7) % 30, 0x234d1a, isPine);
        });
    }

    private refreshGroundLayers(): void {
        this.groundLayers.forEach(layer => {
            layer.g.clear();
            this.drawGroundTiles(layer.g, this.currentSeason);
            // Preserve scroll position — setPosition reapplies baseX/baseY
            layer.g.setPosition(layer.baseX, layer.baseY);
        });
    }

    // ─── Wagon ─────────────────────────────────────────────────────────────────

    private buildWagon(): void {
        this.dustG = this.add.graphics();
        this.wagonG = this.add.graphics();
        this.redrawWagon();
    }

    private redrawWagon(dt: number = 0): void {
        // Smooth walk cycle: walkTimer accumulates ms, phase = 0..1
        this.walkTimer += dt;
        const walkCycleMs = 600; // one full stride
        const walkPhase = (this.walkTimer % walkCycleMs) / walkCycleMs;

        this.wagonG.clear();
        // Wagon on the iso trail — traveling up-right (into the distance)
        // Position on the road center; calculated from trail grid position
        // Trail center line: x + 2y = 1868 (derived from grid origin + tile math)
        // Wagon must satisfy wx + 2*wy = 1868 to sit on the trail center
        const wx = GAME_WIDTH / 2 + 230;   // 742
        const wy = GROUND_Y - 125;          // 563  → 742 + 2*563 = 1868 ✓

        // Oxen ahead of wagon (up-right = traveling into the distance)
        drawIsoOx(this.wagonG, wx + 52, wy - 26, 1.0);
        drawIsoOx(this.wagonG, wx + 38, wy - 18, 1.0);

        // Wagon
        drawIsoWagon(this.wagonG, wx, wy, 1.0);

        // Party members walking behind wagon (down-left = behind, facing away)
        const gs = GameState.getInstance();
        const alive = gs.party.filter(m => m.status !== MemberStatus.DEAD).length;
        const personColors = [0x8a4428, 0x2a4a7a, 0x6a5830, 0x7a2a4a, 0x3a6a3a];
        const isWalking = gs.pace !== Pace.STOPPED;
        for (let i = 0; i < Math.min(alive, 5); i++) {
            // Each person has a slightly offset walk phase for natural look
            const phase = isWalking ? (walkPhase + i * 0.2) % 1.0 : -1;
            // Offset follows trail direction (-2:1) so people stay on the road
            drawIsoPerson(this.wagonG, wx - 24 - i * 14, wy + 12 + i * 7, 0.7, personColors[i], phase, true);
        }
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

        // Pace buttons — centered in the bottom bar
        const paceStartX = 220;
        const paceOptions: [string, Pace][] = [['Steady', Pace.STEADY], ['Strenuous', Pace.STRENUOUS], ['Grueling', Pace.GRUELING]];
        paceOptions.forEach(([label, pace], i) => {
            const btn = this.add.text(paceStartX + i * 110, GAME_HEIGHT - 48, `[${label}]`, btnStyle)
                .setInteractive({ useHandCursor: true }).setDepth(depth);
            btn.on('pointerover', () => btn.setColor(HEX_COLORS.GOLD));
            btn.on('pointerout', () => btn.setColor(HEX_COLORS.PARCHMENT));
            btn.on('pointerdown', () => { GameState.getInstance().pace = pace; this.updateHUD(); });
        });

        const rationOptions: [string, Rations][] = [['Filling', Rations.FILLING], ['Meager', Rations.MEAGER], ['Bare Bones', Rations.BARE_BONES]];
        rationOptions.forEach(([label, rations], i) => {
            const btn = this.add.text(paceStartX + i * 110, GAME_HEIGHT - 28, `[${label}]`, btnStyle)
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
        this.speedText = this.add.text(GAME_WIDTH - 180, GAME_HEIGHT - 38, '⏩ 1x', {
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

            // Scroll mountains diagonally — subtle Y drift for isometric feel
            this.mtnLayers.forEach(layer => {
                const dx = scrollSpeed * layer.speed * dt;
                const dy = dx * TravelScene.MTN_Y_RATIO;
                layer.baseX -= dx;
                layer.baseY += dy;
                if (layer.baseX < -(layer.width)) {
                    layer.baseX += layer.width * 2;
                    layer.baseY -= layer.width * 2 * TravelScene.MTN_Y_RATIO;
                }
                layer.g.setPosition(layer.baseX, layer.baseY);
            });

            // Scroll hills diagonally — moderate Y drift
            this.hillLayers.forEach(layer => {
                const dx = scrollSpeed * layer.speed * dt;
                const dy = dx * TravelScene.HILL_Y_RATIO;
                layer.baseX -= dx;
                layer.baseY += dy;
                if (layer.baseX < -(layer.width)) {
                    layer.baseX += layer.width * 2;
                    layer.baseY -= layer.width * 2 * TravelScene.HILL_Y_RATIO;
                }
                layer.g.setPosition(layer.baseX, layer.baseY);
            });

            // Scroll ground DIAGONALLY down-left (toward viewer's left)
            // so the wagon appears to travel up-right (into the distance)
            this.groundLayers.forEach(layer => {
                const dx = scrollSpeed * layer.speed * dt;
                const dy = dx * 0.5; // 2:1 isometric ratio
                layer.baseX -= dx;   // ground moves left
                layer.baseY += dy;   // ground moves down

                // Wrap: when tiles scroll off lower-left, teleport to upper-right
                const maxLocalX = (10 - 1) * (TILE_WIDTH / 2); // rightmost tile local X ≈ 288
                if (layer.baseX + maxLocalX < -50) {
                    layer.baseX += layer.width * 2;
                    layer.baseY -= layer.width; // 2 * wrapDY correction
                }
                layer.g.setPosition(layer.baseX, layer.baseY);
            });

            // Mountain alpha fade-in (prairie zone: 0–300 invisible, 300–640 fade in)
            const mountainAlpha = getMountainAlpha(gs.milesTraveled);
            this.mtnLayers.forEach(layer => layer.g.setAlpha(mountainAlpha));

            // Drift clouds (horizontal)
            this.cloudLayers.forEach(cl => {
                cl.x -= scrollSpeed * cl.speed * dt;
                if (cl.x < -200) cl.x += GAME_WIDTH + 400;
                cl.g.x = cl.x;
            });

            // Wagon bob — slight oscillation along iso diagonal (up-right direction)
            const bobPhase = Math.sin(this.scrollOffset * 0.05) * 1.5;
            this.wagonG.x = -bobPhase * 0.3;
            this.wagonG.y = bobPhase;

            // Dust behind wagon (down-left = behind, since wagon travels up-right)
            const wagonCX = GAME_WIDTH / 2 + 230;
            const wagonCY = GROUND_Y - 125;
            if (Math.random() < 0.5) {
                this.dustParticles.push({
                    x: wagonCX - 40,
                    y: wagonCY + 20,
                    alpha: 0.45,
                    r: 3 + Math.random() * 7,
                });
            }
        }

        // Update dust — drifts down-right (behind wagon traveling into distance)
        this.dustParticles = this.dustParticles.filter(p => p.alpha > 0.02);
        this.dustParticles.forEach(p => {
            p.x += 25 * dt;  // drift right
            p.y += 12 * dt;  // drift down (iso diagonal)
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

        // ─── Weather particles ────────────────────────────────────────────────
        const weather = gs.weather;
        this.weatherParticleG.clear();

        if (weather === Weather.RAINY) {
            // Spawn new rain streaks (cap 150)
            if (this.weatherParticles.length < 150) {
                for (let i = 0; i < 4; i++) {
                    this.weatherParticles.push({
                        x: Math.random() * GAME_WIDTH,
                        y: -10,
                        vx: -15 + Math.random() * 5,
                        vy: 400 + Math.random() * 200,
                        alpha: 0.35 + Math.random() * 0.3,
                        length: 8 + Math.random() * 12,
                        type: 'rain',
                    });
                }
            }
            // Update and draw rain streaks
            this.weatherParticles = this.weatherParticles.filter(p => p.y < GAME_HEIGHT + 20);
            this.weatherParticles.forEach(p => {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                this.weatherParticleG.lineStyle(1, 0x8aaabf, p.alpha);
                this.weatherParticleG.beginPath();
                this.weatherParticleG.moveTo(p.x, p.y);
                this.weatherParticleG.lineTo(p.x + p.vx * 0.025, p.y + p.length);
                this.weatherParticleG.strokePath();
            });
        } else if (weather === Weather.SNOWY) {
            // Spawn new snowflakes (cap 100)
            if (this.weatherParticles.length < 100) {
                const t = Date.now() * 0.001;
                this.weatherParticles.push({
                    x: Math.random() * GAME_WIDTH,
                    y: -5,
                    vx: Math.sin(t + Math.random() * 6) * 12,
                    vy: 35 + Math.random() * 30,
                    alpha: 0.6 + Math.random() * 0.4,
                    length: 0,
                    type: 'snow',
                });
            }
            // Update and draw snowflakes
            this.weatherParticles = this.weatherParticles.filter(p => p.y < GAME_HEIGHT + 10);
            this.weatherParticles.forEach(p => {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vx += Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.5 * dt;
                this.weatherParticleG.fillStyle(0xffffff, p.alpha);
                this.weatherParticleG.fillCircle(p.x, p.y, 1.5 + Math.random() * 0.5);
            });
        } else if (weather === Weather.HOT) {
            // Heat shimmer: 4 flickering transparent horizontal bands near ground
            for (let i = 0; i < 4; i++) {
                const shimmerAlpha = 0.03 + Math.random() * 0.04;
                const shimmerY = GROUND_Y - 25 + i * 9 + (Math.random() - 0.5) * 3;
                this.weatherParticleG.fillStyle(0xffd080, shimmerAlpha);
                this.weatherParticleG.fillRect(0, shimmerY, GAME_WIDTH, 3 + Math.random() * 2);
            }
            // Drain any lingering rain/snow particles
            this.weatherParticles = this.weatherParticles.filter(p => p.y < GAME_HEIGHT + 20);
        }
        // CLEAR: weatherParticleG.clear() called unconditionally above handles it
    }

    // ─── Daily Tick ────────────────────────────────────────────────────────────

    private dailyTick(): void {
        if (this.paused) return;
        const gs = GameState.getInstance();

        // Safety: if game should already be over, transition immediately
        if (gs.isGameOver() || gs.milesTraveled >= TOTAL_TRAIL_MILES) {
            this.tickTimer.remove();
            this.scene.start(SCENES.GAME_OVER);
            return;
        }

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
                    m.health = Math.max(0, m.health - 3);
                    if (m.health <= 0) {
                        m.status = MemberStatus.DEAD;
                        this.showStatus(`${m.name} has died of starvation.`);
                    }
                }
            });
        }

        // Check game over FIRST — before landmarks/events can intercept
        if (gs.isGameOver()) {
            this.tickTimer.remove();
            this.time.delayedCall(600, () => this.scene.start(SCENES.GAME_OVER));
            return;
        }

        // Weather
        const oldWeather = gs.weather;
        if (Math.random() < 0.08) {
            const weathers = [Weather.CLEAR, Weather.CLEAR, Weather.RAINY, Weather.HOT, Weather.SNOWY];
            gs.weather = weathers[Math.floor(Math.random() * weathers.length)];
        }
        if (gs.weather !== oldWeather) {
            this.weatherParticles = [];  // flush immediately on weather change
        }

        // Biome/season/weather change detection — refresh all reactive layers
        const newWeather = gs.weather;
        const newBiome = getBiome(gs.milesTraveled);
        const newSeason = getSeason(gs.currentDate.getMonth());
        const biomeChanged = newBiome !== this.currentBiome;
        const seasonChanged = newSeason !== this.currentSeason;
        const weatherChanged = newWeather !== this.currentWeather;
        if (biomeChanged || seasonChanged || weatherChanged) {
            this.currentBiome = newBiome;
            this.currentSeason = newSeason;
            this.currentWeather = newWeather;
            if (weatherChanged || biomeChanged) this.redrawSky();
            if (biomeChanged || seasonChanged) {
                this.refreshParallaxLayers();
                this.refreshGroundLayers();
            }
        }

        // Check landmark
        const next = getNextLandmark(prevMiles);
        if (next && gs.milesTraveled >= next.miles) {
            this.onLandmarkReached(next);
            return;
        }

        // Random event (with cooldown to prevent back-to-back events)
        if (this.eventCooldown > 0) this.eventCooldown--;
        if (this.eventCooldown <= 0 && Math.random() < 0.07 && gs.pace !== Pace.STOPPED) {
            this.eventCooldown = 5; // minimum 5 ticks between events
            this.resetSpeedForSubScene();
            this.tickTimer.paused = true;
            this.scene.launch(SCENES.EVENT);
            this.scene.pause();
            return;
        }

        if (gs.milesTraveled >= TOTAL_TRAIL_MILES) {
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
        SoundManager.getInstance().stopTrailMusic();
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

        // Sky handled by skyG Graphics + redrawSky() — no camera background hack needed
    }

    private showStatus(msg: string): void {
        this.statusMsg.setText(msg);
        this.time.delayedCall(3000, () => this.statusMsg.setText(''));
    }

    private onResume(): void {
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
        // Resume trail music
        SoundManager.getInstance().startTrailMusic();
    }

    shutdown(): void {
        SoundManager.getInstance().stopTrailMusic();
        this.events.off('resume', this.onResume, this);
        this.input.keyboard?.removeAllListeners();
        if (this.tickTimer) this.tickTimer.remove();
    }
}
