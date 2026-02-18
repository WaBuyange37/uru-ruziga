// lib/audio-utils.ts
// Audio utilities for Umwero character pronunciation
// Based on complete official Umwero character mapping reference including Ibihekane

export interface CharacterAudioMapping {
  character: string;
  audioPath: string;
  type: 'vowel' | 'consonant' | 'ibihekane';
  umweroName: string;
  asciiMapping: string;
}

// 🔒 CRITICAL CULTURAL DATA - DO NOT MODIFY 🔒
// Complete Umwero character mapping (Latin → Umwero ASCII)
// Based on the official comprehensive mapping including all ligatures and compounds
// This data represents authentic Rwandan cultural heritage
// ANY MODIFICATIONS WILL BREAK THE TRANSLATION SYSTEM
// See: UMWERO_LIGATURE_SYSTEM_CRITICAL.md for details
export const UMWERO_MAP: { [key: string]: string } = {
  // Vowels (both cases)
  'A': '"', 'a': '"',
  'E': '|', 'e': '|',
  'I': '}', 'i': '}',
  'O': '{', 'o': '{',
  'U': ':', 'u': ':',

  // Ligatures (Ibihekane) - vowel combinations
  'AA': String.fromCodePoint(0xE000), 'aa': String.fromCodePoint(0xE000),
  'EE': String.fromCodePoint(0xE001), 'ee': String.fromCodePoint(0xE001),
  'II': String.fromCodePoint(0xE002), 'ii': String.fromCodePoint(0xE002),
  'OO': String.fromCodePoint(0xE003), 'oo': String.fromCodePoint(0xE003),
  'UU': String.fromCodePoint(0xE004), 'uu': String.fromCodePoint(0xE004),

  // 5-letter compounds
  'NSHYW': 'QQKW', 'nshyw': 'QQKW',

  // 4-letter compounds
  'NSHW': 'HHHKW', 'nshw': 'HHHKW',
  'NSHY': 'QQ', 'nshy': 'QQ',
  'MYYEW': 'MYYEW', 'myyew': 'MYYEW',

  // 3-letter compounds
  'NCW': 'CCKW', 'ncw': 'CCKW',
  'NKW': 'EW', 'nkw': 'EW',
  'MFW': 'FFK', 'mfw': 'FFK',
  'MFY': 'FFKK', 'mfy': 'FFKK',
  'NSH': 'HHH', 'nsh': 'HHH',
  'PFW': 'IK', 'pfw': 'IK',
  'PFY': 'IKK', 'pfy': 'IKK',
  'SHW': 'HHKW', 'shw': 'HHKW',
  'SHY': 'Q', 'shy': 'Q',
  'NDW': 'NDGW', 'ndw': 'NDGW',
  'NDY': 'NDL', 'ndy': 'NDL',
  'NGW': 'NGW', 'ngw': 'NGW',
  'NTW': 'NNEW', 'ntw': 'NNEW',
  'NNY': 'NNYY', 'nny': 'NNYY',
  'NYY': 'NYY', 'nyy': 'NYY',
  'NZW': 'NZGW', 'nzw': 'NZGW',
  'MVW': 'OG', 'mvw': 'OG',
  'MVY': 'OL', 'mvy': 'OL',
  'MPY': 'PPKK', 'mpy': 'PPKK',
  'MBW': 'BBG', 'mbw': 'BBG',
  'TSW': 'XKW', 'tsw': 'XKW',
  'NJW': 'UGW', 'njw': 'UGW',
  'NJY': 'LL', 'njy': 'LL',
  'NCY': 'CC', 'ncy': 'CC',
  'ZGW': 'ZGW', 'zgw': 'ZGW',
  'MYW': 'MYYEW', 'myw': 'MYYEW',
  'NYW': 'YYEW', 'nyw': 'YYEW',
  'NKY': 'KKK', 'nky': 'KKK',
  'NSW': 'SSKW', 'nsw': 'SSKW',
  'NSY': 'SSKK', 'nsy': 'SSKK',

  // 2-letter compounds
  'NC': 'CC', 'nc': 'CC',
  'NK': 'E', 'nk': 'E',
  'MF': 'FF', 'mf': 'FF',
  'SH': 'HH', 'sh': 'HH',
  'PF': 'I', 'pf': 'I',
  'MB': 'A', 'mb': 'A',
  'ND': 'ND', 'nd': 'ND',
  'NG': 'NG', 'ng': 'NG',
  'NT': 'NN', 'nt': 'NN',
  'NZ': 'NZ', 'nz': 'NZ',
  'MV': 'O', 'mv': 'O',
  'MP': 'MM', 'mp': 'MM',
  'NS': 'SS', 'ns': 'SS',
  'NJ': 'U', 'nj': 'U',
  'NY': 'YY', 'ny': 'YY',
  'TS': 'X', 'ts': 'X',
  'CY': 'KK', 'cy': 'KK',
  'BY': 'BBL', 'by': 'BBL',
  'BW': 'BBG', 'bw': 'BBG',
  'RY': 'DL', 'ry': 'DL',
  'DW': 'DGW', 'dw': 'DGW',
  'GW': 'GW', 'gw': 'GW',
  'JW': 'JGW', 'jw': 'JGW',
  'KY': 'KK', 'ky': 'KK',
  'KW': 'KW', 'kw': 'KW',
  'JY': 'L', 'jy': 'L',
  'MW': 'ME', 'mw': 'ME',
  'MY': 'MYY', 'my': 'MYY',
  'NW': 'NEW', 'nw': 'NEW',
  'RW': 'RGW', 'rw': 'RGW',
  'SY': 'SKK', 'sy': 'SKK',
  'SW': 'SKW', 'sw': 'SKW',
  'TW': 'TKW', 'tw': 'TKW',
  'TY': 'TKK', 'ty': 'TKK',
  'VW': 'VG', 'vw': 'VG',
  'VY': 'VL', 'vy': 'VL',
  'ZW': 'ZGW', 'zw': 'ZGW',
  'CW': 'CKW', 'cw': 'CKW',
  'FW': 'FK', 'fw': 'FK',
  'FY': 'FKK', 'fy': 'FKK',
  'PW': 'PK', 'pw': 'PK',
  'PY': 'PKK', 'py': 'PKK',

  // Single consonants
  'B': 'B', 'b': 'B',
  'C': 'C', 'c': 'C',
  'D': 'D', 'd': 'D',
  'F': 'F', 'f': 'F',
  'G': 'G', 'g': 'G',
  'H': 'H', 'h': 'H',
  'J': 'J', 'j': 'J',
  'K': 'K', 'k': 'K',
  'L': 'R', 'l': 'R', // Note: L maps to R in Umwero
  'M': 'M', 'm': 'M',
  'N': 'N', 'n': 'N',
  'P': 'P', 'p': 'P',
  'R': 'R', 'r': 'R',
  'S': 'S', 's': 'S',
  'T': 'T', 't': 'T',
  'V': 'V', 'v': 'V',
  'W': 'W', 'w': 'W',
  'Y': 'Y', 'y': 'Y',
  'Z': 'Z', 'z': 'Z',

  // Space and punctuation
  ' ': ' ',
  '.': '.',
  ',': ',',
  '!': '!',
  '?': '?',
  ':': ':',
  ';': ';',
  '-': '-',
  "'": "'",
  '"': '"',
  '(': '(',
  ')': ')',
};

// Legacy mappings for backward compatibility
export const LATIN_TO_UMWERO_ASCII: Record<string, string> = {
  'a': '"', 'e': '|', 'i': '}', 'o': '{', 'u': ':',
  'b': 'B', 'c': 'C', 'd': 'D', 'f': 'F', 'g': 'G', 'h': 'H',
  'j': 'J', 'k': 'K', 'l': 'R', 'm': 'M', 'n': 'N', 'p': 'P',
  'r': 'R', 's': 'S', 't': 'T', 'v': 'V', 'w': 'W', 'y': 'Y', 'z': 'Z',
};

export const UMWERO_ASCII_TO_LATIN: Record<string, string> = {
  '"': 'a', '|': 'e', '}': 'i', '{': 'o', ':': 'u',
  'B': 'b', 'C': 'c', 'D': 'd', 'F': 'f', 'G': 'g', 'H': 'h',
  'J': 'j', 'K': 'k', 'R': 'l', 'M': 'm', 'N': 'n', 'P': 'p',
  'S': 's', 'T': 't', 'V': 'v', 'W': 'w', 'Y': 'y', 'Z': 'z',
};

// Character to audio file mapping based on the Voice folder structure and official names
export const AUDIO_MAPPINGS: Record<string, CharacterAudioMapping> = {
  // Vowels - Based on official mapping
  'a': { character: 'a', audioPath: '/UmweroLetaByLeta/Voice/Vowel/a.mp3', type: 'vowel', umweroName: 'A', asciiMapping: '"' },
  'e': { character: 'e', audioPath: '/UmweroLetaByLeta/Voice/Vowel/E.mp3', type: 'vowel', umweroName: 'E', asciiMapping: '|' },
  'i': { character: 'i', audioPath: '/UmweroLetaByLeta/Voice/Vowel/I.mp3', type: 'vowel', umweroName: 'I', asciiMapping: '}' },
  'o': { character: 'o', audioPath: '/UmweroLetaByLeta/Voice/Vowel/O.mp3', type: 'vowel', umweroName: 'O', asciiMapping: '{' },
  'u': { character: 'u', audioPath: '/UmweroLetaByLeta/Voice/Vowel/U.mp3', type: 'vowel', umweroName: 'U', asciiMapping: ':' },

  // Consonants - Based on official mapping
  'b': { character: 'b', audioPath: '/UmweroLetaByLeta/Voice/consonants/B.mp3', type: 'consonant', umweroName: 'Ba', asciiMapping: 'B' },
  'c': { character: 'c', audioPath: '/UmweroLetaByLeta/Voice/consonants/C.mp3', type: 'consonant', umweroName: 'Ca', asciiMapping: 'C' },
  'cy': { character: 'cy', audioPath: '/UmweroLetaByLeta/Voice/consonants/CY.mp3', type: 'consonant', umweroName: 'Cya', asciiMapping: 'CY' },
  'd': { character: 'd', audioPath: '/UmweroLetaByLeta/Voice/consonants/D.mp3', type: 'consonant', umweroName: 'Da', asciiMapping: 'D' },
  'dj': { character: 'dj', audioPath: '/UmweroLetaByLeta/Voice/consonants/DJ.mp3', type: 'consonant', umweroName: 'Dja', asciiMapping: 'DJ' },
  'dz': { character: 'dz', audioPath: '/UmweroLetaByLeta/Voice/consonants/DZ.mp3', type: 'consonant', umweroName: 'Dza', asciiMapping: 'DZ' },
  'f': { character: 'f', audioPath: '/UmweroLetaByLeta/Voice/consonants/F.mp3', type: 'consonant', umweroName: 'Fa', asciiMapping: 'F' },
  'g': { character: 'g', audioPath: '/UmweroLetaByLeta/Voice/consonants/G.mp3', type: 'consonant', umweroName: 'Ga', asciiMapping: 'G' },
  'h': { character: 'h', audioPath: '/UmweroLetaByLeta/Voice/consonants/H.mp3', type: 'consonant', umweroName: 'Ha', asciiMapping: 'H' },
  'j': { character: 'j', audioPath: '/UmweroLetaByLeta/Voice/consonants/J.mp3', type: 'consonant', umweroName: 'Ja', asciiMapping: 'J' },
  'jy': { character: 'jy', audioPath: '/UmweroLetaByLeta/Voice/consonants/JY.mp3', type: 'consonant', umweroName: 'Jya', asciiMapping: 'JY' },
  'k': { character: 'k', audioPath: '/UmweroLetaByLeta/Voice/consonants/K.mp3', type: 'consonant', umweroName: 'Ka', asciiMapping: 'K' },
  'l': { character: 'l', audioPath: '/UmweroLetaByLeta/Voice/consonants/L.mp3', type: 'consonant', umweroName: 'La', asciiMapping: 'L' },
  'm': { character: 'm', audioPath: '/UmweroLetaByLeta/Voice/consonants/M.mp3', type: 'consonant', umweroName: 'Ma', asciiMapping: 'M' },
  'mb': { character: 'mb', audioPath: '/UmweroLetaByLeta/Voice/consonants/MB.mp3', type: 'consonant', umweroName: 'Mba', asciiMapping: 'MB' },
  'mf': { character: 'mf', audioPath: '/UmweroLetaByLeta/Voice/consonants/MF.mp3', type: 'consonant', umweroName: 'Mfa', asciiMapping: 'MF' },
  'mv': { character: 'mv', audioPath: '/UmweroLetaByLeta/Voice/consonants/MV.mp3', type: 'consonant', umweroName: 'Mva', asciiMapping: 'MV' },
  'n': { character: 'n', audioPath: '/UmweroLetaByLeta/Voice/consonants/N.mp3', type: 'consonant', umweroName: 'Na', asciiMapping: 'N' },
  'nc': { character: 'nc', audioPath: '/UmweroLetaByLeta/Voice/consonants/NC.mp3', type: 'consonant', umweroName: 'Nca', asciiMapping: 'NC' },
  'ncy': { character: 'ncy', audioPath: '/UmweroLetaByLeta/Voice/consonants/NCY.mp3', type: 'consonant', umweroName: 'Ncya', asciiMapping: 'NCY' },
  'nj': { character: 'nj', audioPath: '/UmweroLetaByLeta/Voice/consonants/NJ.mp3', type: 'consonant', umweroName: 'Nja', asciiMapping: 'NJ' },
  'njy': { character: 'njy', audioPath: '/UmweroLetaByLeta/Voice/consonants/NJY.mp3', type: 'consonant', umweroName: 'Njya', asciiMapping: 'NJY' },
  'nk': { character: 'nk', audioPath: '/UmweroLetaByLeta/Voice/consonants/NK.mp3', type: 'consonant', umweroName: 'Nka', asciiMapping: 'NK' },
  'nn': { character: 'nn', audioPath: '/UmweroLetaByLeta/Voice/consonants/NN.mp3', type: 'consonant', umweroName: 'Nha', asciiMapping: 'NN' },
  'ns': { character: 'ns', audioPath: '/UmweroLetaByLeta/Voice/consonants/NS.mp3', type: 'consonant', umweroName: 'Nsa', asciiMapping: 'NS' },
  'nshy': { character: 'nshy', audioPath: '/UmweroLetaByLeta/Voice/consonants/NSHY.mp3', type: 'consonant', umweroName: 'Nshya', asciiMapping: 'NSHY' },
  'ny': { character: 'ny', audioPath: '/UmweroLetaByLeta/Voice/consonants/NY.mp3', type: 'consonant', umweroName: 'Nya', asciiMapping: 'NY' },
  'p': { character: 'p', audioPath: '/UmweroLetaByLeta/Voice/consonants/P.mp3', type: 'consonant', umweroName: 'Pa', asciiMapping: 'P' },
  'pf': { character: 'pf', audioPath: '/UmweroLetaByLeta/Voice/consonants/PF.mp3', type: 'consonant', umweroName: 'Pfa', asciiMapping: 'PF' },
  'r': { character: 'r', audioPath: '/UmweroLetaByLeta/Voice/consonants/R.mp3', type: 'consonant', umweroName: 'Ra', asciiMapping: 'R' },
  's': { character: 's', audioPath: '/UmweroLetaByLeta/Voice/consonants/S.mp3', type: 'consonant', umweroName: 'Sa', asciiMapping: 'S' },
  'sh': { character: 'sh', audioPath: '/UmweroLetaByLeta/Voice/consonants/SH.mp3', type: 'consonant', umweroName: 'Sha', asciiMapping: 'SH' },
  'shy': { character: 'shy', audioPath: '/UmweroLetaByLeta/Voice/consonants/SHY.mp3', type: 'consonant', umweroName: 'Shya', asciiMapping: 'SHY' },
  't': { character: 't', audioPath: '/UmweroLetaByLeta/Voice/consonants/T.mp3', type: 'consonant', umweroName: 'Ta', asciiMapping: 'T' },
  'ts': { character: 'ts', audioPath: '/UmweroLetaByLeta/Voice/consonants/TS.mp3', type: 'consonant', umweroName: 'Tsa', asciiMapping: 'TS' },
  'v': { character: 'v', audioPath: '/UmweroLetaByLeta/Voice/consonants/V.mp3', type: 'consonant', umweroName: 'Va', asciiMapping: 'V' },
  'w': { character: 'w', audioPath: '/UmweroLetaByLeta/Voice/consonants/W.mp3', type: 'consonant', umweroName: 'Wa', asciiMapping: 'W' },
  'y': { character: 'y', audioPath: '/UmweroLetaByLeta/Voice/consonants/Y.mp3', type: 'consonant', umweroName: 'Ya', asciiMapping: 'Y' },
  'z': { character: 'z', audioPath: '/UmweroLetaByLeta/Voice/consonants/Z.mp3', type: 'consonant', umweroName: 'Za', asciiMapping: 'Z' },

  // Ibihekane (ligatures) - Based on folder structure and official names
  'bg': { character: 'bg', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/Bg/', type: 'ibihekane', umweroName: 'Bga', asciiMapping: 'BG' },
  'bjy': { character: 'bjy', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/BJY/', type: 'ibihekane', umweroName: 'Bjya', asciiMapping: 'BJY' },
  'bygw': { character: 'bygw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/Bygw/', type: 'ibihekane', umweroName: 'Bygwa', asciiMapping: 'BYGW' },
  'ckw': { character: 'ckw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/CKW/', type: 'ibihekane', umweroName: 'Ckwa', asciiMapping: 'CKW' },
  'kw': { character: 'kw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/Kw/', type: 'ibihekane', umweroName: 'Kwa', asciiMapping: 'KW' },
  'mbg': { character: 'mbg', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/Mbg/', type: 'ibihekane', umweroName: 'Mbga', asciiMapping: 'MBG' },
  'mbjy': { character: 'mbjy', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/mbjy/', type: 'ibihekane', umweroName: 'Mbjya', asciiMapping: 'MBJY' },
  'mbygw': { character: 'mbygw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/Mbygw/', type: 'ibihekane', umweroName: 'Mbygwa', asciiMapping: 'MBYGW' },
  'nny': { character: 'nny', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/N\'Ny/', type: 'ibihekane', umweroName: 'N-Nya', asciiMapping: 'NNY' },
  'nckw': { character: 'nckw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/NCKW/', type: 'ibihekane', umweroName: 'Nckwa', asciiMapping: 'NCKW' },
  'nkw': { character: 'nkw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/NKW/', type: 'ibihekane', umweroName: 'Nkwa', asciiMapping: 'NKW' },
  'nscy': { character: 'nscy', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/NSCY/', type: 'ibihekane', umweroName: 'Nscya', asciiMapping: 'NSCY' },
  'nshyw': { character: 'nshyw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/Nshyw/', type: 'ibihekane', umweroName: 'Nshywa', asciiMapping: 'NSHYW' },
  'nskw': { character: 'nskw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/NSKW/', type: 'ibihekane', umweroName: 'Nskwa', asciiMapping: 'NSKW' },
  'ntkw': { character: 'ntkw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/NTkw-rwanda/', type: 'ibihekane', umweroName: 'Ntkwa', asciiMapping: 'NTKW' },
  'ntny': { character: 'ntny', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/NTNY/', type: 'ibihekane', umweroName: 'Ntnya', asciiMapping: 'NTNY' },
  'shkw': { character: 'shkw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/ShKW/', type: 'ibihekane', umweroName: 'Shkwa', asciiMapping: 'SHKW' },
  'shykw': { character: 'shykw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/Shykw/', type: 'ibihekane', umweroName: 'Shykwa', asciiMapping: 'SHYKW' },
  'skw': { character: 'skw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/SKW/', type: 'ibihekane', umweroName: 'Skwa', asciiMapping: 'SKW' },
  'sky': { character: 'sky', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/SKY/', type: 'ibihekane', umweroName: 'Skya', asciiMapping: 'SKY' },
  'tkw': { character: 'tkw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/TKW/', type: 'ibihekane', umweroName: 'Tkwa', asciiMapping: 'TKW' },
  'tky': { character: 'tky', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/TKY/', type: 'ibihekane', umweroName: 'Tkya', asciiMapping: 'TKY' },
  'tskw': { character: 'tskw', audioPath: '/UmweroLetaByLeta/Voice/Ibihekane/TSKW/', type: 'ibihekane', umweroName: 'Tskwa', asciiMapping: 'TSKW' },
};

// Get audio path for a character
export function getAudioPath(character: string): string | null {
  // First try direct mapping
  const mapping = AUDIO_MAPPINGS[character.toLowerCase()];
  if (mapping) {
    return mapping.audioPath;
  }

  // Try ASCII to character conversion
  const asciiChar = UMWERO_ASCII_TO_LATIN[character];
  if (asciiChar) {
    const asciiMapping = AUDIO_MAPPINGS[asciiChar.toLowerCase()];
    if (asciiMapping) {
      return asciiMapping.audioPath;
    }
  }

  return null;
}

// Get character type (vowel, consonant, ibihekane)
export function getCharacterType(character: string): 'vowel' | 'consonant' | 'ibihekane' | 'unknown' {
  const mapping = AUDIO_MAPPINGS[character.toLowerCase()];
  if (mapping) {
    return mapping.type;
  }

  const asciiChar = UMWERO_ASCII_TO_LATIN[character];
  if (asciiChar) {
    const asciiMapping = AUDIO_MAPPINGS[asciiChar.toLowerCase()];
    if (asciiMapping) {
      return asciiMapping.type;
    }
  }

  return 'unknown';
}

// Check if audio exists for character
export function hasAudio(character: string): boolean {
  return getAudioPath(character) !== null;
}

// Get keyboard mapping for character (ASCII representation)
export function getKeyboardMapping(character: string): string {
  // If it's already ASCII, return as is
  if (AUDIO_MAPPINGS[character.toLowerCase()]) {
    return character.toLowerCase();
  }
  
  // If it's Umwero ASCII character, convert to latin
  const asciiChar = UMWERO_ASCII_TO_LATIN[character];
  if (asciiChar) {
    return asciiChar.toLowerCase();
  }
  
  return character.toLowerCase();
}

// Get Umwero character name
export function getUmweroName(character: string): string {
  const mapping = AUDIO_MAPPINGS[character.toLowerCase()];
  if (mapping) {
    return mapping.umweroName;
  }

  const asciiChar = UMWERO_ASCII_TO_LATIN[character];
  if (asciiChar) {
    const asciiMapping = AUDIO_MAPPINGS[asciiChar.toLowerCase()];
    if (asciiMapping) {
      return asciiMapping.umweroName;
    }
  }

  return character.toUpperCase();
}

// Get ASCII mapping for character (the Umwero ASCII representation)
export function getUmweroAscii(character: string): string {
  // First try the comprehensive mapping
  const umweroChar = UMWERO_MAP[character] || UMWERO_MAP[character.toLowerCase()] || UMWERO_MAP[character.toUpperCase()]
  if (umweroChar) {
    return umweroChar
  }

  // Fallback to legacy mapping
  const mapping = AUDIO_MAPPINGS[character.toLowerCase()]
  if (mapping) {
    return mapping.asciiMapping
  }

  // Direct ASCII character lookup (legacy)
  const umweroAscii = LATIN_TO_UMWERO_ASCII[character.toLowerCase()]
  if (umweroAscii) {
    return umweroAscii
  }

  return character.toUpperCase()
}

// 🔒 CRITICAL SYSTEM - DO NOT MODIFY 🔒
// This ligature conversion algorithm is PRODUCTION-LOCKED
// Last verified working: February 2026
// ANY CHANGES WILL BREAK THE ENTIRE UMWERO TRANSLATION SYSTEM
// See: UMWERO_LIGATURE_SYSTEM_CRITICAL.md for details

// Convert latin text to Umwero characters using the complete mapping
export function convertToUmwero(text: string): string {
  // Convert to uppercase first for consistent mapping
  const upperText = text.toUpperCase()
  let result = ''
  const words = upperText.split(' ')
  
  for (let word of words) {
    let i = 0
    while (i < word.length) {
      let found = false
      
      // 🚨 CRITICAL: Check for 5-letter compounds first (longest first)
      // BOUNDARY CONDITION: i + 5 <= word.length (NOT i + 4 < word.length)
      if (i + 5 <= word.length) {
        const fiveLetters = word.slice(i, i + 5)
        if (UMWERO_MAP[fiveLetters]) {
          result += UMWERO_MAP[fiveLetters]
          i += 5
          found = true
        }
      }
      
      // 🚨 CRITICAL: Check for 4-letter compounds
      // BOUNDARY CONDITION: i + 4 <= word.length (NOT i + 3 < word.length)
      if (!found && i + 4 <= word.length) {
        const fourLetters = word.slice(i, i + 4)
        if (UMWERO_MAP[fourLetters]) {
          result += UMWERO_MAP[fourLetters]
          i += 4
          found = true
        }
      }
      
      // 🚨 CRITICAL: Check for 3-letter compounds
      // BOUNDARY CONDITION: i + 3 <= word.length (NOT i + 2 < word.length)
      if (!found && i + 3 <= word.length) {
        const threeLetters = word.slice(i, i + 3)
        if (UMWERO_MAP[threeLetters]) {
          result += UMWERO_MAP[threeLetters]
          i += 3
          found = true
        }
      }
      
      // 🚨 CRITICAL: Check for 2-letter compounds
      // BOUNDARY CONDITION: i + 2 <= word.length (NOT i + 1 < word.length)
      if (!found && i + 2 <= word.length) {
        const twoLetters = word.slice(i, i + 2)
        if (UMWERO_MAP[twoLetters]) {
          result += UMWERO_MAP[twoLetters]
          i += 2
          found = true
        }
      }
      
      // Check for single character
      if (!found) {
        const letter = word[i]
        if (UMWERO_MAP[letter]) {
          result += UMWERO_MAP[letter]
        } else {
          result += letter // Keep non-mapped characters as is
        }
        i++
      }
    }
    result += ' ' // Add space between words
  }
  
  return result.trim()
}

// 🔒 END CRITICAL SYSTEM 🔒

// Convert latin text to Umwero ASCII representation (legacy function)
export function latinToUmweroAscii(text: string): string {
  return convertToUmwero(text)
}

// Convert Umwero ASCII to latin text (simplified reverse conversion)
export function umweroAsciiToLatin(text: string): string {
  return text.split('').map(char => {
    const latinChar = UMWERO_ASCII_TO_LATIN[char]
    return latinChar || char
  }).join('')
}