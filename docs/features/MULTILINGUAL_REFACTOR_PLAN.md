# Multilingual Structure Refactor Plan

## Overview
Complete refactoring of the translation system to support English, Kinyarwanda, and Umwero (Kinyarwanda with Umwero font) with clean, scalable architecture.

## Current Issues
1. Duplicate translation keys in lib/translations.ts
2. Inconsistent key naming
3. Missing translations for some keys
4. Hardcoded text in components
5. No proper type safety for translation keys

## New Architecture

### Directory Structure
```
lib/
├── i18n/
│   ├── index.ts              # Main export
│   ├── types.ts              # TypeScript types
│   ├── translations/
│   │   ├── en.ts             # English translations
│   │   ├── rw.ts             # Kinyarwanda translations
│   │   └── um.ts             # Umwero translations (Kinyarwanda content)
│   └── config.ts             # i18n configuration
hooks/
├── useTranslation.ts         # Translation hook (refactored)
└── useUmweroFont.ts          # Umwero font handling
components/
└── i18n/
    ├── TranslatedText.tsx    # Wrapper component for translations
    └── UmweroText.tsx        # Umwero font wrapper (refactored)
```

### Translation Key Structure

#### Naming Convention
- Use dot notation for nested keys: `section.subsection.key`
- Use camelCase for key names
- Group related translations together

#### Key Categories
1. **nav** - Navigation items
2. **auth** - Authentication (login, signup, logout)
3. **common** - Common UI elements (buttons, labels, messages)
4. **home** - Homepage content
5. **learn** - Learning section
6. **lessons** - Lesson-specific content
7. **dashboard** - Dashboard content
8. **gallery** - Gallery page
9. **cart** - Shopping cart
10. **fund** - Funding/donation page
11. **community** - Community features
12. **admin** - Admin dashboard
13. **teacher** - Teacher dashboard
14. **errors** - Error messages
15. **success** - Success messages
16. **cultural** - Cultural content (proverbs, stories)

### Example Structure
```typescript
export const translations = {
  en: {
    nav: {
      home: "Home",
      learn: "Learn",
      gallery: "Gallery",
      community: "Community",
      dashboard: "Dashboard"
    },
    auth: {
      login: "Log In",
      signup: "Sign Up",
      logout: "Log Out",
      welcomeBack: "Welcome back"
    },
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete"
    }
  }
}
```

## Implementation Steps

### Phase 1: Core Infrastructure (Priority 1)
- [ ] Create new i18n directory structure
- [ ] Define TypeScript types for translations
- [ ] Create translation files (en.ts, rw.ts, um.ts)
- [ ] Refactor useTranslation hook
- [ ] Create TranslatedText component

### Phase 2: Translation Migration (Priority 1)
- [ ] Audit all existing translation keys
- [ ] Remove duplicates
- [ ] Reorganize into new structure
- [ ] Add missing translations
- [ ] Verify all three languages complete

### Phase 3: Component Refactoring (Priority 2)
- [ ] Update all components to use new translation keys
- [ ] Remove hardcoded text
- [ ] Replace direct t() calls with TranslatedText where appropriate
- [ ] Ensure Umwero font rendering works correctly

### Phase 4: Testing & Validation (Priority 2)
- [ ] Test language switching
- [ ] Verify Umwero font ligatures
- [ ] Check all pages for missing translations
- [ ] Validate type safety

### Phase 5: Documentation (Priority 3)
- [ ] Document translation key conventions
- [ ] Create guide for adding new translations
- [ ] Document Umwero font handling

## Translation Keys Inventory

### Navigation (nav.*)
- home, learn, tools, gallery, translate, calendar, community, dashboard, cart, fund

### Authentication (auth.*)
- login, signup, logout, welcomeBack, getStarted, alreadyHaveAccount

### Common UI (common.*)
- loading, save, cancel, confirm, delete, edit, view, manage, create, update
- back, next, previous, submit, search, clear, close

### Home Page (home.*)
- welcome, title, subtitle, features, cta

### Learning (learn.*)
- title, description, startLesson, continueLesson, lessons, progress

### Lessons (lessons.*)
- vowels, consonants, numbers, sentences, pronunciation
- beginner, intermediate, advanced

### Dashboard (dashboard.*)
- myProgress, lessonsCompleted, timeSpent, currentLevel, achievements

### Gallery (gallery.*)
- title, products, resources, addToCart, download

### Cart (cart.*)
- viewCart, empty, checkout, total, remove, clear

### Fund (fund.*)
- supportMission, donate, contribution, mobileMoneyPayment

### Community (community.*)
- discussions, posts, comments, like, share

### Admin (admin.*)
- dashboard, users, lessons, donations, settings

### Teacher (teacher.*)
- dashboard, myLessons, createLesson, students

### Errors (errors.*)
- accessDenied, notFound, serverError, tryAgain

### Success (success.*)
- saved, created, updated, deleted

### Cultural (cultural.*)
- proverbs, stories, significance, heritage

## Umwero Font Handling

### Font Application Strategy
1. **Automatic**: When language is 'um', apply Umwero font globally
2. **Component-level**: Use UmweroText component for specific elements
3. **Preserve ligatures**: Ensure font-feature-settings are correct

### CSS Strategy
```css
.umwero-font {
  font-family: 'UMWEROalpha', serif;
  font-feature-settings: 'liga' 1, 'clig' 1;
  -webkit-font-feature-settings: 'liga' 1, 'clig' 1;
}
```

## Type Safety

### Translation Key Types
```typescript
type TranslationKeys = {
  nav: {
    home: string;
    learn: string;
    // ...
  };
  auth: {
    login: string;
    signup: string;
    // ...
  };
  // ...
};

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<TranslationKeys>;
```

## Migration Checklist

### Files to Update
- [ ] lib/translations.ts → lib/i18n/translations/
- [ ] hooks/useTranslation.ts
- [ ] components/UmweroText.tsx
- [ ] app/page.tsx
- [ ] app/learn/page.tsx
- [ ] app/gallery/page.tsx
- [ ] app/dashboard/page.tsx
- [ ] app/cart/page.tsx
- [ ] app/fund/page.tsx
- [ ] app/community/page.tsx
- [ ] app/admin/page.tsx
- [ ] app/teacher/page.tsx
- [ ] components/site-header.tsx
- [ ] components/site-footer.tsx
- [ ] All lesson components
- [ ] All form components

### Testing Checklist
- [ ] English language displays correctly
- [ ] Kinyarwanda language displays correctly
- [ ] Umwero font renders with ligatures
- [ ] Language switching works smoothly
- [ ] No missing translation keys
- [ ] No console errors
- [ ] All pages tested
- [ ] Mobile responsive
- [ ] Font loading performance

## Performance Considerations

### Code Splitting
- Lazy load translation files
- Only load active language
- Preload next likely language

### Font Loading
- Use font-display: swap
- Preload Umwero font
- Fallback fonts defined

### Caching
- Cache translations in localStorage
- Version translations for cache busting

## Accessibility

### Requirements
- lang attribute on html element
- aria-labels translated
- Screen reader support
- RTL support (if needed)

## Future Enhancements

### Phase 6 (Future)
- [ ] Add French translation
- [ ] Add Swahili translation
- [ ] Translation management UI
- [ ] Crowdsourced translations
- [ ] Translation memory
- [ ] Context-aware translations
- [ ] Pluralization support
- [ ] Date/time localization
- [ ] Number formatting

## Success Criteria

1. ✅ All hardcoded text removed
2. ✅ Three languages fully supported
3. ✅ Umwero font renders correctly with ligatures
4. ✅ Type-safe translation keys
5. ✅ No duplicate keys
6. ✅ Clean, maintainable structure
7. ✅ Fast language switching
8. ✅ No broken pages
9. ✅ Documentation complete
10. ✅ Tests passing

## Timeline

- **Phase 1**: 2 hours
- **Phase 2**: 3 hours
- **Phase 3**: 4 hours
- **Phase 4**: 2 hours
- **Phase 5**: 1 hour

**Total**: ~12 hours

## Notes

- Keep existing routing unchanged
- Maintain all current functionality
- Focus on clean architecture
- Prioritize type safety
- Ensure Umwero cultural authenticity
- Test thoroughly before deployment

---

**Status**: Planning Complete - Ready for Implementation
**Next Step**: Begin Phase 1 - Core Infrastructure
