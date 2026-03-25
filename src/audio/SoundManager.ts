/**
 * SoundManager — singleton for procedural audio via Web Audio API.
 * Handles SFX generation, mute toggle, and persistence via localStorage.
 */

export class SoundManager {
    private static instance: SoundManager;
    private ctx: AudioContext | null = null;
    private muted: boolean = false;
    private initialized: boolean = false;

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

    /** Positive event chime */
    playGoodEvent(): void {
        this.playTone(523, 0.12, 'sine', 0.2);
        setTimeout(() => this.playTone(659, 0.12, 'sine', 0.2), 120);
        setTimeout(() => this.playTone(784, 0.18, 'sine', 0.25), 240);
    }

    /** Negative event sting */
    playBadEvent(): void {
        this.playTone(300, 0.2, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(200, 0.3, 'sawtooth', 0.12), 200);
    }

    /** Button hover */
    playHover(): void {
        this.playTone(600, 0.03, 'sine', 0.06);
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
