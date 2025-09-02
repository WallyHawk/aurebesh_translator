// Language learning data for contextual tooltips
export interface CharacterInfo {
  character: string;
  aurebesh: string;
  pronunciation: string;
  description: string;
  examples: string[];
}

export interface LigatureInfo {
  ligature: string;
  aurebesh: string;
  pronunciation: string;
  description: string;
  usage: string;
  examples: string[];
}

export interface VocabularyInfo {
  word: string;
  pronunciation: string;
  definition: string;
  category: string;
  context: string;
  examples: string[];
}

// Aurebesh character information
export const characterData: Record<string, CharacterInfo> = {
  'A': {
    character: 'A',
    aurebesh: 'A',
    pronunciation: 'ah',
    description: 'The first letter of the Aurebesh alphabet, equivalent to the Basic letter A.',
    examples: ['Aurek (A)', 'Admiral', 'Alliance']
  },
  'B': {
    character: 'B',
    aurebesh: 'B',
    pronunciation: 'besh',
    description: 'The second letter, representing the sound "B". Named "Besh" in Aurebesh.',
    examples: ['Besh (B)', 'Blaster', 'Base']
  },
  'C': {
    character: 'C',
    aurebesh: 'C',
    pronunciation: 'cresh',
    description: 'The third letter, representing the "C" sound. Called "Cresh".',
    examples: ['Cresh (C)', 'Clone', 'Cantina']
  },
  'D': {
    character: 'D',
    aurebesh: 'D',
    pronunciation: 'dorn',
    description: 'The fourth letter, representing "D". Known as "Dorn".',
    examples: ['Dorn (D)', 'Droid', 'Death Star']
  },
  'E': {
    character: 'E',
    aurebesh: 'E',
    pronunciation: 'esk',
    description: 'The fifth letter, representing "E". Called "Esk".',
    examples: ['Esk (E)', 'Empire', 'Emperor']
  },
  'F': {
    character: 'F',
    aurebesh: 'F',
    pronunciation: 'forn',
    description: 'The sixth letter, representing "F". Known as "Forn".',
    examples: ['Forn (F)', 'Force', 'Fighter']
  },
  'G': {
    character: 'G',
    aurebesh: 'G',
    pronunciation: 'grek',
    description: 'The seventh letter, representing "G". Called "Grek".',
    examples: ['Grek (G)', 'Galaxy', 'General']
  },
  'H': {
    character: 'H',
    aurebesh: 'H',
    pronunciation: 'herf',
    description: 'The eighth letter, representing "H". Known as "Herf".',
    examples: ['Herf (H)', 'Hoth', 'Hyperdrive']
  },
  'I': {
    character: 'I',
    aurebesh: 'I',
    pronunciation: 'isk',
    description: 'The ninth letter, representing "I". Called "Isk".',
    examples: ['Isk (I)', 'Imperial', 'Ion']
  },
  'J': {
    character: 'J',
    aurebesh: 'J',
    pronunciation: 'jenth',
    description: 'The tenth letter, representing "J". Known as "Jenth".',
    examples: ['Jenth (J)', 'Jedi', 'Jabba']
  },
  'K': {
    character: 'K',
    aurebesh: 'K',
    pronunciation: 'krill',
    description: 'The eleventh letter, representing "K". Called "Krill".',
    examples: ['Krill (K)', 'Kenobi', 'Kamino']
  },
  'L': {
    character: 'L',
    aurebesh: 'L',
    pronunciation: 'leth',
    description: 'The twelfth letter, representing "L". Known as "Leth".',
    examples: ['Leth (L)', 'Luke', 'Lightsaber']
  },
  'M': {
    character: 'M',
    aurebesh: 'M',
    pronunciation: 'mern',
    description: 'The thirteenth letter, representing "M". Called "Mern".',
    examples: ['Mern (M)', 'Master', 'Millennium']
  },
  'N': {
    character: 'N',
    aurebesh: 'N',
    pronunciation: 'nern',
    description: 'The fourteenth letter, representing "N". Known as "Nern".',
    examples: ['Nern (N)', 'Naboo', 'New Republic']
  },
  'O': {
    character: 'O',
    aurebesh: 'O',
    pronunciation: 'osk',
    description: 'The fifteenth letter, representing "O". Called "Osk".',
    examples: ['Osk (O)', 'Obi-Wan', 'Order']
  },
  'P': {
    character: 'P',
    aurebesh: 'P',
    pronunciation: 'peth',
    description: 'The sixteenth letter, representing "P". Known as "Peth".',
    examples: ['Peth (P)', 'Padmé', 'Planet']
  },
  'Q': {
    character: 'Q',
    aurebesh: 'Q',
    pronunciation: 'qek',
    description: 'The seventeenth letter, representing "Q". Called "Qek".',
    examples: ['Qek (Q)', 'Queen', 'Qui-Gon']
  },
  'R': {
    character: 'R',
    aurebesh: 'R',
    pronunciation: 'resh',
    description: 'The eighteenth letter, representing "R". Known as "Resh".',
    examples: ['Resh (R)', 'Rebel', 'Republic']
  },
  'S': {
    character: 'S',
    aurebesh: 'S',
    pronunciation: 'senth',
    description: 'The nineteenth letter, representing "S". Called "Senth".',
    examples: ['Senth (S)', 'Sith', 'Star']
  },
  'T': {
    character: 'T',
    aurebesh: 'T',
    pronunciation: 'trill',
    description: 'The twentieth letter, representing "T". Known as "Trill".',
    examples: ['Trill (T)', 'Tatooine', 'TIE Fighter']
  },
  'U': {
    character: 'U',
    aurebesh: 'U',
    pronunciation: 'usk',
    description: 'The twenty-first letter, representing "U". Called "Usk".',
    examples: ['Usk (U)', 'Utapau', 'Uncle']
  },
  'V': {
    character: 'V',
    aurebesh: 'V',
    pronunciation: 'vev',
    description: 'The twenty-second letter, representing "V". Known as "Vev".',
    examples: ['Vev (V)', 'Vader', 'Victory']
  },
  'W': {
    character: 'W',
    aurebesh: 'W',
    pronunciation: 'wesk',
    description: 'The twenty-third letter, representing "W". Called "Wesk".',
    examples: ['Wesk (W)', 'Wookiee', 'War']
  },
  'X': {
    character: 'X',
    aurebesh: 'X',
    pronunciation: 'xesh',
    description: 'The twenty-fourth letter, representing "X". Known as "Xesh".',
    examples: ['Xesh (X)', 'X-wing', 'Exogorth']
  },
  'Y': {
    character: 'Y',
    aurebesh: 'Y',
    pronunciation: 'yirt',
    description: 'The twenty-fifth letter, representing "Y". Called "Yirt".',
    examples: ['Yirt (Y)', 'Yoda', 'Yavin']
  },
  'Z': {
    character: 'Z',
    aurebesh: 'Z',
    pronunciation: 'zerek',
    description: 'The twenty-sixth letter, representing "Z". Known as "Zerek".',
    examples: ['Zerek (Z)', 'Zam', 'Zero']
  }
};

// Ligature information
export const ligatureData: Record<string, LigatureInfo> = {
  'ch': {
    ligature: 'ch',
    aurebesh: String.fromCharCode(0xE011),
    pronunciation: 'cherek',
    description: 'A common ligature combining C and H sounds.',
    usage: 'Used for the "ch" sound in words like "much" or "channel"',
    examples: ['channel', 'much', 'choice']
  },
  'sh': {
    ligature: 'sh',
    aurebesh: String.fromCharCode(0xE016),
    pronunciation: 'shen',
    description: 'A ligature for the "sh" sound.',
    usage: 'Represents the soft "sh" sound found in many words',
    examples: ['ship', 'flash', 'shield']
  },
  'th': {
    ligature: 'th',
    aurebesh: String.fromCharCode(0xE018),
    pronunciation: 'thesh',
    description: 'A ligature for the "th" sound.',
    usage: 'Used for both soft and hard "th" sounds',
    examples: ['the', 'think', 'breathe']
  },
  'ae': {
    ligature: 'ae',
    aurebesh: String.fromCharCode(0xE010),
    pronunciation: 'enth',
    description: 'A vowel ligature combining A and E.',
    usage: 'Represents the "ae" diphthong sound',
    examples: ['aeon', 'aesthetic']
  },
  'eo': {
    ligature: 'eo',
    aurebesh: String.fromCharCode(0xE012),
    pronunciation: 'onith',
    description: 'A vowel ligature combining E and O.',
    usage: 'Used for the "eo" sound combination',
    examples: ['people', 'jeopardy']
  },
  'kh': {
    ligature: 'kh',
    aurebesh: String.fromCharCode(0xE013),
    pronunciation: 'krenth',
    description: 'A consonant ligature for the "kh" sound.',
    usage: 'Represents a guttural "kh" sound, common in alien names',
    examples: ['Khajiit', 'khan']
  },
  'ng': {
    ligature: 'ng',
    aurebesh: String.fromCharCode(0xE014),
    pronunciation: 'nenth',
    description: 'A ligature for the "ng" sound.',
    usage: 'Used for the nasal "ng" sound at the end of words',
    examples: ['running', 'thing', 'long']
  },
  'oo': {
    ligature: 'oo',
    aurebesh: String.fromCharCode(0xE015),
    pronunciation: 'orenth',
    description: 'A vowel ligature for the long "oo" sound.',
    usage: 'Represents the elongated "oo" sound',
    examples: ['moon', 'soon', 'cool']
  }
};

// Star Wars vocabulary with learning information
export const vocabularyData: Record<string, VocabularyInfo> = {
  'jedi': {
    word: 'Jedi',
    pronunciation: 'JEH-die',
    definition: 'A member of an ancient order of warrior-monks who use the Force',
    category: 'Organizations',
    context: 'The Jedi were peacekeepers of the Old Republic',
    examples: ['Luke Skywalker became a Jedi Knight', 'The Jedi Temple on Coruscant']
  },
  'sith': {
    word: 'Sith',
    pronunciation: 'SITH',
    definition: 'An order of Force-sensitive warriors who embrace the dark side',
    category: 'Organizations',
    context: 'The Sith seek power through passion and emotion',
    examples: ['Darth Vader was a Sith Lord', 'The Rule of Two governs the Sith']
  },
  'force': {
    word: 'Force',
    pronunciation: 'FORCE',
    definition: 'An energy field that binds all living things together',
    category: 'Concepts',
    context: 'The Force can be used for knowledge and defense',
    examples: ['May the Force be with you', 'Strong with the Force you are']
  },
  'lightsaber': {
    word: 'Lightsaber',
    pronunciation: 'LITE-say-ber',
    definition: 'An elegant weapon with a blade of pure energy',
    category: 'Weapons',
    context: 'The weapon of a Jedi Knight, civilized and precise',
    examples: ['Obi-Wan ignited his blue lightsaber', 'A Jedi constructs their own lightsaber']
  },
  'empire': {
    word: 'Empire',
    pronunciation: 'EM-pire',
    definition: 'The galactic government ruled by Emperor Palpatine',
    category: 'Government',
    context: 'Rose from the ashes of the Republic after the Clone Wars',
    examples: ['The Empire Strikes Back', 'Imperial stormtroopers patrol the galaxy']
  },
  'rebel': {
    word: 'Rebel',
    pronunciation: 'REH-bel',
    definition: 'A member of the Alliance fighting against the Empire',
    category: 'Organizations',
    context: 'The Rebel Alliance seeks to restore freedom to the galaxy',
    examples: ['Princess Leia leads the Rebel Alliance', 'Rebel pilots destroyed the Death Star']
  },
  'droid': {
    word: 'Droid',
    pronunciation: 'DROID',
    definition: 'An artificial being designed to assist organic life forms',
    category: 'Technology',
    context: 'Droids serve various functions throughout the galaxy',
    examples: ['R2-D2 is an astromech droid', 'Protocol droids specialize in translation']
  },
  'hyperspace': {
    word: 'Hyperspace',
    pronunciation: 'HI-per-space',
    definition: 'An alternate dimension allowing faster-than-light travel',
    category: 'Technology',
    context: 'Ships enter hyperspace to travel between star systems',
    examples: ['The Millennium Falcon jumped to hyperspace', 'Calculating hyperspace coordinates']
  }
};