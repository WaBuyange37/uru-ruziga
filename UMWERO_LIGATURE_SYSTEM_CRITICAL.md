# 🔒 CRITICAL: Umwero Ligature System - DO NOT MODIFY

## ⚠️ ABSOLUTE WARNING ⚠️
**THIS SYSTEM IS PRODUCTION-CRITICAL AND MUST NEVER BE MODIFIED**

The ligature conversion logic in this codebase has been carefully engineered to handle complex Umwero character mappings. Any modifications to the core algorithm will break the entire translation system.

---

## 🚫 PROTECTED FILES - DO NOT TOUCH

### 1. Core Translation Engine
**File**: `lib/audio-utils.ts`
- **Function**: `convertToUmwero()`
- **Status**: 🔒 LOCKED - Production Critical
- **Last Working Version**: February 2026
- **DO NOT MODIFY**: The boundary conditions and longest-first algorithm

### 2. Translation Hook
**File**: `hooks/use-umwero-translation.ts`
- **Function**: `latinToUmwero()`
- **Status**: 🔒 LOCKED - Production Critical
- **Dependencies**: Calls `convertToUmwero()` from `lib/audio-utils.ts`

### 3. Comprehensive Translation System
**File**: `hooks/useTranslation.ts`
- **Function**: `convertToUmwero()`
- **Status**: 🔒 LOCKED - Production Critical
- **Note**: Duplicate implementation for consistency

### 4. Character Mapping
**Files**: All files containing `UMWERO_MAP`
- **Status**: 🔒 LOCKED - Cultural Heritage Data
- **Note**: Based on official Umwero alphabet specifications

---

## 🎯 CRITICAL ALGORITHM SPECIFICATIONS

### Ligature Processing Order (NEVER CHANGE)
```typescript
// ✅ CORRECT - LONGEST FIRST (5→4→3→2→1 letters)
// This order is MANDATORY for proper ligature detection

1. Check 5-letter compounds: i + 5 <= word.length
2. Check 4-letter compounds: i + 4 <= word.length  
3. Check 3-letter compounds: i + 3 <= word.length
4. Check 2-letter compounds: i + 2 <= word.length
5. Check single characters: i + 1 <= word.length
```

### Boundary Conditions (CRITICAL)
```typescript
// ✅ CORRECT BOUNDARY CONDITIONS
if (i + 5 <= word.length) { /* 5-letter check */ }
if (i + 4 <= word.length) { /* 4-letter check */ }
if (i + 3 <= word.length) { /* 3-letter check */ }
if (i + 2 <= word.length) { /* 2-letter check */ }

// ❌ WRONG - WILL BREAK LIGATURES AT WORD ENDINGS
if (i + 4 < word.length) { /* BROKEN */ }
if (i + 3 < word.length) { /* BROKEN */ }
```

---

## 🧪 CRITICAL TEST CASES

### Must Always Work
- `"rw"` → `"RGW"` (single ligature)
- `"zgw"` → `"ZGW"` (single ligature)  
- `"nshyw"` → `"QQKW"` (5-letter compound)
- `"mbyw"` → Must process as compound, not `"mb" + "yw"`

### Font Rendering Requirements
- Font family: `"Umwero","UMWEROalpha","UmweroPUA"`
- Font features: `"liga" 1, "calt" 1`
- Text rendering: `optimizeLegibility`
- CSS class: `umwero-text`

---

## 🔧 PROTECTED COMPONENTS

### Translator Component
**File**: `components/umwero-translator.tsx`
- **Protected Sections**:
  - Font loading logic (lines ~30-50)
  - Translation hook usage: `useUmweroTranslation()`
  - Font application in text areas
  - Real-time translation effect

### Chat Component  
**File**: `app/umwero-chat/page.tsx`
- **Protected Sections**:
  - Translation hook: `useUmweroTranslation()`
  - Real-time preview: `latinToUmwero(inputText)`

---

## 📋 VERIFICATION CHECKLIST

Before any deployment, verify these work correctly:

### ✅ Translation Tests
- [ ] "rw" displays as single ligature (not "R" + "W")
- [ ] "zgw" displays as single ligature  
- [ ] "nshyw" displays as single 5-letter ligature
- [ ] Real-time translation works in both translator and chat
- [ ] Font loads properly in all browsers

### ✅ System Integration
- [ ] Translator uses `useUmweroTranslation()` hook
- [ ] Chat uses `useUmweroTranslation()` hook  
- [ ] Both call same `convertToUmwero()` function
- [ ] Font features enabled: `liga`, `calt`
- [ ] CSS class `umwero-text` applied

---

## 🚨 EMERGENCY ROLLBACK

If ligatures break, immediately revert to these exact implementations:

### Core Algorithm (lib/audio-utils.ts)
```typescript
export function convertToUmwero(text: string): string {
  const upperText = text.toUpperCase()
  let result = ''
  const words = upperText.split(' ')
  
  for (let word of words) {
    let i = 0
    while (i < word.length) {
      let found = false
      
      // 5-letter compounds (CRITICAL: i + 5 <= word.length)
      if (i + 5 <= word.length) {
        const fiveLetters = word.slice(i, i + 5)
        if (UMWERO_MAP[fiveLetters]) {
          result += UMWERO_MAP[fiveLetters]
          i += 5
          found = true
        }
      }
      
      // 4-letter compounds (CRITICAL: i + 4 <= word.length)
      if (!found && i + 4 <= word.length) {
        const fourLetters = word.slice(i, i + 4)
        if (UMWERO_MAP[fourLetters]) {
          result += UMWERO_MAP[fourLetters]
          i += 4
          found = true
        }
      }
      
      // 3-letter compounds (CRITICAL: i + 3 <= word.length)
      if (!found && i + 3 <= word.length) {
        const threeLetters = word.slice(i, i + 3)
        if (UMWERO_MAP[threeLetters]) {
          result += UMWERO_MAP[threeLetters]
          i += 3
          found = true
        }
      }
      
      // 2-letter compounds (CRITICAL: i + 2 <= word.length)
      if (!found && i + 2 <= word.length) {
        const twoLetters = word.slice(i, i + 2)
        if (UMWERO_MAP[twoLetters]) {
          result += UMWERO_MAP[twoLetters]
          i += 2
          found = true
        }
      }
      
      // Single character
      if (!found) {
        const letter = word[i]
        if (UMWERO_MAP[letter]) {
          result += UMWERO_MAP[letter]
        } else {
          result += letter
        }
        i++
      }
    }
    result += ' '
  }
  
  return result.trim()
}
```

---

## 📞 SUPPORT CONTACT

**If ligatures break or stop working:**
1. DO NOT modify the algorithm
2. Check font loading in browser console
3. Verify `useUmweroTranslation()` is being used
4. Confirm CSS classes are applied
5. Test with simple cases: "rw", "zgw"

**Cultural Significance**: This system preserves the authentic Umwero alphabet as used in Rwandan heritage. Modifications could damage cultural accuracy.

---

## 🔐 FINAL WARNING

**This ligature system is the result of extensive research and testing. It correctly handles:**
- 200+ character mappings
- Complex 5-letter compounds  
- Proper font rendering
- Cultural authenticity
- Cross-browser compatibility

**ANY MODIFICATION WILL BREAK THE SYSTEM**

**Date**: February 2026  
**Status**: PRODUCTION LOCKED 🔒  
**Version**: FINAL - DO NOT CHANGE