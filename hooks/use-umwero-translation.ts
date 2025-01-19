export function useUmweroTranslation() {
    const charMap = {
      'a': '"', ':': '=', 'u': ':', 'o': '{',
      'e': '|', 'i': '}', 'A': '"', 'U': ':',
      'O': '{', 'E': '|', 'I': '}'
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
  
    return { translate, charMap, consonantMap }
  }
  
  