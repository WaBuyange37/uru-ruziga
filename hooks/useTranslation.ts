// hooks/useTranslation.ts
import { useLanguage } from '../app/contexts/LanguageContext'
import { translations, TranslationKey } from '../lib/translations'

// Umwero character mapping (Latin → Umwero)
const UMWERO_MAP: { [key: string]: string } = {
  // Vowels
  'a': '"', 'A': '"',
  'e': '|', 'E': '|',
  'i': '}', 'I': '}',
  'o': '{', 'O': '{',
  'u': ':', 'U': ':',
  
  // Ligatures (Ibihekane) - must be checked before individual characters
  'aa': String.fromCodePoint(0xE000), 'AA': String.fromCodePoint(0xE000),
  'ee': String.fromCodePoint(0xE001), 'EE': String.fromCodePoint(0xE001),
  'ii': String.fromCodePoint(0xE002), 'II': String.fromCodePoint(0xE002),
  'oo': String.fromCodePoint(0xE003), 'OO': String.fromCodePoint(0xE003),
  'uu': String.fromCodePoint(0xE004), 'UU': String.fromCodePoint(0xE004),
  
  // Consonants
  'NC': 'CC',
  'NCW': 'CCKW',
  'CW': 'CKW',
  'D': 'D',
  'DW': 'DGW',
  'RY': 'DL',
  'NK': 'E',
  'NKW': 'EW',
  'F': 'F',
  'MF': 'FF',
  'MFW': 'FFK',
  'MFY': 'FFKK',
  'FW': 'FK',
  'FY': 'FKK',
  'G': 'G',
  'GW': 'GW',
  'H': 'H',
  'SH': 'HH',
  'NSH': 'HHH',
  'NSHW': 'HHHKW',
  'SHW': 'HHKW',
  'PF': 'I',
  'PFW': 'IK',
  'PFY': 'IKK',
  'J': 'J',
  'JW': 'JGW',
  'K': 'K',
  'KY': 'KK',
  'NKY': 'KKK',
  'KW': 'KW',
  'JY': 'L',
  'NJY': 'LL',
  'M': 'M',
  'MW': 'ME',
  'MY': 'MYY',
  'MYW': 'MYYEW',
  'N': 'N',
  'ND': 'ND',
  'NDW': 'NDGW',
  'NDY': 'NDL',
  'NW': 'NEW',
  'NG': 'NG',
  'NGW': 'NGW',
  'NT': 'NN',
  'NTW': 'NNEW',
  'NNY': 'NNYY',
  'NYY': 'NYY',
  'NZ': 'NZ',
  'NZW': 'NZGW',
  'MV': 'O',
  'MVW': 'OG',
  'MVY': 'OL',
  'MPY': 'PPKK',
  'P': 'P',
  'PW': 'PK',
  'PY': 'PKK',
  'MP': 'MM',
  'SHY': 'Q',
  'SHYW': 'QKW',
  'NSHY': 'QQ',
  'NSHYW': 'QQKW',
  'R': 'R',
  'L': 'R',
  'CY':'KK',
  'BY':'BBL',
  'BW': 'BBG',
  'MB': 'A',
  'MBW': 'BBG',
  'RW': 'RGW',
  'S': 'S',
  'SY': 'SKK',
  'SW': 'SKW',
  'NS': 'SS',
  'NSY': 'SSKK',
  'NSW': 'SSKW',
  'TW': 'TKW',
  'TY': 'TKK ',
  'NJ': 'U',
  'NJW': 'UGW',
  'V': 'V',
  'VW': 'VG',
  'VY': 'VL',
  'W': 'W',
  'TS': 'X',
  'TSW': 'XKW',
  'Y': 'Y',
  'NY': 'YY',
  'NYW': 'YYEW',
  'Z': 'Z',
  'ZW': 'ZGW`',

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

  // Compound consonants (must be checked before single chars)
  'mb': 'A', 'Mb': 'A',
  'nc': 'CC', 'Nc': 'CC',
  'nd': 'NT', 'Nd': 'NT',
  'nk': 'E', 'Nk': 'E',
  'sh': 'HH', 'Sh': 'HH',
  'pf': 'I', 'Pf': 'I',
  
  // Keep spaces and punctuation
}

// Ibihekane (Ligatures/Compound consonants) - must be checked first (order matters!)
const IBIHEKANE = [
  // 4-letter compounds
  'NSHYW', 'nshyw', 'NSHW', 'nshw', 'NSHY', 'nshy',
  // 3-letter compounds  
  'NCW', 'ncw', 'NKW', 'nkw', 'MFW', 'mfw', 'MFY', 'mfy', 
  'NSH', 'nsh', 'PFW', 'pfw', 'PFY', 'pfy', 'SHW', 'shw',
  'SHY', 'shy', 'NDW', 'ndw', 'NDY', 'ndy', 'NGW', 'ngw',
  'NTW', 'ntw', 'NNY', 'nny', 'NYY', 'nyy', 'NZW', 'nzw',
  'MVW', 'mvw', 'MVY', 'mvy', 'MPY', 'mpy', 'MBW', 'mbw',
  'TSW', 'tsw', 'NJW', 'njw', 'NJY', 'njy', 'NCY', 'ncy',
  'ZGW', 'zgw', 'MYW', 'myw', 'NYW', 'nyw',
  // 2-letter compounds
  'NC', 'nc', 'NK', 'nk', 'MF', 'mf', 'SH', 'sh', 'PF', 'pf',
  'MB', 'mb', 'ND', 'nd', 'NG', 'ng', 'NT', 'nt', 'NZ', 'nz',
  'MV', 'mv', 'MP', 'mp', 'NS', 'ns', 'NJ', 'nj', 'NY', 'ny',
  'TS', 'ts', 'CY', 'cy', 'BY', 'by', 'BW', 'bw', 'RY', 'ry',
  'DW', 'dw', 'GW', 'gw', 'JW', 'jw', 'KY', 'ky', 'KW', 'kw',
  'JY', 'jy', 'MW', 'mw', 'MY', 'my', 'NW', 'nw', 'RW', 'rw',
  'SY', 'sy', 'SW', 'sw', 'TW', 'tw', 'TY', 'ty', 'VW', 'vw',
  'VY', 'vy', 'ZW', 'zw'
]

export function convertToUmwero(text: string): string {
  let result = ''
  let i = 0
  
  while (i < text.length) {
    let matched = false
    
    // Check for Ibihekane (ligatures/compound consonants) first - longest to shortest
    for (const compound of IBIHEKANE) {
      if (text.substring(i, i + compound.length).toLowerCase() === compound.toLowerCase()) {
        const mappedValue = UMWERO_MAP[compound.toLowerCase()]
        if (mappedValue) {
          result += mappedValue
          i += compound.length
          matched = true
          break
        }
      }
    }
    
    // If no compound matched, check single character
    if (!matched) {
      const char = text[i]
      result += UMWERO_MAP[char] || char
      i++
    }
  }
  
  return result
}

export function useTranslation() {
  const { language } = useLanguage()
  
  const t = (key: TranslationKey): string => {
    const translation = translations[language][key] || translations.en[key] || key
    
    // If language is Umwero ('um'), convert to uppercase first, then to Umwero characters
    if (language === 'um') {
      return convertToUmwero(translation.toUpperCase())
    }
    
    return translation
  }
  
  return { t, language }
}