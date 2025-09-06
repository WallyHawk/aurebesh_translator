class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Initialize sound effects - organized by usage type
    
    // Game-specific sounds (reserve success for game victories only)
    this.loadSound('success', '/sounds/ding.mp3'); // Game victories only
    this.loadSound('error', '/sounds/buzz.mp3');   // Game failures
    
    // UI interaction sounds  
    this.loadSound('click', '/sounds/click.mp3');       // Button clicks, keyboard presses
    this.loadSound('notification', '/sounds/chime.wav'); // Saves, copies, general notifications
    this.loadSound('whoosh', '/sounds/whoosh.wav');     // Theme changes, modal transitions
    this.loadSound('type', '/sounds/type.mp3');         // Typing/translation sounds (optional)
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
