'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCookieConsent, CookiePreferences } from './useCookieConsent';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { Settings as SettingsIcon } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const CONSENT_VERSION = '1.0';

export function CookieSettingsModal() {
  const { showSettings, closeSettings, preferences, updatePreferences } = useCookieConsent();
  const { language } = useLanguage();

  const [localPrefs, setLocalPrefs] = useState<CookiePreferences>({
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    essential: true,
    functional: preferences?.functional ?? true,
    analytics: preferences?.analytics ?? false,
  });

  // Update local preferences when modal opens
  useEffect(() => {
    if (showSettings && preferences) {
      setLocalPrefs(preferences);
    }
  }, [showSettings, preferences]);

  const handleSave = useCallback(() => {
    updatePreferences({
      ...localPrefs,
      timestamp: Date.now(),
    });
  }, [localPrefs, updatePreferences]);

  const handleCancel = useCallback(() => {
    // Reset to current preferences
    if (preferences) {
      setLocalPrefs(preferences);
    }
    closeSettings();
  }, [preferences, closeSettings]);

  return (
    <Sheet open={showSettings} onOpenChange={(open) => !open && handleCancel()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <SettingsIcon className="w-5 h-5 text-excise-600 dark:text-excise-400" />
            {t(language, 'legal.settings.title')}
          </SheetTitle>
          <SheetDescription className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left">
            {t(language, 'legal.settings.intro')}
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <div className="space-y-6 pb-24">
          {/* Essential Cookies */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {t(language, 'legal.settings.categories.essential')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t(language, 'legal.settings.essential.desc')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Switch.Root
                  checked={true}
                  disabled={true}
                  className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full relative cursor-not-allowed opacity-60"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-x-[22px]" />
                </Switch.Root>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t(language, 'legal.settings.alwaysOn')}
                </span>
              </div>
            </div>
          </div>

          {/* Functional Cookies */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {t(language, 'legal.settings.categories.functional')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t(language, 'legal.settings.functional.desc')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Switch.Root
                  checked={localPrefs.functional}
                  onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, functional: checked })}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    localPrefs.functional
                      ? 'bg-excise-600 dark:bg-excise-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <Switch.Thumb className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    localPrefs.functional ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  }`} />
                </Switch.Root>
                <span className={`text-xs ${
                  localPrefs.functional
                    ? 'text-excise-600 dark:text-excise-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {localPrefs.functional ? t(language, 'legal.settings.enabled') : t(language, 'legal.settings.disabled')}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {t(language, 'legal.settings.categories.analytics')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {t(language, 'legal.settings.analytics.desc')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  {t(language, 'legal.settings.analytics.notUsed')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Switch.Root
                  checked={localPrefs.analytics}
                  onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, analytics: checked })}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    localPrefs.analytics
                      ? 'bg-excise-600 dark:bg-excise-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <Switch.Thumb className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    localPrefs.analytics ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  }`} />
                </Switch.Root>
                <span className={`text-xs ${
                  localPrefs.analytics
                    ? 'text-excise-600 dark:text-excise-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {localPrefs.analytics ? t(language, 'legal.settings.enabled') : t(language, 'legal.settings.disabled')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
          >
            {t(language, 'legal.settings.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-semibold text-white bg-excise-600 dark:bg-excise-500 hover:bg-excise-700 dark:hover:bg-excise-600 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            {t(language, 'legal.settings.save')}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
