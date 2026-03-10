import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get initials from first name and last name
 * e.g., "Thawat Thammawong" → "TT"
 * e.g., "John" → "J"
 * e.g., "" → "?"
 */
export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.trim().charAt(0).toUpperCase() || '';
  const last = lastName?.trim().charAt(0).toUpperCase() || '';

  if (first && last) return `${first}${last}`;
  if (first) return first;
  if (last) return last;
  return '?';
}
