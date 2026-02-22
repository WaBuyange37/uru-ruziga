# 🔒 UMWERO LIGATURE SYSTEM - DEVELOPER NOTICE

## ⚠️ CRITICAL WARNING FOR DEVELOPERS ⚠️

**THIS CODEBASE CONTAINS A PRODUCTION-CRITICAL LIGATURE CONVERSION SYSTEM**

If you are working on this project, **PLEASE READ THIS CAREFULLY** before making any changes.

---

## 🚫 DO NOT TOUCH THESE FILES

### Core Translation Engine
- `lib/audio-utils.ts` - Contains `convertToUmwero()` function
- `hooks/use-umwero-translation.ts` - Translation hook used by components
- `hooks/useTranslation.ts` - Comprehensive translation system

### UI Components  
- `components/umwero-translator.tsx` - Main translator component
- `app/umwero-chat/page.tsx` - Chat component with ligatures

### Character Data
- Any file containing `UMWERO_MAP` - Official character mappings

---

## 🎯 WHAT IS A LIGATURE?

In the Umwero alphabet, certain letter combinations form **single characters**:
- `"rw"` becomes one character (like æ in English)
- `"zgw"` becomes one character  
- `"nshyw"` becomes one character

This is **culturally significant** and **technically complex**.

---

## 🧪 HOW TO TEST IF YOU BROKE IT

1. Open the translator at `/translate`
2. Type `"rw"` in the Latin text box
3. **CORRECT**: You should see ONE ligature character in Umwero box
4. **BROKEN**: You see separate R + W characters

If it's broken, you modified something you shouldn't have.

---

## 🔧 SAFE AREAS TO MODIFY

You can safely work on:
- UI styling (colors, layouts, spacing)
- New features unrelated to translation
- Database operations
- Authentication
- File uploads
- Other components not listed above

---

## 🚨 IF YOU ACCIDENTALLY BROKE IT

1. **DO NOT** try to fix the algorithm yourself
2. **DO NOT** modify the `convertToUmwero()` function
3. **REVERT** your changes immediately
4. Check `UMWERO_LIGATURE_SYSTEM_CRITICAL.md` for rollback instructions

---

## 📞 EMERGENCY CONTACTS

If ligatures are broken in production:
1. Revert to last known working commit
2. Check browser console for font loading errors
3. Verify `useUmweroTranslation()` hook is being used
4. Run verification script: `node verify-ligature-system.js`

---

## 🎓 TECHNICAL DETAILS (FOR ADVANCED DEVELOPERS)

The ligature system works by:
1. **Longest-first matching**: Checks 5-letter, then 4-letter, then 3-letter, etc.
2. **Correct boundary conditions**: Uses `i + N <= word.length` (NOT `i + N-1 < word.length`)
3. **Font features**: Enables `"liga"` and `"calt"` for proper rendering
4. **Real-time conversion**: Translates as user types

**The algorithm is mathematically precise and culturally authentic.**

---

## 🌍 CULTURAL SIGNIFICANCE

This system preserves the authentic Umwero alphabet used in Rwandan heritage. The ligatures are not arbitrary - they represent actual character combinations used in the traditional writing system.

**Modifying this system could damage cultural accuracy.**

---

## ✅ VERIFICATION CHECKLIST

Before any deployment:
- [ ] `"rw"` displays as single ligature
- [ ] `"zgw"` displays as single ligature  
- [ ] Real-time translation works
- [ ] Fonts load without errors
- [ ] No console errors related to translation

---

**Remember: When in doubt, DON'T TOUCH IT.**

**This system took extensive research and testing to get right.**

**Date**: February 2026  
**Status**: PRODUCTION LOCKED 🔒