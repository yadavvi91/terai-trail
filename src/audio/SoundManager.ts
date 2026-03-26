/**
 * SoundManager — singleton for procedural audio via Web Audio API.
 * Handles SFX generation, mute toggle, and persistence via localStorage.
 */

export class SoundManager {
    private static instance: SoundManager;
    private ctx: AudioContext | null = null;
    private muted: boolean = false;
    private initialized: boolean = false;
    private musicInterval: ReturnType<typeof setInterval> | null = null;
    private musicStep: number = 0;
    private musicPlaying: boolean = false;

    private constructor() {
        this.muted = localStorage.getItem('caulk_muted') === 'true';
    }

    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    /** Must be called from a user gesture (click/key) to unlock Web Audio */
    init(): void {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.initialized = true;
        } catch {
            console.warn('Web Audio API not available');
        }
    }

    get isMuted(): boolean { return this.muted; }

    toggleMute(): boolean {
        this.muted = !this.muted;
        localStorage.setItem('caulk_muted', String(this.muted));
        return this.muted;
    }

    // ─── Procedural SFX ──────────────────────────────────────────────────────

    /** Short UI click */
    playClick(): void {
        this.playTone(800, 0.06, 'square', 0.15);
    }

    /** Gunshot — noise burst + low thump */
    playGunshot(): void {
        if (!this.ctx || this.muted) return;
        this.init();
        const ctx = this.ctx!;
        const now = ctx.currentTime;

        // Noise burst
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        noise.connect(noiseGain).connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.12);

        // Low thump
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    /** Water splash */
    playWaterSplash(): void {
        if (!this.ctx || this.muted) return;
        this.init();
        const ctx = this.ctx!;
        const now = ctx.currentTime;

        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / ctx.sampleRate;
            data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 6) * 0.4;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        source.connect(filter).connect(gain).connect(ctx.destination);
        source.start(now);
        source.stop(now + 0.35);
    }

    /** Wagon creak / rolling sound */
    playWagonRoll(): void {
        if (!this.ctx || this.muted) return;
        this.init();
        const ctx = this.ctx!;
        const now = ctx.currentTime;

        // Low rumble
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(60 + Math.random() * 20, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

        // Creak
        const creak = ctx.createOscillator();
        creak.type = 'sawtooth';
        creak.frequency.setValueAtTime(300 + Math.random() * 200, now);
        creak.frequency.exponentialRampToValueAtTime(150, now + 0.15);
        const creakGain = ctx.createGain();
        creakGain.gain.setValueAtTime(0.04, now);
        creakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        creak.connect(creakGain).connect(ctx.destination);
        creak.start(now + 0.05);
        creak.stop(now + 0.2);
    }

    /** Positive event chime — ascending major triad */
    playGoodEvent(): void {
        this.playTone(523, 0.12, 'sine', 0.2);
        setTimeout(() => this.playTone(659, 0.12, 'sine', 0.2), 120);
        setTimeout(() => this.playTone(784, 0.18, 'sine', 0.25), 240);
    }

    /** Negative event sting — descending minor */
    playBadEvent(): void {
        this.playTone(300, 0.2, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(200, 0.3, 'sawtooth', 0.12), 200);
    }

    /** Supply/loot found — coin-like "ka-ching" */
    playSupplyFound(): void {
        this.playTone(1200, 0.06, 'square', 0.12);
        setTimeout(() => this.playTone(1600, 0.08, 'square', 0.14), 70);
        setTimeout(() => this.playTone(2000, 0.12, 'sine', 0.10), 140);
    }

    /** Danger/warning — low alarm pulse */
    playDanger(): void {
        if (!this.ctx || this.muted) return;
        this.init();
        const ctx = this.ctx!;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.4);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.setValueAtTime(0.05, now + 0.15);
        gain.gain.setValueAtTime(0.18, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
    }

    /** Breakdown/damage — metallic clang */
    playBreakdown(): void {
        if (!this.ctx || this.muted) return;
        this.init();
        const ctx = this.ctx!;
        const now = ctx.currentTime;
        // Metal hit
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.Q.setValueAtTime(3, now);
        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    /** Weather event — wind whoosh */
    playWeather(): void {
        if (!this.ctx || this.muted) return;
        this.init();
        const ctx = this.ctx!;
        const now = ctx.currentTime;
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / ctx.sampleRate;
            const env = Math.sin(t * Math.PI / 0.5); // fade in and out
            data[i] = (Math.random() * 2 - 1) * env * 0.3;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.linearRampToValueAtTime(800, now + 0.25);
        filter.frequency.linearRampToValueAtTime(300, now + 0.5);
        filter.Q.setValueAtTime(1.5, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        source.connect(filter).connect(gain).connect(ctx.destination);
        source.start(now);
        source.stop(now + 0.5);
    }

    /** Meeting travelers — friendly horn/bugle */
    playTravelers(): void {
        this.playTone(392, 0.15, 'triangle', 0.18);
        setTimeout(() => this.playTone(523, 0.12, 'triangle', 0.18), 160);
        setTimeout(() => this.playTone(659, 0.15, 'triangle', 0.20), 300);
        setTimeout(() => this.playTone(784, 0.25, 'triangle', 0.22), 460);
    }

    /** Button hover */
    playHover(): void {
        this.playTone(600, 0.03, 'sine', 0.06);
    }

    /** Hunting ambience — tense low drone with cricket-like chirps */
    startHuntingAmbience(): void {
        if (this.musicPlaying) return;
        this.musicPlaying = true;
        this.musicStep = 0;

        // Sparse, tense notes — low staccato with occasional bird chirp
        const melody: [number, number, number][] = [
            [110, 200, 0.08], [0, 400, 0],  [130, 150, 0.06], [0, 600, 0],
            [1800, 40, 0.04], [0, 200, 0],  [2200, 30, 0.03], [0, 800, 0],
            [100, 250, 0.08], [0, 500, 0],  [1600, 50, 0.04], [0, 300, 0],
            [0, 600, 0],      [120, 200, 0.07], [0, 400, 0],
            [2000, 35, 0.03], [0, 200, 0],  [2400, 25, 0.03], [0, 1000, 0],
        ];

        const beatMs = 150;
        this.musicInterval = setInterval(() => {
            if (this.muted || !this.ctx) {
                this.musicStep = (this.musicStep + 1) % melody.length;
                return;
            }
            const [freq, dur, vol] = melody[this.musicStep % melody.length];
            if (freq > 0) {
                // Low notes use triangle wave, high notes (chirps) use sine
                if (freq < 200) {
                    this.playTone(freq, dur / 1000, 'triangle', vol);
                } else {
                    this.playTone(freq, dur / 1000, 'sine', vol);
                }
            }
            this.musicStep = (this.musicStep + 1) % melody.length;
        }, beatMs);
    }

    // ─── Trail Music ──────────────────────────────────────────────────────────

    /** Catchy western marching melody — procedural, loops forever */
    startTrailMusic(): void {
        if (this.musicPlaying) return;
        this.musicPlaying = true;
        this.musicStep = 0;

        // "ta-ta ta ta ta ta" marching melody in C major
        // Each entry: [frequency (Hz), duration (ms), volume]
        // 0 = rest
        const melody: [number, number, number][] = [
            // Phrase 1: "ta-ta ta ta ta ta" — upbeat march
            [330, 120, 0.18], [330, 120, 0.18], [0, 30, 0],  [392, 200, 0.20],
            [330, 120, 0.16], [262, 120, 0.16], [0, 30, 0],  [294, 300, 0.20],
            // Phrase 2: ascending response
            [330, 120, 0.18], [330, 120, 0.18], [0, 30, 0],  [349, 200, 0.18],
            [392, 200, 0.20], [0, 60, 0],                     [440, 300, 0.22],
            // Phrase 3: repeat first motif
            [330, 120, 0.18], [330, 120, 0.18], [0, 30, 0],  [392, 200, 0.20],
            [330, 120, 0.16], [262, 120, 0.16], [0, 30, 0],  [294, 300, 0.20],
            // Phrase 4: descending resolution
            [262, 120, 0.16], [294, 120, 0.16], [0, 30, 0],  [330, 200, 0.18],
            [262, 200, 0.18], [0, 60, 0],                     [262, 400, 0.22],
            // Rest between loops
            [0, 300, 0],
        ];

        const BPM = 160;
        const beatMs = 60000 / BPM; // ~375ms per beat, we use half-beats

        this.musicInterval = setInterval(() => {
            if (this.muted || !this.ctx) {
                this.musicStep = (this.musicStep + 1) % melody.length;
                return;
            }
            const [freq, dur, vol] = melody[this.musicStep % melody.length];
            if (freq > 0) {
                this.playMusicNote(freq, dur / 1000, vol);
            }
            this.musicStep = (this.musicStep + 1) % melody.length;
        }, beatMs * 0.5); // eighth-note grid
    }

    stopTrailMusic(): void {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        this.musicPlaying = false;
        this.musicStep = 0;
    }

    /** Play a single music note with softer, warmer tone */
    private playMusicNote(freq: number, duration: number, volume: number): void {
        if (!this.ctx || this.muted) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Lead voice — square wave for retro feel
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle filter to soften the square wave
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 3, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.01); // quick attack
        gain.gain.setValueAtTime(volume, now + duration * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.01);

        // Sub-octave for warmth
        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(freq / 2, now);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.001, now);
        subGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        sub.connect(subGain).connect(ctx.destination);
        sub.start(now);
        sub.stop(now + duration + 0.01);
    }

    // ─── Utility ─────────────────────────────────────────────────────────────

    private playTone(freq: number, duration: number, type: OscillatorType, volume: number): void {
        if (!this.ctx || this.muted) return;
        this.init();
        const ctx = this.ctx!;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
    }
}
