// hooks/useTranslation.ts
import { useLanguage } from '../app/contexts/LanguageContext'
import { translations, TranslationKey } from '../lib/translations'

// Umwero character mapping (Latin → Umwero)
const UMWERO_MAP: { [key: string]: string } = {
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
  'L': 'R', 'l': 'R',
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

  // numbers-ones
  1: String.fromCodePoint(0x0031),
  2: String.fromCodePoint(0x0032),
  3: String.fromCodePoint(0x0033), 
  4: String.fromCodePoint(0x0034), 
  5: String.fromCodePoint(0x0035), 
  6: String.fromCodePoint(0x0036),
  7: String.fromCodePoint(0x0037),
  8: String.fromCodePoint(0x0038),
  9: String.fromCodePoint(0x0039),
  
  // tens
  10: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031),
  11: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0031),
  12: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0032),
  13: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0033),
  14: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0034),
  15: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0035),
  16: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0036),
  17: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0037),
  18: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0038),
  19: String.fromCodePoint(0xF300)+ String.fromCodePoint(0x0031) + String.fromCodePoint(0x0039),
  // 
  20: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032),
  21: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0031),
  22: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0032),
  23: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0033),
  24: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0034),
  25: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0035),
  26: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0036),
  27: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0037),
  28: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0038),
  29: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0032) + String.fromCodePoint(0x0039),

  30: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033),
  31: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0031),
  32: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0032),
  33: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0033),
  34: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0034),
  35: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0035),
  36: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0036),
  37: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0037),
  38: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0038),
  39: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0033) + String.fromCodePoint(0x0039),

  40: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034),
  41: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0031),
  42: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0032),
  43: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0033),
  44: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0034),
  45: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0035),
  46: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0036),
  47: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0037),
  48: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0038),
  49: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0034) + String.fromCodePoint(0x0039),

  50: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035),
  51: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0031),
  52: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0032),
  53: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0033),
  54: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0034),
  55: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0035),
  56: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0036),
  57: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0037),
  58: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0038),
  59: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0035) + String.fromCodePoint(0x0039),

  60: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036),
  61: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0031),
  62: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0032),
  63: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0033),
  64: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0034),
  65: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0035),
  66: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0036),
  67: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0037),
  68: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0038),
  69: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0036) + String.fromCodePoint(0x0039),

  70: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037),
  71: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0031),
  72: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0032),
  73: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0033),
  74: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0034),
  75: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0035),
  76: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0036),
  77: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0037),
  78: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0038),
  79: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0037) + String.fromCodePoint(0x0039),

  80: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038),
  81: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0031),
  82: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0032),
  83: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0033),
  84: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0034),
  85: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0035),
  86: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0036),
  87: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0037),
  88: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0038),
  89: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0038) + String.fromCodePoint(0x0039),

  90: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039),
  91: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0031),
  92: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0032),
  93: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0033),
  94: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0034),
  95: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0035),
  96: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0036),
  97: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0037),
  98: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0038),
  99: String.fromCodePoint(0xF300) + String.fromCodePoint(0x0039) + String.fromCodePoint(0x0039),

  // hundreds
  100: String.fromCodePoint(0xF301)+ String.fromCodePoint(0x0031),
  // Umweero numerals from 100 to hundred Decillions need to be looped for better  and shortter code
  //I will do it in next update, even these are more much lines

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
}

export function convertToUmwero(text: string): string {
  // Convert to uppercase first for consistent mapping
  const upperText = text.toUpperCase()
  let result = ''
  const words = upperText.split(' ')

  for (let word of words) {
    let i = 0
    while (i < word.length) {
      let found = false
      
      // Check for 5-letter compounds first (longest first)
      if (i + 4 < word.length) {
        const fiveLetters = word.slice(i, i + 5)
        if (UMWERO_MAP[fiveLetters]) {
          result += UMWERO_MAP[fiveLetters]
          i += 5
          found = true
        }
      }
      
      // Check for 4-letter compounds
      if (!found && i + 3 < word.length) {
        const fourLetters = word.slice(i, i + 4)
        if (UMWERO_MAP[fourLetters]) {
          result += UMWERO_MAP[fourLetters]
          i += 4
          found = true
        }
      }
      
      // Check for 3-letter compounds
      if (!found && i + 2 < word.length) {
        const threeLetters = word.slice(i, i + 3)
        if (UMWERO_MAP[threeLetters]) {
          result += UMWERO_MAP[threeLetters]
          i += 3
          found = true
        }
      }
      
      // Check for 2-letter compounds
      if (!found && i + 1 < word.length) {
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

export function useTranslation() {
  const { language } = useLanguage()
  
  const t = (key: TranslationKey): string => {
    const translation = translations[language][key] || translations.en[key] || key
    
    // If language is Umwero ('um'), convert to Umwero characters
    if (language === 'um') {
      return convertToUmwero(translation)
    }
    
    return translation
  }
  
  return { t, language }
}