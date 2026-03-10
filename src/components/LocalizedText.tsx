'use client';

import React from 'react';
import { useLanguage } from '@/components/LanguageProvider';

interface LocalizedTextProps {
  en: string | React.ReactNode;
  th: string | React.ReactNode;
  className?: string;
  component?: React.ElementType;
}

/**
 * Component to render text with appropriate font based on current language
 * Thai text uses Kanit font, English text uses system font
 */
export function LocalizedText({
  en,
  th,
  className = '',
  component: Component = 'span',
}: LocalizedTextProps) {
  const { language } = useLanguage();
  const content = language === 'th' ? th : en;

  return (
    <Component lang={language} className={className}>
      {content}
    </Component>
  );
}
