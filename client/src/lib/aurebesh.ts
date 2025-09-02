// Aurebesh character mappings
export const aurebeshCharacters = {
  'A': '\uE000', 'B': '\uE001', 'C': '\uE002', 'D': '\uE003', 'E': '\uE004',
  'F': '\uE005', 'G': '\uE006', 'H': '\uE007', 'I': '\uE008', 'J': '\uE009',
  'K': '\uE00A', 'L': '\uE00B', 'M': '\uE00C', 'N': '\uE00D', 'O': '\uE00E',
  'P': '\uE00F', 'Q': '\uE017', 'R': '\uE019', 'S': '\uE01A', 'T': '\uE01B',
  'U': '\uE01C', 'V': '\uE01D', 'W': '\uE01E', 'X': '\uE01F', 'Y': '\uE020',
  'Z': '\uE021'
};

// Aurebesh ligature mappings
export const ligatures = {
  "ch": "\uE011",
  "sh": "\uE016", 
  "th": "\uE018",
  "ae": "\uE010",
  "eo": "\uE012",
  "kh": "\uE013",
  "oo": "\uE015",
  "ng": "\uE014"
};

export function englishToAurebesh(text: string): string {
  text = text.toLowerCase();
  let result = "";
  let i = 0;
  
  while (i < text.length) {
    if (i < text.length - 1 && text.substring(i, i + 2) in ligatures) {
      result += ligatures[text.substring(i, i + 2) as keyof typeof ligatures];
      i += 2;
    } else {
      const upperChar = text[i].toUpperCase();
      if (aurebeshCharacters[upperChar as keyof typeof aurebeshCharacters]) {
        result += aurebeshCharacters[upperChar as keyof typeof aurebeshCharacters];
      } else {
        result += text[i]; // Keep original character if no mapping
      }
      i += 1;
    }
  }
  
  return result;
}

export function aurebeshToEnglish(text: string): string {
  let result = "";
  
  for (const char of text) {
    const normalizedChar = char.normalize('NFC');
    const codePoint = normalizedChar.codePointAt(0);
    let matched = false;
    
    for (const [lig, glyph] of Object.entries(ligatures)) {
      if (codePoint === glyph.codePointAt(0)) {
        result += lig;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // Check if it's an Aurebesh character we need to convert back
      for (const [letter, glyph] of Object.entries(aurebeshCharacters)) {
        if (codePoint === glyph.codePointAt(0)) {
          result += letter.toLowerCase();
          matched = true;
          break;
        }
      }
      if (!matched) {
        result += normalizedChar.toLowerCase();
      }
    }
  }
  
  return result;
}

// Preset phrases for translation
export const presetPhrases = [
  "May the Force be with you",
  "I have a bad feeling about this",
  "Do. Or do not. There is no try.",
  "This is the way",
  "Use the Force, Luke.",
  "Help me, Obi-Wan Kenobi. You're my only hope.",
  "These aren't the droids you're looking for.",
  "I find your lack of faith disturbing.",
  "The Force will be with you. Always.",
  "Never tell me the odds!",
  "It's a trap!",
  "In my experience, there's no such thing as luck.",
  "Stay on target.",
  "I am your father.",
  "I will not be the last Jedi.",
  "Rebellions are built on hope.",
  "I am one with the Force. The Force is with me.",
  "I feel the good in you, the conflict.",
  "Your eyes can deceive you; don't trust them.",
  "The circle is now complete.",
  "Remember, the Force will be with you, always.",
  "Now this is podracing!",
  "You were the chosen one!",
  "I have the highground",
  "You've taken your first step into a larger world.",
  "Only a Sith deals in absolutes.",
  "Power! Unlimited power!",
  "I'm altering the deal. Pray I don't alter it any further.",
  "Why, you stuck-up, half-witted, scruffy-looking nerf herder!",
  "I suggest a new strategy, R2. Let the Wookiee win.",
  "Truly wonderful, the mind of a child is.",
  "I am a Jedi, like my father before me.",
  "You don't know the power of the dark side!",
  "Chewie, we're home.",
  "I'll never turn to the dark side.",
  "I've been waiting for you, Obi-Wan.",
  "I've got a bad feeling about this.",
  "I want to go home and rethink my life.",
  "That's no moon. It's a space station.",
  "You don't believe in the Force, do you?",
  "Mind tricks don't work on me.",
  "I'm just a simple man trying to make my way in the universe.",
  "Fear leads to anger. Anger leads to hate. Hate leads to suffering.",
];

// Game tier definitions
export const TIERS = {
  1: [
    // Single letters
    ...Array.from('abcdefghijklmnopqrstuvwxyz'),
    // Ligatures
    ...Object.keys(ligatures)
  ],
  2: [
    "lightsaber", "blaster", "bowcaster", "thermal detonator", "ion cannon",
    "disruptor", "electrostaff", "force pike", "comlink", "datapad",
    "x-wing", "tie fighter", "millennium falcon", "star destroyer", "tie advanced",
    "snowspeeder", "podracer", "slave i", "speeder bike", "imperial shuttle",
    "luke", "leia", "han", "chewbacca", "yoda",
    "obi wan", "anakin", "vader", "palpatine", "lando",
    "wookiee", "ewok", "rodian", "twi'lek", "zabrak",
    "mon calamari", "duros", "bothan", "kashyyykian", "jawa",
    "tatooine", "coruscant", "naboo", "hoth", "endor",
    "kamino", "geonosis", "mustafar", "dagobah", "kashyyyk",
    "rebel alliance", "galactic empire", "first order", "resistance", "jedi order",
    "sith order", "bounty hunters", "clone troopers", "stormtroopers", "droids",
  ],
  3: presetPhrases
};
