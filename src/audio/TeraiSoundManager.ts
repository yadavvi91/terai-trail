/**
 * WP18 — Terai Trail Sound Manager
 * Web Audio API synthesis: Punjabi melodies, jungle ambience, settlement SFX.
 * No external audio files.
 */

export class TeraiSoundManager {
    private static instance: TeraiSoundManager;
    private ctx: AudioContext | null = null;
    private muted: boolean = false;
    private initialized: boolean = false;
    private musicGain: GainNode | null = null;
    private sfxGain: GainNode | null = null;
    private ambienceGain: GainNode | null = null;
    private ambienceInterval: ReturnType<typeof setInterval> | null = null;
    private musicInterval: ReturnType<typeof setInterval> | null = null;

    private constructor() {
        this.muted = localStorage.getItem('terai_muted') === 'true';
    }

    static getInstance(): TeraiSoundManager {
        if (!TeraiSoundManager.instance) {
            TeraiSoundManager.instance = new TeraiSoundManager();
        }
        return TeraiSoundManager.instance;
    }

    init(): void {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.musicGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            this.ambienceGain = this.ctx.createGain();
            this.musicGain.connect(this.ctx.destination);
            this.sfxGain.connect(this.ctx.destination);
            this.ambienceGain.connect(this.ctx.destination);
            this.musicGain.gain.value = 0.3;
            this.sfxGain.gain.value = 0.5;
            this.ambienceGain.gain.value = 0.15;
            this.initialized = true;
            if (this.muted) this.setMuted(true);
        } catch {
            // Web Audio not available
        }
    }

    // ── Mute control ──

    isMuted(): boolean { return this.muted; }

    toggleMute(): boolean {
        this.setMuted(!this.muted);
        return this.muted;
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
        localStorage.setItem('terai_muted', muted ? 'true' : 'false');
        if (this.musicGain) this.musicGain.gain.value = muted ? 0 : 0.3;
        if (this.sfxGain) this.sfxGain.gain.value = muted ? 0 : 0.5;
        if (this.ambienceGain) this.ambienceGain.gain.value = muted ? 0 : 0.15;
    }

    // ── Helper: play a tone ──

    private playTone(freq: number, duration: number, gain: GainNode, type: OscillatorType = 'sine', startDelay: number = 0): void {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0, this.ctx.currentTime + startDelay);
        env.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + startDelay + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startDelay + duration);
        osc.connect(env);
        env.connect(gain);
        osc.start(this.ctx.currentTime + startDelay);
        osc.stop(this.ctx.currentTime + startDelay + duration);
    }

    private playNoise(duration: number, gain: GainNode, startDelay: number = 0): void {
        if (!this.ctx || this.muted) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const source = this.ctx.createBufferSource();
        const env = this.ctx.createGain();
        source.buffer = buffer;
        env.gain.setValueAtTime(0, this.ctx.currentTime + startDelay);
        env.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + startDelay + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startDelay + duration);
        source.connect(env);
        env.connect(gain);
        source.start(this.ctx.currentTime + startDelay);
    }

    // ── Music: Punjabi-influenced settlement theme ──

    startSettlementMusic(): void {
        if (!this.ctx || !this.musicGain) return;
        this.stopMusic();
        // Punjabi pentatonic scale: Sa Re Ga Pa Dha (C D Eb G Ab)
        const notes = [261.6, 293.7, 311.1, 392.0, 415.3, 392.0, 311.1, 293.7];
        let step = 0;
        this.musicInterval = setInterval(() => {
            const freq = notes[step % notes.length];
            this.playTone(freq, 0.4, this.musicGain!, 'triangle');
            // Dhol-style bass hit on beats 0, 4
            if (step % 4 === 0) {
                this.playTone(80, 0.15, this.musicGain!, 'sine');
            }
            step++;
        }, 500);
    }

    startVictoryMusic(): void {
        if (!this.ctx || !this.musicGain) return;
        this.stopMusic();
        // Dhol celebration: fast rhythm
        const notes = [392, 440, 523, 440, 392, 523, 587, 523];
        let step = 0;
        this.musicInterval = setInterval(() => {
            this.playTone(notes[step % notes.length], 0.2, this.musicGain!, 'square');
            this.playTone(100, 0.1, this.musicGain!, 'sine'); // dhol bass
            step++;
        }, 200);
    }

    startFuneralMusic(): void {
        if (!this.ctx || !this.musicGain) return;
        this.stopMusic();
        // Harmonium-style: slow, somber
        const notes = [261.6, 246.9, 220.0, 246.9, 261.6, 220.0];
        let step = 0;
        this.musicInterval = setInterval(() => {
            this.playTone(notes[step % notes.length], 1.0, this.musicGain!, 'sine');
            step++;
        }, 1200);
    }

    stopMusic(): void {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    // ── Ambience: Jungle sounds ──

    startJungleAmbience(): void {
        if (!this.ctx || !this.ambienceGain) return;
        this.stopAmbience();
        this.ambienceInterval = setInterval(() => {
            // Random insect chirps
            if (Math.random() < 0.4) {
                const chirpFreq = 3000 + Math.random() * 2000;
                this.playTone(chirpFreq, 0.05, this.ambienceGain!, 'sine');
                this.playTone(chirpFreq * 1.02, 0.05, this.ambienceGain!, 'sine', 0.08);
            }
            // Random bird call
            if (Math.random() < 0.15) {
                const birdFreq = 1200 + Math.random() * 800;
                this.playTone(birdFreq, 0.15, this.ambienceGain!, 'sine');
                this.playTone(birdFreq * 1.3, 0.1, this.ambienceGain!, 'sine', 0.18);
            }
        }, 800);
    }

    stopAmbience(): void {
        if (this.ambienceInterval) {
            clearInterval(this.ambienceInterval);
            this.ambienceInterval = null;
        }
    }

    // ── Sound Effects ──

    playAxeChop(): void {
        if (!this.sfxGain) return;
        this.playNoise(0.08, this.sfxGain);
        this.playTone(200, 0.1, this.sfxGain, 'sawtooth', 0.02);
    }

    playMosquitoBuzz(): void {
        if (!this.sfxGain) return;
        this.playTone(400, 0.5, this.sfxGain, 'sawtooth');
    }

    playTigerGrowl(): void {
        if (!this.sfxGain) return;
        this.playTone(80, 0.8, this.sfxGain, 'sawtooth');
        this.playTone(90, 0.6, this.sfxGain, 'sawtooth', 0.1);
    }

    playMonsoonThunder(): void {
        if (!this.sfxGain) return;
        this.playNoise(1.5, this.sfxGain);
        this.playTone(40, 1.0, this.sfxGain, 'sine', 0.2);
    }

    playSnakeHiss(): void {
        if (!this.sfxGain) return;
        this.playNoise(0.4, this.sfxGain);
    }

    playBullockMoo(): void {
        if (!this.sfxGain) return;
        this.playTone(120, 0.6, this.sfxGain, 'sawtooth');
        this.playTone(110, 0.4, this.sfxGain, 'sawtooth', 0.3);
    }

    playHammerBuild(): void {
        if (!this.sfxGain) return;
        this.playNoise(0.05, this.sfxGain);
        this.playTone(800, 0.08, this.sfxGain, 'square');
        this.playNoise(0.05, this.sfxGain, 0.2);
        this.playTone(900, 0.08, this.sfxGain, 'square', 0.22);
    }

    playCelebration(): void {
        if (!this.sfxGain) return;
        // Quick ascending notes
        [392, 440, 523, 587, 659].forEach((freq, i) => {
            this.playTone(freq, 0.15, this.sfxGain!, 'triangle', i * 0.12);
        });
    }

    // ── Cleanup ──

    destroy(): void {
        this.stopMusic();
        this.stopAmbience();
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
    }
}
