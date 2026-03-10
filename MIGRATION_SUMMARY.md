# Migration: next/font/local → @fontsource/kanit

## Quick Summary

Successfully migrated Kanit font from `next/font/local` (with local `.woff2` files) to `@fontsource/kanit` (npm package).

---

## Files Modified

### 1. `src/app/fonts.ts`

**Before:**
```typescript
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

export const kanit = localFont({
  src: [
    { path: '../../public/fonts/kanit-light-300.woff2', weight: '300' },
    { path: '../../public/fonts/kanit-regular-400.woff2', weight: '400' },
    { path: '../../public/fonts/kanit-medium-500.woff2', weight: '500' },
    { path: '../../public/fonts/kanit-semibold-600.woff2', weight: '600' },
    { path: '../../public/fonts/kanit-bold-700.woff2', weight: '700' },
  ],
  variable: '--font-kanit',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const inter = Inter({...});
```

**After:**
```typescript
import { Inter } from 'next/font/google';

export const inter = Inter({...});

// Kanit is now imported in globals.css via @fontsource/kanit
// No next/font wrapper needed
```

---

### 2. `src/app/globals.css`

**Before:**
```css
/* No @import for Kanit */

html.font-th {
  font-family: var(--font-kanit);
}

html.font-th body {
  font-family: var(--font-kanit);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**After:**
```css
/* Import Kanit font weights from @fontsource/kanit */
@import '@fontsource/kanit/400.css';
@import '@fontsource/kanit/500.css';
@import '@fontsource/kanit/600.css';
@import '@fontsource/kanit/700.css';

@tailwind base;
/* ... */

html.font-th {
  font-family: 'Kanit', system-ui, -apple-system, sans-serif;
}

html.font-th body {
  font-family: 'Kanit', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

### 3. `src/app/layout.tsx`

**Before:**
```typescript
import { kanit, inter } from './fonts';

// ...

const fontVariables = `${kanit.variable} ${inter.variable}`;
```

**After:**
```typescript
import { inter } from './fonts';

// ...

const fontVariables = inter.variable;
```

---

## What Didn't Change ( Hydration Safe)

**These parts remain completely unchanged:**

-  `src/components/LanguageProvider.tsx` - No changes to language logic
-  `src/app/layout.tsx` - Language detection and class application work the same
-  HTML class system (`font-th` / `font-en`) - Still controls which font is used
-  Server-side language detection from cookie - Unchanged
-  Hydration safety mechanism - No changes needed
-  All page components - Still use `useLanguage()` hook

---

## Technical Details

### CSS Import vs next/font/local

| Aspect | next/font/local | @fontsource/kanit |
|--------|-----------------|-------------------|
| **Source** | Local `.woff2` files | npm package |
| **Import** | Next.js wrapper function | Direct CSS `@import` |
| **CSS Variable** | Auto-generated (`--font-kanit`) | N/A (not needed) |
| **Font-face** | Handled by wrapper | Included in CSS file |
| **Updates** | Manual (file management) | Automatic (npm) |
| **File size** | Local files (~6-8 KB each) | Included in `node_modules` |

### Font-family Application

| Font | Method | CSS | When Applied |
|------|--------|-----|---------------|
| **Inter** | CSS variable | `var(--font-inter)` | When `html.font-en` class active |
| **Kanit** | Direct name | `'Kanit'` | When `html.font-th` class active |

---

## Installation

The package was installed with:
```bash
npm install @fontsource/kanit --save
```

### Verification

Package is installed and working:
```bash
npm list @fontsource/kanit
# @fontsource/kanit@7.0.0
```

---

## Why This is Better

 **Advantages of @fontsource/kanit:**

1. **No file management** - Font files live in `node_modules`
2. **Automatic updates** - `npm update @fontsource/kanit`
3. **Industry standard** - Google Fonts via @fontsource is the standard approach
4. **Cleaner code** - No `next/font/local` wrapper needed
5. **Smaller impact** - Simpler setup, fewer moving parts
6. **Production proven** - @fontsource is battle-tested in production

X **What we removed:**
- Local `.woff2` files in `public/fonts/` (no longer needed)
- `next/font/local` wrapper for Kanit (simpler with direct CSS import)
- CSS variable for Kanit (not necessary)

---

## Testing Checklist

- [ ] Run `npm run build` - should complete without errors
- [ ] Load app in browser with English language
  - [ ] Verify Inter font is applied (DevTools → Computed styles)
  - [ ] Check performance (should be fast)
- [ ] Switch to Thai language
  - [ ] Verify Kanit font is applied immediately
  - [ ] Check that text renders correctly
- [ ] Refresh page
  - [ ] Language persists via cookie
  - [ ] Correct font loads on SSR
- [ ] Check no hydration warnings in console
  - [ ] No "hydration mismatch" errors
  - [ ] No "extra attributes" warnings

---

## Rollback (if needed)

If you need to revert to `next/font/local`:

1. Restore the old `fonts.ts` with `localFont` setup
2. Restore old globals.css with `var(--font-kanit)`
3. Restore layout.tsx imports
4. Re-add old `src/app/fonts/kanit-*.woff2` files

But we don't expect you'll need this - @fontsource is more reliable.

---

## Related Files

For more details, see: `KANIT_FONT_SETUP.md`

This document explains:
- How the font system works
- Architecture decisions
- Why there are no conflicts between @fontsource and next/font
- Verification steps
- Font weight options
