class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Initialize sound effects - organized by usage type
    
    // Game-specific sounds (reserve success for game victories only)
    this.loadSound('success', '/sounds/ding.mp3'); // Game victories only
    this.loadSound('error', '/sounds/buzz.mp3');   // Game failures
    
    // UI interaction sounds (temporarily using working .mp3 files)
    this.loadSound('click', '/sounds/buzz.mp3');        // Button clicks, keyboard presses  
    this.loadSound('notification', '/sounds/buzz.mp3'); // Saves, copies, general notifications
    this.loadSound('whoosh', '/sounds/buzz.mp3');       // Theme changes, modal transitions
    this.loadSound('type', '/sounds/buzz.mp3');         // Typing/translation sounds (optional)
  }

  private loadSound(name: string, src: string) {
    try {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0.5; // Set reasonable volume
      
      // Add error handling
      audio.addEventListener('error', (e) => {
        console.warn(`Failed to load sound: ${name}`, e);
      });
      
      // Add load success logging
      audio.addEventListener('canplaythrough', () => {
        console.log(`Successfully loaded sound: ${name}`);
      });
      
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
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Successfully played sound: ${soundName}`);
          })
          .catch(error => {
            console.warn(`Failed to play sound: ${soundName}`, error);
          });
      }
    } else {
      console.warn(`Sound not found: ${soundName}`);
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
