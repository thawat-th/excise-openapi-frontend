'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { Shield, Settings, BarChart3, Clock } from 'lucide-react';

interface Cookie {
  name: string;
  purposeKey: string;
  duration: string;
  type: string;
  category: 'essential' | 'functional' | 'analytics';
}

const cookies: Cookie[] = [
  // Essential
  { name: 'access_token', purposeKey: 'OAuth2 access token for API authentication', duration: '1 hour', type: 'httpOnly, Secure', category: 'essential' },
  { name: 'refresh_token', purposeKey: 'OAuth2 refresh token for session renewal', duration: '30 days', type: 'httpOnly, Secure', category: 'essential' },
  { name: 'id_token', purposeKey: 'OpenID Connect identity token', duration: '1 hour', type: 'httpOnly, Secure', category: 'essential' },
  { name: 'ory_kratos_session', purposeKey: 'User identity session management', duration: 'Session', type: 'httpOnly, Secure', category: 'essential' },
  { name: 'authenticated', purposeKey: 'Client-side authentication state flag', duration: '1 hour', type: 'First-party', category: 'essential' },
  { name: 'oauth_state', purposeKey: 'CSRF protection for OAuth2 flow', duration: '10 minutes', type: 'First-party', category: 'essential' },
  // Functional
  { name: 'excise-theme', purposeKey: 'Theme preference (light/dark/system)', duration: '1 year', type: 'First-party', category: 'functional' },
  { name: 'gov_ui_language', purposeKey: 'Language preference (EN/TH)', duration: '1 year', type: 'First-party', category: 'functional' },
  { name: 'excise-timezone', purposeKey: 'Timezone preference', duration: '1 year', type: 'First-party', category: 'functional' },
];

export default function CookiePolicyPage() {
  const { language } = useLanguage();

  const essentialCookies = cookies.filter(c => c.category === 'essential');
  const functionalCookies = cookies.filter(c => c.category === 'functional');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="border-b border-slate-200 dark:border-slate-700 px-8 py-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-850">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {t(language, 'legal.cookies.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(language, 'legal.cookies.lastUpdated')}
        </p>
      </div>

      <div className="p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-excise-600 dark:text-excise-400" />
            {t(language, 'legal.cookies.intro.title')}
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                {t(language, 'legal.cookies.intro.what')}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {t(language, 'legal.cookies.intro.whatDesc')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                {t(language, 'legal.cookies.intro.why')}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {t(language, 'legal.cookies.intro.whyDesc')}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            {t(language, 'legal.cookies.essential.title')}
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
              {t(language, 'legal.cookies.essential.desc')}
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-2 font-medium">
              {t(language, 'legal.cookies.essential.why')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t(language, 'legal.cookies.table.name')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t(language, 'legal.cookies.table.purpose')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t(language, 'legal.cookies.table.duration')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t(language, 'legal.cookies.table.type')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {essentialCookies.map((cookie) => (
                  <tr key={cookie.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-900 dark:text-slate-100">
                        {cookie.name}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {cookie.purposeKey}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {cookie.duration}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {cookie.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t(language, 'legal.cookies.functional.title')}
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              {t(language, 'legal.cookies.functional.desc')}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-2 font-medium">
              {t(language, 'legal.cookies.functional.why')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t(language, 'legal.cookies.table.name')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t(language, 'legal.cookies.table.purpose')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t(language, 'legal.cookies.table.duration')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t(language, 'legal.cookies.table.type')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {functionalCookies.map((cookie) => (
                  <tr key={cookie.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-900 dark:text-slate-100">
                        {cookie.name}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {cookie.purposeKey}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {cookie.duration}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {cookie.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            {t(language, 'legal.cookies.analytics.title')}
          </h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed mb-2">
              {t(language, 'legal.cookies.analytics.desc')}
            </p>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {t(language, 'legal.cookies.analytics.future')}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              {t(language, 'legal.cookies.analytics.why')}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {t(language, 'legal.cookies.managing.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {t(language, 'legal.cookies.managing.desc')}
          </p>

          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-excise-600 dark:text-excise-400 mt-1">•</span>
              <span className="text-slate-600 dark:text-slate-300">{t(language, 'legal.cookies.managing.option1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-excise-600 dark:text-excise-400 mt-1">•</span>
              <span className="text-slate-600 dark:text-slate-300">{t(language, 'legal.cookies.managing.option2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-excise-600 dark:text-excise-400 mt-1">•</span>
              <span className="text-slate-600 dark:text-slate-300">{t(language, 'legal.cookies.managing.option3')}</span>
            </li>
          </ul>

          <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t(language, 'legal.cookies.managing.browserTitle')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t(language, 'legal.cookies.managing.browserDesc')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t(language, 'legal.cookies.managing.impactTitle')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t(language, 'legal.cookies.managing.impactDesc')}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            {t(language, 'legal.cookies.updates.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
            {t(language, 'legal.cookies.updates.desc')}
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {t(language, 'legal.cookies.updates.notification')}
          </p>
        </section>

        <section className="bg-excise-50 dark:bg-excise-900/20 border border-excise-200 dark:border-excise-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {t(language, 'legal.cookies.contact.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {t(language, 'legal.cookies.contact.desc')}
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-semibold">{t(language, 'legal.cookies.contact.email')}</span>
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-semibold">{t(language, 'legal.cookies.contact.phone')}</span>
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-semibold">{t(language, 'legal.cookies.contact.office')}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
