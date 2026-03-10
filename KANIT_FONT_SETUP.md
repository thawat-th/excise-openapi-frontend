# Kanit Font Setup with @fontsource/kanit

## Overview

This document describes how Thai font (Kanit) is set up in this Next.js project using `@fontsource/kanit` instead of local `.woff2` files or `next/font/local`.

## Architecture

### Font Strategy

| Language | Font | Method | CSS |
|----------|------|--------|-----|
| **English** | Inter | `next/font/google` with CSS variable | `html.font-en { font-family: var(--font-inter); }` |
| **Thai** | Kanit | `@fontsource/kanit` with direct font-family | `html.font-th { font-family: 'Kanit'; }` |

### Why This Approach?

1. **@fontsource/kanit benefits:**
   - Maintained font package (automatic updates)
   - No manual font file management
   - Includes all variants (Thai, Latin, Latin Extended, Vietnamese)
   - Font display strategy built-in (`font-display: swap`)
   - Includes both WOFF2 and WOFF formats for browser compatibility

2. **No next/font wrapper for Kanit:**
   - `@fontsource` packages are already optimized for web
   - Direct `@import` is cleaner than `next/font/local`
   - CSS variable approach is inconsistent with font-family approach

3. **Language-based class selector:**
   - Server-side: `initialLanguage` is computed from cookie
   - Applied as `<html className="font-th" or "font-en">`
   - No client-side switching during hydration
   - Hydration-safe: no reading of DOM during render

---

## File Changes

### 1. `src/app/fonts.ts`

**Before:** Had `next/font/local` setup for Kanit with 5 weights

**After:**
```typescript
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

/**
 * Kanit is imported in globals.css via @fontsource/kanit
 * No next/font wrapper needed
 */
```

**What changed:**
- X Removed: `next/font/local` wrapper for Kanit
-  Kept: `next/font/google` for Inter
-  Added: Comments explaining @fontsource/kanit setup

---

### 2. `src/app/globals.css`

**Before:**
```css
html.font-th {
  font-family: var(--font-kanit);
}
```

**After:**
```css
/* Import Kanit font weights from @fontsource/kanit */
@import '@fontsource/kanit/400.css';
@import '@fontsource/kanit/500.css';
@import '@fontsource/kanit/600.css';
@import '@fontsource/kanit/700.css';

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

**What changed:**
-  Added: `@import` statements for specific Kanit weights
-  Changed: `var(--font-kanit)` → `'Kanit'` (direct font-family)
-  Kept: Language-based class selector pattern

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
const fontVariables = inter.variable; // Only Inter needs variable
```

**What changed:**
- X Removed: `kanit` import (no longer exported from fonts.ts)
-  Simplified: Only `inter.variable` is used for CSS variable

---

## How It Works

### At Build Time

1. **Next.js processes imports:**
   - `next/font/google` (Inter) → Creates CSS variable `--font-inter`
   - CSS `@import '@fontsource/kanit/...'` → Static CSS files loaded

2. **CSS bundling:**
   - `globals.css` is bundled with all imports
   - @fontsource CSS files are included in CSS bundle
   - Font files are referenced as relative paths in `node_modules`

### At Runtime (SSR)

1. **Server renders HTML:**
   ```html
   <html lang="en" class="__font_inter_... font-en">
     <!-- content -->
   </html>
   ```

2. **CSS cascade applies:**
   ```css
   html.font-en { font-family: var(--font-inter); }
   /* Matches! Inter font applied */
   ```

### At Runtime (Language Change)

1. **User clicks Thai button**
2. **LanguageProvider updates:**
   ```typescript
   html.classList.remove('font-en');
   html.classList.add('font-th');
   document.documentElement.lang = 'th';
   ```

3. **CSS cascade applies:**
   ```css
   html.font-th { font-family: 'Kanit'; }
   /* Matches! Kanit font applied */
   ```

---

## No Conflicts Between next/font and @fontsource

### Why they don't conflict:

1. **Separate application methods:**
   - `next/font`: Uses CSS variables (`--font-inter`)
   - `@fontsource`: Uses direct `font-family` names (`'Kanit'`)

2. **Different CSS selectors:**
   - `html.font-en { font-family: var(--font-inter); }` (CSS variable)
   - `html.font-th { font-family: 'Kanit'; }` (Direct name)

3. **Language-based isolation:**
   - Only one class is active at a time (`font-en` XOR `font-th`)
   - No ambiguity about which font to use

4. **Font display strategy:**
   - Both use `font-display: swap` (built into @fontsource)
   - No visual glitches or layout shifts

---

## Verification

### Check 1: Package installed
```bash
npm list @fontsource/kanit
# Should show: @fontsource/kanit@<version>
```

### Check 2: CSS imports work
```bash
grep -n "@fontsource/kanit" src/app/globals.css
# Should show 4 imports for weights 400, 500, 600, 700
```

### Check 3: Font-family in CSS
```bash
grep -n "font-family.*Kanit" src/app/globals.css
# Should show 'Kanit' (not var(--font-kanit))
```

### Check 4: Build succeeds
```bash
npm run build
# Should complete without font-related errors
```

### Check 5: Runtime test
1. Open app in browser
2. Set language to Thai (html class becomes `font-th`)
3. Verify Kanit font is applied (check DevTools → Computed styles)
4. Switch to English (html class becomes `font-en`)
5. Verify Inter font is applied

---

## Font Weights Included

The following Kanit weights are imported and available:

- **400** (Regular) - Default weight
- **500** (Medium) - Used for semi-bold text
- **600** (Semi-Bold) - Used for bold text
- **700** (Bold) - Used for strong emphasis

**Note:** If you need weight 300 (Light), add this to globals.css:
```css
@import '@fontsource/kanit/300.css';
```

---

## CSS Variable for Inter vs Direct Name for Kanit

### Why the difference?

| Font | Method | Reason |
|------|--------|--------|
| **Inter** | CSS variable `--font-inter` | `next/font` always generates variables; follows convention |
| **Kanit** | Direct name `'Kanit'` | `@fontsource` registers font-face as `'Kanit'` directly |

### Both approaches are valid

You could use CSS variables for Kanit too:
```css
:root {
  --font-kanit: 'Kanit', system-ui, sans-serif;
}

html.font-th {
  font-family: var(--font-kanit);
}
```

But it's unnecessary since `@fontsource` already provides the font-face declaration.

---

## Migration from next/font/local

### Before (next/font/local):
1. Maintain local `.woff2` files in `public/fonts/`
2. Import with `next/font/local` wrapper
3. Use CSS variable from wrapper
4. Manual font file management

### After (@fontsource/kanit):
1.  No local files to maintain
2.  Simple npm package
3.  Direct CSS import
4.  Automatic updates via npm

---

## Language Switching (Unchanged)

The language switching mechanism remains **completely unchanged**:

```typescript
// LanguageProvider.tsx
const setLanguage = (lang: Language) => {
  setLanguageState(lang);
  applyLanguageToDOM(lang); // This updates html.font-th / html.font-en
};

function applyLanguageToDOM(lang: Language) {
  html.classList.remove('font-en', 'font-th');
  html.classList.add(lang === 'th' ? 'font-th' : 'font-en');
  // CSS now applies the correct font automatically
}
```

**No changes to:**
-  SSR language detection
-  Cookie-based persistence
-  Hydration safety
-  Multi-tab sync
-  Client-side language toggle

---

## Summary

 **What changed:**
- `@fontsource/kanit` replaces `next/font/local` for Kanit
- CSS imports `@fontsource/kanit` weights directly
- Font-family uses `'Kanit'` instead of CSS variable

 **What stayed the same:**
- Language class-based switching (`font-th` / `font-en`)
- Server-side language detection
- Hydration-safe architecture
- Font rendering and visual appearance

 **Benefits:**
- No manual font file management
- Automatic updates via npm
- Cleaner, simpler setup
- Production-ready
