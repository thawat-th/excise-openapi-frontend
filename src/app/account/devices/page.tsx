'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import {
  SessionDevice,
  formatDeviceInfo,
  formatTimestamp,
  isSessionOld,
  isSessionVeryOld,
} from '@/lib/kratosSessions';

export const dynamic = 'force-dynamic';

export default function DevicesPage() {
  return (
    <Suspense fallback={<DevicesFallback />}>
      <DevicesContent />
    </Suspense>
  );
}

function DevicesContent() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devices, setDevices] = useState<SessionDevice[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [removingSessionId, setRemovingSessionId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionDevice | null>(null);

  // Load devices on mount
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const response = await fetch('/api/account/sessions', {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch sessions');
        }

        const data = await response.json();
        setDevices(data.sessions || []);
        setCurrentSessionId(data.currentSessionId);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load devices:', err);
        setError(t(language, 'devices.loadError'));
        setLoading(false);
      }
    };

    loadDevices();
  }, [router, language]);

  const handleRemoveClick = (device: SessionDevice) => {
    setSelectedSession(device);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedSession) return;

    setRemovingSessionId(selectedSession.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/account/sessions/${selectedSession.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t(language, 'devices.removeFailed'));
      }

      const result = await response.json();

      // If we revoked the current session, redirect to login
      if (result.currentSessionRevoked) {
        setSuccess(t(language, 'devices.removeSuccess'));
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        // Remove from list
        setDevices(devices.filter(d => d.id !== selectedSession.id));
        setSuccess(t(language, 'devices.removeSuccess'));
        setShowConfirmDialog(false);
        setSelectedSession(null);
      }
    } catch (err) {
      console.error('Failed to remove device:', err);
      const errorMessage = err instanceof Error ? err.message : t(language, 'devices.removeFailed');
      setError(errorMessage);
    } finally {
      setRemovingSessionId(null);
    }
  };

  if (loading) {
    return <DevicesFallback />;
  }

  const otherDevices = devices.filter(d => !d.isCurrentSession);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-excise-900">{t(language, 'devices.title')}</h1>
          <p className="text-excise-600 text-sm mt-2">{t(language, 'devices.subtitle')}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Summary */}
        {devices.length > 0 && (
          <div className="card mb-6">
            <p className="text-excise-700 font-medium">
              {t(language, devices.length === 1 ? 'devices.activeDevicesCount' : 'devices.activeDevicesCountPlural').replace('{count}', devices.length.toString())}
            </p>
          </div>
        )}

        {/* Devices Table */}
        {devices.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-excise-200 bg-excise-50">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-excise-700">
                      {t(language, 'devices.tableHeaders.device')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-excise-700">
                      {t(language, 'devices.tableHeaders.ipAddress')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-excise-700">
                      {t(language, 'devices.tableHeaders.firstSeen')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-excise-700">
                      {t(language, 'devices.tableHeaders.lastActive')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-excise-700">
                      {t(language, 'devices.tableHeaders.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <tr key={device.id} className="border-b border-excise-200 hover:bg-excise-50 transition-colors">
                      {/* Device Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium text-excise-900">
                              {formatDeviceInfo(device.userAgent)}
                            </p>
                            {device.isCurrentSession && (
                              <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
                                {t(language, 'devices.currentDeviceBadge')}
                              </span>
                            )}
                            {!device.isCurrentSession && isSessionVeryOld(device.lastActiveAt) && (
                              <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {t(language, 'devices.veryOldSessionWarning')}
                              </span>
                            )}
                            {!device.isCurrentSession && isSessionOld(device.lastActiveAt) && !isSessionVeryOld(device.lastActiveAt) && (
                              <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                {t(language, 'devices.oldSessionWarning')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-excise-700">{device.ipAddress}</p>
                      </td>

                      {/* First Seen */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-excise-700">
                          {new Date(device.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                        </p>
                      </td>

                      {/* Last Active */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-excise-700">
                          {formatTimestamp(device.lastActiveAt)}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {!device.isCurrentSession && (
                          <button
                            onClick={() => handleRemoveClick(device)}
                            disabled={removingSessionId === device.id}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t(language, 'devices.removeButton')}
                          >
                            <Trash2 className="w-4 h-4" />
                            {removingSessionId === device.id ? t(language, 'common.processing') : t(language, 'devices.removeButton')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-excise-600">{t(language, 'devices.emptyState')}</p>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              <h2 className="text-lg font-bold text-excise-900 mb-2">
                {t(language, 'devices.removeConfirmTitle')}
              </h2>
              <p className="text-excise-600 text-sm mb-6">
                {t(language, 'devices.removeConfirmMessage')}
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setSelectedSession(null);
                  }}
                  disabled={removingSessionId !== null}
                  className="px-4 py-2 border border-excise-300 text-excise-700 rounded-lg hover:bg-excise-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t(language, 'devices.removeCancel')}
                </button>
                <button
                  onClick={handleConfirmRemove}
                  disabled={removingSessionId !== null}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removingSessionId ? t(language, 'common.processing') : t(language, 'devices.removeConfirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DevicesFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 flex items-center justify-center p-4">
      <div className="card text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600">Loading...</p>
      </div>
    </div>
  );
}
