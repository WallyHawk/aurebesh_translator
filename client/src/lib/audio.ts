class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Initialize sound effects with user's custom sounds
    this.loadSound('success', '/sounds/ding.mp3');
    this.loadSound('error', '/sounds/buzz.mp3');
  }

  private loadSound(name: string, src: string) {
    try {
      const audio = new Audio(src);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  play(soundName: string) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.warn(`Failed to play sound: ${soundName}`, error);
      });
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const audioManager = new AudioManager();
