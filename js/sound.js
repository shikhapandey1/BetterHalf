/**
 * Sound Engine for BetterHalf
 * Pure Web Audio API synthesized kawaii sound effects & Animalese cute voice chatter!
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('betterhalf_sound_muted') === 'true';
        this.ambientSource = null;
        this.ambientGain = null;
        this.activeAmbient = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('betterhalf_sound_muted', this.isMuted);
        if (this.isMuted && this.ambientGain) {
            this.stopAmbient();
        }
        return this.isMuted;
    }

    // Cute bubble pop for buttons & taps
    playPop() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    // Melodic chime for task completion
    playChime() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + (idx * 0.07);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.18, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.38);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }

    // Celestial sparkle arpeggio
    playSparkle() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [659.25, 880, 1174.66, 1318.51, 1567.98];
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + (idx * 0.05);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.12, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.32);
        });
    }

    // Triumphant streak fanfare
    playStreakFanfare() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [
            { f: 523.25, d: 0.12 },
            { f: 659.25, d: 0.12 },
            { f: 783.99, d: 0.12 },
            { f: 1046.50, d: 0.35 }
        ];
        let offset = 0;
        const now = this.ctx.currentTime;

        notes.forEach((item) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + offset;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, startTime);

            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + item.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + item.d + 0.05);

            offset += 0.13;
        });
    }

    // Water drop
    playWaterDrop() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
    }

    // Cookie crunch
    playCookieCrunch() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);

        setTimeout(() => this.playSparkle(), 100);
    }

    /**
     * Animalese / Cozy Kawaii Voice Chatter Synthesizer
     * Plays cute musical formant vocal chirps (like Animal Crossing / Tamagotchi!)
     * Guaranteed to work offline on ANY browser even if Web Speech TTS is disabled!
     */
    playAnimalese(text = '', onComplete = null) {
        if (this.isMuted) {
            if (onComplete) onComplete();
            return;
        }
        this.init();
        if (!this.ctx) {
            if (onComplete) onComplete();
            return;
        }

        // Clean text to count syllables
        const clean = text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        const words = clean.split(/\s+/).filter(w => w.length > 0);
        // Play between 6 and 14 cute chirps
        const chirpCount = Math.min(14, Math.max(6, words.length * 2));

        // Sweet pentatonic/vocal pitches in Hz for cute bunny chatter
        const pitches = [698.46, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
        let timeOffset = 0;
        const chirpDuration = 0.075; // 75ms per syllable
        const now = this.ctx.currentTime + 0.02;

        for (let i = 0; i < chirpCount; i++) {
            const freq = pitches[Math.floor(Math.random() * pitches.length)];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            // Formant bandpass to simulate cute vocal tract
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(freq * 1.2, now + timeOffset);
            filter.Q.setValueAtTime(3.0, now + timeOffset);

            osc.type = i % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now + timeOffset);
            // Slight pitch wobble for cuteness
            osc.frequency.exponentialRampToValueAtTime(freq * 1.08, now + timeOffset + (chirpDuration * 0.8));

            gain.gain.setValueAtTime(0.001, now + timeOffset);
            gain.gain.linearRampToValueAtTime(0.18, now + timeOffset + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + chirpDuration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + chirpDuration + 0.01);

            timeOffset += chirpDuration + 0.018; // little pause between syllables
        }

        const totalTimeMs = (timeOffset + 0.05) * 1000;
        if (onComplete) {
            setTimeout(onComplete, totalTimeMs);
        }
    }

    // Ambient Rain sound generator
    toggleAmbient(type = 'rain') {
        if (this.activeAmbient === type) {
            this.stopAmbient();
            return false;
        }

        this.stopAmbient();
        if (this.isMuted) return false;
        this.init();
        if (!this.ctx) return false;

        this.activeAmbient = type;
        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.08, now);

        noise.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);

        noise.start(now);
        this.ambientSource = noise;
        return true;
    }

    stopAmbient() {
        if (this.ambientSource) {
            try { this.ambientSource.stop(); } catch(e) {}
            this.ambientSource = null;
        }
        if (this.ambientGain) {
            try { this.ambientGain.disconnect(); } catch(e) {}
            this.ambientGain = null;
        }
        this.activeAmbient = null;
    }
}

window.soundEngine = new SoundEngine();
