export class AudioManager {
  private audioContext: AudioContext | null = null;
  private isMuted = false;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  playCountdownBeep(count: number): void {
    if (this.isMuted || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Musical frequencies for more pleasant countdown
    const frequencies = {
      2: 500,  // Higher pitched similar tone
      1: 500,  // Same as 2 for similarity
      0: 659   // Higher pitched for final beep
    };

    oscillator.frequency.setValueAtTime(
      frequencies[count as keyof typeof frequencies] || 500, 
      this.audioContext.currentTime
    );
    oscillator.type = 'triangle'; // Softer, more pleasant than sine

    // Consistent volume envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  playGoSound(): void {
    if (this.isMuted || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Upbeat "Go!" sound with rising tone
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.3);
    oscillator.type = 'triangle';

    // Energetic volume envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
}