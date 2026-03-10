/**
 * @deprecated Font selection is now automatic based on lang attribute
 * Fonts are now applied using CSS :lang(th) and :lang(en) selectors
 * No need to add font-th class manually
 */
export function useThaiFont() {
  return '';
}

export function getThaiFont(): string {
  return '';
}
