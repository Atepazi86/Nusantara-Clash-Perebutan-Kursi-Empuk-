class SoundManager {
  private ctx: AudioContext | null = null;
  public muted = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    volume = 0.08,
    delay = 0,
    slideToFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideToFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.playTone(520, 0.06, 'sine', 0.06, 0, 680);
  }

  playDragStart() {
    this.playTone(360, 0.08, 'sine', 0.06, 0, 540);
  }

  playDropSnap() {
    // Rubbery cartoon plop-pop!
    this.playTone(280, 0.07, 'sine', 0.09, 0, 620);
    this.playTone(620, 0.09, 'triangle', 0.08, 0.05, 780);
  }

  playBoing() {
    this.playTone(220, 0.22, 'sine', 0.09, 0, 560);
  }

  playCoinJingle() {
    [987, 1318, 1567, 1975].forEach((f, idx) => {
      this.playTone(f, 0.11, 'sine', 0.07, idx * 0.05);
    });
  }

  playLevelUp() {
    this.playTone(440, 0.1, 'triangle', 0.08, 0);
    this.playTone(554, 0.1, 'triangle', 0.08, 0.06);
    this.playTone(659, 0.16, 'triangle', 0.09, 0.12);
  }

  playAwaken() {
    [523, 659, 784, 1046].forEach((f, idx) => {
      this.playTone(f, 0.16, 'triangle', 0.09, idx * 0.07);
    });
  }

  playPullDrum() {
    this.playTone(150, 0.14, 'sine', 0.1, 0, 90);
    this.playTone(180, 0.14, 'sine', 0.1, 0.18, 100);
    this.playTone(220, 0.18, 'triangle', 0.1, 0.36, 360);
  }

  playReveal(isHighRarity: boolean) {
    if (isHighRarity) {
      [587, 740, 880, 1174].forEach((f, i) => {
        this.playTone(f, 0.22, 'triangle', 0.1, i * 0.07);
      });
    } else {
      this.playTone(520, 0.12, 'sine', 0.07, 0, 660);
    }
  }

  playHit(isCrit = false) {
    if (isCrit) {
      this.playTone(240, 0.18, 'sawtooth', 0.09, 0, 75);
      this.playTone(620, 0.12, 'square', 0.06, 0.02, 200);
    } else {
      this.playTone(190, 0.11, 'triangle', 0.08, 0, 80);
    }
  }

  playHeal() {
    this.playTone(523, 0.12, 'sine', 0.07, 0, 659);
    this.playTone(659, 0.15, 'sine', 0.07, 0.08, 784);
  }

  // Comedic Character Signature Ultimates!
  playJogetDance() {
    // Bouncy upbeat dangdut-style groove
    [262, 330, 392, 523, 392, 523].forEach((f, i) => {
      this.playTone(f, 0.1, 'triangle', 0.09, i * 0.075);
    });
  }

  playBikeBell() {
    // Classic "Kring-kring!" bicycle bell
    this.playTone(1760, 0.12, 'sine', 0.08, 0);
    this.playTone(1975, 0.14, 'sine', 0.08, 0.06);
    this.playTone(1760, 0.12, 'sine', 0.08, 0.18);
    this.playTone(1975, 0.16, 'sine', 0.08, 0.24);
  }

  playMegaphone() {
    // Command siren blast
    this.playTone(440, 0.15, 'sawtooth', 0.07, 0, 660);
    this.playTone(660, 0.2, 'sawtooth', 0.07, 0.16, 480);
  }

  playSantuySlide() {
    // Relaxed cartoon slide whistle
    this.playTone(340, 0.16, 'sine', 0.08, 0, 880);
    this.playTone(880, 0.14, 'sine', 0.07, 0.17, 420);
  }

  playGasHiss() {
    // Pressurized comic hiss + boing
    const ctx = this.getContext();
    if (ctx) {
      const bufferSize = ctx.sampleRate * 0.24;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1800;
      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    }
    this.playTone(320, 0.18, 'sine', 0.08, 0.12, 140);
  }

  playTelolet() {
    // Iconic "Om Telolet Om!" melodic 3-note horn
    this.playTone(523, 0.11, 'sawtooth', 0.06, 0);
    this.playTone(659, 0.11, 'sawtooth', 0.06, 0.12);
    this.playTone(587, 0.11, 'sawtooth', 0.06, 0.24);
    this.playTone(784, 0.22, 'sawtooth', 0.07, 0.36);
  }

  playWhistle() {
    // Energetic aerobics whistle trill
    [1480, 1620, 1480, 1660, 1520].forEach((f, i) => {
      this.playTone(f, 0.06, 'sine', 0.07, i * 0.055);
    });
  }

  playKentongan() {
    // Hollow wooden bamboo tok-tok-tok!
    [0, 0.11, 0.22].forEach((d, idx) => {
      this.playTone(idx === 2 ? 490 : 390, 0.08, 'triangle', 0.11, d, 290);
    });
  }

  playDiamondFlash() {
    // Sparkling rich chime + laser dazzle
    [1046, 1318, 1567, 2093].forEach((f, i) => {
      this.playTone(f, 0.14, 'sine', 0.08, i * 0.05);
    });
  }

  playCameraDing() {
    // Camera shutter + viral notification bell
    this.playTone(880, 0.06, 'square', 0.05, 0, 440);
    this.playTone(1174, 0.14, 'sine', 0.08, 0.08);
    this.playTone(1567, 0.18, 'sine', 0.08, 0.16);
  }

  playSidakStamp() {
    // Heavy inspection thud + camera click
    this.playTone(160, 0.14, 'triangle', 0.11, 0, 70);
    this.playTone(987, 0.08, 'sine', 0.07, 0.12);
  }

  playScooterHorn() {
    // Scooter "Beep-beep!" horn + rev
    this.playTone(698, 0.09, 'sawtooth', 0.06, 0);
    this.playTone(698, 0.12, 'sawtooth', 0.06, 0.13);
    this.playTone(220, 0.18, 'triangle', 0.07, 0.27, 460);
  }

  playUltimateByHero(templateId: string) {
    switch (templateId) {
      case 'jenderal_gemoy':
        this.playJogetDance();
        break;
      case 'pak_tukang_kayu':
        this.playBikeBell();
        break;
      case 'ibu_banteng':
        this.playMegaphone();
        break;
      case 'mas_santuy':
        this.playSantuySlide();
        break;
      case 'juragan_energi':
        this.playGasHiss();
        break;
      case 'abang_ojol':
        this.playTelolet();
        break;
      case 'ibu_senam':
        this.playWhistle();
        break;
      case 'hansip_malam':
        this.playKentongan();
        break;
      case 'pengacara_berlian':
        this.playDiamondFlash();
        break;
      case 'sultan_konten':
        this.playCameraDing();
        break;
      case 'kang_sidak':
        this.playSidakStamp();
        break;
      case 'emak_sein':
        this.playScooterHorn();
        break;
      default:
        this.playHit(true);
    }
  }

  playVictory() {
    [523, 659, 784, 1046].forEach((f, i) => {
      this.playTone(f, 0.2, 'triangle', 0.09, i * 0.1);
    });
  }

  playDefeat() {
    [340, 290, 220].forEach((f, i) => {
      this.playTone(f, 0.22, 'sawtooth', 0.06, i * 0.14);
    });
  }
}

export const soundFX = new SoundManager();
