export function useUmweroTranslation() {
  const charMap = {
    'a': '"', ':': '=', 'u': ':', 'o': '{',
    'e': '|', 'i': '}', 'A': '"', 'U': ':',
    'O': '{', 'E': '|', 'I': '}'
  }

  const vowelMap = {
    'A': '"',
    'E': '|',
    'I': '}',
    'O': '{',
    'U': ':'
  }

  const consonantMap = {
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
    'RW': 'RGW',
    'S': 'S',
    'SY': 'SKK',
    'SW': 'SKW',
    'NS': 'SS',
    'NSY': 'SSKK',
    'NSW': 'SSKW',
    'TW': 'TKW',
    'TY': 'TKK',
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
    'ZW': 'ZGW',
  };

  const translate = (text: string) => {
    let modified = text
      .split('')
      .map(char => charMap[char.toLowerCase() as keyof typeof charMap] || char)
      .join('')
      .toUpperCase()

    let result = modified
    for (let [key, value] of Object.entries(consonantMap)) {
      result = result.replace(new RegExp(key, 'g'), value)
    }

    return result
  }

  const latinToUmwero = (text: string): string => {
    let result = '';
    const words = text.toUpperCase().split(' ');

    for (let word of words) {
      let i = 0;
      while (i < word.length) {
        let found = false;
        // Check for three-letter consonants
        if (i + 2 < word.length) {
          const threeLetters = word.slice(i, i + 3);
          if (consonantMap[threeLetters]) {
            result += consonantMap[threeLetters];
            i += 3;
            found = true;
          }
        }
        // Check for two-letter consonants
        if (!found && i + 1 < word.length) {
          const twoLetters = word.slice(i, i + 2);
          if (consonantMap[twoLetters]) {
            result += consonantMap[twoLetters];
            i += 2;
            found = true;
          }
        }
        // Check for single consonants and vowels
        if (!found) {
          const letter = word[i];
          if (consonantMap[letter]) {
            result += consonantMap[letter];
          } else if (vowelMap[letter]) {
            result += vowelMap[letter];
          } else {
            result += letter; // Keep non-mapped characters as is
          }
          i++;
        }
      }
      result += ' '; // Add space between words
    }

    return result.trim();
  }

  const umweroToLatin = (text: string): string => {
    let result = '';
    const words = text.toUpperCase().split(' ');

    for (let word of words) {
      let i = 0;
      while (i < word.length) {
        let found = false;
        // Check for multi-letter Umwero characters
        for (let j = 4; j > 0; j--) {
          const subStr = word.slice(i, i + j);
          const latinChar = Object.keys(consonantMap).find(key => consonantMap[key] === subStr);
          if (latinChar) {
            result += latinChar.toLowerCase();
            i += j;
            found = true;
            break;
          }
        }
        // Check for vowels
        if (!found) {
          const latinVowel = Object.keys(vowelMap).find(key => vowelMap[key] === word[i]);
          if (latinVowel) {
            result += latinVowel.toLowerCase();
            i++;
          } else {
            result += word[i].toLowerCase(); // Keep non-mapped characters as is
            i++;
          }
        }
      }
      result += ' '; // Add space between words
    }

    return result.trim();
  }

  return { translate, latinToUmwero, umweroToLatin, charMap, consonantMap }
}

