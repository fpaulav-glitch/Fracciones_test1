// Procedural Web Audio API sound effects (zero external dependencies)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(
    freq: number,
    startTimeOffset: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.14
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + startTimeOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.playTone(520, 0, 0.07, 'triangle', 0.08);
  }

  public playCorrect() {
    // Warm cheerful C-major arpeggio
    this.playTone(523.25, 0, 0.14, 'triangle', 0.13);
    this.playTone(659.25, 0.08, 0.14, 'triangle', 0.13);
    this.playTone(783.99, 0.16, 0.24, 'sine', 0.16);
  }

  public playWrong() {
    // Gentle non-punitive wooden double-tone
    this.playTone(310, 0, 0.13, 'sine', 0.1);
    this.playTone(255, 0.11, 0.18, 'sine', 0.09);
  }

  public playStar() {
    this.playTone(880, 0, 0.12, 'sine', 0.11);
    this.playTone(1174.66, 0.08, 0.22, 'sine', 0.12);
  }

  public playWorldComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx * 0.1, 0.28, 'triangle', 0.14);
    });
  }
}

export const soundEngine = new SoundEngine();

export function speakSpanish(text: string, enabled: boolean) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.98;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors on unsupported browsers
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
