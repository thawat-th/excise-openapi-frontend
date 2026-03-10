'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Theme } from '@/lib/theme';
import { TIMEZONE_OPTIONS, getTimezone, setTimezone } from '@/lib/timezone';
import { SkeletonPreferencesSettings } from '@/components/ui/Skeleton';

export default function PreferencesSettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Bangkok');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tz = getTimezone();
    setSelectedTimezone(tz);
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleTimezoneChange = (tz: string) => {
    setSelectedTimezone(tz);
    setTimezone(tz);
  };

  if (loading) {
    return <SkeletonPreferencesSettings />;
  }

  const languageOptions = [
    { value: 'en' as const, label: 'English' },
    { value: 'th' as const, label: 'ไทย' },
  ];

  return (
    <div className="space-y-6 max-w-md">
      {/* Color mode */}
      <section>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {language === 'th' ? 'โหมดสี' : 'Color mode'}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {/* Light */}
          <ThemeOption
            selected={theme === 'light'}
            onClick={() => setTheme('light')}
            label="Light"
          >
            <LightPreview />
          </ThemeOption>

          {/* System - half and half */}
          <ThemeOption
            selected={theme === 'system'}
            onClick={() => setTheme('system')}
            label={language === 'th' ? 'ระบบ' : 'System'}
          >
            <SystemPreview />
          </ThemeOption>

          {/* Dark */}
          <ThemeOption
            selected={theme === 'dark'}
            onClick={() => setTheme('dark')}
            label="Dark"
          >
            <DarkPreview />
          </ThemeOption>
        </div>
      </section>

      {/* Language */}
      <section>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {language === 'th' ? 'ภาษา' : 'Language'}
        </h3>
        <div className="flex gap-2">
          {languageOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setLanguage(option.value)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                language === option.value
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* Timezone */}
      <section>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {language === 'th' ? 'เขตเวลา' : 'Timezone'}
        </h3>
        <div className="relative">
          <select
            value={selectedTimezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer pr-8"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400 tabular-nums">
          <CurrentTime timezone={selectedTimezone} language={language} />
        </p>
      </section>
    </div>
  );
}

// Light theme preview with dialog
function LightPreview() {
  return (
    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center p-1.5">
      {/* Dialog */}
      <div className="w-full h-full bg-white rounded-sm shadow-sm border border-gray-300 p-1.5 flex flex-col">
        <span className="text-[6px] font-semibold text-gray-700 leading-none">Settings</span>
        <div className="mt-1 space-y-0.5 flex-1">
          <div className="h-[3px] w-full bg-gray-200 rounded-full" />
          <div className="h-[3px] w-4/5 bg-gray-200 rounded-full" />
          <div className="h-[3px] w-3/5 bg-gray-200 rounded-full" />
        </div>
        <div className="mt-auto pt-1 flex justify-end">
          <div className="h-[5px] w-6 bg-gray-300 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

// Dark theme preview with dialog
function DarkPreview() {
  return (
    <div className="w-full h-full bg-slate-950 rounded flex items-center justify-center p-1.5">
      {/* Dialog */}
      <div className="w-full h-full bg-slate-800 rounded-sm shadow-sm border border-slate-700 p-1.5 flex flex-col">
        <span className="text-[6px] font-semibold text-slate-300 leading-none">Settings</span>
        <div className="mt-1 space-y-0.5 flex-1">
          <div className="h-[3px] w-full bg-slate-700 rounded-full" />
          <div className="h-[3px] w-4/5 bg-slate-700 rounded-full" />
          <div className="h-[3px] w-3/5 bg-slate-700 rounded-full" />
        </div>
        <div className="mt-auto pt-1 flex justify-end">
          <div className="h-[5px] w-6 bg-slate-600 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

// System theme preview - half light, half dark
function SystemPreview() {
  return (
    <div className="w-full h-full rounded overflow-hidden flex">
      {/* Light half */}
      <div className="w-1/2 bg-gray-200 flex items-center justify-center p-1 pr-0">
        <div className="w-full h-full bg-white rounded-l-sm shadow-sm border-y border-l border-gray-300 p-1 flex flex-col">
          <span className="text-[5px] font-semibold text-gray-700 leading-none">Settings</span>
          <div className="mt-0.5 space-y-[2px] flex-1">
            <div className="h-[2px] w-full bg-gray-200 rounded-full" />
            <div className="h-[2px] w-4/5 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
      {/* Dark half */}
      <div className="w-1/2 bg-slate-950 flex items-center justify-center p-1 pl-0">
        <div className="w-full h-full bg-slate-800 rounded-r-sm shadow-sm border-y border-r border-slate-700 p-1 flex flex-col">
          <span className="text-[5px] font-semibold text-slate-300 leading-none">Settings</span>
          <div className="mt-0.5 space-y-[2px] flex-1">
            <div className="h-[2px] w-full bg-slate-700 rounded-full" />
            <div className="h-[2px] w-4/5 bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Theme option with visual preview
function ThemeOption({
  selected,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 p-1 rounded-lg transition-all ${
        selected
          ? 'ring-2 ring-primary-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
          : 'hover:bg-gray-50 dark:hover:bg-slate-800'
      }`}
    >
      {/* Preview box */}
      <div className="w-full aspect-[4/3] rounded overflow-hidden border border-gray-200 dark:border-slate-600">
        {children}
      </div>
      {/* Label */}
      <span className={`text-xs ${
        selected
          ? 'font-medium text-gray-900 dark:text-white'
          : 'text-gray-500 dark:text-slate-400'
      }`}>
        {label}
      </span>
      {/* Check mark */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// Real-time clock component
function CurrentTime({ timezone, language }: { timezone: string; language: 'en' | 'th' }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString(language === 'th' ? 'th-TH' : 'en-US', {
        timeZone: timezone,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone, language]);

  return <>{time}</>;
}
