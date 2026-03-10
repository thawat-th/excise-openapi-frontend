import { Inter, Kanit } from 'next/font/google';

/**
 * English font: Inter (Google Fonts)
 * Used as primary font when locale is 'en'
 * Provides CSS variable: --font-inter
 */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

/**
 * Thai font: Kanit (Google Fonts via next/font)
 * Used as primary font when locale is 'th'
 * Provides CSS variable: --font-kanit
 */
export const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});
