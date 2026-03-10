# Font Guidelines - Kanit Font for Thai Language

## Overview
- **Thai Text**: Uses Kanit font (Google Fonts) - **AUTOMATIC**
- **English Text**: Uses System font (default)
- Language is managed through `LanguageProvider` context

## How It Works

When the user selects Thai language (`lang-th` class is added to `<html>`):
- **ALL elements automatically use Kanit font** via CSS rules: `html.lang-th *`
- Exception: Elements with `font-en` class use system font (for hardcoded English text)
- No need to add `font-th` class to every element!

## Usage Guidelines

### For i18n Content (Translated Text) [FEATURE] **AUTOMATIC**

Simply write your code normally - no need to add any special class!

```tsx
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

export function MyComponent() {
  const { language } = useLanguage();

  return (
    <>
      {/* Paragraph - automatically uses Kanit when Thai */}
      <p className="text-lg">
        {t(language, 'my.translation.key')}
      </p>

      {/* Button - automatically uses Kanit when Thai */}
      <button className="btn-primary">
        {t(language, 'common.submit')}
      </button>

      {/* Heading - automatically uses Kanit when Thai */}
      <h1 className="text-2xl font-bold">
        {t(language, 'page.title')}
      </h1>
    </>
  );
}
```

### For Hardcoded English Text 

Use `font-en` class to explicitly use system font (important when you have English text that should always show in system font):

```tsx
<h1 className="font-en">
  Excise OpenAPI
</h1>
```

### For Form Inputs

Form inputs already have `font-family: inherit` set, so they automatically use Kanit when Thai:

```tsx
<input
  className="input-field"
  placeholder={t(language, 'form.placeholder')}
  value={input}
  onChange={handleChange}
/>
```

## CSS Classes

### `.font-en` (Use this one!)
- Forces system font (overrides with !important)
- Use ONLY on hardcoded English text that should always display in system font
- Example: "Excise OpenAPI", "Sign In", "Profile"

### `.font-th` (Deprecated - not needed anymore!)
- ~~Applies Kanit font~~ **No longer needed**
- All elements automatically use Kanit when Thai language is active
- Only use if you have very specific styling needs

## Components

### LocalizedText Component
Optional utility component for simple text with both EN and TH:

```tsx
<LocalizedText
  en="English Text"
  th="ข้อความไทย"
  className="text-lg"
  component="p"
/>
```

## CSS Rules Added

```css
/* Thai text uses Kanit font */
.font-th {
  font-family: var(--font-kanit), ...;
}

/* Buttons inherit font from parent */
.btn-primary, .btn-secondary, .btn-danger {
  font-family: inherit;
}

/* Ensure button inherits Kanit when parent has font-th */
.font-th button {
  font-family: var(--font-kanit), ...;
}

/* Input fields inherit font */
.input-field {
  font-family: inherit;
}
```

## Checklist for New Pages

- [x] [FEATURE] **Kanit font automatically applied to all elements when Thai!**
- [ ] Add `font-en` class to any hardcoded English text (if needed)
- [ ] Test in both English and Thai languages

## Common Examples

### Paragraphs
```tsx
{/* Automatically uses Kanit when Thai */}
<p className="text-lg">
  {t(language, 'key')}
</p>
```

### Headings
```tsx
{/* Automatically uses Kanit when Thai */}
<h1 className="text-2xl font-bold">
  {t(language, 'key')}
</h1>
```

### Buttons
```tsx
{/* Automatically uses Kanit when Thai */}
<button className="btn-primary">
  {t(language, 'key')}
</button>
```

### Hardcoded English in Button
```tsx
{/* Keep "Sign In" in system font */}
<button className="btn-primary">
  <span className="font-en">Sign In</span>
  {t(language, 'button.signIn')} {/* Thai text auto-switches to Kanit */}
</button>
```

### Links
```tsx
{/* Automatically uses Kanit when Thai */}
<a href="/profile">
  {t(language, 'nav.profile')}
</a>
```
