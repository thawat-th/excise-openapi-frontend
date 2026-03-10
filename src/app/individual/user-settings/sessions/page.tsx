'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Monitor, Smartphone, Globe, Clock, MapPin, AlertTriangle, LogOut, History, Calendar, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { apiGet } from '@/lib/fetch-helpers';

interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
  authenticatedAt: string;
}

interface AuthLog {
  id: string;
  action: string;
  device: string;
  ip: string;
  time: string;
  success: boolean;
}

export default function SessionsSettingsPage() {
  const { language } = useLanguage();
  const prefix = 'dashboard.pages.individual.settings.sessions';

  const [activeTab, setActiveTab] = useState<'sessions' | 'logs'>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);
  const hasLoadedRef = useRef(false);

  const fetchSessions = useCallback(async () => {
    const result = await apiGet<{ sessions: Session[] }>('/api/account/sessions', 'sessions');

    if (result.success && result.data) {
      setSessions(result.data.sessions || []);
      setError(null);
    } else {
      setError(t(language, `${prefix}.loadError`));
    }
  }, [language]);

  const fetchAuthLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/account/auth-logs?limit=20');
      if (!response.ok) {
        throw new Error('Failed to fetch auth logs');
      }
      const data = await response.json();
      setAuthLogs(data.logs || []);
    } catch (err) {
      console.error('[auth-logs] Fetch error:', err);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSessions(), fetchAuthLogs()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSessions, fetchAuthLogs]);

  const handleRevokeSession = async (sessionId: string) => {
    if (revoking) return;

    setRevoking(sessionId);
    try {
      const response = await fetch(`/api/account/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke session');
      }

      // Remove from UI
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error('[sessions] Revoke error:', err);
      alert(t(language, `${prefix}.revokeError`));
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    setShowRevokeAllConfirm(false);
    setRevoking('all');

    try {
      const response = await fetch('/api/account/sessions/revoke-all', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke sessions');
      }

      // Keep only current session
      setSessions((prev) => prev.filter((s) => s.current));
    } catch (err) {
      console.error('[sessions] Revoke all error:', err);
      alert(t(language, `${prefix}.revokeAllError`));
    } finally {
      setRevoking(null);
    }
  };

  const formatTime = (isoTime: string): string => {
    const date = new Date(isoTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return t(language, `${prefix}.time.justNow`);
    if (diffMinutes < 60) return t(language, `${prefix}.time.minutesAgo`).replace('{minutes}', diffMinutes.toString());
    if (diffHours < 24) return t(language, `${prefix}.time.hoursAgo`).replace('{hours}', diffHours.toString());
    if (diffDays === 1) return t(language, `${prefix}.time.oneDayAgo`);
    return t(language, `${prefix}.time.daysAgo`).replace('{days}', diffDays.toString());
  };

  const otherSessions = sessions.filter((s) => !s.current);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800 dark:text-red-300">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchSessions().then(() => setLoading(false));
              }}
              className="mt-2 text-red-700 dark:text-red-400 underline hover:no-underline"
            >
              {t(language, `${prefix}.retryButton`)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 pb-3">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sessions'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <Monitor className="w-4 h-4" />
          {t(language, `${prefix}.activeSessions`)}
          {sessions.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-slate-600 rounded-full">
              {sessions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          {t(language, `${prefix}.authLog`)}
        </button>
      </div>

      {activeTab === 'sessions' ? (
        <>
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {language === 'th'
              ? 'รายการอุปกรณ์ที่กำลังหรือเคยเข้าสู่ระบบ หากมีเซสชันที่คุณไม่รู้จัก แนะนำให้ยกเลิกเพื่อป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต'
              : 'A list of devices that are currently or were previously signed in to your account. If you see any sessions you do not recognize, revoke them to prevent unauthorized access.'}
          </p>

          {/* Sessions List */}
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
                      {session.deviceType === 'mobile' ? (
                        <Smartphone className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                      ) : (
                        <Monitor className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">{session.device}</p>
                        {session.current && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                            {t(language, `${prefix}.current`)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {session.ip}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.lastActive === 'activeNow'
                            ? t(language, `${prefix}.activeNow`)
                            : session.lastActive}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t(language, `${prefix}.loggedIn`)}: {formatTime(session.authenticatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revoking === session.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {revoking === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      {t(language, `${prefix}.revoke`)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Revoke All */}
          {otherSessions.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowRevokeAllConfirm(true)}
                disabled={revoking === 'all'}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {revoking === 'all' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {t(language, `${prefix}.revokeAll`)}
              </button>
            </div>
          )}

          {/* Revoke All Confirmation Dialog */}
          {showRevokeAllConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t(language, `${prefix}.revokeAllConfirmTitle`)}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                  {t(language, `${prefix}.revokeAllConfirmDesc`)}
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowRevokeAllConfirm(false)}
                    className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {t(language, `${prefix}.cancel`)}
                  </button>
                  <button
                    onClick={handleRevokeAll}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  >
                    {t(language, `${prefix}.confirm`)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Authentication Log */
        <>
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            {language === 'th'
              ? 'ประวัติกิจกรรมการเข้าสู่ระบบและความปลอดภัยของบัญชี'
              : 'A history of sign-in activity and account security events.'}
          </p>

          <div className="space-y-2">
            {authLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {log.device} • {log.ip}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-slate-400">{formatTime(log.time)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
